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

这些约束本来就写在组件文档里，只是 AI 读不到。这个 server 把「有什么 / 怎么用 / 不许怎么用」变成四个按需调用的 tool。

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

| tool | 什么时候调 |
|---|---|
| `list_components` | 写任何 UI **之前**。`kind` 可取 `component`(367) / `block`(57) / `page`(20) / `lib`(3)；`query` 模糊搜 |
| `get_component_doc` | 写下第一行使用某组件的代码**之前**。返回 Props / Events / Slots / 示例 / 禁忌坑 |
| `install_block` | 要把区块或整页积木**放进项目**时。返回 shadcn 命令、页面递归区块、Provider、必须替换项、插槽和安装后 guard 命令 |
| `get_conventions` | 开始新页面/新功能**之前**。分别返回可由 `hulian-check` 执行的门禁，以及仍需语境判断的建议 |

名字打错会返回最接近的候选（带编辑距离），AI 可据此自我纠正，而不是收到一句干巴巴的 not found。

### 页面安装不是“单文件自包含”

57 个区块通常直接落成一个业务积木；20 个页面中有 18 个会通过 `registryDependencies` 递归安装所需区块。`install_block` 会明确列出依赖，shadcn CLI 负责递归落盘，AI 不应手工复制仓库内的 `../../blocks/_blocks/*` 路径。

安装完成后执行 MCP 返回的门禁命令，例如：

```bash
npx -y @hulianui/guard src/components/pages src/components/blocks
```

错误级违规退出 1，warning 只报告；路径或调用错误退出 2。

## 数据源

两条路，返回结构一致：

1. **本地**（`HULIAN_UI_ROOT` 已设）：直接读 `packages/ui/src/<slug>/<slug>.md` 与生成的 registry。永远最新。
2. **远程**（默认）：读 `https://hulianui.haloritual.com` 的 `registry.json` / `r/<name>.json` / `d/<slug>.md` / `conventions.json`，带内存缓存。可用 `HULIAN_REGISTRY_URL` 覆盖。

## 开发

```bash
pnpm --filter @hulianui/mcp test   # 11 个用例，端到端跑真实 server，走 stdio JSON-RPC，不 mock
```
