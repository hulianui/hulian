import { LayoutDashboard, FolderKanban, Images, FileText, Receipt, Wallet } from "lucide-react";
import type { BreadcrumbItem, NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/projects";

/** 侧栏菜单（key 即路由，分组不可折叠）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-overview",
    label: "概览",
    children: [{ key: ROOT, label: "工作台", icon: <LayoutDashboard className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-project",
    label: "项目",
    children: [
      { key: `${ROOT}/tracking`, label: "项目追踪", icon: <FolderKanban className="size-4" /> },
      { key: `${ROOT}/photos`, label: "工作照片", icon: <Images className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-finance",
    label: "商务财务",
    children: [
      { key: `${ROOT}/quotes`, label: "报价单", icon: <FileText className="size-4" /> },
      { key: `${ROOT}/invoices`, label: "开票回款", icon: <Receipt className="size-4" /> },
      { key: `${ROOT}/checkout`, label: "在线收款", icon: <Wallet className="size-4" /> },
    ],
  },
];

/** 叶子路由 key（按路径长度降序，供「最长前缀」选中匹配，覆盖 [id] 详情页）。 */
const leafKeys = [
  `${ROOT}/tracking`,
  `${ROOT}/photos`,
  `${ROOT}/quotes`,
  `${ROOT}/invoices`,
  `${ROOT}/checkout`,
  ROOT,
].sort((a, b) => b.length - a.length);

export function selectedKeyFor(pathname: string): string | undefined {
  return leafKeys.find((k) => pathname === k || pathname.startsWith(`${k}/`));
}

const META: Record<string, string> = {
  [ROOT]: "工作台",
  [`${ROOT}/tracking`]: "项目追踪",
  [`${ROOT}/photos`]: "工作照片",
  [`${ROOT}/quotes`]: "报价单",
  [`${ROOT}/invoices`]: "开票回款",
  [`${ROOT}/checkout`]: "在线收款",
};

/** 详情页面包屑尾标签（按菜单 key）。 */
const DETAIL_LABEL: Record<string, string> = {
  [`${ROOT}/tracking`]: "项目详情",
  [`${ROOT}/quotes`]: "报价单详情",
  [`${ROOT}/checkout`]: "收银台",
};

/** 顶栏面包屑：工作台 → 当前页（→ 详情）。 */
export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === ROOT) return [{ label: "工作台", current: true }];
  const items: BreadcrumbItem[] = [{ label: "工作台", href: ROOT }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== ROOT) {
    const isLeaf = pathname === selected;
    items.push({ label: META[selected] ?? "", href: isLeaf ? undefined : selected, current: isLeaf });
    if (!isLeaf && DETAIL_LABEL[selected]) {
      items.push({ label: DETAIL_LABEL[selected], current: true });
    }
  }
  return items;
}

/** 菜单 key → 标签（页签 label 用）。 */
export function labelOf(key: string): string {
  return META[key] ?? "工作台";
}

/** 当前页标题。 */
export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected && pathname !== selected && DETAIL_LABEL[selected]) return DETAIL_LABEL[selected];
  return (selected && META[selected]) || "工作台";
}
