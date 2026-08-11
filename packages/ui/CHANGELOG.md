# @hulianui/ui

## 0.30.0

### Minor Changes

- 7e878b4: 清空消费方本轮提的 issue（#175–#183 · #185–#188 · #191–#203）与自查的 #181。

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

## 0.29.0

### Minor Changes

- d6092e6: 清空消费方本轮提的 14 条 issue（#158–#165 · #167–#172 · #174），并让新的 info 语义色真正落到组件上。

  **新增件**

  - `Label`：独立的表单标签原语，`<label>` + `htmlFor` + 原生属性透传。皮肤取自新导出的 `labelClass`，与 `Field` 的标签段**同一份来源** —— 两处各写一份字面量的话，改字号时只会改到一处，而消费方页面里「Field 出的标签」与「手搓的标签」是并存的，分叉当场可见（#161）。
  - `KbdGroup`：组合键容器，统一间距、可配分隔符（默认 `+`，装饰性、不进无障碍树）、外层 `aria-label` 出口。仍不做 `Meta → ⌘` 符号映射 —— 键名该显示成什么取决于消费方的平台探测（#165）。
  - `MenuCheckboxItem` / `MenuRadioGroup` / `MenuRadioItem` 与 `ContextMenu*` 对应三件：**这是补 a11y 语义，不是补 API**。此前只能用 `Item` + 自画勾，视觉一模一样，但 role 退化成 `menuitem`、没有 `aria-checked`，读屏用户听到的是几个平级动作，听不出这是一组互斥选项、也听不出当前选的是哪个（#170）。

  **新能力**

  - `AlertDialogContent` 加 `body` 与 `icon` 槽。`description` 底层渲染成 `<p>`，块级内容塞进去是非法嵌套、当场 hydration mismatch；`body` 渲染在说明之下、动作区之上，不包 `<p>`（#158）。
  - `ComboboxInput` / `ComboboxTrigger` / `ComboboxChips` 透传原生属性，`ComboboxInput` 加 `prefix` 与 `showChevron`。剩余属性落到**内层 input**（`role="combobox"` 在那里）—— 挂在外壳 `<span>` 上的 `aria-label` / `id` / `onBlur` 是无效的（#160）。
  - `Card` 加 `variant="plain"`，`AccordionPanel` / `CollapsiblePanel` / `PopoverContent` 加 `plain`：内容自带外观时，要的不是改皮肤而是**没有皮肤**。`Card` 的 `bg-surface` 同时从 base 挪进各变体，否则 plain 档怎么写都去不掉底色（#159 #162 #172）。
  - `Field` 加 `orientation="horizontal"`：设置页「左标签右控件」的行式版式，a11y 串联、invalid 传导、error 渲染全部保留。错误行用 `col-span-full` 而非写死的 `col-span-2` —— 消费方换成三列模板时，写死的 2 只会盖住前两列（#161）。
  - `Command` 加 `footer` 插槽（对齐 `ComboboxContent.footer` 的既有口径）。命令面板是模态的，页脚里的控件没有别处可放（#171）。
  - `Prose` 补 `details` / `summary` 排版与嵌套区分，新增 `scrollableTables`。宽表那档里 `th` 不换行是**必需项不是修饰**：只给 `overflow-x-auto` 的话列会被压到 min-content（中文一列一字），内容永远不超出滚动容器，于是根本不滚（#168）。
  - `CodeBlock` 加 `lineNumbers`。行号走 `aria-hidden` + `select-none`（否则框选复制会把行号一起带走）、`sticky left-0` 不被横向滚动带走、列宽按总行数位数算（#169）。
  - `tokenizeCode` 支持 Python（`py` / `python` / `python3`）。此前落到 JS 分支不是「不着色」而是**着错色**：`#` 注释不认、`def` 不着色，而 Python 代码里出现的 `var` / `function` 反被误标成关键字 —— 看得到颜色，所以没人会怀疑它错了（#167）。

  **修复**

  - `Accordion` 把 Base UI Root 的泛型透传下去（默认 `string`）。此前经 `ComponentProps` 擦成 `unknown[]`，受控用法必然 TS2322，且 `value` 那条连 cast 都救不回来（#163）。
  - `Command` 默认高亮首个可用项，加 `autoHighlight`（默认 `true`）。**这是行为变更**：此前「打字 → 回车」什么也不会发生，必须先按一次 `↓`，而这在视觉上完全看不出来。高亮同时改为按 value 跨批次找回 —— 消费方没把 `groups` 用 `useMemo` 包稳时（items 来自请求数据时很常见），不再出现「刚点亮就没了、回车时灵时不灵」（#174）。
  - `PopoverContent` 的 `mt-2` 改为跟随标题/说明：两者都没有时它是浮层顶部一条消不掉的 8px 空白，`className="p-0"` 也救不回来。箭头另开 `arrow` 开关，**没有绑进 `plain`** —— 箭头是浮层与触发器的关系指示，不是内容皮肤，绑在一起是错的耦合（#172）。
  - 缺 `ConfigProvider` 时开发期告警一次。回退策略不变（组件必须能脱离 Provider 渲染），只补可发现性：回退掉的多半是 `aria-label`，英文产品能带着一屏中文读屏标签活过一整轮迁移（#164）。

  **观感变更**：`Alert` / `Banner` / `Callout` / `Toast` / `Notification` / `Modal` / `Result` / `EventStream` 的 `info` 语气，以及 `DiffStat` 的 `renamed`，改吃新的 `--color-info`（青蓝），不再借主色。此前借 primary 是因为库里根本没有 info 语义色 —— 而那正是消费方控诉的「提示条稀释品牌色权重」，库自己也在犯（#173）。

## 0.28.0

### Minor Changes

- 随包发预编译 `.d.ts`：消费方 tsc 内存降到八分之一（#156） <!-- parity-id: prebuilt-dts-types-condition -->

  瑚琏是源码分发，`exports` 直指 `src/index.ts`，包里一个 `.d.ts` 都没有。而 `skipLibCheck` 只跳 `.d.ts`、跳不过 `.tsx`，于是消费方**只用十来个组件**也要把 780 个 `.tsx` 全量拖进类型检查。走子路径也救不了——子路径能收窄模块图，但类型检查跟的是**类型引用图**，组件之间 dogfood 得很彻底（`Field` → Base UI、`ProTable` → `Table`/`SearchForm`/`Pagination`），传递依赖很快就接近全库。原报告实测 typecheck 从 90 秒涨到 2 分 40 秒。

  现在 `exports` 的 `types` 条件指向随包发的 `dist/*.d.ts`，`default` 仍是 `src/`。同一个工程引 12 个组件（根 barrel）、TS 7.0 实测：Files 2242 → 1872、**内存 699 MB → 88 MB**、耗时 1.53 s → 0.27 s，而且这个收益**不随组件用量增长**。Tailwind 的 `@source` 扫描、HMR、「能点进源码看实现」一个都不丢，因为打包器读的仍是源码。

  **顺带解除一条已知边界**：`noUncheckedIndexedAccess` 从此进入承诺矩阵。它此前会让库内约 300 处索引访问在消费方编译里报 TS2532/TS18048（#56）——声明文件里没有表达式，也就没有索引访问。同理，库内源码的未使用 import 之类也不再外溢（见下条 #155）。

  声明产物由 `prepack` 生成、`postpack` 清掉，仓库里不留生成物。CI 两侧都盯：`Emit declarations` 步骤保证 emit 不炸，消费方门禁额外断言「类型**确实**解析到了 `dist/*.d.ts`」——TS 在 `types` 目标缺失时会静默回落到源码，编译照样通过，不断言就看不见退回。

- 表单受控件把根节点原生属性透传出去，`InputOTP` 可接 `Controller`（#157） <!-- parity-id: form-control-native-attrs-passthrough -->

  `InputOTPProps` 此前是封闭接口，`field.onBlur` 无处可传。后果不是「少个功能」而是**静默失效**：react-hook-form 的 `touchedFields` 永不更新，`mode: "onBlur"` / `"onTouched"` 的表单点进点出不触发校验，只有提交时才报错——排查起来极难找。

  这一批按一条口径拉平：纯展示件继承根节点 `HTMLAttributes`，**表单受控件在此之上把 `onBlur` 落到根**，「能不能接 `Controller`」当作表单件的验收项。本轮覆盖 21 个：`InputOTP` / `Rating` / `Segmented` / `SecretField` / `Listbox` / `CheckboxGroup` / `Choicebox(Group)` / `ColorSwatchPicker` / `IconPicker` / `EmojiPicker` / `Transfer` / `ScopeMatrix` / `CodeEditor` / `MarkdownEditor` / `Calendar` / `TimeField` / `Checkbox` / `Switch` / `Toggle` / `NumberField` / `ElasticSlider`。

  两条实现口径写在 `docs/consuming.md` 第 7 节：① 同名异义的 prop 会被 `Omit`（`Rating.color` 是星色、`SecretField.onCopy` 回吐密钥原值、`EmojiPicker.onSelect` 回吐 emoji），以组件语义为准；② `rest` 展开在根节点属性**最前面**，组件自身的 `role` / `aria-*` / 键盘处理赢——那些一旦被顶掉，无障碍语义与键盘导航当场失效。

  `InputOTP` 的 `onBlur` 是**整组**语义：槽位之间跳焦不触发（逐格触发的话，`mode: "onBlur"` 会在用户刚输一位时就开始报错）。另新增 `name`，渲染一个持有完整值的隐藏 input，原生 `<form>` 提交拿到的是整串验证码而不是 N 个单字符字段。

  **未拉平的**：`Cascader` / `TreeSelect` / `CountrySelect` / `RegionCascader` / `DatePicker` 族这些 Popover 包壳的选择器——它们的「根」不是一个 DOM 节点，`id` / `data-*` 该落触发器还是浮层要逐件定，机械展开会静默落错位置。

- `Tabs variant="solid"` 与 `Segmented` 的轨道换用新的凹槽令牌，选中项终于分得开（#152） <!-- parity-id: track-token-segmented-contrast -->

  分段控件的轨道此前用 `--color-surface-hover`，与药丸的 `--color-surface` 在浅色档只差 **3.3% 亮度**（对比约 1.06:1），选中态只靠一条 `shadow-sm` 撑着，标签一多就找不到当前项。暗色档更糟：轨道 `gray-800` 比药丸 `gray-900` 还**亮**，等于把凹槽画在了浮起件上面，elevation 方向是反的。

  新增语义令牌 `--color-track`（见 `@hulianui/tokens` 0.7.0）。它的定义是一条**关系**而不是某个灰阶：恒比 `--color-surface` 沉一档，且亮暗两态都保证浮起的药丸更靠近观察者。`Tabs` 的 `solid` 档与 `Segmented` 已接上，消费方无需改任何代码；想整体调深浅只动这一个变量，不会像改 `--color-surface-hover` 那样波及全库 hover 态。

- `Table` 新增 `stickyScrollbar`：宽表在视口底部常驻横向滚动条（#149 附带） <!-- parity-id: table-sticky-horizontal-scrollbar -->

  宽表比视口高时，真正的横向滚动条落在表格底边、被挤到折叠线以下——想横向拖一下得先把整页滚到表底。开启后在表格外壳里挂一条 `position: sticky; bottom: 0` 的代理滚动条，与真容器双向同步。

  只在**需要**时出现：内容确实横向溢出、且表格底边已在视口之下；滚到表底会自动收起，不会上下并排出两条。与冻结列共存（代理条在表格外）。**`virtual` 开启时本项无效**——那种容器是定高的，横向滚动条一直贴在容器底边。关闭时 DOM 与加这个 prop 之前逐字节一致。

  滚动条外观是**显式画**出来的（`::-webkit-scrollbar` + `scrollbar-width`），不是听凭系统：macOS 默认是 overlay 滚动条，平时完全不可见，那样这条就成了一道空白，与「常驻一条」正好相反。

- `SocialButton` 补 Discord / GitLab，并开出自定义平台的逃生口（#154） <!-- parity-id: social-button-custom-brand-escape-hatch -->

  `provider` 此前是封闭枚举。这类组件最常见的失效方式不是「用一半」而是**整组退回**：一列 4 个登录入口只要有一个不在枚举里，混用就会看出两种形态（内置的自带品牌 logo 与文案，退回 `Button` 的那两个要自己塞 SVG、图标尺寸与间距都对不上），于是索性整组手搓。

  `provider` 现在也接 `SocialBrand` 对象（`icon` / `label` / `brandColor?`），拿到与内置品牌完全一致的皮肤——尺寸、形态、loading、按压、焦点环全共用。不传 `brandColor` 即黑白档，与内置 GitHub/X/Apple 同处方（企业自建 IdP 多半只有单色 logo）。

  枚举只补了 Discord 与 GitLab，因为**补不完也补不了**：simple-icons 已应法务要求下架 Microsoft / LinkedIn / Slack / 飞书等 logo，这些在库里根本无法内置；自建 IdP（Keycloak / Authentik / Okta）更是穷举不完。所以逃生口才是解，补枚举只是锦上添花。

  ⚠️ 组件是 `memo` 的，自定义品牌对象请提到模块作用域——写成 `provider={{ … }}` 内联字面量每次渲染都是新引用，memo 当场失效。

- `Field` 的 Label / Description / Error 三段各开一个 className 出口（#153） <!-- parity-id: field-section-classname-outlets -->

  三段的类名此前是硬编码的。存量页面的字段排版往往整页统一（12px / muted），对不齐就只能整页退回「自己的 `div.row` + `span.label`」，连带丢掉 `Field` 提供的 `aria-describedby` 串联、`invalid` 联动与错误渲染——只因为 label 的字号改不了。

  新增 `labelClassName` / `descriptionClassName` / `errorClassName`，走 `cn`（twMerge），传 `text-xs` 能正确顶掉默认的 `text-sm`。出口只动样式，a11y 关系原样保留。

- 清掉库内未使用的 import，并把这条钉进两侧门禁（#155） <!-- parity-id: unused-imports-and-strict-gates -->

  源码分发下，库里一个未使用的 import 就是每个开 `noUnusedLocals` 的消费方编译里的一条 TS6133/TS6196，而 `skipLibCheck` 救不了。原报告点出 `heading.types.ts` / `text.types.ts` 两处，实际全库有 **37 处**——其中 `prose` / `safe-area` / `streaming-text` 三个 `.types.ts` 同样会外溢到消费方，只是报告者没用到那几个组件。

  `noUnusedLocals` / `noUnusedParameters` 已开在 `packages/ui/tsconfig.json`（库内当场就红，这才是防回归本体），消费方门禁的承诺矩阵里也同步加上。顺带清出两处遗留：`Choicebox` 引了 `pressableClass` 却从未使用（它手写的 `active:scale-[0.99]` 是刻意比通用档更轻），`JsonViewer` 的 `isIndex` 一路传到 `JsonNode` 却从不消费。

- `Input` / `Textarea` 新增 `variant="cell"`：表格里的就地编辑器（#149） <!-- parity-id: input-textarea-cell-variant -->

  中后台有一类页面是「长得像表格的表单」——表头是字段名，单元格本身就是输入框。此前往 `Table` 的 `cell` 里塞瑚琏 `Input`，拿到的是带边框外壳 + 固定行高的独立控件，密集表格当场变成一片框；要做成能看的样子得在调用处覆盖一长串 `border-0 bg-transparent p-0 focus-visible:ring-0 …`，而那正是约定里明令禁止的调用处补丁。

  `variant="cell"` 卸掉整身外壳（无边框 / 透明底 / 零内距 / 不占固定行高），`Textarea` 还把高度交给 CSS `field-sizing: content`，`rows` 下限在该档默认为 `1`。焦点态换成**浅底 + 内嵌下划线**而不是焦点环：焦点环有 2px 环 + 2px offset，在无内距的单元格里会溢出去顶到相邻格；内嵌下划线画在盒内，零布局位移。

  两处调用处补丁尤其难自查，所以别再手写：`focus-visible:ring-0` 清不掉 `ring-offset`（残留一圈底色描边），而默认外壳的固定行高是 `h-10` 不是 padding，`p-0` 覆盖不掉。

- 新增 `LineShadowText` / `InteractiveHoverButton`（#151） <!-- parity-id: line-shadow-text-and-interactive-hover-button -->

  两件都是落地页 / 营销面的缺口。`LineShadowText` 给品牌词加一层斜向的**硬边**投影（不是 `text-shadow` 那种模糊），是文字特效族里最克制的一档：默认不动、无 RAF、纯 CSS，打印页与 `prefers-reduced-motion` 环境都能用；投影层是真 DOM 节点 + `aria-hidden` 而不是 `::after` + `content: attr()`，避免读屏把同一个词念两遍。`InteractiveHoverButton` 是悬停展开的主 CTA：静息「小圆点 + 文案」，悬停或**聚焦**时圆点扩成整块底色并换出箭头。

  展开实现与上游不同：上游把一颗 2px 圆点 `scale(100.8)`，那是按某个按钮宽度反推的魔数，按钮再宽就盖不满、边角露出静息底色，且是静默失败。这里用 `clip-path: circle(150% …)`——百分比按参照框对角线解析，任何宽度都必然铺满。

- 44 个组件、125 个「类型里有、文档表格里查不到」的字段补进文档，并做成 CI 门禁（#150 第三条） <!-- parity-id: component-doc-props-coverage-gate -->

  主要形态是 **item 形状的接口**：`BreadcrumbItem` / `NavMenuItem` / `TabBarItem` / `RouteTabItem` / `ChromaGridItem` 这类通过数组 prop 传进去的东西。根组件的 props 表大多写得全，但「数组里每一项长什么样」是系统性缺的——而这恰恰是消费方最需要查的：根组件的 prop 只告诉你 `items: XxxItem[]`，`XxxItem` 里有什么就没了下文。此前这些形状大多写在散文里（`AnchorItem`：`{ href; title; children? }`），读表的人与 `format="json"` 的工具链都拿不到。

  新门禁 `pnpm docs:check:props` 从 TypeScript AST 取 `Props` / `Item` 结尾导出接口的**自有**成员，与 md 里**所有**表格的首列比对，已接进 CI。判据两侧都复用现成真源而不是正则：`extends` 来的属性不要求逐条列出，限定名（`DialogContent.title`）与「一格写两个同源字段」（`startXOffset / startYOffset`）都认。

- `Tag` 继承 `HTMLAttributes<HTMLSpanElement>`；props 文档口径修正（#148 #150 #147） <!-- parity-id: tag-native-attrs-and-props-doc-visibility -->

  `TagProps` 此前是封闭接口，`title` / `id` / `data-*` / `aria-*` 一个都传不了，而同库的 `Button` / `Card` / `Empty` / `Progress` 都是继承原生属性的。状态标签恰恰最需要 `title` 做 hover 全文——表格里显示「Word」、`title` 是完整 MIME。

  **props 查询现在会一并给出插槽字段**（#150）。`Button.render`、`Upload.label/hint`、`Stat.label/value`、`Avatar.fallback` 这类字段住在文档的 `## Slots` 章节而不是 Props 表，于是照 MCP 工作流传 `sections:["props"]` 的人会得出「Button 没有 render」「Stat 没有 label」的结论——而 `Stat` 那两个还是**必填**的。现在 `format="json"` 的 `props` 数组会把插槽一并列出（各带 `kind:"slot"`），独立的 `slots` 数组照旧保留；markdown 路径同样会带上 `## Slots`。反向不搭：单独要 `slots` / `events` 时不会被塞进 props。

  同一批修正：`Segmented` 的 `label` 一直有文档（在 Slots 表里），#147 报的「props 表漏了」实为上述口径问题，md 无需改动；`Avatar` 的 `size` 文档补齐 `xl` / `2xl` 两档（实现一直有五档，文档只写了三档，而值域不全比漏字段更隐蔽——你以为看到了完整选项，根本不会起疑）。

- `Button` 新增 `size="iconXs"`（20px 方形），补上密集表格行内的微型操作档（#146） <!-- parity-id: button-iconxs-and-segmented-doc -->

  此前最小的图标档是 `iconSm`（32px），塞进 `density="compact"` 的表格行会把行高撑起来。而这个 20px 档一直真实存在——`Table` 的树形展开器与拖拽手柄都手写了同一份 `size-5`，既没收编回 `Button`，也没导出给消费方：于是「别写裸 `<button>`」的建议和「库里没有能用的按钮」形成闭环。

  `Table` 的展开器已改用这一档。拖拽手柄**刻意保留手写**：它禁用时要用 `cursor-not-allowed` 表达「这行不能拖」，而 `Button` 基座带 `disabled:pointer-events-none`，没有指针事件就没有光标变化——改过去要写三条 `disabled:` 把基座顶回来，比手写还长。

  注意 `iconXs` **不与任何文字档等高**（另外三档 `iconSm`/`icon`/`iconLg` 分别等于 `sm`/`md`/`lg` 的高度），跟 `sm` 混排会矮 12px。圆角也刻意是 `rounded`(4px) 而不是 `--radius`(10px)——10px 圆角落在 20px 方块上就是个圆片。

  **文档修正**：`SegmentedItem` 的 props 表补上 `label`（#147）。它是必填的 `ReactNode`，示例里每一段都在传，表里却没有，而同表的 `ariaLabel` 说明还在描述这个不存在的 prop。按 props 表建模（含 `format="json"` 的工具链）会得出「`SegmentedItem` 没有 label」这个直接出错的结论。

- **破坏性**：全库 `text-muted` 改名 `text-muted-foreground`，跟随 `@hulianui/tokens` 的语义反转（#142） <!-- parity-id: muted-rename-and-cjs-tooling -->

  `--color-muted` 现在是弱背景（对齐 shadcn/ui），次要文字色叫 `--color-muted-foreground`。组件内部 2059 处已机改，消费方自己写的 `text-muted` 需要同样改名——它已无对应 token，Tailwind 对未定义颜色不报错也不生成规则，会**静默回退成继承色**（次要说明文字渲染成正文同色）。`npx hulian-check` 有一条 error 规则逐条列出位置。`bg-muted` 不用改。

  顺带修正 BubbleMenu：悬停底的兜底值原本取的是次要文字色（深底 + 深字），语义反转后自动变成正确的浅底。

  **修复**：`@hulianui/ui/vitest-preset` 与 `@hulianui/ui/vite` 补上 CJS 入口（#143）

  没有 `"type": "module"` 的项目（`create-next-app` 的默认形态，也就是绝大多数 Next.js 消费方）加载 `vitest.config.ts` / `vite.config.ts` 时走的是 CJS `require`，而这两个入口此前只有 ESM，于是在**配置加载阶段**就报 `"resolved to an ESM file. ESM file cannot be loaded by require"`，一个用例都跑不到。现在实现落在 `.cjs`、`.js` 是其 ESM 包装，两条路都走得通。

  **修复**：注释里的通配类名炸掉消费方 CSS（#141）

  `button-base.ts` 的一句 JSDoc 举例写了 `[border-radius:var(--hulian-*)]`。Tailwind v4 的扫描器只做文本候选提取、不区分代码与注释，把它当真类名生成了 `border-radius: var(--hulian-*)`——`*` 不是合法的自定义属性名，消费方按文档加 `@source` 后整份样式表解析失败，**全站 500**。已改成非类名形态，并加了 CI 门禁防复发。

## 0.27.0

### Minor Changes

- 清空 issue #109–#139：24 条缺陷修复 + 7 项能力补齐。 <!-- parity-id: issues-109-140-sweep -->

  **破坏性行为变更（各一条，均在同一方向上「改回符合直觉的那个」）**

  - `DesignCanvas` 的滚轮语义与系统惯例、与同库 `Flow` 对齐：**两指滑动平移、捏合缩放**。`wheelBehavior` 默认值从 `"zoom"` 改为 `"pan"`，且 `ctrlKey`（浏览器把触控板捏合合成为 Ctrl+wheel）不再参与「反转」——此前捏合会被反转成平移，是语义倒挂而非取舍。`⌘+滚轮` 不再缩放（macOS 上它没有这个语义）。
  - 四个特效按钮（`ShimmerButton` / `RainbowButton` / `PulsatingButton` / `RippleButton`）从「按内容撑高」改为与 `Button` 同刻度的 `size` 三档（32/40/48px），默认 `md`。此前它们在工具栏里与普通 Button 混排会参差。
  - `IPhone` / `Android` / `Tablet` / `Watch` 的机身高度改为由内屏比例 + 边框反推，不再写死 `aspectRatio`（`Tablet` 显式传 `model` 时仍按机型比例）。渲染尺寸会有小幅变化，换来的是内屏比例恒等于视口比例。

  **新增**

  - `Button`：`tone` 补齐 `success` / `warning` / `neutral`（原本只有 `brand` / `danger`），并给 `solid` 补上独立的 hover 档——此前 `danger` 的 hover 写回自身，等于危险按钮没有悬停反馈。新增 `block` 块级铺满。
  - `Dock`：`activeKey` / `onSelect` 受控选中（与 `NavMenu` / `RouteTabs` 同范式），`DockIcon` 新增 `itemKey` / `active` / `label`。选中项落 `aria-current="page"` 与图标下方指示点；接了 `onSelect` 后 `DockIcon` 渲染为真正的 `<button>`，底座升级为 `nav` 地标。
  - `InspectorPanel`：`density="compact"` 紧凑档；分组 `columns` 多列网格（数值字段标签内联进输入框，并成为**拖拽调值**的抓手）；`InspectorNumberField.inlineLabel` 可单列启用。窄栏（<260px）下枚举字段自动从分段控件降级为下拉。
  - `IssueReporter` 的「在 GitHub 上打开」改用 GitHub mark（`_icons` 新增品牌图标组）——平台图标在这类按钮上承载的是目的地识别，不是装饰。
  - 新增内部真源 `lib/device-metrics`：设备内屏分辨率与边框宽度只声明一次，`PreviewSandbox` 的档位清单从中派生，`watch` 随之获得支持。

  **修复**

  - `ElementSelectionOverlay`：`target` 传普通容器时，点击拦截不再扩散到整个宿主页面。此前宿主上任何位置的点击都被吞掉（按钮点不动、tab 切不了），且 `onClear` 会在用户点属性面板时误触发。
  - 全库 `bg-muted` 误用：`--color-muted` 是次要**文字**色，当背景用时亮色发脏、暗色发白。区域底改用新增的 `--color-subtle`，悬停态改 `--color-surface-hover`。涉及 Kanban 列、ScopeMatrix 桶、QueueLane 泳道、InterceptCard 违反点块、Markdown 表格、CodeDiff、Gantt、Scheduler、Combobox / Select 高亮项等。
  - 深色画布上的文字色：`GooeyNav` 非激活项、`ChromaGrid` 卡面文案此前用跟随页面主题的 token，亮色主题下变成「深字压深底」。这两件现在声明为暗色上下文，用固定白色阶；`ChromaGrid` 另加暗色基底与 `@media (hover: none)` 兜底（无指针设备不再永久停在灰度降级态）。
  - `Segmented` 段补 `min-w-0` + `truncate`：此前段不可压缩，装不下时被上游裁掉，**选项存在但不可见也不可点**。
  - `CodeEditor` 根节点补 `w-full`：作为 flex/grid item 时会塌成约 20 字符宽的窄条。
  - `CardNav` 展开后卡片挤在 60px 条里：顶栏与内容区都是 `absolute`，`height:auto` 算出来恒为 0。
  - `StaggeredMenu` 序号压在菜单名上：两个 `em` 偏移基准不同（48px vs 18px），预留 16.8px 装不下 19.8px。改为兄弟节点 + `gap`。
  - `Notification`：操作按钮改左对齐（这是信息卡不是对话框），关闭按钮 `self-start` 不再随卡片高度飘，`aria-label` 接 locale。
  - `AdminLayout` 折叠后 logo 居中，与下方图标轨共用中轴；缺 `logoCollapsed` 时开发期告警。
  - `Button` base 补 `select-none`（全库按钮受益），`GiftFeed` / `Danmaku` 飘动层同理——连点场景下文字会被浏览器识别成双击选词。
  - `DesignCanvas` 抑制文本选择，`input` / `textarea` / `contenteditable` 留逃生口。
  - `ComponentPicker` 网格内边距不足致覆盖式滚动条压在卡片上；卡片标题与 slug 不再平分宽度。
  - `PreviewSandbox` 设备外框内的白边（内屏比例与视口比例对不上）；设备档位文案接 locale。
  - 新增布局高度 token `--hl-layout-header-h`，`Layout.Header` 与 `AdminLayout` 共用。

## 0.26.0

### Minor Changes

- 65c034f: 修 #97：Button 的图标档不再游离于尺寸刻度之外（**视觉 breaking**）

  `icon` 档过去是 `size-9`（36px），而文字档是 `sm` 32 / `md` 40 / `lg` 48 —— 它与**任何**文字档都不等高，所以 ButtonGroup 拆分按钮（`<Button>保存</Button>` + `<Button size="icon">`）连排时必然露出 4px 台阶。`iconSm` 早已对齐 `sm`，只有 `icon` 是孤例，说明 36px 是历史遗留而非设计意图（`page-header.tsx` 甚至用 `size="sm"` + `className="size-9 px-0"` 手贴出这个高度）。

  - `icon` 改为 `size-10`（40px），对齐默认档 `md`
  - 新增 `iconLg`（`size-12`，48px），对齐 `lg`
  - 至此三条刻度一一对应：`iconSm`/`sm` 32、`icon`/`md` 40、`iconLg`/`lg` 48

  **升级影响**：用了 `size="icon"` 的地方会从 36px 变 40px。实测不存在被撑破的容器（库内与文档站的全部调用点都在自适应高度的容器里）。需要保持 36px 的没有等价档位——请按语境改用 `iconSm`(32) 或 `icon`(40)，不要用 `className` 贴回 `size-9`（那正是这次要消灭的补丁）。

  同批对齐的三处 36px 邻居：

  - `AnimatedThemeToggler` 边长 36 → 40（它总与图标按钮并排在导航栏里，独自停在 36 会让整排错位）
  - `PageHeader` 返回按钮：删掉 `size="sm" className="size-9 px-0"` 的手贴补丁，改用 `size="icon"`
  - `Scheduler` 工具栏：前后翻页按钮 `icon` → `iconSm`，与同排的 `size="sm"` 今天按钮和 `Segmented size="sm"` 一起收在 32px 密集档

  新增一条回归测试锁住「图标档边长 == 同名文字档高度」这个不变量，档位再被改歪会当场红。

- ff1f7a7: 修 #99 / #100：两个取色件补上被 InspectorPanel 逼出来的缺口

  **#100 · ColorPicker 补 `onValueCommitted`**

  过去只有 `onValueChange`，而内部取色面板拖动时**每帧**触发，消费方拿不到「松手了」这个时刻，也没法自己补 —— 防抖只能猜延迟，`pointerup` 在组件内部拿不到句柄。

  新增 `onValueCommitted`（命名对齐 Base UI 的 NumberField / Slider），在取色面板拖动结束、文本框 blur 或回车、格式切换时各触发一次。`pointercancel` **不**触发（被系统打断的手势不算一次确定的提交）；点一下没拖仍触发一次（消费方要的是「一次编辑结束」信号）。`onValueChange` 语义不变，两者可同时用，TSDoc 补了「拖动中每帧触发」的说明。

  顺带修了一个只有接上 commit 事件才会暴露的 bug：`commitMode="commit"` 下父级拖动中不回写 props，而受控 `value` 会把色板**钉死拖不动**。改走 `defaultValue` + `key`（外部值变了才重挂）。

  **#99 · ColorSwatchPicker 色块可读标签**

  `colors` 过去是 `string[]` 且原样当 `aria-label`，主题 token 场景下读屏念的是 `var(--color-primary)`。现在 `colors` 接受 `string | { color, label }` 混合数组（纯增量，`string[]` 是子集，现有调用点零改动），并补了 `title` 悬停提示。

- 34644a1: 修 #98：日期时间族 5 个组件补 `size`（**视觉 breaking**）

  `DatePicker` / `TimePicker` / `DateTimePicker` / `DateRangePicker` / `TimeField` 的触发器高度过去全部硬编码 `h-9`(36px)，且**五个都没有 `size` prop** —— 与 `Input`(40px) 并排就是既有错位，而消费方连打补丁的口子都没有，只能往 `className` 里塞 `h-10`（这又违反「组件缺能力回库补组件」的约定）。

  现在五个统一走 cva，刻度与 `Input` 完全一致（`sm` h-8 / `md` h-10 / `lg` h-12，默认 `md`），触发器内的图标尺寸随档位走。**升级后这五个组件的默认高度从 36px 变成 40px** —— 这正是要修的错位，需要 36px 的没有等价档位，请按语境改用 `size="sm"`(32) 或保持 `md`(40)。

  `DateRangePicker` 面板内那处 `h-9` 是月份网格里包住日按钮的格子，与触发器无关，刻意不动。

  与 #97（Button 的 `icon` 档）同源：库里存在一批游离于 32/40/48 刻度之外的 36px。两条一起清完，36px 这个孤立档就从表单层面消失了。

- 4e3547a: 新增 7 个设计工具族组件（#90–#96），补齐「AI 生成 UI」这类产品要的整条工作台

  消费方在做 AI 设计生成产品时一次报了 7 个缺口。这批全部零依赖自研，没有为它们新增任何 npm 依赖。

  - **DesignCanvas**（data-display/collection）视觉设计画布：无限平移缩放、元素选择框、拖拽移动与八向 resize。受控 `items` 托管几何，`children` 作自绘图层。视口数学复用 `Flow` 已有的几何纯函数，不重写。**与 Flow 的分工写进了文档**：Flow 是节点编排画布，DesignCanvas 是自由排列的设计画布。
  - **ElementSelectionOverlay**（feedback/overlay）指向编辑的基础设施：在容器或**同源** iframe 里 hover 高亮 / 点击选中，回吐组件树路径。路径两层（`data-hulian-path` 标记优先，回退到可被 `querySelector` 反查的结构化选择器），并把可靠度作为字段暴露出去。不往目标文档写任何样式。**跨源 iframe 明确报 `cross-origin` 错误而不是假装接上了。**
  - **InspectorPanel**（forms/advanced）属性检查器：字段 schema 驱动，按 `kind` 派生控件，面板本身不认识任何具体属性；内置 layout / color / typography / border / effects 五套预设 schema。spacing 四联链接锁定、主题 token 色板、`MIXED` 混合值占位、`commitMode` 控制回吐时机。
  - **CodeEditor**（forms/advanced）代码编辑器：textarea + 高亮层叠加，复用 `CodeBlock` 的零依赖着色器（CSS 另带一个有状态的扫描器，所以 `a:hover` 不会被当成属性名）。Tab 缩进 / Shift+Tab 反缩进 / Enter 续缩进 / 成对符号自动闭合与包裹 / 退格删对 / `Cmd+/` 切注释，**每一条都经 `execCommand` 落笔，所以原生 undo 栈不断**。**刻意不引 CodeMirror / Monaco**：本库是源码分发，一个依赖会进所有消费方的模块图。折叠、补全、多光标、minimap 明确不做，边界写进文档。
  - **PreviewSandbox**（layout/container）预览沙箱：iframe 隔离渲染与同文档 React 错误边界双模式共用一副壳，错误对象同形状。切设备只改容器盒子，**iframe 节点与文档都不重建**，预览内的状态不丢。默认 `sandbox="allow-scripts"` 且**刻意不给 `allow-same-origin`**（两个一起给等于没有沙箱），因此错误转发走 postMessage；需要读内部 DOM 时显式传导出的同源常量。**不做代码执行引擎**：`code` 的语义是「已经可直接送进 iframe 的 HTML 文档串」。
  - **ComponentPicker**（data-display/collection）组件库浏览器：分类树 + 模糊搜索 + 结果网格 + 详情面板。自研打分器（slug 命中远重于描述命中），**不引 fuse.js**。目录由消费方喂进来，另导出 `parseComponentCatalog` 纯函数把 `llms-full.txt` 解析成条目 —— 组件自己不发网络请求、不假设文件存在。
  - **IssueReporter**（forms/advanced）GitHub issue 草稿器：表单收集 → 模板纯函数拼 Markdown → 回吐结构化草稿 + 生成预填链接。**链接超长自动降级为复制 Markdown**（判据量整条 URL 而不只是 body —— 中文百分号编码后 1 字 = 9 字符，只量 body 会在长标题时判漏）。不调 API、不持 token。

  七个组件的内置文案都接了 `ConfigProvider` 的 locale SSOT，同时保留各自的 `labels` / `text` prop 作为覆盖。

### Patch Changes

- 899ff6d: AI 分发产物补上机器可读的 props 真源，并修掉三处让消费方必须自己写解析器的坑（#102 #103 #104 #105）

  瑚琏把 AI 消费当一等公民，但结构化程度此前停在 markdown：`registry.json` 有 name / description / categories / exports / types，**唯独没有 props**。想做「受约束生成」（让模型只能输出白名单组件与合法 props）的消费方只能去解析文档表格，于是同一批坑每家踩一遍。

  **新产物 `llms-props.json`**（383 个组件 / 3038 条 props）：

  ```jsonc
  {
    "version": "…",
    "typeAliases": { "StackDirection": ["row", "column"], … },   // 143 条字面量联合别名
    "exportIndex": { "IPhone": "iphone", "BarChart": "chart", … }, // 796 个导出名 → 组件
    "components": [{ "slug": "button", "import": "…", "exports": [...],
                     "props": [{ "name": "size", "kind": "enum",
                                 "values": ["sm","md","lg","icon","iconSm","iconLg"],
                                 "valueType": "string", "default": "\"md\"", … }] }]
  }
  ```

  `kind` 覆盖 enum / union / boolean / number / string / node / function / array，`valueType` 区分 `level={1}` 与 `level="1"`，混合联合（`StackDirection | ResponsiveDirection`）也照样给出 `"row"` / `"column"` —— 「还有别的形态能传」不该让两个已知取值一起消失。

  同时修掉的三条：

  - **#102 转义竖线**：类型列的联合分隔符在文档里有三种写法（全角 `｜` 72 篇、半角、GFM 转义 `\|` 404 篇），按 `line.split("|")` 裸切会整行串列，枚举只剩第一个取值、默认值和说明全错。AI 产物（`llms-full.txt` / `d/<slug>.md`）的 Props / Events / Slots 表现在统一重写成 GFM 转义形。**英文产物无法改用全角**（那道门禁不许出现 CJK），所以「统一成 `｜`」这条路走不通 —— 真正的答案是上面那份 JSON，markdown 只保证自己合法且一致。
  - **#103 别名不展开**：类型列写 `StackDirection` 而文档里没有任何地方给出它的取值，AI 只能猜 `direction="horizontal"` 然后**静默不生效**（不报错，只是版式不对，比报错更难查）。现在用编译器 AST 扫 `*.types.ts` 抽出字面量联合，在产物里就地展开成 `"row" | "column" | ResponsiveDirection`。非字面量别名（对象型的 `ResponsiveDirection`）保持原样。
  - **#104 标题 ≠ 导出名**：`# iPhone`（真实导出 `IPhone`）、`# Chart`（真实导出 `AreaChart` / `BarChart` / …）、`# Resizable`（`ResizablePanelGroup` / …）。产物里每个组件标题下补一行以 barrel 为真源的 `**导出**`，消费方不必再去解析 `## 导入` 代码块反查。

  `llms.txt` 里加了一句把受约束生成的消费方直接指向 JSON，别再解析表格。

- 4771326: 修 #89：45 个组件补上 `memo`，avoidable-render 的盲区一次清干净

  `avoidable-render` 是运行时性能门禁里唯一的绝对阈值规则（>0 即 error），但 CI 只扫「本次改动波及的场景」，定时那一支只跑 4 个 React 18 兼容场景 —— 所以**一个组件只要没人碰过，它的违规就永远不会被发现**，等某天顺手改到它（哪怕只是换 showcase 里一张图）CI 才突然红，看起来像是本次改动引入的。

  首次全量扫描（373 runs）一次揪出 **45 个组件**，全部按 `Button` / `Checkbox` / `Chip` 的既有处方修复（`XxxImpl` + `memo(XxxImpl)`，两处 `displayName`），并各配一条 Profiler 回归测试 —— 去掉 `memo` 必须当场红。

  涉及组件：AgentPlan、Alert、Annotation、Avatar、AwardBadge、Breadcrumb、ChatMessage、Citation、CodeBlock（连带 HighlightedCode）、ColorField、CreditCard、DeployStatus、Descriptions、DiffStat、Dossier、Dot、EventStream、FileTree、Funnel、GitCommit、Heatmap、IconPicker、InputOTP、JsonViewer、Kbd、Link、LivePlayer、LiveProductCard、Meter、NumberField、Rating、ScoreRing、SecretField、Skeleton、Slider、SocialButton、Snippet、Stat、Statistic、StatusDot、Steps、Switch、Tag、TimeField、Timeline。

  对外 API 零变化：导出名、类型、compound 子件（`Statistic.Countdown`）与所有具名纯函数导出全部原样。`Funnel` 是泛型组件，用 `memo(FunnelImpl) as unknown as typeof FunnelImpl` 保住泛型签名。

  三条实施中确认的事实，写在这里免得下次重新踩：

  - **CodeBlock 修了两层**。根 `memo` 只挡父级更新；复制按钮的 `copied` state 走自身路径挡不住，每点一次就把整段代码重新分词并重建全部 `<span>`。所以 `HighlightedCode` 也 memo。
  - **FileTree 是 memo 根而不是 memo 行**。行组件收的 `toggle` 是每轮新建的箭头函数、`expandedSet` 在受控/搜索态是每轮新建的 Set，浅比较必然失败 —— memo 行是纯亏；memo 根反而把整棵子树一起跳过。
  - **finding 里的计数不可跨组件比较**。门禁只统计 `event.name === 组件名` 的 fiber，子组件永远不进这条计数；而只有 `controls: []` 的组件其 stress 步骤 id 才叫 `stress:stable-parent-update`，会被一并收进来。所以「42」和「2」不代表严重程度差十倍，只代表该组件有没有可控 prop。

  复验时又清掉 5 条（本批新组件 IssueReporter / InspectorPanel / ComponentPicker，以及首轮未命中的 Empty / Legend）。

  **又两轮全量复跑各逮到一批漏网的**：第一轮 `Brand` / `ScopeMatrix` / `Stepper`，第二轮 `Heading` / `Text` / `GridPattern` —— 六个都压根没上过 `memo`，按同一处方补齐并各配护栏。`Heading` / `Text` 是泛型多态件，沿用 `Funnel` 的 `as unknown as typeof XxxImpl` 断言保住 `as` 多态下的推导。

  它们没在首轮 45 条里出现，是因为**这条规则本身有抖动**。三条实测结论，都写在这里免得下次重新怀疑自己：

  - 同一份代码连跑四次拿到 **3 / 1 / 0 / 1** 条 finding。它统计的是 React 给出的「本次提交里 props/state/hooks 全无变化」的渲染，而这个判定会随调度与负载漂移。
  - 两次全量扫描给出的是**两组几乎不重叠**的组件（第一次 Brand/Kbd/ScopeMatrix/Stepper，第二次 Dossier/GridPattern/Heading/Kbd/Text）—— 每轮只是从池子里随机抽中几个。
  - **对已正确 memo 的组件也会误报**：`Kbd` 与 `Dossier` 都有 `memo`（且护栏测试与负向扫荡都证明它生效），仍被判出 2–3 条。

  配套的事实是：全库 380 个组件里 **306 个本来就没有 `memo`**（只有叶子型、props 全稳定原语的那类才配）。所以「一次全量扫描 0 findings」既不可达也不该当作发版判据；有意义的判据是**逐条看被点名的组件有没有 memo** —— 没有就补（本轮补了 6 个），有就是误报。

  CI 里这条只在定时触发跑全量（PR/push 只扫改动波及场景），所以它不阻断发版；但定时那一支会间歇性变红，需要单独决定是调规则还是调阈值。

  其中 **IssueReporter 与 InspectorPanel 的根因不在组件上**：它们 showcase 的第一个示例往组件传了内联箭头函数（`onSubmit={(draft) => …}` / `onChange={(path, value) => …}`），每轮渲染都是新引用，`memo` 从原理上就 bail 不掉。把回调提到模块级 / 包 `useCallback` 后归零。**任何组件的 showcase 首例只要传内联箭头，这条规则就会报**——它量的是 fixture 的写法，不是组件的质量。

  同时把盲区本身堵上：CI 的定时触发新增一条 `Weekly structural sweep`，跑全量 inventory 而不只是 4 个兼容场景。

  护栏测试统一走 `packages/ui/test/memo-guard.tsx` 的 `expectMemoSkipsSubtree`，判据分两层（#106）：

  1. **结构断言**（不依赖时间）：被测元素的类型必须真是 `memo` 包出来的 —— `memo` 被误删时确定性变红；
  2. **行为断言**：分母不再用 React 的 `baseDuration`（那是 memo bail 之后就不再更新的**冷**挂载估算，比值会随「这条测试在文件里排第几」漂移），改成同一条测试现场测出来的「被迫重渲一次要多久」——给被测元素补一个每轮都变的 `data-memo-probe`，浅比较必然失配。于是 memo 生效时比值实测 0.01–0.19、memo 失效时 ≈1.0，两簇之间隔着约 5 倍，阈值 0.5 上下各留 2 倍以上，不必再为每个组件各自拍系数。

  全库 64 个护栏文件（含原先 6 处各写各的内联判据）现已统一到这一套。全局负向扫荡（把 `React.memo` 换成恒等函数）**64/64 文件、77/77 条断言变红，零假绿**，且失败的全是护栏用例、无误伤。

- 899ff6d: 修设计工具族四个组件的英文缺口与静态导出阻断（#91 #92 #96 的收尾）

  这批问题都是「跑一遍完整门禁才会暴露」的类型，本轮补跑构建与浏览器门禁时一次浮出来：

  **InspectorPanel / IssueReporter 的内置预设没接语言**

  - `inspectorSections()` 返回的五类预设 schema 里，51 条字段标签与枚举选项是硬编码中文（`布局` / `内边距` / `起` / `中` / `末`…）。不传 `sections` 时面板渲染的就是这套预设 —— 英文消费方拿到的是一屏中文标签。
  - `BUILTIN_ISSUE_TEMPLATES` 的三套模板同理：字段标签与 `toMarkdown` 产出的章节标题（`## 问题描述` / `## 环境`）全是中文，而这些字符串会**进到提交给 GitHub 的 issue 正文里**。

  两者的文案都收进 `config/locale.ts` 的 locale SSOT（`inspectorPanel.presets` / `issueReporter.templates`），组件按当前 `ConfigProvider` 语言取用。新增 `buildInspectorSections(text)` 与 `buildIssueTemplates(text)` 两个纯函数供直接调用；`layoutFields` / `colorFields` / `typographyFields` / `borderFields` / `effectsFields` / `BUILTIN_ISSUE_TEMPLATES` 这些既有具名导出保留为中文默认形态，老代码行为不变。`inspectorSections(categories, text?)` 的第二参可选，不传仍是中文。

  英文站上这两页此前一共渲染出 195 处中文残留（`docs:i18n:output` 门禁计数），现在归零。

  **PreviewSandbox 的示例会打断静态导出**

  「同文档模式」示例为了演示错误边界，子组件在渲染期直接 `throw`。文档站是 `output: "export"`，每页都要在构建期预渲染一次，而**错误边界只在客户端接得住** —— 于是整页 `/components/preview-sandbox` 导出失败，构建直接中断。单测与真实浏览器都看不出来，因为那两边都有边界兜着。

  改成点按钮才抛（iframe 模式那条演示同理）：加载时先渲染正常子树，点一下才进错误态。顺带解决第二个问题 —— 自动抛错时 React 仍会把它上报给 window，英文 showcase 的浏览器门禁按 `pageerror` 判失败（一次正常的页面加载不该甩出未捕获错误；Playwright 还会把 iframe 内的错误算到宿主页头上）。

  新增守卫 `src/showcase/ssr-safety.test.tsx`：把全部 380 个 showcase 的 examples/states 过一遍 `renderToStaticMarkup`，任何一处在服务端渲染时抛错都当场红。把「构建十分钟后才发现整页导不出来」提前到秒级。

  **顺带**：`stepper.tsx` 开头重复了两行 `"use client"`，清掉一行。

  **英文目录缺 7 条**：`apps/www/i18n/component-meta.en.ts` 里没有这批新组件（DesignCanvas / ElementSelectionOverlay / InspectorPanel / CodeEditor / PreviewSandbox / ComponentPicker / IssueReporter）的记录，英文站的组件目录与站内搜索都索引不到它们。补齐后英文目录从 371 条回到与中文一致的 378 条。

- 899ff6d: 修 #108：Meter 的数值文案不再把原始 `value` 当百分比

  指示条宽度一直是按 `(value - min) / (max - min)` 算的（对的），但 `showValue` 印出来的文字和 `aria-valuetext` 走的是 Base UI 的默认实现 —— 那是**原始 value 直接拼 `%`**。于是 `max ≠ 100` 时，同一个组件里的条和字互相矛盾：

  ```tsx
  <Meter value={1041} max={1324} label="已挂教材章节" showValue />
  // 条形 78.6%，屏幕上却印着「1,041%」，aria-valuetext="1041%"
  ```

  `max` 存在的意义恰恰是「不是 100 分制」，所以 `showValue` 此前只在 `max === 100` 时是对的。`aria-valuetext` 尤其严重：`MeterProps` 不透传原生属性，可见文字还能靠自己算好塞进 `label` 规避，读屏念的那句消费方**没有任何办法修正**。

  - 文案改由组件统一算：归一化到 0–100 后渲染，与指示条同口径，最多保留一位小数（`1041/1324` → `78.6%`，`50/200` → `25%`）
  - 通过 `getAriaValueText` 让 `aria-valuetext` 用同一句 —— 可见与可听不允许有两套说法
  - `aria-valuenow` / `aria-valuemin` / `aria-valuemax` 仍如实上报原始值，不受影响
  - 越界值只在文案上夹到 0–100%，`aria-valuenow` 照实报（越界该在数据侧解决，组件不替你掩盖）
  - `max === min` 不再产生 `NaN`

  新增 `formatValue`：

  ```tsx
  <Meter
    value={1041}
    max={1324}
    label="已挂教材章节"
    showValue
    formatValue={({ value, max }) => `${value} / ${max} 道题`}
  />
  ```

  返回的字符串同时驱动可见文字与 `aria-valuetext`，两者结构上不可能不一致。`percent` 已归一并夹到 0–100（未取整）一并给到。

  文档补了三条此前只能靠读源码才知道的事实：`label` 是给 `role="meter"` 挂无障碍名的**唯一**途径（自绘标题不会被 `aria-labelledby` 关联上）；Base UI 的 Root 末尾固定塞一个 `role="presentation"` 的视觉隐藏 `<span>x</span>`，按整树 `textContent` 断言时会撞上；越界值的处理口径。showcase 补了 `formatValue` 的例子 —— 顺带说明，原有那条「自定义量程」示例的描述写的就是「数值按区间换算占比」，只是组件当时并没有这么做。

- 899ff6d: 修 #107：可选 prop 收到 `null` 不再抛 TypeError

  JS 的解构默认值只在值为 `undefined` 时生效，`null` 会原样落进函数体。于是 `<Stack direction={null}>` 直接崩在 `directionClass`（`typeof null === "object"`，null 掉进了响应式分支）：

  ```
  TypeError: Cannot read properties of null (reading 'base')
  ```

  这不是「调用方别传 null」就能算了的事。瑚琏把 AI 消费当一等公民，**任何由 LLM 产出结构再动态渲染的消费方都会遇到模型把「不设这个 prop」写成 `"direction": null`** —— 那是 JSON 里最自然的写法。报告者的 DSL 生成平台就是这么整棵子树被 ErrorBoundary 吃掉的。

  全库扫了同一个缺陷类，19 个组件的 22 个 prop 全部补上回落：

  - **响应式 / 对象形态**：`Stack.direction`、`Grid.cols`、`Tree.virtual` —— 这三个是 `typeof x === "object"` 分支判断的直接受害者
  - **数组形态**：WorldMap(`dots`/`points`)、BeianFooter(`icp`)、FlyingPosters(`items`)、ScrollVelocity(`texts`)、BounceCards(`images`)、Folder(`items`)、Cascader(`defaultValue`)、Listbox(`defaultSelectedKeys`/`disabledKeys`)、Transfer(`defaultTargetKeys`)、Scheduler(`resources`)、InfiniteMenu(`items`)、FallingText(`highlightWords`)、VoiceRecord(`levels`)、StaggeredMenu(`items`/`socialItems`)、GridMotion(`items`)、ScopeMatrix(`suggestions`)、Tree(三个 `defaultXxxKeys`)

  每个都配了一条回归测试：传 `null` 不抛错，且与「完全不传这个 prop」表现一致。用改动前的代码跑这批测试，会精确复现 issue 里那条 `Cannot read properties of null (reading 'base')`。

  **本轮的边界**：只消灭崩溃。布尔与字符串默认值（`selectable = true`、`variant = "solid"` 这类，全库 430+ 处）收到 `null` 时仍然退化成 falsy 值而不是回落默认值 —— 那不会崩，只是行为与「不传」不同。要不要连这批一起归一是另一个量级的决策，没有夹带在这次里。消费方若从 LLM 输出直接构造 props，稳妥做法仍是在校验层丢弃值为 `null` 的键。

## 0.25.2

### Patch Changes

- `Chip` 在父级稳定更新时不再重算子树。 <!-- parity-id: memo-chip -->

  Chip 常成组出现（筛选条、标签列表、令牌输入），一个列表页十几个是常态。它此前是普通函数组件，父级每渲染一次，整排 Chip 就跟着重算一遍 cva 配方与 `cn` 合并 —— 而这类调用点传的几乎全是原语 props（`tone` / `variant` / 文本 children），引用从没变过，React 却无法自己 bailout。

  现在 `Chip` 与 `Button` / `Checkbox` 同处方，包一层 `memo`。运行时性能门禁（Hulian Scan）在 `chip/basic` 场景实测 `avoidable-render` 5 → 0；`chip.test.tsx` 新增一条 Profiler 回归测试锁住语义（去掉 memo 即红）。

## 0.25.1

### Patch Changes

- 6fdcfe1: 组件与 showcase 里的外链素材图全部换成程序化生成的 data-URI SVG，并补上门禁。

  `DecayCard` 的 `image` **默认 prop** 曾是 `https://picsum.photos/...` —— 消费方 `<DecayCard />` 什么都不传就会打一次外网请求，断网 / 内网 / 被墙即碎图。同类外链还散落在 ImageViewer / InfiniteMenu / FlowingMenu / Upload / Table / Chip 的 showcase 里，共 13 处。demos 那边早有「资源全本地化，零外链」的铁律并由 `demos:coverage` 强制，但那条门禁管不到 `packages/ui`；CircularGallery 当初单独修过，没人扫同域。

  新增 `lib/demo-image.ts` 的 `demoImage(seed, w, h)`：确定性哈希 → 渐变 SVG data-URI，零网络请求，SSR 与 hydration 取到同一张图。新增 `scripts/no-remote-assets.test.mjs` 守住，命中已知图床即失败 —— 它上线当场又逮出两处 `pravatar.cc` 头像。

  另修 `ImageViewer` 的示例：此前 render 返回的是一个 `<span>` 假按钮加 `open={false}` 的查看器，**点不开、图一张也看不到**，而 code 展示的却是可交互写法（违反 `code` 与 `render` 一一对应）。现在接上文件里本来就写好、却从没被用上的 `Demo` 组件。

- 6fdcfe1: `ScrollReveal` 落在内部滚动容器里不再失效。

  `useScroll({ target })` 默认监听 window 滚动，组件一旦被放进内部滚动区（文档站的 `<main class="overflow-auto">`、画廊预览框、抽屉、弹层），容器滚动不触发 window scroll，进度**永远停在 0** —— 而 0 进度正是「`baseOpacity` + 模糊」的初始态，整段文字近乎隐形，比不动更糟。文档站本身就是这种布局，等于所有看文档的人看到的都是失效状态。

  现在自动探测最近的可滚动祖先，也可用新增的 `scrollContainerRef` 显式指定；既无可滚祖先、页面也不可滚时降级为 in-view 入场，保证文字总能读到。这套逻辑 `ScrollFloat` 早已实现（注释里写着「修复画廊卡 0 进度坑」），这次抽成共享的 `useScrollContext` 两件共用，避免第三个组件再踩。

- 6fdcfe1: 修 [#88](https://github.com/hulianui/hulian/issues/88)：`$…$` **段内**的填空槽不再让整段标红。

  0.25.0 只处理了段外的 `____`，段内的原样喂给 KaTeX，触发 `Expected group after '_'` 后整条题面标红。而 `math.md` 写的是「分隔符内外都认」—— 文档举的例子恰好是段外那种，实现与承诺不符，测试也只覆盖了段外。消费方 17 份试卷制品里有 21 处填空槽落在段内（`$\overrightarrow{AC}=___$`、`$E(X)=___$`、`$\theta=_______$` …），是常规内容不是脏数据；0.24.0 的 MathText 对填空槽本来是有支持的，**这属于升级带来的回退**。

  段内改用 `\rule` 替换而不是把段切开：切开会把 `\frac{___}{2}` 劈成 `\frac{` 与 `}{2}` 两个非法残片、两边都标红。替换保住公式结构，填空落在分数分子、根号里都成立。

  **两处实现不同，无障碍行为有差异，已写进文档**：段外是真 DOM 空位（带 `aria-label`，读屏读「填空」），段内由 KaTeX 排（挂不上 aria，读屏读 MathML）。需要读屏念出「填空」就把填空槽写在 `$` 外面。

## 0.25.0

### Minor Changes

- 4b7c80f: **破坏性变更：MathText 退役，QuestionCard 迁到 `@hulianui/ui/math`。**

  MathText 用 CSS 拼行内数学版式（`inline-flex` 叠分数、`border-t` 当根号横线），排出来的东西是错的：`√` 是定高字符而横线是兄弟盒的 border，被开方数一含上标（`\sqrt{a^{2}+b^{2}}`）横线就接不上根号、末尾指数顶到线外；弧与帽子不跟随内容宽度，中文教材里跨 AB 的弧被排成 A 头上一顶帽子。这是 CSS 拼贴的固有极限，修一处还有下一处。它当初的卖点「零依赖换不撑乱中文行高」实测在 KaTeX 下同样成立 —— 那个差异一直是假的。

  数学渲染统一走 KaTeX 驱动的 `Formula`。

  迁移：

  | 原来                                          | 现在                                                      |
  | --------------------------------------------- | --------------------------------------------------------- |
  | `import { MathText } from "@hulianui/ui"`     | `import { Formula } from "@hulianui/ui/math"`             |
  | `import { QuestionCard } from "@hulianui/ui"` | `import { QuestionCard } from "@hulianui/ui/math"`        |
  | `<MathText>{stem}</MathText>`                 | `<Formula>{stem}</Formula>`                               |
  | `mathToPlain(src)`                            | 同名同义，改从 `@hulianui/ui/math` 引                     |
  | `parseMath` / `parseMathDocument`             | 不再导出（排版已由 KaTeX 接管）                           |
  | `delimiters={true}`                           | 不需要：`mixed` 默认认 `$`，没有 `$` 时自动退到裸记号切分 |
  | `scriptScale`                                 | 移除（上下标尺寸由 TeX 排版规则决定）                     |

  QuestionCard 换 subpath 是因为它的题干/选项内部就是 Formula，留在主 barrel 会把 KaTeX 拖进每一个 `@hulianui/ui` 消费者的包。主入口仍然一分 KaTeX 体积都不付。

  Formula 为接管题库场景补了两项能力：

  - **裸记号回退** —— 整串没有成对分隔符时自动切分出 `\frac{3}{8}`、`x^{2}`、`\angle ABC` 交给 KaTeX，其余按文本输出。PDF/Word/OCR 直出的题面不必先包 `$` 才能排。判据是「没有 `\` / `^` / `_` 就不是公式」，所以 `P(2,3)`、选项标号 `A.` 一律留作文本。新增纯函数 `splitBareMath` / `hasBareMath`。
  - **填空槽** —— `____` 渲染成可书写的空位（新 prop `blankWidth`，默认 2.5em），分隔符内外都认，读屏读到的是「填空」而不是一串下划线。

  视觉上有两处变化，都是改对了而非回归：变量按 TeX 规矩显示为斜体；公式比周围正文约大 1.21 倍。

### Patch Changes

- 4b7c80f: 修正英文站上的一批机翻错译，并给三处门禁补上真正的判据。

  **英文文案**（23 条，逐条核实过消费它的组件语境）：`分数` 曾译成 Score —— 而用它的只有 math 与 question-card 两处数学语境，正确译法是 Fraction；`工号` 曾是 Job number（应为 Employee ID）；`参考人数` 被理解成「参考编号」译作 Reference number（应为 Examinees）；`电量` 译成功率 Power（应为 Battery）；`等级带` 直译成 Level belt（应为 Grade bands）；diff-stat 的 `新增行 / 删除行` 是代码行却译成表格 row；badge 的 `纯点`、divider 的 `纯分隔线`、color-field 的 `无色块` 都是字面直译；heading 的六个层级原本混用三种译法（First level title / Level 3 heading / Sixth level title），统一成 Heading level N。

  **门禁**：

  - 英文词表的 `files` 块此前不受「非空 / 无 CJK / 保留占位符」那条质量断言覆盖（它只遍历 `exact`），而 per-file 覆盖正是「同一个中文在不同组件里要不同译法」的唯一出路，等于把这批译文放在质检之外。扩大覆盖后立刻抓到一条丢失 `PDF/Word/OCR` 标识符的译文。
  - picker 的子树跳过测试用的是**挂钟时间**阈值（`< max(0.5ms, base * 0.1)`）。memo 命中时实测 0.004–0.008ms、baseDuration 1.3–10ms，余量上百倍仍偶发翻红 —— 并发跑测试时一次调度延迟就是毫秒级。改成结构断言（组件确实被 memo 包着）+ 多次采样取最小值，对负载免疫。
  - `advisories` 条数曾以绝对值写死在测试里，任何一次组件增删都会打翻它。改成按组件文档数的比例下限，守的是「提取链路没断」而不是某个具体数字。

  另外 unit 测试 timeout 从默认 5s 放宽到 15s（最慢的用例单跑 1.4s，并发下涨到 5.4s 就撞线），并新增 `pnpm readme:sync` 一键同步 README 里的组件数 / demo 数 —— 此前只有校验没有修复入口，增删组件要手改 5 处。

## 0.24.0

### Minor Changes

- 2764188: 新增 Formula（`@hulianui/ui/math`）：KaTeX 驱动的二维数学排版；MathText 补 `delimiters` 认 `$…$` 边界 <!-- parity-id: katex-formula-subpath -->

  **新组件 Formula，走独立 subpath** — [#87](https://github.com/hulianui/hulian/issues/87)

  MathText 刻意划了零依赖边界：`\begin{cases}` 被拍平成一行、`\\` 变分号、`\left…\right` 丢命令留定高括号，文档写着「请自行接 KaTeX」。问题是这句话意味着每个做题库/教辅的下游各接一遍：各写一套分隔符切分、各配一份 KaTeX CSS、各踩一遍 SSR 的坑。消费方实测 1324 道入库题里 `\begin{...}` 环境 23 处，其中 `cases` 占 78% —— 分段函数是高中函数题的主力题型，不是长尾，而拍平后的 `f(x)=x, x<0；-x, x≥0` 已经读不出「这是分段定义」，题干读不懂题就废了。

  ```tsx
  import { Formula } from "@hulianui/ui/math";

  <Formula>
    {"$$f(x)=\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\ e^{x}+\\ln(x+1), & x \\geq 0 \\end{cases}$$"}
  </Formula>;
  ```

  走 subpath 而不是进主 barrel，是因为 KaTeX 要 86KB gzip 的 JS（体积门禁实测）外加样式表与字体：**MathText 的消费者不该为用不上的能力买单**，而需要重型排版的页面本来就愿意付这个体积。样式由组件自己 `import`，消费方无需在入口引 CSS；组件没有 `"use client"`，`katex.renderToString` 是确定性纯函数，可直接用在 RSC 里。

  配套 `splitMathSegments`（切段，Word/OMML 导出链路要的就是它）与 `formulaToPlain`（可检索朴素文本）。坏数据分两档显示：认不出的控制序列就地标红、原样露出且不影响周围排版；整体解析失败则红色显示整条原文。

  **MathText 新增 `delimiters`**

  认 `$…$` / `$$…$$` / `\(…\)` / `\[…\]`，开了之后**只有分隔符内按数学解析，外面一律按纯文本原样输出**。

  这条修的是「渲染层反向污染数据 SSOT」：渲染层不认 `$`，上游就只能在入库时把它剥掉，而剥 `$` 是有损的 —— `$\{a_n\}$` 剥完成了 `{a_n}`，集合还是 LaTeX 分组再也分不出来；喂给 LLM 时公式与中文粘成一片；要做 Word 导出时切不出公式段就无从转换。边界是必须显式携带的信息，不该由渲染层猜、更不该逼上游删掉。

  默认 `false`，存量零改动 —— 因为开了之后 `售价 $100 起，成本 $80` 里的两个 `$` 会被当成一对分隔符，正文里有货币金额就别开。整串没有成对分隔符时自动回退到存量行为，半迁移的题库不会整题露出 `\frac`。`mathToPlain` 同步接受 `{ delimiters }`，检索口径必须与渲染传同一个值。

## 0.23.0

### Minor Changes

- RadarChart 半径轴可关；修 Banner 长文案撑破容器、SearchForm 窄屏挤成一团、MathText 关系符间距与 `^\circ` 不解析 <!-- parity-id: radar-radius-axis-and-mobile-fixes -->

  **RadarChart 新增 `radiusAxis`** — [#86](https://github.com/hulianui/hulian/issues/86)

  半径轴的刻度数字此前无条件渲染、`className` 够不到，消费方关不掉。它画在**数据区里而不是外面**：刻度锚点沿一条水平半径从雷达盘中心排到边缘，每个数字还被 recharts 旋转 90° 竖排。序列一多、数据填得满，前几个刻度就整个落进数据多边形内部，既压住图形又难读。

  echarts 的 radar 里 `axisLabel.show` 默认就是 `false`，只画环线与角轴名 —— 这串数字是移植到 recharts 时被默认带出来的，消费方既没要它也关不掉。

  ```tsx
  // 只留环线与角轴名（= echarts radar 的默认形态）
  <RadarChart radiusAxis={false} data={data} series={series} xKey="indicator" legendScroll />
  ```

  默认仍是 `true`，存量版式零改动。同时导出 `RadarChartProps` 类型。

  **Banner 长文案撑破容器、把 action 挤出屏幕**

  文案节点写的是 `<span className="truncate">`，而 `truncate` 里的 `overflow:hidden` 与 `text-overflow:ellipsis` **对 inline 元素不生效**，只剩 `white-space:nowrap` —— 文字既不换行又不被裁剪，于是横向撑破 flex 容器，把 `action` 按钮顶出可视区（窄屏尤其明显）。加 `block` 后省略号才真正生效。凡是 Banner 配长文案的地方都受此影响，不限于移动端。

  **SearchForm 在窄屏挤成一团**

  `gridTemplateColumns` 写死在 inline style 里且没有断点，390px 的手机上仍按 `columns`（默认 3）分列，每列约 120px，「标签 + 控件」压进去后字段与操作区互相叠在一起。inline style 优先级还压过工具类，消费方自己也覆盖不掉。

  改为列数走 CSS 变量、`sm` 以下强制单列。子项的 `colSpan` 一并压成 `col-auto` —— 单列网格里 `span 2` 不会被夹到 1，而是创建隐式列，反而更溢出。桌面表现不变。

  **MathText 关系符两侧留白不对称**

  `A \Rightarrow B` 渲染成 `A ⇒B`：命令名后的空格作为终止符被吃掉，左侧文本空格却保留。修法不是保留原文空格（那样间距取决于作者打没打空格），而是按 TeX 的符号类别在渲染层给对称留白 —— 新增 op 节点，分 `relation`（= ≠ ≤ ⇒ ∈ ⊥ …）与 `binary`（× ÷ ± ∪ …）两档，前缀记号（∠ △ ⊙ ∴ …）仍紧贴其修饰对象，`∠ABC` 不会被拆开。类别按**字符**登记而非命令名，`\neq` 与上游 OCR 直接给的 `≠` 同等对待。`±`/`∓` 的一元用法（`±3`、`(±3)`）会降级成紧贴。

  **MathText `^\circ` / `_\alpha` 整条路径不被解析**

  `^` 与 `_` 的单 token 简写此前只认单个字符，不认命令：`90^\circ` 原样输出 `90^\circ`，而 `90^{\circ}` 正常。`90^\circ` 是 LaTeX 写度数最常见的形式（少打两个花括号），`\circ` 在初中题面频次统计里排第三 —— 题面上直接露出原始记号，正是本组件要消灭的东西。现在 `90^\circ` → `90°`、`x^\alpha b` 的上标只吃 `\alpha`（`b` 仍是正文），不认识的命令照旧原样保留不吞内容（`x^\oiint`）。

  **⚠️ `mathToPlain` 的输出有变化**

  关系符两侧的空格现在统一被归一化掉，与既有的紧凑口径对齐：

  ```
  mathToPlain("A = B")            // 旧 "A = B"    → 新 "A=B"
  mathToPlain("3 \\times 4 = 12") // 旧 "3 ×4 = 12" → 新 "3×4=12"
  ```

  旧行为里 `\times` 左有空格右没有，本身就是不对称的；而 `mathToPlain("x\\neq 0")` → `"x≠0"` 这条紧凑口径一直如此。若下游拿 `mathToPlain` 的输出做全文检索或文本比对，需要同步。DOM 渲染的留白只发生在渲染层，不进朴素文本。

  **ButtonGroup 文档补一条成员等高的坑**

  连排靠 `-ml-px` 把相邻边框叠在一起，这个拼接假定成员等高。而 Button 的尺寸档里 `icon`（36px）**没有等高的文字档**（文字档是 `sm` 32 / `md` 40 / `lg` 48），所以 `size="icon"` 与任何带文字的按钮混排都会错位 —— 典型是 `−/数值/+` 步进器。要混排就用等高的一对：`iconSm`(32) 配 `sm`(32)。这一条看代码发现不了，三个按钮读起来很整齐，只有渲染出来才看得见中间那个高 4px。

## 0.22.0

### Minor Changes

- a6249c8: MathText 补齐高中学段记号：向量箭头、黑板粗体数集、集合/逻辑符号、LaTeX 转义字符

  上一轮符号表是按 22k 字符的**初中**题面频次建的，方法没问题，样本口径偏窄。消费方拿 1324 道题（题干 + 解析，含小学到高中）重做了一遍统计，向量与集合/逻辑记号是高中的主力，初中样本里几乎不出现 —— 于是它们全落在表外，在页面上直接显示成反斜杠原文。

  **向量箭头 `\vec` / `\overrightarrow`** — [#83](https://github.com/hulianui/hulian/issues/83)

  这两个合计出现 282 次，在整张频次表里排第 3，比已经支持的 `\overline`（5 次）高 56 倍。此前 `DECORATE_COMMANDS` 只有 `overline` 与 `hat` 两档，取不到值就按字面输出（这一步本身是对的，符合「不认识的记号不吞掉」），只是这两个应该被认识。

  新增 `arrow` 一档。**箭头宽度跟随内容**：杆是可拉伸的 border，箭头尖是不变形的 SVG，所以 `\vec{a}` 是短箭头、`\overrightarrow{AB}` 自动盖住两个字母。TeX 里 `\vec` 是定宽短箭头、`\overrightarrow` 才满宽，这个差异被有意抹平 —— 题面场景下两个记号都指向量，宽度不携带信息，而自适应能让 `\vec{AB}` 这种写法也盖得住。箭头是绝对定位的覆盖层，**不撑高行盒**，与分数一样不会打乱中文正文的行距。

  ```tsx
  <MathText>{"已知 \\overrightarrow{AB} 与 \\vec{a} 共线"}</MathText>
  ```

  **`\mathbb{}` 映射黑板粗体，不是剥壳** — [#84](https://github.com/hulianui/hulian/issues/84)

  `\mathbb{R}` → ℝ，26 个大写字母全覆盖（C/H/N/P/Q/R/Z 用 BMP 的字母式符号，其余落 SMP 数学字母区）。刻意不做成「剥掉外壳留下裸字母」：题面里实数集 ℝ 与变量 `R` 是两个东西，剥成同一个字母后「定义域为 ℝ」读起来就像「定义域为 R」，而且没人看得出信息已经丢了。参数里认不出的字符逐个原样保留，`\mathbb{R+}` → `ℝ+`，不会因为一个 `+` 就整体放弃。

  **LaTeX 转义字符 `\{` `\}` `\%` `\$` `\&` `\#` `\_`**

  集合构建式 `\{x \mid x>0\}` 里的花括号此前会连着反斜杠一起显示出来 —— `\mid` 补了表也没用，因为两侧还露着 `\{` `\}`。与符号表不同，转义字符是一个**有限闭集合**而非长尾，所以整套补齐、不按频次裁。

  **其余按实测频次补入的命令**

  `\Leftrightarrow ⇔`（充要条件，10 次）·`\to →`（极限，4 次）·`\mid ∣`（集合构建式，4 次）·`\backsim ∽`·`\varphi φ`·`\Gamma Γ`·`\langle ⟨` `\rangle ⟩`（内积）·`\forall ∀`·`\frown ⌢`。

  另新增两个取参数的命令：`\underline{}` 给已有内容加下划线（与填空槽是两回事，后者是空位）；`\overset{}{}` 把上方记号叠在内容上，`\overset{\frown}{AB}` 即弧 AB —— 这是弧的规范写法，`\frown{AB}` 在 LaTeX 里是「弧符号紧跟一个分组」，本组件仍按字面渲染成 `⌢{AB}`，看着不对正是设计意图，好过猜一个上游没表达的意思。

  `\overset` 的上方记号在 `mathToPlain` 里会被**保留**（`⌢AB`），这一点与 `\overline` / `\vec` 不同：后者是纯样式线，没有对应字符；前者的上方是有语义的内容，检索时丢掉就少了东西。

  **报告里有三条不成立，这里说明一下**

  `\Rightarrow`（52 次）、`\mathbf{}`（8 次）、`\quad`（8 次）**在 0.20.0 里就已经支持**，逐个实测过。另外报告提到「剥 `\mathbf{}` 外壳要小心命令边界，`\cdot\mathbf{b}` 直接剥会变成不存在的 `\cdotb`」—— 这个坑在本组件里不存在：解析器是从左到右逐命令消费的，不是字符串替换，`\cdot` 在遇到 `\mathbf` 之前就已经被消费成 `·` 了。那是消费方在自己的入库归一化里做字符串替换才会踩的坑。

  **顺带修掉的一处性能问题：`MathText` 现在是 `memo` 的**

  `MathText` 每次渲染都要把整条题面重新 `parseMath` 一遍，而它此前不是 memo 的 —— 父级任何一次无关更新（题库页面上通常是筛选、分页、选中态这类），一屏几十个实例就会全部重新解析一遍。性能扫描在「父组件更新但 props 不变」这一步实测到 3 次可避免的重渲染，加 memo 后归零。props 全是原始值（`children` 是字符串），浅比较就够；`locale` 走 context，语言切换仍会正常更新。同库的 `Markdown` 早就是这么做的，这次只是把 `MathText` 补齐。

  **顺带修掉的一处文档缺陷**

  `MathText` 与 `QuestionCard` 的中文文档把「禁忌 / 坑」章节的标题写成了「坑」，而 conventions 生成器认的是前者。结果是这两个组件的中文注意事项**从来没进过 `conventions.json`** —— 英文侧一直是全的，中文侧是 0 条，通过 MCP 查约定的中文用户看不到它们。标题已统一（其余 369 个组件本来就是对的）。

## 0.21.0

### Minor Changes

- 61b47ea: 三件「照文档写就是错的」：Navbar 居中段真的居中、极坐标图例可关、TreeSelect 选得到中间层

  三个 issue 的共同点是**没有报错**：写法照着文档，结果不对，肉眼容易当成自己写错了。

  **Navbar：`NavbarBrand` 默认可伸长（默认行为变更）** — [#81](https://github.com/hulianui/hulian/issues/81)

  `NavbarContent justify="center"` 此前并不在导航栏中心。根因是三段伸缩性不对称：`NavbarBrand` 是 `shrink-0`，两个 `NavbarContent` 各 `flex-1` 平分**剩余**空间，于是居中段只居中在「自己那一格」里，整体随品牌名长度左偏（1440 宽、100px 品牌名实测偏左 265px；品牌名越长偏得越多，同一份代码在不同租户站点上偏移还不一样）。

  `NavbarBrand` 改为默认 `flex-1 basis-0`，三段等分。品牌内容仍靠 `justify-start` 贴左，且 flex 项默认 `min-width: auto` 不会被压小，**brand 段与 end 段的视觉不变**，变的只有中段真的落到了中心。

  有一种版式会因此改变：**品牌 + 一段紧贴品牌的 `justify="start"` 内容**（没有居中段）。等分后那段内容会被推到 1/3 处。这种版式传 `grow={false}` 回到旧行为：

  ```tsx
  <Navbar>
    <NavbarBrand grow={false}>瑚琏</NavbarBrand>
    <NavbarContent justify="start">…</NavbarContent> {/* 仍紧贴品牌 */}
  </Navbar>
  ```

  品牌区要在窄屏截断时，除 `truncate` 外仍需自行加 `min-w-0`（解开 flex 项的 `min-width: auto`），这点没变。

  **Chart：`RadarChart` / `PieChart` / `RadialChart` 补 `legend`，六件全部补 `legendScroll`** — [#80](https://github.com/hulianui/hulian/issues/80)

  0.19.0 给 Area/Bar/Line 补了 `legend` 后，极坐标三件没跟上：它们的 `<Legend>` 写死在图内，消费方**既关不掉也挪不动**，自绘就变成两份图例并排（`legendStyle` 是内部常量，`className` 只到外层 `div`）。28 条序列时图例铺满 5 行，吃掉 `height={320}` 的一半有余，雷达盘被压扁、图例文字盖住角轴标签。

  现在三件都吃 `legend?: boolean | "top" | "bottom"`，签名与笛卡尔三件一致。**默认 `true`**（它们历来自带图例），既有调用零改动；`legend={false}` 关掉。注意这是库内唯一一处默认值按图种分档的 prop：笛卡尔三件默认 `false`、极坐标三件默认 `true`。

  代价说清楚：这三件的图例不再是 recharts 的 `<Legend>`，而是与其它三件同一套自绘图例（`Dot` 色点 + token 字号），**色块从方形变圆点、间距字号略有差异**；同时它不再参与 recharts 的内部高度分配，改由 `height` 精确让出一行。色点颜色与扇区/序列走同一条解析路径，不会对不上。

  另补 `legendScroll`（六件通用，默认 `false`）：图例恒为单行 + 横向滚动，对齐 echarts 的 `legend.type: "scroll"`。序列多到换行时，「把 `height` 调大」并不成立——28 条序列的图例是 5 行，要把雷达盘撑回可读尺寸得把总高翻倍。开了它图例永远只占一行（让出 32px 给常显细滚动条），画布拿走其余全部：

  ```tsx
  {
    /* 关掉自带图例，自己画 */
  }
  <RadarChart legend={false} data={data} series={series} xKey="indicator" height={320} />;

  {
    /* 28 条序列：图例单行横滚，不吃画布 */
  }
  <RadarChart legendScroll data={data} series={series28} xKey="indicator" height={320} />;
  ```

  超出部分要横滑才看得到——序列多到几十条时这是取舍，不是免费的。

  **TreeSelect：透传 `expandTrigger`，单选可以选到中间层** — [#78](https://github.com/hulianui/hulian/issues/78)

  单选 `TreeSelect` 此前**只有叶子节点选得中**：内部 `Tree` 的 `expandTrigger` 默认 `"row"`，有子节点的行点了只展开就 return，走不到 `setSelected`，`onChange` 永远不触发，点几次都选不中，而这个能力没有开放给消费方。

  `TreeSelect` 现在透传 `expandTrigger?: "row" | "icon"`，默认仍是 `"row"`（既有行为不变）。要「选到中间层」——选到某个部门、某个大类、某一册教材——传 `"icon"`：箭头管展开、行的其余部分管选中，与多选态「勾选框管选、行管展开」在心智上对称。

  ```tsx
  <TreeSelect nodes={NODES} expandTrigger="icon" value={v} onChange={setV} placeholder="选择章节" />
  ```

  多选（`checkable`）不受影响：勾选框是独立命中区。三件的「禁忌 / 坑」都已补上对应说明——这三条此前在文档里全看不出来。

## 0.20.0

### Minor Changes

- 0d9fb08: 运行时性能首轮：Combobox 大集合虚拟化 + 19 个组件跳过无谓重渲染

  新建的内部扫描器（`packages/hulian-scan`，private 不发布）用 react-scan + Playwright 把全部 372 个公开组件场景跑了一遍 React Profiler，首轮拿到 125 条硬 finding（55 avoidable-render、41 cascade-fanout、16 long-task、13 dropped-frames）。本次发版是把其中**在 packed 消费态下仍可复现**的那部分修掉，每项都在 workspace 与仓库外 tarball 两种环境复测过。

  **Combobox / Select / RemoteSelect：大集合自动虚拟化（默认行为变更）**

  `items` 给到 100 项及以上时列表自动虚拟化，只渲染视口内的项（`@tanstack/react-virtual`，已是既有依赖，不新增包体）。千项候选的展开从「一次挂载上千个 `<li>`」变成「挂载二三十个」。`Select` 的 `searchable` 皮肤与 `RemoteSelect` 的候选列表走同一条路径，同样自动生效——RemoteSelect 是远程分页累积，翻够页数后会切过去。

  代价要说清楚：**行高按 32px 固定估算，不做逐项测量**。默认 `ComboboxItem` / `SelectItem` 恰好是 32px，所以绝大多数用法无感；但如果你的选项是两行文案、带头像、或用 `className` 改了 padding/字号，那么在 ≥100 项时滚动条长度与项的落位会逐渐偏移——**不报错，短列表也复现不出来**，只有滚到列表中后段才看得出跳动。三个组件因此都补了 `virtualized` 逃生口，这种选项显式传 `virtualized={false}` 即可回到全量渲染：

  ```tsx
  {/* 单行项 → 什么都不用改，≥100 项自动虚拟化 */}
  <Combobox items={CITIES}>…</Combobox>

  {/* renderOption 渲染「姓名 + 邮箱」两行 → 行高 ≠ 32px，关掉 */}
  <RemoteSelect fetcher={searchUsers} virtualized={false} renderOption={…} />
  ```

  依赖「选项全在 DOM 里」的测试同理：虚拟化后 `getAllByRole("option")` 只拿得到视口内那几条，断言总数改用列表容器上的 `data-hulian-virtual-count`，或对该用例传 `virtualized={false}`。

  **19 个组件跳过稳定 props 的重渲染**

  Button、Calendar、Cascader、Checkbox、CodeDiff、CodeReviewThread、ColorSwatchPicker、ContributionGraph、CountrySelect、DatePicker、DateTimePicker、Gantt、Glimpse、Markdown、PricingTable、QRCode、Scheduler、TimePicker、TreeSelect 接了 `memo`。判据是扫描证据而非手感：只有当浅比较能安全跳过时才加，函数/ReactNode/可变对象 props 的组件单独看证据，没有批量塞自定义深比较。对外行为与 DOM 不变。

  **其余定点优化**

  - `Select`：`searchable` 皮肤下按 value 找候选从每项 `find()` 线性扫改为 Map 查表，选项多时 trigger 与列表的每次渲染都少一轮 O(n)。
  - `CircularGallery`：削掉每帧重复的几何计算与纹理编码。
  - `GhostCursor`：降低 shader 每帧开销。
  - React 18 兼容回填：`SelectTriggerProps` 改用 `ComponentPropsWithoutRef` + 显式 `ref`，`SwipeAction` 的 ref 写法同步调整——两处此前只在 React 19 的类型下成立。

- 组件内置文案全面接入 ConfigProvider locale <!-- parity-id: ui-0.20.0-runtime-locale -->

  `ConfigProvider` 的 `locale` 与 `enUS` 字典此前就在，但只有一部分组件真的读它——余下的把中文写死在组件里。接了 `<ConfigProvider locale={enUS}>` 的英文项目因此会看到一半英文一半中文，而且没有任何报错提示哪些组件没跟上。

  这批把 130 个组件的内置文案（按钮标签、空态、占位、aria-label、日期与星期格式、单位与分隔符等）接进 locale 字典，字典本身扩了 1688 行。除了整体翻译，几处按语言而非按字符串处理的差异也一并做了：Scheduler 的星期与日期区间按 locale 格式化（`Jun 1 – Jun 7` / `6月1日 – 6月7日`），CountrySelect 的国家名与副标题由 locale 决定取中文还是英文。

  对既有项目**没有行为变化**：不传 `locale` 时全部沿用原中文，缺失字典段落时逐条回退到组件内置中文（老版本的部分字典也不会因为缺 key 而崩）。要英文只需：

  ```tsx
  import { ConfigProvider, enUS } from "@hulianui/ui";

  <ConfigProvider locale={enUS}>{children}</ConfigProvider>;
  ```

  文档站同步产出英文版：376 个组件各配一份 `.en.md`（随包发布，MCP 的 `get_component_doc` 会读到），区块与页面示例、changelog、llms.txt / registry.json 等 AI 分发产物也都出了英文版。

## 0.19.1

### Patch Changes

- 67038ed: `nav-menu.md`：消歧 `semantics` 那条坑位，并补一个站点主导航示例（closes #76）

  0.19.0 加 `semantics` 时（#69），props 表写的是「**站点主导航选 `list`**」，而禁忌/坑那条写成了
  「站点主导航留在默认 `tree` 档，读屏用户是真的找不到那些链接」—— 后者本意是**条件警告**（若留在
  tree 就找不到），但中文里「留在」既可以是「保持」，也可以出现在省略了「如果」的条件小句里，
  而这句前面正好是一句祈使（「别随便选」），读者的语感会顺着读成祈使句，于是变成「请留在 tree」，
  与 props 表相反。

  代价不对称：#69 整条 issue 就是围绕「主导航该是 list 还是 tree」，读错就把刚修好的可达性问题
  原样留着，而且**两档皮肤一模一样、不会有任何报错**。所以：

  - 把条件补全（「**如果**留在默认 `tree` 档 → 读屏按『列出页面所有链接』一条都找不到 → 那种场景请显式传 `semantics="list"`」），并点明「看不出选错」这个前提。
  - 示例区此前**没有一个**带 `semantics`，照抄就会退回默认档。现在把「站点主导航」作为第一个示例（带 `semantics="list"` + `render` 接路由），并给原来的会话列表示例注明它为什么不需要（命令式选择、行是 `<button>`，不是链接导航；若会话项是真链接则同样要传）。

  改的是随包发布的组件文档（`src/**/*.md` 在 npm 包内，MCP 的 `get_component_doc` 本地模式直接读它），
  所以发 patch 让消费方的 agent 也拿到修正后的文案。组件实现未改动。

## 0.19.0

### Minor Changes

- 126ace2: 新增 AuthPanel，六处逃生口清掉消费方缺口（closes #67 #69 #70 #71 #72 #73）

  两个下游（hulian-admin 的分屏登录/注册页、cairn 的试卷标注）一次报来六条，共同点是**查完文档后仍绕不过去**：分屏认证页的渐变面板只能裸 `<div>` + inline style，后台登录页的字段外观只能 `className` 覆盖，主导航为了保住 link 语义只能手写 `<Link>` 行，图例色点只能裸 `<span>`，框选坐标只能在调用处包一层 floor/ceil——全是 conventions 明令禁止的「业务侧打补丁」。这批把它们收回库内。

  **新组件**

  - `AuthPanel`：分屏登录/注册/找回密码页左侧那块宣传面板（渐变底 + 品牌 + 标语 + 卖点 + 底部区）。它存在的理由不是省几行 flex，而是**渐变此前没有正经的表达方式**——Tailwind 工具类给不出 `radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, …), …)` 这种带 token 混色的写法，而 guard 的 `no-style-override` 是 error 级，两条一撞只剩裸 `<div>` + inline style 一条路（官方 `signup` block 自己就是这么写的，本次已换掉）。四档配方 `radial` / `linear` / `mesh` / `none` 都以 `--color-bg` 打底做 `color-mix`，**暗色自动跟随，不必另写一套**；`color` 走 `resolveTone`，与 `Brand.color` / `Dot.color` / `ChartSeries.color` 同一条路径（#71）。

    ```tsx
    <div className="grid min-h-dvh xl:grid-cols-2">
      <AuthPanel
        brand={<Brand name="瀚云" />}
        title="把想法送上全球边缘"
        highlights={["免费开始", "从 git push 到全球边缘上线"]}
        className="hidden xl:flex"
      />
      <div className="grid place-items-center p-8">
        <LoginForm surface={false} /> {/* 左面板已承担视觉重量，右边再套卡就是卡中卡 */}
      </div>
    </div>
    ```

  **能力增强**

  - `LoginForm` 补 `fields` 与 `surface`：前者是两个主字段的**外观槽**（`label` / `placeholder` / `prefix` / `suffix` / `description` / `autoComplete`），只覆盖外观，取值与校验仍由模板托管，所以换 label 不会把浏览器的账号/密码自动填充弄丢；后者关掉自带卡面时把边框 / 底色 / 阴影 / **内距**四件一起关——只关三件会逼消费方再写 `xl:p-0` 补最后一刀，等于没关（#70）。
  - `NavMenu` 补 `semantics?: "tree" | "list"`（默认 `tree`，既有消费方零改动）。`#59` 的 `render` 逃生口虽然渲出了真 `<a>`，但行上的 `role="treeitem"` 会压过它的隐式 link role：中键新标签页 / 右键复制链接回来了，无障碍树里它仍是 treeitem，读屏最常用的「列出页面所有链接」一条主导航都列不出来。`list` 档不写 role（`<a>` 是 link、`<button>` 是 button），选中态改用 `aria-current="page"`，键盘退回「Tab 逐项 + 原生激活」——站点主导航在 ARIA APG 里本就是 list + link，`tree` 留给文件树 / 大纲树（#69）。
  - `Dot` 补 `color?: string`：走 `resolveTone` 接任意色。五档 `tone` 接不住图表序列色（默认取值就是 `chart-1..6`），而图例色点要的正是「跟序列同色」。与 `tone` 同传时 `color` 优先（#73）。
  - `AreaChart` / `BarChart` / `LineChart` 补 `legend?: boolean | "top" | "bottom"`：多序列图不给图例，读者无从知道哪条线是哪条序列。内部复用 `Dot` + `series.label`，色点与序列色同源。`height` 仍是**组件总高**——开图例时画布相应变矮，不会把总高撑高（#73）。
  - `RegionSelect` 补 `errorPlaceholder` / `onError`：底图 404 / 403 / 跨域 / 网络失败时有出口，不再永久停在「载入图片…」。预读此前只挂 `onload` 不挂 `onerror`；现在预读与画布 `<image>` 共用同一失败态（中途鉴权过期只让 SVG 那次请求失败时同样有出口），缓存里的失败结果（`complete` 且 `naturalWidth` 为 0）也进失败态，`src` 变化会复位。后端按需渲染的底图（页图还没推到当前环境、签名 URL 过期、权限不足）这不是边缘情况，是常态（#67）。

  **行为变更**

  - `RegionSelect` 的 `onChange` 现在给**整数**坐标（新增 `round?: "expand" | "nearest" | "none"`，默认 `expand`；另导出纯函数 `roundBox`）。此前给的是浮点，而组件自称的坐标系是「原图像素」——落库（`list[int]` 之类的列约束）、服务端裁图（PIL / OpenCV / sharp 的 crop 都要整数，各自的隐式取整方向还不一致，裁出来差一两像素且没人解释得清）、`box === savedBox` 这种「有没有改过」的判断，三处都吃不下浮点。

    默认选 `expand`（左上 `floor`、右下 `ceil`）而不是 `nearest`：**取整不缩小框**，否则一个刚好拖够 `minSide` 的框会被收成 `minSide - 1`，人明明拖够了却存不上，症状是「拖了没反应」。`minSide` 的判定也相应移到取整之后，与最终出口一致。拖拽预览（`onDrafting`）仍是浮点，视觉更跟手。要亚像素传 `round="none"` 即回到旧行为；已在调用处自己包 floor/ceil 的可以删掉了（#72）。

  **文档**

  两条会**静默失效**、光看代码看不出来的坑写进了对应的 `<slug>.md`：

  - `<Dot style={{ color }} />` 改不动圆点颜色——圆点是背景色，`color` 管的是文字色。那样写编译通过、guard 只报 `no-style-override`、页面上一律灰点，写的人以为生效了。自定义颜色只走 `color` prop。
  - `RegionSelect` 的取整缺陷在 1:1 或整数倍缩放下完全测不出来（坐标本就落在整数上）。自己写测试请用除不尽的比例，库内用的是 756→396。

  `nav-menu.md` 里那句「`render` 让读屏按链接播报」按实现更正为**需配 `semantics="list"`**——消费方正是照着这句话选型的。

## 0.18.0

### Minor Changes

- 新增 8 个组件，修 9 条消费方缺口。 <!-- parity-id: ui-0.18.0-consumer-gaps -->

  **新组件**

  - `ShieldBadge` / `ShieldBadgeGroup`：README 徽章（shields.io 风格的双段贴纸）。纯 CSS 渲染吃主题，不再靠 img.shields.io 远程图片；配纯函数 `compactCount`（1.5k / 3.4M）。
  - `AwardBadge`：桂冠奖章（GitHub Trending / Product Hunt 那类荣誉牌）。桂冠由 `laurelLeaves` / `laurelStemPath` 纯函数算出，吃 currentColor、缩放不糊、零图片请求。
  - `ContributionGraph`：贡献活动墙。calendar 周列 × 星期行 / strip 单行活动条，日期算术抽成 `buildContributionCalendar` 纯函数，色阶复用 Heatmap 的 bucketize。
  - `Legend`：独立图例。recharts 的 Legend 出不了图外，自绘图形（Sparkline / Heatmap / 贡献墙 / 地图）此前只能各自手搓彩点；缺省色按序取 chart-1..6，与 Chart 同套 token。
  - `AppLauncher`：应用启动台（macOS Launchpad 形态）。搜索与分类各自可受控，`keywords` 支持拼音别名，方向键在网格漫游焦点，筛选分节是纯函数。
  - `RegionSelect`：在图上拖框选一块区域、拿回**原图像素坐标**（区别 ImageCropper 出 Blob）。坐标系零换算、自然尺寸自量、touch-none、描边按图宽（#54）。
  - `Brand`：品牌标识（方角徽章 + 站点名）。Avatar 是圆的顶不了；`render` 可接框架路由件（#57）。
  - `Tilt`：通用视差倾斜包裹器（对标 react-parallax-tilt）。指针/陀螺仪/手动角度三种驱动 + glare 反光，零依赖、吃瑚琏动效曲线、默认尊重 reduced-motion。

  **能力增强**

  - `QRCode`：补 `minVersion`（钉住版本下限让一组码密度一致）、`boostLevel`（不升版本白拿更高纠错）、`logo.excavate` / `logo.opacity`（水印式 logo），并新增 `qrCodeSvgString()` / `qrCodeToPngDataUrl()` 两个导出函数（服务端出 SVG / 浏览器出 PNG，按 DPR 放大、默认白底）。
  - 布局原语 `Stack` / `Container` / `Grid` / `GridItem` / `Heading` / `Text` / `Prose` / `SafeArea` / `StreamingText` 改成**泛型多态**：`as="form"` 后 `onSubmit` 能拿到 `FormEvent<HTMLFormElement>`（#62）。
  - `Grid` 的 `cols` 与 `Stack` 的 `direction` 响应式档位补 `xl` / `2xl`，与 Tailwind 断点表对齐（#61）。
  - `Container` 的 `size` 补 `2xl`(max-w-6xl) / `3xl`(max-w-7xl)；居中与内距解耦成 `centered` 与 `padded`（#58）。
  - `NavMenuItem` 补 `render` 逃生口：既保住 `<a>` 语义又能走客户端路由（#59）。
  - `DrawerContent` 默认渲染右上角关闭按钮，配 `showClose` / `closeLabel`；locale 补 `drawer.close`（#63）。
  - `LoginForm` 补 `rememberLabel` / `rememberDescription`：「记住我」并不总是体验糖，有时是刷新令牌开关（#64）。

  **修复**

  - `Image`：消费方传的 `onLoad` / `onError` 与内部的**合并**而不是被顶掉——此前一传 `onLoad` 图片就永久停在 `opacity-0`；同时补 `forwardRef` 到内层 `<img>`（#55）。
  - `List`：`aria-label` / `aria-labelledby` / `aria-describedby` 透到 `role="list"` 的节点上，读屏不再听到无名列表（#60）。
  - 清掉 55 处引用**未定义色 token** 的工具类（`text-muted-foreground` / `bg-background` / `bg-card` 等）——Tailwind 对未定义 token 不报错也不生成规则，元素静默继承父级颜色，「次要文字」渲染成正文同色。
  - 三个源文件里的裸控制字节（用作 join 分隔符的 U+0000 / U+0001 被写成真字节），此前让 `file` 判定为 binary、grep 与 git diff 双双失灵。

  **行为变更**

  - `Container` 的 `padded={false}` 此前会连居中一起关掉，现在只关左右内距；要两者都关请同时传 `centered={false}`。

## 0.17.0

### Minor Changes

- b02bc6f: LoginForm 补三个逃生口 + 新增 ClickCaptcha 点选人机验证（closes #50 #51）

  一个 BuildAdmin 系后台的两个登录页**查完文档后仍绕开 `LoginForm` 各自手写表单**——不是没查，是它接不住：校验只有必填、外部拿不到字段实时值、没有验证码位。以它为核心的 `page-login` / `block-login` 推荐链因此整条断掉（装了也得拆）。这批补上缺口，模板不再是"只能做 demo"。

  **LoginForm 三个口子**（都向后兼容，不传行为与之前完全一致）：

  ```tsx
  <LoginForm
    // 1. 字段级校验：沿用 useForm 的 FormRule[] 形状，内置必填始终先跑
    rules={{
      username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "账号格式不正确" }],
      password: [{ min: 6, max: 32, message: "密码 6~32 位" }],
    }}
    // 2. 受控逃生口：外部持有实时值（受控回写不会二次触发 onValuesChange，不会循环）
    values={values}
    onValuesChange={(_changed, all) => setValues(all)}
    // 3. 提交前异步拦截 + 表单内插槽：验证码链路终于能挂进来
    extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
    beforeSubmit={async () => {
      if (points.length < 3) return false; // 返回 false / 抛错即中止提交
      ticket.current = await api.verifyCaptcha(captcha.id, points);
    }}
    onFinish={({ username, password }) => api.login(username, password, ticket.current)}
  />
  ```

  `beforeSubmit` 执行期间提交按钮保持 loading，弹验证码这类异步步骤不必自己再管 loading。

  **新增 `ClickCaptcha`**：点选式人机验证的**纯 UI 层**——给定背景图与提示图，采集点击序列并回传**相对坐标（x/y ∈ [0,1]）**。

  有意不做的事：不发请求、不认协议。`captchaId` 语义、`captchaInfo` 编码、接口路径各家后端不同（BuildAdmin / 极验 / 防水墙），进库就是 API 债。你在 `onComplete` 里编码成自家协议串再发请求，按结果把 `status` 置 `success` / `failed`。

  组件吃掉的正是自建时最占篇幅、最容易做错的部分：坐标换算（相对值，容器缩放 / 响应式 / 高 DPI 都不错位）、序号标记与撤销、换一张、失败抖动并清空、加载遮罩、图片加载失败兜底，以及**键盘可达**（区域可聚焦，方向键移准星、Enter/Space 落点、Backspace 撤销）。抖动走 `motion-safe:`，`prefers-reduced-motion` 下不抖，失败仍有 `aria-live` 文案播报。

  滑块拼图式（SliderCaptcha）本批不做——同一「纯 UI 层」原则，需要时单独提。

  配套：`@hulianui/tokens` 新增关键帧 `hulian-captcha-shake`；`@hulianui/mcp` 搜索词表补「验证码 / 人机验证 / 点选」→ `click-captcha`（此前搜这些词只会命中 InputOTP / Slider，正是 #51 的起点）。

## 0.16.0

### Minor Changes

- 679de2b: Command 新增 `onQueryChange` —— 让消费方能自己排序、分组、写空态

  搜索词此前是 `Command` 的纯内部状态，外部读不到。于是任何「按相关度重排、按类型分组、把命中数写进空态、给一条带 `?q=` 的『查看全部结果』链接」的需求都做不了，只能退回默认的子串过滤 + 静态 `groups`。

  现在 `onQueryChange` 会在搜索词变化时（含**每次打开面板的清空**）播出当前值，配合 `filter={() => true}` 即可把过滤权完全交给消费方：

  ```tsx
  const [query, setQuery] = useState("");
  const groups = useMemo(() => buildGroups(mySearch(query)), [query]);

  <Command
    open={open}
    onOpenChange={setOpen}
    groups={groups}
    filter={() => true}
    onQueryChange={setQuery}
  />;
  ```

  向后兼容：不传该 prop 时行为与之前完全一致（默认子串过滤照常）。回调走内部 ref，不会因消费方每次渲染新建箭头函数而触发额外副作用。

  这是文档站全站搜索（closes #40 的搜索部分）dogfood 时撞出来的库缺口。

## 0.15.1

### Patch Changes

- 4e0f452: 修正两处让公开子路径入口用不了的问题（#35 / #36 P0-2）

  **`@hulianui/ui/vitest-preset` 补类型声明**

  `docs/consuming.md` §1 推荐的这条入口在包里没有对应 `.d.ts`，`strict` 的 TS 消费方
  按文档写就会 `TS7016: Could not find a declaration file`，而 `vitest.config.ts` 通常
  落在 tsconfig 的 `include` 里，等于直接卡住消费方的 typecheck 门禁。

  新增 `vitest-preset.d.ts`（`withHulian` / `hulianDedupe` / `hulianConditions` /
  `hulianMainFields` / `hulianInlineDeps`），并给 exports 补 `types`，与同为工具入口的
  `./vite` 对齐。`withHulian` 用泛型透传入参类型，消费方自己的字段在 `defineConfig`
  里不会被抹成宽泛的 `UserConfig`。

  **guard / conventions 不再错禁公开子路径**

  `no-private-deep-import` 的 pattern 是 `^@hulianui/ui/`，把**所有**子路径一律判 error，
  于是这些全成了违规：

  ```ts
  import { Button } from "@hulianui/ui/button"; // consuming.md §3 明确推荐
  import { withHulian } from "@hulianui/ui/vitest-preset"; // 库自己的官方集成入口
  import { hulian } from "@hulianui/ui/vite";
  ```

  门禁与文档、与 package.json exports 三方打架。现在改成以 exports 为真源：显式条目加
  `./*` 能解析到的目录（有 `index.ts` 的）全部放行，只拦真正解析不出来的——库内部路径
  （`_icons`、`src/...`）与 0.15.0 随 MUI 一起移除的 `date-pickers`。放行名单在生成
  conventions 时从真实目录算出，不需要人工维护。

## 0.15.0

### Minor Changes

- 48c9f9a: 新增 Annotation 手写风格标注

  **Annotation（新增 · data-display/info）**

  给一段行内内容画上荧光笔底色 + 手绘箭头 + 手写小标签，用来在文档、演示、组件解剖图里就地讲解「这一块是什么」。与 Callout 互补：Callout 是打断正文的块级提示框，Annotation 是不占布局位置的旁注。

  `side` 说的是**标签在哪**（与 Tooltip / Popover 同义），箭头自动从标签指回目标。八个方位共用两条定位规则 —— 箭头的头端贴目标、标签接在箭头尾端外侧 —— 所以换方位不需要各自调偏移量，几何算在 `annotationGeometry` 纯函数里。

  与同类的纯 CSS 方案相比有三处不同：标签是**真实 DOM 节点**而非 `::after` + `content: attr()`，因此能放 ReactNode（内嵌 Code、链接）且读屏能读到；箭头是**真实 SVG 元素**而非 `mask: url(data:...)`，直接吃颜色变量、省掉一层遮罩合成；配色走语义 token，暗色下荧光笔自动提亮，且只染标注自身 —— 被标注的正文保持原色。

  荧光笔底色向左右外扩模仿马克笔涂过头，量走 `--hl-ann-spread`（默认 `0.3em`）。同一行里几条标注紧挨着时底色会连成一片，`className="[--hl-ann-spread:0.1em]"` 即可收窄。

  **tokens：新增 `--hl-annotation-font` 手写字体栈 + `--hl-ann-hue` 注册属性**

  字体栈刻意很短，只列经实测确认默认可用的：macOS 走翩翩体、Windows 走楷体。原因是 macOS 把「手札体 / 行楷 / 报隶 / 魏碑」这类字体登记为**可下载字体** —— 字体名在系统里注册着但字形默认不在本地，浏览器的逐字符回落会在这种名字上停住（认为已命中）却拿不到字形，画成默认黑体，于是把排在后面、真正装了的字体永远挡在门外。往这个栈里「多加几个备选」会让效果变差而不是变好。

  `@property --hl-ann-hue` 让色相可插值，供 `tone="rainbow"` 循环换色；`inherits: true` 是必须的 —— 箭头与标签是宿主的子元素，靠继承拿到动画中的色相。

- 7e1b107: **BREAKING**：日期族全部自研为零依赖，MUI 与 emotion 整族切除

  `src/_mui/` 目录不复存在。`@mui/material`、`@mui/x-date-pickers`、`@emotion/react`、`@emotion/styled`
  四个包已从 `dependencies` / `peerDependencies` / `peerDependenciesMeta` 全部移除，
  `@hulianui/ui/date-pickers` 子路径入口移除，`MuiBridgeProvider` 移除。

  **装 `@hulianui/ui` 现在没有 optional peer、没有子路径入口、没有必须挂的第三方 Provider。**

  ### 新增（自研零依赖）

  - **`Calendar`** —— 常驻日历面板，日/月/年三层下钻，不带触发器与浮层
  - **`DateTimePicker`** —— 左日历 + 右时/分/秒列一体弹层，边界只在压着 min/max 那天生效
  - **`TimeField`** —— 分段键盘输入（时/分/秒各一段 `role="spinbutton"`）：`↑↓` 调值、`←→` 切段、
    数字键两位缓冲覆写并自动跳段、`Backspace` 清段

  ### 改名

  - **`DateField` → `DatePicker`**。库内命名统一为 `DatePicker` / `TimePicker` / `DateRangePicker`，
    与行业惯例一致。`DatePicker` 这个名字此前指向 MUI 桥接件，现在指向这个自研实现。
  - 随之移除导出类型 `DateFieldPicker`，粒度类型统一用 `CalendarPicker`。

  ### 迁移

  | 之前                                                                        | 现在                                                               |
  | --------------------------------------------------------------------------- | ------------------------------------------------------------------ |
  | `import { X } from "@hulianui/ui/date-pickers"`                             | `import { X } from "@hulianui/ui"`                                 |
  | `pnpm add @mui/material @mui/x-date-pickers @emotion/react @emotion/styled` | 不需要，可以卸掉                                                   |
  | `<MuiBridgeProvider>` 包裹                                                  | 删掉                                                               |
  | `DateField`                                                                 | `DatePicker`                                                       |
  | 值是完整 ISO 时间戳                                                         | 定宽字符串：`"YYYY-MM-DD"` / `"HH:mm[:ss]"` / `"YYYY-MM-DD HH:mm"` |
  | `DatePicker` 的 `views` / `openTo`                                          | `picker="date" \| "month" \| "year"`                               |
  | `DatePicker` / `TimeField` 的 `label`                                       | `placeholder` + `aria-label`（不带浮动 label）                     |
  | `DateTimePicker` 的 `minutesStep`                                           | `minuteStep`（与 `TimePicker` 对齐）                               |
  | `DateTimePicker` 的 `format`                                                | `displayFormat`（只改显示，不改值）                                |

  值改成定宽字符串是刻意的：字典序即时间序，范围比较可以直接比字符串，
  既不用引 date 库做比较，也不会被时区和 UTC 日界搅进来。

  ### 顺带修复

  `recharts` 3.x 把 `react-is` 声明为 **peerDependency**，而瑚琏既没装也没声明它 ——
  此前一直是靠 MUI 的依赖链蹭到的。MUI 一走，体积门禁当场 `Could not resolve "react-is"`。
  recharts 是我们的 `dependency`，它的 peer 就该由我们兜住，现已补进 `dependencies`：
  在不自动装 peer 的包管理器（如 yarn classic）下，此前用 `Chart` 会直接打包失败。

  ### 真机验证抓到的两个修复

  单测（jsdom）全绿之后，用真实浏览器逐个走了一遍键盘与浮层，抓到两个 jsdom 测不出来的问题：

  - **`TimeField` 的两位缓冲在受控用法下失效**：`applyParts` 只在非受控时记录「刚提交的值」，
    于是受控下父组件回传值会被当成「外部改了值」，连带清空缓冲 —— 输 `3` 再输 `0` 得到 `00` 而不是 `30`。
    全部用 `defaultValue` 的测试碰不到这条路径，已补两条受控回环的回归测试。
  - **时间列的滚动定位每次多滚一格**（`TimePicker` 原有问题，`DateTimePicker` 继承）：
    `el.offsetTop` 的 offsetParent 不是滚动容器而是带列头的外层 div，于是选中项被顶到可视区外。
    滚动容器补 `relative` 后，选中项正好落在列顶。jsdom 无布局、`offsetTop` 恒 0，只有真机看得见。

  ### 门禁

  - 消费方冒烟门禁收敛回单场景，并在消费面里钉死日期族必须能从根 barrel 导入且零额外依赖
  - `scripts/bundle-size.sh` 反向断言升级：`@mui/*` / `@emotion/*` 出现在**任何一类**依赖里即失败
  - 体积基线的 `mui-bridge` 采样点换成 `date-picker`（53.6KB initial）；根 barrel 实测 957.5KB

- ce1c41b: 新增 MathText / QuestionCard，外加 Image 与 Table 两处真 bug 修复

  **MathText（新增 · typography/text）**

  行内数学排版。零依赖解析 LaTeX 子集（分数 / 根号 / 上下标 / 填空槽）并渲染成真数学版式。分数用 `inline-flex` 竖排，不撑乱中文行高。需要可检索的朴素文本时走 `mathToPlain`。RSC 安全。

  **QuestionCard（新增 · data-display/collection）**

  教辅题库的标准展示件：题号 / 题型 / 分层 / 题干 / 选项 / 小问 / 附图 / 章节 / 出处。题干与选项走 MathText 的真数学版式；待复核题亮左侧警示边条，不与正常题混排。dogfood Card / Tag / Chip / Image。

  **fix(image)：命中缓存的图片永久停在 `opacity-0`**

  只靠 `onLoad` 翻转淡入态是不够的 —— 图片命中缓存（或 SSR 出的 HTML 在 hydration 之前就解完码）时，`load` 事件早在 React 挂上处理器之前就烧完了，`onLoad` 永不触发。

  现象极具迷惑性：**网络面板 200、`naturalWidth` 正常，页面上却是一块空白**，很容易被误判成图片本身挂了。改为挂载后经 ref 补查一次 `img.complete && naturalWidth > 0`。

  **fix(table)：表头恒不换行**

  `table-layout: auto` 下列宽会收缩到 `min-content`，中文表头因此被挤成「拆／出／条／目」每行一个字（英文则按空格断开），列宽反而更窄。表头是短标签，`nowrap` 让它成为列的宽度下界，才是正确的度量基准。需要截断的列继续走 `meta.ellipsis` + `maxWidth`，不靠折行省地方。

- 15ef604: **BREAKING**：日期族改走子路径导入，MUI / emotion 降为 optional peerDependency。

  - `Rating` / `Stepper` 重写为零依赖自研，仍从根 barrel 导入，**不再需要** `MuiBridgeProvider`。
  - `Calendar` / `DatePicker` / `DateTimePicker` / `TimeField` / `MuiBridgeProvider` 移出根 barrel，
    改从 `@hulianui/ui/date-pickers` 导入，并需自行安装 `@mui/material` `@mui/x-date-pickers`
    `@emotion/react` `@emotion/styled` 四个 optional peer。

  迁移：

  ```diff
  - import { DatePicker, MuiBridgeProvider } from "@hulianui/ui"
  + import { DatePicker, MuiBridgeProvider } from "@hulianui/ui/date-pickers"
  ```

  为什么：`@emotion` 是 runtime CSS-in-JS（不兼容 RSC），此前是硬依赖 —— 任何人只想用一个
  Button 也会被迫装下整个 MUI + emotion。源码分发下光把它降为 optional peer 还不够：根 barrel
  导出会强制每个消费方的 tsc 去编译 `_mui/*.tsx`，没装 MUI 的项目直接 `TS2307`。所以连同
  barrel 一起移出。

  收益：`dependencies` 27 → 22；root-barrel 体积基线 1250KB → 1098KB（-12.2%）；
  不用日期族的项目彻底不接触 emotion。

- a502b85: 新增 PasswordGenerator 密码生成器（Bitwarden 式双模面板）

  **字符密码 + 密码短语双模**。密码模式给长度（5–128）、四类字符开关、最少数字/符号、排除形近字符；短语模式给词数（3–20）、分隔符、首字母大写、附加数字，词从内置 1747 词的常用短词表里取。参数改了立刻重算，熵值实时评级四档强度条。

  **真正的含金量在算法，不在面板**，所以生成逻辑全部作为纯函数导出，服务端 / 表单校验 / CLI 都能直接调：

  ```ts
  import { generatePassword, generatePassphrase, passwordEntropy, strengthOf } from "@hulianui/ui";
  ```

  三条不可省的安全实现：

  - **随机源只用 `crypto.getRandomValues`**。`Math.random()` 是可预测 PRNG，用它生成的密码等于没生成。环境不支持时组件显示错误提示，**不静默降级**。
  - **拒绝采样消除模偏**。`bytes[i] % pool.length` 这种常见写法会让前几个字符出现概率偏高——熵被悄悄削掉而外观毫无异样。
  - **结果整体洗牌**。否则「前两位必是大写和小写」成了可被利用的位置规律。

  生成函数第二参数是可注入的随机源，测试里传伪随机即可让输出确定可复现。

  文案接入 `ConfigProvider` 的 `locale.passwordGenerator`（内置 zhCN / enUS），亦可用 `labels` prop 逐条覆盖。结果区是 `aria-live` 的 `<output>`，强度条是 `role="meter"` 带 `aria-valuetext`，不靠颜色单独传达强弱。SSR 首帧渲染占位符，不会水合失配。

  配套 70 个测试（47 个算法 + 23 个组件），覆盖拒绝采样、约束满足、洗牌有效性、词库无重复、SSR 占位。

- 720fa91: `react-easy-crop` 升到 6.2.3（ImageCropper 的裁剪引擎）

  走 minor 而不是 patch：它挂在 `dependencies` 而不是 `peerDependencies`，升 major 会改变下游
  装到的传递依赖大版本，不该藏在 patch 里发。

  **API / 坐标语义零变更**。ImageCropper 的源码一行没动，`onCropComplete(area, croppedAreaPixels)`
  的含义、`restrictPosition` 的夹紧规则、出图坐标全部照旧。v6.0.0 的 breaking 是构建产物层面的：
  去掉 UMD build、去掉 `tslib` 运行时依赖（少一个传递依赖）、`exports` map 拆出
  `index.d.mts` / `index.d.ts` 双份类型。

  **两处实际差异**：

  1. **v6.0.1 给媒体元素加了 `max-width: unset`** —— 防全局 `img { max-width: 100% }` 类 reset
     （Tailwind Preflight 正是这种）挤压裁剪媒体。我们默认 `objectFit: "contain"`，
     `.reactEasyCrop_Contain` 的 `max-width: 100%` 优先级更后，所以默认路径行为不变；
     受益的是传 `objectFit: "cover"` 系列的消费方。
  2. **v6.1.0 给 resize 后的回调加了 250ms 防抖**。视觉布局仍是即时重算（实测容器 320→200px
     后裁剪框立刻跟到 143×200，比例仍是 5:7），防抖只推迟 `onCropComplete` 的发射。
     理论上留下一个「resize 后 250ms 内点确认会用到旧几何」的窗口，实操中人手够不到；
     实测 resize 前后各点一次确认，源区域稳定在 571×800（≈5:7），说明防抖后回调正常收敛、
     不会永久停在旧几何。

  **验收**：3302 用例全绿、消费方 typecheck 门禁绿、12 个体积入口全在基线内（root-barrel
  反而因少了 tslib 略降）、www 构建通过。真浏览器实拖实裁自证：滚轮缩放到 3×、拖拽对位、
  确认出图 413×578 JPEG，产物像素与裁剪框内所见一致。

- 20f2f57: 新增 `@hulianui/ui/vite` —— 软链消费时自动修好 dev server

  ```ts
  // vite.config.ts
  import { hulian } from "@hulianui/ui/vite";
  export default defineConfig({ plugins: [react(), hulian()] });
  ```

  **治的病**：Vite **有意跳过 linked 包的依赖预打包**（`link:` / workspace / `file:` 指向目录），
  因为它假定你正在改那个包、需要 HMR。于是源码分发的瑚琏回到逐文件 transform 的老路。
  实测同一页面（引 8 个组件，Vite 7.3.6）：

  | 消费方式              | 浏览器模块请求 | dev server RSS |
  | --------------------- | -------------- | -------------- |
  | `pnpm add`（tarball） | 16             | 43 MB          |
  | **软链**              | **250**        | 83 MB          |
  | 软链 + 本插件         | **13**         | 80 MB          |

  请求数差 15 倍，而这只是 8 个组件的量 —— 真实项目引十几个组件、跨多个页面按同样比例放大，
  就是「dev server 常驻数 GB、HMR 卡到点了没反应」。

  **怎么判断**：插件读自己的 realpath 是否还在 `node_modules` 里 —— pnpm 正常安装会落在
  `.pnpm/@hulianui+ui@x.y.z/...`，软链则落在你的仓库目录。所以**正常安装的项目加了也无害**
  （探测到不是软链就什么都不做，且保持安静），可以直接写进项目模板。

  **代价**：预打包意味着库源码不再有 HMR，改 `packages/ui` 后需重启 dev server；
  正在改库时传 `hulian({ prebundle: false })` 换回来。冷启动那次预打包约 4 秒
  （5204 个模块 → 一个 9.4 MB chunk），之后走缓存。

  **刻意不做的事**：不加 `resolve.dedupe`。实测 Vite dev 会把所有 bare `import "react"` 重写到
  同一份预构建产物，React 不会分裂，加了是噪音。这与 `@hulianui/ui/vitest-preset` 需要 dedupe
  并不矛盾 —— 那边走的是 SSR 转换 + Node 解析，没有浏览器侧预构建统一这一层。两个环境两套配置，
  别互相套用。

  `vite` 以 optional peer 声明（`>=5`），不用 Vite 的消费方不受影响。插件只用 `config` /
  `configResolved` 两个钩子与 `optimizeDeps`，这些在 Vite 5~8 都稳定 —— Vite 8 换 Rolldown 后
  预打包仍在，linked 包仍默认跳过。

### Patch Changes

- ce9b419: 消费方产物瘦身：Button 首屏 -75%，凡用图标的组件均 -3.7 KB

  三处改动，都不动任何 API：

  **`_icons` 补 `/*#__PURE__*/` —— 全库受益**

  67 个内联图标都是 `createIcon(...)` 的调用结果。打包器对顶层函数调用一律保守：无法证明无副作用就整条留下。于是**任何组件只要引一个图标，67 个全进它的 bundle**。Button 只用 `Loader2`，产物里却背着 11.6 KB 的完整图标集。加上 PURE 标注后 Tag 从 13.6 KB 降到 9.9 KB（**-27%**），Table、ProTable、MarkdownEditor、Video 各降约 3.7 KB。

  新增图标时记得连 `/*#__PURE__*/` 一起写，`_icons/index.tsx` 顶部有说明。

  **动画引擎改按需加载 —— Button 40.1 KB → 10.0 KB**

  `LazyMotionProvider` 的 `features` 从静态 `domAnimation` 改为 `import()`，约 24 KB 的动画引擎因此切成独立 chunk，不再占用任何组件的首屏关键路径。

  行为上：features 到达之前 `m.*` 渲染为无动画元素，慢网络下「一进页面就播」的入场动画可能少播一次淡入。**不会卡在不可见** —— features 缺席时元素以最终态呈现，不是停在 `opacity: 0`。交互触发的动效（按压、hover、overlay 开合）完全不受影响。文档站逐帧实测：入场动画照常逐帧推进，chunk 到得比动画该开始的时刻还早。

  **ProTable 的虚拟滚动补上文档与测试**

  `virtual` 一直随 `...tableProps` 透传给内部 Table，能力早就有，但整个 `pro-table/` 目录没有一处写着 "virtual"，文档也没提，很容易被当成不支持而把上万行直接铺进 DOM。现在 Props 段显式点名，并加了测试钉住这条隐式透传契约（连同 Table 自身的虚拟滚动 —— 它此前同样没有任何测试保护）。

  **配套：两把尺子 + 一处文档更正**

  - `pnpm size` —— 体积门禁（已进 CI）。pack 出 tarball → 仓库外空白工程 → esbuild 打包量 gzip，基线在 `scripts/size-limits.json`；`--why <入口>` 看体积构成。
  - `pnpm compile-cost` —— 编译压力诊断（不进 CI，耗时受机器负载影响太大）。量 dev 模块图规模、内存，以及 tsc 的 Files/内存/耗时。实测同样 8 个组件，根 barrel 是子路径的 **27 倍模块**；只 import 一个 Button，根 barrel 让 tsc 吃 **722 MB / 3020 files**，子路径只要 105 MB / 83 files —— 而这一层 `optimizeDeps` / `optimizePackageImports` 都救不了，它们只塌缩打包器的模块图，tsserver 照样直面源码。

  `docs/consuming.md` 里「Vite 默认不对 node_modules 里的源码包做预构建」一句按实测更正：Vite 7 对**正常 `pnpm add` 装进来**的瑚琏会自动预打包（16 个模块请求 / 43 MB），**软链消费**才会退回逐文件 transform（250 个请求）——那时 `optimizeDeps.include` 是必需项而非优化项。

- bd4ffd4: 修复：日期族的对外入口与依赖清单在文档 / registry / MCP 三处都对不上

  日期族改走 `@hulianui/ui/date-pickers` 子路径之后，还有四处仍在告诉使用者「从根 barrel 导入」——
  组件文档、registry 的 `meta.import`、conventions 的 `import-from-root-barrel` 约束、MCP 的
  `list_components` 表头。照抄任意一处的结果都是 `TS2305: has no exported member`。

  同时修一个更早就存在的问题：registry 单件安装日期族时只列了 `@mui/material` /
  `@mui/x-date-pickers` / `dayjs`，**漏掉 `@emotion/react` 与 `@emotion/styled`**。registry 的依赖
  是扫源码 import 反推的，而 emotion 是 MUI v9 的样式引擎、组件从不直接 import 它，于是永远扫不出来 ——
  照 registry 装完直接跑不起来。现按「伴生 peer」补齐。

  消费方冒烟门禁也补上了第二个场景（装 MUI + 走子路径），此前 `src/_mui/` 的 exports 映射零覆盖：
  它既不在根 barrel 也不在 showcase barrel，库内 tsc 与 workspace 链接两条路都测不到。

- 9f2ad65: 依赖升级：semver range 内的安全批次 + 组件依赖 minor

  **安全批**（patch / 小 minor，行为无预期变化）：
  react `19.2.7→19.2.8`、tailwindcss `4.3.0→4.3.3`、@tanstack/react-virtual `3.14.2→3.14.9`、
  react-colorful `5.7.0→5.8.0`、@types/react `19.2.16→19.2.18`、@types/react-dom `19.2.3→19.2.4`，
  以及仓库侧的 next `16.2.6→16.2.12`、@next/mdx、@tailwindcss/postcss、turbo `2.9.16→2.10.8`、
  @changesets/cli、msw、@faker-js/faker、@mui/material-nextjs、@tauri-apps/\*。

  **组件依赖批**（minor，但都是运行时行为依赖，已跑全量测试）：
  @base-ui/react `1.5.0→1.6.0`、@mui/material `9.0.1→9.2.0`、@mui/x-date-pickers `9.3.0→9.10.1`、
  recharts `3.8.1→3.10.1`、motion `12.40.0→12.43.0`、lucide-react `1.17.0→1.28.0`。

  **顺带修掉一处版本裂开**：tiptap 的直接依赖此前锁在 3.25.0，而它的传递依赖
  （`@tiptap/extension-bubble-menu` / `extension-floating-menu` / `extensions`）已被解析到 3.29.x，
  `pnpm install` 会报一串 unmet peer。现已把 `@tiptap/react` / `pm` / `starter-kit` /
  `extension-link` / `extension-placeholder` / `tiptap-markdown` 统一到 3.29.2，peer 警告清零。

  验证：3302 个测试全绿、typecheck 通过、文档站 `next build` 通过、12 个入口体积门禁全绿
  （体积零变化 —— 体积门禁在临时工程里全新安装，本来测的就是 range 内的最新依赖）。

  跨大版本的 typescript 7 / vitest 4 / jsdom 30 / @types/node 26 / react-easy-crop 6 不在本次范围内。

- 235cee5: 新增可执行的 `@hulianui/guard` 约束门禁，并让 MCP 安装指引返回页面递归依赖、显式接入清单和安装后检查命令。

  `SelectTrigger` 现在透传原生 button 属性，并在 searchable 模式下正确合并消费方 ref 与内部锚点 ref。

- f4328bb: 修复：升到 TypeScript 6/7 的消费方一 `import { Video }` 就报 TS2882

  `video.tsx` 里的 `import "@vidstack/react/player/styles/base.css"` 是一条 side-effect import，
  而 vidstack 没有随包提供样式表的类型声明。TypeScript **6.0 起** `noUncheckedSideEffectImports`
  默认为 `true`，于是这条 import 直接报错：

  ```
  TS2882: Cannot find module or type declarations for side-effect import of
  '@vidstack/react/player/styles/base.css'.
  ```

  因为瑚琏是**源码分发**（`exports "." → "./src/index.ts"`，消费方直接编译这份源码），
  这不是我们仓内的小事 —— **任何已经升到 TS 6/7 的下游只要引了 Video 就当场编译失败**，
  与我们自己升不升 TypeScript 无关。用 TS 7.0.2 在一个仓库外的干净消费方工程实测复现、并验证修复。

  修法：新增 `src/video/vidstack-css.d.ts` 声明该样式路径，并在 `video.tsx` 顶部加三斜线引用把它
  带进下游的 program（消费方的 tsconfig 只 include 自己的 src，不会自动加载库里的 `.d.ts`）。

  两个刻意的选择，改动时请勿"顺手优化"：

  - **用带包名前缀的通配** `declare module "@vidstack/react/player/styles/*.css"`，而不是全局
    `declare module "*.css"` —— 后者会顺着源码分发渗进消费方的类型环境，把他们自己的
    CSS Module 类型一起吃掉。
  - **三斜线必须排在 `"use client"` 之前**。三斜线指令只在任何语句之前才生效，而 `"use client"`
    是一条 ExpressionStatement；排在它后面会被当成普通注释静默失效（实测过：放下面时消费方仍报
    TS2882，且库内因为 tsconfig 的 `src/**/*.ts` 会自动 include 那份 `.d.ts` 而**假绿**）。
    指令前允许有注释，所以这个顺序对 `"use client"` 本身没有影响。

  对 TS 5.x 消费方无任何影响（那里本就不报这条）。

## 0.14.0

### Minor Changes

- be31a60: 清 issue #19 / #20 / #21 / #31

  **#31 Sortable：`InteractiveAwarePointerSensor.activators` 缺 `override`（0.13.0 回归 · 阻断级）**

  `static activators` 补 `override`。这一行是 0.13.0 随 #26 首次发布时带进来的：本包**发的是源码**（`exports` 指向 `./src/index.ts`，产物里零 `dist/`），所以它会进入**每个消费方**的 tsc program，凡是 tsconfig 开了 `noImplicitOverride` 的工程 `tsc --noEmit` 直接 TS4114 失败。`skipLibCheck` 救不了——它只跳 `.d.ts`，跳不过我们发出去的 `.tsx`。消费方此前除了为一个依赖关掉自己代码的一项检查，没有别的绕法。

  根子在门禁：`tsconfig.base.json` 只有 `strict: true`，而 `noImplicitOverride` 不在 strict 家族里、需单独开，于是库内编译通过、问题只在消费方暴露。现已在 `tsconfig.base.json` 与「消费方身份 typecheck」门禁的 tsconfig 里**双双开启**——后者刻意比库更严一档，因为对发源码的包来说，**库没开的检查项都是漏给消费方的雷**。全仓开启后零违规，即此前只此一处。

  **#19 packaging：新增子路径导出，按需引入不再拖进整棵源码树**

  `exports` 增加 `"./*": "./src/*/index.ts"`，从此可写 `import { Tag } from "@hulianui/ui/tag"`。

  此前 exports 只有 `.` 与 `./showcase`，取任何一个组件都只能走根 barrel；叠加源码分发，消费方的打包器会把整棵 `src/`（700+ tsx）连同全部 26 个 dependencies（tiptap / recharts / vidstack / ogl / MUI …）拉进模块图——即使一个都没用到。实测某 Vite 桌面 App 只用约 15 个组件，dev server 常驻 3.1 GB、CPU ~90%，HMR 卡到「点了没反应」。

  以打包后的真实产物量了一下同一个 `Tag`：

  | 引入方式                     | 模块数 | 带进来的 npm 包 |
  | ---------------------------- | ------ | --------------- |
  | `@hulianui/ui`（根 barrel）  | 5198   | 128             |
  | `@hulianui/ui/tag`（子路径） | 8      | 4               |

  顺带给 `theme` / `access` / `config` / `lib` 四个基础设施目录补了 `index.ts`（它们是根 barrel 已对外的公共 API，却是仅有的几个没有目录入口的），导出面与根 barrel 对应段落逐条对齐——两个入口是同一份公共契约的两种取法，子路径不额外放开内部实现。

  ⚠️ **这不是全自动的瘦身**：根 barrel 的行为完全不变，**仍会拖出全部 26 个 dependencies**，收益只在你改写 import 之后才拿得到。把重依赖组件（`_mui/*` / `markdown-editor` / `video` / `*-chart` / WebGL 系）移出根 barrel 是破坏性改动，留到 1.0。接入指引见 `docs/consuming.md` 第 3 节（含已经踩上又暂不想改 import 时的 Vite 止血办法）。

  消费方冒烟门禁同步挂上三条子路径（普通组件 + 两个需专门补 `index.ts` 的基础设施目录）：exports 映射写错这一类问题，库内 tsc 走相对路径、workspace 链接走目录直读，**两者都测不到**，只有走 pack 产物的真实解析才拦得住。

  **#21 deps：`tiptap-markdown` 升到 0.9.0，unmet peer 警告根除**

  `^0.8.10` → `^0.9.0`。0.8.10 的 peer 锁在 `@tiptap/core@^2.0.3`，而库装的是 v3，于是**每个**消费方安装时都会看到一条 unmet peer WARN（只是警告不阻断，但足以让人怀疑自己装错了）。上游 0.9.0 的 peer 已是 `@tiptap/core@^3.0.1`，属干净升级——因此没有采用 `peerDependencyRules` 静音那条路。`MarkdownEditor` 用到的 `Markdown` 扩展与 `editor.storage.markdown.getMarkdown()` 两处 API 在 0.9.0 均未变，测试全绿。

  **#20 docs(tooltip)：触发器必须用 `render` 注入，写成硬要求**

  `TooltipTrigger` 默认自渲一个 `<button>`，children 是塞进它*里面*而不是替换它——从 HeroUI（`Tooltip.Trigger` 是把 props 合并进子元素）迁过来会很自然地把 `<button>` 当 children 传，结果 DOM 里套成 `button > button`。实测确认：children 形态嵌套 button 数为 1，`render` 形态为 0。

  这个错误 **tsc / eslint / build / 肉眼全都不报**（children 类型完全合法，嵌套 button 在浏览器里照样可点），只有查 a11y 树才看得出来。原文档只提了 `render` 与 flex 截断的关系，那句话隐含「可以不用 render」，反倒容易让人以为 children 是正常用法。现已在 Slots 与「禁忌 / 坑」两处写明是硬要求，并给出正反例。

  顺带补上另一条实测确认的坑：`TooltipContent` 渲染出的 popup **不带 `role="tooltip"`**（整棵树里该 role 计数为 0），写验收 / E2E 脚本时按 `[role="tooltip"]` 查会查不到，请按文本或类名定位。

## 0.13.0

### Minor Changes

- 8ff9043: 清 issue #24–#29，外加两处自查发现的真 bug

  **#24 packaging：源码里的裸 `process` 让消费方 tsc 直接失败**

  新增内部 `lib/is-dev.ts`（模块作用域 `declare const process`），`pagination` 与 `animated-theme-toggler` 的开发期告警改用它。装 `@types/node` 是更坏的解——它会把整套 Node 全局类型灌进浏览器端消费方，`setTimeout` 从此返回 `NodeJS.Timeout` 而非 `number`，反倒掩盖真实的平台错配。

  同时给 CI 加了「以消费方身份 typecheck」门禁（`pnpm pack` 产物 + 仓库外临时目录 + 不装 `@types/node`）。这次的本质不是那两行代码，而是**库的自查环境比消费方宽松**——`packages/ui` 的 tsconfig 里 `types: ["vitest/globals"]` 让 `@types/node` 经 vitest 类型链混了进来，于是「库内 tsc 绿、装出去就挂」这一类问题会持续漏网。

  **#25 Heatmap：区分「无数据」与「值为 0」**

  新增 `emptyCellTone`；`buildMatrix` 的 `get` 缺席时返回 `undefined` 而非 `?? 0`；`HeatmapCellInfo` 增加 `empty` 字段供 `formatTooltip` 判别。

  ⚠️ **一处行为变更**：缺席格的默认 tooltip / `aria-label` 文案从 `Y · X：0` 改为 `Y · X：无数据`，且不受 `emptyCellTone` 门控。颜色保持完全向后兼容（不传 `emptyCellTone` 时与旧版逐字节一致），但 aria-label 谎报「0」属于无障碍缺陷，不宜再 gate。**若你的测试或 e2e 按 aria-label / title 定位缺席格，需要更新选择器。**

  **#26 Sortable：行内交互元素不再劫持拖拽（指针 + 键盘双路）**

  指针路径加 `InteractiveAwarePointerSensor`；键盘路径把 `<li>` 登记为 `activatorNode`，让 dnd-kit 上游那句 `if (activator && event.target !== activator) return false` 生效——此前 `activatorNode` 为 null 会让整条守卫被跳过，行内按钮上的 Enter 被 `preventDefault` 吞掉，键盘用户根本按不动。`handle` 从此只是取向选择，不再是「避免劫持子元素」的必需补丁。

  **#27 TreeSelect：新增 `clearable`**，对齐 Select 已有的语义与视觉。此前单选选中后无法在组件内回到未选态，筛选条件只能收窄不能放宽。

  **#28 Sortable：`renderItem` 的 state 增加 `index`**，省掉消费方 `findIndex` 兜回来，也让行内控件能有带序号的唯一 `aria-label`。

  **#29 Stat：新增 `hint`**（与趋势无关的注脚槽），并对「传了 `deltaLabel` 却没有 `delta`」补开发期告警——原先是静默吞掉，TS 过、控制台干净、页面只少一行字，属最难查的一类。

  **自查发现的两处真 bug（非上述 issue）**

  - **Kanban 整卡拖拽此前完全失效**：卡片守卫用的是无边界 `closest("…[role='button']…")`，而 dnd-kit 会给可拖卡片挂 `role="button"`——守卫命中卡片自己，于是每次按下都被判成「按在交互元素上」。原有测试全部用孤立 `createElement` 断言，测不到真实渲染的卡片，因此一直绿着。现已抽出 `lib/drag-guard.ts` 与 Sortable 共用同一份带边界的实现，并补了基于真实渲染的回归测试。
  - **Dialog / Drawer 正文滚动区裁掉焦点环**：`overflow-y-auto` 会连带把 `overflow-x` 从 `visible` 变成裁剪（CSS 规范：一轴非 visible 时另一轴的 visible 计算成 auto），而 `w-full` 表单控件与滚动容器左右边界零余量，`ring-2 + ring-offset-2` 向外 4px 的两条竖边整条被切掉（症状是「聚焦只剩上下两条线」）。横向改为经 `--hl-overlay-pad` 变量做负边距补偿——覆盖 Popup 内边距时需一并覆盖该变量。

    纵向同样要留（`mt-3 pt-1` / `-mb-1 pb-1`，视觉间距净变化为零）：表单最后一个控件的下边界与滚动容器完全贴合，环往下那 4px 一样会被切掉。纵向只留 4px 而非跟横向一样借 24px——上下方紧挨着标题与 footer，借多了滚动内容会从标题底下穿出一大截。

  - **ModalForm / DrawerForm 的操作按钮**从滚动区移进 `footer` 槽（经 HTML `form` 属性关联提交），长表单时按钮不再跟着滚走。

  **其它**

  - 开发期误用告警统一走新的 `lib/warn-once.ts`，同一误用整个进程只打一次（原先写在 render body 里，每次重渲染都打、StrictMode 下翻倍）。
  - FAB 补 `draggable` 示例与文档（此前 showcase 里没有任何可拖示例，用户会以为拖拽坏了）；拖拽期间不再套用按压缩放（缩小表达「按进平面」，与拖拽的「拿起来移动」语义相反），并补上缺失的 `onPointerCancel` 重置。

- 8ff9043: 动效手感统一：曲线 SSOT 打通、浮层从触发器长出、按压反馈铺开

  对照 Emil Kowalski 的动效判据（easing / duration / 物理性 / 可中断性 / 性能 / 内聚性）做的一轮系统性打磨。行为变更，无 API 破坏。

  **曲线 SSOT 打通（覆盖面最大）**

  - `@hulianui/tokens` 的 preset.css 新增 `@theme` 缓动块：把 Tailwind 内置的 `--ease-out` / `--ease-in-out` 覆盖为瑚琏曲线，并新增 `--ease-drawer`（iOS/Ionic 抽屉曲线）。
  - 同时覆盖 `--default-transition-timing-function` —— 库内 90+ 个组件写的是裸 `transition-colors`，此前全部走 Tailwind 默认的 `cubic-bezier(0.4, 0, 0.2, 1)`，与 motion token 驱动的动效并存两套手感。现已统一。
  - `motion/tokens.ts` 补 `motionEase.drawer` / `motionEaseCss.drawer`。

  **浮层从触发器长出**

  13 个 Base UI overlay（Tooltip / Popover / Select / Menu / ContextMenu / Combobox / Cascader / HoverCard / Popconfirm / TreeSelect / DateField / DateRangePicker / TimePicker）接上 `--transform-origin`，进出场不再从自身中心缩放。Dialog / AlertDialog / Modal 保持居中（它们不锚定触发器）。

  **按压反馈**

  - 新增导出 `pressableClass` —— `pressable`（motion 版）的纯 CSS 平替，零 motion 运行时。
  - 铺到 Fab（主钮 + 子动作）、Toggle、Segmented、SocialButton、Choicebox（大卡用 0.99）；ActionSheet 走 active 底色（移动端全宽条目变色比缩放更贴原生）。

  **其它**

  - Drawer / ActionSheet 面板改用 drawer 曲线 + 300ms，遮罩淡入与面板滑动解耦（原先共用一套参数）。
  - Command 命令面板去掉缩放进场、缩至 150ms 纯淡入 —— ⌘K 是键盘高频入口，位移进场会让每次唤起慢半拍。
  - Tooltip 支持 `data-instant`：同组内已有 tooltip 打开时，相邻触发器瞬时显示（跳过延迟与动画）。
  - 清零 `transition-all`（Fab / BentoGrid / VoiceRecord / InfiniteMenu / ShimmerButton 改指名属性）。
  - VoiceRecord 波形条从动态 `height` 改为 `scaleY` —— 每 100ms 刷新、十余条同时动 height 会逐帧触发整行 flex 重排。
  - Folder 的 `ease-in` 改 `ease-out`。

  **文档**

  文档站新增 `/theme/motion` —— `/theme` 下此前有色彩/圆角/阴影/间距等页，唯独动效缺席。新页含曲线手感对比（悬停即看）、时长阶梯、「该不该动」的频率判据，以及按压反馈与浮层原点的接法。

## 0.12.0

### Minor Changes

- 64106c0: 下游缺口回流（二）：日期时间族补齐 + 图标选择器 + 路由页签条 + Tree 虚拟滚动与拖拽

  承接 0.11.0，把两份下游缺口清单（`5069tk-app/docs/HULIAN-GAPS.md`、`hulian-admin` 的
  `gap-matrix.md`）里剩下的**能力型**条目一次清完。0.11.0 处理的是缺陷与集成契约，这一版是补能力。

  **新增组件（4 件）**

  - **`DateField`** —— 零依赖单日期选择器（forms/datetime）。此前库里只有 `_mui` 那份 MUI X 桥的
    `DatePicker`，想选一个日期就得把整条 MUI + emotion 拖进来、还得记得挂 `MuiBridgeProvider`。
    本件走 Base UI Popover + dayjs，与 `DateRangePicker` 同源（共用新抽出的 `lib/date` 里的
    `monthMatrix` / `WEEKDAY_LABELS`）。

    - `picker: "date" | "month" | "year"` 三粒度，值形状随之为 `YYYY-MM-DD` / `YYYY-MM` / `YYYY`
      —— 一并补掉 gap-matrix a9 说的「`year` 类型完全缺失」
    - 面板标题可点，逐层上卷 date → month → year；`picker` 决定「点到哪一层就提交」
    - `minDate` / `maxDate` / `disabledDate` / `displayFormat` / `clearable` / `showToday`
    - 年份面板按**十年段**对齐（2020–2029 + 前后各一格补位），不是十二年段 —— 人对「20 年代」
      有直觉，2016–2027 这种切法读起来没有着落

  - **`TimePicker`** —— 零依赖时间选择器（forms/datetime）。此前只有 `_mui/TimeField`
    （分段键盘输入、无浮层、无 min/max/step），要 el-time-picker 那种「点开选」只能自己搓。
    时/分/秒三列浮层 + `minuteStep`/`secondStep` + `minTime`/`maxTime` 逐列禁用。
    两处值得记下的实现取舍：

    1. **逐列禁用的判据是「整段与范围有无交集」，不是「端点是否越界」**。`minTime="09:30"` 时
       9 点这一格仍可选（9:30~9:59 可达），被禁的是 9 点内 30 分之前的分钟；照「端点越界即禁」
       写会把整个 9 点误禁
    2. **尚未选值时存在一个隐含基准** `clamp(00:00:00, [min,max])`。否则 `minTime="09:30"` 下
       基准小时恒为 0，分钟列会被整列判死，面板看着像坏了
       另导出 `parseTime` / `formatTimeParts` / `clampTime` / `snapToStep` 等纯函数供表单校验复用
       （`formatTime` 已被 Video 占用，故对外叫 `formatTimeParts`）。

  - **`IconPicker`**（gap-matrix a8）—— 分类页签 + 跨类搜索（名字/中文别名）+ 网格 + 最近使用。
    **图标集不进组件库**：`sources[].renderIcon` 把「名字 → 节点」的映射交给消费方，
    lucide / iconfont / 本地 svg 三种来源都能接，库自身不为了一个选择器把几千个图标打进每个包里。
    搜索**跨全部分类**（用户找图标时心里没有「它属于哪一类」这个概念），故搜索期间分类页签隐藏。

  - **`RouteTabs`**（gap-matrix a17）—— 中后台多标签工作区那条页签栏，从 `AdminLayout` 里抽出来
    独立可用。补齐右键菜单（关闭其他/左侧/右侧/全部/刷新）、固定页签、拖拽调序、
    激活项滚入视口、溢出左右滚动按钮。
    **顺带根治一个真 bug**：`AdminLayout` 内置那版在受控模式下「关闭其他/全部」只调了 `setActive`、
    没有任何对外回调，消费方点了看着毫无反应；且「关闭全部」实为 `closeOthers`，与菜单文案对不上。
    现在 `AdminLayout` 内嵌 `RouteTabs` 并新增 `onTabsAction` 出口（受控时是唯一出口），
    `closeAll` 也修正为「关全部可关页签（含当前页）」。批量动作的判定抽成纯函数
    （`affectedKeys` / `nextActiveKey` / `isClosable` / `orderTabs` / `reorderTabs`）一并导出，
    让消费方与组件用同一份口径，不各算各的。

  **既有组件增强**

  - **`Tree` 虚拟滚动 + 拖拽排序**（gap-matrix a13 后半 + 5069tk #7）

    - `virtual`：几百上千节点的权限树/组织树。**开启后强制平铺渲染** —— 没有展开过渡、
      `showLine` 连接线失效（平铺后没有嵌套 DOM 可挂线），已写进禁忌区
    - `draggable` + `onDrop` + `allowDropInside`：原生 HTML5 拖放，**不引 dnd-kit**
      （Table 刚为「不开拖拽也被迫拉起整条 dnd-kit」付过代价）。顺序不归组件，
      `onDrop` 只回传「谁落到谁的哪一侧」。已拦三种非法落点：丢到自己身上、丢进自己的子树（成环）、
      `inside` 到自己的直接父级（等于没动却会触发一次写库）
    - 落点几何函数对**非有限值**做了守卫：NaN 参与比较时两个分支都为假，会静默落到 `inside`
      ——那是改父级，三种落点里最危险的一种

  - **`SearchForm` 控件类型补齐**（gap-matrix a14）：新增 `number` / `number-range` /
    `datetime` / `datetime-range` / `multi-select` / `remote-select`（后者直接复用 RemoteSelect 的
    `fetcher` / `resolveValue` 契约，不另立平行类型）。值形状按类型定：`*-range` 恒为二元组、
    多值字段为数组，重置后各自回到对应空形状。
    **operator 刻意不进 `SearchForm`** —— 那是后端查询契约，塞进来会让通用组件编码某一家后端的协议。

  - **`_mui/DatePicker` / `DateTimePicker` 透传补齐**（gap-matrix a9）：`views` / `openTo` /
    `format` / `disabledDate`。`disabledDate` 对外收 ISO 日期串、在桥这层转 Dayjs，
    免得消费方为一个禁用判定被迫认识 dayjs。

  - **`Sparkline` 新增 `baseline`**（5069tk #12）：在指定数值处画一条横向虚线（上期均值 / 目标值 /
    及格线），让序列有个「对比的参照」而不只是形状。基准值会一并纳入归一化域，保证它落在视口内。
    另导出纯函数 `valueToY`，与 `normalize` 共用同一条归一口径。

  - **`ProTable` 改吃 `Pagination` 的 `totalItems`**：不再在内部手算 `Math.ceil(total/pageSize)`，
    页数换算只留一处，边界（0 条 / 整除）不会两边各算各的。

  - **`Listbox` 新增 `style`**：用于表达 Tailwind 类给不出的动态值（`Transfer` 的 `listHeight` 要用）。

  **新增 i18n 文案**：`adminLayout.closeLeft` / `closeRight` / `refreshTab` / `scrollLeft` / `scrollRight`。

  **行为变化提示**：`AdminLayout` 的「关闭全部」语义修正为关全部可关页签（此前等同「关闭其他」）；
  受控页签的批量动作现在需要接 `onTabsAction` 才会生效（此前根本不生效）。其余全部为可选新 prop
  或新组件，既有用法零影响。

## 0.11.0

### Minor Changes

- 38d57d5: 下游 dogfood 缺口回流：可访问性 / 集成契约 / 表格·表单能力补齐

  本轮全部条目来自两个真实消费方在实现页面时记录的缺口清单（`5069tk-app/docs/HULIAN-GAPS.md`
  与 `hulian-admin` 的 `gap-matrix.md`），不是凭空设计的 API。0.10.0 已闭合的那批不再重复。

  **修的是缺陷（会产出功能性问题，不只是不方便）**

  - **`Link` 补 `render` 口子，消除死锚点。** `Link` 是纯皮肤 `<a>`，`LinkProps` 里没有 `render`，
    于是 `<Link render={<NextLink href="…" />}>` 把 `render` 当未知 DOM 属性交给 `<a>`（React 静默丢弃），
    **`href` 从头到尾没传下去**。产出的是一个看起来像链接、点了没反应、也没有 `link` role 的 `<a>` ——
    视觉与 hover 全对，只有点击和 `getByRole("link")` 会露馅，读屏用户完全拿不到它。
    现照 `Button` 的同款 `cloneElement` 范式合并皮肤与 props，`external` 的 `target`/`rel` 与外链图标一并生效。

  - **`Table` 不开 `rowDraggable` 时不再执行任何 dnd-kit hook。** `useSensors` 原先写在组件顶层
    （hook 不可条件调用），任何用了 `Table` 的下游都会被迫拉起整条 dnd-kit 运行时。下游 vitest 里
    `@dnd-kit/*` 没有 `exports` 字段、只有 legacy main/module，解析出第二份 React 后整页崩，
    而栈顶落在 dnd-kit 内部、几乎无法归因到「表格没开拖拽」。现把 sensors 收进只在 `dragEnabled`
    时挂载的 `RowDndProvider`（`useSortable` 本就只在 `DraggableRow` 里），并加了一条盯住
    「hook 有没有被调用」本身的回归测试。

  - **`AnimatedThemeToggler` 缺 `ThemeProvider` 不再 throw。** 原先直接抛 = 整页白屏，一个装饰性
    开关不该有这种杀伤力。现降级为自持主题态：直接读写 `<html data-theme>` 与同一个 localStorage
    键，dev 下打一条指明「少挂了 ThemeProvider」的告警。新增导出 `useThemeOptional`（缺上下文返回
    `null`）与 `THEME_STORAGE_KEY`；`useTheme` 的强约束语义不变，应用代码想要「缺 Provider 就报错」
    继续用它。

  - **`Radio` 支持无障碍名。** `RadioProps` 此前只有 `value/disabled/label/id/className`，
    不给 `label`（图标卡片、自定义排版）时读屏只报「单选按钮」，拿不到这是哪个选项 —— 是真实的
    a11y 缺陷，不只是测试不好写。现透传 `aria-label` / `aria-labelledby` / `aria-describedby` 到 Root。

  - **`Input` 转发 `ref` 到内层原生 `<input>`**（不是外壳 span）。`focus()` / `select()` / 取 `.value` /
    react-hook-form 的 `register()` 都指望拿到原生控件；此前不转发，消费方只能「受控值 + 包一层容器查 DOM」绕。

  - **`Tree` 三条行为缺陷**：
    - `disabled` 改为**只挡选中/勾选，不挡展开** —— 此前禁用父节点连箭头都点不动，整棵子树彻底不可达。
    - 新增 `expandTrigger?: "row" | "icon"`（默认 `"row"`，行为不变）。默认下有子节点的行点了只展开、
      **永远选不中**；要选目录/部门/任意层级分类改 `"icon"`：只有箭头管展开，行归 select/check。
      「只能选叶子」是这个默认值的副作用，**不是契约**。
    - `TreeNode` 新增 `searchText?: string`。`label` 是 `ReactNode` 时，内置搜索与键盘首字母跳转
      此前会退化成拿 `key` 去匹配 —— 用户按看得见的文字搜一条都搜不出来。搜索与 typeahead 现共用
      同一条取值口径（新导出纯函数 `nodeSearchText`）。
    - 顺带：搜索平铺态下点父节点此前是切一个当下被忽略的 expanded 位（即毫无反应），现改为 select，
      并补上选中高亮与 `aria-selected`。

  **能力补齐**

  - **`Pagination` 接总条数口径**：新增 `totalItems` + `pageSize`。原有的 `total` 是**总页数**，
    与几乎所有后端回的 `total`（总条数）语义相反，此前每个消费方都在调用处补一次 `Math.ceil`，
    边界（0 条 / 整除）上最容易各算各的。两者同传以 `total` 为准并在 dev 下告警；
    `total` 的语义修正留到 1.0 主版本一次性做。同时补 `showTotal`（默认「共 N 条」，可传函数拿到
    条目区间）与 `showQuickJumper`（回车/失焦提交，自动夹紧）。

  - **`Table` 新增 `onRowDoubleClick`**，对上后台列表「双击进编辑」的老习惯。与 `onRowClick` 相互
    独立可同传，行内交互元素复用同一条冒泡隔离。

  - **`Transfer` 新增 `listHeight`（默认 240）与 `showSelectAll`。** 面板列表区高度此前是硬编码的
    `max-h-60`，几百节点的权限/部门数据下被挤成一条缝，只能在外面改样式绕。全选**只作用于当前
    过滤结果里的可用项** —— 搜出 3 条时点全选不会把看不见的另外 200 条也勾上。
    （配套给 `Listbox` 加了 `style`，用于表达 Tailwind 类给不出的动态值。）

  - **`LogViewer` 面向流式日志**：`autoScroll` 从「每次渲染无条件贴底」改为**黏底** —— 只在用户
    本就停在底部时跟随，上滚看历史不再被新行拽回去，滚回底部自动恢复（判定留 8px 容差，
    亚像素与惯性滚动会让 `scrollTop` 差零点几）。新增 `maxLines`：一条跑几小时的构建流会把几万个
    DOM 节点堆在页面里，滚动直接卡死。

  - **`Switch` 新增 `size`（sm/md/lg）与 `touchTarget`。** 此前只有一档 24px 高的轨道且无尺寸开关，
    低于移动端触控目标推荐值，消费方只能自己在外面包一层 ≥44px 的可点区。`touchTarget` 扩出的是
    不可见命中区，不占布局不改视觉；默认关，因为它会上下各溢出约 10px，桌面端密排表单里可能压到邻居。
    `md` 档与加这个 prop 之前逐像素一致。

  - **`Alert` 新增 `tone="brand"`**，与 Tag / Button / Badge 对齐同一套 tone 取值。`info` 保留为
    历史别名（同配方、不会移除），新代码用 `brand`。

  - **`Collapsible` 的 Trigger 加 `min-h-11`（44px）。** 它常配单行短文案，仅靠 `py-2.5` 只有 40px。

  **集成契约显式化（此前一字未写，每个下游各查一遍）**

  - 新增 **`@hulianui/ui/vitest-preset`** 导出：`withHulian(config)` 一行合并消费方 Vitest/Vite
    所需的解析配置，另导出 `hulianDedupe` / `hulianConditions` / `hulianMainFields` / `hulianInlineDeps`
    四个常量供自拼。瑚琏是源码分发，消费方的解析器要负责找瑚琏的第三方依赖，而这些依赖恰好横跨
    四种模块形态（自研零依赖件 / 纯 ESM peer / 有 exports 但 `import` 指向 `.cjs.mjs` 壳 / 无 exports
    只有 legacy main-module），各需一条不同配置。踩中时的症状是 `useRef`/`useId`/`useContext`/`useMemo`
    读到 null，**且栈顶落在第三方包内部**，每次都像是「那个组件坏了」。

  - 新增 **`docs/consuming.md`** 并从 README 置顶引用，写明上面这条与「`_mui` 桥接族必须置于
    `MuiBridgeProvider` 之内」。后者不挂的后果是硬故障：桥主题把 `theme.alpha` 重写成 `color-mix`，
    MUI 核心件会对 `var(--color-*)` 调 `alpha()` 直接抛 `Unsupported color`，**真实浏览器同样触发**。
    六份 `_mui` 组件文档（Rating / Stepper / Calendar / DatePicker / DateTimePicker / TimeField）
    顶部均已补上这条前置条件 —— 此前 showcase 套了 Provider、文档只字未提，照文档抄必踩。

  **行为变化提示（均为修正，非新增开关）**：`Tree` 的 disabled 节点现可展开；`Tree` 搜索态点父节点
  现会 select；`LogViewer` 的 `autoScroll` 现是黏底而非强制贴底；`Collapsible` Trigger 最小高度
  40px→44px。其余全部为可选新 prop，不传时与本版之前逐字一致。

## 0.10.0

### Minor Changes

- 新增 ColorField —— 紧凑单行颜色输入框（forms/advanced） <!-- parity-id: ui-0.10.0-color-field -->

  表单里一行的颜色输入：左侧色块调起系统取色器 + 十六进制文本输入。与 ColorPicker 的分工是「不抢版面」——后者是完整取色面板（饱和度方块 + 格式切换器），适合独立占一块地方；ColorField 适合主题配置表、设计 token 编辑器这类一行一色的场景。

  - 短写自动展开：`#abc` → `#aabbcc`（逐位重复，不是 `#abc000`）
  - 内部维护草稿态，解决受控颜色输入没法手输的问题：受控值经规范化后回灌会让人敲到 `#3` 就被打回，所以键入期间以草稿为准、只在解析成功时抛值、失焦丢草稿归一
  - `onValueChange` 参数恒为规范化后的 `#rrggbb`，输入不合法时不触发
  - 草稿不合法时自身标红，无需外部传 `invalid`
  - 另导出纯函数 `normalizeHex` / `isHexColor`，供消费方校验导入的主题配置
  - 尺寸 sm/md/lg 复用 Input 的外壳变体，色块随之缩放

  动因：Quay 从 HeroUI 收敛到瑚琏时，`ColorField`（hex 文本输入）是库里唯一缺的等价物 —— 现有 ColorPicker 是完整面板，塞进设置页一行会撑坏版式。

- ProTable 托管模式增强：defaultSorting / params，以及内联 request 的无限请求防呆 <!-- parity-id: ui-0.10.0-pro-table -->

  - `defaultSorting?: SortingState`：托管模式内部排序 state 的**首次挂载初值**（非受控默认值语义，后续改 prop 不回灌）。首拉即带 sort，因此能表达「默认按某列倒序」。展示模式的默认排序仍直接传受控 `sorting`
  - `params?: Record<string, unknown>`：托管模式固定查询参数，**浅比较**（键集合 + `Object.is` 逐值）后内容变化才回第 1 页重查，仅引用变化不触发——所以 `params={{ scopeId }}` 写内联对象字面量无需 `useMemo`
  - `request` 改由 ref 持有最新引用并**移出 effect 依赖数组**，改用 `managed = Boolean(request)` 驱动首拉。此前消费者写内联 `request={async (p) => …}` 会每次渲染换身份 → 无限请求

  `ProTableRequestParams` 增 `params` 字段（运行时恒有值，未传 prop 时为 `{}`）。**刻意不并入 `filters`**：`filters` 只装查询区提交值，固定条件不该被同名 filter 覆盖、也不该受查询区「重置」影响；需要合并的在 request 内自己写 `{ ...p.filters, ...p.params }`。

  两个已知代价，均已写进 pro-table.md 禁忌区：

  1. request 移出依赖后，「换一个 request 函数」本身不再触发重查（antd ProTable 同款取舍），要刷新请改 `params` 或调 `actionRef.reload()`
  2. `params` 只做浅比较，嵌套对象/数组每次 render 换引用仍会每次重查——组件层不兜底深比较，请拍平成一层或自己保持引用稳定

  `params` 变化的重置走「渲染期派生 state」而非 `useEffect`，好让新 params 与 `page=1` 在同一次提交生效，避免先用旧页码发一次废请求。

- 新增 RemoteSelect —— 远程搜索选择器（forms/advanced），含 multiple 多选 <!-- parity-id: ui-0.10.0-remote-select -->

  补上库里唯一缺的「远程数据」能力：此前 Combobox 只有 Base UI 的本地 filter，选项必须先全量落到前端，门店/会员/商品这类几万条的字典没法用。RemoteSelect 把过滤权交给服务端。

  - `fetcher(query, { page, pageSize, signal })` 数据源，`signal` 在被新一次搜索取代时 abort；同时用请求序号丢弃过期响应（只 abort 不够——fetcher 可能忽略 signal，慢响应后到会覆盖新结果）
  - 输入防抖（默认 300ms），loading / 空态、`共 N 条` 页脚
  - 滚到底自动追加下一页；`total` 缺省时按「本页满页即可能还有」推断
  - **`resolveValue(values)` 初值回显**：编辑表单打开时 value 常不在首屏那一页里（在第 7 页、或被搜索词过滤掉），只有它能把 label 解出来。与 `fetcher` 是两个后端语义（按关键词分页搜 vs 按主键批量取），刻意不合并
  - `multiple` 多选复用 ComboboxChips 皮肤，已选但未加载的 value 同样靠 resolveValue 解出 chip 文案；chip 严格按 value 顺序渲染——底层 ChipRemove 按渲染序绑定 `selectedValue[index]`，乱序会删错项
  - `labelKey` / `valueKey` 映射任意后端字段名，`renderOption` 可拿到 `raw` 原始行

  顺带给 `ComboboxContent` 加了两个可选项（不设即与此前完全一致）：`onListScroll`（列表滚动回调，用于滚到底加载更多）与 `footer`（列表下方常驻页脚，不随列表滚动）。

  动因：对标 hulian-admin Vue 后台的 `baInput/remoteSelect.vue`（355 行），React 侧缺等价物，表单页的远程字典只能各自手搓。

- Select 新增 clearable / searchable / loading 与选项分组 <!-- parity-id: ui-0.10.0-select -->

  把 el-select 上最常用的几个开关补齐，心智对齐——都挂在 `<Select>` 上，而不是散到 Trigger / Content 子件。全部可选、默认关闭，既有用法零影响。

  - `clearable`：有值时 Trigger 右侧浮出清除按钮（常态 hidden，`group-hover` / `group-focus-within` 才显形），单选回传 `onValueChange(null)`、多选回传 `[]`。清除按钮是 Trigger 的兄弟节点而非嵌在 `<button>` 里（嵌套按钮非法且会吞点击）
  - `searchable`：切到 Combobox 搜索皮肤，过滤 100% 由 Base UI Combobox 承担，未自造搜索逻辑。对外值形状仍是 `string` / `string[]`，内部做 `string ⇄ { value, label }` 搬运
  - `searchPlaceholder`（默认「搜索」）/ `emptyMessage`（默认「无匹配项」）
  - `loading` + `loadingText`：Trigger 图标换 Spinner，浮层只出加载占位不渲染选项；loading 期间不给清除按钮
  - 新增导出 `SelectGroup` / `SelectGroupLabel`：Base UI 1.5.0 早有分组能力，瑚琏此前未暴露

  两处刻意的取舍：

  1. `clearable` 开启后，组件对**非受控**用法接管为内部受控镜像——要能程序化置空就得拿得到值，而 Base UI 的 store 不对外暴露。未开 `clearable` 时 value 归属与 DOM 结构与旧版完全一致（不加包裹层），分两条路径以保证既有消费方零影响
  2. `searchable` 与 `SelectGroup` 不能同时生效：该皮肤下列表由 items 过滤结果驱动（Base UI Combobox 的 List 只对函数式 children 走 filteredItems），静态声明的分组会被拍平。已写进 select.md 禁忌区

  新增导出类型：`SelectGroupProps` / `SelectGroupLabelProps` / `SelectItemData`。

- Table 新增列几何能力与行拖拽排序 <!-- parity-id: ui-0.10.0-table -->

  补齐对标 el-table-column 的列控制，以及列表页排序的刚需交互。两组能力默认全关，不传 prop 时行为与改造前逐字一致。

  **列几何**

  - `layout?: "auto" | "fixed"`（默认 `auto`）：`auto` 下只有显式写了 `size` / `minSize` / `maxSize` 的列才落宽度，避免未声明的列被拍成等宽；`fixed` 下每列按 `getSize()` 出实宽，表宽取 `table.getTotalSize()` 并以 `min-w-full` 兜底
  - `resizable?: boolean`：表头右缘拖拽手柄（`role="separator"`），`columnResizeMode: "onChange"` 实时改宽、双击复位；开启即强制 `layout="fixed"`。内建前插列（`__select__` / `__expander__` / `__drag__`）恒不可调宽，单列可用 `ColumnDef.enableResizing=false` 关掉
  - `columnSizing` / `onColumnSizingChange`：受控列宽，家风同 `sorting` / `rowSelection`
  - `ColumnMeta` 增 `align` / `headerAlign` / `ellipsis` 三项（对应 el 的 `align` / `header-align` / `show-overflow-tooltip`）。`ellipsis` 列的溢出文本悬停出 Tooltip，触发器强制 render 成 `<span>` —— 默认的 `<button>` 会被行点击的 `ROW_INTERACTIVE_SELECTOR` 命中，导致整列点不动行

  列宽契约沿用 TanStack 原生 `size` / `minSize` / `maxSize`（不发明 `width` 平行 API），th 与 td 共用同一个内联 style 对象，不使用 colgroup。固定列的 sticky offset 随列宽变化同帧重算。

  **行拖拽排序**

  - `rowDraggable?: boolean` + `dragHandle?: "row" | "cell"`（默认 `cell`，前插 `__drag__` 手柄列）
  - `onRowDragEnd?: (e: RowDragEndEvent<TData>) => void`，载荷含 `activeId` / `overId` / `activeIndex` / `overIndex` / `position` / `activeRow` / `overRow` / `nextData`；`position` 的推导与 baTable 的 `newIndex > oldIndex ? "down" : "up"` 同构，便于直接映射后端 `dragSort` 接口
  - `getRowCanDrag?: (row, index) => boolean` 锁定指定行；树形子行（depth > 0）恒禁用

  **顺序不归组件管**：Table 从不改 `data`，只回报落点，重排由消费方落库或本地乐观更新。基于已在依赖里的 @dnd-kit，未引入新依赖。落点指示线用 inset box-shadow 而非 border —— `border-collapse` 下 border 会与相邻行分隔线合并、顶掉 1~2px 行高。

  新增导出类型：`TableColumnAlign` / `ColumnSizingState` / `RowDragEndEvent` / `RowDropPosition`。

- Upload 新增 limit / renderPreview / sortable，并拆出传输层 useUpload <!-- parity-id: ui-0.10.0-upload -->

  **皮肤层**

  - `limit`：数量上限，按受控 `files.length` 计。达标后触发器整体禁用（`aria-disabled` + `tabIndex=-1` + input disabled）并渲染「已选 n/limit」计数；本次选择中超出剩余名额的文件进 `onReject`，`reason` 新增 `"limit"` 分支
  - `renderPreview?: (file) => ReactNode`：返回非空节点时列表项左侧变 40px 缩略图位，状态点降级为右下角标；返回 null 回落默认状态圆点
  - `sortable` + `onSort`：手柄式拖拽调序（@dnd-kit，与 Sortable/Kanban 同源）。顺序仍受控，只给 `sortable` 不给 `onSort` 会静默退回静态列表
  - `UploadFile` 增 `url`（上传完成后的远端地址，不参与组件内部逻辑）与 `raw`（原始 File 句柄，供 `renderPreview` 做 `createObjectURL` 本地预览）
  - 上传中的进度条补 `role="progressbar"` + `aria-valuenow/min/max` + 百分比文本，越界值内部 clamp 到 0–100
  - 另导出纯函数 `moveUploadFile(files, activeId, overId)`：调序核心，原地或未知 id 时返回同一引用，便于避免无谓 `onSort`

  **传输层（新文件 use-upload.ts）**

  `useUpload({ request, concurrency?, onChange?, onSuccess?, onError? })` → `{ files, add, remove, retry, reorder, clear, uploading }`。

  `request(file, { onProgress, signal })` 由消费者提供，库内**不存在** action / headers / withCredentials / 信封解包——对后端零假设。它提供的是纯前端并发编排：队列闸门（默认并发 3）、AbortController 取消、进度状态机。`remove` / `clear` / 卸载会 abort 对应请求，且迟到的 resolve 被丢弃，不会复活已移除的行。

  之所以下放到通用库而不是留给每个消费方：这类队列各自手搓必然各带一份竞态 bug，定位与 `useForm` 同级。目录因此是 8 个文件（6 件套 + use-upload.ts/.test.tsx），照 `src/form/` 既有先例分段导出。

  已知取舍：`sortable` 让 upload.tsx 静态 import 了 @dnd-kit，未用该功能的消费者在 source 分发下也会打进包（未引新依赖，但确实增加 Upload 最小体积）；`limit` 按受控 `files.length` 计，非受控用法下只能拦住「单次选太多」，拦不住累计。两点均已写进 upload.md。

- fix(nav-menu): collapsed 态飞出层补齐无限级级联，并改用 fixed 定位逃出侧栏裁剪 <!-- parity-id: ui-0.10.0-nav-menu -->

  收起态此前有两处**功能缺失**，叠在一起等于「侧栏收起后没有子菜单」：

  **1. 只渲染一级子项。** 旧实现的 collapsed 分支是 `item.children!.map(FlyoutLeaf)` —— 没有递归。
  三级及以下的菜单项在 DOM 里**根本不存在**（不是隐藏，是不渲染），窄屏/收起态下彻底不可达。
  现在飞出层递归渲染整棵子树，与 inline 态能力对齐：

  - 每层一个 `role="group"` 面板，父项带 `aria-haspopup` + 右向 chevron，显隐靠
    `li:hover>&` / `li:focus-within>&` **直接子选择器**（不用同名 `group-hover/x:`——那是后代选择器，
    祖先 hover 会连带点亮所有后代面板，三四级同时炸开）
  - 键盘改走「级联菜单」语义：`→` 进子层、`←`/`Esc` 回父层、`↑↓` 只在**同层兄弟**间移动、
    `Home/End` 落本层首尾；roving tabindex 贯穿全树（整棵树一个 tab 落点）
  - 深层项选中时，tab 落点收敛到它的**顶层祖先**（图标轨上真实可见的那颗），不落进未展开的深处；
    祖先链带 `data-selected` 弱高亮

  **2. 面板被祖先 `overflow` 整块裁掉。** 图标轨几乎总住在可滚动的侧栏容器里——`AdminLayout`
  自己就把 NavMenu 包在 `ScrollArea` 中。`position: absolute` 的面板会被那个祖先裁掉：面板在 DOM 里、
  有尺寸、`opacity: 1`，**却一个像素都画不出来**（`elementFromPoint` 打到的是内容区）。
  所以第一层面板改用 `position: fixed` + JS 实测坐标（挂载时量一次，`scroll` 捕获阶段与 `resize`
  时重算）；第二层起仍是 `absolute`，因为它们的祖先已经是不裁剪的面板。

  未定位的那一帧**不用 `visibility: hidden` 兜**：那会把整棵子树摘出无障碍树，等于把上面刚补的
  「深层项 DOM 恒在」再拿掉一半。面板静息态本就是 `opacity-0`，首帧位置不对也画不出来。

  已知代价（已写进 nav-menu.md 禁忌区）：把图标轨放进**不派发 scroll 事件的自定义滚动实现**时，
  第一层面板的位置会失准。

## 0.9.0

### Minor Changes

- 72b94d4: Toast 语调补齐五档：`ToastTone` 由 `info | danger | neutral` 扩到 `neutral | info | success | warning | danger`，与 Alert / Tag 对齐。

  `success` / `warning` 复用 tokens 里早已存在的 `--color-success` / `--color-warning`（此前类型注释所述「token 无」与事实不符），左边条与标题着色随之补 `border-l-success` / `text-success` 与 `border-l-warning` / `text-warning`。消费端不必再把成功态降级成 `info`、警告态降级成 `neutral`。

  `priority` 维持现状：仅 `danger` 走 `high`（assertive 打断播报），`warning` 与其余 tone 一样是 polite。纯新增，无破坏性变更。

### Patch Changes

- 20c98d3: fix(dialog): DialogContent 封顶 85dvh 并让正文内部滚动

  此前 Popup 没有任何高度约束与 overflow 处理，内容一长就顶穿视口：正文向上下溢出屏幕，
  footer 被推到可视区外，「确定 / 保存」按钮点不到，且没有任何滚动条可用。表单类弹窗
  （多凭据字段 + 说明 Alert）必然触发。

  改为与 DrawerContent 同一套三段式（该组件早已是此写法，两者此前行为不一致）：

  - Popup: `flex max-h-[85dvh] flex-col`
  - Title / Description: `shrink-0`
  - 正文: `min-h-0 flex-1 overflow-y-auto`（`min-h-0` 必需，否则 flex item 的
    `min-height:auto` 会让正文撑开父级、overflow 永不生效）
  - Footer: `shrink-0`

  短内容不受影响：未达 max-h 时弹窗仍按内容高度自适应，不出滚动条。
  ModalForm / DrawerForm 复用 Dialog 引擎，一并受益。

## 0.8.0

### Minor Changes

- 7830039: AdminLayout 新增 `breakpoint` 响应式断点（与 LayoutSider 同语义：视口 ≤ 断点自动收起侧栏、> 时展开；受控时只回调 onCollapsedChange），修复窄屏侧栏挤占屏宽（#14）；ToastProvider 支持透传渲染 children，包裹式 `<ToastProvider><App/></ToastProvider>` 不再静默吞掉应用子树（#13）。

## 0.7.1

### Patch Changes

- 5ea7c69: MarkdownEditor：tiptap-markdown 0.8.x 类型绑 @tiptap/core v2，源码分发下消费方 tsc 报 Extension 与 AnyExtension 不匹配（vite 构建不受影响）——extensions 处显式收口为 AnyExtension，消费方 tsc 恢复干净。

## 0.7.0

### Minor Changes

- eec0d69: BarChart horizontal 类目轴宽按最长标签自适应（CJK 全角估宽·48–160px）+ yAxisWidth 逃生舱，修复 CJK ≥4 字截断（#6）；Heatmap 支持小数值域 domain=[min,max] 按值域比例分档、valueFormat/unit 格式化 tooltip 与图例、showLegend 色阶图例（#10）。

## 0.6.0

### Minor Changes

- 0278e6d: feat(voice-record): 新增 VoiceRecord 语音录制组件，并修复「按住说话」在移动端的交互死锁

  - 交互改为纯 Pointer Events，移除叠加的 `onTouchStart/onTouchEnd`，消除触屏上 pointer 与 touch 各触发一次导致的双重 start，同时消掉 passive listener 里 `preventDefault` 的告警。
  - 新增 `onPointerCancel` 处理：iOS 手势被系统打断时浏览器派发的是 pointercancel 而非 pointerup，此前会导致永远收不到「松手」而死锁在录音态。
  - 松手判定改用本地按压 ref，不再依赖父组件异步 `status` prop 的回环，避免快速点按时停止被丢弃。

## 0.5.0

### Minor Changes

- 迁移 Base UI 到稳定版：同伴包从已废弃的 `@base-ui-components/react@1.0.0-rc.0` 换为 `@base-ui/react@^1.5.0`（官方改名后的稳定线），消除安装时的 deprecated 警告。 <!-- parity-id: ui-0.5.0-base-ui -->

  **破坏性（peer）**：消费者需把安装的同伴包从 `@base-ui-components/react` 换成 `@base-ui/react`。组件 API 与导入方式（从根入口 `@hulianui/ui` 导入）不变。

  附带：Collapsible 等组件的 `disabled` 现遵循 Base UI 1.x 行为，用 `aria-disabled` + `data-disabled` 标记（保持可聚焦），不再设原生 `disabled` 属性。移除了 rc.0 时期的 Toast flushSync 补丁（修复已上游合入稳定版）。

## 0.4.2

### Patch Changes

- 修复：`lucide-react` 之前误放在 `devDependencies`，但大量组件运行时 import 它，导致 monorepo 之外的消费者打包时报 `Could not resolve "lucide-react"`。已改为 `dependencies`，安装时自动带上。同时把仅离线烘焙用的 `*.bake.mjs`（引用 dotted-map/proj4 等开发期工具）排出发布包。 <!-- parity-id: ui-0.4.2-lucide -->

## 0.4.1

### Patch Changes

- 发布包瘦身：排除 `*.test.ts` / `*.test.tsx`，367 个测试文件不再随包发布（tarball 2181→1814 文件、解包 6.6MB→5.5MB）。`./showcase` 公开入口与组件源照常保留。 <!-- parity-id: ui-0.4.1-package -->

## 0.4.0

### Minor Changes

- 2bf8ebc: AI-first 组件文档体系 + Vant 式 examples API + 12 组件 bug 修复

  - 新增 `ExampleSpec` 类型与 `ShowcaseSpec.examples` 字段：Vant 式「用法」场景（标题 + 说明 + 可复制代码 + 活预览）。
  - 353 组件逐件使用文档（`<slug>.md`），API 表按 Props / Events / Slots 拆分；产出 `llms.txt` / `llms-full.txt` / `registry.json` 供 AI 消费。
  - 修 Markdown 表格 GFM 转义管道解析（`\|` 与代码段内裸管道不再劈列）。
  - 修 12 个组件 bug（含 conversation 自动贴底打断上滚、message-actions/lanyard 卸载未清理、true-focus/gantt 越界、cubes 背面重叠等），10 个附单测。

## 0.3.0

### Minor Changes

- Admin-grade data component growth, driven by the admin-starter vertical slices: <!-- parity-id: ui-0.3.0-admin -->

  - **pro-table**: cursor pagination mode for managed requests (`paginationMode="cursor"`, prev/next navigation with internal cursor stack, resets on filter/sort/pageSize changes); `pageSizeOptions` with per-page switcher; managed request rejections are now caught (`onRequestError` prop, defaults to console.error); `search.onSearch` is now optional in types (runtime was already optional).
  - **table**: `rowClassName` row-level styling hook (merges with zebra/selection classes); customizable empty state via `emptyText`/`renderEmpty`, default text now flows through the locale system (`table.empty`, zh/en).
  - **steps-form**: per-step navigation control (`nextDisabled`/`nextText`/`showNav`) and async `onStepValidate` with loading state on the forward button; all new props optional, default behavior unchanged.

  Note: `Locale` gained a required `table.empty` field — consumers spreading `zhCN`/`enUS` are unaffected; hand-built full `Locale` objects need the new key.

- New agent/conversation building blocks: `Dossier` (slot-filling progress panel), `Artifact` + `ConfirmCard` (inline conversation cards), `ThreadList` (conversation history sidebar), `ImageCropper` (react-easy-crop wrapper with fixed-ratio frame and pinch zoom), `Conversation` `hideScrollbar` prop, and `ThemeProvider` `forcedTheme` for route-level forced theming. <!-- parity-id: ui-0.3.0-agent -->

### Patch Changes

- Fixes: chat-message bubble max-width constrained by available width (mobile overflow); prompt-input focus ring-offset residue (ring-0 paired with ring-offset-0); thread-list delete button 44px touch target. <!-- parity-id: ui-0.3.0-fixes -->

## 0.2.3

### Patch Changes

- d923732: 修复 17 个特效/动效组件的画廊展示问题（CDP 实测证据驱动 + 有头浏览器复验）：

  - WebGL shader 全黑：dither（ES 3.00 数组初始化器在 ES 1.00 编译失败 →Bayer 改程序式生成）、grid-scan / pixel-blast / shape-blur（fwidth 无导数支持 →shader 升 #version 300 es）
  - WebGL 颜色解析失败：ghost-cursor（ogl Color 不认 var()/oklch→getComputedStyle+离屏 canvas2d 转 rgb）、magic-rings（正则拆 rgb 撞 oklch 计算值 → 同款修法）
  - 默认色撞深色演示底：fuzzy-text、pixel-snow 默认色改按画布真实底色亮度自适应，亮暗主题均可读
  - card-swap：Fragment children 不被 Children.toArray 展开致 total=1 轮换从未启动 → 递归 flatten；motion v12 被中断动画 promise 永不归还 → 每段加超时兜底+在飞守卫；新增 placement="center" 解决画廊容器裁切
  - ballpit：窄容器超填充致剧烈抖动 → 新增面积占用率上限自适应（球数/半径随容器缩放）+ 位置校正式重叠分离 + 低速收敛
  - star-border：animation 简写含两个方向关键字属非法 CSS 整条被丢 → 拆为合法 alternate / alternate-reverse 双向流光
  - orbit-images：offset-path 绝对坐标不随容器缩放致子项全程在视野外 → 真缩放层 + 动画失效时静态均匀分布兜底
  - scroll-float：useScroll 盲绑视口在内滚容器中进度钉死 → 自动探测可滚动祖先（static 容器自动补 relative），无滚动上下文降级 in-view 浮现
  - target-cursor：默认改容器作用域（absolute+容器事件+离开即隐藏），多实例互不干扰；新增 fullScreen prop 保留全页模式
  - ripple-button：波纹 span 补 transform: scale(0) 基线 + 键盘/程序化激活从中心扩散
  - text-pressure：字符盒宽与缩放同步，相邻字符不再重叠

## 0.2.2

### Patch Changes

- 3b81b35: fix(ui): 消除 Base UI rc.0 Toast 的 React 19 flushSync 告警

  Toast 出现时 `ToastRoot` 在 layout effect 里调 `ReactDOM.flushSync` 写回测得高度，React 19 报 `flushSync was called from inside a lifecycle method`（dev 下每次 2 条：1 条正常 + 1 条 StrictMode 双调用）。经 `pnpm patch` 把 base-ui 的 `recalculateHeight` 改为 `flushSync` 可选形参（默认关），对齐上游 mui/base-ui master 修复——layout-effect 路径直接 setState（React 本就在 paint 前同步 flush，无需 flushSync 且无闪烁），observer 回调仍走 flushSync。

  仅影响 dev 控制台噪声（production 本就剥离该警告）。注意：补丁经 `patchedDependencies` 落地，惠及本仓库 + dev 软链消费方；npm 发布版不携带该补丁，registry 消费方如遇同告警需各自加同款 patch。

## 0.2.1

### Patch Changes

- 6195d52: fix(book-3d): 修复立体书三处渲染缺陷

  - 页块/书脊补 `translateZ(-thk/2)` 在 z 轴居中，封面右缘不再被书页盖住
  - 翻开内页改 opacity 非对称门控（打开快入、关闭迟出），消除闭合态左缘穿帮，且翻开/关闭途中不再露出深色后封造成的黑页
  - 翻开模式后封改透明，消除内页淡入时白叠深色的灰色过渡

## 0.2.0

### Minor Changes

- 54d02ff: DialogContent 新增 `footer` 槽：渲染在正文下方、顶部分隔线 + 右对齐的操作区（取消/确定等），与 `DrawerContent` 的 `footer` API 对齐。补齐二者不一致的缺口。
- 9debc9e: ProTable 升级为浮起卡片表面 + Table 新增 `bordered` prop（mock-pilot dogfood 驱动）：

  - **ProTable**：根容器从「漂在页面底色上的透明描边框」改为完整的浮起卡片——`bg-surface` 表面 + 发丝边 `border-hairline` + `shadow-sm` 阴影 + `p-4`，与 `Card` 同层级。工具栏/表格/分页统一在卡内。全屏态不变。
  - **Table**：新增 `bordered?: boolean`（默认 `true`）。`false` 时去掉表格自身的描边框 + 圆角；ProTable 内层 Table 传 `bordered={false}`，由外层卡片提供外框，避免双框。基础 `Table` 独立使用时仍默认带框，行为不变。

- b8db07a: 表格表头与刷新键打磨（mock-pilot dogfood 驱动）：

  - **Table**：表头文字由 `text-muted` + `font-medium`（灰、中等）改为 `text-foreground` + `font-semibold`（黑/白、加粗），列标题更突出、层级更清晰。
  - **ProTable**：刷新键改为「仅在传入 `onReload` 时才渲染」。原先无论是否提供 `onReload` 都渲染刷新图标，未提供时点击无任何反应（死按钮）。现在无 handler 即不渲染；整条工具栏仍可用 `toolbar={false}` 或逐项 `toolbar={{ reload: false }}` 隐藏。

### Patch Changes

- 14c3b6d: 两处暗色/观感修复（mock-pilot dogfood 驱动）：

  - **Switch**：旋钮由 `bg-surface` 改为恒白 `bg-white`。原 `bg-surface` 在暗色=gray-900，比 off 轨道 gray-800 还暗且与面板同色，导致暗色 off 态整个开关「黑融黑」不可见；白旋钮在灰轨道与蓝轨道、亮暗两态都保证对比。
  - **Table**：虚拟滚动 sticky 表头背景由 `bg-bg` 改为 `bg-surface`，匹配卡片表面而非页面底色。表头保持透明（muted + medium 文字 + 行底分隔线），不加填充灰底——表格本身已是 surface 卡片/带框原语，灰底带反而割裂观感。

## 0.1.2

### Patch Changes

- 新增主题感知的发丝边框令牌 `--color-hairline`（亮色 transparent / 暗色取 border）。有阴影的组件亮色去硬 border、暗色保留发丝轮缘，~34 处 `border-border` → `hairline`。 <!-- parity-id: ui-0.1.2-hairline -->

## 0.1.1

### Patch Changes

- video 组件 SSR 安全：MediaPlayer 加挂载守卫，首帧渲同比例占位、挂载后再渲真播放器，避免 Vidstack 在 SSR/静态导出时摸 `window` 报错。 <!-- parity-id: ui-0.1.1-video -->
