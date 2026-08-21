---
slug: number-ticker
name: NumberTicker
category: data-display
group: stat
tags: [animated]
exports: [NumberTicker, formatTicker]
status: enriched
---

# NumberTicker

> 数字滚动 · 进入视口 tween 到目标值 + reduced-motion · data-display/stat · #animated

## 何时用

需要把一个数字以动效从起点滚到目标值（KPI 大屏、统计卡进场）时用。只渲染纯数字动画，没有标签/趋势箭头/前后缀语义——要带「标题 + 单位 + 同比」用 [Stat](../stat/stat.md)，要带 CountUp 之外的格式化与趋势用 [Statistic](../statistic/statistic.md)。

## 导入
```ts
import { NumberTicker, formatTicker } from "@hulianui/ui"
```

## Props

继承 `span` 的所有原生属性（`children` 除外）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number` | - | 目标值。进入视口后从 `startValue` 滚到此值 |
| startValue | `number` | `0` | 起始值。`startValue > value` 即自然向下滚（无需单独 direction prop） |
| decimalPlaces | `number` | `0` | 小数位，驱动 `Intl.NumberFormat` 的 min/maxFractionDigits |
| duration | `number` | `1.2` | 滚动时长（秒），曲线固定复用 `motionEase.out`（瑚琏签名） |
| delay | `number` | `0` | 进入视口后延迟开始（秒） |

## 示例
```tsx
// 整数千分位
<NumberTicker value={12345} className="text-4xl font-semibold" />

// 百分比（1 位小数）
<NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />

// 向下计数
<NumberTicker startValue={100} value={0} className="text-4xl font-semibold" />
```

## 禁忌 / 坑

- 动画由 IntersectionObserver 触发、rAF 驱动 tween。headless 截图会停在第 0 帧（只显示起始值），不是 bug——验证视觉用真机或开 reduced-motion 直出终值。参见 [[verify-sub-second-web-animation-via-headless-screenshot]]。
- `prefers-reduced-motion: reduce` 下直接显示终值不做滚动，无障碍友好。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [WorldMap](../world-map/world-map.md)
