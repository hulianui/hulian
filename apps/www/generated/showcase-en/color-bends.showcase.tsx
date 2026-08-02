"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ColorBends } from "../../../../packages/ui/src/color-bends/color-bends";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const colorBendsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default ribbon flow field, the color is chart token, adaptive light and dark theme.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ColorBends />
</div>`,
            render: () => (<Stage>
          <ColorBends />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            ColorBends
          </div>
        </Stage>),
        },
        {
            title: "Custom color matching + high frequency",
            description: "colors transfers the warm color array, and increases frequency to make the ribbon thinner.",
            code: `<ColorBends
  colors={[
    "oklch(0.72 0.22 30)",
    "oklch(0.78 0.18 60)",
    "oklch(0.68 0.2 350)",
  ]}
  frequency={2}
  scale={0.8}
  speed={0.3}
/>`,
            render: () => (<Stage>
          <ColorBends colors={[
                    "oklch(0.72 0.22 30)",
                    "oklch(0.78 0.18 60)",
                    "oklch(0.68 0.2 350)",
                ]} frequency={2} scale={0.8} speed={0.3}/>
        </Stage>),
        },
        {
            title: "Automatic rotation (wallpaper level)",
            description: "autoRotate lets the flow field continue to rotate, and intensity brightens as the content background.",
            code: `<ColorBends autoRotate={8} intensity={2.2} bandWidth={8} speed={0.15} />`,
            render: () => (<Stage>
          <ColorBends autoRotate={8} intensity={2.2} bandWidth={8} speed={0.15}/>
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Multi-color flow field · WebGL · Theme perception</p>
          </div>
        </Stage>),
        },
        {
            title: "Solid color single layer",
            description: "iterations=1 without folding, noise=0 with grain removal to get a clean and stretched ribbon.",
            code: `<ColorBends iterations={1} noise={0} warpStrength={0.6} />`,
            render: () => (<Stage>
          <ColorBends iterations={1} noise={0} warpStrength={0.6}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 0.2, label: "Flow speed" },
        { prop: "scale", type: "number", defaultValue: 1, label: "Flow field scaling" },
        { prop: "frequency", type: "number", defaultValue: 1, label: "Ripple frequency" },
        { prop: "intensity", type: "number", defaultValue: 1.5, label: "Brightness gain" },
        { prop: "bandWidth", type: "number", defaultValue: 6, label: "Ribbon width" },
        { prop: "autoRotate", type: "number", defaultValue: 0, label: "Spin speed \u00B0/s" },
        { prop: "transparent", type: "boolean", defaultValue: true, label: "Transparent background" },
    ],
    states: [
        {
            name: "default (chart token\u00B7Default parameters)",
            render: () => (<Stage>
          <ColorBends />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            ColorBends
          </div>
        </Stage>),
        },
        {
            name: "Customized warm color band + high frequency and fine",
            render: () => (<Stage>
          <ColorBends colors={[
                    "oklch(0.72 0.22 30)",
                    "oklch(0.78 0.18 60)",
                    "oklch(0.68 0.2 350)",
                ]} frequency={2} scale={0.8} speed={0.3}/>
        </Stage>),
        },
        {
            name: "Automatic rotation + high intensity (wallpaper level)",
            render: () => (<Stage>
          <ColorBends autoRotate={8} intensity={2.2} bandWidth={8} speed={0.15}/>
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Multi-color flow field · WebGL · Theme perception</p>
          </div>
        </Stage>),
        },
        {
            name: "No folding iteration + low noise net color",
            render: () => (<Stage>
          <ColorBends iterations={1} noise={0} warpStrength={0.6}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ColorBends speed={p.speed as number} scale={p.scale as number} frequency={p.frequency as number} intensity={p.intensity as number} bandWidth={p.bandWidth as number} autoRotate={p.autoRotate as number} transparent={p.transparent as boolean}/>
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        ColorBends
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <ColorBends`,
        `    speed={${p.speed}}`,
        `    scale={${p.scale}}`,
        `    frequency={${p.frequency}}`,
        `    intensity={${p.intensity}}`,
        `    bandWidth={${p.bandWidth}}`,
        `    autoRotate={${p.autoRotate}}`,
        `    transparent={${p.transparent}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
