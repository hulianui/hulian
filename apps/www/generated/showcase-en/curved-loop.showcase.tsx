"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CurvedLoop } from "../../../../packages/ui/src/curved-loop/curved-loop";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex h-44 w-full max-w-2xl items-center overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const curvedLoopShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The copy scrolls seamlessly along the quadratic Bezier curve. By default, it bends downward and rolls to the left, and can be dragged and moved.",
            code: `<div className="flex h-44 items-center overflow-hidden rounded-xl">
  <CurvedLoop text="HULIAN \u00B7 HULIAN \u00B7 " className="text-white" />
</div>`,
            render: () => (<Stage>
          <CurvedLoop text="HULIAN · HULIAN · " className="text-white"/>
        </Stage>),
        },
        {
            title: "Curved upward",
            description: "curveAmount Pass a negative value to make the curve convex upward (positive value is concave downward, 0 is approximately a straight line).",
            code: `<CurvedLoop text="ENTERPRISE UI \u00B7 " curveAmount={-220} />`,
            render: () => (<Stage>
          <CurvedLoop text="ENTERPRISE UI · " curveAmount={-220} className="text-[var(--color-chart-1)]"/>
        </Stage>),
        },
        {
            title: "Scroll right \u00B7 High speed",
            description: "direction=\"right\" scrolls in reverse, speed increases speed.",
            code: `<CurvedLoop text="Hulian component library \u00B7 " direction="right" speed={4} />`,
            render: () => (<Stage>
          <CurvedLoop text="Hulian component library · " direction="right" speed={4} className="text-[var(--color-chart-2)]"/>
        </Stage>),
        },
        {
            title: "Pure display (no dragging)",
            description: "interactive={false} Turn off drag and drop interaction, only automatic scrolling.",
            code: `<CurvedLoop text="HULIAN UI \u00B7 " interactive={false} />`,
            render: () => (<Stage>
          <CurvedLoop text="HULIAN UI · " interactive={false} className="text-white/80"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "text", type: "text", defaultValue: "HULIAN \u00B7 HULIAN \u00B7 ", label: "Copywriting" },
        { prop: "speed", type: "number", defaultValue: 2, label: "Speed px/frame" },
        { prop: "curveAmount", type: "number", defaultValue: 320, label: "Bending amount" },
        {
            prop: "direction",
            type: "select",
            options: ["left", "right"],
            defaultValue: "left",
            label: "Direction",
        },
        { prop: "interactive", type: "boolean", defaultValue: true, label: "Draggable" },
    ],
    states: [
        {
            name: "default (bend downward\u00B7roll left)",
            render: () => (<Stage>
          <CurvedLoop text="HULIAN · HULIAN · " className="text-white"/>
        </Stage>),
        },
        {
            name: "Bend upward (curveAmount negative value)",
            render: () => (<Stage>
          <CurvedLoop text="ENTERPRISE UI · " curveAmount={-220} className="text-[var(--color-chart-1)]"/>
        </Stage>),
        },
        {
            name: "Scroll right + high speed",
            render: () => (<Stage>
          <CurvedLoop text="Hulian component library · " direction="right" speed={4} className="text-[var(--color-chart-2)]"/>
        </Stage>),
        },
        {
            name: "Not draggable (pure display)",
            render: () => (<Stage>
          <CurvedLoop text="HULIAN UI · " interactive={false} className="text-white/80"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <CurvedLoop text={p.text as string} speed={p.speed as number} curveAmount={p.curveAmount as number} direction={p.direction as "left" | "right"} interactive={p.interactive as boolean} className="text-white"/>
    </Stage>),
    toCode: (p) => [
        `<div className="flex h-44 items-center overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <CurvedLoop`,
        `    text=${JSON.stringify(p.text)}`,
        `    speed={${p.speed}}`,
        `    curveAmount={${p.curveAmount}}`,
        `    direction="${p.direction}"`,
        `    interactive={${p.interactive}}`,
        `    className="text-white"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
