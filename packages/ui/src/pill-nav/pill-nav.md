---
slug: pill-nav
name: PillNav
category: navigation
group: global
tags: [animated]
exports: [PillNav]
status: enriched
---

# PillNav

> 胶囊导航条 · 悬停底部圆涨满 + 文案翻转反相 + 激活指示圆点(纯 CSS·零依赖·RSC 安全·reduced-motion) · navigation/global · #animated

## 何时用

需要一条轻量、纯 CSS、可在 server component 直接渲染的胶囊式站点头部导航时用，常配左侧品牌 logo。要切换时迸射粒子的更强动效用 [GooeyNav](../gooey-nav/gooey-nav.md)；要常规多级 / 下拉菜单用 [NavigationMenu](../navigation-menu/navigation-menu.md) 或 [NavMenu](../nav-menu/nav-menu.md)；要纯结构性站点头部用 [Navbar](../navbar/navbar.md)。本组件只渲染 `<a>`，激活态由 `activeHref` 字符串匹配驱动而非下标。

## 导入
```ts
import { PillNav } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLElement>, "children">`（透传到根 `<nav>`）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `PillNavItem[]` | - | 导航项列表，每项 `{ href, label, ariaLabel? }`，每项渲染为一颗胶囊 |
| activeHref | `string` | - | 当前激活项的 href，命中后胶囊常驻反相态 + 底部点亮指示圆点 |
| logoHref | `string` | `items[0].href` → `"#"` | logo 区链接地址 |
| logoAriaLabel | `string` | `"Home"` | logo 区无障碍标签 |
| initialLoadAnimation | `boolean` | `true` | 首次加载入场动画（logo 弹入 + 胶囊展开），reduced-motion 下自动跳过 |
| className | `string` | - | 合并到根 `<nav>` 的类名 |

`PillNavItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| href * | `string` | - | 链接地址（http/https/mailto/tel/# 外链或站内路由皆可，组件只渲染 `<a>`） |
| label * | `string` | - | 显示文案 |
| ariaLabel | `string` | 回退到 `label` | 无障碍标签 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| logo | `React.ReactNode` | 左侧圆形 logo 区内容（通常放 `<img>` 或图标），悬停旋转一圈；不传则不渲染 logo 区 |

## 示例
```tsx
<PillNav
  items={[
    { href: "#home", label: "Home" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
    { href: "#docs", label: "Docs" },
  ]}
  activeHref="#home"
  logo={<Mark />}
/>
```

无 logo 的纯导航：
```tsx
<PillNav items={items} activeHref="#features" />
```

## 禁忌 / 坑

- 激活靠 href 字面匹配：`activeHref` 必须与某个 `items[].href` **完全相等**才会点亮，站内路由要保证传入的当前路径与配置的 href 字符串一致（含锚点/斜杠）。
- 参见 [[sliding-pill-indicator-inverted-text-lives-in-pill-z-above]]：滑动药丸 + 选中项反相文字这类结构，反相文字必须活在药丸内、z 轴位于药丸之上，否则会出现"高亮先到、文字才变白"或浅色主题下激活态丢色；本组件已内置正确叠层。
- 参见 [[flex-row-pill-offset-from-inline-child-in-block-wrapper]]：胶囊排成 `flex items-center` 一行时，若某颗（如带定位包裹的 logo）是 inline 元素套普通 block `<div>`，会因继承行高使其按行盒基线下沉、与兄弟胶囊错位几像素；包裹层用 `flex items-center` + `leading-none` 即可对齐。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
