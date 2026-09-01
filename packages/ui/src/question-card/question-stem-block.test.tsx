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

  it("figureAlt 缺省是中文「题目附图 N」（QuestionCard 旧行为）", () => {
    const { container } = render(
      <QuestionStemBlock stem={"![](import/a.png)"} resolveFigure={(key) => `/files/${key}`} />,
    );
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("题目附图 1");
  });
});
