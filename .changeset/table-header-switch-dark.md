---
"@hulianui/ui": patch
---

两处暗色/观感修复（mock-pilot dogfood 驱动）：

- **Table**：表头加 `bg-surface-hover` 淡色带（主题感知：亮 gray-100 / 暗 gray-800），与正文区分、提升可扫读性，解决「表头无底色、整体白板感」。虚拟滚动 sticky 表头仍用 opaque `bg-bg`。
- **Switch**：旋钮由 `bg-surface` 改为恒白 `bg-white`。原 `bg-surface` 在暗色=gray-900，比 off 轨道 gray-800 还暗且与面板同色，导致暗色 off 态整个开关「黑融黑」不可见；白旋钮在灰轨道与蓝轨道、亮暗两态都保证对比。
