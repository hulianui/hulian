"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MagnetLines } from "./magnet-lines";

/** 展示用深色底容器，让线段网格清晰可见，并提示「移动鼠标」交互。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-72 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const magnetLinesShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "9×9 线段网格，每条线像指南针一样实时朝向鼠标。",
      code: `<MagnetLines containerSize="16rem" lineColor="var(--color-foreground)" />`,
      render: () => (
        <Stage>
          <MagnetLines containerSize="16rem" lineColor="var(--color-foreground)" />
        </Stage>
      ),
    },
    {
      title: "细密网格",
      description: "调高 rows/columns、收窄线宽，得到更精细的磁力线场。",
      code: `<MagnetLines
  rows={13}
  columns={13}
  containerSize="16rem"
  lineWidth="0.4rem"
  lineHeight="2rem"
  lineColor="var(--color-chart-1)"
/>`,
      render: () => (
        <Stage>
          <MagnetLines
            rows={13}
            columns={13}
            containerSize="16rem"
            lineWidth="0.4rem"
            lineHeight="2rem"
            lineColor="var(--color-chart-1)"
          />
        </Stage>
      ),
    },
    {
      title: "稀疏粗线",
      description: "更少行列 + 更粗线段，配品牌色做强视觉装饰。",
      code: `<MagnetLines
  rows={6}
  columns={6}
  containerSize="16rem"
  lineWidth="0.8rem"
  lineHeight="3rem"
  lineColor="var(--color-primary)"
/>`,
      render: () => (
        <Stage>
          <MagnetLines
            rows={6}
            columns={6}
            containerSize="16rem"
            lineWidth="0.8rem"
            lineHeight="3rem"
            lineColor="var(--color-primary)"
          />
        </Stage>
      ),
    },
    {
      title: "初始角度",
      description: "baseAngle 决定指针未移动时所有线段的静止角度。",
      code: `<MagnetLines
  baseAngle={45}
  containerSize="16rem"
  lineColor="var(--color-chart-2)"
/>`,
      render: () => (
        <Stage>
          <MagnetLines
            baseAngle={45}
            containerSize="16rem"
            lineColor="var(--color-chart-2)"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "rows", type: "number", defaultValue: 9, label: "行数" },
    { prop: "columns", type: "number", defaultValue: 9, label: "列数" },
    { prop: "baseAngle", type: "number", defaultValue: -10, label: "初始角度°" },
  ],

  states: [
    {
      name: "default（9×9·移动鼠标看磁力线）",
      render: () => (
        <Stage>
          <MagnetLines containerSize="16rem" lineColor="var(--color-foreground)" />
        </Stage>
      ),
    },
    {
      name: "细密网格（13×13）",
      render: () => (
        <Stage>
          <MagnetLines
            rows={13}
            columns={13}
            containerSize="16rem"
            lineWidth="0.4rem"
            lineHeight="2rem"
            lineColor="var(--color-chart-1)"
          />
        </Stage>
      ),
    },
    {
      name: "稀疏粗线（6×6·品牌色）",
      render: () => (
        <Stage>
          <MagnetLines
            rows={6}
            columns={6}
            containerSize="16rem"
            lineWidth="0.8rem"
            lineHeight="3rem"
            lineColor="var(--color-primary)"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <MagnetLines
        rows={p.rows as number}
        columns={p.columns as number}
        baseAngle={p.baseAngle as number}
        containerSize="16rem"
        lineColor="var(--color-foreground)"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative flex h-72 items-center justify-center overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <MagnetLines`,
      `    rows={${p.rows}}`,
      `    columns={${p.columns}}`,
      `    baseAngle={${p.baseAngle}}`,
      `    containerSize="16rem"`,
      `    lineColor="var(--color-foreground)"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
