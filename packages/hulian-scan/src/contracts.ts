export type ScanStage = "measurement" | "diagnosis";
export type ScanEnvironment = "workspace" | "packed-consumer";
export type ScenarioCategory = "standard" | "core" | "heavy" | "animation";
export type StepKind =
  | "mount"
  | "parent-update"
  | "props-update"
  | "interaction"
  | "stress"
  | "unmount";

export interface ScenarioStep {
  id: string;
  kind: StepKind;
  label?: string;
  run: () => Promise<void>;
}

export interface PerformanceBudget {
  relativeRegressionPct?: number;
  absoluteRegressionMs?: number;
  /**
   * 当前机器的时间读数是否可信。基线与 long-task / dropped-frames 这类阈值都是**机器绑定**的
   * 绝对耗时（基线只从 packed-consumer 采集，见 report/baseline.ts），换机器就不可比：共享
   * CI runner 实测比采集基线的开发机慢约 1.8 倍，20% 的回归线与 100ms 的 long-task 线
   * （select/stress 基线已是 92ms）必然全线触发，门禁只剩噪声。
   *
   * 置 false 时跳过全部机器绑定的时间指标，与软件 GPU 下 `GPU_TIMING_METRICS` 的处理同源；
   * 结构性指标（avoidable-render / cascade-fanout / fiber 数）不受影响，照常门禁。
   */
  trustTimingMetrics?: boolean;
  minSamples?: number;
  maxAvoidableRenderCount?: number;
  minAvoidableRenderMs?: number;
  minRepeatedAvoidableRenders?: number;
  maxCascadeFanout?: number;
  maxInteractionLatencyMs?: number;
  maxLongTaskMs?: number;
  maxDroppedFrameRatio?: number;
}

export interface PerformanceScenario {
  id: string;
  component: string;
  entry: string;
  category: ScenarioCategory;
  /** True when frame timings depend on a real WebGL GPU backend. */
  webgl?: boolean;
  render: () => unknown;
  steps: ScenarioStep[];
  budgets: Partial<PerformanceBudget>;
}

export interface FiberRenderEvent {
  type: "fiber-render";
  commitId: number;
  fiberId?: number;
  name: string;
  ownerName?: string;
  source?: string;
  depth: number;
  actualDurationMs: number;
  selfDurationMs: number;
  stepId?: string;
  changeDescription?: unknown;
}

export interface CommitEvent {
  type: "commit";
  commitId: number;
  timestampMs: number;
  durationMs: number;
  stepId?: string;
}

export type ScanEvent = FiberRenderEvent | CommitEvent;

export interface ScenarioRun {
  schemaVersion: 1;
  scenarioId: string;
  stage: ScanStage;
  environment: ScanEnvironment;
  samples: Array<Record<string, number>>;
  events: ScanEvent[];
  errors: string[];
  metadata: Record<string, string | number | boolean>;
}

export interface Finding {
  id: string;
  scenarioId: string;
  component: string;
  rule: string;
  severity: "error" | "warning";
  current: number;
  baseline?: number;
  absoluteDelta?: number;
  relativeDeltaPct?: number;
  evidence: string[];
}

export interface ScanReport {
  schemaVersion: 1;
  environment: ScanEnvironment;
  runs: ScenarioRun[];
  findings: Finding[];
  inventory?: Array<Record<string, unknown>>;
}

export function definePerformanceScenario(
  input: PerformanceScenario,
): PerformanceScenario {
  const ids = new Set<string>();

  for (const step of input.steps) {
    if (ids.has(step.id)) {
      throw new Error(`duplicate step id: ${step.id}`);
    }
    if (step.kind === "interaction" && !step.label) {
      throw new Error(`interaction label required: ${step.id}`);
    }
    ids.add(step.id);
  }

  return Object.freeze(input);
}
