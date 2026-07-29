"use client";
import type { ComponentProps, ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { MenuContentProps, MenuItemProps } from "./menu.types";

// overlay 自管 mount/unmount；用瑚琏 motion token 的 CSS 镜像驱动 Base UI 原生过渡（与 Dialog/Popover 同手感）。
// transition 简写(而非 transitionDuration/TimingFunction 长写)：Base UI 过渡期会往内联 style 注入
// transition 简写，与长写混在同一 style 对象 → React "shorthand/longhand 混用" 警告并丢弃长写。
const overlayTransition = {
  transition: `opacity ${motionDurationCss.base} ${motionEaseCss.out}, transform ${motionDurationCss.base} ${motionEaseCss.out}`,
} as const;

export function Menu(props: ComponentProps<typeof BaseMenu.Root>) {
  return <BaseMenu.Root {...props} />;
}

export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export function MenuContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  className,
}: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseMenu.Popup
          className={cn(
            "min-w-[8rem] rounded-[var(--radius)] border border-hairline bg-surface p-1 text-foreground shadow-xl outline-none",
            "origin-[var(--transform-origin)] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

// Item 渲 <div>，高亮态 data-highlighted（键盘漫游 + 指针 hover 同置位）、禁用 data-disabled
// （非 button → 禁 hover/focus/:disabled 伪类）。圆角封顶避小盒过圆。
export const menuItemVariants = cva(
  [
    "flex cursor-default select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-sm outline-none transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "text-foreground data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
        danger: "text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function MenuItem({ variant, className, ...props }: MenuItemProps) {
  return <BaseMenu.Item className={cn(menuItemVariants({ variant }), className)} {...props} />;
}

export function MenuSeparator({ className }: { className?: string }) {
  return <BaseMenu.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}

export function MenuGroupLabel({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <BaseMenu.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted", className)}>
      {children}
    </BaseMenu.GroupLabel>
  );
}
