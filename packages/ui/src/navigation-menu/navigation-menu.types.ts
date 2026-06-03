import type { ComponentProps } from "react";
import { NavigationMenu as BaseNav } from "@base-ui-components/react/navigation-menu";

/** 根：value/defaultValue/onValueChange/delay/closeDelay/orientation 透传 + className。自动内含浮层。 */
export type NavigationMenuProps = ComponentProps<typeof BaseNav.Root>;
export type NavigationMenuListProps = ComponentProps<typeof BaseNav.List>;
export type NavigationMenuItemProps = ComponentProps<typeof BaseNav.Item>;
export type NavigationMenuTriggerProps = ComponentProps<typeof BaseNav.Trigger>;
export type NavigationMenuContentProps = ComponentProps<typeof BaseNav.Content>;
export type NavigationMenuLinkProps = ComponentProps<typeof BaseNav.Link>;
