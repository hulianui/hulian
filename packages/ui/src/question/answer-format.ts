// 答案 JSON → 人能读的文本。**按形状分派而不是按题型**：题型与答案形状不保证一致
// （导入 / AI 拆题产出的数据没有这个保证），按形状分派不会因一条脏数据就印出 JSON 字面量。
// 题型只在「同一形状对应多种语义」时用得上：一维数组既可能是多选的 key 集，也可能是填空
// 的逐空答案——拿不到题型时按内层是否还是数组兜底（二维 = 逐空，一维 = 多选）。
import { QUESTION_LOCALE_ZH, type QuestionLocale } from "./question.locale";
import type { QuestionType } from "./question.types";

export { QUESTION_LOCALE_ZH };
export type { QuestionLocale };

function blankText(blanks: unknown[], L: QuestionLocale): string {
  return blanks
    .map((blank, i) => {
      const text = Array.isArray(blank) ? blank.map(String).join(L.alternativeSeparator) : String(blank);
      return blanks.length === 1 ? text : `${L.blankLabel(i + 1)}${text}`;
    })
    .join(L.blankSeparator);
}

function rubricLines(answer: Record<string, unknown>, L: QuestionLocale): string[] {
  const reference = answer.reference;
  const rubric = answer.rubric;
  if (typeof reference !== "string" && !Array.isArray(rubric)) {
    return [JSON.stringify(answer)];
  }
  const lines = [(typeof reference === "string" && reference.trim()) || L.seeRubric];
  if (Array.isArray(rubric) && rubric.length > 0) {
    lines.push(L.rubricHeading);
    for (const step of rubric) {
      if (step && typeof step === "object" && !Array.isArray(step)) {
        const { point, score } = step as { point?: unknown; score?: unknown };
        lines.push(typeof score === "number" ? `· ${point}${L.points(score)}` : `· ${point}`);
      } else {
        lines.push(`· ${step}`);
      }
    }
  }
  return lines;
}

/** 答案的若干行，第一行是主答案。 */
export function answerLines(
  answer: unknown,
  type?: QuestionType,
  labels: QuestionLocale = QUESTION_LOCALE_ZH,
): string[] {
  const L = labels;
  if (answer === null || answer === undefined || answer === "") return [L.empty];
  if (typeof answer === "boolean") return [answer ? L.judgeTrue : L.judgeFalse];
  if (typeof answer === "string") return [answer];
  if (typeof answer === "number") return [String(answer)];
  if (Array.isArray(answer)) {
    const nested = answer.some((x) => Array.isArray(x));
    if (type === "blank" || (type === undefined && nested)) return [blankText(answer, L)];
    return [answer.map(String).join(L.choiceSeparator)];
  }
  if (typeof answer === "object") return rubricLines(answer as Record<string, unknown>, L);
  return [String(answer)];
}

/** `answerLines` 的单行版。 */
export function answerText(
  answer: unknown,
  type?: QuestionType,
  labels: QuestionLocale = QUESTION_LOCALE_ZH,
): string {
  return answerLines(answer, type, labels).join(" ");
}
