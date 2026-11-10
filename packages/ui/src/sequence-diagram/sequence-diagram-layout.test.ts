import { describe, expect, it } from "vitest";
import { layoutSequence } from "./sequence-diagram-layout";

const people = [
  { id: "a", label: "甲" },
  { id: "b", label: "乙" },
  { id: "c", label: "丙" },
];

describe("layoutSequence", () => {
  it("向右的消息从起点列开始，跨到终点列", () => {
    const [row] = layoutSequence(people, [{ id: "m", from: "a", to: "c", label: "x" }]);
    expect(row).toMatchObject({ start: 0, span: 3, direction: "right", kind: "sync", number: 1 });
  });

  it("向左的消息从较小的列开始", () => {
    const [row] = layoutSequence(people, [{ id: "m", from: "c", to: "b", label: "x", kind: "reply" }]);
    expect(row).toMatchObject({ start: 1, span: 2, direction: "left", kind: "reply" });
  });

  it("自调用借右边一列放文案；最右一列只能占自己", () => {
    const [mid] = layoutSequence(people, [{ id: "m", from: "b", to: "b", label: "x" }]);
    expect(mid).toMatchObject({ start: 1, span: 2, direction: "self" });
    const [edge] = layoutSequence(people, [{ id: "m", from: "c", to: "c", label: "x" }]);
    expect(edge).toMatchObject({ start: 2, span: 1, direction: "self" });
  });

  it("丢掉引用了不存在参与者的消息，序号保持连续", () => {
    const rows = layoutSequence(people, [
      { id: "1", from: "a", to: "b", label: "x" },
      { id: "2", from: "a", to: "ghost", label: "x" },
      { id: "3", from: "b", to: "a", label: "x" },
    ]);
    expect(rows.map((r) => [r.message.id, r.number])).toEqual([
      ["1", 1],
      ["3", 2],
    ]);
  });

  it("参与者 id 重复时取第一次出现的列", () => {
    const [row] = layoutSequence([...people, { id: "a", label: "重复" }], [
      { id: "m", from: "c", to: "a", label: "x" },
    ]);
    expect(row.start).toBe(0);
  });
});
