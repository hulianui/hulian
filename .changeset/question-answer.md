---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增 `QuestionAnswer`：学生端一道题的作答卡。按题型给对的控件（single → RadioGroup、multiple → CheckboxGroup、judge → 题型自带「正确 / 错误」两项且值为 `"true" | "false"`、blank → 每空一个输入框并标空号，`blankCount` 缺失按题干 `____` 数再不行按 1）；选择题选项缺失明说「暂时没法作答」而不是摆一个空单选组；主观题只读并提示需教师批阅；未知题型按主观题处理并有开发期告警。`canSubmit` 门禁：多空每个空都填了才可交；`onSubmit` 给了才出提交按钮，参数是规范形（填空恒为数组，单空压平交给 `encodeBlanks`）。`result` 有值即锁定并显示正误、`answerText` 渲染的正确答案与解析；`correctHint` / `reason` / `header` 三个插槽；`blankInput="math"` + `mathField` 注入公式键盘（`MathFieldLikeProps` 新增可选 `disabled`）。题干与 QuestionCard 共用新抽出的 `QuestionStemBlock`（`resolveFigure` 切图 + Formula）。消费方原型里三条曾静默让学生「答不了」的 bug（判断题空单选组 / 多空只有一个输入框 / 对象形 options 被滤空）各有回归测试。文案走 Locale（新增 `questionAnswer` 词条）。配套导出 `canSubmit` / `answerKind` / `resolveBlankCount`。

答案形状类型 `QuestionAnswer` 改名为 `QuestionAnswerValue`（把名字让给组件）。该类型只存在于未发布的 master，不构成破坏性变更。

体积：`@hulianui/ui/math` 的 `export *` 上界实测 184.5KB（新进入该入口的只有 Radio / RadioGroup / Input），仍在 208KB 基线内；库 `sideEffects:false`，只用 `Formula` / `QuestionCard` 的消费方经 tree-shaking 不受影响。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains `QuestionAnswer`, the student-side answer card for one question. It renders the right control per type (single → RadioGroup, multiple → CheckboxGroup, judge → the two built-in True / False options with values `"true" | "false"`, blank → one input per blank with its number; when `blankCount` is missing it counts `____` in the stem, then falls back to 1); a choice question with missing options says plainly that it cannot be answered yet instead of showing an empty radio group; subjective questions are read-only with a "graded by the teacher" note; an unknown type is treated as subjective with a development warning. `canSubmit` gates submission until every blank is filled; the submit button appears only when `onSubmit` is provided and receives the canonical shape (blanks are always an array, flatten a single blank with `encodeBlanks`). A present `result` locks the card and shows the verdict, the correct answer rendered by `answerText`, and the explanation; `correctHint` / `reason` / `header` slots; `blankInput="math"` with `mathField` injects a formula keyboard (`MathFieldLikeProps` gains an optional `disabled`). The stem shares the newly extracted `QuestionStemBlock` with QuestionCard (`resolveFigure` splitting plus Formula). Three silent "the student cannot answer" bugs from the consumer's prototype (empty radio group for true-false / one input for multiple blanks / object-shaped options filtered away) each have a regression test. Copy comes from the locale (new `questionAnswer` entries). Companion exports: `canSubmit` / `answerKind` / `resolveBlankCount`.

The answer-shape type `QuestionAnswer` is renamed `QuestionAnswerValue` to make room for the component. The type only ever existed on the unreleased master, so this is not a breaking change.

Size: the `export *` upper bound of `@hulianui/ui/math` measures 184.5KB (only Radio / RadioGroup / Input newly enter this entry), still within the 208KB baseline; the package is `sideEffects:false`, so consumers importing only `Formula` or `QuestionCard` are unaffected after tree-shaking.
<!-- changelog-en:end -->
