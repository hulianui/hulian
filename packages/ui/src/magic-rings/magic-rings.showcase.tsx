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
