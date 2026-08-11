---
"@hulianui/ui": minor
---

新增 `Sidebar` 复合件：可折叠应用侧栏的外壳 + 状态机（#206）。

kaneo 迁库时卡在这一层——**11 个文件只能继续依赖仓库内自维护的 761 行 `components/ui/sidebar.tsx`，整批迁移被挂起**。缺口不是"少一个组件"，而是库里这条轴上只有两个端点、没有中间态：`NavMenu` 是菜单**内容**（一棵 `items` 树，不含外壳、不含折叠态、不含移动端形态），`AdminLayout` 是**成品整页**（侧栏 + 顶栏 + 多页签 + 内容区，一个 `menuItems` 就出一套中后台）。中后台外壳最常见的形态恰好在两者之间：要外壳与状态机，但栏内是自己拼的——工作区切换器、搜索框、项目列表、每项右侧的次级菜单、底部用户卡。这些塞不进 `AdminLayout` 被钉死的形态，于是消费方只能整套自己写一遍。`Sidebar` 补的是这个中间态，它**不含**顶栏/面包屑/页签，因此不是第二个 `AdminLayout`；想要数据驱动的菜单就把 `<NavMenu>` 放进 `<SidebarContent>`，两者是嵌套不是竞争。

几个非显然的取舍：

- **布局走 in-flow flex 宽度过渡，不是同类实现（shadcn/ui）那套 `fixed` 面板 + 等宽占位 div。** 那套写法的前提是"侧栏永远铺在视口上"，而本库的侧栏必然会被放进非全屏容器——文档站的组件预览框、`Viewport` 设备框、`Resizable` 分栏工作区——`fixed` 在这三处都会逃逸出框贴住视口，且这种失败只在被嵌进去时才出现，作者本地全屏调试永远看不到。in-flow 方案与库内 `LayoutSider` / `AdminLayout` 同构，且不需要任何测量。代价写进了文档：`Sidebar` 与 `SidebarInset` 必须是 `SidebarProvider` 的直接子元素，中间夹一层普通 `div` 会打断 flex 关系。
- **移动端复用 `Drawer` 而不是另起一套浮层。** 侧栏在窄屏就是抽屉，焦点锁、Esc、遮罩、滑入曲线、`starting/ending-style` 过渡这些 `Drawer` 全都已经解决过一遍；再写一套的唯一产出是第二处会漂的浮层实现。接法是把抽屉的内边距连同 `--hl-overlay-pad` 一起归零（这两个必须同步，否则正文那层负边距补偿会把内容顶出抽屉外），标题与说明一律 `sr-only`——可见标题应该由消费方放进 `SidebarHeader`，但 a11y 要求的名字与说明不能因此缺席。
- **`Cmd/Ctrl + B` 在输入态让路，四种情形放行**：`event.defaultPrevented`（别人已处理这次按键）、`input`/`textarea`/`select` 内、`contenteditable` 元素本身、以及 **`contenteditable` 的后代**。最后一条是真正的坑：富文本里光标落在 `<strong>` 上时事件的 `target` 是那个 `<strong>` 而不是编辑区，只判自身会漏掉整个编辑器——症状是用户在任务标题里敲 `Cmd+B` 想加粗，侧栏在旁边乱跳。判定抽成导出的纯函数 `isEditableEventTarget` 并单测，而且用鸭子类型而非 `instanceof HTMLElement`：jsdom 至今不实现 `isContentEditable`，只靠它判会让后两条在测试里假绿。持久化**不进库**——只暴露 `open` / `onOpenChange`，库内硬写 cookie 会与 SSR 首屏、多租户、隐私策略同时打架。
- **`SidebarMenuAction` / `SidebarMenuBadge` 是 `SidebarMenuButton` 的兄弟节点，靠绝对定位覆盖行右侧，不嵌套。** 整行可点的按钮里再嵌一个按钮是无效 HTML，React 在 hydration 期报错，读屏也读不出第二个可操作元素——而这正是自己写侧栏最容易写错的一处，所以用测试钉死（`button button` / `a button` / `button a` 计数为 0，且两者同属一个 `<li>`）。同样被钉死的还有：激活项用 `aria-current="page"` 而不是在 button/link 上无效的 `aria-selected`；`SidebarMenuSkeleton` 的宽度是**确定值**而非 `Math.random()`（随机宽度在服务端与客户端各摇一次，必然 hydration mismatch）；`SidebarRail` 的无障碍名与 `SidebarTrigger` 刻意**不同字**，否则同一个侧栏里出现两个叫「切换侧栏」的按钮，读屏用户在元素列表里无从分辨。
