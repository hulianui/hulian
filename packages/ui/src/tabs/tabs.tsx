"use client";
import type { CSSProperties } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { TabsListProps, TabsPanelProps, TabsProps, TabsTabProps } from "./tabs.types";

// 根：纯透传 Base UI Tabs.Root（value/defaultValue/onValueChange/orientation）。默认非受控。
export function Tabs(props: TabsProps) {
  return <BaseTabs.Root {...props} />;
}

// tab 条容器皮肤：underline=下划线条；solid=分段药丸轨道。relative 锚定内嵌 Indicator。
export const tabsListVariants = cva("relative inline-flex items-center gap-1", {
  variants: {
    variant: {
      underline: "border-b border-border",
      solid: "rounded-[var(--radius)] bg-surface-hover p-1",
    },
  },
  defaultVariants: { variant: "underline" },
});

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

export function TabsList({ className, variant, children, ...props }: TabsListProps) {
  const v = variant ?? "underline";
  const ind = indicatorByVariant[v];
  return (
    <BaseTabs.List {...props} className={cn(tabsListVariants({ variant: v }), className)}>
      <BaseTabs.Indicator className={ind.className} style={ind.style} />
      {children}
    </BaseTabs.List>
  );
}

// Tab：皮肤无关。text-muted-foreground→data-[active]:text-foreground；relative z-10 让文字盖在 solid 药丸之上。
const tabsTabClasses = cn(
  "relative z-10 cursor-pointer select-none rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium",
  "text-muted-foreground transition-colors hover:text-foreground data-[active]:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
);

export function TabsTab({ className, ...props }: TabsTabProps) {
  return <BaseTabs.Tab {...props} className={cn(tabsTabClasses, className)} />;
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
