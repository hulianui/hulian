// 题目域词条（QuestionCard / QuestionEditor / QuestionAnswer 与 answer-format 共用）。
//
// 为什么单独一个文件而不是直接从 config/locale.ts 取：@hulianui/ui/math 入口只该为 KaTeX 与
// 题目域自己付体积，而 locale.ts 是全库 390+ 组件的字典（28KB 原始体积）。answer-format 若
// import 那份 zhCN，整份字典就跟着进了 math 入口——locale-context 特意不引内置字典就是为了
// 避免这件事。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反过来引用本文件。
import type { QuestionType } from "./question.types";

export interface QuestionLocale {
  /** 七型名称，键必须齐（Record，不许 Partial）。 */
  types: Record<QuestionType, string>;
  answer: string;
  analysis: string;
  /** 判断题两个值的展示名。 */
  judgeTrue: string;
  judgeFalse: string;
  /** 多空答案的空号，如 (1) → "第1空："。单空不标。 */
  blankLabel: (index: number) => string;
  /** 多空之间的分隔，如 "；"。 */
  blankSeparator: string;
  /** 一空多种等价写法之间的分隔，如 " / "。 */
  alternativeSeparator: string;
  /** 多选 key 之间的分隔，如 "、"。 */
  choiceSeparator: string;
  /** 没有答案时的占位，如 "—"。 */
  empty: string;
  /** 分步给分：没有参考答案文本时的占位。 */
  seeRubric: string;
  rubricHeading: string;
  /** 得分点后缀，如 (2) → "（2 分）"。 */
  points: (score: number) => string;
}

export const QUESTION_LOCALE_ZH: QuestionLocale = {
  types: {
    single: "单选",
    multiple: "多选",
    judge: "判断",
    blank: "填空",
    short_answer: "简答",
    calculation: "计算",
    essay: "解答",
  },
  answer: "答案",
  analysis: "解析",
  judgeTrue: "正确",
  judgeFalse: "错误",
  blankLabel: (index) => `第${index}空：`,
  blankSeparator: "；",
  alternativeSeparator: " / ",
  choiceSeparator: "、",
  empty: "—",
  seeRubric: "见分步给分",
  rubricHeading: "分步给分：",
  points: (score) => `（${score} 分）`,
};

export const QUESTION_LOCALE_EN: QuestionLocale = {
  types: {
    single: "Single choice",
    multiple: "Multiple choice",
    judge: "True / false",
    blank: "Fill in the blank",
    short_answer: "Short answer",
    calculation: "Calculation",
    essay: "Extended response",
  },
  answer: "Answer",
  analysis: "Explanation",
  judgeTrue: "True",
  judgeFalse: "False",
  blankLabel: (index) => `Blank ${index}: `,
  blankSeparator: "; ",
  alternativeSeparator: " / ",
  choiceSeparator: ", ",
  empty: "—",
  seeRubric: "See rubric",
  rubricHeading: "Rubric:",
  points: (score) => ` (${score} pts)`,
};
