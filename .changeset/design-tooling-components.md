---
"@hulianui/ui": minor
---

新增 7 个设计工具族组件（#90–#96），补齐「AI 生成 UI」这类产品要的整条工作台

消费方在做 AI 设计生成产品时一次报了 7 个缺口。这批全部零依赖自研，没有为它们新增任何 npm 依赖。

- **DesignCanvas**（data-display/collection）视觉设计画布：无限平移缩放、元素选择框、拖拽移动与八向 resize。受控 `items` 托管几何，`children` 作自绘图层。视口数学复用 `Flow` 已有的几何纯函数，不重写。**与 Flow 的分工写进了文档**：Flow 是节点编排画布，DesignCanvas 是自由排列的设计画布。
- **ElementSelectionOverlay**（feedback/overlay）指向编辑的基础设施：在容器或**同源** iframe 里 hover 高亮 / 点击选中，回吐组件树路径。路径两层（`data-hulian-path` 标记优先，回退到可被 `querySelector` 反查的结构化选择器），并把可靠度作为字段暴露出去。不往目标文档写任何样式。**跨源 iframe 明确报 `cross-origin` 错误而不是假装接上了。**
- **InspectorPanel**（forms/advanced）属性检查器：字段 schema 驱动，按 `kind` 派生控件，面板本身不认识任何具体属性；内置 layout / color / typography / border / effects 五套预设 schema。spacing 四联链接锁定、主题 token 色板、`MIXED` 混合值占位、`commitMode` 控制回吐时机。
- **CodeEditor**（forms/advanced）代码编辑器：textarea + 高亮层叠加，复用 `CodeBlock` 的零依赖着色器（CSS 另带一个有状态的扫描器，所以 `a:hover` 不会被当成属性名）。Tab 缩进 / Shift+Tab 反缩进 / Enter 续缩进 / 成对符号自动闭合与包裹 / 退格删对 / `Cmd+/` 切注释，**每一条都经 `execCommand` 落笔，所以原生 undo 栈不断**。**刻意不引 CodeMirror / Monaco**：本库是源码分发，一个依赖会进所有消费方的模块图。折叠、补全、多光标、minimap 明确不做，边界写进文档。
- **PreviewSandbox**（layout/container）预览沙箱：iframe 隔离渲染与同文档 React 错误边界双模式共用一副壳，错误对象同形状。切设备只改容器盒子，**iframe 节点与文档都不重建**，预览内的状态不丢。默认 `sandbox="allow-scripts"` 且**刻意不给 `allow-same-origin`**（两个一起给等于没有沙箱），因此错误转发走 postMessage；需要读内部 DOM 时显式传导出的同源常量。**不做代码执行引擎**：`code` 的语义是「已经可直接送进 iframe 的 HTML 文档串」。
- **ComponentPicker**（data-display/collection）组件库浏览器：分类树 + 模糊搜索 + 结果网格 + 详情面板。自研打分器（slug 命中远重于描述命中），**不引 fuse.js**。目录由消费方喂进来，另导出 `parseComponentCatalog` 纯函数把 `llms-full.txt` 解析成条目 —— 组件自己不发网络请求、不假设文件存在。
- **IssueReporter**（forms/advanced）GitHub issue 草稿器：表单收集 → 模板纯函数拼 Markdown → 回吐结构化草稿 + 生成预填链接。**链接超长自动降级为复制 Markdown**（判据量整条 URL 而不只是 body —— 中文百分号编码后 1 字 = 9 字符，只量 body 会在长标题时判漏）。不调 API、不持 token。

七个组件的内置文案都接了 `ConfigProvider` 的 locale SSOT，同时保留各自的 `labels` / `text` prop 作为覆盖。
