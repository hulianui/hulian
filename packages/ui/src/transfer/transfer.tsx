"use client";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "../_icons";
import { Checkbox } from "../checkbox/checkbox";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { Listbox } from "../listbox/listbox";
import type { ListboxItemData } from "../listbox/listbox.types";
import { Empty } from "../empty/empty";
import type { TransferItem, TransferProps } from "./transfer.types";

// 穿梭框（零依赖）：左右两个 listbox 面板 + 中间移动按钮（→ ← 选中 / » « 全部）。
// 复用已自研 Listbox(多选) 做两侧列表、Empty 做空态；含选中/搜索状态故 "use client"。

function defaultFilter(input: string, item: TransferItem) {
  const text = typeof item.label === "string" ? item.label : item.key;
  return text.toLowerCase().includes(input.toLowerCase());
}

const ARROW = {
  "all-right": ChevronsRight,
  right: ChevronRight,
  left: ChevronLeft,
  "all-left": ChevronsLeft,
} as const;

function MoveButton({
  dir,
  onClick,
  disabled,
  label,
}: {
  dir: keyof typeof ARROW;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  const Icon = ARROW[dir];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex size-8 items-center justify-center rounded-[min(var(--radius),0.5rem)] border border-border bg-surface text-foreground transition-colors",
        "hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface",
      )}
    >
      <Icon className="size-4" aria-hidden />
    </button>
  );
}

function TransferPanel({
  title,
  items,
  selected,
  onSelectionChange,
  search,
  onSearch,
  searchable,
  searchPlaceholder,
  filterOption,
  disabled,
  listHeight,
  showSelectAll,
}: {
  title: ReactNode;
  items: TransferItem[];
  selected: string[];
  onSelectionChange: (keys: string[]) => void;
  search: string;
  onSearch: (v: string) => void;
  searchable: boolean;
  searchPlaceholder: string;
  filterOption: (input: string, item: TransferItem) => boolean;
  disabled: boolean;
  listHeight: number;
  showSelectAll: boolean;
}) {
  const locale = useComponentLocale().transfer ?? {
    allRight: "全部移入",
    right: "移入选中",
    left: "移出选中",
    allLeft: "全部移出",
    selectAll: (title) => (title ? `全选${title}` : "全选"),
    search: (title) => (title ? `搜索${title}` : "搜索"),
    noMatches: "无匹配项",
    empty: "暂无数据",
    source: "源列表",
    selected: "已选",
    searchPlaceholder: "搜索",
  };
  const filtered = search ? items.filter((it) => filterOption(search, it)) : items;
  const listItems: ListboxItemData[] = filtered.map((it) => ({
    key: it.key,
    label: it.label,
    description: it.description,
    disabled: it.disabled,
  }));
  const total = items.length;
  const selCount = selected.filter((k) => items.some((it) => it.key === k)).length;
  const titleStr = typeof title === "string" ? title : undefined;

  // 全选只作用于「当前过滤结果里的可用项」——搜出 3 条时点全选不该把看不见的另外 200 条也勾上。
  const selectableKeys = filtered.filter((it) => !it.disabled).map((it) => it.key);
  const selectedSet = new Set(selected);
  const allSelected = selectableKeys.length > 0 && selectableKeys.every((k) => selectedSet.has(k));
  const someSelected = selectableKeys.some((k) => selectedSet.has(k));
  const toggleAll = () => {
    if (allSelected) onSelectionChange(selected.filter((k) => !selectableKeys.includes(k)));
    else onSelectionChange([...new Set([...selected, ...selectableKeys])]);
  };

  return (
    <div
      className={cn(
        "flex w-56 flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
        disabled && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          {showSelectAll && (
            <Checkbox
              checked={allSelected}
              indeterminate={!allSelected && someSelected}
              disabled={disabled || selectableKeys.length === 0}
              onCheckedChange={toggleAll}
              aria-label={locale.selectAll(titleStr)}
            />
          )}
          <span className="truncate font-medium text-foreground">{title}</span>
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {selCount > 0 ? `${selCount}/${total}` : total}
        </span>
      </div>
      {searchable && (
        <div className="border-b border-border p-2">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            aria-label={locale.search(titleStr)}
            className={cn(
              "h-8 w-full rounded-[min(var(--radius),0.375rem)] border border-border bg-bg px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-surface",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          />
        </div>
      )}
      {listItems.length > 0 ? (
        <Listbox
          items={listItems}
          selectionMode="multiple"
          selectedKeys={selected}
          onSelectionChange={onSelectionChange}
          disabledKeys={disabled ? items.map((it) => it.key) : []}
          className="w-full flex-1 overflow-auto rounded-none border-0 bg-transparent"
          style={{ maxHeight: listHeight }}
          aria-label={titleStr}
        />
      ) : (
        <Empty
          size="sm"
          icon={null}
          title={search ? locale.noMatches : locale.empty}
          className="flex-1"
        />
      )}
    </div>
  );
}

export function Transfer({
  dataSource,
  targetKeys,
  defaultTargetKeys: defaultTargetKeysProp,
  onChange,
  titles,
  searchable = false,
  searchPlaceholder,
  filterOption = defaultFilter,
  listHeight = 240,
  showSelectAll = false,
  disabled = false,
  className,
  ...rest
}: TransferProps) {
  const defaultTargetKeys = defaultTargetKeysProp ?? [];
  const locale = useComponentLocale().transfer ?? {
    allRight: "全部移入",
    right: "移入选中",
    left: "移出选中",
    allLeft: "全部移出",
    selectAll: (title) => (title ? `全选${title}` : "全选"),
    search: (title) => (title ? `搜索${title}` : "搜索"),
    noMatches: "无匹配项",
    empty: "暂无数据",
    source: "源列表",
    selected: "已选",
    searchPlaceholder: "搜索",
  };
  const resolvedTitles = titles ?? [locale.source, locale.selected];
  const resolvedSearchPlaceholder = searchPlaceholder ?? locale.searchPlaceholder;
  const isControlled = targetKeys !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultTargetKeys);
  const target = isControlled ? targetKeys! : internal;

  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const targetSet = useMemo(() => new Set(target), [target]);
  const leftItems = useMemo(
    () => dataSource.filter((it) => !targetSet.has(it.key)),
    [dataSource, targetSet],
  );
  const rightItems = useMemo(
    () => dataSource.filter((it) => targetSet.has(it.key)),
    [dataSource, targetSet],
  );

  const setTarget = (next: string[], direction: "left" | "right", moved: string[]) => {
    if (!isControlled) setInternal(next);
    onChange?.(next, direction, moved);
  };

  const enabledKeys = (its: TransferItem[]) => its.filter((it) => !it.disabled).map((it) => it.key);
  const leftEnabled = enabledKeys(leftItems);
  const rightEnabled = enabledKeys(rightItems);
  // 选中态可能滞留已移走/被禁用的键 → 实际移动前与当前可移动集合求交。
  const leftMovable = leftSelected.filter((k) => leftEnabled.includes(k));
  const rightMovable = rightSelected.filter((k) => rightEnabled.includes(k));

  const moveRight = (keys: string[]) => {
    if (!keys.length) return;
    setTarget([...target, ...keys], "right", keys);
    setLeftSelected((prev) => prev.filter((k) => !keys.includes(k)));
  };
  const moveLeft = (keys: string[]) => {
    if (!keys.length) return;
    const set = new Set(keys);
    setTarget(
      target.filter((k) => !set.has(k)),
      "left",
      keys,
    );
    setRightSelected((prev) => prev.filter((k) => !keys.includes(k)));
  };

  return (
    <div {...rest} className={cn("flex items-stretch gap-3", className)}>
      <TransferPanel
        title={resolvedTitles[0]}
        items={leftItems}
        selected={leftSelected}
        onSelectionChange={setLeftSelected}
        search={leftSearch}
        onSearch={setLeftSearch}
        searchable={searchable}
        searchPlaceholder={resolvedSearchPlaceholder}
        filterOption={filterOption}
        disabled={disabled}
        listHeight={listHeight}
        showSelectAll={showSelectAll}
      />
      <div className="flex flex-col justify-center gap-2">
        <MoveButton
          dir="all-right"
          label={locale.allRight}
          onClick={() => moveRight(leftEnabled)}
          disabled={disabled || leftEnabled.length === 0}
        />
        <MoveButton
          dir="right"
          label={locale.right}
          onClick={() => moveRight(leftMovable)}
          disabled={disabled || leftMovable.length === 0}
        />
        <MoveButton
          dir="left"
          label={locale.left}
          onClick={() => moveLeft(rightMovable)}
          disabled={disabled || rightMovable.length === 0}
        />
        <MoveButton
          dir="all-left"
          label={locale.allLeft}
          onClick={() => moveLeft(rightEnabled)}
          disabled={disabled || rightEnabled.length === 0}
        />
      </div>
      <TransferPanel
        title={resolvedTitles[1]}
        items={rightItems}
        selected={rightSelected}
        onSelectionChange={setRightSelected}
        search={rightSearch}
        onSearch={setRightSearch}
        searchable={searchable}
        searchPlaceholder={resolvedSearchPlaceholder}
        filterOption={filterOption}
        disabled={disabled}
        listHeight={listHeight}
        showSelectAll={showSelectAll}
      />
    </div>
  );
}
