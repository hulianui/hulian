// profile 真源的门禁：引用的每个组件 / page / block 都必须真实存在于 registry。
// profile 里写一个不存在的 slug，等于让模型去 import 一个查不到的东西 ——
// 比不给建议更糟，所以这里用 registry 真数据校验，不 mock。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  composeProfile,
  getSurface,
  listModifiers,
  listSurfaces,
  listWorkflows,
  loadProfiles,
  surfaceComponents,
  validateProfiles,
} from "../src/profiles.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REGISTRY = join(HERE, "..", "..", "..", "apps", "www", "public", "registry.json");

function loadRegistry() {
  return JSON.parse(readFileSync(REGISTRY, "utf8"));
}

test("profile 引用的组件 / page / block 全部存在于 registry", () => {
  const { errors } = validateProfiles(loadRegistry());
  assert.deepEqual(errors, [], `profile 引用了 registry 里没有的条目：\n${errors.join("\n")}`);
});

test("profile 结构完整：id 唯一、必需字段齐全", () => {
  const { warnings } = validateProfiles(loadRegistry());
  // warning 允许存在（如 desktop-shell 没有 page/block 候选），但必须自带说明
  for (const w of warnings) assert.ok(w.includes(":"), `warning 格式异常: ${w}`);

  const surfaces = listSurfaces();
  assert.ok(surfaces.length >= 5, "surface 至少 5 个");
  for (const s of surfaces) {
    assert.ok(s.evidence?.length, `surface ${s.id} 必须标注实证来源项目`);
    assert.ok(s.signals?.length || s.maturity, `surface ${s.id} 需要 signals 或 maturity 说明`);
  }
});

test("三个维度互不混淆：workflow 不出现在 surface 里", () => {
  const surfaceIds = new Set(listSurfaces().map((s) => s.id));
  for (const w of listWorkflows())
    assert.ok(
      !surfaceIds.has(w.id),
      `${w.id} 同时是 surface 和 workflow —— 场景与工作流必须分开，` +
        `否则 recommend_ui 收到它推不出任何组件语言`,
    );
});

test("composeProfile 能把 modifier 叠加到 surface 上", () => {
  const composed = composeProfile({
    surface: "ai-product",
    modifiers: ["mobile"],
    workflow: "build",
  });
  assert.equal(composed.surface.id, "ai-product");
  assert.deepEqual(composed.unknown, []);
  // surface 自己的组件在
  assert.ok(composed.components.includes("prompt-input"));
  // modifier 追加的组件也在 —— 移动端 AI 产品必须能表达出来
  assert.ok(composed.components.includes("safe-area"));
  assert.ok(composed.components.includes("tab-bar"));
  // 约束合并
  assert.ok(composed.constraints.some((c) => c.includes("44px")));
  assert.ok(composed.steps.length > 0);
});

test("未知 id 走 unknown，不静默吞掉", () => {
  const composed = composeProfile({
    surface: "nope",
    modifiers: ["alsoNope"],
    workflow: "stillNope",
  });
  assert.equal(composed.surface, null);
  assert.equal(composed.unknown.length, 3);
});

test("admin-console 的组件语言取自正式系统而非 demo 原型", () => {
  // 实证：同产品的 demo 原型与正式系统在 12 个高层业务件上是 5/12 与 10/12。
  // 若这里退回 card/select 堆砌，说明 profile 又被原型数据污染了。
  const comps = surfaceComponents(getSurface("admin-console"));
  for (const must of ["page-header", "pro-table", "access", "form-dialog"])
    assert.ok(comps.includes(must), `admin-console 必须包含高层业务件 ${must}`);
});

test("mobile modifier 覆盖真实缺口组件", () => {
  // 实证缺口：5069tk 的 6 个 H5 页面只用了 TabBar，SafeArea 等全部缺席
  const mobile = listModifiers().find((m) => m.id === "mobile");
  const all = [...(mobile.require ?? []), ...(mobile.consider ?? [])];
  for (const must of ["safe-area", "action-sheet", "pull-to-refresh"])
    assert.ok(all.includes(must), `mobile modifier 应覆盖 ${must}`);
});

test("metrics 声明了主指标与基准组件", () => {
  const { metrics } = loadProfiles();
  assert.equal(metrics.primary, "高层业务组件采用度");
  assert.equal(metrics.highLevelComponents.length, 12);
});
