"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MagicRings } from "../../../../packages/ui/src/magic-rings/magic-rings";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 280)" }}>
      {children}
    </div>);
}
export const magicRingsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put relative + overflow-hidden into the dark container, MagicRings is covered with absolute inset-0.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <MagicRings className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <MagicRings className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Dense Ring \u00B7 Slow",
            description: "ringCount increases the number of layers, speed reduces the speed, and radiusStep tightens the ring spacing to obtain wallpaper-level dense rings.",
            code: `<MagicRings
  className="absolute inset-0"
  ringCount={9}
  speed={0.5}
  radiusStep={0.07}
/>`,
            render: () => (<Stage>
          <MagicRings className="absolute inset-0" ringCount={9} speed={0.5} radiusStep={0.07}/>
        </Stage>),
        },
        {
            title: "Two-color with petal split",
            description: "color/colorTwo sets the inner and outer colors, and the ring color is interpolated according to the layer; ringGap enlarges the angular crack to form a petal shape.",
            code: `<MagicRings
  className="absolute inset-0"
  color="var(--color-chart-3)"
  colorTwo="oklch(0.72 0.22 30)"
  ringGap={2.2}
  attenuation={8}
/>`,
            render: () => (<Stage>
          <MagicRings className="absolute inset-0" color="var(--color-chart-3)" colorTwo="oklch(0.72 0.22 30)" ringGap={2.2} attenuation={8}/>
        </Stage>),
        },
        {
            title: "Mouse Parallax \u00B7 Click Burst",
            description: "followMouse enables parallax following, clickBurst allows clicks to briefly zoom in and out, and hoverScale controls hover zoom.",
            code: `<MagicRings
  className="absolute inset-0"
  followMouse
  clickBurst
  hoverScale={1.25}
/>`,
            render: () => (<Stage>
          <MagicRings className="absolute inset-0" followMouse clickBurst hoverScale={1.25}/>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/50">
            Move the mouse to create parallax · Click to trigger the burst
          </div>
        </Stage>),
        },
    ],
    controls: [
        { prop: "ringCount", type: "number", defaultValue: 6, label: "Ring number 1\u201310" },
        { prop: "speed", type: "number", defaultValue: 1, label: "Speed multiplier" },
        { prop: "attenuation", type: "number", defaultValue: 10, label: "Attenuation (sharpness)" },
        { prop: "ringGap", type: "number", defaultValue: 1.5, label: "Angular Crack" },
        { prop: "blur", type: "number", defaultValue: 0, label: "Blur px" },
        { prop: "followMouse", type: "boolean", defaultValue: false, label: "Mouse Parallax" },
        { prop: "clickBurst", type: "boolean", defaultValue: false, label: "Click to explode" },
    ],
    states: [
        {
            name: "default (default parameters\u00B7chart token two-color)",
            render: () => (<Stage>
          <MagicRings className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Dense Ring + Slow (Wallpaper Level)",
            render: () => (<Stage>
          <MagicRings className="absolute inset-0" ringCount={9} speed={0.5} radiusStep={0.07}/>
        </Stage>),
        },
        {
            name: "Warm orange + petal split",
            render: () => (<Stage>
          <MagicRings className="absolute inset-0" color="var(--color-chart-3)" colorTwo="oklch(0.72 0.22 30)" ringGap={2.2} attenuation={8}/>
        </Stage>),
        },
        {
            name: "Interaction (mouse parallax + click burst)",
            render: () => (<Stage>
          <MagicRings className="absolute inset-0" followMouse clickBurst hoverScale={1.25}/>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/50">
            Move the mouse to create parallax · Click to trigger the burst
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <MagicRings className="absolute inset-0" ringCount={p.ringCount as number} speed={p.speed as number} attenuation={p.attenuation as number} ringGap={p.ringGap as number} blur={p.blur as number} followMouse={p.followMouse as boolean} clickBurst={p.clickBurst as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
        `  <MagicRings`,
        `    className="absolute inset-0"`,
        `    ringCount={${p.ringCount}}`,
        `    speed={${p.speed}}`,
        `    attenuation={${p.attenuation}}`,
        `    ringGap={${p.ringGap}}`,
        `    blur={${p.blur}}`,
        `    followMouse={${p.followMouse}}`,
        `    clickBurst={${p.clickBurst}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
