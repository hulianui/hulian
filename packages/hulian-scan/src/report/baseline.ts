import { summarize } from "../analyzer/statistics";
import type { ScanReport } from "../contracts";

export interface PerformanceBaseline {
  schemaVersion: 1;
  react: "19.2.8";
  environment: "packed-consumer";
  scenarios: Record<string, Record<string, number>>;
}

export function parsePerformanceBaseline(
  value: unknown,
  options: { requireNonEmpty?: boolean } = {},
): PerformanceBaseline {
  if (
    typeof value !== "object" ||
    value === null ||
    (value as Partial<PerformanceBaseline>).schemaVersion !== 1 ||
    (value as Partial<PerformanceBaseline>).react !== "19.2.8" ||
    (value as Partial<PerformanceBaseline>).environment !== "packed-consumer" ||
    typeof (value as Partial<PerformanceBaseline>).scenarios !== "object" ||
    (value as Partial<PerformanceBaseline>).scenarios === null
  ) {
    throw new Error("invalid React 19 packed-consumer performance baseline");
  }
  const baseline = value as PerformanceBaseline;
  const entries = Object.entries(baseline.scenarios);
  if (options.requireNonEmpty && entries.length === 0) {
    throw new Error("performance baseline is empty; run the explicit baseline update workflow");
  }
  for (const [scenarioId, metrics] of entries) {
    if (
      scenarioId.length === 0 ||
      typeof metrics !== "object" ||
      metrics === null ||
      Object.keys(metrics).length === 0 ||
      Object.values(metrics).some((metric) => !Number.isFinite(metric))
    ) {
      throw new Error(`invalid performance baseline scenario: ${scenarioId}`);
    }
  }
  return baseline;
}

function isHardViolation(report: ScanReport, scenarioId: string): boolean {
  return report.findings.some(
    (finding) =>
      finding.scenarioId === scenarioId &&
      finding.severity === "error" &&
      !finding.rule.startsWith("regression:"),
  );
}

export function baselineFromReport(report: ScanReport): PerformanceBaseline {
  if (report.environment !== "packed-consumer") {
    throw new Error("performance baseline source must be a packed-consumer report");
  }
  const scenarios: Record<string, Record<string, number>> = {};
  for (const run of [...report.runs].sort((left, right) =>
    left.scenarioId.localeCompare(right.scenarioId),
  )) {
    if (
      run.stage !== "measurement" ||
      run.environment !== "packed-consumer" ||
      run.errors.length > 0 ||
      run.samples.length < 5 ||
      !run.events.some((event) => event.type === "commit") ||
      isHardViolation(report, run.scenarioId)
    ) {
      continue;
    }
    const metricNames = [...new Set(run.samples.flatMap((sample) => Object.keys(sample)))].sort();
    const metrics: Record<string, number> = {};
    for (const metricName of metricNames) {
      const values = run.samples.flatMap((sample) =>
        Object.hasOwn(sample, metricName) ? [sample[metricName] as number] : [],
      );
      if (values.length !== run.samples.length || values.some((value) => !Number.isFinite(value))) {
        continue;
      }
      metrics[metricName] = summarize(values).median;
    }
    if (Object.keys(metrics).length > 0) scenarios[run.scenarioId] = metrics;
  }
  return {
    schemaVersion: 1,
    react: "19.2.8",
    environment: "packed-consumer",
    scenarios,
  };
}
