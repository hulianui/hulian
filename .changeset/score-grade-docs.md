---
"@hulianui/ui": patch
---

修正 `ScoreRing` 文档里 `resolveGrade` 的签名，并补齐 `Grade` 的结构说明（#318）。

「禁忌 / 坑」那节写的是 `resolveGrade(value, max, grades)`，而源码是 `resolveGrade(value, grades)` —— `max` 是 `ScoreRing` 用来画弧长的 prop，不是这个函数的参数。照文档写 `resolveGrade(score, 100, myGrades)` 会把 `100` 当 grades 传进去，在 `[...grades].sort()` 上炸掉。

`Grade` 的结构此前全文没有说明，props 表只写了类型是 `Grade[]`，示例里也没有一个传了 `grades` 的 —— 报告方因此绕开了这个 prop，改用 `showGrade={false}` 加外挂 `Tag`。现在照 `WorldMap` 的写法在 props 表上方给出 `{ min; label; tone? }`，并写明 `tone` 同时收语义色名与 CSS 颜色值（类型都是 `string`，光看类型猜不出来），示例里补一段自定义评级体系。

`ScoreScale` 与它共用同一个 `Grade` 和同一个 `resolveGrade`，文档同批补上交叉说明与 `import type { Grade }`。

组件 md 随包发布、MCP 的 `get_component_doc` 本地模式直读 `node_modules` 里那一份，所以这类文档错误对 agent 消费方就是运行时缺陷，按 patch 发。
