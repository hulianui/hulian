# @hulianui/mcp

瑚琏 Hulian 的 MCP server —— **让 AI 按需查组件，而不是猜。**

## 为什么需要它

AI 写业务时消费这个库只有两条路：整吞 1.1M 的 `llms-full.txt`（吃掉大量 context），或者凭印象猜。猜的代价是实测过的：

| AI 猜的 | 真实签名 |
|---|---|
| `toast.success("已保存")` | `toast({ title, tone })`，没有快捷方法 |
| `<Badge variant="...">` | Badge 无 `variant`，该用 `Tag` |
| `<Heading size="md">` | `HeadingSize` 是 `xs\|sm\|base\|lg\|…`，没有 `md` |
| `fill="var(--primary)"` | 必须 `var(--color-primary)`，否则不解析 |
| 手搓 `h-dvh` 包整页 | `AdminLayout` 自带 `fitViewport` |

这些约束本来就写在组件文档里，只是 AI 读不到。这个 server 把「你的项目长什么样 / 有什么 / 怎么用 / 不许怎么用 / 写完对不对 / 存量代码该从哪改起」变成十个按需调用的 tool。

## 安装

Claude Code / Cursor 的 MCP 配置：

```json
{
  "mcpServers": {
    "hulianui": {
      "command": "npx",
      "args": ["-y", "@hulianui/mcp"]
    }
  }
}
```

在瑚琏 monorepo 里开发时，指向本地源码 —— 改完组件即刻生效、零网络：

```json
{
  "mcpServers": {
    "hulianui": {
      "command": "node",
      "args": ["/path/to/hulian/packages/mcp/src/index.mjs"],
      "env": { "HULIAN_UI_ROOT": "/path/to/hulian/packages/ui" }
    }
  }
}
```

## Tools

推荐顺序就是这张表的顺序 —— server 的 `instructions` 与两个 prompt（`hulianui_expert` / `hulianui_page_builder`）里也固化了同一条链路：

| tool | 什么时候调 |
|---|---|
| `inspect_project` | **开工前**。读消费项目已知配置：框架、包管理器、瑚琏包实装版本、`components.json`、ThemeProvider / token CSS / Next / Vite / Vitest 接入状态，并给出**结合本项目**的导入策略建议 |
| `get_agent_profile` | 认完项目、动手之前。按场景取「该用什么组件语言、受什么约束、按什么步骤走」。三维正交：`surface` × `modifiers`（可组合）× `workflow`。不传参数先看目录对号入座 |
| `recommend_ui` | 拿到一句业务需求时。一次返回排序后的 **页面 → 区块 → 组件** 组合，先看有没有现成整页可复用 |
| `list_components` | 需要按关键词补齐候选时。`kind` 取 `component`(366) / `block`(57) / `page`(20) / `lib`(3)；`query` 会分词并按 name/title/description/category/group/tags/exports 打分排序；`limit` + `offset` 翻页 |
| `get_component_doc` | 写下第一行使用某组件的代码**之前**。返回 Props / Events / Slots / 示例 / 禁忌坑；`names` 一次取多个，`sections` 只取需要的章节 |
| `get_conventions` | 开始新页面/新功能**之前**。分别返回可由 guard 执行的门禁，以及仍需语境判断的建议 |
| `get_setup_guide` | `inspect_project` 报了接入缺口时。`target` 取 `install` / `tailwind` / `imports` / `next` / `vite` / `vitest` |
| `install_block` | 要把区块或整页积木**放进项目**时。返回安装命令（跟随当前 registry base）、递归区块、Provider、必须替换项、插槽 |
| `validate_hulian_usage` | **改完瑚琏相关代码必须调**。以库方式调用 `@hulianui/guard`，返回带 `ruleId` / `file` / `line` / `column` 的结构化诊断 |
| `audit_hulian_adoption` | 接手**已经有代码**的项目时。自动判场景，给出实际使用清单、高层业务组件采用度、有场景却没采用的机会点、疑似绕过组件库的风险项与渐进迁移计划 |

所有 tool 都声明了 `readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint`；`inspect_project`、`recommend_ui`、`list_components`、`validate_hulian_usage`、`get_agent_profile`、`audit_hulian_adoption` 另有 `outputSchema` 并返回 `structuredContent`。

### 三个「检查类」tool 各答一个问题，不得互相冒充

| tool | 回答 | 判定性质 |
|---|---|---|
| `inspect_project` | 装没装对 | 事实 |
| `validate_hulian_usage` | 改动有没有违反硬规则 | **可静态证明的错误** |
| `audit_hulian_adoption` | 该用的有没有用上、从哪改起 | **带置信度的建议** |

第三个的输出**全是建议，不产生 error，别当门禁用**。存量项目第一次体检就出几百条硬门禁，唯一的结果是整个门禁被关掉；所以它给 `baseline.snapshot`，CI 用 ratchet 只拦「新增」，存量债务不阻断。

两条让它不至于变成噪音的规则：

- **机会点只报「同项目内有邻近信号」的缺口。** 一个职责组里已经用了东西却缺关键件 → 报；整组一件没有 → 这个项目没这个场景，不报。所以中后台项目不会因为 91 个 `decoration` 组件没用而被判采用不足 —— 那是库存结构问题，不是采用缺口。
- **风险项不一律标红。** 裸 `<button>` 多数是图标热区、`asChild` 或桌面端自定义控件，属正当用法；每条带置信度与判断依据（实测 quay 的 69 处：high 0 / medium 2 / low 67）。

**原型项目务必传 `workflow: "prototype"`** —— 否则会按正式系统的尺子量它，得出一堆假缺口。项目自述像原型时报告里会提示。

### 场景 profile 是三维正交的，不是一张平铺清单

`get_agent_profile` 的三个维度各管一件事，**分开才能组合**：

| 维度 | 管什么 | 取值 |
|---|---|---|
| `surface` | 组件语言 —— 这个页面该用什么 | `admin-console` / `config-tool` / `ai-product` / `content-brand` / `desktop-shell` |
| `modifiers` | 约束与预算，**可叠加** | `mobile` / `dashboard` / `data-dense` / `marketing` / `high-performance` |
| `workflow` | 任务步骤 | `prototype` / `build` / `audit` / `dogfood` / `migrate` |

移动端 AI 产品是 `ai-product + [mobile]`，独立数据大屏是 `admin-console + [dashboard]`。把它们做成 profile 的子类型会让一个项目同时匹配多个、选型时互斥判断失效；把 `audit` / `dogfood` 混进 `surface` 列表则更糟 —— 模型拿到 `profile: "dogfood"` 推不出任何组件语言。

`componentRoles` 取自对 12 个真实消费项目的扫描（见仓库 `docs/agent-adoption-baseline-2026-08-01.md`），不是凭印象列的。有测试对着 registry 校验每个 slug 真实存在 —— profile 里写一个不存在的组件，等于让模型去 import 查不到的东西，比不给建议更糟。

`workflow` 里的 `prototype` 来自一条实证：同产品同团队的 demo 原型与正式系统，在 12 个企业高层业务组件上分别是 5/12 与 10/12。原型求快是正当取向，给它推荐全套企业件是过度工程。

## 一键接入：`init-agent`

```bash
npx @hulianui/mcp init-agent            # 装 / 更新
npx @hulianui/mcp init-agent --check    # 只报告，有待办时非 0 退出，可进 CI
npx @hulianui/mcp init-agent --doctor   # 体检：装在哪、是否最新、MCP 配没配
npx @hulianui/mcp init-agent --all      # 四家客户端全覆盖
```

把契约写进各家客户端各自读取的文件：`AGENTS.md`（Codex / Copilot agents 模式）、`CLAUDE.md`（Claude Code）、`.cursor/rules/hulianui.mdc`（Cursor，自带 frontmatter 才会被自动加载）、`.github/copilot-instructions.md`（GitHub Copilot）。

**不弄坏你已有的内容**：契约包在 `<!-- hulianui:begin -->` / `<!-- hulianui:end -->` 之间，更新只替换这一段，区块前后逐字保留；重复运行文件逐字节不变；marker 只剩一半（被手工编辑坏了）时报冲突并退出、**不写任何文件**，不猜区块边界；`--check` 绝不写盘。

默认只更新项目里**已存在**的指令文件，不主动往项目里撒四份新文件；一份都没有时才创建 `AGENTS.md`。

契约本身刻意保持短，只放所有 UI 任务都适用的六条。场景差异由 `get_agent_profile` 按需取，不往指令文件里堆 —— 否则营销页的特效配额会被无差别套到中后台和长文页上。契约里列出的维度取值直接从 profile 真源生成，不会两处漂移。

`--doctor` 会额外检查项目里有没有引用 hulianui 的 MCP 配置：没有的话契约里的 tool 调用会落空，这时只装契约是不够的。

## 存量项目体检：`audit`

```bash
npx @hulianui/mcp audit                      # 看现状
npx @hulianui/mcp audit --workflow prototype # 原型口径：不推高层企业件
npx @hulianui/mcp audit --write-baseline     # 接受现有债务，立基线
npx @hulianui/mcp audit --baseline --check   # 进 CI：只拦新增违规
```

与 `audit_hulian_adoption` 同一套判定，多两件命令行才该做的事：**落基线**与 **ratchet 门禁**。

写盘刻意归 CLI 而不是 tool —— `audit_hulian_adoption` 声明了 `readOnlyHint`，调用方是照着这个 annotation 决定要不要审批的；一个声明只读的 tool 顺手写文件，比不提供这个能力更糟。所以 tool 只把 `baseline.snapshot` 交出来，落盘是人在命令行里的显式动作。

基线落在 `.hulianui/adoption-baseline.json`，人类可读、diff 友好、**不含项目源码**（有测试守着这条）。存量项目的正确用法是：第一次 `--write-baseline` 把现有债务接受下来，之后 CI 用 `--check` 只拦新增。拿全量合规当门禁，唯一的结果是第一次几百条之后整个门禁被关掉。

名字打错会返回最接近的候选（带编辑距离），AI 可据此自我纠正，而不是收到一句干巴巴的 not found。搜索零命中时会跨粒度降级并标注「可能相关」—— **不会**把「没搜到」说成「库里没有」。

### 搜索是分词打分的，不是整句 substring

`query: "用户 管理 列表"` 会切成三个词，中文还会经一层中英桥（「弹窗」→ `dialog`、「表格」→ `table`），再按覆盖度 + 得分排序。旧实现只对整句做一次 `includes`，于是这条 query 返回 0 —— 而 `page-admin-list` 一直躺在 registry 里（hulianui/hulian#36）。

### agent 没有眼睛：视觉锚点与发掘通道

库里 380 件组件中 92 件是装饰件、151 件带 `animated` 标签，但这批件此前在 MCP 侧几乎不可达 —— **通道是不对称的**：抑制侧按分类一次拉黑 92 件（机器可判定），发掘侧只有 profile 里手写的约 8 件。于是 agent 系统性地只用「安全」的功能件，做出来的页面对，但没有任何视觉记忆点。而交付物最终是给人看的，人是视觉动物。

0.27.0 把三件事补上（#140）：

1. **抑制精度从分类提到组**。`decoration` 内部 `backdrop`（52 件全屏背景 / WebGL）与 `overlay-fx`（40 件局部强调）是两种完全不同的东西 —— 按整类拉黑，等于中后台连入场过渡和卡片描边都被禁。profile 现在写 `avoidGroups: ["decoration/backdrop"]` + `allowEffects` 白名单。**#41 的非目标仍然守死**：中后台的 `visualBudget.heavy` 恒为 0。
2. **氛围词能搜到东西**。特效需求的自然表述是形容词（「首屏想有点科技感」「这块太平了」「要有呼吸感」），此前这类 query 对 92 件装饰件全部打 0 分。现在有一条氛围词轴；`query: "tags:animated"` 还能按横切标签直查。
3. **每条返回都带视觉锚点**：`docsUrl`（能甩给人看的链接）、`motion`（`none` / `subtle` / `moderate` / `heavy`，用来按 `visualBudget` 做预算）、`look`（一句人话的观感：动了什么 / 多强 / 该放哪 / 不该放哪）。`look` **只给实测过的那批**，没有条目时返回 `null` —— 不给一句凭空想象的描述。

`recommend_ui` 与 `audit_hulian_adoption` 在「一件动效 / 强调件都没用到」时会各给一条视觉建议（位置 + 候选 + 强度 + 降级说明）。**它永远是建议、不进门禁、不计入任何指标**，且 admin-console 下最多 1 条。

### guard 通过 ≠ 页面对了

`validate_hulian_usage` 只检查瑚琏专属约束（style 覆盖、`toast.success`、颜色 token 前缀、私有深导入等）。typecheck、单元测试、交互 / a11y、真实视觉验证都在别处，本 server 不冒充它们。

三种结果分得很清，**不会把「没检查」说成「通过」**：

| 情形 | 返回 |
|---|---|
| 全部文件检查完、无 error | `ok: true` |
| 有违规 | `ok: false`，带 `diagnostics[]`；**不置** `isError`（代码有问题不是工具故障） |
| 部分文件没检查成 | `partial: true` + `ok: false`，文本是「⚠️ 部分完成」而不是「✅ 通过」 |
| 一个文件都没检查成 | `isError: true` —— 路径全拼错时绝不能渲染成 `✅ guard 通过 · 0 个文件` |

`versions` 拆成三个，不共用一个 `ui`：`guard`（门禁版本）、`registry`（本 server 数据源版本，主动加载，不依赖调用顺序）、`consumerUi`（消费项目 `node_modules` 里**实装**的 `@hulianui/ui` —— 与 registry 不一致才是真正要警觉的漂移）。

### monorepo 根不会被当成前端项目

MCP Roots 给的常常是仓库根，而前端在 `web/`、`apps/*` 里。`inspect_project` 在当前目录没有瑚琏时会做**有界**候选探测（先认 `pnpm-workspace.yaml` / `package.json` workspaces，没有再试 `web`/`frontend`/`client` 等常见名；只看一层、只认有 `package.json` 的目录），把候选连同 `suggestedProjectRoot` 交出来，并**不替你切换** —— 由 agent 或用户确认后带 `projectRoot` 再调一次。同时这种情况下不会再抱怨「缺 ThemeProvider / tokens.css」，那是子项目的事。

### 页面安装不是“单文件自包含”

57 个区块通常直接落成一个业务积木；20 个页面中有 18 个会通过 `registryDependencies` 递归安装所需区块。`install_block` 会明确列出依赖，shadcn CLI 负责递归落盘，AI 不应手工复制仓库内的 `../../blocks/_blocks/*` 路径。

安装完成后对落盘的文件调一次 `validate_hulian_usage({ files: [...] })`。等价 CLI（CI 里用）：

```bash
npx -y @hulianui/guard src/components/pages src/components/blocks
```

错误级违规退出 1，warning 只报告；路径或调用错误退出 2。

## 数据源

两条路，返回结构一致，且**每个响应尾部都标出数据源、registry 版本与生成时间** —— 调用方能自己发现漂移：

1. **本地**（`HULIAN_UI_ROOT` 已设）：直接读 `packages/ui/src/<slug>/<slug>.md` 与生成的 registry。永远最新。
   - 缺产物时**明确报错**（提示去跑 `pnpm llms-registry`），不会安静地改用线上数据回答本地问题。
   - 版本戳取 `packages/ui/package.json`，**不取生成物里的** —— 生成物是 `pnpm llms-registry` 的产出，
     发版 commit 不会重跑它，用它当版本戳会报出假的 skew。
   - 产物**陈旧**同样会告警（比版本号 + 比 `<slug>.md` / `<slug>.types.ts` 的 mtime）：
     产物落后意味着新增的组件与 prop 在 MCP 里整个查不到，而这是静默的，比缺产物更危险。
2. **远程**（默认）：读 `https://hulianui.haloritual.com` 的 `registry.json` / `r/<name>.json` / `d/<slug>.md` / `conventions.json`。

| 环境变量 | 作用 |
|---|---|
| `HULIAN_UI_ROOT` | 指向 `packages/ui`，切到本地模式 |
| `HULIAN_REGISTRY_URL` | 换 registry 基址（自建镜像 / 预发） |
| `HULIAN_MCP_CACHE_TTL_MS` | 远程产物缓存寿命，默认 300000（5 分钟），设 `0` 关闭 |
| `HULIAN_ALLOW_REMOTE_FALLBACK` | 设 `1` 时本地缺产物才允许降级到远程，响应里会标 `⚠️ 已降级` |

`install_block` 只在**拿得出同源端点**时给安装命令：远程模式用 `registry.itemUrl`，配了 `HULIAN_REGISTRY_URL` 用它；本地模式又没配时**不给命令**，而是说明「源码来自工作区、线上 `/r/<name>.json` 是已发布版本，两者未必一致」，请直接按 `target` 落盘。理由是本地改完还没发版时，那条命令会静悄悄装回旧内容。

## 开发

```bash
pnpm --filter @hulianui/mcp test   # 31 个用例，端到端跑真实 server，走 stdio JSON-RPC，不 mock
```

测试里的消费项目 fixture（Next / Vite 各一个）在临时目录里现搭，`inspect_project` 的三条 projectRoot 来源（显式入参 / MCP Roots / cwd 兜底）都被真的走了一遍。
