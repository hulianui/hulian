---
slug: animated-theme-toggler
name: AnimatedThemeToggler
category: navigation
group: action
tags: [animated]
exports: [AnimatedThemeToggler]
status: enriched
---

# AnimatedThemeToggler

> 主题切换 · View Transitions 圆形揭示明暗(复用瑚琏 useTheme + 降级) · navigation/action · #animated

## 何时用

需要一个带圆形揭示动画的明暗主题切换按钮时用（顶栏/设置区），点击从按钮位置径向扩散切换主题。只想要无动画的纯切换、或自定义控件请直接用 `useTheme()` 自行搭。

## 导入
```ts
import { AnimatedThemeToggler } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `duration` | `number` | — | 圆形揭示动画时长(ms) |
| `className` | `string` | — | 按钮类名 |
| `aria-label` | `string` | — | 无障碍标签 |

## 示例
```tsx
<AnimatedThemeToggler aria-label="切换明暗主题" />
```

## 禁忌 / 坑

- 依赖 View Transitions API 做圆形揭示，浏览器不支持时自动降级为瞬时切换（无动画），切换本身仍生效。
- 内部用 `useTheme` 读写主题、点击时读按钮位置算扩散圆心，属客户端组件；在 RSC 树里使用须确保父级有 `"use client"` 边界。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [Link](../link/link.md)
