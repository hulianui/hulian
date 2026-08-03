import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import type { CliOptions } from "../cli";
import type { Finding, ScanReport } from "../contracts";
import { buildRepositoryInventory } from "../inventory/repository";
import { repositoryRoot } from "../paths";
import { parsePerformanceBaseline, type PerformanceBaseline } from "../report/baseline";
import { createDefaultDependencies } from "./default-dependencies";
import { runScan, type RunScanOptions } from "./run-scan";

async function readBaseline(path: string, requireNonEmpty: boolean): Promise<PerformanceBaseline> {
  const parsed: unknown = JSON.parse(await readFile(resolve(repositoryRoot, path), "utf8"));
  return parsePerformanceBaseline(parsed, { requireNonEmpty });
}

async function readFindings(path: string): Promise<Finding[]> {
  const parsed: unknown = JSON.parse(await readFile(resolve(repositoryRoot, path), "utf8"));
  if (!Array.isArray(parsed)) {
    throw new Error(`invalid Hulian Scan findings file: ${path}`);
  }
  for (const finding of parsed) {
    if (
      typeof finding !== "object" ||
      finding === null ||
      typeof (finding as Partial<Finding>).scenarioId !== "string" ||
      typeof (finding as Partial<Finding>).rule !== "string"
    ) {
      throw new Error(`invalid Hulian Scan finding in ${path}`);
    }
  }
  return parsed as Finding[];
}

function runOptions(options: CliOptions, scenarioIds: string[]): RunScanOptions {
  const outputDir = resolve(repositoryRoot, options.outputDir);
  return {
    scenarioIds,
    environment: options.environment,
    samples: 5,
    warmups: 1,
    checkpointPath: join(outputDir, "checkpoint.json"),
    outputDir,
    resume: options.resume,
    react: options.react,
  };
}

export async function executeDefaultScan(options: CliOptions): Promise<ScanReport> {
  const baselinePath =
    options.fromBaseline ??
    (options.ci && options.react === "19" && options.environment === "packed-consumer"
      ? "scripts/performance-baseline.json"
      : undefined);
  const baseline = baselinePath ? await readBaseline(baselinePath, true) : undefined;
  const deps = await createDefaultDependencies({
    ...(baseline ? { baseline } : {}),
  });
  const inventory =
    options.inventoryOnly || options.full ? await buildRepositoryInventory() : undefined;

  if (options.inventoryOnly) {
    const report: ScanReport = {
      schemaVersion: 1,
      environment: options.environment,
      runs: [],
      findings: [],
      inventory: inventory?.map((entry) => ({ ...entry })) ?? [],
    };
    await deps.write(report, resolve(repositoryRoot, options.outputDir));
    return report;
  }

  if (options.diagnoseFindings) {
    const findings = await readFindings(options.diagnoseFindings);
    const scenarioIds = [...new Set(findings.map((finding) => finding.scenarioId))];
    const diagnosis = await deps.runStage(
      "diagnosis",
      scenarioIds,
      runOptions(options, scenarioIds),
    );
    const report: ScanReport = {
      schemaVersion: 1,
      environment: options.environment,
      runs: diagnosis,
      findings: deps.attachDiagnosis(findings, diagnosis),
    };
    await deps.write(report, resolve(repositoryRoot, options.outputDir));
    return report;
  }

  const compatibilityScenarios = [
    "button/basic",
    "dialog/cycles",
    "table/stress",
    "animated-beam/frame-budget",
  ];
  const scenarioIds = options.smoke
    ? compatibilityScenarios
    : options.full
    ? (inventory ?? []).flatMap((entry) =>
        entry.kind === "renderable" && entry.scenarioId ? [entry.scenarioId] : [],
      )
    : options.scenarioIds;
  if (scenarioIds.length === 0) {
    throw new Error("no performance scenarios selected");
  }
  return runScan(runOptions(options, scenarioIds), deps);
}
