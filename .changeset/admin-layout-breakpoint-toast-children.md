---
"@hulianui/ui": minor
---

AdminLayout 新增 `breakpoint` 响应式断点（与 LayoutSider 同语义：视口 ≤ 断点自动收起侧栏、> 时展开；受控时只回调 onCollapsedChange），修复窄屏侧栏挤占屏宽（#14）；ToastProvider 支持透传渲染 children，包裹式 `<ToastProvider><App/></ToastProvider>` 不再静默吞掉应用子树（#13）。
