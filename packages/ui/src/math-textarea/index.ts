// 公式输入框。**不是对外 subpath**：从 @hulianui/ui/math 转出（预览内部就是 Formula，独立入口省不掉 KaTeX）。
export { MathTextarea } from "./math-textarea";
export type { MathTextareaProps, MathFieldLikeProps } from "./math-textarea.types";
export {
  FORMULA_TEMPLATE_GROUPS,
  applyFormulaTemplate,
  wrapSelectionInMath,
  isInsideMath,
  mathSpans,
  validateFormulaSyntax,
  textPosition,
} from "./formula-editing";
export type {
  FormulaTemplate,
  FormulaTemplateGroup,
  BuiltinTemplateGroupId,
  BuiltinTemplateId,
  TemplateInsertion,
  FormulaSyntaxCode,
  FormulaSyntaxIssue,
  MathSpan,
} from "./formula-editing";
export { katexErrorAt } from "./katex-error";
export type { KatexParseIssue } from "./katex-error";
export { MATH_TEXTAREA_LOCALE_ZH, MATH_TEXTAREA_LOCALE_EN } from "./math-textarea.locale";
export type { MathTextareaLocale } from "./math-textarea.locale";
