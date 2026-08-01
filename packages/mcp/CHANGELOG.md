# @hulianui/mcp

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
