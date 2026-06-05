"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { ElectricBorder } from "./electric-border";

/** 深色底容器，让电弧光晕清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-48 w-full max-w-md items-center justify-center rounded-xl border border-border p-10"
      style={{ background: "oklch(0.14 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const electricBorderShowcase: ShowcaseSpec = {
  controls: [
    { prop: "speed", type: "number", defaultValue: 1, label: "抖动速度" },
    { prop: "chaos", type: "number", defaultValue: 1, label: "紊乱程度" },
    { prop: "thickness", type: "number", defaultValue: 2, label: "光晕厚度 px" },
    { prop: "borderRadius", type: "number", defaultValue: 16, label: "圆角 px" },
  ],

  states: [
    {
      name: "default（主色电弧）",
      render: () => (
        <Stage>
          <ElectricBorder borderRadius={16}>
            <div className="px-8 py-6 text-sm font-medium text-white/85">
              Electric Border
            </div>
          </ElectricBorder>
        </Stage>
      ),
    },
    {
      name: "高紊乱 + 快抖动",
      render: () => (
        <Stage>
          <ElectricBorder chaos={2} speed={2} borderRadius={20}>
            <div className="px-8 py-6 text-sm text-white/80">放电中</div>
          </ElectricBorder>
        </Stage>
      ),
    },
    {
      name: "暖色 + 圆形按钮",
      render: () => (
        <Stage>
          <ElectricBorder
            color="var(--color-chart-3)"
            borderRadius={999}
            thickness={2}
          >
            <button
              type="button"
              className="px-6 py-3 text-sm font-semibold text-white"
            >
              立即体验
            </button>
          </ElectricBorder>
        </Stage>
      ),
    },
    {
      name: "卡片包裹（厚光晕）",
      render: () => (
        <Stage>
          <ElectricBorder thickness={3} chaos={1.4} borderRadius={14}>
            <div className="w-56 space-y-1 px-5 py-4">
              <p className="text-sm font-semibold text-white">瑚琏组件库</p>
              <p className="text-xs text-white/60">通电的边框 · 零依赖 SVG 湍流</p>
            </div>
          </ElectricBorder>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <ElectricBorder
        speed={p.speed as number}
        chaos={p.chaos as number}
        thickness={p.thickness as number}
        borderRadius={p.borderRadius as number}
      >
        <div className="px-8 py-6 text-sm text-white/80">Electric Border</div>
      </ElectricBorder>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<ElectricBorder`,
      `  speed={${p.speed}}`,
      `  chaos={${p.chaos}}`,
      `  thickness={${p.thickness}}`,
      `  borderRadius={${p.borderRadius}}`,
      `>`,
      `  <div className="px-8 py-6">Electric Border</div>`,
      `</ElectricBorder>`,
    ].join("\n"),
};
