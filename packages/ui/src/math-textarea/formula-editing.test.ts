import { describe, expect, it } from "vitest";
import { splitMathSegments } from "../math/math.parse";
import {
  applyFormulaTemplate,
  FORMULA_TEMPLATE_GROUPS,
  isInsideMath,
  mathSpans,
  textPosition,
  validateFormulaSyntax,
  wrapSelectionInMath,
} from "./formula-editing";

describe("mathSpans", () => {
  it("给出每个闭合 $…$ / $$…$$ 段在整串里的位置", () => {
    expect(mathSpans("已知 $x$ 与 $$y$$")).toEqual([
      { start: 3, end: 6, contentStart: 4, content: "x", display: false },
      { start: 9, end: 14, contentStart: 11, content: "y", display: true },
    ]);
  });

  it("转义的 \\$ 不参与配对；未闭合的开分隔符不算段", () => {
    expect(mathSpans("售价 \\$5 元")).toEqual([]);
    expect(mathSpans("定价 $100 元")).toEqual([]);
  });
});

describe("isInsideMath", () => {
  it.each([
    ["公式外", "已知 $x$ 求解", 2, false],
    ["公式内", "已知 $x$ 求解", 4, true],
    ["闭合符之前仍在公式内", "已知 $x$ 求解", 5, true],
    ["闭合之后", "已知 $x$ 求解", 9, false],
    ["块级公式内", "$$x + y$$", 4, true],
    ["块级公式后", "$$x$$ 后面", 6, false],
    ["转义美元不参与配对", "售价 \\$5 元", 8, false],
    ["未闭合的 $ 之后一律算公式内", "$x + ", 5, true],
    ["空串", "", 0, false],
  ])("%s", (_name, text, caret, expected) => {
    expect(isInsideMath(text, caret)).toBe(expected);
  });
});

describe("applyFormulaTemplate", () => {
  it("没选中：插入模板并把光标放进第一个空槽", () => {
    const r = applyFormulaTemplate({
      text: "已知 ",
      selectionStart: 3,
      selectionEnd: 3,
      latex: "\\frac{}{}",
      wrapInMath: true,
    });
    expect(r.text).toBe("已知 $\\frac{}{}$");
    expect(r.text.slice(r.caret)).toBe("}{}$");
  });

  it("有选中：选中的内容进第一个空槽，光标跳到分母", () => {
    const r = applyFormulaTemplate({
      text: "求 x 的值",
      selectionStart: 2,
      selectionEnd: 3,
      latex: "\\frac{}{}",
      wrapInMath: true,
    });
    expect(r.text).toBe("求 $\\frac{x}{}$ 的值");
    expect(r.text.slice(r.caret)).toBe("}$ 的值");
  });

  it("已经在公式里就不再套一层 $：结果仍是一段公式", () => {
    const r = applyFormulaTemplate({
      text: "$x + $",
      selectionStart: 5,
      selectionEnd: 5,
      latex: "\\sqrt{}",
      wrapInMath: false,
    });
    expect(r.text).toBe("$x + \\sqrt{}$");
    expect(splitMathSegments(r.text).filter((s) => s.type === "math")).toHaveLength(1);
  });

  it("没有落点的符号模板：选中内容留在前面，光标落在符号之后", () => {
    const r = applyFormulaTemplate({
      text: "a b",
      selectionStart: 0,
      selectionEnd: 1,
      latex: "\\leq ",
      wrapInMath: true,
    });
    expect(r.text).toBe("$a\\leq $ b");
    expect(r.caret).toBe(r.text.indexOf("$ b"));
  });

  it("n 次根的方括号也是落点", () => {
    const r = applyFormulaTemplate({
      text: "",
      selectionStart: 0,
      selectionEnd: 0,
      latex: "\\sqrt[]{}",
      wrapInMath: true,
    });
    expect(r.text).toBe("$\\sqrt[]{}$");
    expect(r.text.slice(r.caret)).toBe("]{}$");
  });

  it("集合模板里的 \\{ 不会被当成落点", () => {
    const r = applyFormulaTemplate({
      text: "",
      selectionStart: 0,
      selectionEnd: 0,
      latex: "\\{  \\}",
      wrapInMath: true,
    });
    expect(r.text).toBe("$\\{  \\}$");
  });

  it("选区越界会被夹回文本范围", () => {
    const r = applyFormulaTemplate({
      text: "ab",
      selectionStart: -3,
      selectionEnd: 99,
      latex: "\\pi ",
      wrapInMath: true,
    });
    expect(r.text).toBe("$ab\\pi $");
  });

  it("每个内置模板插进空输入框后都是一段合法的、可被切出来的公式", () => {
    for (const group of FORMULA_TEMPLATE_GROUPS) {
      for (const template of group.items) {
        const r = applyFormulaTemplate({
          text: "",
          selectionStart: 0,
          selectionEnd: 0,
          latex: template.latex,
          wrapInMath: true,
        });
        expect(validateFormulaSyntax(r.text), `${group.id}/${template.id}`).toBeNull();
        expect(
          splitMathSegments(r.text).filter((s) => s.type === "math"),
          `${group.id}/${template.id}`,
        ).toHaveLength(1);
      }
    }
  });

  it("内置模板 id 全局唯一（Locale 表按 id 查名字）", () => {
    const ids = FORMULA_TEMPLATE_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("wrapSelectionInMath", () => {
  it("把选中的内容框成行内公式，光标落在闭合符之前", () => {
    const r = wrapSelectionInMath({
      text: "求 x+1 的值",
      selectionStart: 2,
      selectionEnd: 5,
      display: false,
    });
    expect(r.text).toBe("求 $x+1$ 的值");
    expect(r.text.slice(r.caret)).toBe("$ 的值");
  });

  it("块级用 $$", () => {
    const r = wrapSelectionInMath({ text: "x", selectionStart: 0, selectionEnd: 1, display: true });
    expect(r.text).toBe("$$x$$");
    expect(r.caret).toBe(3);
  });
});

describe("validateFormulaSyntax", () => {
  it.each([
    ["纯文本", "两点之间线段最短。"],
    ["闭合的行内公式", "已知 $x^{2}$ 求解"],
    ["闭合的块级公式", "$$\\frac{a}{b}$$"],
    ["中文与多段公式混排", "当 $a>0$ 时，$\\sqrt{a}$ 有意义"],
    ["转义的美元与花括号", "售价 \\$5，集合 $\\{1,2\\}$"],
    ["空串（题干为空由别的校验管）", ""],
  ])("%s：不报错", (_name, text) => {
    expect(validateFormulaSyntax(text)).toBeNull();
  });

  it("未闭合的 $ 报出位置与行列", () => {
    expect(validateFormulaSyntax("第一行\n定价 $100 元")).toEqual({
      code: "unclosed-math",
      index: 7,
      line: 2,
      column: 4,
    });
  });

  it("花括号少一个右括号：指向最里层没闭合的那个 {", () => {
    expect(validateFormulaSyntax("$\\frac{a}{b$")).toEqual({
      code: "unclosed-brace",
      index: 9,
      line: 1,
      column: 10,
    });
  });

  it("多一个右花括号", () => {
    expect(validateFormulaSyntax("$x}$")).toEqual({
      code: "unmatched-close-brace",
      index: 2,
      line: 1,
      column: 3,
    });
  });
});

describe("textPosition", () => {
  it("行列都从 1 数；列是该行内第几个字符", () => {
    expect(textPosition("ab\ncd", 0)).toEqual({ line: 1, column: 1 });
    expect(textPosition("ab\ncd", 3)).toEqual({ line: 2, column: 1 });
    expect(textPosition("ab\ncd", 4)).toEqual({ line: 2, column: 2 });
  });
});
