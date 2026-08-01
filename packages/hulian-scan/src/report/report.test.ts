import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { Finding, ScanReport } from "../contracts";
import { formatTerminalSummary, writeReport } from "./report";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

function makeFinding(index: number): Finding {
  return {
    id: `button/basic:rule-${index}:Button`,
    scenarioId: "button/basic",
    component: "Button",
    rule: `rule-${index}`,
    severity: "error",
    current: index,
    evidence: [`evidence ${index}`],
  };
}

function makeReportWithFindings(count: number): ScanReport {
  return {
    schemaVersion: 1,
    environment: "workspace",
    runs: [
      {
        schemaVersion: 1,
        scenarioId: "button/basic",
        stage: "measurement",
        environment: "workspace",
        samples: [{ commitDurationMs: 2 }],
        events: [
          { type: "commit", commitId: 1, timestampMs: 1, durationMs: 2 },
        ],
        errors: [],
        metadata: {},
      },
    ],
    findings: Array.from({ length: count }, (_, index) => makeFinding(index)),
    inventory: [
      { id: "button", kind: "renderable", scenarioId: "button/basic" },
      { id: "missing", kind: "renderable" },
    ],
  };
}

describe("writeReport", () => {
  it("writes every finding while terminal ranking may stay concise", async () => {
    const directory = await mkdtemp(join(tmpdir(), "hulian-scan-report-"));
    temporaryDirectories.push(directory);
    const report = makeReportWithFindings(137);

    const paths = await writeReport(report, directory);
    const findings = JSON.parse(await readFile(paths.findings, "utf8")) as unknown[];
    const markdown = await readFile(paths.markdown, "utf8");
    const inventory = JSON.parse(await readFile(paths.inventory, "utf8")) as unknown[];
    const raw = JSON.parse(
      await readFile(join(directory, "raw", "button__basic.json"), "utf8"),
    ) as { scenarioId: string };

    expect(findings).toHaveLength(137);
    expect(markdown).toContain("rule-136");
    expect(markdown).toContain("missing");
    expect(inventory).toHaveLength(2);
    expect(raw.scenarioId).toBe("button/basic");
    expect(formatTerminalSummary(report)).toContain("137 findings");
  });
});
