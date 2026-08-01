import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("consumer script requires an external explicit directory", () => {
  const result = spawnSync("bash", ["scripts/performance-consumer.sh"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PERFORMANCE_CONSUMER_DIR/);
});

test("consumer script rejects a directory inside the repository", () => {
  const result = spawnSync("bash", ["scripts/performance-consumer.sh", "--prepare-only"], {
    encoding: "utf8",
    env: { ...process.env, PERFORMANCE_CONSUMER_DIR: ".hulian-scan/consumer" },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /outside.*repository/i);
});

test("bundle metafile rejects internal scanner modules", () => {
  const directory = mkdtempSync(join(tmpdir(), "hulian-scan-meta-"));
  const metafile = join(directory, "meta.json");
  writeFileSync(
    metafile,
    JSON.stringify({ inputs: { "node_modules/react-scan/dist/index.js": {} } }),
  );
  const result = spawnSync(
    "bash",
    ["scripts/performance-consumer.sh", "--check-metafile", metafile],
    { encoding: "utf8" },
  );
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /react-scan/);
});

test("bundle metafile accepts public UI modules without instrumentation", () => {
  const directory = mkdtempSync(join(tmpdir(), "hulian-scan-meta-"));
  const metafile = join(directory, "meta.json");
  writeFileSync(
    metafile,
    JSON.stringify({ inputs: { "node_modules/@hulianui/ui/src/button/button.tsx": {} } }),
  );
  const result = spawnSync(
    "bash",
    ["scripts/performance-consumer.sh", "--check-metafile", metafile],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr);
});
