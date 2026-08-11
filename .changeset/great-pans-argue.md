---
"@hulianui/ui": minor
---

清空消费方本轮提的 issue（#175–#183 · #185–#188 · #191–#196）与自查的 #181。

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

**修复**

- `Radio` / `Checkbox` / `Switch` 渲染 `children`（#183）。此前 `<Radio value="1">审核通过</Radio>` 只渲染出一个光秃秃的圆点：children 既没被解构、又被 Root 上显式的子节点盖掉，而类型这一侧是放行的 —— tsc / guard / 控制台全绿，只有肉眼看截图才发现。`Switch` 顺带补 `label`（此前连这个出口都没有）。
- `DialogContentProps.title` / `description` 由 `string` 放宽为 `ReactNode`（#179）。运行时本来就直接进 `Dialog.Title` 的 children，此前只是类型把口封死，于是「标题左边一个图标」这种最常见的标题形态写不出来，而 `DrawerContentProps.title` 早就是 `ReactNode` —— 同一份 header 在 Drawer 里能写、换 Dialog 就红。
- 宽表空数据时空态贴**滚动视口**居中，不再贴表宽居中（#191）。`colSpan` 那格的宽度就是表宽，20+ 列的表里居中点落到视口外，用户看到的是「表头在、中间一片空白」，第一反应是渲染挂了。

- `Scheduler` **渲染期不再读系统时钟**，新增 `now` prop（#181）。此前 `dayjs()` 直接写在渲染体里，而 SSR / 静态导出下服务端那次渲染发生在**构建时刻**、客户端首次渲染发生在**访问时刻** —— 两者跨天就算出不同的「今天」，hydration 当场失败（React #418，整棵树被丢弃重渲染）。现在「此刻」推迟到挂载后取，首帧不画今天高亮与当前时刻线；要确定性（截图回归、按服务端业务时钟）就传 `now`。组件 showcase 与 `/demos/scheduler` 一并改成固定种子周 —— 它们要展示的是「周视图长什么样」，不是「今天几号」。**这个缺陷对 CI 几乎隐形**（构建与浏览器门禁在同一次 run 内、相隔几分钟），对用户却几乎必现（拿到的是上次发布的产物）。同时把「渲染期不得读系统时钟」写进全局 conventions。

**文档**

- `Table` / `ProTable` / `EditableTable` 各补一条：**`columns` 必须 memo**（#196）。cell 函数经 `flexRender` 被当作**组件类型**渲染，identity 一变整格卸载重挂。展示表只是白烧性能；格子里有输入框时直接坏功能 —— 受控输入框每敲一个字失焦 + 光标跳末尾，挂了 `onBlur` 提交的还会被重挂时的 blur **误提交半截值**。三个症状都不长得像「columns 没 memo」。
