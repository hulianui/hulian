import { MonitorPlay, ShoppingBag, BarChart3 } from "lucide-react";
import type { NavMenuNode, BreadcrumbItem } from "@hulianui/ui";

export const LIVE_ROOT = "/demos/live";

/** 侧栏菜单（key 即路由）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-live",
    label: "开播",
    children: [{ key: LIVE_ROOT, label: "直播中控", icon: <MonitorPlay className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-ops",
    label: "运营",
    children: [
      { key: `${LIVE_ROOT}/products`, label: "小黄车", icon: <ShoppingBag className="size-4" /> },
      { key: `${LIVE_ROOT}/review`, label: "数据复盘", icon: <BarChart3 className="size-4" /> },
    ],
  },
];

const leafKeys = [`${LIVE_ROOT}/products`, `${LIVE_ROOT}/review`, LIVE_ROOT].sort((a, b) => b.length - a.length);

export function selectedKeyFor(pathname: string): string | undefined {
  return leafKeys.find((k) => pathname === k || pathname.startsWith(`${k}/`));
}

const META: Record<string, string> = {
  [LIVE_ROOT]: "直播中控",
  [`${LIVE_ROOT}/products`]: "小黄车",
  [`${LIVE_ROOT}/review`]: "数据复盘",
};

export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === LIVE_ROOT) return [{ label: "直播中控", current: true }];
  const items: BreadcrumbItem[] = [{ label: "直播中控", href: LIVE_ROOT }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== LIVE_ROOT) {
    items.push({ label: META[selected] ?? "", current: true });
  }
  return items;
}

export function labelOf(key: string): string {
  return META[key] ?? "直播中控";
}
