---
slug: pull-to-refresh
name: PullToRefresh
category: mobile
group: gesture
tags: []
exports: [PullToRefresh]
status: enriched
---

# PullToRefresh

> 下拉刷新 · 置顶下拉带阻尼 + 过阈进 armed + 松手触发并保持刷新态至 Promise 结束回弹(零依赖·Pointer Events) · mobile/gesture

## 何时用

可滚动列表/页面置顶时下拉触发刷新数据时用。列表行横滑露出操作按钮用 [SwipeAction](../swipe-action/swipe-action.md)；本组件只管纵向下拉刷新这一手势。

## 导入
```ts
import { PullToRefresh } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `threshold` | `number` | `64` | 触发刷新的下拉阈值 px |
| `resistance` | `number` | `0.5` | 下拉阻尼系数（0-1，越小越「沉」） |
| `className` | `string` | — | — |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `onRefresh` * | `() => Promise<void> \| void` | 触发刷新回调；返回 Promise 期间保持「刷新中」，结束后回弹 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `children` * | `ReactNode` | 可滚动内容 |
| `pullingText` | `ReactNode` | 下拉中文案 |
| `armedText` | `ReactNode` | 越过阈值待释放时的文案 |
| `refreshingText` | `ReactNode` | 刷新中文案 |

## 示例
```tsx
<PullToRefresh onRefresh={async () => { await load(); }}>
  <List />
</PullToRefresh>
```

## 禁忌 / 坑
- `onRefresh` 想让指示器在加载期间持续显示，必须**返回 Promise** 并在数据就绪后 resolve；返回 void 会立即回弹，看不到刷新态。
- 只在内容滚到顶部时下拉才进入手势，中途滚动不会误触发。

## 相关
[SwipeAction](../swipe-action/swipe-action.md) · [TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [ActionSheet](../action-sheet/action-sheet.md) · [Picker](../picker/picker.md) · [SafeArea](../safe-area/safe-area.md)
