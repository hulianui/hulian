"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Moon, Smartphone, Sun } from "lucide-react";
import {
  AdminLayout,
  Breadcrumb,
  Button,
  User,
  useTheme,
  type AdminTab,
} from "@hulian/ui";
import { LIVE_ROOT, breadcrumbFor, labelOf, menuItems, selectedKeyFor } from "./nav-config";

function Brand() {
  return (
    <Link href={LIVE_ROOT} className="flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
        瀚
      </span>
      <span className="text-[15px] font-semibold tracking-tight">瀚播 HanLive</span>
    </Link>
  );
}

function BrandMark() {
  return (
    <span className="grid size-7 place-items-center rounded-[var(--radius)] bg-primary text-sm font-bold text-primary-foreground">
      瀚
    </span>
  );
}

function HeaderExtra() {
  const { theme, toggle } = useTheme();
  return (
    <div className="flex items-center gap-1.5">
      <span className="flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-xs font-medium text-danger">
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-danger/70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-danger" />
        </span>
        直播中 · 02:14:08
      </span>
      <Button variant="outline" size="sm" render={<Link href={`${LIVE_ROOT}/room`} />} className="gap-1.5">
        <Smartphone className="size-4" />
        <span className="hidden sm:inline">观众端</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        aria-label={theme === "dark" ? "切换到亮色" : "切换到暗色"}
        className="size-9 px-0"
      >
        {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      </Button>
      <div className="mx-0.5 h-6 w-px bg-border" aria-hidden />
      <User name="阿楠" description="带货主播" avatarProps={{ fallback: "楠" }} />
    </div>
  );
}

/** 瀚播主播中控外壳：AdminLayout 侧栏 + 受控页签绑路由（参照 CrmShell）。 */
export function StudioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const selected = selectedKeyFor(pathname) ?? LIVE_ROOT;

  const [tabs, setTabs] = useState<AdminTab[]>([{ key: LIVE_ROOT, label: labelOf(LIVE_ROOT) }]);
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
      if (key === selected && next.length) router.push(next[Math.min(idx, next.length - 1)].key);
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
