---
slug: glimpse
name: Glimpse
category: feedback
group: overlay
tags: []
exports: [Glimpse]
status: enriched
---

# Glimpse

> 链接预览 · dogfood HoverCard 引擎换皮成「封面图+标题+描述+域名」预览卡(维基式 hover preview) · 触发器随 href 渲染外链 a 或纯 span 保持行内排版 · 描述多行截断 · feedback/overlay

## 何时用

行文中悬停链接/术语时弹出「封面图 + 标题 + 描述 + 域名」预览卡（维基式 hover preview），不打断阅读。需要完全自定义卡片内容用底层 [HoverCard](../hover-card/hover-card.md)；纯文本短提示用 [Tooltip](../tooltip/tooltip.md)。传 `href` 则触发器渲染为新标签页外链并在卡底显示域名，不传则渲染纯 `span` 保持行内排版。

## 导入
```ts
import { Glimpse } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| image | `string` | — | 预览图 URL（顶部封面） |
| href | `string` | — | 链接地址；传入则触发器渲染为新标签页外链，卡底显示域名 |
| side | `"top"｜"right"｜"bottom"｜"left"` | `"bottom"` | 浮层方位 |
| align | `"start"｜"center"｜"end"` | — | 对齐 |
| openDelay | `number` | `300` | 悬停打开延迟(ms) |
| closeDelay | `number` | `150` | 移出关闭延迟(ms) |
| className | `string` | — | 触发器额外类名 |
| contentClassName | `string` | — | 预览卡片额外类名 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 触发元素（行内链接文字/缩略词） |
| title | `ReactNode` | 预览标题 |
| description | `ReactNode` | 预览描述（多行截断） |

## 示例
```tsx
<p className="max-w-md leading-7 text-foreground">
  我们的设计系统基于{" "}
  <Glimpse
    href="https://hulian.example.com/tokens"
    image={cover}
    title="瑚琏设计 Token"
    description="一套语义化的颜色 / 间距 / 圆角变量，明暗模式开箱即用。"
  >
    语义 token
  </Glimpse>{" "}
  构建，悬停链接即可预览。
</p>
```

## 禁忌 / 坑

- 文档站门禁禁外链图片，`image` 在 showcase/demo 里用本地资源或 SVG data-uri 占位，别引远程图片。
- 不传 `href` 时触发器是纯 `span`（无跳转语义），只做术语释义；要可点击跳转必须给 `href`。
- 基于 HoverCard 引擎，hover 防误触延迟由 `openDelay`/`closeDelay` 控，别设 0。

## 相关
[Dialog](../dialog/dialog.md) · [Modal](../modal/modal.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Drawer](../drawer/drawer.md) · [Popover](../popover/popover.md) · [Tooltip](../tooltip/tooltip.md)
