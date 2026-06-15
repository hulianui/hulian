"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Ferrofluid } from "./ferrofluid";

/** 展示用深色底容器，让液态金属铁磁流体效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const ferrofluidShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "液态金属铁磁流体背景；默认色带吃 chart token，鼠标处液面下凹。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Ferrofluid />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Ferrofluid
  </div>
</div>`,
      render: () => (
        <Stage>
          <Ferrofluid />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Ferrofluid
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义色带 + 流向",
      description: "colors 数组按高度梯度映射色带，flowDirection 控制峰脊整体漂移方向。",
      code: `<Ferrofluid
  colors={[
    "var(--color-chart-3)",
    "var(--color-chart-1)",
    "oklch(0.78 0.2 50)",
  ]}
  flowDirection="up"
  glow={2.6}
/>`,
      render: () => (
        <Stage>
          <Ferrofluid
            colors={[
              "var(--color-chart-3)",
              "var(--color-chart-1)",
              "oklch(0.78 0.2 50)",
            ]}
            flowDirection="up"
            glow={2.6}
          />
        </Stage>
      ),
    },
    {
      title: "高湍流 · 锐利峰脊",
      description: "加大 turbulence、调小 fluidity、加大 sharpness 得到更锐利分明的金属峰脊。",
      code: `<Ferrofluid turbulence={2.2} fluidity={0.04} sharpness={3.5} speed={0.8} />`,
      render: () => (
        <Stage>
          <Ferrofluid turbulence={2.2} fluidity={0.04} sharpness={3.5} speed={0.8} />
        </Stage>
      ),
    },
    {
      title: "壁纸级（慢速大尺度）",
      description: "慢速 + 大 scale + 关闭鼠标交互，适合做静默 hero 背景叠文案。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">液态金属 · WebGL · 主题自适应</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false} />
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">液态金属 · WebGL · 主题自适应</p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 0.5, label: "速度" },
    { prop: "scale", type: "number", defaultValue: 1.6, label: "缩放" },
    { prop: "glow", type: "number", defaultValue: 2, label: "辉光" },
    {
      prop: "flowDirection",
      type: "select",
      options: ["up", "down", "left", "right"],
      defaultValue: "down",
      label: "流向",
    },
    {
      prop: "mouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标交互",
    },
  ],

  states: [
    {
      name: "default（深色底·chart token 默认色）",
      render: () => (
        <Stage>
          <Ferrofluid />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Ferrofluid
          </div>
        </Stage>
      ),
    },
    {
      name: "暖色调 · 向上流动",
      render: () => (
        <Stage>
          <Ferrofluid
            colors={[
              "var(--color-chart-3)",
              "var(--color-chart-1)",
              "oklch(0.78 0.2 50)",
            ]}
            flowDirection="up"
            glow={2.6}
          />
        </Stage>
      ),
    },
    {
      name: "高湍流 · 低流动性（锐利峰脊）",
      render: () => (
        <Stage>
          <Ferrofluid turbulence={2.2} fluidity={0.04} sharpness={3.5} speed={0.8} />
        </Stage>
      ),
    },
    {
      name: "壁纸级 · 慢速大尺度（无鼠标交互）",
      render: () => (
        <Stage>
          <Ferrofluid speed={0.25} scale={2.4} glow={2.4} mouseInteraction={false} />
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">液态金属 · WebGL · 主题自适应</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Ferrofluid
        speed={p.speed as number}
        scale={p.scale as number}
        glow={p.glow as number}
        flowDirection={p.flowDirection as "up" | "down" | "left" | "right"}
        mouseInteraction={p.mouseInteraction as boolean}
      />
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Ferrofluid
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
      `  <Ferrofluid`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    glow={${p.glow}}`,
      `    flowDirection="${p.flowDirection}"`,
      `    mouseInteraction={${p.mouseInteraction}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
