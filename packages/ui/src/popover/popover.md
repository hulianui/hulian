---
slug: popover
name: Popover
category: feedback
group: overlay
tags: []
exports: [Popover, PopoverTrigger, PopoverClose, PopoverContent]
status: enriched
---

# Popover

> 气泡卡片 · click 触发 + 标题/描述/Close · feedback/overlay

## 何时用

click 触发的轻量浮层，承载标题/描述/少量操作（确认、快捷设置、表单片段），点外部或 Esc 关闭。需要纯文本提示用 [Tooltip](../tooltip/tooltip.md)（hover 触发）；需要 hover 展开富内容卡片用 [HoverCard](../hover-card/hover-card.md)；需要遮罩 + 焦点锁定的强中断流程用 [Dialog](../dialog/dialog.md)。

## 导入
```ts
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "@hulianui/ui"
```

## Props

`PopoverContent`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top"｜"right"｜"bottom"｜"left"` | `"bottom"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | `"center"` | 对齐 |
| sideOffset | `number` | — | 与触发器的间距 |
| className | `string` | — | 额外类名 |

## Slots

`PopoverContent`：

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题 |
| description | `ReactNode` | 描述 |
| children | `ReactNode` | 正文/操作区内容 |

`PopoverTrigger` / `PopoverClose` 用 `render` prop 接管自定义触发/关闭元素（如 `render={<Button>…</Button>}`）。

## 示例
```tsx
<Popover>
  <PopoverTrigger render={<Button>打开弹层</Button>} />
  <PopoverContent side="bottom" align="center" title="确认操作" description="点击外部或 Esc 关闭。">
    <div className="flex justify-end gap-2">
      <PopoverClose render={<Button variant="ghost">取消</Button>} />
      <PopoverClose render={<Button>确定</Button>} />
    </div>
  </PopoverContent>
</Popover>
```

## 禁忌 / 坑

- 触发/关闭走 `render` prop 注入元素，别再在 `PopoverTrigger` 里二次嵌套交互元素，避免 `<button>` 套 `<button>`。
- 若手搓 hover 开 + focus 关叠加在这类 focus-managing popover 上会无限闪烁，见 [[hovercard-on-focus-managing-popover-flickers-set-initial-final-focus-false]]：popover 打开时把焦点移入浮层会触发 trigger 的 onBlur 关闭，关闭又把焦点还给 trigger 触发 onFocus 打开 → ping-pong。本组件默认 click 语义不踩，但若改造成 hover 触发需把 `initialFocus`/`finalFocus` 设 false。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Tooltip](../tooltip/tooltip.md) · [HoverCard](../hover-card/hover-card.md)
