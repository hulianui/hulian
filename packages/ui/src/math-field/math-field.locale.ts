// MathField 词条。单独成文件的理由与 math-textarea/math-textarea.locale.ts 相同：
// @hulianui/ui/math-field 入口不能拖进 config/locale.ts 那份全库字典。这里是 SSOT。
export interface MathFieldLocale {
  /** 加载中占位的无障碍名。 */
  loading: string;
  /** 没装 mathlive 时的提示标题。 */
  missing: string;
  /** 提示正文，后面紧跟安装命令。 */
  missingHint: string;
}

export const MATH_FIELD_LOCALE_ZH: MathFieldLocale = {
  loading: "公式编辑器加载中",
  missing: "公式编辑器需要安装 mathlive",
  missingHint: "在项目里执行后刷新页面：",
};

export const MATH_FIELD_LOCALE_EN: MathFieldLocale = {
  loading: "Loading the formula editor",
  missing: "The formula editor needs the mathlive package",
  missingHint: "Run this in your project, then reload:",
};
