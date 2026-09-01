// 题目域 barrel。**不是对外 subpath**：一切从 @hulianui/ui/math 转出（题目域的组件内部都是 Formula）。
export type {
  QuestionType,
  QuestionOption,
  BlankAnswer,
  Rubric,
  QuestionAnswerValue,
  QuestionIssue,
  Question,
  StudentAnswer,
  QuestionValidationCode,
  QuestionValidationIssue,
} from "./question.types";
export { QUESTION_TYPES } from "./question.types";
export {
  SUBJECTIVE_TYPES,
  DEFAULT_SCORE_BY_TYPE,
  MAX_OPTIONS,
  isSubjective,
  optionKey,
  defaultShape,
  emptyQuestion,
  normalizeOptions,
  blankCount,
  validateQuestion,
} from "./question-shape";
export { splitStemFigures, stemFigureKeys, stripStemFigures } from "./question-stem";
export type { SplitStem } from "./question-stem";
export { encodeBlanks, decodeBlanks, toWireAnswer, fromWire } from "./question-wire";
export { answerLines, answerText } from "./answer-format";
export { QUESTION_LOCALE_ZH, QUESTION_LOCALE_EN } from "./question.locale";
export type { QuestionLocale } from "./question.locale";
export { gradeObjective, canonicalAnswer, parseNumeric, JUDGE_TRUE, JUDGE_FALSE } from "./grade";
export type { GradeOptions, GradeResult } from "./grade";
