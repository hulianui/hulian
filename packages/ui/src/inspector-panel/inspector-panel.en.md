---
slug: inspector-panel
name: InspectorPanel
category: forms
group: advanced
tags: []
exports: [InspectorPanel, MIXED, borderFields, colorFields, effectsFields, fieldTokens, formatLength, inspectorSections, isMixed, layoutFields, matchToken, parseLength, readInspectorValue, spacingSides, tokenColor, typographyFields]
status: enriched
---

# InspectorPanel

> A property inspector for design tools, driven by a **field schema** rather than five hardcoded categories: hand it `{ key, label, kind }` and it derives the control. Seven control kinds reskinned from existing form parts, a linked four-side spacing control, theme token color binding, a MIXED placeholder for multi-selection, and a commitMode that decides whether edits emit while dragging or on release. forms/advanced.

## When to use

Use InspectorPanel for the property panel that stays bound to the current selection in a design tool or low-code builder. Describe the properties as a schema; the panel derives a control per `kind`, reads values by `key`, and emits changes by `key`.

It is not a form: for submission semantics, validation, and field dependencies use [Form](../form/form.md) or [ProForm](../pro-form/pro-form.md). To edit a single property, reach for [Slider](../slider/slider.md), [ColorPicker](../colorpicker/colorpicker.md), or [Segmented](../segmented/segmented.md) directly. The five built-in presets are only a default; domain properties such as weight, link target, or pinned work just as well, as shown in the custom schema example.

## Import
```ts
import { InspectorPanel, MIXED, inspectorSections, layoutFields, spacingSides } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| onChange* | `(path: string, value: InspectorValue) => void` | — | Emits a single path change; `path` is the `key` declared on the field. |
| props | `Record<string, unknown>` | — | Property value table. Flat keys win first, then `a.b.c` dotted lookup. |
| selectedElement | `string \| null` | — | Selection identifier. Passing `null` shows the empty state; omitting it skips the empty check. |
| sections | `InspectorSection[]` | — | Full category schema. When present, `categories` is ignored. |
| categories | `readonly string[]` | — | Picks built-in presets and orders them **as given** (`layout`, `color`, `typography`, `border`, `effects`). |
| tokenSource | `readonly InspectorToken[]` | — | Theme tokens offered by color controls; shaped like the docs site `SEMANTIC_GROUPS` swatches. |
| commitMode | `"change" \| "commit"` | `"change"` | `change` emits on every drag frame and keystroke; `commit` emits on release, blur, or Enter. |
| density | `"comfortable" \| "compact"` | `"comfortable"` | Row height and padding density; `compact` tightens to roughly the Sketch inspector scale. |
| onBatchChange | `(changes: InspectorChange[]) => void` | — | Batch emit when one interaction changes several paths; see Events. |
| title | `ReactNode` | From locale | Panel heading. Pass `null` to drop the header. |
| emptyText | `ReactNode` | From locale | Empty state copy. |
| labels | `Partial<InspectorPanelLabels>` | — | Overrides the copy taken from the locale, such as `mixed`, `linkSides`, and the four side names. |
| className | `string` | — | Class name on the panel shell. |

Field types form the `InspectorField` discriminated union, narrowed by `kind`:

| kind | Derived control | Fields specific to this kind |
|------|------|------|
| spacing | Four numeric inputs plus a link toggle | `sides?` to override derived paths, `min` / `max` / `step` / `unit` |
| color | Swatch that opens ColorPicker, a text input, and a token palette | `tokenGroup?` |
| length | Slider plus numeric input | `min` / `max` / `step` / `unit` |
| number | Numeric input | `min` / `max` / `step` / `unit` |
| enum | Segmented up to four options, Select beyond that | `options`*, `display?: "segmented" \| "select"` |
| toggle | Switch | — |
| text | Text input | `placeholder?` |

Shared fields: `key`* is the property path and the emitted path, `label`* is the visible label and the control `aria-label`, plus optional `hint` and `disabled`.

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(path: string, value: InspectorValue) => void` | Fires once per changed path. A linked spacing edit fires four times in the same tick. |
| onBatchChange | `(changes: InspectorChange[]) => void` | When provided, **multi-path** changes go through it only and no longer emit per path; single-path changes always use `onChange`. |

The emitted shape is decided by the field, not by what was typed. With `unit` the panel emits the string `"12px"`; without `unit` it emits the number `12`. Clearing a numeric input emits `null`, meaning delete the property rather than set it to `0`. A token swatch emits that token's `value`, or `var(--token)` when no literal value was given.

## Examples
```tsx
const [style, setStyle] = useState<Record<string, unknown>>({ paddingTop: "24px" });

<InspectorPanel
  selectedElement="Card / Title"
  props={style}
  tokenSource={[
    { token: "color-primary", label: "Primary", group: "text" },
    { token: "color-surface", label: "Card surface", group: "surface" },
  ]}
  // A linked edit fires four times, so the updater must be functional
  onChange={(path, value) => setStyle((prev) => ({ ...prev, [path]: value }))}
/>
```

A custom schema, since the panel knows nothing about any specific property:
```tsx
<InspectorPanel
  title="Card settings"
  sections={[
    {
      id: "meta",
      label: "Content",
      fields: [
        { key: "headline", label: "Headline", kind: "text" },
        { key: "featured", label: "Pinned", kind: "toggle" },
        { key: "weight", label: "Weight", kind: "number", min: 0, max: 999, hint: "Higher sorts first" },
      ],
    },
  ]}
  props={values}
  onChange={(path, value) => setValues((prev) => ({ ...prev, [path]: value }))}
/>
```

Mixed values across a multi-selection:
```tsx
<InspectorPanel
  selectedElement="3 elements"
  commitMode="commit"
  props={{ fontSize: MIXED, opacity: MIXED, textAlign: "left" }}
  onChange={apply}
/>
```

The pure helpers stand alone, so building a schema or normalizing values needs no mounted component:
```ts
spacingSides("padding");                 // { top: "paddingTop", right: "paddingRight", … }
spacingSides("margin", { top: "gapY" }); // override one side, derive the rest
parseLength("1.5rem");                   // 1.5
formatLength(12, "px");                  // "12px"
inspectorSections(["effects", "layout"]) // presets in the given order
readInspectorValue({ style: { color: "red" } }, "style.color"); // "red"
```

## Accessibility

- Every control carries an `aria-label` taken from the field `label`. The four spacing inputs are named per side, so they never share one name.
- In a `length` row the slider and the numeric input are two ways into the same property and share one accessible name; the slider points at the visible label through `aria-labelledby`, and the differing roles keep them distinguishable.
- The link toggle exposes its state through `aria-pressed` rather than color alone.
- Token swatches take their accessible name from `tokenSource[].label`, falling back to `token`, rather than the `var(--color-x)` string, so a screen reader announces the human name instead of a variable. The token name printed under the palette is a current-value readout for sighted users, not an accessibility fallback.
- Category folding uses [Collapsible](../collapsible/collapsible.md), which owns `aria-expanded` and keyboard access.
- Mixed values are never conveyed by gray text alone: text and numeric kinds use a `placeholder`, while toggle and enum kinds put readable text beside the control.

## Pitfalls

- **In a design-tool context, turn on `columns` and `density="compact"`.** Values such as `X / Y / rotation` belong in one row of three cells with the label inlined into the input; one field per row with an 80px label column costs three times the height. In multi-column mode number fields inline their labels automatically, and the label doubles as a **scrub handle** (one `step` per horizontal pixel, ten times faster with Shift). Below 260px the grid falls back to a single column, since cells narrower than about 70px make columns pointless.
- The scrub handle is `aria-hidden` and out of the tab order: the accessible path for changing a value is the input itself (arrow keys or typing). Dragging is a mouse accelerator and should not add another control for a screen reader to announce.
- **Repeatable groups — several fills, borders, or shadows on one element — are not supported yet.** The current schema maps one key to one value; multiple entries of the same kind would require the value model to grow from `Record<string, unknown>` into a nested array shape, which is a separate design and out of scope for this release. For now, flatten them yourself into keys such as `fill1Color` and `fill2Color`.

- **Enum fields degrade from a segmented control to a select in narrow panels.** Below 260px — a common inspector sidebar width — any `kind: "enum"` field that does **not** set `display` explicitly switches to `select`, because four CJK segments cannot fit and forcing them would leave options that exist but cannot be reached (#114). An explicit `display` is always honoured.
- The decision is based on **the panel's own width** through a ResizeObserver, not the viewport: what matters is how wide the control is. jsdom has no ResizeObserver, so the degrade never triggers in unit tests.

- **`onChange` can fire several times in one tick** (four times for a linked spacing edit). Consumers must use a functional update, `setState((prev) => …)`. Writing `setState({ ...style, [path]: value })` lets the last three calls overwrite the first three, which looks like "only one side applied". Pass `onBatchChange` to receive them as one call instead.
- `commitMode` covers sliders, inputs, and the ColorPicker inside the swatch popover alike. Under `commit` the picker emits on pointer release, blur, or Enter, and every mid-drag frame stays inside the panel; the picker runs uncontrolled during that drag and resyncs only when the external `props` value changes.
- `tokenSource[].token` **must carry the `color-` prefix** (`color-primary`, not `primary`). Tailwind v4 `@theme` names include the prefix, and a bare name paints nothing while raising no error.
- The mixed sentinel is `Symbol.for("hulian.inspector.mixed")` and **cannot survive JSON serialization**. If the property table crosses the network or storage, translate it to your own marker at that boundary and back.
- Clearing a numeric input emits `null`, not `0`. Treat `null` as "delete this property" so that "unset" stays distinct from "set to zero".
- The panel holds no domain value. If `props` is not written back, the control will not move, apart from the draft in `commit` mode and the slider mid-drag. It is a controlled component, not a self-contained editor.
- The panel chrome (`title`, empty state, `mixed`, `linkSides`, the four side names, the two color control names) follows the ConfigProvider locale, so wrapping the tree in `<ConfigProvider locale={enUS}>` turns it English. Priority is `labels` / `title` / `emptyText` prop first, then the locale, then the built-in Chinese fallback.
- **Built-in preset field labels are still Chinese** and are not covered by the locale — they live in the `sections` data, not in the panel. For a fully English surface, pass your own `sections`.

## Related
[Form](../form/form.md) · [ProForm](../pro-form/pro-form.md) · [ColorPicker](../colorpicker/colorpicker.md) · [ColorSwatchPicker](../color-swatch-picker/color-swatch-picker.md) · [Slider](../slider/slider.md) · [Segmented](../segmented/segmented.md) · [Collapsible](../collapsible/collapsible.md) · [Flow](../flow/flow.md)
