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

Display only: [QuestionCard](../question-card/question-card.en.md). Student answering: [QuestionAnswer](../question-answer/question-answer.en.md). A single formula-capable input: [MathTextarea](../math-textarea/math-textarea.en.md) (what this component is built from).

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
