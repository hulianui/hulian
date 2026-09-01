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

只展示不编辑用 [QuestionCard](../question-card/question-card.md)；学生作答用 [QuestionAnswer](../question-answer/question-answer.md)；单个「可含公式的输入框」用 [MathTextarea](../math-textarea/math-textarea.md)（本件内部就是它）。

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
