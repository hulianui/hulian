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
| children | `ReactNode` | — | 一组 `DockIcon` |
| magnification | `number` | — | 鼠标靠近时图标放大到的峰值尺寸(px) |
| distance | `number` | — | 放大影响范围半径(px) |
| iconSize | `number` | — | 静息图标尺寸(px) |
| className | `string` | — | — |

### DockIcon
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children | `ReactNode` | — | 单个图标内容 |
| className | `string` | — | — |

## 示例
```tsx
<Dock>
  <DockIcon><Home className="size-5" /></DockIcon>
  <DockIcon><Search className="size-5" /></DockIcon>
  <DockIcon><Settings className="size-5" /></DockIcon>
</Dock>
```

## 禁忌 / 坑

- 候选坑 skill（macos-dock-icon-needs-baked-squircle-margin、tauri-macos-hide-to-tray）均针对原生 macOS / Tauri 的系统 Dock，与本 React 组件无关，不适用。
- 放大依赖随鼠标移动下发的 `mouseX`（context + motion 弹簧），是纯客户端交互；图标统一用固定尺寸（如 `size-5`）以便放大动画一致。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md)
