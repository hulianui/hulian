// MathTextarea 词条。单独成文件的理由与 question/question.locale.ts 相同：@hulianui/ui/math 入口
// 不能拖进 config/locale.ts 那份全库字典。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反向引用本文件。
import type {
  BuiltinTemplateGroupId,
  BuiltinTemplateId,
  FormulaSyntaxCode,
} from "./formula-editing";

export interface MathTextareaLocale {
  /** 工具栏按钮，如「公式」。 */
  insertFormula: string;
  panelTitle: string;
  panelDescription: string;
  /** 面板里「把选中的内容框成公式」小标题。 */
  wrapHeading: string;
  wrapInline: string;
  wrapDisplay: string;
  /** 模板按钮的无障碍名，如 ("分式") → "插入分式"。 */
  insertTemplate: (label: string) => string;
  /** 输入里还没有 `$` 时的一句提示。 */
  hint: string;
  previewLabel: string;
  /** 预览下方说明：红色源码 = KaTeX 解析不了。 */
  previewNote: string;
  sourceTab: string;
  visualTab: string;
  visualInsert: string;
  visualHint: string;
  /** 位置前缀，如 (2, 4) → "第 2 行第 4 个字符处"。与 `syntax[code]` 直接拼接。 */
  position: (line: number, column: number) => string;
  /** 三种语法问题的句尾，键必须齐。 */
  syntax: Record<FormulaSyntaxCode, string>;
  /** KaTeX 解析错误，index 从 1 数。 */
  katexError: (index: number, message: string) => string;
  templateGroups: Record<BuiltinTemplateGroupId, string>;
  templates: Record<BuiltinTemplateId, string>;
}

export const MATH_TEXTAREA_LOCALE_ZH: MathTextareaLocale = {
  insertFormula: "公式",
  panelTitle: "插入公式",
  panelDescription: "点一下插到光标处；先选中一段文字再点，会把它放进模板里。",
  wrapHeading: "把选中的内容框成公式",
  wrapInline: "行内公式 $…$",
  wrapDisplay: "独立公式 $$…$$",
  insertTemplate: (label) => `插入${label}`,
  hint: "公式用 $…$ 包起来，如 $x^{2}$",
  previewLabel: "预览（与题目展示用同一套排版）",
  previewNote: "预览里出现红色源码，说明这段公式 KaTeX 解析不了，请检查命令拼写。",
  sourceTab: "源码",
  visualTab: "可视化输入",
  visualInsert: "插入到光标处",
  visualHint: "在上方编辑好公式后插入，结果仍是 $…$。",
  position: (line, column) => `第 ${line} 行第 ${column} 个字符处`,
  syntax: {
    "unclosed-math": "的「$」没有闭合，公式要写成 $…$（独立成行用 $$…$$）",
    "unclosed-brace": "的「{」没有闭合",
    "unmatched-close-brace": "多了一个「}」，没有与之配对的「{」",
  },
  katexError: (index, message) => `第 ${index} 个字符附近：${message}`,
  templateGroups: {
    scripts: "上下标与分式",
    brackets: "括号与绝对值",
    relations: "不等号与集合关系",
    greek: "希腊字母",
    calculus: "求和与积分",
  },
  templates: {
    superscript: "上标",
    subscript: "下标",
    fraction: "分式",
    sqrt: "根式",
    nthRoot: "n 次根",
    parentheses: "圆括号",
    absolute: "绝对值",
    set: "集合",
    leq: "小于等于",
    geq: "大于等于",
    neq: "不等于",
    approx: "约等于",
    in: "属于",
    subseteq: "包含于",
    cup: "并集",
    cap: "交集",
    alpha: "α",
    beta: "β",
    theta: "θ",
    pi: "π",
    delta: "Δ",
    degree: "度",
    sum: "求和",
    integral: "积分",
    limit: "极限",
  },
};

export const MATH_TEXTAREA_LOCALE_EN: MathTextareaLocale = {
  insertFormula: "Formula",
  panelTitle: "Insert formula",
  panelDescription: "Click to insert at the caret. Select text first to place it inside the template.",
  wrapHeading: "Wrap the selection as a formula",
  wrapInline: "Inline $…$",
  wrapDisplay: "Display $$…$$",
  insertTemplate: (label) => `Insert ${label}`,
  hint: "Wrap formulas in $…$, e.g. $x^{2}$",
  previewLabel: "Preview (same typesetting as the question display)",
  previewNote: "Red source in the preview means KaTeX cannot parse that formula. Check the command spelling.",
  sourceTab: "Source",
  visualTab: "Visual input",
  visualInsert: "Insert at caret",
  visualHint: "Build the formula above, then insert it. The result is still $…$.",
  position: (line, column) => `Line ${line}, character ${column}: `,
  syntax: {
    "unclosed-math": "this “$” is never closed. Write formulas as $…$ ($$…$$ for display)",
    "unclosed-brace": "this “{” is never closed",
    "unmatched-close-brace": "extra “}” with no matching “{”",
  },
  katexError: (index, message) => `Near character ${index}: ${message}`,
  templateGroups: {
    scripts: "Scripts and fractions",
    brackets: "Brackets and absolute value",
    relations: "Relations and sets",
    greek: "Greek letters",
    calculus: "Sums and integrals",
  },
  templates: {
    superscript: "Superscript",
    subscript: "Subscript",
    fraction: "Fraction",
    sqrt: "Square root",
    nthRoot: "nth root",
    parentheses: "Parentheses",
    absolute: "Absolute value",
    set: "Set",
    leq: "Less than or equal",
    geq: "Greater than or equal",
    neq: "Not equal",
    approx: "Approximately equal",
    in: "Element of",
    subseteq: "Subset of",
    cup: "Union",
    cap: "Intersection",
    alpha: "alpha",
    beta: "beta",
    theta: "theta",
    pi: "pi",
    delta: "Delta",
    degree: "Degree",
    sum: "Sum",
    integral: "Integral",
    limit: "Limit",
  },
};
