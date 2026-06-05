"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MetallicPaint } from "./metallic-paint";

/** 展示用深色底容器，让液态金属漆效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.12 0.01 255)" }}
    >
      {children}
    </div>
  );
}

export const metallicPaintShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 1, label: "流动速度" },
    { prop: "scale", type: "number", defaultValue: 1, label: "纹理缩放" },
    { prop: "refraction", type: "number", defaultValue: 1, label: "折射强度" },
    { prop: "liquid", type: "number", defaultValue: 0.6, label: "液态扰动" },
    { prop: "blur", type: "number", defaultValue: 0.6, label: "边缘模糊" },
    { prop: "angle", type: "number", defaultValue: -45, label: "光线角度" },
  ],

  states: [
    {
      name: "default（chart-1 高光 · 默认参数）",
      render: () => (
        <Stage>
          <MetallicPaint className="opacity-95" />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/70">
            Metallic Paint
          </div>
        </Stage>
      ),
    },
    {
      name: "高液态（水银流动）",
      render: () => (
        <Stage>
          <MetallicPaint liquid={1} speed={1.4} className="opacity-95" />
        </Stage>
      ),
    },
    {
      name: "强折射（虹彩色散）",
      render: () => (
        <Stage>
          <MetallicPaint
            refraction={1.8}
            lightColor="var(--color-chart-2)"
            className="opacity-95"
          />
        </Stage>
      ),
    },
    {
      name: "静态镜面（低液态低折射）",
      render: () => (
        <Stage>
          <MetallicPaint liquid={0.1} refraction={0.5} speed={0.4} blur={1} className="opacity-95" />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <MetallicPaint
        speed={p.speed as number}
        scale={p.scale as number}
        refraction={p.refraction as number}
        liquid={p.liquid as number}
        blur={p.blur as number}
        angle={p.angle as number}
        className="opacity-95"
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/60">
        Metallic Paint
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.01 255)" }}>`,
      `  <MetallicPaint`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    refraction={${p.refraction}}`,
      `    liquid={${p.liquid}}`,
      `    blur={${p.blur}}`,
      `    angle={${p.angle}}`,
      `    className="opacity-95"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
