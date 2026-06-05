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
