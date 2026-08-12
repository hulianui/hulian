---
slug: breadcrumb
name: Breadcrumb
category: navigation
group: inpage
tags: []
exports: [Breadcrumb]
status: enriched
---

# Breadcrumb

> 面包屑 · 纯皮肤静态 + aria-current 当前页语义 · navigation/inpage

## 何时用

表达当前页在站点层级中的位置（首页 / 组件 / 面包屑），并提供逐级回退链接。同层内容互斥切换用 [Tabs](../tabs/tabs.md)；翻页用 [Pagination](../pagination/pagination.md)；有序流程用 [Stepper](../stepper/stepper.md)。

## 导入
```ts
import { Breadcrumb } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `BreadcrumbItem[]` | — | 路径项数组，从根到当前页自左向右 |

`BreadcrumbItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| label * | `ReactNode` | — | 显示内容 |
| href | `string` | — | 链接地址；省略则该项不可点（当前页或不可导航的祖先） |
| current | `boolean` | — | 显式标记为当前页；缺省时数组末项即当前页 |
| render | `ReactElement` | — | 渲染为自定义元素（`next/link`、`react-router` 的 `Link`…），皮肤类名与 `aria-current` 合并进该元素，`label` 作它的子节点 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| separator | `ReactNode` | 分隔符，默认 `"/"`，可换 chevron 等（装饰位自动 aria-hidden） |

## 示例
```tsx
<Breadcrumb
  items={[
    { label: "首页", href: "/" },
    { label: "组件", href: "/components" },
    { label: "面包屑" }, // 末项无 href = 当前页
  ]}
/>
```

换 chevron 分隔符：
```tsx
<Breadcrumb items={items} separator={<ChevronIcon />} />
```

接客户端路由（Next.js / react-router），与 `Button` / `Link` / `NavMenuItem` 同一个 `render` 口径：
```tsx
<Breadcrumb
  items={[
    { label: "客户", render: <Link href="/customers" /> },
    { label: "张三" }, // 末项是当前页，不给 render 即保持不可点
  ]}
/>
```

## 禁忌 / 坑

- 中间项省略 `href` 即渲染为不可点的纯文本（如「归档」这类无独立页面的祖先）。
- SPA 里别用裸 `href`：那是整页刷新。走 `render` 传框架的 `Link`，它真的被渲染出来（不是在 `<nav>` 上劫持点击），所以 Cmd+点击开新标签、中键、Shift 开新窗这些原生行为不用自己一条条放行。
- 传了 `render` 的项以它为准：即使该项是当前页也仍渲染为该元素，只是带上 `aria-current="page"`——想保留「当前页不可点」就别给末项传 `render`。`href` 由该元素自带；若该项同时写了 `href`，以该项的为准。
- 类名合并顺序同库内其它 `render`：本组件皮肤在前、`render` 元素自带的 `className` 在后（后者胜出）。

## 相关
[Tabs](../tabs/tabs.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
