import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MathText } from "./math-text";
import { mathToPlain, parseMath } from "./math-text.parse";

describe("parseMath", () => {
  it("解析分数", () => {
    expect(parseMath("\\frac{3}{8}")).toEqual([
      { kind: "frac", num: [{ kind: "text", text: "3" }], den: [{ kind: "text", text: "8" }] },
    ]);
  });

  it("分数可嵌套在正文中间", () => {
    const nodes = parseMath("将\\frac{3}{8}化成小数");
    expect(nodes.map((n) => n.kind)).toEqual(["text", "frac", "text"]);
  });

  it("上标支持 {} 组与紧跟单字符两种写法", () => {
    expect(parseMath("x^{2}")).toEqual(parseMath("x^2"));
  });

  it("连续下划线是填空槽，单下划线是下标", () => {
    expect(parseMath("____")).toEqual([{ kind: "blank", length: 4 }]);
    expect(parseMath("a_1")).toEqual([
      { kind: "text", text: "a" },
      { kind: "sub", children: [{ kind: "text", text: "1" }] },
    ]);
  });

  it("根号可带根指数", () => {
    const [node] = parseMath("\\sqrt[3]{8}");
    expect(node.kind).toBe("sqrt");
  });

  it("不认识的反斜杠记号按字面保留，不吞内容", () => {
    expect(mathToPlain("\\alpha+1")).toBe("\\alpha+1");
  });

  it("残缺的 \\frac 不会让整段消失", () => {
    expect(mathToPlain("\\frac{3}")).toBe("\\frac{3}");
  });
});

describe("mathToPlain", () => {
  it("还原成可检索的朴素文本", () => {
    expect(mathToPlain("将\\frac{3}{8}化成小数,x^{2}+a_1=____")).toBe("将3/8化成小数,x^2+a_1=____");
  });
});

describe("MathText 渲染", () => {
  it("分数的分子分母都出现在 DOM 里", () => {
    render(<MathText>{"\\frac{16}{9}"}</MathText>);
    expect(screen.getByText("16")).toBeTruthy();
    expect(screen.getByText("9")).toBeTruthy();
  });

  it("填空槽渲染为可访问的空位而不是一串下划线字符", () => {
    const { container } = render(<MathText>{"可记作____万元"}</MathText>);
    expect(screen.getByLabelText("填空")).toBeTruthy();
    expect(container.textContent).not.toContain("____");
  });
});
