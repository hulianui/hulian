"use client";
import { useState } from "react";
import { Input } from "../../../../packages/ui/src/input";
import type { MathFieldLikeProps } from "../../../../packages/ui/src/math-textarea/math-textarea.types";
import { gradeObjective } from "../../../../packages/ui/src/question/grade";
import type { Question, StudentAnswer } from "../../../../packages/ui/src/question/question.types";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { QuestionAnswer } from "../../../../packages/ui/src/question-answer/question-answer";
import type { QuestionAnswerProps, QuestionAnswerResult } from "../../../../packages/ui/src/question-answer/question-answer.types";
const SINGLE: Question = {
    type: "single",
    stem: "Given $\\sin A=\\frac{3}{5}$ with $A$ acute, the value of $\\cos A$ is ( )",
    options: [
        { key: "A", text: "$\\frac{4}{5}$" },
        { key: "B", text: "$\\frac{3}{4}$" },
        { key: "C", text: "$\\frac{4}{3}$" },
        { key: "D", text: "$\\frac{5}{4}$" },
    ],
    answer: "A",
    analysis: "From $\\cos A=\\sqrt{1-\\sin^{2}A}$ we get $\\cos A=\\frac{4}{5}$.",
    difficulty: 2,
    score: 3,
};
const MULTIPLE: Question = {
    type: "multiple",
    stem: "Which of the following are like radicals of $\\sqrt{8}$? ( )",
    options: [
        { key: "A", text: "$\\sqrt{2}$" },
        { key: "B", text: "$\\sqrt{12}$" },
        { key: "C", text: "$\\sqrt{18}$" },
        { key: "D", text: "$\\sqrt{27}$" },
    ],
    answer: ["A", "C"],
    analysis: "$\\sqrt{8}=2\\sqrt{2}$, $\\sqrt{18}=3\\sqrt{2}$.",
    difficulty: 3,
    score: 4,
};
const JUDGE: Question = {
    type: "judge",
    stem: "Vertical angles are equal.",
    options: null,
    answer: true,
    analysis: "Vertical angles are supplements of the same angle, so they are equal.",
    difficulty: 1,
    score: 3,
};
const BLANK: Question = {
    type: "blank",
    stem: "Write $\\frac{3}{8}$ as a decimal: ____, and as a percentage: ____.",
    options: null,
    answer: ["0.375", ["37.5%", "37.5\\%"]],
    analysis: "Divide the numerator by the denominator.",
    difficulty: 2,
    score: 4,
};
const ESSAY: Question = {
    type: "essay",
    stem: "As shown, in $\\triangle ABC$ with $AB=AC$, prove that $\\angle B=\\angle C$.",
    options: null,
    answer: null,
    analysis: "",
    difficulty: 3,
    score: 8,
};
const MISSING_OPTIONS: Question = {
    ...SINGLE,
    stem: "Which statement is correct? (A) Every prime is odd (B) Every even number is composite (C) The smallest composite number is four (D) One is prime",
    options: null,
};
function Demo({ question, topics, ...rest }: {
    question: Question;
    topics?: string[];
} & Partial<Omit<QuestionAnswerProps, "question" | "value" | "onChange" | "result">>) {
    const [value, setValue] = useState<StudentAnswer | undefined>();
    const [result, setResult] = useState<QuestionAnswerResult | null>(null);
    return (<QuestionAnswer question={{
            type: question.type,
            stem: question.stem,
            options: question.options,
            difficulty: question.difficulty,
            topics,
        }} value={value} onChange={setValue} result={result} onSubmit={(answer) => {
            const graded = gradeObjective(question, answer);
            setResult({ correct: graded.correct === true, correctAnswer: question.answer, analysis: question.analysis });
        }} correctHint="It will not be recommended again" {...rest}/>);
}
function PlainMathField({ value, onChange, disabled, className, "aria-label": label }: MathFieldLikeProps) {
    return (<Input aria-label={label} className={className} value={value} disabled={disabled} placeholder="LaTeX" onChange={(event) => onChange(event.target.value)}/>);
}
export const questionAnswerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Single choice: options are a RadioGroup; on submit the demo grades locally with gradeObjective and shows the verdict and explanation.",
            code: `<QuestionAnswer
  question={question}
  value={value}
  onChange={setValue}
  result={result}
  onSubmit={(answer) => setResult(grade(answer))}
/>`,
            render: () => <Demo question={SINGLE} topics={["Trigonometry"]}/>,
        },
        {
            title: "Multiple choice",
            description: "A CheckboxGroup returning a sorted key array; too few or too many selections are both wrong.",
            code: `<QuestionAnswer question={question} value={value} onChange={setValue} onSubmit={submit} />`,
            render: () => <Demo question={MULTIPLE}/>,
        },
        {
            title: "True or false",
            description: "The two options come with the type (options is null in the bank); the value is \"true\" / \"false\".",
            code: `<QuestionAnswer question={question} value={value} onChange={setValue} onSubmit={submit} />`,
            render: () => <Demo question={JUDGE}/>,
        },
        {
            title: "Multiple blanks",
            description: "One input per blank with its number; submit only when every blank is filled; a wrong answer lists the correct answer per blank.",
            code: `<QuestionAnswer question={{ ...question, blankCount: 2 }} value={value} onChange={setValue} onSubmit={submit} />`,
            render: () => <Demo question={BLANK}/>,
        },
        {
            title: "Formula keyboard",
            description: "With blankInput=\"math\" every blank renders the component injected via mathField; here it is a plain input.",
            code: `<QuestionAnswer question={question} value={value} onChange={setValue} blankInput="math" mathField={MathField} />`,
            render: () => <Demo question={BLANK} blankInput="math" mathField={PlainMathField}/>,
        },
        {
            title: "Review",
            description: "Already answered: pass value and result together; controls lock and the button reads Submitted.",
            code: `<QuestionAnswer question={question} value="B" result={{ correct: false, correctAnswer: "A", analysis }} onSubmit={submit} />`,
            render: () => (<QuestionAnswer question={{ type: SINGLE.type, stem: SINGLE.stem, options: SINGLE.options, difficulty: SINGLE.difficulty }} value="B" onChange={() => { }} onSubmit={() => { }} result={{ correct: false, correctAnswer: SINGLE.answer, analysis: SINGLE.analysis }}/>),
        },
        {
            title: "Source line and header",
            description: "reason is the recommendation line above the stem; header holds the number or a timer.",
            code: `<QuestionAnswer question={question} reason="You missed this kind last time" header={<span>Question 3</span>} />`,
            render: () => (<Demo question={SINGLE} reason="You missed this kind last time" header={<span className="text-xs text-muted-foreground">Question 3</span>}/>),
        },
        {
            title: "Subjective",
            description: "Read-only stem with a note that the teacher grades it; no submit button.",
            code: `<QuestionAnswer question={question} value={undefined} onChange={() => {}} />`,
            render: () => <Demo question={ESSAY}/>,
        },
        {
            title: "Missing options",
            description: "The options of a choice question were never entered: say plainly it cannot be answered yet instead of showing an empty radio group.",
            code: `<QuestionAnswer question={{ ...question, options: null }} value={value} onChange={setValue} onSubmit={submit} />`,
            render: () => <Demo question={MISSING_OPTIONS}/>,
        },
    ],
    controls: [
        { prop: "disabled", type: "boolean", defaultValue: false },
        { prop: "pending", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "default", render: () => <Demo question={SINGLE}/> },
        { name: "judge", render: () => <Demo question={JUDGE}/> },
        { name: "blank", render: () => <Demo question={BLANK}/> },
        {
            name: "answered",
            render: () => (<QuestionAnswer question={{ type: JUDGE.type, stem: JUDGE.stem, options: null }} value="true" onChange={() => { }} result={{ correct: true, correctAnswer: true, analysis: JUDGE.analysis }} correctHint="It will not be recommended again"/>),
        },
    ],
    renderWithProps: (props) => (<Demo question={SINGLE} disabled={Boolean(props.disabled)} pending={Boolean(props.pending)}/>),
    toCode: (props) => `<QuestionAnswer${props.disabled ? " disabled" : ""}${props.pending ? " pending" : ""} question={question} value={value} onChange={setValue} onSubmit={submit} />`,
};
