import { describe, it, expect } from "vitest";
import {
  TYPE_ORDER,
  categoriesOf,
  groupByType,
  searchAll,
  searchDocs,
  scoreToken,
  tokenize,
} from "./search-index";

// 这些用例直接照抄 hulianui/hulian#40 的验收标准，逐条钉住。
// 断言用「相对位置 / 是否命中」而非硬编码名次，避免每加一个组件就红一片。

const idsOf = (q: string, n = 40) => searchAll(q, { limit: n }).map((h) => h.id);
const rank = (ids: string[], id: string) => ids.indexOf(id);

describe("索引覆盖面", () => {
  it("五种类型都进索引，不是只有组件", () => {
    const types = new Set(searchDocs.map((d) => d.type));
    for (const t of TYPE_ORDER) expect(types.has(t), `缺少类型 ${t}`).toBe(true);
  });

  it("id 全局唯一（slug 跨类型撞车会互相顶掉结果）", () => {
    expect(new Set(searchDocs.map((d) => d.id)).size).toBe(searchDocs.length);
  });

  it("每篇文档都有可跳转的站内 href", () => {
    for (const d of searchDocs) expect(d.href.startsWith("/"), `${d.id} → ${d.href}`).toBe(true);
  });
});

describe("业务任务查询：用户 管理 列表", () => {
  const ids = idsOf("用户 管理 列表");

  it("同一结果面板同时命中整页、区块与低层组件", () => {
    expect(ids).toContain("page:admin-list");
    expect(ids).toContain("block:data-table");
    expect(ids).toContain("component:pro-table");
  });

  it("整页与区块排在低层组件之前", () => {
    expect(rank(ids, "page:admin-list")).toBeLessThan(rank(ids, "component:pro-table"));
    expect(rank(ids, "block:data-table")).toBeLessThan(rank(ids, "component:pro-table"));
  });

  it("命中词更多的排更前（覆盖率优先于单点强度）", () => {
    const hits = searchAll("用户 管理 列表", { limit: 5 });
    expect(hits.length).toBeGreaterThan(0);
    // 首条至少命中两个 token —— 只蹭到「列表」一词的结果不该霸榜。
    const tokens = tokenize("用户 管理 列表");
    const matched = tokens.filter((t) => scoreToken(hits[0], t) > 0);
    expect(matched.length).toBeGreaterThanOrEqual(2);
  });
});

describe("中英双语与导出名", () => {
  it("button 与 按钮 都命中 Button", () => {
    expect(idsOf("button")).toContain("component:button");
    expect(idsOf("按钮")).toContain("component:button");
  });

  it("复合导出名命中其组件（LayoutSider → Layout）", () => {
    expect(idsOf("LayoutSider")).toContain("component:layout");
  });

  it("短英文名不会被任意长 token 吸附（advantage 不该命中 Tag）", () => {
    const tag = { ...searchDocs[0], en: "Tag", title: "标签", description: "", keywords: [] };
    expect(scoreToken(tag, "advantage")).toBe(0);
    // 但真复合导出名（词首/词尾）仍要命中。
    expect(scoreToken(tag, "pricetag")).toBeGreaterThan(0);
    expect(scoreToken(tag, "tagfield")).toBeGreaterThan(0);
  });

  it("slug 形式也能命中（data-table → 区块）", () => {
    expect(idsOf("data-table")).toContain("block:data-table");
  });
});

describe("过滤与分组", () => {
  it("type 过滤只留该类型", () => {
    const hits = searchAll("列表", { type: "block" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.type === "block")).toBe(true);
  });

  it("category 过滤生效", () => {
    const hits = searchAll("", { type: "block", category: "marketing" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.category === "marketing")).toBe(true);
  });

  it("空查询返回全部（供搜索页按类型/分类浏览）", () => {
    expect(searchAll("").length).toBe(searchDocs.length);
  });

  it("分组顺序恒为 页面 → 区块 → 组件 → 模版 → 指南", () => {
    const groups = groupByType(searchAll("列表", { limit: 200 }));
    const order = groups.map((g) => g.type);
    const expected = TYPE_ORDER.filter((t) => order.includes(t));
    expect(order).toEqual(expected);
  });

  it("categoriesOf 给出可用于筛选芯片的分类", () => {
    expect(categoriesOf("block").length).toBeGreaterThan(1);
    expect(categoriesOf("component").length).toBeGreaterThan(1);
  });
});

describe("无结果不再骗人", () => {
  it("确实无关的词返回空数组（而不是回落成全量）", () => {
    expect(searchAll("zzzz不存在的东西qqq")).toEqual([]);
  });
});
