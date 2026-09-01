---
"@hulianui/ui": minor
---

新增独立子路径 `@hulianui/ui/math-field`：`MathField`（MathLive 驱动的可视化公式输入框，值为不带 `$` 的 LaTeX，满足 `MathFieldLikeProps`，可直接注入 MathTextarea / QuestionEditor 的 `visualEditor` 与 QuestionAnswer 的 `mathField`；服务端与首帧渲染骨架，`mathlive` 在客户端动态加载，没装时显示安装提示而不是抛错；`virtualKeyboard` auto / manual / off、`keyboardLayouts`、`readOnly`、`placeholder`；MathLive 的 CSS 变量钉到本库 token）与 `createCasComparator()`（第 3 档等价判分，返回 `Promise<(a, b) => boolean>`，直接喂 `gradeObjective` 的 `equivalent`；解析失败一律 false）。

`mathlive`（>=0.110.0）与 `@cortex-js/compute-engine`（>=0.58.0，mathlive 钉死的依赖）作为 **optional peerDependencies** 加入：不装它们的消费方不受影响，主包与 `@hulianui/ui/math` 零 MathLive，`@hulianui/ui/math-field` 的 initial 实测 12.9KB（mathlive 221KB / compute-engine 294KB 走 `import()` 懒加载）。字体由消费方 `import "mathlive/fonts.css"`。

内置 demo「瀚学」新增题库（QuestionEditor + MathField）与练习（QuestionAnswer + 三档即时判分）两页，并补挂了此前缺失的 ToastProvider；新增 `docs/consuming-math.md`。

<!-- changelog-en:start -->
New standalone subpath `@hulianui/ui/math-field`: `MathField` (a MathLive-powered visual formula input whose value is LaTeX without `$`; it satisfies `MathFieldLikeProps`, so it plugs straight into the `visualEditor` of MathTextarea / QuestionEditor and the `mathField` of QuestionAnswer; the server and the first client frame render a skeleton, `mathlive` is loaded dynamically on the client, and a missing package shows an install hint instead of throwing; `virtualKeyboard` auto / manual / off, `keyboardLayouts`, `readOnly`, `placeholder`; MathLive's CSS variables are pinned to the library tokens) and `createCasComparator()` (tier-3 equivalence grading that returns `Promise<(a, b) => boolean>` to feed the `equivalent` option of `gradeObjective`; any parse failure is false).

`mathlive` (>=0.110.0) and `@cortex-js/compute-engine` (>=0.58.0, the dependency mathlive pins) join as **optional peerDependencies**: consumers who do not install them are unaffected, the main package and `@hulianui/ui/math` contain zero MathLive, and the initial chunk of `@hulianui/ui/math-field` measures 12.9KB (mathlive 221KB / compute-engine 294KB are lazy-loaded through `import()`). Fonts come from the consumer's `import "mathlive/fonts.css"`.

The built-in HanLearn demo gains a question bank page (QuestionEditor + MathField) and a practice page (QuestionAnswer with three-tier instant grading) and now mounts the ToastProvider it was missing; `docs/consuming-math.md` is new.
<!-- changelog-en:end -->
