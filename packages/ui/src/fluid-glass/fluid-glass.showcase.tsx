"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FluidGlass } from "./fluid-glass";

/** 展示用容器：暗底 + 圆角，凸显玻璃折射；移动指针时透镜跟随。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border">
      {children}
    </div>
  );
}

export const fluidGlassShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "number", defaultValue: 0.26, label: "透镜大小" },
    { prop: "refraction", type: "number", defaultValue: 0.5, label: "折射强度" },
    { prop: "dispersion", type: "number", defaultValue: 0.3, label: "色散" },
    { prop: "speed", type: "number", defaultValue: 1, label: "流动速度" },
    {
      prop: "followPointer",
      type: "boolean",
      defaultValue: true,
      label: "跟随指针",
    },
  ],

  states: [
    {
      name: "default（移动指针看透镜跟随）",
      render: () => (
        <Stage>
          <FluidGlass className="absolute inset-0">
            <div className="flex h-full items-center justify-center text-lg font-semibold text-white drop-shadow">
              Fluid Glass
            </div>
          </FluidGlass>
        </Stage>
      ),
    },
    {
      name: "强折射 + 强色散（厚玻璃）",
      render: () => (
        <Stage>
          <FluidGlass
            size={0.32}
            refraction={0.85}
            dispersion={0.7}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "不跟随指针（透镜自漂移）",
      render: () => (
        <Stage>
          <FluidGlass followPointer={false} size={0.24} className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "自定义暖色调",
      render: () => (
        <Stage>
          <FluidGlass
            colors={[
              "oklch(0.72 0.2 30)",
              "oklch(0.78 0.16 70)",
              "var(--color-chart-3)",
            ]}
            refraction={0.6}
            className="absolute inset-0"
          >
            <div className="flex h-full flex-col items-center justify-center gap-1">
              <p className="text-base font-semibold text-white">瑚琏组件库</p>
              <p className="text-xs text-white/70">流体玻璃 · 实时折射</p>
            </div>
          </FluidGlass>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FluidGlass
        size={p.size as number}
        refraction={p.refraction as number}
        dispersion={p.dispersion as number}
        speed={p.speed as number}
        followPointer={p.followPointer as boolean}
        className="absolute inset-0"
      >
        <div className="flex h-full items-center justify-center text-sm text-white/80">
          Fluid Glass
        </div>
      </FluidGlass>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl">`,
      `  <FluidGlass`,
      `    size={${p.size}}`,
      `    refraction={${p.refraction}}`,
      `    dispersion={${p.dispersion}}`,
      `    speed={${p.speed}}`,
      `    followPointer={${p.followPointer}}`,
      `    className="absolute inset-0"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
