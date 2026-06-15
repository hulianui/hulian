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
  examples: [
    {
      title: "基础用法",
      description: "三组漂浮线束背景，鼠标靠近时线条产生径向弯曲牵引；颜色默认吃 chart token。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <FloatingLines />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    FloatingLines
  </div>
</div>`,
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
      title: "密集慢速（壁纸级）",
      description: "加大 lineCount 让线束更密、调小 animationSpeed 放慢，适合做 hero 背景叠文案。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <FloatingLines lineCount={10} animationSpeed={0.6} lineDistance={4} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">企业级 · 高质量 · 原生适配</p>
  </div>
</div>`,
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
      title: "自定义色带 · 关交互",
      description: "colors 自定义渐变色带；interactive=false 关闭指针牵引做纯背景。",
      code: `<FloatingLines
  colors={[
    "var(--color-chart-3)",
    "oklch(0.72 0.22 30)",
    "var(--color-chart-1)",
  ]}
  interactive={false}
  animationSpeed={1.4}
/>`,
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
