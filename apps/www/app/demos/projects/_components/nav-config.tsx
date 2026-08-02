import { copy } from "./nav-config.content";
import { LayoutDashboard, FolderKanban, Images, FileText, Receipt, Wallet } from "lucide-react";
import type { BreadcrumbItem, NavMenuNode } from "@hulianui/ui";

export const ROOT = "/demos/projects";

/** 侧栏菜单（key 即路由，分组不可折叠）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-overview",
    label: copy("overview"),
    children: [{ key: ROOT, label: copy("workbench"), icon: <LayoutDashboard className="size-4" /> }],
  },
  {
    type: "group",
    key: "g-project",
    label: copy("project"),
    children: [
      { key: `${ROOT}/tracking`, label: copy("projectTracking"), icon: <FolderKanban className="size-4" /> },
      { key: `${ROOT}/photos`, label: copy("workPhotos"), icon: <Images className="size-4" /> },
    ],
  },
  {
    type: "group",
    key: "g-finance",
    label: copy("businessFinance"),
    children: [
      { key: `${ROOT}/quotes`, label: copy("quotation"), icon: <FileText className="size-4" /> },
      { key: `${ROOT}/invoices`, label: copy("invoiceCollection"), icon: <Receipt className="size-4" /> },
      { key: `${ROOT}/checkout`, label: copy("collectMoneyOnline"), icon: <Wallet className="size-4" /> },
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
  [ROOT]: copy("workbench2"),
  [`${ROOT}/tracking`]: copy("projectTracking2"),
  [`${ROOT}/photos`]: copy("workPhotos2"),
  [`${ROOT}/quotes`]: copy("quotation2"),
  [`${ROOT}/invoices`]: copy("invoiceCollection2"),
  [`${ROOT}/checkout`]: copy("collectMoneyOnline2"),
};

/** 详情页面包屑尾标签（按菜单 key）。 */
const DETAIL_LABEL: Record<string, string> = {
  [`${ROOT}/tracking`]: copy("projectDetails"),
  [`${ROOT}/quotes`]: copy("quotationDetails"),
  [`${ROOT}/checkout`]: copy("cashier"),
};

/** 顶栏面包屑：工作台 → 当前页（→ 详情）。 */
export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === ROOT) return [{ label: copy("workbench3"), current: true }];
  const items: BreadcrumbItem[] = [{ label: copy("workbench4"), href: ROOT }];
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
  return META[key] ?? copy("workbench5");
}

/** 当前页标题。 */
export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected && pathname !== selected && DETAIL_LABEL[selected]) return DETAIL_LABEL[selected];
  return (selected && META[selected]) || copy("workbench6");
}
