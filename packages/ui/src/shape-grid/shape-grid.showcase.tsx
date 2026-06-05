"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ShapeGrid } from "./shape-grid";

/** 展示用深色底容器，让网格线 + 悬停填充清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const shapeGridShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "shape",
      type: "select",
      options: ["square", "circle", "triangle", "hexagon"],
      defaultValue: "square",
      label: "形状",
    },
    {
      prop: "direction",
      type: "select",
      options: ["right", "left", "up", "down", "diagonal"],
      defaultValue: "right",
      label: "方向",
    },
    { prop: "speed", type: "number", defaultValue: 1, label: "速度" },
    { prop: "squareSize", type: "number", defaultValue: 40, label: "单元边长 px" },
    { prop: "hoverTrailAmount", type: "number", defaultValue: 0, label: "悬停拖尾" },
  ],

  states: [
    {
      name: "default（方格·向右滚动）",
      render: () => (
        <Stage>
          <ShapeGrid className="absolute inset-0 opacity-90" />
        </Stage>
      ),
    },
    {
      name: "六边形蜂巢·对角线",
      render: () => (
        <Stage>
          <ShapeGrid
            shape="hexagon"
            direction="diagonal"
            squareSize={32}
            className="absolute inset-0 opacity-90"
          />
        </Stage>
      ),
    },
    {
      name: "圆点阵·悬停拖尾",
      render: () => (
        <Stage>
          <ShapeGrid
            shape="circle"
            direction="up"
            hoverTrailAmount={6}
            hoverFillColor="var(--color-chart-2)"
            className="absolute inset-0 opacity-90"
          />
        </Stage>
      ),
    },
    {
      name: "三角网·暖色填充",
      render: () => (
        <Stage>
          <ShapeGrid
            shape="triangle"
            direction="left"
            speed={1.5}
            hoverFillColor="var(--color-chart-3)"
            className="absolute inset-0 opacity-90"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ShapeGrid
        shape={p.shape as "square" | "circle" | "triangle" | "hexagon"}
        direction={p.direction as "right" | "left" | "up" | "down" | "diagonal"}
        speed={p.speed as number}
        squareSize={p.squareSize as number}
        hoverTrailAmount={p.hoverTrailAmount as number}
        className="absolute inset-0 opacity-90"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
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
