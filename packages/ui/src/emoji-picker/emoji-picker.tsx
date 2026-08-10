"use client";
import { useMemo, useState } from "react";
import { Search } from "../_icons";
import { cn } from "../lib/cn";

import { useComponentLocale } from "../config/locale-context";
import { Input } from "../input/input";
import { EMOJI_CATEGORIES, ALL_EMOJI } from "./emoji-data";
import type { EmojiPickerProps } from "./emoji-picker.types";

// 表情选择器：内联 emoji 数据集 + 分类页签 + 关键词搜索 + 最近使用。零依赖。
// 搜索框 dogfood 瑚琏 Input；emoji 网格用纯 grid + overflow 滚动。
export function EmojiPicker({
  onSelect,
  columns = 8,
  searchable = true,
  defaultCategory,
  recent: recentProp,
  searchPlaceholder,
  className,
}: EmojiPickerProps) {
  const copy = useComponentLocale().emojiPicker ?? {
    search: "搜索表情",
    noResults: "没有匹配的表情",
    recentlyUsed: "最近使用",
    categories: {
      smileys: "笑脸",
      gestures: "手势",
      animals: "动物",
      food: "食物",
      activity: "活动",
      objects: "物品",
      symbols: "符号",
    },
  };
  const searchLabel = searchPlaceholder ?? copy.search;
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState(defaultCategory ?? EMOJI_CATEGORIES[0].key);
  // 受控 recent 用 prop；否则内部维护（最多 16 个，最新在前）
  const [innerRecent, setInnerRecent] = useState<string[]>([]);
  const recent = recentProp ?? innerRecent;

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return null;
    return ALL_EMOJI.filter((it) => it.e === query || it.k.toLowerCase().includes(q));
  }, [q, query]);

  const current = EMOJI_CATEGORIES.find((c) => c.key === activeCat) ?? EMOJI_CATEGORIES[0];

  const pick = (e: string) => {
    onSelect?.(e);
    if (recentProp === undefined) {
      setInnerRecent((prev) => [e, ...prev.filter((x) => x !== e)].slice(0, 16));
    }
  };

  const renderGrid = (items: { e: string }[], emptyHint: string) =>
    items.length === 0 ? (
      <div className="grid h-full place-items-center py-10 text-sm text-muted-foreground">{emptyHint}</div>
    ) : (
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {items.map((it, i) => (
          <button
            key={`${it.e}-${i}`}
            type="button"
            onClick={() => pick(it.e)}
            aria-label={it.e}
            className="grid aspect-square place-items-center rounded-[min(var(--radius),0.5rem)] text-xl leading-none transition-colors hover:bg-surface-hover focus-visible:bg-surface-hover focus-visible:outline-none"
          >
            {it.e}
          </button>
        ))}
      </div>
    );

  return (
    <div
      className={cn(
        "flex w-72 flex-col rounded-[var(--radius)] border border-border bg-surface",
        className,
      )}
    >
      {searchable && (
        <div className="border-b border-border p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchLabel}
            aria-label={searchLabel}
            prefix={<Search className="size-4 text-muted-foreground" />}
          />
        </div>
      )}

      {/* 分类页签：搜索时隐藏 */}
      {!q && (
        <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5">
          {EMOJI_CATEGORIES.map((c) => {
            const categoryLabel = copy.categories[c.key as keyof typeof copy.categories] ?? c.label;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setActiveCat(c.key)}
                aria-label={categoryLabel}
                aria-pressed={c.key === activeCat}
                title={categoryLabel}
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-[min(var(--radius),0.5rem)] text-lg leading-none transition-colors",
                  c.key === activeCat ? "bg-primary/12" : "hover:bg-surface-hover",
                )}
              >
                {c.icon}
              </button>
            );
          })}
        </div>
      )}

      <div className="h-56 overflow-y-auto p-2">
        {q ? (
          renderGrid(filtered ?? [], copy.noResults)
        ) : (
          <>
            {recent.length > 0 && (
              <div className="mb-2">
                <div className="px-1 pb-1 text-xs font-medium text-muted-foreground">{copy.recentlyUsed}</div>
                {renderGrid(
                  recent.map((e) => ({ e })),
                  "",
                )}
              </div>
            )}
            <div className="px-1 pb-1 text-xs font-medium text-muted-foreground">
              {copy.categories[current.key as keyof typeof copy.categories] ?? current.label}
            </div>
            {renderGrid(current.items, "")}
          </>
        )}
      </div>
    </div>
  );
}
