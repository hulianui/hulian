---
"@hulianui/ui": patch
---

fix(paper): `PaperPresenter` 的演示层沿用 `Paper` 所处的主题岛。演示层经 Portal 挂在 `body` 下，原先继承不到外层的 `data-theme`：`Paper` 放在暗色岛里，演示却跟着全局主题走。现在打开时取 `Paper` 最近的带 `data-theme` 的祖先（含 `Paper` 自己）标到演示层上，演示中切换主题也跟着变；主题在 `<html>` 上时不额外标注。

<!-- changelog-en:start -->
fix(paper): the `PaperPresenter` overlay now follows the theme island around `Paper`. The overlay is portaled to `body`, so it used to miss an outer `data-theme`: a `Paper` inside a dark island still presented in the global theme. When it opens, it now copies the theme of the nearest `data-theme` ancestor of `Paper` (including `Paper` itself) and follows changes while presenting; a theme set on `<html>` needs no copy and is left alone.
<!-- changelog-en:end -->
