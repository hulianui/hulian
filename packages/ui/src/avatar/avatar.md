---
slug: avatar
name: Avatar
category: data-display
group: info
tags: []
exports: [Avatar]
status: enriched
---

# Avatar

> 头像 · Base UI 图片+fallback · data-display/info

## 何时用

展示单个用户头像，图片加载失败/缺省时回退到 fallback（首字母等）。需要头像 + 名称/描述组合用 [[User](../user/user.md)]；多人堆叠头像组用 AvatarCircles。

## 导入
```ts
import { Avatar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm" \| "md" \| "lg"` | `"md"` | 圆直径档位（CVA 变体）。 |
| src | `string` | — | 头像图片 URL；加载失败回退到 fallback。 |
| alt | `string` | — | 图片替代文本。 |
| fallback | `ReactNode` | — | 无图/加载失败时显示（通常为首字母）。 |
| className | `string` | — | — |

## 示例
```tsx
<Avatar src="/demo/avatar-12.jpg" alt="瑚琏" fallback="ZS" />
```
```tsx
// 无图回退
<Avatar size="lg" fallback="瑚" />
```

## 禁忌 / 坑

- 基于 Base UI Avatar，`src` 失败时才显示 `fallback`；务必给 `fallback` 否则失败/无图时空白。
- `size` 是受限档位（sm/md/lg），自定义尺寸用 `className` 覆盖。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
