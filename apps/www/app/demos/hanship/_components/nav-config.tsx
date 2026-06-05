import { LayoutGrid, Rocket, Globe, Settings, KeyRound } from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/hanship";

// key = 一级路由段（overview = index）。详情页（projects/[id]、deployments/[id]）归到父 key 高亮。
export const NAV_LABEL: Record<string, string> = {
  overview: "项目",
  projects: "项目概览",
  deployments: "部署历史",
  domains: "域名",
  env: "环境变量",
  settings: "构建设置",
};

const icon = (Comp: typeof LayoutGrid): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: "项目", icon: icon(LayoutGrid) },
  {
    type: "group",
    key: "g-deploy",
    label: "部署",
    children: [
      { key: "deployments", label: "部署历史", icon: icon(Rocket) },
      { key: "domains", label: "域名", icon: icon(Globe) },
    ],
  },
  {
    type: "group",
    key: "g-config",
    label: "配置",
    children: [
      { key: "env", label: "环境变量", icon: icon(KeyRound) },
      { key: "settings", label: "构建设置", icon: icon(Settings) },
    ],
  },
];

/** 路由 → 菜单 key（详情页归父）。 */
export function keyFromPath(pathname: string): string {
  const rest = pathname.replace(ROOT, "").replace(/^\//, "");
  const seg = rest.split("/")[0];
  if (seg === "") return "overview";
  if (seg === "projects") return "overview";
  return seg;
}

/** 菜单 key → 路由。 */
export function hrefFromKey(key: string): string {
  return key === "overview" ? ROOT : `${ROOT}/${key}`;
}
