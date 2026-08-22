# @hulianui/tokens

## 0.11.0

### Minor Changes

- 1d83645: 新增字型令牌 `--hl-font-sans` / `--hl-font-mono`（#319）。

  此前 tokens 里没有任何字体变量：颜色、阴影、圆角、缓动都是两层令牌 + 运行时可换，唯独字体这一层空着。消费方想换字体只能覆盖 `body { font-family }` 靠继承往下渗，而 `@hulianui/ui` 里 48 个用 `font-mono` 的组件（Kbd / CodeEditor / JsonViewer / LogViewer / Snippet …）吃的是 Tailwind 的 `--font-mono`，根本不在那条继承链上 —— 换完字体，页面里仍有一批组件是另一套等宽栈，且改不动。

  现在 `preset-opinionated.css` 用 `@theme inline` 把 `--font-sans` / `--font-mono` 映射到这两个运行时变量，改一行 `:root` 即可同时改掉：`font-sans` / `font-mono` 工具类、Tailwind preflight 给 `<html>` 的默认字体、以及那 48 个组件。

  **默认值等价于 Tailwind v4 的默认字体栈**，不设这两个变量的项目渲染逐字不变。

  局部换字体时正文与等宽的写法不对称（实测）：等宽只需在容器上写 `--hl-font-mono`；正文除变量外还要给容器加一个 `font-sans` 类 —— 自定义属性会继承，但 `font-family: var(…)` 只在声明了该属性的元素上重新解析，普通文字继承的是根节点已解析完的字体名。详见 `packages/tokens/README.md` 的「换字体」一节。

## 0.10.0

### Minor Changes

- 068dd0f: 信号色（#295）：新增**不随主题变**的 `--color-signal-*` 一族

  `--color-signal-{danger,brand,success,warning}` 与各自的 `-foreground`，**只在 `:root` 定义、暗色块里刻意不重定义**，并在 `preset-core.css` 的 `@theme` 里映射成工具类（`bg-signal-danger` / `text-signal-danger-foreground`）。

  给的是**角标 / 未读点这类极小的实心标记**：它们的颜色本身就是语义（「红 = 有未读」），不是一块要融进主题的语义面。`-foreground` 那套口径对它们不成立 —— 暗色下 `--color-danger` 抬亮到 400 档（#fc5855），配套前景只能翻成近黑才够对比（同底白字仅 3.15，达不到 AA），落到角标上就是「红底黑字」，与 Ant Design / MUI 的通行样子相反。

  档位按对比度选，不按数字对齐：danger / brand 取 600，success / warning 取 700（绿与琥珀同档天然更亮，600 配白字只有 3.97 / 3.76，够不到 AA 4.5）。四组均满足「白字 ≥ 4.5」且「色块 vs 明暗两种页底 ≥ 3」（1.4.11：小块必须找得到）。实测 danger-600 `#d40924` —— 白字 5.43 / vs 暗底 3.66 / vs 亮底 5.21。刻意没用亮色那档的 danger-700：它在暗底上只有 2.99，色块会沉进背景。

  大面积语义面继续用 `--color-danger` 那一族，它们本就该随主题走。

## 0.9.1

### Patch Changes

- 写清 `-foreground` 只配实心底：浅底的文字色是语义色本身 <!-- parity-id: tokens-foreground-solid-only -->

  语义色每一档都有 `--color-x` 和 `--color-x-foreground`，命名上读起来就是「底色」与「配它的前景色」。
  但 `-foreground` **只对实心底成立** —— 亮色下它等于 `var(--white)`。消费方自己画一块浅底
  （`bg-warning-subtle` / `bg-warning/12`）时按命名直觉配上 `text-warning-foreground`，得到的是
  **白字白底**，文字直接消失（#268）。

  而且它在暗色下反而是对的（那边 `-foreground` 是近黑），所以谁在暗色主题里开发谁就查不出来；
  不报错、不告警、typecheck 与 guard 都看不见。正确配方此前**只存在于 `tag.tsx` 的
  `compoundVariants` 表里**，任何文档都没写。

  三处补上同一句话，照 `--color-hairline` 那条注释的既有做法（它是同类问题的先例）：

  - `semantic.css` 的 `-foreground` 组补注释，写明它只配实心底、浅底该用什么
  - 文档站色彩页：五个实心语义色（primary / danger / success / warning / info）的色卡下各挂一条
    ——那一行右侧正好就是「实心底 + 前景色」的示意，读到这里的人下一步多半就要自己画一块浅底
  - `Tag` 文档新增「三档配色」表（见 `@hulianui/ui` 同版本条目）

  | 表面    | 底                                        | 文字                      |
  | ------- | ----------------------------------------- | ------------------------- |
  | solid   | `bg-warning`                              | `text-warning-foreground` |
  | soft    | `bg-warning-subtle`（或 `bg-warning/12`） | `text-warning`            |
  | outline | `border-warning`                          | `text-warning`            |

  纯文档与注释，token 的值一个没动。

## 0.9.0

### Minor Changes

- 533c001: preset 补两组文字特效所需的关键帧与规则（`FlipText` / `TextReveal`）

  - `hulian-text-flip-top` / `-bottom` / `-left` / `-right`：四档方向各一条，只有 `to`（起点取元素静息的 transform），刻意不带 `forwards`——正反两面渲染的是同一个字，一轮播完容器自动回到 0°，观众看不出切换。
  - `hulian-text-reveal`：一条元素宽 3 倍的渐变从最右滑到最左。配 `fill-mode: both` 用，于是未开扫停在「整串透明」、扫完停在「整串实色」，而减弱动效下动画整条不存在、落回静态的 `background-position` = 整串实色。
  - `[data-hulian-flip-back]::after` / `[data-hulian-ghost-text]::after`：用 `content: attr(…)` 承载「不该进 DOM 文本」的那份文字（翻面件的背面、轮换件的占位串）。写成真节点会让标题的 `textContent` 出现双份或把所有候选串连在一起，框选复制与爬虫读到的文案一起被污染。写成 Tailwind 任意值类则要赌扫描器生成得出来，而它失手的表现是「翻到一半变空白」，所以落成真 CSS 规则。

## 0.8.0

### Minor Changes

- 90c8e02: `preset.css` 拆成两层，补齐 info 语义色（#166 #173）。

  **`preset.css` 三分，零破坏性**

  原本 697 行里只有约 30 行会「接管」消费方既有行为，其余全是安全的加法，绑在一个入口里导致存量项目想要后者就必须连前者一起吃 —— 接入成本被整个前置到第 0 步，而收益要等到开始换组件之后。

  | 入口                                      | 内容                                                         | 性质                                                                     |
  | ----------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
  | `@hulianui/tokens/preset-core.css`        | 语义 token → `--color-*` 映射、断点、42 个 `hulian-*` 关键帧 | **纯加法**，`hulian-` 前缀不撞名，断点与 Tailwind 默认同值               |
  | `@hulianui/tokens/preset-opinionated.css` | `@custom-variant dark`、`--shadow-*` 重绑、缓动重绑          | **接管**，改变项目里已有的 `dark:` / `shadow-*` / 裸 `transition` 的行为 |
  | `@hulianui/tokens/preset.css`             | 上面两份的聚合入口                                           | 与拆分前等价，**现有写法零改动**                                         |

  其中 `@custom-variant dark` 那条是**静默**的：shadcn 默认形态是 `<html class="dark">` + `@custom-variant dark (&:is(.dark *))`，被瑚琏的定义覆盖后全站 `dark:` 工具类不再匹配任何东西，表现是「半暗」—— 页面底色还是暗的（那来自 `.dark { --… }` token 块，不走 variant），前景色与边框留在亮色。构建成功、控制台无警告、DevTools 里规则确实存在，排查起来很绕。

  `docs/consuming.md` 新增一节写清三条出路（只引 core / 调整 `@custom-variant` 声明顺序 / 加一层 `--hl-theme` 桥），其中桥的写法已在 Chrome 151 实测验证，且确认与 #101 的主题岛语义相容（岛内元素不会被误点亮）。

  **补齐 info 语义色**

  primitives 补 `--info-50` … `--info-700`，semantic 补 `--color-info` / `-subtle` / `-border` / `-foreground` / `-hover`，明暗两套，与 success / warning / danger 完全对齐。

  色相落在 **225°**，与 brand（250–258°）拉开 25–33°，彩度也显著更低（info-500 是 0.112，brand-500 是 0.19）—— 读起来是「信息」而不是「品牌」。此前没有 info 色系时，消费方只能借 primary（提示条与主操作共用色相，品牌色权重被稀释）或借 gray（说明文字掉进背景），两条路都不好，而这个决定一旦做了就会散落到几百个消费点。

## 0.7.0

### Minor Changes

- 新增语义令牌 `--color-track`：分段控件的凹槽轨道底（#152） <!-- parity-id: color-track-token -->

  `Tabs variant="solid"` 与 `Segmented` 的轨道此前借用 `--color-surface-hover`，与药丸的 `--color-surface` 在浅色档只差 **3.3% 亮度**（对比约 1.06:1），选中态只靠一条 `shadow-sm` 撑着；暗色档更糟——轨道 `gray-800` 比药丸 `gray-900` 还**亮**，凹凸方向是反的。

  新令牌的定义是一条**关系**而非某个灰阶：恒比 `--color-surface` 沉一档，且亮暗两态都保证浮起件更靠近观察者。浅色 `gray-200`、暗色 `gray-950`、反色面板档为 4% 白掺色，三处都写全了（自定义属性是代入后才继承的，反色面板不显式重声明会拿到 `:root` 算好的浅灰死值）。

  想整体调轨道深浅只动这一个变量即可，不会像改 `--color-surface-hover` 那样波及全库 hover 态。

- 新增关键帧 `hulian-line-shadow`，供 `LineShadowText` 的斜线流动使用（#151） <!-- parity-id: line-shadow-keyframe -->

  默认不挂（该组件的 `animated` 默认 `false`），只在显式开启时生效。

- **破坏性**：`--color-muted` 与 shadcn/ui 对齐，语义反转（#142） <!-- parity-id: muted-semantics-align-shadcn -->

  - `--color-muted` 现在是**弱背景**（等价 `--color-subtle`），不再是次要文字色
  - 次要文字色改名 `--color-muted-foreground`

  原先两个名字与 shadcn 生态**同名反义**，而 shadcn 是 React 中后台事实上的起点。代价是双向的：从 shadcn 迁过来的项目一引入瑚琏 token，满屏 `bg-muted`（Skeleton、表格斑马纹、Avatar 占位底）立刻变成深灰色块，且消费方挡不住——这不是覆盖顺序能调的，是同一个名字被两种语义抢用；反过来库自己的贡献者也反复按 shadcn 肌肉记忆写 `text-muted-foreground`。

  **迁移**：`text-muted` → `text-muted-foreground`（`fill-` / `stroke-` / `border-` 等前缀同理）；`bg-muted` 不用改。`text-muted` 已无对应 token，而 Tailwind 对未定义颜色既不报错也不生成规则，写了会**静默回退成继承色**——用 `npx hulian-check` 逐条列出来改，别靠肉眼。

  新增语义浅档 `-subtle` / `-border`（#145）：`--color-primary-subtle`、`--color-primary-border`，`danger` / `success` / `warning` 同构。用于提示条底、选中行、Tag/Badge 浅底、侧栏当前项高亮。配套补齐原始色阶 `--brand-50/100/200/300`（`danger` / `success` / `warning` 同补），全部在 OKLCH 里手工定——sRGB 的 `mix()` 会带色相偏移，且各消费方挑的百分比不一，而浅档恰恰是中后台面积最大的那部分颜色。暗色下浅档**方向翻转**：不是抬亮度，而是把语义色掺进表面色。

  `tailwindcss` 降为**可选**对等依赖（#144）：四个入口里只有 `preset.css` 需要 Tailwind v4，其余三个是纯 CSS 自定义属性。Vue 2 + Element UI、纯 CSS 项目、还没升 v4 的存量仓库现在可以直接 `npm i @hulianui/tokens` 只吃令牌，不再 ERESOLVE 失败。

## 0.6.0

### Minor Changes

- 新增三类语义 token，均为「补齐缺席的档位」而不是改现有取值： <!-- parity-id: tokens-subtle-and-semantic-hover -->

  - `--color-subtle`：**静态**区域底（分组容器、看板列、泳道、说明条）。与 `--color-surface-hover` 当前同值，但语义不同——后者表达的是「surface 的悬停态」，给一块常驻底色写 `hover:` 是语义错位，也让「静态弱底」以后没有单独调整的抓手。此前这类场景大量误用了 `--color-muted`，而它是次要**文字**色：亮色下叠出一块脏灰、暗色下发白，两个主题都错且错法相反。
  - `--color-danger-hover` / `--color-success-hover` / `--color-warning-hover`：语义色的悬停档。取值规则是「亮暗两端之间的那一档」——亮色下变亮、暗色下变暗，两个主题都朝对比更弱的方向走一步，与既有的 `--color-primary-hover` 同构。缺这一档时 solid 语义按钮的 hover 只能写回自身，等于**没有悬停反馈**。
  - `--hl-layout-header-h`：整页骨架的顶栏高度（4rem）。此前这个数硬编码在 `Layout.Header` 与 `AdminLayout` 三处，消费方想让「侧栏顶部 logo 区与 Header 齐平」只能去源码里翻。

## 0.5.0

### Minor Changes

- 899ff6d: 修 #101：主题局部覆盖现在两个方向都成立（亮页里嵌暗岛、暗页里嵌亮岛）

  亮色此前只是 `:root` 上的默认值，不是一个可选择的主题。于是覆盖只有单向：亮页里嵌 `<div data-theme="dark">` 能生效（暗块自己匹配得上规则），暗页里嵌 `<div data-theme="light">` **完全无效**（没有对应规则，子树继续继承祖先的暗色变量）。CodeEditor 的 `theme` 逃生口、PreviewSandbox 的固定配色预览、文档站里并排展示明暗两态的对照卡，都卡在这一条上。

  两处改动：

  1. `semantic.css` 的亮色块改挂 `:root, [data-theme="light"]`。两条选择器特异性相同，而 `[data-theme="dark"]` 在源码里靠后，所以根节点标 dark 时仍然是暗色赢；嵌套亮色岛因为自己匹配上了规则，能覆盖继承来的暗色值。
  2. `preset.css` 的 `dark` variant 改按**最近的主题祖先**判定，岛内的 `dark:` 工具类跟着岛走而不是跟着页面走。

  第 2 点最后没有采用 issue 里提的 `:not([data-theme="light"] *)` 排除写法 —— 真实浏览器实测发现它会反过来打断「**显式**亮页 → 暗岛」这个每天都在跑的组合（`ThemeProvider` 会把 `light` 显式写在 `<html>` 上，于是暗岛内部同时也是 `[data-theme="light"] *`，`dark:` 工具类全部失效）。选择器表达不了「最近」，所以改判一个由继承传播的 `--hl-theme`：

  ```css
  @custom-variant dark {
    &:where([data-theme="dark"]) {
      @slot;
    } /* 岛根自己（@container 查的是父容器） */
    @container style(--hl-theme: dark) {
      @slot;
    } /* 其余元素看最近祖先 */
  }
  ```

  任意嵌套深度都正确，包括「暗页 → 亮岛 → 再嵌暗岛」。

  **基线**：style container query（Chrome 111 / Safari 18 / Firefox 128）。本库已经在依赖 `:has()` 与 `@container`，属同代能力。

  **体积代价**：每条 `dark:` 工具类从一条规则变成两条。实测扫全库源码编译出来是 276.7KB → 278.0KB（**+1.3KB / +0.5%**）—— 之所以这么小，是因为组件基本不写 `dark:`（语义 token 自己换值，这正是 token 层存在的意义）。

  验收按 issue 要求走了真实浏览器双向比对（Chrome，computed style + 截图），四种组合逐条核对：根默认亮页 → 暗岛、显式亮页 → 暗岛、暗页 → 亮岛、暗 → 亮 → 暗三层嵌套。岛内的 `dark:` 工具类、`shadow-*`（`--hl-shadow-*`）、`--color-hairline`（亮色 transparent / 暗色可见细线）与 `color-scheme` 全部跟着岛走；`[data-surface="inverse"]` 叠在亮岛里的行为一并确认正常（它只重映射中性色，与主题岛不冲突）。

  顺带堵住一个静默失败：`registry.json` 注入组件用的 `cssVars` 是从 `semantic.css` 正则抠出来的，选择器一改就悄无声息地把 light 抠成空（注入的组件页面能跑，只是全是默认色）。现在解析不出变量会直接报错。

## 0.4.0

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

- 新增主题感知的发丝边框令牌 `--color-hairline`（亮色 transparent / 暗色取 border）。有阴影的组件亮色去硬 border、暗色保留发丝轮缘，~34 处 `border-border` → `hairline`。 <!-- parity-id: tokens-0.1.1-hairline -->
