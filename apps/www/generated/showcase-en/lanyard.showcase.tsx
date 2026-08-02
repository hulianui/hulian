"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Lanyard } from "../../../../packages/ui/src/lanyard/lanyard";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-80 w-full max-w-md overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
export const lanyardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative positioning container. The component comes with a placeholder badge - drag it and let go to see the physical rebound and swing.",
            code: `<div
  className="relative h-80 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 255)" }}
>
  <Lanyard className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <Lanyard className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Customize work badge content",
            description: "Passed children to replace the placeholder badge, and the lanyard physics and drag behavior remain unchanged.",
            code: `<Lanyard className="absolute inset-0">
  <div className="w-44 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
    <div className="mx-auto mb-3 size-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/5" />
    <p className="text-sm font-semibold text-foreground">Lin Yu</p>
    <p className="mt-0.5 text-xs text-muted">Front-end engineer \u00B7 No.0421</p>
  </div>
</Lanyard>`,
            render: () => (<Stage>
          <Lanyard className="absolute inset-0">
            <div className="w-44 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
              <div className="mx-auto mb-3 size-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/5"/>
              <p className="text-sm font-semibold text-foreground">Lin Yu</p>
              <p className="mt-0.5 text-xs text-muted">Front-end Engineer · No.0421</p>
            </div>
          </Lanyard>
        </Stage>),
        },
        {
            title: "Soft heave",
            description: "Long rope + low stiffness + high damping, the remaining swing is longer and softer after letting go.",
            code: `<Lanyard
  className="absolute inset-0"
  ropeLength={160}
  stiffness={0.025}
  damping={0.965}
  title="Slow Shake Gongpai"
  subtitle="Drag and let go to see the remaining swing"
/>`,
            render: () => (<Stage>
          <Lanyard className="absolute inset-0" ropeLength={160} stiffness={0.025} damping={0.965} title="Slow shake work card" subtitle="Drag and let go to see the rest of the swing"/>
        </Stage>),
        },
        {
            title: "Customized rope color",
            description: "ropeColor accepts any CSS color (token must be prefixed with --color-).",
            code: `<Lanyard
  className="absolute inset-0"
  ropeColor="oklch(0.72 0.2 45)"
  title="VIP"
  subtitle="Orange Lanyard"
/>`,
            render: () => (<Stage>
          <Lanyard className="absolute inset-0" ropeColor="oklch(0.72 0.2 45)" title="VIP" subtitle="Orange Lanyard"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "ropeLength", type: "number", defaultValue: 120, label: "Lanyard length px" },
        { prop: "stiffness", type: "number", defaultValue: 0.045, label: "Rebound stiffness" },
        { prop: "damping", type: "number", defaultValue: 0.92, label: "Damping coefficient" },
    ],
    states: [
        {
            name: "default (default placeholder badge\u00B7can be dragged and dropped)",
            render: () => (<Stage>
          <Lanyard className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Customize work badge content",
            render: () => (<Stage>
          <Lanyard className="absolute inset-0">
            <div className="w-44 rounded-xl border border-border bg-surface p-4 text-center shadow-lg">
              <div className="mx-auto mb-3 size-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/5"/>
              <p className="text-sm font-semibold text-foreground">Lin Yu</p>
              <p className="mt-0.5 text-xs text-muted">Front-end Engineer · No.0421</p>
            </div>
          </Lanyard>
        </Stage>),
        },
        {
            name: "Long rope\u00B7soft swing (low stiffness and high damping)",
            render: () => (<Stage>
          <Lanyard className="absolute inset-0" ropeLength={160} stiffness={0.025} damping={0.965} title="Slow shake work card" subtitle="Drag and let go to see the rest of the swing"/>
        </Stage>),
        },
        {
            name: "Customized rope color (warm orange)",
            render: () => (<Stage>
          <Lanyard className="absolute inset-0" ropeColor="oklch(0.72 0.2 45)" title="VIP" subtitle="Orange Lanyard"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Lanyard className="absolute inset-0" ropeLength={p.ropeLength as number} stiffness={p.stiffness as number} damping={p.damping as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-80 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <Lanyard`,
        `    className="absolute inset-0"`,
        `    ropeLength={${p.ropeLength}}`,
        `    stiffness={${p.stiffness}}`,
        `    damping={${p.damping}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
