import { copy } from "./nav-config.content";
import {
  LayoutDashboard,
  ListTree,
  Share2,
  Boxes,
  BellRing,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/hanhelm";

// key = 路由段（overview = index）。
export const NAV_LABEL: Record<string, string> = {
  overview: copy("overallDispatchOverview"),
  queue: copy("taskQueue"),
  routing: copy("intelligentRouting"),
  agents: copy("actuatorPool"),
  alerts: copy("slaAlert"),
  settings: copy("setup"),
  task: copy("missionDetails"),
};

const icon = (Comp: typeof LayoutDashboard): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: copy("overallDispatchOverview2"), icon: icon(LayoutDashboard) },
  {
    type: "group",
    key: "g-dispatch",
    label: copy("dispatch"),
    children: [
      { key: "queue", label: copy("taskQueue2"), icon: icon(ListTree) },
      { key: "routing", label: copy("intelligentRouting2"), icon: icon(Share2) },
    ],
  },
  {
    type: "group",
    key: "g-resource",
    label: copy("resources"),
    children: [{ key: "agents", label: copy("actuatorPool2"), icon: icon(Boxes) }],
  },
  {
    type: "group",
    key: "g-ops",
    label: copy("operationsAndMaintenance"),
    children: [
      { key: "alerts", label: copy("slaAlert2"), icon: icon(BellRing) },
      { key: "settings", label: copy("setup2"), icon: icon(Settings) },
    ],
  },
];

/** 路由 → 菜单 key。任务详情(queue/[id]) 归到 queue 高亮。 */
export function keyFromPath(pathname: string): string {
  const rest = pathname.replace(ROOT, "").replace(/^\//, "");
  const seg = rest.split("/")[0];
  if (seg === "") return "overview";
  return seg;
}

/** 菜单 key → 路由。 */
export function hrefFromKey(key: string): string {
  return key === "overview" ? ROOT : `${ROOT}/${key}`;
}
