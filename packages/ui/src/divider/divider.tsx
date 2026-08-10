import { cn } from "../lib/cn";
import type { DividerOrientation, DividerProps } from "./divider.types";

// 带文字分隔（纯皮肤·零依赖·可 RSC，照 badge/breadcrumb 范式不加 "use client"）。
// 与既有纯几何 Separator 互补：Separator 是 role=separator 极简原语；Divider 加「文字嵌入 +
// 虚线 + 行内垂直」。纯线变体仍报 role=separator；带文字变体作有标签的视觉分组（文字即可读内容，
// 不套 role=separator——separator 角色的子内容会被无障碍树忽略）。线吃 border-border，文字 text-muted-foreground。

// 横线段：实/虚线共用 border-t（虚线只追加 border-dashed），方便 dashed/solid 同皮肤。
function line(side: "left" | "right", orientation: DividerOrientation, dashed?: boolean) {
  // 文字偏左 → 左段短、右段长；偏右反之；居中两段等长。
  const grow =
    orientation === "left"
      ? side === "left"
        ? "w-5 shrink-0"
        : "flex-1"
      : orientation === "right"
        ? side === "right"
          ? "w-5 shrink-0"
          : "flex-1"
        : "flex-1";
  return cn("border-t border-border", dashed && "border-dashed", grow);
}

export function Divider({
  type = "horizontal",
  orientation = "center",
  dashed,
  plain,
  children,
  className,
}: DividerProps) {
  // 行内垂直分隔：嵌在一行内容之间，用 left/right border 画竖线。
  if (type === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cn(
          "mx-2 inline-block h-[0.9em] w-0 self-center border-l border-border align-middle",
          dashed && "border-dashed",
          className,
        )}
      />
    );
  }

  // 纯水平线（无文字）：role=separator。
  if (children === undefined || children === null || children === false) {
    return (
      <div
        role="separator"
        className={cn("my-4 w-full border-t border-border", dashed && "border-dashed", className)}
      />
    );
  }

  // 带文字水平线：line - 文字 - line。文字位置由 orientation 控制两段长度比。
  return (
    <div className={cn("my-4 flex items-center text-sm", className)}>
      <div className={line("left", orientation, dashed)} aria-hidden />
      <span className={cn("whitespace-nowrap px-4 text-muted-foreground", plain ? "font-normal" : "font-medium")}>
        {children}
      </span>
      <div className={line("right", orientation, dashed)} aria-hidden />
    </div>
  );
}
