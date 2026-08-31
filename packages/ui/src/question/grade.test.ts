import { describe, expect, it } from "vitest";
import contract from "./grade.contract.json";
import { canonicalAnswer, gradeObjective, parseNumeric, type GradeOptions } from "./grade";
import type { Question, StudentAnswer } from "./question.types";

describe("grade · grade.contract.json", () => {
  for (const c of contract.cases) {
    it(`[L${c.level}] ${c.type} ${JSON.stringify(c.answer)} vs ${JSON.stringify(c.student)}${c.note ? ` · ${c.note}` : ""}`, () => {
      const q = { type: c.type, answer: c.answer, score: contract.fullScore } as Pick<Question, "type" | "answer" | "score">;
      const r = gradeObjective(q, c.student as StudentAnswer | boolean | null, (c as { options?: GradeOptions }).options);
      expect(r.correct).toBe(c.correct);
      expect(r.score).toBe(c.correct === true ? contract.fullScore : 0);
    });
  }
});

describe("grade · 第 3 档 equivalent 注入", () => {
  it("第 1、2 档不等时才调比较器，比较器说等价即对", () => {
    const calls: [string, string][] = [];
    const equivalent = (a: string, b: string) => {
      calls.push([a, b]);
      return a === "x+1" && b === "1+x";
    };
    const q = { type: "blank", answer: "x+1", score: 4 } as const;
    expect(gradeObjective(q, "1+x", { equivalent })).toEqual({ correct: true, score: 4 });
    expect(calls).toEqual([["x+1", "1+x"]]);
    calls.length = 0;
    expect(gradeObjective(q, "x+1", { equivalent }).correct).toBe(true);
    expect(calls).toEqual([]); // 第 1 档已相等，不调
  });
  it("比较器抛错按不等价处理，不炸调用方", () => {
    const q = { type: "blank", answer: "x", score: 4 } as const;
    expect(
      gradeObjective(q, "y", {
        equivalent: () => {
          throw new Error("parse");
        },
      }).correct,
    ).toBe(false);
  });
});

describe("grade · canonicalAnswer", () => {
  it("七步归一", () => {
    expect(canonicalAnswer("![-8](import/formula/ab12.png)")).toBe("-8");
    expect(canonicalAnswer("（1）")).toBe("(1)");
    expect(canonicalAnswer("x²")).toBe("X^2");
    expect(canonicalAnswer("$\\sqrt{3}$")).toBe("\\SQRT3");
    expect(canonicalAnswer("A B")).toBe("AB");
    // 数字之间留哨兵：写法差异抹平，但 `1、2` 不许变成 `12`
    expect(canonicalAnswer("1、2")).toBe("1\x1f2");
    expect(canonicalAnswer("1，2")).toBe("1\x1f2");
    expect(canonicalAnswer("1、2")).not.toBe(canonicalAnswer("12"));
    expect(canonicalAnswer("\\{a\\}")).toBe("\\{A\\}");
  });
});

describe("grade · parseNumeric", () => {
  it("十进制 / 分式 / 百分数 / 度数 / 负数；其余 null", () => {
    expect(parseNumeric("3.14")).toBe(3.14);
    expect(parseNumeric("-2")).toBe(-2);
    expect(parseNumeric("\\frac{1}{2}")).toBe(0.5);
    expect(parseNumeric("-\\frac{3}{4}")).toBe(-0.75);
    expect(parseNumeric("50%")).toBe(0.5);
    expect(parseNumeric("150°")).toBe(150);
    expect(parseNumeric("150^\\circ")).toBe(150);
    expect(parseNumeric("$0.5$")).toBe(0.5);
    expect(parseNumeric("x")).toBeNull();
    expect(parseNumeric("")).toBeNull();
  });
});
