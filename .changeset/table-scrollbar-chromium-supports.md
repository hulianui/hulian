---
"@hulianui/ui": patch
---

Table 经典滚动条皮肤修复：`scrollbar-width` / `scrollbar-color` 只给不认 `::-webkit-scrollbar` 的引擎（包进 `@supports not selector(::-webkit-scrollbar)`）。此前两者裸写并存，Chromium 121+ 会整体忽略 `::-webkit-scrollbar*`，macOS 上 `scrollbar="always"` 与 `stickyScrollbar` 代理条一条都不画。
