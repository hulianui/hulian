"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SoftAurora } from "../../../../packages/ui/src/soft-aurora/soft-aurora";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const softAuroraShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Set a layer of positioning containers, and SoftAurora can be used as a soft light background if it is completely covered.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <SoftAurora className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <SoftAurora className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Customized double-layer color matching",
            description: "color1 / color2 accepts any CSS color string (hex / oklch / chart token), and the two layers are misaligned and superimposed to produce mixed colors.",
            code: `<SoftAurora
  color1="var(--color-chart-3)"
  color2="oklch(0.7 0.22 20)"
  brightness={1.2}
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <SoftAurora color1="var(--color-chart-3)" color2="oklch(0.7 0.22 20)" brightness={1.2} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Highlight Active",
            description: "Pull up speed / scale / bandSpread to make the aurora denser, brighter and flow faster.",
            code: `<SoftAurora
  speed={1.4}
  scale={2.4}
  brightness={1.3}
  bandSpread={1.4}
  className="absolute inset-0"
/>`,
            render: () => (<Stage>
          <SoftAurora speed={1.4} scale={2.4} brightness={1.3} bandSpread={1.4} className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Wallpaper level (overlay content)",
            description: "Low speed, turn off mouse parallax, and use fallback to cover the title copy on the aurora, suitable for the main visual of landing pages.",
            code: `<SoftAurora
  speed={0.3}
  bandHeight={0.35}
  enableMouseInteraction={false}
  className="absolute inset-0"
  fallback={
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <p className="text-lg font-semibold text-white">Hulian Component Library</p>
      <p className="text-xs text-white/60">Soft light aurora \u00B7 WebGL \u00B7 token Coloring</p>
    </div>
  }
/>`,
            render: () => (<Stage>
          <SoftAurora speed={0.3} bandHeight={0.35} enableMouseInteraction={false} className="absolute inset-0" fallback={<div className="flex h-full flex-col items-center justify-center gap-1">
                <p className="text-lg font-semibold text-white">Hulian component library</p>
                <p className="text-xs text-white/60">Soft Aurora · WebGL · token Coloring</p>
              </div>}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.6, label: "Flow speed" },
        { prop: "scale", type: "number", defaultValue: 1.5, label: "Noise Scaling" },
        { prop: "brightness", type: "number", defaultValue: 1, label: "Brightness" },
        { prop: "bandHeight", type: "number", defaultValue: 0.5, label: "Auroral band height" },
        {
            prop: "enableMouseInteraction",
            type: "boolean",
            defaultValue: true,
            label: "Mouse Parallax",
        },
    ],
    states: [
        {
            name: "default (chart token default color)",
            render: () => (<Stage>
          <SoftAurora className="absolute inset-0"/>
          <div className="pointer-events-none relative flex h-full items-center justify-center text-sm font-medium text-white/80">
            SoftAurora
          </div>
        </Stage>),
        },
        {
            name: "Warm color double layer (orange + purple)",
            render: () => (<Stage>
          <SoftAurora color1="var(--color-chart-3)" color2="oklch(0.7 0.22 20)" brightness={1.2} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Highlight active (speed/scale full)",
            render: () => (<Stage>
          <SoftAurora speed={1.4} scale={2.4} brightness={1.3} bandSpread={1.4} className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Wallpaper level (low speed, off interaction, bottom)",
            render: () => (<Stage>
          <SoftAurora speed={0.3} bandHeight={0.35} enableMouseInteraction={false} className="absolute inset-0" fallback={<div className="flex h-full flex-col items-center justify-center gap-1">
                <p className="text-lg font-semibold text-white">Hulian component library</p>
                <p className="text-xs text-white/60">Soft Aurora · WebGL · token Coloring</p>
              </div>}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <SoftAurora speed={p.speed as number} scale={p.scale as number} brightness={p.brightness as number} bandHeight={p.bandHeight as number} enableMouseInteraction={p.enableMouseInteraction as boolean} className="absolute inset-0"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <SoftAurora`,
        `    speed={${p.speed}}`,
        `    scale={${p.scale}}`,
        `    brightness={${p.brightness}}`,
        `    bandHeight={${p.bandHeight}}`,
        `    enableMouseInteraction={${p.enableMouseInteraction}}`,
        `    className="absolute inset-0"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
