import assert from "node:assert/strict";
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

test("拒绝所有深路径导入", () => {
  const component = checkSource('import { Button } from "@hulianui/ui/button";');
  assert.deepEqual(ruleIds(component), ["no-private-deep-import"]);

  const removedDateSubpath = checkSource(
    'import { DatePicker } from "@hulianui/ui/date-pickers";',
  );
  assert.deepEqual(ruleIds(removedDateSubpath), ["no-private-deep-import"]);
});

test("日期族从根入口导入", () => {
  const result = checkSource(
    'import { Calendar, DatePicker, DateTimePicker, TimeField, TimePicker } from "@hulianui/ui";',
  );
  assert.deepEqual(result.diagnostics, []);
});

test("校验 SVG 与颜色 style 的 CSS 变量前缀", () => {
  const bad = checkSource(
    'export const X = () => <svg fill="var(--primary)" style={{ color: "var(--danger)" }} />;',
  );
  assert.deepEqual(ruleIds(bad), ["color-token-prefix", "color-token-prefix"]);

  const good = checkSource(
    'export const X = () => <svg fill="var(--color-primary)" style={{ color: "var(--color-danger)", padding: "var(--space-2)" }} />;',
  );
  assert.deepEqual(good.diagnostics, []);
});

test("语法错误成为结构化诊断", () => {
  const result = checkSource("export const = ;", { filePath: "broken.tsx" });
  assert.ok(ruleIds(result).includes("syntax-error"));
  assert.equal(result.diagnostics[0].file, "broken.tsx");
});
