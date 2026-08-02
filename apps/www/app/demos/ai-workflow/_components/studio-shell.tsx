"use client";
import { copy } from "./studio-shell.content";
import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Moon,
  Settings,
  Sun,
  UserRound,
} from "lucide-react";
import {
  Avatar,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  cn,
  useTheme,
} from "@hulianui/ui";
import { NAV, ROOT, activeKey } from "./nav-config";

function Brand() {
  return (
    <Link href={ROOT} className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        {copy("coral")}
      </span>
      <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
        {copy("reefFlowStudio")}
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={theme === "dark" ? copy("switchToLight") : copy("switchToDark")}
      className="size-9 px-0"
    >
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

const NOTIFICATIONS = [
  { title: copy("vincentHighDefinitionEnlargementRunCompleted"), time: copy("twoMinutesAgo") },
  { title: copy("ofGeneratedQuotaRemainingThisMonth"), time: copy("oneHourAgo") },
  { title: copy("templateTucsonVideoHasBeenUpdated"), time: copy("yesterday") },
];

function Notifications() {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={copy("notifications")}
            className="relative size-9 px-0"
          />
        }
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger ring-2 ring-surface" />
      </MenuTrigger>
      <MenuContent align="end" className="w-72">
        <div className="px-2 py-1.5 text-xs font-medium text-muted">{copy("notifications")}</div>
        {NOTIFICATIONS.map((n) => (
          <MenuItem key={n.title} className="flex-col items-start gap-0.5">
            <span className="text-[13px] text-foreground">{n.title}</span>
            <span className="text-[11px] text-muted">{n.time}</span>
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem className="justify-center text-primary">{copy("seeAll")}</MenuItem>
      </MenuContent>
    </Menu>
  );
}

function AccountMenu() {
  const router = useRouter();
  return (
    <Menu>
      <MenuTrigger
        render={
          <button
            type="button"
            aria-label={copy("accountMenu")}
            className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-1.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Avatar fallback={copy("sue")} className="size-8" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13px] font-medium text-foreground">{copy("suYan")}</span>
          <span className="block text-[11px] text-muted">{copy("creativeDesigner")}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted md:block" />
      </MenuTrigger>
      <MenuContent align="end" className="w-56">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar fallback={copy("sue")} className="size-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{copy("suYan")}</div>
            <div className="truncate text-xs text-muted">suyan@hulian.design</div>
          </div>
        </div>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(`${ROOT}/profile`)}>
          <UserRound className="size-4" />
          {copy("profile")}
        </MenuItem>
        <MenuItem onClick={() => router.push(`${ROOT}/profile`)}>
          <Settings className="size-4" />
          {copy("accountSettings")}
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onClick={() => router.push(`${ROOT}/login`)}>
          <LogOut className="size-4" />
          {copy("logOut")}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

/** AI 工作流工作室外壳：顶栏（品牌 + 居中导航 + 主题/通知/账户），下方填满内容区。
 *  画布页自身是全幅交互区，故外壳不用 AdminLayout 侧栏，走轻顶栏。 */
export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = activeKey(pathname);

  return (
    // demos/layout 已移除顶部返回头条，工作室独占满屏视口（「返回示例库」改为悬浮 Fab，不占布局）。
    <div className="flex h-dvh flex-col bg-bg">
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
        <Brand />

        <nav className="flex items-center gap-1 rounded-full border border-border bg-surface p-1">
          {NAV.map((item) => {
            const on = active === item.key;
            return (
              <Link
                key={item.key}
                href={item.key}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  on
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-0.5">
          {/* 全屏工作室底部有运行面板，「返回示例库」改放顶栏（其余 demo 用悬浮 Fab，见 DemosChrome）。 */}
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/demos" />}
            className="gap-1.5 px-2.5"
          >
            <LayoutGrid className="size-4" />
            <span className="hidden lg:inline">{copy("backToSampleLibrary")}</span>
          </Button>
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
          <ThemeToggle />
          <Notifications />
          <div className="mx-1.5 hidden h-6 w-px bg-border sm:block" aria-hidden />
          <AccountMenu />
        </div>
      </header>

      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
