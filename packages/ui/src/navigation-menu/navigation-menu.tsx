"use client";
import type { CSSProperties } from "react";
import { NavigationMenu as BaseNav } from "@base-ui/react/navigation-menu";
import { ChevronDown } from "../_icons";
import { cn } from "../lib/cn";
import { overlayTransitions, transitionCss } from "../motion";
import type {
  NavigationMenuContentProps,
  NavigationMenuItemProps,
  NavigationMenuLinkProps,
  NavigationMenuListProps,
  NavigationMenuProps,
  NavigationMenuTriggerProps,
} from "./navigation-menu.types";

// Popup 尺寸形变：宽高跟随 Base UI 实测的 --popup-width/height 平滑过渡，配 --transform-origin。
const popupMorph: CSSProperties = {
  width: "var(--popup-width)",
  height: "var(--popup-height)",
  transformOrigin: "var(--transform-origin)",
  transition: transitionCss(
    { property: "width", duration: "base" },
    { property: "height", duration: "base" },
    { property: "opacity", duration: "base" },
    { property: "transform", duration: "base" },
  ),
};

/**
 * 导航菜单（mega-menu）：Root + 消费者写的 List 之后自动 bundle Portal/Positioner/Popup/Viewport
 * 共享浮层（活动 Item 的 Content 渲入 Viewport，尺寸随面板形变）。消费者只需写 List/Item/Trigger/Content/Link。
 */
export function NavigationMenu({ children, className, ...props }: NavigationMenuProps) {
  return (
    <BaseNav.Root className={cn("relative", className)} {...props}>
      {children}
      <BaseNav.Portal>
        <BaseNav.Positioner sideOffset={8} className="z-50 outline-none">
          <BaseNav.Popup
            className={cn(
              "relative overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface text-foreground shadow-xl outline-none",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
            style={popupMorph}
          >
            <BaseNav.Arrow
              className={cn(
                "-z-10",
                "data-[side=top]:bottom-[-4px] data-[side=top]:rotate-45",
                "data-[side=bottom]:top-[-4px] data-[side=bottom]:rotate-[225deg]",
                "data-[side=left]:right-[-4px] data-[side=left]:rotate-[315deg]",
                "data-[side=right]:left-[-4px] data-[side=right]:rotate-[135deg]",
              )}
            >
              <span className="block h-2 w-2 border-b border-r border-border bg-surface" />
            </BaseNav.Arrow>
            {/* Viewport：活动 Content 容器；relative 作退出态内容的绝对定位上下文。
                Popup 已 overflow-hidden 裁切形变；尺寸由 Content(正常流) 自然撑开 → Popup 测得。 */}
            <BaseNav.Viewport className="relative rounded-[inherit]" />
          </BaseNav.Popup>
        </BaseNav.Positioner>
      </BaseNav.Portal>
    </BaseNav.Root>
  );
}

export function NavigationMenuList({ className, ...props }: NavigationMenuListProps) {
  return <BaseNav.List className={cn("flex flex-wrap items-center gap-1", className)} {...props} />;
}

export function NavigationMenuItem({ className, ...props }: NavigationMenuItemProps) {
  return <BaseNav.Item className={className} {...props} />;
}

// 顶层触发器：导航项皮肤 + chevron 随 data-popup-open 旋转。
export function NavigationMenuTrigger({ className, children, ...props }: NavigationMenuTriggerProps) {
  return (
    <BaseNav.Trigger
      className={cn(
        "group flex cursor-default select-none items-center gap-1 rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm font-medium text-foreground outline-none transition-colors",
        "hover:bg-surface-hover data-[popup-open]:bg-surface-hover",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden
        className="size-4 text-muted-foreground transition-transform duration-200 group-data-[popup-open]:rotate-180"
      />
    </BaseNav.Trigger>
  );
}

// 面板内容：绝对填充 Viewport，进出场淡入 + 按激活方向轻微横移。
export function NavigationMenuContent({ className, ...props }: NavigationMenuContentProps) {
  return (
    <BaseNav.Content
      style={overlayTransitions.popup}
      className={cn(
        // 当前内容在正常流(让 Popup 测得自然尺寸)；仅退出态转 absolute 让进入内容定尺寸。
        "w-max max-w-[calc(100vw-2rem)] p-4",
        "data-[ending-style]:absolute data-[ending-style]:left-0 data-[ending-style]:top-0",
        "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
        "data-[activation-direction=left]:data-[starting-style]:-translate-x-3",
        "data-[activation-direction=right]:data-[starting-style]:translate-x-3",
        "data-[activation-direction=left]:data-[ending-style]:translate-x-3",
        "data-[activation-direction=right]:data-[ending-style]:-translate-x-3",
        className,
      )}
      {...props}
    />
  );
}

// 链接：默认导航项内联皮肤（顶层纯链接项用）；面板内链接列表传 className 改 block 即可。
export function NavigationMenuLink({ className, ...props }: NavigationMenuLinkProps) {
  return (
    <BaseNav.Link
      className={cn(
        "flex cursor-pointer select-none items-center rounded-[min(var(--radius),0.5rem)] px-3 py-2 text-sm font-medium text-foreground no-underline outline-none transition-colors",
        "hover:bg-surface-hover",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
      {...props}
    />
  );
}
