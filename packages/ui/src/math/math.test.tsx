import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Formula } from "./math";
import { formulaToPlain } from "./math.parse";

describe("Formula", () => {
  it("默认 mixed：只有分隔符内被排版，外面原样输出", () => {
    const { container } = render(<Formula>{"已知 $x^{2}$ 求解"}</Formula>);
    expect(container.querySelectorAll(".katex")).toHaveLength(1);
    expect(container.textContent).toContain("已知");
    expect(container.textContent).toContain("求解");
  });

  it("\\begin{cases} 排成真正的二维结构，而不是拍平成一行", () => {
    const { container } = render(
      <Formula>{"$$f(x)=\\begin{cases} -x^{2}, & x<0 \\\\ e^{x}, & x \\geq 0 \\end{cases}$$"}</Formula>,
    );
    // MathML 里出现 mtable = 行列结构真的建起来了。这是本组件相对 MathText 的全部意义所在：
    // MathText 会把同一段拍平成一行、\\ 变分号，分段函数的题干就读不懂了。
    expect(container.querySelector("math mtable")).not.toBeNull();
    expect(container.querySelectorAll("math mtable mtr").length).toBeGreaterThanOrEqual(2);
    // & 是对齐制表符，不该作为字面字符露在页面上。
    // 只能对 .katex-html（可见的那半）断言 —— container.textContent 里必然带着原始 LaTeX，
    // 因为 KaTeX 会把源码原样塞进 MathML 的 <annotation>（读屏/复制用）。
    expect(container.querySelector(".katex-html")?.textContent).not.toContain("&");
  });

  it("块级由分隔符决定：$$ 出 katex-display，$ 不出", () => {
    const { container: block } = render(<Formula>{"$$x$$"}</Formula>);
    expect(block.querySelector(".katex-display")).not.toBeNull();
    const { container: inline } = render(<Formula>{"$x$"}</Formula>);
    expect(inline.querySelector(".katex-display")).toBeNull();
  });

  it("mode=math 整串当 LaTeX，不需要包分隔符；display 只在这一档生效", () => {
    const { container } = render(
      <Formula mode="math" display>
        {"\\sum_{i=1}^{n} i"}
      </Formula>,
    );
    expect(container.querySelector(".katex-display")).not.toBeNull();
    // mixed 下 display 被忽略：行内段仍是行内
    const { container: mixed } = render(
      <Formula display>{"$x$"}</Formula>,
    );
    expect(mixed.querySelector(".katex-display")).toBeNull();
  });

  it("认不出的控制序列就地标红、原样露出，其余部分照常排版", () => {
    // 行分隔符被吃掉一个反斜杠的真实坏数据：`\\y` 成了未定义控制序列
    const { container } = render(
      <Formula mode="math">{"\\begin{cases}x=my\\y^2=6x\\end{cases}"}</Formula>,
    );
    expect(container.innerHTML).toContain("--color-danger");
    expect(container.querySelector(".katex-html")?.textContent).toContain("\\y");
    // 局部出错不拆掉整棵树：方程组的二维结构仍在
    expect(container.querySelector("math mtable")).not.toBeNull();
  });

  it("整体解析失败时红色显示整条原文，不抛异常也不吐空白", () => {
    const { container } = render(<Formula mode="math">{"\\frac{3"}</Formula>);
    expect(container.querySelector(".katex-error")).not.toBeNull();
    expect(container.textContent).toContain("\\frac{3");
  });

  it("落单的 $ 不会把后半段吞成公式", () => {
    const { container } = render(<Formula>{"定价 $100 元"}</Formula>);
    expect(container.querySelector(".katex")).toBeNull();
    expect(container.textContent).toBe("定价 $100 元");
  });

  it("不改调用方传进来的 macros 对象", () => {
    // KaTeX 把 macros 当可变宏表用，\def 会被写回去。没有那层浅拷贝，
    // 一道题里的 \def 就会漏到后面所有公式上。
    const macros = { "\\RR": "\\mathbb{R}" };
    render(<Formula mode="math" macros={macros}>{"\\def\\zz{1}\\zz \\in \\RR"}</Formula>);
    expect(Object.keys(macros)).toEqual(["\\RR"]);
  });
});

describe("formulaToPlain", () => {
  it("分隔符不进结果，公式转成可检索的朴素文本", () => {
    expect(formulaToPlain("答案是 $\\frac{3}{8}$")).toBe("答案是 3/8");
  });

  it("没有分隔符的串整串按数学处理（对应 mode=math）", () => {
    expect(formulaToPlain("\\sqrt{2}")).toBe("√(2)");
  });

  it("二维环境被拍平 —— 检索够用，但别拿去做 OMML 导出的输入", () => {
    expect(formulaToPlain("$\\begin{cases}x=1\\\\y=2\\end{cases}$")).toBe("x=1；y=2");
  });
});
