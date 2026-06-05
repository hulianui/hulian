import { LayoutDashboard, GitPullRequest, ListChecks, ShieldCheck, Network, Settings } from "lucide-react";
import type { NavMenuNode, BreadcrumbItem } from "@hulianui/ui";

export const HR_ROOT = "/demos/hanreview";

/** 侧栏菜单（key 即路由）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-overview",
    label: "概览",
    children: [{ key: HR_ROOT, label: "代码健康总览", icon: <LayoutDashboard className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-review",
    label: "审查",
    children: [
      { key: `${HR_ROOT}/reviews`, label: "审查队列", icon: <GitPullRequest className="size-4" /> },
      { key: `${HR_ROOT}/findings`, label: "问题中心", icon: <ListChecks className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-policy",
    label: "策略",
    children: [
      { key: `${HR_ROOT}/gates`, label: "质量门禁", icon: <ShieldCheck className="size-4" /> },
      { key: `${HR_ROOT}/routing`, label: "智能路由", icon: <Network className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-system",
    label: "系统",
    children: [{ key: `${HR_ROOT}/settings`, label: "设置", icon: <Settings className="size-4" /> }],
  },
];

const leafKeys = [
  `${HR_ROOT}/reviews`,
  `${HR_ROOT}/findings`,
  `${HR_ROOT}/gates`,
  `${HR_ROOT}/routing`,
  `${HR_ROOT}/settings`,
  HR_ROOT,
].sort((a, b) => b.length - a.length);

/** 当前路径 → 高亮菜单 key（最长前缀，覆盖详情页 /reviews/[id]）。 */
export function selectedKeyFor(pathname: string): string | undefined {
  return leafKeys.find((k) => pathname === k || pathname.startsWith(`${k}/`));
}

const META: Record<string, string> = {
  [HR_ROOT]: "代码健康总览",
  [`${HR_ROOT}/reviews`]: "审查队列",
  [`${HR_ROOT}/findings`]: "问题中心",
  [`${HR_ROOT}/gates`]: "质量门禁",
  [`${HR_ROOT}/routing`]: "智能路由",
  [`${HR_ROOT}/settings`]: "设置",
};

export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === HR_ROOT) return [{ label: "代码健康总览", current: true }];
  const items: BreadcrumbItem[] = [{ label: "总览", href: HR_ROOT }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== HR_ROOT) {
    const isLeaf = pathname === selected;
    items.push({ label: META[selected] ?? "", href: isLeaf ? undefined : selected, current: isLeaf });
  }
  if (selected === `${HR_ROOT}/reviews` && pathname !== `${HR_ROOT}/reviews`) {
    items.push({ label: "审查详情", current: true });
  }
  return items;
}

export function labelOf(key: string): string {
  return META[key] ?? "代码健康总览";
}

export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected === `${HR_ROOT}/reviews` && pathname !== selected) return "审查详情";
  return (selected && META[selected]) || "代码健康总览";
}
