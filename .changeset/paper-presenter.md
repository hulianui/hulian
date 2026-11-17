---
"@hulianui/ui": minor
---

Paper 新增 `PaperPresenter` 答辩演示：全屏把论文里每张图的预设按文档顺序串成幻灯片，←/→、空格、PageUp/PageDown 翻页，Esc 退出且焦点回到触发按钮。演示层复用图的「状态 → 画面」函数重画，不搬动正文里的图，也不改它的状态；图的控件在演示里照常可用。`PaperFigure` / `ProcessFigure` 新增 `presentStates` 选定演示哪些预设。

<!-- changelog-en:start -->
feat(paper): adds `PaperPresenter`, a presentation mode for talks and defenses. It opens full screen and turns the presets of every figure, in document order, into slides; ←/→, Space and PageUp/PageDown move between them, and Esc exits with focus returning to the trigger. The presenter redraws each figure with its state-to-picture function instead of moving it, so the figure in the text keeps its state, and figure controls keep working while presenting. `PaperFigure` and `ProcessFigure` add `presentStates` to choose which presets are presented.
<!-- changelog-en:end -->
