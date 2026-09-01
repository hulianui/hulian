import { describe, expect, it } from "vitest";
import * as rootEntry from "../index";
import * as mathEntry from "../math";

describe("question-editor 导出面", () => {
  it("从 @hulianui/ui/math 可达", () => {
    for (const name of [
      "QuestionEditor",
      "QUESTION_EDITOR_LOCALE_ZH",
      "QUESTION_EDITOR_LOCALE_EN",
      "questionFormulaIssues",
      "shapeIsDirty",
      "switchType",
      "optionCaption",
      "stemBody",
      "joinStemFigures",
    ]) {
      expect((mathEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("主 barrel 一个都不带（KaTeX 不进 @hulianui/ui）", () => {
    expect((rootEntry as Record<string, unknown>).QuestionEditor).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).questionFormulaIssues).toBeUndefined();
  });
});
