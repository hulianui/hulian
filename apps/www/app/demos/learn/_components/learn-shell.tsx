"use client";
import { copy } from "./learn-shell.content";
import { Suspense, useCallback, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Stack,
  Divider,
  Text,
  AnimatedThemeToggler,
  BackTop,
  Command,
  type CommandGroupData,
} from "@hulianui/ui";
import { GraduationCap, Search } from "lucide-react";
import { courses, CATEGORY_NAME, priceLabel } from "../_data/courses";
import { brand, primaryNav, LEARN_BASE } from "./nav-config";
import { LearnStoreProvider } from "../_lib/learn-store";
import { QuestionBankProvider } from "../_lib/question-bank-store";

function Logo() {
  return (
    <Link href={LEARN_BASE} className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-[var(--radius)] bg-primary text-primary-foreground">
        <GraduationCap className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-semibold tracking-tight text-foreground">
        {brand.name}
        <span className="text-muted-foreground"> {brand.nameEn}</span>
      </span>
    </Link>
  );
}

// ⌘K 搜索：课程。
const COMMAND_GROUPS: CommandGroupData[] = [
  {
    heading: copy("allCourses"),
    items: courses.map((c) => ({
      value: c.id,
      label: c.title,
      description: `${CATEGORY_NAME[c.category]} · ${c.instructor.name} · ${priceLabel(c.price)}`,
      keywords: `${c.title} ${c.subtitle} ${c.tags.join(" ")} ${c.instructor.name}`,
    })),
  },
];

function PrimaryNavItems() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mine = searchParams.get("view") === "mine";

  const isActive = (href: string) => {
    if (href === LEARN_BASE) return pathname === LEARN_BASE && !mine;
    if (href.endsWith("view=mine")) return pathname === LEARN_BASE && mine;
    return pathname.startsWith(href);
  };

  return (
    <>
      {primaryNav.map((link) => (
        <NavbarItem key={link.label} isActive={isActive(link.href)}>
          <Link href={link.href}>{link.label}</Link>
        </NavbarItem>
      ))}
    </>
  );
}

function PrimaryNavFallback() {
  return (
    <>
      {primaryNav.map((link) => (
        <NavbarItem key={link.label}>
          <Link href={link.href}>{link.label}</Link>
        </NavbarItem>
      ))}
    </>
  );
}

function LearnNavbar() {
  const [open, setOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  const onSelect = useCallback((value: string) => {
    window.location.href = `${LEARN_BASE}/courses/${value}`;
  }, []);

  return (
    <>
      <Navbar sticky bordered className="z-30">
        <NavbarBrand>
          <Logo />
        </NavbarBrand>

        <NavbarContent justify="center" className="hidden md:flex">
          <Suspense fallback={<PrimaryNavFallback />}>
            <PrimaryNavItems />
          </Suspense>
        </NavbarContent>

        <NavbarContent justify="end" className="gap-1">
          <li className="hidden items-center md:flex">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="flex h-8 items-center gap-1.5 rounded-[var(--radius)] border border-border bg-surface px-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label={copy("searchCoursesK")}
            >
              <Search className="size-3.5" aria-hidden />
              <span className="text-xs">{copy("searchCourses")}</span>
              <span className="ml-1 rounded border border-border px-1 text-[10px] font-mono text-muted-foreground">
                ⌘K
              </span>
            </button>
          </li>
          <li className="flex items-center">
            <AnimatedThemeToggler />
          </li>
          <li className="flex md:hidden">
            <NavbarMenuToggle
              isOpen={open}
              onToggle={() => setOpen((v) => !v)}
              aria-label={copy(open ? "closeMenu" : "openMenu")}
            />
          </li>
        </NavbarContent>
      </Navbar>

      <Command
        open={cmdOpen}
        onOpenChange={setCmdOpen}
        groups={COMMAND_GROUPS}
        placeholder={copy("searchCoursesAlternate")}
        shortcut
        onSelectItem={onSelect}
        emptyMessage={copy("noRelatedCoursesFound")}
      />

      {open && (
        <div className="sticky top-16 z-20 border-b border-border bg-surface/95 backdrop-blur-md md:hidden">
          <Stack direction="column" gap={1} className="px-4 py-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setCmdOpen(true);
              }}
              className="flex items-center gap-2 rounded-[var(--radius)] px-2 py-2 text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground"
            >
              <Search className="size-4" aria-hidden /> {copy("searchCourses")}
            </button>
            {primaryNav.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-[var(--radius)] px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </Stack>
        </div>
      )}
    </>
  );
}

function LearnFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Stack direction="row" justify="between" align="start" wrap gap={6}>
          <div className="max-w-xs">
            <Logo />
            <Text tone="muted" size="sm" className="mt-3">
              {brand.slogan} {copy("thisPlatformIsAHulianuiUiDemoAndTheCourse")}
            </Text>
          </div>
          <Stack direction="row" gap={10} wrap>
            <FooterCol
              title={copy("learning")}
              links={[
                copy("courseCatalog"),
                copy("learningPath"),
                copy("certificate"),
                copy("questionBank"),
              ]}
            />
            <FooterCol
              title={copy("instructor")}
              links={[
                copy("becomeAnInstructor"),
                copy("instructorCenter"),
                copy("courseStandards"),
                copy("earningsRules"),
              ]}
            />
            <FooterCol
              title={copy("aboutHanxue")}
              links={[
                copy("aboutUs"),
                copy("joinUs"),
                copy("contactSupport"),
                copy("privacyPolicy"),
              ]}
            />
          </Stack>
        </Stack>
        <Divider className="my-6" />
        <Stack direction="row" justify="between" wrap gap={3} className="text-sm text-muted-foreground">
          <Text size="sm" tone="muted">
            © 2026 {brand.name} {brand.nameEn} {copy("demoSite")}
          </Text>
          <Link href="/demos" className="hover:text-foreground">
            {copy("backToDemoGallery")}
          </Link>
        </Stack>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <Text weight="semibold" size="sm" className="mb-3 text-foreground">
        {title}
      </Text>
      <Stack direction="column" gap={2}>
        {links.map((l) => (
          <Link
            key={l}
            href={LEARN_BASE}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {l}
          </Link>
        ))}
      </Stack>
    </div>
  );
}

/** 学习平台外壳：被路由组 layout 套在所有页上，内含共享学习态。 */
export function LearnShell({ children }: { children: ReactNode }) {
  return (
    <LearnStoreProvider>
      <QuestionBankProvider>
        <div className="flex min-h-dvh flex-col bg-bg">
          <LearnNavbar />
          <main className="flex-1">{children}</main>
          <LearnFooter />
          <BackTop visibilityHeight={500} />
        </div>
      </QuestionBankProvider>
    </LearnStoreProvider>
  );
}
