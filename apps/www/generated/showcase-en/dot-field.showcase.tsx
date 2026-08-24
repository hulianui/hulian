"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DotField } from "../../../../packages/ui/src/dot-field/dot-field";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border p-8" style={{ background: "oklch(0.14 0.02 280)" }}>
      {children}
      <div className="pointer-events-none relative z-10 max-w-sm text-sm font-medium text-white/70">
        Padded content determines the container height and layers above the interactive dot-field backdrop.
      </div>
    </div>);
}
export const dotFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Dot matrix background, move the mouse to push the lattice and glow below; the default color is chart / primary token.",
            code: `<div className="relative overflow-hidden rounded-xl bg-neutral-950 p-8">
  <DotField />
  <div className="relative z-10">Foreground content determines the container height</div>
</div>`,
            render: () => (<Stage>
          <DotField />
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
        `<div className="relative overflow-hidden rounded-xl p-8"`,
        `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
        `  <DotField`,
        `    dotSpacing={${p.dotSpacing}}`,
        `    dotRadius={${p.dotRadius}}`,
        `    bulgeStrength={${p.bulgeStrength}}`,
        `    cursorRadius={${p.cursorRadius}}`,
        `    waveAmplitude={${p.waveAmplitude}}`,
        `    sparkle={${p.sparkle}}`,
        `  />`,
        `  <div className="relative z-10">Foreground content determines the container height</div>`,
        `</div>`,
    ].join("\n"),
};
