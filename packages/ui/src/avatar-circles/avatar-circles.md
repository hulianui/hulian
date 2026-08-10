---
slug: avatar-circles
name: AvatarCircles
category: data-display
group: info
tags: []
exports: [AvatarCircles, avatarCirclesItemVariants]
status: enriched
---

# AvatarCircles

> 堆叠头像组 · 重叠 + ring + +N 计数(扩 Avatar·RSC) · data-display/info

## 何时用

紧凑展示一组参与者/成员头像（重叠堆叠 + 末尾「+N」计数）。单个头像用 [[Avatar](../avatar/avatar.md)]；带名称/描述的单用户卡用 User。

## 导入
```ts
import { AvatarCircles, avatarCirclesItemVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| avatars* | `AvatarCirclesItem[]` | — | 头像列表（按序堆叠，后者压前者），见下表。 |
| extraCount | `number` | — | 额外人数，渲染为末尾 "+N" 圆。 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 圆直径档位。 |
| className | `string` | — | — |

`AvatarCirclesItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| src * | `string` | — | 头像图片地址。这里没有 fallback 槽（与单个 Avatar 不同），缺图会留一个空圆 |
| alt | `string` | — | 图片替代文本 |

## 示例
```tsx
const avatars = [
  { src: "/demo/avatar-1.jpg", alt: "u1" },
  { src: "/demo/avatar-2.jpg", alt: "u2" },
  { src: "/demo/avatar-3.jpg", alt: "u3" },
]
<AvatarCircles avatars={avatars} extraCount={9} />
```
```tsx
<AvatarCircles avatars={avatars} size="lg" />
```

## 禁忌 / 坑

- 每个 `avatars` 项要求 `src`（与单个 Avatar 不同，这里没有 fallback 槽）；列表项无图会留空圆。
- `extraCount` 仅渲染计数标记，不会自动从列表长度推算，按真实溢出人数手动传。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
