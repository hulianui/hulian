"use client";
import { useState } from "react";
import { Field } from "../../../../packages/ui/src/field";
import { Input } from "../../../../packages/ui/src/input";
import { emptyQuestion } from "../../../../packages/ui/src/question/question-shape";
import type { Question } from "../../../../packages/ui/src/question/question.types";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { QuestionEditor } from "../../../../packages/ui/src/question-editor/question-editor";
import type { QuestionEditorProps } from "../../../../packages/ui/src/question-editor/question-editor.types";
const SINGLE: Question = {
    ...emptyQuestion("single"),
    stem: "Given $x^{2}-5x+6=0$, the value of $x$ is ( )",
    options: [
        { key: "A", text: "$2$ or $3$" },
        { key: "B", text: "$-2$ or $-3$" },
        { key: "C", text: "$1$ or $6$" },
        { key: "D", text: "No solution" },
    ],
    answer: "A",
    analysis: "Factoring gives $(x-2)(x-3)=0$.",
};
const BLANK: Question = {
    ...emptyQuestion("blank"),
    stem: "Write $\\frac{3}{8}$ as a decimal: ____, and as a percentage: ____.",
    answer: ["0.375", ["37.5%", "37.5\\%"]],
};
const CALCULATION: Question = {
    ...emptyQuestion("calculation"),
    stem: "Evaluate $\\frac{1}{2}+\\frac{1}{3}$",
    answer: {
        reference: "$\\frac{5}{6}$",
        rubric: [
            { point: "Common denominator", score: 3 },
            { point: "Sum", score: 5 },
        ],
    },
};
const FIGURE_SRC = "data:image/svg+xml;utf8," +
    encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"120\"><rect width=\"160\" height=\"120\" fill=\"#fff\"/><polygon points=\"20,100 140,100 80,20\" fill=\"none\" stroke=\"#333\" stroke-width=\"2\"/><text x=\"76\" y=\"14\" font-size=\"12\">A</text><text x=\"10\" y=\"114\" font-size=\"12\">B</text><text x=\"142\" y=\"114\" font-size=\"12\">C</text></svg>");
const WITH_FIGURE: Question = {
    ...emptyQuestion("single"),
    stem: "As shown, in $\\triangle ABC$ with $AB=AC$, the relation between $\\angle B$ and $\\angle C$ is ( )\n\n![](figures/abc.svg)",
    options: [
        { key: "A", text: "Equal" },
        { key: "B", text: "Supplementary" },
    ],
    answer: "A",
};
function Demo({ initial, ...rest }: {
    initial: Question;
} & Omit<QuestionEditorProps, "value" | "onChange">) {
    const [value, setValue] = useState(initial);
    return <QuestionEditor {...rest} value={value} onChange={setValue}/>;
}
const uploadFigure = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Read failed"));
    reader.readAsDataURL(file);
});
const resolveUploaded = (key: string) => (key.startsWith("data:") ? key : FIGURE_SRC);
function PrivateFields() {
    return (<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Subject">
        <Input defaultValue="Mathematics"/>
      </Field>
      <Field label="Textbook section">
        <Input defaultValue="Grade 7 · Quadratic equations"/>
      </Field>
    </div>);
}
export const questionEditorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Single choice: add, remove, and reorder options, and the correct answer follows the content; the preview on the right is QuestionCard.",
            code: `<QuestionEditor value={question} onChange={setQuestion} />`,
            render: () => <Demo initial={SINGLE}/>,
        },
        {
            title: "Fill in the blanks",
            description: "The number of blanks follows ____ in the stem, with a one-click align when they differ; a blank may accept several equivalent forms.",
            code: `<QuestionEditor value={question} onChange={setQuestion} />`,
            render: () => <Demo initial={BLANK}/>,
        },
        {
            title: "Rubric",
            description: "Calculation and extended-response questions can switch to a rubric; the rubric total sits next to the question score.",
            code: `<QuestionEditor value={question} onChange={setQuestion} />`,
            render: () => <Demo initial={CALCULATION}/>,
        },
        {
            title: "Figures",
            description: "![](key) in the stem is resolved by resolveFigure; the Insert image button appears only with onUploadFigure.",
            code: `<QuestionEditor
  value={question}
  onChange={setQuestion}
  resolveFigure={(key) => fileUrl(key)}
  onUploadFigure={async (file) => (await upload(file)).key}
/>`,
            render: () => <Demo initial={WITH_FIGURE} resolveFigure={resolveUploaded} onUploadFigure={uploadFigure}/>,
        },
        {
            title: "Review bar and private fields",
            description: "issues are listed at the top with a Resolved button each; extra holds the consumer's own fields.",
            code: `<QuestionEditor
  value={question}
  onChange={setQuestion}
  issues={[{ label: "An option may be missing" }]}
  onResolveIssue={(label) => resolve(label)}
  extra={<PrivateFields />}
/>`,
            render: () => (<Demo initial={SINGLE} issues={[{ label: "An option may be missing" }, { label: "Answer in doubt", tone: "danger" }]} onResolveIssue={() => { }} extra={<PrivateFields />}/>),
        },
        {
            title: "Validate everything on submit",
            description: "By default only edited fields turn red; showAllIssues attaches every validateQuestion issue at once.",
            code: `<QuestionEditor value={question} onChange={setQuestion} showAllIssues />`,
            render: () => <Demo initial={emptyQuestion("multiple")} showAllIssues/>,
        },
        {
            title: "Read only",
            description: "disabled: the read-only state after review.",
            code: `<QuestionEditor value={question} onChange={setQuestion} disabled />`,
            render: () => <Demo initial={SINGLE} disabled/>,
        },
    ],
    controls: [
        { prop: "preview", type: "boolean", defaultValue: true },
        { prop: "disabled", type: "boolean", defaultValue: false },
        { prop: "showAllIssues", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "default", render: () => <Demo initial={SINGLE}/> },
        { name: "blank", render: () => <Demo initial={BLANK}/> },
        { name: "subjective", render: () => <Demo initial={CALCULATION}/> },
        { name: "disabled", render: () => <Demo initial={SINGLE} disabled/> },
    ],
    renderWithProps: (props) => (<Demo initial={SINGLE} preview={props.preview !== false} disabled={Boolean(props.disabled)} showAllIssues={Boolean(props.showAllIssues)}/>),
    toCode: (props) => `<QuestionEditor${props.preview === false ? " preview={false}" : ""}${props.disabled ? " disabled" : ""}${props.showAllIssues ? " showAllIssues" : ""} value={question} onChange={setQuestion} />`,
};
