"use client";
import { useState } from "react";
import { Input } from "../input";
import { QuestionCard } from "../question-card/question-card";
import type { ShowcaseSpec } from "../showcase/types";
import { FORMULA_TEMPLATE_GROUPS } from "./formula-editing";
import { MathTextarea } from "./math-textarea";
import type { MathFieldLikeProps, MathTextareaProps } from "./math-textarea.types";

const STEM = "已知 $\\triangle ABC$ 中 $\\angle C=90^{\\circ}$，求 $\\sin A$ 的值。";

function Demo({
  initial,
  ...rest
}: { initial: string } & Omit<MathTextareaProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return <MathTextarea {...rest} value={value} onChange={setValue} />;
}

// 阶段 5 的 MathField 满足 MathFieldLikeProps；这里用普通输入框模拟注入点，画廊不必装 mathlive。
function FakeMathField({ value, onChange, onSubmit, "aria-label": ariaLabel }: MathFieldLikeProps) {
  return (
    <Input
      aria-label={ariaLabel}
      placeholder={"\\sqrt{2}"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit?.(value);
      }}
    />
  );
}

const SENIOR_TEMPLATES = [
  {
    id: "vectors",
    title: "向量与数集",
    items: [
      { id: "vec", label: "向量", latex: "\\vec{}", sample: "$\\vec{a}$" },
      { id: "reals", label: "实数集", latex: "\\mathbb{R}", sample: "$\\mathbb{R}$" },
    ],
  },
  ...FORMULA_TEMPLATE_GROUPS.filter((g) => g.id !== "calculus"),
];

export const mathTextareaShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "多行题干：模板插到光标处，含 $ 且语法正确时在下方实时预览。",
      code: `<MathTextarea
  multiline
  aria-label="题干"
  placeholder="请输入题干"
  value={value}
  onChange={setValue}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial={STEM} multiline aria-label="题干" placeholder="请输入题干" />
        </div>
      ),
    },
    {
      title: "单行紧凑",
      description: "选项与每空答案用 compact：预览只留一行、不带说明文字，八个选项也不会把表单撑长。",
      code: `<MathTextarea compact aria-label="选项 A" value={value} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-sm">
          <Demo initial={"$\\frac{5}{9}$"} compact aria-label="选项 A" />
        </div>
      ),
    },
    {
      title: "语法自检",
      description: "$ 未闭合、花括号不配对时报出行列，预览不渲染。",
      code: `<MathTextarea multiline aria-label="题干" value={"定价 $100 元"} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="定价 $100 元" multiline aria-label="题干" />
        </div>
      ),
    },
    {
      title: "KaTeX 解析错误定位",
      description: "命令拼错只有 KaTeX 才知道：预览里标红源码，下方给出字符位置与错误信息。",
      code: `<MathTextarea aria-label="题干" value={"$\\\\frac{a}{b} + \\\\foo{x}$"} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial={"$\\frac{a}{b} + \\foo{x}$"} aria-label="题干" />
        </div>
      ),
    },
    {
      title: "自定义模板组",
      description: "templates 覆盖默认模板组：高中加向量与数集，去掉求和积分。自定义模板直接给 label。",
      code: `<MathTextarea templates={SENIOR_TEMPLATES} aria-label="题干" value={value} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="" templates={SENIOR_TEMPLATES} aria-label="题干" />
        </div>
      ),
    },
    {
      title: "注入可视化编辑器",
      description: "visualEditor 给了才出「可视化输入」页签；这里用普通输入框模拟，MathField 满足同一契约。",
      code: `<MathTextarea multiline visualEditor={MathField} aria-label="题干" value={value} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="面积 " multiline visualEditor={FakeMathField} aria-label="题干" />
        </div>
      ),
    },
    {
      title: "自定义预览",
      description: "renderPreview 换掉默认的 Formula 预览：这里直接预览成题目卡片。",
      code: `<MathTextarea
  multiline
  aria-label="题干"
  renderPreview={(v) => <QuestionCard stem={v} type="blank" />}
  value={value}
  onChange={setValue}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo
            initial={"将 $\\frac{3}{8}$ 化成小数为____。"}
            multiline
            aria-label="题干"
            renderPreview={(v) => <QuestionCard stem={v} type="blank" />}
          />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "multiline", type: "boolean", defaultValue: true },
    { prop: "compact", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "placeholder", type: "text", defaultValue: "请输入题干" },
  ],
  states: [
    { name: "default", render: () => <Demo initial={STEM} multiline aria-label="题干" /> },
    { name: "compact", render: () => <Demo initial={"$\\frac{5}{9}$"} compact aria-label="选项 A" /> },
    { name: "error", render: () => <Demo initial="定价 $100 元" aria-label="题干" /> },
    { name: "disabled", render: () => <Demo initial={STEM} multiline disabled aria-label="题干" /> },
  ],
  renderWithProps: (props) => (
    <div className="w-full max-w-xl">
      <Demo
        initial={STEM}
        multiline={Boolean(props.multiline)}
        compact={Boolean(props.compact)}
        disabled={Boolean(props.disabled)}
        placeholder={String(props.placeholder ?? "")}
        aria-label="题干"
      />
    </div>
  ),
  toCode: (props) =>
    `<MathTextarea${props.multiline ? " multiline" : ""}${props.compact ? " compact" : ""}${
      props.disabled ? " disabled" : ""
    } placeholder="${String(props.placeholder ?? "")}" aria-label="题干" value={value} onChange={setValue} />`,
};
