"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MagicRings } from "./magic-rings";

/** 展示用深色底容器，让光环辉光清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.14 0.02 280)" }}
    >
      {children}
    </div>
  );
}

export const magicRingsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative + overflow-hidden 的深色容器，MagicRings 用 absolute inset-0 铺满。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <MagicRings className="absolute inset-0" />
</div>`,
      render: () => (
        <Stage>
          <MagicRings className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      title: "密环 · 慢速",
      description: "ringCount 增多层数，speed 降速，radiusStep 收紧环间距得壁纸级密环。",
      code: `<MagicRings
  className="absolute inset-0"
  ringCount={9}
  speed={0.5}
  radiusStep={0.07}
/>`,
      render: () => (
        <Stage>
          <MagicRings
            className="absolute inset-0"
            ringCount={9}
            speed={0.5}
            radiusStep={0.07}
          />
        </Stage>
      ),
    },
    {
      title: "双色与花瓣裂口",
      description: "color/colorTwo 设内外色，环色按层插值；ringGap 加大角向裂口呈花瓣状。",
      code: `<MagicRings
  className="absolute inset-0"
  color="var(--color-chart-3)"
  colorTwo="oklch(0.72 0.22 30)"
  ringGap={2.2}
  attenuation={8}
/>`,
      render: () => (
        <Stage>
          <MagicRings
            className="absolute inset-0"
            color="var(--color-chart-3)"
            colorTwo="oklch(0.72 0.22 30)"
            ringGap={2.2}
            attenuation={8}
          />
        </Stage>
      ),
    },
    {
      title: "鼠标视差 · 点击爆发",
      description: "followMouse 开启视差跟随，clickBurst 让点击短暂放大提亮，hoverScale 控悬停缩放。",
      code: `<MagicRings
  className="absolute inset-0"
  followMouse
  clickBurst
  hoverScale={1.25}
/>`,
      render: () => (
        <Stage>
          <MagicRings
            className="absolute inset-0"
            followMouse
            clickBurst
            hoverScale={1.25}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/50">
            移动鼠标产生视差 · 点击触发爆发
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "ringCount", type: "number", defaultValue: 6, label: "环数 1–10" },
    { prop: "speed", type: "number", defaultValue: 1, label: "速度倍率" },
    { prop: "attenuation", type: "number", defaultValue: 10, label: "衰减（锐度）" },
    { prop: "ringGap", type: "number", defaultValue: 1.5, label: "角向裂口" },
    { prop: "blur", type: "number", defaultValue: 0, label: "模糊 px" },
    { prop: "followMouse", type: "boolean", defaultValue: false, label: "鼠标视差" },
    { prop: "clickBurst", type: "boolean", defaultValue: false, label: "点击爆发" },
  ],

  states: [
    {
      name: "default（默认参数·chart token 双色）",
      render: () => (
        <Stage>
          <MagicRings className="absolute inset-0" />
        </Stage>
      ),
    },
    {
      name: "密环 + 慢速（壁纸级）",
      render: () => (
        <Stage>
          <MagicRings className="absolute inset-0" ringCount={9} speed={0.5} radiusStep={0.07} />
        </Stage>
      ),
    },
    {
      name: "暖橙调 + 花瓣裂口",
      render: () => (
        <Stage>
          <MagicRings
            className="absolute inset-0"
            color="var(--color-chart-3)"
            colorTwo="oklch(0.72 0.22 30)"
            ringGap={2.2}
            attenuation={8}
          />
        </Stage>
      ),
    },
    {
      name: "交互（鼠标视差 + 点击爆发）",
      render: () => (
        <Stage>
          <MagicRings className="absolute inset-0" followMouse clickBurst hoverScale={1.25} />
          <div className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-white/50">
            移动鼠标产生视差 · 点击触发爆发
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <MagicRings
        className="absolute inset-0"
        ringCount={p.ringCount as number}
        speed={p.speed as number}
        attenuation={p.attenuation as number}
        ringGap={p.ringGap as number}
        blur={p.blur as number}
        followMouse={p.followMouse as boolean}
        clickBurst={p.clickBurst as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 280)" }}>`,
      `  <MagicRings`,
      `    className="absolute inset-0"`,
      `    ringCount={${p.ringCount}}`,
      `    speed={${p.speed}}`,
      `    attenuation={${p.attenuation}}`,
      `    ringGap={${p.ringGap}}`,
      `    blur={${p.blur}}`,
      `    followMouse={${p.followMouse}}`,
      `    clickBurst={${p.clickBurst}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
