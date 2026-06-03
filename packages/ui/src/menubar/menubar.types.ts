import type { ComponentProps } from "react";
import type { Menubar as BaseMenubar } from "@base-ui-components/react/menubar";
import type { Menu as BaseMenu } from "@base-ui-components/react/menu";

/** 菜单条根：modal(默 true)/orientation(默 horizontal)/loopFocus(默 true)/disabled + className 透传。 */
export type MenubarProps = ComponentProps<typeof BaseMenubar>;

/** 顶层菜单（一个 File/Edit）：透传 Base UI Menu.Root（open/defaultOpen/onOpenChange…）。 */
export type MenubarMenuProps = ComponentProps<typeof BaseMenu.Root>;

/** 菜单条顶层触发器：透传 Base UI Menu.Trigger。 */
export type MenubarTriggerProps = ComponentProps<typeof BaseMenu.Trigger>;
