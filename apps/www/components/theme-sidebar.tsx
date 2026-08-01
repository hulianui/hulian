"use client";
import { usePathname, useRouter } from "next/navigation";
import { NavMenu, type NavMenuNode } from "@hulianui/ui";
import { THEME_NAV } from "../lib/theme-manifest";

const keyOf = (slug: string) => slug || "overview";
const hrefOf = (slug: string) => (slug ? `/theme/${slug}` : "/theme");

// dogfood 自家 NavMenu（树语义 + 键盘漫游 + 选中态）。
// NavMenu 叶子 href 会渲染 <a>(全页刷新)，docs 要 SPA 客户端导航 → 不给 href、用 onSelect→router.push 走 <button>。
export function ThemeSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeKey = keyOf(THEME_NAV.find((i) => hrefOf(i.slug) === pathname)?.slug ?? "");

  const items: NavMenuNode[] = [
    {
      type: "group",
      key: "theme",
      label: "Theme",
      children: THEME_NAV.map((i) => ({
        key: keyOf(i.slug),
        label: (
          <span className="flex w-full items-center justify-between gap-2">
            <span className="truncate">{i.label}</span>
            <span className="shrink-0 text-xs text-muted">{i.en}</span>
          </span>
        ),
      })),
    },
  ];

  return (
    <NavMenu
      aria-label="主题导航"
      className="!w-full"
      items={items}
      selectedKeys={[activeKey]}
      onSelect={(key) => {
        const item = THEME_NAV.find((i) => keyOf(i.slug) === key);
        if (item) router.push(hrefOf(item.slug));
      }}
    />
  );
}
