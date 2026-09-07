---
"@hulianui/ui": patch
---

fix(question-editor): 题干输入框底下那块预览恒是 `<Formula>`，它不认 markdown 图片语法——0.64.0 的 `figureFilter`（#353）把行内公式图划出题图之后，那些引用**按设计**留在题干正文里，于是预览把 `![7x+5<5x+1](import/formula/….png)` 原样印成一串源码；现在题干预览改走库内题干渲染的同一条路（`QuestionCard` / `QuestionAnswer` 共用的那一块），图画出来、`macros` 一并透传，老师在输入框底下看到的就是展示端会渲染出来的东西。没给 `resolveFigure` 时仍退回默认预览（那条路一样解析不出图）；正文里既没公式也没图时预览整块收起——那时它与输入框逐字相同。附带两处：题干附图的 alt 优先用引用自己写的那段（`![7x+5<5x+1](…)` 里方括号里的 LaTeX 比「题目附图 2」有信息），没写才回落到 `figureAlt` 编号；`MathTextarea` 的 `renderPreview` 现在说了算——返回 `null` 表示这段没什么可预览的，不再只看值里有没有 `$` (#355)
