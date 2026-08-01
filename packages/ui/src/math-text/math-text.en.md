---
slug: math-text
name: MathText
category: typography
group: text
tags: []
exports: [MathText, parseMath, mathToPlain]
status: enriched
---

# MathText

> Inline mathematical typesetting · dependency-free LaTeX subset for fractions, radicals, scripts, and answer blanks · searchable plain text through `mathToPlain` · RSC-safe · typography/text

## When to use

Use MathText to embed mathematical notation in question stems, answer options, explanations, or prose. Question-bank content extracted from PDF or Word commonly contains fractions such as `\frac{3}{8}`, exponents such as `x^{2}`, and answer blanks such as `____`; rendering it as plain text would expose that source notation.

Do not use MathText for complete rich-text passages—use [Markdown](../markdown/markdown.md)—or for source code—use [Code](../code/code.md). Use KaTeX when full LaTeX support is required, including matrices, integrals, summations, or alignment environments. MathText deliberately covers only common educational notation to remain dependency-free.

## Import
```ts
import { MathText, parseMath, mathToPlain } from "@hulianui/ui"
```

## Supported notation

| Notation | Meaning | Example |
|---|---|---|
| `\frac{a}{b}` | Fraction with vertically stacked numerator and denominator. | `\frac{16}{9}` |
| `\sqrt{a}` / `\sqrt[n]{a}` | Square or nth root with an overline above the radicand. | `\sqrt{a^{2}+b^{2}}` |
| `^{...}` or `^a` | Superscript. | `x^{2}`, `x^2` |
| `_{...}` or `_a` | Subscript. | `a_{1}`, `a_1` |
| `____` | Answer blank formed by **2 or more** consecutive underscores. | `Answer: ____` |
| `\overline{}` / `\widehat{}` | Overline/hat | `\overline{AB}` |
| `\text{}` / `\mathrm{}` | Font wrappers; the wrapper is removed and content retained. | `\text{Group A}` |
| `\left` / `\right` | Delimiter-sizing commands; commands are removed and delimiters retained. | `\left(a\right)` |
| Symbol commands | Converted to Unicode; see below. | `\angle` → ∠ |

### Symbol table

`\angle ∠` `\triangle △` `\parallel ∥` `\perp ⊥` `\cong ≌` `\sim ∽` `\odot ⊙` `\circ °`
`\times ×` `\div ÷` `\cdot ·` `\pm ±` `\neq ≠` `\leq(slant) ≤` `\geq(slant) ≥` `\approx ≈`
See `math-text.symbols.ts` for Greek letters, set operators, `\therefore ∴`, `\because ∵`, `\ldots …`, and other symbols.

The supported set was selected from command frequencies in 22,000 characters of real middle-school mathematics questions recognized with PaddleOCR-VL, rather than chosen arbitrarily. The most frequent commands were `\angle` 140 · `\frac` 99 · `\circ` 80 · `\triangle` 60 · `\sqrt` 55 · `\times` 51.

Unsupported content is emitted literally. **Unknown or incomplete notation is never silently discarded**: `\oiint` remains `\oiint`, and an incomplete `\frac{3}` is preserved as written.

## Examples

```tsx
<MathText>{"Convert \\frac{3}{8} to ____ as a decimal."}</MathText>
```

Options side by side:

```tsx
<MathText>{"A.\\frac{1}{9}　B.\\frac{5}{9}　C.\\frac{16}{9}　D.\\frac{80}{9}"}</MathText>
```

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | Text containing mathematical notation |
| `blankWidth` | `number` | `2.5` | Minimum width of fill-in-the-blank slot (em) |
| `scriptScale` | `number` | `0.75` | Relative font size for superscript and subscript |
| `className` | `string` | — | — |

## Pure helpers

- `parseMath(src)` → `MathNode[]` returns parsed nodes for custom rendering or structural validation.
- `mathToPlain(src)` → `string` converts notation to plain text (`\frac{3}{8}` → `3/8`).

**Always use `mathToPlain` for search indexing, exports, and plain-text comparisons.** Do not index the marked-up source directly; a user searching for "3/8" should find `\frac{3}{8}`.

## Usage guidelines

- **Do not infer fractions from `a/b`.** Slashes also appear in units such as `km/h` and `USD/kg`. Use `\frac{}{}` upstream to state explicitly that the content is a fraction.
- **One `_` starts a subscript; two or more create an answer blank.** `a_1` is a subscript, so use at least `__` for a blank.
- **Fractions are not built with `<sup>` and `<sub>`.** Their vertical `inline-flex` layout and `border-t` keep surrounding line height and fraction bars aligned; preserve this approach when changing styles.
- **Whitespace after a command name terminates the command.** In `\angle ABC`, that space is consumed so notation such as `\angle` and `\triangle` does not introduce an extra visual gap.
- **Do not wrap `30^{\circ}` in another `<sup>`.** `\circ` already behaves as a superscript character and would be raised twice.
- **Matrices and equation systems degrade lossily.** `\begin{array}…\end{array}` is flattened to one line and `\\` becomes a semicolon. Use KaTeX for faithful layout.
- The component returns a `<span>` and is safe inside `<p>`. Answer blanks use `aria-label="Answer blank"`, so screen readers do not announce a sequence of underscores.

## Related

- [QuestionCard](../question-card/question-card.md) — question cards whose stems and options use MathText
- [Markdown](../markdown/markdown.md) — complete rich-text passages
- [Prose](../prose/prose.md) — long-form typography container
