// consumer.mjs 的纯函数：版本比对与 md 表首列解析（#337）。server 级行为见 server.test.mjs。
import { test } from "node:test";
import assert from "node:assert/strict";

import { compareVersions, consumerBanner, describeGap, documentedNames, parseVersion } from "../src/consumer.mjs";

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

test("consumerBanner 三个方向措辞各不同：旧→不存在+升级、新→查不到、比不出→不下断言", () => {
  const base = { docs: "0.58.0", installed: "0.56.0", from: "/p/node_modules/@hulianui/ui", projectRoot: "/p", projectRootSource: "argument" };
  const older = consumerBanner({ ...base, direction: "older", gap: "2 个 minor" });
  assert.match(older, /旧 2 个 minor/);
  assert.match(older, /\*\*不存在\*\*.*TS2322/);
  assert.match(older, /pnpm add @hulianui\/ui@0\.58\.0/);
  assert.match(older, /本地源码模式|再按本文档写/, "升级路径要给");

  const newer = consumerBanner({ ...base, installed: "0.59.0", direction: "newer", gap: "1 个 minor" });
  assert.match(newer, /新 1 个 minor/);
  assert.match(newer, /\*\*查不到\*\*/);
  assert.match(newer, /HULIAN_ALLOW_REMOTE_FALLBACK=1/, "指 HULIAN_UI_ROOT 到消费方时必须提这个开关，否则本地模式缺产物是硬错误");
  assert.doesNotMatch(newer, /TS2322/);

  const unknown = consumerBanner({ ...base, installed: "0.58.0-beta.1", direction: "unknown", gap: null });
  assert.match(unknown, /比不出先后/);
  assert.doesNotMatch(unknown, /不存在|查不到|TS2322/, "比不出先后就不能替任何一边下断言");
  assert.doesNotMatch(unknown, /，旧 |，新 /, "没有 gap 就不写差距");

  assert.equal(consumerBanner(null), "");
});
