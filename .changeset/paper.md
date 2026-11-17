---
"@hulianui/ui": minor
"@hulianui/tokens": minor
---

feat(paper): 新增 Paper 动态论文插图（首片）。`Paper` 管呈现形态（阅读 / 打印）和图的注册表，`labels` 让论文内容的语言（图注前缀、自动引用）独立于界面语言；浏览器打印前自动切到打印形态、打印完切回；图号用 CSS 计数器，服务端渲染和打印都有号。`PaperFigure` 的状态是任意值加一组有名字的预设，`children` 是「状态 → 画面」的函数；打印形态下主图画 `printState`，`printSubfigures` 展开成 (a)(b)… 分图，控件不渲染。`ProcessFigure` 是一步步讲的图，图里用 `FigureStep` 标出每一部分属于哪一步：当前步不透明、讲过的半透明、没讲到的很淡但不隐藏；自带上一步 / 下一步、逐步按钮、「全部」和自动播放。`FigRef` 是正文引用，点击把图切到对应预设、滚进视野并描边，没有 JS 时退化成锚点。tokens 新增 `hulian-paper-flow` 关键帧，给当前一步的流动虚线用。这一片没有答辩演示模式、逐状态导出 SVG、公式与图联动、论文标题区和参考文献。

<!-- changelog-en:start -->
feat(paper): adds Paper, figures for papers that move with the text (first slice). `Paper` holds the display mode (read / print) and a figure registry, and `labels` sets the paper language for caption prefixes and automatic references independently of the UI language; it switches to print mode before the browser prints and back afterwards. Figure numbers come from a CSS counter, so they exist in server rendering and in print. `PaperFigure` takes any state value plus named presets, and its `children` maps state to picture. In print mode the main figure draws `printState`, `printSubfigures` expand into (a)(b)… sub-figures, and controls are not rendered. `ProcessFigure` explains a figure step by step; `FigureStep` marks which step each part belongs to. The current step is opaque, earlier steps are half transparent, and later steps are faint but not hidden. It comes with previous / next, per-step buttons, "All", and autoplay. `FigRef` is an in-text reference: a click switches the figure to its preset, scrolls it into view, and outlines it; without JS it is a plain anchor. Tokens add the `hulian-paper-flow` keyframes for flowing dashes on the current step. This slice has no presentation mode, no per-state SVG export, no formula-to-figure links, and no title block or bibliography.
<!-- changelog-en:end -->
