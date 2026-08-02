import { copy } from "./nav-config.content";
import {
  LayoutDashboard,
  GitPullRequest,
  ListChecks,
  ShieldCheck,
  Network,
  Settings,
} from "lucide-react";
import type { NavMenuNode, BreadcrumbItem } from "@hulianui/ui";
import { demoHref, demoLocationHref } from "../../_components/demo-locale";

export const HR_ROOT = "/demos/hanreview";

/** 侧栏菜单（key 即路由）。 */
export const menuItems: NavMenuNode[] = [
  {
    type: "group",
    key: "g-overview",
    label: copy("overview"),
    children: [
      {
        key: HR_ROOT,
        label: copy("codeHealthOverview"),
        icon: <LayoutDashboard className="size-4" />,
      },
    ],
  },
  {
    type: "group",
    key: "g-review",
    label: copy("review"),
    children: [
      {
        key: `${HR_ROOT}/reviews`,
        label: copy("queueReview"),
        icon: <GitPullRequest className="size-4" />,
      },
      {
        key: `${HR_ROOT}/findings`,
        label: copy("theCoreOfTheProblem"),
        icon: <ListChecks className="size-4" />,
      },
    ],
  },
  {
    type: "group",
    key: "g-policy",
    label: copy("strategy"),
    children: [
      {
        key: `${HR_ROOT}/gates`,
        label: copy("qualityAccessControl"),
        icon: <ShieldCheck className="size-4" />,
      },
      {
        key: `${HR_ROOT}/routing`,
        label: copy("intelligentRouting"),
        icon: <Network className="size-4" />,
      },
    ],
  },
  {
    type: "group",
    key: "g-system",
    label: copy("system"),
    children: [
      { key: `${HR_ROOT}/settings`, label: copy("setup"), icon: <Settings className="size-4" /> },
    ],
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
  [HR_ROOT]: copy("codeHealthOverview2"),
  [`${HR_ROOT}/reviews`]: copy("queueReview2"),
  [`${HR_ROOT}/findings`]: copy("theCoreOfTheProblem2"),
  [`${HR_ROOT}/gates`]: copy("qualityAccessControl2"),
  [`${HR_ROOT}/routing`]: copy("intelligentRouting2"),
  [`${HR_ROOT}/settings`]: copy("setup2"),
};

export function breadcrumbFor(pathname: string): BreadcrumbItem[] {
  if (pathname === HR_ROOT) return [{ label: copy("codeHealthOverview3"), current: true }];
  const items: BreadcrumbItem[] = [{ label: copy("overview2"), href: demoLocationHref(HR_ROOT) }];
  const selected = selectedKeyFor(pathname);
  if (selected && selected !== HR_ROOT) {
    const isLeaf = pathname === selected;
    items.push({
      label: META[selected] ?? "",
      href: isLeaf ? undefined : demoLocationHref(selected),
      current: isLeaf,
    });
  }
  if (selected === `${HR_ROOT}/reviews` && pathname !== `${HR_ROOT}/reviews`) {
    items.push({ label: copy("reviewTheDetails"), current: true });
  }
  return items;
}

export function labelOf(key: string): string {
  return META[key] ?? copy("codeHealthOverview4");
}

export function titleFor(pathname: string): string {
  const selected = selectedKeyFor(pathname);
  if (selected === `${HR_ROOT}/reviews` && pathname !== selected) return copy("reviewTheDetails2");
  return (selected && META[selected]) || copy("codeHealthOverview5");
}
