"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { EvilEye } from "./evil-eye";

/** 深色舞台，让火焰邪眼有对比度可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.01 60)" }}
    >
      {children}
    </div>
  );
}

export const evilEyeShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "火焰邪眼背景，瞳孔随光标偏移；默认火焰色吃 --color-chart-3，明暗自适应。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <EvilEye className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <EvilEye className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "更凶（收缩瞳孔 + 高强度）",
      description: "调小 pupilSize 收成缝、加大 intensity / flameSpeed 让火焰更亮更躁动。",
      code: `<EvilEye
  className="absolute inset-0"
  pupilSize={0.35}
  intensity={2.2}
  flameSpeed={1.6}
/>`,
      render: () => (
        <Stage>
          <EvilEye
            className="absolute inset-0"
            pupilSize={0.35}
            intensity={2.2}
            flameSpeed={1.6}
          />
        </Stage>
      ),
    },
    {
      title: "自定义眼色（幽蓝）",
      description: "eyeColor 覆盖默认火橙；scale 控制眼睛在画面里的占比。",
      code: `<EvilEye
  className="absolute inset-0"
  eyeColor="oklch(0.7 0.18 230)"
  glowIntensity={0.5}
  scale={0.9}
/>`,
      render: () => (
        <Stage>
          <EvilEye
            className="absolute inset-0"
            eyeColor="oklch(0.7 0.18 230)"
            glowIntensity={0.5}
            scale={0.9}
          />
        </Stage>
      ),
    },
    {
      title: "壁纸级（瞳孔不跟随 + 慢火）",
      description: "pupilFollow=0 让瞳孔固定不随光标，慢火 + 大噪声适合做静默背景。",
      code: `<EvilEye
  className="absolute inset-0"
  pupilFollow={0}
  flameSpeed={0.5}
  noiseScale={1.3}
/>`,
      render: () => (
        <Stage>
          <EvilEye
            className="absolute inset-0"
            pupilFollow={0}
            flameSpeed={0.5}
            noiseScale={1.3}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "intensity", type: "number", defaultValue: 1.5, label: "发光强度" },
    { prop: "pupilSize", type: "number", defaultValue: 0.6, label: "瞳孔大小" },
    { prop: "glowIntensity", type: "number", defaultValue: 0.35, label: "外圈辉光" },
    { prop: "flameSpeed", type: "number", defaultValue: 1.0, label: "火焰速度" },
  ],

  states: [
    {
      name: "default（chart-3 暖橙 · 跟随光标）",
      render: () => (
        <Stage>
          <EvilEye className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "收缩瞳孔 · 高强度（更凶）",
      render: () => (
        <Stage>
          <EvilEye
            className="absolute inset-0"
            pupilSize={0.35}
            intensity={2.2}
            flameSpeed={1.6}
          />
        </Stage>
      ),
    },
    {
      name: "幽蓝邪眼（自定义 eyeColor）",
      render: () => (
        <Stage>
          <EvilEye
            className="absolute inset-0"
            eyeColor="oklch(0.7 0.18 230)"
            glowIntensity={0.5}
            scale={0.9}
          />
        </Stage>
      ),
    },
    {
      name: "瞳孔不跟随 · 慢火（壁纸级）",
      render: () => (
        <Stage>
          <EvilEye
            className="absolute inset-0"
            pupilFollow={0}
            flameSpeed={0.5}
            noiseScale={1.3}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <EvilEye
        className="absolute inset-0"
        intensity={p.intensity as number}
        pupilSize={p.pupilSize as number}
        glowIntensity={p.glowIntensity as number}
        flameSpeed={p.flameSpeed as number}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.01 60)" }}>`,
      `  <EvilEye`,
      `    className="absolute inset-0"`,
      `    intensity={${p.intensity}}`,
      `    pupilSize={${p.pupilSize}}`,
      `    glowIntensity={${p.glowIntensity}}`,
      `    flameSpeed={${p.flameSpeed}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
