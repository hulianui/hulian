"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatedThemeToggler,
  Avatar,
  Badge,
  Tag,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@hulian/ui";
import { Menu, X, ChevronLeft, ArrowUpRight } from "lucide-react";
import { account } from "../_data/account";
import { planById, formatMoney } from "../_data/plans";
import { BillingStoreProvider, useBilling } from "../_lib/billing-store";
import { BILLING_BASE, brand, nav } from "./nav-config";

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark() {
  return (
    <Link href={BILLING_BASE} className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-[var(--radius)] bg-primary font-semibold text-primary-foreground shadow-sm">
        瀚
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight text-foreground">
          {brand.name}
          <span className="ml-1 text-xs font-normal text-muted">{brand.nameEn}</span>
        </span>
        <span className="mt-1 text-[11px] text-muted">{brand.slogan}</span>
      </span>
    </Link>
  );
}

// 侧栏底部：当前订阅迷你卡。
function PlanBadge() {
  const { planId, monthlyTotal } = useBilling();
  const plan = planById[planId];
  return (
    <Link
      href={`${BILLING_BASE}/plans`}
      className="group block rounded-[var(--radius)] border border-border bg-surface p-3 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">当前订阅</span>
        <Tag tone="brand" size="sm">
          {plan?.nameEn}
        </Tag>
      </div>
      <div className="mt-1.5 flex items-baseline gap-1">
        <span className="text-lg font-semibold tabular-nums text-foreground">{formatMoney(monthlyTotal)}</span>
        <span className="text-xs text-muted">/ 月</span>
      </div>
      <span className="mt-1 inline-flex items-center gap-0.5 text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
        管理套餐 <ArrowUpRight className="size-3" />
      </span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active = isActive(pathname, item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={[
              "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted hover:bg-surface-hover hover:text-foreground",
            ].join(" ")}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-1 pt-1">
        <BrandMark />
      </div>
      <NavList onNavigate={onNavigate} />
      <div className="mt-auto flex flex-col gap-3">
        <PlanBadge />
        <Link
          href="/demos"
          className="flex items-center gap-1.5 px-1 text-xs text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" /> 返回 Demo 画廊
        </Link>
      </div>
    </div>
  );
}

function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const current = nav.find((n) => isActive(pathname, n.href, n.exact));
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/85 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenu}
          aria-label="打开导航"
          className="grid size-9 place-items-center rounded-[var(--radius)] text-muted hover:bg-surface-hover hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground">{current?.label ?? "瀚付"}</h1>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="hidden sm:flex">
                <AnimatedThemeToggler />
              </span>
            }
          />
          <TooltipContent>切换主题</TooltipContent>
        </Tooltip>
        <Badge dot tone="success" placement="top-right" offset={[-2, 4]}>
          <Avatar size="sm" fallback={account.avatar} />
        </Badge>
        <span className="hidden flex-col leading-tight sm:flex">
          <span className="text-sm font-medium text-foreground">{account.name}</span>
          <span className="text-[11px] text-muted">{account.email}</span>
        </span>
      </div>
    </header>
  );
}

/** 瀚付控制台外壳：侧栏 + 顶栏 + 共享内存态，被 (app) 路由组 layout 套在所有页上。 */
export function BillingShell({ children }: { children: ReactNode }) {
  const [drawer, setDrawer] = useState(false);
  return (
    <BillingStoreProvider>
      <div className="flex min-h-dvh bg-bg">
        {/* 桌面固定侧栏 */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border bg-surface/40 md:block">
          <Sidebar />
        </aside>

        {/* 移动抽屉侧栏 */}
        {drawer && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawer(false)}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 w-72 border-r border-border bg-surface shadow-xl">
              <button
                type="button"
                onClick={() => setDrawer(false)}
                aria-label="关闭导航"
                className="absolute right-3 top-3 grid size-8 place-items-center rounded-[var(--radius)] text-muted hover:bg-surface-hover"
              >
                <X className="size-4" />
              </button>
              <Sidebar onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenu={() => setDrawer(true)} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </BillingStoreProvider>
  );
}
