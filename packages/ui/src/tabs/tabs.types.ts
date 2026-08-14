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
  className?: string;
}

export type TabsTabProps = Omit<BaseTabsTabProps, "className"> & { className?: string };
export type TabsPanelProps = Omit<BaseTabsPanelProps, "className"> & { className?: string };
