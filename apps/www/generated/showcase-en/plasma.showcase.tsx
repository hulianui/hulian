"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Plasma } from "../../../../packages/ui/src/plasma/plasma";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 285)" }}>
      {children}
    </div>);
}
export const plasmaShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative overflow-hidden container; the default main color reads --color-chart-1, adaptive light and dark, surging upward.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Plasma />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Plasma
  </div>
</div>`,
            render: () => (<Stage>
          <Plasma />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Plasma
          </div>
        </Stage>),
        },
        {
            title: "Custom color \u00B7 Reciprocating flow",
            description: "color connects to any CSS color; direction=\"pingpong\" allows the plasma to reciprocate smoothly forward and backward (smoothstep slows down without sudden changes).",
            code: `<Plasma color="oklch(0.72 0.22 30)" direction="pingpong" speed={1.4} />`,
            render: () => (<Stage>
          <Plasma color="oklch(0.72 0.22 30)" direction="pingpong" speed={1.4}/>
        </Stage>),
        },
        {
            title: "Darken background \u00B7 Turn off interaction",
            description: "opacity darkens as a soft background; mouseInteractive={false} turns off pointer disturbance and does not hang up monitoring, purely automatic flow.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Plasma opacity={0.5} mouseInteractive={false} scale={1.3} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">Hulian Component Library</p>
    <p className="text-xs text-white/60">Plasma \u00B7 WebGL \u00B7 Light and dark adaptive</p>
  </div>
</div>`,
            render: () => (<Stage>
          <Plasma opacity={0.5} mouseInteractive={false} scale={1.3}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Plasma · WebGL · Light and dark adaptive</p>
          </div>
        </Stage>),
        },
        {
            title: "Reverse flow",
            description: "direction=\"reverse\" Let the plasma sink downwards to match the purple color.",
            code: `<Plasma color="oklch(0.65 0.24 290)" direction="reverse" />`,
            render: () => (<Stage>
          <Plasma color="oklch(0.65 0.24 290)" direction="reverse"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 1, label: "Speed" },
        {
            prop: "direction",
            type: "select",
            options: ["forward", "reverse", "pingpong"],
            defaultValue: "forward",
            label: "Direction",
        },
        { prop: "scale", type: "number", defaultValue: 1, label: "Zoom" },
        { prop: "opacity", type: "number", defaultValue: 1, label: "Opacity" },
        {
            prop: "mouseInteractive",
            type: "boolean",
            defaultValue: true,
            label: "Mouse interaction",
        },
    ],
    states: [
        {
            name: "default (default\u00B7theme color plasma)",
            render: () => (<Stage>
          <Plasma />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Plasma
          </div>
        </Stage>),
        },
        {
            name: "Warm orange tone \u00B7 pingpong reciprocating",
            render: () => (<Stage>
          <Plasma color="oklch(0.72 0.22 30)" direction="pingpong" speed={1.4}/>
        </Stage>),
        },
        {
            name: "Darken background \u00B7 Turn off interaction",
            render: () => (<Stage>
          <Plasma opacity={0.5} mouseInteractive={false} scale={1.3}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Plasma · WebGL · Light and dark adaptive</p>
          </div>
        </Stage>),
        },
        {
            name: "Reverse \u00B7 Purple Tone",
            render: () => (<Stage>
          <Plasma color="oklch(0.65 0.24 290)" direction="reverse"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Plasma speed={p.speed as number} direction={p.direction as "forward" | "reverse" | "pingpong"} scale={p.scale as number} opacity={p.opacity as number} mouseInteractive={p.mouseInteractive as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Plasma
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 285)" }}>`,
        `  <Plasma`,
        `    speed={${p.speed}}`,
        `    direction="${p.direction}"`,
        `    scale={${p.scale}}`,
        `    opacity={${p.opacity}}`,
        `    mouseInteractive={${p.mouseInteractive}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
