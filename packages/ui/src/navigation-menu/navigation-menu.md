---
slug: navigation-menu
name: NavigationMenu
category: navigation
group: global
tags: []
exports: [NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink]
status: enriched
---

# NavigationMenu

> 导航菜单 · Base UI navigation-menu 薄包(mega 面板/共享 Viewport 尺寸形变) + 触发器/内容/链接 + chevron 旋转 · navigation/global

## 何时用

站点顶部主导航，需要把多个入口归到「产品 / 资源」等下拉里，且下拉内容是 mega 面板（多列卡片、图标+描述）时用。纯链接横排不带下拉用 [Navbar](../navbar/navbar.md)；点击触发的指令式下拉菜单（编辑/删除等动作）用 [Menu](../menu/menu.md)；桌面应用的 File/Edit/View 菜单条用 [Menubar](../menubar/menubar.md)。

## 导入
```ts
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink } from "@hulianui/ui"
```

## Props

根 `NavigationMenu` 透传 Base UI `NavigationMenu.Root`，各子件透传对应 Base UI 部件，均叠加 `className`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `any` | — | 受控：当前展开项的 value |
| defaultValue | `any` | — | 非受控初始展开项 |
| onValueChange | `(value) => void` | — | 展开项变化回调 |
| delay | `number` | `100` | 悬停到开启的延迟(ms)，`0` 为 hover 即开 |
| closeDelay | `number` | — | 移出到关闭的延迟(ms) |
| orientation | `"horizontal" \| "vertical"` | `"horizontal"` | 菜单条方向 |
| className | `string` | — | 根容器样式 |

子件（`NavigationMenuItem` 需 `value`；`NavigationMenuLink` 透传 `href` 等锚点属性）均接受 `className` 并透传 Base UI 同名部件属性。

## 示例
```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem value="products">
      <NavigationMenuTrigger>产品</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid grid-cols-2 gap-1">{/* NavigationMenuLink 列表 */}</div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem value="pricing">
      <NavigationMenuLink href="/pricing">价格</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

## 禁忌 / 坑

- [[base-ui-navigation-menu-content-must-stay-in-flow-for-popup-size-measure]]：别给激活的 `NavigationMenuContent` 加 `position: absolute`。Base UI 靠测量内容的自然尺寸来驱动共享 Viewport 的 `--popup-width/height` 形变；脱离文档流会让自然尺寸变 0，面板塌成 ~2×2px 看不见（构建和单测都过、屏上却空白）。
- 纯链接项（无下拉）直接在 `NavigationMenuItem` 里放 `NavigationMenuLink`，不要套 Trigger/Content。

## 相关
[Navbar](../navbar/navbar.md) · [BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
