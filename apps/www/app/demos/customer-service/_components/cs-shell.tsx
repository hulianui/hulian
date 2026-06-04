"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { AdminLayout, Breadcrumb, Button, Segmented, useTheme, type AdminTab } from "@hulian/ui";
import { CS_ROOT, breadcrumbFor, labelOf, menuItems, selectedKeyFor } from "./nav-config";
import { NotificationBell } from "./notification-bell";
import { AccountMenu } from "./account-menu";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        瑚
      </span>
      <span className="truncate text-[15px] font-semibold tracking-tight">瑚琏客服</span>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
      瑚
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
      aria-label={theme === "dark" ? "切换到亮色" : "切换到暗色"}
      className="size-9 px-0"
    >
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

const STATUS_DOT: Record<string, string> = {
  online: "bg-success",
  busy: "bg-warning",
  away: "bg-muted",
};

function HeaderExtra() {
  const [status, setStatus] = useState("online");
  return (
    <div className="flex items-center gap-2">
      {/* 坐席在线状态切换 */}
      <span className="hidden items-center gap-1.5 sm:flex">
        <span className={`size-2 rounded-full ${STATUS_DOT[status]}`} aria-hidden />
        <Segmented
          size="sm"
          aria-label="坐席状态"
          value={status}
          onValueChange={setStatus}
          items={[
            { value: "online", label: "在线" },
            { value: "busy", label: "忙碌" },
            { value: "away", label: "小休" },
          ]}
        />
      </span>
      <ThemeToggle />
      <NotificationBell />
      <div className="mx-1 h-6 w-px bg-border" aria-hidden />
      <AccountMenu />
    </div>
  );
}

/** AdminLayout 受控 API 绑 Next 路由（与 crm-shell 同模式）：菜单/页签点击 → router.push，
 *  selectedKey/activeKey 由 usePathname 推导，页签列表为访问历史（内存维护）。 */
export function CsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = selectedKeyFor(pathname) ?? CS_ROOT;

  const [tabs, setTabs] = useState<AdminTab[]>([{ key: CS_ROOT, label: labelOf(CS_ROOT) }]);
  useEffect(() => {
    setTabs((prev) =>
      prev.some((t) => t.key === selected) ? prev : [...prev, { key: selected, label: labelOf(selected) }],
    );
  }, [selected]);

  const go = (key: string) => {
    if (key !== pathname) router.push(key);
  };

  const closeTab = (key: string) => {
    setTabs((prev) => {
      if (prev.length <= 1) return prev; // 末个不可关
      const idx = prev.findIndex((t) => t.key === key);
      const next = prev.filter((t) => t.key !== key);
      if (key === selected && next.length) {
        const neighbor = next[Math.min(idx, next.length - 1)];
        router.push(neighbor.key);
      }
      return next;
    });
  };

  return (
    <AdminLayout
      menuItems={menuItems}
      logo={<Brand />}
      logoCollapsed={<BrandMark />}
      selectedKey={selected}
      onMenuSelect={(key) => go(key)}
      tabs={tabs}
      activeKey={selected}
      onTabChange={(key) => go(key)}
      onTabClose={closeTab}
      breadcrumb={<Breadcrumb items={breadcrumbFor(pathname)} />}
      headerExtra={<HeaderExtra />}
    >
      {children}
    </AdminLayout>
  );
}
