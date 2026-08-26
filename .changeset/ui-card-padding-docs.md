---
"@hulianui/ui": patch
---

`Card` 文档补两条坑（#336）：根节点自己不带任何内边距、内容必须放进 `CardBody`（且本库叫
`CardBody` 不是 shadcn/ui 的 `CardContent`）；以及整卡内边距都塌了时先怀疑消费方漏配
`@source`，判据是构建产物 CSS 里 `grep card-body-px`。

组件 md 随 npm 包发布、MCP 的 `get_component_doc` 直读 `node_modules` 里那一份，所以这类
文档缺口对 agent 消费方就是运行时缺口。
