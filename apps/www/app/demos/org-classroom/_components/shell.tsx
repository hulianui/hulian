"use client";
import { copy } from "./shell.content";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
import {
  AdminLayout,
  Avatar,
  Button,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  StatusDot,
  useTheme,
  type AdminTab,
  type NavMenuItem,
  type RouteTabsAction,
} from "@hulianui/ui";
import { useOrg } from "../_lib/org-store";
import { MENU, NAV_LABEL, ROOT, hrefFromKey, keyFromPath } from "./nav-config";

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        {copy("brandMark")}
      </span>
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight">{copy("brand")}</span>}
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={copy("switchTheme")}
      className="size-9 px-0"
    >
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

function OnDutyPill() {
  const { stats } = useOrg();
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm sm:inline-flex">
      <StatusDot status="online" label={copy("onDuty")} extra={String(stats.statusCounts.idle)} />
    </span>
  );
}

function UserMenu() {
  const router = useRouter();
  return (
    <Menu>
      <MenuTrigger
        render={<Button variant="ghost" size="sm" aria-label={copy("account")} className="size-9 px-0" />}
      >
        <Avatar size="sm" fallback={copy("adminInitial")} />
      </MenuTrigger>
      <MenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium text-foreground">{copy("adminName")}</div>
          <div className="text-xs text-muted-foreground">{copy("adminRole")}</div>
        </div>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <UserRound className="size-4" />
          {copy("settings")}
        </MenuItem>
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <Settings className="size-4" />
          {copy("helpCenter")}
        </MenuItem>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(`${ROOT}/login`)}>
          <LogOut className="size-4" />
          {copy("logOut")}
        </MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function OrgShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = keyFromPath(pathname);

  // layout 不随子路由重挂 → tabs 状态跨页 persist。
  const [tabs, setTabs] = useState<AdminTab[]>([
    { key: active, label: NAV_LABEL[active] ?? active },
  ]);

  useEffect(() => {
    setTabs((prev) =>
      prev.some((tab) => tab.key === active)
        ? prev
        : [...prev, { key: active, label: NAV_LABEL[active] ?? active }],
    );
  }, [active]);

  const go = (key: string) => router.push(hrefFromKey(key));

  const onTabClose = (key: string) => {
    const remaining = tabs.filter((tab) => tab.key !== key);
    if (remaining.length === 0) {
      setTabs([{ key: "overview", label: NAV_LABEL.overview }]);
      if (key === active) go("overview");
      return;
    }
    setTabs(remaining);
    if (key === active) go(remaining[remaining.length - 1].key);
  };

  // 受控页签：右键的批量关闭必须由这里落地，否则菜单点了没反应。
  const onTabsAction = (action: RouteTabsAction, _tabKey: string, affectedKeys: string[]) => {
    if (action === "refresh") {
      router.refresh();
      return;
    }
    if (affectedKeys.length === 0) return;
    const remaining = tabs.filter((tab) => !affectedKeys.includes(tab.key));
    if (remaining.length === 0) {
      setTabs([{ key: "overview", label: NAV_LABEL.overview }]);
      if (active !== "overview") go("overview");
      return;
    }
    setTabs(remaining);
    if (affectedKeys.includes(active)) go(remaining[remaining.length - 1].key);
  };

  return (
    <AdminLayout
      menuItems={MENU}
      logo={<Logo />}
      logoCollapsed={<Logo collapsed />}
      breakpoint="md"
      defaultOpenKeys={["g-org", "g-ops", "g-config"]}
      selectedKey={active}
      activeKey={active}
      tabs={tabs}
      onMenuSelect={(key: string, _item: NavMenuItem) => go(key)}
      onTabChange={go}
      onTabClose={onTabClose}
      onTabsAction={onTabsAction}
      headerExtra={
        <div className="flex items-center gap-1.5">
          <OnDutyPill />
          <ThemeToggle />
          <UserMenu />
        </div>
      }
    >
      {children}
    </AdminLayout>
  );
}
