import { Workflow, LayoutTemplate, Images } from "lucide-react";
import type { ComponentType } from "react";

export const ROOT = "/demos/ai-workflow";

export interface NavItem {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const NAV: NavItem[] = [
  { key: ROOT, label: "编排画布", icon: Workflow },
  { key: `${ROOT}/templates`, label: "模板库", icon: LayoutTemplate },
  { key: `${ROOT}/gallery`, label: "产物画廊", icon: Images },
];

/** 当前激活的导航 key。ROOT(画布)是 index 页须精确匹配；子页(模板/画廊)用前缀；
 *  非导航页(如 /profile)返回 undefined → 顶栏不误高亮"编排画布"。 */
export function activeKey(pathname: string): string | undefined {
  const others = NAV.filter((n) => n.key !== ROOT).map((n) => n.key);
  const hit = others.find((k) => pathname === k || pathname.startsWith(`${k}/`));
  if (hit) return hit;
  return pathname === ROOT ? ROOT : undefined;
}
