---
"@hulianui/mcp": minor
---

新增 `npx @hulianui/mcp init-agent`：一条命令把瑚琏契约装进各家 Agent 的指令文件

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
