"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Lightfall } from "./lightfall";

/** 展示用深色底容器，让坠落光束清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const lightfallShowcase: ShowcaseSpec = {
  controls: [
    { prop: "streakCount", type: "number", defaultValue: 2, label: "光束条数" },
    { prop: "speed", type: "number", defaultValue: 0.5, label: "坠落速度" },
    { prop: "glow", type: "number", defaultValue: 1, label: "辉光强度" },
    {
      prop: "mouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标交互",
    },
  ],

  states: [
    {
      name: "default（深色底·默认参数）",
      render: () => (
        <Stage>
          <Lightfall />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Lightfall
          </div>
        </Stage>
      ),
    },
    {
      name: "密集多束（暖橙调）",
      render: () => (
        <Stage>
          <Lightfall
            streakCount={6}
            density={1.2}
            colors={[
              "var(--color-chart-3)",
              "var(--color-chart-1)",
              "oklch(0.74 0.2 35)",
            ]}
            glow={1.3}
          />
        </Stage>
      ),
    },
    {
      name: "缓慢壁纸级（长拖尾·无交互）",
      render: () => (
        <Stage>
          <Lightfall
            speed={0.25}
            streakCount={3}
            streakLength={1.8}
            backgroundGlow={0.8}
            mouseInteraction={false}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "稳定常亮（twinkle=0·细光束）",
      render: () => (
        <Stage>
          <Lightfall twinkle={0} streakWidth={0.7} streakCount={4} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Lightfall
        streakCount={p.streakCount as number}
        speed={p.speed as number}
        glow={p.glow as number}
        mouseInteraction={p.mouseInteraction as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Lightfall
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 265)" }}>`,
      `  <Lightfall`,
      `    streakCount={${p.streakCount}}`,
      `    speed={${p.speed}}`,
      `    glow={${p.glow}}`,
      `    mouseInteraction={${p.mouseInteraction}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
