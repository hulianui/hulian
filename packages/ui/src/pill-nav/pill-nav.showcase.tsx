"use client";
import { useId } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { PillNav } from "./pill-nav";

const KEYS = ["home", "features", "pricing", "docs"] as const;
const LABEL: Record<(typeof KEYS)[number], string> = {
  home: "Home",
  features: "Features",
  pricing: "Pricing",
  docs: "Docs",
};

/** 展示用中性容器，给胶囊导航足够留白与对比 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-32 w-full max-w-xl items-center justify-center rounded-xl border border-border bg-subtle p-8">
      {children}
    </div>
  );
}

/**
 * 活预览里的 href 必须指向**页内真实存在**的锚点。
 *
 * PillNav 靠 `activeHref === item.href` 判选中，所以四项不能都写 `href="#"`（那样四项全亮）；
 * 而写 `#home` 这类占位又会在文档站留下悬空锚点（链接门禁会逐条报 missing-fragment）。
 * 解法是让示例自己渲染出这些锚点，`useId` 保证同一页多处渲染（示例 / 状态 / playground）
 * 时 ID 不重复。示例代码块里仍然展示 `#home` 这种消费方真实会写的形态。
 */
function PillNavDemo({
  active = "home",
  ...props
}: { active?: (typeof KEYS)[number] } & Omit<
  Parameters<typeof PillNav>[0],
  "items" | "activeHref"
>) {
  const id = useId().replace(/:/g, "");
  const anchor = (key: string) => `#${id}-${key}`;
  return (
    <Stage>
      {KEYS.map((key) => (
        <span key={key} id={`${id}-${key}`} className="absolute size-0" aria-hidden />
      ))}
      <PillNav
        items={KEYS.map((key) => ({ href: anchor(key), label: LABEL[key] }))}
        activeHref={anchor(active)}
        {...props}
      />
    </Stage>
  );
}

/** 一个简单的胶囊形 logo 占位，悬停跟随旋转 */
function Mark() {
  return (
    <span className="grid size-full place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      瑚
    </span>
  );
}

export const pillNavShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 items 与 activeHref，激活项常驻反相态并点亮指示圆点。",
      code: `<PillNav
  items={[
    { href: "#home", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#docs", label: "Docs" },
  ]}
  activeHref="#home"
/>`,
      render: () => (
        <PillNavDemo active="home" />
      ),
    },
    {
      title: "带品牌 logo",
      description: "传 logo 槽渲染左侧圆形标识，悬停时整枚 logo 旋转一圈。",
      code: `<PillNav items={items} activeHref="#features" logo={<Mark />} />`,
      render: () => (
        <PillNavDemo active="features" logo={<Mark />} />
      ),
    },
    {
      title: "关闭入场动画",
      description: "initialLoadAnimation={false} 跳过首次加载的弹入/展开动效。",
      code: `<PillNav
  items={items}
  activeHref="#pricing"
  logo={<Mark />}
  initialLoadAnimation={false}
/>`,
      render: () => (
        <PillNavDemo active="pricing" logo={<Mark />} initialLoadAnimation={false} />
      ),
    },
  ],

  controls: [
    {
      prop: "activeHref",
      type: "select",
      options: ["#home", "#features", "#pricing", "#docs"],
      defaultValue: "#home",
      label: "激活项",
    },
    { prop: "withLogo", type: "boolean", defaultValue: true, label: "显示 logo" },
    { prop: "initialLoadAnimation", type: "boolean", defaultValue: true, label: "入场动画" },
  ],

  states: [
    {
      name: "default（带 logo · 首项激活）",
      render: () => (
        <PillNavDemo active="home" logo={<Mark />} />
      ),
    },
    {
      name: "无 logo（纯导航）",
      render: () => (
        <PillNavDemo active="features" />
      ),
    },
    {
      name: "关闭入场动画",
      render: () => (
        <PillNavDemo active="pricing" logo={<Mark />} initialLoadAnimation={false} />
      ),
    },
  ],

  renderWithProps: (p) => (
    <PillNavDemo
      active={(p.activeHref as string).replace("#", "") as "home"}
      logo={p.withLogo ? <Mark /> : undefined}
      initialLoadAnimation={p.initialLoadAnimation as boolean}
    />
  ),

  toCode: (p) =>
    [
      `<PillNav`,
      `  items={[`,
      `    { href: "#home", label: "Home" },`,
      `    { href: "#features", label: "Features" },`,
      `    { href: "#pricing", label: "Pricing" },`,
      `    { href: "#docs", label: "Docs" },`,
      `  ]}`,
      `  activeHref="${p.activeHref}"`,
      p.withLogo ? `  logo={<Mark />}` : null,
      `  initialLoadAnimation={${p.initialLoadAnimation}}`,
      `/>`,
    ]
      .filter(Boolean)
      .join("\n"),
};
