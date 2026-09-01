// 学生「怎么答一道题」的判据——全部是纯函数，组件只管按 kind 渲染。
//
// 这些判据的每一条都对应消费方踩过的一个静默 bug（页面不报错、控制台干净、学生只是答不了）：
//   · 判断题掉进「从 options 取选项」的分支 → 一个选项都没有的单选组（answerKind 先判题型）
//   · 多空填空只给一个输入框，而判分逐空比对 → 一道多空题都做不对（resolveBlankCount + blankValues）
//   · 对象形 options 被 typeof o === "string" 滤成空 → 96 道选择题一道都选不了（走 normalizeOptions）
import { blankCount as stemBlankCount, normalizeOptions } from "../question/question-shape";
import { decodeBlanks } from "../question/question-wire";
import { QUESTION_TYPES, type QuestionType, type StudentAnswer } from "../question/question.types";
import type { AnswerableQuestion } from "./question-answer.types";

/** 作答控件的种类。`unanswerable` 是选择题选项没入库的兜底：明说做不了，不摆一个点不动的空单选组。 */
export type AnswerKind = "single" | "multiple" | "judge" | "blank" | "subjective" | "unanswerable";

export function isKnownQuestionType(type: string): type is QuestionType {
  return (QUESTION_TYPES as readonly string[]).includes(type);
}

/** 这道题该用哪种作答控件。先按题型分派，再看选项——判断题的 options 本来就是 null。未知题型按主观题只读。 */
export function answerKind(question: Pick<AnswerableQuestion, "type" | "options">): AnswerKind {
  const { type } = question;
  if (type === "judge") return "judge";
  if (type === "blank") return "blank";
  if (type === "single" || type === "multiple") {
    // `type` 的类型带 `string & {}`，等值判断收窄不了，显式落回字面量
    const kind: AnswerKind = type === "single" ? "single" : "multiple";
    return normalizeOptions(question.options).length > 0 ? kind : "unanswerable";
  }
  return "subjective";
}

/** 这道填空题该给几个输入框：服务端给的 `blankCount` 优先，其次题干里 `____` 的个数，都没有按 1，绝不猜。 */
export function resolveBlankCount(question: Pick<AnswerableQuestion, "stem" | "blankCount">): number {
  const given = question.blankCount;
  if (typeof given === "number" && Number.isInteger(given) && given > 0) return given;
  const counted = stemBlankCount(question.stem);
  return counted > 0 ? counted : 1;
}

/** 这份作答能不能交。多空题每个空都要填了才让交：判分是全对才对，交一半只会拿回一个说不清为什么的「回答错误」。 */
export function canSubmit(answer: StudentAnswer | undefined): boolean {
  if (answer === undefined) return false;
  if (Array.isArray(answer)) return answer.length > 0 && answer.every((part) => part.trim() !== "");
  return answer.trim() !== "";
}

/** 把 value 归一成「每空一项」：数组按空数补齐 / 截断；字符串按服务端记录解开（续做）。 */
export function blankValues(value: StudentAnswer | undefined, count: number): string[] {
  if (Array.isArray(value)) return Array.from({ length: count }, (_, i) => value[i] ?? "");
  return decodeBlanks(value, count);
}

export function setBlank(values: string[], index: number, text: string): string[] {
  return values.map((v, i) => (i === index ? text : v));
}

/** 多选的 key 数组。历史数据 / 服务端记录里的 `"A,C"` 串也认。 */
export function choiceKeys(value: StudentAnswer | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value !== "") return value.split(/[,，\s]+/).filter(Boolean);
  return [];
}

/** 单选 / 判断的值。数组不是这两型的合法作答，按没选处理。 */
export function choiceKey(value: StudentAnswer | undefined): string {
  return typeof value === "string" ? value : "";
}

/** 当前作答的规范形。提交与 canSubmit 都用它，不用原始 value：原始 value 可能是续做时的服务端字符串。 */
export function currentAnswer(kind: AnswerKind, value: StudentAnswer | undefined, blanks: number): StudentAnswer {
  if (kind === "blank") return blankValues(value, blanks);
  if (kind === "multiple") return choiceKeys(value);
  return choiceKey(value);
}
