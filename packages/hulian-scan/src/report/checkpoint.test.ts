import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { ScenarioRun } from "../contracts";
import {
  loadCheckpoint,
  saveCheckpoint,
  type Checkpoint,
} from "./checkpoint";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

function makeRun(scenarioId = "button/basic"): ScenarioRun {
  return {
    schemaVersion: 1,
    scenarioId,
    stage: "measurement",
    environment: "workspace",
    samples: [{ commitDurationMs: 2 }],
    events: [
      { type: "commit", commitId: 1, timestampMs: 1, durationMs: 2 },
    ],
    errors: [],
    metadata: {},
  };
}

describe("checkpoint", () => {
  it("rejects a checkpoint from another browser or git revision", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hulian-scan-checkpoint-"));
    temporaryDirectories.push(directory);
    const file = join(directory, "checkpoint.json");
    await saveCheckpoint(file, {
      schemaVersion: 1,
      fingerprint: "react19/chromium-a/git-a",
      completed: ["button/basic"],
      runs: [makeRun()],
    });

    await expect(
      loadCheckpoint(file, "react19/chromium-b/git-a"),
    ).rejects.toThrow(/fingerprint/);
  });

  it("rejects duplicate runs and non-finite samples", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hulian-scan-checkpoint-"));
    temporaryDirectories.push(directory);
    const file = join(directory, "checkpoint.json");
    const duplicate: Checkpoint = {
      schemaVersion: 1,
      fingerprint: "react19/chromium-a/git-a",
      completed: ["button/basic"],
      runs: [makeRun(), makeRun()],
    };
    await expect(saveCheckpoint(file, duplicate)).rejects.toThrow(/duplicate/);

    const invalid = makeRun();
    invalid.samples = [{ commitDurationMs: Number.NaN }];
    await expect(
      saveCheckpoint(file, { ...duplicate, runs: [invalid] }),
    ).rejects.toThrow(/finite sample/);
  });
});
