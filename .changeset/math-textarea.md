---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增 `MathTextarea`：录题用的 LaTeX 输入框。模板插到光标处（选中 `x` 点分式得到 `\frac{x}{}` 且光标在分母）、选区一键包成 `$…$` / `$$…$$`、提交前只查 `$` 未闭合与 `{}` 不配对并报行列、KaTeX 解析错误换算回整串位置、实时预览与展示端同一个 `Formula`。`visualEditor` 可注入满足 `MathFieldLikeProps` 的可视化编辑器（阶段 5 的 MathField），给了才出「可视化输入」页签。文案走 Locale（新增 `mathTextarea` 词条，含内置模板名）。配套纯函数 `applyFormulaTemplate` / `wrapSelectionInMath` / `isInsideMath` / `mathSpans` / `validateFormulaSyntax` / `textPosition` / `katexErrorAt` 一并导出。

体积：`@hulianui/ui/math` 的 `export *` 上界从 95.6KB 升到 154.4KB（Popover / Tabs / 表单控件进入该入口），基线相应上调到 178KB；库 `sideEffects:false`，只用 `Formula` 的消费方经 tree-shaking 不受影响。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains `MathTextarea`, a LaTeX input for question authoring. Templates insert at the caret (select `x`, click Fraction, get `\frac{x}{}` with the caret in the denominator), one click wraps the selection in `$…$` / `$$…$$`, the pre-submit check reports only unclosed `$` and unbalanced `{}` with line and column, KaTeX parse errors are mapped back to a position in the whole string, and the live preview is the same `Formula` used for display. `visualEditor` injects any component satisfying `MathFieldLikeProps` (MathField in phase 5); the Visual input tab appears only when provided. Copy comes from the locale (new `mathTextarea` entries, including built-in template names). Companion pure functions `applyFormulaTemplate` / `wrapSelectionInMath` / `isInsideMath` / `mathSpans` / `validateFormulaSyntax` / `textPosition` / `katexErrorAt` are exported alongside.

Size: the `export *` upper bound of `@hulianui/ui/math` rises from 95.6KB to 154.4KB (Popover, Tabs, and form controls now live behind this entry) and the baseline is raised to 178KB; the package is `sideEffects:false`, so consumers importing only `Formula` are unaffected after tree-shaking.
<!-- changelog-en:end -->
