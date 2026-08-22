---
slug: score-ring
name: ScoreRing
category: data-display
group: info
tags: []
exports: [ScoreRing, resolveGrade, DEFAULT_GRADES, Grade]
status: enriched
---

# ScoreRing

> 用彩色环形仪表盘展示分值和对应等级 · data-display/info

## 何时用

把一个分值（质量分/健康度/评级）显示成圆环仪表盘，按 value 落入 A-F 等级带自动着色，环心显示分值与等级。要圆环用本组件；要线性进度/容量用 [Meter]/[Progress]；要趋势用 [Sparkline](../sparkline/sparkline.md)。可 RSC（SVG dasharray 渲染，非 transform 动画）。

## 导入
```ts
import { ScoreRing, resolveGrade, DEFAULT_GRADES } from "@hulianui/ui"
```

## Props

`Grade` = `{ min: number; label: string; tone?: string }` —— `min` 是命中该等级的**最低分（含）**，
`label` 是等级标签，`tone` 收语义色名（`"success"` / `"warning"` / `"danger"` / `"chart-2"` …）
或任意 CSS 颜色值（`#hex` / `var(--color-success)`）。类型上都是 `string`，两种都认。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number` | - | 当前分值 |
| max | `number` | `100` | 满分 |
| grades | `Grade[]` | - | 等级带（不传用默认 A-F，即 `DEFAULT_GRADES`） |
| size | `number` | `96` | 直径 px |
| thickness | `number` | `8` | 环宽 px |
| showGrade | `boolean` | `true` | 是否显示等级字 |
| className | `string` | - | 自定义类 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 环心副标签（如「质量分」） |

## 示例
```tsx
<ScoreRing value={95} label="质量分" />
<ScoreRing value={42} label="质量分" />
```

迷你尺寸、不显等级字：
```tsx
<ScoreRing value={88} size={48} thickness={5} showGrade={false} />
```

自定义评级体系（`grades` 从高到低不必预排序，`resolveGrade` 内部按 `min` 降序找第一个命中的）：
```tsx
import type { Grade } from "@hulianui/ui"

const CREDIT_GRADES: Grade[] = [
  { min: 85, label: "优秀", tone: "success" },
  { min: 70, label: "良好", tone: "success" },
  { min: 50, label: "一般", tone: "warning" },
  { min: 30, label: "较差", tone: "warning" },
  { min: 0, label: "高风险", tone: "danger" },
]

<ScoreRing value={36} label="信誉评分" grades={CREDIT_GRADES} />
```

## 禁忌 / 坑

- **等级颜色由 `resolveGrade(value, grades)` 纯函数映射**，两个参数，**没有 `max`**。
  `max` 是本组件用来画弧长的 prop，不是这个函数的参数（0.56.1 之前本节把它误写成三个参数，
  照着写 `resolveGrade(score, 100, myGrades)` 会把 `100` 当 grades 传进去）。
- **默认 `DEFAULT_GRADES` 的 5 档只有 3 种颜色**（A/B 同为 success、C/D 同为 warning），
  要五档五色请传自定义 `grades`。
- **`tone` 留空的档用组件默认色**，不是透明；想让某一档不着色请显式给它一个颜色值。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [Badge](../badge/badge.md) · [Dot](../dot/dot.md)
