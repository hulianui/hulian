# 数学题件 · 阶段 1：题目数据模型、纯函数、判分契约与 QuestionCard 迁移 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 `@hulianui/ui/math` 里落地「一道题」的类型、七个纯函数模块与跨语言判分契约，并把 `QuestionCard` 迁到新类型（`kind → type`，补答案/解析展示槽）。阶段 2–5（MathTextarea / QuestionEditor / QuestionAnswer / MathField）各自另写计划，全部消费本阶段产出的签名。

**Architecture:** 新目录 `packages/ui/src/question/` 只放纯 TypeScript 模块与 JSON fixture（无 React），每个文件一个职责；`QuestionCard` 保持 RSC 安全（无 hook），需要 Locale 的两个小块拆成 `"use client"` 叶子（与 `math/math-blank.tsx` 同一处方）。所有类型与判分口径逐字对齐 5069tk-app（`api/app/schemas/questions.py::_check_type_shape`、`api/app/services/grading.py::score_objective`），契约用 `grade.contract.json` 钉住。

**Tech Stack:** TypeScript 5.9 / React 19 / vitest（unit project = jsdom）/ Tailwind v4 / 既有 `Formula`（KaTeX）。

Spec：`docs/superpowers/specs/2026-08-31-math-question-authoring-design.md` §3、§6.2、§8。

## Global Constraints

- 目录名即 subpath：`question/` **不**作为对外 subpath 宣传，一切从 `@hulianui/ui/math`（`packages/ui/src/math/index.ts`）导出；主 barrel `packages/ui/src/index.ts` **一个都不加**。
- 七型枚举 `single | multiple | judge | blank | short_answer | calculation | essay`；所有按题型分派的表一律 `Record<QuestionType, …>`，禁止 `Partial`。
- 判分第 1 档必须与 `score_objective` 逐字同口径；第 2、3 档只在显式传 options 时启用。
- 组件文案走 Locale SSOT（`packages/ui/src/config/locale.ts` 的 `ComponentLocale` + `zhCN` / `enUS` 两份预设都要加，键必须齐）；`QuestionCard` 本体不加 hook，Locale 只在 `"use client"` 叶子里读。
- 开发期误用告警用 `warnOnce(key, message)`（`packages/ui/src/lib/warn-once.ts`），不裸写 `console.warn`。
- 测试文件命名 `*.test.ts(x)` 走 jsdom；本阶段没有布局断言，不写 browser test。
- 每个任务结束 `git add <具体文件>` 再 commit，不许 `git add -A`（工作区有其它会话的未提交改动）。commit message 末尾带：
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3`
- 跑测试的命令：`cd packages/ui && npx vitest run <path>`；typecheck：`pnpm --filter @hulianui/ui typecheck`。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `packages/ui/src/question/question.types.ts` | 题目域全部类型（无运行时代码） |
| `packages/ui/src/question/question-shape.ts` | 题型常量、默认形状、选项归一、空数统计、结构校验 |
| `packages/ui/src/question/question-stem.ts` | 题干先切图后排公式：`splitStemFigures` 等 |
| `packages/ui/src/question/stem-figures.contract.json` | 切图判据 fixture（复刻 5069tk `contracts/stem-figures.json`） |
| `packages/ui/src/question/question-wire.ts` | 与消费方后端形状互转：`toWireAnswer` / `fromWire` / `encodeBlanks` / `decodeBlanks` |
| `packages/ui/src/question/answer-format.ts` | 答案 → 人读文本：`answerLines` / `answerText` |
| `packages/ui/src/question/grade.ts` | `gradeObjective` 三档判分 + `canonicalAnswer` / `parseNumeric` |
| `packages/ui/src/question/grade.contract.json` | 判分跨语言 fixture |
| `packages/ui/src/question/index.ts` | 目录内 barrel（供 `math/index.ts` 转出） |
| `packages/ui/src/question/*.test.ts` | 每个模块一份表驱动测试 |
| `packages/ui/src/config/locale.ts` | 新增 `question` 词条（类型 + zhCN + enUS） |
| `packages/ui/src/question-card/question-card.types.ts` | 迁到新类型：`type` / `answer` / `analysis` / `showAnswer`，`kind` deprecated |
| `packages/ui/src/question-card/question-card.client.tsx` | `"use client"` 叶子：题型 Tag 与答案区（读 Locale） |
| `packages/ui/src/question-card/question-card.tsx` | 用新类型渲染，接叶子 |
| `packages/ui/src/question-card/question-card.md` / `.en.md` | Props 表与坑位更新 |
| `packages/ui/src/math/index.ts` | 转出 `question/` 公开件 |
| `.changeset/math-question-phase1.md` | minor changeset（中英段） |

---

### Task 1: 题目域类型 `question.types.ts`

**Files:**
- Create: `packages/ui/src/question/question.types.ts`
- Create: `packages/ui/src/question/question.types.test.ts`

**Interfaces:**
- Produces（后续所有任务与阶段 2–5 都消费）：`QuestionType`、`QUESTION_TYPES`、`QuestionOption { key; text }`、`BlankAnswer`、`Rubric`、`QuestionAnswer`、`Question`、`StudentAnswer`、`QuestionIssue`、`QuestionValidationIssue`。

- [ ] **Step 1: 写一条只做类型断言的测试（先失败于「模块不存在」）**

```ts
// packages/ui/src/question/question.types.test.ts
import { describe, expect, it } from "vitest";
import { QUESTION_TYPES, type Question, type QuestionType } from "./question.types";

describe("question.types", () => {
  it("QUESTION_TYPES 与消费方 QuestionType 枚举顺序逐字一致", () => {
    expect(QUESTION_TYPES).toEqual([
      "single",
      "multiple",
      "judge",
      "blank",
      "short_answer",
      "calculation",
      "essay",
    ]);
  });

  it("Question 的 answer 联合覆盖七型全部形状（编译期断言）", () => {
    const samples: Record<QuestionType, Question["answer"]> = {
      single: "C",
      multiple: ["B", "C"],
      judge: true,
      blank: [["150", "150°"], "30"],
      short_answer: "要点",
      calculation: { reference: "x=3", rubric: [{ point: "列式", score: 2 }] },
      essay: null,
    };
    expect(Object.keys(samples)).toHaveLength(7);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/question.types.test.ts`
Expected: FAIL，`Failed to resolve import "./question.types"`

- [ ] **Step 3: 写类型文件**

```ts
// packages/ui/src/question/question.types.ts
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
export type QuestionAnswer = string | string[] | boolean | BlankAnswer[] | Rubric | null;

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
  answer: QuestionAnswer;
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/question/question.types.test.ts`
Expected: PASS（2 tests）

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/question/question.types.ts packages/ui/src/question/question.types.test.ts
git commit -m "feat(ui/math): 题目域类型 question.types（七型枚举与答案形状对齐消费方契约）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 2: 题型常量、默认形状、选项归一、空数、结构校验 `question-shape.ts`

**Files:**
- Create: `packages/ui/src/question/question-shape.ts`
- Create: `packages/ui/src/question/question-shape.test.ts`

**Interfaces:**
- Consumes：Task 1 全部类型。
- Produces：
  - `SUBJECTIVE_TYPES: ReadonlySet<QuestionType>`、`isSubjective(type): boolean`
  - `DEFAULT_SCORE_BY_TYPE: Record<QuestionType, number>`
  - `optionKey(index: number): string`（0 → "A"）
  - `defaultShape(type): Pick<Question, "options" | "answer">`
  - `emptyQuestion(type?: QuestionType): Question`
  - `normalizeOptions(raw: unknown): QuestionOption[]`
  - `blankCount(stem: string): number`
  - `validateQuestion(q: Question): QuestionValidationIssue[]`

- [ ] **Step 1: 写表驱动测试**

```ts
// packages/ui/src/question/question-shape.test.ts
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCORE_BY_TYPE,
  SUBJECTIVE_TYPES,
  blankCount,
  defaultShape,
  emptyQuestion,
  isSubjective,
  normalizeOptions,
  optionKey,
  validateQuestion,
} from "./question-shape";
import { QUESTION_TYPES, type Question } from "./question.types";

describe("question-shape · 常量", () => {
  it("主观题名单 = short_answer / calculation / essay", () => {
    expect([...SUBJECTIVE_TYPES].sort()).toEqual(["calculation", "essay", "short_answer"]);
    expect(isSubjective("blank")).toBe(false);
    expect(isSubjective("essay")).toBe(true);
  });

  it("默认分七型齐全且与消费方一致", () => {
    expect(DEFAULT_SCORE_BY_TYPE).toEqual({
      single: 3,
      judge: 3,
      multiple: 4,
      blank: 4,
      short_answer: 5,
      calculation: 8,
      essay: 8,
    });
  });

  it("optionKey 按下标给字母", () => {
    expect([0, 1, 7].map(optionKey)).toEqual(["A", "B", "H"]);
  });
});

describe("question-shape · defaultShape", () => {
  it("七型各有一行且形状互不串", () => {
    expect(defaultShape("single")).toEqual({
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
      ],
      answer: "",
    });
    expect(defaultShape("multiple").answer).toEqual([]);
    expect(defaultShape("judge")).toEqual({ options: null, answer: true });
    expect(defaultShape("blank")).toEqual({ options: null, answer: [""] });
    for (const t of ["short_answer", "calculation", "essay"] as const) {
      expect(defaultShape(t)).toEqual({ options: null, answer: "" });
    }
  });

  it("emptyQuestion 带默认分与难度 3", () => {
    const q = emptyQuestion();
    expect(q.type).toBe("single");
    expect(q.score).toBe(3);
    expect(q.difficulty).toBe(3);
    expect(emptyQuestion("essay").score).toBe(8);
  });
});

describe("question-shape · normalizeOptions（三种历史形状全收）", () => {
  it("对象形 {key,text}", () => {
    expect(normalizeOptions([{ key: "A", text: "50°" }])).toEqual([{ key: "A", text: "50°" }]);
  });
  it("字符串形带字母前缀，四种分隔符，字母以自己写的为准", () => {
    expect(normalizeOptions(["B. 乙", "A、甲", "C．丙", "D：丁"])).toEqual([
      { key: "B", text: "乙" },
      { key: "A", text: "甲" },
      { key: "C", text: "丙" },
      { key: "D", text: "丁" },
    ]);
  });
  it("字符串形无前缀按下标补字母（不取整串首字符）", () => {
    expect(normalizeOptions(["60°", "-8a⁶b³"])).toEqual([
      { key: "A", text: "60°" },
      { key: "B", text: "-8a⁶b³" },
    ]);
  });
  it("对象形缺 key 按下标补；text 非字符串回退 JSON 字面量", () => {
    expect(normalizeOptions([{ text: "x" }, { key: "B", text: 1 }])).toEqual([
      { key: "A", text: "x" },
      { key: "B", text: '{"key":"B","text":1}' },
    ]);
  });
  it("非数组 / 空数组回 []", () => {
    expect(normalizeOptions(null)).toEqual([]);
    expect(normalizeOptions([])).toEqual([]);
    expect(normalizeOptions("A")).toEqual([]);
  });
});

describe("question-shape · blankCount", () => {
  it("数 ≥2 连续下划线的段数；$ 内外都算；单个 _ 不算", () => {
    expect(blankCount("a____b____")).toBe(2);
    expect(blankCount("$x_1 + ____ = 2$，则 y=____")).toBe(2);
    expect(blankCount("没有空")).toBe(0);
    expect(blankCount("__")).toBe(1);
  });
});

const base: Question = {
  type: "single",
  stem: "题干",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
  ],
  answer: "A",
  analysis: "",
  difficulty: 3,
  score: 3,
};

describe("question-shape · validateQuestion（与后端 _check_type_shape 同构）", () => {
  it("合法单选零问题", () => {
    expect(validateQuestion(base)).toEqual([]);
  });
  it("题干为空", () => {
    expect(validateQuestion({ ...base, stem: "  " })).toContainEqual({
      field: "stem",
      code: "stem_empty",
    });
  });
  it("选项不足 2 / 超过 8 / 有空选项", () => {
    expect(validateQuestion({ ...base, options: [{ key: "A", text: "甲" }] })).toContainEqual({
      field: "options",
      code: "options_too_few",
    });
    const nine = Array.from({ length: 9 }, (_, i) => ({ key: optionKey(i), text: "x" }));
    expect(validateQuestion({ ...base, options: nine })).toContainEqual({
      field: "options",
      code: "options_too_many",
    });
    expect(
      validateQuestion({ ...base, options: [{ key: "A", text: "甲" }, { key: "B", text: " " }] }),
    ).toContainEqual({ field: "options", code: "option_empty", detail: { key: "B" } });
  });
  it("单选答案越界；多选至少两项且都在范围内", () => {
    expect(validateQuestion({ ...base, answer: "C" })).toContainEqual({
      field: "answer",
      code: "answer_out_of_range",
    });
    expect(validateQuestion({ ...base, type: "multiple", answer: ["A"] })).toContainEqual({
      field: "answer",
      code: "multiple_answer_too_few",
    });
    expect(validateQuestion({ ...base, type: "multiple", answer: ["A", "Z"] })).toContainEqual({
      field: "answer",
      code: "answer_out_of_range",
    });
    expect(validateQuestion({ ...base, type: "multiple", answer: ["A", "B"] })).toEqual([]);
  });
  it("判断题不许有选项且答案必须布尔", () => {
    expect(validateQuestion({ ...base, type: "judge", answer: true })).toContainEqual({
      field: "options",
      code: "options_forbidden",
    });
    expect(validateQuestion({ ...base, type: "judge", options: null, answer: "true" })).toContainEqual(
      { field: "answer", code: "judge_not_boolean" },
    );
    expect(validateQuestion({ ...base, type: "judge", options: null, answer: false })).toEqual([]);
  });
  it("填空：答案非空；空数与题干不一致报 detail", () => {
    const q: Question = { ...base, type: "blank", options: null, stem: "a____b____", answer: ["1", "2"] };
    expect(validateQuestion(q)).toEqual([]);
    expect(validateQuestion({ ...q, answer: ["1", " "] })).toContainEqual({
      field: "answer",
      code: "blank_empty",
    });
    expect(validateQuestion({ ...q, answer: [["1", "一"]] })).toContainEqual({
      field: "answer",
      code: "blank_count_mismatch",
      detail: { expected: 2, actual: 1 },
    });
    // 题干没写下划线时不比空数（老数据大量如此），只查非空
    expect(validateQuestion({ ...q, stem: "没有空位", answer: ["1"] })).toEqual([]);
  });
  it("主观题允许 null / 空串 / Rubric，但拒绝选择题形状", () => {
    const q: Question = { ...base, type: "essay", options: null, answer: null };
    expect(validateQuestion(q)).toEqual([]);
    expect(validateQuestion({ ...q, answer: "" })).toEqual([]);
    expect(
      validateQuestion({ ...q, type: "calculation", answer: { reference: "x=3", rubric: [] } }),
    ).toEqual([]);
    expect(validateQuestion({ ...q, answer: ["A", "B"] })).toContainEqual({
      field: "answer",
      code: "subjective_answer_shape",
    });
    expect(validateQuestion({ ...q, answer: true })).toContainEqual({
      field: "answer",
      code: "subjective_answer_shape",
    });
  });
  it("难度 1–5、分值非负", () => {
    expect(validateQuestion({ ...base, difficulty: 0 })).toContainEqual({
      field: "difficulty",
      code: "difficulty_range",
    });
    expect(validateQuestion({ ...base, score: -1 })).toContainEqual({
      field: "score",
      code: "score_negative",
    });
  });
  it("七型每一型 defaultShape 出来的值都能通过（题干补上后）", () => {
    for (const type of QUESTION_TYPES) {
      const q = { ...emptyQuestion(type), stem: "题干" };
      const issues = validateQuestion(q).filter(
        // 默认形状里选项文本为空、单选答案为空是「还没填」，属于预期问题
        (i) => !["option_empty", "answer_out_of_range", "multiple_answer_too_few", "blank_empty"].includes(i.code),
      );
      expect(issues, type).toEqual([]);
    }
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/question-shape.test.ts`
Expected: FAIL，`Failed to resolve import "./question-shape"`

- [ ] **Step 3: 实现**

```ts
// packages/ui/src/question/question-shape.ts
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/question/question-shape.test.ts`
Expected: PASS（全部用例）

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/question/question-shape.ts packages/ui/src/question/question-shape.test.ts
git commit -m "feat(ui/math): question-shape 默认形状 / 选项归一 / 空数 / 结构校验

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 3: 题干切图 `question-stem.ts` + 契约 fixture

**Files:**
- Create: `packages/ui/src/question/stem-figures.contract.json`
- Create: `packages/ui/src/question/question-stem.ts`
- Create: `packages/ui/src/question/question-stem.test.ts`

**Interfaces:**
- Produces：`stemFigureKeys(stem, accept?)`、`stripStemFigures(stem, accept?)`、`splitStemFigures(stem, accept?): { text: string; figures: string[] }`。阶段 3 的编辑器预览与阶段 4 的作答卡都用 `splitStemFigures`。

- [ ] **Step 1: 写 fixture（逐字复刻 5069tk `contracts/stem-figures.json`，是跨语言判据不许改）**

```json
[
  { "name": "plain text stays untouched", "source": "两点之间线段最短。", "text": "两点之间线段最短。", "figures": [] },
  { "name": "trailing figure block is lifted out", "source": "如图，求 AB 的长\n\n![](question-image/7/aaaa.png)", "text": "如图，求 AB 的长", "figures": ["question-image/7/aaaa.png"] },
  { "name": "inline figure leaves no double space behind", "source": "甲 ![](textbook/a.png) 乙", "text": "甲 乙", "figures": ["textbook/a.png"] },
  { "name": "alt text is dropped, key is kept", "source": "![勾股定理示意图](textbook/zj-math-g7/fig-001.png)", "text": "", "figures": ["textbook/zj-math-g7/fig-001.png"] },
  { "name": "figures come out in document order, duplicates preserved", "source": "![](a.png)中间![](b.png)结尾![](a.png)", "text": "中间结尾", "figures": ["a.png", "b.png", "a.png"] },
  { "name": "math delimiters survive figure extraction untouched", "source": "已知 $x^2 + y_1 = 1$，如图 ![](textbook/a.png) 求解", "text": "已知 $x^2 + y_1 = 1$，如图 求解", "figures": ["textbook/a.png"] },
  { "name": "underscores inside the key never leak into the text", "source": "求值 ![](import/formula/a_1^2.png) 完", "text": "求值 完", "figures": ["import/formula/a_1^2.png"] },
  { "name": "display math block is not mistaken for a figure", "source": "$$\\frac{a}{b}$$", "text": "$$\\frac{a}{b}$$", "figures": [] },
  { "name": "unclosed image syntax stays literal text", "source": "看图![](未闭合", "text": "看图![](未闭合", "figures": [] },
  { "name": "blank lines left behind collapse to one", "source": "第一段\n\n![](a.png)\n\n![](b.png)\n\n第二段", "text": "第一段\n\n第二段", "figures": ["a.png", "b.png"] },
  { "name": "figure only, no prose", "source": "![](textbook/a.png)", "text": "", "figures": ["textbook/a.png"] },
  { "name": "keys with spaces are not matched (storage keys never contain them)", "source": "![](has space.png)", "text": "![](has space.png)", "figures": [] }
]
```

- [ ] **Step 2: 写测试（fixture 驱动 + accept 过滤）**

```ts
// packages/ui/src/question/question-stem.test.ts
import { describe, expect, it } from "vitest";
import cases from "./stem-figures.contract.json";
import { splitStemFigures, stemFigureKeys, stripStemFigures } from "./question-stem";

describe("question-stem · stem-figures.contract.json", () => {
  for (const c of cases) {
    it(c.name, () => {
      expect(splitStemFigures(c.source)).toEqual({ text: c.text, figures: c.figures });
    });
  }
});

describe("question-stem · accept 过滤", () => {
  const stem = "甲 ![](question-image/1.png) 乙 ![](import/formula/x.png)";
  it("只取某一类前缀，其它图留在正文里", () => {
    const accept = (key: string) => key.startsWith("question-image/");
    expect(stemFigureKeys(stem, accept)).toEqual(["question-image/1.png"]);
    expect(stripStemFigures(stem, accept)).toBe("甲 乙 ![](import/formula/x.png)");
  });
  it("正则每次新建：连续两次调用结果一致（/g 的 lastIndex 不泄漏）", () => {
    expect(stemFigureKeys(stem)).toEqual(stemFigureKeys(stem));
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/question-stem.test.ts`
Expected: FAIL，`Failed to resolve import "./question-stem"`

- [ ] **Step 4: 实现**

```ts
// packages/ui/src/question/question-stem.ts
// 题干的「图 / 非图」这一刀。顺序定死：**先切图，再解析公式**——storage key 里合法地带着
// `_` `^` `\`（`import/formula/a_1^2.png` 是真实形状），公式解析器看到它们就当下标/上标/命令，
// 图片引用会被吃成乱码公式。反之图片语法里不含 `$`，先摘图对公式分隔符零影响。
// 判据钉在 stem-figures.contract.json（消费方 Python 侧 docx 导出读同一份）。
// 非图部分内部的 `$…$` 切段由 math/math.parse.ts 的 splitMathSegments 负责，两把刀不重叠。

/** Markdown 图片语法。每次用都新建：带 /g 的正则有 lastIndex 状态，模块级共用会静默漏图。
 *  key 里不允许空白：storage key 从不含空格，而允许空格会让 `![](未闭合` 之后整段正文被吞。 */
const figurePattern = () => /!\[[^\]]*\]\(([^)\s]+)\)/g;

/** 题干里的插图 key，按出现顺序，重复保留。`accept` 只取某一类（如手工题图只认某前缀）。 */
export function stemFigureKeys(stem: string, accept?: (key: string) => boolean): string[] {
  const keys = [...stem.matchAll(figurePattern())].map((m) => m[1]);
  return accept ? keys.filter(accept) : keys;
}

/** 摘掉插图引用后的正文。三步收拾行尾空格 / 行内双空格 / 三连换行，否则渲染出忽宽忽窄的空隙。 */
export function stripStemFigures(stem: string, accept?: (key: string) => boolean): string {
  return stem
    .replace(figurePattern(), (whole, key: string) => (accept === undefined || accept(key) ? "" : whole))
    .replace(/[^\S\n]{2,}/g, " ")
    .replace(/[^\S\n]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface SplitStem {
  /** 可以交给 `<Formula>` 的正文（已不含任何图片语法）。 */
  text: string;
  /** 插图 storage key，按题干里的出现顺序。 */
  figures: string[];
}

export function splitStemFigures(stem: string, accept?: (key: string) => boolean): SplitStem {
  return { text: stripStemFigures(stem, accept), figures: stemFigureKeys(stem, accept) };
}
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/question/question-stem.test.ts`
Expected: PASS（14 tests）

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question/question-stem.ts packages/ui/src/question/question-stem.test.ts packages/ui/src/question/stem-figures.contract.json
git commit -m "feat(ui/math): question-stem 题干先切图后排公式（契约 fixture 复刻消费方）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 4: 与后端形状互转 `question-wire.ts`

**Files:**
- Create: `packages/ui/src/question/question-wire.ts`
- Create: `packages/ui/src/question/question-wire.test.ts`

**Interfaces:**
- Consumes：`normalizeOptions`（Task 2）、Task 1 类型。
- Produces：
  - `encodeBlanks(blanks: string[]): string | string[]`
  - `decodeBlanks(raw: string | null | undefined, count: number): string[]`
  - `toWireAnswer(q: Pick<Question, "type" | "answer">): QuestionAnswer`
  - `fromWire(input: { type: QuestionType; options?: unknown; answer?: unknown }): Pick<Question, "type" | "options" | "answer">`

- [ ] **Step 1: 写测试**

```ts
// packages/ui/src/question/question-wire.test.ts
import { describe, expect, it } from "vitest";
import { decodeBlanks, encodeBlanks, fromWire, toWireAnswer } from "./question-wire";

describe("question-wire · blanks", () => {
  it("单空交字符串，多空交数组", () => {
    expect(encodeBlanks(["90"])).toBe("90");
    expect(encodeBlanks(["150", "30"])).toEqual(["150", "30"]);
  });
  it("decode：单空不解析 JSON（区间 [1,2] 是合法单空答案）", () => {
    expect(decodeBlanks("[1,2]", 1)).toEqual(["[1,2]"]);
  });
  it("decode：多空解析 JSON 数组并补齐空位", () => {
    expect(decodeBlanks('["150","30"]', 3)).toEqual(["150", "30", ""]);
  });
  it("decode：不是 JSON 回落整串进第一个空", () => {
    expect(decodeBlanks("150,30", 2)).toEqual(["150,30", ""]);
    expect(decodeBlanks(null, 2)).toEqual(["", ""]);
  });
});

describe("question-wire · toWireAnswer", () => {
  it("填空单空且为单写法时压回字符串；多写法或多空保持数组", () => {
    expect(toWireAnswer({ type: "blank", answer: ["90"] })).toBe("90");
    expect(toWireAnswer({ type: "blank", answer: [["90", "90°"]] })).toEqual([["90", "90°"]]);
    expect(toWireAnswer({ type: "blank", answer: ["1", "2"] })).toEqual(["1", "2"]);
  });
  it("其余题型原样", () => {
    expect(toWireAnswer({ type: "single", answer: "A" })).toBe("A");
    expect(toWireAnswer({ type: "judge", answer: false })).toBe(false);
  });
});

describe("question-wire · fromWire", () => {
  it("字符串形 options 归一；多选 'A,C' 串拆数组", () => {
    expect(fromWire({ type: "multiple", options: ["A. 甲", "B. 乙", "C. 丙"], answer: "A,C" })).toEqual({
      type: "multiple",
      options: [
        { key: "A", text: "甲" },
        { key: "B", text: "乙" },
        { key: "C", text: "丙" },
      ],
      answer: ["A", "C"],
    });
  });
  it("判断 'true'/'false' 串归一成布尔；认不出保留原值", () => {
    expect(fromWire({ type: "judge", answer: "true" }).answer).toBe(true);
    expect(fromWire({ type: "judge", answer: "错误" }).answer).toBe(false);
    expect(fromWire({ type: "judge", answer: "说不清" }).answer).toBe("说不清");
  });
  it("填空字符串包成一项数组；非选择题 options 归 null", () => {
    expect(fromWire({ type: "blank", answer: "7", options: null })).toEqual({
      type: "blank",
      options: null,
      answer: ["7"],
    });
  });
  it("主观题 undefined 答案归 null；Rubric 原样", () => {
    expect(fromWire({ type: "essay" }).answer).toBeNull();
    const rubric = { reference: "x=3", rubric: [{ point: "列式", score: 2 }] };
    expect(fromWire({ type: "calculation", answer: rubric }).answer).toEqual(rubric);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/question-wire.test.ts`
Expected: FAIL，`Failed to resolve import "./question-wire"`

- [ ] **Step 3: 实现**

```ts
// packages/ui/src/question/question-wire.ts
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
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/question/question-wire.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/question/question-wire.ts packages/ui/src/question/question-wire.test.ts
git commit -m "feat(ui/math): question-wire 编辑器规范形与消费方后端形互转

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 5: Locale 词条 `question` + 答案格式化 `answer-format.ts`

**Files:**
- Modify: `packages/ui/src/config/locale.ts`（三处：`ComponentLocale` 类型、`zhCN.components`、`enUS.components`——键位在 `mathText` 旁边）
- Create: `packages/ui/src/question/answer-format.ts`
- Create: `packages/ui/src/question/answer-format.test.ts`

**Interfaces:**
- Produces：
  - `ComponentLocale.question?: QuestionLocale`（见下），`zhCN` / `enUS` 各一份
  - `QUESTION_LOCALE_ZH: QuestionLocale`（纯函数默认值，从 `locale.ts` 的 `zhCN` 取）
  - `answerLines(answer: unknown, type?: QuestionType, labels?: QuestionLocale): string[]`
  - `answerText(answer: unknown, type?: QuestionType, labels?: QuestionLocale): string`

- [ ] **Step 1: 在 `locale.ts` 的 `ComponentLocale` 里、`mathText?:` 那一行之后加类型**

```ts
  /** 题目域（QuestionCard / QuestionEditor / QuestionAnswer 与 answer-format 共用）。 */
  question?: {
    /** 七型中文名，键必须齐（Record，不许 Partial）。 */
    types: {
      single: string;
      multiple: string;
      judge: string;
      blank: string;
      short_answer: string;
      calculation: string;
      essay: string;
    };
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
  };
```

- [ ] **Step 2: 在 `zhCN` 的 components 里 `mathText: {...}` 之后加**

```ts
  question: {
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
  },
```

- [ ] **Step 3: 在 `enUS` 的 components 里 `mathText: {...}` 之后加**

```ts
  question: {
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
  },
```

- [ ] **Step 4: 跑 locale 既有测试确认两份预设键齐**

Run: `cd packages/ui && npx vitest run src/config`
Expected: PASS（若有「zhCN/enUS 键不一致」类断言，说明某一侧漏加）

- [ ] **Step 5: 写 answer-format 测试**

```ts
// packages/ui/src/question/answer-format.test.ts
import { describe, expect, it } from "vitest";
import { enUS } from "../config/locale";
import { answerLines, answerText } from "./answer-format";

describe("answer-format · 按形状分派（不按题型）", () => {
  it("空值给占位", () => {
    expect(answerLines(null)).toEqual(["—"]);
    expect(answerLines("")).toEqual(["—"]);
  });
  it("布尔渲染成正确 / 错误", () => {
    expect(answerText(true)).toBe("正确");
    expect(answerText(false)).toBe("错误");
  });
  it("字符串 / 数字原样", () => {
    expect(answerText("C")).toBe("C");
    expect(answerText(7)).toBe("7");
  });
  it("一维数组：blank 走逐空；其余（多选）用顿号", () => {
    expect(answerText(["B", "C"], "multiple")).toBe("B、C");
    expect(answerText(["B", "C"])).toBe("B、C");
    expect(answerText(["150", "30"], "blank")).toBe("第1空：150；第2空：30");
  });
  it("二维数组不传题型也按逐空；等价写法用斜杠", () => {
    expect(answerText([["150", "150°"], ["30", "30°"]])).toBe("第1空：150 / 150°；第2空：30 / 30°");
  });
  it("单空不标空号", () => {
    expect(answerText(["90"], "blank")).toBe("90");
    expect(answerText([["90", "90°"]], "blank")).toBe("90 / 90°");
  });
  it("Rubric 拆成参考答案 + 逐条得分点", () => {
    expect(
      answerLines({ reference: "x=3", rubric: [{ point: "列式", score: 2 }, { point: "求解" }] }),
    ).toEqual(["x=3", "分步给分：", "· 列式（2 分）", "· 求解"]);
    expect(answerLines({ reference: "", rubric: [] })).toEqual(["见分步给分"]);
  });
  it("未知对象形状印 JSON 字面量（能看出坏在哪）", () => {
    expect(answerLines({ foo: 1 })).toEqual(['{"foo":1}']);
  });
  it("labels 可换成英文", () => {
    const en = enUS.components.question!;
    expect(answerText(true, undefined, en)).toBe("True");
    expect(answerText(["150", "30"], "blank", en)).toBe("Blank 1: 150; Blank 2: 30");
  });
});
```

- [ ] **Step 6: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/answer-format.test.ts`
Expected: FAIL，`Failed to resolve import "./answer-format"`

- [ ] **Step 7: 实现**

```ts
// packages/ui/src/question/answer-format.ts
// 答案 JSON → 人能读的文本。**按形状分派而不是按题型**：题型与答案形状不保证一致
// （导入 / AI 拆题产出的数据没有这个保证），按形状分派不会因一条脏数据就印出 JSON 字面量。
// 题型只在「同一形状对应多种语义」时用得上：一维数组既可能是多选的 key 集，也可能是填空
// 的逐空答案——拿不到题型时按内层是否还是数组兜底（二维 = 逐空，一维 = 多选）。
import { zhCN, type ComponentLocale } from "../config/locale";
import type { QuestionType } from "./question.types";

export type QuestionLocale = NonNullable<ComponentLocale["question"]>;

/** 纯函数的默认文案。组件里请用 useComponentLocale().question 覆盖。 */
export const QUESTION_LOCALE_ZH: QuestionLocale = zhCN.components.question!;

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
```

- [ ] **Step 8: 跑测试与 typecheck**

Run: `cd packages/ui && npx vitest run src/question/answer-format.test.ts src/config && pnpm --filter @hulianui/ui typecheck`
Expected: 全部 PASS；typecheck 无错误

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/config/locale.ts packages/ui/src/question/answer-format.ts packages/ui/src/question/answer-format.test.ts
git commit -m "feat(ui/math): question Locale 词条 + answer-format 答案人读文本

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 6: 判分引擎 `grade.ts` + 跨语言契约 `grade.contract.json`

**Files:**
- Create: `packages/ui/src/question/grade.contract.json`
- Create: `packages/ui/src/question/grade.ts`
- Create: `packages/ui/src/question/grade.test.ts`

**Interfaces:**
- Consumes：`isSubjective`（Task 2）、Task 1 类型。
- Produces：
  - `interface GradeOptions { normalize?: boolean; tolerance?: number; equivalent?: (a: string, b: string) => boolean }`
  - `gradeObjective(question: Pick<Question, "type" | "answer" | "score">, student: StudentAnswer | boolean | null | undefined, options?: GradeOptions): { correct: boolean | null; score: number }`
  - `canonicalAnswer(value: unknown): string`（第 2 档归一形）
  - `parseNumeric(text: string): number | null`
  - `JUDGE_TRUE` / `JUDGE_FALSE`（ReadonlySet<string>）

- [ ] **Step 1: 写契约 fixture**

第 1 档 case 逐条来自 5069tk `api/tests/test_grading_recognize.py::test_score_objective`（满分统一 3）；第 2 档为本库新增，`level: 2` 标明 Python 侧尚未实现。

```json
{
  "fullScore": 3,
  "cases": [
    { "level": 1, "type": "single", "answer": "A", "student": "A", "correct": true },
    { "level": 1, "type": "single", "answer": "A", "student": "B", "correct": false },
    { "level": 1, "type": "judge", "answer": true, "student": true, "correct": true },
    { "level": 1, "type": "judge", "answer": true, "student": false, "correct": false },
    { "level": 1, "type": "blank", "answer": "7", "student": "7", "correct": true },
    { "level": 1, "type": "blank", "answer": "7", "student": " 7 ", "correct": true, "note": "首尾空白不算错" },
    { "level": 1, "type": "multiple", "answer": ["A", "C"], "student": ["A", "C"], "correct": true },
    { "level": 1, "type": "multiple", "answer": ["A", "C"], "student": ["C", "A"], "correct": true, "note": "顺序无关" },
    { "level": 1, "type": "multiple", "answer": ["A", "C"], "student": ["A"], "correct": false, "note": "少选不给分" },
    { "level": 1, "type": "multiple", "answer": ["A", "C"], "student": ["A", "C", "D"], "correct": false, "note": "多选不给分" },
    { "level": 1, "type": "essay", "answer": null, "student": "作答", "correct": null },
    { "level": 1, "type": "short_answer", "answer": null, "student": "作答", "correct": null },
    { "level": 1, "type": "calculation", "answer": null, "student": "x = 3", "correct": null },
    { "level": 1, "type": "judge", "answer": true, "student": "true", "correct": true },
    { "level": 1, "type": "judge", "answer": true, "student": "正确", "correct": true },
    { "level": 1, "type": "judge", "answer": false, "student": "false", "correct": true },
    { "level": 1, "type": "judge", "answer": false, "student": "错误", "correct": true },
    { "level": 1, "type": "judge", "answer": true, "student": "false", "correct": false },
    { "level": 1, "type": "judge", "answer": false, "student": "√", "correct": false },
    { "level": 1, "type": "judge", "answer": "说不清", "student": "说不清", "correct": true, "note": "认不出的一侧退回原样等值比较" },
    { "level": 1, "type": "judge", "answer": true, "student": "说不清", "correct": false },
    { "level": 1, "type": "blank", "answer": [["150", "150°"], ["30", "30°"]], "student": ["150", "30"], "correct": true },
    { "level": 1, "type": "blank", "answer": [["150", "150°"], ["30", "30°"]], "student": ["150°", "30°"], "correct": true },
    { "level": 1, "type": "blank", "answer": [["150", "150°"], ["30", "30°"]], "student": ["150", "60"], "correct": false },
    { "level": 1, "type": "blank", "answer": [["150", "150°"], ["30", "30°"]], "student": "150,30", "correct": true, "note": "整串按分隔符拆空" },
    { "level": 1, "type": "blank", "answer": [["150", "150°"], ["30", "30°"]], "student": "150，30", "correct": true },
    { "level": 1, "type": "blank", "answer": [["150"], ["30"]], "student": "150", "correct": false, "note": "拆不出这么多空判错" },
    { "level": 1, "type": "blank", "answer": [["4<x<14", "4＜x＜14"]], "student": "4＜x＜14", "correct": true, "note": "单空多写法：整串就是那一个空" },
    { "level": 1, "type": "blank", "answer": "7", "student": ["7"], "correct": true, "note": "单空被包成一项数组" },
    { "level": 1, "type": "blank", "answer": "7", "student": ["7", "8"], "correct": false },
    { "level": 1, "type": "blank", "answer": ["A", "B"], "student": ["A", "B"], "correct": true },
    { "level": 1, "type": "blank", "answer": ["A", "B"], "student": ["A", "C"], "correct": false },
    { "level": 1, "type": "blank", "answer": "7", "student": null, "correct": false },
    { "level": 1, "type": "blank", "answer": "150°", "student": "150", "correct": false, "note": "第 1 档不做任何归一" },

    { "level": 2, "type": "blank", "answer": "4<x<14", "student": "4＜x＜14", "correct": true, "options": { "normalize": true }, "note": "全角→半角" },
    { "level": 2, "type": "blank", "answer": "150°", "student": "150^\\circ", "correct": true, "options": { "normalize": true }, "note": "Unicode 符号→LaTeX" },
    { "level": 2, "type": "blank", "answer": "$\\sqrt{3}$", "student": "√3", "correct": true, "options": { "normalize": true }, "note": "剥 $、单 token 分组花括号" },
    { "level": 2, "type": "blank", "answer": "1、2", "student": "12", "correct": false, "options": { "normalize": true }, "note": "分隔符折叠不许把两个数粘成一个" },
    { "level": 2, "type": "blank", "answer": "\\{a_n\\}", "student": "{a_n}", "correct": false, "options": { "normalize": true }, "note": "集合花括号是内容不是分组" },
    { "level": 2, "type": "blank", "answer": "3.14", "student": "3.1416", "correct": true, "options": { "tolerance": 0.01 } },
    { "level": 2, "type": "blank", "answer": "3.14", "student": "3.2", "correct": false, "options": { "tolerance": 0.01 } },
    { "level": 2, "type": "blank", "answer": "0.5", "student": "\\frac{1}{2}", "correct": true, "options": { "tolerance": 0 }, "note": "分式解析成数" },
    { "level": 2, "type": "blank", "answer": "50%", "student": "0.5", "correct": true, "options": { "tolerance": 0 } },
    { "level": 2, "type": "blank", "answer": ["1.5", "2.5"], "student": ["1.50", "2.500"], "correct": true, "options": { "tolerance": 0 }, "note": "逐空各自按数比" },
    { "level": 2, "type": "single", "answer": "A", "student": "a", "correct": true, "options": { "normalize": true }, "note": "归一统一大小写" }
  ]
}
```

- [ ] **Step 2: 写测试（契约驱动 + 第 3 档注入 + 归一函数单测）**

```ts
// packages/ui/src/question/grade.test.ts
import { describe, expect, it } from "vitest";
import contract from "./grade.contract.json";
import { canonicalAnswer, gradeObjective, parseNumeric, type GradeOptions } from "./grade";
import type { Question, StudentAnswer } from "./question.types";

describe("grade · grade.contract.json", () => {
  for (const c of contract.cases) {
    it(`[L${c.level}] ${c.type} ${JSON.stringify(c.answer)} vs ${JSON.stringify(c.student)}${c.note ? ` · ${c.note}` : ""}`, () => {
      const q = { type: c.type, answer: c.answer, score: contract.fullScore } as Pick<Question, "type" | "answer" | "score">;
      const r = gradeObjective(q, c.student as StudentAnswer | boolean | null, (c as { options?: GradeOptions }).options);
      expect(r.correct).toBe(c.correct);
      expect(r.score).toBe(c.correct === true ? contract.fullScore : 0);
    });
  }
});

describe("grade · 第 3 档 equivalent 注入", () => {
  it("第 1、2 档不等时才调比较器，比较器说等价即对", () => {
    const calls: [string, string][] = [];
    const equivalent = (a: string, b: string) => {
      calls.push([a, b]);
      return a === "x+1" && b === "1+x";
    };
    const q = { type: "blank", answer: "x+1", score: 4 } as const;
    expect(gradeObjective(q, "1+x", { equivalent })).toEqual({ correct: true, score: 4 });
    expect(calls).toEqual([["x+1", "1+x"]]);
    calls.length = 0;
    expect(gradeObjective(q, "x+1", { equivalent }).correct).toBe(true);
    expect(calls).toEqual([]); // 第 1 档已相等，不调
  });
  it("比较器抛错按不等价处理，不炸调用方", () => {
    const q = { type: "blank", answer: "x", score: 4 } as const;
    expect(
      gradeObjective(q, "y", {
        equivalent: () => {
          throw new Error("parse");
        },
      }).correct,
    ).toBe(false);
  });
});

describe("grade · canonicalAnswer", () => {
  it("七步归一", () => {
    expect(canonicalAnswer("![-8](import/formula/ab12.png)")).toBe("-8");
    expect(canonicalAnswer("（1）")).toBe("(1)");
    expect(canonicalAnswer("x²")).toBe("X^2");
    expect(canonicalAnswer("$\\sqrt{3}$")).toBe("\\SQRT3");
    expect(canonicalAnswer("A B")).toBe("AB");
    // 数字之间留哨兵：写法差异抹平，但 `1、2` 不许变成 `12`
    expect(canonicalAnswer("1、2")).toBe("1\x1f2");
    expect(canonicalAnswer("1，2")).toBe("1\x1f2");
    expect(canonicalAnswer("1、2")).not.toBe(canonicalAnswer("12"));
    expect(canonicalAnswer("\\{a\\}")).toBe("\\{A\\}");
  });
});

describe("grade · parseNumeric", () => {
  it("十进制 / 分式 / 百分数 / 度数 / 负数；其余 null", () => {
    expect(parseNumeric("3.14")).toBe(3.14);
    expect(parseNumeric("-2")).toBe(-2);
    expect(parseNumeric("\\frac{1}{2}")).toBe(0.5);
    expect(parseNumeric("-\\frac{3}{4}")).toBe(-0.75);
    expect(parseNumeric("50%")).toBe(0.5);
    expect(parseNumeric("150°")).toBe(150);
    expect(parseNumeric("150^\\circ")).toBe(150);
    expect(parseNumeric("$0.5$")).toBe(0.5);
    expect(parseNumeric("x")).toBeNull();
    expect(parseNumeric("")).toBeNull();
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/grade.test.ts`
Expected: FAIL，`Failed to resolve import "./grade"`

- [ ] **Step 4: 实现**

```ts
// packages/ui/src/question/grade.ts
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
```

- [ ] **Step 5: 跑测试确认通过**

Run: `cd packages/ui && npx vitest run src/question/grade.test.ts`
Expected: PASS（契约 45 条 + 6 条）。若某条第 1 档 case 红，**改实现不改 fixture**——fixture 是消费方的行为。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question/grade.ts packages/ui/src/question/grade.test.ts packages/ui/src/question/grade.contract.json
git commit -m "feat(ui/math): gradeObjective 三档判分 + grade.contract.json 跨语言契约

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 7: `question/index.ts` 与 `math/index.ts` 导出

**Files:**
- Create: `packages/ui/src/question/index.ts`
- Modify: `packages/ui/src/math/index.ts`
- Create: `packages/ui/src/question/exports.test.ts`

**Interfaces:**
- Produces：`import { … } from "@hulianui/ui/math"` 可拿到 Task 1–6 全部公开件。

- [ ] **Step 1: 写导出面测试**

```ts
// packages/ui/src/question/exports.test.ts
import { describe, expect, it } from "vitest";
import * as math from "../math";

describe("@hulianui/ui/math 导出题目域公开件", () => {
  it("纯函数与常量齐全", () => {
    const names = [
      "QUESTION_TYPES",
      "SUBJECTIVE_TYPES",
      "DEFAULT_SCORE_BY_TYPE",
      "isSubjective",
      "optionKey",
      "defaultShape",
      "emptyQuestion",
      "normalizeOptions",
      "blankCount",
      "validateQuestion",
      "splitStemFigures",
      "stemFigureKeys",
      "stripStemFigures",
      "encodeBlanks",
      "decodeBlanks",
      "toWireAnswer",
      "fromWire",
      "answerLines",
      "answerText",
      "gradeObjective",
      "canonicalAnswer",
      "parseNumeric",
    ] as const;
    for (const n of names) expect(math, n).toHaveProperty(n);
  });
  it("主 barrel 不导出题目域（不排数学的消费者不付 KaTeX 体积）", async () => {
    const main = await import("../index");
    expect(main).not.toHaveProperty("gradeObjective");
    expect(main).not.toHaveProperty("QuestionCard");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd packages/ui && npx vitest run src/question/exports.test.ts`
Expected: FAIL（`math` 上缺 `QUESTION_TYPES` 等）

- [ ] **Step 3: 写 `question/index.ts`**

```ts
// packages/ui/src/question/index.ts
// 题目域 barrel。**不是对外 subpath**：一切从 @hulianui/ui/math 转出（题目域的组件内部都是 Formula）。
export type {
  QuestionType,
  QuestionOption,
  BlankAnswer,
  Rubric,
  QuestionAnswer,
  QuestionIssue,
  Question,
  StudentAnswer,
  QuestionValidationCode,
  QuestionValidationIssue,
} from "./question.types";
export { QUESTION_TYPES } from "./question.types";
export {
  SUBJECTIVE_TYPES,
  DEFAULT_SCORE_BY_TYPE,
  MAX_OPTIONS,
  isSubjective,
  optionKey,
  defaultShape,
  emptyQuestion,
  normalizeOptions,
  blankCount,
  validateQuestion,
} from "./question-shape";
export { splitStemFigures, stemFigureKeys, stripStemFigures } from "./question-stem";
export type { SplitStem } from "./question-stem";
export { encodeBlanks, decodeBlanks, toWireAnswer, fromWire } from "./question-wire";
export { answerLines, answerText, QUESTION_LOCALE_ZH } from "./answer-format";
export type { QuestionLocale } from "./answer-format";
export { gradeObjective, canonicalAnswer, parseNumeric, JUDGE_TRUE, JUDGE_FALSE } from "./grade";
export type { GradeOptions, GradeResult } from "./grade";
```

- [ ] **Step 4: 在 `packages/ui/src/math/index.ts` 末尾追加**

```ts
// 题目域（类型 / 形状 / 切图 / wire 互转 / 答案文本 / 判分）。与 QuestionCard 同住此路径，
// 阶段 2–5 的 MathTextarea / QuestionEditor / QuestionAnswer 也从这里导出。
export * from "../question";
```

- [ ] **Step 5: 跑测试与 typecheck**

Run: `cd packages/ui && npx vitest run src/question/exports.test.ts && pnpm --filter @hulianui/ui typecheck`
Expected: PASS；typecheck 无错误。若 `QuestionOption` 与 `question-card.types` 的同名导出冲突报 TS2308，**先不要改**——Task 8 会把 QuestionCard 的类型统一到 `question.types`，此时暂时把 `math/index.ts` 里 `QuestionOption` 那一行从 QuestionCard 的类型导出中删掉。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question/index.ts packages/ui/src/question/exports.test.ts packages/ui/src/math/index.ts
git commit -m "feat(ui/math): 从 @hulianui/ui/math 转出题目域公开件

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 8: QuestionCard 迁到新类型（`kind → type`，补答案 / 解析槽）

**Files:**
- Modify: `packages/ui/src/question-card/question-card.types.ts`
- Create: `packages/ui/src/question-card/question-card.client.tsx`
- Modify: `packages/ui/src/question-card/question-card.tsx`
- Modify: `packages/ui/src/question-card/question-card.test.tsx`
- Modify: `packages/ui/src/math/index.ts`（QuestionCard 类型导出行）

**Interfaces:**
- Consumes：`QuestionType` / `QuestionAnswer` / `QuestionOption` / `QuestionIssue`（Task 1）、`answerText`（Task 5）、`warnOnce`。
- Produces：`QuestionCardProps` 新形状（下），`QuestionKind`（deprecated 保留一版）。

- [ ] **Step 1: 改类型文件**

```ts
// packages/ui/src/question-card/question-card.types.ts
import type { ReactNode } from "react";
import type { QuestionAnswer, QuestionIssue, QuestionOption, QuestionType } from "../question/question.types";

/** @deprecated 0.59 起改用 `type`（七型枚举）。映射：choice → single、fill → blank、solution → essay、judge → judge。下一个 minor 移除。 */
export type QuestionKind = "choice" | "fill" | "solution" | "judge";

/** 旧选项形状（`label` 即 `key`），保留一个 minor。 */
export interface LegacyQuestionOption {
  label: string;
  text: string;
}

export type { QuestionIssue, QuestionOption };

export interface QuestionCardProps {
  /** 原书题号，如 "12"。 */
  number?: ReactNode;
  /** 题型（七型枚举）。决定标签文案与语气色。 */
  type?: QuestionType;
  /** @deprecated 改用 `type`。 */
  kind?: QuestionKind;
  /** 覆盖题型标签文案（缺省走 Locale 的 `question.types`）。 */
  typeLabel?: ReactNode;
  /** @deprecated 改用 `typeLabel`。 */
  kindLabel?: ReactNode;
  /** 难度/分层标签，如 A 组 / 基础 / 拔高。 */
  difficulty?: ReactNode;
  /** 题干，支持 LaTeX 记号（`\frac{}{}` / `^{}` / `_{}` / 填空槽 `____`），由 Formula 排版。 */
  stem: string;
  /** 选择题选项；非选择题传空或省略。新形状 `{ key, text }`，旧形状 `{ label, text }` 仍接受一个 minor。 */
  options?: (QuestionOption | LegacyQuestionOption)[];
  /** 小问 (1)(2)(3)。 */
  parts?: string[];
  /** 附图。 */
  figure?: { src: string; alt?: string };
  /** 答案（形状见 QuestionAnswer）。只有 `showAnswer` 为真才渲染。 */
  answer?: QuestionAnswer;
  /** 解析，支持 LaTeX 记号。只有 `showAnswer` 为真才渲染。 */
  analysis?: string;
  /** 渲染答案与解析区（题库详情 / 教师端开；学生作答前必须关）。@default false */
  showAnswer?: boolean;
  /** 出处，如「学能评价 七上 · 第 3 页 · 第 3 题」。 */
  source?: ReactNode;
  /** 章节归属。 */
  chapter?: ReactNode;
  /** 知识点标签。 */
  topics?: string[];
  /**
   * 质量标记。有值时卡片左侧显示警示色边条 ——
   * 拆出来但没把握的题必须一眼可辨，混在正常题里等于骗验收。
   */
  issues?: QuestionIssue[];
  /** 右上角操作区（编辑/删除/加入试卷）。 */
  actions?: ReactNode;
  /** 紧凑模式：隐藏小问与出处，用于长列表。 */
  compact?: boolean;
  className?: string;
}
```

- [ ] **Step 2: 写 client 叶子（读 Locale 的两块，与 math-blank 同一处方）**

```tsx
// packages/ui/src/question-card/question-card.client.tsx
"use client";
import type { ReactNode } from "react";
import { useComponentLocale } from "../config/locale-context";
import { Formula } from "../math/math";
import { answerText, QUESTION_LOCALE_ZH } from "../question/answer-format";
import type { QuestionAnswer, QuestionType } from "../question/question.types";
import { Tag } from "../tag";
import { Text } from "../text";

// QuestionCard 本体刻意保持 RSC 安全（无 hook）。题型标签与「答案 / 解析」两个标题要走
// Locale SSOT，而那是 React context——拆成 client 叶子，题库页面里几十张卡不必整卡进客户端。

const TYPE_TONE: Record<QuestionType, "brand" | "success" | "warning" | "neutral"> = {
  single: "brand",
  multiple: "brand",
  judge: "neutral",
  blank: "success",
  short_answer: "warning",
  calculation: "warning",
  essay: "warning",
};

export function QuestionTypeTag({ type, label }: { type: QuestionType; label?: ReactNode }) {
  const L = useComponentLocale().question ?? QUESTION_LOCALE_ZH;
  return (
    <Tag size="sm" tone={TYPE_TONE[type]} variant="soft">
      {label ?? L.types[type]}
    </Tag>
  );
}

export function QuestionAnswerSection({
  type,
  answer,
  analysis,
}: {
  type: QuestionType | undefined;
  answer: QuestionAnswer | undefined;
  analysis: string | undefined;
}) {
  const L = useComponentLocale().question ?? QUESTION_LOCALE_ZH;
  const hasAnswer = answer !== undefined;
  const hasAnalysis = analysis !== undefined && analysis.trim() !== "";
  if (!hasAnswer && !hasAnalysis) return null;
  return (
    <div className="space-y-1 border-t border-border pt-2.5" data-slot="question-answer">
      {hasAnswer && (
        <Text as="p" size="sm">
          <Text as="span" tone="muted" className="me-2">
            {L.answer}
          </Text>
          <Formula>{answerText(answer, type, L)}</Formula>
        </Text>
      )}
      {hasAnalysis && (
        <Text as="p" size="sm">
          <Text as="span" tone="muted" className="me-2">
            {L.analysis}
          </Text>
          <Formula>{analysis!}</Formula>
        </Text>
      )}
    </div>
  );
}
```

- [ ] **Step 3: 改组件本体**

把 `question-card.tsx` 的 import 与顶部常量替换为：

```tsx
import { Card, CardBody } from "../card";
import { Chip } from "../chip";
import { Image } from "../image";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Formula } from "../math/math";
import type { QuestionType } from "../question/question.types";
import { Text } from "../text";
import { QuestionAnswerSection, QuestionTypeTag } from "./question-card.client";
import type { QuestionCardProps, QuestionKind } from "./question-card.types";

// 题目卡片：教辅/题库场景的标准展示件。
// 题干、选项、小问一律走 Formula（KaTeX），因此分数、根号、上下标是真排版而不是
// "3/8" "x^2" 这种降级文本，也不是 CSS 拼出来的近似版式。上游数据没包 $ 时 Formula
// 会退到裸记号切分，题面照样排得出来 —— 也正因为吃 KaTeX，本件住在 @hulianui/ui/math。
// 带 issues 的题左侧亮警示边条 —— 从文档自动拆出来的题必须让人一眼看出哪些没把握。

/** 旧四型 → 七型。0.59 起 `kind` deprecated，下一个 minor 删这张表。 */
const KIND_TO_TYPE: Record<QuestionKind, QuestionType> = {
  choice: "single",
  fill: "blank",
  solution: "essay",
  judge: "judge",
};
```

函数签名与解构改为：

```tsx
export function QuestionCard({
  number,
  type,
  kind,
  typeLabel,
  kindLabel,
  difficulty,
  stem,
  options,
  parts,
  figure,
  answer,
  analysis,
  showAnswer = false,
  source,
  chapter,
  topics,
  issues,
  actions,
  compact = false,
  className,
}: QuestionCardProps) {
  if (kind !== undefined && type === undefined) {
    warnOnce(
      "question-card:kind-deprecated",
      "[瑚琏] QuestionCard：`kind` 已弃用，请改用 `type`（single / multiple / judge / blank / short_answer / calculation / essay）。",
    );
  }
  const resolvedType: QuestionType | undefined = type ?? (kind ? KIND_TO_TYPE[kind] : undefined);
  const resolvedLabel = typeLabel ?? kindLabel;
  const flagged = (issues?.length ?? 0) > 0;
  const worst = issues?.some((i) => i.tone === "danger") ? "danger" : "warning";
```

题型标签那段（原 `{kind && (<Tag …>)}`）改为：

```tsx
          {resolvedType && <QuestionTypeTag type={resolvedType} label={resolvedLabel} />}
```

选项列表里 `opt.label` 改成兼容两种形状：

```tsx
                {options.map((opt) => {
                  const key = "key" in opt ? opt.key : opt.label;
                  return (
                    <li key={key} className="flex gap-1.5">
                      <Text as="span" tone="muted" className="shrink-0">
                        {key}.
                      </Text>
                      <Text as="span">
                        <Formula>{opt.text}</Formula>
                      </Text>
                    </li>
                  );
                })}
```

在小问 `</ul>` 之后、`</div>`（min-w-0 flex-1 那个）之前插入答案区：

```tsx
            {showAnswer && (
              <QuestionAnswerSection type={resolvedType} answer={answer} analysis={analysis} />
            )}
```

- [ ] **Step 4: 更新 `math/index.ts` 的 QuestionCard 类型导出行**

把

```ts
export type {
  QuestionCardProps,
  QuestionKind,
  QuestionOption,
  QuestionIssue,
} from "../question-card/question-card.types";
```

改为（`QuestionOption` / `QuestionIssue` 已由 `../question` 导出，避免 TS2308 重复）：

```ts
export type { QuestionCardProps, QuestionKind, LegacyQuestionOption } from "../question-card/question-card.types";
```

- [ ] **Step 5: 更新测试（旧用例改 `type`，新增答案区、旧 prop 兼容、deprecated 告警）**

```tsx
// packages/ui/src/question-card/question-card.test.tsx
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { QuestionCard } from "./question-card";

describe("QuestionCard", () => {
  it("题干里的数学记号交给 KaTeX 排版，填空槽渲染成空位", () => {
    const { container } = render(
      <QuestionCard stem={"将\\frac{3}{8}化成小数为____。"} type="blank" />,
    );
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector('[role="img"]')).not.toBeNull();
    expect(container.textContent).not.toContain("____");
  });

  it("选项按 key 逐条渲染（新形状）", () => {
    render(
      <QuestionCard
        stem="下列说法正确的是( )。"
        type="single"
        options={[
          { key: "A", text: "排序" },
          { key: "B", text: "标号" },
        ]}
      />,
    );
    expect(screen.getByText("排序")).toBeTruthy();
    expect(screen.getByText("A.")).toBeTruthy();
  });

  it("旧形状 {label,text} 仍能渲染", () => {
    render(<QuestionCard stem="题干" options={[{ label: "A", text: "旧" }]} />);
    expect(screen.getByText("旧")).toBeTruthy();
    expect(screen.getByText("A.")).toBeTruthy();
  });

  it("题型标签走 Locale：默认中文，enUS 下英文", () => {
    render(<QuestionCard stem="题干" type="short_answer" />);
    expect(screen.getByText("简答")).toBeTruthy();
    render(
      <ConfigProvider locale={enUS}>
        <QuestionCard stem="stem" type="short_answer" />
      </ConfigProvider>,
    );
    expect(screen.getByText("Short answer")).toBeTruthy();
  });

  it("typeLabel 覆盖内置文案", () => {
    render(<QuestionCard stem="题干" type="single" typeLabel="单项选择" />);
    expect(screen.getByText("单项选择")).toBeTruthy();
  });

  describe("kind 兼容一版", () => {
    afterEach(() => vi.restoreAllMocks());
    it("kind 映射到七型并打一次弃用告警", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<QuestionCard stem="题干" kind="fill" />);
      expect(screen.getByText("填空")).toBeTruthy();
      expect(warn.mock.calls.some(([m]) => String(m).includes("kind"))).toBe(true);
    });
    it("kind 与 type 同时给时以 type 为准", () => {
      render(<QuestionCard stem="题干" kind="fill" type="essay" />);
      expect(screen.getByText("解答")).toBeTruthy();
    });
  });

  describe("答案 / 解析区", () => {
    it("默认不渲染（学生作答前不能泄题）", () => {
      const { container } = render(<QuestionCard stem="题干" type="single" answer="A" analysis="因为" />);
      expect(container.querySelector('[data-slot="question-answer"]')).toBeNull();
    });
    it("showAnswer 时按形状渲染答案与解析", () => {
      render(
        <QuestionCard
          stem="题干"
          type="blank"
          answer={[["150", "150°"], "30"]}
          analysis="由内角和得"
          showAnswer
        />,
      );
      expect(screen.getByText("答案")).toBeTruthy();
      expect(screen.getByText(/第1空：150 \/ 150°；第2空：30/)).toBeTruthy();
      expect(screen.getByText("解析")).toBeTruthy();
      expect(screen.getByText(/由内角和得/)).toBeTruthy();
    });
    it("判断题答案渲染成正确 / 错误", () => {
      render(<QuestionCard stem="题干" type="judge" answer={false} showAnswer />);
      expect(screen.getByText(/错误/)).toBeTruthy();
    });
  });

  it("有质量标记时亮出警示边条与标记名", () => {
    const { container } = render(<QuestionCard stem="题干" issues={[{ label: "选项不全" }]} />);
    expect(screen.getByText("选项不全")).toBeTruthy();
    expect(container.querySelector(".border-l-warning")).toBeTruthy();
  });

  it("无质量标记时不加边条", () => {
    const { container } = render(<QuestionCard stem="题干" />);
    expect(container.querySelector(".border-l-warning")).toBeNull();
  });

  it("compact 模式收起小问与出处", () => {
    render(<QuestionCard stem="题干" parts={["(1)第一问"]} source="某书 p3" compact />);
    expect(screen.queryByText("(1)第一问")).toBeNull();
    expect(screen.queryByText("某书 p3")).toBeNull();
  });
});
```

`ConfigProvider` 的导入路径以 `packages/ui/src/config/config-provider.test.tsx` 里的写法为准（同目录 `config-provider`）。

- [ ] **Step 6: 跑测试与 typecheck**

Run: `cd packages/ui && npx vitest run src/question-card src/question && pnpm --filter @hulianui/ui typecheck`
Expected: 全部 PASS。若 `warnOnce` 在同一进程只打一次导致「kind 告警」用例在**多文件并发**下偶发不命中：把该用例改为只断言渲染结果（`填空`），告警断言移除——`warnOnce` 的去重是进程级设计，不该为测试去掉。

- [ ] **Step 7: 全量 showcase / SSR 守卫（QuestionCard showcase 仍用 `kind`，要一起改）**

打开 `packages/ui/src/question-card/question-card.showcase.tsx`，把所有 `kind="choice"` → `type="single"`、`kind="fill"` → `type="blank"`、`kind="solution"` → `type="essay"`、`kind="judge"` → `type="judge"`，`options` 里的 `label:` → `key:`；`code` 字符串里同样替换。然后：

Run: `cd packages/ui && npx vitest run src/question-card src/showcase 2>&1 | tail -5`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/question-card/question-card.types.ts packages/ui/src/question-card/question-card.client.tsx packages/ui/src/question-card/question-card.tsx packages/ui/src/question-card/question-card.test.tsx packages/ui/src/question-card/question-card.showcase.tsx packages/ui/src/math/index.ts
git commit -m "feat(ui/math): QuestionCard 迁到七型 type（kind 弃用一版）并补答案/解析展示槽

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

---

### Task 9: 文档（question-card md 中英）、changeset、门禁

**Files:**
- Modify: `packages/ui/src/question-card/question-card.md`
- Modify: `packages/ui/src/question-card/question-card.en.md`
- Modify: `packages/ui/src/math/math.md` / `math.en.md`（导入表补一行）
- Create: `.changeset/math-question-phase1.md`

- [ ] **Step 1: 更新 `question-card.md` 的 Props 表（替换整张表）**

```markdown
| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `stem` | `string` | - | 题干，支持 LaTeX 记号与填空槽 `____`，由 Formula 排版 |
| `number` | `ReactNode` | - | 原书题号 |
| `type` | `"single" \| "multiple" \| "judge" \| "blank" \| "short_answer" \| "calculation" \| "essay"` | - | 题型（七型枚举），决定标签文案与语气色；文案走 Locale `question.types` |
| `kind` | `"choice" \| "fill" \| "solution" \| "judge"` | - | **已弃用**，改用 `type`。映射 choice→single / fill→blank / solution→essay；下一个 minor 移除 |
| `typeLabel` | `ReactNode` | - | 覆盖题型标签文案 |
| `kindLabel` | `ReactNode` | - | **已弃用**，改用 `typeLabel` |
| `difficulty` | `ReactNode` | - | 分层标签（A 组 / 基础 / 拔高） |
| `options` | `{ key, text }[]` | - | 选择题选项，`text` 支持 LaTeX 记号；旧形状 `{ label, text }` 仍接受一个 minor |
| `parts` | `string[]` | - | 小问 (1)(2)(3) |
| `figure` | `{ src, alt? }` | - | 附图 |
| `answer` | `QuestionAnswer` | - | 答案；形状见 `@hulianui/ui/math` 的 `QuestionAnswer`。只有 `showAnswer` 为真才渲染 |
| `analysis` | `string` | - | 解析，支持 LaTeX 记号。只有 `showAnswer` 为真才渲染 |
| `showAnswer` | `boolean` | `false` | 渲染答案与解析区。学生作答前必须关 |
| `chapter` / `source` | `ReactNode` | - | 章节归属 / 出处，落在页脚 |
| `topics` | `string[]` | - | 知识点，渲染成 Chip |
| `issues` | `{ label, tone? }[]` | - | 质量标记，非空时亮左侧警示边条 |
| `actions` | `ReactNode` | - | 右上角操作区 |
| `compact` | `boolean` | `false` | 收起小问与页脚，用于长列表 |
```

并在「禁忌 / 坑」末尾追加两条：

```markdown
- **`showAnswer` 默认关，学生端不要开**。答案与解析一旦随卡片渲染就等于泄题；练习 / 作业页只在服务端回了判分结果之后再开。
- **`type` 是七型枚举不是自由字符串**。简答 / 计算 / 解答是三个不同题型（简答短、计算可分步给分、解答是综合证明），别把它们都塞进 `essay`；旧的四型 `kind` 只保留到下一个 minor。
```

示例块里的 `kind="fill"` 一并改成 `type="blank"`。

- [ ] **Step 2: `question-card.en.md` 做同样的表与两条坑位（英文）**

```markdown
| `type` | `"single" \| "multiple" \| "judge" \| "blank" \| "short_answer" \| "calculation" \| "essay"` | - | Question type (closed enum). Drives the tag copy and tone; copy comes from the `question.types` locale table |
| `kind` | `"choice" \| "fill" \| "solution" \| "judge"` | - | **Deprecated**, use `type`. Maps choice→single, fill→blank, solution→essay; removed in the next minor |
| `typeLabel` | `ReactNode` | - | Overrides the type tag copy |
| `kindLabel` | `ReactNode` | - | **Deprecated**, use `typeLabel` |
| `options` | `{ key, text }[]` | - | Choices; `text` accepts LaTeX. The legacy `{ label, text }` shape is still accepted for one minor |
| `answer` | `QuestionAnswer` | - | Answer key; see `QuestionAnswer` in `@hulianui/ui/math`. Rendered only when `showAnswer` is true |
| `analysis` | `string` | - | Explanation, accepts LaTeX. Rendered only when `showAnswer` is true |
| `showAnswer` | `boolean` | `false` | Renders the answer and explanation block. Keep it off before a student has answered |
```

坑位：

```markdown
- **`showAnswer` defaults to off; never turn it on in the student view.** Rendering the key with the card leaks the answer; practice and homework pages only enable it after the server has returned the grading result.
- **`type` is a closed seven-value enum, not free text.** Short answer, calculation, and extended response are three different types (short, step-scored, comprehensive proof); do not collapse them into `essay`. The old four-value `kind` is kept for one more minor only.
```

- [ ] **Step 3: `math.md` / `math.en.md` 导入表补一行**

在「导入」代码块里追加：

```ts
import {
  gradeObjective, validateQuestion, normalizeOptions, splitStemFigures, answerText,
  type Question, type QuestionAnswer,
} from "@hulianui/ui/math"   // 题目域纯函数（阶段 2–5 的编辑器 / 作答卡也从这里导出）
```

- [ ] **Step 4: 写 changeset**

```markdown
---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增题目域的类型与纯函数：`Question` / `QuestionType`（七型枚举 `single / multiple / judge / blank / short_answer / calculation / essay`）/ `QuestionAnswer`，以及 `validateQuestion`、`defaultShape`、`normalizeOptions`、`blankCount`、`splitStemFigures`、`toWireAnswer` / `fromWire`、`answerText`、`gradeObjective`（客观题判分，默认档与消费方服务端逐字同口径，归一与容差 opt-in）。判分与切图各带一份跨语言契约 fixture（`grade.contract.json` / `stem-figures.contract.json`），供 Python 侧对账。

`QuestionCard`：`kind`（四型）弃用，改用 `type`（七型）；旧值仍映射一个 minor 并在开发期告警。新增 `answer` / `analysis` / `showAnswer`（默认关）展示答案与解析；`options` 改为 `{ key, text }`，旧 `{ label, text }` 仍接受一个 minor。题型标签与答案区文案接入 Locale（新增 `question` 词条）。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains the question domain types and pure functions: `Question` / `QuestionType` (a closed enum of `single / multiple / judge / blank / short_answer / calculation / essay`) / `QuestionAnswer`, plus `validateQuestion`, `defaultShape`, `normalizeOptions`, `blankCount`, `splitStemFigures`, `toWireAnswer` / `fromWire`, `answerText`, and `gradeObjective` (objective grading whose default tier matches the consumer's server logic word for word; normalisation and numeric tolerance are opt-in). Grading and figure extraction each ship a cross-language contract fixture (`grade.contract.json` / `stem-figures.contract.json`) for the Python side to verify against.

`QuestionCard`: `kind` (four values) is deprecated in favour of `type` (seven values); old values still map for one minor and warn in development. New `answer` / `analysis` / `showAnswer` (off by default) render the key and explanation; `options` becomes `{ key, text }`, with the legacy `{ label, text }` shape accepted for one more minor. Type tag and answer copy now come from the locale (new `question` entries).
<!-- changelog-en:end -->
```

- [ ] **Step 5: 跑门禁**

Run（仓库根目录）：

```bash
pnpm docs:all
pnpm docs:check:props
pnpm docs:i18n:check
pnpm showcase:check
pnpm conventions:check
pnpm check:remote-assets
pnpm --filter @hulianui/ui typecheck
cd packages/ui && npx vitest run src/question src/question-card src/config src/showcase && cd ../..
CI=1 pnpm size 2>&1 | tail -20
```

Expected：全部 PASS；`pnpm size` 里主入口 `@hulianui/ui` 的体积与基线相同（题目域没进主 barrel），`@hulianui/ui/math` 入口有增量属预期——若尺子要求更新基线，跑 `pnpm size:update` 并把基线文件一起提交。`docs:all` 的产物 diff 只应含 question-card / math 相关条目，出现别的组件条目说明混进了其它会话的 WIP，不要提交那些行。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-card/question-card.md packages/ui/src/question-card/question-card.en.md packages/ui/src/math/math.md packages/ui/src/math/math.en.md .changeset/math-question-phase1.md
git add apps/www/public/llms.txt apps/www/public/llms-full.txt apps/www/public/llms-props.json apps/www/public/registry.json packages/ui/conventions.json packages/guard/conventions.json apps/www/generated/showcase-en/question-card.showcase.tsx
git commit -m "docs(ui/math): QuestionCard 七型 type 与答案槽文档、题目域 changeset

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3"
```

（若某个生成产物没有变化，`git add` 会静默跳过，不影响。若 `pnpm size:update` 改了基线文件，一并 `git add` 该文件。）

---

## 自查记录（写完计划后对照 spec）

- Spec §3.1 目录：Task 1–7 覆盖 `question/` 全部纯函数文件；`question-editor.tsx` / `question-answer.tsx` / `math-textarea/` / `math-field/` 属阶段 2–5，不在本计划。
- Spec §3.2 类型：Task 1 逐字落地；`StudentAnswer` 已定义供阶段 4。
- Spec §3.3 QuestionCard 迁移：Task 8（`kind` deprecated + 映射 + warnOnce；`answer` / `analysis` / `showAnswer`；`options` 双形状）。
- Spec §6.2 判分三档 + 契约：Task 6。
- Spec §8.1 测试：每个模块表驱动；QuestionCard Locale 切换用例；无布局断言故无 browser test。
- Spec §8.2 文档：Task 9（question-card md 中英、math.md 导入表、changeset 中英段）。`question.md` 整份新文档在阶段 3/4 随组件一起写。
- 类型一致性：`QuestionOption { key, text }` 在 Task 1 定义、Task 2/4/8 消费；`QuestionLocale` 在 Task 5 定义、Task 8 消费；`GradeOptions` 在 Task 6 定义、`exports.test` 与阶段 4 消费。
