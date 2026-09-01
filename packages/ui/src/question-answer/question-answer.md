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
import { MathField } from "@hulianui/ui/math-field";   // 可选 peer mathlive，见 ../math-field/math-field.md

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
| correctAnswer | `QuestionAnswerValue` | 正确答案（任意合法形状），用 `answerText` 渲染成文字 |
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
- **别在 Field 里再套一层**：选项组自带 `aria-label`，外面再包 Field 会让 Field 标签成为整个组的名字，题干与标签重复念。
- **JSX 属性字符串不处理 `\\`**：题干 / 选项里含反斜杠的公式写成 TS 字符串常量再传。

## 相关

- [QuestionCard](../question-card/question-card.md) —— 只展示；题干渲染与本件同一个 `QuestionStemBlock`
- [QuestionEditor](../question-editor/question-editor.md) —— 出题
- [MathTextarea](../math-textarea/math-textarea.md) —— `MathFieldLikeProps` 契约在它的文档里
- [MathField](../math-field/math-field.md) —— `mathField` 的现成实现（可选 peer mathlive）与 `createCasComparator`
- [Formula](../math/math.md) —— `@hulianui/ui/math` 的题目域纯函数（`gradeObjective` / `encodeBlanks` / `normalizeOptions`）
