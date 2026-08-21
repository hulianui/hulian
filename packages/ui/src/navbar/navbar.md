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

> 搭出响应式顶部导航，含品牌、链接和移动端菜单 · navigation/global

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
| sticky | `boolean` | - | 是否 sticky 吸顶 |
| bordered | `boolean` | - | 是否显示底部分隔边框 |

**NavbarBrand**（`<div>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| grow | `boolean` | `true` | 是否与两侧 `NavbarContent` 等分空间（`flex-1 basis-0`）。三段等分是 `justify="center"` **真的落在导航栏中心**的前提；内容仍靠 `justify-start` 贴左，视觉不变。传 `false` 回到定宽（`shrink-0`），只有「品牌 + 一段紧贴品牌的 `justify="start"` 内容」这种两段式版式需要 |

**NavbarContent**（`<ul>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| justify | `"start" \| "center" \| "end"` | `"start"` | 内容对齐方向。`"center"` 居中的参照是**整条导航栏**（前提是品牌段 `grow`，见上） |

**NavbarItem**（`<li>`）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| isActive | `boolean` | - | 当前激活项（aria-current + 高亮） |

**NavbarMenuToggle**

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| isOpen | `boolean` | - | 受控展开态 |
| aria-label | `string` | 跟随 locale，按 isOpen 切换 | 无障碍标签；显式传值优先 |
| className | `string` | - | 类名 |

## Events

**NavbarMenuToggle**

| 事件 | 类型 | 说明 |
|------|------|------|
| onToggle | `() => void` | 切换回调 |

## Slots

`Navbar` / `NavbarContent` / `NavbarItem` / `NavbarBrand` 均接受 `children`。

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 各容器子件的子内容 |

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
- 默认菜单标签跟随 `ConfigProvider locale`：`zhCN` 为“打开/关闭菜单”，`enUS` 为 “Open/Close menu”；显式 `aria-label` 优先。
- 三段版式（品牌 + 居中主菜单 + 右侧操作区）是本件的默认形状：`NavbarBrand` 默认 `grow`，三段等分，居中段才真的在导航栏中心。**两段式版式（品牌 + 紧贴品牌的 `justify="start"` 内容）要显式传 `grow={false}`**，否则那段内容会被推到 1/3 处。
- 品牌区要能截断（窄屏让位）时，除了 `truncate` 还得给 `NavbarBrand` 加 `min-w-0`——flex 项默认 `min-width:auto`，不解开就不会收缩。

## 相关
[BeianFooter](../beian-footer/beian-footer.md) · [NavMenu](../nav-menu/nav-menu.md) · [NavigationMenu](../navigation-menu/navigation-menu.md) · [Menu](../menu/menu.md) · [Menubar](../menubar/menubar.md) · [Dock](../dock/dock.md)
