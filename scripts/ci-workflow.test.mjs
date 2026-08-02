import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));

function workflowJob(name, nextName) {
  const start = workflow.indexOf(`\n  ${name}:`);
  const end = nextName ? workflow.indexOf(`\n  ${nextName}:`, start + 1) : workflow.length;
  assert.notEqual(start, -1, `missing ${name} workflow job`);
  assert.notEqual(end, -1, `missing ${nextName} workflow job`);
  return workflow.slice(start, end);
}

test("CI rejects stale committed English showcase modules before build can regenerate them", () => {
  assert.equal(
    packageJson.scripts["showcase:check"],
    "node scripts/gen-showcase-sources.mjs --check",
  );

  const verify = workflowJob("verify", "consumer-smoke");
  const check = verify.indexOf("run: pnpm showcase:check");
  const build = verify.indexOf("run: pnpm --filter www build");

  assert.notEqual(check, -1, "verify job must run the non-mutating showcase drift check");
  assert.notEqual(build, -1, "verify job must retain the production documentation build");
  assert.ok(check < build, "showcase:check must run before build regenerates showcase modules");
});
