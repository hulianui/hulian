import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

test("bg-muted-foreground 与 text-muted-foreground 同处一个 className 判 error（前景背景同色）", () => {
  const bad = checkSource(
    'export const X = () => <span className="rounded-full bg-muted-foreground px-1.5 text-muted-foreground">3</span>;',
  );
  assert.deepEqual(ruleIds(bad).filter((id) => id.startsWith("muted-as")), [
    "muted-as-background-with-muted-text",
  ]);
});

test("className 拆在 cn() 多个实参里也能命中（按属性整体取静态文本）", () => {
  const bad = checkSource(
    'export const X = () => <div className={cn("flex", ok && "bg-muted-foreground/60", "text-muted-foreground")} />;',
  );
  assert.ok(ruleIds(bad).includes("muted-as-background-with-muted-text"));
});

test("带变体前缀的 bg-muted-foreground 不判 error（另一个状态 / 另一个伪元素，不同盒子）", () => {
  // Chart 图例的真实写法：文字是 text-muted-foreground，滚动条拇指才是 bg-muted-foreground/50 —— 这是对的。
  const ok = checkSource(
    'export const X = () => <div className="text-xs text-muted-foreground [&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/80" />;',
  );
  assert.deepEqual(ruleIds(ok), []);
});

test("bg-subtle 是正解，不触发任何 muted 规则", () => {
  const good = checkSource('export const X = () => <div className="bg-subtle p-4 text-muted-foreground" />;');
  assert.deepEqual(good.diagnostics, []);
});

// 0.28.0 语义反转（#142）：次要文字色改名 --color-muted-foreground，--color-muted 变成弱背景。
// `text-muted` 不再对应任何 token，而 Tailwind 对未定义颜色既不报错也不生成规则 ——
// 写了会静默回退成继承色，只有这条门禁看得见。
test("text-muted 判 error：0.28.0 已改名，留着会静默回退成继承色", () => {
  const bad = checkSource('export const X = () => <span className="text-sm text-muted">说明</span>;');
  assert.deepEqual(ruleIds(bad), ["muted-renamed-to-muted-foreground"]);
});

test("其余前缀同样命中，且带变体前缀也算（改名是无条件的，与所处状态无关）", () => {
  for (const cls of ["fill-muted", "stroke-muted", "border-muted", "dark:text-muted", "text-muted/60"]) {
    const bad = checkSource(`export const X = () => <div className="${cls}" />;`);
    assert.deepEqual(ruleIds(bad), ["muted-renamed-to-muted-foreground"], cls);
  }
});

test("bg-muted 不再报：反转后它就是弱背景，等价 bg-subtle", () => {
  const good = checkSource('export const X = () => <div className="bg-muted p-4" />;');
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

// #190：清单是 conventions.json 生成那一刻的快照，「ui 发了新组件、guard 还没发版」这段时间里
// 消费方一用新件就被判 error。真正的判据是消费方实装的那份 exports 能不能解析出来。
test("实装包的 exports 能解析出来时放行（即使不在烤进包里的清单里）", (t) => {
  const dir = mkdtempSync(join(tmpdir(), "hulian-guard-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));

  const uiDir = join(dir, "node_modules", "@hulianui", "ui");
  mkdirSync(join(uiDir, "src", "brand-new-thing"), { recursive: true });
  writeFileSync(join(uiDir, "src", "brand-new-thing", "index.ts"), "export const x = 1;\n");
  writeFileSync(
    join(uiDir, "package.json"),
    JSON.stringify({
      name: "@hulianui/ui",
      exports: { ".": "./src/index.ts", "./*": { default: "./src/*/index.ts" } },
    }),
  );

  const filePath = join(dir, "app.tsx");
  const source = 'import { X } from "@hulianui/ui/brand-new-thing";';

  // 清单里没有这个 slug，但实装包里有 → 放行
  assert.deepEqual(checkSource(source, { filePath }).diagnostics, []);

  // 实装包里也没有的路径照旧报错
  assert.deepEqual(
    ruleIds(checkSource('import { L } from "@hulianui/ui/_icons";', { filePath })),
    ["no-private-deep-import"],
  );
});

test("读不到实装包时退回烤进包里的清单（纯文本检查仍然可用）", () => {
  const dir = mkdtempSync(join(tmpdir(), "hulian-guard-none-"));
  const filePath = join(dir, "app.tsx");
  assert.deepEqual(
    ruleIds(checkSource('import { X } from "@hulianui/ui/date-pickers";', { filePath })),
    ["no-private-deep-import"],
  );
  rmSync(dir, { recursive: true, force: true });
});
