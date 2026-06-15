---
slug: anchor
name: Anchor
category: navigation
group: inpage
tags: []
exports: [Anchor, flattenAnchorItems]
status: enriched
---

# Anchor

> 锚点导航 · 自研零依赖 scrollspy(IntersectionObserver) + 平滑滚动 + active CSS 变量滑动指示条 + offsetTop/二级项 · navigation/inpage

## 何时用

「左侧目录 + 右侧长文」型阅读页：API 文档、隐私协议、产品说明、分节设置表单。随滚动高亮当前章节，点击平滑滚动到目标。同层内容互斥切换用 [Tabs](../tabs/tabs.md)；表达层级位置用 [Breadcrumb](../breadcrumb/breadcrumb.md)；滚动时把目录钉在视口用 [Affix](../affix/affix.md) 包裹本组件。

## 导入
```ts
import { Anchor, flattenAnchorItems } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `AnchorItem[]` | — | 锚点项数组，支持一层 children 形成二级 |
| offsetTop | `number` | `0` | 滚动定位时目标顶部预留的偏移(px)，避开固定页头；同时收缩 scrollspy 观测区上沿 |
| onChange | `(href: string) => void` | — | 激活锚点变化回调（点击或滚动驱动均触发，同值不重复触发） |
| getContainer | `() => HTMLElement \| null` | `undefined`(window) | 自定义滚动容器；页面真正的滚动体不是 window 时**必须传** |

`AnchorItem`：`{ href: string; title: ReactNode; children?: AnchorItem[] }`，`href` 形如 `"#section-id"`，与页面元素 id 一一对应。

## 示例
```tsx
<Anchor
  items={[
    { href: "#sec-overview", title: "概述" },
    {
      href: "#sec-guide",
      title: "快速上手",
      children: [
        { href: "#sec-install", title: "安装" },
        { href: "#sec-usage", title: "基础用法" },
      ],
    },
    { href: "#sec-faq", title: "常见问题" },
  ]}
/>
```

内层 `overflow-y-auto` 容器滚动时：
```tsx
<Anchor items={items} getContainer={() => document.querySelector("main")} />
```

## 禁忌 / 坑

- [[scrollspy-anchor-hardcoded-window-scroll-breaks-in-inner-container]]：页面真正的滚动体若是内层元素（如 app shell 里 `<main class="overflow-y-auto">` 或 `Layout.Content`）而非 window，必须传 `getContainer` 指向它，否则点击目录不滚动、高亮也不跟随 —— 因为 scrollspy 的 IntersectionObserver root 与点击滚动都会落到该容器。
- 二级以内是刻意约束：超过两层目录在窄侧栏迅速失去可读性，改用可折叠树形导航。
- 组件带 `"use client"`，可在 RSC 页面里作客户端孤岛直接用。

## 相关
[Tabs](../tabs/tabs.md) · [Breadcrumb](../breadcrumb/breadcrumb.md) · [Pagination](../pagination/pagination.md) · [Affix](../affix/affix.md) · [BackTop](../back-top/back-top.md) · [Stepper](../_mui/stepper.md)
