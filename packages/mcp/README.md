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

这些约束本来就写在组件文档里，只是 AI 读不到。这个 server 把「你的项目长什么样 / 有什么 / 怎么用 / 不许怎么用 / 写完对不对」变成八个按需调用的 tool。

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
| `recommend_ui` | 拿到一句业务需求时。一次返回排序后的 **页面 → 区块 → 组件** 组合，先看有没有现成整页可复用 |
| `list_components` | 需要按关键词补齐候选时。`kind` 取 `component`(366) / `block`(57) / `page`(20) / `lib`(3)；`query` 会分词并按 name/title/description/category/group/tags/exports 打分排序；`limit` + `offset` 翻页 |
| `get_component_doc` | 写下第一行使用某组件的代码**之前**。返回 Props / Events / Slots / 示例 / 禁忌坑；`names` 一次取多个，`sections` 只取需要的章节 |
| `get_conventions` | 开始新页面/新功能**之前**。分别返回可由 guard 执行的门禁，以及仍需语境判断的建议 |
| `get_setup_guide` | `inspect_project` 报了接入缺口时。`target` 取 `install` / `tailwind` / `imports` / `next` / `vite` / `vitest` |
| `install_block` | 要把区块或整页积木**放进项目**时。返回安装命令（跟随当前 registry base）、递归区块、Provider、必须替换项、插槽 |
| `validate_hulian_usage` | **改完瑚琏相关代码必须调**。以库方式调用 `@hulianui/guard`，返回带 `ruleId` / `file` / `line` / `column` 的结构化诊断 |

所有 tool 都声明了 `readOnlyHint` / `destructiveHint` / `idempotentHint` / `openWorldHint`；`inspect_project`、`recommend_ui`、`list_components`、`validate_hulian_usage` 另有 `outputSchema` 并返回 `structuredContent`。

名字打错会返回最接近的候选（带编辑距离），AI 可据此自我纠正，而不是收到一句干巴巴的 not found。搜索零命中时会跨粒度降级并标注「可能相关」—— **不会**把「没搜到」说成「库里没有」。

### 搜索是分词打分的，不是整句 substring

`query: "用户 管理 列表"` 会切成三个词，中文还会经一层中英桥（「弹窗」→ `dialog`、「表格」→ `table`），再按覆盖度 + 得分排序。旧实现只对整句做一次 `includes`，于是这条 query 返回 0 —— 而 `page-admin-list` 一直躺在 registry 里（hulianui/hulian#36）。

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
   缺产物时**明确报错**（提示去跑 `pnpm llms-registry`），不会安静地改用线上数据回答本地问题。
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
