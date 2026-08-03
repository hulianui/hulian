---
slug: annotation
name: Annotation
category: data-display
group: info
tags: []
exports: [Annotation, annotationGeometry, ARROWS, sideVector, isDiagonal]
status: enriched
---

# Annotation

> Hand-drawn inline annotations with a highlighter mark, arrow, eight label directions, six tones, and mark-only mode.

## When to use

Use Annotation to explain a specific inline fragment in documentation, presentations, or component diagrams, such as a piece of code, configuration, or URL.

It complements [Callout](../callout/callout.md): Callout interrupts the document with a block, while Annotation adds an out-of-flow note. Use [Tour](../tour/tour.md) for interactive product guidance or [Tooltip](../tooltip/tooltip.md) for hover-triggered explanations.

## Import
```ts
import { Annotation } from "@hulianui/ui/annotation"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| note | `ReactNode` | — | Handwritten label content. Omit it for a highlight without an arrow or label. |
| side | `"n"\|"ne"\|"e"\|"se"\|"s"\|"sw"\|"w"\|"nw"` | `ne` | Label position; the arrow points back to the target. |
| tone | `"neutral"\|"primary"\|"success"\|"warning"\|"danger"\|"rainbow"` | `neutral` | Annotation color; the annotated content keeps its own color. |
| mark | `boolean` | `true` | Shows the highlighter background controlled by `--hl-ann-spread`. |
| rotate | `number` | `-4` | Label rotation in degrees; use `0` to align it. |
| labelWidth | `number` | `150` | Maximum label width before wrapping, in pixels. |
| gap | `number` | `5` | Space between the target and arrow, in pixels. |
| labelGap | `number` | `6` | Space between the arrow and label, in pixels. |
| offset | `{ x?: number; y?: number }` | — | Fine adjustment; positive values move away on the side axis and right or down on the other axis. |
| handwritten | `boolean` | `true` | Applies the handwritten font stack described below. |
| as | `ElementType` | `span` | Host element; use `mark` when semantic highlighting is appropriate. |
| className | `string` | — | Class on the annotated host. |
| labelClassName | `string` | — | Class on the label for typography adjustments. |

### CSS variables

| Variable | Default | Description |
|------|------|------|
| `--hl-annotation-font` | Handwritten font stack | Global stack from `@hulianui/tokens` `semantic.css`; override it site-wide as needed. |
| `--hl-ann-spread` | `0.3em` | Horizontal highlight spread. Override one item with `className="[--hl-ann-spread:0.1em]"`. |

## Examples
```tsx
// side identifies the label location; the arrow points back
<p>
  Use <Annotation note="Stable ID" side="ne">CLI-042</Annotation> so title changes do not break references.
</p>

// Stagger nearby labels and reduce their highlight spread
<code>
  - [ ] <Annotation note="Stable ID" side="n" tone="primary">CLI-042</Annotation> Add export command{" "}
  <Annotation note="Label" side="n" tone="success" className="[--hl-ann-spread:0.1em]">#cli</Annotation>{" "}
  <Annotation note="Priority" side="s" tone="danger" className="[--hl-ann-spread:0.1em]">!high</Annotation>
</code>

// Mark-only mode
<Annotation tone="warning">This sentence is the key point</Annotation>

// note accepts real React content
<Annotation note={<>See <code>docs/specs</code></>} side="e" tone="primary">spec file</Annotation>

// A restrained treatment for formal documents
<Annotation note="Additional context" handwritten={false} rotate={0}>Term</Annotation>
```

## Pitfalls

**Ancestors with `overflow: hidden` clip the label.** The arrow and label are absolutely positioned outside the target box. Add padding to clipped containers such as ScrollArea, cards, and table cells, choose another side, and reserve surrounding space.

**Adjacent highlights can merge.** The default `0.3em` horizontal spread mimics an overdrawn marker. Reduce `--hl-ann-spread` to `0.1em` or `0px`; keep the unit because unitless zero can invalidate the calculated `box-shadow` length.

**Handwritten fonts depend on the system.** The Latin and CJK faces in `--hl-annotation-font` are not bundled. If no face matches, the label falls back to the body font. Load your own font with `@font-face` and override the variable when handwritten rendering must be guaranteed.

**Do not put required information only in `note`.** It is real DOM content and can be read by assistive technology, but remains visually secondary and follows the target in reading order. Repeat instructions, errors, and state in the primary content.

**`tone` does not recolor the target text.** It only sets the annotation arrow and label through `--hl-ann-color`; apply a text class through `className` when the target itself should change.

## Related
[Callout](../callout/callout.md) · [Tour](../tour/tour.md) · [Tooltip](../tooltip/tooltip.md) · [Tag](../tag/tag.md) · [CodeDiff](../code-diff/code-diff.md)
