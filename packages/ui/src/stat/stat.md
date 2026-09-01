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
| delta | `number` | - | 环比百分比，>=0 升(text-primary) / <0 降(text-danger)；不传则不渲染趋势 |
| …HTMLAttributes | `HTMLAttributes<HTMLDivElement>` | - | 透传 div 原生属性（含 className） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label* | `ReactNode` | 指标标签 |
| value* | `ReactNode` | 指标数值（自行格式化好的字符串/节点） |
| deltaLabel | `ReactNode` | 趋势旁说明文案（如「较上月」）。**依附于 delta**，不传 delta 则不渲染 |
| hint | `ReactNode` | 与趋势无关的一行注脚（如「上限 200 题」），独立于 delta 渲染，位于趋势行下方 |
| icon | `ReactNode` | 角标图标 |
| chart | `ReactNode` | 图表插槽（如 KPI 趋势 sparkline），渲染在数值行下方、delta 上方 |

## 示例
```tsx
// 上升趋势
<Stat label="本月 GMV" value="¥128,400" delta={12.5} deltaLabel="较上月" icon={<Activity className="size-4" />} className="w-64" />

// 无趋势
<Stat label="注册用户" value="8,021" icon={<Users className="size-4" />} className="w-64" />

// 与趋势无关的注脚：用 hint，不要塞进 label（标签被撑长、视觉重心跑偏）
<Stat label="题篮题数" value="12" hint="上限 200 题" className="w-64" />

// hint 与趋势可同时出现：趋势行在上，注脚在下
<Stat label="参考人数" value="38" delta={6.4} deltaLabel="较上场" hint="2 人未交卷" className="w-64" />
```

## 禁忌 / 坑
- **`deltaLabel` 依附于 `delta`，单独传会被静默吞掉**：不传 `delta` 时整块趋势不渲染，`deltaLabel` 一起消失——TS 能过、控制台干净、页面只是少一行字。要「数值 + 一行与趋势无关的注脚」请用 `hint`（开发态现在也会 `console.warn` 点名这种误用）。
- `delta` 不传则整块趋势不渲染；正负号由数值符号决定颜色，无需自己加箭头。
- `value` 不做格式化，需自己传格式化后的内容（要自动千分位/前后缀走 [Statistic](../statistic/statistic.md)）。
- 卡片自带 `shadow-sm` + `border-hairline`（亮色无描边只有投影、暗色有 1px 描边），是库内「有阴影的容器」统一档位。要回到无阴影的纯平面，用 `className="shadow-none border-border"` 覆盖。
- `value` 字号是 30px 且 `truncate`。**比早期版本大一档**，窄卡（< 200px）里长数值更容易被截断——给卡片留够宽度，或把长数值改走 `Statistic` 的紧凑排版。
- 卡片**不带 hover 抬升**，因为 Stat 本身不可点。把它包成链接/按钮时，hover 反馈请加在外层包裹元素上。
- 标题行固定 32px 高（`icon` 底座的尺寸），**有没有 `icon` 都一样**——同一排 KPI 卡可以放心混用「有 icon」与「无 icon（右上角留给叠放的 Sparkline）」，数值行起点与卡片高度不会因此错开。

## 相关
[Statistic](../statistic/statistic.md) · [Chart](../chart/chart.md) · [Meter](../meter/meter.md) · [Timeline](../timeline/timeline.md) · [NumberTicker](../number-ticker/number-ticker.md) · [WorldMap](../world-map/world-map.md)
