import { describe, it, expect } from "vitest";
import { getPaginationRange } from "./pagination.range";

describe("getPaginationRange 页码区间算法", () => {
  it("total 很小：全显示，无省略号", () => {
    expect(getPaginationRange({ page: 3, total: 5 })).toEqual([1, 2, 3, 4, 5]);
  });

  it("当前在头部：右侧省略", () => {
    expect(getPaginationRange({ page: 1, total: 10 })).toEqual([1, 2, "ellipsis", 10]);
  });

  it("当前在尾部：左侧省略", () => {
    expect(getPaginationRange({ page: 10, total: 10 })).toEqual([1, "ellipsis", 9, 10]);
  });

  it("当前居中：两侧都省略", () => {
    expect(getPaginationRange({ page: 5, total: 10 })).toEqual([
      1,
      "ellipsis",
      4,
      5,
      6,
      "ellipsis",
      10,
    ]);
  });

  it("恰隔 1 页 → 补出该页而非省略号（全补满）", () => {
    // total=7,page=4,sib=1：必显 {1,3,4,5,7} → 两侧各只隔 1 页 → 补出 2、6
    expect(getPaginationRange({ page: 4, total: 7 })).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("不对称：左补单页 / 右省略", () => {
    // total=8,page=4,sib=1：必显 {1,3,4,5,8} → 左隔 1 页补 2，右隔 2 页省略
    expect(getPaginationRange({ page: 4, total: 8 })).toEqual([1, 2, 3, 4, 5, "ellipsis", 8]);
  });

  it("siblingCount=2：更宽窗口", () => {
    expect(getPaginationRange({ page: 8, total: 15, siblingCount: 2 })).toEqual([
      1,
      "ellipsis",
      6,
      7,
      8,
      9,
      10,
      "ellipsis",
      15,
    ]);
  });

  it("siblingCount=0：仅当前页 + 首尾", () => {
    expect(getPaginationRange({ page: 5, total: 10, siblingCount: 0 })).toEqual([
      1,
      "ellipsis",
      5,
      "ellipsis",
      10,
    ]);
  });

  it("total=1 → 单页 [1]", () => {
    expect(getPaginationRange({ page: 1, total: 1 })).toEqual([1]);
  });

  it("total=0 → 空数组", () => {
    expect(getPaginationRange({ page: 1, total: 0 })).toEqual([]);
  });

  it("page 越界（过大）→ 夹紧到 total", () => {
    expect(getPaginationRange({ page: 999, total: 10 })).toEqual(
      getPaginationRange({ page: 10, total: 10 }),
    );
  });

  it("page 越界（过小/0/负）→ 夹紧到 1", () => {
    expect(getPaginationRange({ page: 0, total: 10 })).toEqual(
      getPaginationRange({ page: 1, total: 10 }),
    );
  });

  it("结果恒升序、无重复，首=1 尾=total", () => {
    for (const [page, total] of [
      [1, 1],
      [3, 9],
      [5, 20],
      [50, 100],
    ] as const) {
      const seq = getPaginationRange({ page, total });
      const nums = seq.filter((x): x is number => typeof x === "number");
      expect(nums[0]).toBe(1);
      expect(nums[nums.length - 1]).toBe(total);
      // 严格升序
      for (let i = 1; i < nums.length; i++) expect(nums[i]).toBeGreaterThan(nums[i - 1]);
      // 无重复
      expect(new Set(nums).size).toBe(nums.length);
    }
  });

  it("省略号两侧必为真实数字（不相邻、不在首尾）", () => {
    const seq = getPaginationRange({ page: 50, total: 100 });
    seq.forEach((x, i) => {
      if (x === "ellipsis") {
        expect(typeof seq[i - 1]).toBe("number");
        expect(typeof seq[i + 1]).toBe("number");
        // 省略号代表的隐藏页 >1（左右真实数字差 >2）
        expect((seq[i + 1] as number) - (seq[i - 1] as number)).toBeGreaterThan(2);
      }
    });
  });
});
