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
| `^{...}` / `^a` / `^\command` | Superscript; a single command needs no braces. | `x^{2}`, `x^2`, `90^\circ` |
| `_{...}` / `_a` / `_\command` | Subscript; a single command needs no braces. | `a_{1}`, `a_1`, `a_\beta` |
| `____` | Answer blank formed by **2 or more** consecutive underscores. | `Answer: ____` |
| `\overline{}` / `\widehat{}` | Overline/hat | `\overline{AB}` |
| `\vec{}` / `\overrightarrow{}` | Vector arrow whose width follows the content. | `\overrightarrow{AB}` |
| `\underline{}` | Underline applied to existing content, unlike an answer blank. | `\underline{A}` |
| `\overset{}{}` | Places a mark above the content. | `\overset{\frown}{AB}` |
| `\mathbb{}` | Blackboard-bold number sets. | `\mathbb{R}` → ℝ |
| `\text{}` / `\mathrm{}` / `\mathbf{}` | Font wrappers; the wrapper is removed and content retained. | `\text{Group A}` |
| `\left` / `\right` | Delimiter-sizing commands; commands are removed and delimiters retained. | `\left(a\right)` |
| `\{` `\}` `\%` `\$` `\&` `\#` `\_` | Escaped characters restored to their literal form. | `\{x\mid x>0\}` |
| Symbol commands | Converted to Unicode; see below. | `\angle` → ∠ |

### Symbol table

`\angle ∠` `\triangle △` `\parallel ∥` `\perp ⊥` `\cong ≌` `\sim ∽` `\odot ⊙` `\circ °`
`\times ×` `\div ÷` `\cdot ·` `\pm ±` `\neq ≠` `\leq(slant) ≤` `\geq(slant) ≥` `\approx ≈`
`\Rightarrow ⇒` `\Leftrightarrow ⇔` `\to →` `\mid ∣` `\forall ∀` `\langle ⟨` `\rangle ⟩` `\frown ⌢`
See `math-text.symbols.ts` for Greek letters, set operators, `\therefore ∴`, `\because ∵`, `\ldots …`, and other symbols.

The supported set was selected from command frequencies in real question text rather than chosen arbitrarily, and it covers the long tail:

- First pass: 22,000 characters of middle-school mathematics recognized with PaddleOCR-VL. Most frequent commands: `\angle` 140 · `\frac` 99 · `\circ` 80 · `\triangle` 60 · `\sqrt` 55 · `\times` 51.
- Second pass widened the sample to 1,324 questions spanning all grade levels, including their explanations. Vector, set, and logic notation dominate senior-high content and barely appear in middle-school samples: `\overrightarrow` 169 · `\vec` 113 · `\Rightarrow` 52 · `\mathbb` 16 · `\Leftrightarrow` 10.

Unsupported content is emitted literally. **Unknown or incomplete notation is never silently discarded**: `\oiint` remains `\oiint`, and an incomplete `\frac{3}` is preserved as written.

### Symbol spacing

Symbols receive horizontal spacing based on their typesetting class, **regardless of whether the source contains spaces**: `A \Rightarrow B`, `A\Rightarrow B`, and `A ⇒ B` all render identically. Whitespace after a command name terminates that command and is consumed, so spacing cannot come from the source text; deriving it from source spaces would put a gap on the left of the operator and none on the right.

| Class | Spacing | Members | Criterion |
|---|---|---|---|
| Relation | Symmetric, wider | `= < > ≠ ≤ ≥ ≈ ≡ ∝ ≌ ∽ ∥ ⊥ ∣ ∈ ∉ ⊂ ⊆ → ⇒ ↔ ⇔` | Connects a left and a right operand |
| Binary operator | Symmetric, narrower | `× ÷ · ± ∓ ∪ ∩` | Takes two operands and yields another value or set |
| Prefix mark | None; sits against the following content | `∠ △ ⊙ □ ∀ ∴ ∵` | Qualifies only what follows, so `∠ABC` must not become `∠ ABC` |
| Ordinary | None | Letters, `° ′ … ∞ ⟨ ⟩ ⌢`, Greek letters | — |

The criterion is **whether the symbol takes operands on both sides**, not how it looks: `∠` introduces a single geometric object and is a prefix, while `⊥` relates two segments and is a relation. Bare Unicode and LaTeX commands are treated identically (`x≠0` matches `x\neq 0`), so OCR output containing Unicode needs no conversion to commands first.

`+` and `-` are excluded because they also have unary uses such as the sign in `-3`, which the character alone cannot distinguish; leaving them untouched is safer. `±` and `∓` also have unary uses, but they degrade automatically when no operand precedes them: `±3` stays tight while `a±b` receives spacing.

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

- `parseMath(src)` → `MathNode[]` returns parsed nodes for custom rendering or structural validation. Relations and binary operators are separate `{ kind: "op", text, spacing: "relation" | "binary" }` nodes; handle that branch in custom renderers.
- `mathToPlain(src)` → `string` converts notation to plain text (`\frac{3}{8}` → `3/8`).

**Always use `mathToPlain` for search indexing, exports, and plain-text comparisons.** Do not index the marked-up source directly; a user searching for "3/8" should find `\frac{3}{8}`.

## Usage guidelines

- **Do not infer fractions from `a/b`.** Slashes also appear in units such as `km/h` and `USD/kg`. Use `\frac{}{}` upstream to state explicitly that the content is a fraction.
- **Do not strip `\mathbb{R}` down to `R` upstream.** The set of real numbers and a variable named `R` are different things, and collapsing them makes "the domain is ℝ" read as "the domain is R" with no visible sign that information was lost. Pass the command through and let MathText map it to blackboard bold.
- **Write an arc as `\overset{\frown}{AB}`, not `\frown{AB}`.** The latter means "arc symbol followed by a group" in LaTeX, so MathText renders it literally as `⌢{AB}`. Looking wrong is the intent: guessing an unstated meaning is worse.
- **`\vec` and `\overrightarrow` render at the same width here**, both following the content. TeX gives the former a fixed narrow arrow; that difference is flattened deliberately, because both mark a vector in question text and the width carries no information, while following the content lets `\vec{AB}` cover its letters.
- **One `_` starts a subscript; two or more create an answer blank.** `a_1` is a subscript, so use at least `__` for a blank.
- **Fractions are not built with `<sup>` and `<sub>`.** Their vertical `inline-flex` layout and `border-t` keep surrounding line height and fraction bars aligned; preserve this approach when changing styles.
- **Whitespace after a command name terminates the command.** In `\angle ABC`, that space is consumed so notation such as `\angle` and `\triangle` does not introduce an extra visual gap.
- **Do not use spaces to tune spacing around relations.** `A \Rightarrow B` and `A\Rightarrow B` render identically because spacing comes from the symbol class, and source spaces adjacent to a relation are normalized away. If you need extra whitespace, use `\quad` or `\qquad`.
- **Assign a class whenever you extend the symbol table.** If you add a symbol to `MATH_SYMBOLS` without registering it in `SYMBOL_CLASSES`, it is treated as `ordinary` and receives no spacing; if it is in fact a relation, the same line will show `x ≤ 3` spaced and `x ⊕ 3` tight. Classes live in `math-text.symbols.ts`.
- **`parseMath` emits `op` nodes.** If you render the node tree yourself, handle `{ kind: "op", text, spacing }` in addition to `text`, or relations and binary operators will be missing from the expression. `mathToPlain` is unaffected and emits `op` nodes as compact text.
- **Do not wrap `30^{\circ}` in another `<sup>`.** `\circ` already behaves as a superscript character and would be raised twice.
- **Matrices and equation systems degrade lossily.** `\begin{array}…\end{array}` is flattened to one line and `\\` becomes a semicolon. Use KaTeX for faithful layout.
- The component returns a `<span>` and is safe inside `<p>`. Answer blanks use `aria-label="Answer blank"`, so screen readers do not announce a sequence of underscores.

## Related

- [QuestionCard](../question-card/question-card.md) — question cards whose stems and options use MathText
- [Markdown](../markdown/markdown.md) — complete rich-text passages
- [Prose](../prose/prose.md) — long-form typography container
