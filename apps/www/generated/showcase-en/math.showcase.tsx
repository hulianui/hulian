"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Formula } from "../../../../packages/ui/src/math/math";
const NOTATIONS: {
    label: string;
    src: string;
}[] = [
    { label: "Fraction", src: "\\frac{16}{9}" },
    { label: "Radical / index", src: "\\sqrt{a^{2}+b^{2}} and \\sqrt[3]{8}" },
    { label: "Superscript", src: "y=ax^{2} and 90^\\circ" },
    { label: "Subscript", src: "a_{1}+a_n=S_\\beta" },
    { label: "Answer blank", src: "recorded as ____ million" },
    { label: "Overline / hat", src: "\\overline{AB} and \\widehat{ABC}" },
    { label: "Vector arrow", src: "\\overrightarrow{AB} and \\vec{a}" },
    { label: "Arc", src: "\\overset{\\frown}{AB}" },
    { label: "Number sets", src: "\\mathbb{Q}\\subset\\mathbb{R}" },
    { label: "Font wrapper", src: "\\text{Group A} and \\mathbf{Group B}" },
    { label: "Delimiters", src: "\\left(\\frac{a+b}{c}\\right)^{n}" },
    { label: "Escaped characters", src: "\\{x\\mid x>0\\}" },
    { label: "Symbol commands", src: "\\angle ABC\\cong\\triangle DEF" },
];
export const mathShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Why you need it",
            description: "One question-bank string, two renderings: as plain text it leaks the raw notation, while Formula turns it into real mathematical typesetting. That contrast is the test for whether you need this component.",
            code: `const src = "Convert \\\\frac{3}{8} to a decimal: ____ ,then compare \\\\sqrt{2} with \\\\frac{3}{2}."

{/* plain text: the notation leaks */}
<p>{src}</p>

{/* real mathematical typesetting */}
<Formula>{src}</Formula>`,
            render: () => {
                const src = "Convert \\frac{3}{8} to a decimal: ____ ,then compare \\sqrt{2} with \\frac{3}{2}.";
                return (<div className="w-full space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="mb-1.5 text-xs text-muted">Rendered as plain text</div>
              <p className="text-base leading-8">{src}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="mb-1.5 text-xs text-muted">Formula</div>
              <p className="text-base leading-8">
                <Formula>{src}</Formula>
              </p>
            </div>
          </div>);
            },
        },
        {
            title: "Bare notation and answer blanks",
            description: "When upstream has not wrapped formulas in $\u2026$ yet \u2014 which is exactly how stems come out of PDF/Word/OCR \u2014 the whole string falls back to bare-notation splitting and still typesets; ____ becomes a writable slot rather than four underscores.",
            code: `{/* Not a single $ \u2014 the splitter finds the formula boundaries */}
<Formula>{"Convert \\\\frac{3}{8} to a decimal: ____"}</Formula>

{/* Answer blanks are recognised outside $ too */}
<Formula>{"$\\\\frac{3}{8}$ as a decimal is ____"}</Formula>`,
            render: () => (<div className="w-full space-y-2 text-base leading-8">
          <p>
            <Formula>{"Convert \\frac{3}{8} to a decimal: ____ ,so a_1=____ ."}</Formula>
          </p>
          <p>
            <Formula blankWidth={4}>{"$\\frac{3}{8}$ as a decimal is ____ (blankWidth=4)"}</Formula>
          </p>
        </div>),
        },
        {
            title: "Common notation",
            description: "What you write and what it typesets to, for the notation that shows up most in question stems, stacked one above the other. This is not a capability list \u2014 KaTeX is underneath, and it supports the whole of LaTeX.",
            code: `const NOTATIONS = [
  { label: "Fraction", src: "\\\\frac{16}{9}" },
  { label: "Radical / index", src: "\\\\sqrt{a^{2}+b^{2}} and \\\\sqrt[3]{8}" },
  // \u2026
]

<div className="grid gap-3 sm:grid-cols-2">
  {NOTATIONS.map(({ label, src }) => (
    <div key={src} className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted">{label}</div>
      <code className="mt-1 block font-mono text-xs break-all text-muted">{src}</code>
      <p className="mt-2 border-t border-border pt-2 text-base leading-8">
        <Formula>{src}</Formula>
      </p>
    </div>
  ))}
</div>`,
            render: () => (<div className="grid w-full gap-3 sm:grid-cols-2">
          {NOTATIONS.map(({ label, src }) => (<div key={src} className="rounded-lg border border-border p-3">
              <div className="text-xs text-muted">{label}</div>
              <code className="mt-1 block font-mono text-xs break-all text-muted">{src}</code>
              <p className="mt-2 border-t border-border pt-2 text-base leading-8">
                <Formula>{src}</Formula>
              </p>
            </div>))}
        </div>),
        },
        {
            title: "Piecewise function",
            description: "The workhorse of senior-high function questions. Flattened onto one line with row separators turned into semicolons, the stem stops being readable \u2014 this is real two-dimensional layout.",
            code: `<Formula>{"$$f(x)=\\\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\\\\\ e^{x}+\\\\ln(x+1), & x \\\\geq 0 \\\\end{cases}$$"}</Formula>`,
            render: () => (<Formula>
          {"$$f(x)=\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\ e^{x}+\\ln(x+1), & x \\geq 0 \\end{cases}$$"}
        </Formula>),
        },
        {
            title: "Prose and formulas interleaved",
            description: "Only content inside the delimiters is typeset; everything outside is emitted verbatim \u2014 the boundary is carried explicitly by the upstream data rather than guessed at by the rendering layer.",
            code: `<Formula>{"Given that $f(x)=x^{2}$ is increasing on the interval, find $f(1)$."}</Formula>`,
            render: () => (<p className="text-base leading-8">
          <Formula>
            {"Given that $f(x)=x^{2}$ is increasing on the interval, find $f(1)$."}
          </Formula>
        </p>),
        },
        {
            title: "Large delimiters",
            description: "Bracket height grows with the content instead of being a fixed-height character.",
            code: `<Formula mode="math" display>{"\\\\left( \\\\frac{a+b}{c} \\\\right)^{n}"}</Formula>`,
            render: () => (<Formula mode="math" display>
          {"\\left( \\frac{a+b}{c} \\right)^{n} = \\left[ \\sum_{i=1}^{n} x_i \\right]"}
        </Formula>),
        },
        {
            title: "Sums, integrals, limits",
            description: "Under block layout the limits sit directly above and below the operator instead of being squeezed into scripts.",
            code: `<Formula mode="math" display>{"\\\\int_{0}^{1} x^{2}\\\\,dx = \\\\frac{1}{3}"}</Formula>`,
            render: () => (<Formula mode="math" display>
          {"\\int_{0}^{1} x^{2}\\,dx = \\frac{1}{3} \\quad \\lim_{n \\to \\infty} \\frac{1}{n} = 0"}
        </Formula>),
        },
        {
            title: "Matrices",
            description: "pmatrix, bmatrix, and vmatrix are all recognised, each with its own delimiters.",
            code: `<Formula mode="math" display>{"\\\\begin{pmatrix} a & b \\\\\\\\ c & d \\\\end{pmatrix}"}</Formula>`,
            render: () => (<Formula mode="math" display>
          {"\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{vmatrix} 1 & 2 \\\\ 3 & 4 \\end{vmatrix}"}
        </Formula>),
        },
        {
            title: "Broken data stays visible",
            description: "An unrecognised control sequence is highlighted in place and shown verbatim while everything around it is typeset normally \u2014 quietly rendering something that merely looks right is the dangerous outcome.",
            code: `<Formula mode="math">{"\\\\begin{cases}x=my\\\\y^2=6x\\\\end{cases}"}</Formula>`,
            render: () => <Formula mode="math">{"\\begin{cases}x=my\\y^2=6x\\end{cases}"}</Formula>,
        },
    ],
    controls: [
        {
            prop: "children",
            type: "text",
            defaultValue: "$$f(x)=\\begin{cases} x^{2}, & x<0 \\\\ e^{x}, & x \\geq 0 \\end{cases}$$",
            label: "Contents",
        },
        { prop: "mode", type: "select", options: ["mixed", "math"], defaultValue: "mixed", label: "Mode" },
        { prop: "display", type: "boolean", defaultValue: false, label: "Block (mode=math only)" },
        { prop: "blankWidth", type: "number", defaultValue: 2.5, label: "Blank width (em)" },
    ],
    states: [
        { name: "Piecewise function", render: () => <Formula>{"$\\begin{cases} x, & x>0 \\\\ -x, & x\\leq 0 \\end{cases}$"}</Formula> },
        { name: "Matrices", render: () => <Formula mode="math">{"\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}"}</Formula> },
        { name: "Sum", render: () => <Formula mode="math">{"\\sum_{i=1}^{n} i^{2}"}</Formula> },
        { name: "Integral", render: () => <Formula mode="math">{"\\int_{a}^{b} f(x)\\,dx"}</Formula> },
        { name: "Large delimiter", render: () => <Formula mode="math">{"\\left(\\frac{a}{b}\\right)^{n}"}</Formula> },
        { name: "Inline in prose", render: () => <Formula>{"holds when $(x+1)$ is positive"}</Formula> },
        { name: "Block", render: () => <Formula>{"$$E=mc^{2}$$"}</Formula> },
        { name: "Unpaired $ stays literal", render: () => <Formula>{"Priced at $100"}</Formula> },
        { name: "Bare notation (no $)", render: () => <Formula>{"Convert \\frac{3}{8} to a decimal"}</Formula> },
        { name: "Answer blank", render: () => <Formula>{"recorded as ____ million"}</Formula> },
        { name: "Broken data highlighted", render: () => <Formula mode="math">{"x=\\y+1"}</Formula> },
    ],
    renderWithProps: (p) => (<Formula mode={p.mode === "math" ? "math" : "mixed"} display={Boolean(p.display)} blankWidth={Number(p.blankWidth ?? 2.5)}>
      {String(p.children ?? "")}
    </Formula>),
    toCode: (p) => `<Formula${p.mode === "math" ? " mode=\"math\"" : ""}${p.display && p.mode === "math" ? " display" : ""}>{${JSON.stringify(String(p.children ?? ""))}}</Formula>`,
};
