import { describe, expect, it } from "vitest";
import * as rootEntry from "../index";
import * as mathEntry from "../math";

describe("question-answer 导出面", () => {
  it("从 @hulianui/ui/math 可达", () => {
    for (const name of [
      "QuestionAnswer",
      "canSubmit",
      "answerKind",
      "resolveBlankCount",
      "QUESTION_ANSWER_LOCALE_ZH",
      "QUESTION_ANSWER_LOCALE_EN",
    ]) {
      expect((mathEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("主 barrel 一个都不带（KaTeX 不进 @hulianui/ui）", () => {
    expect((rootEntry as Record<string, unknown>).QuestionAnswer).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).canSubmit).toBeUndefined();
  });
});
