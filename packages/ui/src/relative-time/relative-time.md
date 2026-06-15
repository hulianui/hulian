---
slug: relative-time
name: RelativeTime
category: data-display
group: info
tags: []
exports: [RelativeTime, formatRelative, formatAbsolute]
status: enriched
---

# RelativeTime

> 相对时间 · 时间戳→「3分钟前/昨天/2个月后」+ 自动 tick 刷新(可设间隔/受控基准) + 中英 locale · 纯函数 formatRelative/formatAbsolute 可测 · <time> 语义 + title 绝对时间 + SSR 安全(suppressHydrationWarning) · data-display/info

## 何时用

把时间戳渲染为「3 分钟前 / 昨天 / 2 个月后」并自动随时间刷新，悬停看绝对时间。需要纯字符串格式化（非渲染）时直接用导出的 `formatRelative`/`formatAbsolute`。评论/动态流时间戳的标配。

## 导入
```ts
import { RelativeTime, formatRelative, formatAbsolute } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `Date \| string \| number` | — | 目标时间：Date / ISO 字符串 / 毫秒时间戳。 |
| base | `Date \| string \| number` | — | 参照的「现在」。传则固定不走实时 tick（SSR 确定性 / 测试 / 列表统一基准）；省略则取实时 `new Date()` 并按 updateInterval 刷新。 |
| updateInterval | `number` | `60000` | 自动刷新间隔(ms)，每分钟。设 0 关闭刷新。 |
| locale | `"zh" \| "en"` | `"zh"` | 语言。 |
| withTitle | `boolean` | `true` | 悬停 title 显示绝对时间。 |
| className | `string` | — | — |

## 示例
```tsx
// 实时刷新（无 base，每分钟自动更新，悬停看绝对时间）
<RelativeTime value={publishedAt} />
```
```tsx
// 列表/SSR 统一基准（固定 base，不漂移）
<RelativeTime value={item.createdAt} base={now} locale="en" />
```

## 禁忌 / 坑

- 不传 `base` = 走实时 tick（client 刷新）；要 SSR 确定性 / 测试可复现 / 列表统一基准就传固定 `base`，否则各行各自取 `new Date()` 抖动。
- 组件已用 `<time>` + `suppressHydrationWarning` 处理 SSR 水合差异，按需在 server 渲染无需额外包装。
- 大量同页实例默认每个都开 60s tick，超长列表可设 `updateInterval={0}` 或统一传 `base` 降低重渲染。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
