---
"@hulianui/ui": patch
---

修复 `ScrollArea` 设 `max-h-*` 时静默裁掉内容而不滚动（#342）。

视口的 `height: 100%` 要有**确定**的父高度才解析得出来。父层只给 `max-h-*` 时它塌成 auto，视口随内容一路长高、不再是滚动容器，于是 Root 的 `overflow-hidden`（本是给自定义滚动条准备的）退化成纯裁剪：没有滚动条、滚轮无效、键盘也到不了被切掉的部分，而版面看着像「本该如此」，比一开始的溢出更难发现。

修法是让视口继承同一个上限（`max-h-[inherit]`），它自己就有了确定的封顶，配上内联的 `overflow: scroll` 便真的会滚；对确定高度（`h-*`）的用法是空操作。于是 `ScrollArea` 现在能表达「长则封顶滚动、短则紧凑」——对话框正文、下拉面板最常要的那种语义，此前只能退回普通 `max-h-* overflow-y-auto` 元素。新增「封顶滚动」示例并修正文档里「必须给 `h-*`」的旧说法。

<!-- changelog-en:start -->
Fix `ScrollArea` silently clipping its content instead of scrolling when given `max-h-*` (#342).

The viewport's `height: 100%` needs a **definite** parent height to resolve against. With only `max-h-*` on the parent it collapses to auto, so the viewport grows with its content and stops being a scroll container. The Root's `overflow-hidden`, which exists to host the custom scrollbar, then degrades into a plain crop: no scrollbar, no wheel response, and no keyboard access to what was cut. The layout looks deliberate, which makes it harder to spot than the overflow it was meant to solve.

The fix is to let the viewport inherit that same cap (`max-h-[inherit]`), which gives it a definite ceiling that its inline `overflow: scroll` can act on. It is a no-op for definite heights. `ScrollArea` can now express grow-then-scroll, the semantic most dialog bodies and dropdown panels need, which previously forced a fall back to a plain `max-h-* overflow-y-auto` element. Adds a capped-scrolling example and corrects the documentation that said a definite `h-*` was required.
<!-- changelog-en:end -->
