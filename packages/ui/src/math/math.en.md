---
slug: math
name: Formula
category: typography
group: text
tags: []
exports: [Formula, QuestionCard, formulaToPlain, mathToPlain, splitMathSegments, splitBareMath, hasBareMath]
status: enriched
---

# Formula

> KaTeX-powered mathematical typesetting, the library's single math rendering path · shipped on the separate `@hulianui/ui/math` subpath so the main bundle pays nothing · real two-dimensional layout for piecewise functions, matrices, and large delimiters · understands `$…$` delimiters and falls back to bare-notation splitting for question banks whose data never wrapped anything in `$` · renders `____` answer blanks as writable slots · RSC-safe · typography/text

## When to use

**The test: does this text contain notation such as `\frac{}{}`, `x^{2}`, or `____`?** If it does, use Formula; if it does not, a plain `<p>` is enough. The typical setting is question stems, answer options, explanations, and formula captions, usually from question-bank content extracted out of PDF or Word — rendered as plain text, such a string shows the literal characters `\frac{3}{8}` on screen instead of a stacked fraction.

Do not use Formula for complete rich-text passages—use [Markdown](../markdown/markdown.md)—or for source code—use [Code](../code/code.md).

### Since 0.25.0 this is the library's only math rendering path

There used to be a dependency-free `MathText` that assembled inline layout out of CSS (`inline-flex` for stacked fractions, `border-t` as the radical's vinculum). It was **retired and removed from the main barrel** in 0.25.0. The reason was not a capability boundary — **what it drew was wrong**:

- `√` was a fixed-height character while the vinculum was a sibling box's `border-t`. As soon as the radicand carried a superscript (`\sqrt{a^{2}+b^{2}}`) the content box grew and the rule no longer met the radical, leaving the trailing exponent hanging outside the line;
- arcs and hats (`\overset{\frown}{AB}`, `\widehat{ABC}`) did not stretch to the content, so an arc that should span both letters was drawn as a hat sitting on the `A`;
- these are inherent limits of CSS assembly — fraction rule weight, script baselines, delimiter heights: fix one and the next one surfaces.

And its original selling point — dependency-free layout that "does not disturb CJK line height" — **holds equally under KaTeX**, as measured: inline formulas do not open up the leading. That difference was never real, and the price paid for it was wrong typesetting everywhere.

**Migrating from MathText:**

| Before | Now |
|---|---|
| `import { MathText } from "@hulianui/ui"` | `import { Formula } from "@hulianui/ui/math"` |
| `import { QuestionCard } from "@hulianui/ui"` | `import { QuestionCard } from "@hulianui/ui/math"` |
| `<MathText>{stem}</MathText>` | `<Formula>{stem}</Formula>` |
| `mathToPlain(src)` | `mathToPlain(src)` — same name, same meaning, imported from `@hulianui/ui/math` |
| `parseMath` / `parseMathDocument` | No longer exported: they existed for MathText's custom rendering, and KaTeX now owns layout |
| `delimiters={true}` | No longer needed: `mixed` mode reads `$` by default and falls back to bare-notation splitting when there is none |
| `scriptScale` | Gone — script sizing follows TeX's typesetting rules rather than a caller-supplied dial |

`blankWidth` is carried over unchanged. Two things look different, and both are **fixes rather than regressions**: variables render in italic as TeX prescribes, and formulas are about 1.21× the size of surrounding prose (see Pitfalls).

## Import

```ts
import { Formula, formulaToPlain, splitMathSegments } from "@hulianui/ui/math"
// QuestionCard lives on this path too — its stem and options are Formula internally
import { QuestionCard } from "@hulianui/ui/math"
```

**The subpath is deliberate.** KaTeX is bundled only into pages that import this path; consumers of the `@hulianui/ui` main entry pay nothing. Do not add Formula to the main barrel. [QuestionCard](../question-card/question-card.md) lives here for the same reason — its stem and options are Formula internally, so leaving it in the main barrel would drag KaTeX into every consumer's bundle.

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

### Legacy data with no `$`

**When the whole string contains no matched delimiter at all, Formula falls back to bare-notation splitting**: it carves out fragments such as `\frac{3}{8}`, `x^{2}`, and `\angle ABC`, hands those to KaTeX, and emits everything else as text. Question stems straight out of PDF, Word, or OCR look exactly like this, and a stem should not expose literal notation just because upstream has not wrapped it in `$` yet.

The split applies exactly one test: **no `\`, `^`, or `_` trigger means it is not a formula.** So `P(2,3)`, the option label `A.`, and `(a+b)` all stay text — better to typeset too little than too much, because feeding Chinese prose to KaTeX yields a string of red errors, which is far worse than no typesetting at all.

**This is a fallback, not the recommended path.** As soon as one matched delimiter appears, the whole string takes the exact route and stops guessing; if half a string is wrapped and half is not, the unwrapped half shows verbatim — deliberately, because inconsistent data should be visible. The right practice remains wrapping formulas in `$…$` upstream.

Use `splitBareMath(src)` when you need the segments yourself, and `hasBareMath(src)` to decide whether the expensive KaTeX path is warranted at all.

### Answer blanks

`____` (two or more consecutive underscores) renders as a writable slot whose width is set by `blankWidth` (default 2.5em). A single `_` is still a subscript.

**It is recognised inside and outside delimiters alike.** One example of each:

| Written as | Blank sits |
|---|---|
| `$\frac{3}{8}$ as a decimal is ____` | **outside** the segment |
| `$\overrightarrow{AC}=___$` | **inside** the segment |

The second form is not optional: what needs filling in *is* the value of that vector expression, and breaking the `$` right before the underscores only makes the boundary harder to write.

**The two are implemented differently, so their accessibility behaviour differs**:

- **Outside** the segment it is real DOM carrying an `aria-label`, so a screen reader announces "Blank" rather than a run of underscores.
- **Inside** the segment KaTeX draws it (`\rule`), which keeps the formula structure intact — a blank works in a numerator or under a radical (`\frac{___}{2}`, `\sqrt{___}`) — but **KaTeX output has nowhere to hang an `aria-label`**, so a screen reader reads the MathML instead. Move the blank outside the `$` when you need it announced.

The inside rule scales with the font size while the outside one is 1px; at body size the two look the same, but **above roughly 1.5em the inside one reads slightly heavier**.

## Props

| Name | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | — | LaTeX source, or prose containing LaTeX spans |
| `mode` | `"mixed" \| "math"` | `"mixed"` | `mixed` reads delimiters and typesets only what is inside them; `math` treats the whole string as LaTeX |
| `display` | `boolean` | `false` | Block layout. **Only takes effect when `mode="math"`** — under `mixed` each span's own delimiters decide |
| `blankWidth` | `number` | `2.5` | Minimum width of an answer blank (`____`), in em |
| `macros` | `Record<string, string>` | — | Custom macros, passed through to KaTeX |
| `className` | `string` | — | — |

## Pure helpers

- `splitMathSegments(src)` → `MathSegment[]`, splits prose into `{ type: "text" \| "math", content, display }`. **This is what a Word or OMML export pipeline needs**: cut the original LaTeX into spans and convert them one by one.
- `splitBareMath(src)` → `BareSegment[]`, splits prose that has **no `$`** into `{ type: "text" | "math" | "blank", content }`.
- `hasBareMath(src)` → `boolean`, whether the string yields any formula or answer blank at all.
- `formulaToPlain(src)` → `string`, converts to searchable plain text (`$\frac{3}{8}$` becomes `3/8`) with the delimiters removed.
- `mathToPlain(src, { delimiters })` → `string`, the underlying implementation of the same downgrade; `delimiters` decides whether `$` is honoured.

**Use `formulaToPlain` for search, export, and plain-text comparison.** Never hand the raw notation to a search box — someone searching for "3/8" should match it.

## How broken data is displayed

KaTeX runs with `throwOnError: false`. Failures fall into two tiers, and **neither one swallows content silently nor throws an exception that tears down the tree**:

- **An unrecognised control sequence** is highlighted in place and shown verbatim (`\y` renders as a red `\y`), while everything around it is typeset normally;
- **A whole-expression parse failure** (an unbalanced brace, for instance) renders the entire source in red, carrying the `katex-error` class.

The position is that **a corrupted formula must be visible**. Quietly rendering a corrupted `\begin{cases}x=my\y^2=6x\end{cases}` as a plausible-looking single line is far more dangerous than an outright error, because output that looks most nearly correct is the output nobody catches.

## Usage guidelines

- **Do not add Formula to the `@hulianui/ui` main barrel.** The entire point of the subpath is to keep KaTeX in the pages that need it. Once it reaches the main barrel every consumer starts paying that 86KB — the `math` entry in the bundle-size gate exists to watch exactly this.
- **With dozens of instances on screen, KaTeX layout is the most expensive work on the page.** The component is already memoised, but a parent passing fresh objects (especially `macros`) still re-typesets the whole screen. When you genuinely hit that wall, the way out is server pre-rendering (this component is RSC-safe, so layout can happen entirely on the server) or list virtualisation — **not** a lighter typesetting engine. That road has been travelled: what it saved in cost it paid for in wrong layout.
- **Hoist `macros` to a module-level constant.** The component is memoised, so an inline object literal is a new object on every render and defeats the memo every time — and what it defeats is the most expensive step. (Internally the component shallow-copies `macros` before handing it to KaTeX: KaTeX treats it as a **mutable** macro table and writes `\def` definitions back into it, so without the copy a `\def` in one question would leak into every formula after it.)
- **`textContent` carries the original LaTeX.** KaTeX embeds the source verbatim in a MathML `<annotation>` element for screen readers and copy support, so `container.textContent` contains both the typeset result and the raw `\begin{cases}…`. Read from `.katex-html` when writing tests or extracting text, not from the whole container.
- **Formulas render about 1.21 times larger than surrounding prose.** That is KaTeX's (and TeX's) standard optical size, not a bug. Override `.katex { font-size: 1em }` to flatten it, at the cost of symbols reading small next to the text.
- **Do not drop a block formula into the middle of a `<p>`.** `$$…$$` produces a `display:block` box, which splits the line of prose around it into three pieces. Block formulas deserve their own paragraph.
- **`display` only applies when `mode="math"`.** Passing it under `mixed` neither errors nor takes effect — each span's inline or block layout comes from its own delimiters, and **the layout will not reveal that you got it wrong** (the inline formula renders fine; the block you expected simply never appears). Write `$$…$$` when you want a block.
- **Do not feed `formulaToPlain` output into an OMML export.** It runs on the dependency-free lightweight parser, which flattens `\begin{cases}` — and the row structure it flattens is exactly what the export pipeline needs. Use `splitMathSegments` on the original LaTeX instead.
- **A blank inside a segment is not announced as "Blank."** Outside the segment it is real DOM with an `aria-label`; inside it is a KaTeX `\rule`, and KaTeX output has nowhere to hang aria — a screen reader reads the MathML. Put the blank outside the `$` when the stem has strict accessibility requirements.
- **`strict` is off.** KaTeX otherwise emits a console warning for bare CJK characters in math mode, which becomes hundreds of warnings on a screen of questions, so this component sets `strict: "ignore"`. Rendering is unaffected, but KaTeX will no longer remind you that a run of prose belongs inside `\text{}`.
- The component returns a `<span>`. KaTeX emits both HTML and MathML; the HTML half is `aria-hidden` and screen readers read the MathML, so no extra ARIA wiring is required.

## Related

- [QuestionCard](../question-card/question-card.md) — question card whose stem and options are this component; shipped on `@hulianui/ui/math` alongside it
- [Prose](../prose/prose.md) — long-form typographic container
- [Markdown](../markdown/markdown.md) — full rich-text passages
