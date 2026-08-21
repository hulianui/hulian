---
slug: legend
name: Legend
category: data-display
group: stat
tags: []
exports: [Legend]
status: enriched
---

# Legend

> 独立图例 · 彩标记 + 系列名 + 可选数值 · dot/square/line 三标记 × row 横排自动换行/column 竖排(value 右对齐) × sm/md · 缺省色按序取 chart-1..6(与 Chart 同一套 token)·color 可覆盖 · onItemClick 后条目成按钮(aria-pressed 表开关)·显隐受控由调用方持有 · 给自绘图形(Sparkline/Heatmap/贡献墙/地图/卡片右上角)配图例(零依赖·RSC) · data-display/stat

## 何时用

给**自绘图形**配一份图例：Sparkline、Heatmap、[ContributionGraph](../contribution-graph/contribution-graph.md)、WorldMap、Funnel，或卡片右上角那两行「彩点 + 系列名」。

recharts 的 `<Legend>` 只能长在 recharts 图里（[Chart](../chart/chart.md) 已内置），图外场景此前只能在业务侧手搓一个圆点加一段文字，颜色还各写各的。本组件统一了标记形状与缺省配色——缺省按序取 `chart-1..6`，和 Chart 同一套 token，两种图表并排时颜色对得上。

## 导入
```ts
import { Legend, type LegendItem } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `LegendItem[]` | - | `{ label, color?, value?, hidden?, id? }[]` |
| marker | `"dot" \| "square" \| "line"` | `"dot"` | 标记形状；line 对齐折线图的线样 |
| layout | `"row" \| "column"` | `"row"` | row 横排自动换行 / column 竖排（value 右对齐） |
| size | `"sm" \| "md"` | `"md"` | 尺寸 |
| onItemClick | `(item, index) => void` | - | 传了则每条可点，条目渲染成按钮 |
| className | `string` | - | 透传类名；其余原生属性一并透传 |

### LegendItem

| 字段 | 类型 | 说明 |
|------|------|------|
| label* | `ReactNode` | 系列名 |
| color | `string` | 语义色名（`primary`/`success`/`chart-3`…）或任意 CSS 色；缺省按序取 chart-1..6 |
| value | `ReactNode` | 标签后的数值/占比 |
| hidden | `boolean` | 该系列已关闭：整条置灰（**不删条目**，否则点不回来） |
| id | `string \| number` | 回调里回传，便于识别系列 |

## 示例
```tsx
// 配自绘 Sparkline
<Legend marker="line" items={[
  { label: "本周", color: "primary", value: "1.2k" },
  { label: "上周", color: "muted", value: "980" },
]} />

// 可点切换系列（显隐受控，状态由调用方持有）
const [hidden, setHidden] = useState<Record<string, boolean>>({})
<Legend
  items={series.map((s) => ({ ...s, hidden: hidden[s.id] }))}
  onItemClick={(item) => setHidden((h) => ({ ...h, [item.id]: !h[item.id] }))}
/>
```

## 禁忌 / 坑

- **显隐是受控的**：组件不自管开关状态，`hidden` 由调用方给。这样图例与图形永远同一份真源，不会出现「图例灭了但线还在」。
- **hidden 只置灰不删条目**——删掉用户就点不回来了。
- 用在 recharts 图上属于重复：[Chart](../chart/chart.md) 自带 recharts `<Legend>`，别再叠一层。

## 相关
[Chart](../chart/chart.md) · [Sparkline](../sparkline/sparkline.md) · [ContributionGraph](../contribution-graph/contribution-graph.md) · [Heatmap](../heatmap/heatmap.md) · [Stat](../stat/stat.md)
