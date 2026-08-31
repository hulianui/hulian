// 客观题判分。**服务端才是判分 SSOT**——本函数用于即时反馈、录题期自测、以及给后端当参考实现。
//
// 三档：
//   1 精确（默认）：与 5069tk-app `services/grading.py::score_objective` 逐字同口径。
//   2 归一（options.normalize / options.tolerance）：比较前做「只减少误报、不抹掉真分歧」的归一，
//     规则来自消费方 `services/answer_comparison.py::canonical`，只收有实测样本的。
//   3 等价（options.equivalent）：注入比较器（math-field 提供基于 Compute Engine 的实现）。
// 后两档默认关着：库不能悄悄比服务端更宽松，否则学生端「答对」与成绩单「答错」打架。
import { isSubjective } from "./question-shape";
import type { Question, StudentAnswer } from "./question.types";

export interface GradeOptions {
  /** 第 2 档：比较前做表示层归一（剥 $、全角→半角、Unicode 符号→LaTeX、剥单 token 分组花括号、折叠分隔符、统一大小写）。 */
  normalize?: boolean;
  /** 第 2 档：两侧都能解析成数时按绝对误差比；0 表示数值相等即可（`0.5` 与 `\frac{1}{2}`）。 */
  tolerance?: number;
  /** 第 3 档：前两档都不等时调用；抛错按不等价处理。 */
  equivalent?: (answer: string, student: string) => boolean;
}

export interface GradeResult {
  /** 主观题为 null（等人工），不是 false。 */
  correct: boolean | null;
  score: number;
}

type Raw = StudentAnswer | boolean | null | undefined | Question["answer"];

// ---- 第 1 档：与 score_objective 同口径 --------------------------------------------------

/** 判断题作答的等价写法。刻意不收 A / B：答题卡用 A 表示「对」是学校自己的约定。 */
export const JUDGE_TRUE: ReadonlySet<string> = new Set(["true", "t", "1", "正确", "对", "是", "√", "✓"]);
export const JUDGE_FALSE: ReadonlySet<string> = new Set(["false", "f", "0", "错误", "错", "否", "×", "✗", "x"]);

function judgeValue(raw: Raw): boolean | null {
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "string") {
    const token = raw.trim().toLowerCase();
    if (JUDGE_TRUE.has(token)) return true;
    if (JUDGE_FALSE.has(token)) return false;
  }
  return null;
}

function judgeMatches(correct: Raw, student: Raw): boolean {
  const left = judgeValue(correct);
  const right = judgeValue(student);
  if (left === null || right === null) return sameLiteral(correct, student);
  return left === right;
}

function sameLiteral(a: Raw, b: Raw): boolean {
  if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a) === JSON.stringify(b);
  return a === b;
}

/** 学生把多个空写在一个字符串里时的分隔符（答题卡识别 / 老客户端）。正式路径是逐空数组。 */
const BLANK_SPLIT = /[,，;；\n]+/;

function splitBlanks(student: string, expected: number): string[] | null {
  if (expected === 1) return [student];
  const parts = student
    .split(BLANK_SPLIT)
    .map((p) => p.trim())
    .filter((p) => p !== "");
  return parts.length === expected ? parts : null;
}

type Comparator = (answer: string, student: string) => boolean;

function cellMatches(cell: unknown, given: unknown, eq: Comparator): boolean {
  const text = String(given).trim();
  if (Array.isArray(cell)) return cell.some((alt) => eq(String(alt).trim(), text));
  return eq(String(cell).trim(), text);
}

function blankMatches(correct: Raw, student: Raw, eq: Comparator): boolean {
  if (Array.isArray(correct)) {
    let given: unknown[] | null;
    if (Array.isArray(student)) given = student;
    else if (typeof student === "string") given = splitBlanks(student, correct.length);
    else given = null;
    if (given === null || given.length !== correct.length) return false;
    return correct.every((c, i) => cellMatches(c, given![i], eq));
  }
  if (Array.isArray(student)) {
    if (student.length !== 1) return false;
    return eq(String(correct).trim(), String(student[0]).trim());
  }
  if (student === null || student === undefined) return false;
  return eq(String(correct).trim(), String(student).trim());
}

function multipleMatches(correct: Raw, student: Raw, eq: Comparator): boolean {
  if (!Array.isArray(correct) || !Array.isArray(student)) return false;
  const a = [...new Set(correct.map(String))].sort();
  const b = [...new Set(student.map(String))].sort();
  return a.length === b.length && a.every((v, i) => eq(v, b[i]));
}

// ---- 第 2 档：归一 ------------------------------------------------------------------------

const ANSWER_IMAGE = /!\[([^\]]*)\]\((?:import\/(?:formula\/)?[0-9a-f]+\.\w+)\)/g;

/** Unicode 数学符号 → LaTeX。命令类替换值末尾留空格（命令名终止符），随后被分隔符折叠吃掉。 */
const UNICODE_TO_LATEX: Record<string, string> = {
  "×": "\\times ",
  "÷": "\\div ",
  "·": "\\cdot ",
  "∙": "\\cdot ",
  "√": "\\sqrt ",
  "→": "\\rightarrow ",
  "↑": "\\uparrow ",
  "∴": "\\therefore ",
  "∵": "\\because ",
  "∠": "\\angle ",
  "∥": "\\parallel ",
  "⊥": "\\perp ",
  "△": "\\triangle ",
  "≤": "\\leq ",
  "≥": "\\geq ",
  "≠": "\\neq ",
  "°": "^\\circ ",
  "℃": "^\\circ C",
  "π": "\\pi ",
  "α": "\\alpha ",
  "β": "\\beta ",
  "θ": "\\theta ",
  "ρ": "\\rho ",
  "ν": "\\nu ",
  "Ω": "\\Omega ",
  "Δ": "\\Delta ",
  "²": "^2",
  "³": "^3",
  "⁴": "^4",
  "⁶": "^6",
  "⁻": "^-",
  "₂": "_2",
  "∶": ":",
  "﹣": "-",
};

/** 包裹单个 token 的花括号：`\sqrt{3}` ≡ `\sqrt3`。内容类排除 `\`，于是集合的 `\{a\}` 匹配不上。 */
const GROUPING_BRACES = /(?<!\\)\{(\\[a-zA-Z]+|[^{}\\])\}/g;
/** 分隔符：空白 + 句读。不含 `.`（小数点）与 `!`（阶乘）。 */
const SEPARATORS = /[\s,;:、。]+/g;
/** 折叠分隔符时留在两个数字之间的哨兵：吃掉写法差异（`1、2` vs `1，2`），但不让两个数粘成一个数（`12`）。 */
const SENTINEL = "\x1f";

function toHalfwidth(text: string): string {
  let out = "";
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (code >= 0xff01 && code <= 0xff5e) out += String.fromCodePoint(code - 0xfee0);
    else if (code === 0x3000) out += " ";
    else out += ch;
  }
  return out;
}

function dropGroupingBraces(text: string): string {
  let previous = "";
  let current = text;
  while (previous !== current) {
    previous = current;
    current = current.replace(GROUPING_BRACES, "$1");
  }
  return current;
}

function foldSeparators(text: string): string {
  return text.replace(SEPARATORS, (match, offset: number) => {
    const before = offset > 0 ? text[offset - 1] : "";
    const after = text[offset + match.length] ?? "";
    return /\d/.test(before) && /\d/.test(after) ? SENTINEL : "";
  });
}

/** 一个答案的可比较形。七步顺序不能换：剥图片壳 → 全角转半角 → Unicode→LaTeX → 去 $ → 剥分组花括号 → 折叠分隔符 → 大写。 */
export function canonicalAnswer(value: unknown): string {
  let text = String(value).replace(ANSWER_IMAGE, "$1");
  text = toHalfwidth(text);
  text = [...text].map((ch) => UNICODE_TO_LATEX[ch] ?? ch).join("");
  text = text.replace(/\$/g, "");
  text = dropGroupingBraces(text);
  return foldSeparators(text).toUpperCase();
}

/** 把一段文本解析成数：十进制、`\frac{a}{b}`、`a/b`、百分数、末尾 ° / ^\circ；解析不了回 null。 */
export function parseNumeric(text: string): number | null {
  let s = text.replace(/\$/g, "").replace(/\s+/g, "");
  if (s === "") return null;
  s = s.replace(/\^\\circ$/, "").replace(/°$/, "");
  let scale = 1;
  if (s.endsWith("%")) {
    scale = 0.01;
    s = s.slice(0, -1);
  }
  const frac = /^(-?)\\frac\{(-?\d+(?:\.\d+)?)\}\{(-?\d+(?:\.\d+)?)\}$/.exec(s);
  if (frac) {
    const value = (Number(frac[2]) / Number(frac[3])) * (frac[1] === "-" ? -1 : 1);
    return Number.isFinite(value) ? value * scale : null;
  }
  const slash = /^(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)$/.exec(s);
  if (slash) {
    const value = Number(slash[1]) / Number(slash[2]);
    return Number.isFinite(value) ? value * scale : null;
  }
  if (/^-?\d+(?:\.\d+)?$/.test(s)) return Number(s) * scale;
  return null;
}

function buildComparator(options: GradeOptions | undefined): Comparator {
  const exact: Comparator = (a, b) => a === b;
  if (!options) return exact;
  const { normalize, tolerance, equivalent } = options;
  return (a, b) => {
    if (a === b) return true;
    if (normalize && canonicalAnswer(a) === canonicalAnswer(b)) return true;
    if (tolerance !== undefined) {
      const x = parseNumeric(a);
      const y = parseNumeric(b);
      if (x !== null && y !== null && Math.abs(x - y) <= tolerance) return true;
    }
    if (equivalent) {
      try {
        if (equivalent(a, b)) return true;
      } catch {
        /* 比较器炸了按不等价处理 */
      }
    }
    return false;
  };
}

/** 客观题判分。主观题回 `{ correct: null, score: 0 }`。 */
export function gradeObjective(
  question: Pick<Question, "type" | "answer" | "score">,
  student: StudentAnswer | boolean | null | undefined,
  options?: GradeOptions,
): GradeResult {
  const { type, answer: correct, score } = question;
  if (isSubjective(type)) return { correct: null, score: 0 };
  const eq = buildComparator(options);
  let ok: boolean;
  if (type === "multiple") ok = multipleMatches(correct, student, eq);
  else if (type === "blank") ok = blankMatches(correct, student, eq);
  else if (type === "judge") ok = judgeMatches(correct, student);
  else ok = typeof correct === "string" && typeof student === "string" ? eq(correct, student) : sameLiteral(correct, student);
  return { correct: ok, score: ok ? score : 0 };
}
