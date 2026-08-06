---
slug: element-selection-overlay
name: ElementSelectionOverlay
category: feedback
group: overlay
tags: []
exports: [ElementSelectionOverlay, asElement, computeLabelPosition, elementPath, escapeAttributeValue, findMarkedElement, isRectVisible, pathLabel, resolveElementByPath, structuralPath, toHostRect]
status: enriched
---

# ElementSelectionOverlay

> Element selection overlay: hover and click elements inside a container or a **same-origin** iframe and get a component-tree path back · paths read `data-hulian-path` markers first and fall back to a structural selector, both exported as unit-tested pure functions · boxes are drawn in a host portal layer and never write class or style into the target document · follows scroll, resize, DOM mutations, and viewport changes with rAF throttling and full teardown · infrastructure for point-and-edit · feedback/overlay

## When to use

Use it to build point-and-edit: click an element in a preview, then jump to its source, open a property panel, or feed it to a prompt. It only selects and reports a path; the editing panel is yours to build.

- To walk a user through an element you already know, use [Tour](../tour/tour.md); it masks the page and anchors a card, it does not pick elements.
- To attach an annotation bubble to an element, use [Annotation](../annotation/annotation.md).
- For a non-interactive decorative layer, use [Watermark](../watermark/watermark.md).

## Import
```ts
import {
  ElementSelectionOverlay,
  asElement,
  computeLabelPosition,
  elementPath,
  escapeAttributeValue,
  findMarkedElement,
  isRectVisible,
  pathLabel,
  resolveElementByPath,
  structuralPath,
  toHostRect,
} from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| target * | HTMLElement \| HTMLIFrameElement \| null | — | Target area: a plain container, or a **same-origin** iframe whose document is taken over. Nothing renders or listens while null. |
| enabled | boolean | true | Selection mode. When false, picking and click interception stop, but an existing selection box stays visible. |
| highlightSelector | string | — | Selector for selectable elements; the pointer target walks up to its closest match, and nothing highlights without a match. Use it to lock granularity to component level. |
| ignoreSelector | string | — | Elements matching it (or having a matching ancestor) can be neither hovered nor selected. |
| showLabel | boolean | true | Shows the label. Only one label exists at a time; hover wins over selection. |
| pathAttribute | string | "data-hulian-path" | Attribute holding the marked path. |
| componentAttribute | string | "data-hulian-component" | Attribute holding the component name, used for the label and `detail.component`. |
| anchorOnId | boolean | true | A structural path stops at the first ancestor carrying an id instead of walking up to the root. |
| selectedPath | string \| null | — | Controlled selection. Passing it (including null) makes the component controlled and it stops tracking selection itself. |
| interceptClicks | boolean | true | Swallows clicks inside the target so preview links and buttons do not fire. |
| zIndex | number | 100 | Overlay z-index. |
| className | string | — | Class name of the overlay container. |

## Events

| Event | Type | Description |
|------|------|------|
| onSelect | (path: string, detail: ElementSelectionDetail) => void | Selection by click, or by pressing Enter or Space inside the target. |
| onHover | (path: string \| null, detail: ElementSelectionDetail \| null) => void | Hover changed; leaving the target or landing on a non-selectable area reports `(null, null)`. |
| onClear | () => void | Selection cleared by clicking empty space or pressing Escape. |
| onError | (error: ElementSelectionOverlayError) => void | The target cannot be taken over, such as a cross-origin iframe. Reported once per target. `error.message` comes from the ConfigProvider locale (built-in Chinese without a provider); `error.code` is language independent, so branch on `code`, never on the message. |

`ElementSelectionDetail` is `{ path, source: "marked" | "structural", component, tagName, element, rect }`. `source` tells you how trustworthy the path is: `marked` comes from the marker attribute and survives re-layout, while `structural` is derived from the DOM shape and may break when the DOM changes.

## Examples

Controlled selection at component granularity:
```tsx
const [root, setRoot] = useState<HTMLDivElement | null>(null);
const [selected, setSelected] = useState<string | null>(null);

<div ref={setRoot}>
  <div data-hulian-component="Hero" data-hulian-path="App/Hero">…</div>
  <div data-hulian-component="CtaBar" data-hulian-path="App/Cta">…</div>
</div>

<ElementSelectionOverlay
  target={root}
  highlightSelector="[data-hulian-component]"
  selectedPath={selected}
  onSelect={(path, detail) => {
    setSelected(path);
    openInspector(detail.component ?? detail.tagName);
  }}
  onClear={() => setSelected(null)}
/>
```

Same-origin iframe preview:
```tsx
const [frame, setFrame] = useState<HTMLIFrameElement | null>(null);

<iframe ref={setFrame} srcDoc={html} title="Preview" />
<ElementSelectionOverlay
  target={frame}
  onSelect={(path) => setSelected(path)}
  onError={(e) => toast({ title: e.message, tone: "danger" })}
/>
```

The path helpers are exported pure functions and work without the component, for example to resolve a stored selection back to an element or to compute paths in tests:
```ts
structuralPath(el, root);                 // "div > section:nth-of-type(2) > button"
elementPath(el, root);                    // { path, source, component, element }
resolveElementByPath(root, selectedPath); // path back to element, marked paths and CSS selectors alike
asElement(event.target);                  // realm-safe element check, required for iframes
```

## Accessibility

- The overlay is `aria-hidden` with `pointer-events: none`: it stays out of the accessibility tree, never takes focus, and never blocks the target.
- State is not encoded by color alone: hover draws a thin dashed box, selection draws a thick solid one, and the label spells out the component or element name.
- Keyboard reachable: tab to an element inside the target and press Enter or Space to select it, Escape to clear, so a pointer is never required.
- Offer an equivalent keyboard path in the host as well, such as a component list built with [Tree](../tree/tree.md) bound to `selectedPath`. Choosing a node in a list always beats hunting on a canvas for screen reader users.
- The label avoids the top viewport edge automatically by flipping inside the box, so it is never clipped.

## Pitfalls

- **Cross-origin iframes are not supported, and the failure is never silent.** When `contentDocument` cannot be read the component renders nothing and fires `onError({ code: "cross-origin" })` once, plus a development warning. Three ways out: serve the preview same-origin (`srcDoc` or a same-origin proxy domain), mount an overlay inside the previewed page and post the path back to the host, or drop point-and-edit. This component deliberately ships **no** postMessage bridge, because that is a separate protocol and does not belong inside a UI component.
- **Mark the tree whenever you can.** A `structural` path is inferred from the DOM shape, so one extra sibling or a flipped conditional can point it somewhere else. Put `data-hulian-path` on component roots to get paths that survive re-layout.
- **Elements inside an iframe live in another realm**, so they are not instances of the host `Element` and `node instanceof Element` is always false. Use the exported `asElement()` when handling target events yourself; this is the classic silent failure of same-origin iframe work.
- `interceptClicks` defaults to `true`, which means **the preview is not interactive while selecting**: clicks are swallowed and mousedown defaults are blocked. Pass `interceptClicks={false}` to keep the preview usable, or toggle selection mode through `enabled`.
- **The target root itself is not selectable.** Hovering or clicking it counts as empty space and triggers `onClear`. Marker lookup also skips the root on purpose, since a marker there would collapse every element onto one path.
- **`getBoundingClientRect` always returns zero in jsdom**, and zero-area rects count as invisible, so no box renders in unit tests by default. Stub `Element.prototype.getBoundingClientRect` if you need to assert that a box exists, but do not assert coordinates, since they come from your own stub. Test coordinate logic through the `toHostRect` and `computeLabelPosition` pure functions instead.
- When the target is `document.body`, the portal layer lives inside the target. The component already filters out MutationObserver records caused by itself, which would otherwise loop forever; do the same in any observer you add.
- Client component: it reads the DOM and attaches listeners, so use it in a client context. It renders nothing during SSR.

## Related
[Tour](../tour/tour.md) · [Annotation](../annotation/annotation.md) · [Watermark](../watermark/watermark.md) · [Flow](../flow/flow.md) · [Tree](../tree/tree.md)
