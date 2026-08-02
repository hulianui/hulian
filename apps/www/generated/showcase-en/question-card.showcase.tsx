"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { QuestionCard } from "../../../../packages/ui/src/question-card/question-card";
export const questionCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Multiple choice questions",
            description: "The question stem and the scores in the options are in MathText real format; the source and knowledge points are in the footer.",
            code: `<QuestionCard
  number="3"
  kind="choice"
  difficulty="A group"
  stem="As shown in the picture, figures \u2460 and 2 are made up of exactly the same small squares. If the side length of figure \u2460 is 4, then the area of figure \u2461 is expressed as a fraction ( )."
  options={[
    { label: "A", text: "\\\\frac{1}{9}" },
    { label: "B", text: "\\\\frac{5}{9}" },
    { label: "C", text: "\\\\frac{16}{9}" },
    { label: "D", text: "\\\\frac{80}{9}" },
  ]}
  chapter="Chapter 1 Rational Numbers \u00B7 1.1.1 Natural Numbers, Fractions and Decimals"
  topics={["rational numbers", "fraction"]}
  source="Academic Ability Assessment Part 7 \u00B7 Page 3 \u00B7 Question 3"
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <QuestionCard number="3" kind="choice" difficulty="A Group" stem="As shown in the picture, figures ① and ② are made up of exactly the same small squares. If the side length of graph ① is 4, then the area of ​​graph ② is expressed as a fraction ( )." options={[
                    { label: "A", text: "\\frac{1}{9}" },
                    { label: "B", text: "\\frac{5}{9}" },
                    { label: "C", text: "\\frac{16}{9}" },
                    { label: "D", text: "\\frac{80}{9}" },
                ]} chapter="Chapter 1 Rational Numbers · 1.1.1 Natural Numbers, Fractions and Decimals" topics={["Rational numbers", "Score"]} source="Academic Ability Assessment Part 7 · Page 3 · Question 3"/>
        </div>),
        },
        {
            title: "Fill in the blanks + quiz",
            description: "Fill-in-the-blank slots are write-in spaces; questions are listed one by one.",
            code: `<QuestionCard
  number="11"
  kind="fill"
  stem="The profit requirement is positive. A company lost 30,000 yuan last year, which can be recorded as ____ million yuan."
  parts={["(1) The number b represented by point B on the number axis is ____.", "(2) The number represented by point P is ____."]}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <QuestionCard number="11" kind="fill" stem="Profit is stipulated to be positive. A company lost 30,000 yuan last year, which can be recorded as ____ million yuan." parts={["(1) The number b represented by the point B on the number axis is ____.", "(2) The number represented by point P is ____."]} chapter="Chapter 1 Rational Numbers"/>
        </div>),
        },
        {
            title: "Pending review",
            description: "The items that cannot be determined automatically will have a warning bar on the left and will never be mixed into the normal questions.",
            code: `<QuestionCard
  number="7"
  kind="choice"
  stem="Among the following formulas, the correct one is ( )."
  issues={[{ label: "Less than 4 options" }, { label: "Question numbers are not consecutive" }]}
When
  actions={<Button size="sm" variant="ghost">Go to proofreading</Button>}
/>`,
            render: () => (<div className="w-full max-w-2xl">
          <QuestionCard number="7" kind="choice" stem="Among the following formulas, the correct one is ( )." options={[{ label: "A", text: "-|-16|>0" }]} issues={[{ label: "Less than 4 options" }, { label: "Question numbers are not consecutive" }]} actions={<Button size="sm" variant="ghost">
                Go to proofreading
              </Button>}/>
        </div>),
        },
    ],
    controls: [
        { prop: "number", type: "text", defaultValue: "3", label: "Question number" },
        {
            prop: "kind",
            type: "select",
            options: ["choice", "fill", "solution", "judge"],
            defaultValue: "choice",
            label: "Question type",
        },
        { prop: "stem", type: "text", defaultValue: "Convert \\frac{3}{8} into a decimal ( ).", label: "Question stem" },
        { prop: "difficulty", type: "text", defaultValue: "A Group", label: "Layering" },
        { prop: "compact", type: "boolean", defaultValue: false, label: "Compact" },
    ],
    states: [
        {
            name: "Multiple choice questions",
            render: () => (<QuestionCard number="2" kind="choice" stem="Convert \\frac{3}{8} into a decimal ( )." options={[
                    { label: "A", text: "0.125" },
                    { label: "B", text: "0.250" },
                    { label: "C", text: "0.375" },
                    { label: "D", text: "0.625" },
                ]}/>),
        },
        {
            name: "Fill in the blanks",
            render: () => <QuestionCard number="11" kind="fill" stem="A loss of 30,000 yuan last year can be recorded as ____ million yuan."/>,
        },
        {
            name: "Answer the question",
            render: () => (<QuestionCard number="17" kind="solution" stem="Fill in the following numbers into the corresponding collection circles:" parts={["(1) Positive number set", "(2) Negative integer set"]}/>),
        },
        {
            name: "Pending review",
            render: () => (<QuestionCard number="7" kind="choice" stem="Among the following formulas, the correct one is ( )." issues={[{ label: "Less than 4 options" }]}/>),
        },
        {
            name: "Compact",
            render: () => <QuestionCard number="5" kind="fill" stem="When m<0, |-3m|=____." compact/>,
        },
    ],
    renderWithProps: (p) => (<QuestionCard number={String(p.number ?? "")} kind={p.kind as "choice" | "fill" | "solution" | "judge"} difficulty={String(p.difficulty ?? "")} stem={String(p.stem ?? "")} compact={Boolean(p.compact)}/>),
    toCode: (p) => `<QuestionCard number="${String(p.number ?? "")}" kind="${String(p.kind ?? "choice")}" stem={${JSON.stringify(String(p.stem ?? ""))}} />`,
};
