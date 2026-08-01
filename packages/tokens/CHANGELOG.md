# @hulianui/tokens

## 0.3.0

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

### Patch Changes

- 4237cf3: 提高亮暗主题下 primary、danger、success 与 warning 语义色的文字和底色对比度，并为危险色、警告色补充可复用的明暗阶。
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

## 0.2.0

### Minor Changes

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

## 0.1.2

### Patch Changes

- 549d24b: `--color-hairline` 补面向消费方的用途约束注释：该令牌**只能用于 `border-*`**。它在浅色主题的值就是 `transparent`（既定设计：靠阴影自带的发丝边分隔，避免与显式 border 形成双线），因此用作 `text-hairline` / `bg-hairline` / `fill-hairline` 时会静默隐形——不报错、不回落到继承色，元素直接看不见。填充与文字请用 `--color-border` 或 `--color-muted`。

  仅注释变更，令牌值与主题行为不变。文档站「颜色」页也已把 hairline 列入语义色表并标注该约束。

## 0.1.1

### Patch Changes

- 新增主题感知的发丝边框令牌 `--color-hairline`（亮色 transparent / 暗色取 border）。有阴影的组件亮色去硬 border、暗色保留发丝轮缘，~34 处 `border-border` → `hairline`。
