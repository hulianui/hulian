"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DotField } from "../../../../packages/ui/src/dot-field/dot-field";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 280)" }}>
      {children}
    </div>);
}
export const dotFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Dot matrix background, move the mouse to push the lattice and glow below; the default color is chart / primary token.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <DotField />
</div>`,
            render: () => (<Stage>
          <DotField />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
            DotField
          </div>
        </Stage>),
        },
        {
            title: "Sparse lattice + strong bulging",
            description: "Increase dotSpacing to make the dot matrix sparser, and increase bulgeStrength / cursorRadius to get a more exaggerated bulge.",
            code: `<DotField dotSpacing={22} dotRadius={2} bulgeStrength={80} cursorRadius={260} />`,
            render: () => (<Stage>
          <DotField dotSpacing={22} dotRadius={2} bulgeStrength={80} cursorRadius={260}/>
        </Stage>),
        },
        {
            title: "Waves + Stars twinkling",
            description: "waveAmplitude allows the entire dot matrix to breathe sinusoidally, and sparkle allows a small number of points to occasionally enlarge into star points.",
            code: `<DotField waveAmplitude={5} sparkle dotSpacing={16} />`,
            render: () => (<Stage>
          <DotField waveAmplitude={5} sparkle dotSpacing={16}/>
        </Stage>),
        },
        {
            title: "Custom color",
            description: "color controls point color, glowColor controls glow color; any CSS color string can be used.",
            code: `<DotField color="oklch(0.75 0.2 50)" glowColor="oklch(0.7 0.18 200)" />`,
            render: () => (<Stage>
          <DotField color="oklch(0.75 0.2 50)" glowColor="oklch(0.7 0.18 200)"/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "dotSpacing", type: "number", defaultValue: 14, label: "Point pitch px" },
        { prop: "dotRadius", type: "number", defaultValue: 1.5, label: "Point radius px" },
        { prop: "bulgeStrength", type: "number", defaultValue: 56, label: "Bulging strength px" },
        { prop: "cursorRadius", type: "number", defaultValue: 220, label: "Cursor radius px" },
        { prop: "waveAmplitude", type: "number", defaultValue: 0, label: "Wave amplitude px" },
        { prop: "sparkle", type: "boolean", defaultValue: false, label: "Star flashing" },
    ],
    states: [
        {
            name: "default (move the mouse to push the dot matrix + glow)",
            render: () => (<Stage>
          <DotField />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/70">
            DotField
          </div>
        </Stage>),
        },
        {
            name: "Sparse lattice + strong bulging",
            render: () => (<Stage>
          <DotField dotSpacing={22} dotRadius={2} bulgeStrength={80} cursorRadius={260}/>
        </Stage>),
        },
        {
            name: "Waves + Stars twinkling",
            render: () => (<Stage>
          <DotField waveAmplitude={5} sparkle dotSpacing={16}/>
        </Stage>),
        },
        {
            name: "Custom color (warm orange dot \u00B7 cyan glow)",
            render: () => (<Stage>
          <DotField color="oklch(0.75 0.2 50)" glowColor="oklch(0.7 0.18 200)"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <DotField dotSpacing={p.dotSpacing as number} dotRadius={p.dotRadius as number} bulgeStrength={p.bulgeStrength as number} cursorRadius={p.cursorRadius as number} waveAmplitude={p.waveAmplitude as number} sparkle={p.sparkle as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
        `  <DotField`,
        `    dotSpacing={${p.dotSpacing}}`,
        `    dotRadius={${p.dotRadius}}`,
        `    bulgeStrength={${p.bulgeStrength}}`,
        `    cursorRadius={${p.cursorRadius}}`,
        `    waveAmplitude={${p.waveAmplitude}}`,
        `    sparkle={${p.sparkle}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
