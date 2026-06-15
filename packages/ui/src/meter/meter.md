---
slug: meter
name: Meter
category: data-display
group: stat
tags: []
exports: [Meter]
status: enriched
---

# Meter

> 度量条 · Base UI role=meter(静态量占比，区别 Progress) · data-display/stat

## 何时用

展示一个**静态量在区间内的占比**（磁盘用量、电量、配额）。区别于 Progress：Progress 表达「任务推进进度（会动）」，Meter 表达「此刻某个量占满量的多少」。语义上是 `role="meter"`。

## 导入
```ts
import { Meter } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number` | — | 当前值 |
| min | `number` | `0` | 下限 |
| max | `number` | `100` | 上限 |
| showValue | `boolean` | `false` | 是否显示格式化数值 |
| className | `string` | — | 透传类名（宽度在此设，如 `w-64`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 可选标签（如「磁盘用量」） |

## 示例
```tsx
// 带标签 + 数值
<div className="w-64"><Meter value={72} label="磁盘用量" showValue /></div>

// 仅条
<div className="w-64"><Meter value={64} /></div>
```

## 禁忌 / 坑
暂无已知坑。表达「会推进的任务进度」请用 Progress 而非 Meter；条宽由父容器决定，记得给宽度。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
