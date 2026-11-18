---
slug: paper
name: Paper
category: data-display
group: collection
tags: []
exports: [Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, EqRef, FigureRaster, PaperPresenter, usePaperMode, usePaperExport, usePaperTerm, usePaperNavigate, PaperHeader, Cite, Bibliography, PaperSection, SecRef, PaperOutline]
status: enriched
---

# Paper

> Lets the figures of a paper change step by step with the text, and switch to a print form for submission. · data-display/collection

## When to use

Use it to turn the figures of a paper, lecture notes, or a thesis defense into figures that move with the argument. When the text says "as shown in Figure 1(b)", a click switches the figure to that step. For submission or printing, every figure freezes in its print state and a process figure expands into (a)(b)(c) sub-figures. It fits step-by-step process and architecture diagrams (`ProcessFigure`) and figures driven by parameters, such as formula curves or weight distributions (`PaperFigure`). For a static illustration, a plain `<figure>` is enough. To drag and wire nodes, use [Flow](../flow/flow.md). To show the call order between services, use [SequenceDiagram](../sequence-diagram/sequence-diagram.md).

## Import
```ts
import { Paper, PaperFigure, ProcessFigure, FigureStep, FigRef, EqRef, FigureRaster, PaperPresenter, usePaperMode, usePaperExport, usePaperTerm, usePaperNavigate, PaperHeader, Cite, Bibliography, PaperSection, SecRef, PaperOutline } from "@hulianui/ui"
import { PaperEquation } from "@hulianui/ui/math"
import type { ProcessStep, FigureRenderContext, PresenterSlide, FigureSvgExportOptions, FigureRasterContext, EquationTerm, PaperAuthor, BibliographyEntry } from "@hulianui/ui"
```

## Structure

```
Paper                      display mode (read / print) + figure registry + figure numbering
├─ PaperHeader             title block: title, authors, abstract
├─ FigRef                  in-text reference: switch to a preset, scroll to the figure, flash it
├─ EqRef                   equation reference "Eq. (1)": scroll to the equation, flash it
├─ Cite                    citation [1, 2], numbered by Bibliography
├─ PaperSection            numbered section (1, 2.1, ...)
├─ SecRef                  section reference "Section 2.1"
├─ PaperOutline            table of contents (an Anchor inside)
├─ usePaperNavigate        imperative navigation: jump to a figure / equation / section from a button
├─ PaperEquation           formula whose terms link to figures (@hulianui/ui/math)
├─ PaperPresenter          presentation mode: full screen, figure presets as slides
├─ Bibliography            numbered reference list
├─ PaperFigure<S>          general figure: any state value + named presets
└─ ProcessFigure           step-by-step figure (a PaperFigure whose state is a step key)
   └─ FigureStep           marks which step a part of the figure belongs to

FigureRaster               a raster (heatmap) inside a figure's <svg>, usable in any figure
```

There is one core rule: **the state alone decides what the figure draws**. The `children` of `PaperFigure` is a function from state to picture, and print sub-figures call that same function once per preset. Internal state hidden inside the function does not appear in sub-figures or in print.

## Paper

Extends `HTMLAttributes<HTMLElement>`; `ref` lands on the root element.

| Name | Type | Default | Description |
|------|------|------|------|
| as | `ElementType` | `"article"` | Root element tag |
| mode | `"read"` \| `"print"` | - | Controlled mode |
| defaultMode | `"read"` \| `"print"` | `"read"` | Uncontrolled initial mode |
| labels | `{ figure?; separator?; abstract?; references?; equation?; section? }` | follows the UI language | Text of the caption prefix, automatic references (including "Eq." in `EqRef` and "Section N" in `SecRef`), and the abstract and references headings. Set it when the paper language differs from the UI, such as an English paper in a Chinese UI: `{ figure: "Figure", separator: ": " }`. Control text such as step buttons still follows the UI language |

| Event | Type | Description |
|------|------|------|
| onModeChange | `(mode: PaperMode) => void` | Fires when the mode is switched through `usePaperMode` |

- When the browser actually prints (`beforeprint`), `Paper` switches to `print` for the print and back after it (`afterprint`). That switch does not fire `onModeChange`.
- Figure and equation numbers come from CSS counters, so they exist in server rendering and in print. Put every `PaperFigure` inside a `Paper`, otherwise each one is "Figure 1".
- Body text uses a serif stack: `var(--paper-font, "STIX Two Text", "Times New Roman", var(--hl-font-serif, serif))`. Latin text uses STIX Two Text or Times New Roman first; Chinese and fallbacks come from the tokens' `--hl-font-serif` (by default Chinese lands on the system Song face). Set `--hl-font-serif` to change only the CJK serif, or set `--paper-font` on an ancestor to replace the whole stack. `Paper` does not style headings or paragraphs; typesetting is up to you.

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
| presentStates | `string[]` | every key of `states` | Presets shown one by one in `PaperPresenter`; `[]` skips this figure when presenting |
| describe | `(state: S, key: string \| null) => ReactNode` | - | Second caption line describing the current state; screen readers announce changes |
| subfigureLabel | `(key: string, index: number) => ReactNode` | `(a)` + `describe` | Sub-figure label |
| controls | `(figure: FigureRenderContext<S>) => ReactNode` | - | Controls below the figure, rendered only in read mode |
| hideCaption | boolean | false | Render no caption at all (the whole "Figure N: …" line, description included). Figure numbers still advance, so later figures keep their numbers |
| hideDescription | boolean | false | Render no state description (the caption's second line). Implied by `hideCaption` |
| collapsibleControls | boolean | false | Let the control row collapse: an icon button at its end hides it. Collapsed, the row takes no space — only a "Show controls" button in the figure corner, revealed on hover or keyboard focus (always visible on touch) |
| defaultControlsCollapsed | boolean | false | Start with the control row collapsed (only with `collapsibleControls`). Use it for figures that should play clean first and be inspected on demand |

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
  presenting?: boolean;         // drawn inside the presenter (autoPlay is off there)
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
| presentStates | `string[]` | each step + `"all"` | Presets shown one by one when presenting |
| interval | number | 2200 | Milliseconds per step during autoplay. The speed button divides it |
| autoPlay | boolean | false | Start playing by itself once the figure scrolls into view. Pauses off-screen and resumes on return; a reader who pressed pause or changed the state from a `FigRef` or a locate button takes over and autoplay stops for good; never starts under `prefers-reduced-motion: reduce` |
| loop | boolean | false | After the last step, start over (off by default: playback stops). The loop button in the controls toggles the same thing |
| speeds | `number[]` | `[0.5, 1, 1.5, 2]` | Speed steps, where 1 = `interval` as given. Pass `[]` to render no speed button |
| defaultSpeed | number | 1 | Initial speed; falls back to the first entry of `speeds` |

```ts
interface ProcessStep {
  key: string;              // must not be "all"
  label: string;            // short name: step button hint, sub-figure label
  description?: ReactNode;  // second caption line
}
```

Step controls come built in below the figure: previous / next (disabled at the ends), one letter button per step (a, b, c…), "All", play / pause, a loop toggle, and a speed button (shown as `1×`, click to step through the speeds). Playback stops at the last step unless `loop` or the loop toggle is on, in which case it starts over. With `collapsibleControls` the whole row can be folded away; a "Show controls" button then appears in the figure corner on hover, without adding a line under the figure.

## FigureStep

A `<g>` element that marks which step a part of the figure belongs to; use it inside SVG only. Extends `SVGAttributes<SVGGElement>`.

| Name | Type | Default | Description |
|------|------|------|------|
| at * | `string` \| `string[]` | - | Step or steps it belongs to: `["b", "c"]` or `"b c"` |
| until | string | - | Step from which this part is superseded and no longer drawn. Hidden from `until` onward and in the "all" state (and left out of SVG exports). For things that move: branch pointers, replaced nodes |

It carries `data-phase`:

| phase | Meaning | Style from the component |
|-------|------|------|
| `on` | The current step | Opaque |
| `done` | Already explained | Half transparent |
| `off` | Not reached yet | Faint but not hidden, so the reader always sees the whole figure |
| `all` | The "all" state | Opaque, no emphasis |
| `gone` | Has `until` and is superseded, or the state is "all" | Not rendered (`display: none`) |

The component only sets opacity. Write the accent color and flowing dashes in the figure yourself; `FigureStep` carries `group/step`:

```tsx
<FigureStep at="b">
  <rect className="stroke-muted-foreground group-data-[phase=on]/step:stroke-primary" />
  <path className="stroke-muted-foreground group-data-[phase=on]/step:[stroke-dasharray:5_4] group-data-[phase=on]/step:motion-safe:animate-[hulian-paper-flow_0.9s_linear_infinite]" />
</FigureStep>
```

Draw a moving part twice and give the old copy `until`. Below, the `main` pointer sits on C2 in (a)(b) and moves to C3 from (c); the "all" state and the printed main figure keep only the one on C3:

```tsx
<FigureStep at="a" until="c"><RefLabel x={150} label="main" /></FigureStep>
<FigureStep at="c"><RefLabel x={240} label="main" /></FigureStep>
```

The `hulian-paper-flow` keyframes live in preset-core.css of `@hulianui/tokens`.

## FigureRaster

The per-pixel part of a figure: heatmaps, attention matrices, micrographs. An `<image>` element that **must sit inside the figure's `<svg>`**. `draw` paints on an offscreen canvas, which is encoded as PNG into `href`. Extends `SVGAttributes<SVGImageElement>` (without `href`); `ref` lands on the `<image>`.

| Name | Type | Default | Description |
|------|------|------|------|
| width * / height * | number | - | Size in the figure's SVG coordinates (`viewBox`) |
| x / y | number | 0 | Position in the figure's SVG coordinates |
| resolution * | `[width, height]` | - | Canvas size in pixels. For a data raster, usually the number of data columns and rows |
| draw * | `(ctx, { width, height, color }) => void` | - | Paints the canvas. Must depend only on data. Compared by reference: an unchanged reference does not redraw, so hoist it to module scope or wrap it in `useCallback` |
| pixelated | boolean | false | One pixel is one data cell: keep hard square edges when scaled up instead of interpolating. Leave false for photographic rasters |
| preserveAspectRatio | string | `"none"` | Stretches to fill `width × height` by default, so data cells map one-to-one onto coordinates |

`color(css)` resolves any CSS color (including tokens such as `var(--color-chart-1)`) to a 0–255 `[r, g, b, a]` in the theme where the raster sits, ready to write into `ImageData`.

```tsx
const drawHeat = (ctx, { width, height, color }) => {
  const positive = color("var(--color-chart-1)");
  const negative = color("var(--color-chart-3)");
  const zero = color("var(--color-bg)");
  const image = ctx.createImageData(width, height);
  // … interpolate each pixel between zero and positive / negative by its value
  ctx.putImageData(image, 0, 0);
};

<PaperFigure id="encoding" states={presets} printSubfigures={["c4", "c40"]} caption="…">
  {({ dim }) => (
    <svg viewBox="0 0 520 352">
      <FigureRaster x={4} y={4} width={512} height={176} resolution={[128, 64]} pixelated draw={drawHeat} />
      <rect x={4 + dim * 4} y={4} width={4} height={176} className="fill-none stroke-foreground" />
    </svg>
  )}
</PaperFigure>
```

- **Why inside the SVG**: the picture is still a single `<svg>`, so the raster shares `viewBox` coordinates with the vector parts (axes, markers, curves). Each print sub-figure paints its own copy, the presenter scales it with the stage, and SVG export embeds it as is: the result is a mixed SVG.
- **Theme**: colors are resolved where the raster sits. It redraws whenever any `data-theme` on the page changes or the system color scheme flips. Export paints it inside the light slot, so exports are always light.
- **pixelated**: encoding scales up by an integer factor with nearest-neighbour sampling (about 3× the displayed size, long edge capped at 4096 px). The cells stay sharp even in Word and PDF converters that ignore `image-rendering`.
- **Timing**: drawing happens in a layout effect. Before the browser prints, `Paper` switches to print synchronously, so sub-figure rasters are painted before the print snapshot. Server rendering outputs an `<image>` without `href`; its box is already reserved, so nothing jumps.
- The raster does not handle pointer events. To pick a point on it, lay a transparent `<rect>` over it for the events, and leave keyboard input to a control below the figure (such as `Slider`).
- Data with both signs needs two hues and a neutral midpoint, for example `chart-1` / `chart-3` with the background. Do not use status colors such as `warning` / `danger`.

## FigRef

An `<a href="#id">`. Extends `AnchorHTMLAttributes` (without `href`); `ref` lands on the `<a>`.

| Name | Type | Default | Description |
|------|------|------|------|
| to * | string | - | `id` of the target figure |
| state | string | - | Preset to switch to; without it the link only jumps to the figure |
| children | ReactNode | "Figure N" | Reference text. Without it the number is taken in document order (after mount); when `state` is one of the figure's print sub-figures the sub-figure letter is appended, e.g. "Figure 1(b)", matching the printed version (every step of a `ProcessFigure` is a sub-figure by default) |

On click it switches the figure to `state`, scrolls the figure into view when it is off screen (without smooth scrolling under reduced motion), and outlines the figure for about 1.2 seconds. Without JS or outside a `Paper` it is a plain anchor. In print mode the link color and underline are removed.

Do not put a reference inside a control that is already interactive, such as `render={<FigRef/>}` on a `Button`: the reference is an `<a>`, so it brings the link color and underline along and breaks the button semantics. Use `usePaperNavigate` instead.

## PaperPresenter

Presentation mode for talks and defenses: a full-screen layer that turns the presets of every figure in the paper into one set of slides. Put it anywhere inside `Paper`, usually in a toolbar.

| Name | Type | Default | Description |
|------|------|------|------|
| trigger | `ReactElement` | - | The button that opens the presenter, such as `<Button>Present</Button>`. Focus returns to it on exit |
| open | boolean | - | Controlled open state. Without `trigger`, open it with this; focus returns to the element that had focus before opening |
| defaultOpen | boolean | false | Uncontrolled initial open state |
| title | ReactNode | - | Title on the left of the header, usually the paper title |
| slides | `PresenterSlide[]` | see below | The whole slide list, `{ figure: figure id, state: preset name }` |
| controls | boolean | true | Whether to render the figure's own controls (step buttons, parameter toggles) |
| hideChrome | boolean | false | Open with the presentation interface hidden (title, counter, exit, pager), leaving only the slide. "Hide interface" in the top bar folds it away; "Show interface" in the top-right corner brings it back |
| className | string | - | Added to the root of the full-screen layer |

| Event | Type | Description |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | Opened or closed (including Esc and the exit button) |
| onSlideChange | `(slide: PresenterSlide, index: number) => void` | Fired on every slide change, including the first slide on open |

- **Where slides come from**: by default, the `presentStates` of each figure in document order. `PaperFigure` defaults to every preset, `ProcessFigure` to each step plus "all". Pass `slides` to reorder them or interleave figures; missing figures or presets warn once in development and are skipped. Figure numbers in the header always follow document order.
- **No DOM is moved**: the presenter draws each figure again with the same `children(state)` function. The figure in the text stays where it is with its state unchanged, so readers come back to the step they left. When the figure's props change (a language switch, say), the presenter redraws too.
- **Figure controls still work**: when a control calls `select` with a preset, the presenter jumps to that slide (the step buttons of `ProcessFigure` become slide jumps). Values from `setState` only override the current slide and are dropped when the slide changes.
- **The interface can be folded away**: "Hide interface" in the top bar takes the title, counter, exit and pager away, leaving only the slide; "Show interface" in the top-right corner brings them back. Use `hideChrome` to open that way when the audience should only see the picture.
- **Keys**: `→` / `Space` / `PageDown` next, `←` / `PageUp` previous, `Esc` exits. Arrow keys are left to the control when focus is in an input, slider, radio group and the like; Space on a focused button presses that button.
- **Accessibility**: `role="dialog"`, named "Presentation" (follows the UI language). Focus is trapped inside, starts on "Next slide", and returns to the trigger on exit. Content outside the presenter is hidden from screen readers.
- The presenter renders outside the `Paper` DOM (in a portal). When it opens it takes the font where `Paper` sits (including overrides such as `--paper-font`) and its theme island (the nearest `data-theme` ancestor of `Paper`, followed if it changes while presenting). A container that only recolors through custom properties, without `data-theme`, does not reach the presenter. If a figure's render function depends on a context placed between `Paper` and the figure, that context is not available while presenting.
- SVG figures fill the stage height in the presenter (width follows the `viewBox` ratio), so no separate presentation size is needed.

```tsx
<Paper>
  <PaperPresenter title="Attention Is All You Need" trigger={<Button>Present ▶</Button>} />
  <ProcessFigure id="transformer" steps={steps} caption="…">…</ProcessFigure>
  <PaperFigure id="attention" states={presets} presentStates={["scaled64", "raw512", "scaled512"]} caption="…">
    {(state) => <AttentionBars state={state} />}
  </PaperFigure>
</Paper>
```

## Per-state SVG export

For submission, insert the vector figure of each state into Word, or convert it to PDF for LaTeX. Use `usePaperExport()` inside `Paper`:

```tsx
const { exportFigureSvg } = usePaperExport();
const svg = await exportFigureSvg("transformer", "b", { background: "white" }); // SVG text
```

`exportFigureSvg(id, stateKey, options?) => Promise<string>`:

| Option | Type | Default | Description |
|------|------|------|------|
| theme | `"light"` \| `"current"` | `"light"` | Which theme to take colors from. Light by default, so a reader in dark mode still exports a figure for white paper |
| background | string | transparent | Background, any CSS color |
| width | number | `viewBox` width | Output `width` in px; height keeps the ratio |

- **How it works**: `Paper` briefly mounts an off-screen slot, draws the preset with the figure's own `children(state)` (with `mode` set to `"print"`), waits for fonts, then reads each element's computed style and writes it back as SVG presentation attributes (`fill="#…"`, `stroke-width="1.3"`…), dropping `class` / `style` / `data-*`. The figure in the text is not touched.
- **Colors**: Tailwind classes and CSS variables stop working outside the page, and browsers often report computed colors as `oklab()` / `oklch()`, which Word and Inkscape do not read. Export converts every color to `#rrggbb` and folds transparency into `fill-opacity` / `stroke-opacity`.
- **Frozen**: animations and transitions are off in the slot, so flowing dashes stop at their start; `FigureStep` phase opacity follows the exported step. Elements with `display: none` are left out, and `aria-label` becomes a `<title>` (Word uses it as alt text).
- **Text stays as `<text>`** with the `Paper` font stack. The whole computed stack is written: on a machine without STIX Two Text it falls back to Times New Roman, and Chinese lands on the fonts in `--hl-font-serif` or the system serif (Song). In LaTeX use `\includesvg` (the svg package, which needs Inkscape) or convert to PDF first, with the fonts installed on the converting machine.
- **Requirement**: the figure must draw a single `<svg>`. A bare canvas, HTML, or `<foreignObject>` rejects with the reason (for a canvas raster use `FigureRaster` inside the `<svg>`; export embeds it as PNG), as do a missing figure or preset.
- CSS `transform`s inside the figure (such as Tailwind `rotate-*`) are not written to the file; use the SVG `transform` attribute to rotate or move parts.

## Linking formulas to figures

A term in a formula can be clicked or hovered, and it highlights together with the figure's state or controls. There are two halves:

- **`PaperEquation`** comes from `@hulianui/ui/math`. It renders with KaTeX, which would land in every consumer's bundle if it were in the main entry.
- **`usePaperTerm`** comes from `@hulianui/ui`. Figure controls use it, and it does not depend on KaTeX.

```tsx
import { PaperEquation } from "@hulianui/ui/math";
import { usePaperTerm } from "@hulianui/ui";

<PaperEquation
  number={1}
  terms={{
    dk: { label: "√dₖ: toggle scaling in Figure 2", figure: "attention", state: (s) => ({ ...s, scaled: !s.scaled }) },
  }}
>
  {String.raw`\mathrm{softmax}\left(\frac{QK^T}{\term{dk}{\sqrt{d_k}}}\right)V`}
</PaperEquation>

function ScaleToggle({ fig }) {
  const term = usePaperTerm("dk");
  return <Button {...term.bind} className="data-[active]:text-primary" onClick={…}>Toggle scaling</Button>;
}
```

### PaperEquation

Extends `HTMLAttributes<HTMLDivElement>` (without `children`); `ref` lands on the root element.

| Name | Type | Default | Description |
|------|------|------|------|
| children * | string | - | LaTeX for the whole formula (math mode, no `$`). Mark interactive terms with `\term{name}{…}`; a name may contain only letters, digits, `_` and `-` |
| terms | `Record<string, EquationTerm>` | - | Settings for each term, keyed by name |
| number | ReactNode | automatic | Number on the right. Inside `Paper`, leaving it out numbers the equation automatically, see "Equation numbers and EqRef" below; a value renders as `(value)` and takes no automatic number (like LaTeX `\tag`); `null` / `false` leaves it unnumbered. Outside `Paper`, leaving it out means no number |
| display | boolean | true | Display (block) layout |
| macros | `Record<string, string>` | - | Custom macros passed to KaTeX; `\term` is reserved |

```ts
interface EquationTerm {
  label: string;     // accessible name and hover hint: say what a click does
  figure?: string;   // figure id driven by a click; without it the term only highlights
  state?: string | ((current: unknown) => unknown); // a preset name, or the next state from the current one
}
```

- **Click**: a preset name switches the figure to that preset; a function computes the new state from the figure's current state (toggling a switch, say). Then, as with `FigRef`, the figure scrolls into view when needed and is outlined.
- **Highlight**: hovering or focusing a term sets `active` on controls bound with `usePaperTerm` under the same name; hovering or focusing such a control gives the term `data-active`.
- **Accessibility**: KaTeX's HTML layer is `aria-hidden` as a whole (screen readers read the MathML next to it), so the terms themselves cannot take focus. `PaperEquation` places a transparent real `<button>` (with `label` as its `aria-label`) over each clickable term. It is reachable with Tab and draws its focus ring on the term, and it is repositioned after size changes and font loading.
- **Safety**: `\term` expands to KaTeX's `\htmlData`. Trust allows only that form, with `paper-term` as the only attribute and a safe name as its value; `\href`, `\htmlClass`, `\includegraphics` and the rest stay rejected.
- In print mode no buttons are placed and nothing highlights. A term written in the formula but missing from `terms` warns once in development.

### usePaperTerm

`usePaperTerm(name) => { active, bind }`. Spread `bind` onto a control (or part of a figure), and hovering or focusing it lights up the term with the same name in the formula. While highlighted, `bind` carries `data-active`, so you can style with `data-[active]:`. Outside `Paper`, `active` is always false.

### Equation numbers and EqRef

```tsx
<p>… as shown in <EqRef to="attention" />.</p>   {/* "Eq. (1)" */}
<PaperEquation id="attention">{String.raw`\mathrm{softmax}(QK^T/\sqrt{d_k})V`}</PaperEquation>  {/* (1) */}
<PaperEquation number="A.1">{…}</PaperEquation>   {/* (A.1), takes no number */}
<PaperEquation number={null}>{…}</PaperEquation>  {/* unnumbered */}
<PaperEquation>{…}</PaperEquation>                {/* (2) */}
```

- **Automatic numbering**: inside `Paper`, an equation without `number` takes the next value of a CSS counter, like figure numbers, so numbers exist in server rendering and in print without waiting for JS. A hand-written `number` is shown instead and takes no number; `null` / `false` leaves it unnumbered.
- **`EqRef`** is imported from `@hulianui/ui` (no KaTeX). It is an `<a href="#id">` that extends `AnchorHTMLAttributes` (without `href`); `ref` lands on the `<a>`.

| Name | Type | Default | Description |
|------|------|------|------|
| to * | string | - | `id` of the target equation (set on `PaperEquation`) |
| children | ReactNode | "Eq. (N)" | Reference text. When omitted, the number is taken in document order (available after mount); a hand-written number is shown as is |

- Click: scrolls to the equation if it is out of view (without smooth scrolling under reduced motion) and outlines it for about 1.2 seconds. Without JS or outside `Paper` it falls back to a plain anchor; in print mode the link color is removed.
- "Eq." belongs to the paper content: it follows `labels.equation` on `Paper`, and the UI language when not set.
- Clicking a reference to a missing equation warns once; a reference to an equation with `number={null}` shows only "Eq." and warns once in development.
- Equation ids share the page's DOM id space with figure and reference ids, so do not reuse names.

## Title block and references

### PaperHeader

The title block: the title sits between a thick rule above and a thin rule below, followed by authors, one line of details, and the abstract. Unlike `Paper`, it ships with its own layout. Extends `HTMLAttributes<HTMLElement>` (without `title`); `ref` lands on the `<header>`.

| Name | Type | Default | Description |
|------|------|------|------|
| title * | ReactNode | - | The paper title |
| titleAs | `ElementType` | `"h1"` | Tag for the title |
| authors | `PaperAuthor[]` | - | `{ name, affiliation?, email? }`, centered and wrapping |
| meta | ReactNode | - | One line under the authors, such as venue, date, or arXiv id |
| abstract | ReactNode | - | The abstract. A string is wrapped in a paragraph; the heading is `labels.abstract` |

### Bibliography and Cite

```tsx
<p>… machine translation <Cite to={["hochreiter1997", "sutskever2014"]} />.</p>
<Bibliography
  entries={[
    { id: "hochreiter1997", content: <>Sepp Hochreiter and Jürgen Schmidhuber. Long short-term memory. …</> },
    { id: "sutskever2014", content: <>Ilya Sutskever, Oriol Vinyals, and Quoc V. Le. …</> },
  ]}
/>
```

`Bibliography` extends `HTMLAttributes<HTMLElement>` (without `title`); `ref` lands on the `<section>`.

| Name | Type | Default | Description |
|------|------|------|------|
| entries * | `BibliographyEntry[]` | - | `{ id, content }` in numbering order; the first is [1]. `id` is also the DOM id of the entry's `<li>` |
| title | ReactNode | `labels.references` | Heading; pass `null` for none |
| titleAs | `ElementType` | `"h2"` | Tag for the heading |

`Cite` is a `<span>`. Extends `HTMLAttributes<HTMLSpanElement>` (without `children`); `ref` lands on the `<span>`.

| Name | Type | Default | Description |
|------|------|------|------|
| to * | `string` \| `string[]` | - | The cited entry id, or several |

- **Numbering** follows the order in `Bibliography`. Several citations at one place are sorted and deduplicated; two neighbors read `[1, 2]`, and three or more in a row collapse to `[1–3]`, each number linking to its entry.
- **Click**: scrolls to the entry (without smooth scrolling under reduced motion) and outlines it for about 1.2 seconds. Without JS it is a plain anchor. In print mode the link color is removed.
- Numbers appear once `Bibliography` has mounted and registered (as with the automatic numbers of `FigRef`); server rendering shows `[?]` first. Unknown ids show `?` and warn once in development.
- Use one `Bibliography` per `Paper`. With two, a warning is shown and `Cite` follows the one registered last.
- The "Abstract" and "References" headings belong to the paper content, so they follow the `labels` of `Paper` (`abstract`, `references`), not the UI language.
- Entry ids share the page's DOM id space with figure ids, so do not reuse a name.

## Section numbers, SecRef and outline

```tsx
<Paper>
  <PaperOutline className="sticky top-6" />               {/* table of contents, same numbers as the body */}
  <p>Details in <SecRef to="objects" />.</p>              {/* "Section 2.2" */}
  <PaperSection id="intro" title="Introduction">...</PaperSection>    {/* 1 Introduction */}
  <PaperSection id="model" title="Model">
    <PaperSection id="trees" title="Three trees">...</PaperSection>   {/* 2.1 */}
    <PaperSection id="objects" title="Objects">...</PaperSection>     {/* 2.2 */}
  </PaperSection>
  <PaperSection id="ack" title="Acknowledgements" numbered={false}>...</PaperSection>
</Paper>
```

### PaperSection

A `<section>`. Extends `HTMLAttributes<HTMLElement>` (without `title`); `ref` lands on the `<section>`.

| Name | Type | Default | Description |
|------|------|------|------|
| id * | string | - | Section id. `SecRef` / `PaperOutline` find the section by it; also the `<section>` `id` |
| title * | ReactNode | - | Heading; the hierarchical number is prepended automatically |
| titleAs | `ElementType` | `h2` / `h3` / `h4` by depth | Heading tag |
| titleClassName | string | - | Added to the heading to change its typography |
| numbered | boolean | true | Whether the section is numbered. Pass `false` for acknowledgements or appendices; do not nest numbered subsections inside an unnumbered section |

- **Numbering**: CSS counter `paper-section`. Nested subsections become "2.1", "2.1.3" automatically, with numbers present in server rendering and print. `PaperSection` must be inside `Paper`.
- **Heading style**: unlike the body text, which `Paper` leaves alone, section headings ship a restrained default (size shrinks with depth). Override with `titleClassName`.

### SecRef

An `<a href="#id">`. Extends `AnchorHTMLAttributes` (without `href`); `ref` lands on the `<a>`.

| Name | Type | Default | Description |
|------|------|------|------|
| to * | string | - | `id` of the target section |
| children | ReactNode | "Section N" | Reference text. When omitted, the number follows document order and nesting (available after mount; server rendering shows "Section ?"). An unnumbered target shows its title |

- Click: scrolls to the heading if it is out of view (no smooth scrolling with reduced motion) and outlines it for about 1.2 s. Without JS, or outside `Paper`, it is a plain anchor; print mode drops the link color.
- "Section N" is paper content: it follows `labels.section` on `Paper` (a function, `(n) => string`), and falls back to the interface language.

### PaperOutline

The table of contents. Generated from the section registry, with the same numbers as the headings. Internally it is an [Anchor](../anchor/anchor.en.md) (scroll spy + smooth jump) and accepts every `Anchor` prop except `items` (`offsetTop`, `getContainer`, `onChange`).

| Name | Type | Default | Description |
|------|------|------|------|
| depth | `1` \| `2` | 2 | How many levels to list. `Anchor` holds at most two, so third-level subsections are left out |

- Place it anywhere inside `Paper`, usually a sidebar: `<Paper as="div">` wrapping a two-column "outline + `<article>` body" layout.
- Items appear after mount (empty in server rendering); nothing renders in print mode. When the scroll container is not the window, pass `getContainer` as `Anchor` requires.
- Section ids share the page DOM id space with figures, equations and references; keep them distinct.

## Imperative navigation

Do not nest a reference inside a control that is already interactive, such as `Button` or `Menu.Item` (`render={<FigRef/>}`): the reference is an `<a>`, so it inherits the link color and underline and breaks the button semantics. Use `usePaperNavigate()` and navigate from the event instead:

```tsx
const navigate = usePaperNavigate();

<Button onClick={() => navigate.figure("attention", "b")}>See Figure 2(b)</Button>
<Button onClick={() => navigate.equation("attention-eq")}>See Eq. (1)</Button>
<Button onClick={() => navigate.section("method")}>See Section 2</Button>
```

| Method | Description |
|--------|-------------|
| figure(id, state?) | Jump to a figure. `state` is a preset name; when given, switch to it first. Then scroll it into view and outline it for about 1.2 seconds, exactly like `FigRef` |
| equation(id) | Jump to an equation, scroll it into view and outline it; like `EqRef` |
| section(id) | Jump to a section, scroll to its heading and outline it; like `SecRef` |

- It only navigates; the **URL hash is left alone**. For a shareable anchor link that can open in a new tab, keep using `FigRef` / `SecRef` / `EqRef`.
- A missing target warns once in development and does nothing. Calling it outside `Paper` does not navigate and warns once in development too.
- Call `usePaperNavigate()` itself inside `Paper`; pass the returned methods to any event handler.

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
