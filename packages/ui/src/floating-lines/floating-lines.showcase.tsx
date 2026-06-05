"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { FloatingLines } from "./floating-lines";

/** 展示用深色底容器，让漂浮线束清晰可见 */
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

export const floatingLinesShowcase: ShowcaseSpec = {
  controls: [
    { prop: "lineCount", type: "number", defaultValue: 6, label: "每组线条数" },
    { prop: "lineDistance", type: "number", defaultValue: 5, label: "线条间距" },
    { prop: "animationSpeed", type: "number", defaultValue: 1, label: "速度倍率" },
    { prop: "interactive", type: "boolean", defaultValue: true, label: "指针交互" },
  ],

  states: [
    {
      name: "default（深色底·默认参数）",
      render: () => (
        <Stage>
          <FloatingLines />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            FloatingLines
          </div>
        </Stage>
      ),
    },
    {
      name: "密集慢速（壁纸级）",
      render: () => (
        <Stage>
          <FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
          </div>
        </Stage>
      ),
    },
    {
      name: "暖橙色带 · 关交互",
      render: () => (
        <Stage>
          <FloatingLines
            colors={[
              "var(--color-chart-3)",
              "oklch(0.72 0.22 30)",
              "var(--color-chart-1)",
            ]}
            interactive={false}
            animationSpeed={1.4}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <FloatingLines
        lineCount={p.lineCount as number}
        lineDistance={p.lineDistance as number}
        animationSpeed={p.animationSpeed as number}
        interactive={p.interactive as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        FloatingLines
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <FloatingLines`,
      `    lineCount={${p.lineCount}}`,
      `    lineDistance={${p.lineDistance}}`,
      `    animationSpeed={${p.animationSpeed}}`,
      `    interactive={${p.interactive}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
