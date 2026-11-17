---
"@hulianui/ui": patch
---

fix(code-block): `lang` 为 `text` / `txt` / `plain` / `plaintext` 时按纯文本输出，不再着色。此前这几种语言落进「其它语言按 JS 家族近似」的兜底，文本里的 URL 从 `//` 起被当成行注释整段斜体，撇号与引号之间的内容也会被当成字符串着色。Markdown 里 ` ```text ` 围栏同样受益。

<!-- changelog-en:start -->
fix(code-block): `lang` values `text` / `txt` / `plain` / `plaintext` now render as plain text with no coloring. These languages used to fall through to the JavaScript-family approximation, so a URL in the text turned into an italic line comment from `//` onward, and anything between apostrophes or quotes was colored as a string. ` ```text ` fences in Markdown benefit as well.
<!-- changelog-en:end -->
