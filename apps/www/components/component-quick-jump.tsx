"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { DOCS_LOCALE, stripDocsBasePath } from "../lib/docs-locale";
import { searchAll, searchDocs, type SearchDoc } from "../lib/search-index";

export type ComponentQuickJumpPlacement = "home" | "catalog" | "navbar";

export const COMPONENT_RECENT_STORAGE_KEY = "hulian-docs-recent-components";

const COMPONENT_DOCS = searchDocs.filter((doc) => doc.type === "component");
const POPULAR_SLUGS = ["button", "input", "pro-table", "dialog"];
const MAX_RESULTS = 8;
const MAX_RECENT = 4;

const copy =
  DOCS_LOCALE === "en"
    ? {
        label: "Quick jump to a component",
        placeholder: "Jump to Button, DataTable, Dialog…",
        trigger: "Jump to component",
        results: "Components",
        recent: "Recently visited",
        popular: "Popular components",
        noResults: "No component found. Try an export name or slug.",
      }
    : {
        label: "快速跳转组件",
        placeholder: "输入 Button、数据表格或 dialog…",
        trigger: "跳转组件",
        results: "组件",
        recent: "最近访问",
        popular: "常用组件",
        noResults: "没有找到组件，试试导出名或 slug。",
      };

function slugOf(doc: SearchDoc): string {
  return doc.id.slice("component:".length);
}

function normalizeIdentity(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_-]+/g, "");
}

/** Resolve only a real component identity, never category/group/tag/search metadata. */
export function findExactComponent(query: string): SearchDoc | null {
  const normalized = normalizeIdentity(query);
  if (!normalized) return null;

  const identities = COMPONENT_DOCS.filter((doc) =>
    [doc.en, doc.title, slugOf(doc), ...(doc.identityAliases ?? [])]
      .filter((value): value is string => Boolean(value))
      .some((value) => normalizeIdentity(value) === normalized),
  );
  return identities.length === 1 ? identities[0] : null;
}

function docsForSlugs(slugs: string[]): SearchDoc[] {
  const positions = new Map(slugs.map((slug, index) => [slug, index]));
  return COMPONENT_DOCS.filter((doc) => positions.has(slugOf(doc))).sort(
    (a, b) => positions.get(slugOf(a))! - positions.get(slugOf(b))!,
  );
}

function readRecentSlugs(): string[] {
  try {
    const value = window.localStorage.getItem(COMPONENT_RECENT_STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((slug): slug is string => typeof slug === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

function rememberComponent(slug: string): void {
  try {
    const recent = readRecentSlugs().filter((item) => item !== slug);
    window.localStorage.setItem(
      COMPONENT_RECENT_STORAGE_KEY,
      JSON.stringify([slug, ...recent].slice(0, MAX_RECENT)),
    );
  } catch {
    // Storage is an enhancement only. The anchor/router navigation must remain usable.
  }
}

function optionName(doc: SearchDoc): string {
  return doc.en && doc.en !== doc.title ? `${doc.title} · ${doc.en}` : doc.title;
}

export function ComponentQuickJump({ placement }: { placement: ComponentQuickJumpPlacement }) {
  const router = useRouter();
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(placement !== "navbar");
  const [active, setActive] = useState(-1);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);

  useEffect(() => {
    setRecentSlugs(readRecentSlugs());
  }, []);

  const results = useMemo(
    () => (query.trim() ? searchAll(query, { type: "component", limit: MAX_RESULTS }) : []),
    [query],
  );
  const recent = useMemo(() => docsForSlugs(recentSlugs), [recentSlugs]);
  const popular = useMemo(
    () => docsForSlugs(POPULAR_SLUGS.filter((slug) => !recentSlugs.includes(slug))),
    [recentSlugs],
  );
  const options = query.trim() ? results : [...recent, ...popular];
  const activeId = open && active >= 0 ? `${baseId}-option-${active}` : undefined;

  const navigate = (doc: SearchDoc) => {
    rememberComponent(slugOf(doc));
    setOpen(false);
    // Next's router adds the build basePath. searchDocs hrefs are already localized for raw/SSR
    // anchors, so strip it only at this client-router boundary to avoid `/en/en/...`.
    router.push(stripDocsBasePath(doc.href));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      setActive(-1);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (options.length === 0) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setOpen(true);
      setActive((current) => {
        if (current < 0) return direction === 1 ? 0 : options.length - 1;
        return (current + direction + options.length) % options.length;
      });
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const exact = findExactComponent(query);
      if (exact) {
        navigate(exact);
        return;
      }
      if (active >= 0 && options[active]) navigate(options[active]);
    }
  };

  const input = (
    <div className="flex h-11 items-center gap-2 border-b border-border px-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring">
      <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <input
        ref={inputRef}
        id={`${baseId}-input`}
        role="combobox"
        aria-label={copy.label}
        aria-expanded={open}
        aria-controls={`${baseId}-listbox`}
        aria-activedescendant={activeId}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        value={query}
        placeholder={copy.placeholder}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        className="h-full min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
      <kbd className="hidden text-[11px] text-muted-foreground sm:inline">Enter</kbd>
    </div>
  );

  const listbox = (
    <div
      id={`${baseId}-listbox`}
      role="listbox"
      aria-label={copy.label}
      hidden={!open}
      className="max-h-80 overflow-y-auto p-1"
    >
      {query.trim() ? (
        results.length > 0 ? (
          <OptionGroup
            heading={copy.results}
            docs={results}
            offset={0}
            active={active}
            baseId={baseId}
            onActive={setActive}
            onRemember={rememberComponent}
          />
        ) : (
          <p className="px-3 py-5 text-sm text-muted-foreground">{copy.noResults}</p>
        )
      ) : (
        <>
          {recent.length > 0 && (
            <OptionGroup
              heading={copy.recent}
              docs={recent}
              offset={0}
              active={active}
              baseId={baseId}
              onActive={setActive}
              onRemember={rememberComponent}
            />
          )}
          <OptionGroup
            heading={copy.popular}
            docs={popular}
            offset={recent.length}
            active={active}
            baseId={baseId}
            onActive={setActive}
            onRemember={rememberComponent}
          />
        </>
      )}
    </div>
  );

  if (placement === "navbar") {
    return (
      // 窄屏隐藏：本入口与右侧的全站搜索都会收成一枚 lucide-search 图标，并排在一起
      // 无从分辨（H5 上实测两枚图标相距 44px、完全同形）。全站搜索是功能超集 —— 它的
      // 索引里本就含 component:*，组件照样搜得到；而本入口的价值在 ⌘K 直达，窄屏没有
      // 键盘快捷键，收益本就低。故 sm 以下只留全站搜索那一枚。
      <div className="relative hidden shrink-0 sm:block">
        <button
          type="button"
          aria-label={copy.label}
          aria-expanded={open}
          aria-controls={`${baseId}-panel`}
          onClick={() => {
            setOpen((value) => !value);
            requestAnimationFrame(() => inputRef.current?.focus());
          }}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-hairline bg-surface px-3 text-sm text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Search className="size-4" aria-hidden />
          <span className="hidden 2xl:inline">{copy.trigger}</span>
        </button>
        <div
          id={`${baseId}-panel`}
          hidden={!open}
          className="absolute right-0 top-full z-30 mt-2 w-[min(26rem,calc(100vw-1rem))] overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface shadow-lg"
        >
          {input}
          {listbox}
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        placement === "catalog"
          ? "w-full overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface"
          : "w-full border-y border-border bg-surface/40"
      }
    >
      {input}
      {listbox}
    </div>
  );
}

function OptionGroup({
  heading,
  docs,
  offset,
  active,
  baseId,
  onActive,
  onRemember,
}: {
  heading: string;
  docs: SearchDoc[];
  offset: number;
  active: number;
  baseId: string;
  onActive: (index: number) => void;
  onRemember: (slug: string) => void;
}) {
  return (
    <div role="group" aria-label={heading} className="py-1">
      <p className="px-2 pb-1 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {heading}
      </p>
      {docs.map((doc, localIndex) => {
        const index = offset + localIndex;
        const selected = index === active;
        return (
          <a
            key={`${heading}-${doc.id}`}
            id={`${baseId}-option-${index}`}
            role="option"
            aria-selected={selected}
            href={doc.href}
            onMouseMove={() => onActive(index)}
            onFocus={() => onActive(index)}
            onClick={() => onRemember(slugOf(doc))}
            className={`flex min-h-11 items-center gap-3 rounded-[min(var(--radius),0.375rem)] px-2 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
              selected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-surface-hover"
            }`}
          >
            <span className="min-w-0 flex-1 truncate font-medium">{optionName(doc)}</span>
            <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{slugOf(doc)}</span>
          </a>
        );
      })}
    </div>
  );
}
