// 出题编辑器。**不是对外 subpath**：从 @hulianui/ui/math 转出（题干 / 选项 / 预览内部都是 Formula，独立入口省不掉 KaTeX）。
export { QuestionEditor } from "./question-editor";
export type { QuestionEditorProps, EditorField } from "./question-editor.types";
export {
  questionFormulaIssues,
  shapeIsDirty,
  switchType,
  optionCaption,
  stemBody,
  joinStemFigures,
} from "./question-editor.state";
export type { QuestionFormulaIssue, FormulaField } from "./question-editor.state";
export { QUESTION_EDITOR_LOCALE_ZH, QUESTION_EDITOR_LOCALE_EN } from "./question-editor.locale";
export type { QuestionEditorLocale, SubjectiveType } from "./question-editor.locale";
