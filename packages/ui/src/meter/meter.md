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
| showValue | `boolean` | `false` | 是否显示数值文案。默认按 `(value - min) / (max - min)` 渲染成百分比，与指示条同口径（最多一位小数） |
| formatValue | `(info: { value, min, max, percent }) => string` | — | 自定义数值文案。返回值同时用于可见文字与 `aria-valuetext`，两者不会不一致。`percent` 已归一并夹到 0–100（未取整）。用于绝对数表述：`({ value, max }) => \`${value} / ${max} 道题\`` |
| className | `string` | — | 透传类名（宽度在此设，如 `w-64`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 标签（如「磁盘用量」）。**这是给 `role="meter"` 挂无障碍名的唯一途径**（内部走 `aria-labelledby` 关联），不传就是一条读屏无名的度量条 —— 自绘一行标题不算 |

## 示例
```tsx
// 带标签 + 数值
<div className="w-64"><Meter value={72} label="磁盘用量" showValue /></div>

// max ≠ 100：数值文案按占比渲染（1041/1324 → 78.6%），与指示条同口径
<div className="w-64"><Meter value={1041} max={1324} label="已挂教材章节" showValue /></div>

// 绝对数表述：可见文字与读屏念的都是这一句
<div className="w-64">
  <Meter
    value={1041}
    max={1324}
    label="已挂教材章节"
    showValue
    formatValue={({ value, max }) => `${value} / ${max} 道题`}
  />
</div>

// 仅条
<div className="w-64"><Meter value={64} /></div>
```

## 禁忌 / 坑

表达「会推进的任务进度」请用 Progress 而非 Meter；条宽由父容器决定，记得给宽度。

- **无障碍名只能由 `label` 给**。`role="meter"` 内部靠 `aria-labelledby` 关联到 `label`，自己在组件外面写一行标题不会被关联上。
- **按 `textContent` 断言时会多出一个 `x`**。Base UI 的 Meter.Root 末尾固定塞了一个 `role="presentation"` 的视觉隐藏 `<span>x</span>`（读屏不会念，也不进无障碍名）。要精确断言可见文案请查具体节点，别整树取 `textContent`。
- **`value` 超出 `[min, max]` 时文案会夹到 0–100%**，但 `aria-valuenow` 仍如实上报原始值 —— 越界应当在数据侧解决，组件不替你掩盖。

## 相关
[Stat](../stat/stat.md) · [Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
