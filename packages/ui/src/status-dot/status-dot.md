---
slug: status-dot
name: StatusDot
category: data-display
group: info
tags: []
exports: [StatusDot]
status: enriched
---

# StatusDot

> 健康状态点 · 在线/降级/离线/维护四语义态(→success/warning/danger/neutral 映射) + 默认仅在线脉冲 + 状态文字 + 尾部数值槽(延迟/成功率)(封装 Dot·网关渠道健康墙刚需·纯CSS·RSC) · data-display/info

## 何时用

展示一个渠道/模型/服务的健康态成品行（圆点 + 状态文字 + 延迟/成功率数值）时用，典型场景是网关渠道健康墙。它在 [Dot](../dot/dot.md) 之上封装了「四语义态映射 + 文字 + 尾槽」；只要一个裸状态圆点（自定 tone）用 Dot；要的是计数角标用 [Badge](../badge/badge.md)。

## 导入
```ts
import { StatusDot } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| status* | `"online"｜"degraded"｜"offline"｜"maintenance"` | — | 健康态：在线/降级/离线/维护（内部映射 success/warning/danger/neutral）。 |
| pulse | `boolean` | 仅 online 自动脉冲 | 呼吸脉冲；可显式覆盖默认。 |
| size | `"sm"｜"md"｜"lg"` | `md` | 尺寸。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 状态文字（如「在线」），提供则随圆点一起播报。 |
| extra | `ReactNode` | 尾部数值槽（如延迟「128ms」）。 |

## 示例
```tsx
// 在线 + 延迟
<StatusDot status="online" label="在线" extra="86ms" />

// 降级 + 高延迟
<StatusDot status="degraded" label="降级" extra="412ms" />
```

## 禁忌 / 坑

暂无已知坑。`pulse` 默认只有 `online` 态自动呼吸，其余态静止；要让降级态也脉冲须显式 `pulse`。候选坑均不适用：`status-enum-whitelist-negate-filter`、`multi-identity-bind-status-authoritative-field`、`batch-loop-break-terminal-status-overwritten-by-finalizer` 讲后端状态枚举/字段权威性，`menubarextra-app-body-observation-tears-down-status-item` 讲 macOS 菜单栏，与本展示组件无关。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
