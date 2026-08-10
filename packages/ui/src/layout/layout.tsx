import { Children, isValidElement } from "react";
import { cn } from "../lib/cn";
import { LayoutSider } from "./layout-sider";
import type {
  LayoutContentProps,
  LayoutFooterProps,
  LayoutHeaderProps,
  LayoutProps,
} from "./layout.types";

/**
 * 中后台整页布局外壳容器（纯皮肤·可 RSC）。
 * 自动探测：直接子元素含 Layout.Sider → 横向(flex-row)；否则纵向(flex-col)堆叠 Header/Content/Footer。
 * 自身 flex-auto，故嵌套时（如 Sider 右侧的 Header/Content/Footer 列）自动撑满父级剩余空间。
 * 默认 align-items:stretch → 横向时 Sider 自动等高，无需手写 h-full。
 */
function LayoutRoot({ hasSider, className, children, ...props }: LayoutProps) {
  const detected =
    hasSider ??
    Children.toArray(children).some((child) => isValidElement(child) && child.type === LayoutSider);
  return (
    <div
      data-layout=""
      data-direction={detected ? "horizontal" : "vertical"}
      className={cn(
        "flex min-h-0 min-w-0 flex-auto bg-bg",
        detected ? "flex-row" : "flex-col",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** 顶栏：surface 皮肤 + 下边框，可 sticky 吸顶。 */
function LayoutHeader({ sticky = false, className, children, ...props }: LayoutHeaderProps) {
  return (
    <header
      data-layout-header=""
      className={cn(
        "flex h-[var(--hl-layout-header-h)] shrink-0 items-center gap-4 border-b border-border bg-surface px-4 text-foreground sm:px-6",
        sticky && "sticky top-0 z-30",
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}

/** 主内容区：flex-auto 占满 + 可滚动。 */
function LayoutContent({ className, children, ...props }: LayoutContentProps) {
  return (
    <main
      data-layout-content=""
      className={cn("min-h-0 min-w-0 flex-auto overflow-auto bg-bg p-4 text-foreground sm:p-6", className)}
      {...props}
    >
      {children}
    </main>
  );
}

/** 底栏：muted 文本 + 上边框，居中常用于版权信息。 */
function LayoutFooter({ className, children, ...props }: LayoutFooterProps) {
  return (
    <footer
      data-layout-footer=""
      className={cn(
        "shrink-0 border-t border-border bg-surface px-4 py-4 text-center text-sm text-muted-foreground sm:px-6",
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

/**
 * 复合 Layout：`Layout` / `Layout.Header` / `Layout.Sider` / `Layout.Content` / `Layout.Footer`。
 * 同时具名导出各部件（LayoutHeader 等）便于按需 import。
 */
export const Layout = Object.assign(LayoutRoot, {
  Header: LayoutHeader,
  Sider: LayoutSider,
  Content: LayoutContent,
  Footer: LayoutFooter,
});

export { LayoutHeader, LayoutSider, LayoutContent, LayoutFooter };
