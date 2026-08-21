import type {
  Finding,
  ScanEnvironment,
  ScanReport,
  ScanStage,
  ScenarioFailure,
  ScenarioRun,
} from "../contracts";

export interface RunScanOptions {
  scenarioIds: string[];
  environment: ScanEnvironment;
  samples: number;
  warmups: number;
  checkpointPath: string;
  outputDir: string;
  resume: boolean;
  react?: "18" | "19";
}

export interface RunDependencies {
  runStage(
    stage: ScanStage,
    scenarioIds: string[],
    options: RunScanOptions,
  ): Promise<ScenarioRun[]>;
  analyze(runs: ScenarioRun[]): Finding[];
  attachDiagnosis(findings: Finding[], runs: ScenarioRun[]): Finding[];
  write(report: ScanReport, outputDir: string): Promise<void>;
}

/**
 * 浏览器整个没了（崩溃 / 连接断开），而不是某一个场景出了问题。
 *
 * 这条判据决定「异常往哪走」：整轮重试一次（本文件），还是隔离成单个场景的失败
 * （runner/default-dependencies.ts 的 per-scenario catch）。浏览器没了的时候后面每个
 * 场景都会挨个失败，逐个隔离等于把一次可恢复的崩溃放大成几百条噪声。
 */
export function isBrowserCrash(message: string): boolean {
  return /(?:browser|chromium).*(?:closed|crash|disconnect)|(?:closed|crash|disconnect).*(?:browser|chromium)/i.test(
    message,
  );
}

async function runWithOneCrashRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!isBrowserCrash(message)) throw error;
    return operation();
  }
}

function harnessFailure(message: string): Error {
  return new Error(`Hulian Scan infrastructure failure: ${message}`);
}

/**
 * 这个 run 为什么不可用；可用就返回 undefined。
 *
 * 判据全部是**场景级**的：坏的是这一个场景这一次的读数，别的场景照样可信。
 * 与之相对的「同一个 id 出现两次」「回来的 id 根本没点过名」属于 runner 自身坏了，
 * 那种情况整轮的数据都不可信，仍然抛（见 partitionRuns）。
 */
function unusableReason(
  run: ScenarioRun,
  expectedStage: ScanStage,
  options: RunScanOptions,
): string | undefined {
  if (run.stage !== expectedStage) return `returned ${run.stage} during ${expectedStage}`;
  if (run.environment !== options.environment) return `environment mismatch: ${run.environment}`;
  if (run.errors.length > 0) return run.errors.join("; ");
  if (!run.events.some((event) => event.type === "commit")) return "no React commit captured";
  if (run.samples.length < options.samples) {
    return `insufficient samples (${run.samples.length}/${options.samples})`;
  }
  if (
    run.samples.some((sample) => Object.values(sample).some((value) => !Number.isFinite(value)))
  ) {
    return "non-finite sample";
  }
  return undefined;
}

interface Partitioned {
  usable: ScenarioRun[];
  failures: ScenarioFailure[];
}

/**
 * 把一个 stage 回来的 runs 分成「可以拿去分析的」和「这次没量成的」。
 *
 * 只有 runner 契约被破坏时才抛：重复 id 或没点过名的 id 意味着 runner 把结果串了，
 * 这时候任何一条读数都没法确定属于谁 —— 那才是真正该终止整轮的情况。
 */
function partitionRuns(
  runs: ScenarioRun[],
  expectedStage: ScanStage,
  scenarioIds: string[],
  options: RunScanOptions,
): Partitioned {
  const expectedIds = new Set(scenarioIds);
  const byId = new Map<string, ScenarioRun>();
  for (const run of runs) {
    if (!expectedIds.has(run.scenarioId)) {
      throw harnessFailure(`unexpected scenario run: ${run.scenarioId}`);
    }
    if (byId.has(run.scenarioId)) {
      throw harnessFailure(`duplicate scenario run: ${run.scenarioId}`);
    }
    byId.set(run.scenarioId, run);
  }

  const usable: ScenarioRun[] = [];
  const failures: ScenarioFailure[] = [];
  // 按点名顺序而不是返回顺序遍历：缺席的场景要能被点出来，报告里的次序也才稳定。
  for (const scenarioId of scenarioIds) {
    const run = byId.get(scenarioId);
    if (!run) {
      failures.push({
        scenarioId,
        stage: expectedStage,
        reason: `no ${expectedStage} run produced`,
      });
      continue;
    }
    const reason = unusableReason(run, expectedStage, options);
    if (reason === undefined) usable.push(run);
    else failures.push({ scenarioId, stage: expectedStage, reason });
  }
  return { usable, failures };
}

export async function runScan(options: RunScanOptions, deps: RunDependencies): Promise<ScanReport> {
  const measurement = await runWithOneCrashRetry(() =>
    deps.runStage("measurement", options.scenarioIds, options),
  );
  const measured = partitionRuns(measurement, "measurement", options.scenarioIds, options);

  const initialFindings = deps.analyze(measured.usable);
  const flaggedIds = [...new Set(initialFindings.map((finding) => finding.scenarioId))];
  const diagnosis =
    flaggedIds.length === 0
      ? []
      : await runWithOneCrashRetry(() => deps.runStage("diagnosis", flaggedIds, options));
  const diagnosed =
    flaggedIds.length === 0
      ? { usable: [], failures: [] }
      : partitionRuns(diagnosis, "diagnosis", flaggedIds, options);

  const report: ScanReport = {
    schemaVersion: 1,
    environment: options.environment,
    runs: measured.usable,
    findings: deps.attachDiagnosis(initialFindings, diagnosed.usable),
    failures: [...measured.failures, ...diagnosed.failures],
  };
  await deps.write(report, options.outputDir);
  return report;
}
