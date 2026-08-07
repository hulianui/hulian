---
slug: dock
name: Dock
category: navigation
group: global
tags: []
exports: [Dock, DockIcon]
status: enriched
---

# Dock

> 放大坞 · macOS 式按鼠标距离放大图标(motion 弹簧 + context 下发 mouseX) · navigation/global

## 何时用

页面底部/侧边的悬浮快捷入口栏，鼠标靠近时图标按距离弹性放大，营造 macOS Dock 观感，多用于个人站、作品集、桌面风格 demo。常规站点导航用 [Navbar](../navbar/navbar.md)；功能性下拉/菜单条用 [Menu](../menu/menu.md) / [Menubar](../menubar/menubar.md)。

## 导入
```ts
import { Dock, DockIcon } from "@hulianui/ui"
```

## Props

### Dock
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| magnification | `number` | — | 鼠标靠近时图标放大到的峰值尺寸(px) |
| distance | `number` | — | 放大影响范围半径(px) |
| iconSize | `number` | — | 静息图标尺寸(px) |
| activeKey | `string` | — | 当前项 key，与 DockIcon 的 `itemKey` 比对 |
| onSelect | `(key: string) => void` | — | 点击某项。**提供它才把 DockIcon 渲染成真正的 `<button>`**，底座同时升级为 `nav` 地标 |
| aria-label | `string` | — | 渲染为 `<nav>` 时的地标名称 |
| className | `string` | — | — |

### DockIcon
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| itemKey | `string` | — | 本项 key，配合 Dock 的 `activeKey` / `onSelect` |
| active | `boolean` | — | 直接指定选中态，优先于 `activeKey` 比对结果 |
| label | `string` | — | 可点击时的无障碍名（图标本身通常没有文字） |
| className | `string` | — | — |

## Slots

### Dock
| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 一组 `DockIcon` |

### DockIcon
| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 单个图标内容 |

## 示例
```tsx
<Dock>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Settings className="size-5" /></DockIcon>
</Dock>
```

## 禁忌 / 坑

- **选中态是 Dock 的核心信息，不是装饰**。macOS Dock 本身就有「当前应用高亮」与「运行中指示点」；Web 上 Dock 的典型用法是常驻底部导航，同样要回答「我现在在哪」。用 `activeKey` + `DockIcon` 的 `itemKey` 表达，组件会给出 `aria-current="page"` 与图标下方的指示点（形状线索，不只靠颜色）。
- **接了 `onSelect` 才会渲染成真正的 `<button>`**（可聚焦、可回车激活），底座同时升级为 `nav` 地标。不接时 `DockIcon` 保持无语义容器 —— 因为很多消费方是往 children 里放自己的 `<a>` 的，自动包一层 button 会造成嵌套交互元素。

- 候选坑 skill（macos-dock-icon-needs-baked-squircle-margin、tauri-macos-hide-to-tray）均针对原生 macOS / Tauri 的系统 Dock，与本 React 组件无关，不适用。
- 放大依赖随鼠标移动下发的 `mouseX`（context + motion 弹簧），是纯客户端交互；图标统一用固定尺寸（如 `size-5`）以便放大动画一致。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
