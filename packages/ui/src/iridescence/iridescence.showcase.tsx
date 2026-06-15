"use client";

import type { ShowcaseSpec } from "../showcase/types";
import { Iridescence } from "./iridescence";

/** 展示容器：固定高度 + overflow:hidden，让 absolute inset-0 canvas 正确裁剪 */
function Stage({
  dark = true,
  children,
  height = "h-56",
}: {
  dark?: boolean;
  children: React.ReactNode;
  height?: string;
}) {
  return (
    <div
      className={`relative ${height} w-full max-w-xl overflow-hidden rounded-xl border border-border`}
      style={{ background: dark ? "oklch(0.12 0.02 265)" : "oklch(0.96 0.005 265)" }}
    >
      {children}
    </div>
  );
}

export const iridescenceShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "Iridescence 是 absolute inset-0 背景层，需放在 relative + overflow-hidden 容器内，内容用 absolute 叠在上方。",
      code: `<div className="relative h-56 overflow-hidden rounded-xl"
     style={{ background: "oklch(0.12 0.02 265)" }}>
  <Iridescence />
  <div className="absolute inset-0 flex items-center justify-center">
    <span className="text-sm font-medium text-white/80">Iridescence</span>
  </div>
</div>`,
      render: () => (
        <Stage>
          <Iridescence />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white/80 select-none">
              Iridescence
            </span>
          </div>
        </Stage>
      ),
    },
    {
      title: "自定义颜色",
      description: "color 接受任意 CSS 颜色字符串（hex / oklch / hsl / var(--token)）；不传时自动读 --color-chart-3 跟随主题。",
      code: `<Iridescence color="oklch(0.72 0.22 50)" speed={0.8} />`,
      render: () => (
        <Stage>
          <Iridescence color="oklch(0.72 0.22 50)" speed={0.8} />
        </Stage>
      ),
    },
    {
      title: "RGB 数组色 · 高速扰动",
      description: "color 也可传 [r, g, b]（0–1 范围）数组；提高 speed / amplitude 让流动更剧烈。",
      code: `<Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2} />`,
      render: () => (
        <Stage>
          <Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2} />
        </Stage>
      ),
    },
    {
      title: "壁纸级（关闭鼠标响应）",
      description: "mouseReact={false} 让 uMouse 固定，配合低 speed 适合做静谧 Hero 背景。",
      code: `<div className="relative h-72 overflow-hidden rounded-xl">
  <Iridescence speed={0.3} mouseReact={false} />
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
    <p className="text-lg font-semibold text-white">潮汐 Tide</p>
    <p className="text-xs text-white/50">瑚琏组件库 · 企业级 · 高质量</p>
  </div>
</div>`,
      render: () => (
        <Stage height="h-72">
          <Iridescence speed={0.3} mouseReact={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white drop-shadow-sm">
              潮汐 Tide
            </p>
            <p className="text-xs text-white/50">
              瑚琏组件库 · 企业级 · 高质量
            </p>
          </div>
        </Stage>
      ),
    },
  ],

  controls: [
    {
      prop: "speed",
      type: "number",
      defaultValue: 1,
      label: "速度倍率",
    },
    {
      prop: "amplitude",
      type: "number",
      defaultValue: 0.1,
      label: "鼠标偏移幅度",
    },
    {
      prop: "mouseReact",
      type: "boolean",
      defaultValue: true,
      label: "响应鼠标",
    },
  ],

  states: [
    {
      name: "default（深色底 · 默认参数）",
      render: () => (
        <Stage>
          <Iridescence />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-white/80 select-none">
              Iridescence
            </span>
          </div>
        </Stage>
      ),
    },
    {
      name: "浅色底",
      render: () => (
        <Stage dark={false}>
          <Iridescence />
        </Stage>
      ),
    },
    {
      name: "自定义色（暖橙 CSS 字符串）",
      render: () => (
        <Stage>
          <Iridescence color="oklch(0.72 0.22 50)" speed={0.8} />
        </Stage>
      ),
    },
    {
      name: "自定义色（RGB 数组 · 冷蓝）",
      render: () => (
        <Stage>
          <Iridescence color={[0.3, 0.6, 1.0]} speed={1.5} amplitude={0.2} />
        </Stage>
      ),
    },
    {
      name: "高速 · 强鼠标扰动",
      render: () => (
        <Stage>
          <Iridescence speed={3} amplitude={0.4} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/60 select-none">
              speed=3 · amplitude=0.4
            </span>
          </div>
        </Stage>
      ),
    },
    {
      name: "低速 · 关闭鼠标（壁纸级）",
      render: () => (
        <Stage height="h-72">
          <Iridescence speed={0.3} mouseReact={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-lg font-semibold text-white drop-shadow-sm">
              潮汐 Tide
            </p>
            <p className="text-xs text-white/50">
              瑚琏组件库 · 企业级 · 高质量
            </p>
          </div>
        </Stage>
      ),
    },
    {
      name: "reduced-motion fallback（静态虹彩渐变）",
      render: () => (
        // 模拟 reduced-motion：直接渲染 fallback div 而非 WebGL canvas
        <Stage>
          <div
            aria-hidden
            className="absolute inset-0 z-0 pointer-events-none bg-[conic-gradient(from_0deg_at_50%_50%,var(--color-chart-1)_0%,var(--color-chart-2)_25%,var(--color-chart-3)_50%,var(--color-chart-4)_75%,var(--color-chart-1)_100%)] opacity-60"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs text-white/70 select-none">
              静态降级（无 WebGL / reduced-motion）
            </span>
          </div>
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <Iridescence
        speed={p.speed as number}
        amplitude={p.amplitude as number}
        mouseReact={p.mouseReact as boolean}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm text-white/70 select-none">Iridescence</span>
      </div>
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-56 overflow-hidden rounded-xl"`,
      `     style={{ background: "oklch(0.12 0.02 265)" }}>`,
      `  <Iridescence`,
      `    speed={${p.speed}}`,
      `    amplitude={${p.amplitude}}`,
      `    mouseReact={${p.mouseReact}}`,
      `  />`,
      `  {/* 内容叠在 WebGL canvas 上方 */}`,
      `  <div className="absolute inset-0 flex items-center justify-center">`,
      `    <h2 className="text-2xl font-bold text-white">Hero Title</h2>`,
      `  </div>`,
      `</div>`,
    ].join("\n"),
};
