import { readFile } from "node:fs/promises";

import type { ScenarioRun } from "../contracts";
import { writeJsonAtomic } from "./report";

export interface Checkpoint {
  schemaVersion: 1;
  fingerprint: string;
  completed: string[];
  runs: ScenarioRun[];
}

function assertCheckpoint(
  checkpoint: unknown,
  expectedFingerprint: string,
): asserts checkpoint is Checkpoint {
  if (typeof checkpoint !== "object" || checkpoint === null) {
    throw new Error("invalid checkpoint object");
  }
  const candidate = checkpoint as Partial<Checkpoint>;
  if (candidate.schemaVersion !== 1) {
    throw new Error("checkpoint schema mismatch");
  }
  if (candidate.fingerprint !== expectedFingerprint) {
    throw new Error(
      `checkpoint fingerprint mismatch: expected ${expectedFingerprint}, received ${String(candidate.fingerprint)}`,
    );
  }
  if (
    !Array.isArray(candidate.completed) ||
    candidate.completed.some((entry) => typeof entry !== "string")
  ) {
    throw new Error("checkpoint completed list is invalid");
  }
  if (new Set(candidate.completed).size !== candidate.completed.length) {
    throw new Error("duplicate completed scenario in checkpoint");
  }
  if (!Array.isArray(candidate.runs)) {
    throw new Error("checkpoint runs are invalid");
  }

  const runIds = new Set<string>();
  const environments = new Set<string>();
  for (const run of candidate.runs) {
    if (
      typeof run !== "object" ||
      run === null ||
      run.schemaVersion !== 1 ||
      typeof run.scenarioId !== "string" ||
      (run.stage !== "measurement" && run.stage !== "diagnosis") ||
      (run.environment !== "workspace" &&
        run.environment !== "packed-consumer") ||
      !Array.isArray(run.samples)
    ) {
      throw new Error("checkpoint scenario run is invalid");
    }
    const runId = `${run.stage}:${run.scenarioId}`;
    if (runIds.has(runId)) {
      throw new Error(`duplicate scenario run: ${runId}`);
    }
    runIds.add(runId);
    environments.add(run.environment);
    for (const sample of run.samples) {
      if (
        typeof sample !== "object" ||
        sample === null ||
        Object.values(sample).some((value) => !Number.isFinite(value))
      ) {
        throw new Error(`finite sample required: ${run.scenarioId}`);
      }
    }
  }
  if (environments.size > 1) {
    throw new Error("checkpoint environment mismatch");
  }
}

export async function loadCheckpoint(
  path: string,
  fingerprint: string,
): Promise<Checkpoint> {
  const parsed: unknown = JSON.parse(await readFile(path, "utf8"));
  assertCheckpoint(parsed, fingerprint);
  return parsed;
}

export async function saveCheckpoint(
  path: string,
  checkpoint: Checkpoint,
): Promise<void> {
  assertCheckpoint(checkpoint, checkpoint.fingerprint);
  await writeJsonAtomic(path, checkpoint);
}
