"use client";
import { useState, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatedThemeToggler,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Tag,
} from "@hulianui/ui";
import { UI_VERSION } from "../lib/ui-version";
import { DocsSearch } from "./docs-search";
import { LanguageSwitcher } from "./language-switcher";

// 站点统一顶栏(dogfood @hulianui/ui Navbar)—— 首页 + 区块/页面画廊共用。
// 品牌回首页 + 五档导航(开始/组件/区块/页面/模版)+ 更新日志 + 主题切换;移动端折叠菜单。
const TIERS = [
  { href: "/start", label: "开始", match: "/start" },
  { href: "/components", label: "组件", match: "/components" },
  { href: "/blocks", label: "区块", match: "/blocks" },
  { href: "/pages", label: "页面", match: "/pages" },
  { href: "/demos", label: "模版", match: "/demos" },
  { href: "/changelog", label: "更新", match: "/changelog" },
];

const REPO = "https://github.com/hulianui/hulian";

// GitHub mark 内联在这里，不进 packages/ui/src/_icons —— 那个图标集只收「组件运行时真正
// 需要的」结构性图标，品牌 logo 不属于此列，进去会白白撑大每个消费方的产物。
// 也不能用 lucide-react：v1 起移除了全部品牌图标，本版（1.28）确实没有 Github 导出。
// 官方 mark 是实心填充，与顶栏其余 stroke 图标风格不同，但品牌标识不宜改画。
function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.37.5 0 5.78 0 12.292c0 5.211 3.438 9.63 8.205 11.188.6.111.82-.254.82-.567 0-.28-.01-1.022-.015-2.005-3.338.711-4.042-1.582-4.042-1.582-.546-1.361-1.335-1.725-1.335-1.725-1.087-.731.084-.716.084-.716 1.205.084 1.838 1.215 1.838 1.215 1.07 1.803 2.809 1.282 3.495.98.108-.762.417-1.282.76-1.577-2.665-.295-5.466-1.309-5.466-5.827 0-1.287.465-2.339 1.235-3.164-.135-.298-.54-1.497.105-3.121 0 0 1.005-.316 3.3 1.209.96-.262 1.98-.392 3-.398 1.02.006 2.04.136 3 .398 2.28-1.525 3.285-1.209 3.285-1.209.645 1.624.24 2.823.12 3.121.765.825 1.23 1.877 1.23 3.164 0 4.53-2.805 5.527-5.475 5.817.42.354.81 1.077.81 2.182 0 1.578-.015 2.846-.015 3.229 0 .309.21.678.825.56C20.565 21.917 24 17.5 24 12.292 24 5.78 18.627.5 12 .5z" />
    </svg>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (m: string) => pathname === m || pathname.startsWith(`${m}/`);

  return (
    <>
      <Navbar sticky className="gap-1 bg-bg/80 px-2 sm:gap-2 sm:px-4 xl:gap-4 xl:px-6">
        <NavbarMenuToggle
          isOpen={open}
          onToggle={() => setOpen((v) => !v)}
          className="sm:inline-flex xl:hidden"
        />
        {/* min-w-0 让品牌区可收缩：375px 下顶栏要塞下 汉堡+品牌+搜索+语言+开源+主题切换，
            品牌区不让步就会把最右的主题切换钮顶出视口（横向溢出 6px）。 */}
        {/* `shrink` 覆盖 NavbarBrand 自带的 shrink-0（同组、后写者胜）——只加 min-w-0 是不够的。 */}
        <NavbarBrand className="min-w-0 shrink">
          {/* 版本徽标点进更新日志。必须与品牌 Link 并列而非嵌套——<a> 套 <a> 会 hydration 报错。 */}
          <Link href="/" className="flex min-w-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- 静态 logo,免 next/image 优化开销 */}
            <img src="/logo.svg" alt="瑚琏" width={26} height={26} className="shrink-0 rounded-[6px]" />
            <span className="hidden truncate tracking-tight min-[480px]:inline">瑚琏 Hulian</span>
          </Link>
          {/* 版本号在最窄屏让位：它是「锦上添花」，主题切换钮是功能。 */}
          <Link
            href="/changelog"
            aria-label={`当前版本 v${UI_VERSION}，查看更新日志`}
            className="ml-2 hidden shrink-0 2xl:block"
          >
            <Tag variant="soft" tone="brand" size="sm">
              v{UI_VERSION}
            </Tag>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end" className="hidden xl:flex">
          {TIERS.map((t) => (
            <NavbarItem key={t.href} isActive={isActive(t.match)}>
              <Link href={t.href}>{t.label}</Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        {/* 全站搜索：跨 页面/区块/组件/模版/指南 的统一入口，⌘K 可唤起。
            与开源、主题切换同属「站点级」动作，全断点常驻、不折进汉堡菜单。 */}
        <DocsSearch />
        <LanguageSwitcher pathname={pathname} />
        {/* 开源入口全断点常驻：它和主题切换一样是「站点级」动作，不该跟着导航折进汉堡菜单。 */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="在 GitHub 上查看瑚琏源码"
          render={<a href={REPO} target="_blank" rel="noreferrer" />}
        >
          <GithubIcon className="size-[18px]" />
        </Button>
        <AnimatedThemeToggler />
      </Navbar>

      {open && (
        <ul className="flex flex-col gap-1 border-b border-border bg-bg p-2 xl:hidden">
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
