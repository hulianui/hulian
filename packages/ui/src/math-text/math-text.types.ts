export type MathNode =
  | { kind: "text"; text: string }
  /** 分数：分子分母上下叠放，中间一条分数线 */
  | { kind: "frac"; num: MathNode[]; den: MathNode[] }
  /** 根号，index 为根指数（三次根等） */
  | { kind: "sqrt"; radicand: MathNode[]; index?: MathNode[] }
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
