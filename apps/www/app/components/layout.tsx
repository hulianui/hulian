import type { ReactNode } from "react";
import Link from "next/link";
import { ToastProvider } from "@hulian/ui";
import { ComponentTree } from "../../components/component-tree";
import { ThemeToggle } from "../../components/theme-toggle";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* 移动端顶部：bar + 可展开树 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link href="/" className="text-sm font-semibold">
            瑚琏 Hulian
          </Link>
          <ThemeToggle />
        </div>
        <details className="border-b border-border">
          <summary className="cursor-pointer px-4 py-2 text-sm text-muted">组件导航</summary>
          <div className="p-3">
            <ComponentTree />
          </div>
        </details>
      </div>

      {/* 桌面：两栏 */}
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-border md:block">
          <div className="sticky top-0 flex h-dvh flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Link href="/" className="text-sm font-semibold">
                瑚琏 Hulian
              </Link>
              <ThemeToggle />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ComponentTree />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
      </div>

      {/* Toast 全局单挂：含 Viewport，命令式 toast() 在任意组件页触发都进此处（见 spec §3.2）。 */}
      <ToastProvider />
    </div>
  );
}
