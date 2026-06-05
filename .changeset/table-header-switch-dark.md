---
"@hulianui/ui": patch
---

两处暗色/观感修复（mock-pilot dogfood 驱动）：

- **Switch**：旋钮由 `bg-surface` 改为恒白 `bg-white`。原 `bg-surface` 在暗色=gray-900，比 off 轨道 gray-800 还暗且与面板同色，导致暗色 off 态整个开关「黑融黑」不可见；白旋钮在灰轨道与蓝轨道、亮暗两态都保证对比。
- **Table**：虚拟滚动 sticky 表头背景由 `bg-bg` 改为 `bg-surface`，匹配卡片表面而非页面底色。表头保持透明（muted + medium 文字 + 行底分隔线），不加填充灰底——表格本身已是 surface 卡片/带框原语，灰底带反而割裂观感。
