---
"@hulianui/ui": minor
---

feat(math): 题型收窄此前没导出，每个消费方都得自己照着 QUESTION_TYPES 再写一遍 `raw as QuestionType`；现在 `@hulianui/ui/math` 直接给出 `isKnownQuestionType`（类型谓词，收窄失败那侧仍是 string）与 `asQuestionType`（wire 上的 `string | null | undefined` 转 `QuestionType`，认不出给 `undefined`，正好是 `answerLines` / `answerText` / `QuestionCard` 按答案形状兜底的那一档）(#352)
