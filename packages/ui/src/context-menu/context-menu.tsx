"use client";
import type { ComponentProps, ReactNode } from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui-components/react/context-menu";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import { menuItemVariants } from "../menu/menu";
import type {
  ContextMenuContentProps,
  ContextMenuItemProps,
  ContextMenuSubTriggerProps,
  ContextMenuSubContentProps,
} from "./context-menu.types";

// Base UI rc.0 自带 context-menu 原语（其 Positioner/Popup/Item/Separator/Group 直接复用 menu 部件）。
// 瑚琏只薄包并复用 menu 的皮肤（同一 menuItemVariants / data-highlighted 钩子 / surface 面板）。
// 与 Menu 的关键差异：Trigger 是「右键/长按弹出」的区域（渲 <div>），定位锚到光标（无 side/align）。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

// 面板皮肤（主菜单 / 子菜单共用），抽常量避免漂移。
const popupClass =
  "min-w-[8rem] rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";

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
        <BaseContextMenu.Popup className={cn(popupClass, className)} style={overlayTransition}>
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

// ===== 级联子菜单（复用 Base UI SubmenuRoot/SubmenuTrigger；面板从父项右侧弹出）=====

// 子菜单根：包住 SubTrigger + SubContent。
export const ContextMenuSub = BaseContextMenu.SubmenuRoot;

// 子菜单触发项：菜单项皮肤 + 右向 chevron 提示有下级；data-popup-open 时高亮保持。
export function ContextMenuSubTrigger({ variant, className, children, ...props }: ContextMenuSubTriggerProps) {
  return (
    <BaseContextMenu.SubmenuTrigger
      className={cn(
        menuItemVariants({ variant }),
        "data-[popup-open]:bg-surface-hover data-[popup-open]:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="ml-auto size-4 shrink-0 text-muted"
      >
        <path d="m9 18 6-6-6-6" />
      </svg>
    </BaseContextMenu.SubmenuTrigger>
  );
}

// 子菜单面板：锚到父项右侧（side=right），复用主面板皮肤。
export function ContextMenuSubContent({ children, className }: ContextMenuSubContentProps) {
  return (
    <BaseContextMenu.Portal>
      <BaseContextMenu.Positioner className="z-50" side="right" align="start" sideOffset={4}>
        <BaseContextMenu.Popup className={cn(popupClass, className)} style={overlayTransition}>
          {children}
        </BaseContextMenu.Popup>
      </BaseContextMenu.Positioner>
    </BaseContextMenu.Portal>
  );
}
