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
| correctAnswer | `QuestionAnswerValue` | The correct answer in any legal shape, rendered as text through `answerText` |
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
- **Do not wrap the card in another Field**: the option group has its own `aria-label`; an outer Field would make its label the group name and read the stem twice.
- **JSX attribute strings do not process `\\`**: keep formulas with backslashes in TS string constants.

## Related

- [QuestionCard](../question-card/question-card.en.md): display only; the stem is rendered by the same `QuestionStemBlock`
- [QuestionEditor](../question-editor/question-editor.en.md): authoring
- [MathTextarea](../math-textarea/math-textarea.en.md): the `MathFieldLikeProps` contract lives in its docs
- [Formula](../math/math.en.md): the question-domain functions of `@hulianui/ui/math` (`gradeObjective` / `encodeBlanks` / `normalizeOptions`)
