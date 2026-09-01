// 「一道题」的领域类型。与首个消费方 5069tk-app 的后端契约逐字对齐
// （api/app/schemas/questions.py::_check_type_shape），库不另造第二套形状。
//
// 这里只有类型与一个常量数组，没有 React、没有 KaTeX：阶段 2–5 的编辑器 / 作答卡 /
// 判分器全部 import 这一份，消费方的 wire 层也 import 这一份。

/** 题型是受控枚举（新增一型 = 写代码：默认形状、校验、编辑器分支、作答分支、判分分支）。 */
export type QuestionType =
  | "single"
  | "multiple"
  | "judge"
  | "blank"
  | "short_answer"
  | "calculation"
  | "essay";

/** 展示顺序 = 消费方枚举顺序。每一处按题型分派的表都用 `Record<QuestionType, …>` 钉全。 */
export const QUESTION_TYPES: readonly QuestionType[] = [
  "single",
  "multiple",
  "judge",
  "blank",
  "short_answer",
  "calculation",
  "essay",
];

/** 选择题选项。`key` 是提交给判分的值（A–H），`text` 是正文（支持 LaTeX 记号）。 */
export interface QuestionOption {
  key: string;
  text: string;
}

/** 一个空的答案：一种写法，或多种等价写法（`["150", "150°"]` 命中任一即对）。 */
export type BlankAnswer = string | string[];

/** 分步给分：参考答案 + 逐条得分点（calculation / essay 可用）。 */
export interface Rubric {
  reference: string;
  rubric: { point: string; score?: number }[];
}

/**
 * 答案的全部合法形状（按题型各取其一）：
 * - single：选项 key 字符串
 * - multiple：key 数组（≥ 2）
 * - judge：布尔
 * - blank：外层每项一个空（编辑器内部单空也用一项数组；出口按消费方需要压平见 question-wire）
 * - short_answer / calculation / essay：参考答案文本、Rubric，或 null（允许暂无）
 */
export type QuestionAnswerValue = string | string[] | boolean | BlankAnswer[] | Rubric | null;

/** 质量标记：题目从文档拆出来时发现的可疑点（QuestionCard 亮左侧边条）。 */
export interface QuestionIssue {
  label: string;
  tone?: "warning" | "danger" | "neutral";
}

export interface Question {
  type: QuestionType;
  /** 题干：含 `$…$` 公式与 `![](figure-key)` 图片引用的字符串。 */
  stem: string;
  /** 仅 single / multiple 非 null。 */
  options: QuestionOption[] | null;
  answer: QuestionAnswerValue;
  analysis: string;
  /** 1–5 */
  difficulty: number;
  score: number;
  estimatedMinutes?: number;
}

/** 学生作答：blank 为逐空数组，其余为字符串；judge 为 "true" | "false"。 */
export type StudentAnswer = string | string[];

/** 结构校验问题。`code` 是机器码，文案由消费层按 Locale 翻译（阶段 3 的编辑器负责）。 */
export type QuestionValidationCode =
  | "stem_empty"
  | "options_too_few"
  | "options_too_many"
  | "option_empty"
  | "options_forbidden"
  | "answer_out_of_range"
  | "multiple_answer_too_few"
  | "judge_not_boolean"
  | "blank_empty"
  | "blank_count_mismatch"
  | "subjective_answer_shape"
  | "difficulty_range"
  | "score_negative";

export interface QuestionValidationIssue {
  field: "stem" | "options" | "answer" | "difficulty" | "score";
  code: QuestionValidationCode;
  /** 附加信息（如空数不匹配时的 `{ expected, actual }`），给文案插值用。 */
  detail?: Record<string, number | string>;
}
