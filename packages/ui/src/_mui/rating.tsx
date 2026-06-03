"use client";
import MuiRating from "@mui/material/Rating";
import type { RatingProps } from "./rating.types";

const SIZE_MAP = { sm: "small", md: "medium", lg: "large" } as const;

// 瑚琏 Rating = MUI Rating 罩瑚琏受控 API + token 皮肤（星色走 var()）。
// color 默认走 token，传任意 CSS 颜色即可改色；hover 用 color-mix 自动派生（兼容 var()/任意色）。
// icon/emptyIcon 透传换图标，只给 icon 时 emptyIcon 复用同形状（空色由 iconEmpty 控制）。
export function Rating({
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
  return (
    <MuiRating
      className={className}
      value={value}
      defaultValue={defaultValue}
      max={max}
      readOnly={readOnly}
      disabled={disabled}
      size={SIZE_MAP[size]}
      icon={icon}
      emptyIcon={emptyIcon ?? icon}
      onChange={(_, v) => onValueChange?.(v)}
      sx={{
        "& .MuiRating-iconFilled": { color },
        "& .MuiRating-iconEmpty": { color: "var(--color-border)" },
        "& .MuiRating-iconHover": { color: `color-mix(in srgb, ${color}, black 15%)` },
      }}
    />
  );
}
