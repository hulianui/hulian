"use client";
import { createContext, useContext, type CSSProperties } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { TabsListProps, TabsPanelProps, TabsProps, TabsSize, TabsTabProps } from "./tabs.types";

// 根：纯透传 Base UI Tabs.Root（value/defaultValue/onValueChange/orientation）。默认非受控。
export function Tabs(props: TabsProps) {
  return <BaseTabs.Root {...props} />;
}

// tab 条容器皮肤：underline=下划线条；solid=分段药丸轨道。relative 锚定内嵌 Indicator。
//
// 尺寸档（#269）：tab 条经常不是页面级导航，而是跟标题、搜索框同行的一个切换器 ——
// 那一行的既有高度是 28–32px，而 md 档带一颗计数 Tag 的 tab 是 36px、轨道 44px，塞不进去。
// 消费方压不回来：TabsList 是 inline-flex items-center，强写 h-7 只会让 36px 的 tab 居中溢出，
// 药丸上下各探出轨道 4px（实测），比高一点更难看。所以这一档只能由库给。
export const tabsListVariants = cva("relative inline-flex items-center", {
  variants: {
    variant: {
      underline: "border-b border-border",
      // bg-track 而非 bg-surface-hover：后者与药丸的 bg-surface 亮色下只差 3.3%、暗色下方向还是反的（#152）。
      solid: "rounded-[var(--radius)] bg-track",
    },
    size: { sm: "gap-0.5", md: "gap-1" },
  },
  // solid 的轨道内边距跟着尺寸走；md 逐字保持改动前的 p-1。
  compoundVariants: [
    { variant: "solid", size: "sm", class: "p-0.5" },
    { variant: "solid", size: "md", class: "p-1" },
  ],
  defaultVariants: { variant: "underline", size: "md" },
});

/**
 * 尺寸由 TabsList 下发给 TabsTab：尺寸与皮肤变体同层（都在 TabsList 上）才一致，
 * 而 tab 是散件、逐个传必然漂。默认 md —— TabsTab 单独用（不套本库的 List）时行为不变。
 */
const TabsSizeContext = createContext<TabsSize>("md");

// Indicator 过渡：复用 motion-token 的 CSS 镜像，手感同 Dialog/Button，零 motion 运行时。
const indicatorTransition: CSSProperties = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
};

// Indicator 绑 Base UI 测好的 6 个几何变量 → 纯 CSS 平滑滑动。
// underline 只动 width + translateX；solid 动 width/height + translate(x,y)。
const indicatorByVariant: Record<"underline" | "solid", { className: string; style: CSSProperties }> = {
  underline: {
    className: "pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-primary",
    style: {
      ...indicatorTransition,
      transitionProperty: "transform, width",
      width: "var(--active-tab-width)",
      transform: "translateX(var(--active-tab-left))",
    },
  },
  solid: {
    className:
      "pointer-events-none absolute left-0 top-0 rounded-[calc(var(--radius)-0.25rem)] bg-surface shadow-sm",
    style: {
      ...indicatorTransition,
      transitionProperty: "transform, width, height",
      width: "var(--active-tab-width)",
      height: "var(--active-tab-height)",
      transform: "translate(var(--active-tab-left), var(--active-tab-top))",
    },
  },
};

export function TabsList({ className, variant, size, children, ...props }: TabsListProps) {
  const v = variant ?? "underline";
  const s = size ?? "md";
  const ind = indicatorByVariant[v];
  return (
    <BaseTabs.List {...props} className={cn(tabsListVariants({ variant: v, size: s }), className)}>
      <BaseTabs.Indicator className={ind.className} style={ind.style} />
      <TabsSizeContext.Provider value={s}>{children}</TabsSizeContext.Provider>
    </BaseTabs.List>
  );
}

// Tab：皮肤无关。text-muted-foreground→data-[active]:text-foreground；relative z-10 让文字盖在 solid 药丸之上。
const tabsTabVariants = cva(
  cn(
    "relative z-10 cursor-pointer select-none rounded-[var(--radius)] font-medium",
    "text-muted-foreground transition-colors hover:text-foreground data-[active]:text-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ),
  {
    variants: {
      // 纯文字实测：sm tab 24px / solid 轨道 28px；md 逐字保持改动前的 32 / 40。
      size: { sm: "px-2 py-1 text-xs", md: "px-3 py-1.5 text-sm" },
    },
    defaultVariants: { size: "md" },
  },
);

export function TabsTab({ className, ...props }: TabsTabProps) {
  const size = useContext(TabsSizeContext);
  return <BaseTabs.Tab {...props} className={cn(tabsTabVariants({ size }), className)} />;
}

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...props}
      className={cn(
        "mt-3 rounded-[var(--radius)] text-sm text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
    />
  );
}
