"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { EvilEye } from "../../../../packages/ui/src/evil-eye/evil-eye";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.13 0.01 60)" }}>
      {children}
    </div>);
}
export const evilEyeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Flame evil eye background, the pupils shift with the cursor; the default flame color is --color-chart-3, and the light and shade are adaptive.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <EvilEye className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <EvilEye className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "More fierce (constricted pupils + high intensity)",
            description: "Decrease the pupilSize harvest seam, increase the intensity / flameSpeed to make the flame brighter and more restless.",
            code: `<EvilEye
  className="absolute inset-0"
  pupilSize={0.35}
  intensity={2.2}
  flameSpeed={1.6}
/>`,
            render: () => (<Stage>
          <EvilEye className="absolute inset-0" pupilSize={0.35} intensity={2.2} flameSpeed={1.6}/>
        </Stage>),
        },
        {
            title: "Customized eye color (dark blue)",
            description: "eyeColor overrides the default fire orange; scale controls the proportion of eyes in the screen.",
            code: `<EvilEye
  className="absolute inset-0"
  eyeColor="oklch(0.7 0.18 230)"
  glowIntensity={0.5}
  scale={0.9}
/>`,
            render: () => (<Stage>
          <EvilEye className="absolute inset-0" eyeColor="oklch(0.7 0.18 230)" glowIntensity={0.5} scale={0.9}/>
        </Stage>),
        },
        {
            title: "Wallpaper level (pupil does not follow + slow fire)",
            description: "pupilFollow=0 Make the pupils fixed and not follow the cursor. Slow fire + loud noise is suitable for silent background.",
            code: `<EvilEye
  className="absolute inset-0"
  pupilFollow={0}
  flameSpeed={0.5}
  noiseScale={1.3}
/>`,
            render: () => (<Stage>
          <EvilEye className="absolute inset-0" pupilFollow={0} flameSpeed={0.5} noiseScale={1.3}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "intensity", type: "number", defaultValue: 1.5, label: "Luminous intensity" },
        { prop: "pupilSize", type: "number", defaultValue: 0.6, label: "Pupil size" },
        { prop: "glowIntensity", type: "number", defaultValue: 0.35, label: "Outer ring glow" },
        { prop: "flameSpeed", type: "number", defaultValue: 1.0, label: "Flame speed" },
    ],
    states: [
        {
            name: "default (chart-3 warm orange \u00B7 follow cursor)",
            render: () => (<Stage>
          <EvilEye className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Constrict pupils \u00B7 High intensity (more fierce)",
            render: () => (<Stage>
          <EvilEye className="absolute inset-0" pupilSize={0.35} intensity={2.2} flameSpeed={1.6}/>
        </Stage>),
        },
        {
            name: "Blue evil eye (customized eyeColor)",
            render: () => (<Stage>
          <EvilEye className="absolute inset-0" eyeColor="oklch(0.7 0.18 230)" glowIntensity={0.5} scale={0.9}/>
        </Stage>),
        },
        {
            name: "Pupils do not follow \u00B7 Slow fire (wallpaper level)",
            render: () => (<Stage>
          <EvilEye className="absolute inset-0" pupilFollow={0} flameSpeed={0.5} noiseScale={1.3}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <EvilEye className="absolute inset-0" intensity={p.intensity as number} pupilSize={p.pupilSize as number} glowIntensity={p.glowIntensity as number} flameSpeed={p.flameSpeed as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.13 0.01 60)" }}>`,
        `  <EvilEye`,
        `    className="absolute inset-0"`,
        `    intensity={${p.intensity}}`,
        `    pupilSize={${p.pupilSize}}`,
        `    glowIntensity={${p.glowIntensity}}`,
        `    flameSpeed={${p.flameSpeed}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
