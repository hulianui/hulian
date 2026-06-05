---
"@hulianui/ui": minor
---

表格表头与刷新键打磨（mock-pilot dogfood 驱动）：

- **Table**：表头文字由 `text-muted` + `font-medium`（灰、中等）改为 `text-foreground` + `font-semibold`（黑/白、加粗），列标题更突出、层级更清晰。
- **ProTable**：刷新键改为「仅在传入 `onReload` 时才渲染」。原先无论是否提供 `onReload` 都渲染刷新图标，未提供时点击无任何反应（死按钮）。现在无 handler 即不渲染；整条工具栏仍可用 `toolbar={false}` 或逐项 `toolbar={{ reload: false }}` 隐藏。
