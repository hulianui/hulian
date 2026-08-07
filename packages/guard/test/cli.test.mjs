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

test("CLI 语法解析失败以 2 退出", () => {
  const result = spawnSync(
    process.execPath,
    [CLI, "test/fixtures/broken.tsx", "--format", "json"],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
  assert.equal(result.status, 2);
  assert.ok(JSON.parse(result.stdout).diagnostics.some((item) => item.ruleId === "syntax-error"));
});

test("CLI 对干净文件以 0 退出", () => {
  const result = spawnSync(process.execPath, [CLI, "--", "test/fixtures/clean.tsx"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /PASS/);

});

test("只有 warning 时退出 0，措辞也不能写 FAIL", () => {
  // 退出码与措辞必须一致：日志写 FAIL 而退出码是 0，读日志的人要么去关规则，
  // 要么把真正的 error 也当成噪音。
  const result = spawnSync(process.execPath, [CLI, "--", "test/fixtures/warn-only.tsx"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, "只有 warning 时应退出 0");
  assert.match(result.stdout, /WARN/);
  assert.doesNotMatch(result.stdout, /FAIL/);
});

