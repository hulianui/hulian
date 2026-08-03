"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Ribbons } from "../../../../packages/ui/src/ribbons/ribbons";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 285)" }}>
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/40">
        Move the mouse and the ribbon will follow you elastically
      </div>
    </div>);
}
export const ribbonsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just put it in the relative container. The default is chart token three-color streamers and elastic following mouse.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl">
  <Ribbons />
</div>`,
            render: () => (<Stage>
          <Ribbons />
        </Stage>),
        },
        {
            title: "Tail fade + wave effect",
            description: "enableFade fades the tail along the length of the ribbon, and enableShaderEffect makes the streamer vibrate sinusoidally.",
            code: `<Ribbons enableFade enableShaderEffect effectAmplitude={2} />`,
            render: () => (<Stage>
          <Ribbons enableFade enableShaderEffect effectAmplitude={2}/>
        </Stage>),
        },
        {
            title: "Thick tape slow following (wallpaper level)",
            description: "Bold + high damping + long tail + low speed magnification to create a lazy background atmosphere.",
            code: `<Ribbons
  baseThickness={50}
  baseFriction={0.94}
  maxAge={900}
  speedMultiplier={0.4}
/>`,
            render: () => (<Stage>
          <Ribbons baseThickness={50} baseFriction={0.94} maxAge={900} speedMultiplier={0.4}/>
        </Stage>),
        },
        {
            title: "Custom color \u00B7 Multiple strips scattered",
            description: "colors Each CSS color generates a streamer; the larger the offsetFactor, the wider it spreads.",
            code: `<Ribbons
  colors={[
    "var(--color-chart-1)",
    "oklch(0.72 0.22 30)",
    "oklch(0.78 0.18 60)",
    "var(--color-chart-3)",
  ]}
  offsetFactor={0.1}
  baseThickness={24}
/>`,
            render: () => (<Stage>
          <Ribbons colors={[
                    "var(--color-chart-1)",
                    "oklch(0.72 0.22 30)",
                    "oklch(0.78 0.18 60)",
                    "var(--color-chart-3)",
                ]} offsetFactor={0.1} baseThickness={24}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "baseThickness", type: "number", defaultValue: 30, label: "Thickness px" },
        { prop: "baseFriction", type: "number", defaultValue: 0.9, label: "Damping 0\u20131" },
        { prop: "maxAge", type: "number", defaultValue: 500, label: "Trailing life ms" },
        { prop: "enableFade", type: "boolean", defaultValue: false, label: "The tail fades out" },
        {
            prop: "enableShaderEffect",
            type: "boolean",
            defaultValue: false,
            label: "Fluctuation special effects",
        },
    ],
    states: [
        {
            name: "default (chart token three-color streamers)",
            render: () => (<Stage>
          <Ribbons />
        </Stage>),
        },
        {
            name: "Tail fade + wave effect",
            render: () => (<Stage>
          <Ribbons enableFade enableShaderEffect effectAmplitude={2}/>
        </Stage>),
        },
        {
            name: "Thick tape slow following (wallpaper level)",
            render: () => (<Stage>
          <Ribbons baseThickness={50} baseFriction={0.94} maxAge={900} speedMultiplier={0.4}/>
        </Stage>),
        },
        {
            name: "Custom warm color \u00B7 Multiple strips scattered",
            render: () => (<Stage>
          <Ribbons colors={[
                    "var(--color-chart-1)",
                    "oklch(0.72 0.22 30)",
                    "oklch(0.78 0.18 60)",
                    "var(--color-chart-3)",
                ]} offsetFactor={0.1} baseThickness={24}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Ribbons baseThickness={p.baseThickness as number} baseFriction={p.baseFriction as number} maxAge={p.maxAge as number} enableFade={p.enableFade as boolean} enableShaderEffect={p.enableShaderEffect as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 285)" }}>`,
        `  <Ribbons`,
        `    baseThickness={${p.baseThickness}}`,
        `    baseFriction={${p.baseFriction}}`,
        `    maxAge={${p.maxAge}}`,
        `    enableFade={${p.enableFade}}`,
        `    enableShaderEffect={${p.enableShaderEffect}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
