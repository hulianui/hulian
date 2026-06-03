"use client";
import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
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
  "all-right": { Icon: ChevronsRight, label: "全部移入" },
  right: { Icon: ChevronRight, label: "移入选中" },
  left: { Icon: ChevronLeft, label: "移出选中" },
  "all-left": { Icon: ChevronsLeft, label: "全部移出" },
} as const;

function MoveButton({
  dir,
  onClick,
  disabled,
}: {
  dir: keyof typeof ARROW;
  onClick: () => void;
  disabled: boolean;
}) {
  const { Icon, label } = ARROW[dir];
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
}) {
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

  return (
    <div
      className={cn(
        "flex w-56 flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-surface",
        disabled && "opacity-60",
      )}
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2 text-sm">
        <span className="truncate font-medium text-foreground">{title}</span>
        <span className="ml-2 shrink-0 text-xs text-muted">{selCount > 0 ? `${selCount}/${total}` : total}</span>
      </div>
      {searchable && (
        <div className="border-b border-border p-2">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            aria-label={titleStr ? `搜索${titleStr}` : "搜索"}
            className={cn(
              "h-8 w-full rounded-[min(var(--radius),0.375rem)] border border-border bg-bg px-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted",
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
          className="max-h-60 w-full flex-1 rounded-none border-0 bg-transparent"
          aria-label={titleStr}
        />
      ) : (
        <Empty size="sm" icon={null} title={search ? "无匹配项" : "暂无数据"} className="flex-1" />
      )}
    </div>
  );
}

export function Transfer({
  dataSource,
  targetKeys,
  defaultTargetKeys = [],
  onChange,
  titles = ["源列表", "已选"],
  searchable = false,
  searchPlaceholder = "搜索",
  filterOption = defaultFilter,
  disabled = false,
  className,
}: TransferProps) {
  const isControlled = targetKeys !== undefined;
  const [internal, setInternal] = useState<string[]>(defaultTargetKeys);
  const target = isControlled ? targetKeys! : internal;

  const [leftSelected, setLeftSelected] = useState<string[]>([]);
  const [rightSelected, setRightSelected] = useState<string[]>([]);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");

  const targetSet = useMemo(() => new Set(target), [target]);
  const leftItems = useMemo(() => dataSource.filter((it) => !targetSet.has(it.key)), [dataSource, targetSet]);
  const rightItems = useMemo(() => dataSource.filter((it) => targetSet.has(it.key)), [dataSource, targetSet]);

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
    <div className={cn("flex items-stretch gap-3", className)}>
      <TransferPanel
        title={titles[0]}
        items={leftItems}
        selected={leftSelected}
        onSelectionChange={setLeftSelected}
        search={leftSearch}
        onSearch={setLeftSearch}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        filterOption={filterOption}
        disabled={disabled}
      />
      <div className="flex flex-col justify-center gap-2">
        <MoveButton dir="all-right" onClick={() => moveRight(leftEnabled)} disabled={disabled || leftEnabled.length === 0} />
        <MoveButton dir="right" onClick={() => moveRight(leftMovable)} disabled={disabled || leftMovable.length === 0} />
        <MoveButton dir="left" onClick={() => moveLeft(rightMovable)} disabled={disabled || rightMovable.length === 0} />
        <MoveButton dir="all-left" onClick={() => moveLeft(rightEnabled)} disabled={disabled || rightEnabled.length === 0} />
      </div>
      <TransferPanel
        title={titles[1]}
        items={rightItems}
        selected={rightSelected}
        onSelectionChange={setRightSelected}
        search={rightSearch}
        onSearch={setRightSearch}
        searchable={searchable}
        searchPlaceholder={searchPlaceholder}
        filterOption={filterOption}
        disabled={disabled}
      />
    </div>
  );
}
