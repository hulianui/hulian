import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CLI = join(ROOT, "src/cli.mjs");

test("CLI JSON 输出诊断并以 1 表示规则违规", () => {
  const result = spawnSync(process.execPath, [CLI, "test/fixtures/bad.tsx", "--format", "json"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 1);
  const body = JSON.parse(result.stdout);
  assert.equal(body.filesChecked, 1);
  assert.ok(body.diagnostics.some((diagnostic) => diagnostic.ruleId === "no-style-override"));
});

test("CLI 参数或路径错误以 2 退出", () => {
  const result = spawnSync(process.execPath, [CLI, "missing.tsx"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 2);
});

test("CLI 对干净文件以 0 退出", () => {
  const result = spawnSync(process.execPath, [CLI, "--", "test/fixtures/clean.tsx"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PASS/);
});
