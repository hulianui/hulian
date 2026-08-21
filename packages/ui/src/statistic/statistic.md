---
slug: statistic
name: Statistic
category: data-display
group: stat
tags: []
exports: [Statistic, formatStatistic, formatCountdown]
status: enriched
---

# Statistic

> 格式化统计数值，可带前后缀、滚动入场或倒计时 · data-display/stat

## 何时用

格式化展示一个统计数值（自动千分位、小数位、前后缀），或用 `Statistic.Countdown` 展示倒计时。与 [Stat](../stat/stat.md) 互补：Stat 是「标签 + 值 + 升降趋势」的整张指标卡，本组件专注「数值本身的格式化」（你自己拼标签）。

## 导入
```ts
import { Statistic, formatStatistic, formatCountdown } from "@hulianui/ui"
```

## Props

### Statistic

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number \| string` | - | string 原样输出，number 走千分位 + precision 格式化 |
| precision | `number` | - | 小数位数（仅 value 为 number 时生效） |
| groupSeparator | `boolean` | `true` | 千分位分组 |
| animate | `boolean` | `false` | 接 NumberTicker 入场滚动（仅 number；动效路径恒带千分位） |
| valueStyle | `CSSProperties` | - | 数值行内联样式（自定义颜色/字号） |
| align | `"start" \| "center" \| "end"` | `"start"` | 水平对齐；数值行是 flex，className text-center 无效，须用此 prop |
| className | `string` | - | 透传类名 |

### Statistic.Countdown

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| deadline* | `number` | - | 截止时间戳（毫秒，与 Date.now() 同基准） |
| format | `string` | `"HH:mm:ss"` | 格式化模板，支持 D/H/HH/m/mm/s/ss/S/SS/SSS |
| valueStyle | `CSSProperties` | - | 数值行内联样式 |
| className | `string` | - | 透传类名 |

## Events

### Statistic.Countdown

| 事件 | 类型 | 说明 |
|------|------|------|
| onFinish | `() => void` | 倒计时归零回调（只触发一次） |

## Slots

### Statistic

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 数值上方说明标题 |
| prefix | `ReactNode` | 数值前缀（货币符号/图标等） |
| suffix | `ReactNode` | 数值后缀（单位等） |

### Statistic.Countdown

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题 |
| prefix | `ReactNode` | 前缀 |
| suffix | `ReactNode` | 后缀 |

## 示例
```tsx
// 小数 + 前缀，自动千分位
<Statistic title="账户余额" value={89234.56} precision={2} prefix="￥" />

// 倒计时：deadline 用 useState 初始化器固定一次，避免 SSR/render 漂移
const [deadline] = useState(() => Date.now() + 1000 * 60 * 60);
<Statistic.Countdown title="距活动结束" deadline={deadline} format="D 天 HH:mm:ss" />
```

## 禁忌 / 坑
- 倒计时 `deadline` 务必用 `useState(() => Date.now() + …)` 初始化器固定一次，直接在 render 里算会每次漂移、且导致 SSR/CSR hydration mismatch。
- 数值行是 flex 布局，靠 `className="text-center"` 居中无效，须用 `align` prop。
- `precision` / 千分位仅在 `value` 为 number 时生效；传 string 则原样输出。

## 相关
[Stat](../stat/stat.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
