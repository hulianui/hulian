# @hulianui/ui

## 0.10.0

### Minor Changes

- 新增 ColorField —— 紧凑单行颜色输入框（forms/advanced）

  表单里一行的颜色输入：左侧色块调起系统取色器 + 十六进制文本输入。与 ColorPicker 的分工是「不抢版面」——后者是完整取色面板（饱和度方块 + 格式切换器），适合独立占一块地方；ColorField 适合主题配置表、设计 token 编辑器这类一行一色的场景。

  - 短写自动展开：`#abc` → `#aabbcc`（逐位重复，不是 `#abc000`）
  - 内部维护草稿态，解决受控颜色输入没法手输的问题：受控值经规范化后回灌会让人敲到 `#3` 就被打回，所以键入期间以草稿为准、只在解析成功时抛值、失焦丢草稿归一
  - `onValueChange` 参数恒为规范化后的 `#rrggbb`，输入不合法时不触发
  - 草稿不合法时自身标红，无需外部传 `invalid`
  - 另导出纯函数 `normalizeHex` / `isHexColor`，供消费方校验导入的主题配置
  - 尺寸 sm/md/lg 复用 Input 的外壳变体，色块随之缩放

  动因：Quay 从 HeroUI 收敛到瑚琏时，`ColorField`（hex 文本输入）是库里唯一缺的等价物 —— 现有 ColorPicker 是完整面板，塞进设置页一行会撑坏版式。

- ProTable 托管模式增强：defaultSorting / params，以及内联 request 的无限请求防呆

  - `defaultSorting?: SortingState`：托管模式内部排序 state 的**首次挂载初值**（非受控默认值语义，后续改 prop 不回灌）。首拉即带 sort，因此能表达「默认按某列倒序」。展示模式的默认排序仍直接传受控 `sorting`
  - `params?: Record<string, unknown>`：托管模式固定查询参数，**浅比较**（键集合 + `Object.is` 逐值）后内容变化才回第 1 页重查，仅引用变化不触发——所以 `params={{ scopeId }}` 写内联对象字面量无需 `useMemo`
  - `request` 改由 ref 持有最新引用并**移出 effect 依赖数组**，改用 `managed = Boolean(request)` 驱动首拉。此前消费者写内联 `request={async (p) => …}` 会每次渲染换身份 → 无限请求

  `ProTableRequestParams` 增 `params` 字段（运行时恒有值，未传 prop 时为 `{}`）。**刻意不并入 `filters`**：`filters` 只装查询区提交值，固定条件不该被同名 filter 覆盖、也不该受查询区「重置」影响；需要合并的在 request 内自己写 `{ ...p.filters, ...p.params }`。

  两个已知代价，均已写进 pro-table.md 禁忌区：

  1. request 移出依赖后，「换一个 request 函数」本身不再触发重查（antd ProTable 同款取舍），要刷新请改 `params` 或调 `actionRef.reload()`
  2. `params` 只做浅比较，嵌套对象/数组每次 render 换引用仍会每次重查——组件层不兜底深比较，请拍平成一层或自己保持引用稳定

  `params` 变化的重置走「渲染期派生 state」而非 `useEffect`，好让新 params 与 `page=1` 在同一次提交生效，避免先用旧页码发一次废请求。

- 新增 RemoteSelect —— 远程搜索选择器（forms/advanced），含 multiple 多选

  补上库里唯一缺的「远程数据」能力：此前 Combobox 只有 Base UI 的本地 filter，选项必须先全量落到前端，门店/会员/商品这类几万条的字典没法用。RemoteSelect 把过滤权交给服务端。

  - `fetcher(query, { page, pageSize, signal })` 数据源，`signal` 在被新一次搜索取代时 abort；同时用请求序号丢弃过期响应（只 abort 不够——fetcher 可能忽略 signal，慢响应后到会覆盖新结果）
  - 输入防抖（默认 300ms），loading / 空态、`共 N 条` 页脚
  - 滚到底自动追加下一页；`total` 缺省时按「本页满页即可能还有」推断
  - **`resolveValue(values)` 初值回显**：编辑表单打开时 value 常不在首屏那一页里（在第 7 页、或被搜索词过滤掉），只有它能把 label 解出来。与 `fetcher` 是两个后端语义（按关键词分页搜 vs 按主键批量取），刻意不合并
  - `multiple` 多选复用 ComboboxChips 皮肤，已选但未加载的 value 同样靠 resolveValue 解出 chip 文案；chip 严格按 value 顺序渲染——底层 ChipRemove 按渲染序绑定 `selectedValue[index]`，乱序会删错项
  - `labelKey` / `valueKey` 映射任意后端字段名，`renderOption` 可拿到 `raw` 原始行

  顺带给 `ComboboxContent` 加了两个可选项（不设即与此前完全一致）：`onListScroll`（列表滚动回调，用于滚到底加载更多）与 `footer`（列表下方常驻页脚，不随列表滚动）。

  动因：对标 hulian-admin Vue 后台的 `baInput/remoteSelect.vue`（355 行），React 侧缺等价物，表单页的远程字典只能各自手搓。

- Select 新增 clearable / searchable / loading 与选项分组

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

- Table 新增列几何能力与行拖拽排序

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

- Upload 新增 limit / renderPreview / sortable，并拆出传输层 useUpload

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

- fix(nav-menu): collapsed 态飞出层补齐无限级级联，并改用 fixed 定位逃出侧栏裁剪

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

- 迁移 Base UI 到稳定版：同伴包从已废弃的 `@base-ui-components/react@1.0.0-rc.0` 换为 `@base-ui/react@^1.5.0`（官方改名后的稳定线），消除安装时的 deprecated 警告。

  **破坏性（peer）**：消费者需把安装的同伴包从 `@base-ui-components/react` 换成 `@base-ui/react`。组件 API 与导入方式（从根入口 `@hulianui/ui` 导入）不变。

  附带：Collapsible 等组件的 `disabled` 现遵循 Base UI 1.x 行为，用 `aria-disabled` + `data-disabled` 标记（保持可聚焦），不再设原生 `disabled` 属性。移除了 rc.0 时期的 Toast flushSync 补丁（修复已上游合入稳定版）。

## 0.4.2

### Patch Changes

- 修复：`lucide-react` 之前误放在 `devDependencies`，但大量组件运行时 import 它，导致 monorepo 之外的消费者打包时报 `Could not resolve "lucide-react"`。已改为 `dependencies`，安装时自动带上。同时把仅离线烘焙用的 `*.bake.mjs`（引用 dotted-map/proj4 等开发期工具）排出发布包。

## 0.4.1

### Patch Changes

- 发布包瘦身：排除 `*.test.ts` / `*.test.tsx`，367 个测试文件不再随包发布（tarball 2181→1814 文件、解包 6.6MB→5.5MB）。`./showcase` 公开入口与组件源照常保留。

## 0.4.0

### Minor Changes

- 2bf8ebc: AI-first 组件文档体系 + Vant 式 examples API + 12 组件 bug 修复

  - 新增 `ExampleSpec` 类型与 `ShowcaseSpec.examples` 字段：Vant 式「用法」场景（标题 + 说明 + 可复制代码 + 活预览）。
  - 353 组件逐件使用文档（`<slug>.md`），API 表按 Props / Events / Slots 拆分；产出 `llms.txt` / `llms-full.txt` / `registry.json` 供 AI 消费。
  - 修 Markdown 表格 GFM 转义管道解析（`\|` 与代码段内裸管道不再劈列）。
  - 修 12 个组件 bug（含 conversation 自动贴底打断上滚、message-actions/lanyard 卸载未清理、true-focus/gantt 越界、cubes 背面重叠等），10 个附单测。

## 0.3.0

### Minor Changes

- Admin-grade data component growth, driven by the admin-starter vertical slices:

  - **pro-table**: cursor pagination mode for managed requests (`paginationMode="cursor"`, prev/next navigation with internal cursor stack, resets on filter/sort/pageSize changes); `pageSizeOptions` with per-page switcher; managed request rejections are now caught (`onRequestError` prop, defaults to console.error); `search.onSearch` is now optional in types (runtime was already optional).
  - **table**: `rowClassName` row-level styling hook (merges with zebra/selection classes); customizable empty state via `emptyText`/`renderEmpty`, default text now flows through the locale system (`table.empty`, zh/en).
  - **steps-form**: per-step navigation control (`nextDisabled`/`nextText`/`showNav`) and async `onStepValidate` with loading state on the forward button; all new props optional, default behavior unchanged.

  Note: `Locale` gained a required `table.empty` field — consumers spreading `zhCN`/`enUS` are unaffected; hand-built full `Locale` objects need the new key.

- New agent/conversation building blocks: `Dossier` (slot-filling progress panel), `Artifact` + `ConfirmCard` (inline conversation cards), `ThreadList` (conversation history sidebar), `ImageCropper` (react-easy-crop wrapper with fixed-ratio frame and pinch zoom), `Conversation` `hideScrollbar` prop, and `ThemeProvider` `forcedTheme` for route-level forced theming.

### Patch Changes

- Fixes: chat-message bubble max-width constrained by available width (mobile overflow); prompt-input focus ring-offset residue (ring-0 paired with ring-offset-0); thread-list delete button 44px touch target.

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

- 新增主题感知的发丝边框令牌 `--color-hairline`（亮色 transparent / 暗色取 border）。有阴影的组件亮色去硬 border、暗色保留发丝轮缘，~34 处 `border-border` → `hairline`。

## 0.1.1

### Patch Changes

- video 组件 SSR 安全：MediaPlayer 加挂载守卫，首帧渲同比例占位、挂载后再渲真播放器，避免 Vidstack 在 SSR/静态导出时摸 `window` 报错。
