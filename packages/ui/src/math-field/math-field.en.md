---
slug: math-field
name: MathField
category: forms
group: advanced
tags: []
exports: [MathField, createCasComparator, stripMathDelimiters, MATHLIVE_INSTALL_HINT, COMPUTE_ENGINE_INSTALL_HINT, MathLiveUnavailableError, ComputeEngineUnavailableError, MATH_FIELD_LOCALE_ZH, MATH_FIELD_LOCALE_EN]
status: enriched
---

# MathField

> Visual formula keyboard powered by MathLive: type LaTeX the way you would on a calculator (the value carries no $). It satisfies MathFieldLikeProps, so it plugs straight into the visualEditor of MathTextarea / QuestionEditor and the mathField of QuestionAnswer. The server and the first frame render a skeleton, mathlive loads dynamically on the client, and a missing package shows an install hint instead of a blank page. Lives on the standalone @hulianui/ui/math-field subpath so the main package and @hulianui/ui/math contain zero MathLive. Also ships createCasComparator for tier-3 equivalence grading. forms/advanced

## When to use

A student has to type $\frac{5}{6}$ into a blank, or a teacher authoring questions does not know how to write `\sqrt{}`: the user sees a calculator-like box, what they type is already LaTeX, and the `value` you receive goes straight into [Formula](../math/math.md) for typesetting or into `gradeObjective` for grading. To insert a formula into a run of text, use [MathTextarea](../math-textarea/math-textarea.md) and pass this component as its `visualEditor`; it wraps the result in `$…$` and inserts at the caret. MathField itself never emits `$`.

For display only, use Formula.

## Installation

`mathlive` is an **optional peer**; the component only works once it is installed:

```bash
pnpm add mathlive
```

To use `createCasComparator`, also install `@cortex-js/compute-engine` (the dependency mathlive pins; it is usually already in node_modules, and installing it explicitly keeps the bundler's resolution independent of hoisting):

```bash
pnpm add mathlive @cortex-js/compute-engine
```

Import the fonts once (the root layout in Next, main.tsx in Vite). Missing fonts fall back to system fonts; nothing goes blank:

```ts
import "mathlive/fonts.css";
```

Peer floors are `mathlive >=0.110.0` and `@cortex-js/compute-engine >=0.58.0`: only the versions we tested. Between MathLive 0.9x and 0.10x the semantics of `menuItems` and the virtual keyboard policy changed, so a lower floor would promise untested combinations.

## Import

```ts
import { MathField, createCasComparator } from "@hulianui/ui/math-field"
```

It lives on its own subpath rather than in `@hulianui/ui/math`: MathLive plus the Compute Engine is a lazy chunk of several hundred KB, and only pages that really need visual input or CAS grading should pay for it. `@hulianui/ui/math` itself contains zero MathLive.

## Examples

```tsx
const [latex, setLatex] = useState("\\frac{a}{b}");

<MathField value={latex} onChange={setLatex} aria-label="Formula" />
```

Inject into MathTextarea (a Visual input tab appears; confirming inserts `$…$` at the caret):

```tsx
<MathTextarea multiline value={stem} onChange={setStem} visualEditor={MathField} />
<QuestionEditor value={question} onChange={setQuestion} visualEditor={MathField} />
```

Inject into the blanks of QuestionAnswer and wire up three-tier grading:

```tsx
const equivalent = await createCasComparator();   // once, when the page mounts

<QuestionAnswer
  question={q}
  value={v}
  onChange={setV}
  blankInput="math"
  mathField={MathField}
  onSubmit={(answer) => gradeObjective(q, answer, { normalize: true, equivalent })}
/>
```

## Props

`MathFieldProps` extends [`MathFieldLikeProps`](../math-textarea/math-textarea.md); the first six rows are that contract.

| Name | Type | Default | Description |
|---|---|---|---|
| value | `string` | - | LaTeX without `$` |
| onChange | `(latex: string) => void` | - | Called on every keystroke |
| onSubmit | `(latex: string) => void` | - | Enter. MathTextarea wires it to "insert at the caret" |
| disabled | `boolean` | `false` | Locked (submitted / submitting) |
| aria-label | `string` | - | Accessible name, forwarded to `<math-field>` |
| className | `string` | - | Outer container |
| virtualKeyboard | `"auto" \| "manual" \| "off"` | `"auto"` | Virtual keyboard policy: auto opens on focus on touch devices, manual opens only from the toggle, off attaches no keyboard (policy manual with the toggle hidden) |
| keyboardLayouts | `readonly unknown[]` | - | Forwarded to `window.mathVirtualKeyboard.layouts`. The keyboard is a page-level singleton; the last mounted field wins |
| readOnly | `boolean` | `false` | Read-only: selectable and copyable, not editable |
| placeholder | `string` | - | Placeholder while empty |

## Events

| Event | Argument | When |
|---|---|---|
| onChange | `latex: string` | Every keystroke (MathLive's `input` event) |
| onSubmit | `latex: string` | Enter (Shift+Enter does not trigger it) |

## createCasComparator

```ts
function createCasComparator(): Promise<(a: string, b: string) => boolean>
```

Uses the Compute Engine to decide whether two LaTeX strings are **mathematically equivalent**: `\frac{1}{2}` vs `0.5` and `2x+1` vs `1+2x` are both true. The result is a synchronous comparator that feeds the `equivalent` option of `gradeObjective` (tier 3, consulted only when the literal and normalized tiers both disagree). `$…$` / `$$…$$` / `\(…\)` are stripped from both sides first (`stripMathDelimiters`); a parse failure, an empty string, or any exception yields `false`, because grading should rather miss a match than invent one.

It is async: the Compute Engine is not bundled with mathlive, so the first call runs `import()` and later calls reuse the same engine instance. Without `@cortex-js/compute-engine` it throws `ComputeEngineUnavailableError` with the install command in the message.

**The server is the grading source of truth** (see the `gradeObjective` section in the [Formula](../math/math.md) docs): this comparator gives instant feedback and authoring self-checks; official scores come from the server.

## SSR and loading

The component has three states, exposed as `data-status` on `data-slot="math-field"`: `loading` / `ready` / `unavailable`.

- **loading**: the server and the first client frame both render only a `Skeleton` of the same size, so the HTML matches and there is no hydration mismatch.
- **ready**: once `import("mathlive")` in `useEffect` succeeds, the real element is created with `document.createElement("math-field")` and kept in sync with the controlled value.
- **unavailable**: mathlive is missing, or the resolver picked MathLive's SSR build (no `MathfieldElement`). An `Alert` with the install command is rendered, **nothing throws**, and a static export never fails because of it. `warnOnce` fires once in development.

Next App Router works out of the box; the component is already a client component and needs no `next/dynamic`. In Vite you may add `optimizeDeps.include: ["mathlive", "@cortex-js/compute-engine"]` to avoid a mid-session re-optimization the first time it opens.

## Virtual keyboard

MathLive's virtual keyboard is a **page-level singleton** (`window.mathVirtualKeyboard`); every MathField on the page shares it, and `keyboardLayouts`, when given, is written into that singleton, so the last mounted field wins. Desktop authoring usually sets `virtualKeyboard="off"`; touch-screen answering keeps the default `auto`.

## Theming

MathLive reads its colors from CSS variables; the component pins them to Hulian tokens so light and dark follow the theme:

| MathLive variable | Hulian token |
|---|---|
| `--caret-color` | `--color-primary` |
| `--selection-background-color` | `--color-primary` at 18% |
| `--selection-color` / `--latex-color` / `--highlight-text` | `--color-foreground` |
| `--contains-highlight-background-color` | `--color-primary` at 10% |
| `--placeholder-color` / `--smart-fence-color` | `--color-muted-foreground` |
| `--correct-color` / `--incorrect-color` | `--color-success` / `--color-danger` |

The frame shares the border and focus ring of [Input](../input/input.md); MathLive's built-in context menu is disabled (`menuItems = []`).

## Localization

The only copy is the loading placeholder's accessible name and the missing-dependency hint, read from `components.mathField` of `ConfigProvider`; the source of truth is `math-field.locale.ts` (`MATH_FIELD_LOCALE_ZH` / `MATH_FIELD_LOCALE_EN`).

## Pitfalls

- **The value is LaTeX without `$`.** To insert it into a stem, go through the `visualEditor` of MathTextarea (which adds the `$`); concatenating `value` into a stem yourself yields bare notation without delimiters.
- **Inject the component, not an element**: `mathField={MathField}` and `visualEditor={MathField}`, never `<MathField />`.
- **In jsdom, mathlive resolves to its SSR build** and the component shows the install hint: in consumer unit tests, `vi.mock("mathlive")` with a fake element that implements only `getValue` / `setValue`, or assert the first-frame skeleton only.
- **MathLive's `setValue` requires a mounted element**; the component appends first and writes afterwards. Do the same when you drive `<math-field>` yourself.

## Related

- [MathTextarea](../math-textarea/math-textarea.md): the `MathFieldLikeProps` contract and the `visualEditor` injection point
- [QuestionAnswer](../question-answer/question-answer.md): `blankInput="math"` plus `mathField`
- [QuestionEditor](../question-editor/question-editor.md): forwards `visualEditor` to every MathTextarea
- [Formula](../math/math.md): typesetting and the question-domain functions of `@hulianui/ui/math` (`gradeObjective`)
- [Consuming guide for the math components](https://github.com/hulianui/hulian/blob/master/docs/consuming-math.md): what each entry costs, SSR, grading source of truth
