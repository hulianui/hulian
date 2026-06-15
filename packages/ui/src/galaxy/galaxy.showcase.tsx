"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Galaxy } from "./galaxy";

/** 展示用深色深空底容器，让星河效果清晰可见 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative h-64 w-full max-w-xl overflow-hidden rounded-xl border border-border"
      style={{ background: "oklch(0.12 0.02 265)" }}
    >
      {children}
    </div>
  );
}

export const galaxyShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "放进 relative 容器即铺满，组件自带 absolute inset-0 z-0；内容放 z-10。",
      code: `<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-950">
  <Galaxy />
  <div className="relative z-10 flex h-full items-center justify-center text-white/80">
    内容层
  </div>
</div>`,
      render: () => (
        <Stage>
          <Galaxy />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            内容层
          </div>
        </Stage>
      ),
    },
    {
      title: "调色：色相 + 饱和度",
      description: "hueShift 旋转主色调，saturation 调高让星点呈现彩色。",
      code: `<Galaxy hueShift={300} saturation={0.4} density={1.4} glowIntensity={0.4} />`,
      render: () => (
        <Stage>
          <Galaxy hueShift={300} saturation={0.4} density={1.4} glowIntensity={0.4} />
        </Stage>
      ),
    },
    {
      title: "中心星环",
      description: "autoCenterRepulsion > 0 时星点从中心向外排斥，形成空洞中心的星环观感。",
      code: `<Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false} />`,
      render: () => (
        <Stage>
          <Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false} />
        </Stage>
      ),
    },
    {
      title: "纯装饰壁纸（关闭交互）",
      description: "mouseInteraction={false} 时放行点击穿透，适合做静态背景。",
      code: `<Galaxy
  rotationSpeed={0.05}
  glowIntensity={0.5}
  twinkleIntensity={0.6}
  starSpeed={0.3}
  mouseInteraction={false}
/>`,
      render: () => (
        <Stage>
          <Galaxy
            rotationSpeed={0.05}
            glowIntensity={0.5}
            twinkleIntensity={0.6}
            starSpeed={0.3}
            mouseInteraction={false}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "density", type: "number", defaultValue: 1, label: "星点密度" },
    { prop: "hueShift", type: "number", defaultValue: 140, label: "色相偏移" },
    { prop: "glowIntensity", type: "number", defaultValue: 0.3, label: "辉光强度" },
    { prop: "twinkleIntensity", type: "number", defaultValue: 0.3, label: "闪烁强度" },
    { prop: "mouseInteraction", type: "boolean", defaultValue: true, label: "鼠标交互" },
  ],

  states: [
    {
      name: "default（青蓝星河 · 默认参数）",
      render: () => (
        <Stage>
          <Galaxy />
          <div className="relative z-10 flex h-full items-center justify-center text-sm font-medium text-white/80">
            Galaxy
          </div>
        </Stage>
      ),
    },
    {
      name: "繁星密集（暖紫调）",
      render: () => (
        <Stage>
          <Galaxy density={1.6} hueShift={300} saturation={0.4} glowIntensity={0.4} />
        </Stage>
      ),
    },
    {
      name: "中心星环（autoCenterRepulsion）",
      render: () => (
        <Stage>
          <Galaxy autoCenterRepulsion={2} density={1.2} hueShift={200} mouseInteraction={false} />
        </Stage>
      ),
    },
    {
      name: "壁纸级（慢自转 · 强辉光）",
      render: () => (
        <Stage>
          <Galaxy
            rotationSpeed={0.05}
            glowIntensity={0.5}
            twinkleIntensity={0.6}
            starSpeed={0.3}
            mouseInteraction={false}
          />
          <div className="relative z-10 flex h-full flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white">瑚琏组件库</p>
            <p className="text-xs text-white/60">程序化星河 · WebGL · 主题感知</p>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Galaxy
        density={p.density as number}
        hueShift={p.hueShift as number}
        glowIntensity={p.glowIntensity as number}
        twinkleIntensity={p.twinkleIntensity as number}
        mouseInteraction={p.mouseInteraction as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-64 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
      `  <Galaxy`,
      `    density={${p.density}}`,
      `    hueShift={${p.hueShift}}`,
      `    glowIntensity={${p.glowIntensity}}`,
      `    twinkleIntensity={${p.twinkleIntensity}}`,
      `    mouseInteraction={${p.mouseInteraction}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
