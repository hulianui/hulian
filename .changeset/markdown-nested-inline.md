---
"@hulianui/ui": patch
---

Markdown：粗体 / 斜体内部的行内标记现在会正常解析。此前 `` **带 `代码` 的粗体** ``、`**[链接](url) 加粗**` 会把内层标记连同反引号、`*` 一起当字面文本吐出来 —— 那段字现在真的渲染成 `<code>` / `<strong>` 内的 `<a>`，嵌套也不再打乱同一行后续标记的位置。

<!-- changelog-en:start -->
Markdown: inline markup inside bold and italic now renders. ``**bold with `code`**`` and `**[link](url) bold**` used to emit the inner markup as literal text, backticks and asterisks included. They now produce real `<code>` and `<a>` inside `<strong>`, and nesting no longer shifts the parsing position of later markup on the same line.
<!-- changelog-en:end -->
