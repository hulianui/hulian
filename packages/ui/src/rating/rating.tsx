"use client";
import { memo, useId, useState } from "react";
import { Star } from "../_icons";
import { cn } from "../lib/cn";
import type { RatingProps } from "./rating.types";
import { useComponentLocale } from "../config/locale-context";

// 自研星级评分（零依赖）。此前是 @mui/material/Rating 的薄包装 —— 为了这一个组件，
// 全库拖着 emotion 这套 runtime CSS-in-JS（不兼容 RSC），且任何人装 @hulianui/ui
// 都被迫装下整个 MUI。行为面（半星除外）本来就不复杂，自研掉更划算。
//
// 无障碍与测试契约都保持原样：可交互时是一组真实 radio（role=radio 可数、可按 value
// 选中），readOnly 时不渲染任何 radio，只留一个带 aria-label 的静态图形。

const SIZE = { sm: "size-4", md: "size-5", lg: "size-6" } as const;

function RatingImpl({
  value,
  defaultValue,
  onValueChange,
  max = 5,
  readOnly,
  disabled,
  size = "md",
  color = "var(--color-primary)",
  icon,
  emptyIcon,
  className,
}: RatingProps) {
  const labels = useComponentLocale().rating ?? {
    value: (value, max) => `评分 ${value} / ${max}`,
    group: (max) => `评分，共 ${max} 级`,
    star: (value) => `${value} 星`,
  };
  const name = useId();
  const [inner, setInner] = useState(defaultValue ?? 0);
  const [hover, setHover] = useState<number | null>(null);
  const isControlled = value !== undefined;
  const current = isControlled ? value ?? 0 : inner;
  // hover 只在可交互时抢显示权，否则静态值说了算
  const shown = hover ?? current;

  const iconCls = cn(SIZE[size], "shrink-0");
  const filledNode = icon ?? <Star className={iconCls} fill="currentColor" strokeWidth={0} />;
  const emptyNode = emptyIcon ?? icon ?? (
    <Star className={iconCls} fill="currentColor" strokeWidth={0} />
  );
  // hover 态用 color-mix 从主色派生，兼容 var() 与任意 CSS 颜色（与旧 MUI 皮肤一致）
  const hoverColor = `color-mix(in srgb, ${color}, black 15%)`;

  const items = Array.from({ length: max }, (_, i) => i + 1);

  const paint = (i: number) => {
    if (i > shown) return "var(--color-border)";
    return hover !== null && !disabled ? hoverColor : color;
  };

  if (readOnly) {
    return (
      <span
        role="img"
        aria-label={labels.value(current, max)}
        className={cn("inline-flex items-center gap-0.5", className)}
      >
        {items.map((i) => (
          <span key={i} aria-hidden style={{ color: paint(i) }}>
            {i <= current ? filledNode : emptyNode}
          </span>
        ))}
      </span>
    );
  }

  const commit = (next: number) => {
    if (disabled) return;
    if (!isControlled) setInner(next);
    onValueChange?.(next);
  };

  return (
    <span
      role="radiogroup"
      aria-label={labels.group(max)}
      className={cn("inline-flex items-center gap-0.5", disabled && "opacity-50", className)}
      onMouseLeave={() => setHover(null)}
    >
      {items.map((i) => (
        <label
          key={i}
          className={cn(
            "relative inline-flex cursor-pointer items-center transition-transform",
            disabled ? "cursor-not-allowed" : "hover:scale-110",
            "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 focus-within:ring-offset-bg rounded-xs",
          )}
          onMouseEnter={() => !disabled && setHover(i)}
        >
          <input
            type="radio"
            name={name}
            value={i}
            checked={current === i}
            disabled={disabled}
            onChange={() => commit(i)}
            className="absolute size-0 opacity-0"
            aria-label={labels.star(i)}
          />
          <span aria-hidden style={{ color: paint(i) }}>
            {i <= shown ? filledNode : emptyNode}
          </span>
        </label>
      ))}
    </span>
  );
}
RatingImpl.displayName = "Rating";

// 评分常成列出现在评价列表/商品卡里，父级一动就整列重算。props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Rating = memo(RatingImpl);
Rating.displayName = "Rating";
