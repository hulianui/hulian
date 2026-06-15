"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { PixelSnow } from "./pixel-snow";
import type { PixelSnowVariant } from "./pixel-snow.types";

/** 展示用深色底容器，让像素雪清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-56 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.13 0.02 255)" }}
    >
      {children}
    </div>
  );
}

export const pixelSnowShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative overflow-hidden 容器即可；默认方块像素雪，颜色按身后底色亮度自适应（深底亮雪 / 浅底暗雪）。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PixelSnow />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    PixelSnow
  </div>
</div>`,
      render: () => (
        <Stage>
          <PixelSnow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            PixelSnow
          </div>
        </Stage>
      ),
    },
    {
      title: "形状变体",
      description:
        "variant 支持 square（方块）/ round（圆点）/ snowflake（六臂雪花）三种雪花形状。",
      code: `<>
  <PixelSnow variant="snowflake" density={0.45} speed={1.6} />
  <PixelSnow variant="round" pixelResolution={90} density={0.4} />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Stage>
            <PixelSnow variant="snowflake" density={0.45} speed={1.6} />
          </Stage>
          <Stage>
            <PixelSnow variant="round" pixelResolution={90} density={0.4} />
          </Stage>
        </div>
      ),
    },
    {
      title: "复古大马赛克",
      description:
        "调小 pixelResolution（横向被切成的「大像素」数）让马赛克块更大，复古感更强。",
      code: `<PixelSnow variant="round" pixelResolution={90} density={0.4} />`,
      render: () => (
        <Stage>
          <PixelSnow variant="round" pixelResolution={90} density={0.4} />
        </Stage>
      ),
    },
    {
      title: "自定义冷蓝 · 慢速壁纸",
      description:
        "color 接任意 CSS 颜色锁定雪花色调；慢速 + 适中密度作为标题区雪景背景。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3} />
  <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
    <p className="text-lg font-semibold text-white">瑚琏组件库</p>
    <p className="text-xs text-white/60">像素雪 · 明暗自适应</p>
  </div>
</div>`,
      render: () => (
        <Stage>
          <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">像素雪 · 明暗自适应</p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["square", "round", "snowflake"],
      defaultValue: "square",
      label: "雪花形状",
    },
    { prop: "density", type: "number", defaultValue: 0.3, label: "密度 0–0.6" },
    { prop: "speed", type: "number", defaultValue: 1.25, label: "飘落速度" },
    {
      prop: "pixelResolution",
      type: "number",
      defaultValue: 200,
      label: "像素分辨率",
    },
    { prop: "direction", type: "number", defaultValue: 125, label: "风向角度°" },
  ],

  states: [
    {
      name: "default（方块像素雪）",
      render: () => (
        <Stage>
          <PixelSnow />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            PixelSnow
          </div>
        </Stage>
      ),
    },
    {
      name: "六臂雪花 · 高密度",
      render: () => (
        <Stage>
          <PixelSnow variant="snowflake" density={0.45} speed={1.6} />
        </Stage>
      ),
    },
    {
      name: "圆点雪 · 大马赛克（复古）",
      render: () => (
        <Stage>
          <PixelSnow variant="round" pixelResolution={90} density={0.4} />
        </Stage>
      ),
    },
    {
      name: "自定义冷蓝色 · 慢速壁纸",
      render: () => (
        <Stage>
          <PixelSnow color="oklch(0.85 0.08 230)" speed={0.7} density={0.3} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">像素雪 · 明暗自适应</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <PixelSnow
        variant={p.variant as PixelSnowVariant}
        density={p.density as number}
        speed={p.speed as number}
        pixelResolution={p.pixelResolution as number}
        direction={p.direction as number}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        PixelSnow
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.13 0.02 255)" }}>`,
      `  <PixelSnow`,
      `    variant="${p.variant}"`,
      `    density={${p.density}}`,
      `    speed={${p.speed}}`,
      `    pixelResolution={${p.pixelResolution}}`,
      `    direction={${p.direction}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
