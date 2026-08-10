"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@hulianui/ui";
import { manifest, CATEGORIES, componentMeta, type CategoryKey } from "../lib/manifest";
import { DOCS_LOCALE, stripDocsBasePath } from "../lib/docs-locale";

const copy =
  DOCS_LOCALE === "en"
    ? {
        navLabel: "Component navigation",
        filterLabel: "Filter components in navigation",
        filterPlaceholder: "Filter components…",
        animated: "Animated",
        noResults: "No matching components in this navigation.",
        searchAll: "Search the whole site (pages, blocks, and templates)",
      }
    : {
        navLabel: "组件导航",
        filterLabel: "在导航中筛组件",
        filterPlaceholder: "在导航中筛组件…",
        animated: "动效",
        noResults: "导航里没有匹配的组件。",
        searchAll: "去全站搜索（含页面 / 区块 / 模版）",
      };

export function ComponentTree() {
  const pathname = usePathname();
  const barePathname = stripDocsBasePath(pathname);
  const activeSlug = barePathname.startsWith("/components/")
    ? barePathname.slice("/components/".length)
    : "";
  const activeCat = useMemo<CategoryKey | undefined>(
    () => manifest.find((m) => m.slug === activeSlug)?.category,
    [activeSlug],
  );

  const [query, setQuery] = useState("");
  const [animatedOnly, setAnimatedOnly] = useState(false);
  // 折叠态：默认只展开「当前所在大类」，其余收起 → 落地页滚动从 142 行降到个位数。
  const [openCats, setOpenCats] = useState<Set<CategoryKey>>(() =>
    activeCat ? new Set([activeCat]) : new Set(),
  );

  // 跨大类跳转时，自动展开新落点所在大类（不动用户手动展开的其它组）。
  useEffect(() => {
    if (activeCat)
      setOpenCats((prev) => (prev.has(activeCat) ? prev : new Set(prev).add(activeCat)));
  }, [activeCat]);

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || animatedOnly;
  const matches = (m: (typeof manifest)[number]) => {
    const localized = componentMeta(m);
    return (
      (!animatedOnly || m.tags?.includes("animated")) &&
      (!q ||
        m.name.toLowerCase().includes(q) ||
        localized.shortName.toLowerCase().includes(q) ||
        localized.description.toLowerCase().includes(q) ||
        localized.keywords.some((keyword) => keyword.toLowerCase().includes(q)) ||
        m.slug.includes(q))
    );
  };

  // 大类 → 命中的小类分组（空组/空大类直接剔除）
  const tree = CATEGORIES.map((cat) => {
    const groups = cat.groups
      .map((g) => ({
        ...g,
        items: manifest.filter((m) => m.category === cat.key && m.group === g.key && matches(m)),
      }))
      .filter((g) => g.items.length > 0);
    const count = groups.reduce((n, g) => n + g.items.length, 0);
    return { cat, groups, count };
  }).filter((t) => t.count > 0);

  const toggle = (key: CategoryKey) =>
    setOpenCats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  return (
    <nav aria-label={copy.navLabel} className="space-y-3">
      {/* 搜索 + 过滤：解决「我知道要哪个」的滚动 —— 输名直达，跨分组筛动效 */}
      <div className="space-y-2">
        <Input
          size="sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.filterPlaceholder}
          aria-label={copy.filterLabel}
          prefix={<Search className="size-3.5" aria-hidden />}
        />
        <button
          type="button"
          onClick={() => setAnimatedOnly((v) => !v)}
          aria-pressed={animatedOnly}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
            animatedOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3" aria-hidden />
          {copy.animated}
        </button>
      </div>

      {/* 这个框只筛**导航树**，筛不到正文的组件总览卡片 —— 旧文案「无匹配组件」会让人
          以为全站没有，而真正想找的整页/区块/模版就在别的货架上。空态直接给全站搜索出口。 */}
      {tree.length === 0 && (
        <div className="px-2 py-6 text-sm text-muted-foreground">
          <p>{copy.noResults}</p>
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            className="mt-2 inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {copy.searchAll}
          </Link>
        </div>
      )}

      {tree.map(({ cat, groups, count }) => {
        const open = filtering || openCats.has(cat.key);
        const firstItem = groups[0]?.items[0];
        const categoryLabel = firstItem ? componentMeta(firstItem).categoryLabel : cat.label;
        return (
          <div key={cat.key}>
            <button
              type="button"
              onClick={() => toggle(cat.key)}
              aria-expanded={open}
              // 层级靠**字重 + 色阶**建立，不靠缩小字号：条目是可点击目标，14px 已是合理下限，
              // 缩了更难点也更难读。此前一级分类 12px、二级分组 11px、条目 14px —— 层级越高
              // 字越小，正好反过来（#125）。
              //
              // uppercase + tracking-wide 是 shadcn / 英文文档站的分类标题写法，在英文里靠全大写
              // 加字距形成「标签感」，小字号也压得住；中文里 uppercase 完全无效、tracking-wide
              // 只是把字散开，于是退化成「一个比正文更小的灰字」，压不住下面的条目。故只在英文站保留。
              className={`flex w-full items-center gap-1.5 rounded-[var(--radius)] px-2 py-1.5 text-sm font-semibold text-foreground transition-colors hover:bg-surface-hover ${
                DOCS_LOCALE === "en" ? "uppercase tracking-wide" : ""
              }`}
            >
              <ChevronRight
                className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
                aria-hidden
              />
              <span>{categoryLabel}</span>
              {/* 计数是次级信息，随分类标题一起变重会喧宾夺主 —— 保持常规字重 + 弱色阶。 */}
              <span className="ml-auto text-xs font-normal tabular-nums text-muted-foreground">{count}</span>
            </button>

            {open && (
              <div className="mt-1 space-y-2">
                {groups.map((g) => (
                  <div key={g.key}>
                    <h4 className="px-2 pb-0.5 pl-7 text-xs font-medium text-muted-foreground">
                      {componentMeta(g.items[0]).groupLabel}
                    </h4>
                    <ul className="space-y-0.5">
                      {g.items.map((m) => {
                        const localized = componentMeta(m);
                        // 裸路径：Next <Link> 自己会补 basePath（/en），再手工 withDocsBasePath
                        // 就成了 /en/en/...。静态资源（img src 之类）才需要手工补。
                        const href = `/components/${m.slug}`;
                        const active = barePathname === `/components/${m.slug}`;
                        return (
                          <li key={m.slug}>
                            <Link
                              href={href}
                              className={`flex min-h-11 items-center gap-2 rounded-[var(--radius)] py-1.5 pl-7 pr-2 text-sm transition-colors ${
                                active
                                  ? "bg-surface-hover font-medium text-foreground"
                                  : "text-muted-foreground hover:bg-surface-hover hover:text-foreground"
                              }`}
                            >
                              {/* 中文名可截断（min-w-0 + truncate）：名字本身按 ≤6 汉字维护，
                                  这里只是防复发的兜底——再长也只是省略号，不会把英文名挤出行外。 */}
                              <span className="flex min-w-0 items-center gap-1.5 truncate whitespace-nowrap">
                                {localized.shortName}
                                {m.tags?.includes("animated") && (
                                  <Sparkles
                                    className="size-3 shrink-0 text-primary/60"
                                    aria-label={copy.animated}
                                  />
                                )}
                              </span>
                              {m.name !== localized.shortName && (
                                <span className="ml-auto min-w-0 truncate text-xs text-muted-foreground">
                                  {m.name}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
