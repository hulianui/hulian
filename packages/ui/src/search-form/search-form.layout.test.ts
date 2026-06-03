import { describe, it, expect } from "vitest";
import { planLayout, canCollapse, totalSpan } from "./search-form.layout";
import type { SearchField } from "./search-form.types";

const f = (name: string, colSpan?: number): SearchField => ({ name, label: name, colSpan });

describe("totalSpan", () => {
  it("累加每字段 span（缺省 1）", () => {
    expect(totalSpan([f("a"), f("b"), f("c")], 3)).toBe(3);
  });
  it("colSpan 封顶 columns", () => {
    expect(totalSpan([f("a", 5)], 3)).toBe(3);
  });
});

describe("canCollapse", () => {
  it("累计跨度 > columns-1 才需折叠", () => {
    expect(canCollapse([f("a"), f("b"), f("c"), f("d"), f("e")], 3)).toBe(true);
  });
  it("填不满(留得下操作区一格)不折叠", () => {
    expect(canCollapse([f("a"), f("b")], 3)).toBe(false);
  });
});

describe("planLayout", () => {
  it("折叠：贪心取到 columns-1 跨度，操作区落末格", () => {
    const r = planLayout([f("a"), f("b"), f("c"), f("d"), f("e")], 3, true);
    expect(r.visible.map((x) => x.name)).toEqual(["a", "b"]);
    expect(r.actionStart).toBe(3);
    expect(r.actionFullRow).toBe(false);
  });
  it("展开：全字段，操作区落最后一行剩余格", () => {
    const r = planLayout([f("a"), f("b"), f("c"), f("d"), f("e")], 3, false);
    expect(r.visible.length).toBe(5);
    expect(r.actionStart).toBe(3); // used=5, rem=2 → start=3
  });
  it("整行满：操作区另起一行(start=1, fullRow)", () => {
    const r = planLayout([f("a"), f("b"), f("c")], 3, false);
    expect(r.actionStart).toBe(1);
    expect(r.actionFullRow).toBe(true);
  });
  it("折叠 + colSpan：宽字段占满后停", () => {
    const r = planLayout([f("a", 2), f("b"), f("c")], 3, true);
    expect(r.visible.map((x) => x.name)).toEqual(["a"]); // a 占 2，再加 b 超 columns-1=2
    expect(r.actionStart).toBe(3);
  });
});
