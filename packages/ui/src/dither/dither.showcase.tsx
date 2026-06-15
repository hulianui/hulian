"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Dither } from "./dither";

/** 展示用深色底容器，让抖动波纹清晰可见 */
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

export const ditherShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "放进 relative + overflow-hidden 容器，组件自带 absolute inset-0 z-0，内容用 z-10 叠在上层。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl bg-neutral-950">
  <Dither />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    Dither
  </div>
</div>`,
      render: () => (
        <Stage>
          <Dither />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Dither
          </div>
        </Stage>
      ),
    },
    {
      title: "像素艺术（粗马赛克）",
      description: "调大 pixelSize 让抖动颗粒更粗，配合更少色阶得到 8-bit 复古质感。",
      code: `<Dither pixelSize={6} colorNum={3} />`,
      render: () => (
        <Stage>
          <Dither pixelSize={6} colorNum={3} />
        </Stage>
      ),
    },
    {
      title: "细腻色阶",
      description: "colorNum 越大色阶越多，纹理越平滑细腻。",
      code: `<Dither colorNum={8} pixelSize={2} waveSpeed={0.08} />`,
      render: () => (
        <Stage>
          <Dither colorNum={8} pixelSize={2} waveSpeed={0.08} />
        </Stage>
      ),
    },
    {
      title: "自定义波纹色",
      description: "传 waveColor 覆盖默认 chart token；任意 CSS 颜色（hex / oklch / rgb）皆可。",
      code: `<Dither waveColor="oklch(0.72 0.22 40)" colorNum={4} pixelSize={3} />`,
      render: () => (
        <Stage>
          <Dither waveColor="oklch(0.72 0.22 40)" colorNum={4} pixelSize={3} />
        </Stage>
      ),
    },
    {
      title: "冻结静帧",
      description: "disableAnimation 冻结波形为静态画面（等效 reduced-motion），适合做静态封面。",
      code: `<Dither disableAnimation waveColor="oklch(0.72 0.22 40)" />`,
      render: () => (
        <Stage>
          <Dither disableAnimation waveColor="oklch(0.72 0.22 40)" />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "colorNum", type: "number", defaultValue: 4, label: "量化色阶" },
    { prop: "pixelSize", type: "number", defaultValue: 2, label: "像素块大小" },
    { prop: "waveSpeed", type: "number", defaultValue: 0.05, label: "波纹速度" },
    {
      prop: "disableAnimation",
      type: "boolean",
      defaultValue: false,
      label: "冻结动画",
    },
  ],

  states: [
    {
      name: "default（默认参数）",
      render: () => (
        <Stage>
          <Dither />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Dither
          </div>
        </Stage>
      ),
    },
    {
      name: "粗马赛克（pixelSize 6 · 像素艺术）",
      render: () => (
        <Stage>
          <Dither pixelSize={6} colorNum={3} />
        </Stage>
      ),
    },
    {
      name: "多色阶（colorNum 8 · 细腻）",
      render: () => (
        <Stage>
          <Dither colorNum={8} pixelSize={2} waveSpeed={0.08} />
        </Stage>
      ),
    },
    {
      name: "自定义色（暖橙 · 冻结静帧）",
      render: () => (
        <Stage>
          <Dither
            waveColor="oklch(0.72 0.22 40)"
            colorNum={4}
            pixelSize={3}
            disableAnimation
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Dither
        colorNum={p.colorNum as number}
        pixelSize={p.pixelSize as number}
        waveSpeed={p.waveSpeed as number}
        disableAnimation={p.disableAnimation as boolean}
      />
      <div className="relative z-10 flex h-full items-center justify-center text-sm text-white/70">
        Dither
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.14 0.02 255)" }}>`,
      `  <Dither`,
      `    colorNum={${p.colorNum}}`,
      `    pixelSize={${p.pixelSize}}`,
      `    waveSpeed={${p.waveSpeed}}`,
      `    disableAnimation={${p.disableAnimation}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
