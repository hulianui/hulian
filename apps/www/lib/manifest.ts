// 瑚琏文档站 IA 元数据 —— 纯数据 SSOT，零 @hulianui/ui import，server / client 皆可安全读。
//
// 分区原则（2026-06 重构）：按「组件本质 / 你拿它干什么」分两级（大类 category → 小类 group），
// 而非按「会不会动」这种技术属性分。"动效" 不再是一个货架位置，而是横切标签 tags:["animated"]——
// AuroraText 本质是文字 → 归排版；ShimmerButton 本质是按钮 → 归表单；想"搞点炫的"用 animated 过滤。
// 只有没有功能本体、纯装饰的（光束/背景/放大镜）才进 decoration。

import { componentCategoryMetaEn, componentMetaEn } from "../i18n/component-meta.en";
import { DOCS_LOCALE } from "./docs-locale";

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
  /**
   * 中文短名：侧栏、⌘K 搜索标题、上下篇导航都显示它，英文站上它还是给中文查询用的检索别名。
   *
   * 必填而非可选，是因为它没有正确的兜底——回落到英文 `name` 只会让中文侧栏突然冒出一个英文词，
   * 且没人会发现。写成必填，漏一个当场 typecheck 红。
   */
  shortName: string;
  description: string;
  category: CategoryKey;
  /** 小类 key，须存在于其 category 的 groups 中（manifest.test 校验）。 */
  group: string;
  tags?: ComponentTag[];
  status: "stable" | "new";
}

export interface LocalizedComponentDisplayMeta {
  shortName: string;
  description: string;
  categoryLabel: string;
  groupLabel: string;
  tags: string[];
  keywords: string[];
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
  { slug: "layout", name: "Layout", shortName: "整页布局", description: "把页面拆成页头、侧栏、内容和页脚四块，侧栏可折叠", category: "layout", group: "container", status: "new" },
  { slug: "admin-layout", name: "AdminLayout", shortName: "中后台骨架", description: "搭出中后台外壳：侧栏导航、顶栏、多页签工作区和可滚动内容区", category: "layout", group: "container", status: "new" },
  { slug: "route-tabs", name: "RouteTabs", shortName: "路由页签条", description: "把打开过的页面排成一条页签，支持固定、调序和批量关闭", category: "navigation", group: "inpage", status: "new" },
  { slug: "scroll-area", name: "ScrollArea", shortName: "滚动区", description: "给溢出内容换上更细的自定义滚动条，可竖可横", category: "layout", group: "container", status: "new" },
  { slug: "viewport", name: "Viewport", shortName: "响应式容器", description: "按网页、平板、手机三档宽度预览，内部布局随容器宽度重排", category: "layout", group: "container", status: "new" },
  { slug: "resizable", name: "Resizable", shortName: "拖拽分栏", description: "把区域切成可拖动的分栏，能限制大小也能用键盘微调", category: "layout", group: "container", status: "new" },
  { slug: "aspect-ratio", name: "AspectRatio", shortName: "比例容器", description: "把图片、视频或任意内容锁在固定的宽高比里", category: "layout", group: "container", status: "new" },
  { slug: "fit-screen", name: "FitScreen", shortName: "大屏适配", description: "把固定尺寸的设计稿等比缩放，铺满任意大小的屏幕", category: "layout", group: "container", status: "new" },
  { slug: "preview-sandbox", name: "PreviewSandbox", shortName: "预览沙箱", description: "在隔离的沙箱里预览代码或组件，带设备视口、缩放和错误兜底", category: "layout", group: "container", status: "new" },
  { slug: "masonry", name: "Masonry", shortName: "瀑布流布局", description: "把长短不一的卡片分列排成瀑布流，列数随屏幕宽度变化", category: "layout", group: "container", status: "new" },
  { slug: "stack", name: "Stack", shortName: "弹性布局", description: "按一个方向排列子元素，统一控制间距、对齐和换行", category: "layout", group: "arrange", status: "new" },
  { slug: "container", name: "Container", shortName: "内容容器", description: "给页面内容限定最大宽度并居中，留出左右安全边距", category: "layout", group: "container", status: "new" },
  { slug: "grid", name: "Grid", shortName: "栅格布局", description: "按栅格排列内容，子项可跨列跨行", category: "layout", group: "arrange", status: "new" },
  { slug: "spacer", name: "Spacer", shortName: "间距", description: "在布局中插入一段纯粹的空白间距", category: "layout", group: "arrange", status: "new" },
  { slug: "divider", name: "Divider", shortName: "带文字分隔", description: "用一条分隔线把内容切开，线上可以带文字", category: "layout", group: "arrange", status: "new" },
  { slug: "separator", name: "Separator", shortName: "分隔线", description: "画一条横向或竖向的分隔线，带正确的无障碍语义", category: "layout", group: "arrange", status: "new" },

  // ── 排版 typography ──────────────────────────────────────────
  { slug: "text", name: "Text", shortName: "文本", description: "统一正文的字号、字重、语义色和截断方式", category: "typography", group: "text", status: "new" },
  { slug: "heading", name: "Heading", shortName: "标题", description: "输出各级标题，视觉大小与标题层级可以分开设定", category: "typography", group: "text", status: "new" },
  { slug: "prose", name: "Prose", shortName: "排版容器", description: "给富文本或 Markdown 内容套上统一的排版样式", category: "typography", group: "text", status: "new" },
  { slug: "markdown", name: "Markdown", shortName: "Markdown 渲染", description: "把 Markdown 字符串渲染成只读的富文本内容", category: "typography", group: "text", status: "new" },
  { slug: "question-card", name: "QuestionCard", shortName: "题目卡片", description: "完整展示一道题：题干、选项、小问、配图和出处", category: "data-display", group: "collection", status: "new" },
  { slug: "math-textarea", name: "MathTextarea", shortName: "公式输入框", description: "带公式模板与实时预览的 LaTeX 输入框，产出仍是含 $…$ 的普通字符串", category: "forms", group: "advanced", status: "new" },
  { slug: "question-editor", name: "QuestionEditor", shortName: "出题编辑器", description: "一道数学题的结构化编辑：七型切换、题图、选项、填空、分步给分、实时预览", category: "forms", group: "advanced", status: "new" },
  { slug: "math", name: "Formula", shortName: "数学公式排版", description: "排版数学公式，分式、矩阵、求和积分都按真正的二维版式呈现", category: "typography", group: "text", status: "new" },
  { slug: "aurora-text", name: "AuroraText", shortName: "极光文字", description: "让一层多彩极光渐变在文字内部持续流动", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "line-shadow-text", name: "LineShadowText", shortName: "斜线投影文字", description: "在标题文字背后错开一层硬边条纹投影", category: "typography", group: "text", status: "new" },
  { slug: "animated-shiny-text", name: "AnimatedShinyText", shortName: "高光文字", description: "让一道克制的高光缓缓扫过文字，常用于徽标文案", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "animated-gradient-text", name: "AnimatedGradientText", shortName: "渐变文字", description: "让渐变色在文字里持续流动以强调重点", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "word-rotate", name: "WordRotate", shortName: "轮换词", description: "在同一位置轮换展示一组词，带进出场过渡", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "typing-animation", name: "TypingAnimation", shortName: "打字机", description: "逐字打出文字，末尾跟一个闪烁光标", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "sparkles-text", name: "SparklesText", shortName: "星闪文字", description: "在文字周围点缀随机闪烁的小星星", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "split-text", name: "SplitText", shortName: "切字进场", description: "把文字拆成字或词，滚到视口时逐个错峰浮现", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "blur-text", name: "BlurText", shortName: "模糊解析", description: "让文字从模糊位移中逐词解析清晰", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "flip-text", name: "FlipText", shortName: "翻面标题", description: "鼠标移入时让标题逐字做三维翻面", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "text-reveal", name: "TextReveal", shortName: "揭示扫光", description: "用一道彩色光带扫过，把文字从透明揭示成实色", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "decrypted-text", name: "DecryptedText", shortName: "乱码解码", description: "先滚动乱码，再逐位解码成真正的文字", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "glitch-text", name: "GlitchText", shortName: "故障撕裂", description: "给文字叠上色差错位与切片抖动的故障效果", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "circular-text", name: "CircularText", shortName: "环形文字", description: "把文字排成一圈并持续自转，悬停可以调速", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "scroll-reveal", name: "ScrollReveal", shortName: "滚动显影", description: "随着段落滚过视口把文字逐词显影", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "true-focus", name: "TrueFocus", shortName: "真实焦点", description: "让句中一个词清晰、其余模糊，焦点框依次移动", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "code", name: "Code", shortName: "行内代码", description: "给行内代码片段套上等宽皮肤，可选语义色调", category: "typography", group: "code", status: "new" },
  { slug: "code-block", name: "CodeBlock", shortName: "代码块", description: "展示多行代码，带语言标签和一键复制", category: "typography", group: "code", status: "new" },
  { slug: "snippet", name: "Snippet", shortName: "代码片段", description: "展示一行命令，带提示符和一键复制", category: "typography", group: "code", status: "new" },
  { slug: "code-diff", name: "CodeDiff", shortName: "代码对比", description: "按行展示代码增删，可单栏也可左右双栏对照", category: "typography", group: "code", status: "new" },
  { slug: "kbd", name: "Kbd", shortName: "按键", description: "展示键位或快捷键，做成键帽的样子", category: "typography", group: "code", status: "new" },

  // ── 表单 forms ───────────────────────────────────────────────
  { slug: "button", name: "Button", shortName: "按钮", description: "触发操作的按钮，提供实心、浅色、描边、幽灵和危险等变体", category: "forms", group: "button", status: "stable" },
  { slug: "shimmer-button", name: "ShimmerButton", shortName: "微光按钮", description: "让一道微光沿按钮边缘游走，突出主行动号召", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "interactive-hover-button", name: "InteractiveHoverButton", shortName: "悬停展开按钮", description: "悬停时圆点扩成整块底色，并推出一个箭头", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "rainbow-button", name: "RainbowButton", shortName: "彩虹按钮", description: "给按钮镶一圈持续流动的彩虹光边", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "pulsating-button", name: "PulsatingButton", shortName: "脉冲按钮", description: "用一圈向外扩散的光环让按钮持续引起注意", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "ripple-button", name: "RippleButton", shortName: "波纹按钮", description: "在点击落点扩散一圈水波纹，给出触感反馈", category: "forms", group: "button", tags: ["animated"], status: "new" },
  { slug: "button-group", name: "ButtonGroup", shortName: "按钮组", description: "把相关按钮连成一体或分组排列，做成分段控件", category: "forms", group: "button", status: "new" },
  { slug: "social-button", name: "SocialButton", shortName: "第三方登录按钮", description: "提供带品牌标识的第三方登录按钮，含加载态", category: "forms", group: "button", status: "new" },
  { slug: "input", name: "Input", shortName: "输入框", description: "收单行文本输入，可加前后缀和错误态", category: "forms", group: "basic", status: "new" },
  { slug: "textarea", name: "Textarea", shortName: "多行输入", description: "收多行文本输入，高度随内容自增", category: "forms", group: "basic", status: "new" },
  { slug: "cell-editor", name: "CellEditor", shortName: "单元格内联编辑器", description: "在表格单元格里就地编辑，静止时看起来和纯文本一样", category: "forms", group: "basic", status: "new" },
  { slug: "select", name: "Select", shortName: "下拉选择", description: "从下拉浮层里选一个或多个值，超出的已选项折成计数", category: "forms", group: "basic", status: "new" },
  { slug: "checkbox", name: "Checkbox", shortName: "复选框", description: "切换一个独立的布尔值，支持半选态", category: "forms", group: "basic", status: "new" },
  { slug: "checkbox-group", name: "CheckboxGroup", shortName: "复选组", description: "让一组复选框共同维护一个值数组", category: "forms", group: "basic", status: "new" },
  { slug: "radio", name: "Radio", shortName: "单选", description: "从一组互斥选项里选一个，支持方向键操作", category: "forms", group: "basic", status: "new" },
  { slug: "switch", name: "Switch", shortName: "开关", description: "用一个开关切换二元设置，语义是改完即刻生效", category: "forms", group: "basic", status: "stable" },
  { slug: "toggle", name: "Toggle", shortName: "切换按钮", description: "让单个按钮在按下与未按下之间切换", category: "forms", group: "basic", status: "new" },
  { slug: "segmented", name: "Segmented", shortName: "分段控制器", description: "在紧凑的分段控件里选一项，滑块跟着移动", category: "forms", group: "basic", status: "new" },
  { slug: "slider", name: "Slider", shortName: "滑块", description: "沿轨道拖出一个数值或一段区间，支持键盘步进", category: "forms", group: "basic", status: "new" },
  { slug: "number-field", name: "NumberField", shortName: "数字步进", description: "编辑数字，带上下限、步进按钮和键盘步进", category: "forms", group: "basic", status: "new" },
  { slug: "secret-field", name: "SecretField", shortName: "密钥掩码字段", description: "掩码显示密钥，可一键显形和复制原值", category: "forms", group: "advanced", status: "new" },
  { slug: "password-generator", name: "PasswordGenerator", shortName: "密码生成器", description: "生成随机密码或密码短语，实时给出强度评级", category: "forms", group: "advanced", status: "new" },
  { slug: "combobox", name: "Combobox", shortName: "自动补全", description: "边输入边过滤候选项，可用触发按钮也可内联输入", category: "forms", group: "advanced", status: "new" },
  { slug: "remote-select", name: "RemoteSelect", shortName: "远程搜索选择器", description: "从远端接口搜索选项，带防抖、分页和初值回显", category: "forms", group: "advanced", status: "new" },
  { slug: "listbox", name: "Listbox", shortName: "可选列表", description: "用键盘可漫游的列表做单选、多选或纯动作项", category: "forms", group: "advanced", status: "new" },
  { slug: "mentions", name: "Mentions", shortName: "@提及输入", description: "输入触发符后弹出候选，把提及插进文本", category: "forms", group: "advanced", status: "new" },
  { slug: "input-otp", name: "InputOTP", shortName: "验证码输入", description: "分格输入验证码，自动跳格并支持整段粘贴", category: "forms", group: "advanced", status: "new" },
  { slug: "rating", name: "Rating", shortName: "评分", description: "用星级打分，可换图标并带悬停预览", category: "forms", group: "advanced", status: "new" },
  { slug: "upload", name: "Upload", shortName: "文件上传", description: "点击或拖拽选文件，带校验、进度和文件列表", category: "forms", group: "advanced", status: "new" },
  { slug: "region-select", name: "RegionSelect", shortName: "图上框选回坐标", description: "在图上拖框选区，回传原图的像素坐标", category: "forms", group: "advanced", status: "new" },
  { slug: "image-cropper", name: "ImageCropper", shortName: "图片裁剪", description: "让用户拖动缩放图片，按固定比例裁出成品", category: "forms", group: "advanced", status: "new" },
  { slug: "scope-matrix", name: "ScopeMatrix", shortName: "范围矩阵", description: "编辑允许与禁止两份范围清单，并给出最终生效范围", category: "forms", group: "advanced", status: "new" },
  { slug: "transfer", name: "Transfer", shortName: "穿梭框", description: "在待选和已选两个列表之间搬运条目", category: "forms", group: "advanced", status: "new" },
  { slug: "cascader", name: "Cascader", shortName: "级联选择", description: "沿逐级展开的选项列选出一条路径", category: "forms", group: "advanced", status: "new" },
  { slug: "tree-select", name: "TreeSelect", shortName: "树选择器", description: "从可搜索的树里选一个或多个节点", category: "forms", group: "advanced", status: "new" },
  { slug: "region-cascader", name: "RegionCascader", shortName: "中国省市区级联", description: "逐级选出中国的省、市、区，内置行政区划数据", category: "forms", group: "advanced", status: "new" },
  { slug: "country-select", name: "CountrySelect", shortName: "国家/地区选择", description: "搜索并选择国家和地区，带旗帜与区号", category: "forms", group: "advanced", status: "new" },
  { slug: "markdown-editor", name: "MarkdownEditor", shortName: "Markdown 编辑器", description: "所见即所得地编辑内容，值进出都是 Markdown", category: "forms", group: "advanced", status: "new" },
  { slug: "rich-text-editor", name: "RichTextEditor", shortName: "富文本编辑器", description: "所见即所得地编辑内容，值进出都是 HTML", category: "forms", group: "advanced", status: "new" },
  { slug: "code-editor", name: "CodeEditor", shortName: "代码编辑器", description: "编辑代码，带行号、语法着色和成套键盘操作", category: "forms", group: "advanced", status: "new" },
  { slug: "issue-reporter", name: "IssueReporter", shortName: "GitHub issue 草稿器", description: "按模板收集信息，拼出 issue 正文和预填链接", category: "forms", group: "advanced", status: "new" },
  { slug: "colorpicker", name: "ColorPicker", shortName: "颜色选择", description: "拖取饱和度与色相选颜色，可输出 HEX、RGB 或 HSL", category: "forms", group: "advanced", status: "new" },
  { slug: "color-field", name: "ColorField", shortName: "颜色输入框", description: "用色块和十六进制输入框编辑一个颜色", category: "forms", group: "advanced", status: "new" },
  { slug: "color-swatch-picker", name: "ColorSwatchPicker", shortName: "预设色块单选", description: "从一组预设色块里挑一个颜色，方向键可达", category: "forms", group: "advanced", status: "new" },
  { slug: "choicebox", name: "Choicebox", shortName: "卡片选择", description: "用带标题和描述的卡片做单选或多选", category: "forms", group: "advanced", status: "new" },
  { slug: "emoji-picker", name: "EmojiPicker", shortName: "表情选择器", description: "按分类浏览或关键词搜索表情，带最近使用", category: "forms", group: "advanced", status: "new" },
  { slug: "voice-record", name: "VoiceRecord", shortName: "语音录制", description: "提供按住说话或点击开始的录音按钮，带波形与处理态", category: "forms", group: "advanced", status: "new" },
  { slug: "calendar", name: "Calendar", shortName: "日历面板", description: "常驻的日历面板，可在日、月、年三层之间下钻", category: "forms", group: "datetime", status: "new" },
  { slug: "date-picker", name: "DatePicker", shortName: "单日期选择", description: "点开日历浮层选一个日期，可限制可选范围", category: "forms", group: "datetime", status: "new" },
  { slug: "date-time-picker", name: "DateTimePicker", shortName: "日期时间选择", description: "在一个浮层里同时选好日期和时间", category: "forms", group: "datetime", status: "new" },
  { slug: "date-range-picker", name: "DateRangePicker", shortName: "日期区间", description: "用双月日历选出起止日期，带快捷区间", category: "forms", group: "datetime", status: "new" },
  { slug: "icon-picker", name: "IconPicker", shortName: "图标选择", description: "分类浏览并搜索图标，图标集由使用方注入", category: "forms", group: "advanced", status: "new" },
  { slug: "time-picker", name: "TimePicker", shortName: "时间选择", description: "从时、分、秒三列浮层里选一个时间", category: "forms", group: "datetime", status: "new" },
  { slug: "time-field", name: "TimeField", shortName: "时间分段输入", description: "用键盘直接编辑时、分、秒各段，不弹浮层", category: "forms", group: "datetime", status: "new" },
  { slug: "form", name: "Form", shortName: "表单容器", description: "组织具名字段，统一收集提交和字段级错误", category: "forms", group: "framework", status: "new" },
  { slug: "form-dialog", name: "ModalForm / DrawerForm", shortName: "弹窗/抽屉表单", description: "把带校验的表单装进弹窗或抽屉，管好提交与关闭", category: "forms", group: "framework", status: "new" },
  { slug: "pro-form", name: "ProForm", shortName: "内联表单编排", description: "内联表单编排，自动配好提交与重置底栏", category: "forms", group: "framework", status: "new" },
  { slug: "inspector-panel", name: "InspectorPanel", shortName: "属性检查器", description: "按字段描述派生属性面板，编辑元素的样式与几何", category: "forms", group: "advanced", status: "new" },
  { slug: "steps-form", name: "StepsForm", shortName: "分步表单", description: "把长表单拆成多步，逐步校验并保留已填内容", category: "forms", group: "framework", status: "new" },
  { slug: "login-form", name: "LoginForm", shortName: "登录模板", description: "现成的登录表单，含字段校验、记住我和品牌插槽", category: "forms", group: "framework", status: "new" },
  { slug: "auth-panel", name: "AuthPanel", shortName: "认证页宣传面板", description: "搭出分屏登录页的品牌一侧，含渐变底、标语和卖点", category: "forms", group: "framework", status: "new" },
  { slug: "click-captcha", name: "ClickCaptcha", shortName: "点选人机验证", description: "让用户按顺序点选图片位置完成人机验证", category: "forms", group: "framework", status: "new" },
  { slug: "label", name: "Label", shortName: "表单标签", description: "单独的表单标签，皮肤与 Field 保持一致", category: "forms", group: "framework", status: "new" },
  { slug: "field", name: "Field", shortName: "字段包装", description: "把标签、控件、帮助文字和错误串成一个无障碍字段", category: "forms", group: "framework", status: "new" },
  { slug: "search-form", name: "SearchForm", shortName: "查询筛选表单", description: "拼出列表页顶部的查询条件区，可折叠可重置", category: "forms", group: "framework", status: "new" },

  // ── 数据展示 data-display ────────────────────────────────────
  { slug: "table", name: "Table", shortName: "表格", description: "渲染语义化表格，支持排序、整行点击和空态", category: "data-display", group: "collection", status: "new" },
  { slug: "book-3d", name: "Book3D", shortName: "3D 立体书", description: "把封面做成有厚度的立体书，悬停时转正", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "pro-table", name: "ProTable", shortName: "高级表格", description: "在数据列表外配齐查询条件、工具栏、行选择和分页，拼出完整列表页", category: "data-display", group: "collection", status: "new" },
  { slug: "pricing-table", name: "PricingTable", shortName: "定价对比矩阵", description: "把多个方案按属性逐行对照，可高亮推荐列", category: "data-display", group: "collection", status: "new" },
  { slug: "json-viewer", name: "JsonViewer", shortName: "只读 JSON 树", description: "折叠查看 JSON，带语法着色、复制和层级控制", category: "data-display", group: "collection", status: "new" },
  { slug: "editable-table", name: "EditableTable", shortName: "行内编辑表格", description: "在表格里直接编辑整行，带校验、取消和增删行", category: "data-display", group: "collection", status: "new" },
  { slug: "list", name: "List", shortName: "数据列表", description: "排列结构化列表项，带元信息、操作区、空态和分页", category: "data-display", group: "collection", status: "new" },
  { slug: "descriptions", name: "Descriptions", shortName: "描述列表", description: "在详情页里成组展示只读的键值对字段", category: "data-display", group: "collection", status: "new" },
  { slug: "row-actions", name: "RowActions", shortName: "表格行操作区", description: "收拢表格行的操作，超出数量自动收进溢出菜单", category: "data-display", group: "collection", status: "new" },
  { slug: "tree", name: "Tree", shortName: "递归树", description: "展示可展开的层级节点，支持选择和键盘操作", category: "data-display", group: "collection", status: "new" },
  { slug: "card", name: "Card", shortName: "卡片", description: "把相关内容装进带页头、正文和页脚的卡片", category: "data-display", group: "collection", status: "new" },
  { slug: "carousel", name: "Carousel", shortName: "轮播", description: "轮播多张幻灯片，带箭头、圆点、自动播放和拖拽", category: "data-display", group: "collection", status: "new" },
  { slug: "video", name: "Video", shortName: "视频播放器", description: "播放本地或 HLS 视频，带自定义控件、章节和续播", category: "data-display", group: "collection", status: "new" },
  { slug: "bento-grid", name: "BentoGrid", shortName: "错落栅格", description: "用跨行跨列的卡片拼出错落有致的功能墙", category: "data-display", group: "collection", status: "new" },
  { slug: "image", name: "Image", shortName: "图片", description: "加载图片并处理淡入、失败回退和悬停放大", category: "data-display", group: "collection", status: "new" },
  { slug: "magic-card", name: "MagicCard", shortName: "魔法卡片", description: "让卡片跟随鼠标透出一片径向高光", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "animated-list", name: "AnimatedList", shortName: "动效列表", description: "让列表项在进入视口时逐个淡入上移", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "marquee", name: "Marquee", shortName: "跑马灯", description: "让内容沿一个方向无缝滚动，悬停可暂停", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "sortable", name: "Sortable", shortName: "拖拽排序", description: "用鼠标或键盘拖动条目改变顺序，可整项拖也可用手柄", category: "data-display", group: "collection", status: "new" },
  { slug: "kanban", name: "Kanban", shortName: "看板", description: "把卡片在多个状态列之间拖动流转", category: "data-display", group: "collection", status: "new" },
  { slug: "flow", name: "Flow", shortName: "节点画布编排器", description: "编排节点和连线，可拖节点、连桩、平移和缩放", category: "data-display", group: "collection", status: "new" },
  { slug: "design-canvas", name: "DesignCanvas", shortName: "视觉设计画布", description: "在无限画布上自由摆放元素，可框选、拖动和缩放", category: "data-display", group: "collection", status: "new" },
  { slug: "component-picker", name: "ComponentPicker", shortName: "组件库浏览器", description: "浏览组件库，带分类树、模糊搜索和详情预览", category: "data-display", group: "collection", status: "new" },
  { slug: "sankey", name: "Sankey", shortName: "桑基图", description: "用带宽度的流向图展示各阶段之间的分配与去向", category: "data-display", group: "collection", status: "new" },
  { slug: "sparkline", name: "Sparkline", shortName: "内联趋势迷你图", description: "在一行里画出极简趋势，不带坐标轴和网格", category: "data-display", group: "info", status: "new" },
  { slug: "funnel", name: "Funnel", shortName: "漏斗图", description: "按各阶段数量画漏斗，并标出级间转化率", category: "data-display", group: "collection", status: "new" },
  { slug: "treemap", name: "Treemap", shortName: "矩形树图", description: "按数值把矩形铺满，一眼看出谁占大头", category: "data-display", group: "collection", status: "new" },
  { slug: "event-stream", name: "EventStream", shortName: "事件流", description: "把高频机器事件排成连续时间线，用语义色标出异常", category: "data-display", group: "collection", status: "new" },
  { slug: "queue-lane", name: "QueueLane", shortName: "优先级队列板", description: "按优先级泳道展示队列积压，道头给出深度与等待", category: "data-display", group: "collection", status: "new" },
  { slug: "document-sheet", name: "DocumentSheet", shortName: "单据纸张", description: "把单据排在 A4 纸面上，带页眉页脚和打印支持", category: "data-display", group: "collection", status: "new" },
  { slug: "gantt", name: "Gantt", shortName: "甘特图(只读)", description: "把任务排到时间轴上，展示分组、进度和今天的位置", category: "data-display", group: "collection", status: "new" },
  { slug: "scheduler", name: "Scheduler", shortName: "事件日历/排班", description: "在月、周、日和资源视图里排事件，可拖拽建单改期", category: "data-display", group: "collection", status: "new" },
  { slug: "image-viewer", name: "ImageViewer", shortName: "图片查看器", description: "全屏查看图片，可缩放、平移、翻页和看缩略图", category: "data-display", group: "info", status: "new" },
  { slug: "danmaku", name: "Danmaku", shortName: "弹幕引擎", description: "把观众弹幕分轨飘过画面，互不重叠", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "live-chat", name: "LiveChat", shortName: "直播公屏", description: "展示直播公屏消息流，带礼物、进场、置顶和自动滚动", category: "data-display", group: "collection", status: "new" },
  { slug: "live-player", name: "LivePlayer", shortName: "直播播放器壳", description: "直播画面外壳，带在线人数、清晰度切换和互动叠层", category: "data-display", group: "collection", status: "new" },
  { slug: "live-product-card", name: "LiveProductCard", shortName: "小黄车讲解卡", description: "展示直播带货商品，含价格、库存和抢购入口", category: "data-display", group: "info", status: "new" },
  { slug: "log-viewer", name: "LogViewer", shortName: "日志查看器", description: "按级别着色展示日志行，新行自动贴底", category: "data-display", group: "collection", status: "new" },
  { slug: "file-tree", name: "FileTree", shortName: "文件树", description: "浏览文件和目录，带展开、选中和改动状态标记", category: "data-display", group: "collection", status: "new" },
  { slug: "diff-stat", name: "DiffStat", shortName: "改动统计条", description: "用绿红格子条概括增删行数，并标出文件状态", category: "data-display", group: "info", status: "new" },
  { slug: "score-ring", name: "ScoreRing", shortName: "评分环", description: "用彩色环形仪表盘展示分值和对应等级", category: "data-display", group: "info", status: "new" },
  { slug: "score-scale", name: "ScoreScale", shortName: "分档评分尺", description: "用整条按档着色的横带展示分值落在哪一档", category: "data-display", group: "info", status: "new" },
  { slug: "heatmap", name: "Heatmap", shortName: "热力图", description: "把矩阵数值映射成色阶网格，可看图例也可下钻", category: "data-display", group: "collection", status: "new" },
  { slug: "code-review-thread", name: "CodeReviewThread", shortName: "代码评审线程", description: "展示代码评审线程，带严重度、建议改动和解决状态", category: "data-display", group: "collection", status: "new" },
  { slug: "virtual-list", name: "VirtualList", shortName: "虚拟滚动", description: "只渲染可见行，让上万条列表也能流畅滚动", category: "data-display", group: "collection", status: "new" },
  { slug: "infinite-scroll", name: "InfiniteScroll", shortName: "无限滚动", description: "滚到接近底部时自动加载下一批内容", category: "data-display", group: "collection", status: "new" },
  { slug: "badge", name: "Badge", shortName: "计数角标", description: "在内容一角叠加计数或小红点，计数可封顶", category: "data-display", group: "info", status: "new" },
  { slug: "dot", name: "Dot", shortName: "状态圆点", description: "一个状态圆点，可带语义色、呼吸动效和无障碍名", category: "data-display", group: "info", status: "new" },
  { slug: "status-dot", name: "StatusDot", shortName: "健康状态点", description: "用圆点加文字表示服务在线、降级、离线还是维护", category: "data-display", group: "info", status: "new" },
  { slug: "chip", name: "Chip", shortName: "标签", description: "紧凑的标记令牌，可带圆点也可移除", category: "data-display", group: "info", status: "new" },
  { slug: "filter-chip", name: "FilterChip", shortName: "已应用筛选条件胶囊", description: "回显一条已应用的筛选条件，可点开重选也可移除", category: "data-display", group: "info", status: "new" },
  { slug: "coupon", name: "Coupon", shortName: "优惠券", description: "展示优惠券的面额、门槛、有效期和领取状态", category: "data-display", group: "info", status: "new" },
  { slug: "tag", name: "Tag", shortName: "状态标签", description: "给内容打上语义状态标签，可带图标和关闭按钮", category: "data-display", group: "info", status: "new" },
  { slug: "annotation", name: "Annotation", shortName: "手写风格标注", description: "用荧光笔、手绘箭头和手写旁注就地讲解行内内容", category: "data-display", group: "info", status: "new" },
  { slug: "avatar", name: "Avatar", shortName: "头像", description: "展示用户头像，加载失败时回退到备用内容", category: "data-display", group: "info", status: "new" },
  { slug: "avatar-circles", name: "AvatarCircles", shortName: "堆叠头像组", description: "把多个头像叠成一排，末尾带溢出计数", category: "data-display", group: "info", status: "new" },
  { slug: "user", name: "User", shortName: "用户卡", description: "把头像、姓名和描述组合成一行用户信息", category: "data-display", group: "info", status: "new" },
  { slug: "qrcode", name: "QRCode", shortName: "二维码", description: "生成跟随主题配色的二维码，可加中心 logo 并导出", category: "data-display", group: "info", status: "new" },
  { slug: "comment", name: "Comment", shortName: "评论", description: "展示可嵌套的评论回复，带缩进和操作区", category: "data-display", group: "info", status: "new" },
  { slug: "relative-time", name: "RelativeTime", shortName: "相对时间", description: "把时间戳显示成「3 分钟前」这类相对时间并自动刷新", category: "data-display", group: "info", status: "new" },
  { slug: "git-commit", name: "GitCommit", shortName: "git 提交引用", description: "展示一次提交的分支、短哈希、说明和作者", category: "data-display", group: "info", status: "new" },
  { slug: "deploy-status", name: "DeployStatus", shortName: "部署状态", description: "表示部署处在排队、构建、上线、失败还是取消", category: "data-display", group: "info", status: "new" },
  { slug: "contribution-graph", name: "ContributionGraph", shortName: "贡献活动墙", description: "把每日活动量画成日历格子墙，附深浅图例", category: "data-display", group: "collection", status: "new" },
  { slug: "legend", name: "Legend", shortName: "独立图例", description: "给自绘的图形配一组带色块的图例条目", category: "data-display", group: "stat", status: "new" },
  { slug: "shield-badge", name: "ShieldBadge", shortName: "README 徽章", description: "生成左标签右数值的仓库徽章，可点击可分组", category: "data-display", group: "info", status: "new" },
  { slug: "award-badge", name: "AwardBadge", shortName: "桂冠奖章", description: "用桂冠徽记展示名次或荣誉称号，徽记可替换", category: "data-display", group: "info", status: "new" },
  { slug: "credit-card", name: "CreditCard", shortName: "银行卡展示", description: "展示银行卡卡面，自动识别品牌并可打码", category: "data-display", group: "info", status: "new" },
  { slug: "stat", name: "Stat", shortName: "指标卡", description: "展示一个关键指标的数值、标签和升降趋势", category: "data-display", group: "stat", status: "new" },
  { slug: "statistic", name: "Statistic", shortName: "统计数值", description: "格式化统计数值，可带前后缀、滚动入场或倒计时", category: "data-display", group: "stat", status: "new" },
  { slug: "chart", name: "Chart", shortName: "图表", description: "提供面积图、柱图、折线、饼图等常用图表，配色跟随主题", category: "data-display", group: "stat", status: "new" },
  { slug: "meter", name: "Meter", shortName: "度量条", description: "用语义化的量条表示某个值在已知范围里的占比", category: "data-display", group: "stat", status: "new" },
  { slug: "timeline", name: "Timeline", shortName: "时间线", description: "把事件按时间排成一条线，节点样式可自定义", category: "data-display", group: "stat", status: "new" },
  { slug: "number-ticker", name: "NumberTicker", shortName: "数字滚动", description: "数字进入视口后滚动跳转到目标值", category: "data-display", group: "stat", tags: ["animated"], status: "new" },
  { slug: "world-map", name: "WorldMap", shortName: "点阵世界地图", description: "在点阵世界地图上标点、画飞线并支持下钻", category: "data-display", group: "stat", tags: ["animated"], status: "new" },
  { slug: "empty", name: "Empty", shortName: "空状态", description: "说明当前没有内容，带图标、说明和后续操作", category: "data-display", group: "placeholder", status: "new" },
  { slug: "skeleton", name: "Skeleton", shortName: "骨架屏", description: "用占位骨架预留内容位置，等待数据到达", category: "data-display", group: "placeholder", status: "new" },
  { slug: "watermark", name: "Watermark", shortName: "水印", description: "给页面铺上防篡改的水印，支持高清屏", category: "data-display", group: "placeholder", status: "new" },

  // ── 导航 navigation ──────────────────────────────────────────
  { slug: "navbar", name: "Navbar", shortName: "导航栏", description: "搭出响应式顶部导航，含品牌、链接和移动端菜单", category: "navigation", group: "global", status: "new" },
  { slug: "beian-footer", name: "BeianFooter", shortName: "备案页脚", description: "在页脚展示 ICP 备案与公安备案信息并链到官网", category: "navigation", group: "global", status: "new" },
  { slug: "brand", name: "Brand", shortName: "品牌标识", description: "展示品牌徽章、站名和副标题，可收起成纯徽章", category: "navigation", group: "global", status: "new" },
  { slug: "app-launcher", name: "AppLauncher", shortName: "应用启动台", description: "打开可搜索的应用图标网格，按分类归组", category: "navigation", group: "global", status: "new" },
  { slug: "sidebar", name: "Sidebar", shortName: "应用侧栏", description: "提供可折叠的应用侧栏外壳，移动端自动变抽屉", category: "navigation", group: "global", status: "new" },
  { slug: "nav-menu", name: "NavMenu", shortName: "侧边导航菜单", description: "渲染多级侧边导航，可内联展开也可收成图标", category: "navigation", group: "global", status: "new" },
  { slug: "navigation-menu", name: "NavigationMenu", shortName: "导航菜单", description: "用共享浮层承载导航触发器、链接和大面板", category: "navigation", group: "global", status: "new" },
  { slug: "menu", name: "Menu", shortName: "下拉菜单", description: "用下拉菜单收纳操作项，支持分组和危险项", category: "navigation", group: "global", status: "new" },
  { slug: "menubar", name: "Menubar", shortName: "菜单条", description: "把常驻的应用菜单排成一条键盘可达的菜单栏", category: "navigation", group: "global", status: "new" },
  { slug: "dock", name: "Dock", shortName: "放大坞", description: "一排会随鼠标靠近放大的图标快捷入口", category: "navigation", group: "global", status: "new" },
  { slug: "tabs", name: "Tabs", shortName: "选项卡", description: "在多个内容面板之间切换，指示条可下划线可实心", category: "navigation", group: "inpage", status: "new" },
  { slug: "breadcrumb", name: "Breadcrumb", shortName: "面包屑", description: "展示当前页面在层级中的位置，并标出当前页", category: "navigation", group: "inpage", status: "new" },
  { slug: "pagination", name: "Pagination", shortName: "分页器", description: "在分好页的数据间跳转，页码过多时折叠成省略号", category: "navigation", group: "inpage", status: "new" },
  { slug: "anchor", name: "Anchor", shortName: "锚点导航", description: "在长文里跟踪当前标题并平滑跳转到各节", category: "navigation", group: "inpage", status: "new" },
  { slug: "affix", name: "Affix", shortName: "固钉", description: "滚过一定距离后把内容固定在屏幕上，不让布局跳动", category: "navigation", group: "inpage", status: "new" },
  { slug: "back-top", name: "BackTop", shortName: "回顶", description: "滚动超过一定高度后浮出按钮，点它平滑回到顶部", category: "navigation", group: "inpage", status: "new" },
  { slug: "stepper", name: "Stepper", shortName: "步骤条", description: "只标当前进度的极简横向步骤条，一条线走到底", category: "navigation", group: "inpage", status: "new" },
  { slug: "steps", name: "Steps", shortName: "步骤条(原生)", description: "分步流程的完整步骤条，可横可竖、能派生状态也能点击跳转", category: "navigation", group: "inpage", status: "new" },
  { slug: "page-header", name: "PageHeader", shortName: "页头骨架", description: "组合返回、面包屑、标题、标签和操作区做出页头", category: "navigation", group: "inpage", status: "new" },
  { slug: "command", name: "Command", shortName: "命令面板", description: "用快捷键唤起面板，搜索并执行分好组的命令", category: "navigation", group: "action", status: "new" },
  { slug: "context-menu", name: "ContextMenu", shortName: "右键菜单", description: "在右键落点弹出上下文操作菜单，可标危险项", category: "navigation", group: "action", status: "new" },
  { slug: "toolbar", name: "Toolbar", shortName: "工具栏", description: "把一组操作控件排成工具栏，焦点可键盘漫游", category: "navigation", group: "action", status: "new" },
  { slug: "accordion", name: "Accordion", shortName: "手风琴", description: "折叠展开多段内容，可单开也可多开", category: "navigation", group: "action", status: "new" },
  { slug: "collapsible", name: "Collapsible", shortName: "折叠区", description: "折叠或展开一块内容，带高度过渡", category: "navigation", group: "action", status: "new" },
  { slug: "link", name: "Link", shortName: "链接", description: "带样式的链接，外链自动加图标和安全属性", category: "navigation", group: "action", status: "new" },
  { slug: "animated-theme-toggler", name: "AnimatedThemeToggler", shortName: "主题切换", description: "用一圈圆形揭示动画切换明暗主题", category: "navigation", group: "action", tags: ["animated"], status: "new" },

  // ── 反馈 feedback ────────────────────────────────────────────
  { slug: "dialog", name: "Dialog", shortName: "对话框", description: "在模态浮层里承载内容，并锁住键盘焦点", category: "feedback", group: "overlay", status: "stable" },
  { slug: "modal", name: "Modal", shortName: "命令式对话框", description: "用函数调用直接弹出确认、成功、警告等对话框", category: "feedback", group: "overlay", status: "new" },
  { slug: "alert-dialog", name: "AlertDialog", shortName: "确认对话框", description: "对高风险操作要求明确确认，不能随手关掉", category: "feedback", group: "overlay", status: "new" },
  { slug: "drawer", name: "Drawer", shortName: "抽屉", description: "从屏幕任意一边滑出抽屉，承载内容或任务", category: "feedback", group: "overlay", status: "new" },
  { slug: "popover", name: "Popover", shortName: "气泡卡片", description: "把可交互的内容锚在触发元素旁边", category: "feedback", group: "overlay", status: "new" },
  { slug: "tooltip", name: "Tooltip", shortName: "提示浮层", description: "悬停时在旁边浮出一句简短说明，带指向箭头", category: "feedback", group: "overlay", status: "new" },
  { slug: "hover-card", name: "HoverCard", shortName: "悬停卡片", description: "悬停后浮出富内容卡片，移开延时关闭", category: "feedback", group: "overlay", status: "new" },
  { slug: "glimpse", name: "Glimpse", shortName: "链接预览", description: "悬停链接时预览目标的封面、标题和摘要", category: "feedback", group: "overlay", status: "new" },
  { slug: "hero-video-dialog", name: "HeroVideoDialog", shortName: "视频弹层", description: "点击封面缩略图，在模态浮层里播放视频", category: "feedback", group: "overlay", status: "new" },
  { slug: "element-selection-overlay", name: "ElementSelectionOverlay", shortName: "元素选择叠加层", description: "在页面或同源 iframe 里悬停高亮、点击选中元素并回传路径", category: "feedback", group: "overlay", status: "new" },
  { slug: "alert", name: "Alert", shortName: "提示条", description: "在页面里常驻一条信息、成功、警告或危险提示", category: "feedback", group: "message", status: "new" },
  { slug: "intercept-card", name: "InterceptCard", shortName: "拦截卡", description: "说清一个动作为什么被规则挡下，并给出放行入口", category: "feedback", group: "message", status: "new" },
  { slug: "callout", name: "Callout", shortName: "文档提示框", description: "在长文里插入提示、注意或经验类的说明块", category: "feedback", group: "message", status: "new" },
  { slug: "banner", name: "Banner", shortName: "公告条", description: "在容器顶部通栏播报公告，可带操作和关闭", category: "feedback", group: "message", status: "new" },
  { slug: "toast", name: "Toast", shortName: "命令式轻提示", description: "用命令式调用弹出会自动消失的轻提示", category: "feedback", group: "message", status: "new" },
  { slug: "notification", name: "Notification", shortName: "通知", description: "在屏幕角落堆叠通知卡片，可带图标和操作", category: "feedback", group: "message", status: "new" },
  { slug: "service-message", name: "ServiceMessage", shortName: "服务通知卡片", description: "展示服务通知卡片，含来源抬头、字段和底部入口", category: "feedback", group: "message", status: "new" },
  { slug: "result", name: "Result", shortName: "结果页", description: "展示操作结果或错误页，含图标、说明和后续操作", category: "feedback", group: "message", status: "new" },
  { slug: "gift-feed", name: "GiftFeed", shortName: "礼物连击", description: "展示直播礼物流，同一礼物自动合并成连击", category: "feedback", group: "message", tags: ["animated"], status: "new" },
  { slug: "floating-reactions", name: "FloatingReactions", shortName: "飘心点赞", description: "从底部喷射一串上浮又淡出的点赞表情", category: "feedback", group: "message", tags: ["animated"], status: "new" },
  { slug: "popconfirm", name: "Popconfirm", shortName: "气泡确认", description: "在操作按钮旁就地确认一次危险动作", category: "feedback", group: "message", status: "new" },
  { slug: "spin", name: "Spin", shortName: "加载遮罩", description: "给内容区盖上加载遮罩，可延迟出现避免闪烁", category: "feedback", group: "loading", status: "new" },
  { slug: "spinner", name: "Spinner", shortName: "加载旋转器", description: "一个独立的加载旋转圈，带状态语义", category: "feedback", group: "loading", status: "new" },
  { slug: "progress", name: "Progress", shortName: "进度条", description: "展示确定或不确定的进度，可线形可环形", category: "feedback", group: "loading", status: "new" },
  { slug: "tour", name: "Tour", shortName: "漫游引导", description: "带用户走一遍功能引导，高亮目标并逐步说明", category: "feedback", group: "guide", status: "new" },

  // ── AI 智能体 ai ─────────────────────────────────────────────
  { slug: "conversation", name: "Conversation", shortName: "消息流容器", description: "纵向堆叠对话消息，新内容自动贴底", category: "ai", group: "conversation", status: "new" },
  { slug: "chat-message", name: "ChatMessage", shortName: "对话气泡", description: "展示一条对话消息，含角色、头像、时间和操作", category: "ai", group: "conversation", status: "new" },
  { slug: "prompt-input", name: "PromptInput", shortName: "提示输入", description: "输入并发送提示词，支持停止、换行和输入法保护", category: "ai", group: "conversation", status: "new" },
  { slug: "typing-dots", name: "TypingDots", shortName: "打字指示", description: "用三个跳动的点表示对方正在输入", category: "ai", group: "conversation", tags: ["animated"], status: "new" },
  { slug: "thinking-block", name: "ThinkingBlock", shortName: "思考折叠块", description: "折叠展示智能体的思考过程，可以看到耗时", category: "ai", group: "agent", tags: ["animated"], status: "new" },
  { slug: "tool-call", name: "ToolCall", shortName: "工具调用卡", description: "展示一次工具调用的参数、进度和结果", category: "ai", group: "agent", status: "new" },
  { slug: "agent-plan", name: "AgentPlan", shortName: "执行计划", description: "列出智能体的执行计划，逐条标出进行和完成", category: "ai", group: "agent", status: "new" },
  { slug: "dossier", name: "Dossier", shortName: "案卷面板", description: "展示智能体各信息域的收集进度和内容摘要", category: "ai", group: "agent", status: "new" },
  { slug: "artifact", name: "Artifact", shortName: "工件卡", description: "在对话里承载生成的文档或代码，可展开收起", category: "ai", group: "agent", status: "new" },
  { slug: "confirm-card", name: "ConfirmCard", shortName: "确认卡", description: "请用户确认智能体提出的操作，或要求修正", category: "ai", group: "agent", status: "new" },
  { slug: "thread-list", name: "ThreadList", shortName: "会话历史列表", description: "列出历史会话，可切换、删除和新建", category: "ai", group: "agent", status: "new" },
  { slug: "task-runner", name: "TaskRunner", shortName: "任务运行卡", description: "汇总一次任务运行的状态、步骤、进度和耗时", category: "ai", group: "agent", status: "new" },
  { slug: "streaming-text", name: "StreamingText", shortName: "流式文本", description: "展示流式增长的文本，末尾跟一个闪烁光标", category: "ai", group: "assist", tags: ["animated"], status: "new" },
  { slug: "prompt-suggestions", name: "PromptSuggestions", shortName: "建议提示", description: "给出可点击的起始提问或追问建议", category: "ai", group: "assist", status: "new" },
  { slug: "message-actions", name: "MessageActions", shortName: "消息操作条", description: "给一条消息配上复制、重试和点赞点踩", category: "ai", group: "assist", status: "new" },
  { slug: "citation", name: "Citation", shortName: "引用来源", description: "在正文里内联标注一条来源，可点开原文", category: "ai", group: "assist", status: "new" },

  // ── 装饰 decoration（纯视觉、无功能本体）────────────────────────
  { slug: "dot-pattern", name: "DotPattern", shortName: "点阵背景", description: "铺一层跟随主题配色的点阵背景，点距可调", category: "decoration", group: "backdrop", status: "new" },
  { slug: "grid-pattern", name: "GridPattern", shortName: "网格背景", description: "铺一层线条网格作为区块背景，可换成虚线", category: "decoration", group: "backdrop", status: "new" },
  { slug: "striped-pattern", name: "StripedPattern", shortName: "斜条纹背景", description: "用轻量的斜条纹给区块打底，颜色跟随文字色", category: "decoration", group: "backdrop", status: "new" },
  { slug: "spotlight", name: "Spotlight", shortName: "径向辉光背景", description: "在内容后面打一片跟随主题的径向辉光", category: "decoration", group: "backdrop", status: "new" },
  { slug: "retro-grid", name: "RetroGrid", shortName: "复古透视网格", description: "让透视网格向观众持续推进，营造复古氛围", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "ripple", name: "Ripple", shortName: "同心脉冲圆环", description: "从一个原点向外扩散一圈圈同心光环", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "meteors", name: "Meteors", shortName: "流星雨", description: "让一阵流星带着拖尾斜斜划过内容背景", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  // 设计感背景批（复刻 react-bits/Aceternity·canvas 零依赖 + WebGL/ogl 懒加载·全吃 chart token·reduced-motion 降级）
  { slug: "aurora", name: "Aurora", shortName: "极光渐变背景", description: "让多层极光渐变缓缓流过背景，并向中心聚焦", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "particles", name: "Particles", shortName: "交互粒子场", description: "一片会被鼠标推开的粒子星尘，颜色随主题走", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "flickering-grid", name: "FlickeringGrid", shortName: "闪烁网格", description: "让网格里的方块随机明灭，透出技术感", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "wavy-background", name: "WavyBackground", shortName: "噪声波浪", description: "用噪声驱动的多彩波浪带铺满背景", category: "decoration", group: "backdrop", tags: ["animated"], status: "new" },
  { slug: "silk", name: "Silk", shortName: "丝绸流动背景", description: "铺一层丝绸般连续流动的光泽背景", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "iridescence", name: "Iridescence", shortName: "虹彩光泽背景", description: "随鼠标变化的虹彩光泽，像看一层油膜反光", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "threads", name: "Threads", shortName: "流动丝线背景", description: "一束随鼠标摆动的发光丝线在背景里流动", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "orb", name: "Orb", shortName: "指针交互光球", description: "展示一颗会随悬停增亮旋转的发光能量球", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "liquid-chrome", name: "LiquidChrome", shortName: "液态铬背景", description: "液态金属般的反光背景，鼠标划过泛起涟漪", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "border-beam", name: "BorderBeam", shortName: "边框光束", description: "让一道光束沿着元素边框循环绕圈", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "shine-border", name: "ShineBorder", shortName: "流光边框", description: "让一道渐变流光沿元素边框来回游走", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "glare-hover", name: "GlareHover", shortName: "反光悬停", description: "悬停时让一道斜向反光扫过内容表面", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "lens", name: "Lens", shortName: "放大镜", description: "在指针处圆形放大下方的任意内容", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "animated-beam", name: "AnimatedBeam", shortName: "动效光束", description: "在两个元素之间画一条流动的连接光束", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "orbiting-circles", name: "OrbitingCircles", shortName: "轨道环绕", description: "让子元素沿圆形轨道匀速环绕中心", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "progressive-blur", name: "ProgressiveBlur", shortName: "渐进模糊", description: "在内容一侧做出层层递进的方向性模糊", category: "decoration", group: "overlay-fx", status: "new" },
  { slug: "card-spotlight", name: "CardSpotlight", shortName: "聚光卡片", description: "让卡片内部跟随指针透出一圈聚光", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },

  // ── 设备外壳 mockups ─────────────────────────────────────────
  { slug: "safari", name: "Safari", shortName: "浏览器外壳", description: "用 Safari 风格的浏览器窗口包住截图", category: "mockups", group: "window", status: "new" },
  { slug: "chrome", name: "Chrome", shortName: "浏览器外壳", description: "用 Chrome 风格的浏览器窗口包住截图，带标签页", category: "mockups", group: "window", status: "new" },
  { slug: "terminal", name: "Terminal", shortName: "终端框", description: "在终端窗口里逐行揭示命令和输出", category: "mockups", group: "window", tags: ["animated"], status: "new" },
  { slug: "iphone", name: "iPhone", shortName: "手机外壳", description: "用带灵动岛的手机外壳把内容包成展示图", category: "mockups", group: "device", status: "new" },
  { slug: "android", name: "Android", shortName: "安卓外壳", description: "用带打孔摄像头的安卓手机外壳包住内容", category: "mockups", group: "device", status: "new" },
  { slug: "tablet", name: "Tablet", shortName: "平板外壳", description: "用平板外壳把内容包成设备展示图，可选机型", category: "mockups", group: "device", status: "new" },
  { slug: "watch", name: "Watch", shortName: "手表外壳", description: "用智能手表外壳包住紧凑内容做展示", category: "mockups", group: "device", status: "new" },

  // ── 移动端 mobile ──────────────────────────────────────────────
  { slug: "tab-bar", name: "TabBar", shortName: "底部导航栏", description: "移动端底部导航栏，带角标并避开底部安全区", category: "mobile", group: "nav", status: "new" },
  { slug: "fab", name: "Fab", shortName: "悬浮操作钮", description: "在页面上方浮一个主操作按钮，可展开子动作", category: "mobile", group: "nav", status: "new" },
  { slug: "action-sheet", name: "ActionSheet", shortName: "动作面板", description: "从屏幕底部滑出一组适合触屏的操作项", category: "mobile", group: "overlay", status: "new" },
  { slug: "picker", name: "Picker", shortName: "滚轮选择器", description: "用一到多列滚轮选值，松手吸附到居中项", category: "mobile", group: "input", status: "new" },
  { slug: "swipe-action", name: "SwipeAction", shortName: "列表项滑动操作", description: "横向滑动列表项，露出后面的操作按钮", category: "mobile", group: "gesture", status: "new" },
  { slug: "pull-to-refresh", name: "PullToRefresh", shortName: "下拉刷新", description: "顶部下拉触发刷新，松手后保持到请求结束", category: "mobile", group: "gesture", status: "new" },
  { slug: "safe-area", name: "SafeArea", shortName: "安全区适配", description: "给指定边加上设备安全区内距，避开刘海和横条", category: "mobile", group: "layout", status: "new" },
  // —— react-bits 移植批 ——
  { slug: "ascii-text", name: "ASCIIText", shortName: "ASCII 字符画", description: "把文字渲染成会波动的 ASCII 字符画", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "curved-loop", name: "CurvedLoop", shortName: "弧形跑马灯", description: "让文字沿一条弧线无缝循环滚动，可拖动拨快", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "falling-text", name: "FallingText", shortName: "文字散落", description: "让词语受重力散落、碰撞堆叠，还能被拖起来抛出", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "fuzzy-text", name: "FuzzyText", shortName: "噪点模糊标题", description: "给标题叠上扫描噪点，悬停时抖动更明显", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "scrambled-text", name: "ScrambledText", shortName: "乱码悬停文字", description: "指针靠近时字符先翻滚乱码再收敛回原文", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "reveal", name: "Reveal", shortName: "逐级揭示", description: "让任意内容进入视口时位移淡入，子项可依次错峰", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "scroll-float", name: "ScrollFloat", shortName: "滚动浮现标题", description: "随着滚动进度把标题逐字从下方拔起", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "scroll-velocity", name: "ScrollVelocity", shortName: "滚动跑马灯", description: "让多行文字按页面滚动的速度反向跑动", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "shuffle", name: "Shuffle", shortName: "洗牌解密文字", description: "先把字符洗成乱码，再按顺序锁定成原文", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "text-cursor", name: "TextCursor", shortName: "光标拖尾文字", description: "沿指针轨迹落下一串字形，随后浮动淡出", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "text-pressure", name: "TextPressure", shortName: "逐字符\"压感\"标题", description: "让字形的字重、宽度和倾斜随鼠标远近变化", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "variable-proximity", name: "VariableProximity", shortName: "邻近可变字体", description: "按指针与每个字的距离插值可变字体的各条轴", category: "typography", group: "text", tags: ["animated"], status: "new" },
  { slug: "antigravity", name: "Antigravity", shortName: "反重力粒子", description: "指针靠近时把漂浮粒子吸进环绕轨道，离开再放回", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "blob-cursor", name: "BlobCursor", shortName: "果冻光标", description: "让一串弹性液滴融成水银跟着指针跑", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "click-spark", name: "ClickSpark", shortName: "点击火花", description: "在点击处迸出一圈短线火花后散去", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "crosshair", name: "Crosshair", shortName: "准星十字线", description: "用一横一纵的准星线跟随指针移动", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "electric-border", name: "ElectricBorder", shortName: "通电边框", description: "让元素边缘跳动着放电般的辉光描边", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "ghost-cursor", name: "GhostCursor", shortName: "幽灵拖尾光标", description: "让一团幽灵烟雾拖着惯性跟随指针", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "gradual-blur", name: "GradualBlur", shortName: "渐进贴边模糊", description: "沿容器某一边叠出逐层加深的贴边模糊", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "image-trail", name: "ImageTrail", shortName: "光标图片拖尾", description: "沿指针快速移动的轨迹甩出一串淡出的图片", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "laser-flow", name: "LaserFlow", shortName: "激光束", description: "让体积激光束自上而下穿过雾气倾泻", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "magic-rings", name: "MagicRings", shortName: "魔法光环", description: "画出跟随指针、循环扩张的同心光环", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "magnet", name: "Magnet", shortName: "指针磁吸", description: "让内容在一定半径内被指针吸引跟随，离开平滑归位", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "magnet-lines", name: "MagnetLines", shortName: "磁力线网格", description: "让一整片细线段实时转向指针所在的方向", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "meta-balls", name: "MetaBalls", shortName: "黏液融球", description: "让一组黏液球游走，靠近时融合、离开时分开", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "metallic-paint", name: "MetallicPaint", shortName: "液态金属漆面", description: "液态金属漆面，带折射色散和成段的金属条纹", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "orbit-images", name: "OrbitImages", shortName: "轨道环绕", description: "让子项沿椭圆、星形等预设或自定义轨道环绕流转", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "pixel-trail", name: "PixelTrail", shortName: "像素余晖拖尾", description: "指针划过点亮背后的像素格，随后逐格淡灭", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "pixel-transition", name: "PixelTransition", shortName: "像素转场卡", description: "用一幕随机散开的像素幕布在两组内容之间切换", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "ribbons", name: "Ribbons", shortName: "飘带跟随", description: "让一束飘带弹性追随指针划出轨迹", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "shape-blur", name: "ShapeBlur", shortName: "模糊形状高光", description: "让一块模糊的几何高光带阻尼跟随指针", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "splash-cursor", name: "SplashCursor", shortName: "流体溅射光标", description: "指针移动和点击时溅出彩色流体并消散", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "star-border", name: "StarBorder", shortName: "流星描边按钮", description: "让两道光带沿边缘来回扫过，把按钮框亮", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "sticker-peel", name: "StickerPeel", shortName: "可拖拽贴纸", description: "让贴纸的边角翘起，可拖动并跟随指针反光", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "target-cursor", name: "TargetCursor", shortName: "准星光标", description: "用会自动吸附到目标元素的准星替代鼠标指针", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "cubes", name: "Cubes", shortName: "立方体阵列", description: "一片会随指针靠近而倾斜的立方体阵列", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "logo-loop", name: "LogoLoop", shortName: "logo 跑马灯", description: "让一排 logo 无缝循环滚动，悬停可减速暂停", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "bubble-menu", name: "BubbleMenu", shortName: "气泡导航菜单", description: "从气泡按钮展开一屏错落排布的胶囊导航", category: "navigation", group: "global", tags: ["animated"], status: "new" },
  { slug: "card-nav", name: "CardNav", shortName: "卡片导航", description: "让胶囊顶栏展开，露出逐张错峰浮现的导航卡", category: "navigation", group: "global", tags: ["animated"], status: "new" },
  { slug: "flowing-menu", name: "FlowingMenu", shortName: "竖排流动菜单", description: "竖排菜单在指针进出时揭幕，透出循环滚动的文字或图片", category: "navigation", group: "global", tags: ["animated"], status: "new" },
  { slug: "gooey-nav", name: "GooeyNav", shortName: "胶质导航条", description: "切换导航项时让指示药丸像液体一样滑过去并迸出粒子", category: "navigation", group: "global", tags: ["animated"], status: "new" },
  { slug: "pill-nav", name: "PillNav", shortName: "胶囊导航条", description: "胶囊形导航，悬停时底色涨满、文字反相", category: "navigation", group: "global", tags: ["animated"], status: "new" },
  { slug: "staggered-menu", name: "StaggeredMenu", shortName: "侧滑分层菜单", description: "从侧边滑出分层导航面板，条目依次错峰入场", category: "navigation", group: "global", tags: ["animated"], status: "new" },
  { slug: "bounce-cards", name: "BounceCards", shortName: "扇形弹跳卡", description: "让一叠卡片弹跳着扇形铺开，悬停时互相让位", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "card-swap", name: "CardSwap", shortName: "卡片洗牌", description: "让堆叠的卡片轮流从最前落到队尾", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "chroma-grid", name: "ChromaGrid", shortName: "聚光卡片墙", description: "卡片墙整体压暗，只有指针光圈里透出全彩", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "circular-gallery", name: "CircularGallery", shortName: "弧形图片画廊", description: "让图片沿圆弧排开，可拖动惯性浏览", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "dome-gallery", name: "DomeGallery", shortName: "球面图库", description: "把图片贴在三维半球内壁，拖动旋转、点击放大", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "flying-posters", name: "FlyingPosters", shortName: "WebGL 海报飞行长廊", description: "让一列海报随滚动或拖拽翻折着飞过", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "infinite-menu", name: "InfiniteMenu", shortName: "球面菜单", description: "把菜单项分布在可拖动旋转的球面上，正对镜头者为当前项", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "magic-bento", name: "MagicBento", shortName: "便当卡片网格", description: "便当式卡片网格，带指针聚光、边框呼吸和可选倾斜", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "scroll-stack", name: "ScrollStack", shortName: "滚动堆叠卡", description: "随着滚动把卡片逐张钉住并层层堆叠", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "profile-card", name: "ProfileCard", shortName: "全息名片卡", description: "会随指针倾斜的全息名片卡，无头像时落首字母", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "tilt", name: "Tilt", shortName: "视差倾斜包裹器", description: "让任意内容随指针、陀螺仪或指定角度做三维倾斜", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "tilted-card", name: "TiltedCard", shortName: "倾斜卡片", description: "让图片卡朝指针倾斜，可带说明气泡", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "pixel-card", name: "PixelCard", shortName: "像素卡片", description: "悬停时用像素颗粒从中心生长着揭开卡片", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "decay-card", name: "DecayCard", shortName: "湍流溶解卡", description: "让图片卡随鼠标速度湍流溶解并视差倾斜", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "reflective-card", name: "ReflectiveCard", shortName: "金属反光证件卡", description: "金属质感的卡片，有斜向高光扫过和磨砂噪点", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "folder", name: "Folder", shortName: "3D 文件夹", description: "点击展开三维文件夹，扇形铺出里面的纸张", category: "data-display", group: "collection", tags: ["animated"], status: "new" },
  { slug: "border-glow", name: "BorderGlow", shortName: "发光边框卡", description: "让卡片边框和外圈光晕随指针靠近亮起", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "glass-icons", name: "GlassIcons", shortName: "玻璃图标网格", description: "把图标动作摆在玻璃拟态方块上，悬停时抬升旋转", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "glass-surface", name: "GlassSurface", shortName: "液态玻璃折射面", description: "做出会折射背景、边缘带色散的玻璃面", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "lanyard", name: "Lanyard", shortName: "挂绳工牌", description: "一枚可拖动的挂绳工牌，松手后摆动回位", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "model-viewer", name: "ModelViewer", shortName: "3D 模型舞台", description: "用三维舞台展示模型，可拖动旋转、自动巡游", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "fluid-glass", name: "FluidGlass", shortName: "流体玻璃", description: "让一枚玻璃透镜在流动的渐变底上折射滑过", category: "decoration", group: "overlay-fx", tags: ["animated"], status: "new" },
  { slug: "elastic-slider", name: "ElasticSlider", shortName: "橡皮筋音量滑块", description: "拖到两端会像橡皮筋一样拉伸的音量滑块", category: "forms", group: "basic", tags: ["animated"], status: "new" },
  { slug: "balatro", name: "Balatro", shortName: "螺旋油彩", description: "铺一层像素旋涡般混色的油彩背景", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "ballpit", name: "Ballpit", shortName: "彩球球池", description: "一坑会掉落碰撞、被指针推开的彩色小球", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "beams", name: "Beams", shortName: "流动光柱", description: "流动的体积光柱，带噪声起伏和胶片颗粒", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "color-bends", name: "ColorBends", shortName: "多色流场", description: "一束束有机彩色光带，会随指针弯折走向", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "dark-veil", name: "DarkVeil", shortName: "暗色帷幕", description: "暗色帷幕缓缓流动，带扫描线和颗粒质感", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "dither", name: "Dither", shortName: "抖动波纹", description: "把动态噪声波纹量化成复古的有序抖动像素", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "dot-field", name: "DotField", shortName: "交互式点阵背景", description: "一片会被指针推挤鼓胀、并泛起辉光的点阵", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "evil-eye", name: "EvilEye", shortName: "火焰邪眼", description: "画一只瞳孔跟随指针的翻腾火焰之眼", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "faulty-terminal", name: "FaultyTerminal", shortName: "故障终端雨", description: "出故障的终端字符雨，带撕裂、扫描线和涟漪", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "ferrofluid", name: "Ferrofluid", shortName: "铁磁流体", description: "铁磁流体般的金属峰脊，会被指针按出凹陷", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "floating-lines", name: "FloatingLines", shortName: "漂浮线束", description: "缓缓漂浮的正弦线束，会随指针弯曲", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "galaxy", name: "Galaxy", shortName: "视差星河", description: "多层视差星河，带闪烁的星点和纵深感", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "gradient-blinds", name: "GradientBlinds", shortName: "渐变百叶窗", description: "把多色渐变切成竖条百叶，并跟随指针打光", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "grainient", name: "Grainient", shortName: "颗粒渐变", description: "三色扭曲渐变叠上胶片颗粒，做出粗粝质感", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "grid-distortion", name: "GridDistortion", shortName: "网格扭曲", description: "让网格随指针拖拽液态扭曲，松手弹性回弹", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "grid-motion", name: "GridMotion", shortName: "倾斜网格视差", description: "让倾斜网格的相邻行随鼠标反向弹性移动", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "grid-scan", name: "GridScan", shortName: "扫描网格", description: "铺一片透视网格，让发光扫描线不断向纵深推进", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "hyperspeed", name: "Hyperspeed", shortName: "跃迁隧道", description: "从消失点冲面而来的跃迁光带隧道", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "letter-glitch", name: "LetterGlitch", shortName: "字符故障雨", description: "一片不断翻字变色的终端字符矩阵", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "lightfall", name: "Lightfall", shortName: "光束坠落", description: "让多色光束在隧道里坠落，可被指针牵引", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "lightning", name: "Lightning", shortName: "电弧极光", description: "不断闪烁的噪声电弧与极光柱", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "light-pillar", name: "LightPillar", shortName: "体积光柱", description: "一根上下双色渐变、内部持续翻涌的体积光柱", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "light-rays", name: "LightRays", shortName: "光束放射", description: "从指定原点射出会脉动的体积光束，可跟随指针", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "line-waves", name: "LineWaves", shortName: "波纹线阵", description: "多彩波纹线阵，会在指针处局部隆起", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "liquid-ether", name: "LiquidEther", shortName: "液态色域", description: "一片会被指针搅动翻涌的液态色域", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "pixel-blast", name: "PixelBlast", shortName: "点阵翻涌", description: "把翻涌的噪声量化成方块、圆点等像素形状", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "pixel-snow", name: "PixelSnow", shortName: "像素雪场", description: "带景深的像素雪场，可选方块、圆点或雪花", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "plasma", name: "Plasma", shortName: "等离子流动", description: "随指针扰动流动的等离子光场", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "plasma-wave", name: "PlasmaWave", shortName: "等离子波", description: "让两条等离子丝带交织流动并混出主题色", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "prism", name: "Prism", shortName: "棱镜分光", description: "让棱镜把光折射成彩虹般的体积光束", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "prismatic-burst", name: "PrismaticBurst", shortName: "棱镜光爆", description: "从中心放射可弯曲、可梳理的光谱射线", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "radar", name: "Radar", shortName: "雷达扫描", description: "画一台带同心环、辐条和旋转扫描臂的雷达", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "ripple-grid", name: "RippleGrid", shortName: "涟漪网格", description: "让发光网格被同心波和指针涟漪推挤起伏", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "shape-grid", name: "ShapeGrid", shortName: "几何网格", description: "让几何形无限滚动，悬停时填充并留下淡出的拖尾", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "side-rays", name: "SideRays", shortName: "侧光束", description: "从屏幕一角扇出两道来回摆动的光束", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
  { slug: "soft-aurora", name: "SoftAurora", shortName: "柔和极光", description: "柔和的双层噪声极光，随指针做视差移动", category: "decoration", group: "backdrop", tags: ["animated", "webgl"], status: "new" },
];


/** Localized display/search overlay. Stable component identifiers stay in {@link manifest}. */
export function componentMeta(item: ComponentMeta): LocalizedComponentDisplayMeta {
  const category = CATEGORIES.find((candidate) => candidate.key === item.category);
  const group = category?.groups.find((candidate) => candidate.key === item.group);
  if (DOCS_LOCALE === "en") {
    const localized = componentMetaEn[item.slug];
    const localizedCategory = componentCategoryMetaEn[item.category];
    return {
      ...localized,
      categoryLabel: localizedCategory.label,
      groupLabel: localizedCategory.groups[item.group].label,
      tags: item.tags ?? [],
      keywords: [
        ...localized.keywords,
        item.shortName,
        item.description,
        category?.label ?? "",
        group?.label ?? "",
      ].filter(Boolean),
    };
  }
  return {
    shortName: item.shortName,
    description: item.description,
    categoryLabel: category?.label ?? item.category,
    groupLabel: group?.label ?? "",
    tags: item.tags ?? [],
    keywords: [],
  };
}
