---
slug: action-sheet
name: ActionSheet
category: mobile
group: overlay
tags: []
exports: [ActionSheet, ActionSheetTrigger, ActionSheetClose, ActionSheetContent]
status: enriched
---

# ActionSheet

> 动作面板 · 建在 Base UI Dialog 底滑(同 Drawer 范式·motion token CSS 镜像) + 动作即 Close + 危险态 + 独立取消块 + 安全区 · mobile/overlay

## 何时用

移动端从底部弹出一组列表式动作（保存/分享/删除等）并带独立「取消」块时用。常驻悬浮的单个主操作用 [Fab](../fab/fab.md)；从底部选时间/地区等多列滚轮值用 [Picker](../picker/picker.md)。

## 导入
```ts
import { ActionSheet, ActionSheetTrigger, ActionSheetClose, ActionSheetContent } from "@hulianui/ui"
```

## Props

`ActionSheet`（= Base UI `Dialog.Root` props，受控/非受控 open、onOpenChange 等照常）；`ActionSheetTrigger` / `ActionSheetClose` 透传对应 Base UI Dialog 部件。

**ActionSheetContent — Props**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `actions` * | `ActionSheetAction[]` | — | 动作列表（见下）；点击任一动作即关闭面板 |
| `container` | `HTMLElement \| null` | `document.body` | portal 挂载容器；传某祖先（如手机框，且其 transform/overflow-hidden）可把遮罩+面板约束在容器内 |
| `className` | `string` | — | — |

**ActionSheetAction**：`key: string` · `label: ReactNode` · `description?: ReactNode`（小字说明）· `danger?: boolean`（红色危险动作）· `disabled?: boolean` · `onClick?: () => void`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `onOpenChange` | `(open: boolean) => void` | `ActionSheet`（Dialog.Root）开关状态变化时触发（透传 Base UI Dialog） |

## Slots

`ActionSheetContent` 的内容注入槽：

| 插槽 | 类型 | 说明 |
|------|------|------|
| `title` | `ReactNode` | 顶部标题 |
| `description` | `ReactNode` | 标题下说明 |
| `cancelText` | `ReactNode \| null` | 取消按钮文案（默认「取消」），传 `null` 隐藏取消块 |

## 示例
```tsx
<ActionSheet>
  <ActionSheetTrigger>打开</ActionSheetTrigger>
  <ActionSheetContent
    title="图片操作"
    actions={[
      { key: "save", label: "保存" },
      { key: "delete", label: "删除", danger: true },
    ]}
  />
</ActionSheet>
```

## 禁忌 / 坑
- 点击任一 action 会先触发其 `onClick` 再自动关闭面板（动作即 Close），不需手动 close。
- 默认 portal 到 `document.body`；要「画框内弹层」必须给 `container` 指向那个有 `transform` 或 `overflow-hidden` 的祖先，否则遮罩会铺满整个视口。

## 相关
[TabBar](../tab-bar/tab-bar.md) · [Fab](../fab/fab.md) · [Picker](../picker/picker.md) · [SwipeAction](../swipe-action/swipe-action.md) · [PullToRefresh](../pull-to-refresh/pull-to-refresh.md) · [SafeArea](../safe-area/safe-area.md)
