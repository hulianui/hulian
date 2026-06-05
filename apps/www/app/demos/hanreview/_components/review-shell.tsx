"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
import { AdminLayout, Breadcrumb, Button, User, toast, useTheme, type AdminTab } from "@hulianui/ui";
import { HR_ROOT, breadcrumbFor, labelOf, menuItems, selectedKeyFor } from "./nav-config";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        瑚
      </span>
      <span className="truncate text-[15px] font-semibold tracking-tight">瀚审 HanReview</span>
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
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={theme === "dark" ? "切换到亮色" : "切换到暗色"}>
      {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </Button>
  );
}

function HeaderExtra() {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="icon"
        aria-label="通知"
        onClick={() => toast({ title: "暂无新通知", description: "门禁阻断、严重问题等提醒会在此汇总", tone: "neutral" })}
      >
        <Bell className="size-[18px]" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" aria-hidden />
      <User name="周明轩" description="研发负责人" avatarProps={{ fallback: "周" }} />
    </div>
  );
}

/** AdminLayout 受控 API 绑 Next 路由（照 CRM demo 范式）。 */
export function ReviewShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = selectedKeyFor(pathname) ?? HR_ROOT;

  const [tabs, setTabs] = useState<AdminTab[]>([{ key: HR_ROOT, label: labelOf(HR_ROOT) }]);
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
      if (prev.length <= 1) return prev;
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
