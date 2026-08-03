"use client";
import { Menu, X } from "../_icons";
import { cn } from "../lib/cn";
import type {
  NavbarProps,
  NavbarBrandProps,
  NavbarContentProps,
  NavbarItemProps,
  NavbarMenuToggleProps,
} from "./navbar.types";
import { useComponentLocale } from "../config/locale-context";

// 复合导航栏皮肤（含可交互 MenuToggle 故 "use client"）。
// 布局/路由由消费者用子件组合，本件只负责皮肤与无障碍语义。
export function Navbar({
  sticky = false,
  bordered = true,
  className,
  children,
  ...props
}: NavbarProps) {
  return (
    <nav
      className={cn(
        "flex h-16 w-full items-center gap-4 bg-surface/80 px-4 backdrop-blur-md sm:px-6",
        bordered && "border-b border-border",
        sticky && "sticky top-0 z-40",
        className,
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

// 品牌段默认与两侧 NavbarContent 一样是 flex-1 basis-0：三段等分，justify="center"
// 才真的落在 nav 中心（品牌段定宽时居中段只居中在自己那一格，整体随品牌名长度左偏）。
// 内容仍靠 justify-start 贴左，flex 项默认 min-width:auto 不会被压小 → 视觉不变。
export function NavbarBrand({ grow = true, className, children, ...props }: NavbarBrandProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 font-semibold text-foreground",
        grow ? "flex-1 basis-0 justify-start" : "shrink-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

const justifyClass = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
} as const;

export function NavbarContent({
  justify = "start",
  className,
  children,
  ...props
}: NavbarContentProps) {
  return (
    <ul
      className={cn("flex flex-1 items-center gap-2 sm:gap-4", justifyClass[justify], className)}
      {...props}
    >
      {children}
    </ul>
  );
}

export function NavbarItem({ isActive, className, children, ...props }: NavbarItemProps) {
  return (
    <li
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "cursor-pointer rounded-[min(var(--radius),0.375rem)] px-2 py-1 text-sm transition-colors",
        isActive ? "font-medium text-primary" : "text-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

export function NavbarMenuToggle({
  isOpen = false,
  onToggle,
  className,
  "aria-label": ariaLabel,
}: NavbarMenuToggleProps) {
  const labels = useComponentLocale().navbar ?? { openMenu: "打开菜单", closeMenu: "关闭菜单" };
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={ariaLabel ?? (isOpen ? labels.closeMenu : labels.openMenu)}
      className={cn(
        // size-11 = 44px：移动端专属控件（sm:hidden），满足触控目标 ≥44px
        "inline-flex size-11 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring sm:hidden",
        className,
      )}
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}
