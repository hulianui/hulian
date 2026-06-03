import type { ReactNode } from "react";
import Link from "next/link";
import { ToastProvider, AnimatedThemeToggler } from "@hulian/ui";
import { ComponentTree } from "../../components/component-tree";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* 移动端顶部：bar + 可展开树 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link href="/" className="text-sm font-semibold">
            瑚琏 Hulian
          </Link>
          <AnimatedThemeToggler />
        </div>
        <details className="border-b border-border">
          <summary className="cursor-pointer px-4 py-2 text-sm text-muted">组件导航</summary>
          <div className="p-3">
            <ComponentTree />
          </div>
        </details>
      </div>

      {/* 桌面：两栏 app-shell —— 外壳定高不滚（h-dvh + overflow-hidden），
          仅侧栏树与内容区各自滚动且 overscroll-contain，body 不产生回弹 → overscroll 不露根层黑底 */}
      <div className="mx-auto hidden h-dvh max-w-7xl overflow-hidden md:flex">
        <aside className="flex w-60 shrink-0 flex-col border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <Link href="/" className="text-sm font-semibold">
              瑚琏 Hulian
            </Link>
            <AnimatedThemeToggler />
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain p-3">
            <ComponentTree />
          </div>
        </aside>
        <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain px-6 py-10">
          {children}
        </main>
      </div>

      {/* Toast 全局单挂：含 Viewport，命令式 toast() 在任意组件页触发都进此处（见 spec §3.2）。 */}
      <ToastProvider />
    </div>
  );
}
