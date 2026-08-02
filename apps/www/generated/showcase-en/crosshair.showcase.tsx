"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Crosshair } from "../../../../packages/ui/src/crosshair/crosshair";
function Stage({ children, hint = "Move the mouse here", }: {
    children: React.ReactNode;
    hint?: string;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/40">
        {hint}
      </div>
      {children}
    </div>);
}
export const crosshairShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Component self-rendering absolute inset-0 is covered with the parent crosshair layer, and the following crosshair will appear when the mouse is moved into it.",
            code: `<div
  className="relative h-56 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <Crosshair />
</div>`,
            render: () => (<Stage>
          <Crosshair />
        </Stage>),
        },
        {
            title: "Color and Thickness",
            description: "color goes to token, thickness controls the line thickness.",
            code: `<Crosshair color="var(--color-chart-1)" thickness={2} />`,
            render: () => (<Stage>
          <Crosshair color="var(--color-chart-1)" thickness={2}/>
        </Stage>),
        },
        {
            title: "High viscosity tailing",
            description: "Turn down smoothing to make the crosshair following more laggy and trailing more obvious.",
            code: `<Crosshair smoothing={0.06} color="var(--color-chart-3)" />`,
            render: () => (<Stage hint="Follow slowly · More obvious tailing">
          <Crosshair smoothing={0.06} color="var(--color-chart-3)"/>
        </Stage>),
        },
        {
            title: "Turn off entry pulse",
            description: "pulseOnEnter={false} removes the jitter pulse when entering, leaving only smooth following.",
            code: `<Crosshair pulseOnEnter={false} color="var(--color-foreground)" />`,
            render: () => (<Stage>
          <Crosshair pulseOnEnter={false} color="var(--color-foreground)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "smoothing", type: "number", defaultValue: 0.15, label: "Follow Smoothing 0\u20131" },
        { prop: "thickness", type: "number", defaultValue: 1, label: "Line thickness px" },
        { prop: "pulseOnEnter", type: "boolean", defaultValue: true, label: "Enter Pulse" },
    ],
    states: [
        {
            name: "default (primary front sight)",
            render: () => (<Stage>
          <Crosshair />
        </Stage>),
        },
        {
            name: "chart-1 Color \u00B7 Bold",
            render: () => (<Stage>
          <Crosshair color="var(--color-chart-1)" thickness={2}/>
        </Stage>),
        },
        {
            name: "High viscosity tailing (smoothing 0.06)",
            render: () => (<Stage hint="Follow slowly · More obvious tailing">
          <Crosshair smoothing={0.06} color="var(--color-chart-3)"/>
        </Stage>),
        },
        {
            name: "No incoming pulse \u00B7 foreground color",
            render: () => (<Stage>
          <Crosshair pulseOnEnter={false} color="var(--color-foreground)"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Crosshair smoothing={p.smoothing as number} thickness={p.thickness as number} pulseOnEnter={p.pulseOnEnter as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Crosshair`,
        `    smoothing={${p.smoothing}}`,
        `    thickness={${p.thickness}}`,
        `    pulseOnEnter={${p.pulseOnEnter}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
