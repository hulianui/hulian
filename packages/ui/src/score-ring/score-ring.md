---
slug: score-ring
name: ScoreRing
category: data-display
group: info
tags: []
exports: [ScoreRing, resolveGrade, DEFAULT_GRADES]
status: enriched
---

# ScoreRing

> 评分环 · 半径仪表盘 + A-F 等级带(value→grade tone 映射·纯函数 resolveGrade 可测) + 环心分值/等级 · 区别线性 Meter/Progress·SVG dasharray 非 transform·RSC · data-display/info

## 何时用

把一个分值（质量分/健康度/评级）显示成圆环仪表盘，按 value 落入 A–F 等级带自动着色，环心显示分值与等级。要圆环用本组件；要线性进度/容量用 [Meter]/[Progress]；要趋势用 [Sparkline](../sparkline/sparkline.md)。可 RSC（SVG dasharray 渲染，非 transform 动画）。

## 导入
```ts
import { ScoreRing, resolveGrade, DEFAULT_GRADES } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number` | — | 当前分值 |
| max | `number` | `100` | 满分 |
| grades | `Grade[]` | — | 等级带（不传用默认 A-F，即 `DEFAULT_GRADES`） |
| size | `number` | `96` | 直径 px |
| thickness | `number` | `8` | 环宽 px |
| label | `ReactNode` | — | 环心副标签（如「质量分」） |
| showGrade | `boolean` | `true` | 是否显示等级字 |
| className | `string` | — | 自定义类 |

## 示例
```tsx
<ScoreRing value={95} label="质量分" />
<ScoreRing value={42} label="质量分" />
```

迷你尺寸、不显等级字：
```tsx
<ScoreRing value={88} size={48} thickness={5} showGrade={false} />
```

## 禁忌 / 坑

暂无已知坑。等级颜色由 `resolveGrade(value, max, grades)` 纯函数映射；自定义评级体系传 `grades` 覆盖默认 A–F。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
