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

> 相对时间 · 时间戳→「3分钟前/昨天/2个月后」+ 自动 tick 刷新(可设间隔/受控基准) + 中英 locale · 纯函数 formatRelative/formatAbsolute 可测 · <time> 语义 + title 绝对时间 + SSR 安全(首帧不读系统时钟) · data-display/info

## 何时用

把时间戳渲染为「3 分钟前 / 昨天 / 2 个月后」并自动随时间刷新，悬停看绝对时间。需要纯字符串格式化（非渲染）时直接用导出的 `formatRelative`/`formatAbsolute`。评论/动态流时间戳的标配。

## 导入
```ts
import { RelativeTime, formatRelative, formatAbsolute } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `Date \| string \| number` | - | 目标时间：Date / ISO 字符串 / 毫秒时间戳。 |
| base | `Date \| string \| number` | - | 参照的「现在」。传则固定不走实时 tick（SSR 确定性 / 测试 / 列表统一基准）；省略则取实时 `new Date()` 并按 updateInterval 刷新。 |
| updateInterval | `number` | `60000` | 自动刷新间隔(ms)，每分钟。设 0 关闭刷新。 |
| locale | `"zh" \| "en"` | `"zh"` | 语言。 |
| withTitle | `boolean` | `true` | 悬停 title 显示绝对时间。 |
| className | `string` | - | - |

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
- 不传 `base` 时**首帧渲染的是绝对时间**（`YYYY-MM-DD HH:mm`），挂载后才换成相对串。这是刻意的：渲染期读系统时钟会把「构建时刻」烤进 SSR / 静态导出产物，页面几个月后被访问仍写着「1 分钟前」，而绝对时间只依赖 `value`，任何时刻都成立。另一个候选是首帧以 `value` 自身为基准渲成「刚刚」，没选它——那是一句会被爬虫和关掉 JS 的读者当真的假话。切换发生在浏览器绘制前（layout effect），肉眼看不到跳变；要首帧就是相对串，传 `base` 自己钉基准。
- `<time>` 上的 `suppressHydrationWarning` 现在只兜**消费方传入的 `value` 两端不同**（如 `value={new Date()}`，此时 `dateTime` 属性本身就是两个值），组件自身不再制造差异。别把它当作「value 可以随便传」的许可。
- 大量同页实例默认每个都开 60s tick，超长列表可设 `updateInterval={0}` 或统一传 `base` 降低重渲染。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
