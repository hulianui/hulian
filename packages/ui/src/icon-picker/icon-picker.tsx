"use client";
import { useMemo, useState, type ReactNode } from "react";
import { Search, X } from "../_icons";
import { Input } from "../input/input";
import { cn } from "../lib/cn";
import type { IconPickerProps, IconPickerSource } from "./icon-picker.types";

// 图标选择器：分类页签 + 搜索 + 网格 + 最近使用，结构照 EmojiPicker。
//
// 关键分工：**图标集不进组件库**。`sources[].renderIcon` 把「名字 → 节点」的映射交给消费方，
// 于是 lucide / iconfont / 本地 svg 三种来源都能接，库自身不为了一个选择器把几千个图标打进包里
// （瑚琏的 `_icons` 只有运行时必需的那几十个，明确不做图标集）。

interface Hit {
  name: string;
  source: IconPickerSource;
}

/** 命中判定：名字或别名包含查询串（大小写不敏感）。 */
function matches(icon: { name: string; keywords?: string[] }, q: string): boolean {
  if (icon.name.toLowerCase().includes(q)) return true;
  return (icon.keywords ?? []).some((k) => k.toLowerCase().includes(q));
}

export function IconPicker({
  value: valueProp,
  defaultValue,
  onValueChange,
  sources,
  columns = 8,
  searchable = true,
  searchPlaceholder = "搜索图标",
  defaultSource,
  recent: recentProp,
  onRecentChange,
  clearable = true,
  emptyMessage = "没有匹配的图标",
  className,
}: IconPickerProps) {
  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState<string | null>(defaultValue ?? null);
  const value = isControlled ? (valueProp ?? null) : internal;

  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState(defaultSource ?? sources[0]?.key);
  const [innerRecent, setInnerRecent] = useState<string[]>([]);
  const recent = recentProp ?? innerRecent;

  const q = query.trim().toLowerCase();

  // 搜索**跨全部分类**：用户按名字找图标时，心里没有「它属于哪一类」这个概念。
  const hits = useMemo<Hit[] | null>(() => {
    if (!q) return null;
    const out: Hit[] = [];
    for (const source of sources) {
      for (const icon of source.icons) {
        if (matches(icon, q)) out.push({ name: icon.name, source });
      }
    }
    return out;
  }, [q, sources]);

  const current = sources.find((s) => s.key === activeKey) ?? sources[0];

  /** 名字 → 所属来源（最近使用区要用，它只存名字不存分类）。 */
  const sourceOf = (name: string): IconPickerSource | undefined =>
    sources.find((s) => s.icons.some((i) => i.name === name));

  const commit = (next: string | null) => {
    if (!isControlled) setInternal(next);
    onValueChange?.(next);
  };

  const pick = (name: string) => {
    commit(name);
    const nextRecent = [name, ...recent.filter((x) => x !== name)].slice(0, 16);
    if (recentProp === undefined) setInnerRecent(nextRecent);
    onRecentChange?.(nextRecent);
  };

  const renderGrid = (items: Hit[], emptyHint?: ReactNode) =>
    items.length === 0 ? (
      emptyHint ? <div className="grid place-items-center py-10 text-sm text-muted">{emptyHint}</div> : null
    ) : (
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {items.map((it) => {
          const selected = it.name === value;
          return (
            <button
              key={`${it.source.key}-${it.name}`}
              type="button"
              onClick={() => pick(it.name)}
              aria-label={it.name}
              aria-pressed={selected}
              title={it.name}
              className={cn(
                "grid aspect-square place-items-center rounded-[min(var(--radius),0.5rem)] transition-colors focus-visible:outline-none [&>svg]:size-4",
                selected
                  ? "bg-primary/12 text-primary ring-1 ring-inset ring-primary"
                  : "text-foreground hover:bg-surface-hover focus-visible:bg-surface-hover",
              )}
            >
              {it.source.renderIcon(it.name)}
            </button>
          );
        })}
      </div>
    );

  // 最近使用里可能有已从 sources 里下掉的名字 → 解不出来源就跳过，不渲染半个空格子
  const recentHits: Hit[] = recent
    .map((name) => {
      const source = sourceOf(name);
      return source ? { name, source } : null;
    })
    .filter((x): x is Hit => x != null);

  return (
    <div className={cn("flex w-72 flex-col rounded-[var(--radius)] border border-border bg-surface", className)}>
      {searchable && (
        <div className="border-b border-border p-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            prefix={<Search className="size-4 text-muted" />}
          />
        </div>
      )}

      {/* 分类页签：搜索时隐藏（搜索跨全部分类，留着页签会让人以为只搜当前分类） */}
      {!q && sources.length > 1 && (
        <div className="flex items-center gap-0.5 overflow-x-auto border-b border-border px-2 py-1.5">
          {sources.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActiveKey(s.key)}
              aria-pressed={s.key === current?.key}
              title={typeof s.label === "string" ? s.label : undefined}
              className={cn(
                "shrink-0 rounded-[min(var(--radius),0.5rem)] px-2 py-1 text-xs transition-colors [&>svg]:size-4",
                s.key === current?.key ? "bg-primary/12 text-primary" : "text-muted hover:bg-surface-hover",
              )}
            >
              {s.tabIcon ?? s.label}
            </button>
          ))}
        </div>
      )}

      {clearable && value != null && (
        <div className="flex items-center justify-between gap-2 border-b border-border px-2 py-1.5 text-xs">
          <span className="flex min-w-0 items-center gap-1.5 text-muted">
            <span className="shrink-0 text-foreground [&>svg]:size-4">{sourceOf(value)?.renderIcon(value)}</span>
            <span className="truncate">{value}</span>
          </span>
          <button
            type="button"
            aria-label="清除"
            onClick={() => commit(null)}
            className="grid size-5 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      <div className="h-56 overflow-y-auto p-2">
        {q ? (
          renderGrid(hits ?? [], emptyMessage)
        ) : (
          <>
            {recentHits.length > 0 && (
              <div className="mb-2">
                <div className="px-1 pb-1 text-xs font-medium text-muted">最近使用</div>
                {renderGrid(recentHits)}
              </div>
            )}
            {current && (
              <>
                {sources.length > 1 && (
                  <div className="px-1 pb-1 text-xs font-medium text-muted">{current.label}</div>
                )}
                {renderGrid(current.icons.map((i) => ({ name: i.name, source: current })))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
