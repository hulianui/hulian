"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, Wallet, LogOut, UserRound, BookText } from "lucide-react";
import {
  AdminLayout,
  type AdminTab,
  type NavMenuItem,
  Avatar,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  useTheme,
} from "@hulianui/ui";
import { MENU, NAV_LABEL, ROOT, hrefFromKey, keyFromPath } from "./nav-config";
import { account } from "../_data/usage";
import { formatUsd } from "../_lib/pricing";

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        枢
      </span>
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight">瀚枢 HanHub</span>}
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="切换主题" className="size-9 px-0">
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

function BalancePill() {
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm sm:inline-flex">
      <Wallet className="size-4 text-primary" />
      <span className="text-muted">余额</span>
      <span className="font-semibold tabular-nums text-foreground">{formatUsd(account.balanceUsd)}</span>
    </span>
  );
}

function UserMenu() {
  const router = useRouter();
  return (
    <Menu>
      <MenuTrigger
        render={<Button variant="ghost" size="sm" aria-label="账户" className="size-9 px-0" />}
      >
        <Avatar size="sm" fallback="瀚" />
      </MenuTrigger>
      <MenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium text-foreground">瀚枢团队</div>
          <div className="text-xs text-muted">ops@hanhub.cn</div>
        </div>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <UserRound className="size-4" /> 账户设置
        </MenuItem>
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <BookText className="size-4" /> 接入文档
        </MenuItem>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(`${ROOT}/login`)}>
          <LogOut className="size-4" /> 退出登录
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function HanHubShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = keyFromPath(pathname);

  // layout 不随子路由重挂 → tabs 状态可跨页 persist。
  const [tabs, setTabs] = useState<AdminTab[]>([{ key: active, label: NAV_LABEL[active] ?? active }]);

  useEffect(() => {
    setTabs((prev) =>
      prev.some((t) => t.key === active)
        ? prev
        : [...prev, { key: active, label: NAV_LABEL[active] ?? active }],
    );
  }, [active]);

  const go = (key: string) => router.push(hrefFromKey(key));

  const onTabClose = (key: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.key !== key);
      if (key === active && next.length) go(next[next.length - 1].key);
      return next;
    });
  };

  return (
    <div className="h-dvh">
      <AdminLayout
        menuItems={MENU}
        logo={<Logo />}
        logoCollapsed={<Logo collapsed />}
        defaultOpenKeys={["g-model", "g-usage", "g-ops"]}
        selectedKey={active}
        activeKey={active}
        tabs={tabs}
        onMenuSelect={(key: string, _item: NavMenuItem) => go(key)}
        onTabChange={go}
        onTabClose={onTabClose}
        headerExtra={
          <div className="flex items-center gap-1.5">
            <BalancePill />
            <ThemeToggle />
            <UserMenu />
          </div>
        }
      >
        {children}
      </AdminLayout>
    </div>
  );
}
