"use client";
import { useState } from "react";
import { Field } from "../field";
import { Input } from "../input";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import type { ShowcaseSpec } from "../showcase/types";
import { QuestionEditor } from "./question-editor";
import type { QuestionEditorProps } from "./question-editor.types";

// 示例公式刻意不以数字收尾（`=0$`）：英文词表门禁数保护 token 时不认「数字紧贴 $」。
const SINGLE: Question = {
  ...emptyQuestion("single"),
  stem: "已知 $\\triangle ABC$ 中 $\\angle C=90^{\\circ}$，$\\sin A=\\frac{3}{5}$，则 $\\cos A$ 的值为（ ）",
  options: [
    { key: "A", text: "$\\frac{4}{5}$" },
    { key: "B", text: "$\\frac{3}{4}$" },
    { key: "C", text: "$\\frac{4}{3}$" },
    { key: "D", text: "$\\frac{5}{4}$" },
  ],
  answer: "A",
  analysis: "由 $\\cos A=\\sqrt{1-\\sin^{2}A}$ 得 $\\cos A=\\frac{4}{5}$。",
};

const BLANK: Question = {
  ...emptyQuestion("blank"),
  stem: "将 $\\frac{3}{8}$ 化成小数为____，化成百分数为____。",
  answer: ["0.375", ["37.5%", "37.5\\%"]],
};

const CALCULATION: Question = {
  ...emptyQuestion("calculation"),
  stem: "计算：$\\frac{1}{2}+\\frac{1}{3}$",
  answer: {
    reference: "$\\frac{5}{6}$",
    rubric: [
      { point: "通分", score: 3 },
      { point: "求和", score: 5 },
    ],
  },
};

// 画廊里的图：一个 SVG data URL，不依赖任何远程资源。
const FIGURE_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#fff"/><polygon points="20,100 140,100 80,20" fill="none" stroke="#333" stroke-width="2"/><text x="76" y="14" font-size="12">A</text><text x="10" y="114" font-size="12">B</text><text x="142" y="114" font-size="12">C</text></svg>',
  );

const WITH_FIGURE: Question = {
  ...emptyQuestion("single"),
  stem: "如图，$\\triangle ABC$ 中 $AB=AC$，则 $\\angle B$ 与 $\\angle C$ 的关系是（ ）\n\n![](figures/abc.svg)",
  options: [
    { key: "A", text: "相等" },
    { key: "B", text: "互补" },
  ],
  answer: "A",
};

function Demo({ initial, ...rest }: { initial: Question } & Omit<QuestionEditorProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return <QuestionEditor {...rest} value={value} onChange={setValue} />;
}

// 画廊不上传：读成 data URL 当 key，缩略图与预览立刻能显示。
const uploadFigure = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取失败"));
    reader.readAsDataURL(file);
  });
const resolveUploaded = (key: string) => (key.startsWith("data:") ? key : FIGURE_SRC);

function PrivateFields() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="学科">
        <Input defaultValue="数学" />
      </Field>
      <Field label="教材小节">
        <Input defaultValue="七上 · 一元二次方程" />
      </Field>
    </div>
  );
}

export const questionEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单选题：选项增删上下移，正确答案跟着内容走；右侧预览就是 QuestionCard。",
      code: `<QuestionEditor value={question} onChange={setQuestion} />`,
      render: () => <Demo initial={SINGLE} />,
    },
    {
      title: "填空题",
      description: "空数随题干里的 ____ 变化，不一致时提示并一键对齐；一空可加多种等价写法。",
      code: `<QuestionEditor value={question} onChange={setQuestion} />`,
      render: () => <Demo initial={BLANK} />,
    },
    {
      title: "分步给分",
      description: "计算题与解答题可切「分步给分」，得分点合计与题目分值并排。",
      code: `<QuestionEditor value={question} onChange={setQuestion} />`,
      render: () => <Demo initial={CALCULATION} />,
    },
    {
      title: "题图",
      description: "题干里的 ![](key) 由 resolveFigure 解析；给了 onUploadFigure 才出「插入图片」。",
      code: `<QuestionEditor
  value={question}
  onChange={setQuestion}
  resolveFigure={(key) => fileUrl(key)}
  onUploadFigure={async (file) => (await upload(file)).key}
/>`,
      render: () => <Demo initial={WITH_FIGURE} resolveFigure={resolveUploaded} onUploadFigure={uploadFigure} />,
    },
    {
      title: "复核条与私有字段",
      description: "issues 列在顶部逐条「已处理」；extra 放消费方自己的字段。",
      code: `<QuestionEditor
  value={question}
  onChange={setQuestion}
  issues={[{ label: "选项疑似缺失" }]}
  onResolveIssue={(label) => resolve(label)}
  extra={<PrivateFields />}
/>`,
      render: () => (
        <Demo
          initial={SINGLE}
          issues={[{ label: "选项疑似缺失" }, { label: "答案存疑", tone: "danger" }]}
          onResolveIssue={() => {}}
          extra={<PrivateFields />}
        />
      ),
    },
    {
      title: "提交时全部校验",
      description: "默认只对改过的字段飘红；showAllIssues 把 validateQuestion 的问题一次挂全。",
      code: `<QuestionEditor value={question} onChange={setQuestion} showAllIssues />`,
      render: () => <Demo initial={emptyQuestion("multiple")} showAllIssues />,
    },
    {
      title: "只读",
      description: "disabled：复核通过后的只读态。",
      code: `<QuestionEditor value={question} onChange={setQuestion} disabled />`,
      render: () => <Demo initial={SINGLE} disabled />,
    },
  ],
  controls: [
    { prop: "preview", type: "boolean", defaultValue: true },
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "showAllIssues", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <Demo initial={SINGLE} /> },
    { name: "blank", render: () => <Demo initial={BLANK} /> },
    { name: "subjective", render: () => <Demo initial={CALCULATION} /> },
    { name: "disabled", render: () => <Demo initial={SINGLE} disabled /> },
  ],
  renderWithProps: (props) => (
    <Demo
      initial={SINGLE}
      preview={props.preview !== false}
      disabled={Boolean(props.disabled)}
      showAllIssues={Boolean(props.showAllIssues)}
    />
  ),
  toCode: (props) =>
    `<QuestionEditor${props.preview === false ? " preview={false}" : ""}${props.disabled ? " disabled" : ""}${
      props.showAllIssues ? " showAllIssues" : ""
    } value={question} onChange={setQuestion} />`,
};
