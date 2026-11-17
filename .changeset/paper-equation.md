---
"@hulianui/ui": minor
---

Paper 新增公式与图联动。`@hulianui/ui/math` 导出 `PaperEquation`：LaTeX 里用 `\term{name}{…}` 标出可交互的项，`terms` 配置点击后驱动哪张图（切到预设，或由当前状态算新状态）；悬停 / 聚焦项时，图里用主入口新增的 `usePaperTerm(name)` 绑定的控件一起高亮，反之亦然。项上叠透明的真按钮，键盘与读屏可达；`\term` 展开成 KaTeX 的 `\htmlData`，trust 只放行这一种，`\href` 等照旧拒绝。KaTeX 不进主入口。

<!-- changelog-en:start -->
feat(paper): adds formula-to-figure links. `@hulianui/ui/math` exports `PaperEquation`: mark interactive terms in the LaTeX with `\term{name}{…}`, and `terms` sets which figure a click drives (switch to a preset, or compute the next state from the current one). Hovering or focusing a term highlights figure controls bound with the new main-entry hook `usePaperTerm(name)`, and the other way round. A transparent real button sits on each term, so keyboards and screen readers can reach it. `\term` expands to KaTeX's `\htmlData`, and trust allows only that form, so `\href` and friends stay rejected. KaTeX stays out of the main entry.
<!-- changelog-en:end -->
