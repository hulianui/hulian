"use client";

import { useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Button,
  Stack,
  Heading,
  Text,
  Divider,
  AnimatedThemeToggler,
  BackTop,
  Command,
  type CommandGroupData,
} from "@hulianui/ui";
import { Cloud, Search, Rocket, BookOpen, CreditCard, Phone, Globe, Cpu, Activity } from "lucide-react";
import { brand, navLinks, footerColumns } from "../_data/site";

// ⌘K 站内搜索数据（分组：页面 + 功能）。
const COMMAND_GROUPS: CommandGroupData[] = [
  {
    heading: "页面",
    items: [
      { value: "home", label: "首页", icon: <Globe className="size-4" />, description: "产品介绍与概览", keywords: "首页 home" },
      { value: "pricing", label: "定价", icon: <CreditCard className="size-4" />, description: "套餐与价格对比", keywords: "定价 价格 套餐" },
      { value: "contact", label: "联系我们", icon: <Phone className="size-4" />, description: "预约演示 · 获取报价", keywords: "联系 演示 销售" },
    ],
  },
  {
    heading: "平台能力",
    items: [
      { value: "deploy", label: "一键部署", icon: <Rocket className="size-4" />, keywords: "部署 git push" },
      { value: "compute", label: "弹性算力", icon: <Cpu className="size-4" />, keywords: "算力 弹性 计费" },
      { value: "observe", label: "端到端可观测", icon: <Activity className="size-4" />, keywords: "可观测 监控 日志 链路" },
    ],
  },
  {
    heading: "资源",
    items: [
      { value: "docs", label: "文档中心", icon: <BookOpen className="size-4" />, keywords: "文档 API 指南" },
    ],
  },
];

const PAGE_HREFS: Record<string, string> = {
  home: "/demos/website",
  pricing: "/demos/website/pricing",
  contact: "/demos/website/contact",
  deploy: "/demos/website#features",
  compute: "/demos/website#features",
  observe: "/demos/website#features",
  docs: "/demos/website",
};

function Logo() {
  return (
    <Link href="/demos/website" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground">
        <Cloud className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {brand.name}
        <span className="text-muted"> {brand.nameEn}</span>
      </span>
    </Link>
  );
}

/** 顶部导航：桌面横排 + 移动端折叠菜单。sticky 落在 demo chrome 之下。 */
function SiteNavbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const isActive = (href: string) =>
    href.includes("#") ? false : pathname === href || pathname.startsWith(`${href}/`);

  const handleSelectItem = useCallback(
    (value: string) => {
      const href = PAGE_HREFS[value];
      if (href) {
        // Next.js App Router 里用 window.location 做跳转（demo 内部纯 client 跳转）
        window.location.href = href;
      }
    },
    [],
  );

  return (
    <>
      <Navbar sticky bordered className="z-30">
        <NavbarBrand>
          <Logo />
        </NavbarBrand>

        <NavbarContent justify="center" className="hidden md:flex">
          {navLinks.map((link) => (
            <NavbarItem key={link.label} isActive={isActive(link.href)}>
              <Link href={link.href}>{link.label}</Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          {/* ⌘K 搜索触发器（桌面） */}
          <li className="hidden items-center md:flex">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 text-sm text-muted transition-colors hover:border-border-hover hover:text-foreground"
              aria-label="打开搜索（⌘K）"
            >
              <Search className="size-3.5" aria-hidden />
              <span className="text-xs">搜索</span>
              <span className="ml-1 rounded border border-border px-1 text-[10px] font-mono text-muted">⌘K</span>
            </button>
          </li>
          <li className="flex items-center">
            <AnimatedThemeToggler />
          </li>
          <li className="hidden md:flex">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/demos/website/contact" />}
            >
              预约演示
            </Button>
          </li>
          <li className="hidden md:flex">
            <Button size="sm" render={<Link href="/demos/website/contact" />}>
              免费开始
            </Button>
          </li>
          <li className="flex md:hidden">
            <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
          </li>
        </NavbarContent>
      </Navbar>

      {/* ⌘K 命令面板（全局快捷键 shortcut=true） */}
      <Command
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        groups={COMMAND_GROUPS}
        placeholder="搜索页面或功能…"
        shortcut
        onSelectItem={handleSelectItem}
        emptyMessage="未找到相关内容"
      />

      {open && (
        <div className="sticky top-16 z-20 border-b border-border bg-surface/95 backdrop-blur-md md:hidden">
          <Stack direction="column" gap={1} className="px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Divider className="my-2" />
            <Button
              size="sm"
              className="w-full"
              render={<Link href="/demos/website/contact" onClick={() => setOpen(false)} />}
            >
              免费开始
            </Button>
          </Stack>
        </div>
      )}
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <Text tone="muted" size="sm" className="mt-3">
              {brand.description}
            </Text>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <Heading level={3} size="xs" weight="semibold" className="mb-3 text-foreground">
                {col.title}
              </Heading>
              <Stack direction="column" gap={2}>
                {col.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </div>
          ))}
        </div>

        <Divider className="my-8" />

        <Stack
          direction="row"
          align="center"
          justify="between"
          wrap
          gap={3}
          className="text-sm text-muted"
        >
          <Text size="sm" tone="muted">
            © 2026 {brand.name} {brand.nameEn} · 本页为 @hulianui/ui 演示，公司与数据均为虚构。
          </Text>
          <Stack direction="row" gap={4}>
            <Link href="/demos/website" className="hover:text-foreground">
              服务条款
            </Link>
            <Link href="/demos/website" className="hover:text-foreground">
              隐私政策
            </Link>
            <Link href="/demos" className="hover:text-foreground">
              返回画廊
            </Link>
          </Stack>
        </Stack>
      </div>
    </footer>
  );
}

/** 营销站外壳：顶部导航 + 主体 + 页脚。被 (site) 路由组 layout 套在所有页上。 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteNavbar />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      {/* 长落地页向上滚动到顶 */}
      <BackTop visibilityHeight={500} />
    </div>
  );
}
