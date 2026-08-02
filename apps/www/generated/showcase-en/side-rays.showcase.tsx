"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { SideRays } from "../../../../packages/ui/src/side-rays/side-rays";
import type { SideRaysOrigin } from "../../../../packages/ui/src/side-rays/side-rays.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const sideRaysShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "By default, it diverges from the upper right corner and eats chart-1/chart-2 token in two bundles; it comes with absolute inset-0 z-0 when placed in the relative container.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <SideRays opacity={0.85} />
</div>`,
            render: () => (<Stage>
          <SideRays opacity={0.85}/>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            SideRays
          </div>
        </Stage>),
        },
        {
            title: "Starting corner \u00B7 Custom color",
            description: "origin four corners are optional, rayColor1/rayColor2 specifies double beam colors to be superimposed into mixed colors.",
            code: `<SideRays
  origin="bottom-left"
  rayColor1="oklch(0.78 0.18 70)"
  rayColor2="oklch(0.7 0.22 30)"
  intensity={2.4}
  opacity={0.8}
/>`,
            render: () => (<Stage>
          <SideRays origin="bottom-left" rayColor1="oklch(0.78 0.18 70)" rayColor2="oklch(0.7 0.22 30)" intensity={2.4} opacity={0.8}/>
        </Stage>),
        },
        {
            title: "Come together \u00B7 High intensity",
            description: "spread is turned down to make the two beams gather into a beam of light, intensity is brightened, and falloff is controlled to attenuate with distance.",
            code: `<SideRays spread={1} intensity={3} falloff={1.9} opacity={0.9} />`,
            render: () => (<Stage>
          <SideRays spread={1} intensity={3} falloff={1.9} opacity={0.9}/>
        </Stage>),
        },
        {
            title: "Color removal \u00B7 Slight tilt",
            description: "saturation=0 Grayscale beam (minimalist style), tilt rotates the entire sector around the light source point.",
            code: `<SideRays saturation={0} tilt={18} opacity={0.7} />`,
            render: () => (<Stage>
          <SideRays saturation={0} tilt={18} opacity={0.7}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 2.5, label: "Speed" },
        { prop: "intensity", type: "number", defaultValue: 2, label: "Strength" },
        { prop: "spread", type: "number", defaultValue: 2, label: "Zhang Jiao" },
        {
            prop: "origin",
            type: "select",
            options: ["top-right", "top-left", "bottom-right", "bottom-left"],
            defaultValue: "top-right",
            label: "Starting corner",
        },
        { prop: "opacity", type: "number", defaultValue: 0.85, label: "Opacity" },
    ],
    states: [
        {
            name: "default (upper right corner\u00B7Default parameters)",
            render: () => (<Stage>
          <SideRays opacity={0.85}/>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            SideRays
          </div>
        </Stage>),
        },
        {
            name: "Starting point in the lower left corner \u00B7 Warm color double beam",
            render: () => (<Stage>
          <SideRays origin="bottom-left" rayColor1="oklch(0.78 0.18 70)" rayColor2="oklch(0.7 0.22 30)" intensity={2.4} opacity={0.8}/>
        </Stage>),
        },
        {
            name: "Come together \u00B7 High intensity",
            render: () => (<Stage>
          <SideRays spread={1} intensity={3} falloff={1.9} opacity={0.9}/>
        </Stage>),
        },
        {
            name: "Color removal (saturation 0)\u00B7 Slight tilt",
            render: () => (<Stage>
          <SideRays saturation={0} tilt={18} opacity={0.7}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <SideRays speed={p.speed as number} intensity={p.intensity as number} spread={p.spread as number} origin={p.origin as SideRaysOrigin} opacity={p.opacity as number}/>
      <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
        SideRays
      </div>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <SideRays`,
        `    speed={${p.speed}}`,
        `    intensity={${p.intensity}}`,
        `    spread={${p.spread}}`,
        `    origin="${p.origin}"`,
        `    opacity={${p.opacity}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
