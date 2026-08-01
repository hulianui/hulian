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
import { writeReport } from "../report/report";
import { repositoryRoot } from "../paths";
import type { RunDependencies, RunScanOptions } from "./run-scan";

const execFileAsync = promisify(execFile);
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
  baseline: ScanReport | undefined,
): Finding[] {
  const baselineById = new Map(baseline?.runs.map((run) => [run.scenarioId, run]) ?? []);
  return runs.flatMap((run) => {
    const component = runMetadata(run, "component") ?? run.scenarioId;
    const baselineRun = baselineById.get(run.scenarioId);
    const baselineMetrics = baselineRun?.samples[0];
    return evaluateBudget({
      run,
      component,
      budget: budgetFor(run, configuration),
      ...(baselineMetrics ? { baseline: baselineMetrics } : {}),
    });
  });
}

function attachDiagnosis(
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
        severity: "error" as const,
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

async function buildLab(stage: ScanStage): Promise<void> {
  await execFileAsync("pnpm", ["--filter", "@hulianui/perf-lab", `build:${stage}`], {
    cwd: repositoryRoot,
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
  await buildLab(stage);
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  let preview: ChildProcess | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;

  try {
    preview = spawn(
      "pnpm",
      [
        "--filter",
        "@hulianui/perf-lab",
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
        cwd: repositoryRoot,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    await waitForPreview(url, preview);
    browser = await chromium.launch({ headless: true });
    const revision = await gitRevision();
    const fingerprint = `${
      options.environment
    }/react19/chromium-${browser.version()}/git-${revision}`;
    const checkpoint = await loadResumeCheckpoint(options, fingerprint, stage === "diagnosis");
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
        if (options.resume && checkpoint.completed.includes(completionId)) {
          if (!stageRuns.has(scenarioId)) {
            throw new Error(`checkpoint marks ${completionId} complete without a run`);
          }
          continue;
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
                  describe(scenarioId: string): Promise<{ category: string }>;
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
          const run = await page.evaluate(
            async (input) => {
              const api = (
                window as typeof window & {
                  __HULIAN_SCAN_LAB__: {
                    run(
                      id: string,
                      options: { samples: number; warmups: number },
                    ): Promise<ScenarioRun>;
                  };
                }
              ).__HULIAN_SCAN_LAB__;
              return api.run(input.scenarioId, {
                samples: input.samples,
                warmups: input.warmups,
              });
            },
            {
              scenarioId,
              samples: options.samples,
              warmups: options.warmups,
            },
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
    baseline?: ScanReport;
  } = {},
): Promise<RunDependencies> {
  const budgetPath = join(repositoryRoot, "scripts/performance-budgets.json");
  const configuration = JSON.parse(await readFile(budgetPath, "utf8")) as BudgetConfiguration;
  if (configuration.schemaVersion !== 1) {
    throw new Error("performance budget schema mismatch");
  }
  return {
    runStage: runBrowserStage,
    analyze: (runs) => analyzeRuns(runs, configuration, options.baseline),
    attachDiagnosis: (findings, runs) => attachDiagnosis(findings, runs, configuration),
    write: async (report, outputDir) => {
      await writeReport(report, outputDir);
    },
  };
}
