---
"@hulianui/ui": minor
---

Paper 的公式自动编号：`PaperEquation` 在 `Paper` 里不传 `number` 时和图号一样用 CSS 计数器自动编号，服务端渲染与打印都有号；传值是手写覆盖、不占号（同 LaTeX `\tag`），`null` / `false` 不编号；在 `Paper` 外不传仍不编号。新增 `EqRef`（主入口，不依赖 KaTeX）：正文显示「公式 (1)」/ "Eq. (1)"，按文档顺序取号并与计数器一致，手写覆盖的号原样显示；点击滚到公式并描边，没有 JS 时是普通锚点，打印形态下去掉链接色。`PaperContentLabels` 与 locale 新增可选 `equation`。

<!-- changelog-en:start -->
feat(paper): automatic equation numbers. Inside `Paper`, a `PaperEquation` without `number` is numbered by a CSS counter like figures, so numbers appear in server rendering and print; a value overrides the number without taking one (like LaTeX `\tag`), and `null` / `false` leaves it unnumbered. Outside `Paper`, no `number` still means no number. Adds `EqRef` (main entry, no KaTeX): it shows "Eq. (1)" in the text, takes numbers in document order consistent with the counter, shows hand-written numbers as is, scrolls to the equation and outlines it on click, falls back to a plain anchor without JS, and drops the link color in print mode. `PaperContentLabels` and the locale gain an optional `equation`.
<!-- changelog-en:end -->
