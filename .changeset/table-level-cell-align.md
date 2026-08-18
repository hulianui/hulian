---
"@hulianui/ui": minor
---

Table / TableRoot 新增表级水平对齐 `cellAlign` / `headerAlign`（#292）：对齐是整表口径，此前只能逐列写 `meta.align`，一张表的统一对齐要在几十份列定义里各写一遍，漏写的那列就是视觉裂缝。列 `meta.align` / `meta.headerAlign` 仍然优先，默认行为逐字不变。
