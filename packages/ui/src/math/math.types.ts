// 解析器的节点树类型。渲染由 KaTeX 负责，这棵树只用于 mathToPlain 一类的文本降级。
export type MathNode =
  | { kind: "text"; text: string }
  /**
   * 关系符 / 二元运算符。与 text 分开是因为它要在渲染层拿到左右对称的留白：
   * `A \Rightarrow B` 里命令后的空格是命令终止符会被吃掉，留白若靠原文空格来给，
   * 就变成左边有右边没有，而且间距取决于作者打没打空格。
   * mathToPlain 仍按紧凑输出（`x≠0`），留白只发生在 DOM。
   */
  | { kind: "op"; text: string; spacing: "relation" | "binary" }
  /** 分数：分子分母上下叠放，中间一条分数线 */
  | { kind: "frac"; num: MathNode[]; den: MathNode[] }
  /** 根号，index 为根指数（三次根等） */
  | { kind: "sqrt"; radicand: MathNode[]; index?: MathNode[] }
  /** 装饰：上划线（\overline）/ 帽子（\widehat）/ 向量箭头（\vec、\overrightarrow）/ 下划线（\underline） */
  | { kind: "decorate"; style: "overline" | "hat" | "arrow" | "underline"; children: MathNode[] }
  /**
   * 把任意记号叠在内容上方（\overset{\frown}{AB} 即弧 AB）。
   * 与 decorate 的区别：上方是有语义的内容而非纯样式线，因此 mathToPlain 会留住它。
   */
  | { kind: "overset"; above: MathNode[]; children: MathNode[] }
  | { kind: "sup"; children: MathNode[] }
  | { kind: "sub"; children: MathNode[] }
  /** 填空槽，length 为原文里的下划线个数（决定空位宽度） */
  | { kind: "blank"; length: number };

export interface FormulaProps {
  /** LaTeX 源，或含 LaTeX 段落的正文 —— 由 `mode` 决定怎么理解。 */
  children: string;
  /**
   * - `"mixed"`（默认）：正文与公式混排，**只有 `$…$` / `$$…$$` / `\(…\)` / `\[…\]` 里的内容**
   *   按 LaTeX 排版，分隔符外原样输出。中文题面就该用这档。
   * - `"math"`：整串都是 LaTeX，不找分隔符。写死一条公式时用这档，省掉包 `$` 的仪式。
   * @default "mixed"
   */
  mode?: "mixed" | "math";
  /**
   * 块级排版（独立成行、居中、大号求和/积分限）。
   * **仅在 `mode="math"` 时生效** —— `mode="mixed"` 下每段的行内/块级由它自己的分隔符决定
   * （`$…$` 行内、`$$…$$` 与 `\[…\]` 块级），此项被忽略。
   * @default false
   */
  display?: boolean;
  /**
   * 填空槽（`____`，2 个及以上连续下划线）的最小宽度，单位 em。
   *
   * 填空槽在 `$…$` 外面也认 —— `$\frac{3}{8}$ 化成小数为 ____` 里的下划线同样会
   * 渲染成可书写的空位，而不是四个字面下划线。单个 `_` 仍是下标。
   * @default 2.5
   */
  blankWidth?: number;
  /**
   * 自定义宏，透传给 KaTeX（`{"\\RR": "\\mathbb{R}"}`）。
   *
   * **把它提到模块级常量**：本组件是 memo 的，行内字面量每次渲染都是新对象，
   * 会让 memo 每次都失效 —— 而 KaTeX 排版是整个组件里最贵的一步。
   */
  macros?: Record<string, string>;
  className?: string;
}
