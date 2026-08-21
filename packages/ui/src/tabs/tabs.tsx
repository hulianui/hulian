"use client";
import { createContext, useContext, type CSSProperties } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type {
  TabsListProps,
  TabsPanelProps,
  TabsProps,
  TabsSize,
  TabsTabProps,
  TabsTone,
} from "./tabs.types";

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

/**
 * 语义档同样由 TabsList 下发（走 TabsSizeContext 那条既有的路，不新造下发机制）。
 * 默认 neutral —— 见下方两张 tone 表：那一格是空串，等于什么都不追加。
 */
const TabsToneContext = createContext<TabsTone>("neutral");

/**
 * 选中文字色（皮肤无关，solid 与 underline 吃同一档 —— #316 要抹平的正是这两个皮肤对色的态度不一致）。
 *
 * `neutral` 那格刻意是**空串**：不追加任何类，让基类里原有的 `data-[active]:text-foreground`
 * 原样生效。于是不传 tone 时 class 字符串逐字不变（不是"看起来一样"，是同一串），这也是默认
 * 取 neutral 而不是 brand 的原因 —— tone 是纯增量，存量页面一个像素都不动。
 *
 * 非 neutral 档靠 tailwind-merge 顶掉基类那条：`data-[active]:text-foreground` 与
 * `data-[active]:text-primary` 同组同变体，后者胜（#316 里实测过的行为）。
 */
const activeTextByTone: Record<TabsTone, string> = {
  neutral: "",
  brand: "data-[active]:text-primary",
  success: "data-[active]:text-success",
  warning: "data-[active]:text-warning",
  danger: "data-[active]:text-danger",
};

/**
 * 滑块的 tone 生效面**按皮肤分叉**，这不是漏做：
 * - underline 的下划线是"哪一段被选中"的主要色载体，必须跟 tone；
 * - solid 的药丸底保持 `bg-surface`（白药丸 + 语义字，即 #316 截图那个形态）。语义色铺满药丸
 *   会把 tab 文字自身的语义盖掉，且那一档（浅语义底，对齐 Button 的 `soft`）是留给后续的，
 *   现在就把 tone 钉死成"连底一起染"会堵死那条路。
 *
 * `neutral` 与 `brand` 都是空串：基类写的就是 `bg-primary` —— brand 是 primary 的对外名字，
 * 而 neutral 按 #316 的拍板"逐字保持今天的渲染"，今天的下划线本来就写死品牌色。
 */
const underlineIndicatorByTone: Record<TabsTone, string> = {
  neutral: "",
  brand: "",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

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

export function TabsList({ className, variant, size, tone, children, ...props }: TabsListProps) {
  const v = variant ?? "underline";
  const s = size ?? "md";
  const t = tone ?? "neutral";
  const ind = indicatorByVariant[v];
  return (
    <BaseTabs.List {...props} className={cn(tabsListVariants({ variant: v, size: s }), className)}>
      <BaseTabs.Indicator
        className={
          v === "underline" ? cn(ind.className, underlineIndicatorByTone[t]) : ind.className
        }
        style={ind.style}
      />
      <TabsSizeContext.Provider value={s}>
        <TabsToneContext.Provider value={t}>{children}</TabsToneContext.Provider>
      </TabsSizeContext.Provider>
    </BaseTabs.List>
  );
}

// Tab：皮肤无关。text-muted-foreground→data-[active]:text-foreground；relative z-10 让文字盖在 solid 药丸之上。
// 选中色可被 TabsList 的 tone 顶掉（见 activeTextByTone），未选中/hover 两态不受 tone 影响 ——
// tone 只回答"选中意味着什么"，静息层级是另一件事。
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
  const tone = useContext(TabsToneContext);
  // tone 类排在 className 之前：消费方的 className 仍然是最后一道，能继续盖住库给的选中色。
  return (
    <BaseTabs.Tab
      {...props}
      className={cn(tabsTabVariants({ size }), activeTextByTone[tone], className)}
    />
  );
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
