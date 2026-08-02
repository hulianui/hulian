"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TextPressure } from "../../../../packages/ui/src/text-pressure/text-pressure";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-44 w-full max-w-xl overflow-hidden rounded-xl border border-border px-6" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const textPressureShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Move the mouse to the text on the dark stage, and the font will be extruded and deformed in real time according to the distance of the cursor.",
            code: `<div
  className="relative h-44 overflow-hidden rounded-xl px-6"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <TextPressure
    text="Compressa"
    textColor="oklch(0.98 0 0)"
    className="flex items-center"
  />
</div>`,
            render: () => (<Stage>
          <TextPressure text="Compressa" textColor="oklch(0.98 0 0)" className="flex items-center"/>
        </Stage>),
        },
        {
            title: "Stroke hollow",
            description: "stroke Make the center of the text transparent and leave only the stroke outline of token to create a hollow neon title.",
            code: `<TextPressure
  text="Hulian"
  stroke
  textColor="oklch(0.98 0 0)"
  strokeColor="var(--color-primary)"
  className="flex items-center"
/>`,
            render: () => (<Stage>
          <TextPressure text="Hulian" stroke textColor="oklch(0.98 0 0)" strokeColor="var(--color-primary)" className="flex items-center"/>
        </Stage>),
        },
        {
            title: "Transparency linkage",
            description: "alpha After turning it on, the characters further away from the cursor will become lighter and appear when they are closer.",
            code: `<TextPressure
  text="Pressure"
  alpha
  textColor="oklch(0.98 0 0)"
  className="flex items-center"
/>`,
            render: () => (<Stage>
          <TextPressure text="Pressure" alpha textColor="oklch(0.98 0 0)" className="flex items-center"/>
        </Stage>),
        },
        {
            title: "Font weight axis only",
            description: "Turn off the width and tilt axis, and only let the font weight change with proximity, and the effect is more restrained.",
            code: `<TextPressure
  text="Bold"
  width={false}
  italic={false}
  textColor="oklch(0.98 0 0)"
  className="flex items-center"
/>`,
            render: () => (<Stage>
          <TextPressure text="Bold" width={false} italic={false} textColor="oklch(0.98 0 0)" className="flex items-center"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "text", type: "text", defaultValue: "Compressa", label: "Text" },
        { prop: "weight", type: "boolean", defaultValue: true, label: "Font weight axis" },
        { prop: "width", type: "boolean", defaultValue: true, label: "Width axis" },
        { prop: "italic", type: "boolean", defaultValue: true, label: "Tilt axis" },
        { prop: "alpha", type: "boolean", defaultValue: false, label: "Transparency" },
        { prop: "stroke", type: "boolean", defaultValue: false, label: "Stroke hollow" },
    ],
    states: [
        {
            name: "default (Move the mouse to see the font pressure)",
            render: () => (<Stage>
          <TextPressure text="Compressa" textColor="oklch(0.98 0 0)" className="flex items-center"/>
        </Stage>),
        },
        {
            name: "Stroke hollow (token primary stroke)",
            render: () => (<Stage>
          <TextPressure text="Hulian" stroke textColor="oklch(0.98 0 0)" strokeColor="var(--color-primary)" className="flex items-center"/>
        </Stage>),
        },
        {
            name: "Transparency linkage (the further away, the lighter it becomes)",
            render: () => (<Stage>
          <TextPressure text="Pressure" alpha textColor="oklch(0.98 0 0)" className="flex items-center"/>
        </Stage>),
        },
        {
            name: "Weight only (off width/slant)",
            render: () => (<Stage>
          <TextPressure text="Bold" width={false} italic={false} textColor="oklch(0.98 0 0)" className="flex items-center"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <TextPressure text={(p.text as string) || "Compressa"} weight={p.weight as boolean} width={p.width as boolean} italic={p.italic as boolean} alpha={p.alpha as boolean} stroke={p.stroke as boolean} textColor="oklch(0.98 0 0)" strokeColor="var(--color-primary)" className="flex items-center"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-44 overflow-hidden rounded-xl px-6"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <TextPressure`,
        `    text=${JSON.stringify((p.text as string) || "Compressa")}`,
        `    weight={${p.weight}}`,
        `    width={${p.width}}`,
        `    italic={${p.italic}}`,
        `    alpha={${p.alpha}}`,
        `    stroke={${p.stroke}}`,
        `    className="flex items-center"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
