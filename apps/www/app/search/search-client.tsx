"use client";
import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useIntlayer } from "next-intlayer";
import { Card, Empty, Heading, Input, Tag, Text } from "@hulianui/ui";
import {
  TYPE_LABEL,
  TYPE_ORDER,
  categoriesOf,
  groupByType,
  relaxQuery,
  searchAll,
  type DocType,
} from "../../lib/search-index";
import { stripDocsBasePath, withDocsBasePath } from "../../lib/docs-locale";

// 全量搜索结果页 —— 与顶栏 ⌘K 面板共用 lib/search-index 的同一套排序，只是这里
// **状态全在 URL 上**（?q= / ?type= / ?category=），因此可后退、可刷新、可分享。
// 面板负责「快速直达」，本页负责「筛着看」。

const isDocType = (v: string | null): v is DocType => !!v && (TYPE_ORDER as string[]).includes(v);

export function SearchClient() {
  const content = useIntlayer("docs-search");
  const router = useRouter();
  const params = useSearchParams();

  const q = params.get("q") ?? "";
  const typeParam = params.get("type");
  const type = isDocType(typeParam) ? typeParam : null;
  // category 只在选定 type 后有意义 —— 各类型的分类空间互不相同。
  const category = type ? params.get("category") : null;

  // replace 而非 push：连续打字不该往历史里塞几十条记录（后退键会变成逐字删除）。
  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      router.replace(
        stripDocsBasePath(withDocsBasePath(next.size ? `/search?${next}` : "/search")),
        { scroll: false },
      );
    },
    [params, router],
  );

  const hits = useMemo(() => searchAll(q, { type, category }), [q, type, category]);
  const groups = useMemo(() => groupByType(hits), [hits]);
  // 各类型的命中数：即使当前只看某一类，也要让人看到「别的类里还有货」。
  const countByType = useMemo(() => {
    const all = searchAll(q);
    return Object.fromEntries(
      TYPE_ORDER.map((t) => [t, all.filter((h) => h.type === t).length]),
    ) as Record<DocType, number>;
  }, [q]);

  const relaxed = useMemo(() => (hits.length === 0 && q.trim() ? relaxQuery(q) : null), [hits, q]);
  const categories = type ? categoriesOf(type) : [];
  const filtering = Boolean(type || category);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      <Heading level={1} size="3xl">
        {content.pageTitle}
      </Heading>
      <Text tone="muted" className="mt-2">
        {content.pageDescription}
      </Text>

      <div className="mt-6">
        <Input
          value={q}
          onChange={(e) => setParams({ q: e.target.value })}
          placeholder={content.inputPlaceholder}
          aria-label={content.inputLabel}
          prefix={<Search className="size-4" aria-hidden />}
        />
      </div>

      {/* 类型筛选：始终展示全部五类及其命中数，选中项再展开该类的分类芯片。 */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <FilterChip active={!type} onClick={() => setParams({ type: null, category: null })}>
          {content.all} {hitsLabel(TYPE_ORDER.reduce((n, t) => n + countByType[t], 0))}
        </FilterChip>
        {TYPE_ORDER.map((t) => (
          <FilterChip
            key={t}
            active={type === t}
            disabled={countByType[t] === 0}
            onClick={() => setParams({ type: type === t ? null : t, category: null })}
          >
            {TYPE_LABEL[t]} {hitsLabel(countByType[t])}
          </FilterChip>
        ))}
      </div>

      {categories.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <FilterChip active={!category} onClick={() => setParams({ category: null })}>
            {content.allCategories}
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.key}
              active={category === c.key}
              onClick={() => setParams({ category: category === c.key ? null : c.key })}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
      )}

      {hits.length === 0 ? (
        <div className="mt-10">
          <Empty
            title={
              q.trim() ? content.emptyQueryMatch.replace("{query}", q.trim()) : content.emptyQuery
            }
            description={filtering ? content.emptyFilteredDescription : content.emptyDescription}
          />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {filtering && (
              <FilterChip active={false} onClick={() => setParams({ type: null, category: null })}>
                {content.clearFilters}
              </FilterChip>
            )}
            {relaxed && (
              <FilterChip active={false} onClick={() => setParams({ q: relaxed })}>
                {content.tryQuery.replace("{query}", relaxed)}
              </FilterChip>
            )}
            <LinkChip href="/pages">{content.browsePages}</LinkChip>
            <LinkChip href="/blocks">{content.browseBlocks}</LinkChip>
            <LinkChip href="/components">{content.browseComponents}</LinkChip>
            <LinkChip href={withDocsBasePath("/registry.json")} external>
              {content.registry}
            </LinkChip>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map((g) => (
            <section key={g.type}>
              <Heading level={2} size="lg" className="mb-3">
                {TYPE_LABEL[g.type]}
                <span className="ml-2 text-sm font-normal text-muted tabular-nums">
                  {g.hits.length}
                </span>
              </Heading>
              <ul className="grid gap-3 sm:grid-cols-2">
                {g.hits.map((h) => (
                  <li key={h.id}>
                    <Card
                      variant="outline"
                      className="group relative h-full p-4 transition-colors hover:bg-surface-hover focus-within:ring-2 focus-within:ring-ring"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium">{h.title}</span>
                        {h.en && (
                          <span className="shrink-0 font-mono text-xs text-muted">{h.en}</span>
                        )}
                      </div>
                      <Text tone="muted" size="sm" className="mt-1 line-clamp-2">
                        {h.description}
                      </Text>
                      {h.categoryLabel && (
                        <Tag variant="soft" tone="neutral" size="sm" className="mt-2">
                          {h.categoryLabel}
                        </Tag>
                      )}
                      {/* stretched-link：整卡可点但不做内容祖先，避免卡内元素被嵌进 <a>。 */}
                      <Link
                        href={stripDocsBasePath(h.href)}
                        aria-label={h.title}
                        className="absolute inset-0 rounded-[inherit] focus:outline-none"
                      />
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

const hitsLabel = (n: number) => (n > 0 ? `(${n})` : "");

function FilterChip({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted hover:bg-surface-hover hover:text-foreground"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

function LinkChip({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  const cls =
    "inline-flex items-center rounded-full border border-border px-3 py-1 text-sm text-muted outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring";
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
