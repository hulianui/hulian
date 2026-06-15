"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LiquidEther } from "./liquid-ether";

/** 展示用深色底容器，让液态色域清晰可见（默认 chart token 在深底上对比最佳）。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 270)" }}
    >
      {children}
    </div>
  );
}

export const liquidEtherShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative 容器即可，组件自带 absolute inset-0；默认自动巡游搅动液面，颜色吃 chart token 明暗自适应。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <LiquidEther />
  <div className="relative z-10 flex h-full items-center justify-center text-white/85">
    LiquidEther
  </div>
</div>`,
      render: () => (
        <Stage>
          <LiquidEther />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            LiquidEther
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义调色板 · 大团块",
      description:
        "colors 接任意 CSS 颜色（hex / oklch / var token）；scale 越大色团越融合宏观，speed 控制翻涌速度。",
      code: `<LiquidEther
  colors={[
    "var(--color-chart-3)",
    "oklch(0.72 0.22 30)",
    "var(--color-chart-1)",
  ]}
  scale={1.6}
  speed={0.7}
/>`,
      render: () => (
        <Stage>
          <LiquidEther
            colors={[
              "var(--color-chart-3)",
              "oklch(0.72 0.22 30)",
              "var(--color-chart-1)",
            ]}
            scale={1.6}
            speed={0.7}
          />
        </Stage>
      ),
    },
    {
      title: "静止待交互",
      description:
        "autoDemo={false} 关掉自动巡游，画面静止等待真实指针；mouseForce 调大让搅动更跟手。",
      code: `<LiquidEther autoDemo={false} mouseForce={1.5} />`,
      render: () => (
        <Stage>
          <LiquidEther autoDemo={false} mouseForce={1.5} />
        </Stage>
      ),
    },
    {
      title: "壁纸级叠底",
      description:
        "慢速 + 半透明（opacity）压低视觉重量，作为标题区背景叠在文字下方。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">液态色域 · 鼠标驱动</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">液态色域 · 鼠标驱动</p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 0.5, label: "流动速度" },
    { prop: "scale", type: "number", defaultValue: 1, label: "团块尺度" },
    { prop: "mouseForce", type: "number", defaultValue: 1, label: "指针扰动" },
    { prop: "autoDemo", type: "boolean", defaultValue: true, label: "自动演示" },
    { prop: "opacity", type: "number", defaultValue: 1, label: "不透明度" },
  ],

  states: [
    {
      name: "default（默认参数·自动巡游）",
      render: () => (
        <Stage>
          <LiquidEther />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            LiquidEther
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙调 · 大团块",
      render: () => (
        <Stage>
          <LiquidEther
            colors={[
              "var(--color-chart-3)",
              "oklch(0.72 0.22 30)",
              "var(--color-chart-1)",
            ]}
            scale={1.6}
            speed={0.7}
          />
        </Stage>
      ),
    },
    {
      name: "静止待交互（关闭自动演示·移入鼠标搅动）",
      render: () => (
        <Stage>
          <LiquidEther autoDemo={false} mouseForce={1.5} />
        </Stage>
      ),
    },
    {
      name: "壁纸级（慢速·半透明叠底）",
      render: () => (
        <Stage>
          <LiquidEther speed={0.3} scale={1.2} opacity={0.7} />
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">液态色域 · 鼠标驱动</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LiquidEther
        speed={p.speed as number}
        scale={p.scale as number}
        mouseForce={p.mouseForce as number}
        autoDemo={p.autoDemo as boolean}
        opacity={p.opacity as number}
      />
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        LiquidEther
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 270)" }}>`,
      `  <LiquidEther`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    mouseForce={${p.mouseForce}}`,
      `    autoDemo={${p.autoDemo}}`,
      `    opacity={${p.opacity}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
