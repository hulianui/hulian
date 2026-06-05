import { MessagesSquare, Ticket, BookOpen, BarChart3, Settings } from "lucide-react";
import type { NavMenuNode, BreadcrumbItem } from "@hulianui/ui";

export const CS_ROOT = "/demos/customer-service";

/** 侧栏菜单（key 即路由，分组不可折叠）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-desk",
    label: "工作台",
    children: [{ key: CS_ROOT, label: "会话工作台", icon: <MessagesSquare className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-service",
    label: "服务",
    children: [
      { key: `${CS_ROOT}/tickets`, label: "工单管理", icon: <Ticket className="size-4" /> },
      { key: `${CS_ROOT}/knowledge`, label: "知识库", icon: <BookOpen className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-analytics",
    label: "分析",
    children: [{ key: `${CS_ROOT}/analytics`, label: "数据看板", icon: <BarChart3 className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-system",
    label: "系统",
    children: [{ key: `${CS_ROOT}/settings`, label: "客服设置", icon: <Settings className="size-4" /> }],
  },
];

/** 叶子路由 key（按路径长度降序，供「最长前缀」选中匹配，覆盖 /tickets/[id]）。 */
const leafKeys = [
  `${CS_ROOT}/tickets`,
  `${CS_ROOT}/knowledge`,
  `${CS_ROOT}/analytics`,
  `${CS_ROOT}/settings`,
  CS_ROOT,
].sort((a, b) => b.length - a.length);

export function selectedKeyFor(pathname: string): string | undefined {
  return leafKeys.find((k) => pathname === k || pathname.startsWith(`${k}/`));
}

const META: Record<string, string> = {
  [CS_ROOT]: "会话工作台",
  [`${CS_ROOT}/tickets`]: "工单管理",
  [`${CS_ROOT}/knowledge`]: "知识库",
  [`${CS_ROOT}/analytics`]: "数据看板",
  [`${CS_ROOT}/settings`]: "客服设置",
};

/** 顶栏面包屑：工作台 → 当前页（工单详情页追加「工单详情」）。 */
export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === CS_ROOT) return [{ label: "会话工作台", current: true }];
  const items: BreadcrumbItem[] = [{ label: "会话工作台", href: CS_ROOT }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== CS_ROOT) {
    const isLeaf = pathname === selected;
    items.push({ label: META[selected] ?? "", href: isLeaf ? undefined : selected, current: isLeaf });
  }
  if (selected === `${CS_ROOT}/tickets` && pathname !== `${CS_ROOT}/tickets`) {
    items.push({ label: "工单详情", current: true });
  }
  return items;
}

/** 菜单 key → 标签（页签 label 用）。 */
export function labelOf(key: string): string {
  return META[key] ?? "会话工作台";
}

/** 当前页标题。 */
export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected === `${CS_ROOT}/tickets` && pathname !== selected) return "工单详情";
  return (selected && META[selected]) || "会话工作台";
}
