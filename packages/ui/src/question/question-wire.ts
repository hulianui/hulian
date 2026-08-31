// 编辑器 / 作答卡内部只认一种形状（question.types.ts）；消费方后端与历史数据有若干变体
// （单空压成字符串、多选 "A,C" 串、判断 "true" 串、字符串形 options）。互转全部收口在这里，
// 组件里不再出现 typeof 分支。
import { normalizeOptions } from "./question-shape";
import type { Question, QuestionAnswer, QuestionType } from "./question.types";

/** 逐空作答 → 提交形：单空交字符串（交 `["90"]` 会被原样存成 JSON 字面量），多空交数组。 */
export function encodeBlanks(blanks: string[]): string | string[] {
  return blanks.length === 1 ? blanks[0] : blanks;
}

/**
 * 服务端记下的作答 → 每个空的文字。多空存的是 JSON 数组字面量，单空是裸字符串。
 * 单空**不解析 JSON**：区间 `[1,2]` 是完全正常的数学答案，解析一下就拆成两个空了。
 * 解析失败回落成「整串进第一个空」——至少还是学生写过的东西。
 */
export function decodeBlanks(raw: string | null | undefined, count: number): string[] {
  const slots = Array.from({ length: count }, () => "");
  if (!raw) return slots;
  if (count === 1) return [raw];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (let i = 0; i < count; i++) slots[i] = String(parsed[i] ?? "");
      return slots;
    }
  } catch {
    /* 不是 JSON，往下回落 */
  }
  slots[0] = raw;
  return slots;
}

/** 编辑器规范形 → 消费方后端形：填空「单空且单写法」压回字符串，其余原样。 */
export function toWireAnswer(q: Pick<Question, "type" | "answer">): QuestionAnswer {
  if (q.type === "blank" && Array.isArray(q.answer) && q.answer.length === 1) {
    const only = q.answer[0];
    if (typeof only === "string") return only;
  }
  return q.answer;
}

const JUDGE_TRUE = new Set(["true", "t", "1", "正确", "对", "是", "√", "✓"]);
const JUDGE_FALSE = new Set(["false", "f", "0", "错误", "错", "否", "×", "✗", "x"]);

/** 消费方后端形 / 历史变体 → 编辑器规范形。 */
export function fromWire(input: {
  type: QuestionType;
  options?: unknown;
  answer?: unknown;
}): Pick<Question, "type" | "options" | "answer"> {
  const { type } = input;
  const answer = input.answer;
  if (type === "single" || type === "multiple") {
    const options = normalizeOptions(input.options);
    if (type === "single") {
      return { type, options, answer: typeof answer === "string" ? answer : "" };
    }
    const keys = Array.isArray(answer)
      ? answer.map(String)
      : typeof answer === "string" && answer !== ""
        ? answer.split(/[,，\s]+/).filter(Boolean)
        : [];
    return { type, options, answer: keys };
  }
  if (type === "judge") {
    if (typeof answer === "boolean") return { type, options: null, answer };
    if (typeof answer === "string") {
      const token = answer.trim().toLowerCase();
      if (JUDGE_TRUE.has(token)) return { type, options: null, answer: true };
      if (JUDGE_FALSE.has(token)) return { type, options: null, answer: false };
      return { type, options: null, answer };
    }
    return { type, options: null, answer: true };
  }
  if (type === "blank") {
    if (Array.isArray(answer)) return { type, options: null, answer: answer as Question["answer"] };
    if (typeof answer === "string" && answer !== "") return { type, options: null, answer: [answer] };
    return { type, options: null, answer: [""] };
  }
  // 主观题：文本 / Rubric 原样，缺省 null
  if (answer === undefined) return { type, options: null, answer: null };
  return { type, options: null, answer: answer as Question["answer"] };
}
