import assert from "node:assert/strict";
import test from "node:test";

import { declaredFields, documentedNames, scanComponents } from "./check-component-doc-props.mjs";

// ------------------------------------------------------------------ 类型侧 --

test("只收 Props / Item 结尾的**导出**接口，且只收自有成员", () => {
  const fields = declaredFields(`
    export interface FooProps { alpha?: string; beta: number }
    export interface FooItem { gamma: string }
    interface NotExported { delta: string }
    export interface FooState { epsilon: string }
  `);
  assert.deepEqual([...fields.keys()].sort(), ["alpha", "beta", "gamma"]);
  assert.equal(fields.get("alpha"), "FooProps");
});

// extends 来的属性（HTMLAttributes 那几百个）不该逼着文档逐条列出，
// 文档里一句「继承原生 <input> 属性」就够了。
test("extends 来的属性不算自有成员", () => {
  const fields = declaredFields(`
    export interface FooProps extends HTMLAttributes<HTMLDivElement> { own?: string }
  `);
  assert.deepEqual([...fields.keys()], ["own"]);
});

test("`export type XxxItem = { … }` 与 interface 等价，不因语法形式漏掉", () => {
  const fields = declaredFields(`export type BarItem = { key: string; label?: string }`);
  assert.deepEqual([...fields.keys()].sort(), ["key", "label"]);
});

// 联合 / 交叉类型的字段归属得靠类型检查器才算得准，静态扫描不猜。
test("联合类型别名不展开", () => {
  const fields = declaredFields(`export type BazItem = { a: string } | { b: string }`);
  assert.equal(fields.size, 0);
});

test("方法签名算字段，下划线开头的内部字段不算", () => {
  const fields = declaredFields(`
    export interface FooProps { onTick(v: number): void; _internal?: string }
  `);
  assert.deepEqual([...fields.keys()], ["onTick"]);
});

// ------------------------------------------------------------------ 文档侧 --

test("认所有表格的首列，不限于 Props / Events / Slots 三节", () => {
  const names = documentedNames(`
## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label * | \`ReactNode\` | 段内容 |

## 别的什么表

| 名称 | 类型 |
|------|------|
| stray | \`string\` |
`);
  assert.ok(names.has("label"));
  assert.ok(names.has("stray"));
});

// #150 的正则版在这三种写法上误报 757 处，是它不能进 CI 的原因。
test("限定名取最后一段", () => {
  assert.ok(documentedNames("| `DialogContent.title` | `ReactNode` | 标题 |").has("title"));
});

test("一格写两个同源字段（`a / b`）两个都算已文档化", () => {
  const names = documentedNames("| startXOffset / startYOffset | `number` | — | 起点偏移 |");
  assert.ok(names.has("startXOffset"));
  assert.ok(names.has("startYOffset"));
});

test("代码块里的表格形状不算文档", () => {
  const names = documentedNames("```md\n| fake | `string` | — | — |\n```\n");
  assert.equal(names.size, 0);
});

test("分隔行不产生名字", () => {
  const names = documentedNames("| 名称 | 类型 |\n|------|------|\n");
  assert.ok(!names.has("------"));
});

// -------------------------------------------------------------------- 全库 --

// 这条是门禁本身：加 prop 时改 .types.ts 是必须的，补 md 表格是可选的 ——
// 不锁住的话文档会持续静默滞后于类型（hulianui/hulian#150）。
test("全库：类型里的字段都能在文档表格里查到", () => {
  const rows = scanComponents();
  const detail = rows
    .map((r) => `${r.slug}: ${r.missing.map((m) => m.name).join(", ")}`)
    .join("\n");
  assert.equal(rows.length, 0, `以下字段类型里有、文档表格里查不到：\n${detail}`);
});
