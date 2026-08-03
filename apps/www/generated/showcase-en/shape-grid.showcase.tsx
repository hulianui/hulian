"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ShapeGrid } from "../../../../packages/ui/src/shape-grid/shape-grid";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
export const shapeGridShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default grid scrolls infinitely to the right, and the side line eats --color-border token; canvas needs to be filled with absolute inset-0.",
            code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.16 0.02 255)" }}>
  <ShapeGrid className="absolute inset-0 opacity-90" />
</div>`,
            render: () => (<Stage>
          <ShapeGrid className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
        {
            title: "Shape and Orientation",
            description: "shape Choose one of four (square / circle / triangle / hexagon), direction controls the scroll direction.",
            code: `<ShapeGrid
  shape="hexagon"
  direction="diagonal"
  squareSize={32}
  className="absolute inset-0 opacity-90"
/>`,
            render: () => (<Stage>
          <ShapeGrid shape="hexagon" direction="diagonal" squareSize={32} className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
        {
            title: "Hover tailing",
            description: "hoverTrailAmount>0 makes the hovering unit leave a fade trail, hoverFillColor specifies the fill color (try moving the mouse).",
            code: `<ShapeGrid
  shape="circle"
  direction="up"
  hoverTrailAmount={6}
  hoverFillColor="var(--color-chart-2)"
  className="absolute inset-0 opacity-90"
/>`,
            render: () => (<Stage>
          <ShapeGrid shape="circle" direction="up" hoverTrailAmount={6} hoverFillColor="var(--color-chart-2)" className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
        {
            title: "Triangle mesh \u00B7 Warm fill",
            description: "triangle is arranged in staggered shapes, speed is for faster scrolling, and hoverFillColor is for theme accent colors.",
            code: `<ShapeGrid
  shape="triangle"
  direction="left"
  speed={1.5}
  hoverFillColor="var(--color-chart-3)"
  className="absolute inset-0 opacity-90"
/>`,
            render: () => (<Stage>
          <ShapeGrid shape="triangle" direction="left" speed={1.5} hoverFillColor="var(--color-chart-3)" className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "shape",
            type: "select",
            options: ["square", "circle", "triangle", "hexagon"],
            defaultValue: "square",
            label: "Shape",
        },
        {
            prop: "direction",
            type: "select",
            options: ["right", "left", "up", "down", "diagonal"],
            defaultValue: "right",
            label: "Direction",
        },
        { prop: "speed", type: "number", defaultValue: 1, label: "Speed" },
        { prop: "squareSize", type: "number", defaultValue: 40, label: "Unit side length px" },
        { prop: "hoverTrailAmount", type: "number", defaultValue: 0, label: "Hover tailing" },
    ],
    states: [
        {
            name: "default (square\u00B7scroll right)",
            render: () => (<Stage>
          <ShapeGrid className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
        {
            name: "Hexagonal honeycomb\u00B7diagonal",
            render: () => (<Stage>
          <ShapeGrid shape="hexagon" direction="diagonal" squareSize={32} className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
        {
            name: "Dot array\u00B7hover tailing",
            render: () => (<Stage>
          <ShapeGrid shape="circle" direction="up" hoverTrailAmount={6} hoverFillColor="var(--color-chart-2)" className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
        {
            name: "Triangle mesh\u00B7warm color fill",
            render: () => (<Stage>
          <ShapeGrid shape="triangle" direction="left" speed={1.5} hoverFillColor="var(--color-chart-3)" className="absolute inset-0 opacity-90"/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <ShapeGrid shape={p.shape as "square" | "circle" | "triangle" | "hexagon"} direction={p.direction as "right" | "left" | "up" | "down" | "diagonal"} speed={p.speed as number} squareSize={p.squareSize as number} hoverTrailAmount={p.hoverTrailAmount as number} className="absolute inset-0 opacity-90"/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-56 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <ShapeGrid`,
        `    shape="${p.shape}"`,
        `    direction="${p.direction}"`,
        `    speed={${p.speed}}`,
        `    squareSize={${p.squareSize}}`,
        `    hoverTrailAmount={${p.hoverTrailAmount}}`,
        `    className="absolute inset-0 opacity-90"`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
