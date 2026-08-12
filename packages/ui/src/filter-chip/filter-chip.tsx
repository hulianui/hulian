"use client";
import { Children, memo } from "react";
import { X } from "../_icons";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { pressableClass } from "../motion";
import type { FilterChipGroupProps, FilterChipProps } from "./filter-chip.types";

// FilterChip = 已应用筛选条件胶囊：主语 ｜ 操作符 ｜ 值 ｜ ×，段间竖分隔线。
//
// 为什么不是 Chip 加能力：Chip 是**单段**令牌（pill 圆角 + 一段 children + 前后缀），
// 表达的是「一个可被移除的标签实体」；这里表达的是「一条结构化的筛选条件」——三段各有
// 自己的字重与色阶（主语最重 / 操作符最弱 / 值常规）、段间有竖线、整段可点重开筛选菜单。
// 把这些塞进 Chip 需要给它加 subject/operator/divider 一整套正交 props，而 Chip 有 190 处
// 调用点，任何默认观感变动的爆炸半径都在那里。故新建一件，Chip 保持单段语义不动。
//
// 与 SearchForm 的关系：SearchForm 是筛选的**输入侧**（选参数 → onSearch），
// 这件是**回显侧**（当前生效了什么、点一下撤掉哪一条），两者配套用在列表页顶部。

// 尺寸只影响高度/字号/段内边距，不影响结构。md 对齐 Tag 的字号刻度：三段并排本就长，
// 字号跟着高度一起放大会让一行放不下几条。
const sizeClass = { sm: "h-6 text-[11px]", md: "h-7 text-xs" } as const;
const padClass = { sm: "px-1.5", md: "px-2" } as const;
const removeWidth = { sm: "w-6", md: "w-7" } as const;
const iconSize = { sm: "size-2.5", md: "size-3" } as const;

// 竖分隔线用 self-stretch 而不是 h-full：本体在 onClick 分支里会多套一层 flex，
// h-100% 在嵌套 flex 里解析基准会漂，self-stretch 永远贴满交叉轴。
function Divider() {
  return <span className="w-px shrink-0 self-stretch bg-border" aria-hidden />;
}

function FilterChipImpl({
  subject,
  operator,
  value,
  size = "md",
  onRemove,
  onClick,
  subjectLabel,
  isDisabled,
  className,
}: FilterChipProps) {
  const labels = {
    remove: (s: string) => `移除筛选条件：${s}`,
    removeFallback: "移除筛选条件",
    ...useComponentLocale().filterChip,
  };
  const pad = padClass[size];
  const segments = (
    <>
      <span className={cn(pad, "font-medium text-foreground")}>{subject}</span>
      {operator != null && (
        <>
          <Divider />
          <span className={cn(pad, "text-muted-foreground")}>{operator}</span>
        </>
      )}
      <Divider />
      <span className={cn(pad, "flex items-center gap-1 text-foreground")}>{value}</span>
    </>
  );
  // 本体与 × 是**兄弟**：× 不在本体按钮内部，故点 × 天然不会冒泡触发 onClick，
  // 消费方不必自己记得 stopPropagation；同时也避免了 button 套 button 的非法嵌套。
  // 圆角按「谁在边上」分左右继承，而不是整块 rounded-[inherit]：否则本体 hover 底色的右侧
  // 会在胶囊中段无端圆一下。也因此不给容器加 overflow-hidden —— 那会把内部按钮的焦点环裁掉。
  const bodyClass = cn(
    "flex h-full min-w-0 items-center rounded-l-[inherit] outline-none",
    !onRemove && "rounded-r-[inherit]",
  );
  return (
    <span
      className={cn(
        // 静息态控件（同搜索框/选择器触发器），故用 border-border 而非「有阴影就转 hairline」那条：
        // 它不是浮起的卡片，亮色下必须自己有边界才看得见。
        "inline-flex items-center whitespace-nowrap rounded-[calc(var(--radius)-0.25rem)] border border-border bg-surface",
        sizeClass[size],
        isDisabled && "pointer-events-none opacity-50",
        className,
      )}
      aria-disabled={isDisabled || undefined}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          disabled={isDisabled}
          className={cn(
            bodyClass,
            pressableClass,
            "hover:bg-surface-hover focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
          )}
        >
          {segments}
        </button>
      ) : (
        <span className={bodyClass}>{segments}</span>
      )}
      {onRemove && (
        <>
          <Divider />
          <button
            type="button"
            onClick={onRemove}
            disabled={isDisabled}
            aria-label={
              typeof subject === "string" || subjectLabel
                ? labels.remove(subjectLabel ?? String(subject))
                : labels.removeFallback
            }
            className={cn(
              "inline-flex h-full shrink-0 items-center justify-center rounded-r-[inherit] text-muted-foreground outline-none transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed",
              removeWidth[size],
            )}
          >
            <X className={iconSize[size]} />
          </button>
        </>
      )}
    </span>
  );
}
FilterChipImpl.displayName = "FilterChip";

// 筛选条一动就整排重算（每加一条筛选，同行其余胶囊的 props 一个没变却全被重渲染）。
// props 全是原语/稳定节点时 React 无法自己 bailout，只能靠 memo —— 与 Chip/Tag 同一处方。
export const FilterChip = memo(FilterChipImpl);
FilterChip.displayName = "FilterChip";

function FilterChipGroupImpl({
  onClearAll,
  clearAllLabel,
  "aria-label": ariaLabel,
  className,
  children,
}: FilterChipGroupProps) {
  const labels = {
    clearAll: "清除全部",
    group: "已应用的筛选条件",
    ...useComponentLocale().filterChip,
  };
  // toArray 会丢掉 null/false/undefined，故 `{cond && <FilterChip/>}` 全落空时这里为 0，
  // 整行（含「清除全部」）不渲染 —— 没有筛选条件时留一个孤零零的「清除全部」是错的。
  if (Children.toArray(children).length === 0) return null;
  return (
    <div
      role="group"
      aria-label={ariaLabel ?? labels.group}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      {children}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-[calc(var(--radius)-0.25rem)] px-1.5 py-0.5 text-xs text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {clearAllLabel ?? labels.clearAll}
        </button>
      )}
    </div>
  );
}
FilterChipGroupImpl.displayName = "FilterChipGroup";

export const FilterChipGroup = memo(FilterChipGroupImpl);
FilterChipGroup.displayName = "FilterChipGroup";
