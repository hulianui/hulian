"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Ribbons } from "./ribbons";

/** 展示用深色底容器，让飘带清晰可见；提示移动鼠标交互 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 285)" }}
    >
      {children}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-white/40">
        移动鼠标，飘带会弹性追随
      </div>
    </div>
  );
}

export const ribbonsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "baseThickness", type: "number", defaultValue: 30, label: "粗细 px" },
    { prop: "baseFriction", type: "number", defaultValue: 0.9, label: "阻尼 0–1" },
    { prop: "maxAge", type: "number", defaultValue: 500, label: "拖尾寿命 ms" },
    { prop: "enableFade", type: "boolean", defaultValue: false, label: "尾部渐隐" },
    {
      prop: "enableShaderEffect",
      type: "boolean",
      defaultValue: false,
      label: "波动特效",
    },
  ],

  states: [
    {
      name: "default（chart token 三色飘带）",
      render: () => (
        <Stage>
          <Ribbons />
        </Stage>
      ),
    },
    {
      name: "尾部渐隐 + 波动特效",
      render: () => (
        <Stage>
          <Ribbons enableFade enableShaderEffect effectAmplitude={2} />
        </Stage>
      ),
    },
    {
      name: "粗带慢追随（壁纸级）",
      render: () => (
        <Stage>
          <Ribbons baseThickness={50} baseFriction={0.94} maxAge={900} speedMultiplier={0.4} />
        </Stage>
      ),
    },
    {
      name: "自定义暖色 · 多条散开",
      render: () => (
        <Stage>
          <Ribbons
            colors={[
              "var(--color-chart-1)",
              "oklch(0.72 0.22 30)",
              "oklch(0.78 0.18 60)",
              "var(--color-chart-3)",
            ]}
            offsetFactor={0.1}
            baseThickness={24}
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Ribbons
        baseThickness={p.baseThickness as number}
        baseFriction={p.baseFriction as number}
        maxAge={p.maxAge as number}
        enableFade={p.enableFade as boolean}
        enableShaderEffect={p.enableShaderEffect as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 285)" }}>`,
      `  <Ribbons`,
      `    baseThickness={${p.baseThickness}}`,
      `    baseFriction={${p.baseFriction}}`,
      `    maxAge={${p.maxAge}}`,
      `    enableFade={${p.enableFade}}`,
      `    enableShaderEffect={${p.enableShaderEffect}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
