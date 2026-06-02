"use client";
import MuiRating from "@mui/material/Rating";
import type { RatingProps } from "./rating.types";

const SIZE_MAP = { sm: "small", md: "medium", lg: "large" } as const;

// 瑚琏 Rating = MUI Rating 罩瑚琏受控 API + token 皮肤（星色走 var()）。
export function Rating({
  value,
  defaultValue,
  onValueChange,
  max = 5,
  readOnly,
  disabled,
  size = "md",
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
      onChange={(_, v) => onValueChange?.(v)}
      sx={{
        "& .MuiRating-iconFilled": { color: "var(--color-primary)" },
        "& .MuiRating-iconEmpty": { color: "var(--color-border)" },
        "& .MuiRating-iconHover": { color: "var(--color-primary-hover)" },
      }}
    />
  );
}
