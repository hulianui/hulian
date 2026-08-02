---
slug: funnel
name: Funnel
category: data-display
group: collection
tags: []
exports: [Funnel, computeFunnel]
status: enriched
---

# Funnel

> Funnel · stage size proportional to value, inter-stage conversion badges, vertical or horizontal layout, semantic tones, custom rendering, and a zero-safe geometry helper · data-display/collection

## When to use

Use Funnel for attrition in one linear process, such as visit to registration to payment. Use Sankey for branching directed flows, or [Table] for flat values.

## Import
```ts
import { Funnel, computeFunnel } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| stages* | `FunnelStage[]` | — | `{id, label, value, tone?}` stages sized proportionally to value. |
| orientation | `"vertical" \| "horizontal"` | `"vertical"` | Rows sized by width or columns sized by height. |
| showConversion | `boolean` | `true` | Shows conversion between adjacent stages. |
| ariaLabel | `string` | `"Funnel chart"` with `enUS` | Accessible chart name. Pass a localized value for other interfaces. |
| conversionLabel | `string` | `"Conversion"` with `enUS` | Conversion badge prefix. Pass a localized value for other interfaces. |
| className | `string` | — | Root class name. |

`FunnelStage.tone` is `"neutral" | "brand" | "success" | "warning" | "danger"`, defaulting to brand.

## Events

| Event | Type | Description |
|------|------|------|
| onStageClick | `(stage) => void` | Called from a stage. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderStage | `(stage, ctx: FunnelRenderCtx) => ReactNode` | Replaces label and value; context contains `widthRatio`, nullable `conversion`, and `index`. |

## Example
```tsx
<Funnel
  stages={[
    { id: "in", label: "Incoming", value: 1240, tone: "brand" },
    { id: "route", label: "Routed", value: 1080, tone: "brand" },
    { id: "exec", label: "Executed", value: 860, tone: "warning" },
    { id: "done", label: "Completed", value: 720, tone: "success" },
  ]}
  orientation="vertical"
  showConversion
  ariaLabel="Funnel chart"
  conversionLabel="Conversion"
  onStageClick={(s) => console.log(s.id)}
/>
```

## Usage notes

- Tone is a fixed semantic enum. Use `renderStage` for arbitrary colors.
- `computeFunnel` returns `null` conversion for the first stage and never divides by zero; custom renderers must handle `conversion == null`.
- `Funnel` has no client boundary, so server components and server-compatible `renderStage` functions remain supported. Localize `ariaLabel` and `conversionLabel` explicitly when needed.

## Related

[Table](../table/table.md) · [Book3D](../book-3d/book-3d.md) · [ProTable](../pro-table/pro-table.md) · [PricingTable](../pricing-table/pricing-table.md) · [JsonViewer](../json-viewer/json-viewer.md) · [EditableTable](../editable-table/editable-table.md)
