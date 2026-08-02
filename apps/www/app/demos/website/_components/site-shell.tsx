"use client";
import { copy } from "./site-shell.content";

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
import { demoHref, demoLocationHref } from "../../_components/demo-locale";

// ⌘K 站内搜索数据（分组：页面 + 功能）。
const COMMAND_GROUPS: CommandGroupData[] = [
  {
    heading: copy("pages"),
    items: [
      { value: "home", label: copy("home"), icon: <Globe className="size-4" />, description: copy("productIntroductionAndOverview"), keywords: copy("homeOverview") },
      { value: "pricing", label: copy("pricing"), icon: <CreditCard className="size-4" />, description: copy("comparePlansAndPricing"), keywords: copy("pricingCostPlans") },
      { value: "contact", label: copy("contactUs"), icon: <Phone className="size-4" />, description: copy("bookADemoGetAQuote"), keywords: copy("contactDemoSales") },
    ],
  },
  {
    heading: copy("platformCapabilities"),
    items: [
      { value: "deploy", label: copy("oneClickDeployment"), icon: <Rocket className="size-4" />, keywords: copy("deployGitPush") },
      { value: "compute", label: copy("elasticCompute"), icon: <Cpu className="size-4" />, keywords: copy("computeScalingBilling") },
      { value: "observe", label: copy("endToEndObservability"), icon: <Activity className="size-4" />, keywords: copy("observabilityMonitoringLogsTraces") },
    ],
  },
  {
    heading: copy("resources"),
    items: [
      { value: "docs", label: copy("documentation"), icon: <BookOpen className="size-4" />, keywords: copy("documentationApiGuides") },
    ],
  },
];

const PAGE_HREFS: Record<string, string> = {
  home: demoLocationHref("/demos/website"),
  pricing: demoLocationHref("/demos/website/pricing"),
  contact: demoLocationHref("/demos/website/contact"),
  deploy: demoLocationHref("/demos/website#features"),
  compute: demoLocationHref("/demos/website#features"),
  observe: demoLocationHref("/demos/website#features"),
  docs: demoLocationHref("/demos/website"),
};

function Logo() {
  return (
    <Link href={demoHref("/demos/website")} className="flex items-center gap-2">
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
              aria-label={copy("openSearchK")}
            >
              <Search className="size-3.5" aria-hidden />
              <span className="text-xs">{copy("search")}</span>
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
              render={<Link href={demoHref("/demos/website/contact")} />}
            >

              {copy("bookADemo")}
            </Button>
          </li>
          <li className="hidden md:flex">
            <Button size="sm" render={<Link href={demoHref("/demos/website/contact")} />}>

              {copy("startForFree")}
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
        placeholder={copy("searchPagesOrFeatures")}
        shortcut
        onSelectItem={handleSelectItem}
        emptyMessage={copy("noMatchingResults")}
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
              render={<Link href={demoHref("/demos/website/contact")} onClick={() => setOpen(false)} />}
            >

              {copy("startForFree")}
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
            © 2026 {brand.name} {brand.nameEn}  {copy("thisDemoUsesFictionalCompaniesAndData")}
          </Text>
          <Stack direction="row" gap={4}>
            <Link href={demoHref("/demos/website")} className="hover:text-foreground">

              {copy("termsOfService")}
            </Link>
            <Link href={demoHref("/demos/website")} className="hover:text-foreground">

              {copy("privacyPolicy")}
            </Link>
            <Link href="/demos" className="hover:text-foreground">

              {copy("backToGallery")}
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
