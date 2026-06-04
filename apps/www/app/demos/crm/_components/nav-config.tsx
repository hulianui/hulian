import { LayoutDashboard, Users, KanbanSquare, ShoppingCart, Settings } from "lucide-react";
import type { NavMenuNode } from "@hulian/ui";
import type { BreadcrumbItem } from "@hulian/ui";

export const CRM_ROOT = "/demos/crm";

/** 侧栏菜单（key 即路由，分组不可折叠）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-overview",
    label: "概览",
    children: [{ key: CRM_ROOT, label: "工作台", icon: <LayoutDashboard className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-biz",
    label: "业务",
    children: [
      { key: `${CRM_ROOT}/customers`, label: "客户列表", icon: <Users className="size-4" /> },
      { key: `${CRM_ROOT}/opportunities`, label: "商机看板", icon: <KanbanSquare className="size-4" /> },
      { key: `${CRM_ROOT}/orders`, label: "订单管理", icon: <ShoppingCart className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-system",
    label: "系统",
    children: [{ key: `${CRM_ROOT}/settings`, label: "系统设置", icon: <Settings className="size-4" /> }],
  },
];

/** 叶子路由 key（按路径长度降序，供「最长前缀」选中匹配）。 */
const leafKeys = [
  `${CRM_ROOT}/customers`,
  `${CRM_ROOT}/opportunities`,
  `${CRM_ROOT}/orders`,
  `${CRM_ROOT}/settings`,
  CRM_ROOT,
].sort((a, b) => b.length - a.length);

/** 由当前路径推出应高亮的菜单 key（最长前缀匹配，覆盖详情页 /customers/[id]）。 */
export function selectedKeyFor(pathname: string): string | undefined {
  return leafKeys.find((k) => pathname === k || pathname.startsWith(`${k}/`));
}

const META: Record<string, string> = {
  [CRM_ROOT]: "工作台",
  [`${CRM_ROOT}/customers`]: "客户列表",
  [`${CRM_ROOT}/opportunities`]: "商机看板",
  [`${CRM_ROOT}/orders`]: "订单管理",
  [`${CRM_ROOT}/settings`]: "系统设置",
};

/** 顶栏面包屑：工作台 → 当前页（详情页追加「客户详情」）。 */
export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === CRM_ROOT) return [{ label: "工作台", current: true }];
  const items: BreadcrumbItem[] = [{ label: "工作台", href: CRM_ROOT }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== CRM_ROOT) {
    const isLeaf = pathname === selected;
    items.push({ label: META[selected] ?? "", href: isLeaf ? undefined : selected, current: isLeaf });
  }
  if (selected === `${CRM_ROOT}/customers` && pathname !== `${CRM_ROOT}/customers`) {
    items.push({ label: "客户详情", current: true });
  }
  return items;
}

/** 菜单 key → 分组内叶子标签（页签 label 用）。 */
export function labelOf(key: string): string {
  return META[key] ?? "工作台";
}

/** 当前页标题（用于 document/页签 label）。 */
export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected === `${CRM_ROOT}/customers` && pathname !== selected) return "客户详情";
  return (selected && META[selected]) || "工作台";
}
