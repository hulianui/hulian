---
"@hulianui/tokens": minor
---

feat(tokens): 新增 accent 作用域 `[data-accent-scope]`：子树里只换主色的**色相**（`--hl-accent-hue`，OKLCH h，品牌原色 258），明度 / 彩度沿用品牌梯子，`primary` / `primary-hover` / `primary-subtle` / `primary-border` / `ring` / `signal-brand` / `code-keyword` 与图表色板 `chart-1..6` 一起换，亮色、暗色、作用域里嵌套的主题岛都覆盖。`--hl-accent-hue` 用 `@property` 注册成 `<number>`，可以过渡。通常配 `@hulianui/ui` 的 `<AccentScope hue>` 使用。

<!-- changelog-en:start -->
feat(tokens): adds the accent scope `[data-accent-scope]`. Inside the subtree only the accent **hue** changes (`--hl-accent-hue`, the OKLCH h; the brand color is 258) while lightness and chroma stay on the brand ladder. `primary`, `primary-hover`, `primary-subtle`, `primary-border`, `ring`, `signal-brand`, `code-keyword`, and the chart palette `chart-1..6` all follow, in light mode, dark mode, and theme islands nested inside the scope. `--hl-accent-hue` is registered with `@property` as a `<number>`, so it can transition. Usually paired with `<AccentScope hue>` from `@hulianui/ui`.
<!-- changelog-en:end -->
