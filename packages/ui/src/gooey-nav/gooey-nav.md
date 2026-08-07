---
slug: gooey-nav
name: GooeyNav
category: navigation
group: global
tags: [animated]
exports: [GooeyNav]
status: enriched
---

# GooeyNav

> 胶质导航条 · 切换时白色药丸 motion 弹簧滑到目标 + 迸射一圈彩色粒子经 blur/contrast 熔成黏稠液滴(零依赖 CSS 关键帧·token 取色·受控/非受控·reduced-motion) · navigation/global · #animated

## 何时用

需要一条强动效、有"切换迸射"仪式感的水平导航条时用，多见于营销首页 / 作品集顶栏。要常规站点导航（下拉、多级、键盘可达性优先）用 [NavigationMenu](../navigation-menu/navigation-menu.md) 或 [NavMenu](../nav-menu/nav-menu.md)；要纯结构性站点头部布局用 [Navbar](../navbar/navbar.md)；只要"滑动药丸"不要粒子可设 `particleCount={0}`，效果接近 [PillNav](../pill-nav/pill-nav.md)。

## 导入
```ts
import { GooeyNav } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `GooeyNavItem[]` | — | 导航项数组，每项含 `label`（必填）+ `href`（可选，默认 `"#"`），至少 1 项 |
| initialActiveIndex | `number` | `0` | 初始选中下标，仅非受控（未传 `activeIndex`）时生效 |
| activeIndex | `number` | — | 受控选中下标，传入即受控，高亮位置由父级驱动 |
| animationTime | `number` | `600` | 单次迸射基准时长（ms），越大整体节奏越缓 |
| particleCount | `number` | `14` | 每次切换迸射的粒子数；`0` 关闭粒子仅保留药丸滑动 |
| particleDistances | `[number, number]` | `[86, 12]` | 粒子飞行的 [起始爆开半径, 回落收束半径]（px） |
| colors | `number[]` | `[1, 2, 3, 1, 4]` | 粒子调色板，取 chart token 序号（1..5），随机取色，吃明暗主题 |
| className | `string` | — | 透传根容器类名 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(index: number) => void` | 选中变化回调，点击 / 键盘 Enter\|Space 均触发 |

## 示例
```tsx
<GooeyNav
  items={[
    { label: "首页", href: "#" },
    { label: "产品", href: "#" },
    { label: "文档", href: "#" },
    { label: "关于", href: "#" },
  ]}
/>
```

仅药丸滑动、不要粒子：
```tsx
<GooeyNav items={items} particleCount={0} />
```

## 禁忌 / 坑

- 受控/非受控二选一：传了 `activeIndex` 即进入受控，组件内部不再自行改高亮，必须配合 `onChange` 回写父级 state，否则点击无反应。
- **容器必须是深色底** + `overflow-hidden`：药丸与粒子靠 blur/contrast 熔色，浅底或裁切不当观感会差（showcase 用 `oklch(0.16 0.02 265)` 深底承托）。
- 正因为容器恒为深色，本件的文字与药丸用**固定的黑白阶**（`text-white/80`、`bg-white`），不跟随页面主题。这不是漏接 token：跟随主题的话，亮色主题下 `--color-foreground` 是 `gray-900`，非激活项就成了「深字压深底」，直接看不见（#133）。放到浅色区域用会反过来失效——那时该换 [PillNav](../pill-nav/pill-nav.md) 或 [NavMenu](../nav-menu/nav-menu.md)。
- reduced-motion 下粒子与弹簧动画自动跳过，仅保留瞬时切换，属预期降级。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
