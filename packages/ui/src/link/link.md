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

> 带样式的链接，外链自动加图标和安全属性 · navigation/action

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
| `href` | `string` | - | 跳转地址（原生属性） |
| `render` | `ReactElement` | - | 渲染为自定义元素，用来承载框架路由件（`next/link`、`react-router` 的 `Link`）。皮肤 class 与 Link 自身的 props 合并进该元素，`href` 由它自己带 |

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

// 客户端路由：把框架的 Link 交给 render，href 写在它身上
import NextLink from "next/link"
<Link render={<NextLink href="/posts/1" />}>查看详情</Link>
```

## 禁忌 / 坑

- 设了 `external` 就不必再手写 `target`/`rel`，组件已自动注入安全属性并补外链图标；手写反而可能与之冲突。
- **接客户端路由必须走 `render`，`href` 写在被 render 的那个元素上**。`<Link href="/a" render={<NextLink />}>` 这种写法里 `href` 落在瑚琏这层、传不到路由件，等于没接。
- `render` 之外的写法（例如把路由件包在 Link 外面）会得到 `<a>` 套 `<a>`，是非法 DOM 且 React 会报 hydration 错。

## 相关
[Command](../command/command.md) · [ContextMenu](../context-menu/context-menu.md) · [Toolbar](../toolbar/toolbar.md) · [Accordion](../accordion/accordion.md) · [Collapsible](../collapsible/collapsible.md) · [AnimatedThemeToggler](../animated-theme-toggler/animated-theme-toggler.md)
