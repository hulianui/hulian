// 题型驱动的形状规则：默认值、选项归一、空数、结构校验。全部是纯函数，无 React。
// 口径与 5069tk-app 后端 `_check_type_shape` 同构，外加三条前端才该拦的（空选项、
// 空数不匹配、超过 8 个选项）——都是后端规则的真子集，不会误拦合法数据。
import {
  QUESTION_TYPES,
  type Question,
  type QuestionAnswer,
  type QuestionOption,
  type QuestionType,
  type QuestionValidationIssue,
  type Rubric,
} from "./question.types";

/** 要人来判的题型。判分回 `correct: null`，统计要把它们排除在正确率之外。 */
export const SUBJECTIVE_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>([
  "short_answer",
  "calculation",
  "essay",
]);

export function isSubjective(type: QuestionType): boolean {
  return SUBJECTIVE_TYPES.has(type);
}

/** 题目没有分值来源时按题型给的默认分（与消费方 DEFAULT_SCORE_BY_TYPE 一致）。 */
export const DEFAULT_SCORE_BY_TYPE: Record<QuestionType, number> = {
  single: 3,
  multiple: 4,
  judge: 3,
  blank: 4,
  short_answer: 5,
  calculation: 8,
  essay: 8,
};

export const MAX_OPTIONS = 8;

/** 第 n 个选项的字母：0 → A。与消费方 `_letters_for` 同构。 */
export function optionKey(index: number): string {
  return String.fromCharCode(65 + index);
}

/** 切题型时 options 与 answer 必须**同时**重置，否则造出「judge 带 options」这类后端 422 的值。 */
export function defaultShape(type: QuestionType): Pick<Question, "options" | "answer"> {
  const table: Record<QuestionType, () => Pick<Question, "options" | "answer">> = {
    single: () => ({ options: [{ key: "A", text: "" }, { key: "B", text: "" }], answer: "" }),
    multiple: () => ({ options: [{ key: "A", text: "" }, { key: "B", text: "" }], answer: [] }),
    judge: () => ({ options: null, answer: true }),
    blank: () => ({ options: null, answer: [""] }),
    short_answer: () => ({ options: null, answer: "" }),
    calculation: () => ({ options: null, answer: "" }),
    essay: () => ({ options: null, answer: "" }),
  };
  return table[type]();
}

export function emptyQuestion(type: QuestionType = "single"): Question {
  return {
    type,
    stem: "",
    ...defaultShape(type),
    analysis: "",
    difficulty: 3,
    score: DEFAULT_SCORE_BY_TYPE[type],
  };
}

/** 字符串形选项里的字母前缀。分隔符四种全收：`A. ` / `A、` / `A．` / `A：`。 */
const LABELLED = /^([A-H])[.、．:：]\s*(.*)$/;

/**
 * 把 options 的三种历史形状归一成 `{ key, text }`：
 *   [{"key":"A","text":"50°"}]   对象形（导入 / AI 拆题主流）
 *   ["A. 甲", "B. 乙"]            字符串形，字母写在正文里（以它自己写的为准，不按下标推）
 *   ["60°", "-8a⁶b³"]            字符串形无前缀，字母按下标补
 * `key` 是要提交给判分的值：无前缀时**不能**取整串首字符（"60°" 会提交 "6"，永远判错）。
 */
export function normalizeOptions(raw: unknown): QuestionOption[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((item, index): QuestionOption => {
    if (typeof item === "string") {
      const matched = LABELLED.exec(item);
      if (matched) return { key: matched[1], text: matched[2] };
      return { key: optionKey(index), text: item };
    }
    if (item !== null && typeof item === "object") {
      const o = item as { key?: unknown; text?: unknown };
      return {
        key: typeof o.key === "string" && o.key !== "" ? o.key : optionKey(index),
        // text 不是字符串时回退 JSON 字面量：难看，但能看出哪里坏了，比 [object Object] 强。
        text: typeof o.text === "string" ? o.text : JSON.stringify(item),
      };
    }
    return { key: optionKey(index), text: String(item) };
  });
}

/** 题干里的填空槽个数：≥2 个连续下划线算一个空（与 Formula 的填空槽判据一致），单个 `_` 是下标。 */
export function blankCount(stem: string): number {
  return (stem.match(/_{2,}/g) ?? []).length;
}

function isRubric(value: unknown): value is Rubric {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof (value as Rubric).reference === "string" &&
    Array.isArray((value as Rubric).rubric)
  );
}

function validateBlankAnswer(answer: QuestionAnswer, stem: string): QuestionValidationIssue[] {
  if (!Array.isArray(answer) || answer.length === 0) {
    return [{ field: "answer", code: "blank_empty" }];
  }
  const cellOk = (cell: unknown): boolean =>
    typeof cell === "string"
      ? cell.trim() !== ""
      : Array.isArray(cell) && cell.length > 0 && cell.every((v) => typeof v === "string" && v.trim() !== "");
  if (!answer.every(cellOk)) return [{ field: "answer", code: "blank_empty" }];
  const expected = blankCount(stem);
  // 题干没写下划线的老数据不比空数：那是数据风格，不是错误。
  if (expected > 0 && expected !== answer.length) {
    return [
      { field: "answer", code: "blank_count_mismatch", detail: { expected, actual: answer.length } },
    ];
  }
  return [];
}

/**
 * 结构校验。返回的每条只带机器码与插值信息，文案由消费层按 Locale 翻译。
 * 与后端 `_check_type_shape` 同构，多拦三条前端才该拦的：空选项文本、选项超过 8 个、空数不匹配。
 */
export function validateQuestion(q: Question): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = [];
  if (q.stem.trim() === "") issues.push({ field: "stem", code: "stem_empty" });
  if (!(q.difficulty >= 1 && q.difficulty <= 5)) issues.push({ field: "difficulty", code: "difficulty_range" });
  if (q.score < 0) issues.push({ field: "score", code: "score_negative" });

  const { type, options, answer } = q;
  if (type === "single" || type === "multiple") {
    if (!options || options.length < 2) {
      issues.push({ field: "options", code: "options_too_few" });
      return issues;
    }
    if (options.length > MAX_OPTIONS) issues.push({ field: "options", code: "options_too_many" });
    for (const opt of options) {
      if (opt.text.trim() === "") issues.push({ field: "options", code: "option_empty", detail: { key: opt.key } });
    }
    const keys = new Set(options.map((o) => o.key));
    if (type === "single") {
      if (typeof answer !== "string" || !keys.has(answer)) issues.push({ field: "answer", code: "answer_out_of_range" });
    } else if (!Array.isArray(answer) || answer.length < 2) {
      issues.push({ field: "answer", code: "multiple_answer_too_few" });
    } else if (!answer.every((a) => typeof a === "string" && keys.has(a))) {
      issues.push({ field: "answer", code: "answer_out_of_range" });
    }
    return issues;
  }

  if (options !== null) issues.push({ field: "options", code: "options_forbidden" });

  if (type === "judge") {
    if (typeof answer !== "boolean") issues.push({ field: "answer", code: "judge_not_boolean" });
    return issues;
  }
  if (type === "blank") {
    issues.push(...validateBlankAnswer(answer, q.stem));
    return issues;
  }
  // 主观题：允许 null / 文本 / Rubric；拒绝选择题与判断题的形状（AI 拆题最常串型）。
  if (answer === null || typeof answer === "string" || isRubric(answer)) return issues;
  issues.push({ field: "answer", code: "subjective_answer_shape" });
  return issues;
}

/** 供 `Record<QuestionType, …>` 之外的地方遍历（编辑器题型选择、测试）。 */
export { QUESTION_TYPES };
