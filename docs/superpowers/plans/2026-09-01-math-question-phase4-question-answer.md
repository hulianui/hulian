# 数学题件 · 阶段 4：QuestionAnswer（学生作答卡）+ 判分接线 — 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 5069tk-app 学生端「一道题」的作答卡（`web/components/h5/question-card.tsx` + `web/lib/practice-answer.ts` + `web/lib/question-options.ts`）回流成 `@hulianui/ui/math` 的 `QuestionAnswer`：按题型给对的作答控件（single → RadioGroup / multiple → CheckboxGroup / judge → 题型自带两项 / blank → 每空一个输入框 / 选项缺失 → 明说做不了 / 主观题 → 只读 + 需批阅），`canSubmit` 门禁，`onSubmit` 给了才出提交按钮，`result` 区显示正误 + 正确答案 + 解析；`gradeObjective`（阶段 1 已落地）在 showcase 与文档里接线演示即时反馈。消费方原型里三条曾静默让学生「答不了」的 bug 各有一条回归测试守着。

**Architecture:** 新目录 `packages/ui/src/question-answer/`。「这道题该用哪种控件 / 几个空 / 能不能交 / 当前作答的规范形」全部是纯函数（`question-answer.state.ts`），组件只剩「哪种 kind 渲染哪组控件」。词条独立成 `question-answer.locale.ts`（`config/locale.ts` 反向引用，与 `question.locale.ts` / `question-editor.locale.ts` 同一处方）。题干渲染与 QuestionCard **同源**：把 QuestionCard 里「正文 Formula + `resolveFigure` 切图」那一块抽成 `question-card/question-stem-block.tsx` 的 `QuestionStemBlock`，两件共用（QuestionCard 行为逐字不变，既有测试守着）。题型标签复用 `question-card.client.tsx` 的 `QuestionTypeTag`。`mathField` 注入沿用阶段 2 的 `MathFieldLikeProps`（本阶段给它加一个可选 `disabled`，阶段 5 MathField 实现）。

**Tech Stack:** TypeScript 5.9 / React 19 / vitest（unit = jsdom）/ Tailwind v4 / 阶段 1 的 `question/` 纯函数域（`normalizeOptions` / `blankCount` / `decodeBlanks` / `answerText` / `gradeObjective`）/ 库内 Card、RadioGroup、Radio、CheckboxGroup、Checkbox、Field、Input、Alert、Button、Tag、Text、Image、Formula。

Spec：`docs/superpowers/specs/2026-08-31-math-question-authoring-design.md` §6.1、§7、§8。回流原型：`/Users/zhangzhiwei/Desktop/code/5069tk-app/web/components/h5/question-card.tsx`（三条静默 bug 的注释）、`web/lib/practice-answer.ts`（`answerKind` / `blankCount` / `canSubmit` / `JUDGE_OPTIONS`）、`web/lib/question-options.ts`（已在阶段 1 回流为 `normalizeOptions`）。上游产物：`packages/ui/src/question/`、`packages/ui/src/question-card/`、`packages/ui/src/math-textarea/math-textarea.types.ts`、`packages/ui/src/question-editor/`（分节子件 / locale / showcase / 测试的写法当模板）。

## Global Constraints

- 目录 `packages/ui/src/question-answer/`（`question/` 在 `scripts/gen-component-docs.mjs` 的 SKIP_DIRS 里，是纯函数域，组件不进去）。一切从 `packages/ui/src/math/index.ts` 导出；主 barrel `packages/ui/src/index.ts` **一个都不加**。
- 文案走 Locale：新建 `question-answer/question-answer.locale.ts`（`QuestionAnswerLocale` + `QUESTION_ANSWER_LOCALE_ZH/EN`），`config/locale.ts` 的 `ComponentLocale` 加 `questionAnswer?:`，`zhCN` / `enUS` 都接。组件里 `useComponentLocale().questionAnswer ?? QUESTION_ANSWER_LOCALE_ZH`；题型名与判断题「正确 / 错误」从 `useComponentLocale().question ?? QUESTION_LOCALE_ZH` 取，不重复定义。**禁止**在 `question-answer/` 任何文件 import `../config/locale`（会把 28KB 整份字典拖进 math 入口；`bash scripts/bundle-size.sh --why math` 可归因）。
- 界面文案写「状态」不写「机制」：占位符 / 说明 / 按钮用短名词短语或一句状态句。英文里不许有 CJK 与 em-dash。
- 纯函数不产出文案。
- 图标只从 `packages/ui/src/_icons`（`index.tsx`）取：来源说明行用已有的 `Info`（库内没有 Lightbulb，不加）；难度用文本 `★`。不 import `lucide-react`。
- 色彩 / 背景只用本库 token（`text-muted` / `text-primary` / `border-border` / `bg-white`）；**不用** `bg-muted`、`text-muted-foreground`、`bg-background`、`bg-card`（不是本库 token，静默回退）；组件里**不写 `style=`**、不写 `!` 类。
- 开发期告警用 `warnOnce`（`packages/ui/src/lib/warn-once.ts`），key 不拼可变值。本阶段两处：未知 `type`（`question-answer:unknown-type`）、`blankInput="math"` 没给 `mathField`（`question-answer:math-field-missing`）。
- `docs:check:props` 只看 `<slug>/*.types.ts` 里 `Props` / `Item` 结尾的导出接口：`QuestionAnswerProps` 每个字段都要进 md 表；`AnswerableQuestion` / `QuestionAnswerResult` 刻意不以 Props 结尾（在 md 里另起小节说明）。**`MathFieldLikeProps` 加字段后 `math-textarea.md` / `.en.md` 的契约表必须同步加行**（它以 Props 结尾，在 `math-textarea/*.types.ts` 里，门禁会查）。
- Field 内放一组 Radio / Checkbox 会被外层 Field 标签吞掉每一项的无障碍名（阶段 3 实测）。本件的选项组**不放在 Field 里**（题干就是问题，不需要再有一个标签），直接 `RadioGroup` / `CheckboxGroup` 带 `aria-label`；Task 4 有测试断言每个选项的无障碍名就是它自己那一行。多空填空每空一个 `Field`（一个 Field 一个控件，不触发该问题）。
- Radio / Checkbox 的 label 用 `<Formula>`，**不再加 `aria-label`**（Base UI 已把无障碍名指向可见 label，再加会变成「A. 甲 A. 甲」）。
- **体积基线**：`scripts/size-limits.json` 里 `math` 现在实测 180.5KB / 上限 208KB。本件新带进 `export *` 上界的只有 `radio/`（RadioGroup + Radio）与 `input/`（其余 Alert / Button / Card / Checkbox / CheckboxGroup / Field / Tag / Text / Image 阶段 3 已在），预计实测 188–196KB，**大概率不超 208KB**。Task 5 量完：不超就不动基线；超了先 `--why math` 确认没有 `config/locale.ts`、增量只是上述 UI 件，再**手改** `math` 那一行为 `ceil(实测 × 1.15)`（**不要用 `--update`**：它会重写全部 14 条基线）。
- 测试：`*.test.ts(x)` 走 jsdom；不写 browser test。Radio 是 `role="radio"`，按可见文字 `getByRole("radio", { name })`；Checkbox 是 `role="checkbox"`；Field 内 Input 用 `getByLabelText(label)`；带 `aria-label` 的 Input 也用 `getByLabelText`。`warnOnce` 同 key 整个进程只打一次：一个 key 只在一个测试里触发，用 `vi.spyOn(console, "warn")`。
- 每个任务结束 `git add <具体文件>` 再 commit，**不许** `git add -A`（工作区 `packages/ui/src/upload/upload.tsx` 是主人拍板「留着不动」的未提交改动，不要碰、不要还原、不要连带提交）。commit message 末尾带：
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_014GoPuBKUqqvHJSnvLAfUrT`
- 命令：单测 `cd packages/ui && npx vitest run <path>`；typecheck `pnpm --filter @hulianui/ui typecheck`；体积 `CI=1 pnpm size`（必须带 `CI=1`）。
- 分支：`git checkout -b feat/math-question-phase4` 从 master 起；全部任务完成、门禁全绿后 `git checkout master && git merge --ff-only feat/math-question-phase4`，不 push。
- 生成顺序（阶段 2/3 实测）：中英 md 必须**先于** `pnpm docs:all` 存在；perf-lab 重生成必须**在** `pnpm docs:all` 之后。
- JSX 属性字符串不处理 `\\`：showcase / 测试里含反斜杠的值写在 TS 字符串常量里。英文 md 用法段用 `## Examples` 不用 `## Usage`。showcase 英文词表 `protectedTokens` 对数字紧贴 `$`（`0$`）报 missing，示例公式一律不以数字收尾；showcase 生成器对 TS 字符串里的 `\n` 分行取键，多行 stem 只用第一行当词条键。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `packages/ui/src/question-answer/question-answer.types.ts` | `AnswerableQuestion`（学生端题面，无答案）、`QuestionAnswerResult`、`QuestionAnswerProps` |
| `packages/ui/src/question-answer/question-answer.state.ts` | 纯函数：`answerKind` / `isKnownQuestionType` / `resolveBlankCount` / `canSubmit` / `blankValues` / `setBlank` / `choiceKeys` / `choiceKey` / `currentAnswer` |
| `packages/ui/src/question-answer/question-answer.locale.ts` | `QuestionAnswerLocale` + 中英预设（SSOT） |
| `packages/ui/src/config/locale.ts` | `ComponentLocale.questionAnswer?` + `zhCN` / `enUS` 接线 |
| `packages/ui/src/math-textarea/math-textarea.types.ts` | `MathFieldLikeProps` 加 `disabled?: boolean` |
| `packages/ui/src/math-textarea/math-textarea.md` / `.en.md` | 契约表加 `disabled` 行 |
| `packages/ui/src/question-card/question-stem-block.tsx` | `QuestionStemBlock`：正文 Formula + `resolveFigure` 切图（从 QuestionCard 抽出，RSC 安全、无 hook） |
| `packages/ui/src/question-card/question-card.tsx` | 改用 `QuestionStemBlock`（行为不变） |
| `packages/ui/src/question-answer/question-answer.tsx` | `QuestionAnswer` 主件 |
| `packages/ui/src/question-answer/index.ts` | 目录 barrel |
| `packages/ui/src/math/index.ts` | 转出 question-answer 公开件 |
| `packages/ui/src/question-answer/question-answer.showcase.tsx` | 画廊（含 `gradeObjective` 即时反馈示例、`mathField` 注入示例） |
| `packages/ui/src/showcase.ts` | 注册 showcase |
| `apps/www/i18n/showcase-copy.en.json` | showcase 英文词条（exact） |
| `apps/www/generated/showcase-en/*` | `pnpm showcase:generate` 产物 |
| `packages/ui/src/question-answer/question-answer.md` / `.en.md` | 文档 |
| `packages/ui/src/math/math.md` / `.en.md`、`question-editor/question-editor.md` / `.en.md` | 题目域段落与「相关」加 QuestionAnswer，去掉「阶段 4」占位 |
| `apps/www/lib/manifest.ts` / `apps/www/lib/registry.tsx` / `apps/www/i18n/component-meta.en.ts` | 画廊三处注册 |
| `apps/perf-lab/scenarios/generated.ts` | 重生成（不手改） |
| `.changeset/question-answer.md`、`README.md` 等三处计数 | 发版记录 + 计数 398 |

---

### Task 0: 起分支

- [ ] **Step 1: 确认工作区只有 upload.tsx 一处改动，起分支**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git status --short
# 期望只有：  M packages/ui/src/upload/upload.tsx
git checkout -b feat/math-question-phase4
```

---

### Task 1: 类型 + 纯函数 `question-answer.state.ts`

**Files:**
- Create: `packages/ui/src/question-answer/question-answer.types.ts`
- Create: `packages/ui/src/question-answer/question-answer.state.ts`
- Test: `packages/ui/src/question-answer/question-answer.state.test.ts`

**Interfaces:**
- Consumes：`normalizeOptions` / `blankCount`（`../question/question-shape`）、`decodeBlanks`（`../question/question-wire`）、`QUESTION_TYPES` / `QuestionType` / `StudentAnswer` / `Question` / `QuestionAnswer`（`../question/question.types`）、`MathFieldLikeProps`（`../math-textarea/math-textarea.types`）。
- Produces：
  - `AnswerableQuestion { type: QuestionType | (string & {}); stem: string; options: QuestionOption[] | null; blankCount?: number; difficulty?: number; topics?: string[] }`
  - `QuestionAnswerResult { correct: boolean; correctAnswer: QuestionAnswer; analysis?: string }`
  - `QuestionAnswerProps`（见下）
  - `type AnswerKind = "single" | "multiple" | "judge" | "blank" | "subjective" | "unanswerable"`
  - `answerKind(q: Pick<AnswerableQuestion, "type" | "options">): AnswerKind`
  - `isKnownQuestionType(type: string): type is QuestionType`
  - `resolveBlankCount(q: Pick<AnswerableQuestion, "stem" | "blankCount">): number`
  - `canSubmit(answer: StudentAnswer | undefined): boolean`
  - `blankValues(value: StudentAnswer | undefined, count: number): string[]`
  - `setBlank(values: string[], index: number, text: string): string[]`
  - `choiceKeys(value: StudentAnswer | undefined): string[]`
  - `choiceKey(value: StudentAnswer | undefined): string`
  - `currentAnswer(kind: AnswerKind, value: StudentAnswer | undefined, blanks: number): StudentAnswer`

- [ ] **Step 1: 写类型文件**

```ts
// packages/ui/src/question-answer/question-answer.types.ts
import type { ComponentType, ReactNode } from "react";
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";
import type { Question, QuestionAnswer, QuestionType, StudentAnswer } from "../question/question.types";

/**
 * 学生端拿到的题面：题型、题干、选项与几个展示字段，**没有答案与解析的位置**
 * （没答的题带答案回来等于泄题，类型上就不给这个坑）。
 * `type` 允许库不认识的字符串：后端加了题型而前端还没升级时按主观题只读处理并有开发期告警，不能白屏。
 */
export interface AnswerableQuestion extends Pick<Question, "stem" | "options"> {
  type: QuestionType | (string & {});
  /** 填空题的空数（其余题型忽略）。缺失或不合法时按题干里 `____` 的个数，再不行按 1。 */
  blankCount?: number;
  /** 1–5，渲染成星。 */
  difficulty?: number;
  /** 知识点标签。 */
  topics?: string[];
}

/** 服务端判完回来的结果。`correctAnswer` 用 `answerText` 渲染成文字，`analysis` 走 Formula。 */
export interface QuestionAnswerResult {
  correct: boolean;
  correctAnswer: QuestionAnswer;
  analysis?: string;
}

export interface QuestionAnswerProps {
  question: AnswerableQuestion;
  /**
   * 受控作答：填空为逐空数组（单空也是一项数组），多选为 key 数组，单选 / 判断为字符串
   * （判断是 `"true" | "false"`）。续做时可直接传服务端记的字符串：多空的 JSON 数组字面量会被解开，
   * 多选的 `"A,C"` 会被拆成数组。
   */
  value: StudentAnswer | undefined;
  onChange: (next: StudentAnswer) => void;
  /** 有值 = 已作答：控件锁定、显示正误 / 正确答案 / 解析、提交按钮变「已提交」。 */
  result?: QuestionAnswerResult | null;
  /** 给了才出提交按钮。参数是规范形：填空恒为数组（单空压平交给 `encodeBlanks`），多选为 key 数组。 */
  onSubmit?: (answer: StudentAnswer) => void;
  /** 提交中：按钮转圈、控件锁定。@default false */
  pending?: boolean;
  /** @default false */
  disabled?: boolean;
  /** 自定义题干渲染。缺省与 QuestionCard 同一条路径（`resolveFigure` 切图 + Formula）。 */
  renderStem?: (stem: string) => ReactNode;
  /** 题干里 `![](key)` → 可显示 URL。缺省题干渲染用；给了 `renderStem` 则忽略。 */
  resolveFigure?: (key: string) => string;
  /** 填空的输入控件：`text` 普通输入框；`math` 用 `mathField` 注入的可视化公式编辑器。@default "text" */
  blankInput?: "text" | "math";
  /** `blankInput="math"` 时必给（`@hulianui/ui/math-field` 的 MathField 满足此契约）。没给则回落成文本输入框并有开发期告警。 */
  mathField?: ComponentType<MathFieldLikeProps>;
  /** 顶部标签行右侧的内容（题号 / 出处 / 计时）。 */
  header?: ReactNode;
  /** 题干上方的来源说明行（推荐理由 / 「老师布置的 A 层作业」）。 */
  reason?: ReactNode;
  /** 答对时结果区里那句话（练习说「下次不会再推给你」，作业不说，所以由页面给）。 */
  correctHint?: ReactNode;
  className?: string;
}
```

- [ ] **Step 2: 写表驱动测试**

```ts
// packages/ui/src/question-answer/question-answer.state.test.ts
import { describe, expect, it } from "vitest";
import {
  answerKind,
  blankValues,
  canSubmit,
  choiceKey,
  choiceKeys,
  currentAnswer,
  isKnownQuestionType,
  resolveBlankCount,
  setBlank,
} from "./question-answer.state";

describe("answerKind：这道题该用哪种作答控件", () => {
  it.each([
    // 回归 #150：判断题的 options 在题库里是 null，它不能掉进「从 options 取选项」的分支
    [{ type: "judge", options: null }, "judge"],
    [{ type: "blank", options: null }, "blank"],
    // 回归 #136：对象形 options 不能被滤成空
    [{ type: "single", options: [{ key: "A", text: "甲" }, { key: "B", text: "乙" }] }, "single"],
    [{ type: "multiple", options: [{ key: "A", text: "甲" }, { key: "B", text: "乙" }] }, "multiple"],
    [{ type: "single", options: null }, "unanswerable"],
    [{ type: "multiple", options: [] }, "unanswerable"],
    [{ type: "short_answer", options: null }, "subjective"],
    [{ type: "calculation", options: null }, "subjective"],
    [{ type: "essay", options: null }, "subjective"],
    // 未知题型按主观题只读
    [{ type: "matching", options: null }, "subjective"],
  ] as const)("%j → %s", (question, expected) => {
    expect(answerKind(question)).toBe(expected);
  });

  it("字符串形 options（历史数据）也算有选项", () => {
    expect(answerKind({ type: "single", options: ["A. 甲", "B. 乙"] as never })).toBe("single");
  });
});

describe("isKnownQuestionType", () => {
  it("七型认识，其余不认识", () => {
    for (const t of ["single", "multiple", "judge", "blank", "short_answer", "calculation", "essay"]) {
      expect(isKnownQuestionType(t)).toBe(true);
    }
    expect(isKnownQuestionType("matching")).toBe(false);
    expect(isKnownQuestionType("")).toBe(false);
  });
});

describe("resolveBlankCount：这道填空题该给几个输入框", () => {
  it.each([
    [{ stem: "a____b", blankCount: 3 }, 3],
    // blankCount 缺失 / 不合法：按题干里的 ____ 数
    [{ stem: "甲____乙____丙" }, 2],
    [{ stem: "甲____乙____丙", blankCount: 0 }, 2],
    [{ stem: "甲____乙", blankCount: 2.5 }, 1],
    [{ stem: "甲____乙", blankCount: -1 }, 1],
    // 都没有：按 1 兜底，绝不猜
    [{ stem: "没有下划线的老题" }, 1],
    // 单个下划线是下标不是空
    [{ stem: "$a_1$ 的值" }, 1],
  ])("%j → %d", (question, expected) => {
    expect(resolveBlankCount(question)).toBe(expected);
  });
});

describe("canSubmit：这份作答能不能交", () => {
  it.each([
    [undefined, false],
    ["", false],
    ["  ", false],
    ["A", true],
    ["true", true],
    [[], false],
    [["1", ""], false],
    [[" "], false],
    // 多空每个空都要填了才让交
    [["1", "2"], true],
    [["7"], true],
  ])("%j → %s", (answer, expected) => {
    expect(canSubmit(answer)).toBe(expected);
  });
});

describe("blankValues：把 value 归一成「每空一项」", () => {
  it("undefined → count 个空串", () => {
    expect(blankValues(undefined, 2)).toEqual(["", ""]);
  });
  it("数组短了补空、长了截断", () => {
    expect(blankValues(["a"], 2)).toEqual(["a", ""]);
    expect(blankValues(["a", "b", "c"], 2)).toEqual(["a", "b"]);
  });
  it("续做：服务端记的多空 JSON 字面量解开", () => {
    expect(blankValues('["150","30"]', 2)).toEqual(["150", "30"]);
  });
  it("续做：单空不解析 JSON（区间 [1,2] 是正常答案）", () => {
    expect(blankValues("[1,2]", 1)).toEqual(["[1,2]"]);
  });
  it("续做：解析不了整串进第一个空", () => {
    expect(blankValues("150,30", 2)).toEqual(["150,30", ""]);
  });
});

describe("setBlank", () => {
  it("只改那一空，不改原数组", () => {
    const before = ["a", "b"];
    expect(setBlank(before, 1, "c")).toEqual(["a", "c"]);
    expect(before).toEqual(["a", "b"]);
  });
});

describe("choiceKeys / choiceKey", () => {
  it.each([
    [["A", "C"], ["A", "C"]],
    ["A,C", ["A", "C"]],
    ["A，C", ["A", "C"]],
    ["A C", ["A", "C"]],
    ["", []],
    [undefined, []],
  ])("choiceKeys(%j) → %j", (value, expected) => {
    expect(choiceKeys(value)).toEqual(expected);
  });
  it.each([
    ["A", "A"],
    ["true", "true"],
    [["A"], ""],
    [undefined, ""],
  ])("choiceKey(%j) → %j", (value, expected) => {
    expect(choiceKey(value)).toBe(expected);
  });
});

describe("currentAnswer：提交与 canSubmit 用的规范形", () => {
  it("填空恒为逐空数组（单空也是一项数组）", () => {
    expect(currentAnswer("blank", undefined, 2)).toEqual(["", ""]);
    expect(currentAnswer("blank", ["7"], 1)).toEqual(["7"]);
  });
  it("多选为 key 数组", () => {
    expect(currentAnswer("multiple", "A,C", 1)).toEqual(["A", "C"]);
  });
  it("单选 / 判断为字符串", () => {
    expect(currentAnswer("single", "B", 1)).toBe("B");
    expect(currentAnswer("judge", "true", 1)).toBe("true");
    expect(currentAnswer("judge", undefined, 1)).toBe("");
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-answer/question-answer.state.test.ts
```
期望：FAIL（`Cannot find module './question-answer.state'`）。

- [ ] **Step 4: 写纯函数**

```ts
// packages/ui/src/question-answer/question-answer.state.ts
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
    return normalizeOptions(question.options).length > 0 ? type : "unanswerable";
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
```

- [ ] **Step 5: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/question-answer/question-answer.state.test.ts && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS；typecheck 0 错误。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-answer/question-answer.types.ts packages/ui/src/question-answer/question-answer.state.ts packages/ui/src/question-answer/question-answer.state.test.ts
git commit -m "feat(ui/math): QuestionAnswer 类型与作答判据纯函数（answerKind/resolveBlankCount/canSubmit/blankValues/currentAnswer）"
```

---

### Task 2: Locale 词条 + `config/locale.ts` 接线

**Files:**
- Create: `packages/ui/src/question-answer/question-answer.locale.ts`
- Modify: `packages/ui/src/config/locale.ts`（import 区、`ComponentLocale` 的 `questionEditor?:` 之后、`zhCN` / `enUS` 的 `questionEditor:` 之后）
- Test: `packages/ui/src/question-answer/question-answer.locale.test.ts`

**Interfaces:**
- Produces：`QuestionAnswerLocale`、`QUESTION_ANSWER_LOCALE_ZH`、`QUESTION_ANSWER_LOCALE_EN`；`ComponentLocale.questionAnswer?: QuestionAnswerLocale`。

- [ ] **Step 1: 写词条测试**

```ts
// packages/ui/src/question-answer/question-answer.locale.test.ts
import { describe, expect, it } from "vitest";
import { enUS, zhCN } from "../config/locale";
import { QUESTION_ANSWER_LOCALE_EN, QUESTION_ANSWER_LOCALE_ZH } from "./question-answer.locale";

const CJK = /[㐀-䶿一-鿿]/u;

/** 把词条表压成字符串数组：函数按代表性参数调一次。 */
function flatten(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const f = value as (...args: unknown[]) => unknown;
    return [...flatten(f(2, 3)), ...flatten(f(1, 1))];
  }
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(flatten);
  return [];
}

describe("QuestionAnswer 词条", () => {
  it("中英键集合一致", () => {
    expect(Object.keys(QUESTION_ANSWER_LOCALE_EN).sort()).toEqual(Object.keys(QUESTION_ANSWER_LOCALE_ZH).sort());
  });

  it("英文词条里没有中文", () => {
    for (const s of flatten(QUESTION_ANSWER_LOCALE_EN)) expect(s, s).not.toMatch(CJK);
  });

  it("单空不标空号，多空标", () => {
    expect(QUESTION_ANSWER_LOCALE_ZH.blankAria(1, 1)).not.toContain("1");
    expect(QUESTION_ANSWER_LOCALE_ZH.blankAria(2, 3)).toContain("2");
    expect(QUESTION_ANSWER_LOCALE_EN.blankAria(1, 1)).not.toContain("1");
    expect(QUESTION_ANSWER_LOCALE_EN.blankPlaceholder(2, 3)).toContain("2");
    expect(QUESTION_ANSWER_LOCALE_ZH.blankLabel(2)).toContain("2");
  });

  it("config/locale 的 zhCN / enUS 都接上了", () => {
    expect(zhCN.components?.questionAnswer).toBe(QUESTION_ANSWER_LOCALE_ZH);
    expect(enUS.components?.questionAnswer).toBe(QUESTION_ANSWER_LOCALE_EN);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-answer/question-answer.locale.test.ts
```
期望：FAIL（模块不存在）。

- [ ] **Step 3: 写词条文件**

```ts
// packages/ui/src/question-answer/question-answer.locale.ts
// QuestionAnswer 词条。单独成文件的理由与 question/question.locale.ts 相同：@hulianui/ui/math 入口
// 不能拖进 config/locale.ts 那份全库字典。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反向引用本文件。
// 题型名与判断题的「正确 / 错误」不在这里：它们在 question.locale.ts（QuestionCard / QuestionEditor 也用）。

export interface QuestionAnswerLocale {
  /** 选项组的无障碍名（题干就是问题，组本身不另配可见标签）。 */
  singleAria: string;
  multipleAria: string;
  judgeAria: string;
  /** 多空时每空的可见标签，如 (2) → "第 2 空"。单空不显示。 */
  blankLabel: (index: number) => string;
  /** 每空输入框的无障碍名；单空不带空号。 */
  blankAria: (index: number, total: number) => string;
  blankPlaceholder: (index: number, total: number) => string;
  /** 题干附图的 alt，如 (1) → "题目附图 1"。 */
  figureAlt: (index: number) => string;
  /** 难度星的无障碍名，如 (3) → "难度 3 / 5"。 */
  difficulty: (level: number) => string;
  /** 选择题选项没入库时的提示。 */
  unanswerableTitle: string;
  unanswerableBody: string;
  /** 主观题：只读题面下方那句。 */
  subjectiveNotice: string;
  submit: string;
  submitted: string;
  correctTitle: string;
  wrongTitle: string;
  /** 答错时正确答案前缀，如 "正确答案"。 */
  correctAnswer: string;
}

export const QUESTION_ANSWER_LOCALE_ZH: QuestionAnswerLocale = {
  singleAria: "单选作答",
  multipleAria: "多选作答",
  judgeAria: "判断作答",
  blankLabel: (index) => `第 ${index} 空`,
  blankAria: (index, total) => (total === 1 ? "填空作答" : `填空作答第 ${index} 空`),
  blankPlaceholder: (index, total) => (total === 1 ? "答案" : `第 ${index} 空的答案`),
  figureAlt: (index) => `题目附图 ${index}`,
  difficulty: (level) => `难度 ${level} / 5`,
  unanswerableTitle: "这道题暂时没法作答",
  unanswerableBody: "选项尚未录入",
  subjectiveNotice: "此题需教师批阅",
  submit: "提交答案",
  submitted: "已提交",
  correctTitle: "回答正确",
  wrongTitle: "回答错误",
  correctAnswer: "正确答案",
};

export const QUESTION_ANSWER_LOCALE_EN: QuestionAnswerLocale = {
  singleAria: "Single choice answer",
  multipleAria: "Multiple choice answer",
  judgeAria: "True or false answer",
  blankLabel: (index) => `Blank ${index}`,
  blankAria: (index, total) => (total === 1 ? "Blank answer" : `Blank ${index} answer`),
  blankPlaceholder: (index, total) => (total === 1 ? "Answer" : `Answer for blank ${index}`),
  figureAlt: (index) => `Figure ${index}`,
  difficulty: (level) => `Difficulty ${level} of 5`,
  unanswerableTitle: "This question cannot be answered yet",
  unanswerableBody: "Its options have not been entered",
  subjectiveNotice: "Graded by the teacher",
  submit: "Submit answer",
  submitted: "Submitted",
  correctTitle: "Correct",
  wrongTitle: "Incorrect",
  correctAnswer: "Correct answer",
};
```

- [ ] **Step 4: 接进 `config/locale.ts`**

三处，照 `questionEditor` 的样子：

```ts
// import 区（紧跟 question-editor.locale 那条 import 之后）
import {
  QUESTION_ANSWER_LOCALE_EN,
  QUESTION_ANSWER_LOCALE_ZH,
  type QuestionAnswerLocale,
} from "../question-answer/question-answer.locale";
```

```ts
// ComponentLocale 里 `questionEditor?: QuestionEditorLocale;` 之后
  /** 学生作答卡词条，SSOT 在 question-answer/question-answer.locale.ts（同 question 的理由）。 */
  questionAnswer?: QuestionAnswerLocale;
```

```ts
// zhCN.components 里 `questionEditor: QUESTION_EDITOR_LOCALE_ZH,` 之后
  questionAnswer: QUESTION_ANSWER_LOCALE_ZH,
// enUS.components 里 `questionEditor: QUESTION_EDITOR_LOCALE_EN,` 之后
  questionAnswer: QUESTION_ANSWER_LOCALE_EN,
```

定位命令：`grep -n "questionEditor" packages/ui/src/config/locale.ts`（应有 4 行：import、类型、zhCN、enUS）。

- [ ] **Step 5: 跑测试 + typecheck + 既有 locale 门禁测试**

```bash
cd packages/ui && npx vitest run src/question-answer/question-answer.locale.test.ts src/config && pnpm --filter @hulianui/ui typecheck
```
期望：全 PASS（`src/config` 里的 `locale-doc.test.ts` 若要求 `config.md` 列出所有 `ComponentLocale` 键，按它的报错把 `questionAnswer` 补进 `packages/ui/src/config/config.md` / `config.en.md` 与 `questionEditor` 同一位置；阶段 3 加 `questionEditor` 时若改过这两份 md，照抄格式）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-answer/question-answer.locale.ts packages/ui/src/question-answer/question-answer.locale.test.ts packages/ui/src/config/locale.ts
# 若 Step 5 改了 config.md / config.en.md 也一并 add
git commit -m "feat(ui/math): QuestionAnswer 词条（中英）并接入 config/locale"
```

---

### Task 3: 抽 `QuestionStemBlock`（题干同源渲染）+ `MathFieldLikeProps.disabled`

**Files:**
- Create: `packages/ui/src/question-card/question-stem-block.tsx`
- Modify: `packages/ui/src/question-card/question-card.tsx`（import 区 + `split` / `stemText` 两个 const + 题干与附图那一块 JSX）
- Modify: `packages/ui/src/math-textarea/math-textarea.types.ts`（`MathFieldLikeProps` 加一行）
- Modify: `packages/ui/src/math-textarea/math-textarea.md` / `.en.md`（`### MathFieldLikeProps` 表加一行）
- Test: `packages/ui/src/question-card/question-stem-block.test.tsx`（新）；`question-card.test.tsx` 既有两条 `resolveFigure` 测试守着行为不变

**Interfaces:**
- Produces：`QuestionStemBlock({ stem: string; resolveFigure?: (key: string) => string; figureAlt?: (index: number) => string })`，RSC 安全（无 hook）。`MathFieldLikeProps.disabled?: boolean`。

- [ ] **Step 1: 写失败测试**

```tsx
// packages/ui/src/question-card/question-stem-block.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionStemBlock } from "./question-stem-block";

describe("QuestionStemBlock", () => {
  it("resolveFigure 给了：切图渲染成 img，正文不再含图片语法，alt 走 figureAlt", () => {
    const { container } = render(
      <QuestionStemBlock
        stem={"如图，$AB \\parallel CD$。\n\n![](import/a.png)\n![](import/b.png)"}
        resolveFigure={(key) => `/files/${key}`}
        figureAlt={(i) => `Figure ${i}`}
      />,
    );
    const imgs = Array.from(container.querySelectorAll("img"));
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual(["/files/import/a.png", "/files/import/b.png"]);
    expect(imgs.map((img) => img.getAttribute("alt"))).toEqual(["Figure 1", "Figure 2"]);
    expect(container.textContent).not.toContain("![](");
  });

  it("resolveFigure 不给：题干原样交给排版，没有 img", () => {
    const { container } = render(<QuestionStemBlock stem={"看图 ![](import/a.png)"} />);
    expect(container.querySelector("img")).toBeNull();
  });

  it("figureAlt 缺省是中文「题目附图 N」（QuestionCard 旧行为）", () => {
    const { container } = render(
      <QuestionStemBlock stem={"![](import/a.png)"} resolveFigure={(key) => `/files/${key}`} />,
    );
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("题目附图 1");
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-card/question-stem-block.test.tsx
```
期望：FAIL（模块不存在）。

- [ ] **Step 3: 写 `QuestionStemBlock`**

```tsx
// packages/ui/src/question-card/question-stem-block.tsx
import { Image } from "../image";
import { Formula } from "../math/math";
import { splitStemFigures } from "../question/question-stem";
import { Text } from "../text";

/**
 * 题干的唯一渲染路径：正文交给 Formula，`![](key)` 由 `resolveFigure` 解析后按出现顺序渲染在正文之后。
 * QuestionCard（题库 / 预览）与 QuestionAnswer（学生作答）共用这一块，同一份 stem 在两端看到的必须一样。
 * 刻意无 hook：QuestionCard 是 RSC 安全的，这里也得是。
 */
export function QuestionStemBlock({
  stem,
  resolveFigure,
  figureAlt = (index) => `题目附图 ${index}`,
}: {
  stem: string;
  resolveFigure?: (key: string) => string;
  figureAlt?: (index: number) => string;
}) {
  // 先切图再排公式：storage key 里合法地带着 `_` `^` `\`，交给 Formula 会被当成下标 / 命令吃成乱码。
  const split = resolveFigure ? splitStemFigures(stem) : null;
  return (
    <>
      <Text as="p" className="leading-7">
        <Formula>{split ? split.text : stem}</Formula>
      </Text>
      {split && resolveFigure && split.figures.length > 0 && (
        <div data-slot="question-stem-figures" className="flex flex-wrap gap-2">
          {split.figures.map((key, index) => (
            <Image
              key={`${key}-${index}`}
              src={resolveFigure(key)}
              alt={figureAlt(index + 1)}
              radius="md"
              className="border border-border bg-white"
              imgClassName="max-h-44 w-auto max-w-56 object-contain"
            />
          ))}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 4: QuestionCard 改用它（行为不变）**

`packages/ui/src/question-card/question-card.tsx`：

1. import 区：删 `import { Image } from "../image";` 与 `import { splitStemFigures } from "../question/question-stem";`（`Formula` 仍被选项 / 小问用，保留）；加 `import { QuestionStemBlock } from "./question-stem-block";`。
2. 删这两行：
```ts
  const split = resolveFigure ? splitStemFigures(stem) : null;
  const stemText = split ? split.text : stem;
```
（上面那行注释「先切图再排公式……」一起删，它搬去了 block。）
3. 把这一整块：
```tsx
            <Text as="p" className="leading-7">
              <Formula>{stemText}</Formula>
            </Text>

            {split && resolveFigure && split.figures.length > 0 && (
              <div data-slot="question-stem-figures" className="flex flex-wrap gap-2">
                {split.figures.map((key, index) => (
                  <Image
                    key={`${key}-${index}`}
                    src={resolveFigure(key)}
                    alt={`题目附图 ${index + 1}`}
                    radius="md"
                    className="border border-border bg-white"
                    imgClassName="max-h-44 w-auto max-w-56 object-contain"
                  />
                ))}
              </div>
            )}
```
换成：
```tsx
            <QuestionStemBlock stem={stem} resolveFigure={resolveFigure} />
```

- [ ] **Step 5: `MathFieldLikeProps` 加 `disabled` + 两份 md 契约表加行**

`packages/ui/src/math-textarea/math-textarea.types.ts` 的 `MathFieldLikeProps` 里 `onSubmit?` 之后加：
```ts
  /** 锁定（已提交 / 提交中）。QuestionAnswer 传；MathTextarea 不传。 */
  disabled?: boolean;
```

`math-textarea.md` 的 `### MathFieldLikeProps（\`visualEditor\` 的契约）` 表 `onSubmit` 行之后加：
```
| disabled | `boolean` | - | 锁定（QuestionAnswer 在已提交 / 提交中时传；MathTextarea 不传） |
```
`math-textarea.en.md` 对应表 `onSubmit` 行之后加：
```
| disabled | `boolean` | - | Locked (QuestionAnswer passes it while submitted or pending; MathTextarea does not) |
```

- [ ] **Step 6: 跑测试 + typecheck + docs:check:props**

```bash
cd packages/ui && npx vitest run src/question-card src/math-textarea && pnpm --filter @hulianui/ui typecheck && cd ../.. && pnpm docs:check:props 2>&1 | tail -3
```
期望：question-card 既有测试（含两条 `resolveFigure`）与新 block 测试全 PASS；typecheck 0 错误（`Image` / `splitStemFigures` 没有 unused import 残留）；`docs:check:props` rc=0。

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/question-card/question-stem-block.tsx packages/ui/src/question-card/question-stem-block.test.tsx packages/ui/src/question-card/question-card.tsx packages/ui/src/math-textarea/math-textarea.types.ts packages/ui/src/math-textarea/math-textarea.md packages/ui/src/math-textarea/math-textarea.en.md
git commit -m "refactor(ui/math): QuestionCard 题干块抽成 QuestionStemBlock 供作答卡同源渲染；MathFieldLikeProps 加 disabled"
```

---

### Task 3b: 库级修复：Field 内 CheckboxGroup / RadioGroup 每项无障碍名被 Field 标签吞掉

主人拍板本阶段顺手修进库（阶段 3 只在 QuestionEditor 里局部绕过）。

**现象（探针实测，Base UI 1.6.0）**：`<Field label="正确答案"><CheckboxGroup><Checkbox label="A 甲"/><Checkbox label="B 乙"/></CheckboxGroup></Field>` 里两个 checkbox 的 `aria-labelledby` 都指向 Field 标签，读屏念出来两个「正确答案」；Radio 同理。Field 内**单个** Checkbox（不在组内）由 Field 标签命名是正确的，要保住。

**机制**：Base UI 的 `Field.Item` 给子树一个新的 `LabelableProvider`（`labelId` 重置，`messageIds` 继承父级），子项的无障碍名回落到自己的 `<label>`，`aria-describedby` 仍拿到 Field 的 description / error。`Field.Item` 用 `useFieldRootContext(false)`，没有 Field 时也能用。

**修法**：CheckboxGroup / RadioGroup 提供一个「在组内」context；Checkbox / Radio 在组内且有可见文字时，把自己那层 `<label>` 换成 `<BaseField.Item render={<label …/>}>`。不在组内的一律不变。

**Files:**
- Create: `packages/ui/src/lib/labelled-group-context.ts`
- Modify: `packages/ui/src/checkbox-group/checkbox-group.tsx`、`packages/ui/src/radio/radio.tsx`（RadioGroup 与 Radio）、`packages/ui/src/checkbox/checkbox.tsx`
- Modify: `packages/ui/src/question-editor/question-editor-options.tsx`（删局部 `BaseField.Item` 绕法与 import）
- Modify: `packages/ui/src/checkbox-group/checkbox-group.md` / `.en.md`、`packages/ui/src/radio/radio.md` / `.en.md`（各加一条坑位）
- Create: `.changeset/group-items-own-label.md`
- Test: `packages/ui/src/checkbox-group/checkbox-group.test.tsx`、`packages/ui/src/radio/radio.test.tsx`、`packages/ui/src/checkbox/checkbox.test.tsx`（各加用例）

**Interfaces:**
- Produces：`LabelledGroupContext`（`createContext(false)`）、`useInLabelledGroup(): boolean`。

- [ ] **Step 1: 写失败测试**

`packages/ui/src/checkbox-group/checkbox-group.test.tsx` 追加（文件顶部若没有 `import { Field } from "../field";` 与 `screen` 就补上）：

```tsx
  it("放在 Field 里：每个 Checkbox 由自己的 label 命名，不被 Field 标签吞掉；组由 Field 标签命名；description 仍到达每项", () => {
    render(
      <Field label="正确答案" description="可多选">
        <CheckboxGroup>
          <Checkbox value="A" label="A 甲" />
          <Checkbox value="B" label="B 乙" />
        </CheckboxGroup>
      </Field>,
    );
    const a = screen.getByRole("checkbox", { name: "A 甲" });
    expect(screen.getByRole("checkbox", { name: "B 乙" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "正确答案" })).toBeTruthy();
    const described = a.getAttribute("aria-describedby") ?? "";
    expect(described.split(" ").map((id) => document.getElementById(id)?.textContent)).toContain("可多选");
  });
```

`packages/ui/src/radio/radio.test.tsx` 追加：

```tsx
  it("放在 Field 里：每个 Radio 由自己的 label 命名，不被 Field 标签吞掉；radiogroup 由 Field 标签命名", () => {
    render(
      <Field label="性别">
        <RadioGroup>
          <Radio value="m" label="男" />
          <Radio value="f" label="女" />
        </RadioGroup>
      </Field>,
    );
    expect(screen.getByRole("radio", { name: "男" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "女" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "性别" })).toBeTruthy();
  });
```

`packages/ui/src/checkbox/checkbox.test.tsx` 追加（锁非回归）：

```tsx
  it("Field 里单个 Checkbox（不在组内）仍由 Field 标签命名", () => {
    render(
      <Field label="条款">
        <Checkbox value="ok" label="我同意" />
      </Field>,
    );
    expect(screen.getByRole("checkbox", { name: "条款" })).toBeTruthy();
  });
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/checkbox-group/checkbox-group.test.tsx src/radio/radio.test.tsx src/checkbox/checkbox.test.tsx
```
期望：前两条新增用例 FAIL（`getByRole("checkbox", { name: "A 甲" })` 找不到），checkbox 那条 PASS。

- [ ] **Step 3: 写 context 与三处组件改动**

```ts
// packages/ui/src/lib/labelled-group-context.ts
"use client";
import { createContext, useContext } from "react";

/**
 * 「我在 CheckboxGroup / RadioGroup 里」。Checkbox / Radio 据此决定要不要把自己的 <label> 换成
 * Base UI 的 Field.Item：组放进 Field 时，Field 标签会成为组内**每一项**的无障碍名（读屏念出 N 个同名项），
 * Field.Item 给每项一个新的标签作用域，名字回落到自己的 label，而 description / error 仍从 Field 继承。
 * 不在组内的单个 Checkbox 由 Field 标签命名是对的，所以只在组内才包。
 */
export const LabelledGroupContext = createContext(false);

export function useInLabelledGroup(): boolean {
  return useContext(LabelledGroupContext);
}
```

`checkbox-group/checkbox-group.tsx`：import `LabelledGroupContext`，把 `{children}` 换成 `<LabelledGroupContext.Provider value={true}>{children}</LabelledGroupContext.Provider>`。

`radio/radio.tsx` 的 `RadioGroup`：同样包 `children`。

`checkbox/checkbox.tsx` 的 `CheckboxImpl`：
```tsx
import { Field as BaseField } from "@base-ui/react/field";
import { useInLabelledGroup } from "../lib/labelled-group-context";
// …
  const inGroup = useInLabelledGroup();
  if (text == null || text === false || text === "") return box;

  const labelText = (
    <span className={cn(labelSizeClass[size], "text-foreground select-none", disabled && "opacity-50", labelClassName)}>
      {text}
    </span>
  );
  // 组内：Field.Item 给这一项独立的标签作用域（见 lib/labelled-group-context.ts）。render 成 <label> 本身，DOM 层级不变。
  if (inGroup) {
    return (
      <BaseField.Item render={<label className="inline-flex items-center gap-2" />}>
        {box}
        {labelText}
      </BaseField.Item>
    );
  }
  return (
    <label className="inline-flex items-center gap-2">
      {box}
      {labelText}
    </label>
  );
```

`radio/radio.tsx` 的 `Radio`：同样结构（`dot` + `labelText`，`inGroup` 时 `BaseField.Item render={<label …/>}`）。

`question-editor/question-editor-options.tsx`：删 `import { Field as BaseField } from "@base-ui/react/field";`，把
```tsx
              <BaseField.Item key={o.key}>
                <Checkbox value={o.key} label={optionCaption(o.key, o.text)} />
              </BaseField.Item>
```
改回
```tsx
              <Checkbox key={o.key} value={o.key} label={optionCaption(o.key, o.text)} />
```
并把上面那段「Field.Item 给每个复选框独立的标签作用域……」注释删掉（库级已修）。

- [ ] **Step 4: 跑测试 + typecheck + 体积**

```bash
cd packages/ui && npx vitest run src/checkbox src/checkbox-group src/radio src/question-editor src/form-control-passthrough.test.tsx src/ssr-safety.test.tsx && pnpm --filter @hulianui/ui typecheck && cd ../.. && CI=1 pnpm size 2>&1 | tail -20
```
期望：全 PASS；`question-editor-sections.test.tsx` 的「多选答案是 CheckboxGroup」（name "A 甲"）仍绿；typecheck 0 错误；14 入口全在基线内（Checkbox / Radio 各多带 `@base-ui/react/field` 的 Item，若某入口超线先 `--why <入口>` 看增量是否只是它，是则按 Global Constraints 只手改该入口一行为 `ceil(实测 × 1.15)`）。

- [ ] **Step 5: 文档 + changeset**

`checkbox-group.md` 的 `## 禁忌 / 坑` 追加一条、`checkbox-group.en.md` 的 `## Usage guidelines` 追加一条（两边条数同增）：
```
- 放进 `Field` 时每个子 Checkbox 由**自己的** `label` 命名，`Field` 的标签命名的是整个组（role=group），description / error 仍到达每一项。不必再手工包 Base UI 的 `Field.Item`。
```
```
- Inside a `Field`, each child Checkbox is named by **its own** `label`; the `Field` label names the group (role=group), and description / error still reach every item. No need to wrap items in Base UI `Field.Item` yourself.
```
`radio.md` 的 `## 禁忌 / 坑` 与 `radio.en.md` 的 `## Pitfalls` 各追加一条：
```
- 放进 `Field` 时每个 `Radio` 由**自己的** `label` 命名，`Field` 的标签命名的是整个 `RadioGroup`（role=radiogroup），description / error 仍到达每一项。
```
```
- Inside a `Field`, each `Radio` is named by **its own** `label`; the `Field` label names the whole `RadioGroup` (role=radiogroup), and description / error still reach every item.
```

`.changeset/group-items-own-label.md`：
````md
---
"@hulianui/ui": patch
---

修复：`CheckboxGroup` / `RadioGroup` 放进 `Field` 时，组内每个 `Checkbox` / `Radio` 的无障碍名都被 `Field` 标签吞掉（读屏念出 N 个同名项）。现在组内每项由自己的 `label` 命名，`Field` 标签命名整个组，description / error 仍到达每一项（内部用 Base UI `Field.Item`）。不在组内的单个 `Checkbox` 仍由 `Field` 标签命名，行为不变。

<!-- changelog-en:start -->
Fix: when a `CheckboxGroup` / `RadioGroup` sits inside a `Field`, every `Checkbox` / `Radio` in the group used to take the `Field` label as its accessible name (screen readers announced N identically named items). Each item is now named by its own `label`, the `Field` label names the group, and description / error still reach every item (Base UI `Field.Item` under the hood). A single `Checkbox` inside a `Field` (not in a group) is still named by the `Field` label, unchanged.
<!-- changelog-en:end -->
````

```bash
pnpm docs:i18n:check 2>&1 | tail -3
```
期望 rc=0。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/lib/labelled-group-context.ts packages/ui/src/checkbox-group/checkbox-group.tsx packages/ui/src/checkbox-group/checkbox-group.test.tsx packages/ui/src/checkbox-group/checkbox-group.md packages/ui/src/checkbox-group/checkbox-group.en.md packages/ui/src/radio/radio.tsx packages/ui/src/radio/radio.test.tsx packages/ui/src/radio/radio.md packages/ui/src/radio/radio.en.md packages/ui/src/checkbox/checkbox.tsx packages/ui/src/checkbox/checkbox.test.tsx packages/ui/src/question-editor/question-editor-options.tsx .changeset/group-items-own-label.md
git commit -m "fix(ui): Field 内 CheckboxGroup/RadioGroup 每项由自己的 label 命名（组内自动 Field.Item），去掉 QuestionEditor 局部绕法"
```

---

### Task 4: 主件 `question-answer.tsx`（含三条静默 bug 回归）

**Files:**
- Create: `packages/ui/src/question-answer/question-answer.tsx`
- Test: `packages/ui/src/question-answer/question-answer.test.tsx`

**Interfaces:**
- Consumes：Task 1 的类型与纯函数、Task 2 的 `QUESTION_ANSWER_LOCALE_ZH`、Task 3 的 `QuestionStemBlock` 与 `MathFieldLikeProps.disabled`、`QuestionTypeTag`（`../question-card/question-card.client`）、`normalizeOptions`（`../question/question-shape`）、`answerText`（`../question/answer-format`）、`QUESTION_LOCALE_ZH`（`../question/question.locale`）、`useComponentLocale`（`../config/locale-context`）、`warnOnce`（`../lib/warn-once`）、`Info`（`../_icons`）、`RadioGroup` / `Radio`（`../radio`）、`CheckboxGroup`（`../checkbox-group`）、`Checkbox`（`../checkbox`）、`Field`（`../field`）、`Input`（`../input`）、`Alert`（`../alert`）、`Button`（`../button`）、`Card` / `CardBody`（`../card`）、`Tag`（`../tag`）、`Text`（`../text`）、`Formula`（`../math/math`）、`cn`（`../lib/cn`）。
- Produces：`QuestionAnswer(props: QuestionAnswerProps)`。DOM 约定：根 `data-slot="question-answer"`；填空区 `data-slot="question-answer-blanks"`。

- [ ] **Step 1: 写主件测试**

```tsx
// packages/ui/src/question-answer/question-answer.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";
import type { StudentAnswer } from "../question/question.types";
import { QuestionAnswer } from "./question-answer";
import type { AnswerableQuestion, QuestionAnswerProps } from "./question-answer.types";

const CJK = /[㐀-䶿一-鿿]/u;

function Harness({
  initial,
  onValue,
  ...rest
}: { initial?: StudentAnswer; onValue?: (v: StudentAnswer) => void } & Omit<QuestionAnswerProps, "value" | "onChange">) {
  const [value, setValue] = useState<StudentAnswer | undefined>(initial);
  return (
    <QuestionAnswer
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

const single: AnswerableQuestion = {
  type: "single",
  stem: "下列正确的是",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
  ],
};
const multiple: AnswerableQuestion = {
  type: "multiple",
  stem: "下列正确的有",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
    { key: "C", text: "丙" },
  ],
};
const judge: AnswerableQuestion = { type: "judge", stem: "对顶角相等", options: null };
const twoBlanks: AnswerableQuestion = { type: "blank", stem: "甲____乙____", options: null, blankCount: 2 };
const oneBlank: AnswerableQuestion = { type: "blank", stem: "答案是____", options: null, blankCount: 1 };

afterEach(() => vi.restoreAllMocks());

describe("QuestionAnswer：三条曾静默让学生「答不了」的 bug", () => {
  it("回归：判断题 options 为 null 时仍有「正确 / 错误」两项，选中后回传 \"false\"", () => {
    const onValue = vi.fn();
    render(<Harness question={judge} onValue={onValue} />);
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "错误" }));
    expect(onValue).toHaveBeenLastCalledWith("false");
    expect(screen.getByRole("radio", { name: "错误" }).getAttribute("aria-checked")).toBe("true");
  });

  it("回归：多空填空按 blankCount 给两个输入框，逐空回传数组", () => {
    const onValue = vi.fn();
    render(<Harness question={twoBlanks} onValue={onValue} />);
    const first = screen.getByLabelText("第 1 空");
    const second = screen.getByLabelText("第 2 空");
    fireEvent.change(first, { target: { value: "150" } });
    expect(onValue).toHaveBeenLastCalledWith(["150", ""]);
    fireEvent.change(second, { target: { value: "30" } });
    expect(onValue).toHaveBeenLastCalledWith(["150", "30"]);
  });

  it("回归：对象形 options 不被滤空，每个选项都能选，提交值是 key 不是首字符", () => {
    const onValue = vi.fn();
    render(
      <Harness
        question={{ type: "single", stem: "角度", options: [{ key: "A", text: "60°" }, { key: "B", text: "30°" }] }}
        onValue={onValue}
      />,
    );
    expect(screen.getAllByRole("radio")).toHaveLength(2);
    fireEvent.click(screen.getByRole("radio", { name: "A. 60°" }));
    expect(onValue).toHaveBeenLastCalledWith("A");
  });

  it("字符串形 options（无字母前缀）也按下标补字母，提交 \"A\" 而不是 \"6\"", () => {
    const onValue = vi.fn();
    render(<Harness question={{ type: "single", stem: "角度", options: ["60°", "30°"] as never }} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "A. 60°" }));
    expect(onValue).toHaveBeenLastCalledWith("A");
  });
});

describe("QuestionAnswer：按题型给控件", () => {
  it("单选：每个选项的无障碍名就是它自己那一行，没有重复", () => {
    render(<Harness question={single} />);
    expect(screen.getByRole("radio", { name: "A. 甲" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "B. 乙" })).toBeTruthy();
    expect(screen.getByRole("radiogroup", { name: "单选作答" })).toBeTruthy();
  });

  it("多选：CheckboxGroup，每项无障碍名独立，回传排好序的 key 数组", () => {
    const onValue = vi.fn();
    render(<Harness question={multiple} onValue={onValue} />);
    expect(screen.getByRole("checkbox", { name: "A. 甲" })).toBeTruthy();
    expect(screen.getByRole("checkbox", { name: "C. 丙" })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "C. 丙" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "A. 甲" }));
    expect(onValue).toHaveBeenLastCalledWith(["A", "C"]);
  });

  it("填空：blankCount 缺失按题干 ____ 数；都没有按 1 且不标空号", () => {
    const { unmount } = render(<Harness question={{ type: "blank", stem: "甲____乙____丙", options: null }} />);
    expect(screen.getByLabelText("第 1 空")).toBeTruthy();
    expect(screen.getByLabelText("第 2 空")).toBeTruthy();
    unmount();
    render(<Harness question={{ type: "blank", stem: "没有下划线", options: null }} />);
    expect(screen.getByLabelText("填空作答")).toBeTruthy();
    expect(screen.queryByText("第 1 空")).toBeNull();
  });

  it("续做：value 传服务端记的多空 JSON 字面量，输入框预填", () => {
    render(<Harness question={twoBlanks} initial={'["150","30"]'} />);
    expect((screen.getByLabelText("第 1 空") as HTMLInputElement).value).toBe("150");
    expect((screen.getByLabelText("第 2 空") as HTMLInputElement).value).toBe("30");
  });

  it("选项缺失：明说做不了，不渲染选项组，也不出提交按钮", () => {
    render(<Harness question={{ type: "single", stem: "题干", options: null }} onSubmit={() => {}} />);
    expect(screen.getByText("这道题暂时没法作答")).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("主观题：只读题面 + 「此题需教师批阅」，不出提交按钮", () => {
    render(<Harness question={{ type: "essay", stem: "证明", options: null }} onSubmit={() => {}} />);
    expect(screen.getByText("此题需教师批阅")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("未知题型：按主观题只读并 warnOnce（两次渲染只告警一次）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<Harness question={{ type: "matching", stem: "连线", options: null }} />);
    rerender(<Harness question={{ type: "matching", stem: "连线", options: null }} />);
    expect(screen.getByText("此题需教师批阅")).toBeTruthy();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("QuestionAnswer");
  });
});

describe("QuestionAnswer：提交", () => {
  it("没给 onSubmit 就没有提交按钮", () => {
    render(<Harness question={single} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("多空填一半按钮禁用，全填才能交，交的是逐空数组", () => {
    const onSubmit = vi.fn();
    render(<Harness question={twoBlanks} onSubmit={onSubmit} />);
    const button = screen.getByRole("button", { name: "提交答案" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("第 1 空"), { target: { value: "150" } });
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("第 2 空"), { target: { value: "30" } });
    expect(button.disabled).toBe(false);
    fireEvent.click(button);
    expect(onSubmit).toHaveBeenCalledWith(["150", "30"]);
  });

  it("单空也交一项数组（压平是消费方 encodeBlanks 的事）", () => {
    const onSubmit = vi.fn();
    render(<Harness question={oneBlank} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("填空作答"), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).toHaveBeenCalledWith(["7"]);
  });

  it("单选交 key 字符串", () => {
    const onSubmit = vi.fn();
    render(<Harness question={single} onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("radio", { name: "B. 乙" }));
    fireEvent.click(screen.getByRole("button", { name: "提交答案" }));
    expect(onSubmit).toHaveBeenCalledWith("B");
  });

  it("pending：按钮禁用、选项锁定", () => {
    render(<Harness question={single} initial="A" onSubmit={() => {}} pending />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("radio", { name: "A. 甲" }).getAttribute("aria-disabled")).toBe("true");
  });

  it("disabled：选项锁定、按钮禁用", () => {
    render(<Harness question={single} initial="A" onSubmit={() => {}} disabled />);
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("radio", { name: "A. 甲" }).getAttribute("aria-disabled")).toBe("true");
  });
});

describe("QuestionAnswer：结果区", () => {
  it("答错：回答错误 + 正确答案文字 + 解析，控件锁定，按钮变「已提交」并禁用", () => {
    render(
      <Harness
        question={single}
        initial="B"
        onSubmit={() => {}}
        result={{ correct: false, correctAnswer: "A", analysis: "由定义得 A" }}
      />,
    );
    expect(screen.getByText("回答错误")).toBeTruthy();
    expect(screen.getByText(/正确答案 A/)).toBeTruthy();
    expect(screen.getByText(/由定义得 A/)).toBeTruthy();
    expect(screen.getByRole("radio", { name: "A. 甲" }).getAttribute("aria-disabled")).toBe("true");
    const button = screen.getByRole("button", { name: "已提交" }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("答对：回答正确 + correctHint，不重复印正确答案", () => {
    render(
      <Harness
        question={judge}
        initial="true"
        result={{ correct: true, correctAnswer: true }}
        correctHint="下次不会再推给你"
      />,
    );
    expect(screen.getByText("回答正确")).toBeTruthy();
    expect(screen.getByText("下次不会再推给你")).toBeTruthy();
    expect(screen.queryByText(/正确答案/)).toBeNull();
  });

  it("判断题答错：正确答案印成「正确 / 错误」而不是 true / false", () => {
    render(<Harness question={judge} initial="false" result={{ correct: false, correctAnswer: true }} />);
    expect(screen.getByText(/正确答案 正确/)).toBeTruthy();
  });

  it("多空填空答错：正确答案按空号列出", () => {
    render(
      <Harness question={twoBlanks} initial={["1", "2"]} result={{ correct: false, correctAnswer: ["150", "30"] }} />,
    );
    expect(screen.getByText(/第1空：150/)).toBeTruthy();
  });
});

describe("QuestionAnswer：题干、头部与注入", () => {
  it("resolveFigure：题干里的图切出来渲染成 img", () => {
    const { container } = render(
      <Harness
        question={{ ...single, stem: "如图\n\n![](import/a.png)" }}
        resolveFigure={(key) => `/files/${key}`}
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/files/import/a.png");
    expect(container.textContent).not.toContain("![](");
  });

  it("renderStem 覆盖缺省题干渲染", () => {
    render(<Harness question={single} renderStem={(stem) => <div data-testid="custom">{stem.toUpperCase()}</div>} />);
    expect(screen.getByTestId("custom").textContent).toBe("下列正确的是");
  });

  it("头部：题型标签 / 知识点 / 难度星 / header；reason 行", () => {
    render(
      <Harness
        question={{ ...single, difficulty: 3, topics: ["三角函数"] }}
        header={<span>第 3 题</span>}
        reason="上次这类题错了"
      />,
    );
    expect(screen.getByText("单选")).toBeTruthy();
    expect(screen.getByText("三角函数")).toBeTruthy();
    expect(screen.getByLabelText("难度 3 / 5").textContent).toBe("★★★");
    expect(screen.getByText("第 3 题")).toBeTruthy();
    expect(screen.getByText("上次这类题错了")).toBeTruthy();
  });

  it("blankInput=\"math\" + mathField：每空渲染注入的组件，onChange 回流，已作答时 disabled", () => {
    const Stub = ({ value, onChange, disabled, "aria-label": label }: MathFieldLikeProps) => (
      <input data-testid="mf" aria-label={label} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
    );
    const onValue = vi.fn();
    const { rerender } = render(<Harness question={oneBlank} blankInput="math" mathField={Stub} onValue={onValue} />);
    fireEvent.change(screen.getByTestId("mf"), { target: { value: "x^2" } });
    expect(onValue).toHaveBeenLastCalledWith(["x^2"]);
    rerender(
      <Harness
        question={oneBlank}
        blankInput="math"
        mathField={Stub}
        result={{ correct: true, correctAnswer: "x^2" }}
      />,
    );
    expect((screen.getByTestId("mf") as HTMLInputElement).disabled).toBe(true);
  });

  it("blankInput=\"math\" 没给 mathField：回落成文本输入框并 warnOnce", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Harness question={oneBlank} blankInput="math" />);
    expect(screen.getByLabelText("填空作答")).toBeTruthy();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain("mathField");
  });

  it("enUS 下整卡无中文", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Harness
          question={{ type: "judge", stem: "Vertical angles are equal", options: null, difficulty: 2, topics: ["Angles"] }}
          initial="false"
          onSubmit={() => {}}
          result={{ correct: false, correctAnswer: true, analysis: "By definition" }}
        />
      </ConfigProvider>,
    );
    expect(container.textContent ?? "").not.toMatch(CJK);
    expect(screen.getByRole("button", { name: "Submitted" })).toBeTruthy();
    expect(screen.getByText(/Correct answer True/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-answer/question-answer.test.tsx
```
期望：FAIL（`./question-answer` 不存在）。

- [ ] **Step 3: 写主件**

```tsx
// packages/ui/src/question-answer/question-answer.tsx
"use client";
import type { ReactNode } from "react";
import { Info } from "../_icons";
import { Alert } from "../alert";
import { Button } from "../button";
import { Card, CardBody } from "../card";
import { Checkbox } from "../checkbox";
import { CheckboxGroup } from "../checkbox-group";
import { useComponentLocale } from "../config/locale-context";
import { Field } from "../field";
import { Input } from "../input";
import { cn } from "../lib/cn";
import { warnOnce } from "../lib/warn-once";
import { Formula } from "../math/math";
import { QuestionTypeTag } from "../question-card/question-card.client";
import { QuestionStemBlock } from "../question-card/question-stem-block";
import { answerText } from "../question/answer-format";
import { normalizeOptions } from "../question/question-shape";
import { QUESTION_LOCALE_ZH } from "../question/question.locale";
import type { QuestionType } from "../question/question.types";
import { Radio, RadioGroup } from "../radio";
import { Tag } from "../tag";
import { Text } from "../text";
import { QUESTION_ANSWER_LOCALE_ZH } from "./question-answer.locale";
import {
  answerKind,
  blankValues,
  canSubmit,
  choiceKey,
  choiceKeys,
  currentAnswer,
  isKnownQuestionType,
  resolveBlankCount,
  setBlank,
} from "./question-answer.state";
import type { QuestionAnswerProps } from "./question-answer.types";

/**
 * 学生端「一道题」的作答卡：按题型给对的控件（单选 / 多选 / 判断 / 逐空填空），选项缺失明说做不了，
 * 主观题只读；`canSubmit` 门禁，`onSubmit` 给了才出提交按钮；`result` 有值即锁定并显示正误 / 正确答案 / 解析。
 * 题干与 QuestionCard 走同一个 `QuestionStemBlock`（`resolveFigure` 切图 + Formula），两端看到的题面一致。
 *
 * 判分不在这里：即时反馈由页面调 `gradeObjective`（或等服务端）再把 `result` 传回来。**服务端才是判分 SSOT。**
 */
export function QuestionAnswer({
  question,
  value,
  onChange,
  result = null,
  onSubmit,
  pending = false,
  disabled = false,
  renderStem,
  resolveFigure,
  blankInput = "text",
  mathField,
  header,
  reason,
  correctHint,
  className,
}: QuestionAnswerProps) {
  const locale = useComponentLocale();
  const L = locale.questionAnswer ?? QUESTION_ANSWER_LOCALE_ZH;
  const Q = locale.question ?? QUESTION_LOCALE_ZH;

  const known = isKnownQuestionType(question.type);
  if (!known) {
    warnOnce(
      "question-answer:unknown-type",
      "[瑚琏] QuestionAnswer：不认识的题型，按主观题只读处理（七型见 QuestionType）。",
    );
  }
  if (blankInput === "math" && mathField === undefined) {
    warnOnce(
      "question-answer:math-field-missing",
      '[瑚琏] QuestionAnswer：blankInput="math" 需要 mathField（@hulianui/ui/math-field 的 MathField），已回落为文本输入框。',
    );
  }
  // 给了 mathField 且要 math 才用；其余一律文本框。
  const MathInput = blankInput === "math" ? mathField : undefined;

  const type: QuestionType | undefined = known ? (question.type as QuestionType) : undefined;
  const kind = answerKind(question);
  const blanks = kind === "blank" ? resolveBlankCount(question) : 1;
  const answered = result !== null && result !== undefined;
  const locked = disabled || answered || pending;
  const current = currentAnswer(kind, value, blanks);
  const options = normalizeOptions(question.options);
  const difficulty =
    question.difficulty !== undefined ? Math.max(1, Math.min(5, Math.round(question.difficulty))) : undefined;

  let controls: ReactNode;
  if (kind === "single") {
    controls = (
      <RadioGroup aria-label={L.singleAria} value={choiceKey(value)} onValueChange={onChange} disabled={locked}>
        {options.map((option) => (
          <Radio key={option.key} value={option.key} label={<Formula>{`${option.key}. ${option.text}`}</Formula>} />
        ))}
      </RadioGroup>
    );
  } else if (kind === "multiple") {
    controls = (
      <CheckboxGroup
        aria-label={L.multipleAria}
        value={choiceKeys(value)}
        onValueChange={(keys) => onChange([...keys].sort())}
        disabled={locked}
      >
        {options.map((option) => (
          <Checkbox key={option.key} value={option.key} label={<Formula>{`${option.key}. ${option.text}`}</Formula>} />
        ))}
      </CheckboxGroup>
    );
  } else if (kind === "judge") {
    // 两个选项是题型自带的，题库里 options 是 null。值交 "true" / "false"：判分那侧按布尔归一，最省一次翻译。
    controls = (
      <RadioGroup aria-label={L.judgeAria} value={choiceKey(value)} onValueChange={onChange} disabled={locked}>
        <Radio value="true" label={Q.judgeTrue} />
        <Radio value="false" label={Q.judgeFalse} />
      </RadioGroup>
    );
  } else if (kind === "blank") {
    const values = blankValues(value, blanks);
    controls = (
      <div data-slot="question-answer-blanks" className="space-y-2">
        {values.map((text, index) => {
          const aria = L.blankAria(index + 1, blanks);
          const update = (next: string) => onChange(setBlank(values, index, next));
          const control = MathInput ? (
            <MathInput value={text} onChange={update} aria-label={aria} disabled={locked} />
          ) : (
            <Input
              value={text}
              onChange={(event) => update(event.target.value)}
              placeholder={L.blankPlaceholder(index + 1, blanks)}
              aria-label={blanks === 1 ? aria : undefined}
              disabled={locked}
            />
          );
          // 单空不标空号：只有一个空还写「第 1 空」是在制造不存在的复杂度。
          if (blanks === 1) return <div key={index}>{control}</div>;
          if (MathInput) {
            return (
              <div key={index} className="space-y-1">
                <Text as="span" size="sm" tone="muted">
                  {L.blankLabel(index + 1)}
                </Text>
                {control}
              </div>
            );
          }
          return (
            <Field key={index} label={L.blankLabel(index + 1)}>
              {control}
            </Field>
          );
        })}
      </div>
    );
  } else if (kind === "unanswerable") {
    controls = (
      <Alert tone="warning" title={L.unanswerableTitle}>
        {L.unanswerableBody}
      </Alert>
    );
  } else {
    controls = (
      <Text as="p" size="sm" tone="muted">
        {L.subjectiveNotice}
      </Text>
    );
  }

  const submittable = onSubmit !== undefined && kind !== "unanswerable" && kind !== "subjective";

  return (
    <Card data-slot="question-answer" className={cn("overflow-hidden", className)}>
      <CardBody className="space-y-3">
        {(type || question.topics?.length || difficulty !== undefined || header !== undefined) && (
          <div className="flex flex-wrap items-center gap-2">
            {type && <QuestionTypeTag type={type} />}
            {question.topics?.map((topic) => (
              <Tag key={topic} size="sm" tone="brand" variant="soft">
                {topic}
              </Tag>
            ))}
            {difficulty !== undefined && (
              <span role="img" aria-label={L.difficulty(difficulty)} className="text-xs text-muted">
                {"★".repeat(difficulty)}
              </span>
            )}
            {header !== undefined && <div className="ms-auto flex items-center gap-1">{header}</div>}
          </div>
        )}

        {reason !== undefined && reason !== null && (
          <div className="flex items-center gap-2">
            <Info className="size-4 shrink-0 text-primary" aria-hidden />
            <Text as="span" size="xs" tone="muted">
              {reason}
            </Text>
          </div>
        )}

        {renderStem ? (
          renderStem(question.stem)
        ) : (
          <QuestionStemBlock stem={question.stem} resolveFigure={resolveFigure} figureAlt={L.figureAlt} />
        )}

        {controls}

        {answered && result && (
          <Alert tone={result.correct ? "success" : "danger"} title={result.correct ? L.correctTitle : L.wrongTitle}>
            <div className="space-y-1">
              {result.correct ? (
                correctHint
              ) : (
                // 答错时这段是学生唯一拿到的讲解；答案本身可能整段是公式
                <div>
                  <Formula>{`${L.correctAnswer} ${answerText(result.correctAnswer, type, Q)}`}</Formula>
                </div>
              )}
              {result.analysis ? (
                <div>
                  <Formula>{result.analysis}</Formula>
                </div>
              ) : null}
            </div>
          </Alert>
        )}

        {submittable && (
          <Button
            loading={pending}
            disabled={disabled || answered || !canSubmit(current)}
            onClick={() => onSubmit(current)}
          >
            {answered ? L.submitted : L.submit}
          </Button>
        )}
      </CardBody>
    </Card>
  );
}
```

注意：
- `Text` 的 `tone="muted"` 与 `size` 取值域在 `text/text.types.ts`（`TextTone` 含 `muted`，`TextSize` 含 `xs` / `sm`）。难度星那个 `span` 用 `text-muted` 工具类（`muted` 是本库 token；不是 `text-muted-foreground`）。
- `Radio` 组件已把无障碍名指向可见 label（`radio.test.tsx` 用 `getByRole("radio", { name })` 通过），所以不加 `aria-label`。
- `answerText(result.correctAnswer, type, Q)`：`type` 为 undefined 时按形状兜底，与 QuestionCard 一致。
- 若 `pending` 测试里 `aria-disabled` 断言不成立（Base UI Radio 用 `data-disabled` 而不是 `aria-disabled`），先 `screen.debug()` 看真实属性，改断言为 `hasAttribute("data-disabled")`——**改断言不改组件**（锁定行为本身以 `disabled={locked}` 为准）。

- [ ] **Step 4: 跑测试 + typecheck + SSR 守卫（预热）**

```bash
cd packages/ui && npx vitest run src/question-answer src/question-card && pnpm --filter @hulianui/ui typecheck
```
期望：全 PASS；typecheck 0 错误。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/question-answer/question-answer.tsx packages/ui/src/question-answer/question-answer.test.tsx
git commit -m "feat(ui/math): QuestionAnswer 主件（按题型给控件 / 选项缺失明说 / 主观题只读 / canSubmit 门禁 / result 区）+ 三条静默 bug 回归"
```

---

### Task 5: 导出面 + 体积

**Files:**
- Create: `packages/ui/src/question-answer/index.ts`
- Modify: `packages/ui/src/math/index.ts`（末尾加一段）
- Test: `packages/ui/src/question-answer/exports.test.ts`
- Maybe modify: `scripts/size-limits.json`（只在超 208KB 时，只改 `math` 一行）

**Interfaces:**
- Produces：`@hulianui/ui/math` 导出 `QuestionAnswer`、`canSubmit`、`answerKind`、`resolveBlankCount`、`QUESTION_ANSWER_LOCALE_ZH` / `_EN`；类型 `QuestionAnswerProps`、`AnswerableQuestion`、`QuestionAnswerResult`、`AnswerKind`、`QuestionAnswerLocale`。主 barrel 不变。

- [ ] **Step 1: 写导出面测试**

```ts
// packages/ui/src/question-answer/exports.test.ts
import { describe, expect, it } from "vitest";
import * as rootEntry from "../index";
import * as mathEntry from "../math";

describe("question-answer 导出面", () => {
  it("从 @hulianui/ui/math 可达", () => {
    for (const name of [
      "QuestionAnswer",
      "canSubmit",
      "answerKind",
      "resolveBlankCount",
      "QUESTION_ANSWER_LOCALE_ZH",
      "QUESTION_ANSWER_LOCALE_EN",
    ]) {
      expect((mathEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("主 barrel 一个都不带（KaTeX 不进 @hulianui/ui）", () => {
    expect((rootEntry as Record<string, unknown>).QuestionAnswer).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).canSubmit).toBeUndefined();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-answer/exports.test.ts
```
期望：第一条 FAIL（`QuestionAnswer` undefined）。

- [ ] **Step 3: 写目录 barrel 与 math 转出**

```ts
// packages/ui/src/question-answer/index.ts
// 学生作答卡。**不是对外 subpath**：从 @hulianui/ui/math 转出（题干 / 选项 / 结果区内部都是 Formula，独立入口省不掉 KaTeX）。
export { QuestionAnswer } from "./question-answer";
export type { QuestionAnswerProps, AnswerableQuestion, QuestionAnswerResult } from "./question-answer.types";
export { canSubmit, answerKind, resolveBlankCount } from "./question-answer.state";
export type { AnswerKind } from "./question-answer.state";
export { QUESTION_ANSWER_LOCALE_ZH, QUESTION_ANSWER_LOCALE_EN } from "./question-answer.locale";
export type { QuestionAnswerLocale } from "./question-answer.locale";
```

`packages/ui/src/math/index.ts` 末尾追加：
```ts

// 学生作答卡（阶段 4）。题干 / 选项 / 结果区内部都是 Formula，所以同住此路径。
export * from "../question-answer";
```

- [ ] **Step 4: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/question-answer src/question-editor/exports.test.ts src/question/exports.test.ts && pnpm --filter @hulianui/ui typecheck
```
期望：全 PASS（`export *` 若与既有导出撞名 tsc 会报 ambiguity，撞了就把 barrel 改成具名列举）。

- [ ] **Step 5: 量体积并归因**

```bash
CI=1 pnpm size 2>&1 | tail -20
CI=1 bash scripts/bundle-size.sh --why math 2>&1 | grep -n "config/locale\|question-answer\|radio/\|input/" | head -30
```
判据：
- `--why math` 输出里**不得出现** `config/locale.ts`（出现 = 某处 import 了 zhCN，回去改成只引 `question-answer.locale.ts`）。
- 多出来的应是 `question-answer/`、`radio/`、`input/` 与对应 `@base-ui/react/radio*` / `radio-group`。
- math 实测 ≤ 208KB：**不动** `scripts/size-limits.json`，记下实测值给 Task 8 的 changeset。
- math 实测 > 208KB：确认上两条后**手改** `scripts/size-limits.json` 里 `"name": "math"` 那一条的 `limitKB` 为 `Math.ceil(实测KB × 1.15)`（只改这一行；`git diff scripts/size-limits.json` 必须只有一行 `-`/`+`），再跑一次 `CI=1 pnpm size` 确认 14 入口全绿。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-answer/index.ts packages/ui/src/math/index.ts packages/ui/src/question-answer/exports.test.ts
# 若 Step 5 改了基线： git add scripts/size-limits.json
git commit -m "feat(ui/math): 从 @hulianui/ui/math 转出 QuestionAnswer（math 入口实测 <实测>KB，基线 <208 或新上限>KB）"
```

---

### Task 6: 文档（中英）+ math.md / question-editor.md 补链接

**Files:**
- Create: `packages/ui/src/question-answer/question-answer.md`
- Create: `packages/ui/src/question-answer/question-answer.en.md`
- Modify: `packages/ui/src/math/math.md`（题目域列表 `QuestionEditor` 那条之后加一条；「相关」加一条）
- Modify: `packages/ui/src/math/math.en.md`（同上两处）
- Modify: `packages/ui/src/question-editor/question-editor.md` / `.en.md`（第 19 行「学生作答用 QuestionAnswer（阶段 4）」改成链接）

- [ ] **Step 1: 写中文文档**

````md
---
slug: question-answer
name: QuestionAnswer
category: forms
group: advanced
tags: []
exports: [QuestionAnswer, canSubmit, answerKind, resolveBlankCount, QUESTION_ANSWER_LOCALE_ZH, QUESTION_ANSWER_LOCALE_EN]
status: enriched
---

# QuestionAnswer

> 学生作答卡 · 按题型给对的作答控件：单选 RadioGroup / 多选 CheckboxGroup / 判断题型自带两项 / 填空每空一个输入框（可注入公式键盘）· 选项缺失明说做不了、主观题只读 · canSubmit 门禁、onSubmit 给了才出提交按钮 · result 区显示正误 + 正确答案 + 解析 · 题干与 QuestionCard 同源渲染 · 走 @hulianui/ui/math · forms/advanced

## 何时用

学生端练习页、作业页、错题重做，凡是「学生答一道题」的地方都用它，而且**只用这一份**。它管的是作答这一屏本身：控件、能不能交、答完显示什么；判分、续做记录、推荐理由、下一题，都是页面的事。

这个组件里的每条判据都对应一个曾经静默发生过的事故（页面不报错、控制台干净，学生只是**答不了**）：判断题掉进「从 options 取选项」的分支渲染出一个一个选项都没有的单选组；多空填空只给一个输入框而判分逐空比对；对象形 `options` 被 `typeof o === "string"` 滤成空数组。第二处手写必然重踩其中至少一个。

只展示不作答用 [QuestionCard](../question-card/question-card.md)；出题用 [QuestionEditor](../question-editor/question-editor.md)。

## 导入

```ts
import { QuestionAnswer, canSubmit, gradeObjective, encodeBlanks } from "@hulianui/ui/math"
```

住 `@hulianui/ui/math` 而不是主包：题干、选项、结果区内部都是 Formula，也就带着 KaTeX；不排数学的消费者不该付这份体积。

## 用法

```tsx
const [value, setValue] = useState<StudentAnswer>();
const [result, setResult] = useState<QuestionAnswerResult | null>(null);

<QuestionAnswer
  question={{ type: item.type, stem: item.stem, options: item.options, blankCount: item.blank_count, difficulty: item.difficulty, topics: item.knowledge_points }}
  value={value}
  onChange={setValue}
  result={result}
  pending={submitting}
  reason={item.reason}
  correctHint="下次不会再推给你"
  resolveFigure={(key) => `/api/files/${key}`}
  onSubmit={async (answer) => {
    // 单空填空压平成字符串再交（交 ["90"] 会被原样存成 JSON 字面量）
    const wire = Array.isArray(answer) && item.type === "blank" ? encodeBlanks(answer) : answer;
    const r = await submitAnswer(item.question_id, wire);
    setResult({ correct: r.is_correct, correctAnswer: r.correct_answer, analysis: r.analysis });
  }}
/>
```

### 即时反馈（不等服务端）

录题自测、离线练习可以直接用 `gradeObjective`：

```tsx
onSubmit={(answer) => {
  const g = gradeObjective(question, answer);           // 第 1 档：与服务端逐字同口径
  setResult({ correct: g.correct === true, correctAnswer: question.answer, analysis: question.analysis });
}}
```

**服务端才是判分 SSOT。** 本地判分只用于即时反馈；正式成绩以服务端为准，别让学生端「答对」与成绩单「答错」打架（`gradeObjective` 的归一 / 容差 / 等价档默认关着，理由就是这个）。

### 续做

`value` 可以直接传服务端记的字符串：多空的 JSON 数组字面量（`'["150","30"]'`）会被解开填进每个空，多选的 `"A,C"` 会被拆成数组，单空不解析 JSON（区间 `[1,2]` 是正常答案）。已答过的题把 `result` 一并传进来即锁定。

### 公式键盘

```tsx
import { MathField } from "@hulianui/ui/math-field";   // 阶段 5，可选 peer mathlive

<QuestionAnswer question={q} value={v} onChange={setV} blankInput="math" mathField={MathField} />
```

`mathField` 是满足 `MathFieldLikeProps`（见 [MathTextarea](../math-textarea/math-textarea.md)）的任何组件；`@hulianui/ui/math` 自身零 MathLive。

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| question | `AnswerableQuestion` | - | 学生端题面（见下），**没有答案与解析的位置** |
| value | `StudentAnswer \| undefined` | - | 受控作答：填空为逐空数组（单空也是一项数组），多选为 key 数组，单选 / 判断为字符串（判断是 `"true" \| "false"`）。续做时可直接传服务端记的字符串 |
| onChange | `(next: StudentAnswer) => void` | - | 每次作答变化 |
| result | `QuestionAnswerResult \| null` | `null` | 有值 = 已作答：控件锁定、显示正误 / 正确答案 / 解析、按钮变「已提交」 |
| onSubmit | `(answer: StudentAnswer) => void` | - | **给了才出提交按钮**。参数是规范形：填空恒为数组，多选为 key 数组 |
| pending | `boolean` | `false` | 提交中：按钮转圈、控件锁定 |
| disabled | `boolean` | `false` | 只读 |
| renderStem | `(stem: string) => ReactNode` | - | 自定义题干渲染。缺省与 QuestionCard 同一条路径 |
| resolveFigure | `(key: string) => string` | - | 题干里 `![](key)` → 可显示 URL。缺省题干渲染用；给了 `renderStem` 则忽略 |
| blankInput | `"text" \| "math"` | `"text"` | 填空的输入控件 |
| mathField | `ComponentType<MathFieldLikeProps>` | - | `blankInput="math"` 时必给；没给回落成文本输入框并有开发期告警 |
| header | `ReactNode` | - | 顶部标签行右侧（题号 / 出处 / 计时） |
| reason | `ReactNode` | - | 题干上方的来源说明行（推荐理由 / 「老师布置的 A 层作业」） |
| correctHint | `ReactNode` | - | 答对时结果区里那句话 |
| className | `string` | - | 透传到根 Card |

### AnswerableQuestion

| 名称 | 类型 | 说明 |
|------|------|------|
| type | `QuestionType \| string` | 七型之一；不认识的字符串按主观题只读处理并有开发期告警 |
| stem | `string` | 题干（含 `$…$` 与 `![](key)`） |
| options | `QuestionOption[] \| null` | 选择题选项。历史形状（`["A. 甲"]` / `["60°"]`）也认，走 `normalizeOptions` |
| blankCount | `number` | 填空题空数。缺失或不合法按题干 `____` 数，再不行按 1 |
| difficulty | `number` | 1–5，渲染成星 |
| topics | `string[]` | 知识点标签 |

### QuestionAnswerResult

| 名称 | 类型 | 说明 |
|------|------|------|
| correct | `boolean` | 正误 |
| correctAnswer | `QuestionAnswer` | 正确答案（任意合法形状），用 `answerText` 渲染成文字 |
| analysis | `string` | 解析，走 Formula |

## Events

| 名称 | 参数 | 说明 |
|------|------|------|
| onChange | `(next: StudentAnswer)` | 作答变化。多选回传排好序的 key 数组；填空回传完整的逐空数组 |
| onSubmit | `(answer: StudentAnswer)` | 点提交。只在 `canSubmit(answer)` 为真时可点 |

## Slots

| 名称 | 说明 |
|------|------|
| header | 顶部标签行右侧 |
| reason | 题干上方的来源说明行，前面带一个信息图标 |
| correctHint | 答对时结果区正文 |

## 国际化

全部文案走 Locale 的 `components.questionAnswer`（`QuestionAnswerLocale`，SSOT 在 `question-answer.locale.ts`，`zhCN` / `enUS` 已接）。题型名与判断题的「正确 / 错误」取自 `components.question`（与 QuestionCard / QuestionEditor 同一份）。

## 配套纯函数

都从 `@hulianui/ui/math` 导出：

- `canSubmit(answer)` → `boolean`：多空每个空都填了才为真。页面在卡片之外做「下一题」按钮时复用。
- `answerKind(question)` → `"single" | "multiple" | "judge" | "blank" | "subjective" | "unanswerable"`：这道题该用哪种控件。
- `resolveBlankCount(question)` → `number`：该给几个空。
- `gradeObjective(question, answer)`（阶段 1）：即时反馈用的判分，见 [Formula](../math/math.md)。
- `encodeBlanks(blanks)` / `decodeBlanks(raw, count)`（阶段 1）：逐空数组与服务端记录互转。

## 禁忌 / 坑

- **填空提交前压平**：单空 `onSubmit` 交的是 `["90"]`，消费方后端若单空只收字符串，先 `encodeBlanks`。组件不替你压：它不知道你的后端契约。
- **判断题的值是 `"true" | "false"`**，不是「正确 / 错误」也不是 A / B；`gradeObjective` 与消费方服务端都按布尔归一。
- **多选回传的是数组**（已排序）。要交 `"A,C"` 串的后端自己 `join(",")`。
- **`result` 有值就锁定**：想让学生重做，把 `result` 置 `null` 并清空 `value`。
- **选项缺失不是 bug 兜底，是明说**：`options` 为 null / 空的选择题显示「这道题暂时没法作答」且没有提交按钮。服务端不该推这种题；真来了要让学生知道不是手机坏了。
- **`blankInput="math"` 必须配 `mathField`**：没给会回落成文本框，开发期有告警。
- **别在 Field 里再套一层**：选项组自带 `aria-label`，外面再包 Field 会让每个选项的无障碍名都变成 Field 标签。
- **JSX 属性字符串不处理 `\\`**：题干 / 选项里含反斜杠的公式写成 TS 字符串常量再传。

## 相关

- [QuestionCard](../question-card/question-card.md) —— 只展示；题干渲染与本件同一个 `QuestionStemBlock`
- [QuestionEditor](../question-editor/question-editor.md) —— 出题
- [MathTextarea](../math-textarea/math-textarea.md) —— `MathFieldLikeProps` 契约在它的文档里
- [Formula](../math/math.md) —— `@hulianui/ui/math` 的题目域纯函数（`gradeObjective` / `encodeBlanks` / `normalizeOptions`）
````

- [ ] **Step 2: 写英文文档**

````md
---
slug: question-answer
name: QuestionAnswer
category: forms
group: advanced
tags: []
exports: [QuestionAnswer, canSubmit, answerKind, resolveBlankCount, QUESTION_ANSWER_LOCALE_ZH, QUESTION_ANSWER_LOCALE_EN]
status: enriched
---

# QuestionAnswer

> Student answer card · the right control per question type: RadioGroup for single choice / CheckboxGroup for multiple choice / two built-in options for true-false / one input per blank (formula keyboard injectable) · says plainly when options are missing, read-only for subjective questions · canSubmit gate, the submit button appears only with onSubmit · the result area shows correct / incorrect plus the correct answer and explanation · stem rendered by the same block as QuestionCard · ships in @hulianui/ui/math · forms/advanced

## When to use

Practice pages, homework pages, and mistake redo: anywhere a student answers one question, and **only this one implementation**. It owns the answering screen itself: controls, whether the answer can be submitted, what shows after answering. Grading, resume records, recommendation reasons, and the next question belong to the page.

Every rule in this component maps to an incident that once happened silently (no page error, clean console, the student simply could not answer): a true-false question fell into the "options from `options`" branch and rendered a radio group with zero options; a multi-blank question got one input while grading compares blank by blank; object-shaped `options` were filtered to an empty array by `typeof o === "string"`. A second hand-written copy will hit at least one of them again.

Display only: [QuestionCard](../question-card/question-card.en.md). Authoring: [QuestionEditor](../question-editor/question-editor.en.md).

## Import

```ts
import { QuestionAnswer, canSubmit, gradeObjective, encodeBlanks } from "@hulianui/ui/math"
```

It lives in `@hulianui/ui/math` rather than the root package: the stem, options, and result area are all Formula, so KaTeX comes along; consumers that never typeset math should not pay for it.

## Examples

```tsx
const [value, setValue] = useState<StudentAnswer>();
const [result, setResult] = useState<QuestionAnswerResult | null>(null);

<QuestionAnswer
  question={{ type: item.type, stem: item.stem, options: item.options, blankCount: item.blank_count, difficulty: item.difficulty, topics: item.knowledge_points }}
  value={value}
  onChange={setValue}
  result={result}
  pending={submitting}
  reason={item.reason}
  correctHint="It will not be recommended again"
  resolveFigure={(key) => `/api/files/${key}`}
  onSubmit={async (answer) => {
    // Flatten a single-blank answer to a string before sending (["90"] would be stored as a JSON literal)
    const wire = Array.isArray(answer) && item.type === "blank" ? encodeBlanks(answer) : answer;
    const r = await submitAnswer(item.question_id, wire);
    setResult({ correct: r.is_correct, correctAnswer: r.correct_answer, analysis: r.analysis });
  }}
/>
```

### Instant feedback without the server

Self-check while authoring and offline practice can call `gradeObjective` directly:

```tsx
onSubmit={(answer) => {
  const g = gradeObjective(question, answer);           // level 1: identical to the server rule
  setResult({ correct: g.correct === true, correctAnswer: question.answer, analysis: question.analysis });
}}
```

**The server is the source of truth for grading.** Local grading is for instant feedback only; official scores come from the server, so the student's "correct" never disagrees with the report card (that is also why the normalize / tolerance / equivalence levels of `gradeObjective` are off by default).

### Resuming

`value` accepts the string the server recorded: a multi-blank JSON array literal (`'["150","30"]'`) is unpacked into the blanks, a multiple-choice `"A,C"` is split into an array, and a single blank is never JSON-parsed (the interval `[1,2]` is a normal answer). Pass `result` together with it for an already answered question and the card locks.

### Formula keyboard

```tsx
import { MathField } from "@hulianui/ui/math-field";   // phase 5, optional peer mathlive

<QuestionAnswer question={q} value={v} onChange={setV} blankInput="math" mathField={MathField} />
```

`mathField` is any component satisfying `MathFieldLikeProps` (see [MathTextarea](../math-textarea/math-textarea.en.md)); `@hulianui/ui/math` itself has zero MathLive.

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| question | `AnswerableQuestion` | - | The question as the student sees it (below); **no slot for the answer or explanation** |
| value | `StudentAnswer \| undefined` | - | Controlled answer: an array per blank for fill-in (a single blank is still a one-item array), an array of keys for multiple choice, a string for single choice / true-false (`"true" \| "false"`). A server-recorded string is accepted when resuming |
| onChange | `(next: StudentAnswer) => void` | - | Any change |
| result | `QuestionAnswerResult \| null` | `null` | Present = answered: controls lock, correct / incorrect plus the correct answer and explanation show, the button reads Submitted |
| onSubmit | `(answer: StudentAnswer) => void` | - | **The submit button appears only when provided.** Receives the canonical shape: always an array for blanks, an array of keys for multiple choice |
| pending | `boolean` | `false` | Submitting: the button spins and controls lock |
| disabled | `boolean` | `false` | Read-only |
| renderStem | `(stem: string) => ReactNode` | - | Custom stem rendering. The default is the same path as QuestionCard |
| resolveFigure | `(key: string) => string` | - | `![](key)` in the stem to a displayable URL. Used by the default stem rendering; ignored when `renderStem` is given |
| blankInput | `"text" \| "math"` | `"text"` | Input control for blanks |
| mathField | `ComponentType<MathFieldLikeProps>` | - | Required with `blankInput="math"`; without it the card falls back to a text input with a development warning |
| header | `ReactNode` | - | Right side of the top tag row (number / source / timer) |
| reason | `ReactNode` | - | Source line above the stem (recommendation reason / "Tier A homework from your teacher") |
| correctHint | `ReactNode` | - | The sentence in the result area when the answer is correct |
| className | `string` | - | Passed to the root Card |

### AnswerableQuestion

| Name | Type | Description |
|------|------|-------------|
| type | `QuestionType \| string` | One of the seven types; an unknown string is treated as subjective (read-only) with a development warning |
| stem | `string` | Stem (with `$...$` and `![](key)`) |
| options | `QuestionOption[] \| null` | Choice options. Legacy shapes (`["A. x"]` / `["60°"]`) are accepted through `normalizeOptions` |
| blankCount | `number` | Number of blanks. When missing or invalid, the count of `____` in the stem is used, then 1 |
| difficulty | `number` | 1 to 5, rendered as stars |
| topics | `string[]` | Knowledge point tags |

### QuestionAnswerResult

| Name | Type | Description |
|------|------|-------------|
| correct | `boolean` | Verdict |
| correctAnswer | `QuestionAnswer` | The correct answer in any legal shape, rendered as text through `answerText` |
| analysis | `string` | Explanation, typeset by Formula |

## Events

| Name | Params | Description |
|------|--------|-------------|
| onChange | `(next: StudentAnswer)` | Answer changed. Multiple choice returns a sorted array of keys; blanks return the full per-blank array |
| onSubmit | `(answer: StudentAnswer)` | Submit clicked. Only clickable while `canSubmit(answer)` is true |

## Slots

| Name | Description |
|------|-------------|
| header | Right side of the top tag row |
| reason | Source line above the stem, with an info icon |
| correctHint | Result body when correct |

## Internationalization

All copy comes from the locale's `components.questionAnswer` (`QuestionAnswerLocale`, source of truth in `question-answer.locale.ts`, wired into `zhCN` / `enUS`). Type names and the true-false labels come from `components.question` (shared with QuestionCard / QuestionEditor).

## Companion functions

All exported from `@hulianui/ui/math`:

- `canSubmit(answer)`: true only when every blank is filled. Reuse it for a Next button outside the card.
- `answerKind(question)`: `"single" | "multiple" | "judge" | "blank" | "subjective" | "unanswerable"`, which control this question gets.
- `resolveBlankCount(question)`: how many blanks to render.
- `gradeObjective(question, answer)` (phase 1): grading for instant feedback, see [Formula](../math/math.en.md).
- `encodeBlanks(blanks)` / `decodeBlanks(raw, count)` (phase 1): convert between the per-blank array and the server record.

## Pitfalls

- **Flatten blanks before sending**: a single blank submits `["90"]`; if your backend stores a single blank as a string, call `encodeBlanks` first. The card does not flatten because it does not know your backend contract.
- **True-false values are `"true" | "false"`**, not the labels and not A / B; `gradeObjective` and the consumer's server both normalize to boolean.
- **Multiple choice returns an array** (sorted). Backends that want `"A,C"` join it themselves.
- **A present `result` locks the card**: to let the student retry, set `result` to `null` and clear `value`.
- **Missing options is a statement, not a fallback**: a choice question with null / empty `options` shows "This question cannot be answered yet" and no submit button. The server should not serve such questions; if one arrives, the student must know it is not their phone.
- **`blankInput="math"` needs `mathField`**: without it the card falls back to a text input with a development warning.
- **Do not wrap the card's option group in another Field**: the group has its own `aria-label`; an outer Field would give every option the Field label as its accessible name.
- **JSX attribute strings do not process `\\`**: keep formulas with backslashes in TS string constants.

## Related

- [QuestionCard](../question-card/question-card.en.md): display only; the stem is rendered by the same `QuestionStemBlock`
- [QuestionEditor](../question-editor/question-editor.en.md): authoring
- [MathTextarea](../math-textarea/math-textarea.en.md): the `MathFieldLikeProps` contract lives in its docs
- [Formula](../math/math.en.md): the question-domain functions of `@hulianui/ui/math` (`gradeObjective` / `encodeBlanks` / `normalizeOptions`)
````

- [ ] **Step 3: math.md / math.en.md / question-editor.md / .en.md 补链接**

`packages/ui/src/math/math.md`：
- 题目域列表 `- \`QuestionEditor\`：……` 那条之后加：
  ```
  - `QuestionAnswer`：学生作答卡（按题型给控件 / 选项缺失明说 / 主观题只读 / canSubmit / 结果区），见 [QuestionAnswer](../question-answer/question-answer.md)。
  ```
- 「相关」里 `- [QuestionEditor]…` 之后加：
  ```
  - [QuestionAnswer](../question-answer/question-answer.md) —— 学生作答卡，题干 / 选项 / 结果区内部就是本组件；同住 `@hulianui/ui/math`
  ```

`packages/ui/src/math/math.en.md`：
- 第 163 行附近 `- \`QuestionEditor\`: …` 之后加：
  ```
  - `QuestionAnswer`: student answer card (control per type / missing options stated / subjective read-only / canSubmit / result area), see [QuestionAnswer](../question-answer/question-answer.en.md).
  ```
- 第 191 行附近 `- [QuestionEditor]…` 之后加：
  ```
  - [QuestionAnswer](../question-answer/question-answer.en.md): student answer card whose stem, options, and result area are this component; also lives in `@hulianui/ui/math`
  ```

`packages/ui/src/question-editor/question-editor.md` 第 19 行：`学生作答用 QuestionAnswer（阶段 4）` → `学生作答用 [QuestionAnswer](../question-answer/question-answer.md)`。
`packages/ui/src/question-editor/question-editor.en.md` 第 19 行：`Student answering: QuestionAnswer (phase 4).` → `Student answering: [QuestionAnswer](../question-answer/question-answer.en.md).`

- [ ] **Step 4: 文档门禁**

```bash
pnpm docs:check:props 2>&1 | tail -3
pnpm docs:i18n:check 2>&1 | tail -3
```
期望：两者 rc=0（`docs:i18n:check` 比中英坑位条数：中英 `## 禁忌 / 坑` 与 `## Pitfalls` 都是 8 条）。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/question-answer/question-answer.md packages/ui/src/question-answer/question-answer.en.md packages/ui/src/math/math.md packages/ui/src/math/math.en.md packages/ui/src/question-editor/question-editor.md packages/ui/src/question-editor/question-editor.en.md
git commit -m "docs(ui/math): QuestionAnswer 中英文档（含 gradeObjective 即时反馈与续做说明）；math.md / question-editor.md 链接"
```

---

### Task 7: showcase + 英文词条 + 画廊注册 + `docs:all` + perf-lab 重生成

**Files:**
- Create: `packages/ui/src/question-answer/question-answer.showcase.tsx`
- Modify: `packages/ui/src/showcase.ts`（`questionEditorShowcase` 那行之后加一行）
- Modify: `apps/www/i18n/showcase-copy.en.json`（`exact` 加词条）
- Generated: `apps/www/generated/showcase-en/question-answer.showcase.tsx`、`apps/www/generated/showcase-en/index.ts`
- Modify: `apps/www/lib/manifest.ts`（`question-editor` 那行之后）、`apps/www/lib/registry.tsx`（import 与映射各一行）、`apps/www/i18n/component-meta.en.ts`（`question-editor` 块之后）
- Generated（`pnpm docs:all`）：`apps/www/public/registry.json` 等
- Generated：`apps/perf-lab/scenarios/generated.ts`

**Interfaces:**
- Consumes：`QuestionAnswer`、`QuestionAnswerProps`、`QuestionAnswerResult`（Task 4/5）、`gradeObjective`（`../question/grade`）、`Question` / `StudentAnswer`（`../question/question.types`）、`MathFieldLikeProps`、`Input`。
- Produces：`questionAnswerShowcase: ShowcaseSpec`。

- [ ] **Step 1: 写 showcase**

```tsx
// packages/ui/src/question-answer/question-answer.showcase.tsx
"use client";
import { useState } from "react";
import { Input } from "../input";
import type { MathFieldLikeProps } from "../math-textarea/math-textarea.types";
import { gradeObjective } from "../question/grade";
import type { Question, StudentAnswer } from "../question/question.types";
import type { ShowcaseSpec } from "../showcase/types";
import { QuestionAnswer } from "./question-answer";
import type { QuestionAnswerProps, QuestionAnswerResult } from "./question-answer.types";

// 示例公式刻意不以数字收尾：英文词表门禁数保护 token 时不认「数字紧贴 $」。
const SINGLE: Question = {
  type: "single",
  stem: "已知 $\\sin A=\\frac{3}{5}$ 且 $A$ 为锐角，则 $\\cos A$ 的值为（ ）",
  options: [
    { key: "A", text: "$\\frac{4}{5}$" },
    { key: "B", text: "$\\frac{3}{4}$" },
    { key: "C", text: "$\\frac{4}{3}$" },
    { key: "D", text: "$\\frac{5}{4}$" },
  ],
  answer: "A",
  analysis: "由 $\\cos A=\\sqrt{1-\\sin^{2}A}$ 得 $\\cos A=\\frac{4}{5}$。",
  difficulty: 2,
  score: 3,
};

const MULTIPLE: Question = {
  type: "multiple",
  stem: "下列各式中，与 $\\sqrt{8}$ 是同类二次根式的有（ ）",
  options: [
    { key: "A", text: "$\\sqrt{2}$" },
    { key: "B", text: "$\\sqrt{12}$" },
    { key: "C", text: "$\\sqrt{18}$" },
    { key: "D", text: "$\\sqrt{27}$" },
  ],
  answer: ["A", "C"],
  analysis: "$\\sqrt{8}=2\\sqrt{2}$，$\\sqrt{18}=3\\sqrt{2}$。",
  difficulty: 3,
  score: 4,
};

const JUDGE: Question = {
  type: "judge",
  stem: "对顶角相等。",
  options: null,
  answer: true,
  analysis: "对顶角是同一个角的补角，所以相等。",
  difficulty: 1,
  score: 3,
};

const BLANK: Question = {
  type: "blank",
  stem: "将 $\\frac{3}{8}$ 化成小数为____，化成百分数为____。",
  options: null,
  answer: ["0.375", ["37.5%", "37.5\\%"]],
  analysis: "分子除以分母。",
  difficulty: 2,
  score: 4,
};

const ESSAY: Question = {
  type: "essay",
  stem: "如图，在 $\\triangle ABC$ 中 $AB=AC$，求证 $\\angle B=\\angle C$。",
  options: null,
  answer: null,
  analysis: "",
  difficulty: 3,
  score: 8,
};

const MISSING_OPTIONS: Question = {
  ...SINGLE,
  stem: "下列说法正确的是（A）质数都是奇数（B）偶数都是合数（C）最小的合数是 4（D）1 是质数",
  options: null,
};

/** 画廊里的即时反馈：交了就地用 gradeObjective 判，正式环境这一步在服务端。 */
function Demo({
  question,
  topics,
  ...rest
}: { question: Question; topics?: string[] } & Partial<
  Omit<QuestionAnswerProps, "question" | "value" | "onChange" | "result">
>) {
  const [value, setValue] = useState<StudentAnswer | undefined>();
  const [result, setResult] = useState<QuestionAnswerResult | null>(null);
  return (
    <QuestionAnswer
      question={{
        type: question.type,
        stem: question.stem,
        options: question.options,
        difficulty: question.difficulty,
        topics,
      }}
      value={value}
      onChange={setValue}
      result={result}
      onSubmit={(answer) => {
        const graded = gradeObjective(question, answer);
        setResult({ correct: graded.correct === true, correctAnswer: question.answer, analysis: question.analysis });
      }}
      correctHint="下次不会再推给你"
      {...rest}
    />
  );
}

/** 画廊用的最小 MathFieldLikeProps 实现：一个普通输入框。正式环境注入 @hulianui/ui/math-field 的 MathField。 */
function PlainMathField({ value, onChange, disabled, className, "aria-label": label }: MathFieldLikeProps) {
  return (
    <Input
      aria-label={label}
      className={className}
      value={value}
      disabled={disabled}
      placeholder="LaTeX"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export const questionAnswerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单选题：选项是 RadioGroup，交了就地用 gradeObjective 判分显示正误与解析。",
      code: `<QuestionAnswer
  question={question}
  value={value}
  onChange={setValue}
  result={result}
  onSubmit={(answer) => setResult(grade(answer))}
/>`,
      render: () => <Demo question={SINGLE} topics={["三角函数"]} />,
    },
    {
      title: "多选题",
      description: "CheckboxGroup，回传排好序的 key 数组；少选多选都判错。",
      code: `<QuestionAnswer question={question} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={MULTIPLE} />,
    },
    {
      title: "判断题",
      description: "两个选项是题型自带的（题库里 options 是 null），值是 \"true\" / \"false\"。",
      code: `<QuestionAnswer question={question} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={JUDGE} />,
    },
    {
      title: "多空填空",
      description: "每空一个输入框并标空号，每个空都填了才能交；答错按空号列出正确答案。",
      code: `<QuestionAnswer question={{ ...question, blankCount: 2 }} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={{ ...BLANK }} />,
    },
    {
      title: "公式键盘",
      description: "blankInput=\"math\" 时每空渲染 mathField 注入的组件；这里注入的是一个普通输入框。",
      code: `<QuestionAnswer question={question} value={value} onChange={setValue} blankInput="math" mathField={MathField} />`,
      render: () => <Demo question={BLANK} blankInput="math" mathField={PlainMathField} />,
    },
    {
      title: "回看",
      description: "已作答：value 与 result 一并传入，控件锁定，按钮变「已提交」。",
      code: `<QuestionAnswer question={question} value="B" result={{ correct: false, correctAnswer: "A", analysis }} onSubmit={submit} />`,
      render: () => (
        <QuestionAnswer
          question={{ type: SINGLE.type, stem: SINGLE.stem, options: SINGLE.options, difficulty: SINGLE.difficulty }}
          value="B"
          onChange={() => {}}
          onSubmit={() => {}}
          result={{ correct: false, correctAnswer: SINGLE.answer, analysis: SINGLE.analysis }}
        />
      ),
    },
    {
      title: "来源说明与页眉",
      description: "reason 是题干上方那行推荐理由；header 放题号或计时。",
      code: `<QuestionAnswer question={question} reason="上次这类题错了" header={<span>第 3 题</span>} />`,
      render: () => <Demo question={SINGLE} reason="上次这类题错了" header={<span className="text-xs text-muted">第 3 题</span>} />,
    },
    {
      title: "主观题",
      description: "只读题面，下方提示需教师批阅，没有提交按钮。",
      code: `<QuestionAnswer question={question} value={undefined} onChange={() => {}} />`,
      render: () => <Demo question={ESSAY} />,
    },
    {
      title: "选项缺失",
      description: "选择题的选项没入库：明说这道题暂时没法作答，不摆一个点不动的空单选组。",
      code: `<QuestionAnswer question={{ ...question, options: null }} value={value} onChange={setValue} onSubmit={submit} />`,
      render: () => <Demo question={MISSING_OPTIONS} />,
    },
  ],
  controls: [
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "pending", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <Demo question={SINGLE} /> },
    { name: "judge", render: () => <Demo question={JUDGE} /> },
    { name: "blank", render: () => <Demo question={BLANK} /> },
    {
      name: "answered",
      render: () => (
        <QuestionAnswer
          question={{ type: JUDGE.type, stem: JUDGE.stem, options: null }}
          value="true"
          onChange={() => {}}
          result={{ correct: true, correctAnswer: true, analysis: JUDGE.analysis }}
          correctHint="下次不会再推给你"
        />
      ),
    },
  ],
  renderWithProps: (props) => (
    <Demo question={SINGLE} disabled={Boolean(props.disabled)} pending={Boolean(props.pending)} />
  ),
  toCode: (props) =>
    `<QuestionAnswer${props.disabled ? " disabled" : ""}${props.pending ? " pending" : ""} question={question} value={value} onChange={setValue} onSubmit={submit} />`,
};
```

注意：`ShowcaseSpec` 的 `controls` / `states` / `renderWithProps` / `toCode` 字段形状照 `question-editor.showcase.tsx`；`ESSAY` 示例传 `onSubmit` 也不会出按钮（主观题），所以 `Demo` 复用无碍。

- [ ] **Step 2: 注册 showcase + SSR 守卫**

`packages/ui/src/showcase.ts` 里 `export { questionEditorShowcase } from "./question-editor/question-editor.showcase";` 之后加：
```ts
export { questionAnswerShowcase } from "./question-answer/question-answer.showcase";
```

```bash
cd packages/ui && npx vitest run src/ssr-safety.test.tsx 2>&1 | tail -5
```
期望：PASS（它遍历 `showcase.ts` 全部导出做 SSR 渲染；红了按报错修 showcase，不改守卫）。

- [ ] **Step 3: 补英文词条并生成**

```bash
pnpm showcase:generate 2>&1 | grep -A80 "missing English copy" | head -100
```
把报出的每条中文原文加进 `apps/www/i18n/showcase-copy.en.json` 的 `exact` 块（放在 `question-editor` 那批词条之后，保持文件原有分组习惯）。预期词条与译文：

```json
"基础用法": 已有，跳过,
"单选题：选项是 RadioGroup，交了就地用 gradeObjective 判分显示正误与解析。": "Single choice: options are a RadioGroup; on submit the demo grades locally with gradeObjective and shows the verdict and explanation.",
"多选题": "Multiple choice",
"CheckboxGroup，回传排好序的 key 数组；少选多选都判错。": "A CheckboxGroup returning a sorted array of keys; too few or too many selections are both wrong.",
"判断题": "True or false",
"两个选项是题型自带的（题库里 options 是 null），值是 \"true\" / \"false\"。": "The two options come with the type (options is null in the bank); the value is \"true\" / \"false\".",
"多空填空": "Multiple blanks",
"每空一个输入框并标空号，每个空都填了才能交；答错按空号列出正确答案。": "One input per blank with its number; submit only when every blank is filled; a wrong answer lists the correct answer per blank.",
"公式键盘": "Formula keyboard",
"blankInput=\"math\" 时每空渲染 mathField 注入的组件；这里注入的是一个普通输入框。": "With blankInput=\"math\" every blank renders the component injected via mathField; here it is a plain input.",
"回看": "Review",
"已作答：value 与 result 一并传入，控件锁定，按钮变「已提交」。": "Already answered: pass value and result together; controls lock and the button reads Submitted.",
"来源说明与页眉": "Source line and header",
"reason 是题干上方那行推荐理由；header 放题号或计时。": "reason is the recommendation line above the stem; header holds the number or a timer.",
"主观题": "Subjective",
"只读题面，下方提示需教师批阅，没有提交按钮。": "Read-only stem with a note that the teacher grades it; no submit button.",
"选项缺失": "Missing options",
"选择题的选项没入库：明说这道题暂时没法作答，不摆一个点不动的空单选组。": "The options of a choice question were never entered: say plainly it cannot be answered yet instead of showing an empty radio group.",
"上次这类题错了": "You missed this kind last time",
"第 3 题": "Question 3",
"下次不会再推给你": "It will not be recommended again",
"LaTeX": 若报则 "LaTeX",
"三角函数": "Trigonometry"
```
`code` 块是逐行取词条：`reason="上次这类题错了"` 与 `header={<span>第 3 题</span>}` 这两行若被报 missing，按报出的**整行原文**为键加译文（`reason="You missed this kind last time"` / `header={<span>Question 3</span>}`）。题干 / 选项里的 LaTeX 常量在 TS 字符串里，生成器只对 showcase 的 `title` / `description` / `code` 与 JSX 文本取词；若它把 `SINGLE.stem` 等也报出来，按报出的原文逐条补英文（公式保持原样，中文替换成英文；不以数字收尾）。

```bash
pnpm showcase:generate 2>&1 | grep -E "missing English copy|unused" ; pnpm showcase:check
```
期望：无 missing / unused；`showcase:check` rc=0。若报 `unused`，删掉多加的那条。

- [ ] **Step 4: 画廊三处注册**

`apps/www/lib/manifest.ts`：`question-editor` 那行之后加：
```ts
  { slug: "question-answer", name: "QuestionAnswer", shortName: "学生作答卡", description: "学生答一道题：按题型给对的控件、选项缺失明说、多空全填才可交、答完显示正误与解析", category: "forms", group: "advanced", status: "new" },
```

`apps/www/lib/registry.tsx`：
- 第 164 行附近 showcase import 列表 `questionEditorShowcase,` 之后加 `questionAnswerShowcase,`；
- 第 613 行附近映射 `"question-editor": questionEditorShowcase,` 之后加 `"question-answer": questionAnswerShowcase,`。

`apps/www/i18n/component-meta.en.ts`：`"question-editor": {…},` 块之后加：
```ts
  "question-answer": {
    shortName: "QuestionAnswer",
    description:
      "Student answer card: the right control per question type, missing options stated plainly, submit only when every blank is filled, verdict and explanation after answering.",
    keywords: ["question", "answer", "student", "quiz", "math", "forms"],
  },
```

```bash
pnpm --filter www exec vitest run i18n/meta-coverage.test.ts 2>&1 | tail -3
```
期望：PASS。

- [ ] **Step 5: `docs:all` 再 perf-lab 重生成（顺序不能反）**

```bash
pnpm docs:all 2>&1 | tail -15
git status --short | grep -v "^ M packages/ui/src/upload/upload.tsx"
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts 2>&1 | tail -3
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check 2>&1 | tail -3
```
判据：
- `docs:all` 不覆盖 Task 6 手写的两份 md（`git diff packages/ui/src/question-answer/*.md` 应为空；若被改成 scaffold，`git checkout` 回来说明 md 的 frontmatter 有格式问题，照 `question-editor.md` 修）。
- `git status` 里只应出现本阶段的文件与 `apps/www/public|generated` / `docs/` 产物；若混进别的组件条目（并行 session 的 WIP），只 add 自己的。
- perf-lab `--check` rc=0，`apps/perf-lab/scenarios/generated.ts` 出现 `"question-answer"`。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-answer/question-answer.showcase.tsx packages/ui/src/showcase.ts apps/www/i18n/showcase-copy.en.json apps/www/generated/showcase-en/question-answer.showcase.tsx apps/www/generated/showcase-en/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx apps/www/i18n/component-meta.en.ts apps/perf-lab/scenarios/generated.ts
git add $(git status --short | awk '$1=="M"||$1=="??"{print $2}' | grep -E "^apps/www/(public|generated)/|^docs/" )
git status --short   # 确认 upload.tsx 仍是未暂存
git commit -m "feat(www): QuestionAnswer 画廊示例、英文词条与四处注册（manifest/registry/英文元数据/perf-lab）+ docs:all 产物"
```

---

### Task 8: changeset + README 计数 + 全量门禁 + 合回 master

**Files:**
- Create: `.changeset/question-answer.md`
- Modify: `README.md` / `README.en.md` / `packages/ui/README.md`（`pnpm readme:sync`，397 → 398）

- [ ] **Step 1: changeset**

`<实测>` / `<基线>` 用 Task 5 Step 5 的数字替换（基线没动就写「仍在 208KB 基线内」）。

````md
---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增 `QuestionAnswer`：学生端一道题的作答卡。按题型给对的控件（single → RadioGroup、multiple → CheckboxGroup、judge → 题型自带「正确 / 错误」两项且值为 `"true" | "false"`、blank → 每空一个输入框并标空号，`blankCount` 缺失按题干 `____` 数再不行按 1）；选择题选项缺失明说「暂时没法作答」而不是摆一个空单选组；主观题只读并提示需教师批阅；未知题型按主观题处理并有开发期告警。`canSubmit` 门禁：多空每个空都填了才可交；`onSubmit` 给了才出提交按钮，参数是规范形（填空恒为数组，单空压平交给 `encodeBlanks`）。`result` 有值即锁定并显示正误、`answerText` 渲染的正确答案与解析；`correctHint` / `reason` / `header` 三个插槽；`blankInput="math"` + `mathField` 注入公式键盘（`MathFieldLikeProps` 新增可选 `disabled`）。题干与 QuestionCard 共用新抽出的 `QuestionStemBlock`（`resolveFigure` 切图 + Formula）。消费方原型里三条曾静默让学生「答不了」的 bug（判断题空单选组 / 多空只有一个输入框 / 对象形 options 被滤空）各有回归测试。文案走 Locale（新增 `questionAnswer` 词条）。配套导出 `canSubmit` / `answerKind` / `resolveBlankCount`。

体积：`@hulianui/ui/math` 的 `export *` 上界实测 <实测>KB（新进入该入口的只有 Radio / RadioGroup / Input），<仍在 208KB 基线内 | 基线上调到 <基线>KB>；库 `sideEffects:false`，只用 `Formula` / `QuestionCard` 的消费方经 tree-shaking 不受影响。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains `QuestionAnswer`, the student-side answer card for one question. It renders the right control per type (single → RadioGroup, multiple → CheckboxGroup, judge → the two built-in True / False options with values `"true" | "false"`, blank → one input per blank with its number; when `blankCount` is missing it counts `____` in the stem, then falls back to 1); a choice question with missing options says plainly that it cannot be answered yet instead of showing an empty radio group; subjective questions are read-only with a "graded by the teacher" note; an unknown type is treated as subjective with a development warning. `canSubmit` gates submission until every blank is filled; the submit button appears only when `onSubmit` is provided and receives the canonical shape (blanks are always an array, flatten a single blank with `encodeBlanks`). A present `result` locks the card and shows the verdict, the correct answer rendered by `answerText`, and the explanation; `correctHint` / `reason` / `header` slots; `blankInput="math"` with `mathField` injects a formula keyboard (`MathFieldLikeProps` gains an optional `disabled`). The stem shares the newly extracted `QuestionStemBlock` with QuestionCard (`resolveFigure` splitting plus Formula). Three silent "the student cannot answer" bugs from the consumer's prototype (empty radio group for true-false / one input for multiple blanks / object-shaped options filtered away) each have a regression test. Copy comes from the locale (new `questionAnswer` entries). Companion exports: `canSubmit` / `answerKind` / `resolveBlankCount`.

Size: the `export *` upper bound of `@hulianui/ui/math` measures <实测>KB (only Radio / RadioGroup / Input newly enter this entry), <within the existing 208KB baseline | baseline raised to <基线>KB>; the package is `sideEffects:false`, so consumers importing only `Formula` or `QuestionCard` are unaffected after tree-shaking.
<!-- changelog-en:end -->
````

- [ ] **Step 2: README 计数**

```bash
pnpm readme:sync
git diff --stat README.md README.en.md packages/ui/README.md
```
期望：三处 397 → 398。

- [ ] **Step 3: 全量门禁**

```bash
cd packages/ui && npx vitest run src/question-answer src/question-editor src/question src/math-textarea src/question-card && cd ../..
pnpm showcase:check && pnpm conventions:check && pnpm docs:check:props && pnpm docs:i18n:check && pnpm check:remote-assets
pnpm typecheck
pnpm test:scripts
CI=1 pnpm size
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check
CI=1 pnpm --filter @hulianui/hulian-scan test 2>&1 | tail -5
cd packages/ui && npx vitest run 2>&1 | tail -6
```
期望：全部 rc=0；ui 全量 ≥ 5922 + 本阶段新增（state 约 45 条 / locale 4 / stem-block 3 / 主件约 28 / exports 2）。
- `pnpm test:scripts` 若报英文词表 `protectedTokens`（`$` 计数）：回 Task 7 Step 3 检查是否有示例句以数字紧贴 `$` 收尾。
- `pnpm typecheck` 里 `apps/www` 若因 dist 残留拿旧声明报错：`pnpm --filter @hulianui/ui build` 后重跑。
- **不要**用 `cmd | tail` 判绿，看每条命令自己的退出码（`echo $?`）。

- [ ] **Step 4: Commit 并合回 master**

```bash
git add .changeset/question-answer.md README.md README.en.md packages/ui/README.md
git status --short   # 只应剩 upload.tsx 未暂存
git commit -m "docs(ui/math): QuestionAnswer changeset 与 README 计数（398）"
git checkout master && git merge --ff-only feat/math-question-phase4 && git log --oneline -1
```
不 push。

---

## Self-Review

- §6.1 接口：`question` / `value` / `onChange` / `result` / `onSubmit` / `pending` / `disabled` / `renderStem` / `blankInput` / `mathField` / `header` / `reason` / `correctHint` / `className` 全在 Task 1 类型里；多出的 `resolveFigure` 是阶段 3 已批准偏离的延伸（题干同源渲染），Task 3 落地。`canSubmit` 导出（Task 5）。
- §6.1 行为：single RadioGroup（值 = key，Task 4 有「60°」不交「6」的测试）、multiple CheckboxGroup、judge 两项 `"true" | "false"` 文案走 question locale、blank 每空一框 + 空号 + `blankCount` 回退链、选项缺失 Alert、主观题只读、多空全填才交、单空交 `string[]`、Radio/Checkbox label 用 Formula 无 aria-label、结果区 Alert + `answerText` + 解析：Task 4 各有测试。
- §6.2 `gradeObjective`：阶段 1 已落地；本阶段在 showcase（Task 7 `Demo`）与文档（Task 6「即时反馈」段）接线，并写明服务端 SSOT。
- §7 错误处理：未知 `type` 按主观题 + `warnOnce`（Task 4）；`mathField` 缺失回落 + `warnOnce`（Task 4，spec 没写，是必要补充）。
- §8.1 测试：三条静默 bug 回归 + `canSubmit`（Task 1 / 4）、`ssr-safety`（Task 7 Step 2）、showcase 英文词表两头（Task 7 Step 3）、`docs:check:props`（Task 3 / 6）、conventions / bundle-size / hulian-scan（Task 5 / 8）。browser test 按 Global Constraints 不写。
- §8.2 文档与注册：中英 md（Task 6）、`math.md` 更新（Task 6 Step 3）、六处注册（Task 5 `math/index.ts`、Task 7 showcase / manifest / registry / 英文元数据 / perf-lab）。
- 类型一致性：`AnswerKind` 六值在 Task 1 定义、Task 4 分派、Task 6 文档一致；`currentAnswer(kind, value, blanks)` 签名 Task 1 / 4 一致；`QuestionStemBlock` 参数 `figureAlt: (index: number) => string` 与 `QuestionAnswerLocale.figureAlt` 同签名；`MathFieldLikeProps.disabled` Task 3 加、Task 4 传、Task 7 stub 接。
- 占位扫描：`<实测>` / `<基线>` 是 Task 5 产出的数字，Task 8 Step 1 已注明替换；无 TBD / TODO。
