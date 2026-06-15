"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { LaserFlow } from "./laser-flow";

/** 展示用深色底容器，让激光体积光清晰可见。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-72 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 285)" }}
    >
      {children}
    </div>
  );
}

export const laserFlowShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative + overflow-hidden 的深色容器，LaserFlow 自带 absolute inset-0，内容叠 z-10 即可。",
      code: `<div className="relative h-72 overflow-hidden rounded-xl bg-neutral-950">
  <LaserFlow />
  <div className="relative z-10 flex h-full items-center justify-center">
    LaserFlow
  </div>
</div>`,
      render: () => (
        <Stage>
          <LaserFlow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LaserFlow
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义颜色与雾",
      description: "color 换激光色调，fogIntensity 加雾，fogScale 控雾团细碎度。",
      code: `<LaserFlow
  color="oklch(0.72 0.2 35)"
  fogIntensity={0.6}
  fogScale={0.35}
/>`,
      render: () => (
        <Stage>
          <LaserFlow
            color="oklch(0.72 0.2 35)"
            fogIntensity={0.6}
            fogScale={0.35}
          />
        </Stage>
      ),
    },
    {
      title: "密流光 · 快脉冲",
      description: "wispDensity/wispIntensity 加密微流光，flowSpeed/flowStrength 增强脉冲感。",
      code: `<LaserFlow
  wispDensity={1.6}
  wispIntensity={6}
  flowSpeed={0.55}
  flowStrength={0.4}
/>`,
      render: () => (
        <Stage>
          <LaserFlow
            wispDensity={1.6}
            wispIntensity={6}
            flowSpeed={0.55}
            flowStrength={0.4}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">体积光 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "偏移光束",
      description: "horizontalBeamOffset 横向移动光束，verticalSizing 拉长光束。",
      code: `<LaserFlow
  horizontalBeamOffset={-0.18}
  verticalSizing={2.4}
  color="oklch(0.7 0.18 200)"
/>`,
      render: () => (
        <Stage>
          <LaserFlow
            horizontalBeamOffset={-0.18}
            verticalSizing={2.4}
            color="oklch(0.7 0.18 200)"
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "flowSpeed", type: "number", defaultValue: 0.35, label: "光流速度" },
    { prop: "fogIntensity", type: "number", defaultValue: 0.45, label: "雾强度" },
    { prop: "wispIntensity", type: "number", defaultValue: 5, label: "微流光强度" },
    { prop: "horizontalBeamOffset", type: "number", defaultValue: 0, label: "横向偏移" },
  ],

  states: [
    {
      name: "default（深色底·默认参数）",
      render: () => (
        <Stage>
          <LaserFlow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            LaserFlow
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙激光（自定义色 + 高雾）",
      render: () => (
        <Stage>
          <LaserFlow
            color="oklch(0.72 0.2 35)"
            fogIntensity={0.6}
            fogScale={0.35}
          />
        </Stage>
      ),
    },
    {
      name: "密流光 · 快脉冲（壁纸级）",
      render: () => (
        <Stage>
          <LaserFlow
            wispDensity={1.6}
            wispIntensity={6}
            flowSpeed={0.55}
            flowStrength={0.4}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">体积光 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "偏移光束（横向 + 长光束）",
      render: () => (
        <Stage>
          <LaserFlow
            horizontalBeamOffset={-0.18}
            verticalSizing={2.4}
            color="oklch(0.7 0.18 200)"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LaserFlow
        flowSpeed={p.flowSpeed as number}
        fogIntensity={p.fogIntensity as number}
        wispIntensity={p.wispIntensity as number}
        horizontalBeamOffset={p.horizontalBeamOffset as number}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        LaserFlow
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-72 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 285)" }}>`,
      `  <LaserFlow`,
      `    flowSpeed={${p.flowSpeed}}`,
      `    fogIntensity={${p.fogIntensity}}`,
      `    wispIntensity={${p.wispIntensity}}`,
      `    horizontalBeamOffset={${p.horizontalBeamOffset}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
