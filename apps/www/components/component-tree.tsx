"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ChevronRight, Sparkles } from "lucide-react";
import { Input } from "@hulianui/ui";
import { manifest, CATEGORIES, type CategoryKey } from "../lib/manifest";

const nameCn = (description: string) => description.split(" · ")[0];

export function ComponentTree() {
  const pathname = usePathname();
  const activeSlug = pathname.startsWith("/components/") ? pathname.slice("/components/".length) : "";
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
    if (activeCat) setOpenCats((prev) => (prev.has(activeCat) ? prev : new Set(prev).add(activeCat)));
  }, [activeCat]);

  const q = query.trim().toLowerCase();
  const filtering = q !== "" || animatedOnly;
  const matches = (m: (typeof manifest)[number]) =>
    (!animatedOnly || m.tags?.includes("animated")) &&
    (!q ||
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.slug.includes(q));

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
    <nav className="space-y-3">
      {/* 搜索 + 过滤：解决「我知道要哪个」的滚动 —— 输名直达，跨分组筛动效 */}
      <div className="space-y-2">
        <Input
          size="sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="在导航中筛组件…"
          aria-label="在导航中筛组件"
          prefix={<Search className="size-3.5" aria-hidden />}
        />
        <button
          type="button"
          onClick={() => setAnimatedOnly((v) => !v)}
          aria-pressed={animatedOnly}
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors ${
            animatedOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted hover:bg-surface-hover hover:text-foreground"
          }`}
        >
          <Sparkles className="size-3" aria-hidden />
          动效
        </button>
      </div>

      {/* 这个框只筛**导航树**，筛不到正文的组件总览卡片 —— 旧文案「无匹配组件」会让人
          以为全站没有，而真正想找的整页/区块/模版就在别的货架上。空态直接给全站搜索出口。 */}
      {tree.length === 0 && (
        <div className="px-2 py-6 text-sm text-muted">
          <p>导航里没有匹配的组件。</p>
          <Link
            href={`/search?q=${encodeURIComponent(query.trim())}`}
            className="mt-2 inline-flex items-center rounded-full border border-border px-2.5 py-1 text-xs outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            去全站搜索（含页面 / 区块 / 模版）
          </Link>
        </div>
      )}

      {tree.map(({ cat, groups, count }) => {
        const open = filtering || openCats.has(cat.key);
        return (
          <div key={cat.key}>
            <button
              type="button"
              onClick={() => toggle(cat.key)}
              aria-expanded={open}
              className="flex w-full items-center gap-1.5 rounded-[var(--radius)] px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              <ChevronRight
                className={`size-3.5 shrink-0 transition-transform ${open ? "rotate-90" : ""}`}
                aria-hidden
              />
              <span>{cat.label}</span>
              <span className="ml-auto tabular-nums text-muted">{count}</span>
            </button>

            {open && (
              <div className="mt-1 space-y-2">
                {groups.map((g) => (
                  <div key={g.key}>
                    <h4 className="px-2 pb-0.5 pl-7 text-[11px] font-medium text-muted">{g.label}</h4>
                    <ul className="space-y-0.5">
                      {g.items.map((m) => {
                        const href = `/components/${m.slug}`;
                        const active = pathname === href;
                        return (
                          <li key={m.slug}>
                            <Link
                              href={href}
                              className={`flex items-center gap-2 rounded-[var(--radius)] py-1.5 pl-7 pr-2 text-sm transition-colors ${
                                active
                                  ? "bg-surface-hover font-medium text-foreground"
                                  : "text-muted hover:bg-surface-hover hover:text-foreground"
                              }`}
                            >
                              {/* 中文名可截断（min-w-0 + truncate）：名字本身按 ≤6 汉字维护，
                                  这里只是防复发的兜底——再长也只是省略号，不会把英文名挤出行外。 */}
                              <span className="flex min-w-0 items-center gap-1.5 truncate whitespace-nowrap">
                                {nameCn(m.description)}
                                {m.tags?.includes("animated") && (
                                  <Sparkles className="size-3 shrink-0 text-primary/60" aria-label="动效" />
                                )}
                              </span>
                              <span className="ml-auto min-w-0 truncate text-xs text-muted">{m.name}</span>
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
