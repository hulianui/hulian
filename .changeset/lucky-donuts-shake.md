---
"@hulianui/guard": patch
"@hulianui/mcp": patch
---

两条工具侧的误报。

**guard**（#190）：`no-private-deep-import` 改成按消费方**实装的** `@hulianui/ui` 的 `exports` 判定，读不到实装包时才退回烤进本包的 slug 清单。清单是 `conventions.json` 生成那一刻的目录快照，于是「ui 发了新组件、guard 还没跟着发版」这段时间里，消费方一用新件就被判 error（0.29.0 的 `Label` 即如此），而给出的建议方向还是反的 —— 劝人退回根入口，那正是这条规则平时劝人别用的那个。现在 guard 与 ui 的版本不必再同步。

**mcp**（#189）：`inspect_project` 的 Provider 探测会顺着入口文件的本地 import 往下跟**一层**（相对路径与 `@/` 别名）。App Router 的 root layout 是 Server Component，而 `ThemeProvider` 是 `"use client"`，所以正确写法恰恰是抽一个客户端岛 —— 只对入口文件做字面量匹配的话，**写对的项目反而永远告警**，而消掉这条告警的唯一办法是把 Provider 塞回 Server Component。这类恒定告警的真实危害是脱敏：看久了整块 setup 段被当噪音跳过，真缺 Provider 的那天也看不见了。`ConfigProvider` / `AccessProvider` 走同一套探测，一并受益。

**门禁**（#182，不影响发布产物）：`docs:check:admin-demos` 只对「等超时」这一类失败重试一次，并把「重试 N 次后才通过」明确打印出来。断言失败 / CJK 泄漏 / 控制台报错一律不重试 —— 重试那些等于把真回归洗成绿的，而「红了就 rerun」正是真回归被漏掉的那条路径。首屏可见判定另给 60s 显式超时：连续跑多道浏览器门禁时 Chromium 连续启停会让它擦线，而页面本身没问题（重跑立刻可见）。
