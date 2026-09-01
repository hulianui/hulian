# 数学题件 · 阶段 3：QuestionEditor（出题 / 复核编辑器）— 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 5069tk-app 的 `question-form.tsx`（1255 行）里属于「一道题」的部分回流成 `@hulianui/ui/math` 的 `QuestionEditor`：七型切换（脏数据先确认）、题干 + 题图、选项（增删上下移、答案随重排跟着走）、判断、填空（空数随题干、等价写法、不匹配时一键对齐）、主观题（参考答案 + 分步给分）、解析、难度 / 分值 / 用时、复核条、`extra` 私有字段插槽、右侧 QuestionCard 实时预览、`validateQuestion` 就地 `Field.error`；消费方私有字段（学科 / 教材小节 / 考点 / 上传端点）全部留在消费方。

**Architecture:** 新目录 `packages/ui/src/question-editor/`。状态变换全部是纯函数（`question-editor.state.ts`：输入一份 `Question` 输出下一份），组件只剩「哪个控件调哪个函数」；四个分节子件（题图条 / 选项 / 填空 / 主观题）各一个文件，主件 `question-editor.tsx` 负责题型切换确认、校验映射、布局与预览。词条独立成 `question-editor.locale.ts`（`config/locale.ts` 反向引用，与 `question.locale.ts` / `math-textarea.locale.ts` 同一处方）。题干正文与题图分离：输入框永远只见正文，图以 `![](key)` 块写回题干末尾；预览就是 `QuestionCard`（本阶段给它加 `resolveFigure`，同源渲染）。

**Tech Stack:** TypeScript 5.9 / React 19 / vitest（unit = jsdom）/ Tailwind v4 / 阶段 1 的 `question/` 纯函数域 / 阶段 2 的 `MathTextarea` / 库内 Field、Segmented、CheckboxGroup、Checkbox、Switch、Rating、NumberField、Alert、AlertDialog、Chip、Image、Button、Text。

Spec：`docs/superpowers/specs/2026-08-31-math-question-authoring-design.md` §5、§7、§8。回流原型：`/Users/zhangzhiwei/Desktop/code/5069tk-app/web/components/question-form.tsx`（`resetShape` / `removeOption` / 题图 `latest` ref / `SUBJECTIVE_ANSWER_COPY` / `dirtyFieldLabels`）。上游产物：`packages/ui/src/question/`（`question.types.ts` / `question-shape.ts` / `question-stem.ts` / `question.locale.ts`）、`packages/ui/src/math-textarea/`。

## Global Constraints

- 目录 `packages/ui/src/question-editor/`（`question/` 在 `scripts/gen-component-docs.mjs` 的 SKIP_DIRS 里，是纯函数域，组件不进去）。一切从 `packages/ui/src/math/index.ts` 导出；主 barrel `packages/ui/src/index.ts` **一个都不加**。
- 文案走 Locale：新建 `question-editor/question-editor.locale.ts`（`QuestionEditorLocale` + `QUESTION_EDITOR_LOCALE_ZH/EN`），`config/locale.ts` 的 `ComponentLocale` 加 `questionEditor?:`，`zhCN` / `enUS` 都接。组件里 `useComponentLocale().questionEditor ?? QUESTION_EDITOR_LOCALE_ZH`；题型名与判断题两个值从 `useComponentLocale().question ?? QUESTION_LOCALE_ZH` 取，不重复定义。**禁止**在 `question-editor/` 任何文件 import `../config/locale`（会把 28KB 整份字典拖进 math 入口；`bash scripts/bundle-size.sh --why math` 可归因）。
- 界面文案写「状态」不写「机制」：占位符 / 说明 / 按钮用短名词短语或一句状态句，不写「点击后会……」。英文里不许有 CJK 与 em-dash。
- 纯函数不产出文案：`validateQuestion` 的 `code` 由组件按 Locale 的 `validation[code](detail)` 翻译。
- 图标只从 `packages/ui/src/_icons` 取（已有 `ChevronUp` / `ChevronDown` / `Plus` / `X` / `Image`），不 import `lucide-react`。
- 色彩 / 背景：只用本库 token（`border-border` / `bg-surface` / `text-foreground` / `bg-white` 给图底）；**不用** `bg-muted`、`text-muted-foreground`、`bg-background`、`bg-card`（后三者不是本库 token，静默回退），组件里**不写 `style=`**、不写 `!` 类。
- 开发期告警用 `warnOnce`（`packages/ui/src/lib/warn-once.ts`）：本阶段唯一一处是「题干含图但没给 `resolveFigure`」。
- `docs:check:props` 只看 `<slug>/*.types.ts` 里 `Props` / `Item` 结尾的导出接口：`QuestionEditorProps` 每个字段都要进 md 表；内部共享的分节上下文类型刻意命名为 `SectionContext`（不以 Props 结尾），不进文档、不从 barrel 导出。
- **体积基线决策（需主人知悉）**：`scripts/size-limits.json` 里 `math` 现在实测 154.4KB / 上限 178KB。QuestionEditor 会把 Field、Segmented、CheckboxGroup、Checkbox、Switch、Rating、NumberField、Alert、AlertDialog、Chip、Image 带进 `@hulianui/ui/math` 的 `export *` 上界，预计实测落在 185–200KB，必然超 178KB。库 `sideEffects: false`，只 import `Formula` / `QuestionCard` 的消费方经 tree-shaking 不付费；尺子量的是上界。Task 6 在 `--why math` 归因里**确认没有 `config/locale.ts`、多出来的只是上述 UI 件**之后，**手改** `scripts/size-limits.json` 里 `math` 那一行为 `ceil(实测 × 1.15)`（**不要用 `--update`**：它会重写全部 14 条基线，别的入口放宽、pro-table 反收紧）。
- 测试：`*.test.ts(x)` 走 jsdom；不写 browser test（窄屏叠放留到阶段 5 demo 实机验）。Base UI AlertDialog 在 jsdom 里可用 `document.querySelector('[role="alertdialog"]')` 拿到（`alert-dialog.test.tsx:18` 先例）；Segmented 是 `role="radiogroup"` + `role="radio"`，选项按可见文字用 `getByRole("radio", { name })`。
- 每个任务结束 `git add <具体文件>` 再 commit，**不许** `git add -A`（工作区 `packages/ui/src/upload/upload.tsx` 是来历不明的未提交改动，不要碰、不要还原、不要连带提交）。commit message 末尾带：
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_01C4xPVaXzvkQabhxVZqELw3`
- 命令：单测 `cd packages/ui && npx vitest run <path>`；typecheck `pnpm --filter @hulianui/ui typecheck`；体积 `CI=1 pnpm size`（必须带 `CI=1`）。
- 分支：`git checkout -b feat/math-question-phase3` 从 master 起；全部任务完成、门禁全绿后 `git checkout master && git merge --ff-only feat/math-question-phase3`，不 push。
- 生成顺序（阶段 2 实测的坑）：中英 md 必须**先于** `pnpm docs:all` 存在（否则脚手架生成 scaffold md）；perf-lab 重生成必须**在** `pnpm docs:all` 之后（生成器要求 `registry.json` 已有该 slug）。
- JSX 属性字符串不处理 `\\`：showcase / 测试里含反斜杠的值写 `{"..."}`。英文 md 用法段用 `## Examples` 不用 `## Usage`（`extractPitfalls` 的标题正则含 Usage，会把整段当坑位）。showcase 英文词表 `protectedTokens` 对数字紧贴 `$`（`0$`）报 missing，示例句避开。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `packages/ui/src/question-card/question-card.types.ts` / `question-card.tsx` | 新增 `resolveFigure?: (key) => string`：给了就 `splitStemFigures` 切图，正文走 Formula、图走 Image 列表（同源渲染，编辑器预览直接用） |
| `packages/ui/src/question-card/question-card.md` / `.en.md` | Props 表加 `resolveFigure` 行 |
| `packages/ui/src/question-editor/question-editor.types.ts` | `QuestionEditorProps`、`EditorField`、`SectionContext`（内部） |
| `packages/ui/src/question-editor/question-editor.state.ts` | 纯函数：题型切换 / 选项增删移（答案跟着重映射）/ 填空与等价写法 / 分步给分 / 题图块拆合 / 校验分桶 / 公式语法逐字段 |
| `packages/ui/src/question-editor/question-editor.locale.ts` | `QuestionEditorLocale` + 中英预设（SSOT） |
| `packages/ui/src/config/locale.ts` | `ComponentLocale.questionEditor?` + `zhCN` / `enUS` 接线 |
| `packages/ui/src/question-editor/question-editor-figures.tsx` | `FiguresStrip`：题图缩略图条 + 插入图片（隐藏 file input + `onUploadFigure`）+ 上传中 / 失败行 |
| `packages/ui/src/question-editor/question-editor-options.tsx` | `OptionsSection`：选项行 + 正确答案（single Segmented / multiple CheckboxGroup） |
| `packages/ui/src/question-editor/question-editor-blanks.tsx` | `BlanksSection`：每空一行 + 等价写法 + 空数不匹配 Alert |
| `packages/ui/src/question-editor/question-editor-subjective.tsx` | `SubjectiveSection`：参考答案 + 分步给分开关与得分点 |
| `packages/ui/src/question-editor/question-editor.tsx` | `QuestionEditor` 主件 |
| `packages/ui/src/question-editor/index.ts` | 目录 barrel |
| `packages/ui/src/math/index.ts` | 转出 question-editor 公开件 |
| `packages/ui/src/question-editor/question-editor.showcase.tsx` | 画廊 |
| `packages/ui/src/showcase.ts` | 注册 showcase |
| `apps/www/i18n/showcase-copy.en.json` | showcase 英文词条（exact） |
| `apps/www/generated/showcase-en/*` | `pnpm showcase:generate` 产物 |
| `packages/ui/src/question-editor/question-editor.md` / `.en.md` | 文档 |
| `packages/ui/src/math/math.md` / `.en.md` | 题目域段落与「相关」加 QuestionEditor |
| `apps/www/lib/manifest.ts` / `apps/www/lib/registry.tsx` / `apps/www/i18n/component-meta.en.ts` | 画廊三处注册 |
| `apps/perf-lab/scenarios/generated.ts` | 重生成（不手改） |
| `scripts/size-limits.json` | math 基线手改一行 |
| `README.md` | `pnpm readme:sync`（396 → 397） |
| `.changeset/question-editor.md` | minor changeset（中英段） |
| `packages/ui/src/question-editor/*.test.ts(x)`、`question-card/question-card.test.tsx` | 测试 |

---

### Task 0: 起分支

- [ ] **Step 1: 确认工作区只有 upload.tsx 一处改动，起分支**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git status --short          # 期望只有 " M packages/ui/src/upload/upload.tsx"
git checkout -b feat/math-question-phase3
```

---

### Task 1: QuestionCard 加 `resolveFigure`（题干带图的同源渲染）

**Files:**
- Modify: `packages/ui/src/question-card/question-card.types.ts`（`figure` 之后加一个字段）
- Modify: `packages/ui/src/question-card/question-card.tsx`（import + 题干渲染）
- Modify: `packages/ui/src/question-card/question-card.test.tsx`（末尾加两条）

**Interfaces:**
- Consumes：`splitStemFigures(stem): { text, figures }`（`../question/question-stem`）、`Image`（`../image`）。
- Produces：`QuestionCardProps.resolveFigure?: (key: string) => string`。给了就把题干里的 `![](key)` 切出来，正文交 Formula，图按顺序渲染成 `<img src={resolveFigure(key)}>`；不给则行为与现在逐字相同（题干原样交 Formula）。

- [ ] **Step 1: 写失败测试**

在 `packages/ui/src/question-card/question-card.test.tsx` 的 `describe("QuestionCard", () => {` 块末尾（最后一个 `it(` 之后、`});` 之前）追加：

```tsx
  it("resolveFigure 给了：题干里的图片引用切出来渲染成 img，正文不再含图片语法", () => {
    const { container } = render(
      <QuestionCard
        stem={"如图，$AB \\parallel CD$。\n\n![](import/a.png)\n![](import/b.png)"}
        type="single"
        resolveFigure={(key) => `/files/${key}`}
      />,
    );
    const imgs = Array.from(container.querySelectorAll("img")).map((img) => img.getAttribute("src"));
    expect(imgs).toEqual(["/files/import/a.png", "/files/import/b.png"]);
    expect(container.textContent).not.toContain("![](");
  });

  it("resolveFigure 不给：题干原样交给排版（与旧行为一致）", () => {
    const { container } = render(<QuestionCard stem={"看图 ![](import/a.png)"} type="single" />);
    expect(container.querySelector("img")).toBeNull();
  });
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-card/question-card.test.tsx
```
期望：第一条 FAIL（`imgs` 为 `[]`，且 textContent 含 `![](`）。

- [ ] **Step 3: 加类型**

`packages/ui/src/question-card/question-card.types.ts` 里 `figure?: { src: string; alt?: string };` 之后插入：

```ts
  /**
   * 题干里 `![](key)` 图片引用的解析器：storage key → 可显示的 URL。
   * 给了就先切图再排公式（`splitStemFigures`），图按出现顺序渲染在正文之后；不给则题干原样交给 Formula。
   * QuestionEditor 的实时预览与消费方的题库列表都靠它，两边同一个渲染路径。
   */
  resolveFigure?: (key: string) => string;
```

- [ ] **Step 4: 改渲染**

`packages/ui/src/question-card/question-card.tsx`：

import 区 `import type { QuestionType } from "../question/question.types";` 之前加：

```ts
import { splitStemFigures } from "../question/question-stem";
```

解构参数里 `figure,` 之后加 `resolveFigure,`。

`const resolvedType` 那一行之后加：

```ts
  // 先切图再排公式：storage key 里合法地带着 `_` `^` `\`，交给 Formula 会被当成下标 / 命令吃成乱码。
  const split = resolveFigure ? splitStemFigures(stem) : null;
  const stemText = split ? split.text : stem;
```

把

```tsx
            <Text as="p" className="leading-7">
              <Formula>{stem}</Formula>
            </Text>
```

改成

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

- [ ] **Step 5: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/question-card && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-card/question-card.types.ts packages/ui/src/question-card/question-card.tsx packages/ui/src/question-card/question-card.test.tsx
git commit -m "feat(ui/math): QuestionCard 加 resolveFigure，题干里的 ![](key) 先切图再排公式（编辑器预览同源）"
```

---

### Task 2: 类型 + 纯函数 `question-editor.state.ts`

**Files:**
- Create: `packages/ui/src/question-editor/question-editor.types.ts`
- Create: `packages/ui/src/question-editor/question-editor.state.ts`
- Create: `packages/ui/src/question-editor/question-editor.state.test.ts`

**Interfaces:**
- Consumes（阶段 1 / 2）：`Question` / `QuestionType` / `QuestionAnswer` / `BlankAnswer` / `Rubric` / `QuestionIssue` / `QuestionValidationIssue` / `QuestionValidationCode`（`../question/question.types`）；`defaultShape` / `DEFAULT_SCORE_BY_TYPE` / `MAX_OPTIONS` / `optionKey` / `blankCount`（`../question/question-shape`）；`stemFigureKeys` / `stripStemFigures`（`../question/question-stem`）；`validateFormulaSyntax` / `FormulaSyntaxIssue` / `FormulaTemplateGroup`（`../math-textarea/formula-editing`）；`MathFieldLikeProps` / `MathTextareaProps`（`../math-textarea/math-textarea.types`）；`formulaToPlain`（`../math/math.parse`）。
- Produces：
  - `interface QuestionEditorProps`（见 Step 1）
  - `type EditorField = "stem" | "options" | "answer" | "difficulty" | "score"`
  - `interface SectionContext { value; onChange(next, field); disabled; L; textarea; errors }`（内部）
  - `scoreDefaults(overrides?) : Record<QuestionType, number>`
  - `shapeIsDirty(q): boolean`、`switchType(q, type, defaults?): Question`
  - `setOptionText(q, index, text)`、`addOption(q)`、`removeOption(q, index)`、`moveOption(q, from, to)`、`optionCaption(key, text): string`
  - `blankCells(answer): BlankAnswer[]`、`blankWritings(cell): string[]`、`setBlankWriting(q, blank, writing, text)`、`addBlankWriting(q, blank)`、`removeBlankWriting(q, blank, writing)`、`addBlank(q)`、`removeBlank(q, index)`、`alignBlanks(q, count)`、`blankMismatch(q): { expected, actual } | null`
  - `isRubric(answer)`、`referenceText(answer)`、`setReference(q, text)`、`enableRubric(q)`、`disableRubric(q)`、`setRubricPoint(q, index, patch)`、`addRubricPoint(q)`、`removeRubricPoint(q, index)`、`rubricTotal(answer): number`
  - `stemFigures(stem): string[]`、`stemBody(stem): string`、`joinStemFigures(body, keys): string`、`setStemBody(q, body)`、`addStemFigure(q, key)`、`removeStemFigure(q, key)`
  - `setEstimatedMinutes(q, minutes: number | null)`
  - `issuesByField(issues): Partial<Record<EditorField, QuestionValidationIssue>>`
  - `type FormulaField = "stem" | "options" | "answer" | "analysis"`、`interface QuestionFormulaIssue { field: FormulaField; key?: string; issue: FormulaSyntaxIssue }`、`questionFormulaIssues(q): QuestionFormulaIssue[]`

- [ ] **Step 1: 写类型文件**

```ts
// packages/ui/src/question-editor/question-editor.types.ts
import type { ComponentType, ReactNode } from "react";
import type { FormulaTemplateGroup } from "../math-textarea/formula-editing";
import type { MathFieldLikeProps, MathTextareaProps } from "../math-textarea/math-textarea.types";
import type {
  Question,
  QuestionIssue,
  QuestionType,
  QuestionValidationIssue,
} from "../question/question.types";
import type { QuestionEditorLocale } from "./question-editor.locale";

/** 校验问题能挂到的字段（与 `QuestionValidationIssue.field` 同一集合）。 */
export type EditorField = QuestionValidationIssue["field"];

export interface QuestionEditorProps {
  /** 受控值：规范形（`Question`）。历史变体先用 `fromWire` 归一再喂进来。 */
  value: Question;
  /** 每次编辑回传整份规范形；提交前用 `toWireAnswer` 压平填空单空。 */
  onChange: (next: Question) => void;
  disabled?: boolean;
  /** 题干里 `![](key)` → 可显示 URL。题干有图而没给它时缩略图条只能显示 key，并有开发期告警。 */
  resolveFigure?: (key: string) => string;
  /** 上传一张题图，返回 storage key。**给了才出「插入图片」**；成功后以 `![](key)` 写回题干末尾。 */
  onUploadFigure?: (file: File) => Promise<string>;
  /** 消费方私有字段（学科 / 教材小节 / 考点 …），渲染在题型之后、题干之前。 */
  extra?: ReactNode;
  /** 复核条：有值时顶部列出，每条一个「已处理」。 */
  issues?: QuestionIssue[];
  onResolveIssue?: (label: string) => void;
  /** 覆盖按题型的默认分。切题型时 `score` 若仍等于旧题型默认分则换成新默认分。 */
  defaultScoreByType?: Partial<Record<QuestionType, number>>;
  /** 透传给每个 MathTextarea 的模板组。 */
  templates?: readonly FormulaTemplateGroup[];
  /** 透传给每个 MathTextarea 的可视化编辑器。 */
  visualEditor?: ComponentType<MathFieldLikeProps>;
  /** 透传给每个 MathTextarea 与预览的 KaTeX 宏表。 */
  macros?: Record<string, string>;
  /** 右侧 / 下方 QuestionCard 实时预览（`showAnswer`）。@default true */
  preview?: boolean;
  /**
   * 把 `validateQuestion` 的全部问题立刻挂到字段上。默认只显示**改过的**字段的问题
   * （一张空表单一打开就满屏红字不是校验，是噪音）；页面在用户点提交后把它置 true。
   * @default false
   */
  showAllIssues?: boolean;
  className?: string;
}

/** 分节子件共用的上下文。刻意不以 Props 结尾：内部类型，不进文档、不从 barrel 导出。 */
export interface SectionContext {
  value: Question;
  /** `field` 是这次改动落在哪个校验字段上（用来决定该字段的问题从此可见）。 */
  onChange: (next: Question, field: EditorField) => void;
  disabled: boolean;
  L: QuestionEditorLocale;
  textarea: Pick<MathTextareaProps, "templates" | "visualEditor" | "macros">;
  /** 已经过「是否可见」过滤的字段错误文案。 */
  errors: Partial<Record<EditorField, string>>;
}
```

`QuestionEditorLocale` 在 Task 3 定义；本任务 typecheck 前先建一个只含接口骨架的 `question-editor.locale.ts` 会让 Task 3 重写，所以本任务**只跑 vitest 不跑 typecheck**（vitest 不检查未解析的 type import），typecheck 放到 Task 3 末尾。

- [ ] **Step 2: 写表驱动测试**

```ts
// packages/ui/src/question-editor/question-editor.state.test.ts
import { describe, expect, it } from "vitest";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import {
  addBlank,
  addBlankWriting,
  addOption,
  addRubricPoint,
  addStemFigure,
  alignBlanks,
  blankCells,
  blankMismatch,
  blankWritings,
  disableRubric,
  enableRubric,
  isRubric,
  issuesByField,
  joinStemFigures,
  moveOption,
  optionCaption,
  questionFormulaIssues,
  referenceText,
  removeBlank,
  removeBlankWriting,
  removeOption,
  removeRubricPoint,
  removeStemFigure,
  rubricTotal,
  scoreDefaults,
  setBlankWriting,
  setEstimatedMinutes,
  setOptionText,
  setReference,
  setRubricPoint,
  setStemBody,
  shapeIsDirty,
  stemBody,
  stemFigures,
  switchType,
} from "./question-editor.state";

const single = (): Question => ({
  ...emptyQuestion("single"),
  stem: "题干",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
    { key: "C", text: "丙" },
  ],
  answer: "C",
});

describe("题型切换", () => {
  it("scoreDefaults 用覆盖值盖住内置默认分", () => {
    expect(scoreDefaults({ essay: 12 }).essay).toBe(12);
    expect(scoreDefaults({ essay: 12 }).single).toBe(3);
  });

  it.each([
    ["空单选不脏", emptyQuestion("single"), false],
    ["填了选项就脏", { ...emptyQuestion("single"), options: [{ key: "A", text: "x" }, { key: "B", text: "" }] }, true],
    ["选了答案就脏", { ...emptyQuestion("single"), answer: "A" }, true],
    ["判断题默认 true 不脏", emptyQuestion("judge"), false],
    ["判断题改成 false 就脏", { ...emptyQuestion("judge"), answer: false }, true],
    ["空填空不脏", emptyQuestion("blank"), false],
  ] as const)("shapeIsDirty：%s", (_, q, expected) => {
    expect(shapeIsDirty(q)).toBe(expected);
  });

  it("switchType 同时重置 options 与 answer，不带旧题型的形状", () => {
    const next = switchType(single(), "judge");
    expect(next.type).toBe("judge");
    expect(next.options).toBeNull();
    expect(next.answer).toBe(true);
    expect(next.stem).toBe("题干");
  });

  it("switchType：score 等于旧题型默认分时换成新默认分，改过则保留", () => {
    expect(switchType(single(), "essay").score).toBe(8);
    expect(switchType({ ...single(), score: 5 }, "essay").score).toBe(5);
    expect(switchType(single(), "essay", scoreDefaults({ essay: 12 })).score).toBe(12);
  });

  it("switchType 同题型原样返回", () => {
    const q = single();
    expect(switchType(q, "single")).toBe(q);
  });
});

describe("选项", () => {
  it("setOptionText 只改那一项", () => {
    expect(setOptionText(single(), 1, "乙乙").options).toEqual([
      { key: "A", text: "甲" },
      { key: "B", text: "乙乙" },
      { key: "C", text: "丙" },
    ]);
  });

  it("addOption 按下标补字母；到 8 个停", () => {
    expect(addOption(single()).options?.map((o) => o.key)).toEqual(["A", "B", "C", "D"]);
    let q = single();
    for (let i = 0; i < 10; i++) q = addOption(q);
    expect(q.options).toHaveLength(8);
  });

  it("removeOption 重排字母，答案跟着被删项之后的重排走", () => {
    const next = removeOption(single(), 0);
    expect(next.options).toEqual([
      { key: "A", text: "乙" },
      { key: "B", text: "丙" },
    ]);
    expect(next.answer).toBe("B");
  });

  it("removeOption 删掉的正是答案项时答案清空", () => {
    expect(removeOption(single(), 2).answer).toBe("");
  });

  it("removeOption 多选：删掉的 key 去掉，其余重映射并排序", () => {
    const q: Question = { ...single(), type: "multiple", answer: ["A", "C"] };
    expect(removeOption(q, 0).answer).toEqual(["B"]);
    expect(removeOption(q, 1).answer).toEqual(["A", "B"]);
  });

  it("removeOption 只剩两项时不再删", () => {
    const q = removeOption(single(), 0);
    expect(removeOption(q, 0)).toBe(q);
  });

  it("moveOption 内容移动、字母按新位置重排、答案跟着内容走", () => {
    const next = moveOption(single(), 2, 0);
    expect(next.options).toEqual([
      { key: "A", text: "丙" },
      { key: "B", text: "甲" },
      { key: "C", text: "乙" },
    ]);
    expect(next.answer).toBe("A");
  });

  it("moveOption 越界或原地原样返回", () => {
    const q = single();
    expect(moveOption(q, 0, -1)).toBe(q);
    expect(moveOption(q, 2, 3)).toBe(q);
    expect(moveOption(q, 1, 1)).toBe(q);
  });

  it("optionCaption：空文本只给字母，有文本取朴素文本前 20 字", () => {
    expect(optionCaption("A", "")).toBe("A");
    expect(optionCaption("B", "$\\frac{1}{2}$")).toBe("B 1/2");
    expect(optionCaption("C", "一二三四五六七八九十一二三四五六七八九十廿一")).toBe("C 一二三四五六七八九十一二三四五六七八九十…");
  });
});

describe("填空", () => {
  const blank = (): Question => ({ ...emptyQuestion("blank"), stem: "a=____，b=____", answer: ["1", ["2", "2.0"]] });

  it("blankCells / blankWritings 把两种形状展平", () => {
    expect(blankCells(blank().answer)).toEqual(["1", ["2", "2.0"]]);
    expect(blankCells("")).toEqual([""]);
    expect(blankCells([])).toEqual([""]);
    expect(blankWritings("1")).toEqual(["1"]);
    expect(blankWritings(["2", "2.0"])).toEqual(["2", "2.0"]);
    expect(blankWritings([])).toEqual([""]);
    expect(blankWritings(undefined)).toEqual([""]);
  });

  it("setBlankWriting：单写法存字符串，多写法存数组", () => {
    expect(setBlankWriting(blank(), 0, 0, "10").answer).toEqual(["10", ["2", "2.0"]]);
    expect(setBlankWriting(blank(), 1, 1, "2.00").answer).toEqual(["1", ["2", "2.00"]]);
  });

  it("addBlankWriting / removeBlankWriting：加一种写法变数组，删到一种收回字符串", () => {
    expect(addBlankWriting(blank(), 0).answer).toEqual([["1", ""], ["2", "2.0"]]);
    expect(removeBlankWriting(blank(), 1, 1).answer).toEqual(["1", "2"]);
    // 单写法不可删：返回原对象
    const q0 = blank();
    expect(removeBlankWriting(q0, 0, 0)).toBe(q0);
  });

  it("addBlank / removeBlank：至少保留一空", () => {
    expect(addBlank(blank()).answer).toEqual(["1", ["2", "2.0"], ""]);
    expect(removeBlank(blank(), 0).answer).toEqual([["2", "2.0"]]);
    const one = removeBlank(blank(), 0);
    expect(removeBlank(one, 0)).toBe(one);
  });

  it("blankMismatch：题干有空且数目不同才报；题干没写空不比", () => {
    expect(blankMismatch({ stem: "a=____", answer: ["1", "2"] })).toEqual({ expected: 1, actual: 2 });
    expect(blankMismatch(blank())).toBeNull();
    expect(blankMismatch({ stem: "没有空", answer: ["1", "2"] })).toBeNull();
  });

  it("alignBlanks：多的截掉、少的补空串，至少 1 空", () => {
    expect(alignBlanks(blank(), 3).answer).toEqual(["1", ["2", "2.0"], ""]);
    expect(alignBlanks(blank(), 1).answer).toEqual(["1"]);
    expect(alignBlanks(blank(), 0).answer).toEqual(["1"]);
  });
});

describe("主观题", () => {
  const essay = (): Question => ({ ...emptyQuestion("essay"), answer: "参考" });

  it("isRubric / referenceText 三种形状", () => {
    expect(isRubric("x")).toBe(false);
    expect(isRubric(null)).toBe(false);
    expect(isRubric(["A"])).toBe(false);
    expect(isRubric({ reference: "r", rubric: [] })).toBe(true);
    expect(referenceText("x")).toBe("x");
    expect(referenceText(null)).toBe("");
    expect(referenceText({ reference: "r", rubric: [] })).toBe("r");
  });

  it("setReference：纯文本直接写；分步给分只改 reference", () => {
    expect(setReference(essay(), "新").answer).toBe("新");
    const q = enableRubric(essay());
    expect(setReference(q, "新").answer).toEqual({ reference: "新", rubric: [{ point: "" }] });
  });

  it("enableRubric 保留参考答案并给一条空得分点；disableRubric 只留参考答案", () => {
    const on = enableRubric(essay());
    expect(on.answer).toEqual({ reference: "参考", rubric: [{ point: "" }] });
    expect(enableRubric(on)).toBe(on);
    expect(disableRubric(on).answer).toBe("参考");
    // 本来就不是分步给分：返回原对象
    const q0 = essay();
    expect(disableRubric(q0)).toBe(q0);
  });

  it("得分点增删改与合计", () => {
    let q = enableRubric(essay());
    q = setRubricPoint(q, 0, { point: "列式", score: 3 });
    q = addRubricPoint(q);
    q = setRubricPoint(q, 1, { point: "求解", score: 5 });
    expect(q.answer).toEqual({ reference: "参考", rubric: [{ point: "列式", score: 3 }, { point: "求解", score: 5 }] });
    expect(rubricTotal(q.answer)).toBe(8);
    expect(rubricTotal("x")).toBe(0);
    q = setRubricPoint(q, 1, { score: undefined });
    expect(rubricTotal(q.answer)).toBe(3);
    q = removeRubricPoint(q, 1);
    expect(isRubric(q.answer) && q.answer.rubric).toHaveLength(1);
    expect(removeRubricPoint(q, 0)).toBe(q);
  });

  it("非分步给分时得分点函数原样返回", () => {
    const q = essay();
    expect(setRubricPoint(q, 0, { point: "x" })).toBe(q);
    expect(addRubricPoint(q)).toBe(q);
    expect(removeRubricPoint(q, 0)).toBe(q);
  });
});

describe("题图", () => {
  it("joinStemFigures：无图原样；有图接在正文后、空正文只有图块", () => {
    expect(joinStemFigures("正文", [])).toBe("正文");
    expect(joinStemFigures("正文", ["a.png", "b.png"])).toBe("正文\n\n![](a.png)\n![](b.png)");
    expect(joinStemFigures("", ["a.png"])).toBe("![](a.png)");
    expect(joinStemFigures("   ", ["a.png"])).toBe("![](a.png)");
  });

  it("stemBody：编辑器写回的形状整块切掉，保住正文末尾的换行", () => {
    expect(stemBody("正文\n\n![](a.png)")).toBe("正文");
    expect(stemBody("正文\n\n\n![](a.png)\n![](b.png)")).toBe("正文\n");
    expect(stemBody("![](a.png)")).toBe("");
    expect(stemBody("没有图")).toBe("没有图");
  });

  it("stemBody：图夹在正文中间（导入线的形状）退回通用剥离", () => {
    expect(stemBody("看图 ![](import/a.png) 求面积")).toBe("看图 求面积");
  });

  it("stemFigures / setStemBody / addStemFigure / removeStemFigure 来回一致", () => {
    let q: Question = { ...emptyQuestion("blank"), stem: "正文\n\n![](a.png)" };
    expect(stemFigures(q.stem)).toEqual(["a.png"]);
    q = setStemBody(q, "正文改了\n");
    expect(q.stem).toBe("正文改了\n\n\n![](a.png)");
    expect(stemBody(q.stem)).toBe("正文改了\n");
    q = addStemFigure(q, "b.png");
    expect(stemFigures(q.stem)).toEqual(["a.png", "b.png"]);
    expect(addStemFigure(q, "b.png")).toBe(q);
    q = removeStemFigure(q, "a.png");
    expect(q.stem).toBe("正文改了\n\n\n![](b.png)");
    expect(removeStemFigure(q, "zzz.png")).toBe(q);
    q = removeStemFigure(q, "b.png");
    expect(q.stem).toBe("正文改了\n");
  });
});

describe("其余", () => {
  it("setEstimatedMinutes：null 删掉字段而不是写 undefined", () => {
    const q = setEstimatedMinutes(emptyQuestion("single"), 5);
    expect(q.estimatedMinutes).toBe(5);
    expect("estimatedMinutes" in setEstimatedMinutes(q, null)).toBe(false);
  });

  it("issuesByField 每个字段只留第一条", () => {
    const grouped = issuesByField([
      { field: "options", code: "option_empty", detail: { key: "A" } },
      { field: "options", code: "option_empty", detail: { key: "B" } },
      { field: "answer", code: "answer_out_of_range" },
    ]);
    expect(grouped.options?.detail).toEqual({ key: "A" });
    expect(grouped.answer?.code).toBe("answer_out_of_range");
    expect(grouped.stem).toBeUndefined();
  });

  it("questionFormulaIssues 逐字段跑语法自检并带上是哪一项", () => {
    const q: Question = {
      ...emptyQuestion("multiple"),
      stem: "定价 $100 元",
      options: [
        { key: "A", text: "$x$" },
        { key: "B", text: "$\\frac{1}{2$" },
      ],
      answer: ["A", "B"],
      analysis: "ok",
    };
    expect(questionFormulaIssues(q)).toEqual([
      { field: "stem", issue: expect.objectContaining({ code: "unclosed-math" }) },
      { field: "options", key: "B", issue: expect.objectContaining({ code: "unclosed-brace" }) },
    ]);
  });

  it("questionFormulaIssues 覆盖填空每空每写法、参考答案与得分点、解析", () => {
    const blank: Question = { ...emptyQuestion("blank"), stem: "a=____", answer: [["1", "$2"]], analysis: "$x" };
    expect(questionFormulaIssues(blank).map((i) => [i.field, i.key])).toEqual([
      ["answer", "1"],
      ["analysis", undefined],
    ]);
    const essay: Question = {
      ...emptyQuestion("essay"),
      stem: "题",
      answer: { reference: "$r", rubric: [{ point: "ok" }, { point: "$p" }] },
    };
    expect(questionFormulaIssues(essay).map((i) => [i.field, i.key])).toEqual([
      ["answer", undefined],
      ["answer", "2"],
    ]);
  });
});
```

- [ ] **Step 3: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-editor/question-editor.state.test.ts
```
期望：FAIL（模块不存在）。

- [ ] **Step 4: 写纯函数**

```ts
// packages/ui/src/question-editor/question-editor.state.ts
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
```

- [ ] **Step 5: 跑测试**

```bash
cd packages/ui && npx vitest run src/question-editor/question-editor.state.test.ts
```
期望：全部 PASS。若 `optionCaption` 那条 `"B 1/2"` 不过，先 `node -e` 打印 `formulaToPlain("$\\frac{1}{2}$")` 的真实输出（阶段 1 的 `math.parse.ts`），把断言改成真实值；不要改 `formulaToPlain`。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-editor/question-editor.types.ts packages/ui/src/question-editor/question-editor.state.ts packages/ui/src/question-editor/question-editor.state.test.ts
git commit -m "feat(ui/math): QuestionEditor 类型与状态纯函数（题型切换/选项重排答案跟随/填空等价写法/分步给分/题图块拆合/公式逐字段自检）"
```

---

### Task 3: Locale 词条 + `config/locale.ts` 接线

**Files:**
- Create: `packages/ui/src/question-editor/question-editor.locale.ts`
- Create: `packages/ui/src/question-editor/question-editor.locale.test.ts`
- Modify: `packages/ui/src/config/locale.ts`（import、`ComponentLocale`、`zhCN`、`enUS` 四处）

**Interfaces:**
- Consumes：`QuestionType` / `QuestionValidationCode`（`../question/question.types`）。
- Produces：`type SubjectiveType`、`interface QuestionEditorLocale`、`QUESTION_EDITOR_LOCALE_ZH`、`QUESTION_EDITOR_LOCALE_EN`；`ComponentLocale.questionEditor?: QuestionEditorLocale`。

- [ ] **Step 1: 写词条测试**

```ts
// packages/ui/src/question-editor/question-editor.locale.test.ts
import { describe, expect, it } from "vitest";
import { enUS, zhCN } from "../config/locale";
import { QUESTION_EDITOR_LOCALE_EN, QUESTION_EDITOR_LOCALE_ZH } from "./question-editor.locale";

const CJK = /[㐀-䶿一-鿿]/u;

/** 把词条表压成字符串数组：函数按代表性参数调一次。 */
function flatten(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const f = value as (...args: unknown[]) => unknown;
    return flatten(f("A", 2, { key: "A", expected: 2, actual: 1 }));
  }
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(flatten);
  return [];
}

function keysOf(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || typeof value === "function") return [prefix];
  return Object.entries(value).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("QuestionEditor 词条", () => {
  it("中英键集合一致", () => {
    expect(keysOf(QUESTION_EDITOR_LOCALE_EN).sort()).toEqual(keysOf(QUESTION_EDITOR_LOCALE_ZH).sort());
  });

  it("英文词条里没有中文", () => {
    for (const s of flatten(QUESTION_EDITOR_LOCALE_EN)) expect(s, s).not.toMatch(CJK);
  });

  it("插值函数把参数放进句子", () => {
    expect(QUESTION_EDITOR_LOCALE_ZH.blankMismatch(3, 1)).toContain("3");
    expect(QUESTION_EDITOR_LOCALE_ZH.blankMismatch(3, 1)).toContain("1");
    expect(QUESTION_EDITOR_LOCALE_EN.validation.option_empty({ key: "B" })).toContain("B");
    expect(QUESTION_EDITOR_LOCALE_EN.validation.blank_count_mismatch({ expected: 2, actual: 3 })).toContain("2");
  });

  it("config/locale 的 zhCN / enUS 都接上了", () => {
    expect(zhCN.components.questionEditor).toBe(QUESTION_EDITOR_LOCALE_ZH);
    expect(enUS.components.questionEditor).toBe(QUESTION_EDITOR_LOCALE_EN);
  });
});
```

`zhCN.components` 的形状以 `packages/ui/src/config/locale.ts` 里 `question: QUESTION_LOCALE_ZH` 所在的对象为准（先 `grep -n "question: QUESTION_LOCALE_ZH" -B3 packages/ui/src/config/locale.ts` 看它挂在哪一层；`math-textarea.locale.test.ts` 里有同样的断言可照抄路径）。

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-editor/question-editor.locale.test.ts
```
期望：FAIL（模块不存在）。

- [ ] **Step 3: 写词条文件**

```ts
// packages/ui/src/question-editor/question-editor.locale.ts
// QuestionEditor 词条。单独成文件的理由与 question/question.locale.ts 相同：@hulianui/ui/math 入口
// 不能拖进 config/locale.ts 那份全库字典。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反向引用本文件。
// 题型名与判断题两个值不在这里：它们在 question.locale.ts（QuestionCard 也用）。
import type { QuestionType, QuestionValidationCode } from "../question/question.types";

export type SubjectiveType = Extract<QuestionType, "short_answer" | "calculation" | "essay">;

type Detail = Record<string, number | string> | undefined;

export interface QuestionEditorLocale {
  type: string;
  typeHint: string;
  stem: string;
  stemPlaceholder: string;
  stemHint: string;
  insertFigure: string;
  figureAlt: (index: number) => string;
  removeFigure: (index: number) => string;
  /** 题干有图但没给 resolveFigure 时缩略图位置的 title。 */
  figureMissingResolver: string;
  uploading: (name: string) => string;
  uploadFailed: (name: string, message: string) => string;
  dismissUpload: string;
  options: string;
  optionsHint: (min: number, max: number) => string;
  optionLabel: (key: string) => string;
  optionPlaceholder: (key: string) => string;
  addOption: string;
  removeOption: (key: string) => string;
  moveOptionUp: (key: string) => string;
  moveOptionDown: (key: string) => string;
  answer: string;
  singleAnswerHint: string;
  multipleAnswerHint: string;
  blankAnswers: string;
  blankAnswersHint: string;
  blankLabel: (index: number) => string;
  blankPlaceholder: (index: number) => string;
  alternativeLabel: (blank: number, index: number) => string;
  addAlternative: string;
  addAlternativeFor: (blank: number) => string;
  removeAlternative: (blank: number, index: number) => string;
  addBlank: string;
  removeBlank: (index: number) => string;
  blankMismatch: (expected: number, actual: number) => string;
  alignBlanks: (expected: number) => string;
  reference: string;
  /** 三种主观题的参考答案说明与占位。键必须齐：后端加题型这里 tsc 当场红。 */
  referenceCopy: Record<SubjectiveType, { hint: string; placeholder: string }>;
  rubric: string;
  rubricHint: string;
  rubricPoint: (index: number) => string;
  rubricPointPlaceholder: string;
  rubricScore: (index: number) => string;
  addRubricPoint: string;
  removeRubricPoint: (index: number) => string;
  rubricTotal: (total: number, score: number) => string;
  analysis: string;
  analysisPlaceholder: string;
  difficulty: string;
  difficultyHint: string;
  score: string;
  estimatedMinutes: string;
  preview: string;
  previewEmpty: string;
  issues: string;
  resolveIssue: string;
  switchTypeTitle: string;
  switchTypeDescription: string;
  switchTypeConfirm: string;
  cancel: string;
  /** `validateQuestion` 机器码 → 文案。键必须齐。 */
  validation: Record<QuestionValidationCode, (detail?: Detail) => string>;
}

export const QUESTION_EDITOR_LOCALE_ZH: QuestionEditorLocale = {
  type: "题型",
  typeHint: "切换题型会清空选项与答案",
  stem: "题干",
  stemPlaceholder: "题干，公式用 $…$ 包起来",
  stemHint: "填空题在题干里用 ____ 标出空",
  insertFigure: "插入图片",
  figureAlt: (index) => `题图 ${index}`,
  removeFigure: (index) => `删除题图 ${index}`,
  figureMissingResolver: "未提供 resolveFigure，只能显示 key",
  uploading: (name) => `正在上传 ${name}`,
  uploadFailed: (name, message) => `${name} 上传失败：${message}`,
  dismissUpload: "关闭上传提示",
  options: "选项",
  optionsHint: (min, max) => `${min}–${max} 项，字母按顺序自动编号`,
  optionLabel: (key) => `选项 ${key}`,
  optionPlaceholder: (key) => `选项 ${key} 内容`,
  addOption: "添加选项",
  removeOption: (key) => `删除选项 ${key}`,
  moveOptionUp: (key) => `上移选项 ${key}`,
  moveOptionDown: (key) => `下移选项 ${key}`,
  answer: "正确答案",
  singleAnswerHint: "选一项",
  multipleAnswerHint: "至少选两项",
  blankAnswers: "填空答案",
  blankAnswersHint: "每空一行，按题干里空的顺序；一空可加多种等价写法",
  blankLabel: (index) => `第 ${index} 空`,
  blankPlaceholder: (index) => `第 ${index} 空答案`,
  alternativeLabel: (blank, index) => `第 ${blank} 空写法 ${index}`,
  addAlternative: "加一种等价写法",
  addAlternativeFor: (blank) => `第 ${blank} 空加一种等价写法`,
  removeAlternative: (blank, index) => `删除第 ${blank} 空写法 ${index}`,
  addBlank: "添加一空",
  removeBlank: (index) => `删除第 ${index} 空`,
  blankMismatch: (expected, actual) => `题干有 ${expected} 个空，答案有 ${actual} 项`,
  alignBlanks: (expected) => `按题干对齐为 ${expected} 空`,
  reference: "参考答案",
  referenceCopy: {
    short_answer: { hint: "可留空，批阅时由教师评判", placeholder: "简短的参考答案或要点" },
    calculation: { hint: "可留空；写清关键步骤", placeholder: "计算过程与最终结果" },
    essay: { hint: "可留空，批阅时由教师评判", placeholder: "完整解答" },
  },
  rubric: "分步给分",
  rubricHint: "按得分点逐条给分，合计应等于分值",
  rubricPoint: (index) => `得分点 ${index}`,
  rubricPointPlaceholder: "得分点",
  rubricScore: (index) => `得分点 ${index} 分值`,
  addRubricPoint: "添加得分点",
  removeRubricPoint: (index) => `删除得分点 ${index}`,
  rubricTotal: (total, score) => `得分点合计 ${total} 分，题目分值 ${score} 分`,
  analysis: "解析",
  analysisPlaceholder: "解题思路与易错点",
  difficulty: "难度",
  difficultyHint: "1 星最易，5 星最难",
  score: "分值",
  estimatedMinutes: "预估用时（分钟）",
  preview: "预览（与题目展示用同一张卡片）",
  previewEmpty: "输入题干后显示预览",
  issues: "待复核",
  resolveIssue: "已处理",
  switchTypeTitle: "切换题型？",
  switchTypeDescription: "当前的选项与答案会被清空。",
  switchTypeConfirm: "清空并切换",
  cancel: "取消",
  validation: {
    stem_empty: () => "题干不能为空",
    options_too_few: () => "至少需要 2 个选项",
    options_too_many: () => "最多 8 个选项",
    option_empty: (d) => `选项 ${d?.key ?? ""} 不能为空`,
    options_forbidden: () => "该题型不应有选项",
    answer_out_of_range: () => "答案必须在选项范围内",
    multiple_answer_too_few: () => "多选题答案至少两项",
    judge_not_boolean: () => "答案必须是「正确」或「错误」",
    blank_empty: () => "每个空都要有答案",
    blank_count_mismatch: (d) => `题干有 ${d?.expected ?? "?"} 个空，答案有 ${d?.actual ?? "?"} 项`,
    subjective_answer_shape: () => "参考答案应是文本或分步给分",
    difficulty_range: () => "难度需在 1–5 之间",
    score_negative: () => "分值不能为负数",
  },
};

export const QUESTION_EDITOR_LOCALE_EN: QuestionEditorLocale = {
  type: "Type",
  typeHint: "Switching the type clears options and answer",
  stem: "Stem",
  stemPlaceholder: "Stem; wrap formulas in $…$",
  stemHint: "For fill-in-the-blank, mark each blank with ____ in the stem",
  insertFigure: "Insert image",
  figureAlt: (index) => `Figure ${index}`,
  removeFigure: (index) => `Remove figure ${index}`,
  figureMissingResolver: "No resolveFigure provided; only the key can be shown",
  uploading: (name) => `Uploading ${name}`,
  uploadFailed: (name, message) => `${name} failed to upload: ${message}`,
  dismissUpload: "Dismiss upload notice",
  options: "Options",
  optionsHint: (min, max) => `${min} to ${max} options, lettered in order`,
  optionLabel: (key) => `Option ${key}`,
  optionPlaceholder: (key) => `Option ${key} text`,
  addOption: "Add option",
  removeOption: (key) => `Remove option ${key}`,
  moveOptionUp: (key) => `Move option ${key} up`,
  moveOptionDown: (key) => `Move option ${key} down`,
  answer: "Correct answer",
  singleAnswerHint: "Pick one",
  multipleAnswerHint: "Pick at least two",
  blankAnswers: "Blank answers",
  blankAnswersHint: "One row per blank, in stem order; a blank may accept several equivalent forms",
  blankLabel: (index) => `Blank ${index}`,
  blankPlaceholder: (index) => `Answer for blank ${index}`,
  alternativeLabel: (blank, index) => `Blank ${blank} form ${index}`,
  addAlternative: "Add equivalent form",
  addAlternativeFor: (blank) => `Add equivalent form for blank ${blank}`,
  removeAlternative: (blank, index) => `Remove blank ${blank} form ${index}`,
  addBlank: "Add blank",
  removeBlank: (index) => `Remove blank ${index}`,
  blankMismatch: (expected, actual) => `The stem has ${expected} blanks; the answer has ${actual} entries`,
  alignBlanks: (expected) => `Align to ${expected} blanks`,
  reference: "Reference answer",
  referenceCopy: {
    short_answer: { hint: "Optional; graded by the teacher", placeholder: "Brief reference answer or key points" },
    calculation: { hint: "Optional; show the key steps", placeholder: "Working and final result" },
    essay: { hint: "Optional; graded by the teacher", placeholder: "Full worked solution" },
  },
  rubric: "Rubric",
  rubricHint: "Score point by point; the total should equal the question score",
  rubricPoint: (index) => `Rubric point ${index}`,
  rubricPointPlaceholder: "Rubric point",
  rubricScore: (index) => `Score for rubric point ${index}`,
  addRubricPoint: "Add rubric point",
  removeRubricPoint: (index) => `Remove rubric point ${index}`,
  rubricTotal: (total, score) => `Rubric total ${total}, question score ${score}`,
  analysis: "Explanation",
  analysisPlaceholder: "Approach and common mistakes",
  difficulty: "Difficulty",
  difficultyHint: "1 star easiest, 5 stars hardest",
  score: "Score",
  estimatedMinutes: "Estimated time (minutes)",
  preview: "Preview (the same card used for display)",
  previewEmpty: "Preview appears once the stem has text",
  issues: "Needs review",
  resolveIssue: "Resolved",
  switchTypeTitle: "Switch question type?",
  switchTypeDescription: "The current options and answer will be cleared.",
  switchTypeConfirm: "Clear and switch",
  cancel: "Cancel",
  validation: {
    stem_empty: () => "Stem is required",
    options_too_few: () => "At least 2 options are required",
    options_too_many: () => "At most 8 options",
    option_empty: (d) => `Option ${d?.key ?? ""} is empty`,
    options_forbidden: () => "This type does not take options",
    answer_out_of_range: () => "Answer must be one of the options",
    multiple_answer_too_few: () => "Multiple choice needs at least two answers",
    judge_not_boolean: () => "Answer must be True or False",
    blank_empty: () => "Every blank needs an answer",
    blank_count_mismatch: (d) =>
      `The stem has ${d?.expected ?? "?"} blanks; the answer has ${d?.actual ?? "?"} entries`,
    subjective_answer_shape: () => "Reference answer must be text or a rubric",
    difficulty_range: () => "Difficulty must be between 1 and 5",
    score_negative: () => "Score cannot be negative",
  },
};
```

- [ ] **Step 4: 接进 `config/locale.ts`**

在 `packages/ui/src/config/locale.ts` 顶部 `} from "../math-textarea/math-textarea.locale";` 那一行之后加：

```ts
import {
  QUESTION_EDITOR_LOCALE_EN,
  QUESTION_EDITOR_LOCALE_ZH,
  type QuestionEditorLocale,
} from "../question-editor/question-editor.locale";
```

`ComponentLocale` 里 `mathTextarea?: MathTextareaLocale;` 之后加：

```ts
  /** 出题编辑器词条，SSOT 在 question-editor/question-editor.locale.ts（同 question 的理由）。 */
  questionEditor?: QuestionEditorLocale;
```

`zhCN` 里 `mathTextarea: MATH_TEXTAREA_LOCALE_ZH,` 之后加 `questionEditor: QUESTION_EDITOR_LOCALE_ZH,`；`enUS` 里 `mathTextarea: MATH_TEXTAREA_LOCALE_EN,` 之后加 `questionEditor: QUESTION_EDITOR_LOCALE_EN,`。

- [ ] **Step 5: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/question-editor && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS，typecheck 0 错误（Task 2 的 `question-editor.types.ts` 现在能解析到 `QuestionEditorLocale`）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-editor/question-editor.locale.ts packages/ui/src/question-editor/question-editor.locale.test.ts packages/ui/src/config/locale.ts
git commit -m "feat(ui/math): QuestionEditor 中英词条（含 validateQuestion 机器码文案表），config/locale 反向引用"
```

---

### Task 4: 四个分节子件（题图条 / 选项 / 填空 / 主观题）

**Files:**
- Create: `packages/ui/src/question-editor/question-editor-figures.tsx`
- Create: `packages/ui/src/question-editor/question-editor-options.tsx`
- Create: `packages/ui/src/question-editor/question-editor-blanks.tsx`
- Create: `packages/ui/src/question-editor/question-editor-subjective.tsx`
- Create: `packages/ui/src/question-editor/question-editor-sections.test.tsx`

**Interfaces:**
- Consumes：Task 2 的纯函数与 `SectionContext`；Task 3 的 `QuestionEditorLocale`；`MathTextarea`（`../math-textarea/math-textarea`）；库内 `Button` / `Checkbox` / `CheckboxGroup` / `Chip` / `Field` / `Segmented` / `Switch` / `NumberField` / `Alert` / `Image` / `Text`；图标 `ChevronUp` / `ChevronDown` / `Plus` / `X` / `Image as ImageIcon`（`../_icons`）；`warnOnce`。
- Produces：
  - `FiguresStrip({ keys, disabled, resolveFigure?, onUploadFigure?, onAdd, onRemove, L })`
  - `OptionsSection(ctx: SectionContext)`、`BlanksSection(ctx: SectionContext)`、`SubjectiveSection(ctx: SectionContext)`

- [ ] **Step 1: 写子件测试**

```tsx
// packages/ui/src/question-editor/question-editor-sections.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import { BlanksSection } from "./question-editor-blanks";
import { FiguresStrip } from "./question-editor-figures";
import { OptionsSection } from "./question-editor-options";
import { SubjectiveSection } from "./question-editor-subjective";
import { QUESTION_EDITOR_LOCALE_ZH as L } from "./question-editor.locale";
import type { SectionContext } from "./question-editor.types";

type Section = (ctx: SectionContext) => React.ReactNode;

function Harness({
  initial,
  section: Section,
  onValue,
  errors = {},
}: {
  initial: Question;
  section: Section;
  onValue?: (q: Question) => void;
  errors?: SectionContext["errors"];
}) {
  const [value, setValue] = useState(initial);
  return (
    <Section
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
      disabled={false}
      L={L}
      textarea={{}}
      errors={errors}
    />
  );
}

const single = (): Question => ({
  ...emptyQuestion("single"),
  stem: "题干",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
    { key: "C", text: "丙" },
  ],
  answer: "C",
});

describe("OptionsSection", () => {
  it("每个选项一个输入框，无障碍名带字母；删除后答案跟着重排", () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} section={OptionsSection} onValue={onValue} />);
    expect(screen.getByLabelText("选项 A")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "删除选项 A" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({
        options: [
          { key: "A", text: "乙" },
          { key: "B", text: "丙" },
        ],
        answer: "B",
      }),
    );
  });

  it("上移 / 下移按钮在首尾禁用；上移后答案跟着内容走", () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} section={OptionsSection} onValue={onValue} />);
    expect((screen.getByRole("button", { name: "上移选项 A" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "下移选项 C" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "上移选项 C" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: "B" }));
  });

  it("添加选项到 8 个为止", () => {
    render(<Harness initial={single()} section={OptionsSection} />);
    const add = screen.getByRole("button", { name: "添加选项" });
    for (let i = 0; i < 6; i++) fireEvent.click(add);
    expect(screen.getAllByLabelText(/^选项 [A-H]$/)).toHaveLength(8);
    expect((add as HTMLButtonElement).disabled).toBe(true);
  });

  it("单选答案是 Segmented，标签带选项文本前 20 字", () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} section={OptionsSection} onValue={onValue} />);
    const a = screen.getByRole("radio", { name: "A 甲" });
    fireEvent.click(a);
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: "A" }));
  });

  it("多选答案是 CheckboxGroup，勾选结果按字母排序", () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial={{ ...single(), type: "multiple", answer: ["C"] }}
        section={OptionsSection}
        onValue={onValue}
      />,
    );
    fireEvent.click(screen.getByRole("checkbox", { name: "A 甲" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: ["A", "C"] }));
  });

  it("errors.options / errors.answer 挂到对应 Field", () => {
    render(
      <Harness
        initial={single()}
        section={OptionsSection}
        errors={{ options: "选项 A 不能为空", answer: "答案必须在选项范围内" }}
      />,
    );
    expect(screen.getByText("选项 A 不能为空")).toBeTruthy();
    expect(screen.getByText("答案必须在选项范围内")).toBeTruthy();
  });
});

describe("BlanksSection", () => {
  const blank = (): Question => ({ ...emptyQuestion("blank"), stem: "a=____，b=____", answer: ["1", "2"] });

  it("每空一行；加等价写法后多一行输入框", () => {
    const onValue = vi.fn();
    render(<Harness initial={blank()} section={BlanksSection} onValue={onValue} />);
    expect(screen.getByLabelText("第 1 空")).toBeTruthy();
    expect(screen.getByLabelText("第 2 空")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "第 1 空加一种等价写法" }));
    expect(screen.getByLabelText("第 1 空写法 2")).toBeTruthy();
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: [["1", ""], "2"] }));
  });

  it("空数与题干不一致时出提示，一键对齐", () => {
    const onValue = vi.fn();
    render(
      <Harness initial={{ ...blank(), answer: ["1"] }} section={BlanksSection} onValue={onValue} />,
    );
    expect(screen.getByText("题干有 2 个空，答案有 1 项")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "按题干对齐为 2 空" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: ["1", ""] }));
    expect(screen.queryByText("题干有 2 个空，答案有 1 项")).toBeNull();
  });

  it("只剩一空时删除按钮禁用", () => {
    render(<Harness initial={{ ...blank(), stem: "a=____", answer: ["1"] }} section={BlanksSection} />);
    expect((screen.getByRole("button", { name: "删除第 1 空" }) as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("SubjectiveSection", () => {
  it("简答题：参考答案框，没有分步给分开关", () => {
    render(<Harness initial={emptyQuestion("short_answer")} section={SubjectiveSection} />);
    expect(screen.getByLabelText("参考答案")).toBeTruthy();
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("计算题：打开分步给分得到 Rubric，合计与分值并排显示；关掉回到文本", () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial={{ ...emptyQuestion("calculation"), answer: "参考" }}
        section={SubjectiveSection}
        onValue={onValue}
      />,
    );
    fireEvent.click(screen.getByRole("switch", { name: "分步给分" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ answer: { reference: "参考", rubric: [{ point: "" }] } }),
    );
    expect(screen.getByLabelText("得分点 1")).toBeTruthy();
    expect(screen.getByText("得分点合计 0 分，题目分值 8 分")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "添加得分点" }));
    expect(screen.getByLabelText("得分点 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("switch", { name: "分步给分" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: "参考" }));
  });
});

describe("FiguresStrip", () => {
  it("没有图也没有上传回调时什么都不渲染", () => {
    const { container } = render(
      <FiguresStrip keys={[]} disabled={false} onAdd={() => {}} onRemove={() => {}} L={L} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("resolveFigure 给了渲染缩略图，删除回调传 key", () => {
    const onRemove = vi.fn();
    const { container } = render(
      <FiguresStrip
        keys={["import/a.png"]}
        disabled={false}
        resolveFigure={(key) => `/files/${key}`}
        onAdd={() => {}}
        onRemove={onRemove}
        L={L}
      />,
    );
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/files/import/a.png");
    fireEvent.click(screen.getByRole("button", { name: "删除题图 1" }));
    expect(onRemove).toHaveBeenCalledWith("import/a.png");
  });

  it("没给 resolveFigure：显示 key 文本占位并只告警一次", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <FiguresStrip keys={["import/a.png", "import/b.png"]} disabled={false} onAdd={() => {}} onRemove={() => {}} L={L} />,
    );
    expect(screen.getByText("import/a.png")).toBeTruthy();
    expect(warn.mock.calls.filter((c) => String(c[0]).includes("resolveFigure")).length).toBeLessThanOrEqual(1);
    warn.mockRestore();
  });

  it("选文件 → onUploadFigure → 成功后 onAdd(key)，失败行可关闭", async () => {
    const onAdd = vi.fn();
    const upload = vi
      .fn<(file: File) => Promise<string>>()
      .mockResolvedValueOnce("import/new.png")
      .mockRejectedValueOnce(new Error("太大了"));
    const { container } = render(
      <FiguresStrip keys={[]} disabled={false} onUploadFigure={upload} onAdd={onAdd} onRemove={() => {}} L={L} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "ok.png", { type: "image/png" })] } });
    await waitFor(() => expect(onAdd).toHaveBeenCalledWith("import/new.png"));
    fireEvent.change(input, { target: { files: [new File(["x"], "bad.png", { type: "image/png" })] } });
    await screen.findByText("bad.png 上传失败：太大了");
    fireEvent.click(screen.getByRole("button", { name: "关闭上传提示" }));
    expect(screen.queryByText("bad.png 上传失败：太大了")).toBeNull();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-editor/question-editor-sections.test.tsx
```
期望：FAIL（模块不存在）。

- [ ] **Step 3: 写题图条**

```tsx
// packages/ui/src/question-editor/question-editor-figures.tsx
"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Image as ImageIcon, X } from "../_icons";
import { Button } from "../button";
import { Image } from "../image";
import { warnOnce } from "../lib/warn-once";
import { Text } from "../text";
import type { QuestionEditorLocale } from "./question-editor.locale";

interface PendingUpload {
  id: number;
  name: string;
  status: "uploading" | "error";
  message?: string;
}

export interface FiguresStripProps {
  /** 题干里已引用的图 key（题干是唯一真相；正在传 / 传失败的行只活在本地）。 */
  keys: string[];
  disabled: boolean;
  resolveFigure?: (key: string) => string;
  onUploadFigure?: (file: File) => Promise<string>;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  L: QuestionEditorLocale;
}

/**
 * 题图缩略图条 + 「插入图片」。几何图 / 函数图像 / 统计图这类题，图就是题目内容的一部分，
 * 写成文字说明等于把题目改了。图不是 Question 上的新字段，是题干里的 `![](key)` 引用：
 * 组卷预览、学生端、导出搬运的都只是 stem 这一个字段，图挂在别处它们一张也拿不到。
 */
export function FiguresStrip({ keys, disabled, resolveFigure, onUploadFigure, onAdd, onRemove, L }: FiguresStripProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const seq = useRef(0);
  const fileInput = useRef<HTMLInputElement | null>(null);
  // 上传是异步的：回调跑起来时闭包里的 onAdd 早就是旧的了。写回必须读最新那一份，
  // 否则「传图这几秒里又敲进去的题干」会被这次写回整段抹掉，而且一声不响（消费方踩过）。
  const latestAdd = useRef(onAdd);
  useEffect(() => {
    latestAdd.current = onAdd;
  });

  if (keys.length > 0 && resolveFigure === undefined) {
    warnOnce(
      "question-editor:resolve-figure",
      "[瑚琏] QuestionEditor：题干含图但未提供 resolveFigure，缩略图条只能显示 key。",
    );
  }

  const upload = async (file: File) => {
    if (!onUploadFigure) return;
    seq.current += 1;
    const id = seq.current;
    setPending((rows) => [...rows, { id, name: file.name, status: "uploading" }]);
    try {
      const key = await onUploadFigure(file);
      setPending((rows) => rows.filter((row) => row.id !== id));
      latestAdd.current(key);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPending((rows) => rows.map((row) => (row.id === id ? { ...row, status: "error", message } : row)));
    }
  };

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) void upload(file);
  };

  if (keys.length === 0 && pending.length === 0 && !onUploadFigure) return null;

  const tile = "flex size-20 flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed border-border px-1 text-center";

  return (
    <div data-slot="question-editor-figures" className="space-y-2">
      {(keys.length > 0 || pending.length > 0) && (
        <ul className="flex flex-wrap gap-3">
          {keys.map((key, index) => (
            <li key={key} className="relative">
              {resolveFigure ? (
                <Image
                  src={resolveFigure(key)}
                  alt={L.figureAlt(index + 1)}
                  radius="sm"
                  className="size-20 border border-border bg-white"
                  imgClassName="size-full object-contain"
                />
              ) : (
                <div className={tile} title={L.figureMissingResolver}>
                  <Text size="xs" className="break-all font-mono">
                    {key}
                  </Text>
                </div>
              )}
              {!disabled && (
                <Button
                  size="sm"
                  variant="solid"
                  tone="neutral"
                  aria-label={L.removeFigure(index + 1)}
                  className="absolute -end-2 -top-2 size-6 rounded-full p-0"
                  onClick={() => onRemove(key)}
                >
                  <X className="size-3" aria-hidden />
                </Button>
              )}
            </li>
          ))}
          {pending.map((row) => (
            <li key={row.id} className={tile}>
              <Text size="xs" tone={row.status === "error" ? "danger" : "muted"} className="line-clamp-3 break-all">
                {row.status === "error" ? L.uploadFailed(row.name, row.message ?? "") : L.uploading(row.name)}
              </Text>
              {row.status === "error" && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={L.dismissUpload}
                  onClick={() => setPending((rows) => rows.filter((r) => r.id !== row.id))}
                >
                  <X className="size-3" aria-hidden />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {onUploadFigure && (
        <div>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={pick} />
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => fileInput.current?.click()}>
            <ImageIcon className="size-4" aria-hidden />
            {L.insertFigure}
          </Button>
        </div>
      )}
    </div>
  );
}
```

若 `Button` 的 `variant` 联合里没有 `"solid"`（看 `packages/ui/src/button/button.tsx` 的 `variant: {` 表；已确认有 `solid` / `outline` / `ghost` / `soft` / `link`），照表改。

- [ ] **Step 4: 写选项分节**

```tsx
// packages/ui/src/question-editor/question-editor-options.tsx
"use client";
import { ChevronDown, ChevronUp, Plus, X } from "../_icons";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { CheckboxGroup } from "../checkbox-group";
import { Chip } from "../chip";
import { Field } from "../field";
import { MathTextarea } from "../math-textarea/math-textarea";
import { MAX_OPTIONS } from "../question/question-shape";
import { Segmented } from "../segmented";
import {
  addOption,
  moveOption,
  optionCaption,
  removeOption,
  setOptionText,
} from "./question-editor.state";
import type { SectionContext } from "./question-editor.types";

/** 单选 / 多选：选项行（增删上下移，字母按下标自动编号）+ 正确答案。 */
export function OptionsSection({ value, onChange, disabled, L, textarea, errors }: SectionContext) {
  const options = value.options ?? [];
  const last = options.length - 1;

  return (
    <>
      <Field label={L.options} description={L.optionsHint(2, MAX_OPTIONS)} error={errors.options}>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.key} className="flex items-start gap-2">
              <Chip size="sm" tone="neutral" className="mt-1.5 shrink-0">
                {option.key}
              </Chip>
              <MathTextarea
                compact
                className="min-w-0 flex-1"
                aria-label={L.optionLabel(option.key)}
                placeholder={L.optionPlaceholder(option.key)}
                value={option.text}
                onChange={(text) => onChange(setOptionText(value, index, text), "options")}
                disabled={disabled}
                {...textarea}
              />
              <div className="flex shrink-0 items-center gap-0.5">
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={L.moveOptionUp(option.key)}
                  disabled={disabled || index === 0}
                  onClick={() => onChange(moveOption(value, index, index - 1), "options")}
                >
                  <ChevronUp className="size-4" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={L.moveOptionDown(option.key)}
                  disabled={disabled || index === last}
                  onClick={() => onChange(moveOption(value, index, index + 1), "options")}
                >
                  <ChevronDown className="size-4" aria-hidden />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  tone="danger"
                  aria-label={L.removeOption(option.key)}
                  disabled={disabled || options.length <= 2}
                  onClick={() => onChange(removeOption(value, index), "options")}
                >
                  <X className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          ))}
          <div>
            <Button
              size="sm"
              variant="outline"
              disabled={disabled || options.length >= MAX_OPTIONS}
              onClick={() => onChange(addOption(value), "options")}
            >
              <Plus className="size-4" aria-hidden />
              {L.addOption}
            </Button>
          </div>
        </div>
      </Field>

      <Field
        label={L.answer}
        description={value.type === "single" ? L.singleAnswerHint : L.multipleAnswerHint}
        error={errors.answer}
      >
        {value.type === "single" ? (
          // 单选用 Segmented 而不是 RadioGroup：消费方实测 Radio 的 label 关联对读屏无效（docs/hulian-gaps/task-16.md）。
          <Segmented
            tone="brand"
            aria-label={L.answer}
            disabled={disabled}
            items={options.map((o) => ({ value: o.key, label: optionCaption(o.key, o.text) }))}
            value={typeof value.answer === "string" ? value.answer : ""}
            onValueChange={(key) => onChange({ ...value, answer: key }, "answer")}
          />
        ) : (
          <CheckboxGroup
            aria-label={L.answer}
            disabled={disabled}
            value={Array.isArray(value.answer) ? (value.answer as string[]) : []}
            onValueChange={(keys) => onChange({ ...value, answer: [...keys].sort() }, "answer")}
          >
            {options.map((o) => (
              <Checkbox key={o.key} value={o.key} label={optionCaption(o.key, o.text)} />
            ))}
          </CheckboxGroup>
        )}
      </Field>
    </>
  );
}
```

- [ ] **Step 5: 写填空分节**

```tsx
// packages/ui/src/question-editor/question-editor-blanks.tsx
"use client";
import { Plus, X } from "../_icons";
import { Alert } from "../alert";
import { Button } from "../button";
import { Chip } from "../chip";
import { Field } from "../field";
import { MathTextarea } from "../math-textarea/math-textarea";
import {
  addBlank,
  addBlankWriting,
  alignBlanks,
  blankCells,
  blankMismatch,
  blankWritings,
  removeBlank,
  removeBlankWriting,
  setBlankWriting,
} from "./question-editor.state";
import type { SectionContext } from "./question-editor.types";

/** 填空：每空一行（可多种等价写法）；空数与题干 `____` 数目不一致时提示并一键对齐，不静默截断。 */
export function BlanksSection({ value, onChange, disabled, L, textarea, errors }: SectionContext) {
  const cells = blankCells(value.answer);
  const mismatch = blankMismatch(value);

  return (
    <Field label={L.blankAnswers} description={L.blankAnswersHint} error={errors.answer}>
      <div className="space-y-3">
        {mismatch !== null && (
          <Alert
            tone="warning"
            action={
              <Button
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => onChange(alignBlanks(value, mismatch.expected), "answer")}
              >
                {L.alignBlanks(mismatch.expected)}
              </Button>
            }
          >
            {L.blankMismatch(mismatch.expected, mismatch.actual)}
          </Alert>
        )}
        {cells.map((cell, blank) => {
          const writings = blankWritings(cell);
          return (
            <div key={blank} className="space-y-1.5">
              {writings.map((text, writing) => {
                const label =
                  writing === 0 ? L.blankLabel(blank + 1) : L.alternativeLabel(blank + 1, writing + 1);
                return (
                  <div key={writing} className="flex items-start gap-2">
                    <Chip size="sm" tone="neutral" className="mt-1.5 min-w-16 shrink-0 justify-center">
                      {label}
                    </Chip>
                    <MathTextarea
                      compact
                      className="min-w-0 flex-1"
                      aria-label={label}
                      placeholder={L.blankPlaceholder(blank + 1)}
                      value={text}
                      onChange={(next) => onChange(setBlankWriting(value, blank, writing, next), "answer")}
                      disabled={disabled}
                      {...textarea}
                    />
                    {writing === 0 ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        tone="danger"
                        aria-label={L.removeBlank(blank + 1)}
                        disabled={disabled || cells.length <= 1}
                        onClick={() => onChange(removeBlank(value, blank), "answer")}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        tone="danger"
                        aria-label={L.removeAlternative(blank + 1, writing + 1)}
                        disabled={disabled}
                        onClick={() => onChange(removeBlankWriting(value, blank, writing), "answer")}
                      >
                        <X className="size-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                );
              })}
              <div className="ps-[4.5rem]">
                <Button
                  size="sm"
                  variant="link"
                  disabled={disabled}
                  aria-label={L.addAlternativeFor(blank + 1)}
                  onClick={() => onChange(addBlankWriting(value, blank), "answer")}
                >
                  <Plus className="size-4" aria-hidden />
                  {L.addAlternative}
                </Button>
              </div>
            </div>
          );
        })}
        <div>
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange(addBlank(value), "answer")}>
            <Plus className="size-4" aria-hidden />
            {L.addBlank}
          </Button>
        </div>
      </div>
    </Field>
  );
}
```

- [ ] **Step 6: 写主观题分节**

```tsx
// packages/ui/src/question-editor/question-editor-subjective.tsx
"use client";
import { Plus, X } from "../_icons";
import { Button } from "../button";
import { Field } from "../field";
import { MathTextarea } from "../math-textarea/math-textarea";
import { NumberField } from "../number-field";
import { Switch } from "../switch";
import { Text } from "../text";
import type { SubjectiveType } from "./question-editor.locale";
import {
  addRubricPoint,
  disableRubric,
  enableRubric,
  isRubric,
  referenceText,
  removeRubricPoint,
  rubricTotal,
  setReference,
  setRubricPoint,
} from "./question-editor.state";
import type { SectionContext } from "./question-editor.types";

/** 简答 / 计算 / 解答：参考答案（可空）；计算与解答可切「分步给分」编辑得分点，合计与题目分值并排。 */
export function SubjectiveSection({ value, onChange, disabled, L, textarea, errors }: SectionContext) {
  // 调用方只在三种主观题时渲染本件；Record 索引让「后端加题型」在这里 tsc 当场红。
  const type = value.type as SubjectiveType;
  const copy = L.referenceCopy[type];
  const rubric = isRubric(value.answer) ? value.answer : null;
  const canRubric = type === "calculation" || type === "essay";
  const total = rubricTotal(value.answer);

  return (
    <>
      <Field label={L.reference} description={copy.hint} error={errors.answer}>
        <MathTextarea
          multiline
          rows={3}
          aria-label={L.reference}
          placeholder={copy.placeholder}
          value={referenceText(value.answer)}
          onChange={(text) => onChange(setReference(value, text), "answer")}
          disabled={disabled}
          {...textarea}
        />
      </Field>

      {canRubric && (
        <Field label={L.rubric} description={L.rubricHint}>
          <div className="space-y-2">
            <Switch
              aria-label={L.rubric}
              checked={rubric !== null}
              disabled={disabled}
              onCheckedChange={(on) => onChange(on ? enableRubric(value) : disableRubric(value), "answer")}
            />
            {rubric !== null && (
              <div className="space-y-2">
                {rubric.rubric.map((row, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <MathTextarea
                      compact
                      className="min-w-0 flex-1"
                      aria-label={L.rubricPoint(index + 1)}
                      placeholder={L.rubricPointPlaceholder}
                      value={row.point}
                      onChange={(point) => onChange(setRubricPoint(value, index, { point }), "answer")}
                      disabled={disabled}
                      {...textarea}
                    />
                    <NumberField
                      aria-label={L.rubricScore(index + 1)}
                      className="w-24 shrink-0"
                      min={0}
                      value={row.score ?? null}
                      onValueChange={(score) =>
                        onChange(setRubricPoint(value, index, { score: score ?? undefined }), "answer")
                      }
                      disabled={disabled}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      tone="danger"
                      aria-label={L.removeRubricPoint(index + 1)}
                      disabled={disabled || rubric.rubric.length <= 1}
                      onClick={() => onChange(removeRubricPoint(value, index), "answer")}
                    >
                      <X className="size-4" aria-hidden />
                    </Button>
                  </div>
                ))}
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="outline" disabled={disabled} onClick={() => onChange(addRubricPoint(value), "answer")}>
                    <Plus className="size-4" aria-hidden />
                    {L.addRubricPoint}
                  </Button>
                  <Text size="xs" tone={total === value.score ? "muted" : "warning"}>
                    {L.rubricTotal(total, value.score)}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </Field>
      )}
    </>
  );
}
```

- [ ] **Step 7: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/question-editor && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS。可能的失败与处理：
- `getByRole("radio", { name: "A 甲" })` 找不到：`Segmented` 的段是 `role="radio"`，无障碍名取 `ariaLabel ?? label` 文本；若名字取的是 `value`，在 `items` 里补 `ariaLabel: optionCaption(o.key, o.text)`。
- `getByRole("switch", { name: "分步给分" })` 找不到：看 `packages/ui/src/switch/switch.tsx` 的 `aria-label` 落在哪个节点；必要时改用 `screen.getByLabelText("分步给分")`。
- `Alert` 的 `action` 按钮渲染位置不影响 `getByRole`。
- `FiguresStrip` 的 `warnOnce` 测试若 `isDev` 在 vitest 下为 false 不打印，断言 `toBeLessThanOrEqual(1)` 仍过。

- [ ] **Step 8: Commit**

```bash
git add packages/ui/src/question-editor/question-editor-figures.tsx packages/ui/src/question-editor/question-editor-options.tsx packages/ui/src/question-editor/question-editor-blanks.tsx packages/ui/src/question-editor/question-editor-subjective.tsx packages/ui/src/question-editor/question-editor-sections.test.tsx
git commit -m "feat(ui/math): QuestionEditor 四个分节子件（题图条上传/选项增删移/填空等价写法与对齐/主观题分步给分）"
```

---

### Task 5: 主件 `question-editor.tsx`

**Files:**
- Create: `packages/ui/src/question-editor/question-editor.tsx`
- Create: `packages/ui/src/question-editor/question-editor.test.tsx`

**Interfaces:**
- Consumes：Task 2 纯函数与类型、Task 3 词条、Task 4 四个子件、Task 1 的 `QuestionCard.resolveFigure`；`validateQuestion` / `QUESTION_TYPES`（`../question/question-shape`）、`QUESTION_LOCALE_ZH`（`../question/question.locale`）；`useComponentLocale`（`../config/locale-context`）；`AlertDialog` / `AlertDialogClose` / `AlertDialogContent`（`../alert-dialog`）、`Alert`、`Button`、`Field`、`NumberField`、`Rating`、`Segmented`、`Text`、`cn`。
- Produces：`QuestionEditor(props: QuestionEditorProps)`，根节点 `data-slot="question-editor"`，预览区 `data-slot="question-editor-preview"`。

- [ ] **Step 1: 写主件测试**

```tsx
// packages/ui/src/question-editor/question-editor.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import { QuestionEditor } from "./question-editor";
import type { QuestionEditorProps } from "./question-editor.types";

const CJK = /[㐀-䶿一-鿿]/u;

function Harness({
  initial,
  onValue,
  ...rest
}: { initial: Question; onValue?: (q: Question) => void } & Omit<QuestionEditorProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <QuestionEditor
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

const single = (): Question => ({
  ...emptyQuestion("single"),
  stem: "下列正确的是",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
  ],
  answer: "A",
});

const alertDialog = () => document.querySelector('[role="alertdialog"]') as HTMLElement | null;

describe("QuestionEditor", () => {
  it("七个题型都在，题干 / 解析 / 难度 / 分值 / 用时齐全", () => {
    render(<Harness initial={emptyQuestion("single")} />);
    for (const name of ["单选", "多选", "判断", "填空", "简答", "计算", "解答"]) {
      expect(screen.getByRole("radio", { name })).toBeTruthy();
    }
    expect(screen.getByLabelText("题干")).toBeTruthy();
    expect(screen.getByLabelText("解析")).toBeTruthy();
    expect(screen.getByLabelText("分值")).toBeTruthy();
    expect(screen.getByLabelText("预估用时（分钟）")).toBeTruthy();
  });

  it("干净的题切题型直接重置形状，不弹确认", () => {
    const onValue = vi.fn();
    render(<Harness initial={emptyQuestion("single")} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "判断" }));
    expect(alertDialog()).toBeNull();
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "judge", options: null, answer: true, score: 3 }),
    );
  });

  it("有内容的题切题型先确认：取消保留，确认清空并换默认分", async () => {
    const onValue = vi.fn();
    render(<Harness initial={single()} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "解答" }));
    await waitFor(() => expect(alertDialog()).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "取消" }));
    await waitFor(() => expect(alertDialog()).toBeNull());
    expect(onValue).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("radio", { name: "解答" }));
    await waitFor(() => expect(alertDialog()).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: "清空并切换" }));
    expect(onValue).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "essay", options: null, answer: "", score: 8, stem: "下列正确的是" }),
    );
  });

  it("defaultScoreByType 覆盖默认分", () => {
    const onValue = vi.fn();
    render(<Harness initial={emptyQuestion("single")} onValue={onValue} defaultScoreByType={{ blank: 6 }} />);
    fireEvent.click(screen.getByRole("radio", { name: "填空" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ type: "blank", score: 6 }));
  });

  it("填空：题干多写一个 ____ 后答案区出对齐提示", () => {
    render(<Harness initial={{ ...emptyQuestion("blank"), stem: "a=____", answer: ["1"] }} />);
    fireEvent.change(screen.getByLabelText("题干"), { target: { value: "a=____，b=____" } });
    expect(screen.getByText("题干有 2 个空，答案有 1 项")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "按题干对齐为 2 空" }));
    expect(screen.getByLabelText("第 2 空")).toBeTruthy();
  });

  it("判断题答案是「正确 / 错误」两段", () => {
    const onValue = vi.fn();
    render(<Harness initial={emptyQuestion("judge")} onValue={onValue} />);
    fireEvent.click(screen.getByRole("radio", { name: "错误" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ answer: false }));
  });

  it("校验：默认只显示改过的字段；showAllIssues 全部显示", () => {
    const { rerender } = render(<Harness initial={emptyQuestion("single")} />);
    expect(screen.queryByText("题干不能为空")).toBeNull();
    fireEvent.change(screen.getByLabelText("题干"), { target: { value: "x" } });
    fireEvent.change(screen.getByLabelText("题干"), { target: { value: "" } });
    expect(screen.getByText("题干不能为空")).toBeTruthy();
    expect(screen.queryByText("选项 A 不能为空")).toBeNull();
    rerender(<Harness initial={emptyQuestion("single")} showAllIssues />);
    expect(screen.getByText("选项 A 不能为空")).toBeTruthy();
    expect(screen.getByText("答案必须在选项范围内")).toBeTruthy();
  });

  it("复核条列出 issues，「已处理」回调 label", () => {
    const onResolveIssue = vi.fn();
    render(
      <Harness
        initial={single()}
        issues={[{ label: "选项疑似缺失" }, { label: "答案存疑", tone: "danger" }]}
        onResolveIssue={onResolveIssue}
      />,
    );
    expect(screen.getByText("选项疑似缺失")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "已处理" })[1]);
    expect(onResolveIssue).toHaveBeenCalledWith("答案存疑");
  });

  it("extra 渲染在题型之后、题干之前", () => {
    render(<Harness initial={single()} extra={<div data-testid="extra">学科</div>} />);
    const extra = screen.getByTestId("extra");
    const typeGroup = screen.getByRole("radiogroup", { name: "题型" });
    const stem = screen.getByLabelText("题干");
    expect(typeGroup.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(extra.compareDocumentPosition(stem) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("预览是带答案的 QuestionCard；题干为空时显示占位；preview=false 不渲染", () => {
    const { container, rerender } = render(<Harness initial={single()} />);
    const preview = container.querySelector('[data-slot="question-editor-preview"]') as HTMLElement;
    expect(preview.querySelector('[data-slot="question-answer"]')).not.toBeNull();
    expect(preview.textContent).toContain("甲");
    rerender(<Harness initial={emptyQuestion("single")} />);
    expect(screen.getByText("输入题干后显示预览")).toBeTruthy();
    rerender(<Harness initial={single()} preview={false} />);
    expect(container.querySelector('[data-slot="question-editor-preview"]')).toBeNull();
  });

  it("题图：输入框只见正文；上传成功后 stem 末尾多一行 ![](key)，预览渲染成 img", async () => {
    const onValue = vi.fn();
    const upload = vi.fn<(file: File) => Promise<string>>().mockResolvedValue("import/new.png");
    const { container } = render(
      <Harness
        initial={{ ...single(), stem: "如图\n\n![](import/old.png)" }}
        onValue={onValue}
        resolveFigure={(key) => `/files/${key}`}
        onUploadFigure={upload}
      />,
    );
    expect((screen.getByLabelText("题干") as HTMLTextAreaElement).value).toBe("如图");
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(["x"], "new.png", { type: "image/png" })] } });
    await waitFor(() =>
      expect(onValue).toHaveBeenLastCalledWith(
        expect.objectContaining({ stem: "如图\n\n![](import/old.png)\n![](import/new.png)" }),
      ),
    );
    const preview = container.querySelector('[data-slot="question-editor-preview"]') as HTMLElement;
    expect(Array.from(preview.querySelectorAll("img")).map((i) => i.getAttribute("src"))).toEqual([
      "/files/import/old.png",
      "/files/import/new.png",
    ]);
    fireEvent.click(screen.getByRole("button", { name: "删除题图 1" }));
    expect(onValue).toHaveBeenLastCalledWith(expect.objectContaining({ stem: "如图\n\n![](import/new.png)" }));
  });

  it("没给 onUploadFigure 时没有「插入图片」", () => {
    render(<Harness initial={single()} />);
    expect(screen.queryByRole("button", { name: "插入图片" })).toBeNull();
  });

  it("disabled 时输入与按钮全部禁用", () => {
    render(<Harness initial={single()} disabled />);
    expect((screen.getByLabelText("题干") as HTMLTextAreaElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "添加选项" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("分值") as HTMLInputElement).disabled).toBe(true);
  });

  it("enUS 下英文站零中文", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Harness initial={{ ...single(), stem: "Which is right", options: [{ key: "A", text: "a" }, { key: "B", text: "b" }] }} showAllIssues />
      </ConfigProvider>,
    );
    expect(container.textContent).not.toMatch(CJK);
    for (const el of container.querySelectorAll("[aria-label], [placeholder]")) {
      expect(el.getAttribute("aria-label") ?? "").not.toMatch(CJK);
      expect(el.getAttribute("placeholder") ?? "").not.toMatch(CJK);
    }
  });
});
```

`ConfigProvider` 的 `locale` prop 名以 `math-textarea.test.tsx` 里的写法为准（那里已有同样的 enUS 测试），照抄。

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-editor/question-editor.test.tsx
```
期望：FAIL（模块不存在）。

- [ ] **Step 3: 写主件**

```tsx
// packages/ui/src/question-editor/question-editor.tsx
"use client";
import { useMemo, useState } from "react";
import { Alert } from "../alert";
import { AlertDialog, AlertDialogClose, AlertDialogContent } from "../alert-dialog";
import { Button } from "../button";
import { useComponentLocale } from "../config/locale-context";
import { Field } from "../field";
import { cn } from "../lib/cn";
import { MathTextarea } from "../math-textarea/math-textarea";
import { NumberField } from "../number-field";
import { QuestionCard } from "../question-card/question-card";
import { validateQuestion } from "../question/question-shape";
import { QUESTION_LOCALE_ZH } from "../question/question.locale";
import { QUESTION_TYPES, type Question, type QuestionType } from "../question/question.types";
import { Rating } from "../rating";
import { Segmented } from "../segmented";
import { Text } from "../text";
import { BlanksSection } from "./question-editor-blanks";
import { FiguresStrip } from "./question-editor-figures";
import { OptionsSection } from "./question-editor-options";
import { SubjectiveSection } from "./question-editor-subjective";
import { QUESTION_EDITOR_LOCALE_ZH } from "./question-editor.locale";
import {
  addStemFigure,
  issuesByField,
  removeStemFigure,
  scoreDefaults,
  setEstimatedMinutes,
  setStemBody,
  shapeIsDirty,
  stemBody,
  stemFigures,
  switchType,
} from "./question-editor.state";
import type { EditorField, QuestionEditorProps, SectionContext } from "./question-editor.types";

/**
 * 出题 / 复核编辑器：一道题的全部结构化字段（题型、题干 + 题图、选项 / 判断 / 填空 / 主观题答案、
 * 解析、难度 / 分值 / 用时）+ 右侧 QuestionCard 实时预览。**不带提交按钮**：提交与私有字段是页面的事。
 *
 * 只认规范形 `Question`（阶段 1 类型）。切题型时 options 与 answer 同时重置成新题型的空形状
 * （否则会造出「judge 带 options」这类被后端 422 的值），有内容时先确认。校验用 `validateQuestion`
 * 就地挂到 Field.error，默认只显示改过的字段，页面点提交后置 `showAllIssues`。
 * 题干输入框只见正文，图以 `![](key)` 块写回题干末尾，预览与展示端同一条 `resolveFigure` 路径。
 */
export function QuestionEditor({
  value,
  onChange,
  disabled = false,
  resolveFigure,
  onUploadFigure,
  extra,
  issues,
  onResolveIssue,
  defaultScoreByType,
  templates,
  visualEditor,
  macros,
  preview = true,
  showAllIssues = false,
  className,
}: QuestionEditorProps) {
  const locale = useComponentLocale();
  const L = locale.questionEditor ?? QUESTION_EDITOR_LOCALE_ZH;
  const Q = locale.question ?? QUESTION_LOCALE_ZH;
  const [pendingType, setPendingType] = useState<QuestionType | null>(null);
  const [touched, setTouched] = useState<ReadonlySet<EditorField>>(() => new Set());
  const defaults = useMemo(() => scoreDefaults(defaultScoreByType), [defaultScoreByType]);

  const commit = (next: Question, field?: EditorField) => {
    if (field !== undefined && !touched.has(field)) setTouched(new Set([...touched, field]));
    onChange(next);
  };

  const grouped = issuesByField(validateQuestion(value));
  const message = (field: EditorField): string | undefined => {
    const issue = grouped[field];
    if (issue === undefined || !(showAllIssues || touched.has(field))) return undefined;
    return L.validation[issue.code](issue.detail);
  };
  const errors: SectionContext["errors"] = {
    stem: message("stem"),
    options: message("options"),
    answer: message("answer"),
    difficulty: message("difficulty"),
    score: message("score"),
  };

  const pickType = (raw: string) => {
    const type = raw as QuestionType;
    if (type === value.type) return;
    if (shapeIsDirty(value)) {
      setPendingType(type);
      return;
    }
    commit(switchType(value, type, defaults));
  };
  const confirmType = () => {
    if (pendingType !== null) commit(switchType(value, pendingType, defaults));
    setPendingType(null);
  };

  const textarea = { templates, visualEditor, macros };
  const section: SectionContext = { value, onChange: commit, disabled, L, textarea, errors };
  const figures = stemFigures(value.stem);
  const subjective = value.type === "short_answer" || value.type === "calculation" || value.type === "essay";

  const editor = (
    <div data-slot="question-editor-form" className="space-y-5">
      {issues !== undefined && issues.length > 0 && (
        <Alert tone="warning" title={L.issues}>
          <ul className="space-y-1">
            {issues.map((issue) => (
              <li key={issue.label} className="flex flex-wrap items-center justify-between gap-2">
                <span>{issue.label}</span>
                {onResolveIssue && (
                  <Button size="sm" variant="outline" disabled={disabled} onClick={() => onResolveIssue(issue.label)}>
                    {L.resolveIssue}
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <Field label={L.type} description={L.typeHint}>
        <Segmented
          tone="brand"
          aria-label={L.type}
          items={QUESTION_TYPES.map((t) => ({ value: t, label: Q.types[t] }))}
          value={value.type}
          onValueChange={pickType}
          disabled={disabled}
        />
      </Field>

      {extra}

      <Field label={L.stem} description={L.stemHint} error={errors.stem}>
        <div className="space-y-2">
          <MathTextarea
            multiline
            rows={3}
            aria-label={L.stem}
            placeholder={L.stemPlaceholder}
            value={stemBody(value.stem)}
            onChange={(body) => commit(setStemBody(value, body), "stem")}
            disabled={disabled}
            {...textarea}
          />
          <FiguresStrip
            keys={figures}
            disabled={disabled}
            resolveFigure={resolveFigure}
            onUploadFigure={onUploadFigure}
            onAdd={(key) => commit(addStemFigure(value, key), "stem")}
            onRemove={(key) => commit(removeStemFigure(value, key), "stem")}
            L={L}
          />
        </div>
      </Field>

      {(value.type === "single" || value.type === "multiple") && <OptionsSection {...section} />}

      {value.type === "judge" && (
        <Field label={L.answer} error={errors.answer}>
          <Segmented
            tone="brand"
            aria-label={L.answer}
            disabled={disabled}
            items={[
              { value: "true", label: Q.judgeTrue },
              { value: "false", label: Q.judgeFalse },
            ]}
            value={value.answer === false ? "false" : "true"}
            onValueChange={(v) => commit({ ...value, answer: v === "true" }, "answer")}
          />
        </Field>
      )}

      {value.type === "blank" && <BlanksSection {...section} />}

      {subjective && <SubjectiveSection {...section} />}

      <Field label={L.analysis}>
        <MathTextarea
          multiline
          rows={2}
          aria-label={L.analysis}
          placeholder={L.analysisPlaceholder}
          value={value.analysis}
          onChange={(analysis) => commit({ ...value, analysis })}
          disabled={disabled}
          {...textarea}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={L.difficulty} description={L.difficultyHint} error={errors.difficulty}>
          <Rating
            max={5}
            value={value.difficulty}
            disabled={disabled}
            onValueChange={(v) => commit({ ...value, difficulty: v ?? 1 }, "difficulty")}
          />
        </Field>
        <Field label={L.score} error={errors.score}>
          <NumberField
            aria-label={L.score}
            min={0}
            value={value.score}
            onValueChange={(v) => commit({ ...value, score: v ?? 0 }, "score")}
            disabled={disabled}
          />
        </Field>
        <Field label={L.estimatedMinutes}>
          <NumberField
            aria-label={L.estimatedMinutes}
            min={0}
            value={value.estimatedMinutes ?? null}
            onValueChange={(v) => commit(setEstimatedMinutes(value, v))}
            disabled={disabled}
          />
        </Field>
      </div>
    </div>
  );

  const previewNode = preview ? (
    <div data-slot="question-editor-preview" className="space-y-2 lg:sticky lg:top-4 lg:self-start">
      <Text size="xs" tone="muted" className="block">
        {L.preview}
      </Text>
      {value.stem.trim() === "" ? (
        <div className="rounded-[var(--radius)] border border-dashed border-border px-4 py-8 text-center">
          <Text size="sm" tone="muted">
            {L.previewEmpty}
          </Text>
        </div>
      ) : (
        <QuestionCard
          type={value.type}
          // 没给 resolveFigure 时把图块摘掉：让 QuestionCard 渲染一串 `![](key)` 源码不是预览。
          stem={resolveFigure ? value.stem : stemBody(value.stem)}
          resolveFigure={resolveFigure}
          options={value.options ?? undefined}
          answer={value.answer}
          analysis={value.analysis}
          showAnswer
        />
      )}
    </div>
  ) : null;

  return (
    <div
      data-slot="question-editor"
      className={cn(
        "grid grid-cols-1 gap-6",
        preview && "lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]",
        className,
      )}
    >
      {editor}
      {previewNode}

      <AlertDialog open={pendingType !== null} onOpenChange={(open) => !open && setPendingType(null)}>
        <AlertDialogContent title={L.switchTypeTitle} description={L.switchTypeDescription}>
          <AlertDialogClose render={<Button variant="outline">{L.cancel}</Button>} />
          <Button tone="danger" onClick={confirmType}>
            {L.switchTypeConfirm}
          </Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
```

若 `AlertDialogClose` 的 `render` prop 在 typecheck 里不接受，改成 `<AlertDialogClose className={buttonVariants({ variant: "outline" })}>{L.cancel}</AlertDialogClose>`（`buttonVariants` 从 `../button/button` import；先 `grep -n "export" packages/ui/src/button/button.tsx` 确认它导出）。

`QUESTION_TYPES` 从 `../question/question.types` 取（`question-shape.ts` 也转出它，两处同一份）。

- [ ] **Step 4: 跑测试 + typecheck + SSR 守卫**

```bash
cd packages/ui && npx vitest run src/question-editor src/question-card && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS。可能的失败与处理：
- 「有内容的题切题型先确认」里 `getByRole("button", { name: "取消" })` 找不到：Base UI 的 AlertDialog 弹层在 portal 里，`screen` 能看到；若 `waitFor` 超时是动画未收敛，把断言改成 `document.querySelector('[role="alertdialog"]')`（已经是）并给 `waitFor` 加 `{ timeout: 2000 }`。
- Segmented 的 `onValueChange` 在 jsdom 里点 `role="radio"` 是否触发：`segmented.test.tsx` 有 `fireEvent.click` 先例，照它。
- `Rating` 的 `onValueChange` 签名 `(value: number | null)`，已按此写。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/question-editor/question-editor.tsx packages/ui/src/question-editor/question-editor.test.tsx
git commit -m "feat(ui/math): QuestionEditor 主件（七型切换先确认/题干与题图分离/就地校验只显示改过的字段/QuestionCard 同源预览）"
```

---

### Task 6: 导出面 + 体积基线

**Files:**
- Create: `packages/ui/src/question-editor/index.ts`
- Modify: `packages/ui/src/math/index.ts`（末尾追加）
- Create: `packages/ui/src/question-editor/exports.test.ts`
- Modify: `scripts/size-limits.json`（**只改** `math` 一行）

**Interfaces:**
- Produces：`@hulianui/ui/math` 新增导出 `QuestionEditor`、`QUESTION_EDITOR_LOCALE_ZH` / `_EN`、`questionFormulaIssues`、`shapeIsDirty`、`switchType`、`optionCaption`、`stemBody`、`joinStemFigures`，类型 `QuestionEditorProps`、`EditorField`、`QuestionEditorLocale`、`SubjectiveType`、`QuestionFormulaIssue`、`FormulaField`。其余状态函数是组件内部实现，不导出（消费方拿 `value` / `onChange` 就够了；导出越多以后越不能改）。

- [ ] **Step 1: 写导出面测试**

```ts
// packages/ui/src/question-editor/exports.test.ts
import { describe, expect, it } from "vitest";
import * as rootEntry from "../index";
import * as mathEntry from "../math";

describe("question-editor 导出面", () => {
  it("从 @hulianui/ui/math 可达", () => {
    for (const name of [
      "QuestionEditor",
      "QUESTION_EDITOR_LOCALE_ZH",
      "QUESTION_EDITOR_LOCALE_EN",
      "questionFormulaIssues",
      "shapeIsDirty",
      "switchType",
      "optionCaption",
      "stemBody",
      "joinStemFigures",
    ]) {
      expect((mathEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("主 barrel 一个都不带（KaTeX 不进 @hulianui/ui）", () => {
    expect((rootEntry as Record<string, unknown>).QuestionEditor).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).questionFormulaIssues).toBeUndefined();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/question-editor/exports.test.ts
```
期望：第一条 FAIL（`QuestionEditor` undefined）。

- [ ] **Step 3: 写目录 barrel 与 math 转出**

```ts
// packages/ui/src/question-editor/index.ts
// 出题编辑器。**不是对外 subpath**：从 @hulianui/ui/math 转出（题干 / 选项 / 预览内部都是 Formula，独立入口省不掉 KaTeX）。
export { QuestionEditor } from "./question-editor";
export type { QuestionEditorProps, EditorField } from "./question-editor.types";
export {
  questionFormulaIssues,
  shapeIsDirty,
  switchType,
  optionCaption,
  stemBody,
  joinStemFigures,
} from "./question-editor.state";
export type { QuestionFormulaIssue, FormulaField } from "./question-editor.state";
export { QUESTION_EDITOR_LOCALE_ZH, QUESTION_EDITOR_LOCALE_EN } from "./question-editor.locale";
export type { QuestionEditorLocale, SubjectiveType } from "./question-editor.locale";
```

`packages/ui/src/math/index.ts` 末尾追加：

```ts
// 出题编辑器（阶段 3）。题干 / 选项 / 预览内部都是 Formula，所以同住此路径。
export * from "../question-editor";
```

- [ ] **Step 4: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/question-editor src/question src/math-textarea src/question-card && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS。

- [ ] **Step 5: 量体积并归因**

```bash
CI=1 pnpm size 2>&1 | tail -20
CI=1 bash scripts/bundle-size.sh --why math 2>&1 | grep -n "config/locale\|question-editor\|alert-dialog\|segmented\|checkbox\|rating\|number-field\|switch\|image/" | head -30
```
判据：
- `--why math` 输出里**不得出现** `config/locale.ts`（出现 = 某处 import 了 zhCN，回去改成只引 `question-editor.locale.ts`）。
- 多出来的应是 `question-editor/`、`field/`、`segmented/`、`checkbox/`、`checkbox-group/`、`switch/`、`rating/`、`number-field/`、`alert/`、`alert-dialog/`、`chip/`、`image/` 与对应的 `@base-ui/react/...`。
- math 大概率超 178KB。确认上面两条后**手改** `scripts/size-limits.json` 里 `"name": "math"` 那一条的 `limitKB` 为 `Math.ceil(实测KB × 1.15)`（只改这一行；`git diff scripts/size-limits.json` 必须只有一行 `-`/`+`），把实测值与新上限记下来，Task 9 的 changeset 要写。再跑一次 `CI=1 pnpm size` 确认 14 入口全绿。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-editor/index.ts packages/ui/src/math/index.ts packages/ui/src/question-editor/exports.test.ts scripts/size-limits.json
git commit -m "feat(ui/math): 从 @hulianui/ui/math 转出 QuestionEditor；math 体积基线随组件上调（只改 math 一行）"
```

---

### Task 7: 文档（中英）+ QuestionCard / math.md 补行

**Files:**
- Create: `packages/ui/src/question-editor/question-editor.md`
- Create: `packages/ui/src/question-editor/question-editor.en.md`
- Modify: `packages/ui/src/question-card/question-card.md`、`question-card.en.md`（Props 表加 `resolveFigure` 行）
- Modify: `packages/ui/src/math/math.md`、`math.en.md`（题目域段落 + 相关）

md 必须在 Task 8 的 `pnpm docs:all` 之前存在，否则脚手架会生成 scaffold md（`hulian-docs-all-scaffold-overwrites-handwritten-md`）。

- [ ] **Step 1: 写中文文档**

````markdown
---
slug: question-editor
name: QuestionEditor
category: forms
group: advanced
tags: []
exports: [QuestionEditor, questionFormulaIssues, shapeIsDirty, switchType, optionCaption, stemBody, joinStemFigures, QUESTION_EDITOR_LOCALE_ZH, QUESTION_EDITOR_LOCALE_EN]
status: enriched
---

# QuestionEditor

> 出题编辑器 · 一道数学题的结构化编辑：七型切换（有内容先确认）、题干 + 题图、选项增删上下移（答案跟着走）、判断 / 填空（空数随题干、等价写法、一键对齐）/ 主观题（参考答案 + 分步给分）、解析、难度 / 分值 / 用时、复核条、私有字段插槽、QuestionCard 同源实时预览 · 校验就地挂 Field.error · 不带提交按钮 · 走 @hulianui/ui/math · forms/advanced

## 何时用

题库录入页、AI / Word 拆题后的校准页，凡是「编辑一道题」的地方都用它，而不是各写一份 1200 行的表单。它只管一道题本身（`Question` 规范形）；学科、教材小节、考点、通用题授权、上传端点这些是消费方私有字段，放进 `extra` 插槽、上传走 `onUploadFigure`。

只展示不编辑用 [QuestionCard](../question-card/question-card.md)；学生作答用 QuestionAnswer（阶段 4）；单个「可含公式的输入框」用 [MathTextarea](../math-textarea/math-textarea.md)（本件内部就是它）。

## 导入

```ts
import { QuestionEditor, emptyQuestion, validateQuestion, toWireAnswer, fromWire } from "@hulianui/ui/math"
```

住 `@hulianui/ui/math` 而不是主包：题干、选项、预览内部都是 Formula，也就带着 KaTeX；不排数学的消费者不该付这份体积。

## 用法

```tsx
const [question, setQuestion] = useState(() => emptyQuestion("single"));
const [submitted, setSubmitted] = useState(false);

<QuestionEditor
  value={question}
  onChange={setQuestion}
  showAllIssues={submitted}
  resolveFigure={(key) => `/api/files/${key}`}
  onUploadFigure={async (file) => (await uploadImage(file)).storage_key}
  extra={<SubjectAndSectionFields />}
/>

<Button
  onClick={() => {
    setSubmitted(true);
    if (validateQuestion(question).length > 0 || questionFormulaIssues(question).length > 0) return;
    save({ ...question, answer: toWireAnswer(question) });
  }}
>
  保存
</Button>
```

历史数据先归一再喂进来：`fromWire({ type, options, answer })` 把 `"A,C"` 多选串、字符串形 options、`"true"` 判断串收成规范形。

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `Question` | - | 受控值：规范形（`@hulianui/ui/math` 的 `Question`）。填空题内部**永远是数组**（单空也是一项数组），出口用 `toWireAnswer` 压平 |
| onChange | `(next: Question) => void` | - | 每次编辑回传整份规范形 |
| disabled | `boolean` | `false` | 只读 |
| resolveFigure | `(key: string) => string` | - | 题干里 `![](key)` → 可显示 URL。缩略图条与预览都靠它；题干有图而没给时缩略图只显示 key 并有开发期告警 |
| onUploadFigure | `(file: File) => Promise<string>` | - | 上传一张题图，返回 storage key。**给了才出「插入图片」**；成功后以 `![](key)` 写回题干末尾，失败在缩略图条上显示原因 |
| extra | `ReactNode` | - | 消费方私有字段，渲染在题型之后、题干之前 |
| issues | `{ label, tone? }[]` | - | 复核条：顶部列出，每条一个「已处理」 |
| onResolveIssue | `(label: string) => void` | - | 点「已处理」回调；不给则不渲染按钮 |
| defaultScoreByType | `Partial<Record<QuestionType, number>>` | - | 覆盖按题型的默认分。切题型时 `score` 仍等于旧题型默认分才自动换 |
| templates | `readonly FormulaTemplateGroup[]` | - | 透传给每个 MathTextarea |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | 透传给每个 MathTextarea（MathField 满足此契约） |
| macros | `Record<string, string>` | - | 透传给每个 MathTextarea 与预览的 KaTeX 宏表 |
| preview | `boolean` | `true` | 右侧（窄屏在下方）QuestionCard 实时预览，带答案与解析 |
| showAllIssues | `boolean` | `false` | 把 `validateQuestion` 的全部问题立刻挂到字段上。默认只显示**改过的**字段；页面在用户点提交后置 true |
| className | `string` | - | 透传到根节点（两栏 grid） |

## Events

| 名称 | 参数 | 说明 |
|------|------|------|
| onChange | `(next: Question)` | 任一字段变化。切题型时 `options` 与 `answer` 同时重置，`score` 按默认分表换算 |
| onUploadFigure | `(file: File)` | 用户选了图。返回的 key 在 resolve 之后写回**当时最新**的题干（上传期间继续敲的字不会丢） |
| onResolveIssue | `(label: string)` | 复核条上点「已处理」 |

## Slots

| 名称 | 说明 |
|------|------|
| extra | 私有字段区，题型之后、题干之前。放学科 / 教材小节 / 考点这类不属于「一道题」的字段 |

## 国际化

全部文案走 Locale 的 `components.questionEditor`（`QuestionEditorLocale`，SSOT 在 `question-editor.locale.ts`，`zhCN` / `enUS` 已接）。题型名与判断题的「正确 / 错误」取自 `components.question`（与 QuestionCard 同一份）。`validateQuestion` 的机器码文案表在 `validation`，键与 `QuestionValidationCode` 钉死。

## 配套纯函数

都从 `@hulianui/ui/math` 导出：

- `questionFormulaIssues(q)` → `{ field, key?, issue }[]`：逐字段跑 `validateFormulaSyntax`（题干、每个选项、每空每种写法、参考答案与得分点、解析）。编辑器里每个输入框已就地显示同一问题；这个给提交按钮用。文案用 `mathTextarea` 词条的 `position(line, column) + syntax[code]` 拼。
- `shapeIsDirty(q)` → `boolean`：切题型会不会丢内容（选项有字或答案不等于该题型的空形状）。页面做「清空表单」二次确认时可复用。
- `switchType(q, type, defaults?)` → `Question`：options 与 answer 同时重置 + 默认分换算。
- `optionCaption(key, text)` → `string`：正确答案控件上的标签（`A 选项文本前 20 字`，朴素文本）。
- `stemBody(stem)` / `joinStemFigures(body, keys)`：题干正文与题图块的拆合，判据与编辑器一致。

## 禁忌 / 坑

- **`value` 必须是规范形**。`answer: "A,C"`、`options: ["A. 甲"]`、`answer: "true"` 这些历史变体先过 `fromWire`；直接喂进来会显示成「没选答案」，而且 `validateQuestion` 会报 `answer_out_of_range`。
- **填空题的 `answer` 出口要压平**。编辑器内部单空也是 `["90"]`；消费方后端若单空只收字符串，提交前 `toWireAnswer(question)`。
- **切题型会清空选项与答案**（有内容时先确认）。这是刻意的：保留旧形状会造出「判断题带选项」这类后端 422 的值。
- **题图在题干里，不在别的字段**。输入框看不到 `![](key)`，但 `value.stem` 里有；图挂在别处的话组卷预览、学生端、导出一张也拿不到。`resolveFigure` 不给时预览把图摘掉、缩略图只剩 key。
- **上传只在给了 `onUploadFigure` 时出现**。文件类型 / 大小限制由消费方在回调里拦，拦住就 `throw new Error("单张不超过 5MB")`，错误信息原样显示在缩略图条上。
- **校验默认只显示改过的字段**。想在提交时全部飘红请置 `showAllIssues`，别在外面再画一遍错误。
- **没有提交按钮**。提交、私有字段必填（如学科）、`estimatedMinutes` 的上限，都是页面的事。
- **JSX 属性字符串不处理 `\\`**：初值里含反斜杠的公式写成 `stem: "$\\frac{1}{2}$"`（TS 字符串），不要写在 JSX 属性里。

## 相关

- [QuestionCard](../question-card/question-card.md) —— 预览用的就是它（`showAnswer` + `resolveFigure`）
- [MathTextarea](../math-textarea/math-textarea.md) —— 每个可含公式的输入框
- [Formula](../math/math.md) —— `@hulianui/ui/math` 的题目域纯函数（`validateQuestion` / `defaultShape` / `toWireAnswer` / `fromWire` / `splitStemFigures`）
- [Field](../field/field.md) —— 错误挂载方式
````

- [ ] **Step 2: 写英文文档**

````markdown
---
slug: question-editor
name: QuestionEditor
category: forms
group: advanced
tags: []
exports: [QuestionEditor, questionFormulaIssues, shapeIsDirty, switchType, optionCaption, stemBody, joinStemFigures, QUESTION_EDITOR_LOCALE_ZH, QUESTION_EDITOR_LOCALE_EN]
status: enriched
---

# QuestionEditor

> Question editor · structured editing of one math question: seven types (confirm before clearing content), stem plus figures, options with add / remove / reorder (the answer follows), true-false / blanks (count follows the stem, equivalent forms, one-click align) / subjective (reference answer plus rubric), explanation, difficulty / score / time, review bar, private-field slot, live QuestionCard preview from the same renderer · validation lands on Field.error · no submit button · ships in @hulianui/ui/math · forms/advanced

## When to use

Question-bank entry pages and the calibration page after AI or Word import: anywhere "edit one question" happens, instead of a 1200-line form per page. It owns the question itself (the `Question` canonical shape). Subject, textbook section, knowledge points, general-scope notes, and upload endpoints are consumer-private: put them in the `extra` slot and upload through `onUploadFigure`.

Display only: [QuestionCard](../question-card/question-card.en.md). Student answering: QuestionAnswer (phase 4). A single formula-capable input: [MathTextarea](../math-textarea/math-textarea.en.md) (what this component is built from).

## Import

```ts
import { QuestionEditor, emptyQuestion, validateQuestion, toWireAnswer, fromWire } from "@hulianui/ui/math"
```

It lives in `@hulianui/ui/math` rather than the root package: the stem, options, and preview are all Formula, so KaTeX comes along; consumers that never typeset math should not pay for it.

## Examples

```tsx
const [question, setQuestion] = useState(() => emptyQuestion("single"));
const [submitted, setSubmitted] = useState(false);

<QuestionEditor
  value={question}
  onChange={setQuestion}
  showAllIssues={submitted}
  resolveFigure={(key) => `/api/files/${key}`}
  onUploadFigure={async (file) => (await uploadImage(file)).storage_key}
  extra={<SubjectAndSectionFields />}
/>

<Button
  onClick={() => {
    setSubmitted(true);
    if (validateQuestion(question).length > 0 || questionFormulaIssues(question).length > 0) return;
    save({ ...question, answer: toWireAnswer(question) });
  }}
>
  Save
</Button>
```

Normalize legacy data first: `fromWire({ type, options, answer })` turns `"A,C"` multiple-choice strings, string-shaped options, and `"true"` strings into the canonical shape.

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `Question` | - | Controlled value in the canonical shape (`Question` from `@hulianui/ui/math`). Blank answers are **always arrays** inside the editor (one entry even for a single blank); flatten on the way out with `toWireAnswer` |
| onChange | `(next: Question) => void` | - | Called with the whole canonical shape on every edit |
| disabled | `boolean` | `false` | Read-only |
| resolveFigure | `(key: string) => string` | - | Maps `![](key)` in the stem to a displayable URL. Both the thumbnail strip and the preview use it; when the stem has figures and it is missing, thumbnails show only the key and a dev warning fires |
| onUploadFigure | `(file: File) => Promise<string>` | - | Uploads one figure and resolves to its storage key. **The Insert image button appears only when provided**; on success `![](key)` is appended to the stem, on failure the reason shows in the strip |
| extra | `ReactNode` | - | Consumer-private fields, rendered after the type and before the stem |
| issues | `{ label, tone? }[]` | - | Review bar listed at the top, one Resolved button per item |
| onResolveIssue | `(label: string) => void` | - | Called from the Resolved button; the button is omitted when this is missing |
| defaultScoreByType | `Partial<Record<QuestionType, number>>` | - | Overrides the per-type default score. On a type switch the score changes only if it still equals the old type's default |
| templates | `readonly FormulaTemplateGroup[]` | - | Passed to every MathTextarea |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | Passed to every MathTextarea (MathField satisfies the contract) |
| macros | `Record<string, string>` | - | KaTeX macros passed to every MathTextarea and the preview |
| preview | `boolean` | `true` | Live QuestionCard preview on the right (below on narrow screens), with answer and explanation |
| showAllIssues | `boolean` | `false` | Show every `validateQuestion` issue at once. By default only fields the user has **edited** show issues; set it after the user presses submit |
| className | `string` | - | Root node (a two-column grid) |

## Events

| Name | Arguments | Description |
|------|-----------|-------------|
| onChange | `(next: Question)` | Any field changed. A type switch resets `options` and `answer` together and remaps `score` through the default table |
| onUploadFigure | `(file: File)` | The user picked an image. The resolved key is written into the **latest** stem (text typed during the upload is kept) |
| onResolveIssue | `(label: string)` | Resolved pressed on the review bar |

## Slots

| Name | Description |
|------|-------------|
| extra | Private-field area after the type and before the stem, for subject / section / knowledge-point fields that are not part of "one question" |

## Localization

All copy comes from the `components.questionEditor` locale (`QuestionEditorLocale`, source of truth in `question-editor.locale.ts`; `zhCN` and `enUS` are wired). Type names and the True / False labels come from `components.question` (shared with QuestionCard). The `validateQuestion` code table is `validation`, keyed by `QuestionValidationCode`.

## Companion pure functions

All exported from `@hulianui/ui/math`:

- `questionFormulaIssues(q)` returns `{ field, key?, issue }[]`: runs `validateFormulaSyntax` field by field (stem, each option, each form of each blank, reference answer and rubric points, explanation). Every input already shows the same issue inline; this one is for the submit button. Compose the message from the `mathTextarea` locale: `position(line, column) + syntax[code]`.
- `shapeIsDirty(q)` returns `boolean`: whether switching type would lose content (an option has text, or the answer differs from the type's empty shape). Reuse it for a "clear form" confirmation.
- `switchType(q, type, defaults?)` returns `Question`: resets options and answer together and remaps the score.
- `optionCaption(key, text)` returns `string`: the label on the correct-answer control (`A` plus the first 20 characters of the option as plain text).
- `stemBody(stem)` / `joinStemFigures(body, keys)`: split and join the stem body and the figure block with the editor's own rule.

## Pitfalls

- **`value` must be canonical.** Legacy variants such as `answer: "A,C"`, `options: ["A. x"]`, or `answer: "true"` go through `fromWire` first; fed directly they render as "no answer selected" and `validateQuestion` reports `answer_out_of_range`.
- **Flatten blank answers on the way out.** Inside the editor a single blank is `["90"]`; if the backend wants a plain string for single blanks, call `toWireAnswer(question)` before submitting.
- **Switching type clears options and answer** (with a confirmation when there is content). Keeping the old shape would produce values such as a true-false question with options, which the backend rejects.
- **Figures live in the stem, not in another field.** The input hides `![](key)` but `value.stem` contains it; if figures lived elsewhere, paper preview, the student view, and export would get none of them. Without `resolveFigure` the preview drops figures and thumbnails show only the key.
- **Upload appears only with `onUploadFigure`.** Enforce type and size limits inside the callback; reject with `throw new Error("Max 5MB per image")` and the message shows verbatim in the strip.
- **Validation shows only edited fields by default.** Set `showAllIssues` to flag everything at submit time; do not draw errors again outside.
- **No submit button.** Submitting, required private fields (such as subject), and an upper bound for `estimatedMinutes` belong to the page.
- **JSX attribute strings do not process `\\`.** Put formulas with backslashes in TS strings (`stem: "$\\frac{1}{2}$"`), not in JSX attributes.

## Related

- [QuestionCard](../question-card/question-card.en.md): the preview is this component (`showAnswer` + `resolveFigure`)
- [MathTextarea](../math-textarea/math-textarea.en.md): every formula-capable input
- [Formula](../math/math.en.md): the question-domain pure functions in `@hulianui/ui/math` (`validateQuestion` / `defaultShape` / `toWireAnswer` / `fromWire` / `splitStemFigures`)
- [Field](../field/field.en.md): how errors are attached
````

- [ ] **Step 3: QuestionCard 文档补 `resolveFigure` 行**

`packages/ui/src/question-card/question-card.md` Props 表 `| \`figure\` | ...` 那一行之后加：

```markdown
| `resolveFigure` | `(key: string) => string` | - | 题干里 `![](key)` 的解析器：给了就先切图再排公式，图按顺序渲染在正文之后；不给则题干原样交给 Formula |
```

`question-card.en.md` 的 `| \`figure\` | ...` 那一行之后加：

```markdown
| `resolveFigure` | `(key: string) => string` | - | Resolver for `![](key)` references in the stem: when provided, figures are split out first and rendered after the text in order; otherwise the stem is passed to Formula unchanged |
```

- [ ] **Step 4: `math.md` / `math.en.md` 各补两处**

`packages/ui/src/math/math.md` 的 `- \`MathTextarea\`：录题用的公式输入框…` 那一行之后加：

```markdown
- `QuestionEditor`：一道题的结构化编辑（七型 / 题图 / 选项 / 填空 / 分步给分 / 预览），见 [QuestionEditor](../question-editor/question-editor.md)。
```

`## 相关` 列表里 `- [MathTextarea](...)` 之后加：

```markdown
- [QuestionEditor](../question-editor/question-editor.md) —— 出题编辑器，题干 / 选项 / 预览内部就是本组件；同住 `@hulianui/ui/math`
```

`math.en.md`（`grep -n "MathTextarea" packages/ui/src/math/math.en.md` 定位两处）对应加：

```markdown
- `QuestionEditor`: structured editing of one question (seven types / figures / options / blanks / rubric / preview), see [QuestionEditor](../question-editor/question-editor.en.md).
```
```markdown
- [QuestionEditor](../question-editor/question-editor.en.md): question editor whose stem, options, and preview are this component; also lives in `@hulianui/ui/math`
```

- [ ] **Step 5: 文档门禁**

```bash
pnpm docs:check:props && pnpm docs:i18n:check
```
期望：rc=0。`docs:check:props` 报 `question-editor.<字段>` 缺表是 md 表漏行，补表不加豁免；报 `question-card.resolveFigure` 同理。`docs:i18n:check` 报中英坑位数不等时对齐「禁忌 / 坑」与「Pitfalls」的条数（现在各 8 条）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-editor/question-editor.md packages/ui/src/question-editor/question-editor.en.md packages/ui/src/question-card/question-card.md packages/ui/src/question-card/question-card.en.md packages/ui/src/math/math.md packages/ui/src/math/math.en.md
git commit -m "docs(ui/math): QuestionEditor 中英文档；QuestionCard 补 resolveFigure；math.md 链接"
```

---

### Task 8: showcase + 英文词条 + 画廊注册 + `docs:all` + perf-lab 重生成

**Files:**
- Create: `packages/ui/src/question-editor/question-editor.showcase.tsx`
- Modify: `packages/ui/src/showcase.ts`（`mathTextareaShowcase` 那行之后加一行）
- Modify: `apps/www/i18n/showcase-copy.en.json`（`exact` 加词条）
- Generated: `apps/www/generated/showcase-en/question-editor.showcase.tsx`、`apps/www/generated/showcase-en/index.ts`
- Modify: `apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`、`apps/www/i18n/component-meta.en.ts`
- Generated（`pnpm docs:all`）：`apps/www/public/registry.json`、`apps/www/public/llms-props.json`、`apps/www/public/conventions.json`、`apps/www/public/r/*.json` 等
- Generated：`apps/perf-lab/scenarios/generated.ts`

**Interfaces:**
- Consumes：`QuestionEditor`（Task 5）、`emptyQuestion`（`../question/question-shape`）、`Question`、`QuestionEditorProps`。
- Produces：`questionEditorShowcase: ShowcaseSpec`。

- [ ] **Step 1: 写 showcase**

```tsx
// packages/ui/src/question-editor/question-editor.showcase.tsx
"use client";
import { useState } from "react";
import { Field } from "../field";
import { Input } from "../input";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import type { ShowcaseSpec } from "../showcase/types";
import { QuestionEditor } from "./question-editor";
import type { QuestionEditorProps } from "./question-editor.types";

const SINGLE: Question = {
  ...emptyQuestion("single"),
  stem: "已知 $x^{2}-5x+6=0$，则 $x$ 的值为（ ）",
  options: [
    { key: "A", text: "$2$ 或 $3$" },
    { key: "B", text: "$-2$ 或 $-3$" },
    { key: "C", text: "$1$ 或 $6$" },
    { key: "D", text: "无解" },
  ],
  answer: "A",
  analysis: "因式分解得 $(x-2)(x-3)=0$。",
};

const BLANK: Question = {
  ...emptyQuestion("blank"),
  stem: "将 $\\frac{3}{8}$ 化成小数为____，化成百分数为____。",
  answer: ["0.375", ["37.5%", "37.5\\%"]],
};

const CALCULATION: Question = {
  ...emptyQuestion("calculation"),
  stem: "计算：$\\frac{1}{2}+\\frac{1}{3}$",
  answer: {
    reference: "$\\frac{5}{6}$",
    rubric: [
      { point: "通分", score: 3 },
      { point: "求和", score: 5 },
    ],
  },
};

// 画廊里的图：一个 SVG data URL，不依赖任何远程资源。
const FIGURE_SRC =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="120"><rect width="160" height="120" fill="#fff"/><polygon points="20,100 140,100 80,20" fill="none" stroke="#333" stroke-width="2"/><text x="76" y="14" font-size="12">A</text><text x="10" y="114" font-size="12">B</text><text x="142" y="114" font-size="12">C</text></svg>',
  );

const WITH_FIGURE: Question = {
  ...emptyQuestion("single"),
  stem: "如图，$\\triangle ABC$ 中 $AB=AC$，则 $\\angle B$ 与 $\\angle C$ 的关系是（ ）\n\n![](figures/abc.svg)",
  options: [
    { key: "A", text: "相等" },
    { key: "B", text: "互补" },
  ],
  answer: "A",
};

function Demo({ initial, ...rest }: { initial: Question } & Omit<QuestionEditorProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return <QuestionEditor {...rest} value={value} onChange={setValue} />;
}

const resolveFigure = () => FIGURE_SRC;
// 画廊不上传：读成 data URL 当 key，缩略图与预览立刻能显示。
const uploadFigure = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("读取失败"));
    reader.readAsDataURL(file);
  });
const resolveUploaded = (key: string) => (key.startsWith("data:") ? key : FIGURE_SRC);

function PrivateFields() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="学科">
        <Input defaultValue="数学" />
      </Field>
      <Field label="教材小节">
        <Input defaultValue="七上 · 一元二次方程" />
      </Field>
    </div>
  );
}

export const questionEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单选题：选项增删上下移，正确答案跟着内容走；右侧预览就是 QuestionCard。",
      code: `<QuestionEditor value={question} onChange={setQuestion} />`,
      render: () => <Demo initial={SINGLE} />,
    },
    {
      title: "填空题",
      description: "空数随题干里的 ____ 变化，不一致时提示并一键对齐；一空可加多种等价写法。",
      code: `<QuestionEditor value={question} onChange={setQuestion} />`,
      render: () => <Demo initial={BLANK} />,
    },
    {
      title: "分步给分",
      description: "计算题与解答题可切「分步给分」，得分点合计与题目分值并排。",
      code: `<QuestionEditor value={question} onChange={setQuestion} />`,
      render: () => <Demo initial={CALCULATION} />,
    },
    {
      title: "题图",
      description: "题干里的 ![](key) 由 resolveFigure 解析；给了 onUploadFigure 才出「插入图片」。",
      code: `<QuestionEditor
  value={question}
  onChange={setQuestion}
  resolveFigure={(key) => fileUrl(key)}
  onUploadFigure={async (file) => (await upload(file)).key}
/>`,
      render: () => <Demo initial={WITH_FIGURE} resolveFigure={resolveUploaded} onUploadFigure={uploadFigure} />,
    },
    {
      title: "复核条与私有字段",
      description: "issues 列在顶部逐条「已处理」；extra 放消费方自己的字段。",
      code: `<QuestionEditor
  value={question}
  onChange={setQuestion}
  issues={[{ label: "选项疑似缺失" }]}
  onResolveIssue={(label) => resolve(label)}
  extra={<PrivateFields />}
/>`,
      render: () => (
        <Demo
          initial={SINGLE}
          issues={[{ label: "选项疑似缺失" }, { label: "答案存疑", tone: "danger" }]}
          onResolveIssue={() => {}}
          extra={<PrivateFields />}
        />
      ),
    },
    {
      title: "提交时全部校验",
      description: "默认只对改过的字段飘红；showAllIssues 把 validateQuestion 的问题一次挂全。",
      code: `<QuestionEditor value={question} onChange={setQuestion} showAllIssues />`,
      render: () => <Demo initial={emptyQuestion("multiple")} showAllIssues />,
    },
    {
      title: "只读",
      description: "disabled：复核通过后的只读态。",
      code: `<QuestionEditor value={question} onChange={setQuestion} disabled />`,
      render: () => <Demo initial={SINGLE} disabled />,
    },
  ],
  controls: [
    { prop: "preview", type: "boolean", defaultValue: true },
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "showAllIssues", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <Demo initial={SINGLE} /> },
    { name: "blank", render: () => <Demo initial={BLANK} /> },
    { name: "subjective", render: () => <Demo initial={CALCULATION} /> },
    { name: "disabled", render: () => <Demo initial={SINGLE} disabled /> },
  ],
  renderWithProps: (props) => (
    <Demo
      initial={SINGLE}
      preview={props.preview !== false}
      disabled={Boolean(props.disabled)}
      showAllIssues={Boolean(props.showAllIssues)}
    />
  ),
  toCode: (props) =>
    `<QuestionEditor${props.preview === false ? " preview={false}" : ""}${props.disabled ? " disabled" : ""}${
      props.showAllIssues ? " showAllIssues" : ""
    } value={question} onChange={setQuestion} />`,
};
```

- [ ] **Step 2: 注册 showcase + SSR 守卫**

`packages/ui/src/showcase.ts` 里 `export { mathTextareaShowcase } ...` 那一行之后加：

```ts
export { questionEditorShowcase } from "./question-editor/question-editor.showcase";
```

```bash
cd packages/ui && npx vitest run src/showcase/ssr-safety.test.tsx
```
期望：PASS（AlertDialog 闭合态不渲染弹层；`FileReader` 只在事件里用）。

- [ ] **Step 3: 补英文词条并生成**

```bash
pnpm showcase:generate 2>&1 | grep "missing English copy"
```

用下面的脚本把词条并进 `apps/www/i18n/showcase-copy.en.json` 的 `exact`（追加即可）。表是按上面 showcase 里每一个中文字符串 / `code` 的每一行 CJK 行（去首尾空白）列的；跑完 `showcase:generate` 若还报缺，把报的那个 key 原样加进表再跑（每次只报第一条缺失，要循环）：

```bash
node - <<'EOF'
const fs = require("node:fs");
const path = "apps/www/i18n/showcase-copy.en.json";
const copy = JSON.parse(fs.readFileSync(path, "utf8"));
const add = {
  "单选题：选项增删上下移，正确答案跟着内容走；右侧预览就是 QuestionCard。": "Single choice: add, remove, and reorder options, and the correct answer follows the content; the preview on the right is QuestionCard.",
  "填空题": "Fill in the blank",
  "空数随题干里的 ____ 变化，不一致时提示并一键对齐；一空可加多种等价写法。": "The number of blanks follows ____ in the stem, with a one-click align when they differ; a blank may accept several equivalent forms.",
  "分步给分": "Rubric",
  "计算题与解答题可切「分步给分」，得分点合计与题目分值并排。": "Calculation and extended-response questions can switch to a rubric; the rubric total sits next to the question score.",
  "题图": "Figures",
  "题干里的 ![](key) 由 resolveFigure 解析；给了 onUploadFigure 才出「插入图片」。": "![](key) in the stem is resolved by resolveFigure; the Insert image button appears only with onUploadFigure.",
  "复核条与私有字段": "Review bar and private fields",
  "issues 列在顶部逐条「已处理」；extra 放消费方自己的字段。": "issues are listed at the top with a Resolved button each; extra holds the consumer's own fields.",
  "issues={[{ label: \"选项疑似缺失\" }]}": "issues={[{ label: \"An option may be missing\" }]}",
  "选项疑似缺失": "An option may be missing",
  "答案存疑": "Answer in doubt",
  "提交时全部校验": "Validate everything on submit",
  "默认只对改过的字段飘红；showAllIssues 把 validateQuestion 的问题一次挂全。": "By default only edited fields turn red; showAllIssues attaches every validateQuestion issue at once.",
  "只读": "Read-only",
  "disabled：复核通过后的只读态。": "disabled: the read-only state after review.",
  "学科": "Subject",
  "数学": "Mathematics",
  "教材小节": "Textbook section",
  "七上 · 一元二次方程": "Grade 7 · Quadratic equations",
  "已知 $x^{2}-5x+6=0$，则 $x$ 的值为（ ）": "Given $x^{2}-5x+6=0$, the value of $x$ is ( )",
  "$2$ 或 $3$": "$2$ or $3$",
  "$-2$ 或 $-3$": "$-2$ or $-3$",
  "$1$ 或 $6$": "$1$ or $6$",
  "无解": "No solution",
  "因式分解得 $(x-2)(x-3)=0$。": "Factoring gives $(x-2)(x-3)=0$.",
  "将 $\\frac{3}{8}$ 化成小数为____，化成百分数为____。": "Write $\\frac{3}{8}$ as a decimal: ____, and as a percentage: ____.",
  "计算：$\\frac{1}{2}+\\frac{1}{3}$": "Evaluate $\\frac{1}{2}+\\frac{1}{3}$",
  "通分": "Common denominator",
  "求和": "Add",
  "如图，$\\triangle ABC$ 中 $AB=AC$，则 $\\angle B$ 与 $\\angle C$ 的关系是（ ）\\n\\n![](figures/abc.svg)": "As shown, in $\\triangle ABC$ with $AB=AC$, the relation between $\\angle B$ and $\\angle C$ is ( )\\n\\n![](figures/abc.svg)",
  "相等": "Equal",
  "互补": "Supplementary",
  "读取失败": "Read failed",
};
copy.exact ??= {};
for (const [k, v] of Object.entries(add)) if (!Object.hasOwn(copy.exact, k)) copy.exact[k] = v;
fs.writeFileSync(path, JSON.stringify(copy, null, 2) + "\n");
EOF
pnpm showcase:generate 2>&1 | grep -E "missing English copy|unused" ; pnpm showcase:check
```

注意：
- 「基础用法」已在 `exact` 里，脚本不会覆盖既有键。
- 生成器对 `code` 字符串是**逐行**取词条，键是该行去首尾空白后的整行；对 JSX 文本 / 属性字符串是整串原样；TS 字符串字面量里的 `\\n` 键以生成器报出来的原样为准。
- `showcase:check` 报 `unused` 表示某个新增键没被消费（拼写与源码不一致），删掉或改对，不要留着。
- 英文里不许有 CJK，也不许有 em-dash；「七上 · 一元二次方程」里的间隔号 `·` 不是 em-dash，保留。
- `protectedTokens` 对 `0$` 报 missing：本 showcase 没有数字紧贴 `$` 的句子（`$2$ 或 $3$` 是 `$` 开头），若报了按提示改示例句。

- [ ] **Step 4: 画廊三处注册**

`apps/www/lib/manifest.ts`：在 `slug: "math-textarea"` 那一行之后加：

```ts
  { slug: "question-editor", name: "QuestionEditor", shortName: "出题编辑器", description: "一道数学题的结构化编辑：七型切换、题图、选项、填空、分步给分、实时预览", category: "forms", group: "advanced", status: "new" },
```

`apps/www/lib/registry.tsx`：import 列表里 `mathTextareaShowcase,` 之后加 `questionEditorShowcase,`；映射表里 `"math-textarea": mathTextareaShowcase,` 之后加 `"question-editor": questionEditorShowcase,`。

`apps/www/i18n/component-meta.en.ts`：`"math-textarea": {...},` 之后加：

```ts
  "question-editor": {
    shortName: "QuestionEditor",
    description:
      "Structured editor for one math question: seven types, figures, options, blanks, rubric, and a live QuestionCard preview.",
    keywords: ["question", "editor", "math", "latex", "forms", "quiz"],
  },
```

```bash
pnpm --filter www exec vitest run i18n/meta-coverage.test.ts
```
期望：PASS。若 www 包没有 vitest 直跑脚本，用 `cd apps/www && npx vitest run i18n/meta-coverage.test.ts`。

- [ ] **Step 5: `docs:all` 再 perf-lab 重生成（顺序不能反）**

```bash
pnpm docs:all
git status --short      # 只该多出 apps/www/public/**、apps/www/generated/** 与 docs 相关产物；upload.tsx 仍是别人的，不动
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check
```
期望：第三条 rc=0；`git diff apps/perf-lab/scenarios/generated.ts` 只多出 `question-editor` 一组。若 `docs:all` 覆盖了 `question-editor.md`（`git diff` 里 md 变成 scaffold），说明 Task 7 的 frontmatter `status: enriched` 没写对，`git checkout` 回来后修 frontmatter 再跑。若产物里混进了别的 session 未提交的组件（计数对不上），见 skill `generated-index-absorbs-parallel-session-untracked-wip`。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/question-editor/question-editor.showcase.tsx packages/ui/src/showcase.ts apps/www/i18n/showcase-copy.en.json apps/www/generated/showcase-en/question-editor.showcase.tsx apps/www/generated/showcase-en/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx apps/www/i18n/component-meta.en.ts apps/perf-lab/scenarios/generated.ts
git add $(git status --short | awk '$1=="M"||$1=="??"{print $2}' | grep -E "^apps/www/(public|generated)/|^apps/www/out/|^docs/" )
git status --short      # 确认 packages/ui/src/upload/upload.tsx 没被暂存
git commit -m "feat(www): QuestionEditor 画廊示例、英文词条与四处注册（manifest/registry/英文元数据/perf-lab）+ docs:all 产物"
```

---

### Task 9: changeset + README 计数 + 全量门禁 + 合回 master

**Files:**
- Create: `.changeset/question-editor.md`
- Modify: `README.md`（`pnpm readme:sync`，396 → 397）

- [ ] **Step 1: changeset**

```markdown
---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增 `QuestionEditor`：一道数学题的结构化编辑器。七型切换时 options 与 answer 同时重置（有内容先确认，`score` 仍是旧默认分才换新默认分）；题干输入框只见正文，题图以 `![](key)` 块写回题干末尾，`resolveFigure` 解析、`onUploadFigure` 给了才出「插入图片」；选项增删上下移后正确答案跟着内容重映射；填空空数随题干 `____` 变化、不一致时提示并一键对齐、一空可加等价写法；计算 / 解答可切分步给分并显示合计；`validateQuestion` 就地挂 `Field.error`（默认只显示改过的字段，`showAllIssues` 提交时全开）；复核条 `issues` / `onResolveIssue`；`extra` 放消费方私有字段；右侧预览就是 `QuestionCard`。不带提交按钮。文案走 Locale（新增 `questionEditor` 词条，含 `validateQuestion` 机器码文案表）。配套导出 `questionFormulaIssues` / `shapeIsDirty` / `switchType` / `optionCaption` / `stemBody` / `joinStemFigures`。

`QuestionCard` 新增 `resolveFigure`：题干里的 `![](key)` 先切图再排公式，图渲染在正文之后（编辑器预览与题库列表同一条路径）。

体积：`@hulianui/ui/math` 的 `export *` 上界从 154.4KB 升到 <实测>KB（Field / Segmented / Checkbox / Switch / Rating / NumberField / Alert / AlertDialog / Image 进入该入口），基线相应上调到 <上限>KB；库 `sideEffects:false`，只用 `Formula` / `QuestionCard` 的消费方经 tree-shaking 不受影响。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains `QuestionEditor`, a structured editor for one math question. Switching type resets options and answer together (with a confirmation when there is content; the score changes only if it still equals the old default); the stem input shows only the body while figures are written back as a `![](key)` block at the end of the stem, resolved through `resolveFigure`, with the Insert image button appearing only when `onUploadFigure` is provided; after adding, removing, or reordering options the correct answer is remapped to follow the content; the number of blanks follows `____` in the stem with a one-click align and per-blank equivalent forms; calculation and extended-response questions can switch to a rubric with a running total; `validateQuestion` issues land on `Field.error` (only edited fields by default, `showAllIssues` for submit time); a review bar via `issues` / `onResolveIssue`; `extra` for consumer-private fields; the preview on the right is `QuestionCard`. No submit button. Copy comes from the locale (new `questionEditor` entries, including a message table for `validateQuestion` codes). Companion exports: `questionFormulaIssues` / `shapeIsDirty` / `switchType` / `optionCaption` / `stemBody` / `joinStemFigures`.

`QuestionCard` gains `resolveFigure`: `![](key)` references in the stem are split out before typesetting and rendered after the text (the editor preview and the question bank share one path).

Size: the `export *` upper bound of `@hulianui/ui/math` rises from 154.4KB to <measured>KB (Field, Segmented, Checkbox, Switch, Rating, NumberField, Alert, AlertDialog, and Image now live behind this entry) and the baseline is raised to <limit>KB; the package is `sideEffects:false`, so consumers importing only `Formula` or `QuestionCard` are unaffected after tree-shaking.
<!-- changelog-en:end -->
```

把 `<实测>` / `<上限>` / `<measured>` / `<limit>` 换成 Task 6 记下的数字。

- [ ] **Step 2: README 计数**

```bash
pnpm readme:sync
git diff README.md      # 期望 396 → 397 三处
```

- [ ] **Step 3: 全量门禁**

```bash
pnpm showcase:check && pnpm conventions:check && pnpm docs:check:props && pnpm docs:i18n:check && pnpm check:remote-assets
cd packages/ui && npx vitest run && cd ../..
pnpm typecheck
pnpm test:scripts
CI=1 pnpm size
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check
CI=1 pnpm --filter @hulianui/hulian-scan test 2>&1 | tail -5
```
期望：全部 rc=0；ui 单测全绿（含 `ssr-safety`、`form-control-passthrough`）。任一门禁红：按报错修，**不要**跳过。已知可能：
- `conventions:check` 报本目录用了禁用类 / `style=`：改类，不加豁免。
- `check:remote-assets` 报 showcase 有外链：本 showcase 只有 data URL，不该报；报了看是不是 `xmlns` 被当 URL，若是按脚本的判据改成不含 `http` 的写法。
- `test:scripts` 的 `gen-llms-registry-i18n.test` 挂在坑位数：中英 md 的「禁忌 / 坑」与「Pitfalls」条数要相等（各 8）。
- `pnpm typecheck` 里 `apps/www` 若因 dist 残留拿旧声明报错：`pnpm --filter @hulianui/ui build` 后重跑。

- [ ] **Step 4: Commit 并合回 master**

```bash
git add .changeset/question-editor.md README.md
git status --short      # 确认只剩 packages/ui/src/upload/upload.tsx
git commit -m "docs(ui/math): QuestionEditor changeset 与 README 计数（397）"
git checkout master && git merge --ff-only feat/math-question-phase3 && git branch -d feat/math-question-phase3
git log --oneline -10
```

不 push。

---

## 自查记录（写完计划后对照 spec §5 / §7 / §8）

- §5 接口：`value / onChange / disabled / resolveFigure / onUploadFigure / extra / issues / onResolveIssue / defaultScoreByType / templates / visualEditor / preview / className` 全部在 Task 2 类型里；额外加了 `macros`（与 MathTextarea / Formula 对齐）与 `showAllIssues`（spec 说「编辑器把问题挂到对应 Field.error，同时导出给页面在提交按钮上用」，但没说何时显示；一张空表单一打开就满屏红字不是校验，所以默认只显示改过的字段，页面提交后置 true）。`emptyQuestion` / `validateQuestion` 已在阶段 1 的 `question/` 导出，本阶段不重复。
- §5 布局：两栏用 grid（`lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`）而不是 Resizable，窄屏自然叠放；预览 = `QuestionCard showAnswer`（Task 5）。
- §5 编辑区十节：题型 Segmented 七型 + 脏数据 AlertDialog 确认（Task 5，`shapeIsDirty` / `switchType` Task 2）；题干 MathTextarea + 题图缩略图条可删 + `onUploadFigure` 才出插入（Task 4 FiguresStrip / Task 5）；选项 2–8 行 compact + 上下移 + 删除、key 按下标、答案标签同步选项文本前 20 字（Task 4 OptionsSection，`optionCaption` Task 2）；判断 Segmented（Task 5）；填空 `blankCount` 驱动 + 等价写法 + 不匹配 Alert 一键对齐（Task 4 BlanksSection）；主观题参考答案 + calculation / essay 分步给分 + 合计对比（Task 4 SubjectiveSection）；解析（Task 5）；难度 Rating / 分值 / 用时 NumberField + 切题型默认分换算（Task 5 / Task 2）；`extra`（Task 5）；复核条 Alert + 已处理（Task 5）。
- §5 校验：`validateQuestion` 就地 `Field.error`、不弹 toast（Task 5）；`$` 未闭合 / `{}` 不配对由每个 MathTextarea 就地显示 + `questionFormulaIssues` 导出给提交按钮（Task 2）；空数不匹配由 Alert + `blank_count_mismatch` 双重提示；编辑器不带提交按钮。
- §7 错误处理：空数不匹配 / 选项不足 / 答案越界 → Field.error（Task 5 errors 映射）；`resolveFigure` 未给而题干有图 → key 文本占位 + `warnOnce`（Task 4 FiguresStrip）。
- §8.1 测试：纯函数表驱动（Task 2）、jsdom 切题型重置与确认框 / 空数随题干 / issues 复核 / `onChange` 输出规范形 / `extra` 位置（Task 5）、`ssr-safety`（Task 8 Step 2）、showcase 英文词表两头（Task 8 Step 3）、`docs:check:props`（Task 7 Step 5）、`conventions` / bundle-size / `hulian-scan --check`（Task 6 / 9）。browser test 按 Global Constraints 留到阶段 5。
- §8.2 文档与注册：中英 md（Task 7）、`math.md` 更新（Task 7 Step 4）、`question-card.md` 补 `resolveFigure`（Task 7 Step 3）、六处注册（Task 6 `math/index.ts`、Task 8 showcase / manifest / registry / 英文元数据 / perf-lab）。
- **偏离 spec 且需主人知悉**：
  1. 插入图片**追加到题干末尾**而不是光标处（spec 写「光标处」）。理由：所有渲染点（QuestionCard / 消费方 QuestionStem / 导出）都把图摆在正文之后，位置无语义；追加到末尾让输入框永远不出现 `![](key)`（消费方原型也是这么做的，避免老师在题干里看到一串哈希随手删掉半张图）；光标处插入要给 MathTextarea 开 imperative handle，多一层 API 面。
  2. `QuestionCard` 加 `resolveFigure`（spec §3.3 没列）。理由：预览要带图就必须切图，与其在编辑器里拼一套预览，不如让展示件自己会切，消费方题库列表也用同一条路径。向后兼容：不给时行为逐字不变。
  3. 题干 `renderPreview` 不再单独传（spec §5 第 2 点）：输入框的值就是正文（图已被摘到缩略图条），MathTextarea 的默认 Formula 预览足够；带图的整体预览在右侧 QuestionCard。
  4. 分节子件各开文件（spec 只写一个 `question-editor.tsx`），组件目录名 `question-editor/`（阶段 1 已定的偏离，`question/` 是纯函数域）。
- 类型一致性：`SectionContext.onChange(next, field)` 在 Task 2 定义、Task 4 三个分节调用时都传了 `"options"` / `"answer"`、Task 5 传的是 `commit`（签名 `(next, field?)` 兼容）；`FiguresStripProps` 以 Props 结尾但在 `.tsx` 里定义（不在 `*.types.ts`），`docs:check:props` 不看；`QuestionEditorLocale.validation` 的键是 `QuestionValidationCode`（阶段 1 的 13 个码）与 Task 5 `L.validation[issue.code](issue.detail)` 一致；`optionCaption` 在 Task 2 定义、Task 4 两处使用、Task 6 导出；`stemBody` / `joinStemFigures` Task 2 定义、Task 5 使用、Task 6 导出；`Text tone` 只用了 `muted` / `danger` / `warning`（`TextTone` 联合里有）；`Button variant` 用了 `solid` / `outline` / `ghost` / `link`，`tone` 用了 `danger` / `neutral`（`button.tsx` 表里有）；`Alert tone="warning"` + `action` / `title`（`alert.types.ts` 有）。
- 占位扫描：无 TBD / TODO；`<实测>` / `<上限>` 是 Task 6 产出的数字，Task 9 Step 1 已注明替换；Task 2 的 `optionCaption` 断言 `"B 1/2"` 依赖 `formulaToPlain` 的真实输出，Step 5 已写明核对方式。
