---
slug: staggered-menu
name: StaggeredMenu
category: navigation
group: global
tags: [animated]
exports: [StaggeredMenu]
status: enriched
---

# StaggeredMenu

> 侧滑分层菜单 · 侧滑分层导航菜单 · 触发按钮（菜单↔关闭文字滚动 + 加号旋转 225°）唤起面板 · 多层色层错峰滑入做叠纸质感 + 主条目自下而上带旋转依次入场 + 序号/社交链接尾随淡入（motion 去 gsap·token·reduced-motion） · navigation/global · #animated

## 何时用

需要一个有强叠纸/错峰仪式感的侧滑全屏（或全容器）抽屉式导航时用，常见于品牌站 / 作品集的汉堡菜单。要水平常驻导航条用 [PillNav](../pill-nav/pill-nav.md) 或 [GooeyNav](../gooey-nav/gooey-nav.md)；要功能性下拉/多级菜单用 [NavigationMenu](../navigation-menu/navigation-menu.md) 或 [Menu](../menu/menu.md)。本组件内部 `absolute` 定位，需放进 `relative + 固定高度 + overflow-hidden` 的承托容器；整页罩层场景设 `isFixed`。

## 导入
```ts
import { StaggeredMenu } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `StaggeredMenuItem[]` | — | 主条目列表，空数组渲染占位「No items」 |
| socialItems | `StaggeredMenuSocial[]` | — | 社交链接列表，配合 `displaySocials` 在面板底部展示 |
| position | `"left" \| "right"` | `"right"` | 面板与色层滑出方向 |
| colors | `string[]` | chart-4 / chart-1 两层 | 面板背后多层色层颜色（错峰滑入），最多取前 4 个；建议喂 `var(--color-chart-*)` token |
| displaySocials | `boolean` | `true` | 是否展示底部社交区（仅 `socialItems` 非空才实际渲染） |
| displayItemNumbering | `boolean` | `true` | 是否给主条目展示前缀序号（01 / 02 …） |
| accentColor | `string` | `var(--color-primary)` | 强调色（序号 / 社交标题 / 条目 hover） |
| isFixed | `boolean` | `false` | 是否 `fixed` 铺满视口（整页罩层）；否则相对父容器铺满 |
| closeOnClickAway | `boolean` | `true` | 点击面板外区域是否关闭 |
| className | `string` | — | 透传根容器类名 |
| style | `CSSProperties` | — | 透传根容器内联样式 |

`StaggeredMenuItem`：`{ label; link?; ariaLabel? }`（`link` 缺省渲染为不可跳转 span）。`StaggeredMenuSocial`：`{ label; link }`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onMenuOpen | `() => void` | 菜单打开回调 |
| onMenuClose | `() => void` | 菜单关闭回调 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| brand | `ReactNode` | 触发按钮旁的品牌槽（通常放 logo 文字或图标），缺省渲染默认文字「瑚琏」 |

## 示例
```tsx
<div className="relative h-96 overflow-hidden rounded-xl border border-border bg-bg">
  <StaggeredMenu
    items={[
      { label: "首页", link: "#home" },
      { label: "产品", link: "#product" },
      { label: "关于", link: "#about" },
    ]}
    socialItems={[
      { label: "GitHub", link: "https://github.com" },
      { label: "知乎", link: "https://zhihu.com" },
    ]}
  />
</div>
```

整页罩层 + 左侧滑入：
```tsx
<StaggeredMenu isFixed position="left" items={items} socialItems={socials} brand="HULIAN" />
```

## 禁忌 / 坑

- 非 `isFixed` 时必须放进 `relative + 固定高度 + overflow-hidden` 容器：组件内部 `absolute` 定位，缺承托会塌缩或溢出（showcase 用 `relative h-96 overflow-hidden`）。
- `displaySocials` 为 `true` 但 `socialItems` 为空时底部社交区不渲染，二者需同时给。
- 色层 `colors` 喂主题色请用 `var(--color-chart-*)` 这类带 `--color-` 前缀的 token；裸 `var(--primary)` 在 SVG/canvas 取色处可能不解析。
- reduced-motion 下错峰入场退化为直接显示，属预期。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
