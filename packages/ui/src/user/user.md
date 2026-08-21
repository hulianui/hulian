---
slug: user
name: User
category: data-display
group: info
tags: []
exports: [User]
status: enriched
---

# User

> 把头像、姓名和描述组合成一行用户信息 · data-display/info

## 何时用

把头像 + 主名称 + 次级描述（邮箱/角色/@handle）组合成一个用户行/卡。只要头像用 [[Avatar](../avatar/avatar.md)]；多人堆叠用 AvatarCircles；评论场景的作者区可直接传本组件给 Comment 的 author。

## 导入
```ts
import { User } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| avatarProps | `AvatarProps` | - | 透传给内置 Avatar（src/alt/fallback/size）。 |
| className | `string` | - | - |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| name* | `ReactNode` | 主名称（必填）。 |
| description | `ReactNode` | 次级描述（邮箱/角色/@handle 等）。 |

## 示例
```tsx
<User
  name="瑚琏"
  description="zhangzhiwei@hulian.dev"
  avatarProps={{ src: "/demo/avatar-12.jpg", alt: "瑚琏" }}
/>
```
```tsx
// 无图回退首字母
<User name="李四" description="产品经理" avatarProps={{ fallback: "李" }} />
```

## 禁忌 / 坑

- 头像通过 `avatarProps` 透传，没有图就传 `fallback`（同 Avatar）；否则失败/无图空白。
- `description` 可省略，省略时只渲染单行名称。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
