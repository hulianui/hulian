import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionStemBlock } from "./question-stem-block";

describe("QuestionStemBlock", () => {
  it("resolveFigure 给了：切图渲染成 img，正文不再含图片语法，alt 走 figureAlt", () => {
    const { container } = render(
      <QuestionStemBlock
        stem={"如图，$AB \\parallel CD$。\n\n![](import/a.png)\n![](import/b.png)"}
        resolveFigure={(key) => `/files/${key}`}
        figureAlt={(i) => `Figure ${i}`}
      />,
    );
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual(["/files/import/a.png", "/files/import/b.png"]);
    expect(imgs.map((img) => img.getAttribute("alt"))).toEqual(["Figure 1", "Figure 2"]);
    expect(container.textContent).not.toContain("![](");
  });

  it("resolveFigure 不给：题干原样交给排版，没有 img", () => {
    const { container } = render(<QuestionStemBlock stem={"看图 ![](import/a.png)"} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("引用自带 alt 时用它，没写才回落到 figureAlt 编号", () => {
    const { container } = render(
      <QuestionStemBlock
        stem={"![7x+5<5x+1](import/formula/f1.png)\n![](import/b.png)"}
        resolveFigure={(key) => `/files/${key}`}
        figureAlt={(i) => `Figure ${i}`}
      />,
    );
    expect(Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("alt"))).toEqual([
      "7x+5<5x+1",
      "Figure 2",
    ]);
  });

  it("macros 透传给正文的 Formula", () => {
    const { container } = render(
      <QuestionStemBlock stem={"$\\RR$"} macros={{ "\\RR": "\\mathbb{R}" }} />,
    );
    // 宏没接上时 KaTeX 会把 \RR 当未定义命令标红——先证探针是灵的，再证宏确实接上了
    // 探针两头都验：宏接上了才排出 \mathbb{R}（KaTeX 的 .mathbb 类），没接上只有未定义命令的原样文本。
    // 不比 textContent：KaTeX 的 MathML 注解里混着原始 LaTeX，两种情况都含 `\RR`。
    const bare = render(<QuestionStemBlock stem={"$\\RR$"} />);
    expect(bare.container.querySelector(".mathbb")).toBeNull();
    expect(container.querySelector(".mathbb")).toBeTruthy();
  });

  it("figureAlt 缺省是中文「题目附图 N」（QuestionCard 旧行为）", () => {
    const { container } = render(
      <QuestionStemBlock stem={"![](import/a.png)"} resolveFigure={(key) => `/files/${key}`} />,
    );
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("题目附图 1");
  });
});
