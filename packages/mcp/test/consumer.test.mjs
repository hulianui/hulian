// consumer.mjs 的纯函数：版本比对与 md 表首列解析（#337）。server 级行为见 server.test.mjs。
import { test } from "node:test";
import assert from "node:assert/strict";

import { compareVersions, describeGap, documentedNames, parseVersion } from "../src/consumer.mjs";

test("parseVersion 只认数字前缀，带标签的也能比", () => {
  assert.deepEqual(parseVersion("0.58.0"), [0, 58, 0]);
  assert.deepEqual(parseVersion("v9.9.10-installed"), [9, 9, 10]);
  assert.equal(parseVersion("workspace:*"), null);
  assert.equal(parseVersion(null), null);
});

test("compareVersions 按 major.minor.patch 逐段比，认不出返回 null", () => {
  assert.equal(compareVersions("0.56.0", "0.58.0"), -1);
  assert.equal(compareVersions("0.58.0", "0.56.0"), 1);
  assert.equal(compareVersions("9.9.9-local", "9.9.9-remote"), 0);
  assert.equal(compareVersions("1.0.0", "0.99.99"), 1);
  assert.equal(compareVersions("x", "0.1.0"), null);
});

test("describeGap 说的是第一段不同的差距", () => {
  assert.equal(describeGap("0.56.0", "0.58.0"), "2 个 minor");
  assert.equal(describeGap("0.58.0", "0.56.0"), "2 个 minor");
  assert.equal(describeGap("0.58.0", "1.0.0"), "1 个 major");
  assert.equal(describeGap("9.9.7", "9.9.9"), "2 个 patch");
  assert.equal(describeGap("9.9.9-a", "9.9.9-b"), null);
  assert.equal(describeGap("x", "0.1.0"), null);
});

test("documentedNames：去星号 / 反引号 / 限定名，拆 a / b 合并行，跳表头与代码块", () => {
  const md = [
    "# Dialog",
    "",
    "## Props",
    "",
    "| Prop | 类型 | 说明 |",
    "|---|---|---|",
    "| `open` * | `boolean` | 受控 |",
    "| size | `\"sm\" \\| \"lg\"` | 转义管道不算列 |",
    "| startX / startY | `number` | 合并行 |",
    "| `DialogContent.title` | `ReactNode` | 限定名 |",
    "",
    "```tsx",
    "| notAProp | 代码块里的表不算 |",
    "```",
    "",
    "## Slots",
    "",
    "| Slot | 类型 |",
    "|---|---|",
    "| children | `ReactNode` |",
  ].join("\n");
  const names = documentedNames(md);
  assert.deepEqual([...names].sort(), ["children", "open", "size", "startX", "startY", "title"]);
  assert.ok(!names.has("Prop"), "表头不是字段");
  assert.ok(!names.has("notAProp"), "代码块里的表不算");
});
