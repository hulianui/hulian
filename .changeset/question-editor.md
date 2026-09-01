---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增 `QuestionEditor`：一道数学题的结构化编辑器。七型切换时 options 与 answer 同时重置（有内容先确认，`score` 仍是旧默认分才换新默认分）；题干输入框只见正文，题图以 `![](key)` 块写回题干末尾，`resolveFigure` 解析、`onUploadFigure` 给了才出「插入图片」；选项增删上下移后正确答案跟着内容重映射；填空空数随题干 `____` 变化、不一致时提示并一键对齐、一空可加等价写法；计算 / 解答可切分步给分并显示合计；`validateQuestion` 就地挂 `Field.error`（默认只显示改过的字段，`showAllIssues` 提交时全开）；复核条 `issues` / `onResolveIssue`；`extra` 放消费方私有字段；右侧预览就是 `QuestionCard`。不带提交按钮。文案走 Locale（新增 `questionEditor` 词条，含 `validateQuestion` 机器码文案表）。配套导出 `questionFormulaIssues` / `shapeIsDirty` / `switchType` / `optionCaption` / `stemBody` / `joinStemFigures`。

`QuestionCard` 新增 `resolveFigure`：题干里的 `![](key)` 先切图再排公式，图渲染在正文之后（编辑器预览与题库列表同一条路径）。

体积：`@hulianui/ui/math` 的 `export *` 上界从 154.4KB 升到 180.5KB（Field / Segmented / Checkbox / Switch / Rating / NumberField / Alert / AlertDialog / Image 进入该入口），基线相应上调到 208KB；库 `sideEffects:false`，只用 `Formula` / `QuestionCard` 的消费方经 tree-shaking 不受影响。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains `QuestionEditor`, a structured editor for one math question. Switching type resets options and answer together (with a confirmation when there is content; the score changes only if it still equals the old default); the stem input shows only the body while figures are written back as a `![](key)` block at the end of the stem, resolved through `resolveFigure`, with the Insert image button appearing only when `onUploadFigure` is provided; after adding, removing, or reordering options the correct answer is remapped to follow the content; the number of blanks follows `____` in the stem with a one-click align and per-blank equivalent forms; calculation and extended-response questions can switch to a rubric with a running total; `validateQuestion` issues land on `Field.error` (only edited fields by default, `showAllIssues` for submit time); a review bar via `issues` / `onResolveIssue`; `extra` for consumer-private fields; the preview on the right is `QuestionCard`. No submit button. Copy comes from the locale (new `questionEditor` entries, including a message table for `validateQuestion` codes). Companion exports: `questionFormulaIssues` / `shapeIsDirty` / `switchType` / `optionCaption` / `stemBody` / `joinStemFigures`.

`QuestionCard` gains `resolveFigure`: `![](key)` references in the stem are split out before typesetting and rendered after the text (the editor preview and the question bank share one path).

Size: the `export *` upper bound of `@hulianui/ui/math` rises from 154.4KB to 180.5KB (Field, Segmented, Checkbox, Switch, Rating, NumberField, Alert, AlertDialog, and Image now live behind this entry) and the baseline is raised to 208KB; the package is `sideEffects:false`, so consumers importing only `Formula` or `QuestionCard` are unaffected after tree-shaking.
<!-- changelog-en:end -->
