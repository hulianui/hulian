"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { BubbleMenu } from "./bubble-menu";
import type { BubbleMenuItem } from "./bubble-menu.types";

/** 展示用容器：relative 让 BubbleMenu 的 absolute 定位锚在框内，深色底凸显气泡阴影 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-96 w-full max-w-3xl overflow-hidden rounded-xl border border-border bg-surface">
      {children}
    </div>
  );
}

const LOGO = <span className="text-sm font-semibold text-foreground">瑚琏</span>;

const FEW: BubbleMenuItem[] = [
  { label: "首页", href: "#", rotation: -6, hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
  { label: "文档", href: "#", rotation: 6, hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
  { label: "联系", href: "#", rotation: -4, hoverStyles: { bgColor: "var(--color-chart-3)", textColor: "var(--color-primary-foreground)" } },
];

export const bubbleMenuShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "logo 气泡 + 汉堡切换钮，点切换钮展开整屏错落胶囊导航。缺省用内置 5 项示例；需 relative + 定高容器锚定 absolute 定位。",
      code: `<div className="relative h-96 overflow-hidden rounded-xl border">
  <BubbleMenu logo={<span>瑚琏</span>} />
</div>`,
      render: () => (
        <Stage>
          <BubbleMenu logo={LOGO} />
        </Stage>
      ),
    },
    {
      title: "自定义菜单项",
      description:
        "items 自定义胶囊：label / href，rotation 营造手作错落感，hoverStyles 设悬停反色（建议吃 chart token）。",
      code: `const items = [
  { label: "首页", href: "#", rotation: -6,
    hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
  { label: "文档", href: "#", rotation: 6,
    hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
  { label: "联系", href: "#", rotation: -4,
    hoverStyles: { bgColor: "var(--color-chart-3)", textColor: "var(--color-primary-foreground)" } },
];

<BubbleMenu logo={<span>瑚琏</span>} items={items} />`,
      render: () => (
        <Stage>
          <BubbleMenu logo={LOGO} items={FEW} />
        </Stage>
      ),
    },
    {
      title: "入场节奏",
      description: "animationDuration 调单胶囊弹入时长，staggerDelay 调相邻胶囊错峰延迟，越小越紧凑。",
      code: `<BubbleMenu
  logo={<span>瑚琏</span>}
  items={items}
  animationDuration={0.3}
  staggerDelay={0.05}
/>`,
      render: () => (
        <Stage>
          <BubbleMenu
            logo={LOGO}
            items={FEW}
            animationDuration={0.3}
            staggerDelay={0.05}
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "animationDuration", type: "number", defaultValue: 0.5, label: "入场时长 秒" },
    { prop: "staggerDelay", type: "number", defaultValue: 0.12, label: "错峰延迟 秒" },
    { prop: "useFixedPosition", type: "boolean", defaultValue: false, label: "fixed 定位" },
  ],

  states: [
    {
      name: "default（默认 5 项·点切换钮展开）",
      render: () => (
        <Stage>
          <BubbleMenu logo={LOGO} />
        </Stage>
      ),
    },
    {
      name: "自定义三项（chart token 反色）",
      render: () => (
        <Stage>
          <BubbleMenu logo={LOGO} items={FEW} />
        </Stage>
      ),
    },
    {
      name: "快入场·小错峰",
      render: () => (
        <Stage>
          <BubbleMenu logo={LOGO} items={FEW} animationDuration={0.3} staggerDelay={0.05} />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <BubbleMenu
        logo={LOGO}
        animationDuration={p.animationDuration as number}
        staggerDelay={p.staggerDelay as number}
        useFixedPosition={p.useFixedPosition as boolean}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<div className="relative h-96 overflow-hidden rounded-xl">`,
      `  <BubbleMenu`,
      `    logo={<span>瑚琏</span>}`,
      `    animationDuration={${p.animationDuration}}`,
      `    staggerDelay={${p.staggerDelay}}`,
      `    useFixedPosition={${p.useFixedPosition}}`,
      `  />`,
      `</div>`,
    ].join("\n"),
};
