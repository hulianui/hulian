import { describe, expect, it } from "vitest";
import { createCasComparator, stripMathDelimiters } from "./cas";
import { gradeObjective } from "../question/grade";

describe("stripMathDelimiters", () => {
  it.each([
    ["$\\frac{1}{2}$", "\\frac{1}{2}"],
    ["$$x^2$$", "x^2"],
    ["\\(a+b\\)", "a+b"],
    ["  2x+1  ", "2x+1"],
    ["x", "x"],
  ])("%s → %s", (input, expected) => {
    expect(stripMathDelimiters(input)).toBe(expected);
  });
});

describe("createCasComparator（Compute Engine 0.58 的实际行为，表驱动）", () => {
  it.each([
    ["\\frac{1}{2}", "0.5", true],
    ["2x+1", "1+2x", true],
    ["x^2", "x", false],
    ["\\sqrt{4}", "2", true],
    ["$\\frac{1}{2}$", "\\frac{2}{4}", true],
    ["\\frac{1}{", "0.5", false], // 解析失败 → false，不抛
    ["", "0", false],
  ])("%s ≡ %s → %s", async (a, b, expected) => {
    const equivalent = await createCasComparator();
    expect(equivalent(a, b)).toBe(expected);
  });

  it("同一进程复用同一个引擎实例（第二次不再 import）", async () => {
    const first = await createCasComparator();
    const second = await createCasComparator();
    expect(first("x+1", "1+x")).toBe(true);
    expect(second("x+1", "1+x")).toBe(true);
  });

  it("接进 gradeObjective 第 3 档：字面不等、归一不等、CAS 判等", async () => {
    const equivalent = await createCasComparator();
    const question = { type: "blank" as const, answer: [["\\frac{1}{2}"]], score: 5 };
    expect(gradeObjective(question, ["0.5"]).correct).toBe(false);
    expect(gradeObjective(question, ["0.5"], { equivalent }).correct).toBe(true);
    expect(gradeObjective(question, ["0.5"], { equivalent }).score).toBe(5);
  });
});
