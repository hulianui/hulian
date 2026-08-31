// @hulianui/ui/math —— KaTeX 驱动的数学排版，独立 subpath。
// 主入口 @hulianui/ui 刻意不导出这里的任何东西：不排数学的消费者不该为 KaTeX 的体积买单。
//
// QuestionCard 也住这条路径：它的题干/选项内部就是 Formula，留在主 barrel 会把 KaTeX
// 拖进每一个 @hulianui/ui 消费者的包里。
export { Formula } from "./math";
export { formulaToPlain } from "./math.parse";
export type { FormulaProps } from "./math.types";
export { splitBareMath, hasBareMath } from "./math.bare";
export type { BareSegment } from "./math.bare";
// 分隔符切分是解析层的公共纯函数，检索/导出链路会单独引它。
export { splitMathSegments, mathToPlain } from "./math.parse";
export type { MathSegment } from "./math.parse";

export { QuestionCard } from "../question-card/question-card";
export type {
  QuestionCardProps,
  QuestionKind,
  QuestionOption,
  QuestionIssue,
} from "../question-card/question-card.types";

// 题目域（类型 / 形状 / 切图 / wire 互转 / 答案文本 / 判分）。与 QuestionCard 同住此路径，
// 阶段 2–5 的 MathTextarea / QuestionEditor / QuestionAnswer 也从这里导出。
export * from "../question";
