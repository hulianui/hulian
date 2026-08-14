# @hulianui/mcp

## 0.10.0

### Minor Changes

- `audit_hulian_adoption`：注释里的 `<table>` / `<input>` 不再当成裸标签，同一行也不再重复计数 <!-- parity-id: mcp-audit-skip-comments -->

  裸标签检测是按文本匹配的，**没有排除注释**。于是一个已经 100% 迁到 `@hulianui/ui` 的文件，
  只因为注释里写了「原来这里是手写 `<table>`」就被报成 `bare-table` 风险（#266）。两个让它更难忍的点：

  1. **注释写得越好，误报越多。** 迁移留下的说明必然长成「原来是手写 `<table>`，现在换成 `<Table>`」，
     这是最该写的注释，却成了扣分项。
  2. **照抄库自己的文档就会中招。** 报告里那条误报的原文，是从 `table.md` 的「禁忌 / 坑」抄下来的
     ——遵守文档 → 记下来 → 被自家审计报风险。

  修法是在共享的信号层（`adoption-signals.mjs`，audit tool 与横比脚本的共同事实）加一道
  `maskComments()`：把注释内容抹成空格再拿去匹配。**只抹注释，不碰字符串字面量** ——
  `className="fixed inset-0"` 与 `text-[#fff]` 恰恰住在字符串里，抹掉它们会把 `handmade-overlay` /
  `hardcoded-color` 两条规则一起废掉。所以它是个带状态的小扫描器而不是几条正则：`"https://x"` 里的
  `//` 不是注释。长度与换行逐字保留，行号与片段照旧准确。

  顺带按 `(规则, 文件, 行)` 去重：报告的粒度就是「一行」（snippet 就是整行），
  `from-[#a] to-[#b]` 这样一行两个色值此前会出两条一模一样的 `hardcoded-color`。

## 0.9.0

### Minor Changes

- 78705f8: 版本戳不再撒谎：产物与源码不同版时改为 error 级横幅，并给出兜底路径（#246）

  **症状**：MCP 返回的组件文档顶着 `registry v0.39.0` 的版本戳，而产物其实是 0.37.0 的源码生成的；同一条响应的脚注里 server 自己已经说了「产物版本 0.37.0，源码已是 0.39.0」。前后自相矛盾，而调用方（尤其是模型）只会信前面那个数，于是拿着过期 props 以为是最新。

  **根因不在生成器，在展示层**。`registry.json` 写的一直是「生成那一刻的源码版本」，这个字段是对的。是 #47 为了消掉 validate 里的假 skew，让 `registryMeta.version` 在本地模式下取**源码**版本，而拼版本戳那一行照抄了这个字段却仍用「registry v…」作标签 —— 一个字段承担了两种含义，标签说的是产物，数字给的是源码。产物真正落后时，这两者恰好分叉，而分叉正是唯一需要说话的时刻。

  - **版本戳诚实**：两者一致时照旧一行 `registry v<版本>`；不一致时写成 `产物 registry v<A> ≠ 源码 v<B>`，两个数都给出。`sourceInfo()` 同步补 `sourceVersion` 与 `versionSkew` 两个字段，`version` 的既有口径（这份检出/这次安装实际是什么版本，validate 据此比 skew）不变。
  - **不一致是 error 级，且贴在响应最顶部**，不再是脚注。脚注排在长文档之后，模型读到那儿时前面的 props 早被当成事实吸收了，而这条说的正是「前面那些 props 未必属于你装的那一版」。刻意不置 MCP 的 `isError`：那会让客户端把整条响应丢掉，调用方一个字都拿不到，而它此刻最需要的是「拿到内容 + 知道去哪儿核对」。
  - **`get_component_doc` 直接把兜底路径写给调用方**：正文来自产物时明说「以 `node_modules/@hulianui/ui/src/<slug>/<slug>.md` 与同目录的 `<slug>.types.ts` 为准」——这两份随 npm 包发布，永远与实装版本同版。正文取自源码 md 时（在瑚琏仓库里开发）则换一句话：正文可信，旧的只是「有哪些组件」这张清单，跑 `pnpm llms-registry` 即可。两种来源的处方不同，笼统说一句「产物旧了」会让人去改错的东西。
  - **补上消费方那一格**：`HULIAN_UI_ROOT` 指向 `node_modules/@hulianui/ui` 时根本没有 `apps/www/public`，旧的陈旧判定一进门就返回 null —— 「装的是 0.39.0、答的是线上 0.37.0」这条最常见的路径此前从未被检查过。现在版本比对独立于产物是否在本地，`get_component_doc({format:"json"})` 这条只读 `llms-props.json`、从不加载 registry 的路径也一并覆盖。

  同一个 issue 的机械化那一半落在仓库侧（不随包发布）：新增 `pnpm registry:version` 比对 `registry.json` / `llms-props.json` / `llms.txt` / `llms-full.txt` 四份提交进仓库的产物与 `packages/ui` 的版本，挂进 CI 的静态门禁、`version-packages` 收尾以及 Release 工作流的发布前置。判据只比版本号不比内容：要拦的是「发了新版却没重跑生成器」，它靠版本号就能证明且零误报。这类漂移不会让任何编译或测试变红，只会越走越远。

## 0.8.1

### Patch Changes

- 2bbad4a: 两条工具侧的误报。

  **guard**（#190）：`no-private-deep-import` 改成按消费方**实装的** `@hulianui/ui` 的 `exports` 判定，读不到实装包时才退回烤进本包的 slug 清单。清单是 `conventions.json` 生成那一刻的目录快照，于是「ui 发了新组件、guard 还没跟着发版」这段时间里，消费方一用新件就被判 error（0.29.0 的 `Label` 即如此），而给出的建议方向还是反的 —— 劝人退回根入口，那正是这条规则平时劝人别用的那个。现在 guard 与 ui 的版本不必再同步。

  **mcp**（#189）：`inspect_project` 的 Provider 探测会顺着入口文件的本地 import 往下跟**一层**（相对路径与 `@/` 别名）。App Router 的 root layout 是 Server Component，而 `ThemeProvider` 是 `"use client"`，所以正确写法恰恰是抽一个客户端岛 —— 只对入口文件做字面量匹配的话，**写对的项目反而永远告警**，而消掉这条告警的唯一办法是把 Provider 塞回 Server Component。这类恒定告警的真实危害是脱敏：看久了整块 setup 段被当噪音跳过，真缺 Provider 的那天也看不见了。`ConfigProvider` / `AccessProvider` 走同一套探测，一并受益。

  **门禁**（#182，不影响发布产物）：`docs:check:admin-demos` 只对「等超时」这一类失败重试一次，并把「重试 N 次后才通过」明确打印出来。断言失败 / CJK 泄漏 / 控制台报错一律不重试 —— 重试那些等于把真回归洗成绿的，而「红了就 rerun」正是真回归被漏掉的那条路径。首屏可见判定另给 60s 显式超时：连续跑多道浏览器门禁时 Chromium 连续启停会让它擦线，而页面本身没问题（重跑立刻可见）。

- Updated dependencies [2bbad4a]
  - @hulianui/guard@0.5.1

## 0.8.0

### Minor Changes

- 3ebfb26: `inspect_project` 与 `audit_hulian_adoption` 把「没挂 ConfigProvider」列为接入缺口（#164）。

  ThemeProvider 漏了页面立刻不对，ConfigProvider 漏了**页面看起来完全正常** —— 回退掉的是组件内置文案，其中大半在 `aria-label` 里（NumberField 的「减少」「增加」、Spinner 的「加载中」、Tag 的「移除」）。英文产品能带着一屏中文读屏标签上线而无人察觉，只有读屏用户和 e2e 断言才撞得到。

  按「建议」而非 error 报出（这两个 tool 明确不是门禁），并在文案里声明探测局限：只看入口文件里有没有这个标签，i18n 桥层挂在别处的项目自行确认。

## 0.7.0

### Minor Changes

- `get_component_doc` 查 props 时会一并给出插槽字段（#150）。

  `Button.render`、`Upload.label`/`hint`、`Stat.label`/`value`、`Avatar.fallback` 这类字段住在组件文档的 `## Slots` 章节而不是 Props 表。而本 server 的工作流写着「用到的每个组件在写第一行代码前必须查 props」，于是老老实实传 `sections:["props"]` 的人会得出「Button 没有 render」「Stat 没有 label」的结论——`Stat` 那两个还是**必填**的，一个 KPI 卡片查下来像是没有数据入口。省 context 的初衷不该以「查了等于没查」为代价。

  现在：`format="json"` 的 `props` 数组把插槽一并列出（各带 `kind:"slot"` 可区分），独立的 `slots` 数组照旧保留，两种消费方式都不漏；markdown 路径同样会带上 `## Slots`。反向不成立——单独要 `slots` 或 `events` 是明确的窄查询，不会被塞进 props。

  工作流说明里也点明了「插槽是独立章节且含必填项」，免得下一个人再踩。

## 0.6.1

### Patch Changes

- Updated dependencies
  - @hulianui/guard@0.5.0

## 0.6.0

### Minor Changes

- 补上特效件的**发掘通道**，让抑制与发掘对称（#140）。 <!-- parity-id: mcp-visual-discovery-channel -->

  库里 380 件组件中 92 件是装饰件、151 件带 `animated` 标签，但此前 MCP 侧抑制是机器可判定的（按分类一次拉黑 92 件），发掘只有手写的约 8 件。于是 agent 系统性地只用「安全」的功能件，做出来的页面对，但没有任何视觉记忆点——而交付物最终是给人看的。

  - **抑制精度从分类提到组**：`decoration` 内部 `backdrop`（52 件全屏背景 / WebGL）与 `overlay-fx`（40 件局部强调）是两种完全不同的东西，按整类拉黑等于中后台连入场过渡和卡片描边都被禁。profile 改用 `avoidGroups` + `allowEffects` 白名单。**#41 的非目标仍然守死**：中后台的 `visualBudget.heavy` 恒为 0，全屏背景与 WebGL 一件都进不去。
  - **氛围词轴**：特效需求的自然表述是形容词（「首屏想有点科技感」「这块太平了」「要有呼吸感」），此前这类 query 对 92 件装饰件全部打 0 分。`query: "tags:animated"` 还能按横切标签直查——动效是标签不是分类，文档站侧栏一直有这个入口，MCP 侧此前完全没有。
  - **每条返回都带视觉锚点**：`docsUrl`（能甩给人看的链接）、`motion`（`none` / `subtle` / `moderate` / `heavy`）、`look`（一句人话的观感：动了什么 / 多强 / 该放哪 / 不该放哪）。`look` 只给实测过的那批，其余返回 `null`——不给一句凭空想象的描述。
  - **主动提醒**：`recommend_ui` 与 `audit_hulian_adoption` 在「一件动效 / 强调件都没用到」时给出位置 + 候选 + 强度 + 降级说明。永远是建议、不进门禁、不计入任何指标，admin-console 下最多 1 条。
  - profile 新增 `visualBudget` / `preferEffects`，metrics 新增非门禁的 `visualExpressiveness`——让「对但平」这件事在报告里可见。

### Patch Changes

- Updated dependencies
  - @hulianui/guard@0.4.0

## 0.5.0

### Minor Changes

- 899ff6d: `get_component_doc` 新增 `format: "json"`：返回结构化 props，供受约束生成使用（#105）

  想让 LLM「只能输出白名单组件与合法 props」的消费方，此前只能拿 markdown 表格去解析，于是每家都要自己趟一遍同样的坑：转义竖线 `\|` 被当成列分隔符（#102）、类型列写的是别名而取值只在源码里（#103）、文档标题是展示名而非真实导出名（#104）。

  现在直接要结构化数据：

  ```jsonc
  { "name": "IPhone", "format": "json" } // 用真实导出名也能反查到组件
  ```

  返回逐条带 `kind`（enum / boolean / number / string / node / function / array / union）、`values`（枚举取值白名单）、`valueType`（`level={1}` 还是 `level="1"`）、`default`、`required` 的 props/events/slots，可直接生成 Zod 或 JSON Schema。同时走 `structuredContent`（MCP 里机器读的正路）与文本 JSON 两条通道；`sections` 照常可裁剪。

  数据源是新产物 `llms-props.json`：本地模式读 `apps/www/public/`，远程模式读文档站。

## 0.4.1

### Patch Changes

- 126ace2: `inspect_project`：monorepo 子项目里的 registry 包不再被误判为 `local-link`（closes #68）

  `linkKindOf` 的「逃逸」判据以**发现该包的那一层** `node_modules` 为基准，而 pnpm workspace 子项目里 `apps/web/node_modules/@hulianui/ui` 指向的是**仓库根**的 `node_modules/.pnpm/…`——天然逃出 `apps/web` 那层，于是每个子项目里的普通 registry 安装都被判成本地源码接入。`#45` 的回归 fixture 是单包项目、`.pnpm` 恰好与发现层同级，所以当时能过，缺陷藏了下来。

  后果与 `#45` 相同而且更隐蔽：`linked` 恒 `true` 让「声明 vs 实装」的版本漂移门禁**静默失效**，同时 `importStrategy` 给出错误原因（说是本地源码接入、要求上 Vite 预构建插件），`@hulianui/tokens` 一并误判。

  改法：基准从「那一层」改为**沿途每一层** `node_modules`，任一层收得住就不算本地接入。显式 `workspace:` / `link:` / `file:` 的判据不动。

  于是 workspace 子项目里的普通安装现在如实回报：

  ```json
  { "declared": "0.18.0", "installed": "0.18.0", "linked": false, "linkKind": null }
  ```

  补了真实 workspace fixture 的回归（根有 `pnpm-workspace.yaml`，`apps/web` 的软链指向根 `.pnpm` store），含负向边界：软链指向仓库内 `packages/ui` **源码目录**（不在任何 `node_modules` 内）时仍要判 `local-link`——判据放宽不能过头。

## 0.4.0

### Minor Changes

- `inspect_project` 解析 `@source` 路径，不再把指不到实处的当 `detected`（#66）。

  只按文本匹配「有没有写 `@source`」是不够的：pnpm workspace 里真实包入口常在 `<app>/node_modules`，而 CSS 按仓库根数了层级，解析后目标根本不存在。后果最阴——setup 表面全绿、生产构建成功、DOM className 也正常，但库内 Tailwind 工具类一个都没生成，页面退化成无样式文本，typecheck / 单测 / guard 全都发现不了。

  - 按**样式表自身所在目录**解析每条 `@source`，glob 取静态前缀后检查目标是否存在。
  - `setup.tailwindSource` 从二值变三值：写了且指对 → `detected`；写了但目标不存在 → **`invalid`** + warning；没写 → `not-found`（原样）。读这个字段做分支的调用方请把新值考虑进去。
  - 新增 `setup.tailwindSourceTargets`：回报解析后的候选路径（`raw` → `resolved` → `exists`），便于定位 pnpm workspace 与单包安装的差异。

## 0.3.1

### Patch Changes

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

- bf58470: 新增 `audit_hulian_adoption` tool 与 `npx @hulianui/mcp audit` 命令：给**已经有代码**的项目做组件采用体检（issue #43）。

  存量项目才是采用率的主要战场，而它需要的东西和新建项目不一样：不是「该怎么搭」，而是「该用的有没有用上、从哪改起」。

  - **自动判场景** —— surface + modifiers 三维正交，判据来自 profile 真源新增的 `detect` 字段（`signals` 的机器可判定伴生），依据与置信度一并给出，次名候选如实列出，可人工覆盖。
  - **主指标是高层业务组件采用度**（如 `10/12`）而非裸覆盖率 —— 后者对项目规模敏感，前者直接对应「有没有绕过现成能力」。
  - **机会点只报有邻近信号的缺口** —— 一个职责组里用过东西却缺关键件才报；整组一件没有 = 这个项目没这个场景。所以中后台不会因为 91 个 `decoration` 组件没用而被判采用不足，那是库存结构问题。新增的 `avoidCategories` 进一步保证 modifier 的建议不越过 surface 的组件语言边界。
  - **风险项不一律标红** —— 每条带置信度与判断依据。实测 quay 的 69 处裸 `<button>`：high 0 / medium 2 / low 67。
  - **原型口径** —— 传 `workflow: "prototype"` 后不推高层企业件（实证：同产品的 demo 与正式系统是 5/12 与 10/12，那是取向不同不是采用不足），但形态必备件照报。项目自述像原型时会提示，但**不自动切换**。
  - **baseline / ratchet** —— CLI 的 `--write-baseline` 接受现有债务，`--check` 只拦新增。基线人类可读、不含项目源码。

  输出**全部是带置信度的建议，不产生 error**：可静态证明的错误仍归 `validate_hulian_usage` / `@hulianui/guard`。写盘只在 CLI，tool 保持 `readOnlyHint` 语义不被破坏。

  判定质量对着本机 11 个真实消费项目验证过，#43 的 7 条验收标准逐条通过。

### Patch Changes

- 52c0ac7: 修四条探测准确度问题，四条的共同形态都是「静默给出错误结论」，而 MCP 的定位是「props 不许猜，查这里」，最听话的调用方受害最深。

  - **`inspect_project` 在 pnpm 项目里 `linked` 恒为 true**（#45）。pnpm 的 `node_modules/` 每一项都是指向 `.pnpm/` store 的软链，用 `isSymbolicLink()` 判会对任何包恒真，导致 `!linked` 那道版本漂移门禁对 pnpm 用户整体失效。改判「解析后是否逃出本层 node_modules 树」+ 读 specifier（`link:` / `file:` / `workspace:`）双保险，并新增 `linkKind` 区分 workspace 与临时联调。
  - **版本漂移门禁对 0.x 永远比不出差异**。原先只比 major，而 npm 对 `^0.5.0` 只放行 `0.5.x` —— 0.x 的兼容单位是 minor。现在 `声明 ^0.14.0 / 实装 0.16.0` 会如实报出。
  - **`inspect_project` 漏掉非常规命名的全局样式表**（#46）。固定候选列表缺 `src/styles.css` 等，接入完全正确的项目被报成 `unknown`。改为跟着入口文件的相对路径 CSS import 走，固定列表退为兜底；并把「探测不到」与「你没接」在 warnings 里说清楚。
  - **本地模式的版本戳落后一版**（#47）。改为以 `packages/ui/package.json` 为准，不再用生成物里的版本号，消除 `validate_hulian_usage` 里的假 skew。
  - **本地模式静默返回陈旧 registry 产物**（#48）。新增新鲜度检查：版本号比对挡「发版后没重新生成」，mtime 比对挡「同版本内改了文档」，陈旧时在每个响应上告警并直接给出 `pnpm llms-registry`。

## 0.2.0

### Minor Changes

- f75602f: 新增 `get_agent_profile`：把「这个页面该用什么组件语言」变成可查的，而不是每次粘长提示词

  此前 server 能回答「组件叫什么、props 怎么传」，但回答不了「中后台该用哪套组件语言、
  移动端要额外注意什么」。这类语境判断只能靠人在每个项目里重复粘贴一段越来越长的提示词，
  而且同一份规则会被无差别套到营销页、中后台和长文页上。

  新 tool 按**三维正交**组织，真源是 `src/agent-profiles.json`：

  - `surface` 决定组件语言：`admin-console` / `config-tool` / `ai-product` /
    `content-brand` / `desktop-shell`
  - `modifiers` 决定约束与预算，**可组合**：`mobile` / `dashboard` / `data-dense` /
    `marketing` / `high-performance`
  - `workflow` 决定步骤：`prototype` / `build` / `audit` / `dogfood` / `migrate`

  可组合是关键 —— 移动端 AI 产品是 `ai-product + [mobile]`，独立数据大屏是
  `admin-console + [dashboard]`；把它们做成 profile 的子类型会导致一个项目同时匹配多个、
  选型时互斥判断失效。不传任何维度时返回目录与判定信号，让模型自己对号入座。

  `componentRoles` 取自对 12 个真实消费项目的扫描（见
  `docs/agent-adoption-baseline-2026-08-01.md`），不是凭印象列的。其中一条实证直接改变了
  `admin-console` 的定义：同产品同团队的 demo 原型与正式系统，在 12 个企业高层业务组件上
  分别是 5/12 与 10/12 —— 所以它的组件语言取自正式系统（`page-header` / `pro-table` /
  `access` / `form-dialog`），而不是原型阶段的 `card` + `select` 堆砌。`workflow` 里的
  `prototype` 也由此而来：原型求快是正当取向，给它推荐全套企业件是过度工程，不该被判为
  「采用不足」。

  profile 引用的每个组件 / page / block 都有测试对着 registry 校验存在性 —— 写一个不存在的
  slug 等于让模型去 import 查不到的东西，比不给建议更糟。`get_agent_profile` 给的是候选与
  约束，不是 props 真源：拿到候选后仍须 `get_component_doc`，响应里也这么写着。

- 2ef69ed: 新增 `npx @hulianui/mcp init-agent`：一条命令把瑚琏契约装进各家 Agent 的指令文件

  此前每个新项目都要手工粘一段瑚琏使用规则到 `CLAUDE.md` 或 `AGENTS.md`，四家客户端读的
  文件还各不相同。现在：

  ```bash
  npx @hulianui/mcp init-agent            # 装/更新
  npx @hulianui/mcp init-agent --check    # 只报告，有待办时非 0 退出，可进 CI
  npx @hulianui/mcp init-agent --doctor   # 体检：装在哪、是否最新、MCP 配没配
  npx @hulianui/mcp init-agent --all      # 四家客户端全覆盖
  ```

  覆盖 `AGENTS.md`（Codex / Copilot agents 模式）、`CLAUDE.md`（Claude Code）、
  `.cursor/rules/hulianui.mdc`（Cursor，自带 frontmatter 才会被自动加载）、
  `.github/copilot-instructions.md`（GitHub Copilot）。

  **不弄坏用户已有内容**是这条链路的全部价值，所以：

  - 契约写在 `<!-- hulianui:begin -->` / `<!-- hulianui:end -->` 之间，更新只替换这一段，
    区块前后的用户内容逐字保留。
  - 幂等：重复运行输出「已是最新」，文件逐字节不变。
  - marker 只剩一半（被手工编辑坏了）时**报冲突并退出，不写任何文件** —— 不猜区块边界。
  - 默认只更新项目里**已存在**的指令文件，不主动撒四份新文件；一份都没有时才创建
    `AGENTS.md`（最通用）。
  - `--check` 绝不写盘。

  契约本身刻意保持短，只放「所有 UI 任务都适用」的六条（先找现成的再拼、不猜 props、
  按场景选组件语言、缺能力回库补、用语义 token、完成后跑验证且证据不得互相冒充）。
  场景差异（中后台 / 营销页 / 移动端…）交给 `get_agent_profile` 按需取，不往指令文件里堆 ——
  否则营销页的特效配额会被无差别套到中后台和长文页上。契约里列出的 surface / modifier /
  workflow 取值直接从 profile 真源生成，不会两处漂移。

  `--doctor` 会额外检查项目里有没有引用 hulianui 的 MCP 配置：没有的话契约里的 tool 调用
  会落空，这时只装契约是不够的。

- ddf601f: MCP：补上搜索正确性与「项目感知 → 生成 → 验证」闭环（closes #36 #37）

  **搜索不再假阴性。** `list_components` 此前只对整句 query 做一次 `includes`，且只看
  name/title/description 三个字段。实测 `{ kind: "page", query: "用户 管理 列表" }` 返回 0，
  而 `page-admin-list` 一直躺在 registry 里 —— 模型据此得出「没有可复用的页面或区块」，
  一次选型退化成 29 次 tool call。现在 query 会分词（中文切二元组 + 一层中英桥，「弹窗」→
  `dialog`）、按 name/title/description/category/group/tags/exports 打分并按覆盖度排序；
  指定 kind 内零命中会跨粒度降级并标注「可能相关」，而不是宣告不存在。`limit` + `offset`
  可翻页；`category` 的枚举由 registry 真实分类生成（schema 里写死过 `form`，真 key 是 `forms`，
  前者永远返回 0）。

  **四个新 tool：**

  - `inspect_project`：读消费项目已知配置，返回框架 / 包管理器 / 瑚琏包实装版本 /
    `components.json` / Provider 与 token CSS 接入状态，并给出结合本项目的导入策略。
    projectRoot 优先取 MCP Roots，其次显式入参，最后才是 cwd，且来源写在响应里。
    只读已知路径，不递归遍历仓库，不读 `.env`。当前目录没有瑚琏时会做有界的 workspace
    候选探测（先认 pnpm-workspace / workspaces 声明，再试 `web`、`frontend` 等常见名），
    交出 `workspaceCandidates` 与 `suggestedProjectRoot` 但**不自动切换** —— 此前对着
    monorepo 根调用会直接得出「没装 @hulianui/ui」的错误结论。
  - `recommend_ui`：一句业务需求换回排序后的 page → block → component 组合。
  - `get_setup_guide`：按 `next` / `vite` / `vitest` / `tailwind` / `imports` / `install`
    返回接入约束（真源 docs/consuming.md），配合 `inspect_project` 的 warnings 使用。
  - `validate_hulian_usage`：以库方式调用 guard，返回带 ruleId/file/line/column 的结构化诊断。
    业务代码违规返回 `ok:false` 但**不置** `isError` —— 后者只留给参数错误、文件读不出来、
    guard 崩溃；混用会让模型把「你的代码有错」误读成「工具坏了」从而绕开验证。
    「没检查成」与「检查通过」严格分开：全部文件都没检查成 → `isError`（路径全拼错时绝不能
    渲染成 `✅ guard 通过 · 0 个文件`）；部分没检查成 → `partial:true` 且 `ok:false`。
    `versions` 拆成 `guard` / `registry`（主动加载，不依赖调用顺序）/ `consumerUi`
    （消费项目 node_modules 里的实装版本）三项。

  **数据源可见了。** 每个响应尾部带数据源、registry 版本与生成时间；远程产物缓存加 TTL
  （默认 5 分钟，`HULIAN_MCP_CACHE_TTL_MS` 可调）；本地模式缺产物是硬错误并提示去跑
  `pnpm llms-registry`，不再安静地改用线上数据回答本地问题（要降级须显式设
  `HULIAN_ALLOW_REMOTE_FALLBACK=1`，且响应会标记）；`install_block` 只在拿得出**同源**端点时给安装命令（远程模式 / 显式配了
  `HULIAN_REGISTRY_URL`）；本地模式又没配时不给命令，改为说明「源码来自工作区、线上端点是
  已发布版本」—— 本地改完还没发版时，那条命令会静悄悄把旧内容装回来。

  **其余：** `get_component_doc` 支持 `names` 批量与 `sections` 章节裁剪；所有 tool 补
  `title` 与 `readOnly`/`destructive`/`idempotent`/`openWorld` 标注，结构稳定的补
  `outputSchema` + `structuredContent`；新增 server instructions 与两个 prompt
  （`hulianui_expert` / `hulianui_page_builder`）固化推荐工作流。

  **registry 元数据**：frontmatter 解析支持跨行数组（prettier 折行的 `exports:` 曾被截断，
  password-generator 的 19 个导出因此变成 `import { /* ? */ }`）；`exports` 真源改成
  `src/<slug>/index.ts` 的 barrel，顺带补齐 theme(`useTheme`)、config(`zhCN`/`enUS`)、
  access(`AccessProvider`/`useAccess`)、time-picker、annotation 的缺口；类型导出另存
  `meta.types`（可按 `ProTableProps` 反查组件，但不进 import 行）；生成期加门禁 ——
  registry 出现无法解析的 import 直接失败。

  **guard**：`loadConventions` 改为公开导出（调用方按文件循环检查时可只加载一次约束表，
  不必每个文件重读 7000 行 JSON）；`import-from-root-barrel` 这条**建议**的措辞跟着
  package exports 更正 —— 子路径入口是官方入口，根 barrel 与子路径的取舍由消费项目决定，
  真正禁止的只有 exports 之外解析不出来的路径（那条可执行门禁不变）。

### Patch Changes

- Updated dependencies [ddf601f]
  - @hulianui/guard@0.3.0

## 0.1.1

### Patch Changes

- 235cee5: 新增可执行的 `@hulianui/guard` 约束门禁，并让 MCP 安装指引返回页面递归依赖、显式接入清单和安装后检查命令。

  `SelectTrigger` 现在透传原生 button 属性，并在 searchable 模式下正确合并消费方 ref 与内部锚点 ref。
