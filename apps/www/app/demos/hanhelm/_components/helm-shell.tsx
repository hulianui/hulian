"use client";
import { copy } from "./helm-shell.content";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun, LogOut, UserRound, BookText, Activity } from "lucide-react";
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
  StatusDot,
  useTheme,
} from "@hulianui/ui";
import { MENU, NAV_LABEL, ROOT, hrefFromKey, keyFromPath } from "./nav-config";

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">{copy("rudder")}</span>
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight">{copy("hanhelmHanhelm")}</span>}
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label={copy("switchThemes")} className="size-9 px-0">
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

function SchedulerPill() {
  return (
    <span className="hidden items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm sm:inline-flex">
      <Activity className="size-4 text-primary" />
      <span className="text-muted-foreground">{copy("schedulingEngines")}</span>
      <StatusDot status="online" label={copy("running")} />
    </span>
  );
}

function UserMenu() {
  const router = useRouter();
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" aria-label={copy("account")} className="size-9 px-0" />}>
        <Avatar size="sm" fallback={copy("rudder2")} />
      </MenuTrigger>
      <MenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium text-foreground">{copy("hanhelmOperationsTeam")}</div>
          <div className="text-xs text-muted-foreground">ops@hanhelm.cn</div>
        </div>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <UserRound className="size-4" />{copy("accountSettings")}</MenuItem>
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <BookText className="size-4" />{copy("importDocuments")}</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(`${ROOT}/login`)}>
          <LogOut className="size-4" />{copy("loggedOut")}</MenuItem>
      </MenuContent>
    </Menu>
  );
}

export function HanHelmShell({ children }: { children: ReactNode }) {
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
    <AdminLayout
      menuItems={MENU}
      logo={<Logo />}
      logoCollapsed={<Logo collapsed />}
      defaultOpenKeys={["g-dispatch", "g-resource", "g-ops"]}
      selectedKey={active}
      activeKey={active}
      tabs={tabs}
      onMenuSelect={(key: string, _item: NavMenuItem) => go(key)}
      onTabChange={go}
      onTabClose={onTabClose}
      headerExtra={
        <div className="flex items-center gap-1.5">
          <SchedulerPill />
          <ThemeToggle />
          <UserMenu />
        </div>
      }
    >
      {children}
    </AdminLayout>
  );
}
