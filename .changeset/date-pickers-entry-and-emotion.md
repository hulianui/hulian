---
"@hulianui/ui": patch
---

修复：日期族的对外入口与依赖清单在文档 / registry / MCP 三处都对不上

日期族改走 `@hulianui/ui/date-pickers` 子路径之后，还有四处仍在告诉使用者「从根 barrel 导入」——
组件文档、registry 的 `meta.import`、conventions 的 `import-from-root-barrel` 约束、MCP 的
`list_components` 表头。照抄任意一处的结果都是 `TS2305: has no exported member`。

同时修一个更早就存在的问题：registry 单件安装日期族时只列了 `@mui/material` /
`@mui/x-date-pickers` / `dayjs`，**漏掉 `@emotion/react` 与 `@emotion/styled`**。registry 的依赖
是扫源码 import 反推的，而 emotion 是 MUI v9 的样式引擎、组件从不直接 import 它，于是永远扫不出来 ——
照 registry 装完直接跑不起来。现按「伴生 peer」补齐。

消费方冒烟门禁也补上了第二个场景（装 MUI + 走子路径），此前 `src/_mui/` 的 exports 映射零覆盖：
它既不在根 barrel 也不在 showcase barrel，库内 tsc 与 workspace 链接两条路都测不到。
