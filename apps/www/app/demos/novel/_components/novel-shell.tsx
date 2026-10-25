"use client";

import { copy } from "./novel-shell.content";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatedThemeToggler,
  Button,
  Divider,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Stack,
  Text,
} from "@hulianui/ui";
import { BookOpen } from "lucide-react";
import { stripDocsBasePath } from "../../../../lib/docs-locale";
import { NOVEL_BASE, brand, primaryNav } from "./nav-config";

function Logo() {
  return (
    <Link href={NOVEL_BASE} className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground">
        <BookOpen className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {brand.name}
        <span className="text-muted-foreground"> {brand.nameEn}</span>
      </span>
    </Link>
  );
}

function isLibrary(bare: string) {
  return bare === NOVEL_BASE || bare.startsWith(`${NOVEL_BASE}/books`);
}

function isActive(bare: string, href: string) {
  if (href === NOVEL_BASE) return isLibrary(bare);
  return bare === href || bare.startsWith(`${href}/`);
}

export function NovelShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const bare = stripDocsBasePath(pathname);
  const editing = /^\/demos\/novel\/studio\/[^/]+$/.test(bare);
  const [open, setOpen] = useState(false);

  return (
    <div className={editing ? "flex h-dvh flex-col bg-bg" : "flex min-h-dvh flex-col bg-bg"}>
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
        <div className="sticky top-16 z-20 border-b border-border bg-surface/95 backdrop-blur-md md:hidden">
          <Stack direction="column" gap={1} className="px-4 py-3">
            {primaryNav.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/demos"
              onClick={() => setOpen(false)}
              className="rounded-[var(--radius)] px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              {copy("gallery")}
            </Link>
          </Stack>
        </div>
      ) : null}

      <main className={editing ? "flex min-h-0 flex-1 flex-col" : "flex-1"}>{children}</main>

      {editing ? null : (
        <footer className="mt-16 border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">
            <Logo />
            <Text tone="muted" size="sm" className="mt-3 max-w-md">
              {brand.slogan} {copy("footerNote")}
            </Text>
            <Divider className="my-6" />
            <Stack direction="row" justify="between" wrap gap={3}>
              <Text size="sm" tone="muted">
                © 2026 {brand.name} {brand.nameEn}
              </Text>
              <Link href="/demos" className="text-sm text-muted-foreground hover:text-foreground">
                {copy("gallery")}
              </Link>
            </Stack>
          </div>
        </footer>
      )}
    </div>
  );
}
