---
slug: math-textarea
name: MathTextarea
category: forms
group: advanced
tags: []
exports: [MathTextarea, FORMULA_TEMPLATE_GROUPS, applyFormulaTemplate, wrapSelectionInMath, isInsideMath, mathSpans, validateFormulaSyntax, textPosition, katexErrorAt, MATH_TEXTAREA_LOCALE_ZH, MATH_TEXTAREA_LOCALE_EN]
status: enriched
---

# MathTextarea

> Formula input for question authoring: templates insert at the caret, one click wraps the selection in $…$, pre-submit checks report line and column, KaTeX parse errors are located, and the live preview uses the same typesetting as the display side. An injectable visual formula editor (MathField) adds a second tab. The output stays a plain string containing $…$. Lives in @hulianui/ui/math so the main package never pays for KaTeX. forms/advanced

## When to use

Use it for any text that may contain formulas: stems, options, per-blank answers, reference answers, explanations. It replaces a bare Textarea with a "formulas allowed" note and solves three things: authors do not know formulas must be written as `$…$` (the two toolbar buttons are that explanation), they cannot write LaTeX (templates insert at the caret; selecting `x` and clicking Fraction yields `\frac{x}{}` with the caret in the denominator), and they cannot see the result before submitting (the preview is the display side's [Formula](../math/math.en.md), so a correct preview means correct output).

For display only use [Formula](../math/math.en.md); for structured editing of a whole question use QuestionEditor (phase 3, built on this component).

## Import

```ts
import { MathTextarea } from "@hulianui/ui/math"
```

It lives in `@hulianui/ui/math` rather than the main package: the preview is Formula, which brings KaTeX, and consumers who never typeset math should not pay those 86KB gzip.

## Examples

```tsx
const [stem, setStem] = useState("In $\\triangle ABC$ with $\\angle C=90^{\\circ}$, find $\\sin A$.");

<MathTextarea multiline aria-label="Stem" placeholder="Enter the stem" value={stem} onChange={setStem} />
```

Single-line compact form for options and per-blank answers:

```tsx
<MathTextarea compact aria-label="Option A" value={optionA} onChange={setOptionA} />
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | - | Controlled value: a plain string containing `$…$`, the same storage format as stems, options, and explanations |
| onChange | `(next: string) => void` | - | Value change (typing, template insertion, wrapping, visual insertion all go through it) |
| multiline | `boolean` | `false` | Multi-line (stem / explanation / reference answer) renders a Textarea; single-line (options / per-blank answers) renders an Input |
| rows | `number` | `3` | Initial rows in multi-line mode; grows with content |
| placeholder | `string` | - | Placeholder |
| disabled | `boolean` | `false` | Disables input and toolbar |
| compact | `boolean` | `false` | Compact form: one-line preview with no helper text. For options and per-blank answers |
| templates | `readonly FormulaTemplateGroup[]` | `FORMULA_TEMPLATE_GROUPS` | Replaces the default template groups. Custom templates provide `label` and groups provide `title`; built-in names come from the locale |
| renderPreview | `(value: string) => ReactNode` | - | Custom preview; defaults to `<Formula>`. QuestionEditor passes a figure-aware renderer for stems |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | Injects a visual formula editor; **the Visual input tab appears only when provided**. [MathField](../math-field/math-field.en.md) from `@hulianui/ui/math-field` satisfies the contract |
| macros | `Record<string, string>` | - | Macro table passed to the default preview and the KaTeX probe so custom macros are not reported as undefined commands |
| aria-label | `string` | - | Accessible name. Required for single-line controls: it is how option A and option B are told apart |
| className | `string` | - | Applied to the root |

### MathFieldLikeProps (the `visualEditor` contract)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | - | LaTeX without `$` |
| onChange | `(latex: string) => void` | - | Called while editing |
| onSubmit | `(latex: string) => void` | - | Enter / confirm; MathTextarea routes it to the same "Insert at caret" path |
| disabled | `boolean` | - | Locked (QuestionAnswer passes it while submitted or pending; MathTextarea does not) |
| aria-label | `string` | - | Provided by MathTextarea (the tab name) |
| className | `string` | - | Style passthrough |

### FormulaTemplate / FormulaTemplateGroup

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | `string` | - | Stable id. Built-in template and group names come from the locale's `templates[id]` / `templateGroups[id]` |
| latex | `string` | - | Snippet to insert. **The first empty `{}` / `[]` is the caret slot**; with a selection, the selected text fills the first slot and the caret moves to the next |
| sample | `string` | - | Rendered example on the panel, wrapped in `$` and fed to Formula |
| label | `string` | - | Display name; provide it for custom templates, omit for built-ins (locale) |
| title | `string` | - | Group heading; provide it for custom groups |
| items | `readonly FormulaTemplate[]` | - | Templates in the group |

## Events

| Name | Arguments | Description |
|------|-----------|-------------|
| onChange | `(next: string)` | Value change. Insertion actions restore the caret to the insertion point on the next frame (a controlled re-render would otherwise push it to the end, so a second template click would land at the end of the text) |

## Localization

All copy comes from the locale's `components.mathTextarea` (`MathTextareaLocale`, source of truth in `math-textarea.locale.ts`; `zhCN` and `enUS` are wired). Built-in template and group names are in the same table (`templates` / `templateGroups`, keyed by the `id`s in `FORMULA_TEMPLATE_GROUPS`, enforced by the type).

## Companion pure functions

All exported from `@hulianui/ui/math`; those that do not import KaTeX can run in server-side scripts:

- `applyFormulaTemplate({ text, selectionStart, selectionEnd, latex, wrapInMath })` → `{ text, caret }`: insert a template at the selection and compute the caret.
- `wrapSelectionInMath({ text, selectionStart, selectionEnd, display })` → `{ text, caret }`: wrap the selection in `$…$` / `$$…$$`.
- `isInsideMath(text, caret)` → `boolean`: whether the caret is inside a formula (decides whether an inserted snippet brings its own `$`).
- `mathSpans(text)` → `MathSpan[]`: position of every closed `$…$` / `$$…$$` span (`start` / `end` / `contentStart`).
- `validateFormulaSyntax(text)` → `FormulaSyntaxIssue | null`: checks only unclosed `$` and unbalanced `{}`; returns `code` + `index` + `line` / `column`, **no copy**.
- `textPosition(text, index)` → `{ line, column }`: index to 1-based line and column.
- `katexErrorAt(text, { macros })` → `KatexParseIssue | null`: the first position KaTeX cannot parse, with the raw message. Imports KaTeX.

## Pitfalls

- **Do not hide it with `display:none` and rely on `required`**: it is not a native form control. Empty-value validation belongs to the surrounding Field or form (QuestionEditor uses `validateQuestion`).
- **Red source in the preview is not a broken component**: KaTeX cannot parse that formula (`throwOnError:false`); the line below says "Near character N: <reason>". Fix the command spelling.
- **`\(…\)` / `\[…\]` are not syntax-checked or located**: the editor always emits the `$` family. Formula still renders those forms; only the two probes here ignore them.
- **In-formula blanks `___` are not reported as parse errors**: the probe applies the same `blanksToLatex` replacement as Formula. Error positions after a blank may be off by a few characters; this affects the hint, not the verdict.
- **Custom templates must provide `label`**: otherwise the `id` is shown. Built-ins do not need it (locale).
- **`visualEditor` takes a component, not an element**: pass `MathField` itself, not `<MathField />`.
- **JSX attribute strings do not process `\\`**: `value="$\\frac{1}{2}$"` passes two backslashes. Write literals with backslashes as `value={"$\\frac{1}{2}$"}`.

## Related

- [Formula](../math/math.en.md): the same typesetting component used for preview and display; the other pure functions in `@hulianui/ui/math`
- [QuestionCard](../question-card/question-card.en.md): the most common `renderPreview` target
- [Textarea](../textarea/textarea.en.md) / [Input](../input/input.en.md): the underlying inputs
- [MathField](../math-field/math-field.en.md): the ready-made `visualEditor` implementation (optional peer mathlive)
