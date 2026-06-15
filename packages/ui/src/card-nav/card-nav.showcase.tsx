"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { CardNav } from "./card-nav";

/** 展示用容器：给胶囊导航留出展开的纵向空间 + 中性底 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-72 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-muted/20 p-6">
      {children}
    </div>
  );
}

const items = [
  {
    label: "产品",
    bgColor: "var(--color-chart-1)",
    textColor: "var(--color-primary-foreground)",
    links: [
      { label: "概览", href: "#overview" },
      { label: "定价", href: "#pricing" },
      { label: "更新日志", href: "#changelog" },
    ],
  },
  {
    label: "公司",
    bgColor: "var(--color-chart-2)",
    textColor: "var(--color-primary-foreground)",
    links: [
      { label: "关于我们", href: "#about" },
      { label: "招聘", href: "#careers" },
    ],
  },
  {
    label: "资源",
    bgColor: "var(--color-chart-4)",
    textColor: "var(--color-primary-foreground)",
    links: [
      { label: "文档", href: "#docs" },
      { label: "社区", href: "#community" },
    ],
  },
];

/** 受控版便于在 showcase 默认展开演示 */
function ControlledCardNav({
  defaultOpen,
  ...rest
}: { defaultOpen?: boolean } & React.ComponentProps<typeof CardNav>) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return <CardNav {...rest} open={open} onOpenChange={setOpen} />;
}

export const cardNavShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "顶栏汉堡 / 品牌 / CTA，点汉堡整条胶囊展开，内部卡片逐张错峰浮现。非受控时组件自管开合，点汉堡即可展开。",
      code: `<CardNav
  brand="瑚琏 UI"
  ctaLabel="开始使用"
  items={[
    { label: "产品", bgColor: "var(--color-chart-1)", links: [{ label: "概览", href: "#" }] },
    { label: "公司", bgColor: "var(--color-chart-2)", links: [{ label: "关于", href: "#" }] },
    { label: "资源", bgColor: "var(--color-chart-4)", links: [{ label: "文档", href: "#" }] },
  ]}
/>`,
      render: () => (
        <Stage>
          <CardNav brand="瑚琏 UI" items={items} ctaLabel="开始使用" />
        </Stage>
      ),
    },
    {
      title: "默认展开（受控）",
      description: "传入 open + onOpenChange 由外部接管开合；这里默认展开以展示卡片错峰浮现。",
      code: `const [open, setOpen] = useState(true);

<CardNav
  brand="瑚琏 UI"
  ctaLabel="开始使用"
  items={items}
  open={open}
  onOpenChange={setOpen}
/>`,
      render: () => (
        <Stage>
          <ControlledCardNav
            brand="瑚琏 UI"
            items={items}
            ctaLabel="开始使用"
            defaultOpen
          />
        </Stage>
      ),
    },
    {
      title: "无 CTA",
      description: "ctaLabel 传 null 隐藏右侧 CTA 按钮，纯文字品牌 + 卡片导航。",
      code: `<CardNav brand="HanShip" items={items} ctaLabel={null} />`,
      render: () => (
        <Stage>
          <ControlledCardNav
            brand="HanShip"
            items={items}
            ctaLabel={null}
            defaultOpen
          />
        </Stage>
      ),
    },
    {
      title: "token 卡片（吃主题）",
      description: "卡片不指定 bgColor / textColor 时吃瑚琏 token，自动随明暗主题。",
      code: `<CardNav
  brand="瑚琏"
  items={[
    { label: "产品", links: [{ label: "概览", href: "#" }] },
    { label: "公司", links: [{ label: "关于我们", href: "#" }] },
    { label: "资源", links: [{ label: "文档", href: "#" }] },
  ]}
/>`,
      render: () => (
        <Stage>
          <ControlledCardNav
            brand="瑚琏"
            items={items.map(({ bgColor, textColor, ...rest }) => rest)}
            defaultOpen
          />
        </Stage>
      ),
    },
  ],

  controls: [
    { prop: "ctaLabel", type: "text", defaultValue: "开始使用", label: "CTA 文案" },
    { prop: "duration", type: "number", defaultValue: 0.4, label: "动画秒数" },
    { prop: "open", type: "boolean", defaultValue: true, label: "展开态" },
  ],

  states: [
    {
      name: "default（收起·点汉堡展开）",
      render: () => (
        <Stage>
          <CardNav brand="瑚琏 UI" items={items} ctaLabel="开始使用" />
        </Stage>
      ),
    },
    {
      name: "默认展开（卡片错峰浮现）",
      render: () => (
        <Stage>
          <ControlledCardNav brand="瑚琏 UI" items={items} ctaLabel="开始使用" defaultOpen />
        </Stage>
      ),
    },
    {
      name: "无 CTA · 纯文字品牌",
      render: () => (
        <Stage>
          <ControlledCardNav brand="HanShip" items={items} ctaLabel={null} defaultOpen />
        </Stage>
      ),
    },
    {
      name: "token 卡片（不指定色 · 吃主题）",
      render: () => (
        <Stage>
          <ControlledCardNav
            brand="瑚琏"
            items={items.map(({ bgColor, textColor, ...rest }) => rest)}
            defaultOpen
          />
        </Stage>
      ),
    },
  ],

  renderWithProps: (p) => (
    <Stage>
      <CardNav
        brand="瑚琏 UI"
        items={items}
        ctaLabel={(p.ctaLabel as string) || null}
        duration={p.duration as number}
        open={p.open as boolean}
        onOpenChange={() => {}}
      />
    </Stage>
  ),

  toCode: (p) =>
    [
      `<CardNav`,
      `  brand="瑚琏 UI"`,
      `  ctaLabel=${p.ctaLabel ? `"${p.ctaLabel}"` : "{null}"}`,
      `  duration={${p.duration}}`,
      `  items={[`,
      `    { label: "产品", bgColor: "var(--color-chart-1)", links: [{ label: "概览", href: "#" }] },`,
      `    { label: "公司", bgColor: "var(--color-chart-2)", links: [{ label: "关于", href: "#" }] },`,
      `    { label: "资源", bgColor: "var(--color-chart-4)", links: [{ label: "文档", href: "#" }] },`,
      `  ]}`,
      `/>`,
    ].join("\n"),
};
