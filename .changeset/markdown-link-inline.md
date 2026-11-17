---
"@hulianui/ui": patch
---

fix(markdown): 链接文字内部解析行内标记。CommonMark 允许 ``[`代码`](url)`` 与 `[**粗**](url)`，此前链接文字按纯文本原样输出，反引号和星号会被当字面字符显示出来；现在与粗体、斜体一样递归解析。

<!-- changelog-en:start -->
fix(markdown): inline markup inside link text is now parsed. CommonMark allows ``[`code`](url)`` and `[**bold**](url)`; link text used to be emitted as plain text, so the backticks and asterisks showed up as literal characters. It is now parsed recursively, the same way bold and italic already were.
<!-- changelog-en:end -->
