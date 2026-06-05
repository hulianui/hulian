"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GradientBlinds } from "./gradient-blinds";

/** 展示用深色底容器，让百叶渐变 + 聚光灯清晰可见 */
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

export const gradientBlindsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "blindCount", type: "number", defaultValue: 16, label: "百叶条数" },
    { prop: "angle", type: "number", defaultValue: 0, label: "旋转角度°" },
    { prop: "noise", type: "number", defaultValue: 0.3, label: "噪声强度" },
    {
      prop: "shineDirection",
      type: "select",
      options: ["left", "right"],
      defaultValue: "left",
      label: "扫光方向",
    },
    { prop: "mirrorGradient", type: "boolean", defaultValue: false, label: "镜像渐变" },
  ],

  states: [
    {
      name: "default（默认 chart token 双色 · 跟随鼠标聚光灯）",
      render: () => (
        <Stage>
          <GradientBlinds />
          <div className="pointer-events-none relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            移动鼠标试试聚光灯
          </div>
        </Stage>
      ),
    },
    {
      name: "斜向 + 多色站",
      render: () => (
        <Stage>
          <GradientBlinds
            gradientColors={[
              "var(--color-chart-1)",
              "var(--color-chart-2)",
              "var(--color-chart-4)",
            ]}
            angle={30}
            blindCount={24}
          />
        </Stage>
      ),
    },
    {
      name: "镜像渐变 + 高条数",
      render: () => (
        <Stage>
          <GradientBlinds mirrorGradient blindCount={32} noise={0.15} />
        </Stage>
      ),
    },
    {
      name: "暖橙调 · 扭曲 + 大聚光灯",
      render: () => (
        <Stage>
          <GradientBlinds
            gradientColors={["oklch(0.72 0.22 30)", "var(--color-chart-3)"]}
            distortAmount={0.8}
            spotlightRadius={0.7}
            spotlightSoftness={1.4}
            shineDirection="right"
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GradientBlinds
        blindCount={p.blindCount as number}
        angle={p.angle as number}
        noise={p.noise as number}
        shineDirection={p.shineDirection as "left" | "right"}
        mirrorGradient={p.mirrorGradient as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <GradientBlinds`,
      `    blindCount={${p.blindCount}}`,
      `    angle={${p.angle}}`,
      `    noise={${p.noise}}`,
      `    shineDirection="${p.shineDirection}"`,
      `    mirrorGradient={${p.mirrorGradient}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
