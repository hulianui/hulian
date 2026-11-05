---
"@hulianui/ui": minor
---

feat(tag): 新增 `color` 分类色轴。`tone` 是六档语义色，回答「它现在是什么状态」；但「它属于哪一类」——渠道、业务线、文件类型、标签体系——常有十几二十种，语义色接不住，硬映射只会让「成功」和「渠道 A」共用一个绿，读的人再从颜色反推含义就会错。`color` 走 `resolveTone`（与 `Dot.color` / `Brand.color` / `ChartSeries.color` 同一条路径），语义色名（`chart-1..6` / `primary` …）、任意 CSS 颜色、`var(--color-*)` 都收；soft / outline / solid 三档都从这一个色派生（12% 混合底 / 描边 / 实底），自动吃明暗主题，不必为每个色再准备亮暗两套值。与 `tone` 同时传时 `color` 优先，`tone` 保持语义不变。文档站同时补上此前示例与 Playground 都漏掉的 `info` 档——六档语义色在页面上一直只展示了五档，看起来像「只有 5 种配色」。
