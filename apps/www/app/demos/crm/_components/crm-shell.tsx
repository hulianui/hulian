"use client";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Moon, Sun } from "lucide-react";
import { AdminLayout, Breadcrumb, Button, User, toast, useTheme, type AdminTab } from "@hulian/ui";
import { CRM_ROOT, breadcrumbFor, labelOf, menuItems, selectedKeyFor } from "./nav-config";

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        瑚
      </span>
      <span className="truncate text-[15px] font-semibold tracking-tight">瑚琏 CRM</span>
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

function HeaderExtra() {
  return (
    <div className="flex items-center gap-1.5">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="sm"
        aria-label="通知"
        className="size-9 px-0"
        onClick={() => toast({ title: "暂无新通知", description: "新商机、跟进到期等提醒会在此汇总", tone: "neutral" })}
      >
        <Bell className="size-[18px]" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" aria-hidden />
      <User
        name="林晚晴"
        description="销售总监"
        avatarProps={{ fallback: "林", src: "https://i.pravatar.cc/80?img=47" }}
      />
    </div>
  );
}

/** 把 AdminLayout 的受控 API（选中/页签）绑到 Next 路由：菜单与页签点击 → router.push，
 *  selectedKey/activeKey 由 usePathname 推导，页签列表为访问历史（内存维护）。 */
export function CrmShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = selectedKeyFor(pathname) ?? CRM_ROOT;

  const [tabs, setTabs] = useState<AdminTab[]>([{ key: CRM_ROOT, label: labelOf(CRM_ROOT) }]);
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
