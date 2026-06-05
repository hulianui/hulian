import {
  LayoutDashboard,
  ListTree,
  Share2,
  Boxes,
  BellRing,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulian/ui";

export const ROOT = "/demos/hanhelm";

// key = 路由段（overview = index）。
export const NAV_LABEL: Record<string, string> = {
  overview: "调度总览",
  queue: "任务队列",
  routing: "智能路由",
  agents: "执行器池",
  alerts: "SLA 告警",
  settings: "设置",
  task: "任务详情",
};

const icon = (Comp: typeof LayoutDashboard): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: "调度总览", icon: icon(LayoutDashboard) },
  {
    type: "group",
    key: "g-dispatch",
    label: "调度",
    children: [
      { key: "queue", label: "任务队列", icon: icon(ListTree) },
      { key: "routing", label: "智能路由", icon: icon(Share2) },
    ],
  },
  {
    type: "group",
    key: "g-resource",
    label: "资源",
    children: [{ key: "agents", label: "执行器池", icon: icon(Boxes) }],
  },
  {
    type: "group",
    key: "g-ops",
    label: "运维",
    children: [
      { key: "alerts", label: "SLA 告警", icon: icon(BellRing) },
      { key: "settings", label: "设置", icon: icon(Settings) },
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
