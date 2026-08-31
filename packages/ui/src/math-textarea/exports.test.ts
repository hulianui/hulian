import { describe, expect, it } from "vitest";
import * as mathEntry from "../math";
import * as rootEntry from "../index";

describe("math-textarea 导出面", () => {
  it("从 @hulianui/ui/math 可达", () => {
    for (const name of [
      "MathTextarea",
      "FORMULA_TEMPLATE_GROUPS",
      "applyFormulaTemplate",
      "wrapSelectionInMath",
      "isInsideMath",
      "mathSpans",
      "validateFormulaSyntax",
      "textPosition",
      "katexErrorAt",
      "MATH_TEXTAREA_LOCALE_ZH",
      "MATH_TEXTAREA_LOCALE_EN",
    ]) {
      expect((mathEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("主 barrel 一个都不带（KaTeX 不进 @hulianui/ui）", () => {
    expect((rootEntry as Record<string, unknown>).MathTextarea).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).katexErrorAt).toBeUndefined();
  });
});
