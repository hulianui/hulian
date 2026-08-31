import type { ComponentType, ReactNode } from "react";
import type { FormulaTemplateGroup } from "./formula-editing";

/**
 * 可视化公式编辑器的最小契约。阶段 5 的 `MathField`（`@hulianui/ui/math-field`）满足它；
 * 任何满足此形状的组件都能通过 `visualEditor` 注入，`@hulianui/ui/math` 自身零 MathLive。
 */
export interface MathFieldLikeProps {
  /** LaTeX（不带 `$`）。 */
  value: string;
  onChange: (latex: string) => void;
  /** 回车 / 确认。MathTextarea 把它接到「插入到光标处」同一条路径。 */
  onSubmit?: (latex: string) => void;
  "aria-label"?: string;
  className?: string;
}

export interface MathTextareaProps {
  /** 受控值：含 `$…$` 的普通字符串，与题干 / 选项 / 解析的存储格式一致。 */
  value: string;
  onChange: (next: string) => void;
  /** 多行（题干 / 解析 / 参考答案）用 Textarea；单行（选项 / 每空答案）用 Input。@default false */
  multiline?: boolean;
  /** 多行时的初始行数（autoResize 随内容长高）。@default 3 */
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  /** 紧凑形态：预览只占一行、不带说明文字。给选项与每空答案用。@default false */
  compact?: boolean;
  /** 覆盖默认模板组（高中加向量 / 数集，初中去积分）。@default FORMULA_TEMPLATE_GROUPS */
  templates?: readonly FormulaTemplateGroup[];
  /** 自定义预览渲染。默认 `<Formula>`；QuestionEditor 传带图渲染。 */
  renderPreview?: (value: string) => ReactNode;
  /** 注入可视化公式编辑器；给了才出「可视化输入」页签。 */
  visualEditor?: ComponentType<MathFieldLikeProps>;
  /** 透传给默认预览与 KaTeX 探针的宏表；自定义宏不该被报成「未定义命令」。 */
  macros?: Record<string, string>;
  /** 无障碍名。单行控件必给：选项那一栏靠它区分「选项 A」和「选项 B」。 */
  "aria-label"?: string;
  className?: string;
}
