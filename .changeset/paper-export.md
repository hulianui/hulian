---
"@hulianui/ui": minor
---

Paper 新增 `usePaperExport()`：`exportFigureSvg(id, stateKey, options?)` 把某张图的某个预设导出成独立的 SVG 文本，供投稿插进 Word 或转 PDF 进 LaTeX。导出在屏幕外用图的同一个「状态 → 画面」函数重画，逐个元素把计算样式写成 SVG 表现属性，`oklch()` / `oklab()` 等颜色换成十六进制，透明度并进 `fill-opacity` / `stroke-opacity`，去掉 class 与 data 属性，不再依赖页面 CSS；默认按亮色主题导出（`theme: "current"` 按当前主题），动画与过渡不进文件，正文里的图不受影响。可选 `background` 底色与 `width` 输出宽度。画面不是单独一个 `<svg>` 时 reject 并说明原因。

<!-- changelog-en:start -->
feat(paper): adds `usePaperExport()`. `exportFigureSvg(id, stateKey, options?)` exports one preset of a figure as standalone SVG text, ready to insert into Word or convert to PDF for LaTeX. It redraws the figure off screen with its state-to-picture function, writes each element's computed style back as SVG presentation attributes, converts colors such as `oklch()` / `oklab()` to hex with transparency folded into `fill-opacity` / `stroke-opacity`, and drops classes and data attributes, so the file no longer depends on the page CSS. It exports in the light theme by default (`theme: "current"` follows the page), leaves animations and transitions out, and does not touch the figure in the text. Optional `background` and `width` set the background and output width. It rejects with the reason when the figure does not draw a single `<svg>`.
<!-- changelog-en:end -->
