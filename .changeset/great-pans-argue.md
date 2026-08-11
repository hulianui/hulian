---
"@hulianui/ui": minor
---

清空消费方本轮提的 issue（#175–#183 · #185–#188 · #191–#203）与自查的 #181。

**新增件**

- `RichTextEditor`：**值进出是 HTML 片段串**的富文本编辑器（#175）。这不是 `MarkdownEditor` 的皮肤变体，是另一种值契约：存量库里躺的就是 HTML、前台 `v-html` / 小程序 `rich-text` 也直接吃 HTML 时，用「存的时候 md→html、读的时候 html→md」绕不过去 —— `html → md` 有损，`<span style="color">`、`<p style="text-align:center">`、`<table>` 在 markdown 里没有对应表达，运营改一个错别字、一次往返就把攒了几年的排版洗掉。内核复用已在依赖里的 TipTap；工具栏可裁（`toolbar`），而**裁剪同时决定哪些标签能活下来**（不给 `"table"` 就不装表格扩展，存量 `<table>` 会在载入时被 schema 丢掉，这条写进了文档）；图片上传交还消费方（`onUploadImage`），永远不内联 base64；粘贴净化洗掉 `class` / `on*` / `<style>` / `javascript:`，内联 `style` 过属性白名单（保住 color / text-align / font-size 这类真排版）。schema 之外的标签用 `extensions` 自己补。

- `CellEditor`：**逐格常驻编辑**原语（#195）。与 `EditableTable` 不是一个东西的两种皮肤，是两种交互契约 —— 后者是行级的（点编辑 → 改 → 保存整行），本件是逐格的（永远可编辑、失焦/Enter 即提交这一格）。核对/补录场景里用户是「扫一遍、看到不对的就地改一个字」，任何「先点编辑再点保存」的往返都会把它变成体力活。四条行为红线都在实现里而不是留给消费方：**值没变不提交**（否则「点进去看一眼再点走」会把一整屏空提交打到后端）、**Esc 回滚且紧随其后的 blur 不再提交旧值**、自增高走 CSS `field-sizing-content`（几十个格同时 JS 测高会在滚动时掉帧）、`missing` 态用 muted + 斜体让「空」和「填了空格」一眼可分。`onCommit` 返 Promise 时自带 pending 禁用。表格外壳仍交给 `Table`（配 `cellVerticalAlign="top"` + `meta.whitespace`）。

**新能力**

- `Table` 加 `cellSpan`：单元格合并，对标 el-table 的 `:span-method`（#176）。被合掉的格子**不再回调**，所以「与上一行同门店就合并」只需在段首返回整段长度。回调拿到的 `rowIndex` 是渲染顺序、`rows` 与之同序 —— 这正是 el-table 里「开了列排序合并就整片错位」那个坑的解法。与 `virtual` / `renderExpandedRow` 不能同开（跨窗口无落点、明细行会被纵向合并跨过），同开时静默不合并 + dev 告警，而不是画出一张错位的表。
- `Table` 加 `stickyHeader` + `maxHeight`（#192）、`minWidth`（#193）、`cellVerticalAlign` / `cellWhitespace` 与列 `meta.verticalAlign` / `meta.whitespace`（#194）。`minWidth` 落在 `<table>` **本体**：写进 `className` 的 `min-w-*` 钉的是滚动外壳，容器从此收不窄 → 横滚条永不出现 → 超出视口的列被裁掉且**滚不出来**，而宽窗口下自查不到。垂直对齐与换行是**按列**的一对：一旦某列换行，同一行的短单元格垂直居中就会与长单元格首行对不齐。
- `SearchForm` 字段词表补 `cascader` 与 `region`（#177）。`region` 的内置区划表约 137KB，因此那一档**按需加载** —— 否则每个用到 SearchForm / ProTable 的列表页都要背上它。
- `Command` 加 `surface`（`solid` / `glass` / `none`）与 `backdropClassName`（#178）：皮肤类与布局类分家。`none` 是「库不画、我来画」，消费方不必再写一串类去压掉 `bg-surface / border-hairline / shadow-xl`，皮肤升级也不会和覆盖打架。
- `DialogContent` / `DrawerContent` 加 `backdrop`、`backdropClassName`、`scrollable`、`bodyClassName`、`descriptionClassName`（#185 #188 · #179 评论）。非模态要**两处一起改**：Root 的 `modal={false}` 加 Content 的 `backdrop={false}` —— 只改前者时那层 `fixed inset-0` 即使透明也照样吃掉整屏点击。`scrollable={false}` 让正文变成列向 flex 容器，把确定高度传给 children，于是「左清单 + 右预览各自滚动」不必再拍一个 `h-[58vh]` 去凑「max-h 减标题减 footer」。`descriptionClassName="sr-only"` 给出「只给读屏的说明」。
- `Field` 加 `required` / `requiredMark`，`useForm` 的 `register()` 顺带按 rules 派生 `required`（#180）。必填此前只活在 rules 里，界面上要先提交一次才知道哪些字段必填，于是每个消费方各造一个 `RequiredLabel` —— 而那种自建星号是 `aria-hidden` 的装饰，读屏用户仍然拿不到必填信息，`aria-required` 也够不着内部控件。现在两边一起给。
- `Input` / `Textarea` / `SelectTrigger` 加 `size="xs"`（28px 高 / 12px 字，#187）。它与 `variant="cell"` 是两回事：cell 是无边框透明底，xs **仍然有边框** —— 密集数据表里用户正是靠边框判断哪些格子可编辑。
- `Textarea` 转发 ref（#186）。内部量 `scrollHeight` 的 ref 与消费方的 ref 现在并存，不再二选一；此前消费方传 ref 直接 TS2322，「打开对话框自动聚焦」只能整块退回原生 textarea。
- `Button` 加 `variant="soft"`（#197）：浅语义底 + 语义文字，权重介于 outline 与 solid 之间。次级工具栏上的**状态化触发器**（筛选芯片、视图开关、时间范围）此前无档可用 —— `outline` + `tone="brand"` 的 compoundVariants 没配 brand，渲染结果与未激活态**完全一致**，激活与否分辨不出来；换 `solid` 则一排 h-7 控件里冒出的实心主色块会盖过页面主操作。同一套 soft 语气色在 `Chip` / `Tag` 上早就有，这是把库内不一致补平。注意它不渲染 `aria-pressed`：真开关仍该用 `Toggle`，soft 只管「本身不 toggle、只显示当前已生效」的触发器。
- `Checkbox` / `Radio` 加 `size="sm"` 与 `labelClassName`（#199）。**勾号/内点跟着 `size` 一起缩**，这才是此前方盒压不下去的原因 —— 勾号独立写死 14px，盒子一改 16px 就被顶满。`labelClassName` 落到文字 `<span>`（`className` 落在方盒，够不到文字）：消费方实测 21 个站点里 0 个能用原来的 `label` prop，全被硬编码的 `text-sm text-foreground` 卡住。文档同时补上两条隐式关联：自己写 `<label>` 包裹**是成立的**（Root 是 `<span role="checkbox">`，看 DOM 会以为关联不上，但 Base UI 在里面留了视觉隐藏的原生 input），而同时再给 `<label htmlFor>` 会**压过**它、点文字彻底失效。
- `Slider` 加 `thumbAriaLabel`，并把无障碍名下放到手柄（#200）。Root 渲染的是 `role="group"`，真正被 Tab 聚焦、被读屏播报为滑块的是手柄里那个视觉隐藏的 `<input type="range">` —— 名字挂在 Root 上时，焦点落到滑块只播报「滑块，100」，这是从原生 `<input type=range>` + `<label>` 迁过来的一次实打实的 a11y 回退。**单值滑块是转移而不是复制**：组里只有一个控件时组名没有信息增量，两处同名会被读屏念两遍、也让按名字找控件产生歧义（库内两处测试当场撞上）。range 保留组名，两个手柄用 `thumbAriaLabel` 二元组分别命名，否则听起来是两个一模一样的滑块。
- `HoverCardContent` 继承 div 原生属性（#201）。卡片虽被 portal 出去，合成事件仍沿 **React 树**冒泡回触发器所在的父元素 —— 挂在整块可点的行/卡里时，「点卡片内容顺手触发整行 onClick」的通行挡法就是在卡片根上 `stopPropagation`，而那正是旧签名传不进去的东西。透传的 `onMouseEnter` / `onMouseLeave` 与内部延时计时器是**合并**而非覆盖，否则指针一移入卡片就会把它关掉。
- `Card` 加 `divided`（#203）：分隔线是皮肤不是结构，`divided={false}` 一处声明让 `CardHeader` / `CardFooter` 一起不画线，并收掉那条线原本撑着的内边距（只关线会剩一道无来由的留白）。这是 #159「底色属于皮肤，跟着变体走」那条原则延伸到分区 —— 此前 `variant="plain"` 的语义是「外皮由页面自己给」，结果分区仍自作主张画一条 `--color-border` 的线。实现走 Card 上的**直接子选择器**而非 context：Card 至今没有 `"use client"`，为一个布尔值把整张卡拖进 client 边界不划算，限定直接子也让卡里套卡时外层取值不传染给内层。

**修复**

- `Radio` / `Checkbox` / `Switch` 渲染 `children`（#183）。此前 `<Radio value="1">审核通过</Radio>` 只渲染出一个光秃秃的圆点：children 既没被解构、又被 Root 上显式的子节点盖掉，而类型这一侧是放行的 —— tsc / guard / 控制台全绿，只有肉眼看截图才发现。`Switch` 顺带补 `label`（此前连这个出口都没有）。
- `DialogContentProps.title` / `description` 由 `string` 放宽为 `ReactNode`（#179）。运行时本来就直接进 `Dialog.Title` 的 children，此前只是类型把口封死，于是「标题左边一个图标」这种最常见的标题形态写不出来，而 `DrawerContentProps.title` 早就是 `ReactNode` —— 同一份 header 在 Drawer 里能写、换 Dialog 就红。
- 宽表空数据时空态贴**滚动视口**居中，不再贴表宽居中（#191）。`colSpan` 那格的宽度就是表宽，20+ 列的表里居中点落到视口外，用户看到的是「表头在、中间一片空白」，第一反应是渲染挂了。
- `MenuContent` / `ContextMenu` 补高度上限与纵向滚动（#198）。此前菜单高度就是所有菜单项之和，项数一多直接长出视口，而浮层是 fixed 的 —— 溢出那截**既点不到、页面也滚不出来**，键盘漫游过去焦点还落在不可见区域。口径从「每个消费方自己记得加」改成库内兜底：`max-h-[min(24rem,var(--available-height))]` 在放得下时不产生任何视觉差异，而这类缺陷只在数据长起来之后才暴露（开发时 3 项、上线后 40 项）。Select / Combobox / TreeSelect 早就是这个写法，这两件是漏网的。
- `ProTable` 托管模式不再吞掉受控的 `rowSelection` / `onRowSelectionChange`（#202）。判据从「是不是托管模式」改成「消费方有没有接管」，与 `sorting` 同一套约定。旧口径的杀伤力在于它**看起来完全正常** —— 页面上勾得动、表头全选框也会变半选，但消费方的 state 恒为 `{}`，直到提交时拿到空数组才暴露，而 tsc / guard / 控制台全都发现不了。受控却漏传 `onRowSelectionChange` 时补一条 dev 告警（那种情况勾不动，和「组件坏了」长得一模一样）。
- `RelativeTime` **渲染期不再读系统时钟**（#181 同类）。无 `base` 时首帧改渲染绝对时间，挂载后经 layout effect 在浏览器绘制前换成相对串，肉眼看不到跳变。此前 `new Date()` 写在 `useState` 初值里，SSR / 静态导出下那次渲染发生在**构建时刻** —— 产物里写死着「1 分钟前」，页面几个月后被访问时，JS 挂载前的首屏、爬虫、以及关掉 JS 的读者拿到的就是这句陈旧且无法自证的假话。首帧落绝对时间而不是「以 value 自身为基准渲成『刚刚』」，是因为后者是一句会被当真的错话，而绝对时间只依赖 `value`、任何时刻都成立。`<time>` 上的 `suppressHydrationWarning` 保留，但它现在只兜**消费方传入的 `value` 两端不同**，组件自身不再制造差异。

- `Scheduler` **渲染期不再读系统时钟**，新增 `now` prop（#181）。此前 `dayjs()` 直接写在渲染体里，而 SSR / 静态导出下服务端那次渲染发生在**构建时刻**、客户端首次渲染发生在**访问时刻** —— 两者跨天就算出不同的「今天」，hydration 当场失败（React #418，整棵树被丢弃重渲染）。现在「此刻」推迟到挂载后取，首帧不画今天高亮与当前时刻线；要确定性（截图回归、按服务端业务时钟）就传 `now`。组件 showcase 与 `/demos/scheduler` 一并改成固定种子周 —— 它们要展示的是「周视图长什么样」，不是「今天几号」。**这个缺陷对 CI 几乎隐形**（构建与浏览器门禁在同一次 run 内、相隔几分钟），对用户却几乎必现（拿到的是上次发布的产物）。同时把「渲染期不得读系统时钟」写进全局 conventions。

**文档**

- `Table` / `ProTable` / `EditableTable` 各补一条：**`columns` 必须 memo**（#196）。cell 函数经 `flexRender` 被当作**组件类型**渲染，identity 一变整格卸载重挂。展示表只是白烧性能；格子里有输入框时直接坏功能 —— 受控输入框每敲一个字失焦 + 光标跳末尾，挂了 `onBlur` 提交的还会被重挂时的 blur **误提交半截值**。三个症状都不长得像「columns 没 memo」。
