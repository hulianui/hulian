---
slug: tooltip
name: Tooltip
category: feedback
group: overlay
tags: []
exports: [Tooltip, TooltipTrigger, TooltipProvider, TooltipContent]
status: enriched
---

# Tooltip

> 悬停时在旁边浮出一句简短说明，带指向箭头 · feedback/overlay

## 何时用

hover/focus 触发的纯文本短提示（图标含义、截断文字全文、操作说明）。承载富内容（头像 + 简介卡片）用 [HoverCard](../hover-card/hover-card.md)；click 触发 + 带操作按钮用 [Popover](../popover/popover.md)。`delay` / `closeDelay` 在 `TooltipProvider` 上，不在 `Tooltip` 上。

## 导入
```ts
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "@hulianui/ui"
```

## Props

`TooltipContent`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top"｜"right"｜"bottom"｜"left"` | `"top"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | `"center"` | 对齐 |
| sideOffset | `number` | - | 与触发器的间距 |
| className | `string` | - | 额外类名 |

`TooltipProvider` 接 `delay` / `closeDelay`（ms）控制开合延迟。

## Slots

`TooltipContent`：

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 提示文案 |

`TooltipTrigger` 用 `render` prop 接管触发元素 —— **触发器是可交互元素（button / a / input）时这是硬要求，不能当 children 传**，原因见下方「禁忌 / 坑」。

## 示例
```tsx
<TooltipProvider delay={0} closeDelay={0}>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">悬停查看</Button>} />
    <TooltipContent side="top" align="center">瑚琏提示</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

## 禁忌 / 坑

- **触发器必须用 `render` 注入，不能当 children 传。** `TooltipTrigger` 默认自渲一个 `<button>`，
  children 是塞进它*里面*而不是替换它 —— 传一个 `<button>` 进去就套成 `button > button`：

  ```tsx
  // ✗ 从 HeroUI(Tooltip.Trigger 合并 props 进子元素) 迁过来最容易这么写
  <TooltipTrigger>
    <button aria-label="设置" onClick={onOpen}>⚓</button>
  </TooltipTrigger>

  // ✓ render 是「渲染成这个元素」而不是「包裹这个元素」，Base UI 会把自己的 handler
  //   合并进去，你自己的 onClick 照常保留
  <TooltipTrigger render={<button aria-label="设置" onClick={onOpen}>⚓</button>} />
  ```

  这个错误 **tsc / eslint / build / 肉眼全都不报**（children 类型完全合法，嵌套 button 在浏览器里照样可点），
  只有查 a11y 树才看得出来 —— 屏读用户会听到两颗按钮，且嵌套交互元素是无效 HTML（hulianui/hulian#20）。
- **`TooltipContent` 渲染出的 popup 不带 `role="tooltip"`。** 写验收/E2E 脚本时按 `[role="tooltip"]`
  查会查不到，请按文本或类名定位。
- `delay`/`closeDelay` 写在 `TooltipProvider` 而非 `Tooltip`；截图/稳态验收时把两者设 0 让 hover 即开。
- 在 flex 行内（带 `text-overflow:ellipsis` + `min-w-0`）用 Tooltip 包裹文本时，触发器 wrapper 若是 `inline-block` 会按内容固有宽撑开、绕过父级宽度约束破坏截断（同类问题见 [[heroui-tooltip-trigger-inline-block-breaks-flex-truncation]]）；本组件用 `render` 注入元素时确保触发元素本身保持 `block; min-w-0`。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [HoverCard](../hover-card/hover-card.md)
