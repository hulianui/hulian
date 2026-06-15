"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ColorBends } from "./color-bends";

/** 展示用深色底容器，让色带流场清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const colorBendsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认色带流场，颜色取 chart token，自适应明暗主题。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <ColorBends />
</div>`,
      render: () => (
        <Stage>
          <ColorBends />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            ColorBends
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义配色 + 高频",
      description: "colors 传暖色数组，调高 frequency 让色带更细密。",
      code: `<ColorBends
  colors={[
    "oklch(0.72 0.22 30)",
    "oklch(0.78 0.18 60)",
    "oklch(0.68 0.2 350)",
  ]}
  frequency={2}
  scale={0.8}
  speed={0.3}
/>`,
      render: () => (
        <Stage>
          <ColorBends
            colors={[
              "oklch(0.72 0.22 30)",
              "oklch(0.78 0.18 60)",
              "oklch(0.68 0.2 350)",
            ]}
            frequency={2}
            scale={0.8}
            speed={0.3}
          />
        </Stage>
      ),
    },
    {
      title: "自动旋转（壁纸级）",
      description: "autoRotate 让流场持续转动，intensity 提亮作内容背景。",
      code: `<ColorBends autoRotate={8} intensity={2.2} bandWidth={8} speed={0.15} />`,
      render: () => (
        <Stage>
          <ColorBends autoRotate={8} intensity={2.2} bandWidth={8} speed={0.15} />
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">多色流场 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "净色单层",
      description: "iterations=1 不折叠、noise=0 去颗粒，得到干净舒展的色带。",
      code: `<ColorBends iterations={1} noise={0} warpStrength={0.6} />`,
      render: () => (
        <Stage>
          <ColorBends iterations={1} noise={0} warpStrength={0.6} />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 0.2, label: "流动速度" },
    { prop: "scale", type: "number", defaultValue: 1, label: "流场缩放" },
    { prop: "frequency", type: "number", defaultValue: 1, label: "波纹频率" },
    { prop: "intensity", type: "number", defaultValue: 1.5, label: "亮度增益" },
    { prop: "bandWidth", type: "number", defaultValue: 6, label: "色带宽度" },
    { prop: "autoRotate", type: "number", defaultValue: 0, label: "自旋速度 °/s" },
    { prop: "transparent", type: "boolean", defaultValue: true, label: "透明背景" },
  ],

  states: [
    {
      name: "default（chart token·默认参数）",
      render: () => (
        <Stage>
          <ColorBends />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            ColorBends
          </div>
        </Stage>
      ),
    },
    {
      name: "自定义暖色带 + 高频细密",
      render: () => (
        <Stage>
          <ColorBends
            colors={[
              "oklch(0.72 0.22 30)",
              "oklch(0.78 0.18 60)",
              "oklch(0.68 0.2 350)",
            ]}
            frequency={2}
            scale={0.8}
            speed={0.3}
          />
        </Stage>
      ),
    },
    {
      name: "自动旋转 + 高强度（壁纸级）",
      render: () => (
        <Stage>
          <ColorBends autoRotate={8} intensity={2.2} bandWidth={8} speed={0.15} />
          <div className="pointer-events-none relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">多色流场 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "无折叠迭代 + 低噪净色",
      render: () => (
        <Stage>
          <ColorBends iterations={1} noise={0} warpStrength={0.6} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ColorBends
        speed={p.speed as number}
        scale={p.scale as number}
        frequency={p.frequency as number}
        intensity={p.intensity as number}
        bandWidth={p.bandWidth as number}
        autoRotate={p.autoRotate as number}
        transparent={p.transparent as boolean}
      />
      <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        ColorBends
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <ColorBends`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    frequency={${p.frequency}}`,
      `    intensity={${p.intensity}}`,
      `    bandWidth={${p.bandWidth}}`,
      `    autoRotate={${p.autoRotate}}`,
      `    transparent={${p.transparent}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
