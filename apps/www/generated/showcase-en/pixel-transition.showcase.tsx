"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { PixelTransition } from "../../../../packages/ui/src/pixel-transition/pixel-transition";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="flex min-h-56 w-full items-center justify-center rounded-xl p-6" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
const Face = ({ label, tone }: {
    label: string;
    tone: string;
}) => (<div className="flex h-full w-full items-center justify-center text-lg font-semibold text-white" style={{ background: tone }}>
    {label}
  </div>);
export const pixelTransitionShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "When hovering/focusing, a mosaic of pixels scatters in and out, switching firstContent to secondContent.",
            code: `<PixelTransition
  firstContent={<img src="/a.jpg" alt="" className="h-full w-full object-cover" />}
  secondContent={<img src="/b.jpg" alt="" className="h-full w-full object-cover" />}
/>`,
            render: () => (<Stage>
          <PixelTransition firstContent={<Face label="Hulian" tone="oklch(0.55 0.16 255)"/>} secondContent={<Face label="Component library" tone="oklch(0.62 0.2 25)"/>}/>
        </Stage>),
        },
        {
            title: "Grid density",
            description: "gridSize The larger it is, the more delicate it is and the softer the transition is; the smaller it is, the rougher it is and the stronger the mosaic feeling is.",
            code: `<PixelTransition
  gridSize={12}
  firstContent={<Face label="Hover" />}
  secondContent={<Face label="Me" />}
/>`,
            render: () => (<Stage>
          <PixelTransition gridSize={12} firstContent={<Face label="Hover" tone="oklch(0.5 0.14 290)"/>} secondContent={<Face label="Me" tone="oklch(0.7 0.18 150)"/>}/>
        </Stage>),
        },
        {
            title: "Coarse mosaic + slow + main color pixels",
            description: "gridSize turns down, animationStepDuration turns up, pixelColor goes token.",
            code: `<PixelTransition
  gridSize={4}
  animationStepDuration={0.6}
  pixelColor="var(--color-primary)"
  firstContent={<Face label="pixels" />}
  secondContent={<Face label="Transition" />}
/>`,
            render: () => (<Stage>
          <PixelTransition gridSize={4} animationStepDuration={0.6} pixelColor="var(--color-primary)" firstContent={<Face label="Pixels" tone="oklch(0.45 0.05 255)"/>} secondContent={<Face label="Transition" tone="oklch(0.6 0.18 50)"/>}/>
        </Stage>),
        },
        {
            title: "Only advance but not retreat + Customize the aspect ratio",
            description: "once stops at secondContent after activation; aspectRatio is written as CSS aspect-ratio.",
            code: `<PixelTransition
  once
  aspectRatio="1 / 1"
  firstContent={<Face label="Click me" />}
  secondContent={<Face label="\u2713" />}
/>`,
            render: () => (<Stage>
          <PixelTransition once aspectRatio="1 / 1" firstContent={<Face label="Click me" tone="oklch(0.4 0.08 255)"/>} secondContent={<Face label="✓" tone="oklch(0.62 0.2 145)"/>}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "gridSize", type: "number", defaultValue: 7, label: "Grid side length" },
        { prop: "animationStepDuration", type: "number", defaultValue: 0.3, label: "Cut scene seconds" },
        { prop: "once", type: "boolean", defaultValue: false, label: "Only advance, never retreat" },
    ],
    states: [
        {
            name: "default (hover/focus trigger)",
            render: () => (<Stage>
          <PixelTransition firstContent={<Face label="Hulian" tone="oklch(0.55 0.16 255)"/>} secondContent={<Face label="Component library" tone="oklch(0.62 0.2 25)"/>}/>
        </Stage>),
        },
        {
            name: "Fine mesh (gridSize 12)",
            render: () => (<Stage>
          <PixelTransition gridSize={12} firstContent={<Face label="Hover" tone="oklch(0.5 0.14 290)"/>} secondContent={<Face label="Me" tone="oklch(0.7 0.18 150)"/>}/>
        </Stage>),
        },
        {
            name: "Coarse Mosaic + Slow (gridSize 4 \u00B7 0.6s)",
            render: () => (<Stage>
          <PixelTransition gridSize={4} animationStepDuration={0.6} pixelColor="var(--color-primary)" firstContent={<Face label="Pixels" tone="oklch(0.45 0.05 255)"/>} secondContent={<Face label="Transition" tone="oklch(0.6 0.18 50)"/>}/>
        </Stage>),
        },
        {
            name: "Only advance but not retreat (once)",
            render: () => (<Stage>
          <PixelTransition once aspectRatio="1 / 1" firstContent={<Face label="Click me" tone="oklch(0.4 0.08 255)"/>} secondContent={<Face label="✓" tone="oklch(0.62 0.2 145)"/>}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <PixelTransition gridSize={p.gridSize as number} animationStepDuration={p.animationStepDuration as number} once={p.once as boolean} firstContent={<Face label="Hulian" tone="oklch(0.55 0.16 255)"/>} secondContent={<Face label="Component library" tone="oklch(0.62 0.2 25)"/>}/>
    </Stage>),
    toCode: (p) => [
        `<PixelTransition`,
        `  gridSize={${p.gridSize}}`,
        `  animationStepDuration={${p.animationStepDuration}}`,
        `  once={${p.once}}`,
        `  firstContent={<img src="/a.jpg" alt="" />}`,
        `  secondContent={<img src="/b.jpg" alt="" />}`,
        `/>`,
    ].join("\n"),
};
