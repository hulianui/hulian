import { copy } from "./nav-config.content";
import { MessagesSquare, Ticket, BookOpen, BarChart3, Settings } from "lucide-react";
import type { NavMenuNode, BreadcrumbItem } from "@hulianui/ui";
import { demoHref } from "../../_components/demo-locale";

export const CS_ROOT = "/demos/customer-service";

/** 侧栏菜单（key 即路由，分组不可折叠）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-desk",
    label: copy("workbench"),
    children: [{ key: CS_ROOT, label: copy("sessionWorkbench"), icon: <MessagesSquare className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-service",
    label: copy("service"),
    children: [
      { key: `${CS_ROOT}/tickets`, label: copy("workOrderManagement"), icon: <Ticket className="size-4" /> },
      { key: `${CS_ROOT}/knowledge`, label: copy("knowledgeBase"), icon: <BookOpen className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-analytics",
    label: copy("analysis"),
    children: [{ key: `${CS_ROOT}/analytics`, label: copy("dataDashboard"), icon: <BarChart3 className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-system",
    label: copy("system"),
    children: [{ key: `${CS_ROOT}/settings`, label: copy("customerServiceSettings"), icon: <Settings className="size-4" /> }],
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
  [CS_ROOT]: copy("sessionWorkbench2"),
  [`${CS_ROOT}/tickets`]: copy("workOrderManagement2"),
  [`${CS_ROOT}/knowledge`]: copy("knowledgeBase2"),
  [`${CS_ROOT}/analytics`]: copy("dataDashboard2"),
  [`${CS_ROOT}/settings`]: copy("customerServiceSettings2"),
};

/** 顶栏面包屑：工作台 → 当前页（工单详情页追加「工单详情」）。 */
export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === CS_ROOT) return [{ label: copy("sessionWorkbench3"), current: true }];
  const items: BreadcrumbItem[] = [{ label: copy("sessionWorkbench4"), href: demoHref(CS_ROOT) }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== CS_ROOT) {
    const isLeaf = pathname === selected;
    items.push({ label: META[selected] ?? "", href: isLeaf ? undefined : demoHref(selected), current: isLeaf });
  }
  if (selected === `${CS_ROOT}/tickets` && pathname !== `${CS_ROOT}/tickets`) {
    items.push({ label: copy("workOrderDetails"), current: true });
  }
  return items;
}

/** 菜单 key → 标签（页签 label 用）。 */
export function labelOf(key: string): string {
  return META[key] ?? copy("sessionWorkbench5");
}

/** 当前页标题。 */
export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected === `${CS_ROOT}/tickets` && pathname !== selected) return copy("workOrderDetails2");
  return (selected && META[selected]) || copy("sessionWorkbench6");
}
