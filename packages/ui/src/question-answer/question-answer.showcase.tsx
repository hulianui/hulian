"use client";
import { useState } from "react";
import { Input } from "../input";
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";
import { gradeObjective } from "../question/grade";
import type { Question, StudentAnswer } from "../question/question.types";
import type { ShowcaseSpec } from "../showcase/types";
import { QuestionAnswer } from "./question-answer";
import type { QuestionAnswerProps, QuestionAnswerResult } from "./question-answer.types";

// 示例公式刻意不以数字收尾：英文词表门禁数保护 token 时不认「数字紧贴 $」。
const SINGLE: Question = {
  type: "single",
  stem: "已知 $\\sin A=\\frac{3}{5}$ 且 $A$ 为锐角，则 $\\cos A$ 的值为（ ）",
  options: [
    { key: "A", text: "$\\frac{4}{5}$" },
    { key: "B", text: "$\\frac{3}{4}$" },
    { key: "C", text: "$\\frac{4}{3}$" },
    { key: "D", text: "$\\frac{5}{4}$" },
  ],
  answer: "A",
  analysis: "由 $\\cos A=\\sqrt{1-\\sin^{2}A}$ 得 $\\cos A=\\frac{4}{5}$。",
  difficulty: 2,
  score: 3,
};

const MULTIPLE: Question = {
  type: "multiple",
  stem: "下列各式中，与 $\\sqrt{8}$ 是同类二次根式的有（ ）",
  options: [
    { key: "A", text: "$\\sqrt{2}$" },
    { key: "B", text: "$\\sqrt{12}$" },
    { key: "C", text: "$\\sqrt{18}$" },
    { key: "D", text: "$\\sqrt{27}$" },
  ],
  answer: ["A", "C"],
  analysis: "$\\sqrt{8}=2\\sqrt{2}$，$\\sqrt{18}=3\\sqrt{2}$。",
  difficulty: 3,
  score: 4,
};

const JUDGE: Question = {
  type: "judge",
  stem: "对顶角相等。",
  options: null,
  answer: true,
  analysis: "对顶角是同一个角的补角，所以相等。",
  difficulty: 1,
  score: 3,
};

const BLANK: Question = {
  type: "blank",
  stem: "将 $\\frac{3}{8}$ 化成小数为____，化成百分数为____。",
  options: null,
  answer: ["0.375", ["37.5%", "37.5\\%"]],
  analysis: "分子除以分母。",
  difficulty: 2,
  score: 4,
};

const ESSAY: Question = {
  type: "essay",
  stem: "如图，在 $\\triangle ABC$ 中 $AB=AC$，求证 $\\angle B=\\angle C$。",
  options: null,
  answer: null,
  analysis: "",
  difficulty: 3,
  score: 8,
};

const MISSING_OPTIONS: Question = {
  ...SINGLE,
  stem: "下列说法正确的是（A）质数都是奇数（B）偶数都是合数（C）最小的合数是四（D）一是质数",
  options: null,
};

/** 画廊里的即时反馈：交了就地用 gradeObjective 判，正式环境这一步在服务端。 */
function Demo({
  question,
  topics,
  ...rest
}: { question: Question; topics?: string[] } & Partial<
  Omit<QuestionAnswerProps, "question" | "value" | "onChange" | "result">
>) {
  const [value, setValue] = useState<StudentAnswer | undefined>();
  const [result, setResult] = useState<QuestionAnswerResult | null>(null);
  return (
    <QuestionAnswer
      question={{
        type: question.type,
        stem: question.stem,
        options: question.options,
        difficulty: question.difficulty,
        topics,
      }}
      value={value}
      onChange={setValue}
      result={result}
      onSubmit={(answer) => {
        const graded = gradeObjective(question, answer);
        setResult({ correct: graded.correct === true, correctAnswer: question.answer, analysis: question.analysis });
      }}
      correctHint="下次不会再推给你"
      {...rest}
    />
  );
}

/** 画廊用的最小 MathFieldLikeProps 实现：一个普通输入框。正式环境注入 @hulianui/ui/math-field 的 MathField。 */
function PlainMathField({ value, onChange, disabled, className, "aria-label": label }: MathFieldLikeProps) {
  return (
    <Input
      aria-label={label}
      className={className}
      value={value}
      disabled={disabled}
      placeholder="LaTeX"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export const questionAnswerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单选题：选项是 RadioGroup，交了就地用 gradeObjective 判分显示正误与解析。",
      code: `<QuestionAnswer
  question={question}
  value={value}
  onChange={setValue}
  result={result}
  onSubmit={(answer) => setResult(grade(answer))}
/>`,
      render: () => <Demo question={SINGLE} topics={["三角函数"]} />,
    },
    {
      title: "多选题",
      description: "CheckboxGroup，回传排好序的 key 数组；少选多选都判错。",
      code: `<QuestionAnswer question={question} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={MULTIPLE} />,
    },
    {
      title: "判断题",
      description: '两个选项是题型自带的（题库里 options 是 null），值是 "true" / "false"。',
      code: `<QuestionAnswer question={question} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={JUDGE} />,
    },
    {
      title: "多空填空",
      description: "每空一个输入框并标空号，每个空都填了才能交；答错按空号列出正确答案。",
      code: `<QuestionAnswer question={{ ...question, blankCount: 2 }} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={BLANK} />,
    },
    {
      title: "公式键盘",
      description: 'blankInput="math" 时每空渲染 mathField 注入的组件；这里注入的是一个普通输入框。',
      code: `<QuestionAnswer question={question} value={value} onChange={setValue} blankInput="math" mathField={MathField} />`,
      render: () => <Demo question={BLANK} blankInput="math" mathField={PlainMathField} />,
    },
    {
      title: "回看",
      description: "已作答：value 与 result 一并传入，控件锁定，按钮变「已提交」。",
      code: `<QuestionAnswer question={question} value="B" result={{ correct: false, correctAnswer: "A", analysis }} onSubmit={submit} />`,
      render: () => (
        <QuestionAnswer
          question={{ type: SINGLE.type, stem: SINGLE.stem, options: SINGLE.options, difficulty: SINGLE.difficulty }}
          value="B"
          onChange={() => {}}
          onSubmit={() => {}}
          result={{ correct: false, correctAnswer: SINGLE.answer, analysis: SINGLE.analysis }}
        />
      ),
    },
    {
      title: "来源说明与页眉",
      description: "reason 是题干上方那行推荐理由；header 放题号或计时。",
      code: `<QuestionAnswer question={question} reason="上次这类题错了" header={<span>第 3 题</span>} />`,
      render: () => (
        <Demo question={SINGLE} reason="上次这类题错了" header={<span className="text-xs text-muted-foreground">第 3 题</span>} />
      ),
    },
    {
      title: "主观题",
      description: "只读题面，下方提示需教师批阅，没有提交按钮。",
      code: `<QuestionAnswer question={question} value={undefined} onChange={() => {}} />`,
      render: () => <Demo question={ESSAY} />,
    },
    {
      title: "选项缺失",
      description: "选择题的选项没入库：明说这道题暂时没法作答，不摆一个点不动的空单选组。",
      code: `<QuestionAnswer question={{ ...question, options: null }} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={MISSING_OPTIONS} />,
    },
  ],
  controls: [
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "pending", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <Demo question={SINGLE} /> },
    { name: "judge", render: () => <Demo question={JUDGE} /> },
    { name: "blank", render: () => <Demo question={BLANK} /> },
    {
      name: "answered",
      render: () => (
        <QuestionAnswer
          question={{ type: JUDGE.type, stem: JUDGE.stem, options: null }}
          value="true"
          onChange={() => {}}
          result={{ correct: true, correctAnswer: true, analysis: JUDGE.analysis }}
          correctHint="下次不会再推给你"
        />
      ),
    },
  ],
  renderWithProps: (props) => (
    <Demo question={SINGLE} disabled={Boolean(props.disabled)} pending={Boolean(props.pending)} />
  ),
  toCode: (props) =>
    `<QuestionAnswer${props.disabled ? " disabled" : ""}${props.pending ? " pending" : ""} question={question} value={value} onChange={setValue} onSubmit={submit} />`,
};
