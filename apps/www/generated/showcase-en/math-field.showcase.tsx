"use client";
import { useEffect, useState } from "react";
import { MathTextarea } from "../../../../packages/ui/src/math-textarea/math-textarea";
import { gradeObjective } from "../../../../packages/ui/src/question/grade";
import type { Question, StudentAnswer } from "../../../../packages/ui/src/question/question.types";
import { QuestionAnswer } from "../../../../packages/ui/src/question-answer/question-answer";
import type { QuestionAnswerResult } from "../../../../packages/ui/src/question-answer/question-answer.types";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Text } from "../../../../packages/ui/src/text";
import { createCasComparator } from "../../../../packages/ui/src/math-field/cas";
import { MathField } from "../../../../packages/ui/src/math-field/math-field";
import type { MathFieldProps } from "../../../../packages/ui/src/math-field/math-field.types";
const INITIAL = "\\frac{a}{b}+\\sqrt{c}";
const INTEGRAL = "\\int_0^1 x\\,dx";
const STEM = "Compute the value of $\\frac{1}{2}+\\frac{1}{3}$: ____";
const TEXTAREA_INITIAL = "Given $x^2=4$, find $x$.";
function Demo({ initial = INITIAL, ...rest }: {
    initial?: string;
} & Partial<Omit<MathFieldProps, "value" | "onChange">>) {
    const [value, setValue] = useState(initial);
    return (<div className="w-full max-w-md space-y-2">
      <MathField {...rest} value={value} onChange={setValue} aria-label="Formula"/>
      <Text as="p" size="xs" tone="muted" family="mono">
        {value || " "}
      </Text>
    </div>);
}
function TextareaDemo() {
    const [value, setValue] = useState(TEXTAREA_INITIAL);
    return (<div className="w-full max-w-xl">
      <MathTextarea multiline aria-label="Question stem" value={value} onChange={setValue} visualEditor={MathField}/>
    </div>);
}
const BLANK: Question = {
    type: "blank",
    stem: STEM,
    options: null,
    answer: [["\\frac{5}{6}"]],
    analysis: "Common denominator: $\\frac{3}{6}+\\frac{2}{6}=\\frac{5}{6}$.",
    difficulty: 2,
    score: 5,
};
type Equivalent = (a: string, b: string) => boolean;
function GradedDemo() {
    const [value, setValue] = useState<StudentAnswer | undefined>();
    const [result, setResult] = useState<QuestionAnswerResult | null>(null);
    const [equivalent, setEquivalent] = useState<Equivalent | undefined>();
    useEffect(() => {
        let alive = true;
        createCasComparator().then((fn) => {
            if (alive)
                setEquivalent(() => fn);
        }, () => { });
        return () => {
            alive = false;
        };
    }, []);
    return (<div className="w-full max-w-xl">
      <QuestionAnswer question={{ type: BLANK.type, stem: BLANK.stem, options: null, blankCount: 1, difficulty: BLANK.difficulty }} value={value} onChange={setValue} result={result} blankInput="math" mathField={MathField} onSubmit={(answer) => {
            const graded = gradeObjective(BLANK, answer, { normalize: true, tolerance: 0.001, equivalent });
            setResult({ correct: graded.correct === true, correctAnswer: BLANK.answer, analysis: BLANK.analysis });
        }}/>
    </div>);
}
export const mathFieldShowcase: ShowcaseSpec = {
    controls: [
        { prop: "virtualKeyboard", type: "select", options: ["auto", "manual", "off"], defaultValue: "auto", label: "Virtual keyboard" },
        { prop: "disabled", type: "boolean", defaultValue: false },
        { prop: "readOnly", type: "boolean", defaultValue: false },
        { prop: "placeholder", type: "text", defaultValue: "Enter a formula" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "disabled", render: () => <Demo disabled/> },
        { name: "readOnly", render: () => <Demo readOnly/> },
        { name: "keyboard-off", render: () => <Demo virtualKeyboard="off"/> },
    ],
    examples: [
        {
            title: "Basic usage",
            description: "Controlled LaTeX value (without $). The first frame is a skeleton; mathlive loads dynamically on the client.",
            code: `<MathField value={latex} onChange={setLatex} aria-label="Formula" />`,
            render: () => <Demo />,
        },
        {
            title: "Inject into MathTextarea",
            description: "Pass the component itself as visualEditor; MathTextarea gains a Visual input tab, and confirming still inserts $\u2026$ at the caret.",
            code: `<MathTextarea multiline value={value} onChange={setValue} visualEditor={MathField} />`,
            render: () => <TextareaDemo />,
        },
        {
            title: "Formula keyboard for blanks with three-tier grading",
            description: "Set the blankInput of QuestionAnswer to math; on submit gradeObjective runs literal, normalized, then createCasComparator in order.",
            code: `const equivalent = await createCasComparator();
<QuestionAnswer question={q} value={v} onChange={setV} blankInput="math" mathField={MathField}
  onSubmit={(a) => gradeObjective(q, a, { normalize: true, equivalent })} />`,
            render: () => <GradedDemo />,
        },
        {
            title: "Virtual keyboard policy",
            description: "manual opens only from the toggle; off attaches no keyboard (policy manual with the toggle hidden), suited to desktop authoring.",
            code: `<MathField value={latex} onChange={setLatex} virtualKeyboard="off" />`,
            render: () => <Demo virtualKeyboard="off"/>,
        },
        {
            title: "Disabled and read-only",
            description: "Pass disabled for a submitted answer; pass readOnly to display a reference answer.",
            code: `<MathField value={latex} onChange={setLatex} disabled />
<MathField value={latex} onChange={setLatex} readOnly />`,
            render: () => (<div className="grid w-full max-w-xl gap-3 sm:grid-cols-2">
          <Demo disabled/>
          <Demo readOnly initial={INTEGRAL}/>
        </div>),
        },
    ],
    renderWithProps: (props) => (<Demo virtualKeyboard={(props.virtualKeyboard as MathFieldProps["virtualKeyboard"]) ?? "auto"} disabled={Boolean(props.disabled)} readOnly={Boolean(props.readOnly)} placeholder={String(props.placeholder ?? "")}/>),
    toCode: (props) => `<MathField${props.virtualKeyboard && props.virtualKeyboard !== "auto" ? ` virtualKeyboard="${String(props.virtualKeyboard)}"` : ""}${props.disabled ? " disabled" : ""}${props.readOnly ? " readOnly" : ""} placeholder="${String(props.placeholder ?? "")}" aria-label="Formula" value={latex} onChange={setLatex} />`,
};
