"use client";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { SafeArea, TabBar } from "@hulian/ui";

// 手机外壳图标（内联 SVG，零依赖 lucide，减小 bundle）
function HomeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="1em" height="1em" aria-hidden>
      <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}
function GridIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="1em" height="1em" aria-hidden>
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}
function ListOrderIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 13h8v1H8v-1zm0 3h5v1H8v-1zm0-6h3v1H8v-1z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="1em" height="1em" aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="10" y2="9" />
    </svg>
  );
}
function UserIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" aria-hidden>
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width="1em" height="1em" aria-hidden>
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const BASE = "/demos/mobile";

const TABS = [
  { key: `${BASE}`, label: "首页", icon: <HomeIcon />, activeIcon: <HomeIcon filled /> },
  { key: `${BASE}/categories`, label: "分类", icon: <GridIcon />, activeIcon: <GridIcon filled /> },
  { key: `${BASE}/orders`, label: "订单", icon: <ListOrderIcon />, activeIcon: <ListOrderIcon filled />, badge: 2 },
  { key: `${BASE}/profile`, label: "我的", icon: <UserIcon />, activeIcon: <UserIcon filled /> },
];

/** 手机外壳：桌面居中 390px 列 + 圆角手机 chrome + 模拟状态栏。
 *  内部：SafeArea(top) → 内容区 → 底部 TabBar。 */
export function MobileShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // 底部 tab 路由匹配（服务详情页不高亮任何 tab，保持首页选中）
  const activeTab =
    TABS.find((t) => t.key !== BASE && pathname.startsWith(t.key))?.key ??
    (pathname === BASE || pathname.startsWith(`${BASE}/services`) ? BASE : BASE);

  return (
    // 外层：桌面居中 + 手机宽度约束
    <div className="flex min-h-dvh items-start justify-center bg-gradient-to-br from-background to-surface-hover py-6 px-4">
      {/* 手机外壳 */}
      <div
        className="relative w-full max-w-[390px] overflow-hidden rounded-[2.5rem] border-[3px] border-border bg-surface shadow-2xl"
        style={{ minHeight: 720 }}
      >
        {/* 模拟刘海状态栏 */}
        <div className="flex items-center justify-between bg-surface px-5 pt-3 pb-1 text-xs text-muted select-none">
          <span className="font-medium">9:41</span>
          <div className="absolute left-1/2 top-2 -translate-x-1/2">
            <div className="h-1.5 w-20 rounded-full bg-foreground/20" />
          </div>
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden>
              <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
            </svg>
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden>
              <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" />
            </svg>
          </div>
        </div>

        {/* SafeArea top + 主内容 */}
        <SafeArea edges={["top"]} mode="padding" className="flex flex-col" style={{ minHeight: 640 }}>
          <main className="flex-1 overflow-hidden">{children}</main>
        </SafeArea>

        {/* 底部 TabBar */}
        <TabBar
          items={TABS}
          value={activeTab}
          onChange={(key) => router.push(key)}
          safeArea
          fixed={false}
        />
      </div>
    </div>
  );
}
