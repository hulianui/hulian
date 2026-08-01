import assert from "node:assert/strict";
import test from "node:test";

import { GALLERY_BUDGETS, checkBudget } from "./gallery-budget.mjs";

const budget = {
  route: "/pages",
  minPreviews: 18,
  maxMountedOnLoad: 12,
  maxDomNodes: 4200,
  maxConsoleWarnings: 6,
};

const ok = {
  previewTotal: 20,
  mounted: 9,
  domNodes: 2797,
  consoleWarnings: 1,
  thumbsMissingInert: 0,
  focusEscapes: 0,
};

const check = (patch) => checkBudget(budget, { ...ok, ...patch });

test("门禁覆盖 issue #40 点名的两个画廊", () => {
  const routes = GALLERY_BUDGETS.map((b) => b.route);
  assert.deepEqual(routes, ["/pages", "/blocks"]);
});

test("当前实现（20 个里挂 9 个）通过", () => {
  assert.deepEqual(check(), []);
});

test("回到全量挂载会被单独点名", () => {
  const failures = check({ mounted: 20, domNodes: 6353 });
  assert.match(failures.join("\n"), /全部 20 个预览都被挂载/);
  assert.match(failures.join("\n"), /顶层 DOM 6353/);
});

test("超出挂载预算即失败（哪怕没到全量）", () => {
  assert.match(check({ mounted: 13 }).join("\n"), /首屏已挂载 13/);
  assert.deepEqual(check({ mounted: 12 }), []); // 边界值本身允许
});

test("「预览一个都没渲染」不能冒充优化", () => {
  const failures = check({ previewTotal: 0, mounted: 0, domNodes: 300 });
  assert.match(failures.join("\n"), /画廊本身渲染坏了/);
  // previewTotal=0 时不该再报「全部都被挂载」这种误导信息。
  assert.doesNotMatch(failures.join("\n"), /都被挂载/);
});

test("控制台 warning 超预算失败（头像预加载那类回归）", () => {
  assert.match(check({ consoleWarnings: 7 }).join("\n"), /warning 7 条/);
});

test("缩略图丢了 inert / 焦点真的跑进去了才失败（预览里本来就有 a 和 button）", () => {
  assert.match(check({ thumbsMissingInert: 2 }).join("\n"), /2 个缩略图缺 inert/);
  assert.match(check({ focusEscapes: 3 }).join("\n"), /3 个元素真的拿到了焦点/);
});
