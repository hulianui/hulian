---
"@hulianui/ui": patch
---

`Prose` / `MarkdownEditor` / `RichTextEditor` 的引用块去掉强制 `italic`：中文字体（PingFang SC、微软雅黑）没有真正的意大利体字形，`font-style: italic` 会让浏览器合成伪斜体，笔画整体倾斜变形、可读性明显下降。引用的语义由左边线 + 弱化文字色表达，倾斜不承担任何语义，删掉不丢信息。`<em>` 的 `italic` 保留 —— 那是作者显式写的强调，属于内容语义，不是容器强加的装饰。
