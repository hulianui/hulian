---
slug: math
name: Formula
category: typography
group: text
tags: []
exports: [Formula, formulaToPlain, splitMathSegments]
status: enriched
---

# Formula

> KaTeX-powered mathematical typesetting · shipped on the separate `@hulianui/ui/math` subpath so the main bundle pays nothing · real two-dimensional layout for piecewise functions, matrices, and large delimiters · understands `$…$` delimiters so formula boundaries stay in the data · RSC-safe · typography/text

## When to use

Use Formula when the notation has **two-dimensional structure**: piecewise functions via `\begin{cases}`, matrices, alignment environments, `\left…\right` delimiters that grow with their content, and summations or integrals whose limits sit directly above and below the operator.

For prose that merely mixes in a few fractions, radicals, and scripts, use [MathText](../math-text/math-text.md) — it is dependency-free.

### Choosing between MathText and Formula

| | MathText | Formula |
|---|---|---|
| Package | `@hulianui/ui` | `@hulianui/ui/math` |
| Dependencies | None | KaTeX: 86KB gzip of JavaScript (measured by `pnpm size`), plus a stylesheet and fonts loaded on demand |
| Coverage | High-frequency one-dimensional notation in educational content (fractions, radicals, scripts, vectors, symbol table) | Full LaTeX |
| `\begin{cases}` | Flattened to one line, `\\` becomes a semicolon | Real layout |
| `\left…\right` | Command dropped, fixed-height bracket kept | Height follows content |
| Rendering cost | One string parse | KaTeX layout, an order of magnitude more expensive |

**The criterion is whether the notation is two-dimensional, not which component is more capable.** Rendering a screenful of plain inline fractions through Formula means paying both the layout cost and that 86KB for capability you never use. Conversely, handing a piecewise function to MathText produces a flattened `x, x<0; -x, x≤0` — and when the question is precisely about the piecewise definition, an unreadable stem makes the question worthless.

The two components mix freely on one page: render stems with MathText and switch to Formula for the question that carries a piecewise function.

## Import

```ts
import { Formula, formulaToPlain, splitMathSegments } from "@hulianui/ui/math"
```

**The subpath is deliberate.** KaTeX is bundled only into pages that import this path; consumers of the `@hulianui/ui` main entry pay nothing. Do not add Formula to the main barrel.

Styling needs no action from you — the component imports `katex/dist/katex.min.css` itself and your bundler picks up the fonts from there. There is no CSS to import in your app entry and no CDN `<link>` to add.

## Examples

```tsx
// Mixed mode (default): only content inside delimiters is typeset
<Formula>{"Given $f(x)=x^{2}$, find $f(1)$."}</Formula>

// Piecewise function
<Formula>{"$$f(x)=\\begin{cases} -x^{2}, & x<0 \\\\ e^{x}, & x \\geq 0 \\end{cases}$$"}</Formula>

// A single hard-coded formula, without the ceremony of wrapping it in $
<Formula mode="math" display>{"\\int_{0}^{1} x^{2}\\,dx = \\frac{1}{3}"}</Formula>
```

## Delimiters

With `mode="mixed"` (the default) four forms are recognised, and the delimiters themselves never reach the output:

| Form | Layout |
|---|---|
| `$…$` | Inline |
| `\(…\)` | Inline |
| `$$…$$` | Block (own line, centred) |
| `\[…\]` | Block |

Three boundary rules:

- **`\$` is a literal dollar sign.** It never pairs up and renders as `$`.
- **An opening delimiter with no closing match is treated as literal text.** `Priced at $100` is emitted verbatim; the rest of the sentence is never swallowed into a formula.
- **Inline delimiters do not span a blank line.** This is TeX's own rule (a blank line inside `$` is a `Missing $ inserted` error), and it also keeps text such as `sells for $100\n\ncosts $80` from pairing across paragraphs. Block `$$` and `\[` are exempt.

### Why the rendering layer must understand `$`

When prose and formulas are interleaved, *which span is a formula* is information the upstream data **already has**. If the rendering layer refuses to read it, the upstream is forced to strip `$` at ingest time to accommodate it — and stripping `$` is lossy:

- `$\{a_n\}$` becomes `{a_n}`, after which nothing distinguishes a set from a LaTeX group;
- fed to an LLM, formulas and prose fuse into one blob and the model can only guess where the expression starts;
- for Word export (LaTeX to MathML to OMML), a formula span that cannot be cut out cannot be converted at all.

Boundaries are information that must be carried explicitly. The rendering layer should not guess at them, and it certainly should not push the upstream into deleting them. **If your source has `$`, keep it.**

MathText understands the same delimiters through its `delimiters` prop, which is off by default because its existing consumers may have currency amounts in their prose.

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | LaTeX source, or prose containing LaTeX spans |
| `mode` | `"mixed" \| "math"` | `"mixed"` | `mixed` reads delimiters and typesets only what is inside them; `math` treats the whole string as LaTeX |
| `display` | `boolean` | `false` | Block layout. **Only takes effect when `mode="math"`** — under `mixed` each span's own delimiters decide |
| `macros` | `Record<string, string>` | — | Custom macros, passed through to KaTeX |
| `className` | `string` | — | — |

## Pure helpers

- `splitMathSegments(src)` → `MathSegment[]`, splits prose into `{ type: "text" \| "math", content, display }`. **This is what a Word or OMML export pipeline needs**: cut the original LaTeX into spans and convert them one by one.
- `formulaToPlain(src)` → `string`, converts to searchable plain text (`$\frac{3}{8}$` becomes `3/8`) with the delimiters removed.

**Use `formulaToPlain` for search, export, and plain-text comparison.** Never hand the raw notation to a search box — someone searching for "3/8" should match it.

## How broken data is displayed

KaTeX runs with `throwOnError: false`. Failures fall into two tiers, and **neither one swallows content silently nor throws an exception that tears down the tree**:

- **An unrecognised control sequence** is highlighted in place and shown verbatim (`\y` renders as a red `\y`), while everything around it is typeset normally;
- **A whole-expression parse failure** (an unbalanced brace, for instance) renders the entire source in red, carrying the `katex-error` class.

This matches MathText's position that unrecognised notation is shown as written. Quietly rendering a corrupted `\begin{cases}x=my\y^2=6x\end{cases}` as a plausible-looking single line is far more dangerous than an outright error, because output that looks most nearly correct is the output nobody catches.

## Usage guidelines

- **Do not add Formula to the `@hulianui/ui` main barrel.** The entire point of the subpath is to keep KaTeX in the pages that need it. Once it reaches the main barrel every consumer starts paying that 86KB — the `math` entry in the bundle-size gate exists to watch exactly this.
- **Do not use it for a screenful of inline fractions.** With dozens of instances on screen KaTeX layout becomes the most expensive work on the page, and MathText's single string parse is enough for that case.
- **Hoist `macros` to a module-level constant.** The component is memoised, so an inline object literal is a new object on every render and defeats the memo every time — and what it defeats is the most expensive step. (Internally the component shallow-copies `macros` before handing it to KaTeX: KaTeX treats it as a **mutable** macro table and writes `\def` definitions back into it, so without the copy a `\def` in one question would leak into every formula after it.)
- **`textContent` carries the original LaTeX.** KaTeX embeds the source verbatim in a MathML `<annotation>` element for screen readers and copy support, so `container.textContent` contains both the typeset result and the raw `\begin{cases}…`. Read from `.katex-html` when writing tests or extracting text, not from the whole container.
- **Formulas render about 1.21 times larger than surrounding prose.** That is KaTeX's (and TeX's) standard optical size, not a bug, and the difference is visible when mixed with MathText in one paragraph. Override `.katex { font-size: 1em }` to flatten it, at the cost of symbols reading small next to the text.
- **Do not drop a block formula into the middle of a `<p>`.** `$$…$$` produces a `display:block` box, which splits the line of prose around it into three pieces. Block formulas deserve their own paragraph.
- **`display` only applies when `mode="math"`.** Passing it under `mixed` neither errors nor takes effect — each span's inline or block layout comes from its own delimiters, and **the layout will not reveal that you got it wrong** (the inline formula renders fine; the block you expected simply never appears). Write `$$…$$` when you want a block.
- **Do not feed `formulaToPlain` output into an OMML export.** It runs on MathText's lightweight parser, which flattens `\begin{cases}` — and the row structure it flattens is exactly what the export pipeline needs. Use `splitMathSegments` on the original LaTeX instead.
- **`strict` is off.** KaTeX otherwise emits a console warning for bare CJK characters in math mode, which becomes hundreds of warnings on a screen of questions, so this component sets `strict: "ignore"`. Rendering is unaffected, but KaTeX will no longer remind you that a run of prose belongs inside `\text{}`.
- The component returns a `<span>`. KaTeX emits both HTML and MathML; the HTML half is `aria-hidden` and screen readers read the MathML, so no extra ARIA wiring is required.

## Related

- [MathText](../math-text/math-text.md) — dependency-free inline mathematical typesetting, the default choice for prose
- [QuestionCard](../question-card/question-card.md) — question card
- [Markdown](../markdown/markdown.md) — full rich-text passages
