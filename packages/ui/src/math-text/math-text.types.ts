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

export interface MathTextProps {
  /** 含数学记号的文本，见组件文档的「支持的记号」。 */
  children: string;
  /**
   * 填空槽最小宽度（em）。题面里的空位要留得下手写答案，
   * 太窄会让「可记作____万元」看起来像下划线错位。
   * @default 2.5
   */
  blankWidth?: number;
  /** 整体字号跟随父级；此项仅控制上下标缩放比。@default 0.75 */
  scriptScale?: number;
  className?: string;
}
