import assert from "node:assert/strict";
import test from "node:test";

import {
  aliasesUsedIn,
  classifyType,
  collectTypeAliases,
  expandAliasType,
  parseComponentDoc,
  parseNameCell,
  splitTableRow,
  splitUnion,
  unionMembers,
} from "./props-catalog.mjs";

// —— #102：转义的 `\|` 不是列分隔符 ——

test("拆列认 GFM 转义的管道，枚举列不再被劈开", () => {
  const line = '| align | `"start" \\| "center" \\| "end"` | — | 交叉轴对齐 |';
  assert.deepEqual(splitTableRow(line), [
    "align",
    '`"start" | "center" | "end"`',
    "—",
    "交叉轴对齐",
  ]);
});

test("拆列认代码段内的裸管道（漏写转义时的第二道保险）", () => {
  const line = "| type | `number | string` | — | 说明 |";
  assert.deepEqual(splitTableRow(line), ["type", "`number | string`", "—", "说明"]);
});

test("中间的空单元是真列，只有行首行尾的空单元被丢弃", () => {
  assert.deepEqual(splitTableRow("| a |  | c |"), ["a", "", "c"]);
});

test("反斜杠只在 ASCII 标点前算转义，英文产物的 \\uXXXX 越界标记原样保留", () => {
  assert.deepEqual(splitTableRow("| name | `\\u4e2d\\u6587` | desc |"), [
    "name",
    "`\\u4e2d\\u6587`",
    "desc",
  ]);
});

// —— 联合类型拆分 ——

test("按顶层管道拆联合，不劈开函数类型与泛型参数里的管道", () => {
  assert.deepEqual(splitUnion('(v: "a" | "b") => void | null'), ['(v: "a" | "b") => void', "null"]);
  assert.deepEqual(splitUnion('Record<string, "x" | "y"> | undefined'), [
    'Record<string, "x" | "y">',
    "undefined",
  ]);
});

test("混合联合仍给出字面量取值，kind 标为 union 而非 enum", () => {
  const members = unionMembers('"row" | "column" | ResponsiveDirection');
  assert.deepEqual(members.values, ["row", "column"]);
  assert.deepEqual(members.others, ["ResponsiveDirection"]);
  assert.equal(classifyType('"row" | "column" | ResponsiveDirection', members), "union");
  assert.equal(classifyType('"a" | "b"', unionMembers('"a" | "b"')), "enum");
  assert.equal(classifyType("boolean", unionMembers("boolean")), "boolean");
  assert.equal(classifyType("(v: string) => void", unionMembers("(v: string) => void")), "function");
});

// —— #103：字面量联合别名就地展开 ——

test("从真实源码抽到字面量联合别名的取值", () => {
  const aliases = collectTypeAliases("packages/ui/src");
  assert.ok(aliases.size > 100, `别名条数异常：${aliases.size}`);
  assert.deepEqual(aliases.get("StackDirection"), ['"row"', '"column"']);
  // 非字面量别名（对象型）刻意不收，展开它们只会把类型列撑爆
  assert.equal(aliases.has("ResponsiveDirection"), false);
});

test("展开只替换已知别名，其余原样保留；maxValues 之外的别名不展开", () => {
  const aliases = new Map([
    ["StackDirection", ['"row"', '"column"']],
    ["IconName", Array.from({ length: 40 }, (_, i) => `"i${i}"`)],
  ]);
  assert.equal(
    expandAliasType("StackDirection | ResponsiveDirection", aliases),
    '"row" | "column" | ResponsiveDirection',
  );
  assert.equal(expandAliasType("IconName", aliases, { maxValues: 8 }), "IconName");
  assert.deepEqual(aliasesUsedIn("StackDirection | IconName | Foo", aliases), [
    "StackDirection",
    "IconName",
  ]);
});

// —— 名称列的三种写法 ——

test("名称列解析必填标记与子件前缀", () => {
  assert.deepEqual(parseNameCell("direction", ""), {
    name: "direction",
    owner: "",
    required: false,
  });
  assert.deepEqual(parseNameCell("events*", ""), { name: "events", owner: "", required: true });
  assert.deepEqual(parseNameCell("`DialogContent.title` *", ""), {
    name: "title",
    owner: "DialogContent",
    required: true,
  });
  assert.deepEqual(parseNameCell("colSpan", "GridItem"), {
    name: "colSpan",
    owner: "GridItem",
    required: false,
  });
});

// —— 整篇文档 ——

const DOC = `
# Demo

## Props

### Demo

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| direction | \`StackDirection \\| ResponsiveDirection\` | \`"column"\` | 主轴方向 |
| tone* | \`"info" \\| "danger"\` | — | 语气 |

### DemoItem

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| span | \`number\` | \`1\` | 跨列 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange | \`(open: boolean) => void\` | 开关态变化回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | \`ReactNode\` | 子元素 |

## 示例
\`\`\`tsx
| 这行在代码围栏里 | 不是表格 |
\`\`\`
`;

test("整篇文档解析出 props/slots，别名展开且子件归属正确", () => {
  const parsed = parseComponentDoc(DOC, new Map([["StackDirection", ['"row"', '"column"']]]));
  assert.deepEqual(
    parsed.props.map((p) => [p.owner, p.name, p.required, p.kind, p.values ?? null, p.default]),
    [
      ["Demo", "direction", false, "union", ["row", "column"], '"column"'],
      ["Demo", "tone", true, "enum", ["info", "danger"], null],
      ["DemoItem", "span", false, "number", null, "1"],
    ],
  );
  assert.equal(parsed.props[0].resolvedType, '"row" | "column" | ResponsiveDirection');
  // Events / Slots 表是三列（名称/类型/说明），按 Props 的四列硬读会把说明当成默认值
  assert.deepEqual(parsed.events, [
    {
      name: "onOpenChange",
      required: false,
      kind: "function",
      type: "(open: boolean) => void",
      default: null,
      description: "开关态变化回调",
    },
  ]);
  // Slots 段没有 `### 子件` 小节 → 不带 owner，消费方按主组件理解
  assert.deepEqual(parsed.slots, [{ name: "children", type: "ReactNode", description: "子元素" }]);
});

test("代码围栏里的管道行不被当成表格", () => {
  const parsed = parseComponentDoc(DOC, new Map());
  assert.equal(
    parsed.props.some((p) => p.name.includes("这行在代码围栏里")),
    false,
  );
});
