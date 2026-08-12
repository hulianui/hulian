---
"@hulianui/ui": minor
---

三条来自消费方的缺口：`CardHeader` 补标题词汇（#226）、`PageHeader` 补元信息行（#240）、`BreadcrumbItem` 补 `render` 插槽（#239）。三处都是「不传新 prop 时渲染结果与上一版逐字相同」。

**`CardHeader` 的 title / description / extra（#226）。** `title` / `description` 是本库已有的词汇 —— `DialogContent`、`PageHeader`、`PopoverContent`、`Empty`、`Result`、`AlertDialog`、`Drawer` 都有，`Card` 是唯一一个「有 header 插槽却没有标题词汇」的容器。缺的不是某个样式值，是**「哪一段是标题」这个结构信息**：header 里只有一行文字时 `font-medium` 恰好等于标题样式，一旦是中后台最常见的「图标 + 标题 + 状态标签 + 右侧操作」一行，`font-medium` 就会把 Tag、按钮、计数一起染成标题字重，而标题自己反而没有字号 / 行高 / 层级的表达。消费仓的读数很直接：34 个 header 里 16 个是这种一行，33 处本地 `CardTitle` **全部**自己写了 `className` 覆盖字号 —— 调用点在逐个手补一套本该由组件给的标题层级。

选了「`CardHeader` 加 props」而不是「导出 `CardTitle` / `CardDescription` 子组件」：两者都能让标题有元素，但只有前者顺带回答了排布问题（标题与副标题怎么叠、右侧操作区怎么对齐、窄屏怎么折），而那正是消费方在每个调用点重复手写的部分；`title` / `description` / `extra` 也与库内其余 7 个组件是同一套词汇，不新增两个导出。三个槽一个都不传时 `CardHeader` 仍是今天的裸插槽（`children` 直接作正文、容器带 `font-medium`）；传了任意一个就切到两列排布，此时 `font-medium` 从容器撤到标题元素上。`children` 保留为逃生口，结构态下排在标题与副标题之后。

**`PageHeader` 的 meta / metaSeparator（#240）。** 标题下面那行用「·」串起来的事实值（证件号 · 性别 · 3 段社保 · 2 家公司 · 最近参保单位…）此前没有槽：它不是 `subTitle`（那是一句话，不是一串）、不是 `tags`（那是状态标记，这些是事实值）、也不是 `footer`（那在最下面，离标题太远）。消费方自造了 `.identity-meta`，中点用 `span + span::before { content: "·" }` 拼 —— 用伪元素而不是直接写在文本里，绕的正是「某一项为空时不能留下孤零零一个点」。

现在 `meta?: ReactNode[]`：分隔符由组件插在项与项之间，**空项（`null` / `undefined` / `false` / `""`）先被丢掉**，分隔符只插在留下来的项之间，因此调用点不必先 `filter(Boolean)`，中间某项缺值也不会多出一个分隔符。数字 `0` 是事实值（「0 家公司」），不算空。整行渲染为 `<ul>`/`<li>`、分隔符落独立的 `aria-hidden` 装饰位（照 `Breadcrumb` 的分隔符范式），读屏读到的是列表项而不是被中点粘住的一长串文本。分隔符可换（`metaSeparator`，默认 `"·"`）。

**`BreadcrumbItem.render`（#239）。** `Breadcrumb` 是库内唯一接不上客户端路由的导航件 —— `NavMenuItem` / `Button` / `Link` / `SidebarMenuButton` 都有 `render`。没有它，消费方只能在 `<nav>` 上做事件委托劫持点击，于是**得自己把「Cmd+点击开新标签」「中键」「Shift 开新窗」这些浏览器原生行为一条条放行**，漏一个用户就发现面包屑不能新标签打开 —— 这类兼容本该由框架的 Link 负责。

`render` 是真渲染成消费方给的元素（`cloneElement`）而不是委托，所以那些原生行为自动成立。皮肤类名与 `aria-current` 合并进该元素，`label` 作它的子节点；类名顺序同库内其它 `render`（本组件皮肤在前、元素自带的 `className` 在后，后者胜出）。传了 `render` 的项以它为准：即使是当前页也仍渲染为该元素，只是带上 `aria-current="page"` —— 想保留「当前页不可点」就别给末项传 `render`。`href` 由该元素自带，若该项也写了 `href` 则以该项的为准。
