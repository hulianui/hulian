# @hulianui/ui

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
