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
