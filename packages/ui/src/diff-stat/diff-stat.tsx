"use client";

import { memo } from "react";

import { cn } from "../lib/cn";
import { useComponentLocale } from "../config/locale-context";
import { splitBlocks } from "./diff-stat.split";
import type { DiffStatProps, DiffStatStatus } from "./diff-stat.types";

// 改动统计条：+N −M 数字 + 按增删比例填充的绿红格子条 + 可选 A/M/D/R 状态徽标。
// 代码审查 / PR 列表刚需。纯函数 splitBlocks 抽出可测，零依赖只吃语义 token。
// 注：renamed 需要一个既非绿/黄/红、又不与三者混淆的第四色。0.8.0 前库里没有 info 语义色，
// 只能借 primary；现在改吃 --color-info（#173）—— 不是因为「重命名 == 信息」，而是因为
// A/M/D/R 是一组并列的分类标记，把品牌色花在分类标记上正是 #173 说的「稀释品牌色权重」。
// info 的青蓝与 added 的绿、modified 的黄、deleted 的红两两可辨，正好补上第四色。
const DEFAULT_STATUS_LABEL: Record<DiffStatStatus, string> = {
  added: "新增",
  modified: "修改",
  deleted: "删除",
  renamed: "重命名",
};
const STATUS_TONE: Record<DiffStatStatus, string> = {
  added: "text-success bg-success/10",
  modified: "text-warning bg-warning/10",
  deleted: "text-danger bg-danger/10",
  renamed: "text-info bg-info/10",
};

function DiffStatImpl({
  additions,
  deletions,
  status,
  blocks = 5,
  showCounts = true,
  size = "md",
  className,
}: DiffStatProps) {
  const labels = useComponentLocale().diffStat ?? DEFAULT_STATUS_LABEL;
  const { green, red, empty } = splitBlocks(additions, deletions, blocks);
  const box = size === "sm" ? "size-1.5" : "size-2";
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs tabular-nums", className)}>
      {status && (
        <span className={cn("rounded px-1 py-0.5 text-[10px] font-medium", STATUS_TONE[status])}>
          {labels[status]}
        </span>
      )}
      {showCounts && (
        <span className="space-x-1">
          <span className="text-success">+{additions}</span>
          <span className="text-danger">−{deletions}</span>
        </span>
      )}
      <span className="inline-flex gap-0.5" aria-hidden>
        {Array.from({ length: green }).map((_, i) => (
          <span key={`g${i}`} className={cn(box, "rounded-[2px] bg-success")} />
        ))}
        {Array.from({ length: red }).map((_, i) => (
          <span key={`r${i}`} className={cn(box, "rounded-[2px] bg-danger")} />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <span key={`e${i}`} className={cn(box, "rounded-[2px] bg-surface-hover")} />
        ))}
      </span>
    </span>
  );
}
DiffStatImpl.displayName = "DiffStat";

// PR/文件列表里成百上千行各挂一个 DiffStat，父级一动就整列重算。props 全是原语
// （additions/deletions/status/blocks/...），React 无法自己 bailout，只能靠 memo
// —— 与 Button/Checkbox/Chip 同一处方。memo 不拦 context，切语言仍会正常重渲染。
export const DiffStat = memo(DiffStatImpl);
DiffStat.displayName = "DiffStat";
