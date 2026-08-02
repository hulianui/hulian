"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { GridDistortion } from "../../../../packages/ui/src/grid-distortion/grid-distortion";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.14 0.02 255)" }}>
      {children}
      <span className="pointer-events-none absolute bottom-2 right-3 z-10 text-[11px] text-white/40">
        Moving mouse distorts mesh
      </span>
    </div>);
}
export const gridDistortionShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When imageSrc is not passed, chart token grid shading is programmatically generated, and ripples are launched by moving the mouse.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <GridDistortion />
</div>`,
            render: () => (<Stage>
          <GridDistortion />
        </Stage>),
        },
        {
            title: "High density + strong distortion",
            description: "grid The higher the grid, the finer the grid and the smoother the ripples; the larger the strength is, the more intense the ripples are.",
            code: `<GridDistortion grid={24} strength={0.3} mouse={0.18} />`,
            render: () => (<Stage>
          <GridDistortion grid={24} strength={0.3} mouse={0.18}/>
        </Stage>),
        },
        {
            title: "Long finish (high relaxation)",
            description: "relaxation The closer it is to 1, the slower the ripple decay and the longer the aftertaste.",
            code: `<GridDistortion relaxation={0.96} strength={0.2} />`,
            render: () => (<Stage>
          <GridDistortion relaxation={0.96} strength={0.2}/>
        </Stage>),
        },
        {
            title: "Customize the main color of the shading",
            description: "color changes the main color of the grid shading (only effective when imageSrc is not uploaded).",
            code: `<GridDistortion color="oklch(0.72 0.22 30)" grid={18} />`,
            render: () => (<Stage>
          <GridDistortion color="oklch(0.72 0.22 30)" grid={18}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "grid", type: "number", defaultValue: 15, label: "Grid density" },
        { prop: "mouse", type: "number", defaultValue: 0.1, label: "Mouse radius" },
        { prop: "strength", type: "number", defaultValue: 0.15, label: "Torsional strength" },
        { prop: "relaxation", type: "number", defaultValue: 0.9, label: "Relaxation coefficient" },
    ],
    states: [
        {
            name: "default (programmed grid shading\u00B7default parameters)",
            render: () => (<Stage>
          <GridDistortion />
        </Stage>),
        },
        {
            name: "High density + strong distortion",
            render: () => (<Stage>
          <GridDistortion grid={24} strength={0.3} mouse={0.18}/>
        </Stage>),
        },
        {
            name: "Long aftertaste (high relaxation, ripples are not easy to disperse)",
            render: () => (<Stage>
          <GridDistortion relaxation={0.96} strength={0.2}/>
        </Stage>),
        },
        {
            name: "Warm shading (customized color)",
            render: () => (<Stage>
          <GridDistortion color="oklch(0.72 0.22 30)" grid={18}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <GridDistortion grid={p.grid as number} mouse={p.mouse as number} strength={p.strength as number} relaxation={p.relaxation as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-64 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
        `  <GridDistortion`,
        `    grid={${p.grid}}`,
        `    mouse={${p.mouse}}`,
        `    strength={${p.strength}}`,
        `    relaxation={${p.relaxation}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
