import { describe, expect, it } from "vitest";
import cases from "./stem-figures.contract.json";
import { splitStemFigures, stemFigureKeys, stemFigureRefs, stripStemFigures } from "./question-stem";

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

describe("question-stem · stemFigureRefs", () => {
  // 和 figurePattern 同住：alt 是同一刀切出来的东西，边界跟 key 的边界是同一批。
  const table: { name: string; stem: string; refs: { key: string; alt: string }[] }[] = [
    { name: "无 alt", stem: "![](a.png)", refs: [{ key: "a.png", alt: "" }] },
    { name: "有 alt", stem: "![几何图](a.png)", refs: [{ key: "a.png", alt: "几何图" }] },
    {
      // 行内公式图：alt 是下游要读的 LaTeX，key 里合法地带着 _ 与 ^
      name: "公式图的 alt 是 LaTeX",
      stem: "![7x+5<5x+1](import/formula/a_1^2.png)",
      refs: [{ key: "import/formula/a_1^2.png", alt: "7x+5<5x+1" }],
    },
    {
      name: "两处相邻，按出现顺序",
      stem: "![a](x.png)![b](y.png)",
      refs: [
        { key: "x.png", alt: "a" },
        { key: "y.png", alt: "b" },
      ],
    },
    { name: "未闭合不算引用", stem: "![](未闭合", refs: [] },
    { name: "链接不是图片", stem: "[链接](x.png)", refs: [] },
    { name: "key 里有空格不算引用", stem: "![](a b.png)", refs: [] },
  ];
  for (const c of table) {
    it(c.name, () => {
      expect(stemFigureRefs(c.stem)).toEqual(c.refs);
      // 与 stemFigureKeys 同源：两者永远切出同一组 key
      expect(stemFigureRefs(c.stem).map((ref) => ref.key)).toEqual(stemFigureKeys(c.stem));
    });
  }

  it("accept 与 stemFigureKeys 同一把尺子", () => {
    const stem = "甲 ![手工图](question-image/1.png) 乙 ![x+1](import/formula/x.png)";
    const accept = (key: string) => key.startsWith("question-image/");
    expect(stemFigureRefs(stem, accept)).toEqual([{ key: "question-image/1.png", alt: "手工图" }]);
    expect(stemFigureRefs(stem, accept).map((ref) => ref.key)).toEqual(stemFigureKeys(stem, accept));
  });

  it("正则每次新建：连续两次调用结果一致（/g 的 lastIndex 不泄漏）", () => {
    const stem = "![a](x.png) ![b](y.png)";
    expect(stemFigureRefs(stem)).toEqual(stemFigureRefs(stem));
  });
});
