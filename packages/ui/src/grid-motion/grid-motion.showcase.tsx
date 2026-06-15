"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GridMotion } from "./grid-motion";

/** 展示用深色底容器，让倾斜网格的视差与光晕更清晰 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

const WORDS = [
  "瑚琏",
  "组件库",
  "企业级",
  "高质量",
  "原生适配",
  "Token",
  "动效",
];

export const gridMotionShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认 4×7 网格，奇偶行随鼠标横向反向视差平移；不足时用占位文字补齐。",
      code: `<div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
  <GridMotion className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <GridMotion className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "自定义文字 + 光晕色",
      description: "items 传内容数组（字符串当文字，http 开头当图片），gradientColor 改中心光晕。",
      code: `<GridMotion
  className="absolute inset-0"
  gradientColor="var(--color-chart-1)"
  items={["瑚琏", "组件库", "企业级", "高质量", "原生适配", "Token", "动效"]}
/>`,
      render: () => (
        <Stage>
          <GridMotion
            className="absolute inset-0"
            gradientColor="var(--color-chart-1)"
            items={Array.from({ length: 28 }, (_, i) => WORDS[i % WORDS.length])}
          />
        </Stage>
      ),
    },
    {
      title: "紧凑网格 + 小视差",
      description: "rows/columns 加密网格，maxMoveAmount 控制每行最大平移幅度。",
      code: `<GridMotion
  className="absolute inset-0"
  rows={6}
  columns={9}
  maxMoveAmount={160}
  gradientColor="var(--color-chart-4)"
/>`,
      render: () => (
        <Stage>
          <GridMotion
            className="absolute inset-0"
            rows={6}
            columns={9}
            maxMoveAmount={160}
            gradientColor="var(--color-chart-4)"
          />
        </Stage>
      ),
    },
    {
      title: "强透视（大旋转 + 大视差）",
      description: "rotate 调透视斜切角度，maxMoveAmount 越大视差越夸张。",
      code: `<GridMotion className="absolute inset-0" rotate={-25} maxMoveAmount={420} />`,
      render: () => (
        <Stage>
          <GridMotion className="absolute inset-0" rotate={-25} maxMoveAmount={420} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "rows", type: "number", defaultValue: 4, label: "行数" },
    { prop: "columns", type: "number", defaultValue: 7, label: "列数" },
    {
      prop: "maxMoveAmount",
      type: "number",
      defaultValue: 300,
      label: "最大视差 px",
    },
    { prop: "rotate", type: "number", defaultValue: -15, label: "旋转角度 deg" },
  ],

  states: [
    {
      name: "default（默认 4×7·占位文字）",
      render: () => (
        <Stage>
          <GridMotion className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "自定义文字 + 暖色光晕",
      render: () => (
        <Stage>
          <GridMotion
            className="absolute inset-0"
            gradientColor="var(--color-chart-1)"
            items={Array.from({ length: 28 }, (_, i) => WORDS[i % WORDS.length])}
          />
        </Stage>
      ),
    },
    {
      name: "紧凑网格（6×9·小视差）",
      render: () => (
        <Stage>
          <GridMotion
            className="absolute inset-0"
            rows={6}
            columns={9}
            maxMoveAmount={160}
            gradientColor="var(--color-chart-4)"
          />
        </Stage>
      ),
    },
    {
      name: "强透视（旋转 -25°·大视差）",
      render: () => (
        <Stage>
          <GridMotion
            className="absolute inset-0"
            rotate={-25}
            maxMoveAmount={420}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GridMotion
        className="absolute inset-0"
        rows={p.rows as number}
        columns={p.columns as number}
        maxMoveAmount={p.maxMoveAmount as number}
        rotate={p.rotate as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-72 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <GridMotion`,
      `    className="absolute inset-0"`,
      `    rows={${p.rows}}`,
      `    columns={${p.columns}}`,
      `    maxMoveAmount={${p.maxMoveAmount}}`,
      `    rotate={${p.rotate}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
