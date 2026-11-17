---
"@hulianui/ui": minor
---

Paper 新增 `FigureRaster`：图里的热力图、注意力矩阵等栅格放在图的 `<svg>` 里，`draw(ctx, { width, height, color })` 在离屏 canvas 上画、编码成 PNG 写进 `<image href>`。栅格与矢量部分共用 `viewBox` 坐标，打印分图各画一份，演示层按舞台缩放，`exportFigureSvg` 原样内嵌（补 `xlink:href`，得到一份混合 SVG）。`color()` 按栅格所在位置的主题解析 token 颜色，页面明暗切换时重画，导出总是亮色；`pixelated` 按整数倍最近邻放大编码，Word / PDF 里也保持锐利方块。服务端渲染输出无 `href` 的占位 `<image>`。画面是裸 canvas 时导出的报错信息改为指向 `FigureRaster`。

<!-- changelog-en:start -->
feat(paper): adds `FigureRaster` for heatmaps, attention matrices and other rasters inside a figure's `<svg>`. `draw(ctx, { width, height, color })` paints an offscreen canvas that is encoded as PNG into `<image href>`. The raster shares `viewBox` coordinates with the vector parts, each print sub-figure paints its own copy, the presenter scales it with the stage, and `exportFigureSvg` embeds it as is (adding `xlink:href`), producing a mixed SVG. `color()` resolves token colors in the theme where the raster sits and redraws when the page switches between light and dark; exports are always light. `pixelated` encodes at an integer nearest-neighbour scale so cells stay sharp in Word and PDF. Server rendering outputs a placeholder `<image>` without `href`. When a figure draws a bare canvas, the export error now points to `FigureRaster`.
<!-- changelog-en:end -->
