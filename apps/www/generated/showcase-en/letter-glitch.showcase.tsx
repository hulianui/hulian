"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { LetterGlitch } from "../../../../packages/ui/src/letter-glitch/letter-glitch";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
    </div>);
}
export const letterGlitchShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the relative dark container, and the components will be filled with the chart token palette by default.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch className="absolute inset-0" />
</div>`,
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0"/>
        </Stage>),
        },
        {
            title: "Hard cutting failure feeling",
            description: "smooth=false turns off frame-by-frame interpolation, character colors are cut hard, and the glitch is more blunt.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch className="absolute inset-0" smooth={false} glitchSpeed={40} />
</div>`,
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0" smooth={false} glitchSpeed={40}/>
        </Stage>),
        },
        {
            title: "Center Vignette + Placed Content",
            description: "centerVignette Darken the contrast overlay copy in the middle and turn off outerVignette.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch className="absolute inset-0" outerVignette={false} centerVignette />
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <p className="text-lg font-semibold tracking-widest text-white">GLITCH</p>
  </div>
</div>`,
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0" outerVignette={false} centerVignette/>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-semibold tracking-widest text-white">
              GLITCH
            </p>
          </div>
        </Stage>),
        },
        {
            title: "Custom color palette (terminal green/cyan)",
            description: "glitchColors passes any CSS color array, and off-screen canvas parses and interpolates.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <LetterGlitch
    className="absolute inset-0"
    glitchColors={[
      "var(--color-chart-2)",
      "oklch(0.78 0.18 160)",
      "oklch(0.7 0.14 220)",
    ]}
    glitchSpeed={70}
  />
</div>`,
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0" glitchColors={[
                    "var(--color-chart-2)",
                    "oklch(0.78 0.18 160)",
                    "oklch(0.7 0.14 220)",
                ]} glitchSpeed={70}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "glitchSpeed", type: "number", defaultValue: 50, label: "Refresh interval ms" },
        { prop: "smooth", type: "boolean", defaultValue: true, label: "Smooth color transition" },
        { prop: "outerVignette", type: "boolean", defaultValue: true, label: "Dark corner on outer edge" },
        { prop: "centerVignette", type: "boolean", defaultValue: false, label: "Center vignetting" },
    ],
    states: [
        {
            name: "default (default parameters \u00B7 chart token palette)",
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0"/>
        </Stage>),
        },
        {
            name: "Hard cutting (smooth=false \u00B7 More blunt sense of failure)",
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0" smooth={false} glitchSpeed={40}/>
        </Stage>),
        },
        {
            name: "Center Vignette + Placed Content",
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0" outerVignette={false} centerVignette/>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <p className="text-lg font-semibold tracking-widest text-white">
              GLITCH
            </p>
          </div>
        </Stage>),
        },
        {
            name: "Custom color palette (green/cyan terminal style)",
            render: () => (<Stage>
          <LetterGlitch className="absolute inset-0" glitchColors={[
                    "var(--color-chart-2)",
                    "oklch(0.78 0.18 160)",
                    "oklch(0.7 0.14 220)",
                ]} glitchSpeed={70}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <LetterGlitch className="absolute inset-0" glitchSpeed={p.glitchSpeed as number} smooth={p.smooth as boolean} outerVignette={p.outerVignette as boolean} centerVignette={p.centerVignette as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <LetterGlitch`,
        `    className="absolute inset-0"`,
        `    glitchSpeed={${p.glitchSpeed}}`,
        `    smooth={${p.smooth}}`,
        `    outerVignette={${p.outerVignette}}`,
        `    centerVignette={${p.centerVignette}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
