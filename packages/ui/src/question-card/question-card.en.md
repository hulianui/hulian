---
slug: question-card
name: QuestionCard
category: data-display
group: collection
tags: []
exports: [QuestionCard]
status: enriched
---

# QuestionCard

> Question card · textbook-style question presentation with number, type, level, prompt, choices, subparts, figure, chapter, and source; MathText formatting and a visible review-warning edge · data-display/collection

## When to use

Use QuestionCard anywhere one complete exercise must be reviewed: question banks, paper previews, error books, or grading history. It keeps nine kinds of context together and renders mathematical notation correctly.

Use [Choicebox](../choicebox/choicebox.md) for selectable card options, or [MathText](../math-text/math-text.md) for standalone mathematical copy.

## Import
```ts
import { QuestionCard } from "@hulianui/ui"
```

## Usage

```tsx
<QuestionCard
  number="3"
  kind="choice"
  difficulty="Group A"
  stem="As shown, figures 1 and 2 use identical squares. If figure 1 has side length 4, what is the area of figure 2?"
  options={[
    { label: "A", text: "\\frac{1}{9}" },
    { label: "B", text: "\\frac{5}{9}" },
    { label: "C", text: "\\frac{16}{9}" },
    { label: "D", text: "\\frac{80}{9}" },
  ]}
  figure={{ src: "/figures/q3.png" }}
  chapter="Chapter 1 · Rational numbers"
  topics={["Rational numbers", "Fractions"]}
  source="Skills Assessment · Grade 7 · Page 3 · Question 3"
/>
```

An uncertain automatically extracted item:

```tsx
<QuestionCard
  stem="Which of the following expressions is correct?"
  issues={[{ label: "Fewer than four choices" }, { label: "Non-consecutive question number" }]}
  actions={<Button size="sm" variant="ghost">Review</Button>}
/>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `stem` | `string` | — | Prompt using MathText notation. |
| `number` | `ReactNode` | — | Original book question number. |
| `kind` | `"choice" \| "fill" \| "solution" \| "judge"` | — | Question type controlling built-in label and tone. |
| `kindLabel` | `ReactNode` | — | Overrides the built-in Chinese type label. |
| `difficulty` | `ReactNode` | — | Level label, such as Group A, Foundation, or Advanced. |
| `options` | `{ label, text }[]` | — | Choices whose text supports MathText notation. |
| `parts` | `string[]` | — | Subquestions such as (1), (2), and (3). |
| `figure` | `{ src, alt? }` | — | Supporting image. |
| `chapter` / `source` | `ReactNode` | — | Chapter and provenance shown in the footer. |
| `topics` | `string[]` | — | Topic names rendered as chips. |
| `issues` | `{ label, tone? }[]` | — | Quality flags; non-empty values activate the warning edge. |
| `actions` | `ReactNode` | — | Upper-right actions. |
| `compact` | `boolean` | `false` | Hides subparts and footer for long lists. |

Built-in `kind` labels are `"\u9009\u62e9\u9898"` (“Multiple choice”), `"\u586b\u7a7a\u9898"` (“Fill in the blank”), `"\u89e3\u7b54\u9898"` (“Written solution”), and `"\u5224\u65ad\u9898"` (“True or false”). The figure alt falls back to `"\u9898\u76ee\u9644\u56fe"` (“Question figure”).

## Pitfalls

- `stem` and `options[].text` must remain MathText notation. Use `"\\frac{3}{8}"`, not plain `"3/8"`, for a typeset fraction.
- `issues` communicates uncertain machine extraction and is not decoration. Always pass known issues so untrusted items remain visibly distinct.
- The warning uses a left edge instead of tinting the whole card, preserving prompt contrast.
- `compact` never truncates the prompt or choices; it only hides subparts and footer context.

## Related

- [MathText](../math-text/math-text.md) — mathematical layout inside prompts and choices
- [Card](../card/card.md) — outer shell
- [Choicebox](../choicebox/choicebox.md) — selectable card options
