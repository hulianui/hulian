import type { VariantProps } from "class-variance-authority";
import type {
  TabsRootProps,
  TabsListProps as BaseTabsListProps,
  TabsTabProps as BaseTabsTabProps,
  TabsPanelProps as BaseTabsPanelProps,
} from "@base-ui/react/tabs";
import type { tabsListVariants } from "./tabs";

/** 根：透传 Base UI Tabs.Root（value/defaultValue/onValueChange/orientation）。默认非受控。 */
export type TabsProps = TabsRootProps;

/** 尺寸档。`md` 是页面级 tab 导航；`sm` 给「跟标题/搜索框同行」的行内切换器。 */
export type TabsSize = "sm" | "md";

/**
 * 语义档。取值是「语义 tone SSOT」（见 `Button` 的 `tone`）的子集，不另造概念。
 *
 * 刻意**不收 `current`**：`current` 的用途是「别设色、跟随容器继承」，为的是彩色卡片/彩色行里的
 * 图标按钮；tab 条不长在彩色容器里，没有这个场景，收进来只会多一档没人能验的行为。
 */
export type TabsTone = "brand" | "success" | "warning" | "danger" | "neutral";

/** tab 条：皮肤变体在此（underline/solid），自动内嵌 Indicator。className 收窄成 string 便于 cn()。 */
export interface TabsListProps
  extends Omit<BaseTabsListProps, "className">,
    VariantProps<typeof tabsListVariants> {
  /**
   * 尺寸档，下发给 `TabsTab`（不必逐个传）。@default "md"
   *
   * 纯文字实测：`sm` 的 tab 24px / solid 轨道 28px，`md` 是 32 / 40。
   * `sm` 里放计数 `Tag` 记得也给它 `size="sm"` —— Tag 默认 `md` 是 24px，
   * 一颗就把 tab 顶回 32px（组件不会去改子元素显式声明的尺寸）。
   */
  size?: TabsSize;
  /**
   * 选中态的语义色档，下发给 `TabsTab`（不必逐个传）。@default "neutral"
   *
   * 只描述「选中意味着什么」：选中文字（两种皮肤都吃）与 underline 的下划线跟着这一档走；
   * solid 的药丸底保持 `bg-surface` 不变，未选中态也不受影响（仍是 `text-muted-foreground`）。
   *
   * 默认 `neutral` = **逐字保持库既有的渲染**（选中文字 `text-foreground`、underline 下划线
   * `bg-primary`），不是「把品牌色换成灰」—— 这一档存在的意义就是让存量页面零视觉变化。
   * 想要 #316 截图里「白药丸 + 品牌蓝字」的观感，显式传 `tone="brand"`。
   */
  tone?: TabsTone;
  className?: string;
}

export type TabsTabProps = Omit<BaseTabsTabProps, "className"> & { className?: string };
export type TabsPanelProps = Omit<BaseTabsPanelProps, "className"> & { className?: string };
