---
slug: bubble-menu
name: BubbleMenu
category: navigation
group: global
tags: [animated]
exports: [BubbleMenu]
status: enriched
---

# BubbleMenu

> 气泡导航菜单 · logo 气泡 + 汉堡切换钮，点开整屏铺一组错落旋转胶囊导航 · 胶囊弹性 scale 入场 + 标签上滑淡入按序错峰(motion·零 gsap·reduced-motion) · navigation/global · #animated

## 何时用

营销站/作品集这类需要花哨全屏遮罩式主导航时用：点汉堡铺开一组错落旋转的胶囊链接。它是炫技型一级导航；要规范的多级下拉/横向导航条用 [NavigationMenu](../navigation-menu/navigation-menu.md)/[NavMenu](../nav-menu/nav-menu.md)，要标准应用顶栏用 [Navbar](../navbar/navbar.md)，要展开成卡片的那种用 [CardNav](../card-nav/card-nav.md)。

## 导入
```ts
import { BubbleMenu } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| logo | `ReactNode` | — | 左上角 logo 气泡内容：字符串当图片 src，ReactNode 直接渲染 |
| items | `BubbleMenuItem[]` | 内置示例项 | 菜单项列表，缺省用内置示例 |
| onMenuClick | `(isOpen: boolean) => void` | — | 开合状态回调，参数为下一状态是否打开 |
| menuAriaLabel | `string` | — | 切换按钮无障碍标签 |
| useFixedPosition | `boolean` | `false` | true=fixed（贴视口），false=absolute（贴最近定位父级） |
| animationDuration | `number` | `0.5` | 单个胶囊弹入动画时长（秒） |
| staggerDelay | `number` | `0.12` | 相邻胶囊入场错峰延迟（秒） |
| className | `string` | — | 透传根 nav 额外类名 |
| style | `CSSProperties` | — | 透传根 nav 内联样式 |

> `BubbleMenuItem`: `{ label, href, ariaLabel?, rotation?, hoverStyles? }`；`rotation` 是桌面端胶囊旋转角（移动端归零），`hoverStyles` 为 `{ bgColor?, textColor? }` 悬停反色。

## 示例
```tsx
// 默认内置项
<div className="relative h-96 overflow-hidden rounded-xl">
  <BubbleMenu logo={<span>瑚琏</span>} />
</div>

// 自定义项 + chart token 反色
const items = [
  { label: "首页", href: "#", rotation: -6, hoverStyles: { bgColor: "var(--color-chart-1)", textColor: "var(--color-primary-foreground)" } },
  { label: "文档", href: "#", rotation: 6, hoverStyles: { bgColor: "var(--color-chart-2)", textColor: "var(--color-primary-foreground)" } },
];
<BubbleMenu logo={<span>瑚琏</span>} items={items} />
```

## 禁忌 / 坑

- `useFixedPosition={false}`（默认）时根 nav 为 absolute，须有 `position: relative` 的定位父级（否则贴到更外层）；做真实站点顶栏一般要 `useFixedPosition` 或自行控制定位上下文。
- 父容器需 `overflow-hidden` 收住展开时铺满的气泡层。
- 颜色走 token 用 `--color-` 前缀。reduced-motion 下入场动效降级。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
