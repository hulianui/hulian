---
slug: link
name: Link
category: navigation
group: action
tags: []
exports: [Link, linkVariants]
status: enriched
---

# Link

> 链接 · tone×underline + external 自动 target/rel/图标 + RSC · navigation/action

## 何时用

需要文字跳转（站内/站外链接、行内引用）时用，自带 tone 语调、下划线策略与外链安全属性。需要按钮样式的可点击操作（提交、打开弹窗）用 Button，别把 Link 当按钮使。

## 导入
```ts
import { Link, linkVariants } from "@hulianui/ui"
```

## Props

继承 `<a>` 的全部原生属性（`href`、`target`、`onClick` 等，但剔除原生 `color`）。新增：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `tone` | `"primary" \| "foreground" \| "danger"` | `"primary"` | 文字语调色 |
| `underline` | `"always" \| "hover" \| "none"` | `"hover"` | 下划线显示策略 |
| `external` | `boolean` | `false` | 外链：自动加 `target="_blank"` + `rel="noopener noreferrer"` + 尾随外链图标 |
| `href` | `string` | — | 跳转地址（原生属性） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `onClick` | `(e: MouseEvent<HTMLAnchorElement>) => void` | 点击回调（透传原生 `<a>` 事件，其余 `onXxx` 同理） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `children` | `ReactNode` | 链接文字 |

## 示例
```tsx
<Link href="/docs">瑚琏文档</Link>
<Link href="https://base-ui.com" external>Base UI 官网</Link>
<Link href="#" underline="always" tone="danger">删除说明</Link>
```

## 禁忌 / 坑

- 设了 `external` 就不必再手写 `target`/`rel`，组件已自动注入安全属性并补外链图标；手写反而可能与之冲突。
- 这是原生 `<a>` 的薄包、RSC 友好，不做客户端路由拦截；接入 Next.js 路由需自行用 `<Link asChild>` 思路或包一层框架 Link（本组件未内置）。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
