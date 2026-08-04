"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Formula } from "./math";

// 题面高频记号的样张。**这不是能力清单** —— Formula 背后是 KaTeX，支持完整 LaTeX；
// 这里只是把教辅题面最常出现的那些记号排出来给人看一眼实际效果。
const NOTATIONS: { label: string; src: string }[] = [
  { label: "分数", src: "\\frac{16}{9}" },
  { label: "根号 / 根指数", src: "\\sqrt{a^{2}+b^{2}} 与 \\sqrt[3]{8}" },
  { label: "上标", src: "y=ax^{2} 与 90^\\circ" },
  { label: "下标", src: "a_{1}+a_n=S_\\beta" },
  { label: "填空槽", src: "可记作____万元" },
  { label: "上划线 / 帽子", src: "\\overline{AB} 与 \\widehat{ABC}" },
  { label: "向量箭头", src: "\\overrightarrow{AB} 与 \\vec{a}" },
  { label: "弧", src: "\\overset{\\frown}{AB}" },
  { label: "数集", src: "\\mathbb{Q}\\subset\\mathbb{R}" },
  { label: "字体包装", src: "\\text{甲组}与\\mathbf{乙组}" },
  { label: "定界符", src: "\\left(\\frac{a+b}{c}\\right)^{n}" },
  { label: "转义字符", src: "\\{x\\mid x>0\\}" },
  { label: "符号命令", src: "\\angle ABC\\cong\\triangle DEF" },
];

export const mathShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "为什么需要它",
      description:
        "同一串题库数据：直接当文本渲染会露出原始记号，交给 Formula 才是数学排版。这就是该不该用它的判据。",
      code: `const src = "将 \\\\frac{3}{8} 化成小数为 ____ ,并比较 \\\\sqrt{2} 与 \\\\frac{3}{2} 的大小。"

{/* 直接当文本：露馅 */}
<p>{src}</p>

{/* 真数学排版 */}
<Formula>{src}</Formula>`,
      render: () => {
        const src = "将 \\frac{3}{8} 化成小数为 ____ ,并比较 \\sqrt{2} 与 \\frac{3}{2} 的大小。";
        return (
          <div className="w-full space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="mb-1.5 text-xs text-muted">直接当文本渲染</div>
              <p className="text-base leading-8">{src}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="mb-1.5 text-xs text-muted">Formula</div>
              <p className="text-base leading-8">
                <Formula>{src}</Formula>
              </p>
            </div>
          </div>
        );
      },
    },
    {
      title: "裸记号与填空槽",
      description:
        "上游还没把公式包成 $…$ 时（PDF/Word/OCR 抽出来的题面就是这样），整串退到裸记号切分，题面照样排得出来；____ 渲染成可书写的空位，而不是四个下划线。",
      code: `{/* 没有一个 $，公式边界由切分器认 */}
<Formula>{"将 \\\\frac{3}{8} 化成小数为 ____"}</Formula>

{/* 填空槽在 $ 外面也认 */}
<Formula>{"$\\\\frac{3}{8}$ 化成小数为 ____"}</Formula>`,
      render: () => (
        <div className="w-full space-y-2 text-base leading-8">
          <p>
            <Formula>{"将 \\frac{3}{8} 化成小数为 ____ ，此时 a_1=____ 。"}</Formula>
          </p>
          <p>
            <Formula blankWidth={4}>{"$\\frac{3}{8}$ 化成小数为 ____ （blankWidth=4）"}</Formula>
          </p>
        </div>
      ),
    },
    {
      title: "常用记号",
      description:
        "题面高频记号写成什么、排出来什么，上下对照。这不是能力清单 —— 背后是 KaTeX，完整 LaTeX 都支持。",
      code: `const NOTATIONS = [
  { label: "分数", src: "\\\\frac{16}{9}" },
  { label: "根号 / 根指数", src: "\\\\sqrt{a^{2}+b^{2}} 与 \\\\sqrt[3]{8}" },
  // …
]

<div className="grid gap-3 sm:grid-cols-2">
  {NOTATIONS.map(({ label, src }) => (
    <div key={src} className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted">{label}</div>
      <code className="mt-1 block font-mono text-xs break-all text-muted">{src}</code>
      <p className="mt-2 border-t border-border pt-2 text-base leading-8">
        <Formula>{src}</Formula>
      </p>
    </div>
  ))}
</div>`,
      render: () => (
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {NOTATIONS.map(({ label, src }) => (
            <div key={src} className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted">{label}</div>
              <code className="mt-1 block font-mono text-xs break-all text-muted">{src}</code>
              <p className="mt-2 border-t border-border pt-2 text-base leading-8">
                <Formula>{src}</Formula>
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "分段函数",
      description:
        "高中函数题的主力题型。拍平成一行、行分隔符变成分号的话题干就读不懂了 —— 这里是真正的二维排版。",
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
      description: "括号高度跟着内容长，而不是一个定高的字符括号。",
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
    { prop: "blankWidth", type: "number", defaultValue: 2.5, label: "填空槽宽度(em)" },
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
    { name: "裸记号（无 $）", render: () => <Formula>{"将 \\frac{3}{8} 化成小数"}</Formula> },
    { name: "填空槽", render: () => <Formula>{"可记作____万元"}</Formula> },
    { name: "坏数据标红", render: () => <Formula mode="math">{"x=\\y+1"}</Formula> },
  ],
  renderWithProps: (p) => (
    <Formula
      mode={p.mode === "math" ? "math" : "mixed"}
      display={Boolean(p.display)}
      blankWidth={Number(p.blankWidth ?? 2.5)}
    >
      {String(p.children ?? "")}
    </Formula>
  ),
  toCode: (p) =>
    `<Formula${p.mode === "math" ? ' mode="math"' : ""}${p.display && p.mode === "math" ? " display" : ""}>{${JSON.stringify(String(p.children ?? ""))}}</Formula>`,
};
