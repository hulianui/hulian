"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Galaxy } from "../../../../packages/ui/src/galaxy/galaxy";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.12 0.02 265)" }}>
      {children}
    </div>);
}
export const galaxyShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative container and it will be filled. The component comes with absolute inset-0 z-0; the content is placed in z-10.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <Galaxy />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Content layer
  </div>
</div>`,
            render: () => (<Stage>
          <Galaxy />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Content layer
          </div>
        </Stage>),
        },
        {
            title: "Color correction: Hue + Saturation",
            description: "hueShift rotates the main color, and saturation increases it to make the star points appear colorful.",
            code: `<Galaxy hueShift={300} saturation={0.4} density={1.4} glowIntensity={0.4} />`,
            render: () => (<Stage>
          <Galaxy hueShift={300} saturation={0.4} density={1.4} glowIntensity={0.4}/>
        </Stage>),
        },
        {
            title: "Central star ring",
            description: "autoCenterRepulsion > 0 When the star point is repelled outward from the center, it forms the appearance of a star ring in the center of the hollow.",
            code: `<Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false} />`,
            render: () => (<Stage>
          <Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false}/>
        </Stage>),
        },
        {
            title: "Pure decorative wallpaper (turn off interaction)",
            description: "mouseInteraction={false} allows click penetration, suitable for static background.",
            code: `<Galaxy
  rotationSpeed={0.05}
  glowIntensity={0.5}
  twinkleIntensity={0.6}
  starSpeed={0.3}
  mouseInteraction={false}
/>`,
            render: () => (<Stage>
          <Galaxy rotationSpeed={0.05} glowIntensity={0.5} twinkleIntensity={0.6} starSpeed={0.3} mouseInteraction={false}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "density", type: "number", defaultValue: 1, label: "Star point density" },
        { prop: "hueShift", type: "number", defaultValue: 140, label: "Hue shift" },
        { prop: "glowIntensity", type: "number", defaultValue: 0.3, label: "Glow intensity" },
        { prop: "twinkleIntensity", type: "number", defaultValue: 0.3, label: "Flash intensity" },
        { prop: "mouseInteraction", type: "boolean", defaultValue: true, label: "Mouse interaction" },
    ],
    states: [
        {
            name: "default (Blue Galaxy \u00B7 Default parameters)",
            render: () => (<Stage>
          <Galaxy />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Galaxy
          </div>
        </Stage>),
        },
        {
            name: "Starry (warm purple tone)",
            render: () => (<Stage>
          <Galaxy density={1.6} hueShift={300} saturation={0.4} glowIntensity={0.4}/>
        </Stage>),
        },
        {
            name: "Central star ring (autoCenterRepulsion)",
            render: () => (<Stage>
          <Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false}/>
        </Stage>),
        },
        {
            name: "Wallpaper level (slow rotation \u00B7 strong glow)",
            render: () => (<Stage>
          <Galaxy rotationSpeed={0.05} glowIntensity={0.5} twinkleIntensity={0.6} starSpeed={0.3} mouseInteraction={false}/>
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">Hulian component library</p>
            <p className="text-xs text-white/60">Programmed Galaxy · WebGL · Theme Awareness</p>
          </div>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <Galaxy density={p.density as number} hueShift={p.hueShift as number} glowIntensity={p.glowIntensity as number} twinkleIntensity={p.twinkleIntensity as number} mouseInteraction={p.mouseInteraction as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
        `  <Galaxy`,
        `    density={${p.density}}`,
        `    hueShift={${p.hueShift}}`,
        `    glowIntensity={${p.glowIntensity}}`,
        `    twinkleIntensity={${p.twinkleIntensity}}`,
        `    mouseInteraction={${p.mouseInteraction}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
