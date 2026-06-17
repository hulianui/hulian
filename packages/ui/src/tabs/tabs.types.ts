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

/** tab 条：皮肤变体在此（underline/solid），自动内嵌 Indicator。className 收窄成 string 便于 cn()。 */
export interface TabsListProps
  extends Omit<BaseTabsListProps, "className">,
    VariantProps<typeof tabsListVariants> {
  className?: string;
}

export type TabsTabProps = Omit<BaseTabsTabProps, "className"> & { className?: string };
export type TabsPanelProps = Omit<BaseTabsPanelProps, "className"> & { className?: string };
