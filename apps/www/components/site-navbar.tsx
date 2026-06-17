"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatedThemeToggler,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Tag,
} from "@hulianui/ui";
import { UI_VERSION } from "../lib/ui-version";

// 站点统一顶栏(dogfood @hulianui/ui Navbar)—— 首页 + 区块/页面画廊共用。
// 品牌回首页 + 四档导航(组件/区块/页面/示例)+ 主题切换;移动端折叠菜单。
const TIERS = [
  { href: "/start", label: "开始", match: "/start" },
  { href: "/components", label: "组件", match: "/components" },
  { href: "/blocks", label: "区块", match: "/blocks" },
  { href: "/pages", label: "页面", match: "/pages" },
  { href: "/demos", label: "模版", match: "/demos" },
];

export function SiteNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (m: string) => pathname === m || pathname.startsWith(`${m}/`);

  return (
    <>
      <Navbar sticky className="bg-bg/80">
        <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- 静态 logo,免 next/image 优化开销 */}
            <img src="/logo.svg" alt="瑚琏" width={26} height={26} className="rounded-[6px]" />
            <span className="tracking-tight">瑚琏 Hulian</span>
            <Tag variant="soft" tone="brand" size="sm">
              v{UI_VERSION}
            </Tag>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end" className="hidden sm:flex">
          {TIERS.map((t) => (
            <NavbarItem key={t.href} isActive={isActive(t.match)}>
              <Link href={t.href}>{t.label}</Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <AnimatedThemeToggler />
      </Navbar>

      {open && (
        <ul className="flex flex-col gap-1 border-b border-border bg-bg p-2 sm:hidden">
          {TIERS.map((t) => (
            <NavbarItem key={t.href} isActive={isActive(t.match)} onClick={() => setOpen(false)}>
              <Link href={t.href} className="block px-2 py-1.5">
                {t.label}
              </Link>
            </NavbarItem>
          ))}
        </ul>
      )}
    </>
  );
}
