"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Cubes } from "./cubes";

/** 展示用深色底容器，让 3D 立方体阵列的边框/倾斜更清晰（也可拖动指针体验倾斜）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-72 w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-border p-6"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const cubesShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "默认 8×8 立方体阵列：指针靠近的立方体按距离衰减倾斜，空闲时自动游走，点击向外扩散涟漪。容器需给定尺寸。",
      code: `<div className="h-56 w-56">
  <Cubes />
</div>`,
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes />
          </div>
        </Stage>
      ),
    },
    {
      title: "网格密度",
      description:
        "gridSize 控制阵列边长（DOM 数量为平方级，建议 ≤ 12）；配合 maxAngle / radius 调倾斜幅度与影响半径。",
      code: `<div className="h-56 w-56">
  <Cubes gridSize={12} maxAngle={60} radius={4} />
</div>`,
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={12} maxAngle={60} radius={4} />
          </div>
        </Stage>
      ),
    },
    {
      title: "品牌色涟漪",
      description:
        "faceColor / edgeColor / rippleColor 全吃 token；点击从命中点向外环形扩散高亮，rippleSpeed 控制扩散速度。",
      code: `<div className="h-56 w-56">
  <Cubes
    faceColor="var(--color-surface)"
    edgeColor="var(--color-primary)"
    rippleColor="var(--color-chart-2)"
    rippleSpeed={3}
  />
</div>`,
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes
              faceColor="var(--color-surface)"
              edgeColor="var(--color-primary)"
              rippleColor="var(--color-chart-2)"
              rippleSpeed={3}
            />
          </div>
        </Stage>
      ),
    },
    {
      title: "静止（关闭自动游走）",
      description: "autoAnimate={false} 关闭空闲漫游，立方体只在指针交互时倾斜，平时保持平整。",
      code: `<div className="h-56 w-56">
  <Cubes gridSize={6} autoAnimate={false} />
</div>`,
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={6} autoAnimate={false} />
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "gridSize", type: "number", defaultValue: 8, label: "网格边长" },
    { prop: "maxAngle", type: "number", defaultValue: 45, label: "最大倾角°" },
    { prop: "radius", type: "number", defaultValue: 3, label: "影响半径（格）" },
    { prop: "rippleSpeed", type: "number", defaultValue: 2, label: "涟漪速度" },
    { prop: "autoAnimate", type: "boolean", defaultValue: true, label: "空闲自动游走" },
    { prop: "rippleOnClick", type: "boolean", defaultValue: true, label: "点击涟漪" },
  ],

  states: [
    {
      name: "default（8×8 · 默认参数）",
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes />
          </div>
        </Stage>
      ),
    },
    {
      name: "密集小格（12×12）",
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={12} maxAngle={60} radius={4} />
          </div>
        </Stage>
      ),
    },
    {
      name: "品牌色涟漪（点击试试）",
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes
              gridSize={8}
              faceColor="var(--color-surface)"
              edgeColor="var(--color-primary)"
              rippleColor="var(--color-chart-2)"
              rippleSpeed={3}
            />
          </div>
        </Stage>
      ),
    },
    {
      name: "静止（关闭自动游走）",
      render: () => (
        <Stage>
          <div className="h-56 w-56">
            <Cubes gridSize={6} autoAnimate={false} />
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <div className="h-56 w-56">
        <Cubes
          gridSize={p.gridSize as number}
          maxAngle={p.maxAngle as number}
          radius={p.radius as number}
          rippleSpeed={p.rippleSpeed as number}
          autoAnimate={p.autoAnimate as boolean}
          rippleOnClick={p.rippleOnClick as boolean}
        />
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="h-56 w-56">`,
      `  <Cubes`,
      `    gridSize={${p.gridSize}}`,
      `    maxAngle={${p.maxAngle}}`,
      `    radius={${p.radius}}`,
      `    rippleSpeed={${p.rippleSpeed}}`,
      `    autoAnimate={${p.autoAnimate}}`,
      `    rippleOnClick={${p.rippleOnClick}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
