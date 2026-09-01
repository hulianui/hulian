import { describe, expect, it } from "vitest";
import * as math from "../math";

describe("@hulianui/ui/math 导出题目域公开件", () => {
  it("纯函数与常量齐全", () => {
    const names = [
      "QUESTION_TYPES",
      "SUBJECTIVE_TYPES",
      "DEFAULT_SCORE_BY_TYPE",
      "isSubjective",
      "optionKey",
      "defaultShape",
      "emptyQuestion",
      "normalizeOptions",
      "blankCount",
      "validateQuestion",
      "splitStemFigures",
      "stemFigureKeys",
      "stripStemFigures",
      "encodeBlanks",
      "decodeBlanks",
      "toWireAnswer",
      "fromWire",
      "answerLines",
      "answerText",
      "gradeObjective",
      "canonicalAnswer",
      "parseNumeric",
    ] as const;
    for (const n of names) expect(math, n).toHaveProperty(n);
  });
  it("主 barrel 不导出题目域（不排数学的消费者不付 KaTeX 体积）", async () => {
    const main = await import("../index");
    expect(main).not.toHaveProperty("gradeObjective");
    expect(main).not.toHaveProperty("QuestionCard");
    // 整包导入主 barrel（400 件）单跑约 6s，全量测试并行时曾超过默认 15s；放宽到 60s，
    // 这条测的是「不导出」这一事实，不是速度。
  }, 60_000);
});
