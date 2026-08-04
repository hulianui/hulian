// @hulianui/ui/math —— KaTeX 驱动的重型数学排版，独立 subpath。
// 主入口 @hulianui/ui 刻意不导出这里的任何东西：MathText 的消费者不该为 KaTeX 的体积买单。
export { Formula } from "./math";
export { formulaToPlain } from "./math.parse";
export type { FormulaProps } from "./math.types";
// 分隔符切分是两件共用的纯函数，从这里再导一次，免得只用 Formula 的人还要去 @hulianui/ui 里捞。
export { splitMathSegments } from "../math-text/math-text.parse";
export type { MathSegment } from "../math-text/math-text.parse";
