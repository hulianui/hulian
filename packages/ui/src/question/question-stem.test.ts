import { describe, expect, it } from "vitest";
import cases from "./stem-figures.contract.json";
import { splitStemFigures, stemFigureKeys, stripStemFigures } from "./question-stem";

describe("question-stem · stem-figures.contract.json", () => {
  for (const c of cases) {
    it(c.name, () => {
      expect(splitStemFigures(c.source)).toEqual({ text: c.text, figures: c.figures });
    });
  }
});

describe("question-stem · accept 过滤", () => {
  const stem = "甲 ![](question-image/1.png) 乙 ![](import/formula/x.png)";
  it("只取某一类前缀，其它图留在正文里", () => {
    const accept = (key: string) => key.startsWith("question-image/");
    expect(stemFigureKeys(stem, accept)).toEqual(["question-image/1.png"]);
    expect(stripStemFigures(stem, accept)).toBe("甲 乙 ![](import/formula/x.png)");
  });
  it("正则每次新建：连续两次调用结果一致（/g 的 lastIndex 不泄漏）", () => {
    expect(stemFigureKeys(stem)).toEqual(stemFigureKeys(stem));
  });
});
