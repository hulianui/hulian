"use client";
import { useCallback, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Empty, Input } from "@hulianui/ui";
import { useIntlayer } from "next-intlayer";
import { categoriesOf, searchAll, type DocType } from "../lib/search-index";

// 画廊的搜索 / 分类筛选 —— /blocks 与 /pages 共用。
//
// 排序与匹配直接复用 lib/search-index（与顶栏 ⌘K、/search 同一套），
// 所以「在画廊里搜」和「在全站搜」不会给出两种答案。
// 状态放 URL（?q= / ?category=），刷新、后退、分享都还原得回来。
//
// 卡片本身仍由 server 组件渲染好后按 slug 传进来：预览是 RSC 区块/页面，
// 不能挪进 client 模块（那会把 RSC 组件拖过边界直接报错）。这里只决定**显示哪几张**。

export function GalleryBrowser({
  type,
  items,
  cards,
  placeholder,
}: {
  type: Extract<DocType, "block" | "page">;
  /** 与 cards 同源的元数据，用于渲染顺序与空态；必须是可序列化的纯数据。 */
  items: Array<{ slug: string; category: string }>;
  /** slug → 已渲染好的卡片。 */
  cards: Record<string, ReactNode>;
  placeholder: string;
}) {
  const blocksContent = useIntlayer("blocks").index;
  const pagesContent = useIntlayer("pages").index;
  const content = type === "block" ? blocksContent : pagesContent;
  const router = useRouter();
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category");

  const setParams = useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value) next.set(key, value);
        else next.delete(key);
      }
      const base = type === "block" ? "/blocks" : "/pages";
      router.replace(next.size ? `${base}?${next}` : base, { scroll: false });
    },
    [params, router, type],
  );

  const categories = useMemo(() => categoriesOf(type), [type]);

  // 命中集 + 相关度序：有搜索词时按相关度重排，无搜索词时保持画廊原有的叙事顺序。
  const visible = useMemo(() => {
    const hits = searchAll(q, { type, category });
    const rank = new Map(hits.map((h, i) => [h.href.split("/").pop() ?? "", i]));
    const kept = items.filter((i) => rank.has(i.slug));
    return q.trim() ? kept.sort((a, b) => rank.get(a.slug)! - rank.get(b.slug)!) : kept;
  }, [q, category, items, type]);

  const total = items.length;

  return (
    <>
      <div className="mb-6 space-y-3">
        <Input
          value={q}
          onChange={(e) => setParams({ q: e.target.value })}
          placeholder={placeholder}
          aria-label={content.searchPlaceholder}
          prefix={<Search className="size-4" aria-hidden />}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={!category} onClick={() => setParams({ category: null })}>
            {content.all} {total}
          </Chip>
          {categories.map((c) => (
            <Chip
              key={c.key}
              active={category === c.key}
              onClick={() => setParams({ category: category === c.key ? null : c.key })}
            >
              {c.label} {items.filter((i) => i.category === c.key).length}
            </Chip>
          ))}
          {(q || category) && (
            <span className="ml-auto text-sm text-muted-foreground tabular-nums">
              {visible.length} / {total}
            </span>
          )}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="py-10">
          <Empty
            title={content.emptyTitle.replace("{query}", q.trim())}
            description={content.emptyDescription}
          />
          <div className="mt-4 flex justify-center gap-2">
            <Chip active={false} onClick={() => setParams({ q: null, category: null })}>
              {content.clear}
            </Chip>
            <Link
              href={`/search?q=${encodeURIComponent(q)}`}
              className="inline-flex items-center rounded-full border border-border px-3 py-1 text-sm text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {content.searchAll}
            </Link>
          </div>
        </div>
      ) : (
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {visible.map((i) => cards[i.slug])}
        </div>
      )}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-surface-hover hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
