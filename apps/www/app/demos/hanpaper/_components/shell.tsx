"use client";
import { copy } from "./shell.content";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut, Moon, Search, Sun, UserRound } from "lucide-react";
import {
  AdminLayout,
  type AdminTab,
  type NavMenuItem,
  Avatar,
  Button,
  Command,
  type CommandGroupData,
  Kbd,
  Menu,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  Tag,
  useTheme,
} from "@hulianui/ui";
import { Tip } from "./tip";
import { AUTHORS, papers } from "../_data/papers";
import { MENU, NAV_LABEL, ROOT, hrefFromKey, keyFromPath } from "./nav-config";

function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-7 shrink-0 place-items-center rounded-[var(--radius)] bg-primary font-serif text-sm font-bold text-primary-foreground">
        {copy("brandMark")}
      </span>
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight">{copy("brandName")}</span>}
    </span>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <Tip label={copy("switchTheme")}>
      <Button variant="ghost" size="sm" onClick={toggle} aria-label={copy("switchTheme")} className="size-9 px-0">
        {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
      </Button>
    </Tip>
  );
}

function UserMenu() {
  const router = useRouter();
  return (
    <Menu>
      <MenuTrigger render={<Button variant="ghost" size="sm" aria-label={copy("account")} className="size-9 px-0" />}>
        <Avatar size="sm" fallback={AUTHORS.lin.slice(0, 1)} />
      </MenuTrigger>
      <MenuContent align="end" className="w-52">
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium text-foreground">{AUTHORS.lin}</div>
          <div className="text-xs text-muted-foreground">lin@hanpaper.dev</div>
        </div>
        <MenuSeparator />
        <MenuItem onClick={() => router.push(hrefFromKey("settings"))}>
          <UserRound className="size-4" />
          {copy("profile")}
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

/** ⌘K palette: jump to any paper or page. */
function SearchPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const groups = useMemo<CommandGroupData[]>(
    () => [
      {
        heading: copy("commandPapers"),
        items: papers.map((p) => ({
          value: `paper:${p.id}`,
          label: p.title,
          keywords: `${p.title} ${p.venue}`,
          description: p.venue,
          icon: <FileText className="size-4" />,
          onSelect: () => router.push(p.hasManuscript ? `${ROOT}/papers/${p.id}` : ROOT),
        })),
      },
      {
        heading: copy("commandPages"),
        items: MENU.flatMap((node) => ("children" in node && node.children ? node.children : [node])).map((node) => ({
          value: `page:${node.key}`,
          label: NAV_LABEL[node.key] ?? node.key,
          icon: "icon" in node ? node.icon : undefined,
          onSelect: () => router.push(hrefFromKey(node.key)),
        })),
      },
    ],
    [router],
  );
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="hidden w-64 justify-between text-muted-foreground md:inline-flex">
        <span className="inline-flex items-center gap-2">
          <Search className="size-4" />
          {copy("searchPlaceholder")}
        </span>
        <Kbd tone="primary">⌘K</Kbd>
      </Button>
      <Tip label={copy("openCommand")}>
        <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label={copy("openCommand")} className="size-9 px-0 md:hidden">
          <Search className="size-[18px]" />
        </Button>
      </Tip>
      <Command
        open={open}
        onOpenChange={setOpen}
        shortcut
        groups={groups}
        placeholder={copy("searchPlaceholder")}
        emptyMessage={copy("commandEmpty")}
      />
    </>
  );
}

function DeadlinePill() {
  const next = papers
    .filter((p) => p.deadlineDays !== null && p.stage !== "published")
    .sort((a, b) => (a.deadlineDays ?? 0) - (b.deadlineDays ?? 0))[0];
  if (!next?.deadlineDays) return null;
  return (
    <Tag tone={next.deadlineDays <= 7 ? "danger" : "warning"} size="sm" dot pulse className="hidden lg:inline-flex">
      {copy("deadlineSoon", next.deadlineDays)}
    </Tag>
  );
}

export function HanPaperShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const active = keyFromPath(pathname);

  // The layout survives route changes, so opened tabs persist across pages.
  const [tabs, setTabs] = useState<AdminTab[]>([{ key: active, label: NAV_LABEL[active] ?? active }]);
  useEffect(() => {
    setTabs((prev) => (prev.some((t) => t.key === active) ? prev : [...prev, { key: active, label: NAV_LABEL[active] ?? active }]));
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
      defaultOpenKeys={["g-writing", "g-publishing"]}
      selectedKey={active}
      activeKey={active}
      tabs={tabs}
      onMenuSelect={(key: string, _item: NavMenuItem) => go(key)}
      onTabChange={go}
      onTabClose={onTabClose}
      headerExtra={
        <div className="flex items-center gap-1.5">
          <DeadlinePill />
          <SearchPalette />
          <ThemeToggle />
          <UserMenu />
        </div>
      }
    >
      {children}
    </AdminLayout>
  );
}
