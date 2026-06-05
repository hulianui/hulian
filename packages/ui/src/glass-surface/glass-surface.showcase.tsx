"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { GlassSurface } from "./glass-surface";

/** 彩色底舞台：玻璃折射需要丰富背景才看得出色散与扭曲。 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-64 w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-border"
      style={{
        backgroundImage:
          "radial-gradient(circle at 22% 28%, var(--color-chart-1), transparent 45%), radial-gradient(circle at 78% 30%, var(--color-chart-3), transparent 48%), radial-gradient(circle at 50% 82%, var(--color-chart-4), transparent 50%), linear-gradient(135deg, var(--color-chart-2), var(--color-chart-5))",
      }}
    >
      {/* 一行细条纹强化折射可见性 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 18px, var(--color-foreground) 18px 19px)",
        }}
      />
      {children}
    </div>
  );
}

export const glassSurfaceShowcase: ShowcaseSpec = {
  controls: [
    { prop: "width", type: "number", defaultValue: 220, label: "宽度 px" },
    { prop: "height", type: "number", defaultValue: 90, label: "高度 px" },
    { prop: "borderRadius", type: "number", defaultValue: 24, label: "圆角 px" },
    {
      prop: "distortionScale",
      type: "number",
      defaultValue: -180,
      label: "折射强度",
    },
    { prop: "blueOffset", type: "number", defaultValue: 20, label: "蓝通道色散" },
    {
      prop: "backgroundOpacity",
      type: "number",
      defaultValue: 0,
      label: "磨砂底透明度",
    },
  ],

  states: [
    {
      name: "default（液态玻璃药丸）",
      render: () => (
        <Stage>
          <GlassSurface width={220} height={90} borderRadius={24}>
            <span className="text-sm font-semibold text-foreground">
              Glass Surface
            </span>
          </GlassSurface>
        </Stage>
      ),
    },
    {
      name: "强色散（offset 拉大）",
      render: () => (
        <Stage>
          <GlassSurface
            width={240}
            height={100}
            borderRadius={28}
            distortionScale={-220}
            greenOffset={25}
            blueOffset={45}
          >
            <span className="text-sm font-semibold text-foreground">瑚琏</span>
          </GlassSurface>
        </Stage>
      ),
    },
    {
      name: "磨砂底（backgroundOpacity 0.5）",
      render: () => (
        <Stage>
          <GlassSurface
            width={220}
            height={90}
            borderRadius={20}
            backgroundOpacity={0.5}
            saturation={1.4}
          >
            <span className="text-sm text-foreground">Frosted</span>
          </GlassSurface>
        </Stage>
      ),
    },
    {
      name: "圆形徽章",
      render: () => (
        <Stage>
          <GlassSurface width={96} height={96} borderRadius={48}>
            <span className="text-xl font-bold text-foreground">瑚</span>
          </GlassSurface>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <GlassSurface
        width={p.width as number}
        height={p.height as number}
        borderRadius={p.borderRadius as number}
        distortionScale={p.distortionScale as number}
        blueOffset={p.blueOffset as number}
        backgroundOpacity={p.backgroundOpacity as number}
      >
        <span className="text-sm font-medium text-foreground">Glass</span>
      </GlassSurface>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<GlassSurface`,
      `  width={${p.width}}`,
      `  height={${p.height}}`,
      `  borderRadius={${p.borderRadius}}`,
      `  distortionScale={${p.distortionScale}}`,
      `  blueOffset={${p.blueOffset}}`,
      `  backgroundOpacity={${p.backgroundOpacity}}`,
      `>`,
      `  Glass`,
      `</GlassSurface>`,
    ].join("\n"),
};
