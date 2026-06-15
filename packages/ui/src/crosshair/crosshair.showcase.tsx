"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Crosshair } from "./crosshair";

/** 展示用深色底容器：准星十字线在深底上对比清晰，移动鼠标到容器内查看跟随。 */
function Stage({
  children,
  hint = "把鼠标移到这里",
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/40">
        {hint}
      </div>
      {children}
    </div>
  );
}

export const crosshairShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "组件自渲染 absolute inset-0 铺满父级的准星层，鼠标移入即出现跟随十字线。",
      code: `<div
  className="relative h-56 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.14 0.02 255)" }}
>
  <Crosshair />
</div>`,
      render: () => (
        <Stage>
          <Crosshair />
        </Stage>
      ),
    },
    {
      title: "颜色与粗细",
      description: "color 走 token，thickness 控制线条粗细。",
      code: `<Crosshair color="var(--color-chart-1)" thickness={2} />`,
      render: () => (
        <Stage>
          <Crosshair color="var(--color-chart-1)" thickness={2} />
        </Stage>
      ),
    },
    {
      title: "高黏滞拖尾",
      description: "调小 smoothing 让十字线跟随更迟滞、拖尾更明显。",
      code: `<Crosshair smoothing={0.06} color="var(--color-chart-3)" />`,
      render: () => (
        <Stage hint="慢速跟随 · 拖尾更明显">
          <Crosshair smoothing={0.06} color="var(--color-chart-3)" />
        </Stage>
      ),
    },
    {
      title: "关闭进入脉冲",
      description: "pulseOnEnter={false} 去掉进入时的抖动脉冲，只保留平滑跟随。",
      code: `<Crosshair pulseOnEnter={false} color="var(--color-foreground)" />`,
      render: () => (
        <Stage>
          <Crosshair pulseOnEnter={false} color="var(--color-foreground)" />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "smoothing", type: "number", defaultValue: 0.15, label: "跟随平滑 0–1" },
    { prop: "thickness", type: "number", defaultValue: 1, label: "线条粗细 px" },
    { prop: "pulseOnEnter", type: "boolean", defaultValue: true, label: "进入脉冲" },
  ],

  states: [
    {
      name: "default（primary 准星）",
      render: () => (
        <Stage>
          <Crosshair />
        </Stage>
      ),
    },
    {
      name: "chart-1 色 · 加粗",
      render: () => (
        <Stage>
          <Crosshair color="var(--color-chart-1)" thickness={2} />
        </Stage>
      ),
    },
    {
      name: "高黏滞拖尾（smoothing 0.06）",
      render: () => (
        <Stage hint="慢速跟随 · 拖尾更明显">
          <Crosshair smoothing={0.06} color="var(--color-chart-3)" />
        </Stage>
      ),
    },
    {
      name: "无进入脉冲 · foreground 色",
      render: () => (
        <Stage>
          <Crosshair pulseOnEnter={false} color="var(--color-foreground)" />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Crosshair
        smoothing={p.smoothing as number}
        thickness={p.thickness as number}
        pulseOnEnter={p.pulseOnEnter as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Crosshair`,
      `    smoothing={${p.smoothing}}`,
      `    thickness={${p.thickness}}`,
      `    pulseOnEnter={${p.pulseOnEnter}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
