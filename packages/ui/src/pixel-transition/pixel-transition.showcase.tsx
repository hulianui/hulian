"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PixelTransition } from "./pixel-transition";

/** 展示用居中暗底容器，给像素转场足够对比 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-56 w-full items-center justify-center rounded-xl p-6"
      style={{ background: "oklch(0.16 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const Face = ({ label, tone }: { label: string; tone: string }) => (
  <div
    className="flex h-full w-full items-center justify-center text-lg font-semibold text-white"
    style={{ background: tone }}
  >
    {label}
  </div>
);

export const pixelTransitionShowcase: ShowcaseSpec = {
  controls: [
    { prop: "gridSize", type: "number", defaultValue: 7, label: "网格边长" },
    { prop: "animationStepDuration", type: "number", defaultValue: 0.3, label: "过场秒数" },
    { prop: "once", type: "boolean", defaultValue: false, label: "只进不退" },
  ],

  states: [
    {
      name: "default（悬停 / 聚焦触发）",
      render: () => (
        <Stage>
          <PixelTransition
            firstContent={<Face label="瑚琏" tone="oklch(0.55 0.16 255)" />}
            secondContent={<Face label="组件库" tone="oklch(0.62 0.2 25)" />}
          />
        </Stage>
      ),
    },
    {
      name: "细网格（gridSize 12）",
      render: () => (
        <Stage>
          <PixelTransition
            gridSize={12}
            firstContent={<Face label="Hover" tone="oklch(0.5 0.14 290)" />}
            secondContent={<Face label="Me" tone="oklch(0.7 0.18 150)" />}
          />
        </Stage>
      ),
    },
    {
      name: "粗马赛克 + 慢速（gridSize 4 · 0.6s）",
      render: () => (
        <Stage>
          <PixelTransition
            gridSize={4}
            animationStepDuration={0.6}
            pixelColor="var(--color-primary)"
            firstContent={<Face label="像素" tone="oklch(0.45 0.05 255)" />}
            secondContent={<Face label="转场" tone="oklch(0.6 0.18 50)" />}
          />
        </Stage>
      ),
    },
    {
      name: "只进不退（once）",
      render: () => (
        <Stage>
          <PixelTransition
            once
            aspectRatio="1 / 1"
            firstContent={<Face label="点我" tone="oklch(0.4 0.08 255)" />}
            secondContent={<Face label="✓" tone="oklch(0.62 0.2 145)" />}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PixelTransition
        gridSize={p.gridSize as number}
        animationStepDuration={p.animationStepDuration as number}
        once={p.once as boolean}
        firstContent={<Face label="瑚琏" tone="oklch(0.55 0.16 255)" />}
        secondContent={<Face label="组件库" tone="oklch(0.62 0.2 25)" />}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<PixelTransition`,
      `  gridSize={${p.gridSize}}`,
      `  animationStepDuration={${p.animationStepDuration}}`,
      `  once={${p.once}}`,
      `  firstContent={<img src="/a.jpg" alt="" />}`,
      `  secondContent={<img src="/b.jpg" alt="" />}`,
      `/>`,
    ].join("\n"),
};
