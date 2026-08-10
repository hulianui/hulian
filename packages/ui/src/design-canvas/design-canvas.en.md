---
slug: design-canvas
name: DesignCanvas
category: data-display
group: collection
tags: []
exports: [DesignCanvas, canvasToScreen, itemsBounds, moveRect, normalizeRect, resizeRect, snapTo]
status: enriched
---

# DesignCanvas

> Visual design canvas · dependency-free Pointer Events · infinite pan and zoom (pointer-anchored wheel zoom, space / middle / right drag to pan) with a selection box, drag to move, and eight-way resize that flips past the anchored edge · controlled `items` own their geometry while `children` act as a free layer, and child elements are recognised through `data-canvas-item` event delegation · fully keyboard reachable (Tab, arrow nudge, Alt+arrow resize, Delete) · geometry extracted into unit-tested pure functions · data-display/collection

## When to use

Use DesignCanvas to arrange rectangles freely on an infinite surface: page drafts, boards, poster or slide layouts, and the canvas area of a low-code visual editor. Position and size are the data; there is no "what connects to what" topology.

- To orchestrate nodes and edges (AI workflows, DAGs, flowcharts) use [Flow](../flow/flow.md). Flow owns connection handles, Bezier edges, and topological auto layout; DesignCanvas draws no edges at all.
- To scale one fixed design size to fill a container (big-screen dashboards) use [FitScreen](../fit-screen/fit-screen.md). It has no panning, no selection, and no editing.
- For cards moving between columns use [Kanban](../kanban/kanban.md); for one reorderable list use [Sortable](../sortable/sortable.md).

DesignCanvas reuses Flow's viewport math (`screenToCanvas`, `zoomAtPoint`, `clampZoom`), so both canvases share the same wheel feel and coordinate convention and can be mixed on one page without a behavioural mismatch.

## Import
```ts
import { DesignCanvas, canvasToScreen, itemsBounds, moveRect, normalizeRect, resizeRect, snapTo } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| items | DesignCanvasItem[] | [] | Controlled `{ id, x, y, width, height, locked?, label? }` elements whose geometry the canvas owns. |
| zoom | number | — | Controlled zoom. When present the canvas only reports `onZoomChange`. |
| defaultZoom | number | 1 | Initial zoom when uncontrolled. |
| pan | { x, y } | — | Controlled pan: the screen-pixel offset of the canvas origin inside the container. |
| defaultPan | { x, y } | { x: 0, y: 0 } | Initial pan when uncontrolled. |
| selectedElement | string \| null | — | Controlled selection (element id or path). |
| defaultSelectedElement | string \| null | null | Initial selection when uncontrolled. |
| minZoom | number | 0.1 | Lower zoom bound. |
| maxZoom | number | 4 | Upper zoom bound. |
| grid | boolean \| number | true | Grid backdrop: `true` means 40 canvas units, a number sets the cell size, `false` disables it. |
| snap | number | 0 | Snap step in canvas units for dragging, resizing, and arrow nudges. 0 disables snapping. |
| minItemSize | number | 8 | Minimum element width and height in canvas units. |
| wheelBehavior | "zoom" \| "pan" | "pan" | Wheel action when no modifier is held. Ctrl (including trackpad pinch) always zooms and ignores this prop. |
| controls | boolean | true | Show the zoom toolbar in the bottom-right corner. |
| readOnly | boolean | false | Disable dragging, resizing, and deletion while keeping selection, panning, and zooming. |
| className | string | — | Outer class name. It must have a definite height; the canvas fills it. |
| labels | Partial\<DesignCanvasLabels\> | — | Overrides the copy taken from the locale (canvas, item, zoomIn, zoomOut, fitView, resetView). Omit it and the canvas follows ConfigProvider. |
| apiRef | MutableRefObject\<DesignCanvasApi \| null\> | — | Imperative handle (zoomIn, zoomOut, reset, fitView, screenToCanvas). |

`DesignCanvasItem`

| Name | Type | Default | Description |
|------|------|------|------|
| id * | `string` | — | Unique key, also the value used by `selectedElement`. |
| x * / y * | `number` | — | Top-left position in canvas coordinates. |
| width * / height * | `number` | — | Size in canvas units. |
| locked | `boolean` | `false` | Locked: no dragging and no resize handles, while selection and tab focus still work. |
| label | `string` | Falls back to `id` | Accessible name. |

## Events

| Event | Type | Description |
|------|------|------|
| onItemsChange | (items: DesignCanvasItem[]) => void | Emits the whole new array after a geometry change. Drag and resize commit once on pointer up; arrow keys commit on every press. |
| onItemDelete | (id: string) => void | Delete or Backspace on the selected element. Omit it to ignore the delete keys. |
| onSelect | (elementPath: string \| null) => void | Selection change: an element id, or null when the empty canvas is clicked. |
| onZoomChange | (zoom: number) => void | Zoom change. |
| onPanChange | (pan: { x, y }) => void | Pan change. |

## Slots

| Slot | Type | Description |
|------|------|------|
| renderItem | (item, state: { selected, dragging, resizing }) => ReactNode | Render the element body; positioning, the selection box, and the handles belong to the canvas. Defaults to an empty placeholder frame. |
| children | ReactNode | Free layer mounted straight into the world-coordinate layer. It follows pan and zoom, but you place it yourself. |

## Example
```tsx
const [items, setItems] = useState<DesignCanvasItem[]>([
  { id: "hero", x: 40, y: 32, width: 260, height: 120, label: "Hero banner" },
  { id: "cta", x: 40, y: 176, width: 120, height: 96, label: "Call to action" },
]);
const [selected, setSelected] = useState<string | null>(null);

<div className="h-[420px] w-full overflow-hidden rounded border border-border">
  <DesignCanvas
    items={items}
    onItemsChange={setItems}
    selectedElement={selected}
    onSelect={setSelected}
    onItemDelete={(id) => setItems((p) => p.filter((i) => i.id !== id))}
    grid={20}
    snap={20}
    renderItem={(item, s) => (
      <div className={cn("grid h-full w-full place-items-center rounded-[var(--radius)] border bg-surface",
        s.selected ? "border-primary" : "border-hairline")}>
        {item.label}
      </div>
    )}
  />
</div>
```

`items` and `children` are not two competing APIs. The only difference is whether the canvas knows the element's rectangle:

```tsx
<DesignCanvas items={items} onItemsChange={setItems}>
  {/* Free layer: selectable (onSelect reports "ruler") but the canvas has no rectangle for it,
      so it cannot be dragged and shows no handles. */}
  <div data-canvas-item="ruler" className="absolute left-0 top-0 h-px w-[600px] bg-primary" />
</DesignCanvas>
```

The geometry helpers stand alone, which makes external toolbars (align, equalise, bulk offset) easy:

```ts
const bounds = itemsBounds(items);                          // multi-element bounding box for guides
const next = moveRect(item, 0, 8, 8);                       // move down one 8px grid cell
const bigger = resizeRect(item, "se", 20, 20, { snap: 8 }); // grow from the bottom-right, snapped
const screen = canvasToScreen({ x: item.x, y: item.y }, { x: pan.x, y: pan.y, zoom });
```

## Accessibility

- The canvas is `role="application"` with `tabIndex=0` and a visible focus ring; its accessible name comes from `labels.canvas`. Copy resolves as `labels` prop first, then the ConfigProvider locale, then the built-in Chinese fallback, so switching the app language moves the canvas with it and you never have to pass `labels` per call site.
- Every `items` element is focusable and reached in order by Tab. Focusing an element selects it (and reports `onSelect`); the selected one carries `aria-current="true"` plus `data-selected` and a `focus-visible` ring.
- An element's accessible name is its `label`, falling back to `id`, so prefer readable ids such as `"hero"` over `"a1f3"`.
- The keyboard path is complete: arrow keys move by one canvas unit (or by the snap step), `Shift+arrow` moves ten times as far, `Alt+arrow` resizes, and Delete or Backspace removes the element. The eight resize handles are therefore `aria-hidden` pointer-only decoration and stay out of the tab order.
- When focus sits in an `input`, `textarea`, or `contenteditable` inside an element, arrow keys and Delete are handed back to that control instead of being hijacked by the canvas.

## Usage notes

- The outer `className` must have a definite height or the canvas is invisible.
- The canvas is fully controlled: `onItemsChange` emits the whole new array, and skipping the state write snaps elements back. Drag and resize only touch an internal draft and do not emit per frame; read `dragging` / `resizing` in `renderItem` to drive live external panels.
- The canvas does not own the geometry of anything in `children`. Adding `data-canvas-item` there buys selection only, never dragging, resizing, or a selection box. Move it into `items` to have the canvas manage it.
- Buttons and inputs inside an element work normally: pressing one selects without starting a drag, matching Kanban and Sortable. Add `data-no-drag` to exempt any other custom element.
- Right-drag is part of the pan gesture, so the native context menu is suppressed. Listen for `contextmenu` inside `renderItem` and call `stopPropagation` to provide your own.
- Wheel events are registered with `{ passive: false }` and prevented, so the canvas never scrolls an ancestor. That is deliberate: do not place the canvas inside a narrow column that relies on wheel scrolling.
- Wheel semantics match the platform convention and [Flow](../flow/flow.md): **two-finger scroll pans, pinch (which the browser reports as Ctrl+wheel) zooms**. `wheelBehavior="zoom"` only changes the unmodified case; pinch always zooms. Cmd+wheel does not zoom, because macOS gives it no such meaning.
- The canvas is `select-none` as a whole, since clicking and dragging should not paint element text into a selection. `input`, `textarea`, and `contenteditable` inside `renderItem` keep their normal text selection through a built-in escape hatch; add `select-text` yourself to any other content that must stay copyable.
- Resizing past the anchored edge flips the rectangle, as in Figma, rather than clamping at `minItemSize`. Reject the change inside `onItemsChange` if your domain forbids flipping.
- Pointer Events make the component client-only.

## Related
[Flow](../flow/flow.md) · [FitScreen](../fit-screen/fit-screen.md) · [Kanban](../kanban/kanban.md) · [Sortable](../sortable/sortable.md) · [GridPattern](../grid-pattern/grid-pattern.md) · [ImageViewer](../image-viewer/image-viewer.md)
