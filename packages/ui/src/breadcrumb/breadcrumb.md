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

`BreadcrumbItem`：`{ label: ReactNode; href?: string; current?: boolean }`。`href` 省略则该项不可点（当前页或不可导航的祖先）；`current` 显式标记当前页，缺省时数组末项即当前页。

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

## 禁忌 / 坑

暂无已知坑。注意中间项省略 `href` 即渲染为不可点的纯文本（如「归档」这类无独立页面的祖先）。

## 相关
[Tabs](../tabs/tabs.md) · [Pagination](../pagination/pagination.md) · [Anchor](../anchor/anchor.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../stepper/stepper.md)
