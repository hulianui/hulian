"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ShapeBlur } from "../../../../packages/ui/src/shape-blur/shape-blur";
import type { ShapeBlurVariation } from "../../../../packages/ui/src/shape-blur/shape-blur.types";
function Stage({ children, hint = "Move the mouse to reveal the shape", className = "", }: {
    children: React.ReactNode;
    hint?: string;
    className?: string;
}) {
    return (<div className={`relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 ${className}`} style={{ background: "oklch(0.13 0.02 270)" }}>
      {children}
      <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 text-xs text-white/35">
        {hint}
      </p>
    </div>);
}
const VARIATIONS: ShapeBlurVariation[] = [
    "round-rect",
    "circle-fill",
    "circle-stroke",
    "triangle",
];
export const shapeBlurShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Default is rounded rectangle stroke. When the mouse is close, the soft light circle will polish the edge of the shape; color foreground token.",
            code: `<div className="relative h-64 overflow-hidden rounded-xl">
  <ShapeBlur variation="round-rect" />
</div>`,
            render: () => (<Stage>
          <ShapeBlur variation="round-rect"/>
        </Stage>),
        },
        {
            title: "Solid Circle",
            description: "variation=\"circle-fill\", circleSize Enlarge the polished area.",
            code: `<ShapeBlur variation="circle-fill" circleSize={0.4} />`,
            render: () => (<Stage hint="Mouse polish the filled circle">
          <ShapeBlur variation="circle-fill" circleSize={0.4}/>
        </Stage>),
        },
        {
            title: "Circle stroke + custom color",
            description: "variation=\"circle-stroke\", color passes any CSS color to override the default foreground color.",
            code: `<ShapeBlur
  variation="circle-stroke"
  color="oklch(0.82 0.16 75)"
  circleSize={0.35}
/>`,
            render: () => (<Stage hint="Mouse polishing ring">
          <ShapeBlur variation="circle-stroke" color="oklch(0.82 0.16 75)" circleSize={0.35}/>
        </Stage>),
        },
        {
            title: "Triangle",
            description: "variation=\"triangle\", blue-purple filling.",
            code: `<ShapeBlur
  variation="triangle"
  color="oklch(0.7 0.22 280)"
  circleSize={0.32}
/>`,
            render: () => (<Stage hint="Mouse polish triangle">
          <ShapeBlur variation="triangle" color="oklch(0.7 0.22 280)" circleSize={0.32}/>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "variation",
            type: "select",
            options: VARIATIONS,
            defaultValue: "round-rect",
            label: "Shape",
        },
        { prop: "shapeSize", type: "number", defaultValue: 1.2, label: "Shape and Dimensions" },
        { prop: "roundness", type: "number", defaultValue: 0.4, label: "Rounded corners" },
        { prop: "borderSize", type: "number", defaultValue: 0.05, label: "Stroke width" },
        { prop: "circleSize", type: "number", defaultValue: 0.3, label: "Light circle radius" },
        { prop: "circleEdge", type: "number", defaultValue: 0.5, label: "Light round feathering" },
        { prop: "damping", type: "number", defaultValue: 8, label: "Follow damping" },
        {
            prop: "color",
            type: "text",
            defaultValue: "",
            label: "Custom color (leave blank =foreground)",
        },
    ],
    states: [
        {
            name: "default (rounded rectangle stroke \u00B7 foreground token)",
            render: () => (<Stage>
          <ShapeBlur variation="round-rect"/>
        </Stage>),
        },
        {
            name: "Solid circle (circle-fill)",
            render: () => (<Stage hint="Mouse polish the filled circle">
          <ShapeBlur variation="circle-fill" circleSize={0.4}/>
        </Stage>),
        },
        {
            name: "Circle stroke (circle-stroke \u00B7 Warm gold)",
            render: () => (<Stage hint="Mouse polishing ring">
          <ShapeBlur variation="circle-stroke" color="oklch(0.82 0.16 75)" circleSize={0.35}/>
        </Stage>),
        },
        {
            name: "Triangle (triangle \u00B7 Blue Purple)",
            render: () => (<Stage hint="Mouse polish triangle">
          <ShapeBlur variation="triangle" color="oklch(0.7 0.22 280)" circleSize={0.32}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ShapeBlur variation={p.variation as ShapeBlurVariation} shapeSize={p.shapeSize as number} roundness={p.roundness as number} borderSize={p.borderSize as number} circleSize={p.circleSize as number} circleEdge={p.circleEdge as number} damping={p.damping as number} color={(p.color as string) || undefined}/>
    </Stage>),
    toCode: (p) => {
        const colorLine = p.color ? `
    color="${p.color}"` : "";
        return [
            `<div className="relative h-64 overflow-hidden rounded-xl"`,
            `     style={{ background: "oklch(0.13 0.02 270)" }}>`,
            `  <ShapeBlur`,
            `    variation="${p.variation}"`,
            `    shapeSize={${p.shapeSize}}`,
            `    roundness={${p.roundness}}`,
            `    borderSize={${p.borderSize}}`,
            `    circleSize={${p.circleSize}}`,
            `    circleEdge={${p.circleEdge}}`,
            `    damping={${p.damping}}${colorLine}`,
            `  />`,
            `</div>`,
        ].join("\n");
    },
};
