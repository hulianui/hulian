import {
  LayoutDashboard,
  Boxes,
  KeyRound,
  ScrollText,
  TerminalSquare,
  Activity,
  Wallet,
  Settings,
} from "lucide-react";
import type { ReactNode } from "react";
import type { NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/hanhub";

// key = 路由段（overview = index）。
export const NAV_LABEL: Record<string, string> = {
  overview: "概览",
  models: "模型市场",
  playground: "Playground",
  logs: "用量日志",
  billing: "计费充值",
  health: "健康探测",
  keys: "API 密钥",
  settings: "接入设置",
};

const icon = (Comp: typeof LayoutDashboard): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: "概览", icon: icon(LayoutDashboard) },
  {
    type: "group",
    key: "g-model",
    label: "模型与调试",
    children: [
      { key: "models", label: "模型市场", icon: icon(Boxes) },
      { key: "playground", label: "Playground", icon: icon(TerminalSquare) },
    ],
  },
  {
    type: "group",
    key: "g-usage",
    label: "用量与计费",
    children: [
      { key: "logs", label: "用量日志", icon: icon(ScrollText) },
      { key: "billing", label: "计费充值", icon: icon(Wallet) },
    ],
  },
  {
    type: "group",
    key: "g-ops",
    label: "网关运维",
    children: [
      { key: "health", label: "健康探测", icon: icon(Activity) },
      { key: "keys", label: "API 密钥", icon: icon(KeyRound) },
      { key: "settings", label: "接入设置", icon: icon(Settings) },
    ],
  },
];

/** 路由 → 菜单 key。 */
export function keyFromPath(pathname: string): string {
  const rest = pathname.replace(ROOT, "").replace(/^\//, "");
  const seg = rest.split("/")[0];
  return seg === "" ? "overview" : seg;
}

/** 菜单 key → 路由。 */
export function hrefFromKey(key: string): string {
  return key === "overview" ? ROOT : `${ROOT}/${key}`;
}
