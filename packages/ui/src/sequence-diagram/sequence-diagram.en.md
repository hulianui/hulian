---
slug: sequence-diagram
name: SequenceDiagram
category: data-display
group: collection
tags: []
exports: [SequenceDiagram, layoutSequence]
status: enriched
---

# SequenceDiagram

> Draws calls, asynchronous messages, and replies between participants in time order. · data-display/collection

## When to use

Use it to show who calls whom during one request: sign-in, a payment callback, an approval hand-off, or a chain of service calls. Participants run left to right and messages run top to bottom. To drag and wire nodes, use [Flow](../flow/flow.en.md). To list events in time without participants, use [Timeline](../timeline/timeline.en.md).

## Import
```ts
import { SequenceDiagram, layoutSequence } from "@hulianui/ui"
```

## Props

Extends `HTMLAttributes<HTMLElement>` (without `title`) on the root `<figure>`.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| participants * | `SequenceParticipant[]` | - | Participants, `{ id, label, description? }`, left to right in array order |
| messages * | `SequenceMessage[]` | - | Messages, `{ id, from, to, label, kind? }`, top to bottom in array order. `from === to` draws a self-call loop |
| title | string | "Sequence diagram" | Accessible name of the whole figure |
| autoNumber | boolean | false | Shows a number before each message; screen readers hear it too |
| activeId | string ｜ null | - | Highlights the current step and sets `aria-current="step"` |
| minColumnWidth | number | 160 | Minimum column width in px. The figure scrolls horizontally when the container is narrower |

`kind` is `sync` (default, solid line with a filled head), `async` (solid line with an open head), or `reply` (dashed line with an open head, in a quieter color).

## Example
```tsx
<SequenceDiagram
  title="Phone sign-in"
  participants={[
    { id: "app", label: "Mini program" },
    { id: "auth", label: "Auth service" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "auth", label: "Submit code" },
    { id: "m2", from: "auth", to: "auth", label: "Issue token" },
    { id: "m3", from: "auth", to: "app", label: "Signed in", kind: "reply" },
  ]}
/>
```

## Accessibility

The root is a named `<figure>`. Participants are a `<ul>` and messages are an `<ol>`. Each message starts with a screen-reader-only prefix such as "Mini program to Auth service (synchronous call): " before its text; a self-call reads "Auth service to itself (synchronous call): ". Arrows and lifelines sit in an `aria-hidden` decoration layer. The prefix follows the `ConfigProvider` language.

## Usage notes

- This is a read-only first slice: no notes, no alt or loop frames, no activation bars, and messages cannot be selected or dragged.
- A message whose `from` or `to` names a missing participant id is not drawn, and numbering skips it so it stays continuous. When participant ids repeat, only the first column counts.
- Text wraps to the column width and is not truncated. A message that spans fewer columns has less room; put long explanations outside the figure.
- A self-call loop sits in the right half of its column, and its text borrows the next column. The last column has nothing to borrow, so its text gets only half a column; raise `minColumnWidth` if needed.
- With many columns the figure scrolls horizontally instead of squeezing columns below `minColumnWidth`. On phones, keep to about three participants.
- Client component: it reads `ConfigProvider` copy through Context, so it cannot be used directly as a static server component.

## Related
[Flow](../flow/flow.en.md) · [Timeline](../timeline/timeline.en.md) · [Steps](../steps/steps.en.md)
