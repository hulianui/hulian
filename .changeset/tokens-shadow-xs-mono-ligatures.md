---
"@hulianui/tokens": minor
---

feat(tokens): 新增主题感知的 `shadow-xs`（亮色短投影 + 发丝边，暗色白色轮缘光），此前 `shadow-xs` 落回 Tailwind 默认的纯黑 0.05、暗色下不可见。preset-opinionated 关闭等宽字体的连字与上下文替换（`--font-mono--font-feature-settings: "liga" 0, "calt" 0`），作用于 `font-mono` 与 `code / kbd / samp / pre`：Geist Mono 等编程字体会把 `--` `>=` 折成一个向左越界的字形，吃掉行内代码的左内边距、压住前一个字母。想要连字的项目在自己的 `@theme` 里改回 `normal`。

<!-- changelog-en:start -->
feat(tokens): adds a theme-aware `shadow-xs` (a short drop and hairline in light mode, a white inset rim in dark mode). Previously `shadow-xs` fell back to Tailwind's default flat black at 0.05, which is invisible in dark mode. preset-opinionated also turns off ligatures and contextual alternates for monospace text (`--font-mono--font-feature-settings: "liga" 0, "calt" 0`), covering `font-mono` and `code / kbd / samp / pre`. Programming fonts such as Geist Mono fold `--` and `>=` into one glyph that overhangs to the left, eating the left padding of inline code and overlapping the previous letter. Projects that want ligatures can set it back to `normal` in their own `@theme`.
<!-- changelog-en:end -->
