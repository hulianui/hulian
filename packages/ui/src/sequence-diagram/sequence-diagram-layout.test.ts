import { describe, expect, it } from "vitest";
import {
  analyzeSequence,
  layoutSequence,
  validateSequence,
  type SequenceMessageRow,
} from "./sequence-diagram-layout";

const people = [
  { id: "a", label: "甲" },
  { id: "b", label: "乙" },
  { id: "c", label: "丙" },
];

function messageRows(rows: ReturnType<typeof layoutSequence>) {
  return rows.filter((r): r is SequenceMessageRow => r.type === "message");
}

describe("layoutSequence", () => {
  it("向右的消息从起点列开始，跨到终点列", () => {
    const [row] = layoutSequence(people, [{ id: "m", from: "a", to: "c", label: "x" }]);
    expect(row).toMatchObject({ type: "message", start: 0, span: 3, direction: "right", kind: "sync", number: 1 });
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

  it("行序严格等于数组顺序，消息与注释混排也不重排", () => {
    const rows = layoutSequence(people, [
      { id: "3", from: "c", to: "a", label: "x" },
      { id: "n", type: "note", over: "b", label: "注" },
      { id: "1", from: "a", to: "b", label: "x" },
    ]);
    expect(rows.map((r) => (r.type === "note" ? r.note.id : r.message.id))).toEqual(["3", "n", "1"]);
  });

  it("注释贴一条生命线，或横跨两条（顺序无关）", () => {
    const [one, two, same] = layoutSequence(people, [
      { id: "n1", type: "note", over: "b", label: "x" },
      { id: "n2", type: "note", over: ["c", "a"], label: "x" },
      { id: "n3", type: "note", over: ["b", "b"], label: "x" },
    ]);
    expect(one).toMatchObject({ type: "note", targets: [1], start: 1, span: 1 });
    expect(two).toMatchObject({ type: "note", targets: [0, 2], start: 0, span: 3 });
    expect(same).toMatchObject({ targets: [1], span: 1 });
  });

  it("注释不占序号", () => {
    const rows = messageRows(
      layoutSequence(people, [
        { id: "1", from: "a", to: "b", label: "x" },
        { id: "n", type: "note", over: "a", label: "x" },
        { id: "2", from: "b", to: "a", label: "x" },
      ]),
    );
    expect(rows.map((r) => r.number)).toEqual([1, 2]);
  });
});

describe("无效输入", () => {
  it("引用不存在参与者的消息被丢掉、记一条问题，序号保持连续", () => {
    const { rows, issues } = analyzeSequence(people, [
      { id: "1", from: "a", to: "b", label: "x" },
      { id: "2", from: "a", to: "ghost", label: "x" },
      { id: "3", from: "b", to: "a", label: "x" },
    ]);
    expect(messageRows(rows).map((r) => [r.message.id, r.number])).toEqual([
      ["1", 1],
      ["3", 2],
    ]);
    expect(issues).toEqual([{ code: "unknown-participant", index: 1, id: "2", ref: "ghost" }]);
  });

  it("注释引用不存在的参与者同样丢掉", () => {
    expect(validateSequence(people, [{ id: "n", type: "note", over: ["a", "zz"], label: "x" }])).toEqual([
      { code: "unknown-participant", index: 0, id: "n", ref: "zz" },
    ]);
  });

  it("参与者 id 重复时后者不成列，后面的列号不留空洞", () => {
    const { participants, rows, issues } = analyzeSequence(
      [people[0], { id: "a", label: "重复" }, people[1]],
      [{ id: "m", from: "b", to: "a", label: "x" }],
    );
    expect(participants.map((p) => p.label)).toEqual(["甲", "乙"]);
    expect(rows[0]).toMatchObject({ start: 0, span: 2, direction: "left" });
    expect(issues).toEqual([{ code: "duplicate-participant", index: 1, id: "a" }]);
  });

  it("消息 id 重复时只画第一条", () => {
    const { rows, issues } = analyzeSequence(people, [
      { id: "m", from: "a", to: "b", label: "第一条" },
      { id: "m", from: "b", to: "a", label: "第二条" },
    ]);
    expect(rows).toHaveLength(1);
    expect(issues).toEqual([{ code: "duplicate-item", index: 1, id: "m" }]);
  });

  it("数据全部有效时没有问题；空数据也没有问题", () => {
    expect(validateSequence(people, [{ id: "m", from: "a", to: "b", label: "x" }])).toEqual([]);
    expect(analyzeSequence([], [])).toEqual({ participants: [], rows: [], issues: [] });
  });
});
