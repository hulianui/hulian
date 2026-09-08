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

### 题图条

题干输入框底下那条缩略图条管四件事，全部就地写回 `stem`（题图不是 `Question` 上的字段，是题干里的 `![](key)` 引用）：

- **插入**：给了 `onUploadFigure` 才出现「插入图片」，返回的 key 以 `![](key)` 追加到题干末尾。
- **调序**：每张图底下一对「前移 / 后移」。顺序就是它们写在题干末尾的顺序，也就是组卷预览、学生端与 docx 导出里的显示顺序——调序是在改题干，所以照常经 `onChange` 回传整份 `Question`，不另开 `onSortFigures`。只有一张图时不出这对按钮。
- **看大图**：点缩略图用 [ImageViewer](../image-viewer/image-viewer.md) 打开（可缩放 / 左右翻）。80px 够认出是哪张，认不出图里的字母标注。
- **失败重试**：上传失败那一行留着原来的 `File`，点重试直接再传一遍，不必回文件对话框里重新找。失败原因就是 `onUploadFigure` 抛出来的 `Error.message`（类型 / 大小 / 张数上限都在消费方那一侧拦）。

题干输入框底下的预览走的是展示端那条路（`QuestionCard` 内部同一块），所以 `figureFilter` 划出去、留在正文里的行内公式图在这里是渲染成图的，不是一串 `![…](…)` 源码。

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `Question` | - | 受控值：规范形（`@hulianui/ui/math` 的 `Question`）。填空题内部**永远是数组**（单空也是一项数组），出口用 `toWireAnswer` 压平 |
| onChange | `(next: Question) => void` | - | 每次编辑回传整份规范形 |
| disabled | `boolean` | `false` | 只读 |
| resolveFigure | `(key: string) => string` | - | 题干里 `![](key)` → 可显示 URL。缩略图条、看大图、题干预览都靠它；题干有图而没给时缩略图只显示 key 并有开发期告警 |
| onUploadFigure | `(file: File) => Promise<string>` | - | 上传一张题图，返回 storage key。**给了才出「插入图片」**；成功后以 `![](key)` 写回题干末尾，失败在缩略图条上显示原因 |
| figureFilter | `(key: string) => boolean` | - | 哪些 key 算「题图」（进缩略图条、可增删、写回题干末尾）。不给 = 全部。不匹配的引用**原样留在题干正文里**，编辑器不挪它、也不动它的 alt |
| extra | `ReactNode` | - | 消费方私有字段，渲染在题型之后、题干之前 |
| issues | `{ label, tone? }[]` | - | 复核条：顶部列出，每条一个「已处理」 |
| onResolveIssue | `(label: string) => void` | - | 点「已处理」回调；不给则不渲染按钮 |
| defaultScoreByType | `Partial<Record<QuestionType, number>>` | - | 覆盖按题型的默认分。切题型时 `score` 仍等于旧题型默认分才自动换 |
| templates | `readonly FormulaTemplateGroup[]` | - | 透传给每个 MathTextarea |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | 透传给每个 MathTextarea（MathField 满足此契约） |
| macros | `Record<string, string>` | - | 透传给每个 MathTextarea 与题干预览的 KaTeX 宏表（右侧 QuestionCard 预览不吃宏表） |
| hiddenFields | `readonly ("difficulty" \| "score" \| "estimatedMinutes")[]` | - | 不渲染度量行里的哪些字段。分值属于「卷 × 题」的产品线用它关掉分值框；关掉的字段编辑器一个字都不写（切题型也不再换算 `score`），值原样留在 `Question` 里。三个全关时整行不渲染 |
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
- `stemBody(stem, accept?)` / `joinStemFigures(body, keys)`：题干正文与题图块的拆合，判据与编辑器一致。`accept` 就是 `figureFilter`，不给 = 全部当题图。

## 禁忌 / 坑

- **`value` 必须是规范形**。`answer: "A,C"`、`options: ["A. 甲"]`、`answer: "true"` 这些历史变体先过 `fromWire`；直接喂进来会显示成「没选答案」，而且 `validateQuestion` 会报 `answer_out_of_range`。
- **填空题的 `answer` 出口要压平**。编辑器内部单空也是 `["90"]`；消费方后端若单空只收字符串，提交前 `toWireAnswer(question)`。
- **切题型会清空选项与答案**（有内容时先确认）。这是刻意的：保留旧形状会造出「判断题带选项」这类后端 422 的值。
- **题图在题干里，不在别的字段**。输入框看不到 `![](key)`，但 `value.stem` 里有；图挂在别处的话组卷预览、学生端、导出一张也拿不到。`resolveFigure` 不给时预览把图摘掉、缩略图只剩 key。
- **不是每个 `![](…)` 都该当题图，行内公式图要用 `figureFilter` 划出去**。默认（不给 `figureFilter`）题干里所有图片引用都算题图，会被整批搬到题干末尾——对 Word 导入线切出的行内公式图这是错的：`不等式![7x+5<5x+1](import/formula/….png)的解集为______．` 编辑一轮就变成「不等式的解集为______．」加末尾一张图，句子读不通。按 key 前缀划开：

  ```tsx
  <QuestionEditor figureFilter={(key) => !key.startsWith("import/formula/")} … />
  ```

  划出去的引用原样留在题干正文里（输入框里能看到那段 `![…](…)`），缩略图条不收它、删不掉它、位置和 alt 都不动。
- **题干预览要图，就得给 `resolveFigure`**。给了它，输入框底下那块预览走展示端同一条渲染路径（图画出来、alt 用引用自带的那段）；不给则退回默认的 `<Formula>` 预览，它不认 markdown 图片语法，题干里的 `![](key)` 会原样印成源码。正文里既没公式也没图时预览整块不显示——那时它与输入框逐字相同。
- **上传只在给了 `onUploadFigure` 时出现**。文件类型 / 大小限制由消费方在回调里拦，拦住就 `throw new Error("单张不超过 5MB")`，错误信息原样显示在缩略图条上。
- **校验默认只显示改过的字段**。想在提交时全部飘红请置 `showAllIssues`，别在外面再画一遍错误。
- **分值 / 配时不属于你的题模型时用 `hiddenFields` 关掉，别只把默认分压成 0**（#358）。`defaultScoreByType` 全表填 0 只是不再凭空造分，输入框还在，老师照样填得进去——填了要么与产品口径冲突（题库里出现「这道题 3 分」），要么被提交时静默丢掉。关掉之后编辑器对该字段一个字都不写：切题型也不再按默认分表换算 `score`（不显示却照写就是静默改数据）。值本身照旧原样进出，`validateQuestion` 也照旧——被隐藏字段的校验问题只是没有地方显示。只有度量行那三个给关，题干 / 选项 / 答案 / 解析不在此列。
- **没有提交按钮**。提交、私有字段必填（如学科）、`estimatedMinutes` 的上限，都是页面的事。
- **JSX 属性字符串不处理 `\\`**：初值里含反斜杠的公式写成 `stem: "$\\frac{1}{2}$"`（TS 字符串），不要写在 JSX 属性里。

## 相关

- [QuestionCard](../question-card/question-card.md) —— 预览用的就是它（`showAnswer` + `resolveFigure`）
- [MathTextarea](../math-textarea/math-textarea.md) —— 每个可含公式的输入框
- [Formula](../math/math.md) —— `@hulianui/ui/math` 的题目域纯函数（`validateQuestion` / `defaultShape` / `toWireAnswer` / `fromWire` / `splitStemFigures`）
- [Field](../field/field.md) —— 错误挂载方式
