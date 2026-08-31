import { describe, expect, it } from "vitest";
import { enUS } from "../config/locale";
import { answerLines, answerText } from "./answer-format";

describe("answer-format · 按形状分派（不按题型）", () => {
  it("空值给占位", () => {
    expect(answerLines(null)).toEqual(["—"]);
    expect(answerLines("")).toEqual(["—"]);
  });
  it("布尔渲染成正确 / 错误", () => {
    expect(answerText(true)).toBe("正确");
    expect(answerText(false)).toBe("错误");
  });
  it("字符串 / 数字原样", () => {
    expect(answerText("C")).toBe("C");
    expect(answerText(7)).toBe("7");
  });
  it("一维数组：blank 走逐空；其余（多选）用顿号", () => {
    expect(answerText(["B", "C"], "multiple")).toBe("B、C");
    expect(answerText(["B", "C"])).toBe("B、C");
    expect(answerText(["150", "30"], "blank")).toBe("第1空：150；第2空：30");
  });
  it("二维数组不传题型也按逐空；等价写法用斜杠", () => {
    expect(answerText([["150", "150°"], ["30", "30°"]])).toBe("第1空：150 / 150°；第2空：30 / 30°");
  });
  it("单空不标空号", () => {
    expect(answerText(["90"], "blank")).toBe("90");
    expect(answerText([["90", "90°"]], "blank")).toBe("90 / 90°");
  });
  it("Rubric 拆成参考答案 + 逐条得分点", () => {
    expect(
      answerLines({ reference: "x=3", rubric: [{ point: "列式", score: 2 }, { point: "求解" }] }),
    ).toEqual(["x=3", "分步给分：", "· 列式（2 分）", "· 求解"]);
    expect(answerLines({ reference: "", rubric: [] })).toEqual(["见分步给分"]);
  });
  it("未知对象形状印 JSON 字面量（能看出坏在哪）", () => {
    expect(answerLines({ foo: 1 })).toEqual(['{"foo":1}']);
  });
  it("labels 可换成英文", () => {
    const en = enUS.components!.question!;
    expect(answerText(true, undefined, en)).toBe("True");
    expect(answerText(["150", "30"], "blank", en)).toBe("Blank 1: 150; Blank 2: 30");
  });
});
