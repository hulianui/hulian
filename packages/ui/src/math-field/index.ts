// @hulianui/ui/math-field —— MathLive 驱动的可视化公式键盘，独立 subpath。
// 主入口 @hulianui/ui 与 @hulianui/ui/math 刻意不导出这里的任何东西：
// mathlive（+ 它钉死的 @cortex-js/compute-engine）是 optional peer，只有真要可视化输入 /
// CAS 判分的页面才为它们买单。MathField 满足 MathFieldLikeProps，注入 MathTextarea 的
// visualEditor 与 QuestionAnswer 的 mathField 即可。
export { MathField } from "./math-field";
export type { MathFieldProps, MathFieldKeyboardPolicy } from "./math-field.types";
export { MATH_FIELD_LOCALE_ZH, MATH_FIELD_LOCALE_EN } from "./math-field.locale";
export type { MathFieldLocale } from "./math-field.locale";
export { MATHLIVE_INSTALL_HINT, MathLiveUnavailableError } from "./mathlive-loader";
export {
  createCasComparator,
  stripMathDelimiters,
  COMPUTE_ENGINE_INSTALL_HINT,
  ComputeEngineUnavailableError,
} from "./cas";
