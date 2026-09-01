// 学生作答卡。**不是对外 subpath**：从 @hulianui/ui/math 转出（题干 / 选项 / 结果区内部都是 Formula，独立入口省不掉 KaTeX）。
export { QuestionAnswer } from "./question-answer";
export type { QuestionAnswerProps, AnswerableQuestion, QuestionAnswerResult } from "./question-answer.types";
export { canSubmit, answerKind, resolveBlankCount } from "./question-answer.state";
export type { AnswerKind } from "./question-answer.state";
export { QUESTION_ANSWER_LOCALE_ZH, QUESTION_ANSWER_LOCALE_EN } from "./question-answer.locale";
export type { QuestionAnswerLocale } from "./question-answer.locale";
