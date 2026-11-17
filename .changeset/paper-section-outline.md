---
"@hulianui/ui": minor
---

Paper 新增章节三件套：`PaperSection`（CSS 计数器自动层级编号 1 / 2.1，服务端渲染与打印都有号）、`SecRef`（正文引用「第 2.1 节」/ "Section 2.1"，点击滚动并描边）、`PaperOutline`（从章节注册表生成目录，内部复用 Anchor 滚动高亮）。`Paper` 的 `labels` 新增 `section`。

`FigureStep` 新增 `until`：从某一步起被取代、不再画出（「全部」状态与导出 SVG 里也隐藏），用来画会移动的分支指针、被替换的旧节点。

`FigRef` 不写文字时，若 `state` 是该图的打印分图之一，自动写成「图 1(b)」/ "Figure 1(b)"，分图字母与打印版一致。

`usePaperNavigate()`：命令式跳到图 / 公式 / 章节，与 `FigRef` / `SecRef` / `EqRef` 共用同一套「滚进视野 + 描边」逻辑。`Button` 这类本身就是交互元素的触发器用它在 `onClick` 里跳转，不必再 `render={<FigRef/>}` 嵌套引用、继承链接下划线。
