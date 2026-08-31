"use client";
import { useState } from "react";
import { Input } from "../../../../packages/ui/src/input";
import { QuestionCard } from "../../../../packages/ui/src/question-card/question-card";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FORMULA_TEMPLATE_GROUPS } from "../../../../packages/ui/src/math-textarea/formula-editing";
import { MathTextarea } from "../../../../packages/ui/src/math-textarea/math-textarea";
import type { MathFieldLikeProps, MathTextareaProps } from "../../../../packages/ui/src/math-textarea/math-textarea.types";
const STEM = "In $\\triangle ABC$ with $\\angle C=90^{\\circ}$, find $\\sin A$.";
function Demo({ initial, ...rest }: {
    initial: string;
} & Omit<MathTextareaProps, "value" | "onChange">) {
    const [value, setValue] = useState(initial);
    return <MathTextarea {...rest} value={value} onChange={setValue}/>;
}
function FakeMathField({ value, onChange, onSubmit, "aria-label": ariaLabel }: MathFieldLikeProps) {
    return (<Input aria-label={ariaLabel} placeholder={"\\sqrt{2}"} value={value} onChange={(e) => onChange(e.target.value)} onKeyDown={(e) => {
            if (e.key === "Enter")
                onSubmit?.(value);
        }}/>);
}
const SENIOR_TEMPLATES = [
    {
        id: "vectors",
        title: "Vectors and number sets",
        items: [
            { id: "vec", label: "Vector", latex: "\\vec{}", sample: "$\\vec{a}$" },
            { id: "reals", label: "Real numbers", latex: "\\mathbb{R}", sample: "$\\mathbb{R}$" },
        ],
    },
    ...FORMULA_TEMPLATE_GROUPS.filter((g) => g.id !== "calculus"),
];
export const mathTextareaShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Multi-line stem: templates insert at the caret; once the value contains $ and parses, a live preview renders below.",
            code: `<MathTextarea
  multiline
  aria-label="Stem"
  placeholder="Enter the stem"
  value={value}
  onChange={setValue}
/>`,
            render: () => (<div className="w-full max-w-xl">
          <Demo initial={STEM} multiline aria-label="Question stem" placeholder="Enter the stem"/>
        </div>),
        },
        {
            title: "Single-line compact",
            description: "Use compact for options and per-blank answers: a one-line preview with no helper text, so eight options do not stretch the form.",
            code: `<MathTextarea compact aria-label="Option A" value={value} onChange={setValue} />`,
            render: () => (<div className="w-full max-w-sm">
          <Demo initial={"$\\frac{5}{9}$"} compact aria-label="Option A"/>
        </div>),
        },
        {
            title: "Syntax check",
            description: "An unclosed $ or unbalanced braces report line and column; the preview is not rendered.",
            code: `<MathTextarea multiline aria-label="Stem" value={"price $100"} onChange={setValue} />`,
            render: () => (<div className="w-full max-w-xl">
          <Demo initial="Priced at $100" multiline aria-label="Question stem"/>
        </div>),
        },
        {
            title: "Locating KaTeX parse errors",
            description: "Only KaTeX knows a command is misspelled: the preview shows the source in red and the character position and message appear below.",
            code: `<MathTextarea aria-label="Stem" value={"$\\\\frac{a}{b} + \\\\foo{x}$"} onChange={setValue} />`,
            render: () => (<div className="w-full max-w-xl">
          <Demo initial={"$\\frac{a}{b} + \\foo{x}$"} aria-label="Question stem"/>
        </div>),
        },
        {
            title: "Custom template groups",
            description: "templates replaces the default groups: senior high adds vectors and number sets and drops sums and integrals. Custom templates provide their own label.",
            code: `<MathTextarea templates={SENIOR_TEMPLATES} aria-label="Stem" value={value} onChange={setValue} />`,
            render: () => (<div className="w-full max-w-xl">
          <Demo initial="" templates={SENIOR_TEMPLATES} aria-label="Question stem"/>
        </div>),
        },
        {
            title: "Injecting a visual editor",
            description: "The Visual input tab appears only when visualEditor is provided; a plain input stands in here, and MathField satisfies the same contract.",
            code: `<MathTextarea multiline visualEditor={MathField} aria-label="Stem" value={value} onChange={setValue} />`,
            render: () => (<div className="w-full max-w-xl">
          <Demo initial="Area " multiline visualEditor={FakeMathField} aria-label="Question stem"/>
        </div>),
        },
        {
            title: "Custom preview",
            description: "renderPreview replaces the default Formula preview; here the value previews as a question card.",
            code: `<MathTextarea
  multiline
  aria-label="Stem"
  renderPreview={(v) => <QuestionCard stem={v} type="blank" />}
  value={value}
  onChange={setValue}
/>`,
            render: () => (<div className="w-full max-w-xl">
          <Demo initial={"Write $\\frac{3}{8}$ as a decimal: ____."} multiline aria-label="Question stem" renderPreview={(v) => <QuestionCard stem={v} type="blank"/>}/>
        </div>),
        },
    ],
    controls: [
        { prop: "multiline", type: "boolean", defaultValue: true },
        { prop: "compact", type: "boolean", defaultValue: false },
        { prop: "disabled", type: "boolean", defaultValue: false },
        { prop: "placeholder", type: "text", defaultValue: "Enter the stem" },
    ],
    states: [
        { name: "default", render: () => <Demo initial={STEM} multiline aria-label="Question stem"/> },
        { name: "compact", render: () => <Demo initial={"$\\frac{5}{9}$"} compact aria-label="Option A"/> },
        { name: "error", render: () => <Demo initial="Priced at $100" aria-label="Question stem"/> },
        { name: "disabled", render: () => <Demo initial={STEM} multiline disabled aria-label="Question stem"/> },
    ],
    renderWithProps: (props) => (<div className="w-full max-w-xl">
      <Demo initial={STEM} multiline={Boolean(props.multiline)} compact={Boolean(props.compact)} disabled={Boolean(props.disabled)} placeholder={String(props.placeholder ?? "")} aria-label="Question stem"/>
    </div>),
    toCode: (props) => `<MathTextarea${props.multiline ? " multiline" : ""}${props.compact ? " compact" : ""}${props.disabled ? " disabled" : ""} placeholder="${String(props.placeholder ?? "")}" aria-label="Stem" value={value} onChange={setValue} />`,
};
