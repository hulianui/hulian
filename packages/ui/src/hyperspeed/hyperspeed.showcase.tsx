"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Hyperspeed } from "./hyperspeed";

/** 黑底容器 —— warp 隧道效果需深色底显辉光 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border bg-black">
      {children}
    </div>
  );
}

export const hyperspeedShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 1, label: "推进速度" },
    { prop: "density", type: "number", defaultValue: 40, label: "灯带密度" },
    { prop: "distortion", type: "number", defaultValue: 1, label: "扭曲强度" },
    { prop: "fade", type: "number", defaultValue: 0.4, label: "雾化淡出" },
  ],

  states: [
    {
      name: "default（默认 chart 双色车灯）",
      render: () => (
        <Stage>
          <Hyperspeed className="absolute inset-0" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-white/80">
            Hyperspeed
          </div>
        </Stage>
      ),
    },
    {
      name: "高速密集（踩满油门）",
      render: () => (
        <Stage>
          <Hyperspeed speed={3} density={90} className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "笔直隧道（无扭曲）",
      render: () => (
        <Stage>
          <Hyperspeed distortion={0} density={56} className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "自定义车灯色（暖橙 / 青）",
      render: () => (
        <Stage>
          <Hyperspeed
            leftColor="oklch(0.72 0.2 40)"
            rightColor="oklch(0.7 0.16 200)"
            speed={1.5}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Hyperspeed
        speed={p.speed as number}
        density={p.density as number}
        distortion={p.distortion as number}
        fade={p.fade as number}
        className="absolute inset-0"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl bg-black">`,
      `  <Hyperspeed`,
      `    speed={${p.speed}}`,
      `    density={${p.density}}`,
      `    distortion={${p.distortion}}`,
      `    fade={${p.fade}}`,
      `    className="absolute inset-0"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
