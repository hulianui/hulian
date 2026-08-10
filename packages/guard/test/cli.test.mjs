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
  // warning 来自 --config 注入的自定义规则：内置规则从 0.28.0 起全部是 error。
  const result = spawnSync(
    process.execPath,
    [CLI, "--config", "test/fixtures/warn-rule.conventions.json", "test/fixtures/warn-only.tsx"],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(result.status, 0, "只有 warning 时应退出 0");
  assert.match(result.stdout, /WARN/);
  assert.match(result.stdout, /local-legacy-grid/);
  assert.doesNotMatch(result.stdout, /FAIL/);
});

test("--config 只能新增规则，覆盖内置规则要报错退出 2", () => {
  const result = spawnSync(process.execPath, [CLI, "--config", "package.json", "src"], {
    cwd: ROOT,
    encoding: "utf8",
  });
  assert.equal(result.status, 2);
});

// --help / --version 必须是退出码 0 的成功路径：CI 常用 `npx @hulianui/guard --help`
// 探测「工具装没装」，此前未知 flag 一律退 2，把**已安装**的 guard 判成未安装，
// 检查静默跳过 → 门禁假绿（#143）。
test("--help 与 --version 以 0 退出", () => {
  for (const flag of ["--help", "-h", "--version", "-v"]) {
    const result = spawnSync(process.execPath, [CLI, flag], { cwd: ROOT, encoding: "utf8" });
    assert.equal(result.status, 0, flag);
    assert.ok(result.stdout.trim().length > 0, flag);
  }
});

