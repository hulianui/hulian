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
  changeDescription?: unknown;
}

export interface CommitEvent {
  type: "commit";
  commitId: number;
  timestampMs: number;
  durationMs: number;
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
