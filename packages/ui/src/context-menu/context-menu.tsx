"use client";
import type { ComponentProps, ReactNode } from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui-components/react/context-menu";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { menuItemVariants } from "../menu/menu";
import type { ContextMenuContentProps, ContextMenuItemProps } from "./context-menu.types";

// Base UI rc.0 自带 context-menu 原语（其 Positioner/Popup/Item/Separator/Group 直接复用 menu 部件）。
// 瑚琏只薄包并复用 menu 的皮肤（同一 menuItemVariants / data-highlighted 钩子 / surface 面板）。
// 与 Menu 的关键差异：Trigger 是「右键/长按弹出」的区域（渲 <div>），定位锚到光标（无 side/align）。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function ContextMenu(props: ComponentProps<typeof BaseContextMenu.Root>) {
  return <BaseContextMenu.Root {...props} />;
}

// 触发区域：右键点击 / 长按其内任意处弹出菜单（渲 <div>，非按钮）。
export const ContextMenuTrigger = BaseContextMenu.Trigger;
export const ContextMenuGroup = BaseContextMenu.Group;

export function ContextMenuContent({ children, className }: ContextMenuContentProps) {
  return (
    <BaseContextMenu.Portal>
      {/* 定位锚到光标点击位置，无需 side/align。 */}
      <BaseContextMenu.Positioner className="z-50">
        <BaseContextMenu.Popup
          className={cn(
            "min-w-[8rem] rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none",
            "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
}

// 复用 menu 皮肤：Item 渲 <div>，高亮态 data-highlighted、禁用 data-disabled。
export function ContextMenuItem({ variant, className, ...props }: ContextMenuItemProps) {
  return <BaseContextMenu.Item className={cn(menuItemVariants({ variant }), className)} {...props} />;
}

export function ContextMenuSeparator({ className }: { className?: string }) {
  return <BaseContextMenu.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export function ContextMenuGroupLabel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <BaseContextMenu.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted", className)}>
      {children}
    </BaseContextMenu.GroupLabel>
  );
}
