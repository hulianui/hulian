import { copy } from "./nav-config.content";
import { LayoutGrid, Rocket, Globe, Settings, KeyRound } from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/hanship";

// key = 一级路由段（overview = index）。详情页（projects/[id]、deployments/[id]）归到父 key 高亮。
export const NAV_LABEL: Record<string, string> = {
  overview: copy("project"),
  projects: copy("projectOverview"),
  deployments: copy("deploymentHistory"),
  domains: copy("domainName"),
  env: copy("environmentVariables"),
  settings: copy("buildSettings"),
};

const icon = (Comp: typeof LayoutGrid): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: copy("project2"), icon: icon(LayoutGrid) },
  {
    type: "group",
    key: "g-deploy",
    label: copy("deploy"),
    children: [
      { key: "deployments", label: copy("deploymentHistory2"), icon: icon(Rocket) },
      { key: "domains", label: copy("domainName2"), icon: icon(Globe) },
    ],
  },
  {
    type: "group",
    key: "g-config",
    label: copy("configuration"),
    children: [
      { key: "env", label: copy("environmentVariables2"), icon: icon(KeyRound) },
      { key: "settings", label: copy("buildSettings2"), icon: icon(Settings) },
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
