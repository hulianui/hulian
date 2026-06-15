"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { MagicCard } from "./magic-card";

export const magicCardShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "鼠标移入卡片，径向高光跟随光标位置。",
      code: `<MagicCard className="h-44 w-72">
  <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
    <span className="text-lg font-semibold text-foreground">Magic Card</span>
    <span className="text-sm text-muted">把鼠标移上来看高光</span>
  </div>
</MagicCard>`,
      render: () => (
        <MagicCard className="h-44 w-72">
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
            <span className="text-lg font-semibold text-foreground">Magic Card</span>
            <span className="text-sm text-muted">把鼠标移上来看高光</span>
          </div>
        </MagicCard>
      ),
    },
    {
      title: "高光半径与强度",
      description: "gradientSize 控制高光直径，gradientOpacity 控制 hover 时强度。",
      code: `<MagicCard className="h-44 w-72" gradientSize={320} gradientOpacity={0.3}>
  <div className="flex h-full items-center justify-center p-6">
    <span className="text-sm text-muted">更大更亮的高光</span>
  </div>
</MagicCard>`,
      render: () => (
        <MagicCard className="h-44 w-72" gradientSize={320} gradientOpacity={0.3}>
          <div className="flex h-full items-center justify-center p-6">
            <span className="text-sm text-muted">更大更亮的高光</span>
          </div>
        </MagicCard>
      ),
    },
    {
      title: "自定义高光色",
      description: "gradientColor 可换任意 CSS 颜色（默认吃 var(--color-primary) 随主题）。",
      code: `<MagicCard className="h-44 w-72" gradientColor="var(--color-chart-3)">
  <div className="flex h-full items-center justify-center p-6">
    <span className="text-sm text-muted">换一种高光色</span>
  </div>
</MagicCard>`,
      render: () => (
        <MagicCard className="h-44 w-72" gradientColor="var(--color-chart-3)">
          <div className="flex h-full items-center justify-center p-6">
            <span className="text-sm text-muted">换一种高光色</span>
          </div>
        </MagicCard>
      ),
    },
  ],
  controls: [
    { prop: "gradientSize", type: "number", defaultValue: 200 },
    { prop: "gradientOpacity", type: "number", defaultValue: 0.15 },
  ],
  states: [
    {
      name: "default（hover 高光跟随鼠标）",
      render: () => (
        <MagicCard className="h-44 w-72">
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
            <span className="text-lg font-semibold text-foreground">Magic Card</span>
            <span className="text-sm text-muted">把鼠标移上来看高光</span>
          </div>
        </MagicCard>
      ),
    },
  ],
  renderWithProps: (p) => (
    <MagicCard
      className="h-44 w-72"
      gradientSize={p.gradientSize as number}
      gradientOpacity={p.gradientOpacity as number}
    >
      <div className="flex h-full flex-col items-center justify-center gap-1 p-6">
        <span className="text-lg font-semibold text-foreground">Magic Card</span>
        <span className="text-sm text-muted">把鼠标移上来看高光</span>
      </div>
    </MagicCard>
  ),
  toCode: (p) =>
    `<MagicCard gradientSize={${p.gradientSize}} gradientOpacity={${p.gradientOpacity}}>...</MagicCard>`,
};
