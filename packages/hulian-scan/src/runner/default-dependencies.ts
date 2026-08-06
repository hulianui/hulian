import { execFile, spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { readFile } from "node:fs/promises";
import { createServer } from "node:net";
import { join } from "node:path";
import { promisify } from "node:util";
import { chromium } from "playwright";

import { evaluateBudget } from "../analyzer/budgets";
import type { Finding, PerformanceBudget, ScanReport, ScanStage, ScenarioRun } from "../contracts";
import { loadCheckpoint, saveCheckpoint, type Checkpoint } from "../report/checkpoint";
import type { PerformanceBaseline } from "../report/baseline";
import { writeReport } from "../report/report";
import { repositoryRoot } from "../paths";
import type { RunDependencies, RunScanOptions } from "./run-scan";

const execFileAsync = promisify(execFile);

export function chromiumLaunchArgs(platform: NodeJS.Platform = process.platform): string[] {
  return platform === "darwin" ? ["--use-angle=metal"] : [];
}
interface BudgetConfiguration {
  schemaVersion: 1;
  defaults: Partial<PerformanceBudget>;
  categories: Record<string, Partial<PerformanceBudget>>;
  scenarios: Record<string, Partial<PerformanceBudget>>;
}

function runMetadata(run: ScenarioRun, key: string): string | undefined {
  const value = run.metadata[key];
  return typeof value === "string" ? value : undefined;
}

function budgetFor(
  run: ScenarioRun,
  configuration: BudgetConfiguration,
): Partial<PerformanceBudget> {
  const category = runMetadata(run, "category") ?? "standard";
  return {
    ...configuration.defaults,
    ...configuration.categories[category],
    ...configuration.scenarios[run.scenarioId],
  };
}

function analyzeRuns(
  runs: ScenarioRun[],
  configuration: BudgetConfiguration,
  baseline: PerformanceBaseline | undefined,
): Finding[] {
  return runs.flatMap((run) => {
    const component = runMetadata(run, "component") ?? run.scenarioId;
    const baselineMetrics = baseline?.scenarios[run.scenarioId];
    return evaluateBudget({
      run,
      component,
      budget: budgetFor(run, configuration),
      ...(baselineMetrics ? { baseline: baselineMetrics } : {}),
    });
  });
}

export function attachDiagnosis(
  findings: Finding[],
  diagnosisRuns: ScenarioRun[],
  configuration: BudgetConfiguration,
): Finding[] {
  const diagnosisById = new Map(diagnosisRuns.map((run) => [run.scenarioId, run]));
  return findings.flatMap((finding) => {
    if (finding.rule !== "avoidable-render-candidate") return [finding];
    const diagnosis = diagnosisById.get(finding.scenarioId);
    if (!diagnosis) return [];
    const confirmed = evaluateBudget({
      run: diagnosis,
      component: finding.component,
      budget: budgetFor(diagnosis, configuration),
    }).find((candidate) => candidate.rule === "avoidable-render");
    if (!confirmed) return [];
    return [
      {
        ...finding,
        id: confirmed.id,
        rule: confirmed.rule,
        // severity 沿用规则自己给的，别在这里再写死一次 —— 早先这里硬编码 "error"，
        // 于是 budgets.ts 把 avoidable-render 降级成 warning 后这条路径照旧判失败。
        severity: confirmed.severity,
        evidence: confirmed.evidence,
      },
    ];
  });
}

async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close();
    throw new Error("unable to allocate a preview port");
  }
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function waitForPreview(url: string, process: ChildProcess): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`performance lab preview exited with ${process.exitCode}`);
    }
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("performance lab preview startup timeout");
}

async function stopChild(process: ChildProcess | undefined): Promise<void> {
  if (!process || process.exitCode !== null) return;
  process.kill("SIGTERM");
  const exited = once(process, "exit").then(() => undefined);
  const forced = new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (process.exitCode === null) process.kill("SIGKILL");
      resolve();
    }, 3_000);
    timeout.unref();
  });
  await Promise.race([exited, forced]);
}

async function gitRevision(): Promise<string> {
  const result = await execFileAsync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
  });
  return result.stdout.trim();
}

export async function withHardTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
  label: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error(`${label} exceeded outer browser timeout (${timeoutMs} ms)`)),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function performanceLabDirectory(environment: RunScanOptions["environment"]): string | undefined {
  if (environment !== "packed-consumer") return undefined;
  const configured = process.env.HULIAN_SCAN_LAB_DIR;
  if (!configured) {
    throw new Error(
      "packed-consumer scans require HULIAN_SCAN_LAB_DIR from scripts/performance-consumer.sh",
    );
  }
  return configured;
}

async function buildLab(stage: ScanStage, labDirectory: string | undefined): Promise<void> {
  const args = labDirectory
    ? ["exec", "vite", "build", "--mode", stage]
    : ["--filter", "@hulianui/perf-lab", `build:${stage}`];
  await execFileAsync("pnpm", args, {
    cwd: labDirectory ?? repositoryRoot,
    maxBuffer: 10 * 1024 * 1024,
  });
}

async function loadResumeCheckpoint(
  options: RunScanOptions,
  fingerprint: string,
  preserveExisting: boolean,
): Promise<Checkpoint> {
  if (!options.resume && !preserveExisting) {
    return { schemaVersion: 1, fingerprint, completed: [], runs: [] };
  }
  try {
    return await loadCheckpoint(options.checkpointPath, fingerprint);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { schemaVersion: 1, fingerprint, completed: [], runs: [] };
    }
    throw error;
  }
}

async function runBrowserStage(
  stage: ScanStage,
  scenarioIds: string[],
  options: RunScanOptions,
): Promise<ScenarioRun[]> {
  const labDirectory = performanceLabDirectory(options.environment);
  await buildLab(stage, labDirectory);
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  let preview: ChildProcess | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

  try {
    preview = spawn(
      "pnpm",
      [
        ...(labDirectory ? [] : ["--filter", "@hulianui/perf-lab"]),
        "exec",
        "vite",
        "preview",
        "--host",
        "127.0.0.1",
        "--port",
        String(port),
        "--strictPort",
      ],
      {
        cwd: labDirectory ?? repositoryRoot,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    await waitForPreview(url, preview);
    browser = await chromium.launch({ headless: true, args: chromiumLaunchArgs() });
    const revision = await gitRevision();
    const fingerprint = `${options.environment}/react${
      options.react ?? "19"
    }/chromium-${browser.version()}/git-${revision}`;
    const checkpoint = await loadResumeCheckpoint(options, fingerprint, stage === "diagnosis");
    const forcedScenarios = new Set(
      (process.env.HULIAN_SCAN_RERUN ?? "").split(",").filter(Boolean),
    );
    const stageRuns = new Map(
      checkpoint.runs.filter((run) => run.stage === stage).map((run) => [run.scenarioId, run]),
    );
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      deviceScaleFactor: 1,
      locale: "zh-CN",
      timezoneId: "Asia/Shanghai",
      colorScheme: "light",
    });
    try {
      for (const scenarioId of scenarioIds) {
        const completionId = `${stage}:${scenarioId}`;
        if (
          options.resume &&
          !forcedScenarios.has(scenarioId) &&
          checkpoint.completed.includes(completionId)
        ) {
          const completed = stageRuns.get(scenarioId);
          if (!completed) {
            throw new Error(`checkpoint marks ${completionId} complete without a run`);
          }
          if (completed.errors.length === 0) continue;
        }
        const page = await context.newPage();
        try {
          await page.goto(`${url}/?scenario=${encodeURIComponent(scenarioId)}&stage=${stage}`, {
            waitUntil: "load",
          });
          await page.waitForFunction(() => "__HULIAN_SCAN_LAB__" in window);
          await page.evaluate(async () => document.fonts.ready);
          const descriptor = await page.evaluate(async (id) => {
            const api = (
              window as typeof window & {
                __HULIAN_SCAN_LAB__: {
                  describe(scenarioId: string): Promise<{ category: string; webgl?: boolean }>;
                };
              }
            ).__HULIAN_SCAN_LAB__;
            return api.describe(id);
          }, scenarioId);
          if (descriptor.category !== "animation") {
            await page.addStyleTag({
              content:
                "*,*::before,*::after{transition:none!important;animation-duration:.001ms!important;animation-iteration-count:1!important}",
            });
          }
          const timeoutMs = descriptor.category === "animation" ? 30_000 : 10_000;
          const run = await withHardTimeout(
            page.evaluate(
              async (input) => {
                const api = (
                  window as typeof window & {
                    __HULIAN_SCAN_LAB__: {
                      run(
                        id: string,
                        options: { samples: number; warmups: number; timeoutMs?: number },
                      ): Promise<ScenarioRun>;
                    };
                  }
                ).__HULIAN_SCAN_LAB__;
                return api.run(input.scenarioId, {
                  samples: input.samples,
                  warmups: input.warmups,
                  timeoutMs: input.timeoutMs,
                });
              },
              {
                scenarioId,
                samples: options.samples,
                warmups: options.warmups,
                timeoutMs,
              },
            ),
            descriptor.category === "animation" ? 240_000 : 90_000,
            scenarioId,
          );
          const normalized: ScenarioRun = {
            ...run,
            stage,
            environment: options.environment,
            metadata: {
              ...run.metadata,
              browserVersion: browser.version(),
              gitRevision: revision,
            },
          };
          stageRuns.set(scenarioId, normalized);
          checkpoint.runs = [
            ...checkpoint.runs.filter(
              (existing) => !(existing.stage === stage && existing.scenarioId === scenarioId),
            ),
            normalized,
          ];
          checkpoint.completed = [...new Set([...checkpoint.completed, completionId])];
          await saveCheckpoint(options.checkpointPath, checkpoint);
        } finally {
          await page.close();
        }
      }
    } finally {
      await context.close();
    }
    return scenarioIds.map((scenarioId) => {
      const run = stageRuns.get(scenarioId);
      if (!run) throw new Error(`missing ${stage} run: ${scenarioId}`);
      return run;
    });
  } finally {
    await browser?.close();
    await stopChild(preview);
  }
}

export async function createDefaultDependencies(
  options: {
    baseline?: PerformanceBaseline;
  } = {},
): Promise<RunDependencies> {
  const budgetPath = join(repositoryRoot, "scripts/performance-budgets.json");
  const configuration = JSON.parse(await readFile(budgetPath, "utf8")) as BudgetConfiguration;
  if (configuration.schemaVersion !== 1) {
    throw new Error("performance budget schema mismatch");
  }
  // 基线存的是**机器绑定**的绝对耗时。共享 CI runner 实测比采集基线的开发机慢约 1.8 倍
  // （select/stress 36ms → 68ms），20% 的回归阈值下每个场景都会被判成回归，门禁只剩噪声。
  // 所以在 CI 上关掉时间回归，结构性指标（avoidable-render / cascade-fanout）照常门禁 ——
  // 它们数的是 React 提交与 Fiber 数量，跨机器稳定。专用性能机器上设
  // HULIAN_SCAN_TRUST_TIMING=1 即可恢复。
  const timingTrusted = process.env.HULIAN_SCAN_TRUST_TIMING === "1" || !process.env.CI;
  const effective: BudgetConfiguration = timingTrusted
    ? configuration
    : {
        ...configuration,
        defaults: { ...configuration.defaults, trustTimingMetrics: false },
      };
  return {
    runStage: runBrowserStage,
    analyze: (runs) => analyzeRuns(runs, effective, options.baseline),
    attachDiagnosis: (findings, runs) => attachDiagnosis(findings, runs, effective),
    write: async (report, outputDir) => {
      await writeReport(report, outputDir);
    },
  };
}
