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
   * 自定义宏，透传给 KaTeX（`{"\\RR": "\\mathbb{R}"}`）。
   *
   * **把它提到模块级常量**：本组件是 memo 的，行内字面量每次渲染都是新对象，
   * 会让 memo 每次都失效 —— 而 KaTeX 排版是整个组件里最贵的一步。
   */
  macros?: Record<string, string>;
  className?: string;
}
