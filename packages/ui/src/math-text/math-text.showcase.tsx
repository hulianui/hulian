"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MathText } from "./math-text";

export const mathTextShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "分数上下叠放，上标下沉为角标，填空渲染成可书写的空位。",
      code: `<MathText>{"将 \\\\frac{3}{8} 化成小数为 ____"}</MathText>`,
      render: () => (
        <p className="text-base">
          <MathText>{"将 \\frac{3}{8} 化成小数为 ____ 。"}</MathText>
        </p>
      ),
    },
    {
      title: "题面里的混合记号",
      description: "真实初中数学题面：分数 / 指数 / 角标 / 填空混排在中文正文中。",
      code: `<MathText>{"已知抛物线 y=ax^{2},点 P(2,3) 在其上,则 a_1=____"}</MathText>`,
      render: () => (
        <p className="text-base leading-8">
          <MathText>
            {"已知抛物线 y=ax^{2} 经过点 P(2,3),则 a=\\frac{3}{4},此时 a_1=____ 。"}
          </MathText>
        </p>
      ),
    },
    {
      title: "并排选项",
      description: "选择题四个分数选项，行高不会被撑乱。",
      code: `<MathText>{"A.\\\\frac{1}{9}  B.\\\\frac{5}{9}  C.\\\\frac{16}{9}  D.\\\\frac{80}{9}"}</MathText>`,
      render: () => (
        <p className="text-base">
          <MathText>
            {"A.\\frac{1}{9}　B.\\frac{5}{9}　C.\\frac{16}{9}　D.\\frac{80}{9}"}
          </MathText>
        </p>
      ),
    },
    {
      title: "根号",
      description: "被开方数带上横线，避免 √a+b 的歧义；支持根指数。",
      code: `<MathText>{"\\\\sqrt{a^{2}+b^{2}} 与 \\\\sqrt[3]{8}"}</MathText>`,
      render: () => (
        <p className="text-base">
          <MathText>{"\\sqrt{a^{2}+b^{2}} 与 \\sqrt[3]{8}"}</MathText>
        </p>
      ),
    },
  ],
  controls: [
    {
      prop: "children",
      type: "text",
      defaultValue: "\\frac{3}{8} 与 x^{2},填空 ____",
      label: "内容",
    },
    { prop: "blankWidth", type: "number", defaultValue: 2.5, label: "填空宽度(em)" },
    { prop: "scriptScale", type: "number", defaultValue: 0.75, label: "上下标比例" },
  ],
  states: [
    { name: "分数", render: () => <MathText>{"\\frac{16}{9}"}</MathText> },
    { name: "上标", render: () => <MathText>{"y=ax^{2}+bx+c"}</MathText> },
    { name: "下标", render: () => <MathText>{"a_1+a_2=S_n"}</MathText> },
    { name: "根号", render: () => <MathText>{"\\sqrt{a^{2}+b^{2}}"}</MathText> },
    { name: "填空槽", render: () => <MathText>{"可记作____万元"}</MathText> },
    { name: "未知记号原样保留", render: () => <MathText>{"\\alpha+1"}</MathText> },
  ],
  renderWithProps: (p) => (
    <MathText
      blankWidth={Number(p.blankWidth ?? 2.5)}
      scriptScale={Number(p.scriptScale ?? 0.75)}
    >
      {String(p.children ?? "")}
    </MathText>
  ),
  toCode: (p) => `<MathText>{${JSON.stringify(String(p.children ?? ""))}}</MathText>`,
};
