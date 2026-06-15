---
slug: navbar
name: Navbar
category: navigation
group: global
tags: []
exports: [Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle]
status: enriched
---

# Navbar

> 导航栏 · 复合 Brand/Content/Item/MenuToggle + sticky + 移动端切换 · navigation/global

## 何时用

页面顶部全局导航条（品牌 + 主菜单 + 移动端汉堡切换）用。它是横向顶栏复合件——左侧纵向 Sider 树菜单用 [NavMenu](../nav-menu/nav-menu.md)，带下拉面板的多级导航用 [NavigationMenu](../navigation-menu/navigation-menu.md)，页脚备案行用 [BeianFooter](../beian-footer/beian-footer.md)。

## 导入
```ts
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, NavbarMenuToggle } from "@hulianui/ui"
```

## Props

各子件均继承对应原生元素属性。

**Navbar**（`<nav>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| sticky | `boolean` | — | 是否 sticky 吸顶 |
| bordered | `boolean` | — | 是否显示底部分隔边框 |
| children | `ReactNode` | — | 子内容 |

**NavbarContent**（`<ul>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| justify | `"start" \| "center" \| "end"` | — | 内容对齐方向 |

**NavbarItem**（`<li>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| isActive | `boolean` | — | 当前激活项（aria-current + 高亮） |

**NavbarMenuToggle**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| isOpen | `boolean` | — | 受控展开态 |
| onToggle | `() => void` | — | 切换回调 |
| aria-label | `string` | 按 isOpen 切换 | 无障碍标签 |
| className | `string` | — | 类名 |

`NavbarBrand` 为纯容器，无专属 prop。

## 示例
```tsx
function Header() {
  const [open, setOpen] = useState(false);
  return (
    <Navbar sticky bordered>
      <NavbarMenuToggle isOpen={open} onToggle={() => setOpen((v) => !v)} />
      <NavbarBrand>瑚琏</NavbarBrand>
      <NavbarContent justify="end" className="hidden sm:flex">
        <NavbarItem isActive>组件</NavbarItem>
        <NavbarItem>文档</NavbarItem>
        <NavbarItem>主题</NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
```

## 禁忌 / 坑

- `NavbarMenuToggle` 是受控件，`isOpen`/`onToggle` 由你自己维护 state，移动端展开菜单也需你按 `open` 自行条件渲染（组件不替你管面板开合）。
- 暂无其他已知坑。

## 相关
[BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
