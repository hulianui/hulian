"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Grainient } from "./grainient";

/** 展示用容器，让色场背景清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-neutral-950">
      {children}
    </div>
  );
}

export const grainientShowcase: ShowcaseSpec = {
  controls: [
    { prop: "timeSpeed", type: "number", defaultValue: 0.25, label: "时间流速" },
    { prop: "grainAmount", type: "number", defaultValue: 0.1, label: "颗粒强度" },
    { prop: "zoom", type: "number", defaultValue: 0.9, label: "缩放" },
    { prop: "contrast", type: "number", defaultValue: 1.5, label: "对比度" },
    { prop: "grainAnimated", type: "boolean", defaultValue: false, label: "颗粒闪动" },
  ],

  states: [
    {
      name: "default（默认参数 · chart token 三色）",
      render: () => (
        <Stage>
          <Grainient />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/85">
            Grainient
          </div>
        </Stage>
      ),
    },
    {
      name: "纯净渐变（grainAmount=0）",
      render: () => (
        <Stage>
          <Grainient grainAmount={0} timeSpeed={0.18} />
        </Stage>
      ),
    },
    {
      name: "重颗粒胶片感（grain 闪动）",
      render: () => (
        <Stage>
          <Grainient grainAmount={0.22} grainAnimated contrast={1.7} />
        </Stage>
      ),
    },
    {
      name: "自定义暖橙调（自定义三色 + 放大取景）",
      render: () => (
        <Stage>
          <Grainient
            color1="oklch(0.82 0.16 70)"
            color2="oklch(0.62 0.2 30)"
            color3="oklch(0.32 0.06 300)"
            zoom={1.3}
            timeSpeed={0.35}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/70">域扭曲渐变 · 胶片颗粒</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Grainient
        timeSpeed={p.timeSpeed as number}
        grainAmount={p.grainAmount as number}
        zoom={p.zoom as number}
        contrast={p.contrast as number}
        grainAnimated={p.grainAnimated as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/75">
        Grainient
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">`,
      `  <Grainient`,
      `    timeSpeed={${p.timeSpeed}}`,
      `    grainAmount={${p.grainAmount}}`,
      `    zoom={${p.zoom}}`,
      `    contrast={${p.contrast}}`,
      `    grainAnimated={${p.grainAnimated}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
