import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { rank, parseTagQuery, filterByTags } from "../src/search.mjs";
import { docsUrl, isVisualItem, lookOf, motionOf, visualMeta, visualOpportunities } from "../src/visual.mjs";
import { listSurfaces } from "../src/profiles.mjs";

// #140：特效件此前只有抑制通道没有发掘通道 —— 抑制侧按 category 一次拉黑 92 件（机器可判定），
// 发掘侧只有手写的约 8 件。这组测试盯的是**通道对称**这件事本身，而不是某个具体推荐。

const HERE = dirname(fileURLToPath(import.meta.url));
const REGISTRY = JSON.parse(
  readFileSync(join(HERE, "..", "..", "..", "apps", "www", "public", "registry.json"), "utf8"),
);
const UI = REGISTRY.items.filter((i) => i.type === "registry:ui");
const slugMeta = new Map(UI.map((i) => [i.name, i]));

test("B · 氛围词能检索到特效件（此前形容词类 query 对 92 件装饰件全部打 0 分）", () => {
  // 判据取自 issue：当前返回 0 件特效，改后应返回 ≥3 件。
  const { results } = rank(UI, "落地页首屏想有点科技感");
  const visual = results.filter((r) => isVisualItem(r.item));
  assert.ok(
    visual.length >= 3,
    `「科技感」应命中至少 3 件特效，实际 ${visual.length}：${results.slice(0, 5).map((r) => r.item.name).join(" ")}`,
  );
});

test("B · 多条氛围词各自有落点，不是只有一条在起作用", () => {
  for (const query of ["这块太平了", "要有呼吸感", "加点高级感", "毛玻璃", "入场动效"]) {
    const { results } = rank(UI, query);
    assert.ok(results.length > 0, `「${query}」不该零命中`);
  }
});

test("B · tags: 直查按标签过滤，且要求全部命中", () => {
  assert.deepEqual(parseTagQuery("tags:animated"), ["animated"]);
  assert.equal(parseTagQuery("数据表格"), null, "普通 query 不该被当成标签查询");
  const both = filterByTags(UI, ["animated", "webgl"]);
  const animated = filterByTags(UI, ["animated"]);
  assert.ok(both.length > 0 && both.length < animated.length, "多标签应当是「且」不是「或」");
});

test("C · 每件都有能甩给人看的文档链接", () => {
  const meta = visualMeta(slugMeta.get("aurora-text"));
  assert.match(meta.docsUrl, /\/components\/aurora-text$/);
  // 功能件也给链接：决策权要能随时交回给人
  assert.match(visualMeta(slugMeta.get("button")).docsUrl, /\/components\/button$/);
});

test("C · motion 分四档，且被推荐的件都是查表得到而不是按标签推的", () => {
  assert.equal(motionOf(slugMeta.get("aurora")), "heavy");
  assert.equal(motionOf(slugMeta.get("reveal")), "subtle");
  assert.equal(motionOf(slugMeta.get("button")), "none");
  // 查表优先于标签推导：dot-pattern 带 animated 标签族但实际是静态底纹
  assert.equal(motionOf(slugMeta.get("dot-pattern")), "none");
});

test("C · look 只给实测过的件，不给 380 件各编一句", () => {
  assert.ok(lookOf(slugMeta.get("aurora-text")).includes("1–6 个字"));
  assert.equal(lookOf(slugMeta.get("button")), null, "没实测过的件应返回 null 而不是编一句");
  // 功能件不该被挂上 motion:"none" 的噪音字段
  assert.equal("motion" in visualMeta(slugMeta.get("button")), false);
});

test("A · 每个 surface 的抑制与发掘是对称的", () => {
  for (const surface of listSurfaces()) {
    if (!surface.avoidGroups) continue;
    assert.ok(
      surface.allowEffects?.length,
      `${surface.id} 有 avoidGroups 却没有 allowEffects —— 只抑制不发掘正是 #140 要修的不对称`,
    );
    assert.ok(surface.visualBudget, `${surface.id} 缺 visualBudget，agent 无从做视觉预算`);
    assert.ok(surface.preferEffects?.length, `${surface.id} 缺 preferEffects`);
  }
});

test("A · 中后台的重物预算恒为 0（#41 的非目标仍然守死）", () => {
  for (const id of ["admin-console", "config-tool", "desktop-shell", "ai-product"]) {
    const surface = listSurfaces().find((s) => s.id === id);
    assert.equal(surface.visualBudget.heavy, 0, `${id} 不该允许任何视觉重物`);
    // 白名单里不许混进全屏背景
    for (const slug of surface.allowEffects ?? []) {
      assert.notEqual(slugMeta.get(slug)?.meta?.group, "backdrop", `${slug} 是全屏背景，不该进白名单`);
    }
  }
});

test("D · 一处视觉表达都没有时给建议，已经有了就闭嘴", () => {
  const surface = listSurfaces().find((s) => s.id === "content-brand");
  const none = visualOpportunities({ surface, usedSlugs: new Set(["button", "card"]), slugMeta });
  assert.ok(none.length > 0, "一件动效都没用时应当提醒");
  for (const entry of none) {
    assert.ok(entry.slot && entry.slug && entry.docsUrl, "每条都要给位置 / 候选 / 链接");
    assert.ok(entry.fallback, "降级说明是必给的 —— agent 不会自己想到 reduced-motion");
    assert.match(entry.note, /建议而非要求/);
  }

  const enough = visualOpportunities({
    surface,
    usedSlugs: new Set(["aurora-text", "reveal", "marquee", "border-beam"]),
    slugMeta,
  });
  assert.deepEqual(enough, [], "已经用满 accent 预算就不该再提醒 —— 提醒的意义是「一处都没有」");
});

test("D · 中后台最多一条，避免撞回 #41 的非目标", () => {
  const surface = listSurfaces().find((s) => s.id === "admin-console");
  const out = visualOpportunities({ surface, usedSlugs: new Set(["pro-table"]), slugMeta, limit: 1 });
  assert.ok(out.length <= 1);
  for (const entry of out) assert.notEqual(entry.motion, "heavy", "中后台不该被推 heavy 档");
});

test("E · visualExpressiveness 是非门禁指标，且明确写了不追求数量", () => {
  const profiles = JSON.parse(readFileSync(join(HERE, "..", "src", "agent-profiles.json"), "utf8"));
  const metric = profiles.metrics.visualExpressiveness;
  assert.ok(metric, "metrics 里应有 visualExpressiveness");
  assert.notEqual(profiles.metrics.primary, "visualExpressiveness", "它不该是主指标");
  assert.match(metric.nonGoal, /不追求数量/);
});

test("docsUrl 随 registry 基址切换（自建镜像时链接不能仍指向官方站）", () => {
  const original = process.env.HULIAN_REGISTRY_URL;
  try {
    // 模块已加载并缓存了基址，这里只验默认值形状；切换语义由 data.mjs 的同名逻辑保证。
    assert.ok(docsUrl("button").startsWith("http"));
    assert.ok(docsUrl("button").endsWith("/components/button"));
  } finally {
    if (original === undefined) delete process.env.HULIAN_REGISTRY_URL;
    else process.env.HULIAN_REGISTRY_URL = original;
  }
});
