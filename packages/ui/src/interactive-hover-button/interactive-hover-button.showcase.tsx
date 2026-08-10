import type { ShowcaseSpec } from "../showcase/types";
import { InteractiveHoverButton } from "./interactive-hover-button";

export const interactiveHoverButtonShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "静息是「小圆点 + 文案」，悬停 / 聚焦时圆点扩成整块底色并换出箭头。",
      code: `<InteractiveHoverButton>开始使用</InteractiveHoverButton>`,
      render: () => <InteractiveHoverButton>开始使用</InteractiveHoverButton>,
    },
    {
      title: "尺寸",
      description: "size 与 Button 的 sm / md / lg 一一对应（32/40/48px 高），可与普通按钮混排。",
      code: `<>
  <InteractiveHoverButton size="sm">小</InteractiveHoverButton>
  <InteractiveHoverButton size="md">中</InteractiveHoverButton>
  <InteractiveHoverButton size="lg">大</InteractiveHoverButton>
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <InteractiveHoverButton size="sm">小</InteractiveHoverButton>
          <InteractiveHoverButton size="md">中</InteractiveHoverButton>
          <InteractiveHoverButton size="lg">大</InteractiveHoverButton>
        </div>
      ),
    },
    {
      title: "配色",
      description: "background / foreground 换展开后的底色与文字色，建议喂 chart token 以吃明暗主题。",
      code: `<InteractiveHoverButton background="var(--color-chart-2)">立即体验</InteractiveHoverButton>`,
      render: () => (
        <InteractiveHoverButton background="var(--color-chart-2)">立即体验</InteractiveHoverButton>
      ),
    },
    {
      title: "长文案也盖得满",
      description:
        "展开用 clip-path 的 150% 圆（百分比按参照框对角线解析），任何按钮宽度都必然铺满，不是按某个宽度反推的缩放魔数。",
      code: `<InteractiveHoverButton size="lg">下载桌面客户端（macOS / Windows）</InteractiveHoverButton>`,
      render: () => (
        <InteractiveHoverButton size="lg">下载桌面客户端（macOS / Windows）</InteractiveHoverButton>
      ),
    },
    {
      title: "渲染为链接",
      description: "落地页主 CTA 往往是链接：render 接管元素，样式与两层结构合并进去。",
      code: `<InteractiveHoverButton render={<a href="#" />}>阅读文档</InteractiveHoverButton>`,
      render: () => (
        <InteractiveHoverButton render={<a href="#" />}>阅读文档</InteractiveHoverButton>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "children", type: "text", defaultValue: "开始使用", label: "文案" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <InteractiveHoverButton>开始使用</InteractiveHoverButton> },
    {
      name: "chart-2 配色",
      render: () => (
        <InteractiveHoverButton background="var(--color-chart-2)">立即体验</InteractiveHoverButton>
      ),
    },
    { name: "lg", render: () => <InteractiveHoverButton size="lg">开始使用</InteractiveHoverButton> },
    {
      name: "无箭头",
      render: () => <InteractiveHoverButton icon={null}>开始使用</InteractiveHoverButton>,
    },
    {
      name: "disabled",
      render: () => <InteractiveHoverButton disabled>开始使用</InteractiveHoverButton>,
    },
  ],
  renderWithProps: (p) => (
    <InteractiveHoverButton
      size={p.size as "sm" | "md" | "lg"}
      disabled={p.disabled as boolean}
    >
      {p.children as string}
    </InteractiveHoverButton>
  ),
  toCode: (p) =>
    `<InteractiveHoverButton size="${p.size}"${p.disabled ? " disabled" : ""}>${p.children}</InteractiveHoverButton>`,
};
