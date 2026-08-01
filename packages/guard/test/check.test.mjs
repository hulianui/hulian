import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { checkSource } from "../src/check.mjs";

const ruleIds = (result) => result.diagnostics.map((diagnostic) => diagnostic.ruleId);

test("只禁止已绑定瑚琏组件上的 style prop", () => {
  const bad = checkSource(
    'import { Button as Action } from "@hulianui/ui"; export const X = () => <Action style={{ color: "red" }} />;',
  );
  assert.deepEqual(ruleIds(bad), ["no-style-override"]);

  const native = checkSource('export const X = () => <button style={{ color: "red" }} />;');
  assert.deepEqual(native.diagnostics, []);
});

test("拒绝 toast 成员快捷调用", () => {
  const result = checkSource(
    'import { toast as notify } from "@hulianui/ui"; notify.success("ok");',
  );
  assert.deepEqual(ruleIds(result), ["toast-object-signature"]);
});

test("局部绑定遮蔽同名导入时不误报", () => {
  const component = checkSource(
    'import { Button } from "@hulianui/ui"; function X(Button) { return <Button style={{ color: "red" }} />; }',
  );
  assert.deepEqual(component.diagnostics, []);

  const call = checkSource(
    'import { toast } from "@hulianui/ui"; function notify(toast) { toast.success("ok"); }',
  );
  assert.deepEqual(call.diagnostics, []);
});

// 边界是 package.json 的 exports 能不能解析出来，不是「有没有斜杠」。
// 曾经这条规则禁掉一切子路径，连 consuming.md §3 推荐的 `@hulianui/ui/button` 和库自己的
// vitest/vite 集成入口都判 error —— 门禁与文档、exports 三方打架。见 hulianui/hulian#36。
test("放行 exports 里的公开子路径", () => {
  for (const source of [
    'import { Button } from "@hulianui/ui/button";',
    'import { withHulian } from "@hulianui/ui/vitest-preset";',
    'import { hulian } from "@hulianui/ui/vite";',
    'import { ThemeProvider } from "@hulianui/ui/theme";',
    'import { cn } from "@hulianui/ui/lib";',
  ]) {
    assert.deepEqual(checkSource(source).diagnostics, [], source);
  }
});

test("拒绝解析不出来的子路径", () => {
  // 0.15.0 随 MUI 一起移除的入口
  const removedDateSubpath = checkSource('import { DatePicker } from "@hulianui/ui/date-pickers";');
  assert.deepEqual(ruleIds(removedDateSubpath), ["no-private-deep-import"]);

  // 库内部实现路径：既不在显式 exports 里，`./*` 也映射不到（无 index.ts）
  const internal = checkSource('import { Loader2 } from "@hulianui/ui/_icons";');
  assert.deepEqual(ruleIds(internal), ["no-private-deep-import"]);

  const srcPath = checkSource('import { Button } from "@hulianui/ui/src/button/button";');
  assert.deepEqual(ruleIds(srcPath), ["no-private-deep-import"]);
});

test("日期族从根入口导入", () => {
  const result = checkSource(
    'import { Calendar, DatePicker, DateTimePicker, TimeField, TimePicker } from "@hulianui/ui";',
  );
  assert.deepEqual(result.diagnostics, []);
});

test("校验 SVG 与颜色 style 的 CSS 变量前缀", () => {
  const bad = checkSource(
    'export const X = () => <svg fill="var(--primary)" stroke="var(--chart-2)" style={{ color: "var(--danger)" }} />;',
  );
  assert.deepEqual(ruleIds(bad), [
    "color-token-prefix",
    "color-token-prefix",
    "color-token-prefix",
  ]);

  const good = checkSource(
    'export const X = () => <svg fill="var(--color-primary)" style={{ color: "var(--color-danger)", padding: "var(--space-2)" }} />;',
  );
  assert.deepEqual(good.diagnostics, []);
});

test("自定义 config 不能关闭内置 error 规则", () => {
  const root = mkdtempSync(join(tmpdir(), "hulian-guard-config-"));
  const configPath = join(root, "conventions.json");
  try {
    writeFileSync(
      configPath,
      JSON.stringify({ version: "2", executableRules: [] }),
    );
    const result = checkSource(
      'import { Button } from "@hulianui/ui"; export const X = () => <Button style={{ color: "red" }} />;',
      { configPath },
    );
    assert.deepEqual(ruleIds(result), ["no-style-override"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("语法错误成为结构化诊断", () => {
  const result = checkSource("export const = ;", { filePath: "broken.tsx" });
  assert.ok(ruleIds(result).includes("syntax-error"));
  assert.equal(result.diagnostics[0].file, "broken.tsx");
});
