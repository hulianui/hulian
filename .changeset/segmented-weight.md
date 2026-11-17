---
"@hulianui/ui": patch
---

style(segmented): 只有选中段用 `font-medium`，未选中段改为常规字重，选中态多一道字重信号。各段等宽（`flex-1`），切换时字重变化不挤动布局；Tabs 的段按内容定宽，未跟着改。
