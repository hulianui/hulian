---
slug: score-scale
name: ScoreScale
category: data-display
group: info
tags: []
exports: [ScoreScale, toSegments, toPercent]
status: enriched
---

# ScoreScale

> Shows which band a score falls into along a full-range color-coded bar.

## When to use

Use ScoreScale when the score itself matters less than the band it lands in: risk and credit scores, health indexes, medical readings (low / normal / high), SEO or quality scores, and tiered capacity alerts. It shares one grade model (`Grade[]`) with [ScoreRing](../score-ring/score-ring.md) — one draws a circle, the other a line.

Use [Meter](../meter/meter.md) for "how much of the total is filled", [Progress](../progress/progress.md) for "how far a task has moved", and [ScoreRing](../score-ring/score-ring.md) when the position along the range does not matter. It is compatible with React Server Components: no hooks, no events, geometry is plain render-time arithmetic.

## Import
```ts
import { ScoreScale } from "@hulianui/ui"
// Import the type as well when you define your own bands (the same Grade ScoreRing uses)
import type { Grade } from "@hulianui/ui"
```

## Props

`Grade` = `{ min: number; label: string; tone?: string }`, the **same type**
[ScoreRing](../score-ring/score-ring.md) uses (import it from `@hulianui/ui`). `min` is the lowest
score that lands in the band, inclusive, and `tone` takes a semantic color name or any CSS color
value. Both components resolve a band with the same `resolveGrade(value, grades)`, which takes two
arguments and no `max`.

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | - | Current score. Out-of-range values clamp the cursor to an endpoint while `aria-valuetext` still reads the original number. |
| min | `number` | `0` | Lower bound of the range. |
| max | `number` | `100` | Upper bound of the range. |
| grades | `Grade[]` | `DEFAULT_GRADES` | Grade bands, the same model ScoreRing uses. **The distance between two adjacent `min` values is that band's width on the bar.** |
| size | `"sm" \| "md"` | `"md"` | Size step: sm for table rows, md for a score card. |
| showGrade | `boolean` | `true` | Shows the matched grade label in the top right, tinted with that band's tone. |
| showRange | `boolean` | `false` | Marks the range endpoints below the bar (`0` / `100`). |
| segmentGap | `boolean` | `false` | Leaves a 2px gap between bands. |
| markers | `ScoreScaleMarker[]` | - | Reference lines such as "industry average 62". |
| formatValueText | `(info: ScoreScaleValueTextInfo) => string` | - | Custom `aria-valuetext`. |
| className | `string` | - | Custom class name. |
| …HTMLAttributes | `Omit<HTMLAttributes<HTMLDivElement>, "children">` | - | Forwards native div attributes; pass `aria-label` or `aria-labelledby` here. |

### ScoreScaleMarker

| Name | Type | Default | Description |
|------|------|------|------|
| value* | `number` | - | Reference value on the same range; out-of-range values clamp to an endpoint. |
| label | `ReactNode` | - | Caption under the line. One labeled marker adds a caption row. |
| tone | `string` | foreground | Line color resolved by `resolveTone`: a semantic name, a `var(--color-*)` variable, or any CSS color. |

### ScoreScaleValueTextInfo

| Name | Type | Description |
|------|------|------|
| value | `number` | The raw value the caller passed in, **not clamped**. |
| min / max | `number` | Both ends of the range. |
| percent | `number` | Position percentage already clamped to 0–100. |
| grade | `Grade \| undefined` | Matched grade; undefined when `grades` is empty. |

## Slots

| Slot | Type | Description |
|------|------|------|
| label | `ReactNode` | Title above the bar. A **string** also becomes the accessible name of `role="meter"`. |

## Examples
```tsx
// Basic: the default A-F bands
<ScoreScale value={73} label="Quality score" />

// Custom bands: the distance between two adjacent min values is that band's width
const CREDIT_GRADES: Grade[] = [
  { min: 80, label: "Excellent", tone: "success" },
  { min: 60, label: "Good", tone: "chart-2" },
  { min: 30, label: "Fair", tone: "warning" },
  { min: 0, label: "Poor", tone: "danger" },
]
<ScoreScale value={36} label="Credit score" grades={CREDIT_GRADES} showRange />

// Reference line: the cursor is not the only marker on the bar
<ScoreScale value={36} grades={CREDIT_GRADES} markers={[{ value: 62, label: "Industry average 62" }]} />

// Custom screen reader phrasing; the default is the language-free "36 / 100, Fair"
<ScoreScale value={36} grades={CREDIT_GRADES} formatValueText={({ value, grade }) => `${value} points, ${grade?.label ?? ""}`} />
```

### Compose a score card with Stat + ScoreScale

You do not need a new shell: the four slots of [Stat](../stat/stat.md) map onto this card exactly — `label` is the title, `value` the score, `chart` this bar, and `hint` the closing explanation.

```tsx
<Stat
  className="w-80"
  label="Credit score"
  // Stat pins value to text-2xl, so an oversized number needs its own font size (see Pitfalls)
  value={<span className="text-6xl font-bold tabular-nums">36</span>}
  chart={<ScoreScale value={36} grades={CREDIT_GRADES} showRange showGrade={false} />}
  hint="Fair credit. Complete your documents before requesting a higher limit."
/>
```

## Pitfalls

- **Do not reach for Meter here.** Meter draws a filled length — "how much is used or done", longer is fuller. On a score bar the green stretch left of 36 does not belong to the value; it is the scale itself. Drawing 36 as a fill reads as "in progress, some way to go", which is the opposite message.
- **`Stat` pins `value` to `text-2xl font-semibold`** (`stat.tsx:31`), yet the oversized number is the star of a score card. Passing `value={36}` gives you a 24px number; the value node has to carry its own font size — `value={<span className="text-6xl font-bold tabular-nums">36</span>}`, since a child's own size beats the inherited one. The library has no ready-made "display number" step.
- **Do not borrow the `icon` slot of `Stat` for the grade label.** `icon` sits in the title row as a corner badge and `delta` only accepts numbers. Let `ScoreScale` carry the grade itself through `showGrade`.
- **The default `DEFAULT_GRADES` has five bands but only three colors** (A and B are both success, C and D both warning), so the bar looks like three segments. Turn on `segmentGap`, or pass custom `grades` with a distinct `tone` per band, to tell all five apart.
- **`grades` only declares the lower bound of each band.** The lowest band is extended down to the start of the range, otherwise the left end of the track would show an unowned blank. Bands that fall entirely outside the range are dropped instead of rendering zero-width segments.
- **`showGrade` shows the grade label, not the score.** This component never renders the number itself; that belongs to the `value` of `Stat` or to your own heading. The number only reaches `aria-valuetext`.
- **Without a string `label`, screen readers announce an unnamed meter.** A node `label` does not produce an accessible name, so pass `aria-label` or `aria-labelledby` as well.
- **Keep colors on tokens.** Pass a semantic name (`"success"`, `"warning"`, `"chart-2"`) or a variable with the `--color-` prefix. A bare `var(--warning)` does not resolve inside `style` or SVG attributes; `resolveTone` patches known tokens, but do not rely on that.

## Related
[ScoreRing](../score-ring/score-ring.md) · [Meter](../meter/meter.md) · [Progress](../progress/progress.md) · [Stat](../stat/stat.md) · [Sparkline](../sparkline/sparkline.md) · [Legend](../legend/legend.md)
