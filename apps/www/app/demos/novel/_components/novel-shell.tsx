"use client";

import { copy } from "./novel-shell.content";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatedThemeToggler,
  Button,
  Container,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Stack,
  Text,
} from "@hulianui/ui";
import { stripDocsBasePath } from "../../../../lib/docs-locale";
import { NOVEL_BASE, brand, primaryNav } from "./nav-config";

/**
 * 朱砂印。文学站的品牌记号 —— 比一个圆角方块图标更像「出版社」而不是「SaaS」。
 * 两字竖排、方角、只借 danger 那一档红（印章本来就是红的，不是警告）。
 */
function Seal({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={
        "grid size-9 shrink-0 place-items-center rounded-[3px] bg-danger text-danger-foreground " +
        (className ?? "")
      }
    >
      <span className="novel-serif flex flex-col items-center text-[10px] leading-[1.08] tracking-[0.08em]">
        <span>渡</span>
        <span>口</span>
      </span>
    </span>
  );
}

function Logo() {
  return (
    <Link href={NOVEL_BASE} className="flex items-center gap-3">
      <Seal />
      <span className="flex flex-col leading-none">
        <span className="novel-serif text-lg tracking-[0.14em] text-foreground">{brand.name}</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.34em] text-muted-foreground">
          {brand.nameEn}
        </span>
      </span>
    </Link>
  );
}

function isActive(bare: string, href: string) {
  if (href === `${NOVEL_BASE}/library`) {
    return bare === href || bare.startsWith(`${NOVEL_BASE}/books`);
  }
  return bare === href || bare.startsWith(`${href}/`);
}

export function NovelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const bare = stripDocsBasePath(pathname);
  const editing = /^\/demos\/novel\/studio\/[^/]+$/.test(bare);
  const [open, setOpen] = useState(false);

  return (
    <div className={editing ? "novel-theme flex h-dvh flex-col bg-bg" : "novel-theme flex min-h-dvh flex-col bg-bg"}>
      <Navbar sticky bordered className="z-30">
        <NavbarBrand>
          <Logo />
        </NavbarBrand>
        <NavbarContent justify="center" className="hidden md:flex">
          {primaryNav.map((link) => (
            <NavbarItem key={link.href} isActive={isActive(bare, link.href)}>
              <Link href={link.href}>{link.label}</Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end" className="gap-1">
          <li className="hidden items-center md:flex">
            <Button variant="ghost" size="sm" muted render={<Link href="/demos" />}>
              {copy("gallery")}
            </Button>
          </li>
          <li className="flex items-center">
            <AnimatedThemeToggler />
          </li>
          <li className="flex md:hidden">
            <NavbarMenuToggle
              isOpen={open}
              onToggle={() => setOpen((value) => !value)}
              aria-label={copy(open ? "closeMenu" : "openMenu")}
            />
          </li>
        </NavbarContent>
      </Navbar>

      {open ? (
        <div className="sticky top-16 z-20 border-b border-hairline bg-surface/95 backdrop-blur-md md:hidden">
          <Stack direction="column" gap={1} className="px-4 py-3">
            {[...primaryNav, { label: copy("gallery"), href: "/demos" }].map((link) => (
              <Button
                key={link.href}
                variant="ghost"
                muted
                className="w-full justify-start"
                render={<Link href={link.href} onClick={() => setOpen(false)} />}
              >
                {link.label}
              </Button>
            ))}
          </Stack>
        </div>
      ) : null}

      <main className={editing ? "flex min-h-0 flex-1 flex-col" : "flex-1"}>{children}</main>

      {editing ? null : (
        <footer className="mt-20 border-t border-hairline bg-surface">
          <Container size="2xl" className="py-12">
            <div className="flex flex-wrap items-start justify-between gap-x-12 gap-y-10">
              <div className="max-w-sm">
                <Logo />
                <Text size="sm" tone="muted" className="novel-serif mt-4 leading-relaxed">
                  {brand.slogan}
                </Text>
                <Text size="xs" tone="muted" className="mt-2">
                  {copy("footerNote")}
                </Text>
              </div>
              <div className="flex flex-wrap gap-x-12 gap-y-8">
                <div className="flex flex-col gap-2">
                  <Text size="xs" tone="muted" className="tracking-[0.2em]">
                    {copy("navigate")}
                  </Text>
                  {[...primaryNav, { label: copy("gallery"), href: "/demos" }].map((link) => (
                    <Button
                      key={link.href}
                      variant="link"
                      muted
                      size="sm"
                      className="h-auto justify-start px-0"
                      render={<Link href={link.href} />}
                    >
                      {link.label}
                    </Button>
                  ))}
                </div>
                <div className="flex max-w-[16rem] flex-col gap-2">
                  <Text size="xs" tone="muted" className="tracking-[0.2em]">
                    {copy("about")}
                  </Text>
                  <Text size="sm" tone="muted" className="novel-serif leading-relaxed">
                    {copy("aboutNote")}
                  </Text>
                </div>
              </div>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-5">
              <Text size="xs" tone="muted">
                © 2026 {brand.name} {brand.nameEn}
              </Text>
              <Text size="xs" tone="muted">
                {copy("colophon")}
              </Text>
            </div>
          </Container>
        </footer>
      )}
    </div>
  );
}
