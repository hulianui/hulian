---
"@hulianui/ui": patch
---

fix(ime): CodeEditor、ColorPicker 色值输入框、ScopeMatrix 新增输入框在输入法合成中（拼音候选未上屏）按 Enter 不再触发换行 / 提交；PromptInput 原有的 `isComposing` 判断补上 Safari 的 `keyCode === 229` 兜底（WebKit 先派发 compositionend，确认键到达时 `isComposing` 已为 false）。表单示例的密码框补 `autocomplete="new-password"`、邮箱补 `autocomplete="username"`。

<!-- changelog-en:start -->
fix(ime): pressing Enter while an IME composition is active (e.g. a Pinyin candidate not yet committed) no longer inserts a newline or submits in CodeEditor, the ColorPicker value input, and the ScopeMatrix add input. PromptInput's existing `isComposing` check now also covers Safari via `keyCode === 229` (WebKit fires compositionend first, so `isComposing` is already false when the confirming keydown arrives). The form showcase password fields now set `autocomplete="new-password"` and the email field `autocomplete="username"`.
<!-- changelog-en:end -->
