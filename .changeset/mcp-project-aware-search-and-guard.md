---
"@hulianui/mcp": minor
"@hulianui/guard": minor
---

MCP：补上搜索正确性与「项目感知 → 生成 → 验证」闭环（closes #36 #37）

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
