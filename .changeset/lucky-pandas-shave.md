---
"@hulianui/mcp": patch
---

修四条探测准确度问题，四条的共同形态都是「静默给出错误结论」，而 MCP 的定位是「props 不许猜，查这里」，最听话的调用方受害最深。

- **`inspect_project` 在 pnpm 项目里 `linked` 恒为 true**（#45）。pnpm 的 `node_modules/` 每一项都是指向 `.pnpm/` store 的软链，用 `isSymbolicLink()` 判会对任何包恒真，导致 `!linked` 那道版本漂移门禁对 pnpm 用户整体失效。改判「解析后是否逃出本层 node_modules 树」+ 读 specifier（`link:` / `file:` / `workspace:`）双保险，并新增 `linkKind` 区分 workspace 与临时联调。
- **版本漂移门禁对 0.x 永远比不出差异**。原先只比 major，而 npm 对 `^0.5.0` 只放行 `0.5.x` —— 0.x 的兼容单位是 minor。现在 `声明 ^0.14.0 / 实装 0.16.0` 会如实报出。
- **`inspect_project` 漏掉非常规命名的全局样式表**（#46）。固定候选列表缺 `src/styles.css` 等，接入完全正确的项目被报成 `unknown`。改为跟着入口文件的相对路径 CSS import 走，固定列表退为兜底；并把「探测不到」与「你没接」在 warnings 里说清楚。
- **本地模式的版本戳落后一版**（#47）。改为以 `packages/ui/package.json` 为准，不再用生成物里的版本号，消除 `validate_hulian_usage` 里的假 skew。
- **本地模式静默返回陈旧 registry 产物**（#48）。新增新鲜度检查：版本号比对挡「发版后没重新生成」，mtime 比对挡「同版本内改了文档」，陈旧时在每个响应上告警并直接给出 `pnpm llms-registry`。
