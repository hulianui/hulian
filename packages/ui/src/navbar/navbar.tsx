"use client";
import { Menu, X } from "../_icons";
import { cn } from "../lib/cn";
import type {
  NavbarProps,
  NavbarBrandProps,
  NavbarContentProps,
  NavbarItemProps,
  NavbarMenuProps,
  NavbarMenuToggleProps,
  NavbarBreakpoint,
} from "./navbar.types";
import { useComponentLocale } from "../config/locale-context";

// 复合导航栏皮肤（含可交互 MenuToggle 故 "use client"）。
// 布局/路由由消费者用子件组合，本件只负责皮肤与无障碍语义。
const NAV_SIZE = {
  md: "h-16 gap-4 px-4 sm:px-6",
  // 文档站 / 营销站的紧凑顶栏：56px，左右内距收一档
  sm: "h-14 gap-2 px-3 sm:px-5",
} as const;

const NAV_VARIANT = {
  // 卡面色半透明：中后台默认，顶栏是一块浮在内容上的面板
  surface: { bg: "bg-surface/80", border: "border-border" },
  // 页面底色半透明 + 更淡的分隔线：顶栏融进页面，营销 / 文档站用
  page: { bg: "bg-bg/75", border: "border-border/60" },
} as const;

export function Navbar({
  sticky = false,
  bordered = true,
  size = "md",
  variant = "surface",
  className,
  children,
  ...props
}: NavbarProps) {
  const v = NAV_VARIANT[variant];
  return (
    <nav
      className={cn(
        "flex w-full items-center backdrop-blur-md",
        NAV_SIZE[size],
        v.bg,
        bordered && cn("border-b", v.border),
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

const ITEM_VARIANT = {
  text: {
    base: "px-2 py-1",
    active: "font-medium text-primary",
    idle: "text-muted-foreground hover:text-foreground",
  },
  // 浅底药丸：选中项铺一层主色浅底，悬停铺中性浅底。项里放链接时整块都是点击区 ——
  // 内距挪到链接身上（li 自己归零），否则点到 li 的内边距那一圈不会跳转。
  soft: {
    base: "px-3 py-1.5 has-[>a]:p-0 [&>a]:block [&>a]:rounded-[inherit] [&>a]:px-3 [&>a]:py-1.5",
    active: "bg-primary-subtle font-medium text-primary",
    idle: "text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  },
} as const;

export function NavbarItem({
  isActive,
  variant = "text",
  className,
  children,
  ...props
}: NavbarItemProps) {
  const v = ITEM_VARIANT[variant];
  return (
    <li
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "cursor-pointer rounded-[min(var(--radius),0.375rem)] text-sm transition-colors",
        v.base,
        isActive ? v.active : v.idle,
        className,
      )}
      {...props}
    >
      {children}
    </li>
  );
}

// 静态类表：Tailwind 只认得源码里完整出现的类名，拼接出来的 `${bp}:hidden` 不会生成规则。
const HIDE_AT: Record<NavbarBreakpoint, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
};

export function NavbarMenuToggle({
  isOpen = false,
  onToggle,
  breakpoint = "sm",
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
        "inline-flex size-11 shrink-0 items-center justify-center rounded-[min(var(--radius),0.375rem)] text-foreground outline-none transition-colors hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring",
        HIDE_AT[breakpoint],
        className,
      )}
    >
      {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
    </button>
  );
}

// 窄屏折叠菜单：NavbarMenuToggle 展开后出现在顶栏下方的竖排导航项。
// 收起时不渲染（不是 display:none 藏着）：菜单里的链接不该在收起态被 Tab 到。
// breakpoint 与 NavbarMenuToggle 取同一档 —— 宽屏横排导航出现时菜单一起隐藏，
// 否则窄屏展开后拉宽窗口，横排与竖排会同时在屏上。
export function NavbarMenu({
  isOpen = false,
  breakpoint = "sm",
  className,
  children,
  ...props
}: NavbarMenuProps) {
  if (!isOpen) return null;
  return (
    <ul
      className={cn(
        "flex flex-col gap-1 border-b border-border bg-bg p-2",
        HIDE_AT[breakpoint],
        className,
      )}
      {...props}
    >
      {children}
    </ul>
  );
}
