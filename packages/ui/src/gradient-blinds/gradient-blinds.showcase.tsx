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
  examples: [
    {
      title: "基础用法",
      description: "默认吃 chart token 双色，聚光灯跟随鼠标。放进 relative 容器即铺满。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <GradientBlinds />
</div>`,
      render: () => (
        <Stage>
          <GradientBlinds />
        </Stage>
      ),
    },
    {
      title: "自定义渐变色站 + 斜向",
      description: "gradientColors 传任意 CSS 颜色（最多前 8 个），angle 旋转整条色带。",
      code: `<GradientBlinds
  gradientColors={[
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-4)",
  ]}
  angle={30}
  blindCount={24}
/>`,
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
      title: "镜像渐变",
      description: "mirrorGradient 让色带在中点对折，形成对称往返。",
      code: `<GradientBlinds mirrorGradient blindCount={32} noise={0.15} />`,
      render: () => (
        <Stage>
          <GradientBlinds mirrorGradient blindCount={32} noise={0.15} />
        </Stage>
      ),
    },
    {
      title: "扭曲 + 大聚光灯",
      description: "distortAmount 让色带波浪起伏，spotlightRadius/Softness 调聚光灯大小与软硬。",
      code: `<GradientBlinds
  gradientColors={["oklch(0.72 0.22 30)", "var(--color-chart-3)"]}
  distortAmount={0.8}
  spotlightRadius={0.7}
  spotlightSoftness={1.4}
  shineDirection="right"
/>`,
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
