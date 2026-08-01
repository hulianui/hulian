import type {
  FiberRenderEvent,
  Finding,
  PerformanceBudget,
  ScenarioRun,
} from "../contracts";
import { compareValues } from "../diagnosis/compare";
import { isTimeRegression, summarize } from "./statistics";

export interface BudgetEvaluationInput {
  run: ScenarioRun;
  component: string;
  budget: Partial<PerformanceBudget>;
  baseline?: Record<string, number>;
  minSamples?: number;
}

function makeFinding(
  input: BudgetEvaluationInput,
  rule: string,
  severity: Finding["severity"],
  current: number,
  evidence: string[],
  baseline?: number,
): Finding {
  const absoluteDelta = baseline === undefined ? undefined : current - baseline;
  const relativeDeltaPct =
    baseline === undefined
      ? undefined
      : baseline === 0
        ? current === 0
          ? 0
          : Number.POSITIVE_INFINITY
        : ((current - baseline) / baseline) * 100;
  return {
    id: `${input.run.scenarioId}:${rule}:${input.component}`,
    scenarioId: input.run.scenarioId,
    component: input.component,
    rule,
    severity,
    current,
    ...(baseline === undefined ? {} : { baseline }),
    ...(absoluteDelta === undefined ? {} : { absoluteDelta }),
    ...(relativeDeltaPct === undefined ? {} : { relativeDeltaPct }),
    evidence,
  };
}

function readChangeDescription(event: FiberRenderEvent): {
  isFirstMount: boolean;
  props: unknown[];
  state: unknown;
  context: unknown;
  hooks: unknown[];
  parent: boolean;
} | undefined {
  const description = event.changeDescription;
  if (typeof description !== "object" || description === null) return undefined;
  const get = (key: string): unknown => {
    const descriptor = Object.getOwnPropertyDescriptor(description, key);
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
  };
  const props = get("props");
  const hooks = get("hooks");
  return {
    isFirstMount: get("isFirstMount") === true,
    props: Array.isArray(props) ? props : [],
    state: get("state"),
    context: get("context"),
    hooks: Array.isArray(hooks) ? hooks : [],
    parent: get("parent") === true,
  };
}

function isStableReferenceChange(value: unknown): boolean {
  if (typeof value !== "object" || value === null) return false;
  const previous = Object.getOwnPropertyDescriptor(value, "previous");
  const next = Object.getOwnPropertyDescriptor(value, "next");
  if (
    !previous ||
    !("value" in previous) ||
    !next ||
    !("value" in next)
  ) {
    return false;
  }
  const comparison = compareValues(previous.value, next.value, {
    maxDepth: 6,
    maxEntries: 200,
  });
  return (
    comparison.kind === "same-reference" ||
    comparison.kind === "equal-by-value"
  );
}

function changeListIsStable(changes: unknown[]): boolean {
  return changes.every(isStableReferenceChange);
}

function changeFieldIsStable(change: unknown): boolean {
  return change === false || change == null || isStableReferenceChange(change);
}

function isAvoidable(event: FiberRenderEvent): boolean {
  const change = readChangeDescription(event);
  return Boolean(
    change &&
      !change.isFirstMount &&
      change.parent &&
      changeListIsStable(change.props) &&
      changeFieldIsStable(change.state) &&
      changeFieldIsStable(change.context) &&
      changeListIsStable(change.hooks),
  );
}

function metricValues(run: ScenarioRun, metric: string): number[] {
  return run.samples.flatMap((sample) =>
    Object.hasOwn(sample, metric) ? [sample[metric] as number] : [],
  );
}

function addThresholdFinding(
  findings: Finding[],
  input: BudgetEvaluationInput,
  metric: string,
  rule: string,
  maximum: number | undefined,
): void {
  if (maximum === undefined) return;
  const values = metricValues(input.run, metric);
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) return;
  const current = summarize(values).p95;
  if (current > maximum) {
    findings.push(
      makeFinding(input, rule, "error", current, [
        `${metric} p95 ${current} exceeds ${maximum}`,
      ]),
    );
  }
}

export function evaluateBudget(input: BudgetEvaluationInput): Finding[] {
  const findings: Finding[] = [];
  if (input.run.errors.length > 0) {
    findings.push(
      makeFinding(
        input,
        "scenario-error",
        "error",
        input.run.errors.length,
        [...input.run.errors],
      ),
    );
  }
  if (!input.run.events.some((event) => event.type === "commit")) {
    findings.push(
      makeFinding(input, "missing-commit", "error", 0, [
        "no React commit captured",
      ]),
    );
  }
  const minSamples = input.minSamples ?? input.budget.minSamples ?? 5;
  if (input.run.samples.length < minSamples) {
    findings.push(
      makeFinding(
        input,
        "insufficient-samples",
        "error",
        input.run.samples.length,
        [`expected at least ${minSamples} samples`],
      ),
    );
  }
  const invalidSamples = input.run.samples.flatMap(Object.values).filter(
    (value) => !Number.isFinite(value),
  );
  if (invalidSamples.length > 0) {
    findings.push(
      makeFinding(input, "invalid-sample", "error", invalidSamples.length, [
        "all sample metrics must be finite",
      ]),
    );
  }
  if (findings.length > 0) return findings;

  const componentRenders = input.run.events.filter(
    (event): event is FiberRenderEvent =>
      event.type === "fiber-render" &&
      event.name === input.component &&
      /parent|stable/i.test(event.stepId ?? ""),
  );
  if (input.run.stage === "measurement" && componentRenders.length > 0) {
    const selfTime = summarize(
      componentRenders.map((event) => event.selfDurationMs),
    ).median;
    const minCost = input.budget.minAvoidableRenderMs ?? 0.5;
    const minRepeats = input.budget.minRepeatedAvoidableRenders ?? 2;
    if (selfTime >= minCost || componentRenders.length >= minRepeats) {
      findings.push(
        makeFinding(
          input,
          "avoidable-render-candidate",
          "warning",
          componentRenders.length,
          [
            `${componentRenders.length} parent-update renders; median self ${selfTime.toFixed(3)} ms`,
          ],
        ),
      );
    }
  }
  if (input.run.stage === "diagnosis") {
    const avoidable = componentRenders.filter(isAvoidable);
    const maximum = input.budget.maxAvoidableRenderCount ?? 0;
    if (avoidable.length > maximum) {
      findings.push(
        makeFinding(input, "avoidable-render", "error", avoidable.length, [
          ...new Set(
            avoidable.map(
              (event) =>
                `${event.ownerName ?? "unknown owner"} -> ${event.name} in ${event.stepId ?? "unknown step"}`,
            ),
          ),
        ]),
      );
    }
  }

  addThresholdFinding(findings, input, "renderLoopCount", "render-loop", 0);
  addThresholdFinding(findings, input, "leakCount", "leak", 0);
  addThresholdFinding(
    findings,
    input,
    "cascadeFanout",
    "cascade-fanout",
    input.budget.maxCascadeFanout,
  );
  addThresholdFinding(
    findings,
    input,
    "interactionLatencyMs",
    "interaction-latency",
    input.budget.maxInteractionLatencyMs,
  );
  addThresholdFinding(
    findings,
    input,
    "longTaskMs",
    "long-task",
    input.budget.maxLongTaskMs,
  );
  addThresholdFinding(
    findings,
    input,
    "droppedFrameRatio",
    "dropped-frames",
    input.budget.maxDroppedFrameRatio,
  );

  const relativePct = input.budget.relativeRegressionPct ?? 20;
  const absoluteMs = input.budget.absoluteRegressionMs ?? 2;
  for (const [metric, baseline] of Object.entries(input.baseline ?? {})) {
    const values = metricValues(input.run, metric);
    if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
      continue;
    }
    const current = summarize(values).median;
    if (isTimeRegression({ baseline, current, relativePct, absoluteMs })) {
      findings.push(
        makeFinding(input, `regression:${metric}`, "error", current, [
          `${metric} regressed beyond ${relativePct}% and ${absoluteMs} ms`,
        ], baseline),
      );
    }
  }
  return findings;
}
