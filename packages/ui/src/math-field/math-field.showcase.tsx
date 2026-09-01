"use client";
import { useEffect, useState } from "react";
import { MathTextarea } from "../math-textarea/math-textarea";
import { gradeObjective } from "../question/grade";
import type { Question, StudentAnswer } from "../question/question.types";
import { QuestionAnswer } from "../question-answer/question-answer";
import type { QuestionAnswerResult } from "../question-answer/question-answer.types";
import type { ShowcaseSpec } from "../showcase/types";
import { Text } from "../text";
import { createCasComparator } from "./cas";
import { MathField } from "./math-field";
import type { MathFieldProps } from "./math-field.types";

// 示例公式刻意不以数字收尾：英文词表门禁数保护 token 时不认「数字紧贴 $」。
const INITIAL = "\\frac{a}{b}+\\sqrt{c}";
const INTEGRAL = "\\int_0^1 x\\,dx";
const STEM = "计算 $\\frac{1}{2}+\\frac{1}{3}$ 的值：____";
const TEXTAREA_INITIAL = "已知 $x^2=4$，求 $x$。";

function Demo({
  initial = INITIAL,
  ...rest
}: { initial?: string } & Partial<Omit<MathFieldProps, "value" | "onChange">>) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-full max-w-md space-y-2">
      <MathField {...rest} value={value} onChange={setValue} aria-label="公式" />
      <Text as="p" size="xs" tone="muted" family="mono">
        {value || " "}
      </Text>
    </div>
  );
}

function TextareaDemo() {
  const [value, setValue] = useState(TEXTAREA_INITIAL);
  return (
    <div className="w-full max-w-xl">
      <MathTextarea multiline aria-label="题干" value={value} onChange={setValue} visualEditor={MathField} />
    </div>
  );
}

const BLANK: Question = {
  type: "blank",
  stem: STEM,
  options: null,
  answer: [["\\frac{5}{6}"]],
  analysis: "通分：$\\frac{3}{6}+\\frac{2}{6}=\\frac{5}{6}$。",
  difficulty: 2,
  score: 5,
};

type Equivalent = (a: string, b: string) => boolean;

/** 三档判分：字面 → 归一 → CAS。学生用公式键盘敲出 \frac{10}{12} 也判对。 */
function GradedDemo() {
  const [value, setValue] = useState<StudentAnswer | undefined>();
  const [result, setResult] = useState<QuestionAnswerResult | null>(null);
  const [equivalent, setEquivalent] = useState<Equivalent | undefined>();
  useEffect(() => {
    let alive = true;
    createCasComparator().then(
      (fn) => {
        if (alive) setEquivalent(() => fn);
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, []);
  return (
    <div className="w-full max-w-xl">
      <QuestionAnswer
        question={{ type: BLANK.type, stem: BLANK.stem, options: null, blankCount: 1, difficulty: BLANK.difficulty }}
        value={value}
        onChange={setValue}
        result={result}
        blankInput="math"
        mathField={MathField}
        onSubmit={(answer) => {
          const graded = gradeObjective(BLANK, answer, { normalize: true, tolerance: 0.001, equivalent });
          setResult({ correct: graded.correct === true, correctAnswer: BLANK.answer, analysis: BLANK.analysis });
        }}
      />
    </div>
  );
}

export const mathFieldShowcase: ShowcaseSpec = {
  controls: [
    { prop: "virtualKeyboard", type: "select", options: ["auto", "manual", "off"], defaultValue: "auto", label: "虚拟键盘" },
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "readOnly", type: "boolean", defaultValue: false },
    { prop: "placeholder", type: "text", defaultValue: "输入公式" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "disabled", render: () => <Demo disabled /> },
    { name: "readOnly", render: () => <Demo readOnly /> },
    { name: "keyboard-off", render: () => <Demo virtualKeyboard="off" /> },
  ],
  examples: [
    {
      title: "基础用法",
      description: "受控的 LaTeX 值（不带 $）。首帧是骨架，mathlive 在客户端动态加载。",
      code: `<MathField value={latex} onChange={setLatex} aria-label="公式" />`,
      render: () => <Demo />,
    },
    {
      title: "注入 MathTextarea",
      description: "传组件本身给 visualEditor，MathTextarea 多出「可视化输入」页签，确认后仍按 $…$ 插到光标处。",
      code: `<MathTextarea multiline value={value} onChange={setValue} visualEditor={MathField} />`,
      render: () => <TextareaDemo />,
    },
    {
      title: "填空题公式键盘与三档判分",
      description: "QuestionAnswer 的 blankInput 设为 math；提交时 gradeObjective 依次走字面、归一、createCasComparator。",
      code: `const equivalent = await createCasComparator();
<QuestionAnswer question={q} value={v} onChange={setV} blankInput="math" mathField={MathField}
  onSubmit={(a) => gradeObjective(q, a, { normalize: true, equivalent })} />`,
      render: () => <GradedDemo />,
    },
    {
      title: "虚拟键盘策略",
      description: "manual 只由切换钮弹出；off 不挂键盘（策略 manual 且隐藏切换钮），适合桌面端录题。",
      code: `<MathField value={latex} onChange={setLatex} virtualKeyboard="off" />`,
      render: () => <Demo virtualKeyboard="off" />,
    },
    {
      title: "禁用与只读",
      description: "已提交的作答传 disabled；展示参考答案传 readOnly。",
      code: `<MathField value={latex} onChange={setLatex} disabled />
<MathField value={latex} onChange={setLatex} readOnly />`,
      render: () => (
        <div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <Demo disabled />
          <Demo readOnly initial={INTEGRAL} />
        </div>
      ),
    },
  ],
  renderWithProps: (props) => (
    <Demo
      virtualKeyboard={(props.virtualKeyboard as MathFieldProps["virtualKeyboard"]) ?? "auto"}
      disabled={Boolean(props.disabled)}
      readOnly={Boolean(props.readOnly)}
      placeholder={String(props.placeholder ?? "")}
    />
  ),
  toCode: (props) =>
    `<MathField${props.virtualKeyboard && props.virtualKeyboard !== "auto" ? ` virtualKeyboard="${String(props.virtualKeyboard)}"` : ""}${
      props.disabled ? " disabled" : ""
    }${props.readOnly ? " readOnly" : ""} placeholder="${String(props.placeholder ?? "")}" aria-label="公式" value={latex} onChange={setLatex} />`,
};
