import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import type { Finding, ScanReport, ScenarioRun } from "../contracts";
import { summarize } from "../analyzer/statistics";

export interface ReportPaths {
  summary: string;
  findings: string;
  inventory: string;
  markdown: string;
}

async function writeTextAtomic(path: string, value: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, value, "utf8");
  await rename(temporary, path);
}

export async function writeJsonAtomic(
  path: string,
  value: unknown,
): Promise<void> {
  await writeTextAtomic(path, `${JSON.stringify(value, null, 2)}\n`);
}

function metricMedian(run: ScenarioRun, metric: string): number | undefined {
  const values = run.samples.flatMap((sample) =>
    Object.hasOwn(sample, metric) ? [sample[metric] as number] : [],
  );
  return values.length > 0 && values.every(Number.isFinite)
    ? summarize(values).median
    : undefined;
}

function rankedRuns(report: ScanReport): Array<{
  scenarioId: string;
  commitDurationMs: number;
}> {
  return report.runs
    .flatMap((run) => {
      const commitDurationMs = metricMedian(run, "commitDurationMs");
      return commitDurationMs === undefined
        ? []
        : [{ scenarioId: run.scenarioId, commitDurationMs }];
    })
    .sort((left, right) => right.commitDurationMs - left.commitDurationMs);
}

function escapeTable(value: unknown): string {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function findingTable(findings: Finding[]): string[] {
  if (findings.length === 0) return ["No performance findings."];
  return [
    "| Severity | Scenario | Component | Rule | Current | Evidence |",
    "| --- | --- | --- | --- | ---: | --- |",
    ...findings.map(
      (finding) =>
        `| ${escapeTable(finding.severity)} | ${escapeTable(finding.scenarioId)} | ${escapeTable(finding.component)} | ${escapeTable(finding.rule)} | ${escapeTable(finding.current)} | ${escapeTable(finding.evidence.join("; "))} |`,
    ),
  ];
}

function markdownReport(report: ScanReport): string {
  const uncovered = (report.inventory ?? []).filter(
    (entry) => entry.kind === "renderable" && !entry.scenarioId,
  );
  const lines = [
    "# Hulian Scan Report",
    "",
    `Environment: ${report.environment}`,
    "",
    `Runs: ${report.runs.length}`,
    "",
    `Findings: ${report.findings.length}`,
    "",
    "## Findings",
    "",
    ...findingTable(report.findings),
    "",
    "## Uncovered inventory",
    "",
  ];
  if (uncovered.length === 0) {
    lines.push("No uncovered renderable entries.");
  } else {
    lines.push(...uncovered.map((entry) => `- ${escapeTable(entry.id ?? "unknown")}`));
  }
  return `${lines.join("\n")}\n`;
}

function safeScenarioFileName(scenarioId: string): string {
  const safe = scenarioId.replaceAll(/[^a-zA-Z0-9._-]+/g, "__");
  return safe.length > 0 ? safe : "scenario";
}

export function formatTerminalSummary(report: ScanReport): string {
  const ranking = rankedRuns(report).slice(0, 20);
  const lines = [
    `Hulian Scan: ${report.findings.length} findings across ${report.runs.length} runs`,
  ];
  if (ranking.length > 0) {
    lines.push("Slowest median commit durations:");
    lines.push(
      ...ranking.map(
        (entry, index) =>
          `${index + 1}. ${entry.scenarioId}: ${entry.commitDurationMs.toFixed(3)} ms`,
      ),
    );
  }
  return lines.join("\n");
}

export async function writeReport(
  report: ScanReport,
  outputDir: string,
): Promise<ReportPaths> {
  const paths: ReportPaths = {
    summary: join(outputDir, "summary.json"),
    findings: join(outputDir, "findings.json"),
    inventory: join(outputDir, "inventory.json"),
    markdown: join(outputDir, "report.md"),
  };
  await mkdir(join(outputDir, "raw"), { recursive: true });
  const rawNameCounts = new Map<string, number>();
  const rawWrites = report.runs.map((run) => {
    const baseName = safeScenarioFileName(run.scenarioId);
    const seen = rawNameCounts.get(baseName) ?? 0;
    rawNameCounts.set(baseName, seen + 1);
    const suffix = seen === 0 ? "" : `__${run.stage}__${seen + 1}`;
    return writeJsonAtomic(
      join(outputDir, "raw", `${baseName}${suffix}.json`),
      run,
    );
  });
  await Promise.all([
    writeJsonAtomic(paths.summary, {
      ...report,
      findingCount: report.findings.length,
      slowest: rankedRuns(report),
    }),
    writeJsonAtomic(paths.findings, report.findings),
    writeJsonAtomic(paths.inventory, report.inventory ?? []),
    writeTextAtomic(paths.markdown, markdownReport(report)),
    ...rawWrites,
  ]);
  return paths;
}
