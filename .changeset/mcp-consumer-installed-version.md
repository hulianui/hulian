---
"@hulianui/mcp": minor
---

文档类 tool 按**消费方实装**的 `@hulianui/ui` 版本核对（#337）。

此前 server 只知道自己这一侧的两个版本（产物 vs 源码，#246），消费项目 `node_modules/@hulianui/ui` 装的是哪一版只有写完代码之后的 `validate_hulian_usage` 才看；查 props 那一步是盲的 —— 文档 v0.58.0 列着 `Text.numeric`，项目装的 v0.56.0 没有，`tsc` 才报 TS2322。现在每次 tool 调用都带消费方上下文：根取显式 `projectRoot` > 最近一次 `inspect_project` 认过的根 > MCP Roots > cwd（`recommend_ui` / `list_components` / `get_component_doc` 新增可选 `projectRoot`），版本不同就在响应顶部贴一条与产物漂移同级的 `❌` 横幅，脚注与 `source.consumer` 同步标出。

`get_component_doc` 不止提醒：markdown 直接改用实装包里随 npm 发布的 `src/<slug>/<slug>.md` 作答（与实装同版，照着写就对），实装里还没有这一件时明说并仍给文档版正文；`format:"json"` 的 props 仍按文档版给，但逐条标出实装文档没列的字段（`notInInstalledDoc: true`，组件级汇总在 `installed.notInInstalledDoc`），受约束生成可以直接过滤。`inspect_project` 的 `warnings` 也会直说「文档按 v0.58.0 给，而这里实装的是 v0.56.0（差 2 个 minor）」，并新增 `docsVersion` 字段。
