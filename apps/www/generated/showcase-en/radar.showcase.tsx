"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Radar } from "../../../../packages/ui/src/radar/radar";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const radarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default main color is chart token, and the background color is transparent; it comes with absolute inset-0 z-0 when placed in the relative container.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <Radar />
</div>`,
            render: () => (<Stage>
          <Radar />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Radar
          </div>
        </Stage>),
        },
        {
            title: "Dense ring \u00B7 Double flap quick scan",
            description: "ringCount/spokeCount Control ring and spoke density, sweepLobes=2 Two beams of symmetrical scanning arms at the same time.",
            code: `<Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2} />`,
            render: () => (<Stage>
          <Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2}/>
        </Stage>),
        },
        {
            title: "Customize the main color",
            description: "color Pass any CSS color to overwrite the default token, brightness brighten the entire disk.",
            code: `<Radar color="oklch(0.78 0.16 165)" brightness={1.4} scale={0.45} />`,
            render: () => (<Stage>
          <Radar color="oklch(0.78 0.16 165)" brightness={1.4} scale={0.45}/>
        </Stage>),
        },
        {
            title: "Wide scan arm \u00B7 No spokes",
            description: "spokeCount=0 Remove the spokes, sweepWidth widen the scanning beam, turn off the mouse parallax to make a purely static background.",
            code: `<Radar
  spokeCount={0}
  sweepWidth={1}
  sweepSpeed={0.8}
  enableMouseInteraction={false}
/>`,
            render: () => (<Stage>
          <Radar spokeCount={0} sweepWidth={1} sweepSpeed={0.8} enableMouseInteraction={false}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "scale", type: "number", defaultValue: 0.5, label: "Zoom" },
        { prop: "ringCount", type: "number", defaultValue: 10, label: "Ring number" },
        { prop: "spokeCount", type: "number", defaultValue: 10, label: "Number of spokes" },
        { prop: "sweepSpeed", type: "number", defaultValue: 1, label: "Scan speed" },
        { prop: "sweepLobes", type: "number", defaultValue: 1, label: "Number of scanning flaps" },
        { prop: "brightness", type: "number", defaultValue: 1, label: "Brightness" },
        {
            prop: "enableMouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse Parallax",
        },
    ],
    states: [
        {
            name: "default (default parameters\u00B7main color chart token)",
            render: () => (<Stage>
          <Radar />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Radar
          </div>
        </Stage>),
        },
        {
            name: "Dense ring + double flap quick scan",
            render: () => (<Stage>
          <Radar ringCount={16} spokeCount={16} sweepSpeed={1.8} sweepLobes={2}/>
        </Stage>),
        },
        {
            name: "Custom color (turquoise) \u00B7 High brightness",
            render: () => (<Stage>
          <Radar color="oklch(0.78 0.16 165)" brightness={1.4} scale={0.45}/>
        </Stage>),
        },
        {
            name: "Wide scan arm \u00B7 No spokes \u00B7 Parallax off",
            render: () => (<Stage>
          <Radar spokeCount={0} sweepWidth={1} sweepSpeed={0.8} enableMouseInteraction={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Radar scale={p.scale as number} ringCount={p.ringCount as number} spokeCount={p.spokeCount as number} sweepSpeed={p.sweepSpeed as number} sweepLobes={p.sweepLobes as number} brightness={p.brightness as number} enableMouseInteraction={p.enableMouseInteraction as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <Radar`,
        `    scale={${p.scale}}`,
        `    ringCount={${p.ringCount}}`,
        `    spokeCount={${p.spokeCount}}`,
        `    sweepSpeed={${p.sweepSpeed}}`,
        `    sweepLobes={${p.sweepLobes}}`,
        `    brightness={${p.brightness}}`,
        `    enableMouseInteraction={${p.enableMouseInteraction}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
