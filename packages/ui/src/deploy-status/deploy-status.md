---
slug: deploy-status
name: DeployStatus
category: data-display
group: info
tags: []
exports: [DeployStatus]
status: enriched
---

# DeployStatus

> 部署状态 · 部署/构建生命周期态 · 排队/构建中(转圈)/已上线/失败/已取消/已跳过 六态(→success/danger/primary/neutral 软填充) · badge 徽标/dot 圆点(building 脉冲)/icon 紧凑三形态 · 区别健康态 StatusDot 语义 · CI/CD/Pages/流水线刚需 · data-display/info

## 何时用

表达一次部署/构建的**生命周期阶段**（排队 → 构建中 → 上线/失败/取消/跳过）。与表达「在线/降级/离线」健康态的 StatusDot 区分：本组件是「这次构建走到哪一步」，StatusDot 是「服务此刻是否健康」。CI/CD、Pages、流水线列表用本组件。

## 导入
```ts
import { DeployStatus } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| status* | `"queued" \| "building" \| "ready" \| "error" \| "canceled" \| "skipped"` | - | 生命周期状态 |
| variant | `"badge" \| "dot" \| "icon"` | `"badge"` | 形态：badge 软填充徽标 / dot 圆点+文字 / icon 仅图标（紧凑表格单元格） |
| size | `"sm" \| "md"` | `"md"` | 尺寸 |
| spin | `boolean` | `true` | building 态图标是否旋转 |
| className | `string` | - | 透传类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 覆盖 ConfigProvider 提供的本地化文案 |

## 示例
```tsx
// 默认徽标
<DeployStatus status="ready" />

// 圆点+文字（building 态自动脉冲）/ 紧凑表格单元格仅图标
<DeployStatus status="building" variant="dot" />
<DeployStatus status="error" variant="icon" size="sm" />
```

## 禁忌 / 坑
注意语义边界：本组件是部署生命周期态，不要拿它当服务健康指示灯（那是 StatusDot）。默认文案跟随 `ConfigProvider`，仅在业务语义需要时传 `label` 覆盖。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
