"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PrismaticBurst } from "../../../../packages/ui/src/prismatic-burst/prismatic-burst";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.02 275)" }}>
      {children}
    </div>);
}
export const prismaticBurstShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default continuous halo + theme chart token spectrum; placed in the relative container comes with absolute inset-0 z-0.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.13 0.02 275)" }}>
  <PrismaticBurst className="opacity-90" />
</div>`,
            render: () => (<Stage>
          <PrismaticBurst className="opacity-90"/>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PrismaticBurst
          </div>
        </Stage>),
        },
        {
            title: "Number of ray lobes",
            description: "rayCount>0 Sort out N symmetrical rays according to angle, 6 = hexagram-like burst.",
            code: `<PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95" />`,
            render: () => (<Stage>
          <PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95"/>
        </Stage>),
        },
        {
            title: "Three-dimensional tumbling + twisting",
            description: "animationType=rotate3d tumbles three-dimensionally, distort twists the rays like a gravitational lens, and noiseAmount weakens the strips.",
            code: `<PrismaticBurst
  animationType="rotate3d"
  distort={18}
  speed={1.4}
  noiseAmount={0.4}
  className="opacity-90"
/>`,
            render: () => (<Stage>
          <PrismaticBurst animationType="rotate3d" distort={18} speed={1.4} noiseAmount={0.4} className="opacity-90"/>
        </Stage>),
        },
        {
            title: "Custom ribbon",
            description: "colors passes the CSS color array (supports var token) baked into a gradient texture; the hover mode follows the pointer tilt.",
            code: `<PrismaticBurst
  animationType="hover"
  colors={[
    "oklch(0.72 0.22 30)",
    "var(--color-chart-3)",
    "oklch(0.78 0.16 90)",
  ]}
  intensity={2.2}
  className="opacity-90"
/>`,
            render: () => (<Stage>
          <PrismaticBurst animationType="hover" colors={[
                    "oklch(0.72 0.22 30)",
                    "var(--color-chart-3)",
                    "oklch(0.78 0.16 90)",
                ]} intensity={2.2} className="opacity-90"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "intensity", type: "number", defaultValue: 2, label: "Brightness gain" },
        { prop: "speed", type: "number", defaultValue: 1, label: "Animation speed" },
        {
            prop: "animationType",
            type: "select",
            options: ["rotate", "rotate3d", "hover"],
            defaultValue: "rotate",
            label: "Exercise methods",
        },
        { prop: "rayCount", type: "number", defaultValue: 0, label: "Number of ray lobes (0=continuous)" },
        { prop: "distort", type: "number", defaultValue: 0, label: "Distortion 0\u201350" },
    ],
    states: [
        {
            name: "default (continuous halo\u00B7token spectrum)",
            render: () => (<Stage>
          <PrismaticBurst className="opacity-90"/>
          <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            PrismaticBurst
          </div>
        </Stage>),
        },
        {
            name: "Six-lobed ray (rayCount=6)",
            render: () => (<Stage>
          <PrismaticBurst rayCount={6} intensity={2.4} className="opacity-95"/>
        </Stage>),
        },
        {
            name: "Three-dimensional tumbling + twisting (rotate3d \u00B7 distort)",
            render: () => (<Stage>
          <PrismaticBurst animationType="rotate3d" distort={18} speed={1.4} noiseAmount={0.4} className="opacity-90"/>
        </Stage>),
        },
        {
            name: "Custom Warm Color Band (hover Follow)",
            render: () => (<Stage>
          <PrismaticBurst animationType="hover" colors={[
                    "oklch(0.72 0.22 30)",
                    "var(--color-chart-3)",
                    "oklch(0.78 0.16 90)",
                ]} intensity={2.2} className="opacity-90"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PrismaticBurst intensity={p.intensity as number} speed={p.speed as number} animationType={p.animationType as "rotate" | "rotate3d" | "hover"} rayCount={p.rayCount as number} distort={p.distort as number} className="opacity-90"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.02 275)" }}>`,
        `  <PrismaticBurst`,
        `    intensity={${p.intensity}}`,
        `    speed={${p.speed}}`,
        `    animationType="${p.animationType}"`,
        `    rayCount={${p.rayCount}}`,
        `    distort={${p.distort}}`,
        `    className="opacity-90"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
