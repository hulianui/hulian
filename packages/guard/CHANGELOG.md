# @hulianui/guard

## 0.5.2

### Patch Changes

- 06177c0: `conventions.json` 收进 `BorderBeam` / `AnimatedBeam` 新增的 reduced-motion 行为条目（随 `@hulianui/ui` 同批文档改动重新生成）。

## 0.5.1

### Patch Changes

- 2bbad4a: 两条工具侧的误报。

  **guard**（#190）：`no-private-deep-import` 改成按消费方**实装的** `@hulianui/ui` 的 `exports` 判定，读不到实装包时才退回烤进本包的 slug 清单。清单是 `conventions.json` 生成那一刻的目录快照，于是「ui 发了新组件、guard 还没跟着发版」这段时间里，消费方一用新件就被判 error（0.29.0 的 `Label` 即如此），而给出的建议方向还是反的 —— 劝人退回根入口，那正是这条规则平时劝人别用的那个。现在 guard 与 ui 的版本不必再同步。

  **mcp**（#189）：`inspect_project` 的 Provider 探测会顺着入口文件的本地 import 往下跟**一层**（相对路径与 `@/` 别名）。App Router 的 root layout 是 Server Component，而 `ThemeProvider` 是 `"use client"`，所以正确写法恰恰是抽一个客户端岛 —— 只对入口文件做字面量匹配的话，**写对的项目反而永远告警**，而消掉这条告警的唯一办法是把 Provider 塞回 Server Component。这类恒定告警的真实危害是脱敏：看久了整块 setup 段被当噪音跳过，真缺 Provider 的那天也看不见了。`ConfigProvider` / `AccessProvider` 走同一套探测，一并受益。

  **门禁**（#182，不影响发布产物）：`docs:check:admin-demos` 只对「等超时」这一类失败重试一次，并把「重试 N 次后才通过」明确打印出来。断言失败 / CJK 泄漏 / 控制台报错一律不重试 —— 重试那些等于把真回归洗成绿的，而「红了就 rerun」正是真回归被漏掉的那条路径。首屏可见判定另给 60s 显式超时：连续跑多道浏览器门禁时 Chromium 连续启停会让它擦线，而页面本身没问题（重跑立刻可见）。

## 0.5.0

### Minor Changes

- 新增迁移门禁 `muted-renamed-to-muted-foreground`（error）：拦截 `text-muted` 等已改名的写法（#142）。 <!-- parity-id: muted-migration-rule-and-help -->

  这条必须是 error 而不是 warning：`--color-muted` 语义反转后 `text-muted` 不再对应任何 token，而 Tailwind 对未定义颜色既不报错也不生成规则，写了会**静默回退成继承色**——typecheck、单测、视觉快照全都看不出来。`bg-muted` 刻意不在拦截范围内，它现在就是合法的弱背景。

  同时退役 `muted-is-a-text-color`（原先警告「muted 当背景用」，语义反转后该写法已经是对的）。

  CLI 补 `--help` / `-h` / `--version` / `-v`，均以 0 退出（#143）。此前任何未知 flag 一律退出码 2，而 CI 里常用 `npx @hulianui/guard --help` 探测「工具装没装」——**已安装**的 guard 被判成未安装，检查静默跳过，门禁变成假绿。

  另：`--format json` 一直就有，给 CI 做棘轮不必去正则解析人类可读的汇总行；已写进 `--help`。

## 0.4.0

### Minor Changes

- 新增两条 `bg-muted` 误用规则，并让 CLI 的措辞与退出码一致。

  - `muted-as-background-with-muted-text`（**error**）：同一段 `className` 里 `bg-muted` 与 `text-muted` 同时出现 = 前景背景同色，两个主题下都不可读。两侧都排除带变体前缀的写法（`hover:` / `[&::-webkit-scrollbar-thumb]:`）——变体意味着另一个状态或另一个伪元素，与静息态的文字色不在同一个盒子上；不排的话 Chart 图例那种「文字 muted + 滚动条拇指 muted」的正确写法会被误判。
  - `muted-is-a-text-color`（**warning**）：`bg-muted` 一律提醒。单看无法断定对错——小面积指示性填充（状态点、滚动条拇指、徽章反色底）借用文字色是可接受的，大面积区域底则一定错，所以是 warning 不是 error。
  - 新增 `class-name-tokens` matcher：按**整个 className 属性**取静态文本再判，而不是按单个字符串字面量——`cn("a", cond && "b", "c")` 才是 className 的常态，按字面量判会让「同一段里前景背景同色」这类判据永远命中不了。
  - CLI 只有 warning 时打印 `WARN` 而不是 `FAIL`。退出码本来就是 0，日志里写 FAIL 会让人要么去关规则，要么把真正的 error 也当成噪音。

## 0.3.0

### Minor Changes

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

## 0.2.1

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

## 0.2.0

### Minor Changes

- 235cee5: 新增可执行的 `@hulianui/guard` 约束门禁，并让 MCP 安装指引返回页面递归依赖、显式接入清单和安装后检查命令。

  `SelectTrigger` 现在透传原生 button 属性，并在 searchable 模式下正确合并消费方 ref 与内部锚点 ref。
