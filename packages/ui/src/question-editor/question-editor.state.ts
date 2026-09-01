// QuestionEditor 的状态变换，全部是纯函数：输入一份 Question，输出下一份。组件里只剩
// 「哪个控件调哪个函数」；选项重排后答案跟不跟、删空之后等价写法怎么收、题图块怎么拆合，
// 都在这里可以用表驱动测清楚。不引 React、不引 KaTeX、不产出文案。
import { validateFormulaSyntax, type FormulaSyntaxIssue } from "../math-textarea/formula-editing";
import { formulaToPlain } from "../math/math.parse";
import {
  blankCount,
  DEFAULT_SCORE_BY_TYPE,
  defaultShape,
  MAX_OPTIONS,
  optionKey,
} from "../question/question-shape";
import { stemFigureKeys, stripStemFigures } from "../question/question-stem";
import type {
  BlankAnswer,
  Question,
  QuestionAnswer,
  QuestionOption,
  QuestionType,
  QuestionValidationIssue,
  Rubric,
} from "../question/question.types";
import type { EditorField } from "./question-editor.types";

// ---------------------------------------------------------------------------
// 题型
// ---------------------------------------------------------------------------

export function scoreDefaults(
  overrides?: Partial<Record<QuestionType, number>>,
): Record<QuestionType, number> {
  return { ...DEFAULT_SCORE_BY_TYPE, ...overrides };
}

/** 切题型会不会丢内容：选项有文字，或答案不等于该题型的空形状。 */
export function shapeIsDirty(q: Pick<Question, "type" | "options" | "answer">): boolean {
  const blank = defaultShape(q.type);
  const optionsDirty = (q.options ?? []).some((o) => o.text.trim() !== "");
  return optionsDirty || JSON.stringify(q.answer) !== JSON.stringify(blank.answer);
}

/**
 * 切题型：options 与 answer **同时**重置成新题型的空形状（否则会造出「judge 带 options」这类后端 422 的值）；
 * score 仍等于旧题型默认分时换成新默认分，改过的分保留。
 */
export function switchType(
  q: Question,
  type: QuestionType,
  defaults: Record<QuestionType, number> = DEFAULT_SCORE_BY_TYPE,
): Question {
  if (type === q.type) return q;
  const score = q.score === defaults[q.type] ? defaults[type] : q.score;
  return { ...q, type, ...defaultShape(type), score };
}

// ---------------------------------------------------------------------------
// 选项（key 永远按下标 A–H；答案存的是 key，所以增删移之后要重映射）
// ---------------------------------------------------------------------------

function rekey(options: QuestionOption[]): QuestionOption[] {
  return options.map((o, i) => ({ key: optionKey(i), text: o.text }));
}

/** 按「旧 key → 新 key」表重映射选择题答案；表里没有的 key（被删的）丢掉。 */
function remapChoiceAnswer(answer: QuestionAnswer, map: ReadonlyMap<string, string>): QuestionAnswer {
  if (typeof answer === "string") return map.get(answer) ?? "";
  if (Array.isArray(answer)) {
    const next: string[] = [];
    for (const k of answer) {
      const mapped = typeof k === "string" ? map.get(k) : undefined;
      if (mapped !== undefined) next.push(mapped);
    }
    return next.sort();
  }
  return answer;
}

export function setOptionText(q: Question, index: number, text: string): Question {
  const options = q.options ?? [];
  return { ...q, options: options.map((o, i) => (i === index ? { ...o, text } : o)) };
}

export function addOption(q: Question): Question {
  const options = q.options ?? [];
  if (options.length >= MAX_OPTIONS) return q;
  return { ...q, options: rekey([...options, { key: "", text: "" }]) };
}

/** 删一项：它之后的字母整体前移，答案里指向被删项的清掉、指向后面项的跟着前移（消费方原来一律清掉，等于逼人重选）。 */
export function removeOption(q: Question, index: number): Question {
  const options = q.options ?? [];
  if (options.length <= 2 || index < 0 || index >= options.length) return q;
  const map = new Map<string, string>();
  options.forEach((o, i) => {
    if (i !== index) map.set(o.key, optionKey(i < index ? i : i - 1));
  });
  return {
    ...q,
    options: rekey(options.filter((_, i) => i !== index)),
    answer: remapChoiceAnswer(q.answer, map),
  };
}

/** 上下移：移动的是**内容**，字母按新位置重排，答案跟着内容走（原来选的是「丙」，丙挪到第一位答案就是 A）。 */
export function moveOption(q: Question, from: number, to: number): Question {
  const options = q.options ?? [];
  if (from === to || from < 0 || to < 0 || from >= options.length || to >= options.length) return q;
  const next = [...options];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  const map = new Map(next.map((o, i) => [o.key, optionKey(i)] as const));
  return { ...q, options: rekey(next), answer: remapChoiceAnswer(q.answer, map) };
}

const CAPTION_MAX = 20;

/** 正确答案控件上的标签：`A` 或 `A 选项文本前 20 字`。用朴素文本而不是 LaTeX 源码截断（截半个 `$…$` 会变成红字）。 */
export function optionCaption(key: string, text: string): string {
  const plain = formulaToPlain(text).replace(/\s+/g, " ").trim();
  if (plain === "") return key;
  const snippet = plain.length > CAPTION_MAX ? `${plain.slice(0, CAPTION_MAX)}…` : plain;
  return `${key} ${snippet}`;
}

// ---------------------------------------------------------------------------
// 填空（外层每项一个空；一个空是一种写法（字符串）或多种等价写法（数组））
// ---------------------------------------------------------------------------

export function blankCells(answer: QuestionAnswer): BlankAnswer[] {
  return Array.isArray(answer) && answer.length > 0 ? (answer as BlankAnswer[]) : [""];
}

export function blankWritings(cell: BlankAnswer | undefined): string[] {
  if (cell === undefined) return [""];
  if (typeof cell === "string") return [cell];
  return cell.length > 0 ? cell : [""];
}

function packWritings(writings: string[]): BlankAnswer {
  return writings.length === 1 ? writings[0] : writings;
}

function withCells(q: Question, cells: BlankAnswer[]): Question {
  return { ...q, answer: cells };
}

export function setBlankWriting(q: Question, blank: number, writing: number, text: string): Question {
  return withCells(
    q,
    blankCells(q.answer).map((cell, i) => {
      if (i !== blank) return cell;
      return packWritings(blankWritings(cell).map((t, j) => (j === writing ? text : t)));
    }),
  );
}

export function addBlankWriting(q: Question, blank: number): Question {
  return withCells(
    q,
    blankCells(q.answer).map((cell, i) => (i === blank ? [...blankWritings(cell), ""] : cell)),
  );
}

export function removeBlankWriting(q: Question, blank: number, writing: number): Question {
  const cells = blankCells(q.answer);
  const writings = blankWritings(cells[blank]);
  if (writings.length <= 1) return q;
  return withCells(
    q,
    cells.map((cell, i) => (i === blank ? packWritings(writings.filter((_, j) => j !== writing)) : cell)),
  );
}

export function addBlank(q: Question): Question {
  return withCells(q, [...blankCells(q.answer), ""]);
}

export function removeBlank(q: Question, index: number): Question {
  const cells = blankCells(q.answer);
  if (cells.length <= 1) return q;
  return withCells(q, cells.filter((_, i) => i !== index));
}

/** 把答案项数对齐到题干的空数：多的截掉、少的补空串。不静默发生，只由「一键对齐」调用。 */
export function alignBlanks(q: Question, count: number): Question {
  const n = Math.max(1, count);
  const next = blankCells(q.answer).slice(0, n);
  while (next.length < n) next.push("");
  return withCells(q, next);
}

/** 题干写了 `____` 且数目与答案项数不同才算不匹配；题干没写空的老数据不比。 */
export function blankMismatch(
  q: Pick<Question, "stem" | "answer">,
): { expected: number; actual: number } | null {
  const expected = blankCount(q.stem);
  const actual = blankCells(q.answer).length;
  return expected > 0 && expected !== actual ? { expected, actual } : null;
}

// ---------------------------------------------------------------------------
// 主观题（参考答案文本 / 分步给分 Rubric / null）
// ---------------------------------------------------------------------------

export function isRubric(answer: QuestionAnswer): answer is Rubric {
  return (
    answer !== null &&
    typeof answer === "object" &&
    !Array.isArray(answer) &&
    Array.isArray((answer as Rubric).rubric)
  );
}

export function referenceText(answer: QuestionAnswer): string {
  if (typeof answer === "string") return answer;
  if (isRubric(answer)) return answer.reference;
  return "";
}

export function setReference(q: Question, text: string): Question {
  return { ...q, answer: isRubric(q.answer) ? { ...q.answer, reference: text } : text };
}

export function enableRubric(q: Question): Question {
  if (isRubric(q.answer)) return q;
  return { ...q, answer: { reference: referenceText(q.answer), rubric: [{ point: "" }] } };
}

export function disableRubric(q: Question): Question {
  if (!isRubric(q.answer)) return q;
  return { ...q, answer: q.answer.reference };
}

export function setRubricPoint(
  q: Question,
  index: number,
  patch: { point?: string; score?: number | undefined },
): Question {
  if (!isRubric(q.answer)) return q;
  const rubric = q.answer.rubric.map((row, i) => {
    if (i !== index) return row;
    const next = { ...row, ...patch };
    // `score: undefined` 是「清掉分值」：留着 undefined 键会让 JSON 与 toEqual 表现不一致。
    if (next.score === undefined) delete next.score;
    return next;
  });
  return { ...q, answer: { ...q.answer, rubric } };
}

export function addRubricPoint(q: Question): Question {
  if (!isRubric(q.answer)) return q;
  return { ...q, answer: { ...q.answer, rubric: [...q.answer.rubric, { point: "" }] } };
}

export function removeRubricPoint(q: Question, index: number): Question {
  if (!isRubric(q.answer) || q.answer.rubric.length <= 1) return q;
  return { ...q, answer: { ...q.answer, rubric: q.answer.rubric.filter((_, i) => i !== index) } };
}

export function rubricTotal(answer: QuestionAnswer): number {
  return isRubric(answer) ? answer.rubric.reduce((sum, row) => sum + (row.score ?? 0), 0) : 0;
}

// ---------------------------------------------------------------------------
// 题图：输入框只见正文，图以 `![](key)` 块写回题干末尾（所有渲染点都把图摆在正文之后，挪到末尾对显示无损）
// ---------------------------------------------------------------------------

export function stemFigures(stem: string): string[] {
  return stemFigureKeys(stem);
}

function figureBlock(keys: string[]): string {
  return keys.map((key) => `![](${key})`).join("\n");
}

export function joinStemFigures(body: string, keys: string[]): string {
  if (keys.length === 0) return body;
  const block = figureBlock(keys);
  return body.trim() === "" ? block : `${body}\n\n${block}`;
}

/**
 * 题干正文（不含图）。编辑器自己写回的形状是「正文 + 空行 + 图块」，能整块切掉就整块切，
 * 保住老师刚敲的换行；别的来源（导入线把图夹在正文里）退回通用剥离。
 */
export function stemBody(stem: string): string {
  const keys = stemFigureKeys(stem);
  if (keys.length === 0) return stem;
  const block = figureBlock(keys);
  if (stem === block) return "";
  const suffix = `\n\n${block}`;
  if (stem.endsWith(suffix)) return stem.slice(0, -suffix.length);
  return stripStemFigures(stem);
}

export function setStemBody(q: Question, body: string): Question {
  return { ...q, stem: joinStemFigures(body, stemFigures(q.stem)) };
}

/** 后端按内容哈希落盘，同一张图重传收敛成同一个 key：挂两遍只会印出两张一样的图。 */
export function addStemFigure(q: Question, key: string): Question {
  const keys = stemFigures(q.stem);
  if (keys.includes(key)) return q;
  return { ...q, stem: joinStemFigures(stemBody(q.stem), [...keys, key]) };
}

export function removeStemFigure(q: Question, key: string): Question {
  const keys = stemFigures(q.stem);
  if (!keys.includes(key)) return q;
  return {
    ...q,
    stem: joinStemFigures(
      stemBody(q.stem),
      keys.filter((k) => k !== key),
    ),
  };
}

// ---------------------------------------------------------------------------
// 其余
// ---------------------------------------------------------------------------

export function setEstimatedMinutes(q: Question, minutes: number | null): Question {
  if (minutes === null) {
    const { estimatedMinutes: _dropped, ...rest } = q;
    return rest;
  }
  return { ...q, estimatedMinutes: minutes };
}

/** 每个字段只留第一条：Field.error 一次只能挂一句。 */
export function issuesByField(
  issues: QuestionValidationIssue[],
): Partial<Record<EditorField, QuestionValidationIssue>> {
  const out: Partial<Record<EditorField, QuestionValidationIssue>> = {};
  for (const issue of issues) {
    if (out[issue.field] === undefined) out[issue.field] = issue;
  }
  return out;
}

export type FormulaField = "stem" | "options" | "answer" | "analysis";

/** 某个字段（选项按 key、填空与得分点按序号）的公式语法问题。 */
export interface QuestionFormulaIssue {
  field: FormulaField;
  key?: string;
  issue: FormulaSyntaxIssue;
}

/**
 * 逐字段跑 `validateFormulaSyntax`。编辑器内部每个 MathTextarea 已就地显示同一问题，
 * 这个函数是给页面的提交按钮用的：`$` 未闭合的题存进去会在题库详情、组卷、学生端、导出四处一起错。
 */
export function questionFormulaIssues(q: Question): QuestionFormulaIssue[] {
  const out: QuestionFormulaIssue[] = [];
  const check = (field: FormulaField, text: string, key?: string) => {
    const issue = validateFormulaSyntax(text);
    if (issue === null) return;
    out.push(key === undefined ? { field, issue } : { field, key, issue });
  };
  check("stem", q.stem);
  for (const option of q.options ?? []) check("options", option.text, option.key);
  const answer = q.answer;
  if (q.type === "blank") {
    blankCells(answer).forEach((cell, i) => {
      for (const writing of blankWritings(cell)) check("answer", writing, String(i + 1));
    });
  } else if (isRubric(answer)) {
    check("answer", answer.reference);
    answer.rubric.forEach((row, i) => check("answer", row.point, String(i + 1)));
  } else if (
    typeof answer === "string" &&
    (q.type === "short_answer" || q.type === "calculation" || q.type === "essay")
  ) {
    check("answer", answer);
  }
  check("analysis", q.analysis);
  return out;
}
