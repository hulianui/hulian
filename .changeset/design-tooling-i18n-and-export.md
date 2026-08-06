---
"@hulianui/ui": patch
---

修设计工具族四个组件的英文缺口与静态导出阻断（#91 #92 #96 的收尾）

这批问题都是「跑一遍完整门禁才会暴露」的类型，本轮补跑构建与浏览器门禁时一次浮出来：

**InspectorPanel / IssueReporter 的内置预设没接语言**

- `inspectorSections()` 返回的五类预设 schema 里，51 条字段标签与枚举选项是硬编码中文（`布局` / `内边距` / `起` / `中` / `末`…）。不传 `sections` 时面板渲染的就是这套预设 —— 英文消费方拿到的是一屏中文标签。
- `BUILTIN_ISSUE_TEMPLATES` 的三套模板同理：字段标签与 `toMarkdown` 产出的章节标题（`## 问题描述` / `## 环境`）全是中文，而这些字符串会**进到提交给 GitHub 的 issue 正文里**。

两者的文案都收进 `config/locale.ts` 的 locale SSOT（`inspectorPanel.presets` / `issueReporter.templates`），组件按当前 `ConfigProvider` 语言取用。新增 `buildInspectorSections(text)` 与 `buildIssueTemplates(text)` 两个纯函数供直接调用；`layoutFields` / `colorFields` / `typographyFields` / `borderFields` / `effectsFields` / `BUILTIN_ISSUE_TEMPLATES` 这些既有具名导出保留为中文默认形态，老代码行为不变。`inspectorSections(categories, text?)` 的第二参可选，不传仍是中文。

英文站上这两页此前一共渲染出 195 处中文残留（`docs:i18n:output` 门禁计数），现在归零。

**PreviewSandbox 的示例会打断静态导出**

「同文档模式」示例为了演示错误边界，子组件在渲染期直接 `throw`。文档站是 `output: "export"`，每页都要在构建期预渲染一次，而**错误边界只在客户端接得住** —— 于是整页 `/components/preview-sandbox` 导出失败，构建直接中断。单测与真实浏览器都看不出来，因为那两边都有边界兜着。

改成点按钮才抛（iframe 模式那条演示同理）：加载时先渲染正常子树，点一下才进错误态。顺带解决第二个问题 —— 自动抛错时 React 仍会把它上报给 window，英文 showcase 的浏览器门禁按 `pageerror` 判失败（一次正常的页面加载不该甩出未捕获错误；Playwright 还会把 iframe 内的错误算到宿主页头上）。

新增守卫 `src/showcase/ssr-safety.test.tsx`：把全部 380 个 showcase 的 examples/states 过一遍 `renderToStaticMarkup`，任何一处在服务端渲染时抛错都当场红。把「构建十分钟后才发现整页导不出来」提前到秒级。

**顺带**：`stepper.tsx` 开头重复了两行 `"use client"`，清掉一行。

**英文目录缺 7 条**：`apps/www/i18n/component-meta.en.ts` 里没有这批新组件（DesignCanvas / ElementSelectionOverlay / InspectorPanel / CodeEditor / PreviewSandbox / ComponentPicker / IssueReporter）的记录，英文站的组件目录与站内搜索都索引不到它们。补齐后英文目录从 371 条回到与中文一致的 378 条。
