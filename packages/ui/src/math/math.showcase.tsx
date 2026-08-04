"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Formula } from "./math";

export const mathShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "分段函数",
      description:
        "高中函数题的主力题型。MathText 会把它拍平成一行、行分隔符变成分号，题干就读不懂了；这里是真正的二维排版。",
      code: `<Formula>{"$$f(x)=\\\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\\\\\ e^{x}+\\\\ln(x+1), & x \\\\geq 0 \\\\end{cases}$$"}</Formula>`,
      render: () => (
        <Formula>
          {
            "$$f(x)=\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\ e^{x}+\\ln(x+1), & x \\geq 0 \\end{cases}$$"
          }
        </Formula>
      ),
    },
    {
      title: "中文与公式混排",
      description:
        "默认只排版分隔符里的内容，分隔符外原样输出 —— 边界由上游数据显式携带，渲染层不猜。",
      code: `<Formula>{"已知函数 $f(x)=x^{2}$ 在区间上单调递增，求 $f(1)$ 的值。"}</Formula>`,
      render: () => (
        <p className="text-base leading-8">
          <Formula>
            {"已知函数 $f(x)=x^{2}$ 在区间上单调递增，求 $f(1)$ 的值。"}
          </Formula>
        </p>
      ),
    },
    {
      title: "大型定界符",
      description: "括号高度跟着内容长 —— MathText 只能丢掉命令、留一个定高括号。",
      code: `<Formula mode="math" display>{"\\\\left( \\\\frac{a+b}{c} \\\\right)^{n}"}</Formula>`,
      render: () => (
        <Formula mode="math" display>
          {"\\left( \\frac{a+b}{c} \\right)^{n} = \\left[ \\sum_{i=1}^{n} x_i \\right]"}
        </Formula>
      ),
    },
    {
      title: "求和 / 积分 / 极限",
      description: "块级排版下，上下限落在符号的正上下方，而不是挤成角标。",
      code: `<Formula mode="math" display>{"\\\\int_{0}^{1} x^{2}\\\\,dx = \\\\frac{1}{3}"}</Formula>`,
      render: () => (
        <Formula mode="math" display>
          {"\\int_{0}^{1} x^{2}\\,dx = \\frac{1}{3} \\quad \\lim_{n \\to \\infty} \\frac{1}{n} = 0"}
        </Formula>
      ),
    },
    {
      title: "矩阵",
      description: "pmatrix / bmatrix / vmatrix 都认，定界符各自不同。",
      code: `<Formula mode="math" display>{"\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}"}</Formula>`,
      render: () => (
        <Formula mode="math" display>
          {
            "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{vmatrix} 1 & 2 \\\\ 3 & 4 \\end{vmatrix}"
          }
        </Formula>
      ),
    },
    {
      title: "坏数据看得见",
      description:
        "认不出的控制序列就地标红、原样露出，其余部分照常排版 —— 安静地渲染成看起来对的东西才最危险。",
      code: `<Formula mode="math">{"\\\\begin{cases}x=my\\\\y^2=6x\\\\end{cases}"}</Formula>`,
      render: () => <Formula mode="math">{"\\begin{cases}x=my\\y^2=6x\\end{cases}"}</Formula>,
    },
  ],
  controls: [
    {
      prop: "children",
      type: "text",
      defaultValue: "$$f(x)=\\begin{cases} x^{2}, & x<0 \\\\ e^{x}, & x \\geq 0 \\end{cases}$$",
      label: "内容",
    },
    { prop: "mode", type: "select", options: ["mixed", "math"], defaultValue: "mixed", label: "模式" },
    { prop: "display", type: "boolean", defaultValue: false, label: "块级(仅 mode=math)" },
  ],
  states: [
    { name: "分段函数", render: () => <Formula>{"$\\begin{cases} x, & x>0 \\\\ -x, & x\\leq 0 \\end{cases}$"}</Formula> },
    { name: "矩阵", render: () => <Formula mode="math">{"\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}"}</Formula> },
    { name: "求和", render: () => <Formula mode="math">{"\\sum_{i=1}^{n} i^{2}"}</Formula> },
    { name: "积分", render: () => <Formula mode="math">{"\\int_{a}^{b} f(x)\\,dx"}</Formula> },
    { name: "大定界符", render: () => <Formula mode="math">{"\\left(\\frac{a}{b}\\right)^{n}"}</Formula> },
    { name: "行内混排", render: () => <Formula>{"当 $(x+1)$ 为正时成立"}</Formula> },
    { name: "块级", render: () => <Formula>{"$$E=mc^{2}$$"}</Formula> },
    { name: "落单的 $ 按字面", render: () => <Formula>{"定价 $100 元"}</Formula> },
    { name: "坏数据标红", render: () => <Formula mode="math">{"x=\\y+1"}</Formula> },
  ],
  renderWithProps: (p) => (
    <Formula
      mode={p.mode === "math" ? "math" : "mixed"}
      display={Boolean(p.display)}
    >
      {String(p.children ?? "")}
    </Formula>
  ),
  toCode: (p) =>
    `<Formula${p.mode === "math" ? ' mode="math"' : ""}${p.display && p.mode === "math" ? " display" : ""}>{${JSON.stringify(String(p.children ?? ""))}}</Formula>`,
};
