---
slug: dot
name: Dot
category: data-display
group: info
tags: []
exports: [Dot]
status: enriched
---

# Dot

> 状态圆点 · 5 语气状态色 + sm/md/lg + 呼吸 pulse(在线/进行中) + a11y label(role=status)(Tag/Chip 内嵌点的独立原语·纯CSS·RSC) · data-display/info

## 何时用

需要一个最小的语义状态圆点（在线/处理中/错误）时用，可内嵌进 Tag/Chip 或独立放在文字前。它是纯展示原语；要的是「健康态四语义 + 状态文字 + 延迟数值」的成品行用 [StatusDot](../status-dot/status-dot.md)；要叠加到图标四角并带计数用 [Badge](../badge/badge.md)。

## 导入
```ts
import { Dot } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"neutral"｜"brand"｜"success"｜"warning"｜"danger"` | `neutral` | 语气色：neutral 默认 / brand 处理中 / success 在线/成功 / warning 警告 / danger 离线/错误。 |
| size | `"sm"｜"md"｜"lg"` | `md` | 尺寸。 |
| pulse | `boolean` | `false` | 呼吸扩散动画（在线/进行中等活跃态语义）。 |
| label | `string` | — | 提供则 `role=status` + aria-label（表意圆点）；不提供则 aria-hidden（纯装饰）。 |

## 示例
```tsx
// 纯装饰状态点
<Dot tone="success" />

// 在线点：呼吸 + 屏读播报
<Dot tone="success" pulse label="在线" />
```

## 禁忌 / 坑

暂无已知坑。`label` 决定无障碍语义：表意圆点（真在传达状态）务必传 `label`，否则它被 `aria-hidden` 当装饰，屏读用户读不到。候选坑 `tauri-2-event-name-no-dot-character-set-restriction`（Tauri 事件命名）与 `timeline-dot-aligns-to-content-via-order-flip-not-pixel-push`（时间线圆点对齐）均与本组件无关，不适用。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
