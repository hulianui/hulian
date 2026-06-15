"use client";
import {
  Box,
  Cloud,
  Cpu,
  Database,
  Flame,
  Hexagon,
  Layers,
  Rocket,
  Sparkles,
  Zap,
} from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { LogoLoop } from "./logo-loop";
import type { LogoItem } from "./logo-loop.types";

const NODE_LOGOS: LogoItem[] = [
  { node: <Hexagon className="size-7" />, ariaLabel: "Hexagon" },
  { node: <Cloud className="size-7" />, ariaLabel: "Cloud" },
  { node: <Database className="size-7" />, ariaLabel: "Database" },
  { node: <Cpu className="size-7" />, ariaLabel: "Cpu" },
  { node: <Layers className="size-7" />, ariaLabel: "Layers" },
  { node: <Rocket className="size-7" />, ariaLabel: "Rocket" },
  { node: <Flame className="size-7" />, ariaLabel: "Flame" },
  { node: <Box className="size-7" />, ariaLabel: "Box" },
  { node: <Zap className="size-7" />, ariaLabel: "Zap" },
  { node: <Sparkles className="size-7" />, ariaLabel: "Sparkles" },
];

/** 展示用容器，给跑马灯一个干净的边框背景 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border bg-surface py-8">
      {children}
    </div>
  );
}

export const logoLoopShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "传入 logos 列表（图标或图片混排），序列自动复制实现无缝无限滚动；fadeOut 给两端加渐隐遮罩（吃 surface token）。",
      code: `const logos = [
  { node: <Hexagon />, ariaLabel: "Hexagon" },
  { node: <Cloud />, ariaLabel: "Cloud" },
  { node: <Database />, ariaLabel: "Database" },
];

<LogoLoop logos={logos} fadeOut />`,
      render: () => (
        <Stage>
          <LogoLoop logos={NODE_LOGOS} fadeOut />
        </Stage>
      ),
    },
    {
      title: "悬停暂停 + 放大",
      description:
        "direction 控制方向；pauseOnHover 悬停停滚，scaleOnHover 悬停放大被指向的单个 logo。",
      code: `<LogoLoop
  logos={logos}
  direction="right"
  fadeOut
  pauseOnHover
  scaleOnHover
/>`,
      render: () => (
        <Stage>
          <LogoLoop
            logos={NODE_LOGOS}
            direction="right"
            fadeOut
            pauseOnHover
            scaleOnHover
          />
        </Stage>
      ),
    },
    {
      title: "速度与间距",
      description: "speed 调滚动速度（px/s，负值反向），gap 调项间距，logoHeight 调 logo 高度。",
      code: `<LogoLoop logos={logos} speed={220} gap={56} logoHeight={32} />`,
      render: () => (
        <Stage>
          <LogoLoop logos={NODE_LOGOS} speed={220} gap={56} logoHeight={32} />
        </Stage>
      ),
    },
    {
      title: "纵向滚动",
      description: 'direction="up" / "down" 改为纵向滚动，需放在有高度的容器内。',
      code: `<div className="h-56 overflow-hidden px-8">
  <LogoLoop logos={logos} direction="up" fadeOut />
</div>`,
      render: () => (
        <div className="h-56 overflow-hidden rounded-xl border border-border bg-surface px-8">
          <LogoLoop logos={NODE_LOGOS} direction="up" fadeOut />
        </div>
      ),
    },
  ],

  controls: [
    { prop: "speed", type: "number", defaultValue: 120, label: "速度 px/s" },
    {
      prop: "direction",
      type: "select",
      options: ["left", "right", "up", "down"],
      defaultValue: "left",
      label: "方向",
    },
    { prop: "gap", type: "number", defaultValue: 32, label: "间距 px" },
    { prop: "logoHeight", type: "number", defaultValue: 28, label: "logo 高度 px" },
    { prop: "fadeOut", type: "boolean", defaultValue: true, label: "两端渐隐" },
    { prop: "scaleOnHover", type: "boolean", defaultValue: true, label: "悬停放大" },
    { prop: "pauseOnHover", type: "boolean", defaultValue: true, label: "悬停暂停" },
  ],

  states: [
    {
      name: "default（向左 · 两端渐隐）",
      render: () => (
        <Stage>
          <LogoLoop logos={NODE_LOGOS} fadeOut />
        </Stage>
      ),
    },
    {
      name: "向右 · 悬停暂停 + 放大",
      render: () => (
        <Stage>
          <LogoLoop
            logos={NODE_LOGOS}
            direction="right"
            fadeOut
            pauseOnHover
            scaleOnHover
          />
        </Stage>
      ),
    },
    {
      name: "高速无渐隐 · 大间距",
      render: () => (
        <Stage>
          <LogoLoop logos={NODE_LOGOS} speed={220} gap={56} logoHeight={32} />
        </Stage>
      ),
    },
    {
      name: "纵向滚动（高度容器内）",
      render: () => (
        <div className="h-56 overflow-hidden rounded-xl border border-border bg-surface px-8">
          <LogoLoop logos={NODE_LOGOS} direction="up" fadeOut />
        </div>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <LogoLoop
        logos={NODE_LOGOS}
        speed={p.speed as number}
        direction={p.direction as "left" | "right" | "up" | "down"}
        gap={p.gap as number}
        logoHeight={p.logoHeight as number}
        fadeOut={p.fadeOut as boolean}
        scaleOnHover={p.scaleOnHover as boolean}
        pauseOnHover={p.pauseOnHover as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<LogoLoop`,
      `  logos={logos}`,
      `  speed={${p.speed}}`,
      `  direction="${p.direction}"`,
      `  gap={${p.gap}}`,
      `  logoHeight={${p.logoHeight}}`,
      `  fadeOut={${p.fadeOut}}`,
      `  scaleOnHover={${p.scaleOnHover}}`,
      `  pauseOnHover={${p.pauseOnHover}}`,
      `/>`,
    ].join("\n"),
};
