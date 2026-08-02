"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MagnetLines } from "../../../../packages/ui/src/magnet-lines/magnet-lines";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative flex h-72 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const magnetLinesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "9\u00D79 grid of line segments, with each line pointing towards the mouse in real time like a compass.",
            code: `<MagnetLines containerSize="16rem" lineColor="var(--color-foreground)" />`,
            render: () => (<Stage>
          <MagnetLines containerSize="16rem" lineColor="var(--color-foreground)"/>
        </Stage>),
        },
        {
            title: "Fine mesh",
            description: "Increase rows/columns and narrow the line width to obtain a finer magnetic line field.",
            code: `<MagnetLines
  rows={13}
  columns={13}
  containerSize="16rem"
  lineWidth="0.4rem"
  lineHeight="2rem"
  lineColor="var(--color-chart-1)"
/>`,
            render: () => (<Stage>
          <MagnetLines rows={13} columns={13} containerSize="16rem" lineWidth="0.4rem" lineHeight="2rem" lineColor="var(--color-chart-1)"/>
        </Stage>),
        },
        {
            title: "Sparse thick lines",
            description: "Fewer rows and columns + thicker line segments, with brand colors to enhance visual decoration.",
            code: `<MagnetLines
  rows={6}
  columns={6}
  containerSize="16rem"
  lineWidth="0.8rem"
  lineHeight="3rem"
  lineColor="var(--color-primary)"
/>`,
            render: () => (<Stage>
          <MagnetLines rows={6} columns={6} containerSize="16rem" lineWidth="0.8rem" lineHeight="3rem" lineColor="var(--color-primary)"/>
        </Stage>),
        },
        {
            title: "Initial angle",
            description: "baseAngle determines the rest angle of all line segments when the pointer does not move.",
            code: `<MagnetLines
  baseAngle={45}
  containerSize="16rem"
  lineColor="var(--color-chart-2)"
/>`,
            render: () => (<Stage>
          <MagnetLines baseAngle={45} containerSize="16rem" lineColor="var(--color-chart-2)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "rows", type: "number", defaultValue: 9, label: "Number of lines" },
        { prop: "columns", type: "number", defaultValue: 9, label: "Number of columns" },
        { prop: "baseAngle", type: "number", defaultValue: -10, label: "Initial angle \u00B0" },
    ],
    states: [
        {
            name: "default (9\u00D79\u00B7Move the mouse to see the magnetic lines)",
            render: () => (<Stage>
          <MagnetLines containerSize="16rem" lineColor="var(--color-foreground)"/>
        </Stage>),
        },
        {
            name: "Fine mesh (13\u00D713)",
            render: () => (<Stage>
          <MagnetLines rows={13} columns={13} containerSize="16rem" lineWidth="0.4rem" lineHeight="2rem" lineColor="var(--color-chart-1)"/>
        </Stage>),
        },
        {
            name: "Sparse thick lines (6\u00D76\u00B7Brand color)",
            render: () => (<Stage>
          <MagnetLines rows={6} columns={6} containerSize="16rem" lineWidth="0.8rem" lineHeight="3rem" lineColor="var(--color-primary)"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <MagnetLines rows={p.rows as number} columns={p.columns as number} baseAngle={p.baseAngle as number} containerSize="16rem" lineColor="var(--color-foreground)"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative flex h-72 items-center justify-center overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <MagnetLines`,
        `    rows={${p.rows}}`,
        `    columns={${p.columns}}`,
        `    baseAngle={${p.baseAngle}}`,
        `    containerSize="16rem"`,
        `    lineColor="var(--color-foreground)"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
