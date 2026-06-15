"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { SoftAurora } from "./soft-aurora";

/** 展示用深色底容器，让柔和极光清晰可见 */
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

export const softAuroraShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "套一层定位容器，SoftAurora 绝对铺满即可作为柔光背景。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.14 0.02 255)" }}>
  <SoftAurora className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <SoftAurora className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "自定义双层配色",
      description: "color1 / color2 接受任意 CSS 颜色串（hex / oklch / chart token），两层错位叠加产生混色。",
      code: `<SoftAurora
  color1="var(--color-chart-3)"
  color2="oklch(0.7 0.22 20)"
  brightness={1.2}
  className="absolute inset-0"
/>`,
      render: () => (
        <Stage>
          <SoftAurora
            color1="var(--color-chart-3)"
            color2="oklch(0.7 0.22 20)"
            brightness={1.2}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      title: "高亮活跃",
      description: "拉高 speed / scale / bandSpread 让极光更密更亮、流动更快。",
      code: `<SoftAurora
  speed={1.4}
  scale={2.4}
  brightness={1.3}
  bandSpread={1.4}
  className="absolute inset-0"
/>`,
      render: () => (
        <Stage>
          <SoftAurora
            speed={1.4}
            scale={2.4}
            brightness={1.3}
            bandSpread={1.4}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      title: "壁纸级（叠加内容）",
      description: "低速、关闭鼠标视差，配合 fallback 在极光之上覆盖标题文案，适合落地页主视觉。",
      code: `<SoftAurora
  speed={0.3}
  bandHeight={0.35}
  enableMouseInteraction={false}
  className="absolute inset-0"
  fallback={
    <div className="flex h-full flex-col items-center justify-center gap-1">
      <p className="text-lg font-semibold text-white">瑚琏组件库</p>
      <p className="text-xs text-white/60">柔光极光 · WebGL · token 着色</p>
    </div>
  }
/>`,
      render: () => (
        <Stage>
          <SoftAurora
            speed={0.3}
            bandHeight={0.35}
            enableMouseInteraction={false}
            className="absolute inset-0"
            fallback={
              <div className="flex h-full flex-col items-center justify-center gap-1">
                <p className="text-lg font-semibold text-white">瑚琏组件库</p>
                <p className="text-xs text-white/60">柔光极光 · WebGL · token 着色</p>
              </div>
            }
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 0.6, label: "流动速度" },
    { prop: "scale", type: "number", defaultValue: 1.5, label: "噪声缩放" },
    { prop: "brightness", type: "number", defaultValue: 1, label: "亮度" },
    { prop: "bandHeight", type: "number", defaultValue: 0.5, label: "极光带高度" },
    {
      prop: "enableMouseInteraction",
      type: "boolean",
      defaultValue: true,
      label: "鼠标视差",
    },
  ],

  states: [
    {
      name: "default（chart token 默认色）",
      render: () => (
        <Stage>
          <SoftAurora className="absolute inset-0" />
          <div className="pointer-events-none relative flex h-full items-center justify-center text-sm font-medium text-white/80">
            SoftAurora
          </div>
        </Stage>
      ),
    },
    {
      name: "暖色双层（橙 + 紫红）",
      render: () => (
        <Stage>
          <SoftAurora
            color1="var(--color-chart-3)"
            color2="oklch(0.7 0.22 20)"
            brightness={1.2}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "高亮活跃（speed/scale 拉满）",
      render: () => (
        <Stage>
          <SoftAurora
            speed={1.4}
            scale={2.4}
            brightness={1.3}
            bandSpread={1.4}
            className="absolute inset-0"
          />
        </Stage>
      ),
    },
    {
      name: "壁纸级（低速·关交互·靠底）",
      render: () => (
        <Stage>
          <SoftAurora
            speed={0.3}
            bandHeight={0.35}
            enableMouseInteraction={false}
            className="absolute inset-0"
            fallback={
              <div className="flex h-full flex-col items-center justify-center gap-1">
                <p className="text-lg font-semibold text-white">瑚琏组件库</p>
                <p className="text-xs text-white/60">柔光极光 · WebGL · token 着色</p>
              </div>
            }
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <SoftAurora
        speed={p.speed as number}
        scale={p.scale as number}
        brightness={p.brightness as number}
        bandHeight={p.bandHeight as number}
        enableMouseInteraction={p.enableMouseInteraction as boolean}
        className="absolute inset-0"
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <SoftAurora`,
      `    speed={${p.speed}}`,
      `    scale={${p.scale}}`,
      `    brightness={${p.brightness}}`,
      `    bandHeight={${p.bandHeight}}`,
      `    enableMouseInteraction={${p.enableMouseInteraction}}`,
      `    className="absolute inset-0"`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
