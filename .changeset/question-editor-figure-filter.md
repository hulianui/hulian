---
"@hulianui/ui": minor
---

feat(question-editor): 此前题干里所有 `![](…)` 一律当题图，编辑一轮就被整批搬到题干末尾、alt 一并抹掉，Word 导入线切出的行内公式图（`不等式![7x+5<5x+1](import/formula/….png)的解集为______．`）因此句子读不通、下游要读的那段 LaTeX 也没了；现在加 `figureFilter` 按 key 划出哪些算题图，划出去的引用原样留在题干正文里、位置与 alt 都不动，写回时也不再丢 alt (#353)
