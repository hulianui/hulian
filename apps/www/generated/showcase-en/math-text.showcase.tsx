"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MathText } from "../../../../packages/ui/src/math-text/math-text";
export const mathTextShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The fractions are stacked up and down, the superscripts are sunk into subscripts, and the blanks are filled in and rendered into writeable spaces.",
            code: `<MathText>{"Convert \\\\frac{3}{8} into a decimal as ____"}</MathText>`,
            render: () => (<p className="text-base">
          <MathText>{"Convert \\frac{3}{8} into a decimal to ____."}</MathText>
        </p>),
        },
        {
            title: "Mixed symbols in the question",
            description: "Real junior high school mathematics questions: fractions / exponents / subscripts / fill-in-the-blanks are mixed in the Chinese text.",
            code: `<MathText>{"It is known that the parabola y=ax^{2}, and the point P(2,3) is on it, then a_1=____"}</MathText>`,
            render: () => (<p className="text-base leading-8">
          <MathText>
            {"It is known that the parabola y=ax^{2} passes through the point P(2,3), then a=\\frac{3}{4}, at this time a_1=____."}
          </MathText>
        </p>),
        },
        {
            title: "Side-by-side option",
            description: "Multiple choice questions with four score options, the row height will not be messed up.",
            code: `<MathText>{"A.\\\\frac{1}{9}  B.\\\\frac{5}{9}  C.\\\\frac{16}{9}  D.\\\\frac{80}{9}"}</MathText>`,
            render: () => (<p className="text-base">
          <MathText>
            {"A.\\frac{1}{9} B.\\frac{5}{9} C.\\frac{16}{9} D.\\frac{80}{9}"}
          </MathText>
        </p>),
        },
        {
            title: "Root number",
            description: "The radicand number is marked with a horizontal line to avoid the ambiguity of \u221Aa+b; support for root exponents.",
            code: `<MathText>{"\\\\sqrt{a^{2}+b^{2}} and \\\\sqrt[3]{8}"}</MathText>`,
            render: () => (<p className="text-base">
          <MathText>{"\\sqrt{a^{2}+b^{2}} and \\sqrt[3]{8}"}</MathText>
        </p>),
        },
        {
            title: "Vectors",
            description: "Arrow width for \\vec and \\overrightarrow follows the content, so it covers single letters and multi-letter names alike.",
            code: `<MathText>{"Given \\\\overrightarrow{AB} is collinear with \\\\vec{a}"}</MathText>`,
            render: () => (<p className="text-base leading-8">
          <MathText>
            {"Given \\overrightarrow{AB} is collinear with \\vec{a}, then \\vec{a}\\cdot\\overrightarrow{AB}=0"}
          </MathText>
        </p>),
        },
        {
            title: "Sets and logic",
            description: "Senior-high staples: blackboard-bold number sets, set-builder notation, and biconditionals.",
            code: `<MathText>{"A=\\\\{x\\\\mid x\\\\in\\\\mathbb{R}\\\\}"}</MathText>`,
            render: () => (<p className="text-base leading-8">
          <MathText>
            {"Let A=\\{x\\mid x>0,x\\in\\mathbb{R}\\}, then x\\in A\\Leftrightarrow x>0"}
          </MathText>
        </p>),
        },
    ],
    controls: [
        {
            prop: "children",
            type: "text",
            defaultValue: "\\frac{3}{8} and x^{2}, fill in the blank ____",
            label: "Contents",
        },
        { prop: "blankWidth", type: "number", defaultValue: 2.5, label: "Fill in the blank width (em)" },
        { prop: "scriptScale", type: "number", defaultValue: 0.75, label: "Superscript and subscript ratio" },
    ],
    states: [
        { name: "Score", render: () => <MathText>{"\\frac{16}{9}"}</MathText> },
        { name: "superscript", render: () => <MathText>{"y=ax^{2}+bx+c"}</MathText> },
        { name: "Subscript", render: () => <MathText>{"a_1+a_2=S_n"}</MathText> },
        { name: "Root number", render: () => <MathText>{"\\sqrt{a^{2}+b^{2}}"}</MathText> },
        { name: "Fill in the blanks", render: () => <MathText>{"Can be recorded as ____ million yuan"}</MathText> },
        { name: "Vectors", render: () => <MathText>{"\\overrightarrow{AB}+\\vec{a}"}</MathText> },
        { name: "Number sets", render: () => <MathText>{"\\mathbb{Q}\\subset\\mathbb{R}"}</MathText> },
        { name: "Arc", render: () => <MathText>{"\\overset{\\frown}{AB}"}</MathText> },
        { name: "The unknown mark is left as is", render: () => <MathText>{"\\alpha+1"}</MathText> },
    ],
    renderWithProps: (p) => (<MathText blankWidth={Number(p.blankWidth ?? 2.5)} scriptScale={Number(p.scriptScale ?? 0.75)}>
      {String(p.children ?? "")}
    </MathText>),
    toCode: (p) => `<MathText>{${JSON.stringify(String(p.children ?? ""))}}</MathText>`,
};
