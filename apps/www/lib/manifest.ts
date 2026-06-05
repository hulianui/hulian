// 瑚琏文档站 IA 元数据 —— 纯数据 SSOT，零 @hulian/ui import，server / client 皆可安全读。
//
// 分区原则（2026-06 重构）：按「组件本质 / 你拿它干什么」分两级（大类 category → 小类 group），
// 而非按「会不会动」这种技术属性分。"动效" 不再是一个货架位置，而是横切标签 tags:["animated"]——
// AuroraText 本质是文字 → 归排版；ShimmerButton 本质是按钮 → 归表单；想"搞点炫的"用 animated 过滤。
// 只有没有功能本体、纯装饰的（光束/背景/放大镜）才进 decoration。

export type CategoryKey =
  | "layout"
  | "typography"
  | "forms"
  | "data-display"
  | "navigation"
  | "feedback"
  | "ai"
  | "decoration"
  | "mockups"
  | "mobile";

/** 横切属性标签：不决定组件归属，仅供侧栏过滤芯片跨分组筛选。 */
export type ComponentTag = "animated" | "webgl";

export interface CategoryGroup {
  key: string;
  label: string;
}

export interface Category {
  key: CategoryKey;
  label: string;
  groups: CategoryGroup[];
}

export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
  category: CategoryKey;
  /** 小类 key，须存在于其 category 的 groups 中（manifest.test 校验）。 */
  group: string;
  tags?: ComponentTag[];
  status: "stable" | "new";
}

export const CATEGORIES: Category[] = [
  {
    key: "layout",
    label: "布局",
    groups: [
      { key: "container", label: "容器" },
      { key: "arrange", label: "排布" },
    ],
  },
  {
    key: "typography",
    label: "排版",
    groups: [
      { key: "text", label: "文本" },
      { key: "code", label: "代码" },
    ],
  },
  {
    key: "forms",
    label: "表单",
    groups: [
      { key: "button", label: "按钮" },
      { key: "basic", label: "基础录入" },
      { key: "advanced", label: "高级录入" },
      { key: "datetime", label: "日期时间" },
      { key: "framework", label: "表单框架" },
    ],
  },
  {
    key: "data-display",
    label: "数据展示",
    groups: [
      { key: "collection", label: "集合" },
      { key: "info", label: "信息标记" },
      { key: "stat", label: "统计度量" },
      { key: "placeholder", label: "占位" },
    ],
  },
  {
    key: "navigation",
    label: "导航",
    groups: [
      { key: "global", label: "全局导航" },
      { key: "inpage", label: "页内导航" },
      { key: "action", label: "触发与工具" },
    ],
  },
  {
    key: "feedback",
    label: "反馈",
    groups: [
      { key: "overlay", label: "浮层" },
      { key: "message", label: "提示" },
      { key: "loading", label: "加载与进度" },
      { key: "guide", label: "引导" },
    ],
  },
  {
    key: "ai",
    label: "AI 智能体",
    groups: [
      { key: "conversation", label: "对话" },
      { key: "agent", label: "推理与工具" },
      { key: "assist", label: "辅助" },
    ],
  },
  {
    key: "decoration",
    label: "装饰",
    groups: [
      { key: "backdrop", label: "背景" },
      { key: "overlay-fx", label: "覆盖特效" },
    ],
  },
  {
    key: "mockups",
    label: "设备外壳",
    groups: [
      { key: "window", label: "窗口" },
      { key: "device", label: "设备" },
    ],
  },
  {
    key: "mobile",
    label: "移动端",
    groups: [
      { key: "nav", label: "导航" },
      { key: "overlay", label: "浮层" },
      { key: "input", label: "录入" },
      { key: "gesture", label: "手势交互" },
      { key: "layout", label: "布局" },
    ],
  },
];

export const manifest: ComponentMeta[] = [
  // ── 布局 layout ──────────────────────────────────────────────
  { slug: "layout", name: "Layout", description: "整页布局 · 复合 Header/Sider/Content/Footer + Sider 可折叠(受控/断点/trigger) + 宽度过渡(零依赖·尽量 RSC·复用 ScrollArea)", category: "layout", group: "container", status: "new" },
  { slug: "admin-layout", name: "AdminLayout", description: "中后台骨架 · 侧栏(品牌+NavMenu可折叠) + 顶栏(折叠/面包屑/扩展区) + 多页签导航(开/切/关·关闭其他/全部·受控接路由或菜单点击自动维护) + 内容区(复用 NavMenu/ScrollArea/Popover·企业应用外壳)", category: "layout", group: "container", status: "new" },
  { slug: "scroll-area", name: "ScrollArea", description: "滚动区 · Base UI 自定义细滚动条 + 竖/横/双向", category: "layout", group: "container", status: "new" },
  { slug: "viewport", name: "Viewport", description: "响应式容器 · container-type 容器查询上下文 + web/平板/手机 预设宽度(可 width 覆盖) + 可选设备切换器(dogfood Segmented) · 内部组件用 @md/@5xl 等容器变体按【容器宽度】自适应而非页面视口(跨设备同套布局自动重排)", category: "layout", group: "container", status: "new" },
  { slug: "resizable", name: "Resizable", description: "拖拽分栏 · 复合 PanelGroup/Panel/Handle + 横竖向 + min/max + 键盘微调(零依赖·role=separator)", category: "layout", group: "container", status: "new" },
  { slug: "aspect-ratio", name: "AspectRatio", description: "比例容器 · CSS aspect-ratio 锁宽高比 + 图片/视频自动铺满(零依赖·RSC)", category: "layout", group: "container", status: "new" },
  { slug: "fit-screen", name: "FitScreen", description: "大屏适配 · 固定设计尺寸(默认 1920×1080)等比缩放铺满父容器并居中 + fit/cover/stretch 三模式(纯函数 computeFit 可测·ResizeObserver 监听·SSR 安全·数据可视化大屏刚需)", category: "layout", group: "container", status: "new" },
  { slug: "masonry", name: "Masonry", description: "瀑布流布局 · 确定性 round-robin 分列(item[i]→第 i%列·SSR 安全·顺序稳定·非 CSS columns 抖动) + 响应式列数(base/sm/md/lg·首帧 base 防 hydration mismatch·挂载后 matchMedia 调整) + 列内外统一 gap(泛型·token 主题)", category: "layout", group: "container", status: "new" },
  { slug: "stack", name: "Stack", description: "弹性布局 · flex 原语 direction/gap/align/justify/wrap + as 多态(零依赖·RSC)", category: "layout", group: "arrange", status: "new" },
  { slug: "grid", name: "Grid", description: "栅格布局 · grid 原语 cols/gap + GridItem 跨列跨行(零依赖·RSC)", category: "layout", group: "arrange", status: "new" },
  { slug: "spacer", name: "Spacer", description: "间距 · x/y × 0.25rem 布局留白 + aria-hidden + RSC", category: "layout", group: "arrange", status: "new" },
  { slug: "divider", name: "Divider", description: "带文字分隔 · orientation 左/中/右 + dashed/plain + 行内垂直(纯皮肤·零依赖·RSC·与 Separator 互补)", category: "layout", group: "arrange", status: "new" },
  { slug: "separator", name: "Separator", description: "分隔线 · Base UI role=separator + 横/竖几何", category: "layout", group: "arrange", status: "new" },

  // ── 排版 typography ──────────────────────────────────────────
  { slug: "text", name: "Text", description: "文本 · size/tone/weight + 单行省略/多行截断 + as 多态(纯皮肤·零依赖·RSC)", category: "typography", group: "text", status: "new" },
  { slug: "heading", name: "Heading", description: "标题 · 1-6 级语义标签 + size/weight + as 多态(纯皮肤·零依赖·RSC)", category: "typography", group: "text", status: "new" },
  { slug: "prose", name: "Prose", description: "排版容器 · 富文本/markdown 后代选择器统一吃语义 token(纯皮肤·零依赖·RSC)", category: "typography", group: "text", status: "new" },
  { slug: "markdown", name: "Markdown", description: "只读 Markdown 渲染 · 零依赖块级解析(标题/代码块/列表/引用/行内粗斜码链) · 套 Prose 排版 + 围栏代码块委托 CodeBlock · 区别 MarkdownEditor 可编辑 · RSC 安全", category: "typography", group: "text", status: "new" },
  { slug: "aurora-text", name: "AuroraText", description: "极光文字 · bg-clip 流动渐变 + chart token + RSC", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "animated-shiny-text", name: "AnimatedShinyText", description: "高光文字 · 横扫高光 + 徽标气质 + RSC", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "animated-gradient-text", name: "AnimatedGradientText", description: "渐变文字 · 行内 chart 渐变流动 + RSC", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "word-rotate", name: "WordRotate", description: "轮换词 · motion 进出场 + reduced-motion", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "typing-animation", name: "TypingAnimation", description: "打字机 · 逐字 + 闪烁光标 + 进入视口触发", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "sparkles-text", name: "SparklesText", description: "星闪文字 · 随机小星脉冲(客户端生成) + token", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "code", name: "Code", description: "行内代码 · <code> 等宽皮肤 + tone(default/primary/danger) + RSC", category: "typography", group: "code", status: "new" },
  { slug: "code-block", name: "CodeBlock", description: "代码块 · 多行 <pre> + 一键复制(剪贴板+反馈) + 可选语言标签", category: "typography", group: "code", status: "new" },
  { slug: "snippet", name: "Snippet", description: "代码片段 · 命令提示符 + 一键复制(剪贴板+反馈)", category: "typography", group: "code", status: "new" },
  { slug: "code-diff", name: "CodeDiff", description: "代码对比 · 零依赖行级 LCS diff(纯函数 diffLines 可测) + unified 单栏/split 双栏 + 增绿删红行底色 + 双行号槽 + filename 头条与 +/− 摘要 · agent 改动/PR 评审", category: "typography", group: "code", status: "new" },
  { slug: "kbd", name: "Kbd", description: "按键 · <kbd> 等宽皮肤 + 组合键并排 + RSC", category: "typography", group: "code", status: "new" },

  // ── 表单 forms ───────────────────────────────────────────────
  { slug: "button", name: "Button", description: "按钮 · CVA 变体 + press 动效", category: "forms", group: "button", status: "stable" },
  { slug: "shimmer-button", name: "ShimmerButton", description: "微光按钮 · 边缘游走火花(conic) + token + RSC", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "rainbow-button", name: "RainbowButton", description: "彩虹按钮 · chart 流光底 + 模糊光晕 + RSC", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "pulsating-button", name: "PulsatingButton", description: "脉冲按钮 · 外扩光环(box-shadow) + RSC", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "ripple-button", name: "RippleButton", description: "波纹按钮 · 点击落点扩散(Material) + reduced-motion", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "button-group", name: "ButtonGroup", description: "按钮组 · 把若干 Button 连排成一体(抹内侧圆角/合并相邻边框/hover 项抬层) 或分离编组 + 横竖向 · 工具栏分段/拆分按钮/步进器(纯布局壳·不接管子按钮变体)", category: "forms", group: "button", status: "new" },
  { slug: "social-button", name: "SocialButton", description: "第三方登录按钮 · 微信/支付宝/QQ/微博 + GitHub/Google/Apple/X 品牌 logo(内联 simple-icons·零依赖) + outline/solid 变体 + 纯 logo 方钮 + loading · 黑白系品牌 solid 随主题前景避暗色不可见", category: "forms", group: "button", status: "new" },
  { slug: "input", name: "Input", description: "输入框 · Base UI Field + 前后缀 + invalid", category: "forms", group: "basic", status: "new" },
  { slug: "textarea", name: "Textarea", description: "多行输入 · 自适应高度", category: "forms", group: "basic", status: "new" },
  { slug: "select", name: "Select", description: "下拉选择 · Base UI overlay 单选 + items 自动 label", category: "forms", group: "basic", status: "new" },
  { slug: "checkbox", name: "Checkbox", description: "复选框 · 三态(含半选) + Base UI", category: "forms", group: "basic", status: "new" },
  { slug: "checkbox-group", name: "CheckboxGroup", description: "复选组 · Base UI 值数组协调 + 复用瑚琏 Checkbox", category: "forms", group: "basic", status: "new" },
  { slug: "radio", name: "Radio", description: "单选 · RadioGroup 单选组 + 键盘方向键", category: "forms", group: "basic", status: "new" },
  { slug: "switch", name: "Switch", description: "开关 · Base UI 受控 + ARIA", category: "forms", group: "basic", status: "stable" },
  { slug: "toggle", name: "Toggle", description: "切换按钮 · Base UI pressed 态 + ToggleGroup 单/多选", category: "forms", group: "basic", status: "new" },
  { slug: "segmented", name: "Segmented", description: "分段控制器 · 自研 radio 语义(方向键漫游) + active-tab CSS 变量滑块(零依赖)", category: "forms", group: "basic", status: "new" },
  { slug: "slider", name: "Slider", description: "滑块 · Base UI 单值/range + 键盘步进", category: "forms", group: "basic", status: "new" },
  { slug: "number-field", name: "NumberField", description: "数字步进 · Base UI ±按钮 + 键盘步进 + min/max", category: "forms", group: "basic", status: "new" },
  { slug: "secret-field", name: "SecretField", description: "密钥掩码字段 · sk-abc…wxyz 掩码(full/prefix-suffix) + 眼睛 toggle 显形 + 一键复制原值(同 Snippet idiom·1.5s 反馈) + 尾部动作槽(重置/吊销) + 受控 revealed(API key 管理刚需·复用 _icons Eye/Copy)", category: "forms", group: "advanced", status: "new" },
  { slug: "combobox", name: "Combobox", description: "自动补全 · 触发按钮 + 弹层内搜索(图4 范式)，亦支持内联输入；浮层锚到字段等宽", category: "forms", group: "advanced", status: "new" },
  { slug: "listbox", name: "Listbox", description: "可选列表 · WAI-ARIA roving tabindex + 单/多/纯动作 + typeahead(零依赖)", category: "forms", group: "advanced", status: "new" },
  { slug: "mentions", name: "Mentions", description: "@提及输入 · 复用 Textarea 皮肤 + 触发符唤起候选(镜像 div 测光标像素坐标) + aria-activedescendant 虚拟焦点(零依赖)", category: "forms", group: "advanced", status: "new" },
  { slug: "input-otp", name: "InputOTP", description: "验证码输入 · 分段自动跳格/退格回退/整段粘贴(零依赖)", category: "forms", group: "advanced", status: "new" },
  { slug: "rating", name: "Rating", description: "评分 · MUI 桥(emotion theme 读瑚琏 token) + 受控星级", category: "forms", group: "advanced", status: "new" },
  { slug: "upload", name: "Upload", description: "文件上传 · 拖拽落区/按钮形态 + accept/maxSize 校验 + 受控文件列表(状态/进度)，零依赖自研只发 onSelect", category: "forms", group: "advanced", status: "new" },
  { slug: "transfer", name: "Transfer", description: "穿梭框 · 左右双 listbox 面板 + 移动按钮(选中/全部) + 可选搜索 + 空态(零依赖·复用 Listbox/Empty)", category: "forms", group: "advanced", status: "new" },
  { slug: "cascader", name: "Cascader", description: "级联选择 · 触发器 + Popover 横向逐级面板列 + 路径数组受控 + click/hover 展开 + changeOnSelect · 复用树引擎核", category: "forms", group: "advanced", status: "new" },
  { slug: "tree-select", name: "TreeSelect", description: "树选择器 · 触发器 + Popover 浮层内嵌 Tree + 单选/多选(checkable)对称 + 树内搜索 · 复用树引擎核", category: "forms", group: "advanced", status: "new" },
  { slug: "region-cascader", name: "RegionCascader", description: "中国省市区级联 · 内置全量行政区划(国家统计局口径·3级) + 浮层搜索直达 + onChange 同回码与名 · dogfood Cascader", category: "forms", group: "advanced", status: "new" },
  { slug: "country-select", name: "CountrySelect", description: "国家/地区选择 · 内置 250 国(旗+中英文名+区号) + 单/多选 chips + 中英文/码/区号搜索 · dogfood Combobox(新增多选)", category: "forms", group: "advanced", status: "new" },
  { slug: "markdown-editor", name: "MarkdownEditor", description: "Markdown 编辑器 · WYSIWYG 罩 TipTap + 值进出 markdown 字符串 + 隐藏 input 桥 Field + 标准集工具栏", category: "forms", group: "advanced", status: "new" },
  { slug: "colorpicker", name: "ColorPicker", description: "颜色选择 · react-colorful 内核 + HEX/RGB/HSL 多格式输出与切换器(零依赖派生) + 瑚琏 token 皮肤", category: "forms", group: "advanced", status: "new" },
  { slug: "color-swatch-picker", name: "ColorSwatchPicker", description: "预设色块单选 · base-ui RadioGroup 换皮(方向键 a11y) + 选中 ring + mix-blend 勾(零依赖)", category: "forms", group: "advanced", status: "new" },
  { slug: "choicebox", name: "Choicebox", description: "卡片选择 · 复合 ChoiceboxGroup/Choicebox(标题/描述/图标卡片) · 单选(radio)/多选(checkbox)对称 + 受控非受控 + 网格列数 · 隐藏原生 input 承载键盘与 a11y(单选方向键漫游/多选空格切换) · 套餐/支付方式/订阅档位", category: "forms", group: "advanced", status: "new" },
  { slug: "emoji-picker", name: "EmojiPicker", description: "表情选择器 · 内联 emoji 数据集(7 分类·中英关键词) + 关键词搜索 + 分类页签 + 最近使用(受控/内部) · 搜索框 dogfood Input · onSelect 回传 emoji(零依赖·聊天/评论)", category: "forms", group: "advanced", status: "new" },
  { slug: "calendar", name: "Calendar", description: "日历 · MUI X 桥(DateCalendar) + 对外 ISO 字符串受控 + 瑚琏 token", category: "forms", group: "datetime", status: "new" },
  { slug: "date-picker", name: "DatePicker", description: "日期选择 · MUI X 桥(输入+弹层日历) + ISO 受控 + min/max", category: "forms", group: "datetime", status: "new" },
  { slug: "date-time-picker", name: "DateTimePicker", description: "日期时间选择 · MUI X 桥(年月日+时钟一体弹层) + ISO 受控 + 步进/秒", category: "forms", group: "datetime", status: "new" },
  { slug: "date-range-picker", name: "DateRangePicker", description: "日期区间 · 自研零依赖双月范围日历(避开 MUI Pro 收费) + Popover 引擎 + 快捷预设/min-max/disabledDate · ISO 数组受控", category: "forms", group: "datetime", status: "new" },
  { slug: "time-field", name: "TimeField", description: "时间输入 · MUI X 桥(分段编辑 HH:mm 24h) + ISO 受控", category: "forms", group: "datetime", status: "new" },
  { slug: "form", name: "Form", description: "表单容器 · Base UI 结构化提交 + errors 按 name + 与 Field 协同", category: "forms", group: "framework", status: "new" },
  { slug: "form-dialog", name: "ModalForm / DrawerForm", description: "弹窗/抽屉表单 · 列表页新增/编辑编排件(复用 Dialog/Drawer + useForm + Button footer) · 提交前自动 validate · async onFinish 成功关闭/失败保持 · 文案接 i18n", category: "forms", group: "framework", status: "new" },
  { slug: "pro-form", name: "ProForm", description: "内联表单编排 · useForm + 自动 footer(提交/重置) + async onFinish loading + 自定义 footer(ModalForm 的内联姊妹件·文案接 i18n)", category: "forms", group: "framework", status: "new" },
  { slug: "steps-form", name: "StepsForm", description: "分步表单 · 复用 Steps 指示器 + 上一步/下一步/提交导航 + onStepValidate 逐步校验 + 跨步保值(消费者 useForm 持有·文案接 i18n)", category: "forms", group: "framework", status: "new" },
  { slug: "login-form", name: "LoginForm", description: "登录模板 · 自管 useForm(账号/密码必填+记住我) + 提交 loading + logo/footer 插槽(复用 Field/Input/Checkbox/Button·文案接 i18n)", category: "forms", group: "framework", status: "new" },
  { slug: "field", name: "Field", description: "字段包装 · label/help/error a11y 串联", category: "forms", group: "framework", status: "new" },
  { slug: "search-form", name: "SearchForm", description: "查询筛选表单 · 中后台列表页顶部条件区 · fields 配置 + 固定列栅格 + 一行折叠 + 查询/重置(dogfood Grid/Field/Input/Select/Button·零依赖)", category: "forms", group: "framework", status: "new" },

  // ── 数据展示 data-display ────────────────────────────────────
  { slug: "table", name: "Table", description: "表格 · TanStack headless + 列排序 + 空态", category: "data-display", group: "collection", status: "new" },
  { slug: "pro-table", name: "ProTable", description: "高级表格 · 列表页编排层(复用 Table/SearchForm/Pagination) · 查询区 + 工具栏(密度/列设置/刷新/全屏) + 行选择 + 集成分页(企业中后台列表页旗舰)", category: "data-display", group: "collection", status: "new" },
  { slug: "pricing-table", name: "PricingTable", description: "定价对比矩阵 · 行列转置(列=被比项/模型·行=属性/价目) + 列高亮描边 + 角标(推荐/最佳性价比) + 表头吸顶 + 窄屏横滚(复用 ScrollArea·区别 Table 行=记录·模型市场定价对照刚需)", category: "data-display", group: "collection", status: "new" },
  { slug: "json-viewer", name: "JsonViewer", description: "折叠 JSON 树(只读) · 递归零依赖 + 语法着色(key/string/number/bool/null) + 行级展开折叠 + 折叠态 {…} N keys/[…] N items + depth<阈值初始展开/大对象懒展开 + hover 复制节点值与 JSON path(网关请求/响应日志检查器刚需·导出 valueType/jsonPath 纯函数)", category: "data-display", group: "collection", status: "new" },
  { slug: "editable-table", name: "EditableTable", description: "行内编辑表格 · 行级编辑(草稿副本/保存校验/取消还原) + 自定义编辑器(editor 逃生舱) + 增删行 + 列对齐/宽度(企业录入场景·文案接 i18n)", category: "data-display", group: "collection", status: "new" },
  { slug: "list", name: "List", description: "数据列表 · 复合 List/ListItem/ListItem.Meta + actions/size/bordered/split/grid + 空态/分页/加载更多(零依赖·复用 Empty/Pagination/Avatar/User)", category: "data-display", group: "collection", status: "new" },
  { slug: "descriptions", name: "Descriptions", description: "描述列表 · 详情页键值对 + horizontal/vertical + bordered + span 跨列(纯皮肤·RSC)", category: "data-display", group: "collection", status: "new" },
  { slug: "tree", name: "Tree", description: "递归树 · 自研零依赖引擎 + WAI-ARIA tree(roving/方向键/typeahead) + checkable 父子级联半选 + 连接线 + 树内搜索 + grid-rows 高度过渡", category: "data-display", group: "collection", status: "new" },
  { slug: "card", name: "Card", description: "卡片 · Header/Body/Footer 插槽", category: "data-display", group: "collection", status: "new" },
  { slug: "carousel", name: "Carousel", description: "轮播 · 自研零依赖 scroll-snap + 箭头/圆点/autoplay/loop + 拖拽/键盘(reduced-motion)", category: "data-display", group: "collection", status: "new" },
  { slug: "video", name: "Video", description: "视频播放器 · Vidstack 引擎 + 瑚琏 token 自搓皮肤(播放/进度/音量/倍速/PiP/全屏) + 文件/HLS + 章节标记/续播/结束屏", category: "data-display", group: "collection", status: "new" },
  { slug: "bento-grid", name: "BentoGrid", description: "错落栅格 · BentoGrid/BentoCard 复合 + 跨列跨行 + hover CTA(纯 CSS·RSC)", category: "data-display", group: "collection", status: "new" },
  { slug: "image", name: "Image", description: "图片 · 加载淡入 + 失败回退/占位 + isZoomed hover 放大 + radius", category: "data-display", group: "collection", status: "new" },
  { slug: "magic-card", name: "MagicCard", description: "魔法卡片 · 鼠标跟随径向高光(motion) + surface token", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "animated-list", name: "AnimatedList", description: "动效列表 · 子项逐个淡入上移入场(motion + 进入视口)", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "marquee", name: "Marquee", description: "跑马灯 · 纯 CSS 无缝循环 + hover 暂停 + 方向", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "sortable", name: "Sortable", description: "拖拽排序 · @dnd-kit headless + 键盘可拖(Space 抓起/方向键移动) + 手柄/整项两式 + 横竖向 · 受控 onChange(arrayMove)", category: "data-display", group: "collection", status: "new" },
  { slug: "kanban", name: "Kanban", description: "看板 · @dnd-kit headless 多容器 + 跨列/列内拖拽 + 键盘可拖 + 列头统计槽 + 空列占位 · 受控 onMove(消费者改业务字段) · 商机看板/任务流转旗舰", category: "data-display", group: "collection", status: "new" },
  { slug: "flow", name: "Flow", description: "节点画布编排器 · 零依赖原生 Pointer Events + SVG 贝塞尔连线 · 拖节点/拖桩连线/平移缩放/适配视图 + 受控 nodes/edges(onNodesChange/onConnect/删点删线) + renderNode 自定义节点内容 · 几何抽纯函数带单测 · AI 工作流/流程编排旗舰", category: "data-display", group: "collection", status: "new" },
  { slug: "sankey", name: "Sankey", description: "桑基图(库内首个) · 多层流向/分配比例 · 零依赖 SVG ribbon · 拓扑自动分层(未给 layer 按 links 推) + 节点高度/流宽按 value 占比 + 跨层一致比例尺(值域守恒) · hover 高亮关联链路 tooltip + 点击节点/连线下钻 · 调度流向/流量来源/预算分配/转化路径旗舰", category: "data-display", group: "collection", status: "new" },
  { slug: "sparkline", name: "Sparkline", description: "内联趋势迷你图 · 无轴无网格的极简趋势 · line/area/bar 三态 + highlightLast 末点圆点 + 原生 SVG <title> tooltip(RSC 安全零 JS) · 几何抽纯函数(归一化/path/柱矩形)带单测 · 表格内联/KPI 卡/负载趋势(零依赖)", category: "data-display", group: "info", status: "new" },
  { slug: "funnel", name: "Funnel", description: "漏斗图 · 阶段宽度按 value 比例 + 级间转化率徽标(本级/上一级) · 纵/横双向 + per-stage tone + renderStage 自定义 · computeFunnel 纯函数(不除零)带单测 · 任务漏斗/转化漏斗/留存(零依赖)", category: "data-display", group: "collection", status: "new" },
  { slug: "queue-lane", name: "QueueLane", description: "优先级泳道队列板 · 横向泳道 + 道头聚合队列指标(深度/平均等待/吞吐) · 只读队列监视器(区别 Kanban 拖拽工作流·FIFO+aging) + maxVisible 折叠「还有 N 条」 + onItemClick · groupByLane 保序分组纯函数带单测 · 任务总线/优先级队列(零依赖)", category: "data-display", group: "collection", status: "new" },
  { slug: "document-sheet", name: "DocumentSheet", description: "单据纸张 · A4 居中纸面(白底/暗色近黑纸·shadow·210mm 宽) + 打印态隔离(工具栏/阴影/外边距 print:hidden·data-document-sheet 钩子) + 内置打印按钮(onPrint ?? window.print) + 子件 Header(左右抬头)/Section(带小标题段)/Footer(签章位) · 报价单/发票等单据容器", category: "data-display", group: "collection", status: "new" },
  { slug: "gantt", name: "Gantt", description: "甘特图(只读) · 项目排期可视化 · 左固定列(按 group 分组小标题) + 右时间轴(day/week/month 刻度) · CSS grid + 百分比定位条形 + progress 深色填充层 + today 竖线 · 自带 UTC 日期数学(零依赖) · 横向滚动", category: "data-display", group: "collection", status: "new" },
  { slug: "scheduler", name: "Scheduler", description: "事件日历/排班 · 库首个事件日历件 · 月/周/日/资源四视图(横轴资源·纵轴时间) + 时间轴网格事件块 + 重叠并排 + 当前时间红线 · 零依赖原生 PointerEvents 拖空白建预约/拖事件改期/拖下缘改时长(全 snap 到 slot) · 受控 events/view/date(onEventsChange/onSlotDragCreate/onEventClick) + 内置 toolbar(前/今/后 + Segmented 视图) + renderEvent 自定义事件块 · 几何抽纯函数带单测 · 预约/排班旗舰", category: "data-display", group: "collection", status: "new" },
  { slug: "image-viewer", name: "ImageViewer", description: "图片查看器 · 全屏 Lightbox(portal+锁滚复用 dialog) · 受控 index 翻页(箭头/← →/序号) + 滚轮指针锚定缩放/双击 1x↔2x/拖拽平移(切图重置) + 底部缩略图条 + role=dialog aria-modal/Esc 关闭(仅渲当前图·零依赖)", category: "data-display", group: "info", status: "new" },
  { slug: "danmaku", name: "Danmaku", description: "弹幕引擎 · 轨道分配防重叠(等速模型·第二条入场后发车永不追尾) · scroll 滚动/top 顶部/bottom 底部三模式 + 轨道数/速度/密度(low/normal/high)/占屏比/透明度/暂停 + pointer-events none 穿透到底层视频 · 几何抽纯函数(allocateTrack/scrollDuration/estimateWidth)带单测 · 直播旗舰", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "live-chat", name: "LiveChat", description: "直播公屏 · 高频自动滚消息流 + message/enter(进场)/gift(送礼)/follow(关注)/system(系统)五类型默认皮肤 + 等级牌/身份徽标 + 置顶区 + 上滚查看历史时浮出「N 条新消息」恢复钮(贴底判定) + maxItems 窗口限流 + renderItem 逃生舱 + overlay 浅色态(叠加深色视频上白字) · 区别 AI 轮次制 Conversation", category: "data-display", group: "collection", status: "new" },
  { slug: "live-player", name: "LivePlayer", description: "直播播放器壳 · 自带极简 muted/loop/autoPlay video(非 VOD scrubber chrome·与 Video 互补) 或 surface 自定义画面 + LIVE 呼吸徽标(ping 红点) + 在线人数(dogfood NumberTicker 跳数) + 清晰度切换菜单 + 主播条(头像/名/关注钮) + overlay 弹幕飘心层与 footer 互动栏插槽 + 竖/横屏(9:16 / 16:9)", category: "data-display", group: "collection", status: "new" },
  { slug: "live-product-card", name: "LiveProductCard", description: "小黄车讲解卡 · 序号链接角标 + 现价/划线原价 + 讲解中脉冲徽标 + 库存/已售 + 秒杀限量角标 + 抢购按钮插槽 + row 列表行/card 网格卡两布局(直播带货标配·只消费 token·区别通用 Card)", category: "data-display", group: "info", status: "new" },
  { slug: "log-viewer", name: "LogViewer", description: "日志查看器 · 数据驱动行 lines(level/message/timestamp/source) + info/warn/error/debug/success 级别着色(纯函数 levelClass 可测) + autoScroll 新行贴底(复用 Conversation 法) + showTimestamp + wrap 折行/横滚 · 区别 Terminal mockup·真·流式输出", category: "data-display", group: "collection", status: "new" },
  { slug: "file-tree", name: "FileTree", description: "文件树 · 递归 nodes(file/folder) + 文件夹展开折叠(defaultExpanded) + 改动状态角标 A/M/D/U/R 着色(纯函数 statusMeta 可测·git status 语义) + selectedPath 受控高亮 + onSelect 回传 node+path · 复用 _icons Folder/File(新补)·devtools 左栏", category: "data-display", group: "collection", status: "new" },
  { slug: "virtual-list", name: "VirtualList", description: "虚拟滚动 · 包 @tanstack/react-virtual 仅渲染可见区 + 定高/变高(measureElement)双模 + initialRect 首帧可算 + 末行触发 onReachEnd(万行列表/长列表刚需)", category: "data-display", group: "collection", status: "new" },
  { slug: "infinite-scroll", name: "InfiniteScroll", description: "无限滚动 · IntersectionObserver 底部哨兵 + 自动定位可滚祖先作 root + 加载锁防重入 + hasMore 完结态(零依赖·分页加载)", category: "data-display", group: "collection", status: "new" },
  { slug: "badge", name: "Badge", description: "计数角标 · count/max 溢出 + dot + 自定义内容 + 包裹叠加(四角/offset)", category: "data-display", group: "info", status: "new" },
  { slug: "dot", name: "Dot", description: "状态圆点 · 5 语气状态色 + sm/md/lg + 呼吸 pulse(在线/进行中) + a11y label(role=status)(Tag/Chip 内嵌点的独立原语·纯CSS·RSC)", category: "data-display", group: "info", status: "new" },
  { slug: "status-dot", name: "StatusDot", description: "健康状态点 · 在线/降级/离线/维护四语义态(→success/warning/danger/neutral 映射) + 默认仅在线脉冲 + 状态文字 + 尾部数值槽(延迟/成功率)(封装 Dot·网关渠道健康墙刚需·纯CSS·RSC)", category: "data-display", group: "info", status: "new" },
  { slug: "chip", name: "Chip", description: "标签 · 可移除(onClose×) + dot + tone×variant(区别 Badge 计数)", category: "data-display", group: "info", status: "new" },
  { slug: "coupon", name: "Coupon", description: "优惠券 · 撕票造型(中缝虚线+上下半圆穿孔·纯CSS) + 满减/折扣/包邮三类 + 可领/已领/已用/过期四态 + 选券高亮(电商标配·只消费 token)", category: "data-display", group: "info", status: "new" },
  { slug: "tag", name: "Tag", description: "状态标签 · 5 语气状态色 + 状态圆点/呼吸进行态(pulse) + 图标 + 可关闭(企业状态标记·区别 Chip 令牌)", category: "data-display", group: "info", status: "new" },
  { slug: "avatar", name: "Avatar", description: "头像 · Base UI 图片+fallback", category: "data-display", group: "info", status: "new" },
  { slug: "avatar-circles", name: "AvatarCircles", description: "堆叠头像组 · 重叠 + ring + +N 计数(扩 Avatar·RSC)", category: "data-display", group: "info", status: "new" },
  { slug: "user", name: "User", description: "用户卡 · Avatar + 名称/描述组合(复用瑚琏 Avatar) + RSC", category: "data-display", group: "info", status: "new" },
  { slug: "qrcode", name: "QRCode", description: "二维码 · 编码内核 qrcode-generator + 瑚琏自渲 SVG(暗块合 path/crispEdges) + currentColor 吃主题 + UTF-8 中文 + 纠错级别 + 中心 logo(可 RSC)", category: "data-display", group: "info", status: "new" },
  { slug: "comment", name: "Comment", description: "评论 · 嵌套回复缩进 + 可选连接线 + 操作区 + comment/log 类型(复用 Avatar/Link·RSC)", category: "data-display", group: "info", status: "new" },
  { slug: "relative-time", name: "RelativeTime", description: "相对时间 · 时间戳→「3分钟前/昨天/2个月后」+ 自动 tick 刷新(可设间隔/受控基准) + 中英 locale · 纯函数 formatRelative/formatAbsolute 可测 · <time> 语义 + title 绝对时间 + SSR 安全(suppressHydrationWarning)", category: "data-display", group: "info", status: "new" },
  { slug: "credit-card", name: "CreditCard", description: "银行卡展示 · 卡号前缀识别品牌(visa/mastercard/amex/银联/jcb/discover) + 分组格式化/打码(纯函数可测) + token 渐变卡面 + 芯片/品牌字标 + 正反面(磁条/CVC) · 结算确认/钱包(纯展示·RSC)", category: "data-display", group: "info", status: "new" },
  { slug: "stat", name: "Stat", description: "指标卡 · KPI 数值/标签/升降趋势(无图表库)", category: "data-display", group: "stat", status: "new" },
  { slug: "statistic", name: "Statistic", description: "统计数值 · 千分位/precision/前后缀/valueStyle + 可选 NumberTicker 入场滚动 + Statistic.Countdown 倒计时(SSR 安全·零依赖·与 Stat 互补)", category: "data-display", group: "stat", status: "new" },
  { slug: "chart", name: "Chart", description: "图表 · recharts 直裹 + chart token 皮肤(Area/Bar)", category: "data-display", group: "stat", status: "new" },
  { slug: "meter", name: "Meter", description: "度量条 · Base UI role=meter(静态量占比，区别 Progress)", category: "data-display", group: "stat", status: "new" },
  { slug: "timeline", name: "Timeline", description: "时间线 · 复合 Timeline/Item + items 数组 + 彩色节点/自定义 dot + left/right/alternate + pending 加载态(纯皮肤·零依赖·RSC)", category: "data-display", group: "stat", status: "new" },
  { slug: "number-ticker", name: "NumberTicker", description: "数字滚动 · 进入视口 tween 到目标值 + reduced-motion", category: "data-display", group: "stat", tags: ["animated"], status: "new" },
  { slug: "world-map", name: "WorldMap", description: "点阵世界地图 · 预烘点阵(零依赖·吃主题) + 经纬度动画弧线(pathLength 画入 + 端点脉冲) + 独立节点 points(value 分大小/可选标签) + onPointClick 可点击键盘下钻(交互态放开 aria-hidden) + flyingMarker 沿飞线移动标记(✈️飞机/光点彗尾/箭头·offset-path 动效自动转向)", category: "data-display", group: "stat", tags: ["animated"], status: "new" },
  { slug: "empty", name: "Empty", description: "空状态 · 图标+标题+描述+操作槽 + 内置空箱图标 + sm/md(零依赖·RSC)", category: "data-display", group: "placeholder", status: "new" },
  { slug: "skeleton", name: "Skeleton", description: "骨架屏 · shimmer 高光占位(text/circle/rect) + 无边框组合预设 CardSkeleton/ListSkeleton/TableSkeleton", category: "data-display", group: "placeholder", status: "new" },
  { slug: "watermark", name: "Watermark", description: "水印 · 自研 canvas 平铺 + MutationObserver 防篡改 + 高清 DPR(零依赖·防截图泄密)", category: "data-display", group: "placeholder", status: "new" },

  // ── 导航 navigation ──────────────────────────────────────────
  { slug: "navbar", name: "Navbar", description: "导航栏 · 复合 Brand/Content/Item/MenuToggle + sticky + 移动端切换", category: "navigation", group: "global", status: "new" },
  { slug: "nav-menu", name: "NavMenu", description: "侧边导航菜单 · 自研零依赖 · inline 手风琴/collapsed 图标飞出 + 树形 items + 选中/展开受控 + 纯 CSS grid 高度过渡 + WAI-ARIA tree 键盘漫游", category: "navigation", group: "global", status: "new" },
  { slug: "navigation-menu", name: "NavigationMenu", description: "导航菜单 · Base UI navigation-menu 薄包(mega 面板/共享 Viewport 尺寸形变) + 触发器/内容/链接 + chevron 旋转", category: "navigation", group: "global", status: "new" },
  { slug: "menu", name: "Menu", description: "下拉菜单 · Base UI 命令式 + Item/分隔/分组 + danger", category: "navigation", group: "global", status: "new" },
  { slug: "menubar", name: "Menubar", description: "菜单条 · Base UI menubar 薄包(File/Edit/View 顶层项+下拉) + dogfood Menu 皮肤 + 键盘切换/方向键漫游", category: "navigation", group: "global", status: "new" },
  { slug: "dock", name: "Dock", description: "放大坞 · macOS 式按鼠标距离放大图标(motion 弹簧 + context 下发 mouseX)", category: "navigation", group: "global", status: "new" },
  { slug: "tabs", name: "Tabs", description: "选项卡 · Base UI 无浮层 + underline/solid 滑块", category: "navigation", group: "inpage", status: "new" },
  { slug: "breadcrumb", name: "Breadcrumb", description: "面包屑 · 纯皮肤静态 + aria-current 当前页语义", category: "navigation", group: "inpage", status: "new" },
  { slug: "pagination", name: "Pagination", description: "分页器 · 纯皮肤受控 + 页码区间算法(省略号)", category: "navigation", group: "inpage", status: "new" },
  { slug: "anchor", name: "Anchor", description: "锚点导航 · 自研零依赖 scrollspy(IntersectionObserver) + 平滑滚动 + active CSS 变量滑动指示条 + offsetTop/二级项", category: "navigation", group: "inpage", status: "new" },
  { slug: "affix", name: "Affix", description: "固钉 · 自研零依赖滚动吸附 + offsetTop/offsetBottom + 占位防跳动 + 自定义容器", category: "navigation", group: "inpage", status: "new" },
  { slug: "back-top", name: "BackTop", description: "回顶 · 监听滚动容器超 visibilityHeight 淡入 + scrollTo smooth + prefers-reduced-motion 降级 auto(零依赖)", category: "navigation", group: "inpage", status: "new" },
  { slug: "stepper", name: "Stepper", description: "步骤条 · MUI 桥 + active/completed 走瑚琏 token", category: "navigation", group: "inpage", status: "new" },
  { slug: "steps", name: "Steps", description: "步骤条(原生) · 零依赖数据驱动 items + 水平/垂直 + wait/process/finish/error 状态派生 + 可点击受控(替代 MUI Stepper 桥 · 分步表单/审批流)", category: "navigation", group: "inpage", status: "new" },
  { slug: "page-header", name: "PageHeader", description: "页头骨架 · 返回/面包屑/标题/标签/操作区/Tabs 页脚(dogfood 复用·零依赖·可 RSC)", category: "navigation", group: "inpage", status: "new" },
  { slug: "command", name: "Command", description: "命令面板 · ⌘K 模态(复用 Dialog 引擎) + 实时过滤 + 分组 + 键盘漫游(零依赖)", category: "navigation", group: "action", status: "new" },
  { slug: "context-menu", name: "ContextMenu", description: "右键菜单 · Base UI context-menu 原语薄包(锚到光标) + 复用 Menu 皮肤/data-highlighted + danger", category: "navigation", group: "action", status: "new" },
  { slug: "toolbar", name: "Toolbar", description: "工具栏 · Base UI role=toolbar + 键盘漫游 + Button/Group/Separator", category: "navigation", group: "action", status: "new" },
  { slug: "accordion", name: "Accordion", description: "手风琴 · Base UI 单/多开 + 高度过渡", category: "navigation", group: "action", status: "new" },
  { slug: "collapsible", name: "Collapsible", description: "折叠区 · Base UI collapsible 薄包 + 高度过渡(复用 Accordion --collapsible-panel-height)", category: "navigation", group: "action", status: "new" },
  { slug: "link", name: "Link", description: "链接 · tone×underline + external 自动 target/rel/图标 + RSC", category: "navigation", group: "action", status: "new" },
  { slug: "animated-theme-toggler", name: "AnimatedThemeToggler", description: "主题切换 · View Transitions 圆形揭示明暗(复用瑚琏 useTheme + 降级)", category: "navigation", group: "action", tags: ["animated"], status: "new" },

  // ── 反馈 feedback ────────────────────────────────────────────
  { slug: "dialog", name: "Dialog", description: "对话框 · Base UI Portal + focus trap", category: "feedback", group: "overlay", status: "stable" },
  { slug: "modal", name: "Modal", description: "命令式对话框 · confirm/info/success/error/warning 函数式 API + Dialog 引擎", category: "feedback", group: "overlay", status: "new" },
  { slug: "alert-dialog", name: "AlertDialog", description: "确认对话框 · Base UI 强制决策(不点遮罩/Esc 关) + Dialog 引擎", category: "feedback", group: "overlay", status: "new" },
  { slug: "drawer", name: "Drawer", description: "抽屉 · Base UI Dialog 引擎 + 四向侧滑", category: "feedback", group: "overlay", status: "new" },
  { slug: "popover", name: "Popover", description: "气泡卡片 · click 触发 + 标题/描述/Close", category: "feedback", group: "overlay", status: "new" },
  { slug: "tooltip", name: "Tooltip", description: "提示浮层 · Base UI Positioner + 箭头 + hover 触发", category: "feedback", group: "overlay", status: "new" },
  { slug: "hover-card", name: "HoverCard", description: "悬停卡片 · Popover 引擎自研 hover 开/移出延迟关(复刻 Tooltip delay 范式) + 富内容", category: "feedback", group: "overlay", status: "new" },
  { slug: "glimpse", name: "Glimpse", description: "链接预览 · dogfood HoverCard 引擎换皮成「封面图+标题+描述+域名」预览卡(维基式 hover preview) · 触发器随 href 渲染外链 a 或纯 span 保持行内排版 · 描述多行截断", category: "feedback", group: "overlay", status: "new" },
  { slug: "hero-video-dialog", name: "HeroVideoDialog", description: "视频弹层 · 缩略图+播放钮→Portal 模态(Esc/遮罩关 + 锁滚)", category: "feedback", group: "overlay", status: "new" },
  { slug: "alert", name: "Alert", description: "提示条 · tone×variant 皮肤 + a11y role", category: "feedback", group: "message", status: "new" },
  { slug: "banner", name: "Banner", description: "公告条 · 横贯容器顶部全宽 bar(站点维护/促销/版本更新) · 6 语气×soft/solid + 前导图标/操作区/可关闭 + 居中或左对齐 + 长文案 dogfood Marquee 单行无缝滚动 · 区别 Alert(局部卡片)/Notification(命令式四角)", category: "feedback", group: "message", status: "new" },
  { slug: "toast", name: "Toast", description: "命令式轻提示 · 自动消失 + 队列堆叠 + 手动关闭", category: "feedback", group: "message", status: "new" },
  { slug: "notification", name: "Notification", description: "通知 · 四角堆叠卡片 + 图标/操作区/位置 + 命令式 API(比 Toast 重)", category: "feedback", group: "message", status: "new" },
  { slug: "service-message", name: "ServiceMessage", description: "服务通知卡片 · 复刻微信「服务通知」会话内消息卡(模板/订阅消息) · 头部(头像+来源+⋯)/正文(标题+键值字段或自定义 children)/底部(引导文字+小程序入口) · 数据驱动 fields + onMore/onAction 交互 + footer/action 可定制 · 区别 Notification(命令式四角 toast) · 复用 Avatar/_icons·全吃 token 明暗自适配", category: "feedback", group: "message", status: "new" },
  { slug: "result", name: "Result", description: "结果页 · 7 状态(success/error/info/warning/403/404/500)内置图标+语义色 + 标题/副标题/详情/操作槽(零依赖·RSC)", category: "feedback", group: "message", status: "new" },
  { slug: "gift-feed", name: "GiftFeed", description: "礼物连击 · 受控礼物事件流 + 同 id 连击合并 combo ×N 滚动弹跳计数(纯函数 applyGiftEvent 可测) + 横幅左滑入/自动消散计时(每连击重置) + max 同屏上限挤旧 + dogfood Avatar · 直播打赏特效(pointer-events none)", category: "feedback", group: "message", tags: ["animated"], status: "new" },
  { slug: "floating-reactions", name: "FloatingReactions", description: "飘心点赞 · 命令式 ref.emit(content,{count}) 从底部喷射上浮表情 + 随机起点/横向漂移/缩放/时长扰动 + 上浮渐隐(keyframe)动画结束自移除 + palette 随机池 + rise/drift/duration 可调(forwardRef+useImperativeHandle·pointer-events none·可复用于任意点赞钮)", category: "feedback", group: "message", tags: ["animated"], status: "new" },
  { slug: "popconfirm", name: "Popconfirm", description: "气泡确认 · dogfood Popover 引擎 + 危险操作就地确认(标题/图标/确认取消) + async onConfirm loading + 受控开合", category: "feedback", group: "message", status: "new" },
  { slug: "spin", name: "Spin", description: "加载遮罩 · 覆盖内容区 + tip + delay 防闪 + fullscreen", category: "feedback", group: "loading", status: "new" },
  { slug: "spinner", name: "Spinner", description: "加载旋转器 · 纯 CSS animate-spin SVG 环 + role=status + RSC", category: "feedback", group: "loading", status: "new" },
  { slug: "progress", name: "Progress", description: "进度条 · linear/circular + 不定态 · 几何自有(reduced-motion)", category: "feedback", group: "loading", status: "new" },
  { slug: "tour", name: "Tour", description: "漫游引导 · 自研零依赖 SVG mask 镂空高亮 + 自定位气泡卡(标题/描述/上一步/下一步/跳过/进度) + resize/scroll 重算", category: "feedback", group: "guide", status: "new" },

  // ── AI 智能体 ai ─────────────────────────────────────────────
  { slug: "conversation", name: "Conversation", description: "消息流容器 · 纵向堆叠 ChatMessage + 内容增长自动贴底(新消息/流式 token)·消费侧给高度获独立滚动区", category: "ai", group: "conversation", status: "new" },
  { slug: "chat-message", name: "ChatMessage", description: "对话气泡 · user右(primary)/assistant左(surface)/system居中 + 头像(复用Avatar)/名称/时间 + loading态(TypingDots) + 操作槽·纯皮肤RSC", category: "ai", group: "conversation", status: "new" },
  { slug: "prompt-input", name: "PromptInput", description: "提示输入 · 自增高Textarea + 发送/停止键 + Enter提交/Shift+Enter换行/IME合成保护 + 受控非受控两用 + 左侧操作槽", category: "ai", group: "conversation", status: "new" },
  { slug: "typing-dots", name: "TypingDots", description: "打字指示 · 三点交错弹跳(纯CSS·RSC) + reduced-motion停 + role=status·配 ChatMessage loading", category: "ai", group: "conversation", tags: ["animated"], status: "new" },
  { slug: "thinking-block", name: "ThinkingBlock", description: "思考折叠块 · dogfood Collapsible(自带chevron+平滑高度) + thinking态(转圈+AnimatedShinyText高光+默认展开) + 耗时标记·收起隐藏 chain-of-thought", category: "ai", group: "agent", tags: ["animated"], status: "new" },
  { slug: "tool-call", name: "ToolCall", description: "工具调用卡 · dogfood Collapsible + Dot状态色 + Spinner(运行中) · pending/running/success/error 四态 + 参数/结果折叠面板 + 工具图标", category: "ai", group: "agent", status: "new" },
  { slug: "agent-plan", name: "AgentPlan", description: "执行计划 · 数据驱动任务清单 + 状态图标(空心环待办/Spinner进行·行高亮/Check完成删除线/X失败) + 每步右侧 meta 槽(耗时) + bare 内嵌 · 复用 Spinner·纯皮肤RSC", category: "ai", group: "agent", status: "new" },
  { slug: "task-runner", name: "TaskRunner", description: "任务运行卡 · dogfood AgentPlan(bare)步骤列表 + Progress顶部进度 + Tag标签 + Dot状态徽标 · idle/running/success/error四态派生 + 每步耗时(meta)/running行高亮/pending空心环 + progress省略按完成比派生 + 累计耗时footer + headerExtra/footerExtra送掣 · 纯展示RSC(计时驱动留消费侧)", category: "ai", group: "agent", status: "new" },
  { slug: "streaming-text", name: "StreamingText", description: "流式文本 · 渲染父级累积 text(随token增长) + 流式中尾随闪烁光标(hulian-blink) · 区别 TypingAnimation 自驱定时 · 纯皮肤RSC", category: "ai", group: "assist", tags: ["animated"], status: "new" },
  { slug: "prompt-suggestions", name: "PromptSuggestions", description: "建议提示 · 可点击 pill 列表 + string/{label,value} 两式 + onSelect 回传 value 填充输入或发起对话", category: "ai", group: "assist", status: "new" },
  { slug: "message-actions", name: "MessageActions", description: "消息操作条 · 复制(剪贴板+Check反馈)/重新生成/赞/踩 · 各键按需渲染 · 复用内联图标 · 挂 ChatMessage actions 槽", category: "ai", group: "assist", status: "new" },
  { slug: "citation", name: "Citation", description: "引用来源 · 序号角标 + 标题/来源 + href 新标签页外链 · 内联标注 agent 回答信息出处 · 纯皮肤RSC", category: "ai", group: "assist", status: "new" },

  // ── 装饰 decoration（纯视觉、无功能本体）────────────────────────
  { slug: "dot-pattern", name: "DotPattern", description: "点阵背景 · 纯 SVG pattern + currentColor token + RSC", category: "decoration", group: "backdrop", status: "new" },
  { slug: "grid-pattern", name: "GridPattern", description: "网格背景 · 纯 SVG 线 + 虚线可配 + currentColor", category: "decoration", group: "backdrop", status: "new" },
  { slug: "striped-pattern", name: "StripedPattern", description: "斜条纹背景 · 纯 CSS 渐变 + currentColor", category: "decoration", group: "backdrop", status: "new" },
  { slug: "spotlight", name: "Spotlight", description: "径向辉光背景 · token 驱动 radial-gradient + 明暗自适应 + RSC", category: "decoration", group: "backdrop", status: "new" },
  { slug: "retro-grid", name: "RetroGrid", description: "复古透视网格 · CSS 滚动 + reduced-motion", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "ripple", name: "Ripple", description: "同心脉冲圆环 · CSS 逐圈延迟 + reduced-motion", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "meteors", name: "Meteors", description: "流星雨 · 随机斜落拖尾(客户端生成) + currentColor", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  // 设计感背景批（复刻 react-bits/Aceternity·canvas 零依赖 + WebGL/ogl 懒加载·全吃 chart token·reduced-motion 降级）
  { slug: "aurora", name: "Aurora", description: "极光渐变背景 · 双层 repeating-linear-gradient 横移干涉 + 径向 mask 聚焦 + chart token(纯 CSS·RSC)", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "particles", name: "Particles", description: "交互粒子场 · canvas 星尘漂浮 + 鼠标排斥位移 + DPR 自适应 + 颜色吃主题前景 token(明暗跟随)", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "flickering-grid", name: "FlickeringGrid", description: "闪烁网格 · canvas 像素方格随机明灭 + ResizeObserver 自适应 + 颜色吃主题 token(逐帧现取)", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "wavy-background", name: "WavyBackground", description: "噪声波浪 · canvas 多彩波浪带叠加 + 内联零依赖 value noise + chart token + reduced-motion 静态", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "silk", name: "Silk", description: "丝绸流动背景 · WebGL/ogl 懒加载 shader(复刻 react-bits) + chart token 主色 + reduced-motion 渐变兜底", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "iridescence", name: "Iridescence", description: "虹彩光泽背景 · WebGL/ogl shader 连续光谱干涉 + 鼠标光流扰动 + chart token + 静态 fallback", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "threads", name: "Threads", description: "流动丝线背景 · WebGL/ogl Perlin 波动线随鼠标摆动 + 透明底叠加 + chart token + 静态 fallback", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "orb", name: "Orb", description: "指针交互光球 · WebGL/ogl 发光能量球 + hover 增亮/旋转 + hue 色相 + reduced-motion 径向渐变球", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "liquid-chrome", name: "LiquidChrome", description: "液态铬背景 · WebGL/ogl 金属流动反光 + 鼠标涟漪 + chart token 基色 + 静态金属渐变 fallback", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "border-beam", name: "BorderBeam", description: "边框光束 · motion offsetPath 绕边 + mask 只露边框", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "shine-border", name: "ShineBorder", description: "流光边框 · 渐变 mask 只留边框区 + chart token + RSC", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "glare-hover", name: "GlareHover", description: "反光悬停 · hover 斜向扫光 + reduced-motion + RSC", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "lens", name: "Lens", description: "放大镜 · 悬停光标处圆形放大任意 children(零依赖 mask+scale)", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "animated-beam", name: "AnimatedBeam", description: "动效光束 · 连接两元素的流光曲线(motion 渐变 + SVG + ResizeObserver)", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "orbiting-circles", name: "OrbitingCircles", description: "轨道环绕 · 子元素沿圆周匀速公转 + 自身反旋正立(纯 CSS·RSC)", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "progressive-blur", name: "ProgressiveBlur", description: "渐进模糊 · 分层 backdrop-blur + mask 渐变(纯 CSS·RSC)", category: "decoration", group: "overlay-fx", status: "new" },
  { slug: "card-spotlight", name: "CardSpotlight", description: "聚光卡片 · 鼠标跟随径向高光(纯 CSS 变量 + radial-gradient) + color-mix 高光色 + surface token(零依赖)", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },

  // ── 设备外壳 mockups ─────────────────────────────────────────
  { slug: "safari", name: "Safari", description: "浏览器外壳 · 顶栏红绿灯+地址栏包裹截图 + RSC", category: "mockups", group: "window", status: "new" },
  { slug: "chrome", name: "Chrome", description: "浏览器外壳 · 标签页+工具栏(前进/后退/刷新+地址栏)包裹截图 + RSC", category: "mockups", group: "window", status: "new" },
  { slug: "terminal", name: "Terminal", description: "终端框 · mac 窗口外壳 + 命令行逐行揭示(motion + tone) + 语法着色(命令名/flag/URL/数字)", category: "mockups", group: "window", tags: ["animated"], status: "new" },
  { slug: "iphone", name: "iPhone", description: "手机外壳 · 灵动岛机身包裹屏幕(token themeable) + RSC", category: "mockups", group: "device", status: "new" },
  { slug: "android", name: "Android", description: "安卓外壳 · 打孔摄像头机身包裹屏幕 + RSC", category: "mockups", group: "device", status: "new" },
  { slug: "tablet", name: "Tablet", description: "平板外壳 · iPad 系机身(model 预设尺寸/比例·token themeable) + RSC", category: "mockups", group: "device", status: "new" },
  { slug: "watch", name: "Watch", description: "手表外壳 · Apple Watch 系 squircle 表壳+数码表冠(model 预设尺寸) + RSC", category: "mockups", group: "device", status: "new" },

  // ── 移动端 mobile ──────────────────────────────────────────────
  { slug: "tab-bar", name: "TabBar", description: "底部导航栏 · items 驱动受控/非受控 + 激活 text-primary/aria-current + 角标/红点 + 吃底部安全区(零依赖·H5 主导航)", category: "mobile", group: "nav", status: "new" },
  { slug: "fab", name: "Fab", description: "悬浮操作钮 · fixed 贴边 + speed-dial 子动作错峰展开/主钮旋 45°(零依赖·reduced-motion)", category: "mobile", group: "nav", status: "new" },
  { slug: "action-sheet", name: "ActionSheet", description: "动作面板 · 建在 Base UI Dialog 底滑(同 Drawer 范式·motion token CSS 镜像) + 动作即 Close + 危险态 + 独立取消块 + 安全区", category: "mobile", group: "overlay", status: "new" },
  { slug: "picker", name: "Picker", description: "滚轮选择器 · 多列 CSS scroll-snap 吸附 + 即时高亮居中项 + 停稳防抖 emit + 受控滚定位(零依赖·H5 选时间/地区)", category: "mobile", group: "input", status: "new" },
  { slug: "swipe-action", name: "SwipeAction", description: "列表项滑动操作 · 内容层 translateX 跟手 + 左/右动作面板 + 过半吸附全开/回弹 + 主轴判定放行纵向滚动(零依赖·Pointer Events)", category: "mobile", group: "gesture", status: "new" },
  { slug: "pull-to-refresh", name: "PullToRefresh", description: "下拉刷新 · 置顶下拉带阻尼 + 过阈进 armed + 松手触发并保持刷新态至 Promise 结束回弹(零依赖·Pointer Events)", category: "mobile", group: "gesture", status: "new" },
  { slug: "safe-area", name: "SafeArea", description: "安全区适配 · env(safe-area-inset-*) 作 padding/margin 应用到指定边 + min 兜底 + as 多态(零依赖·RSC·刘海/底部横条)", category: "mobile", group: "layout", status: "new" },
];
