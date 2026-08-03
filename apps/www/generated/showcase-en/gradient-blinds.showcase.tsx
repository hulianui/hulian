"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GradientBlinds } from "../../../../packages/ui/src/gradient-blinds/gradient-blinds";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const gradientBlindsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default is chart token two-color, the spotlight follows the mouse. Put it into the relative container and it will be filled.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <GradientBlinds />
</div>`,
            render: () => (<Stage>
          <GradientBlinds />
        </Stage>),
        },
        {
            title: "Custom gradient color station + oblique",
            description: "gradientColors passes any CSS color (up to the first 8), angle rotates the entire ribbon.",
            code: `<GradientBlinds
  gradientColors={[
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-4)",
  ]}
  angle={30}
  blindCount={24}
/>`,
            render: () => (<Stage>
          <GradientBlinds gradientColors={[
                    "var(--color-chart-1)",
                    "var(--color-chart-2)",
                    "var(--color-chart-4)",
                ]} angle={30} blindCount={24}/>
        </Stage>),
        },
        {
            title: "Mirror Gradient",
            description: "mirrorGradient Fold the ribbon in half at the midpoint to form a symmetrical back and forth.",
            code: `<GradientBlinds mirrorGradient blindCount={32} noise={0.15} />`,
            render: () => (<Stage>
          <GradientBlinds mirrorGradient blindCount={32} noise={0.15}/>
        </Stage>),
        },
        {
            title: "Distortion + Large Spotlight",
            description: "distortAmount makes the ribbon wavy, spotlightRadius/Softness adjusts the size, softness and hardness of the spotlight.",
            code: `<GradientBlinds
  gradientColors={["oklch(0.72 0.22 30)", "var(--color-chart-3)"]}
  distortAmount={0.8}
  spotlightRadius={0.7}
  spotlightSoftness={1.4}
  shineDirection="right"
/>`,
            render: () => (<Stage>
          <GradientBlinds gradientColors={["oklch(0.72 0.22 30)", "var(--color-chart-3)"]} distortAmount={0.8} spotlightRadius={0.7} spotlightSoftness={1.4} shineDirection="right"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "blindCount", type: "number", defaultValue: 16, label: "Number of louvers" },
        { prop: "angle", type: "number", defaultValue: 0, label: "Rotation angle \u00B0" },
        { prop: "noise", type: "number", defaultValue: 0.3, label: "Noise intensity" },
        {
            prop: "shineDirection",
            type: "select",
            options: ["left", "right"],
            defaultValue: "left",
            label: "Scanning direction",
        },
        { prop: "mirrorGradient", type: "boolean", defaultValue: false, label: "Mirror Gradient" },
    ],
    states: [
        {
            name: "default (default chart token dual color \u00B7 follow mouse spotlight)",
            render: () => (<Stage>
          <GradientBlinds />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Move the mouse to try the spotlight
          </div>
        </Stage>),
        },
        {
            name: "Oblique + Multicolor Station",
            render: () => (<Stage>
          <GradientBlinds gradientColors={[
                    "var(--color-chart-1)",
                    "var(--color-chart-2)",
                    "var(--color-chart-4)",
                ]} angle={30} blindCount={24}/>
        </Stage>),
        },
        {
            name: "Mirror Gradient + High Bar Count",
            render: () => (<Stage>
          <GradientBlinds mirrorGradient blindCount={32} noise={0.15}/>
        </Stage>),
        },
        {
            name: "Warm orange tone \u00B7 Distortion + large spotlight",
            render: () => (<Stage>
          <GradientBlinds gradientColors={["oklch(0.72 0.22 30)", "var(--color-chart-3)"]} distortAmount={0.8} spotlightRadius={0.7} spotlightSoftness={1.4} shineDirection="right"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GradientBlinds blindCount={p.blindCount as number} angle={p.angle as number} noise={p.noise as number} shineDirection={p.shineDirection as "left" | "right"} mirrorGradient={p.mirrorGradient as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <GradientBlinds`,
        `    blindCount={${p.blindCount}}`,
        `    angle={${p.angle}}`,
        `    noise={${p.noise}}`,
        `    shineDirection="${p.shineDirection}"`,
        `    mirrorGradient={${p.mirrorGradient}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
