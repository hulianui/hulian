import { copy } from "./nav-config.content";
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
  overview: copy("overview"),
  models: copy("modelMarket"),
  playground: "Playground",
  logs: copy("usageLog"),
  billing: copy("billedRecharge"),
  health: copy("healthDetection"),
  keys: copy("apiKey"),
  settings: copy("accessSettings"),
};

const icon = (Comp: typeof LayoutDashboard): ReactNode => <Comp className="size-4" />;

export const MENU: NavMenuNode[] = [
  { key: "overview", label: copy("overview2"), icon: icon(LayoutDashboard) },
  {
    type: "group",
    key: "g-model",
    label: copy("modelingAndDebugging"),
    children: [
      { key: "models", label: copy("modelMarket2"), icon: icon(Boxes) },
      { key: "playground", label: "Playground", icon: icon(TerminalSquare) },
    ],
  },
  {
    type: "group",
    key: "g-usage",
    label: copy("usageAndBilling"),
    children: [
      { key: "logs", label: copy("usageLog2"), icon: icon(ScrollText) },
      { key: "billing", label: copy("billedRecharge2"), icon: icon(Wallet) },
    ],
  },
  {
    type: "group",
    key: "g-ops",
    label: copy("gatewayOperationAndMaintenance"),
    children: [
      { key: "health", label: copy("healthDetection2"), icon: icon(Activity) },
      { key: "keys", label: copy("apiKey2"), icon: icon(KeyRound) },
      { key: "settings", label: copy("accessSettings2"), icon: icon(Settings) },
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
