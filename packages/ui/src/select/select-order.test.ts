import { describe, expect, it } from "vitest";
import { orderSelectedFirst } from "./select-order";

const list = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
  { value: "d", label: "D" },
];

describe("orderSelectedFirst (#328)", () => {
  it("按 value 数组排列已选项，未选项保持原始相对顺序", () => {
    expect(orderSelectedFirst(list, ["d", "b"]).map((item) => item.value)).toEqual([
      "d",
      "b",
      "a",
      "c",
    ]);
  });

  it("忽略 stale value，不制造候选项", () => {
    expect(orderSelectedFirst(list, ["ghost", "c"]).map((item) => item.value)).toEqual([
      "c",
      "a",
      "b",
      "d",
    ]);
  });

  it("不修改调用方数组", () => {
    const input = [...list];
    const before = [...input];
    orderSelectedFirst(input, ["b"]);
    expect(input).toEqual(before);
  });

  it("无选中值时返回保持输入顺序的新数组", () => {
    const result = orderSelectedFirst(list, []);
    expect(result.map((item) => item.value)).toEqual(["a", "b", "c", "d"]);
    expect(result).not.toBe(list);
  });

  it("Root items 采用已在各组内排序的 DOM 值顺序，不跨组全局置顶", () => {
    // 第一组 DOM 已变为 b,a，第二组保留 c,d；Root 数据必须同序，不能把第二组的 d 插到 a 前。
    expect(orderSelectedFirst(list, ["b", "a", "c", "d"]).map((item) => item.value)).toEqual([
      "b",
      "a",
      "c",
      "d",
    ]);
  });
});
