import { Armchair, Building2, CalendarClock, LayoutDashboard, Settings, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulianui/ui";
import { copy } from "./nav-config.content";

export const ROOT = "/demos/org-classroom";

/** 菜单 key = 一级路由段，index 用 overview。 */
export const NAV_LABEL: Record<string, string> = {
  overview: copy("overview"),
  floor: copy("floor"),
  people: copy("people"),
  interviews: copy("interviews"),
  departments: copy("departments"),
  settings: copy("settings"),
};

const icon = (Comp: typeof LayoutDashboard): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  {
    type: "group",
    key: "g-org",
    label: copy("groupOrg"),
    children: [
      { key: "overview", label: copy("overview"), icon: icon(LayoutDashboard) },
      { key: "floor", label: copy("floor"), icon: icon(Armchair) },
      { key: "people", label: copy("people"), icon: icon(Users) },
    ],
  },
  {
    type: "group",
    key: "g-ops",
    label: copy("groupOps"),
    children: [{ key: "interviews", label: copy("interviews"), icon: icon(CalendarClock) }],
  },
  {
    type: "group",
    key: "g-config",
    label: copy("groupConfig"),
    children: [
      { key: "departments", label: copy("departments"), icon: icon(Building2) },
      { key: "settings", label: copy("settings"), icon: icon(Settings) },
    ],
  },
];

/** 路由 → 菜单 key。 */
export function keyFromPath(pathname: string): string {
  const rest = pathname.replace(ROOT, "").replace(/^\//, "");
  const segment = rest.split("/")[0];
  return segment === "" ? "overview" : segment;
}

/** 菜单 key → 路由。 */
export function hrefFromKey(key: string): string {
  return key === "overview" ? ROOT : `${ROOT}/${key}`;
}
