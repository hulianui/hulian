---
"@hulianui/ui": patch
---

Marquee：无缝循环用的复制份在 `aria-hidden` 之外补 `inert`。副本里一旦有链接或按钮（例如首页技术底座跑马灯），它们对读屏隐藏却仍能用 Tab 聚焦 —— axe 判 `aria-hidden-focus`（serious）。`inert` 一并封掉焦点与指针，视觉完全不变。

<!-- changelog-en:start -->
Marquee: the duplicated tracks used for the seamless loop now carry `inert` alongside `aria-hidden`. When the content contains links or buttons (the home page's tech-stack marquee, for instance), those copies were hidden from assistive tech but still reachable with Tab, which axe flags as `aria-hidden-focus` (serious). `inert` removes focus and pointer access; nothing changes visually.
<!-- changelog-en:end -->
