import type { Finding, ScanEnvironment, ScanReport, ScanStage, ScenarioRun } from "../contracts";

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

async function runWithOneCrashRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const browserCrash =
      /(?:browser|chromium).*(?:closed|crash|disconnect)|(?:closed|crash|disconnect).*(?:browser|chromium)/i;
    if (!browserCrash.test(message)) throw error;
    return operation();
  }
}

function infrastructureFailure(message: string): Error {
  return new Error(`Hulian Scan infrastructure failure: ${message}`);
}

function validateRuns(
  runs: ScenarioRun[],
  expectedStage: ScanStage,
  scenarioIds: string[],
  options: RunScanOptions,
): void {
  const expectedIds = new Set(scenarioIds);
  const receivedIds = new Set<string>();
  if (runs.length !== expectedIds.size) {
    throw infrastructureFailure(
      `expected ${expectedIds.size} ${expectedStage} runs, received ${runs.length}`,
    );
  }
  for (const run of runs) {
    if (!expectedIds.has(run.scenarioId)) {
      throw infrastructureFailure(`unexpected scenario run: ${run.scenarioId}`);
    }
    if (receivedIds.has(run.scenarioId)) {
      throw infrastructureFailure(`duplicate scenario run: ${run.scenarioId}`);
    }
    receivedIds.add(run.scenarioId);
    if (run.stage !== expectedStage) {
      throw infrastructureFailure(
        `${run.scenarioId} returned ${run.stage} during ${expectedStage}`,
      );
    }
    if (run.environment !== options.environment) {
      throw infrastructureFailure(`${run.scenarioId} environment mismatch: ${run.environment}`);
    }
    if (run.errors.length > 0) {
      throw infrastructureFailure(`${run.scenarioId}: ${run.errors.join("; ")}`);
    }
    if (!run.events.some((event) => event.type === "commit")) {
      throw infrastructureFailure(`${run.scenarioId}: no React commit captured`);
    }
    if (run.samples.length < options.samples) {
      throw infrastructureFailure(
        `${run.scenarioId}: insufficient samples (${run.samples.length}/${options.samples})`,
      );
    }
    if (
      run.samples.some((sample) => Object.values(sample).some((value) => !Number.isFinite(value)))
    ) {
      throw infrastructureFailure(`${run.scenarioId}: non-finite sample`);
    }
  }
}

export async function runScan(options: RunScanOptions, deps: RunDependencies): Promise<ScanReport> {
  const measurement = await runWithOneCrashRetry(() =>
    deps.runStage("measurement", options.scenarioIds, options),
  );
  validateRuns(measurement, "measurement", options.scenarioIds, options);

  const initialFindings = deps.analyze(measurement);
  const flaggedIds = [...new Set(initialFindings.map((finding) => finding.scenarioId))];
  const diagnosis =
    flaggedIds.length === 0
      ? []
      : await runWithOneCrashRetry(() => deps.runStage("diagnosis", flaggedIds, options));
  if (flaggedIds.length > 0) {
    validateRuns(diagnosis, "diagnosis", flaggedIds, options);
  }

  const report: ScanReport = {
    schemaVersion: 1,
    environment: options.environment,
    runs: measurement,
    findings: deps.attachDiagnosis(initialFindings, diagnosis),
  };
  await deps.write(report, options.outputDir);
  return report;
}
