"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { RippleGrid } from "./ripple-grid";

/** 演示舞台：深色容器，让涟漪网格清晰可见。组件自带 absolute inset-0 z-0。 */
function Stage({
  children,
  dark = true,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <div
      className="relative h-64 w-full max-w-2xl overflow-hidden rounded-xl border border-white/10"
      style={{ background: dark ? "oklch(0.12 0.02 265)" : "oklch(0.97 0.005 265)" }}
    >
      {children}
    </div>
  );
}

export const rippleGridShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "默认深色底 + chart-1 token 网格；放在 relative 容器里自带 absolute inset-0 z-0。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <RippleGrid />
  <div className="relative z-10 flex h-full items-center justify-center">
    <p className="text-2xl font-bold text-white/90">RippleGrid</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <RippleGrid />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-2xl font-bold tracking-tight text-white/90">
              RippleGrid
            </p>
          </div>
        </Stage>
      ),
    },
    {
      title: "密网格 · 强辉光",
      description:
        "gridSize 加密格子、glowIntensity 提升线条外晕、gridThickness 调锐线条。",
      code: `<RippleGrid gridSize={18} glowIntensity={0.3} gridThickness={20} />`,
      render: () => (
        <Stage>
          <RippleGrid gridSize={18} glowIntensity={0.3} gridThickness={20} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">密网格 · 强辉光</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "彩虹配色",
      description: "enableRainbow 让网格随时间在 RGB 间循环渐变（此时忽略 color）。",
      code: `<RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12} />`,
      render: () => (
        <Stage>
          <RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/80">彩虹涟漪</p>
          </div>
        </Stage>
      ),
    },
    {
      title: "菱形网格 · 自定义色",
      description: "gridRotation=45 旋成菱形网格，color 传任意 CSS 颜色覆盖 token。",
      code: `<RippleGrid
  gridRotation={45}
  color="oklch(0.78 0.18 75)"
  gridSize={9}
  rippleIntensity={0.06}
/>`,
      render: () => (
        <Stage>
          <RippleGrid
            gridRotation={45}
            color="oklch(0.78 0.18 75)"
            gridSize={9}
            rippleIntensity={0.06}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">
              45° 菱形 · 暖金
            </p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "rippleIntensity", type: "number", defaultValue: 0.05, label: "涟漪强度" },
    { prop: "gridSize", type: "number", defaultValue: 10, label: "网格密度" },
    { prop: "gridThickness", type: "number", defaultValue: 15, label: "线条锐度" },
    { prop: "glowIntensity", type: "number", defaultValue: 0.1, label: "辉光强度" },
    { prop: "gridRotation", type: "number", defaultValue: 0, label: "旋转（度）" },
    { prop: "enableRainbow", type: "boolean", defaultValue: false, label: "彩虹配色" },
    { prop: "mouseInteraction", type: "boolean", defaultValue: true, label: "鼠标交互" },
    { prop: "color", type: "text", defaultValue: "", label: "自定义色（留空=chart-1）" },
  ],

  states: [
    {
      name: "default（深色底·chart-1 token）",
      render: () => (
        <Stage>
          <RippleGrid />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-2xl font-bold tracking-tight text-white/90">RippleGrid</p>
            <p className="text-sm text-white/50">涟漪网格 WebGL 背景</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "密网格 + 强辉光（gridSize=18·glow=0.3）",
      render: () => (
        <Stage>
          <RippleGrid gridSize={18} glowIntensity={0.3} gridThickness={20} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/70">密网格 · 强辉光</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "彩虹循环配色（enableRainbow）",
      render: () => (
        <Stage>
          <RippleGrid enableRainbow rippleIntensity={0.08} gridSize={12} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-white/80">彩虹涟漪</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "45° 菱形网格 + 暖金色",
      render: () => (
        <Stage>
          <RippleGrid
            gridRotation={45}
            color="oklch(0.78 0.18 75)"
            gridSize={9}
            rippleIntensity={0.06}
          />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-amber-100/80">45° 菱形 · 暖金</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "浅色底（亮色主题）",
      render: () => (
        <Stage dark={false}>
          <RippleGrid color="oklch(0.55 0.2 270)" opacity={0.85} />
          <div className="relative z-10 flex h-full items-center justify-center">
            <p className="text-lg font-semibold text-neutral-700">浅色底 · 自定义色</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <RippleGrid
        rippleIntensity={p.rippleIntensity as number}
        gridSize={p.gridSize as number}
        gridThickness={p.gridThickness as number}
        glowIntensity={p.glowIntensity as number}
        gridRotation={p.gridRotation as number}
        enableRainbow={p.enableRainbow as boolean}
        mouseInteraction={p.mouseInteraction as boolean}
        color={(p.color as string) || undefined}
      />
      <div className="relative z-10 flex h-full items-center justify-center">
        <p className="text-sm font-medium text-white/60">RippleGrid · WebGL 背景</p>
      </div>
    </Stage>
  ),

  toCode: (p) => {
    const colorLine = p.color ? `\n    color="${p.color}"` : "";
    return [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
      `  <RippleGrid`,
      `    rippleIntensity={${p.rippleIntensity}}`,
      `    gridSize={${p.gridSize}}`,
      `    gridThickness={${p.gridThickness}}`,
      `    glowIntensity={${p.glowIntensity}}`,
      `    gridRotation={${p.gridRotation}}`,
      `    enableRainbow={${p.enableRainbow}}`,
      `    mouseInteraction={${p.mouseInteraction}}${colorLine}`,
      `  />`,
      `  <div className="relative z-10">内容</div>`,
      `</div>`,
    ].join("\n");
  },
};
