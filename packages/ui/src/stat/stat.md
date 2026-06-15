---
slug: stat
name: Stat
category: data-display
group: stat
tags: []
exports: [Stat]
status: enriched
---

# Stat

> 指标卡 · KPI 数值/标签/升降趋势(无图表库) · data-display/stat

## 何时用

仪表盘里展示单个 KPI 指标卡：标签 + 数值 + 环比升降 + 可选图标/sparkline 插槽。要纯文本格式化数值（千分位/前后缀/倒计时）而非整张卡用 [Statistic](../statistic/statistic.md)；要画趋势曲线/分布用 [Chart](../chart/chart.md)；要表达占比量条用 [Meter](../meter/meter.md)。

## 导入
```ts
import { Stat } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| label* | `ReactNode` | — | 指标标签 |
| value* | `ReactNode` | — | 指标数值（自行格式化好的字符串/节点） |
| delta | `number` | — | 环比百分比，>=0 升(text-primary) / <0 降(text-danger)；不传则不渲染趋势 |
| deltaLabel | `ReactNode` | — | 趋势旁说明文案（如「较上月」） |
| icon | `ReactNode` | — | 角标图标 |
| chart | `ReactNode` | — | 图表插槽（如 KPI 趋势 sparkline），渲染在数值行下方、delta 上方 |
| …HTMLAttributes | `HTMLAttributes<HTMLDivElement>` | — | 透传 div 原生属性（含 className） |

## 示例
```tsx
// 上升趋势
<Stat label="本月 GMV" value="¥128,400" delta={12.5} deltaLabel="较上月" icon={<Activity className="size-4" />} className="w-64" />

// 无趋势
<Stat label="注册用户" value="8,021" icon={<Users className="size-4" />} className="w-64" />
```

## 禁忌 / 坑
暂无已知坑。`delta` 不传则整块趋势不渲染；正负号由数值符号决定颜色，无需自己加箭头。`value` 不做格式化，需自己传格式化后的内容（要自动千分位/前后缀走 [Statistic](../statistic/statistic.md)）。

## 相关
[Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
