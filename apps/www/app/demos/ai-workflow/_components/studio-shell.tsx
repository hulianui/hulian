"use client";
import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LayoutGrid, LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
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
        瑚
      </span>
      <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">瑚琏 Flow Studio</span>
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
      aria-label={theme === "dark" ? "切换到亮色" : "切换到暗色"}
      className="size-9 px-0"
    >
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

const NOTIFICATIONS = [
  { title: "「文生图 · 高清放大」运行完成", time: "2 分钟前" },
  { title: "本月生成额度剩余 68%", time: "1 小时前" },
  { title: "模板「图生视频」已更新", time: "昨天" },
];

function Notifications() {
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button variant="ghost" size="sm" aria-label="通知" className="relative size-9 px-0" />
        }
      >
        <Bell className="size-[18px]" />
        <span className="absolute right-2 top-2 size-1.5 rounded-full bg-danger ring-2 ring-surface" />
      </MenuTrigger>
      <MenuContent align="end" className="w-72">
        <div className="px-2 py-1.5 text-xs font-medium text-muted">通知</div>
        {NOTIFICATIONS.map((n) => (
          <MenuItem key={n.title} className="flex-col items-start gap-0.5">
            <span className="text-[13px] text-foreground">{n.title}</span>
            <span className="text-[11px] text-muted">{n.time}</span>
          </MenuItem>
        ))}
        <MenuSeparator />
        <MenuItem className="justify-center text-primary">查看全部</MenuItem>
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
            aria-label="账户菜单"
            className="flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-1.5 transition-colors hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        }
      >
        <Avatar fallback="苏" className="size-8" />
        <span className="hidden text-left leading-tight md:block">
          <span className="block text-[13px] font-medium text-foreground">苏砚</span>
          <span className="block text-[11px] text-muted">创意设计师</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted md:block" />
      </MenuTrigger>
      <MenuContent align="end" className="w-56">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar fallback="苏" className="size-9" />
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">苏砚</div>
            <div className="truncate text-xs text-muted">suyan@hulian.design</div>
          </div>
        </div>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(`${ROOT}/profile`)}>
          <UserRound className="size-4" />
          个人资料
        </MenuItem>
        <MenuItem onClick={() => router.push(`${ROOT}/profile`)}>
          <Settings className="size-4" />
          账户设置
        </MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onClick={() => router.push(`${ROOT}/login`)}>
          <LogOut className="size-4" />
          退出登录
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
                  on ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:text-foreground",
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
          <Button variant="ghost" size="sm" render={<Link href="/demos" />} className="gap-1.5 px-2.5">
            <LayoutGrid className="size-4" />
            <span className="hidden lg:inline">返回示例库</span>
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
