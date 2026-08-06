import { describe, it, expect } from "vitest";
import { fuzzyMatch, rankComponents, scoreComponent } from "./component-picker-search";
import type { ComponentPickerItem } from "./component-picker.types";

const item = (
  slug: string,
  name: string,
  description = "",
  extra: Partial<ComponentPickerItem> = {},
): ComponentPickerItem => ({
  slug,
  name,
  description,
  category: "forms",
  group: "basic",
  ...extra,
});

const CATALOG: ComponentPickerItem[] = [
  item("button", "Button", "按钮 · 7 变体 + 尺寸 + 加载态"),
  item("button-group", "ButtonGroup", "按钮组 · 相邻按钮拼接"),
  item("ripple-button", "RippleButton", "水波纹按钮"),
  item("input", "Input", "输入框 · 前后缀插槽"),
  item("table", "Table", "表格 · TanStack 引擎"),
  item("pro-table", "ProTable", "高级表格 · 列表页编排层"),
  item("tag", "Tag", "状态标签", { tags: ["status"] }),
];

describe("fuzzyMatch", () => {
  it("子序列命中并回传下标", () => {
    expect(fuzzyMatch("btn", "button")?.indices).toEqual([0, 2, 5]);
  });

  it("非子序列返回 null", () => {
    expect(fuzzyMatch("zzz", "button")).toBeNull();
  });

  it("大小写无关", () => {
    expect(fuzzyMatch("BTN", "button")).not.toBeNull();
    expect(fuzzyMatch("btn", "BUTTON")).not.toBeNull();
  });

  it("空 query 无条件命中且得 0 分", () => {
    expect(fuzzyMatch("", "button")).toEqual({ score: 0, indices: [] });
  });

  it("全等 > 前缀 > 散落命中", () => {
    const exact = fuzzyMatch("table", "table")!.score;
    const prefix = fuzzyMatch("table", "table-cell")!.score;
    const scattered = fuzzyMatch("table", "tab label")!.score;
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(scattered);
  });

  it("同样命中时短文本分更高（覆盖率加权）", () => {
    expect(fuzzyMatch("btn", "button")!.score).toBeGreaterThan(fuzzyMatch("btn", "buttongroup")!.score);
  });

  it("词首命中比词中命中分高", () => {
    expect(fuzzyMatch("g", "button-group")!.score).toBeGreaterThan(fuzzyMatch("g", "toggling")!.score);
  });

  it("词首优先走不通时退回最左贪心，不漏判", () => {
    // `a` 若贪心落到词首那个（下标 5），后面就找不到 `b` 了
    expect(fuzzyMatch("ab", "xay b a")).not.toBeNull();
  });
});

describe("scoreComponent", () => {
  it("slug 命中远高于描述命中", () => {
    const bySlug = scoreComponent(item("table", "Table", "无关描述"), "table");
    const byDesc = scoreComponent(item("kanban", "Kanban", "看板 table 视图"), "table");
    expect(bySlug).toBeGreaterThan(byDesc);
  });

  it("多词按 AND 语义：任一词不命中即 0 分", () => {
    const it0 = item("login-form", "LoginForm", "登录模板 · 自管 useForm");
    expect(scoreComponent(it0, "login form")).toBeGreaterThan(0);
    expect(scoreComponent(it0, "login zzzz")).toBe(0);
  });

  it("空 query 得 0 分", () => {
    expect(scoreComponent(CATALOG[0]!, "   ")).toBe(0);
  });

  it("tags 参与匹配（作辅助字段）", () => {
    expect(scoreComponent(item("tag", "Tag", "标签", { tags: ["status"] }), "status")).toBeGreaterThan(0);
  });
});

describe("rankComponents", () => {
  it("btn 能搜到 Button 且排第一", () => {
    const ranked = rankComponents(CATALOG, "btn");
    expect(ranked[0]!.item.slug).toBe("button");
  });

  it("精确 slug 排第一（即使别的条目名字更短）", () => {
    const ranked = rankComponents(CATALOG, "table");
    expect(ranked[0]!.item.slug).toBe("table");
    expect(ranked.map((r) => r.item.slug)).toContain("pro-table");
  });

  it("大小写无关", () => {
    expect(rankComponents(CATALOG, "BUTTON")[0]!.item.slug).toBe("button");
    expect(rankComponents(CATALOG, "Table")[0]!.item.slug).toBe("table");
  });

  it("空 query 保持原序且不过滤", () => {
    const ranked = rankComponents(CATALOG, "");
    expect(ranked).toHaveLength(CATALOG.length);
    expect(ranked.map((r) => r.item.slug)).toEqual(CATALOG.map((c) => c.slug));
  });

  it("不匹配的条目被淘汰", () => {
    expect(rankComponents(CATALOG, "zzzz")).toHaveLength(0);
  });

  it("limit 截断", () => {
    expect(rankComponents(CATALOG, "", { limit: 2 })).toHaveLength(2);
    expect(rankComponents(CATALOG, "t", { limit: 1 })).toHaveLength(1);
  });

  it("同分按原序稳定", () => {
    const dup = [item("aa", "Aa", "x"), item("ab", "Ab", "x")];
    expect(rankComponents(dup, "a").map((r) => r.item.slug)).toEqual(["aa", "ab"]);
  });
});
