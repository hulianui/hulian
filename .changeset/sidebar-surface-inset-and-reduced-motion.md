---
"@hulianui/ui": minor
---

`Sidebar` 补两处：栏底色开一个专用变量 `--hl-sidebar-surface`、新增 `variant="inset"` 形态（#224），以及宽度过渡响应 `prefers-reduced-motion`（#225，一并导出 `usePrefersReducedMotion`）。

**栏底色（#224）。** 侧栏此前写死 `bg-surface`。消费方（kaneo 侧栏集群，11 个文件）的桥接层里 `surface` 与 `bg` 亮色下同为白，于是**侧栏、页面底、内容浮岛三者同色**，只剩 aside 自带的 1px 边框分界 —— 而 shadcn 血统的应用侧栏几乎都有一档明度差：导航面是「后面一层」，内容是「前面一层」。

他们解不了这条：迁移规约禁止用 `className` 顶库组件的颜色（顶了色，后续升级的视觉回归无从归因），而改桥接层里的 `--color-surface` 会牵动 Card / Popover / Menu 等所有件。于是只剩「破例顶色」或「接受同色」两条路，两条都不该是库逼出来的选择。

现在 aside 的底色读 `var(--hl-sidebar-surface, var(--color-surface))`：**不传等于零改动**，要换只需在 `SidebarProvider` 上写一个变量，不碰全局 token 也不顶 className。移动端抽屉里的那份同源。`className` 仍然能顶掉它（twMerge 后来者胜）—— 逃生口不是牢笼。

**`variant="inset"`（#224）。** 侧栏留 8px 外白、内容区收成圆角描边浮岛、外壳底色露在四周（shadcn 的 inset 形态）。两个实现细节：

- 浮岛样式挂在 `SidebarInset` 上，靠 `peer-data-[variant=inset]/sidebar:*` 读**前一个兄弟**的形态，不把 `variant` 塞进 context —— 形态是 `<Sidebar>` 的属性，提到 Provider 上就要两处各写一遍还得保持一致。外壳的底色用 `:has()` 选出来，同理。
- `collapsible="offcanvas"` 收起时那 8px 外白**必须归零**：aside 宽度是 `0px`，border-box 下 padding 仍然占位，不归零就残留 16px 宽的「关不干净」的侧栏。这也正是消费方没法用 `className="p-2"` 自己补这一档的原因。

**减弱动效（#225）。** 侧栏开合是整页级的容器变形，是 `prefers-reduced-motion: reduce` 下最该关掉的那一类（前庭敏感人群对大面积位移最敏感），而宽度过渡写在**内联 style** 上 —— 优先级高于任何普通 CSS 规则，消费方要关只能写 `!important` 加一个猜库内部 DOM 结构（`wrapper > aside`）的选择器：结构一变就静默失效，而失效的表现是「无障碍偏好不生效」，不会有任何报错。现在组件自己响应，reduce 下**整条 transition 都不写**（不是留一条 `0s`），宽度本身照旧 —— 关的是动效不是功能。

顺带回答消费方问的「reduced-motion 在瑚琏是库负责还是消费方负责」：**库负责**。库内动效件本来就各自响应这条媒体查询（全库 300+ 处），Sidebar 这处是漏的。口径与新导出的 `usePrefersReducedMotion()` 一起写进了文档站的动效页与 `sidebar.md`：消费方不该为了关掉某个动效去写 `!important`、去猜库的 DOM 结构；哪个组件在 reduce 下仍然位移，按 bug 提 issue。钩子本身是给**自绘动效**（canvas / rAF / 自己写的内联过渡）用的，零依赖、`useSyncExternalStore` 实现，SSR 与首屏恒为 `false`，hydration 后立即纠正。
