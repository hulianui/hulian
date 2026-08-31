import { describe, expect, it } from "vitest";
import { decodeBlanks, encodeBlanks, fromWire, toWireAnswer } from "./question-wire";

describe("question-wire · blanks", () => {
  it("单空交字符串，多空交数组", () => {
    expect(encodeBlanks(["90"])).toBe("90");
    expect(encodeBlanks(["150", "30"])).toEqual(["150", "30"]);
  });
  it("decode：单空不解析 JSON（区间 [1,2] 是合法单空答案）", () => {
    expect(decodeBlanks("[1,2]", 1)).toEqual(["[1,2]"]);
  });
  it("decode：多空解析 JSON 数组并补齐空位", () => {
    expect(decodeBlanks('["150","30"]', 3)).toEqual(["150", "30", ""]);
  });
  it("decode：不是 JSON 回落整串进第一个空", () => {
    expect(decodeBlanks("150,30", 2)).toEqual(["150,30", ""]);
    expect(decodeBlanks(null, 2)).toEqual(["", ""]);
  });
});

describe("question-wire · toWireAnswer", () => {
  it("填空单空且为单写法时压回字符串；多写法或多空保持数组", () => {
    expect(toWireAnswer({ type: "blank", answer: ["90"] })).toBe("90");
    expect(toWireAnswer({ type: "blank", answer: [["90", "90°"]] })).toEqual([["90", "90°"]]);
    expect(toWireAnswer({ type: "blank", answer: ["1", "2"] })).toEqual(["1", "2"]);
  });
  it("其余题型原样", () => {
    expect(toWireAnswer({ type: "single", answer: "A" })).toBe("A");
    expect(toWireAnswer({ type: "judge", answer: false })).toBe(false);
  });
});

describe("question-wire · fromWire", () => {
  it("字符串形 options 归一；多选 'A,C' 串拆数组", () => {
    expect(fromWire({ type: "multiple", options: ["A. 甲", "B. 乙", "C. 丙"], answer: "A,C" })).toEqual({
      type: "multiple",
      options: [
        { key: "A", text: "甲" },
        { key: "B", text: "乙" },
        { key: "C", text: "丙" },
      ],
      answer: ["A", "C"],
    });
  });
  it("判断 'true'/'false' 串归一成布尔；认不出保留原值", () => {
    expect(fromWire({ type: "judge", answer: "true" }).answer).toBe(true);
    expect(fromWire({ type: "judge", answer: "错误" }).answer).toBe(false);
    expect(fromWire({ type: "judge", answer: "说不清" }).answer).toBe("说不清");
  });
  it("填空字符串包成一项数组；非选择题 options 归 null", () => {
    expect(fromWire({ type: "blank", answer: "7", options: null })).toEqual({
      type: "blank",
      options: null,
      answer: ["7"],
    });
  });
  it("主观题 undefined 答案归 null；Rubric 原样", () => {
    expect(fromWire({ type: "essay" }).answer).toBeNull();
    const rubric = { reference: "x=3", rubric: [{ point: "列式", score: 2 }] };
    expect(fromWire({ type: "calculation", answer: rubric }).answer).toEqual(rubric);
  });
});
