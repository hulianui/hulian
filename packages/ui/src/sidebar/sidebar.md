---
slug: sidebar
name: Sidebar
category: navigation
group: global
tags: []
exports: [SidebarProvider, Sidebar, SidebarInset, SidebarRail, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarSeparator, SidebarInput, SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction, SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton, useSidebar, isEditableEventTarget, shouldEnableSidebarTooltip, sidebarMenuButtonVariants]
status: enriched
---

# Sidebar

> 应用侧栏 · 组合式外壳 + 折叠状态机(offcanvas/icon/none) + 移动端自动切抽屉 · navigation/global

## 何时用

要一条**可折叠的应用左栏**、而且栏里的东西是你自己拼的（工作区切换器、搜索框、项目列表、每项右侧的次级菜单、底部用户卡）时用它。

三个近邻怎么选：

| 你要的 | 用 |
|------|------|
| 数据驱动的菜单**内容**（一棵 `items` 树，不含外壳） | [NavMenu](../nav-menu/nav-menu.md) |
| **成品整页**中后台（侧栏 + 顶栏 + 多页签 + 内容区，一个 `menuItems` 就出一套） | [AdminLayout](../admin-layout/admin-layout.md) |
| 只要外壳与状态机，栏内结构完全自定义 | **Sidebar** |

它们不是竞争关系：`Sidebar` 只管外壳，栏里放什么都行——包括直接把 `<NavMenu>` 放进 `<SidebarContent>` 拿数据驱动的菜单。反过来 `AdminLayout` 是把「外壳 + NavMenu + 顶栏 + 页签」一次性配好的成品，形态被钉死，塞不进上面那些自定义部件；需要自定义就下沉到 `Sidebar`。

## 导入
```ts
import {
  SidebarProvider, Sidebar, SidebarInset, SidebarRail, SidebarTrigger,
  SidebarHeader, SidebarContent, SidebarFooter, SidebarSeparator, SidebarInput,
  SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuAction,
  SidebarMenuBadge, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubItem,
  SidebarMenuSubButton, useSidebar,
} from "@hulianui/ui"
```

## Props

### SidebarProvider

状态机与布局根。它渲染一个横向 flex 容器：`Sidebar` 与 `SidebarInset` 是它的两个直接子元素。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `defaultOpen` | `boolean` | `true` | 非受控初值 |
| `open` | `boolean` | — | 受控展开态。传了就必须配 `onOpenChange` |
| `onOpenChange` | `(open: boolean) => void` | — | 展开态变化回调。受控与非受控都会触发，持久化（cookie / localStorage）接在这里 |
| `mobileBreakpoint` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| number` | `"md"` | 视口宽度**小于**它即视为移动端并切抽屉 |
| `shortcutKey` | `string \| false` | `"b"` | 与 Cmd/Ctrl 组合的内置快捷键按键。`false` 关掉 |
| `width` | `string` | `"16rem"` | 展开宽度，写进 `--hl-sidebar-width` |
| `iconWidth` | `string` | `"3rem"` | `collapsible="icon"` 的折叠宽度，写进 `--hl-sidebar-width-icon` |
| `fitViewport` | `boolean` | `true` | 自钉视口高度（`h-dvh` + `overflow-hidden`）。嵌进已有滚动容器预览时传 `false` |

#### ⚠️ `mobileBreakpoint` 与 LayoutSider / AdminLayout 的同名断点差 1px

同一个断点名 `"md"` 在库里有**两种并存语义**，边界正好差一个像素：

| 组件 | 传 `"md"` 生成的查询 | 语义 |
|------|------|------|
| [LayoutSider](../layout/layout.md) / [AdminLayout](../admin-layout/admin-layout.md) 的 `breakpoint` | `(max-width: 768px)` | 768px **及以下**收起 |
| `SidebarProvider` 的 `mobileBreakpoint` | `(max-width: 767px)` | 768px **以下**切抽屉 |

两边都是有意的，判据不同：前者把断点值读作「收起的临界宽度本身」，这是它既有的语义并被测试钉死；后者对齐 **Tailwind 的 `md:` = `min-width: 768px`**——只有这样，「页面上 `md:` 类开始按桌面排版」与「Sidebar 开始按桌面渲染」才是同一个瞬间。若跟前者对齐，768px 这一个整值上会出现撕裂：页面已按桌面排版，侧栏却仍是抽屉。**iPad 竖屏正好是 768px**，所以这不是理论边界。

同时用这两件时请记住这 1px 的差；需要严格对齐就两边都传数字（`breakpoint={768}` 与 `mobileBreakpoint={769}` 等价，或反过来），不要靠同名断点想当然。

### Sidebar

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `side` | `"left" \| "right"` | `"left"` | 贴哪一边（移动端抽屉同侧滑入） |
| `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` | 桌面折叠形态，见下方「三种折叠形态」 |
| `variant` | `"sidebar" \| "inset"` | `"sidebar"` | 与内容区的关系形态。`inset` = 侧栏留 8px 外白、内容区收成圆角浮岛，见下方「层次：栏底色与 inset」 |
| `mobileTitle` | `ReactNode` | 取自 locale | 移动端抽屉的无障碍标题（视觉隐藏） |
| `mobileDescription` | `ReactNode` | 取自 locale | 移动端抽屉的无障碍说明（视觉隐藏） |
| `mobileShowClose` | `boolean` | `false` | 移动端是否渲染抽屉自带的右上角关闭按钮。默认关掉，避免压住导航首项 |
| `mobileClassName` | `string` | — | 追加到移动端抽屉面板（走 twMerge） |

### SidebarMenuButton

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `isActive` | `boolean` | `false` | 当前项高亮，同时置 `aria-current="page"` |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 行高档位（`SidebarMenuSubButton` 只有 `"sm" \| "md"`） |
| `tooltip` | `ReactNode` | — | 折叠到 icon 档时补的文字说明。只在 `state === "collapsed" && !isMobile` 时启用 |
| `tooltipSide` | `"top" \| "right" \| "bottom" \| "left"` | `"right"` | Tooltip 出现方向。右侧栏应传 `"left"` |
| `render` | `ReactElement` | — | 渲染成自定义元素（`<a>` / 路由 `<Link>`），拿到真链接语义 + 客户端路由。`SidebarTrigger` / `SidebarGroupAction` / `SidebarMenuAction` / `SidebarMenuSubButton` 同款 |

### 其余结构件

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `SidebarInset` | `<main>` | — | 侧栏的兄弟内容区，占满剩余宽度并自己滚动 |
| `SidebarTrigger` | `<button>` | — | 开合按钮。自带 `aria-label` / `aria-expanded` / `aria-controls` |
| `SidebarRail.label` | `string` | 取自 locale | 贴边热区的无障碍名。默认取 `locale.components.sidebar.rail`，**刻意与 `SidebarTrigger` 不同字** |
| `SidebarHeader` / `SidebarFooter` | `<div>` | — | 顶部 / 底部固定区（不随内容滚动） |
| `SidebarContent` | `<div>` | — | 中间可滚动区 |
| `SidebarSeparator` | `<div role="separator">` | — | 分隔线 |
| `SidebarInput` | `Input` | — | 侧栏内搜索框，透传 [Input](../input/input.md) 全部属性 |
| `SidebarGroup` / `SidebarGroupLabel` / `SidebarGroupContent` | `<div>` | — | 一段分组：容器 / 小标题（icon 档自动隐藏）/ 内容 |
| `SidebarGroupAction` | `<button>` | — | 贴在分组右上角的动作（「新建」之类） |
| `SidebarMenu` / `SidebarMenuItem` | `<ul role="list">` / `<li>` | — | 菜单列表与行容器 |
| `SidebarMenuAction.showOnHover` | `boolean` | `false` | 行尾次级动作是否悬停 / 聚焦才显形 |
| `SidebarMenuBadge` | `<div>` | — | 行尾计数徽标，`pointer-events-none` 不吃点击 |
| `SidebarMenuSkeleton.showIcon` | `boolean` | `true` | 加载态是否显示行首图标占位方块 |
| `SidebarMenuSkeleton.width` | `string` | `"70%"` | 加载态文字条宽度。**必须是确定值** |
| `SidebarMenuSub` / `SidebarMenuSubItem` / `SidebarMenuSubButton` | `<ul>` / `<li>` / `<button>` | — | 二级菜单三件套（icon 档自动隐藏） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| `SidebarProvider.onOpenChange` | `(open: boolean) => void` | 桌面展开态变化。受控与非受控都会触发 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| `SidebarTrigger.children` | `ReactNode` | 自定义图标，缺省是 `Menu` 图标 |
| `SidebarMenuButton.children` | `ReactNode` | 图标 + 文字。**文字必须包在 `<span>` 里**，icon 折叠档靠 `[&>span:last-child]` 把它收走 |

## useSidebar()

在 `SidebarProvider` 内的任意后代调用。**脱离 Provider 直接抛错**，不静默兜底。

| 字段 | 类型 | 说明 |
|------|------|------|
| `state` | `"expanded" \| "collapsed"` | 桌面展开态的语义别名 |
| `open` / `setOpen` | `boolean` / `(open: boolean) => void` | 桌面展开态。受控时 `setOpen` 只触发 `onOpenChange` |
| `openMobile` / `setOpenMobile` | `boolean` / `(open: boolean) => void` | 移动端抽屉开关 |
| `isMobile` | `boolean` | 当前是否移动端。SSR 与首帧恒为 `false` |
| `toggleSidebar` | `() => void` | 按当前形态切换：移动端切抽屉，桌面切展开态 |

## 三种折叠形态

| `collapsible` | 折叠后 | 什么时候选 |
|------|------|------|
| `offcanvas`（默认） | 宽度归零，整条收走 | 内容区要吃满宽度（编辑器、大屏表格）。**必须在正文里另放一个 `SidebarTrigger`**，否则收起后开不回来 |
| `icon` | 收成 `--hl-sidebar-width-icon` 宽的图标条，文字标签隐藏 | 中后台最常用。菜单项一定要配 `tooltip`，否则折叠后只剩一列无名图标 |
| `none` | 宽度不变 | 侧栏恒常展开的桌面工具。状态机照常翻（`state` 仍会变），只是不改宽度；移动端仍然切抽屉 |

## 示例

```tsx
const [open, setOpen] = useState(readCookie("sidebar") !== "0");

<SidebarProvider open={open} onOpenChange={(next) => { setOpen(next); writeCookie("sidebar", next ? "1" : "0"); }}>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <WorkspaceSwitcher />
      <SidebarInput placeholder="搜索…" prefix={<Search className="size-4" />} />
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>项目</SidebarGroupLabel>
        <SidebarGroupAction aria-label="新建项目"><Plus className="size-4" /></SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu>
            {projects.map((p) => (
              <SidebarMenuItem key={p.id}>
                {/* render 注入让它是真链接：中键新标签页、右键复制、读屏播报为链接，同时走客户端路由 */}
                <SidebarMenuButton
                  isActive={p.id === current}
                  tooltip={p.name}
                  render={<Link to="/projects/$id" params={{ id: p.id }} />}
                >
                  <Folder />
                  <span>{p.name}</span>
                </SidebarMenuButton>
                {/* 兄弟节点，不是子节点 —— 按钮里套按钮是无效 HTML */}
                <SidebarMenuAction showOnHover aria-label={`${p.name} 的更多操作`}>
                  <Ellipsis className="size-4" />
                </SidebarMenuAction>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter><UserCard /></SidebarFooter>
    <SidebarRail />
  </Sidebar>

  <SidebarInset>
    <header className="flex h-12 items-center gap-2 border-b border-border px-3">
      <SidebarTrigger />
      <Breadcrumb items={crumbs} />
    </header>
    <div className="flex-1 overflow-auto p-4">{children}</div>
  </SidebarInset>
</SidebarProvider>
```

## 禁忌 / 坑

- **次级动作必须是兄弟节点**。`SidebarMenuAction` / `SidebarMenuBadge` 要放在 `SidebarMenuItem` 里、与 `SidebarMenuButton` 平级，靠绝对定位覆盖行右侧。塞进 `SidebarMenuButton` 内部就是 `button > button`，React 在 hydration 期报错，读屏也读不出第二个可操作元素。
- **icon 折叠档下文字要包 `<span>`**。折叠靠 `[&>span:last-child]:hidden` 收走标签；直接写裸文本（`<Folder /> 项目`）时没有可选中的节点，折叠后文字会被挤成一截乱码。
- **`collapsible="offcanvas"` 收起后侧栏里的一切都不可达**，包括 `SidebarRail`。正文里必须另有一个 `SidebarTrigger`，否则用户收起后就再也开不回来了。
- **持久化库里不做**。`open` / `onOpenChange` 给出来了，cookie / localStorage / 服务端偏好由消费方自己接——库里硬写 cookie 会与 SSR 首屏、多租户、隐私策略全部打架。
- **`SidebarMenuSkeleton.width` 不要用随机值**。随机宽度在服务端与客户端各摇一次，必然 hydration mismatch。要参差观感就按下标传一组确定值（`["78%", "62%", "88%"]`）。
- **`isMobile` 在 SSR 与首帧恒为 `false`**。它由 `matchMedia` 在 effect 里测出，第一帧永远是桌面形态——这是为了 SSR 与 hydration 给出同一棵树。想让窄屏首屏就是抽屉，只能在服务端按 UA 判断后自己控制。
- **右侧栏记得改 `tooltipSide`**。`side="right"` 时 tooltip 默认仍向右弹，会飞出视口；传 `tooltipSide="left"`。

### 层次：栏底色与 inset

侧栏默认与 [Card](../card/card.md) / [Popover](../popover/popover.md) 共用 `--color-surface`。**如果你的桥接层里 `surface` 与 `bg` 同色**（亮色下常见的「都是纯白」），侧栏、页面底、内容区就会三者同色，只剩 1px 边框分界 —— shadcn 血统的应用侧栏通常在这里有一档明度差：**导航面是「后面一层」，内容是「前面一层」**（#224）。

两个独立的口子，可以只用一个，也可以一起用：

```tsx
{/* 1) 只换栏底色：一个变量，不碰全局 token，也不必在 className 上顶色 */}
<SidebarProvider style={{ "--hl-sidebar-surface": "var(--color-muted)" } as CSSProperties}>

{/* 2) inset 形态：侧栏留 8px 外白，内容区收成圆角浮岛，外壳底色露在四周 */}
<Sidebar variant="inset" collapsible="icon">…</Sidebar>
<SidebarInset>…</SidebarInset>
```

- `--hl-sidebar-surface` **不传就等于 `--color-surface`**，升级零改动。它只管侧栏（含移动端抽屉里的那份），不会牵动别的组件——这正是不建议去改 `--color-surface` 的原因：那是全库共用的表面色。
- `variant="inset"` 要求 `SidebarInset` 是 `Sidebar` 的**后继兄弟**（同一层、中间不夹 `div`）：浮岛样式靠 `peer-data-*` 读前一个兄弟的形态。这与「为什么是 in-flow 而不是 fixed」那条的结构要求是同一条，本来就该这么写。
- 移动端侧栏走抽屉、不在流内，`inset` 不参与（与 shadcn 一致）。
- `inset` 下侧栏**不画分界线**（有留白就不需要线），`collapsible="offcanvas"` 收起时那 8px 外白会一并归零 —— 否则 `width: 0` 的侧栏会因为 padding 残留 16px 宽，看上去「关不干净」。这也是为什么这一档不能靠调用点写 `className="p-2"` 补：那样收起时必然留一条。

### 减弱动效由库负责

侧栏开合是整页级的容器变形，`prefers-reduced-motion: reduce` 下**组件自己会关掉宽度过渡**（#225），不需要消费方做任何事。

宽度过渡写在内联 `style` 上（时长与曲线取自 motion token，不走工具类是为了让只引 `preset-core.css` 的项目也拿到同一条曲线），而内联 style 的优先级高于任何普通 CSS 规则 —— 消费方要盖只能写 `!important` 加一个猜库内部 DOM 结构的选择器，结构一变就静默失效，且失效的表现是「无障碍偏好不生效」，不会有任何报错。所以这类事一律由组件承担：**发现哪个组件在减弱动效下仍然位移，按 bug 提 issue**，不要在消费侧堆 `!important`。

自绘动效需要同一个判断时，用库导出的钩子，不必再写一份 `matchMedia`：

```tsx
import { usePrefersReducedMotion } from "@hulianui/ui";

const reduce = usePrefersReducedMotion();   // SSR / 首屏恒 false，hydration 后立即纠正
```

### 快捷键为什么要「让路」

内置 `Cmd/Ctrl + B`。四种情形一律不触发：`event.defaultPrevented`（别人已处理）、`input` / `textarea` / `select` 内、`contenteditable` 元素本身、以及 **`contenteditable` 的后代**。

最后一条最容易漏：富文本里光标落在 `<strong>` 上时事件的 `target` 是那个 `<strong>` 而不是编辑区，只判自身会漏掉整个编辑器——于是用户在任务标题里敲 `Cmd+B` 想加粗，侧栏在旁边乱跳。判定逻辑作为纯函数 `isEditableEventTarget` 导出，可以直接单测。

不需要这个快捷键就传 `shortcutKey={false}`；换一个键传 `shortcutKey="k"`。

### 为什么是 in-flow 而不是 `fixed`

同类实现（shadcn/ui）用「`fixed` 面板 + 一个等宽占位 div」做布局。本组件走 in-flow flex 宽度过渡，因为 `fixed` 面板一旦被放进任何非全屏容器——文档站预览框、[Viewport](../viewport/viewport.md) 设备框、分栏工作区——就会逃逸出框贴住视口。in-flow 方案与库内 [LayoutSider](../layout/layout.md) / [AdminLayout](../admin-layout/admin-layout.md) 同构，且不需要任何测量。

代价：`SidebarProvider` 必须是那个横向 flex 容器，`Sidebar` 与 `SidebarInset` 必须是它的直接子元素。中间夹一层普通 `div` 会把 flex 关系打断。

## 相关
[NavMenu](../nav-menu/nav-menu.md) · [AdminLayout](../admin-layout/admin-layout.md) · [Layout](../layout/layout.md) · [Drawer](../drawer/drawer.md) · [Tooltip](../tooltip/tooltip.md) · [RouteTabs](../route-tabs/route-tabs.md)
