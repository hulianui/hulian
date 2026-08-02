"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LineWaves } from "../../../../packages/ui/src/line-waves/line-waves";
function Stage({ children, dark = true, }: {
    children: React.ReactNode;
    dark?: boolean;
}) {
    return (<div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10" style={{ background: dark ? "oklch(0.12 0.02 265)" : "oklch(0.96 0.005 265)" }}>
      {children}
    </div>);
}
export const lineWavesShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just put it into the relative overflow-hidden container. The component comes with absolute inset-0 z-0; the default color is chart token, and the light and shade are adaptive. The content floats on the ripple with relative z-10.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <LineWaves />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">LineWaves</p>
  </div>
</div>`,
            render: () => (<Stage>
          <LineWaves />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold tracking-tight text-white/90">LineWaves</p>
          </div>
        </Stage>),
        },
        {
            title: "Highlight + Strong Distortion",
            description: "Increase brightness to make the lines more solid and brighter (alpha varies with the brightness). The larger the warpIntensity, the more \"turbulent\" the ripples will be.",
            code: `<LineWaves brightness={0.4} warpIntensity={1.6} speed={0.5} />`,
            render: () => (<Stage>
          <LineWaves brightness={0.4} warpIntensity={1.6} speed={0.5}/>
        </Stage>),
        },
        {
            title: "Classic white line",
            description: "Transmit all three color channels to the same value (such as #ffffff) and turn off the hue cycle (colorCycleSpeed=0) to restore the original single-color white line of react-bits.",
            code: `<LineWaves
  color1="#ffffff"
  color2="#ffffff"
  color3="#ffffff"
  brightness={0.25}
  colorCycleSpeed={0}
/>`,
            render: () => (<Stage>
          <LineWaves color1="#ffffff" color2="#ffffff" color3="#ffffff" brightness={0.25} colorCycleSpeed={0}/>
        </Stage>),
        },
        {
            title: "Horizontal direction \u00B7 Close interaction",
            description: "rotation=0 makes the ripples lay out horizontally; enableMouseInteraction={false} turns off the pointer disturbance and becomes pure automatic flow, suitable for purely decorative backgrounds.",
            code: `<LineWaves
  rotation={0}
  enableMouseInteraction={false}
  innerLineCount={24}
  outerLineCount={40}
  brightness={0.3}
/>`,
            render: () => (<Stage>
          <LineWaves rotation={0} enableMouseInteraction={false} innerLineCount={24} outerLineCount={40} brightness={0.3}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.3, label: "Speed" },
        { prop: "warpIntensity", type: "number", defaultValue: 1, label: "Torsional strength" },
        { prop: "rotation", type: "number", defaultValue: -45, label: "Rotation angle (degrees)" },
        { prop: "brightness", type: "number", defaultValue: 0.2, label: "Brightness" },
        {
            prop: "enableMouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse interaction",
        },
    ],
    states: [
        {
            name: "default (dark bottom\u00B7chart token color)",
            render: () => (<Stage>
          <LineWaves />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">LineWaves</p>
            <p className="text-sm text-white/50">Flowing corrugated linear array · Try moving the mouse</p>
          </div>
        </Stage>),
        },
        {
            name: "Highlight + High Distortion (brightness=0.4\u00B7warp=1.6)",
            render: () => (<Stage>
          <LineWaves brightness={0.4} warpIntensity={1.6} speed={0.5}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Raging Ripples</p>
          </div>
        </Stage>),
        },
        {
            name: "Classic white thread (three colors are the same #ffffff\u00B7Restore the original version)",
            render: () => (<Stage>
          <LineWaves color1="#ffffff" color2="#ffffff" color3="#ffffff" brightness={0.25} colorCycleSpeed={0}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/60">Classic monochrome ripple</p>
          </div>
        </Stage>),
        },
        {
            name: "Horizontal trend + off interaction (rotation=0\u00B7Static automatic flow)",
            render: () => (<Stage>
          <LineWaves rotation={0} enableMouseInteraction={false} innerLineCount={24} outerLineCount={40} brightness={0.3}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">Horizontal Line Array</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LineWaves speed={p.speed as number} warpIntensity={p.warpIntensity as number} rotation={p.rotation as number} brightness={p.brightness as number} enableMouseInteraction={p.enableMouseInteraction as boolean}/>
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">LineWaves · WebGL Background</p>
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
        `  <LineWaves`,
        `    speed={${p.speed}}`,
        `    warpIntensity={${p.warpIntensity}}`,
        `    rotation={${p.rotation}}`,
        `    brightness={${p.brightness}}`,
        `    enableMouseInteraction={${p.enableMouseInteraction}}`,
        `  />`,
        `  <div className="relative z-10">Content</div>`,
        `</div>`,
    ].join("\n"),
};
