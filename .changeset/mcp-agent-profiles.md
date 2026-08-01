---
"@hulianui/mcp": minor
---

新增 `get_agent_profile`：把「这个页面该用什么组件语言」变成可查的，而不是每次粘长提示词

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
