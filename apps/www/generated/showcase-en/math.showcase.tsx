"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Formula } from "../../../../packages/ui/src/math/math";
export const mathShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Piecewise function",
            description: "The workhorse of senior-high function questions. MathText flattens it onto one line and turns the row break into a semicolon, leaving the stem unreadable; this is real two-dimensional layout.",
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
            description: "Bracket height grows with the content \u2014 MathText can only drop the command and keep a fixed-height bracket.",
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
        { name: "Broken data highlighted", render: () => <Formula mode="math">{"x=\\y+1"}</Formula> },
    ],
    renderWithProps: (p) => (<Formula mode={p.mode === "math" ? "math" : "mixed"} display={Boolean(p.display)}>
      {String(p.children ?? "")}
    </Formula>),
    toCode: (p) => `<Formula${p.mode === "math" ? " mode=\"math\"" : ""}${p.display && p.mode === "math" ? " display" : ""}>{${JSON.stringify(String(p.children ?? ""))}}</Formula>`,
};
