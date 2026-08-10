"use client";

import type { ShowcaseSpec } from "../showcase/types";
import { CardSpotlight } from "./card-spotlight";

// ---- 演示用子内容（模拟作品卡/特性卡场景） ----

function FeatureCard({
  icon,
  title,
  description,
  color,
  radius,
}: {
  icon: string;
  title: string;
  description: string;
  color?: string;
  radius?: number;
}) {
  return (
    <CardSpotlight color={color} radius={radius} className="w-64">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardSpotlight>
  );
}

export const cardSpotlightShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "包裹卡片内容，鼠标悬停时在光标处出现柔和聚光（默认 chart-1）。",
      code: `<CardSpotlight className="w-64">
  <div className="mb-3 text-3xl">✦</div>
  <h3 className="mb-1.5 text-base font-semibold">瑚琏组件</h3>
  <p className="text-sm text-muted-foreground">鼠标悬停感受柔和聚光。</p>
</CardSpotlight>`,
      render: () => (
        <FeatureCard icon="✦" title="瑚琏组件" description="宗庙玉器，至美又大用——鼠标悬停感受柔和聚光。" />
      ),
    },
    {
      title: "自定义高光色",
      description: "color 传任意 CSS 颜色（含 token），高光随主题色联动。",
      code: `<CardSpotlight color="var(--color-primary)" className="w-64">
  <div className="mb-3 text-3xl">⚡</div>
  <h3 className="mb-1.5 text-base font-semibold">主题色高光</h3>
  <p className="text-sm text-muted-foreground">高光随主题联动。</p>
</CardSpotlight>`,
      render: () => (
        <FeatureCard
          icon="⚡"
          title="主题色高光"
          description="color 传 var(--color-primary)，高光随主题联动。"
          color="var(--color-primary)"
        />
      ),
    },
    {
      title: "聚焦小半径",
      description: "radius 越小光晕越紧，适合强调单个核心内容区域。",
      code: `<CardSpotlight radius={180} color="var(--color-chart-3)" className="w-64">
  <div className="mb-3 text-3xl">🔍</div>
  <h3 className="mb-1.5 text-base font-semibold">聚焦光束</h3>
  <p className="text-sm text-muted-foreground">radius=180 光晕更紧。</p>
</CardSpotlight>`,
      render: () => (
        <FeatureCard
          icon="🔍"
          title="聚焦光束"
          description="radius=180 光晕更紧，适合强调核心内容区域。"
          radius={180}
          color="var(--color-chart-3)"
        />
      ),
    },
    {
      title: "多卡并列",
      description: "每张卡独立追踪光标，配不同高光色构成特性栅格。",
      code: `<div className="flex flex-wrap gap-4">
  <CardSpotlight color="var(--color-chart-1)" className="w-64">...</CardSpotlight>
  <CardSpotlight color="var(--color-chart-2)" className="w-64">...</CardSpotlight>
</div>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <FeatureCard icon="🎨" title="设计" description="像素级还原，主题随系统联动。" color="var(--color-chart-1)" />
          <FeatureCard icon="⚙️" title="工程" description="TypeScript 全覆盖，类型即文档。" color="var(--color-chart-2)" />
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "radius",
      type: "number",
      defaultValue: 350,
      label: "高光半径 (px)",
    },
    {
      prop: "color",
      type: "text",
      defaultValue: "",
      label: "高光色（空=默认 chart-1）",
    },
  ],

  states: [
    {
      name: "默认（chart-1）",
      render: () => (
        <FeatureCard icon="✦" title="瑚琏组件" description="宗庙玉器，至美又大用——鼠标悬停感受柔和聚光。" />
      ),
    },
    {
      name: "品牌色 primary",
      render: () => (
        <FeatureCard
          icon="⚡"
          title="主题色高光"
          description="color 传 var(--color-primary)，高光随主题联动。"
          color="var(--color-primary)"
        />
      ),
    },
    {
      name: "小半径 · 聚焦",
      render: () => (
        <FeatureCard
          icon="🔍"
          title="聚焦光束"
          description="radius=180 光晕更紧，适合强调核心内容区域。"
          radius={180}
          color="var(--color-chart-3)"
        />
      ),
    },
    {
      name: "多卡并列",
      render: () => (
        <div className="flex flex-wrap gap-4">
          <FeatureCard icon="🎨" title="设计" description="像素级还原，主题随系统联动。" color="var(--color-chart-1)" />
          <FeatureCard icon="⚙️" title="工程" description="TypeScript 全覆盖，类型即文档。" color="var(--color-chart-2)" />
          <FeatureCard icon="♿" title="无障碍" description="WCAG AA·键盘/屏幕阅读器全线兼容。" color="var(--color-chart-4)" />
        </div>
      ),
    },
  ],

  renderWithProps: (p) => (
    <CardSpotlight
      radius={typeof p.radius === "number" ? p.radius : 350}
      color={p.color ? String(p.color) : undefined}
      className="w-64"
    >
      <div className="mb-3 text-3xl">✦</div>
      <h3 className="mb-1.5 text-base font-semibold">CardSpotlight</h3>
      <p className="text-sm text-muted-foreground">悬停感受聚光效果，移动鼠标追踪光晕中心。</p>
    </CardSpotlight>
  ),

  toCode: (p) => {
    const radius = typeof p.radius === "number" ? p.radius : 350;
    const colorProp = p.color ? ` color="${p.color}"` : "";
    const radiusProp = radius !== 350 ? ` radius={${radius}}` : "";
    return `<CardSpotlight${radiusProp}${colorProp} className="w-64">
  <div className="mb-3 text-3xl">✦</div>
  <h3 className="mb-1.5 text-base font-semibold">标题</h3>
  <p className="text-sm text-muted-foreground">卡片描述文字。</p>
</CardSpotlight>`;
  },
};
