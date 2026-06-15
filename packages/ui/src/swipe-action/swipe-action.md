---
slug: swipe-action
name: SwipeAction
category: mobile
group: gesture
tags: []
exports: [SwipeAction]
status: enriched
---

# SwipeAction

> 列表项滑动操作 · 内容层 translateX 跟手 + 左/右动作面板 + 过半吸附全开/回弹 + 主轴判定放行纵向滚动(零依赖·Pointer Events) · mobile/gesture

## 何时用

列表行需要横滑露出「删除/置顶/标记已读」等操作按钮时用（微信会话列表式交互）。整列下拉触发刷新用 [PullToRefresh](../pull-to-refresh/pull-to-refresh.md)；行内常驻按钮直接放内容里即可，不必滑动。

## 导入
```ts
import { SwipeAction } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `left` | `SwipeActionButton[]` | — | 左滑出（内容右移）时显示的动作 |
| `right` | `SwipeActionButton[]` | — | 右滑出（内容左移）时显示的动作 |
| `threshold` | `number` | `0.5` | 松手触发完全展开的阈值（占动作区宽度比例 0-1） |
| `className` | `string` | — | — |

**SwipeActionButton**：`key: string` · `label: ReactNode` · `tone?: "default" \| "primary" \| "danger" \| "success" \| "warning"`（背景色调，默认 default）· `onClick?: () => void`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `onOpenChange` | `(side: "left" \| "right" \| null) => void` | 展开/收起回调（null=收起） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `children` * | `ReactNode` | 行内容（跟手 translateX 的内容层） |

## 示例
```tsx
<SwipeAction
  left={[{ key: "read", label: "已读", tone: "primary" }]}
  right={[{ key: "del", label: "删除", tone: "danger" }]}
>
  <Row />
</SwipeAction>
```

## 禁忌 / 坑
- 用 Pointer Events 做主轴判定：横向位移占优才接管为滑动，纵向占优会放行给外层列表滚动——所以放在可滚动列表里不会卡住纵向滚动。
- `threshold` 是比例（0-1）不是像素：松手时横滑超过动作区宽度的该比例才吸附全开，否则回弹收起。

## 相关
[PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SafeArea](../safe-area/safe-area.md)
