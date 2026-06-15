---
slug: hover-card
name: HoverCard
category: feedback
group: overlay
tags: []
exports: [HoverCard, HoverCardTrigger, HoverCardContent]
status: enriched
---

# HoverCard

> 悬停卡片 · Popover 引擎自研 hover 开/移出延迟关(复刻 Tooltip delay 范式) + 富内容 · feedback/overlay

## 何时用

hover 触发展开的富内容卡片（用户名片、术语释义、链接预览），带开/关延迟避免误触。纯文本短提示用 [Tooltip](../tooltip/tooltip.md)；click 触发 + 操作按钮用 [Popover](../popover/popover.md)；专做「封面图 + 标题 + 域名」链接预览用 [Glimpse](../glimpse/glimpse.md)。

## 导入
```ts
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@hulianui/ui"
```

## Props

`HoverCard`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | Trigger + Content |
| openDelay | `number` | `300` | 悬停多少毫秒后打开 |
| closeDelay | `number` | `150` | 移出多少毫秒后关闭 |

`HoverCardContent`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 卡片内容 |
| side | `"top"｜"right"｜"bottom"｜"left"` | `"bottom"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | `"center"` | 对齐 |
| sideOffset | `number` | — | 与触发器的间距 |
| className | `string` | — | 额外类名 |

`HoverCardTrigger` 用 `render` prop 接管触发元素（行内链接/按钮）。

## 示例
```tsx
<HoverCard>
  <HoverCardTrigger
    render={<button type="button" className="font-medium text-primary underline">@瑚琏设计系统</button>}
  />
  <HoverCardContent side="bottom" align="center">
    <div className="flex gap-3">
      <div className="flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">瑚</div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">瑚琏设计系统</p>
        <p className="text-xs text-muted">悬停展开 · 移出延迟关闭</p>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>
```

## 禁忌 / 坑

- 本组件已按 [[hovercard-on-focus-managing-popover-flickers-set-initial-final-focus-false]] 把焦点交还语义关掉（不在打开时夺取焦点），避免 hover + focus 在 focus-managing popover 上 ping-pong 无限闪烁；若 fork 改造别重新打开焦点托管。
- 用 `openDelay`/`closeDelay` 调防误触，别把 `closeDelay` 设 0，否则光标在 trigger 与卡片间移动的瞬间会闪关。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
