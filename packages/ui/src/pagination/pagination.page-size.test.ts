import { describe, it, expect } from "vitest";
import { pageAfterPageSizeChange } from "./pagination.page-size";

describe("pageAfterPageSizeChange · 换页长后的页码归位（#271）", () => {
  it("当前页仍在新范围内 → null（不必补发）", () => {
    // 5151 条 / 100 = 52 页，第 2 页当然还在。
    expect(pageAfterPageSizeChange({ page: 2, pageSize: 100, totalItems: 5151 })).toBeNull();
  });

  it("当前页越界 → 夹到新末页，而不是回第 1 页", () => {
    // 5151 / 500 = 11 页，原来的第 52 页不存在了。
    expect(pageAfterPageSizeChange({ page: 52, pageSize: 500, totalItems: 5151 })).toBe(11);
  });

  it("换成更小的页长只会让页数变多，永远不越界 → null", () => {
    expect(pageAfterPageSizeChange({ page: 52, pageSize: 20, totalItems: 5151 })).toBeNull();
  });

  it("整除边界：条数刚好铺满 N 页时不多算一页", () => {
    expect(pageAfterPageSizeChange({ page: 5, pageSize: 20, totalItems: 100 })).toBeNull();
    expect(pageAfterPageSizeChange({ page: 6, pageSize: 20, totalItems: 100 })).toBe(5);
  });

  it("0 条 → 新页数按 1 算（空列表仍停在第 1 页，不是第 0 页）", () => {
    expect(pageAfterPageSizeChange({ page: 3, pageSize: 20, totalItems: 0 })).toBe(1);
  });

  it("给了 total（总页数）→ null：页数不由 pageSize 决定，猜一个错页码比不动更糟", () => {
    expect(
      pageAfterPageSizeChange({ page: 9, pageSize: 100, totalItems: 5151, total: 10 }),
    ).toBeNull();
    expect(pageAfterPageSizeChange({ page: 9, pageSize: 100, total: 10 })).toBeNull();
  });

  it("既没 totalItems 也没 total → null（算不出来）", () => {
    expect(pageAfterPageSizeChange({ page: 9, pageSize: 100 })).toBeNull();
  });

  it("非法页长不参与运算（不产生 Infinity 页）", () => {
    expect(pageAfterPageSizeChange({ page: 9, pageSize: 0, totalItems: 100 })).toBeNull();
    expect(pageAfterPageSizeChange({ page: 9, pageSize: Number.NaN, totalItems: 100 })).toBeNull();
  });
});
