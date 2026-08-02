"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GridMotion } from "../../../../packages/ui/src/grid-motion/grid-motion";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
const WORDS = [
    "Hulian",
    "Component Library",
    "Enterprise level",
    "High quality",
    "Native adaptation",
    "Token",
    "Animation",
];
export const gridMotionShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default is 4\u00D77 grid, odd and even rows move horizontally with the mouse in reverse parallax translation; if insufficient, use placeholder text to make up for it.",
            code: `<div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
  <GridMotion className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <GridMotion className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Custom text + halo color",
            description: "items passes the content array (strings are used as text, the beginning of http is used as pictures), gradientColor changes the center halo.",
            code: `<GridMotion
  className="absolute inset-0"
  gradientColor="var(--color-chart-1)"
  items={["Hulian", "Component Library", "Enterprise Level", "High Quality", "Native Adaptation", "Token", "Animation"]}
/>`,
            render: () => (<Stage>
          <GridMotion className="absolute inset-0" gradientColor="var(--color-chart-1)" items={Array.from({ length: 28 }, (_, i) => WORDS[i % WORDS.length])}/>
        </Stage>),
        },
        {
            title: "Compact grid + small parallax",
            description: "rows/columns refines the grid, and maxMoveAmount controls the maximum translation amplitude of each row.",
            code: `<GridMotion
  className="absolute inset-0"
  rows={6}
  columns={9}
  maxMoveAmount={160}
  gradientColor="var(--color-chart-4)"
/>`,
            render: () => (<Stage>
          <GridMotion className="absolute inset-0" rows={6} columns={9} maxMoveAmount={160} gradientColor="var(--color-chart-4)"/>
        </Stage>),
        },
        {
            title: "Strong perspective (large rotation + large parallax)",
            description: "rotate Adjust the perspective oblique angle. The larger the maxMoveAmount, the more exaggerated the parallax.",
            code: `<GridMotion className="absolute inset-0" rotate={-25} maxMoveAmount={420} />`,
            render: () => (<Stage>
          <GridMotion className="absolute inset-0" rotate={-25} maxMoveAmount={420}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "rows", type: "number", defaultValue: 4, label: "Number of lines" },
        { prop: "columns", type: "number", defaultValue: 7, label: "Number of columns" },
        {
            prop: "maxMoveAmount",
            type: "number",
            defaultValue: 300,
            label: "Maximum parallax px",
        },
        { prop: "rotate", type: "number", defaultValue: -15, label: "Rotation angle deg" },
    ],
    states: [
        {
            name: "default (default 4\u00D77\u00B7placeholder text)",
            render: () => (<Stage>
          <GridMotion className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Custom text + warm glow",
            render: () => (<Stage>
          <GridMotion className="absolute inset-0" gradientColor="var(--color-chart-1)" items={Array.from({ length: 28 }, (_, i) => WORDS[i % WORDS.length])}/>
        </Stage>),
        },
        {
            name: "Compact grid (6\u00D79\u00B7small parallax)",
            render: () => (<Stage>
          <GridMotion className="absolute inset-0" rows={6} columns={9} maxMoveAmount={160} gradientColor="var(--color-chart-4)"/>
        </Stage>),
        },
        {
            name: "Strong perspective (rotation -25\u00B0\u00B7large parallax)",
            render: () => (<Stage>
          <GridMotion className="absolute inset-0" rotate={-25} maxMoveAmount={420}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GridMotion className="absolute inset-0" rows={p.rows as number} columns={p.columns as number} maxMoveAmount={p.maxMoveAmount as number} rotate={p.rotate as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-72 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <GridMotion`,
        `    className="absolute inset-0"`,
        `    rows={${p.rows}}`,
        `    columns={${p.columns}}`,
        `    maxMoveAmount={${p.maxMoveAmount}}`,
        `    rotate={${p.rotate}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
