"use client";
import { useState, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useIntlayer } from "next-intlayer";
import {
  AnimatedThemeToggler,
  Button,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
} from "@hulianui/ui";
import { UI_VERSION } from "../lib/ui-version";
import { DocsSearch } from "./docs-search";
import { LanguageSwitcher } from "./language-switcher";
import { withDocsBasePath } from "../lib/docs-locale";

// 站点统一顶栏(dogfood @hulianui/ui Navbar)—— 首页 + 区块/页面画廊共用。
// 品牌回首页 + 五档导航(开始/组件/区块/页面/模版)+ 更新日志 + 主题切换;移动端折叠菜单。
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
  const content = useIntlayer("site-shell");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (m: string) => pathname === m || pathname.startsWith(`${m}/`);
  const tiers = [
    { href: "/start", label: content.nav.start, match: "/start" },
    { href: "/components", label: content.nav.components, match: "/components" },
    { href: "/blocks", label: content.nav.blocks, match: "/blocks" },
    { href: "/pages", label: content.nav.pages, match: "/pages" },
    { href: "/demos", label: content.nav.demos, match: "/demos" },
    { href: "/changelog", label: content.nav.changelog, match: "/changelog" },
  ];

  return (
    <>
      {/* 布局：左「品牌 + 导航」、右「搜索 + 工具」—— 导航紧贴品牌，宽屏上不再隔着半个屏幕。
          右侧工具统一 36px 高、无边框的轻按钮，只有搜索框是实底，视觉重心落在「品牌」和「搜索」两处。 */}
      <Navbar
        sticky
        bordered={false}
        className="h-14 gap-2 border-b border-border/60 bg-bg/75 px-3 sm:px-5 xl:gap-3"
      >
        <NavbarMenuToggle
          isOpen={open}
          onToggle={() => setOpen((v) => !v)}
          aria-label={open ? content.closeMenu : content.openMenu}
          className="sm:inline-flex xl:hidden"
        />
        {/* grow={false}：品牌区按内容宽，导航紧跟其后。min-w-0 让品牌名在最窄屏可以 truncate，
            否则会把最右的主题切换钮顶出视口。 */}
        <NavbarBrand grow={false} className="min-w-0">
          {/* 版本徽标点进更新日志。必须与品牌 Link 并列而非嵌套——<a> 套 <a> 会 hydration 报错。 */}
          <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
            {/* logo 用 mask 画：图形取自 logo.svg，颜色交给 CSS（.hl-logo，见 globals.css）。
                用 <img> 时颜色写死在 SVG 里，首页的主题色切换够不着它。 */}
            <span
              role="img"
              aria-label={content.logoAlt}
              className="hl-logo size-6 shrink-0"
              style={{
                maskImage: `url(${withDocsBasePath("/logo.svg")})`,
                WebkitMaskImage: `url(${withDocsBasePath("/logo.svg")})`,
              }}
            />
            {/* 360px 以下只留 logo：半截品牌名比只留 logo 更糟。 */}
            <span className="hidden truncate tracking-tight min-[360px]:inline">
              {content.brand}
            </span>
          </Link>
          <Link
            href="/changelog"
            aria-label={content.currentVersion.replace("{version}", UI_VERSION)}
            className="ml-2 hidden shrink-0 rounded-full border border-border/80 px-2 py-0.5 font-mono text-[11px] leading-4 text-muted-foreground transition-colors hover:border-primary-border hover:text-primary lg:block"
          >
            v{UI_VERSION}
          </Link>
        </NavbarBrand>

        <NavbarContent justify="start" className="ml-4 hidden gap-0.5 sm:gap-0.5 xl:flex">
          {tiers.map((t) => (
            <NavbarItem
              key={t.href}
              isActive={isActive(t.match)}
              className={`p-0 ${
                isActive(t.match) ? "bg-primary-subtle" : "hover:bg-surface-hover"
              }`}
            >
              <Link href={t.href} className="block px-3 py-1.5">
                {t.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* 全站搜索：跨 页面/区块/组件/模版/指南 的统一入口，⌘K 唤起；全断点常驻。 */}
          <DocsSearch />
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <LanguageSwitcher pathname={pathname} />
          {/* 开源入口在 sm 以上常驻；最窄屏让位给品牌名，改由折叠菜单承接。 */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={content.github}
            className="size-9 text-muted-foreground hover:text-foreground max-sm:hidden"
            render={<a href={REPO} target="_blank" rel="noreferrer" />}
          >
            <GithubIcon className="size-[18px]" />
          </Button>
          <AnimatedThemeToggler
            aria-label={content.toggleTheme}
            className="size-9 border-0 bg-transparent text-muted-foreground hover:text-foreground [&_svg]:size-[18px]"
          />
        </div>
      </Navbar>

      {open && (
        <ul className="flex flex-col gap-1 border-b border-border bg-bg p-2 xl:hidden">
          {tiers.map((t) => (
            <NavbarItem key={t.href} isActive={isActive(t.match)} onClick={() => setOpen(false)}>
              <Link href={t.href} className="block px-2 py-1.5">
                {t.label}
              </Link>
            </NavbarItem>
          ))}
          <NavbarItem className="sm:hidden" onClick={() => setOpen(false)}>
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-2 py-1.5"
            >
              <GithubIcon className="size-4" />
              GitHub
            </a>
          </NavbarItem>
        </ul>
      )}
    </>
  );
}
