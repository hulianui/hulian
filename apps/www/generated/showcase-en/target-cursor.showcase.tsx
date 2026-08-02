"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TargetCursor } from "../../../../packages/ui/src/target-cursor/target-cursor";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative flex h-64 w-full max-w-xl flex-wrap items-center justify-center gap-4 overflow-hidden rounded-xl border border-border p-6" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
function Target({ label }: {
    label: string;
}) {
    return (<div className="cursor-target rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-white/80">
      {label}
    </div>);
}
export const targetCursorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Container scope: The root node absolute is anchored to the parent container, the pointer appears as soon as it enters, moves to the .cursor-target element, and the four-corner crosshair expands and wraps its bounding box.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl border">
  <button className="cursor-target rounded-lg border px-5 py-3">Aim at me</button>
  <button className="cursor-target rounded-lg border px-5 py-3">Try this too</button>
  <TargetCursor />
</div>`,
            render: () => (<Stage>
          <Target label="Target me"/>
          <Target label="Also try this"/>
          <TargetCursor />
        </Stage>),
        },
        {
            title: "Main color cursor \u00B7 Fast rotation",
            description: "color passes token to change the main color of the cursor. The smaller the spinDuration, the faster the four corners will rotate.",
            code: `<div className="relative">
  <button className="cursor-target">primary</button>
  <TargetCursor color="var(--color-primary)" spinDuration={0.8} />
</div>`,
            render: () => (<Stage>
          <Target label="primary"/>
          <Target label="spin 0.8s"/>
          <TargetCursor color="var(--color-primary)" spinDuration={0.8}/>
        </Stage>),
        },
        {
            title: "Sticky Package",
            description: "The larger the hoverDuration, the \"stickier\" the easing movement of the target wrapped in the four corners will be, and the adsorption will feel slower and smoother.",
            code: `<div className="relative">
  <button className="cursor-target">Slowly stick over</button>
  <TargetCursor color="var(--color-chart-1)" hoverDuration={0.6} />
</div>`,
            render: () => (<Stage>
          <Target label="Slowly stick to it"/>
          <TargetCursor color="var(--color-chart-1)" hoverDuration={0.6}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "spinDuration", type: "number", defaultValue: 2, label: "Spin seconds" },
        { prop: "hoverDuration", type: "number", defaultValue: 0.2, label: "Package slow motion seconds" },
        {
            prop: "color",
            type: "select",
            options: [
                "var(--color-foreground)",
                "var(--color-primary)",
                "var(--color-chart-1)",
            ],
            defaultValue: "var(--color-foreground)",
            label: "Cursor main color",
        },
    ],
    states: [
        {
            name: "default (Moved into the block and framed by the crosshair)",
            render: () => (<Stage>
          <Target label="Target me"/>
          <Target label="Also try this"/>
          <TargetCursor />
        </Stage>),
        },
        {
            name: "Main color cursor \u00B7 Fast rotation",
            render: () => (<Stage>
          <Target label="primary"/>
          <Target label="spin 0.8s"/>
          <TargetCursor color="var(--color-primary)" spinDuration={0.8}/>
        </Stage>),
        },
        {
            name: "Sticky Package (hoverDuration Large)",
            render: () => (<Stage>
          <Target label="Slowly stick to it"/>
          <TargetCursor color="var(--color-chart-1)" hoverDuration={0.6}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Target label="Target me"/>
      <Target label="One more"/>
      <TargetCursor spinDuration={p.spinDuration as number} hoverDuration={p.hoverDuration as number} color={p.color as string}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative">`,
        `  <button className="cursor-target">Aim at me</button>`,
        `  <TargetCursor`,
        `    spinDuration={${p.spinDuration}}`,
        `    hoverDuration={${p.hoverDuration}}`,
        `    color="${p.color}"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
