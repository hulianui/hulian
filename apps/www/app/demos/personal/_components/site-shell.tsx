"use client";
import { copy } from "./site-shell.content";
import { demoHref } from "../../_components/demo-locale";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Button,
  Stack,
  Text,
  Divider,
  AnimatedThemeToggler,
  BackTop,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@hulianui/ui";
import { Code2, AtSign, Mail, Rss, Palette, ArrowUpRight } from "lucide-react";
import { profile, type SocialKind } from "../_data/profile";

const BASE = demoHref("/demos/personal");

const NAV = [
  { label: copy("work"), href: `${BASE}#work` },
  { label: copy("about"), href: `${BASE}#about` },
  { label: copy("journey"), href: `${BASE}#journey` },
  { label: copy("guestbook"), href: `${BASE}/guestbook` },
];

// lucide v1 无品牌图标 → 用语义相近的通用图标。
export const SOCIAL_ICON: Record<SocialKind, ReactNode> = {
  github: <Code2 className="size-4" aria-hidden />,
  twitter: <AtSign className="size-4" aria-hidden />,
  mail: <Mail className="size-4" aria-hidden />,
  rss: <Rss className="size-4" aria-hidden />,
  dribbble: <Palette className="size-4" aria-hidden />,
};

function Brand() {
  return (
    <Link href={BASE} className="flex items-center gap-2.5">
      <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[var(--color-chart-2)] text-sm font-bold text-primary-foreground">

        {copy("lin")}
      </span>
      <span className="flex items-baseline gap-1.5">
        <span className="text-base font-semibold tracking-tight text-foreground">{profile.name}</span>
        <span className="font-mono text-xs text-muted">{profile.handle}</span>
      </span>
    </Link>
  );
}

function TopNav() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Navbar sticky bordered className="z-30 bg-surface/80 backdrop-blur-xl">
        <NavbarBrand>
          <Brand />
        </NavbarBrand>

        <NavbarContent justify="center" className="hidden md:flex">
          {NAV.map((link) => (
            <NavbarItem key={link.label}>
              <Link href={link.href}>{link.label}</Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        <NavbarContent justify="end" className="gap-2">
          <li className="hidden items-center gap-0.5 sm:flex">
            {profile.socials
              .filter((s) => s.kind === "github" || s.kind === "twitter")
              .map((s) => (
                <Tooltip key={s.kind}>
                  <TooltipTrigger
                    render={
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={s.label}
                        className="flex size-8 items-center justify-center rounded-[var(--radius)] text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
                      >
                        {SOCIAL_ICON[s.kind]}
                      </a>
                    }
                  />
                  <TooltipContent>{`${s.label} · ${s.handle}`}</TooltipContent>
                </Tooltip>
              ))}
          </li>
          <li className="flex items-center">
            <AnimatedThemeToggler />
          </li>
          <li className="hidden md:flex">
            <Button size="sm" render={<Link href={`${BASE}#contact`} />}>

              {copy("contactMe")}
            </Button>
          </li>
          <li className="flex md:hidden">
            <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
          </li>
        </NavbarContent>
      </Navbar>

      {open && (
        <div className="sticky top-16 z-20 border-b border-border bg-surface/95 backdrop-blur-md md:hidden">
          <Stack direction="column" gap={1} className="px-4 py-3">
            {NAV.map((link) => (
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
            <Button size="sm" className="w-full" render={<Link href={`${BASE}#contact`} onClick={() => setOpen(false)} />}>

              {copy("contactMe")}
            </Button>
          </Stack>
        </div>
      )}
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="relative border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-5xl px-6 py-12">
        <Stack direction="row" align="center" justify="between" wrap gap={4}>
          <div>
            <Brand />
            <Text tone="muted" size="sm" className="mt-3 max-w-xs">
              {profile.tagline}  {copy("thisSiteIsBuiltEntirelyWithAllPeopleAndProductsAreFictional")}
            </Text>
          </div>
          <Stack direction="row" gap={1.5} wrap>
            {profile.socials.map((s) => (
              <Tooltip key={s.kind}>
                <TooltipTrigger
                  render={
                    <a
                      href={s.href}
                      target={s.href.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                      aria-label={s.label}
                      className="flex size-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:border-primary hover:text-foreground"
                    >
                      {SOCIAL_ICON[s.kind]}
                    </a>
                  }
                />
                <TooltipContent>{`${s.label} · ${s.handle}`}</TooltipContent>
              </Tooltip>
            ))}
          </Stack>
        </Stack>

        <Divider className="my-8" />

        <Stack direction="row" align="center" justify="between" wrap gap={3}>
          <Text size="sm" tone="muted">
            © 2026 {profile.name} {profile.nameEn} · {profile.location}
          </Text>
          <Link
            href="/demos"
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
          >

            {copy("backToDemos")} <ArrowUpRight className="size-3.5" aria-hidden />
          </Link>
        </Stack>
      </div>
    </footer>
  );
}

/** 个人站外壳：顶部导航 + 主体 + 页脚。被 (site) 路由组 layout 套在所有页上。
 *  整页在 window 滚动（无内层滚动容器），保证落地页 Anchor scrollspy 正常工作。 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delay={200} closeDelay={0}>
      <div className="flex min-h-dvh flex-col bg-background">
        <TopNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <BackTop visibilityHeight={600} />
      </div>
    </TooltipProvider>
  );
}
