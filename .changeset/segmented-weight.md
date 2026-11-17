---
"@hulianui/ui": patch
---

style(segmented): 只有选中段用 `font-medium`，未选中段改为常规字重，选中态多一道字重信号。各段等宽（`flex-1`），切换时字重变化不挤动布局；Tabs 的段按内容定宽，未跟着改。

<!-- changelog-en:start -->
style(segmented): only the selected segment uses `font-medium`; unselected segments use the regular weight, so selection has a weight cue as well. Segments stay equal width (`flex-1`), and the weight change does not shift the layout. Tabs size each segment to its content and are unchanged.
<!-- changelog-en:end -->
