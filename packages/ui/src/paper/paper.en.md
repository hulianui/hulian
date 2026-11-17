---
slug: paper
name: Paper
category: data-display
group: collection
tags: []
exports: [Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, usePaperMode]
status: enriched
---

# Paper

> Lets the figures of a paper change step by step with the text, and switch to a print form for submission. · data-display/collection

## When to use

Use it to turn the figures of a paper, lecture notes, or a thesis defense into figures that move with the argument. When the text says "as shown in Figure 1(b)", a click switches the figure to that step. For submission or printing, every figure freezes in its print state and a process figure expands into (a)(b)(c) sub-figures. It fits step-by-step process and architecture diagrams (`ProcessFigure`) and figures driven by parameters, such as formula curves or weight distributions (`PaperFigure`). For a static illustration, a plain `<figure>` is enough. To drag and wire nodes, use [Flow](../flow/flow.md). To show the call order between services, use [SequenceDiagram](../sequence-diagram/sequence-diagram.md).

## Import
```ts
import { Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, usePaperMode } from "@hulianui/ui"
import type { ProcessStep, FigureRenderContext } from "@hulianui/ui"
```

## Structure

```
Paper                      display mode (read / print) + figure registry + figure numbering
├─ FigRef                  in-text reference: switch to a preset, scroll to the figure, flash it
├─ PaperFigure<S>          general figure: any state value + named presets
└─ ProcessFigure           step-by-step figure (a PaperFigure whose state is a step key)
   └─ FigureStep           marks which step a part of the figure belongs to
```

There is one core rule: **the state alone decides what the figure draws**. The `children` of `PaperFigure` is a function from state to picture, and print sub-figures call that same function once per preset. Internal state hidden inside the function does not appear in sub-figures or in print.

## Paper

Extends `HTMLAttributes<HTMLElement>`; `ref` lands on the root element.

| Name | Type | Default | Description |
|------|------|------|------|
| as | `ElementType` | `"article"` | Root element tag |
| mode | `"read"` \| `"print"` | - | Controlled mode |
| defaultMode | `"read"` \| `"print"` | `"read"` | Uncontrolled initial mode |
| labels | `{ figure?: string; separator?: string }` | follows the UI language | Text of the caption prefix and of automatic references. Set it when the paper language differs from the UI, such as an English paper in a Chinese UI: `{ figure: "Figure", separator: ": " }`. Control text such as step buttons still follows the UI language |

| Event | Type | Description |
|------|------|------|
| onModeChange | `(mode: PaperMode) => void` | Fires when the mode is switched through `usePaperMode` |

- When the browser actually prints (`beforeprint`), `Paper` switches to `print` for the print and back after it (`afterprint`). That switch does not fire `onModeChange`.
- Figure numbers come from a CSS counter, so they exist in server rendering and in print. Put every `PaperFigure` inside a `Paper`, otherwise each one is "Figure 1".
- Body text uses a serif stack: `var(--paper-font, "STIX Two Text", "Times New Roman", "Songti SC", "SimSun", serif)`. Set `--paper-font` on an ancestor to replace it. `Paper` does not style headings or paragraphs; typesetting is up to you.

`usePaperMode()` returns `[mode, setMode]` inside a `Paper`, for your own read / print preview switch.

## PaperFigure

`PaperFigureProps<S>` is generic over the state type `S`. Extends `HTMLAttributes<HTMLElement>` (without `children` / `title` / `id`); `ref` lands on the root `<figure>`.

| Name | Type | Default | Description |
|------|------|------|------|
| id * | string | - | Stable figure id. `FigRef` finds the figure by it, and it is the `id` of the root `<figure>` (usable as an anchor) |
| states * | `Record<string, S>` | - | Named state presets. The order of the keys is the order of explanation |
| caption * | ReactNode | - | Caption text. The "Figure N: " prefix is generated |
| children * | `(state: S, figure: FigureRenderContext<S>) => ReactNode` | - | Draws the figure. Only `state` may decide the picture |
| defaultState | string | first key of `states` | Initial preset |
| printState | string | same as `defaultState` | Preset of the main figure in print mode |
| printSubfigures | `string[]` | - | Presets expanded as (a)(b)… sub-figures below the main figure in print mode |
| describe | `(state: S, key: string \| null) => ReactNode` | - | Second caption line describing the current state; screen readers announce changes |
| subfigureLabel | `(key: string, index: number) => ReactNode` | `(a)` + `describe` | Sub-figure label |
| controls | `(figure: FigureRenderContext<S>) => ReactNode` | - | Controls below the figure, rendered only in read mode |

| Event | Type | Description |
|------|------|------|
| onStateChange | `(state: S, key: string \| null) => void` | Fires on user actions and on `FigRef` jumps |

`FigureRenderContext<S>`:

```ts
interface FigureRenderContext<S> {
  state: S;                     // state being drawn
  stateKey: string | null;      // its preset name; null when set directly with setState
  select: (key: string) => void;    // switch to a preset
  setState: (state: S) => void;     // set a value directly (sliders, toggles)
  mode: "read" | "print";
}
```

## ProcessFigure

A step-by-step figure. Its state is a step `key`, plus the reserved name `"all"` (every part shown). It takes `id` / `caption` / `defaultState` / `subfigureLabel` / `onStateChange` and native attributes from `PaperFigure`.

| Name | Type | Default | Description |
|------|------|------|------|
| steps * | `ProcessStep[]` | - | Steps in the order of explanation |
| children * | ReactNode | - | The figure, usually an SVG whose parts are marked with `FigureStep` |
| overview | boolean | true | Whether there is an "all" state |
| overviewDescription | ReactNode | - | Description of the "all" state |
| printState | string | `"all"` (the last step without overview) | Print state |
| printSubfigures | `string[]` | one per step | Print sub-figures; pass `[]` for none |
| interval | number | 2200 | Milliseconds per step during autoplay |

```ts
interface ProcessStep {
  key: string;              // must not be "all"
  label: string;            // short name: step button hint, sub-figure label
  description?: ReactNode;  // second caption line
}
```

Step controls come built in below the figure: previous / next (disabled at the ends), one letter button per step (a, b, c…), "All", and play / pause. Playback stops at the last step.

## FigureStep

A `<g>` element that marks which step a part of the figure belongs to; use it inside SVG only. Extends `SVGAttributes<SVGGElement>`.

| Name | Type | Default | Description |
|------|------|------|------|
| at * | `string` \| `string[]` | - | Step or steps it belongs to: `["b", "c"]` or `"b c"` |

It carries `data-phase`:

| phase | Meaning | Style from the component |
|-------|------|------|
| `on` | The current step | Opaque |
| `done` | Already explained | Half transparent |
| `off` | Not reached yet | Faint but not hidden, so the reader always sees the whole figure |
| `all` | The "all" state | Opaque, no emphasis |

The component only sets opacity. Write the accent color and flowing dashes in the figure yourself; `FigureStep` carries `group/step`:

```tsx
<FigureStep at="b">
  <rect className="stroke-muted-foreground group-data-[phase=on]/step:stroke-primary" />
  <path className="stroke-muted-foreground group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]" />
</FigureStep>
```

The `hulian-paper-flow` keyframes live in preset-core.css of `@hulianui/tokens`.

## FigRef

An `<a href="#id">`. Extends `AnchorHTMLAttributes` (without `href`); `ref` lands on the `<a>`.

| Name | Type | Default | Description |
|------|------|------|------|
| to * | string | - | `id` of the target figure |
| state | string | - | Preset to switch to; without it the link only jumps to the figure |
| children | ReactNode | "Figure N" | Reference text. Without it the number is taken in document order (after mount) |

On click it switches the figure to `state`, scrolls the figure into view when it is off screen (without smooth scrolling under reduced motion), and outlines the figure for about 1.2 seconds. Without JS or outside a `Paper` it is a plain anchor. In print mode the link color and underline are removed.

## Examples

```tsx
<Paper>
  <p>
    Each layer has a multi-head self-attention sub-layer{" "}
    <FigRef to="transformer" state="b">Figure 1(b)</FigRef>.
  </p>
  <ProcessFigure
    id="transformer"
    steps={[
      { key: "a", label: "Input embedding", description: "(a) …" },
      { key: "b", label: "Encoder self-attention", description: "(b) …" },
    ]}
    caption="The Transformer – model architecture."
  >
    <svg viewBox="0 0 600 704">
      <FigureStep at="a">…</FigureStep>
      <FigureStep at="b">…</FigureStep>
    </svg>
  </ProcessFigure>
</Paper>
```

A parameter figure:

```tsx
<PaperFigure
  id="attention"
  states={{ scaled: { dk: 512, scaled: true }, raw: { dk: 512, scaled: false } }}
  caption="Scaled dot-product attention."
  describe={(s) => (s.scaled ? "scaled" : "unscaled")}
  controls={(fig) => (
    <Button onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}>Toggle scaling</Button>
  )}
>
  {(state) => <Bars state={state} />}
</PaperFigure>
```

## Notes

- **Do not put `id` attributes inside a figure** (SVG `marker`, `clipPath`, gradients). Print sub-figures render the same figure several times, so ids would repeat. Draw arrowheads as `polygon`s.
- Sub-figures are `aria-hidden`. Screen readers read the main figure and its caption, not the same figure six times.
- Preset names are unique within a figure. When `FigRef` points to a missing figure or preset, development builds warn once and the state does not change.
- When two figures in one `Paper` share an id, references find the one mounted last, with a warning.
- Not in this version yet: a presentation mode for defenses (full screen, step by step), per-state SVG export, linking formulas to figures, and a title block and bibliography.
