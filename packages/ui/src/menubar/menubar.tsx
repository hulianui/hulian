"use client";
import { Menubar as BaseMenubar } from "@base-ui-components/react/menubar";
import { Menu as BaseMenu } from "@base-ui-components/react/menu";
import { cn } from "../lib/cn";
import type { MenubarMenuProps, MenubarProps, MenubarTriggerProps } from "./menubar.types";

// 菜单条根：横向条皮肤。modal/orientation/loopFocus/disabled 透传 Base UI Menubar（顶层菜单间
// hover 切换、方向键移动、Esc 关闭全由 Base UI 兜底，零手写）。
export function Menubar({ className, ...props }: MenubarProps) {
  return (
    <BaseMenubar
      {...props}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground",
        "data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
        className,
      )}
    />
  );
}

// 单个顶层菜单 = Base UI Menu.Root（menubar-aware）。透明转发，守薄包家风。
export function MenubarMenu(props: MenubarMenuProps) {
  return <BaseMenu.Root {...props} />;
}

// 顶层触发器：菜单条横向项皮肤；data-[popup-open] 打开态高亮（实证属性名，非 data-active/selected）。
export function MenubarTrigger({ className, ...props }: MenubarTriggerProps) {
  return (
    <BaseMenu.Trigger
      className={cn(
        "flex cursor-default select-none items-center rounded-[min(var(--radius),0.375rem)] px-3 py-1.5 text-sm font-medium outline-none transition-colors",
        "hover:bg-surface-hover data-[popup-open]:bg-surface-hover",
        "focus-visible:ring-2 focus-visible:ring-ring",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

// 下拉内容/项/分隔/分组 dogfood 瑚琏 Menu 皮肤（同一 Base UI Menu primitive，零重复皮肤）。
export {
  MenuContent as MenubarContent,
  MenuItem as MenubarItem,
  MenuSeparator as MenubarSeparator,
  MenuGroup as MenubarGroup,
  MenuGroupLabel as MenubarGroupLabel,
} from "../menu/menu";
