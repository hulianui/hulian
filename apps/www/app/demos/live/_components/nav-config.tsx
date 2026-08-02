import { copy } from "./nav-config.content";
import { MonitorPlay, ShoppingBag, BarChart3 } from "lucide-react";
import type { NavMenuNode, BreadcrumbItem } from "@hulianui/ui";
import { demoHref, demoLocationHref } from "../../_components/demo-locale";

export const LIVE_ROOT = demoHref("/demos/live");
const LIVE_LOCATION_ROOT = demoLocationHref("/demos/live");

/** 侧栏菜单（key 即路由）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-live",
    label: copy("goLive"),
    children: [{ key: LIVE_ROOT, label: copy("liveConsole"), icon: <MonitorPlay className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-ops",
    label: copy("operations"),
    children: [
      { key: `${LIVE_ROOT}/products`, label: copy("shoppingPanel"), icon: <ShoppingBag className="size-4" /> },
      { key: `${LIVE_ROOT}/review`, label: copy("performanceReview"), icon: <BarChart3 className="size-4" /> },
    ],
  },
];

const leafKeys = [`${LIVE_ROOT}/products`, `${LIVE_ROOT}/review`, LIVE_ROOT].sort((a, b) => b.length - a.length);

export function selectedKeyFor(pathname: string): string | undefined {
  return leafKeys.find((k) => pathname === k || pathname.startsWith(`${k}/`));
}

const META: Record<string, string> = {
  [LIVE_ROOT]: copy("liveConsole"),
  [`${LIVE_ROOT}/products`]: copy("shoppingPanel"),
  [`${LIVE_ROOT}/review`]: copy("performanceReview"),
};

export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === LIVE_ROOT) return [{ label: copy("liveConsole"), current: true }];
  const items: BreadcrumbItem[] = [{ label: copy("liveConsole"), href: LIVE_LOCATION_ROOT }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== LIVE_ROOT) {
    items.push({ label: META[selected] ?? "", current: true });
  }
  return items;
}

export function labelOf(key: string): string {
  return META[key] ?? copy("liveConsole");
}
