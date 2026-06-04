"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
import { AdminLayout, Breadcrumb, Button, User, useTheme, type AdminTab } from "@hulian/ui";
import { ROOT, breadcrumbFor, labelOf, menuItems, selectedKeyFor } from "./nav-config";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        筑
      </span>
      <span className="truncate text-[15px] font-semibold tracking-tight">瑚琏 · 工程协同</span>
    </div>
  );
}

function BrandMark() {
  return (
    <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
      筑
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

function HeaderExtra() {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <Button variant="ghost" size="sm" aria-label="通知" className="size-9 px-0">
        <Bell className="size-[18px]" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" aria-hidden />
      <User
        name="陈工"
        description="工程项目经理"
        avatarProps={{ fallback: "陈", src: "/demo/avatar-3.jpg" }}
      />
    </div>
  );
}

/** 绑 AdminLayout 受控 API ↔ Next 路由：菜单/页签点击 → router.push，选中由 usePathname 推导，
 *  页签为访问历史（内存维护）。镜像 CRM demo 的 CrmShell。 */
export function ProjectsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = selectedKeyFor(pathname) ?? ROOT;

  const [tabs, setTabs] = useState<AdminTab[]>([{ key: ROOT, label: labelOf(ROOT) }]);
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
