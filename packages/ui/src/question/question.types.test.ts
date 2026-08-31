import { describe, expect, it } from "vitest";
import { QUESTION_TYPES, type Question, type QuestionType } from "./question.types";

describe("question.types", () => {
  it("QUESTION_TYPES 与消费方 QuestionType 枚举顺序逐字一致", () => {
    expect(QUESTION_TYPES).toEqual([
      "single",
      "multiple",
      "judge",
      "blank",
      "short_answer",
      "calculation",
      "essay",
    ]);
  });

  it("Question 的 answer 联合覆盖七型全部形状（编译期断言）", () => {
    const samples: Record<QuestionType, Question["answer"]> = {
      single: "C",
      multiple: ["B", "C"],
      judge: true,
      blank: [["150", "150°"], "30"],
      short_answer: "要点",
      calculation: { reference: "x=3", rubric: [{ point: "列式", score: 2 }] },
      essay: null,
    };
    expect(Object.keys(samples)).toHaveLength(7);
  });
});
