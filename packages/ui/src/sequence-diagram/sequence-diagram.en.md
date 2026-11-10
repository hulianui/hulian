---
slug: sequence-diagram
name: SequenceDiagram
category: data-display
group: collection
tags: []
exports: [SequenceDiagram, layoutSequence, validateSequence, analyzeSequence]
status: enriched
---

# SequenceDiagram

> Draws calls, asynchronous messages, replies, and notes between participants in time order. · data-display/collection

## When to use

Use it to show who calls whom during one request: sign-in, a payment callback, an approval hand-off, or a chain of service calls. Participants run left to right and messages run top to bottom. To drag and wire nodes, use [Flow](../flow/flow.md). To list events in time without participants, use [Timeline](../timeline/timeline.md).

## Import
```ts
import { SequenceDiagram, validateSequence } from "@hulianui/ui"
import type { SequenceParticipant, SequenceItem } from "@hulianui/ui"
```

## Props

Extends `HTMLAttributes<HTMLElement>` (without `title`). These props and `ref` land on the root `<figure>`, which is also the horizontal scroll container.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| participants * | `SequenceParticipant[]` | - | Participants, left to right in array order |
| messages * | `SequenceItem[]` | - | Messages and notes, top to bottom in array order. Order is time; the component never reorders and never reads coordinates |
| title | string | "Sequence diagram" | Accessible name of the whole figure |
| autoNumber | boolean | false | Shows a number before each message (notes are not numbered); screen readers hear it too |
| activeId | string \| null | - | Highlights the current step (a message or note id) and sets `aria-current="step"` |
| minColumnWidth | number | 160 | Minimum column width in px. The figure scrolls horizontally inside itself when the container is narrower |

## Data types

```ts
interface SequenceParticipant {
  id: string;            // stable id referenced by messages and notes
  label: string;         // column heading, also the name screen readers hear
  description?: string;  // second line of the heading
}

interface SequenceMessage {
  type?: "message";      // optional
  id: string;            // stable id, used by activeId
  from: string;          // sender participant id
  to: string;            // receiver participant id; same as from means a self-call
  label: string;
  kind?: "sync" | "async" | "reply";  // defaults to sync
}

interface SequenceNote {
  type: "note";
  id: string;
  over: string | [string, string];  // one id: sits on that lifeline; two ids: spans both lifelines
  label: string;
}

type SequenceItem = SequenceMessage | SequenceNote;
```

## Message semantics

| kind | Meaning | Drawing |
|------|---------|---------|
| `sync` | Synchronous call: the sender waits for the receiver to finish | Solid line + filled triangle head |
| `async` | Asynchronous message: fire and forget (a queue, a notification, a callback) | Solid line + open head |
| `reply` | Reply to an earlier call | Dashed line + open head, quieter text |

The three kinds differ first by **line style and head shape**; color is a second channel. Sync uses `primary`, async uses `info`, reply uses `muted-foreground`, notes use a `warning-subtle` fill with a `warning-border` edge, and participant headings carry a `primary` top edge. All of them are semantic tokens, so light and dark themes and runtime theming follow automatically, and the kinds remain readable without color (grayscale print, color vision deficiency). Arrows point at the receiver.

- **Self-call** (`from === to`): drawn as a loop that leaves and returns to its own lifeline, never as a cross-column arrow. The loop sits in the right half of the column and its text borrows the next column; the last column has nothing to borrow, so its text gets half a column.
- **Note**: takes its own row on the timeline, at its position in the array. `over: "a"` sits on lifeline a and stays within that column; `over: ["a", "c"]` spans from a to c and slightly overhangs both lifelines. Notes have no number and no arrow.

## Example
```tsx
<SequenceDiagram
  title="SMS code sign-in"
  participants={[
    { id: "app", label: "Mini program" },
    { id: "auth", label: "Auth service" },
    { id: "sms", label: "SMS service" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "auth", label: "Request code" },
    { id: "m2", from: "auth", to: "sms", label: "Send SMS", kind: "async" },
    { id: "n1", type: "note", over: "auth", label: "One code per number per 60 s" },
    { id: "m3", from: "auth", to: "app", label: "Sent", kind: "reply" },
    { id: "m4", from: "auth", to: "auth", label: "Issue token" },
  ]}
/>
```

## Motion

Plays once on mount and never auto-plays:

- Messages and notes fade in one after another in array order (40 ms apart, capped after the 15th row).
- Each arrow line grows from the sender end to the receiver, then its head appears, so the motion itself shows direction.
- When `activeId` changes, the highlight fades to the new step. If the figure is scrolled horizontally and that step is out of view, the figure scrolls itself sideways; the page's vertical scroll is left alone.
- With reduced motion requested by the system, none of this animates and scrolling is instant.
- The keyframes `hulian-sequence-in` and `hulian-sequence-draw` live in `preset-core.css` of `@hulianui/tokens`. With an older tokens version that lacks them, elements simply render in their final state and never stay transparent.

## Invalid input

The component never draws bad data in the wrong place. Such items are skipped, and development builds warn in the console (once per kind of problem):

| Case | Handling |
|------|----------|
| Repeated participant id | The first one becomes a column; later ones do not (no extra empty lifeline) |
| Repeated message or note id | The first one is drawn; later ones are not |
| `from`, `to`, or `over` names a missing participant | That item is not drawn; numbering skips it and stays continuous |

Production builds do not warn. To show problems to users, call `validateSequence(participants, messages)` for a `SequenceIssue[]` (`{ code, index, id, ref? }`); an empty array means everything can be drawn. `analyzeSequence` returns the de-duplicated participants, the rows, and the issues in one pass, and `layoutSequence` returns only the rows. Both are pure functions.

With nothing to draw, the figure shows a "No messages" empty state; with no participants it draws no headings either.

## Narrow screens

Columns never shrink below `minColumnWidth`. Names and text wrap to the column width and grow their row; nothing is truncated and the font size never shrinks. Long English words and URLs without spaces break anywhere. When the columns do not fit, the figure scrolls horizontally inside its own area and the page itself does not overflow. In that state the figure joins the Tab order with a visible focus ring, and arrow keys scroll it; when it fits, it takes no Tab stop. On phones, keep to about three participants.

## Accessibility

- The root is a named `<figure>`. Participants are a `<ul>`; messages and notes share one `<ol>` and are read in time order.
- Each message starts with a screen-reader-only prefix such as "Mini program to Auth service (synchronous call): " before its full text; a self-call reads "Auth service to itself (synchronous call): "; a note reads "Note on Auth service: " or "Note between Mini program and SMS service: ".
- Arrows, lifelines, and the visible numbers sit in an `aria-hidden` decoration layer, so nothing is read twice. No information lives only in a hover tooltip.
- The prefixes follow the `ConfigProvider` language.
- Automated checks (axe, unit tests) cover structure and names. How a real screen reader (VoiceOver, NVDA) speaks it still needs a manual check.

## Not supported

This is a read-only diagram. It has no drag-and-drop editing, no alt / loop / opt frames, no nested fragments, no activation bars, no message selection, no automatic step playback (drive step-through yourself with `activeId`), no parsing from text such as Mermaid, and no image export.

## Usage notes

- Do not sort by coordinates or timestamps inside the component. It only follows array order, so sort before passing data.
- A message that spans fewer columns has less room for text; put long explanations in a note or outside the figure.
- A self-call in the last column gets only half a column for its text. Raise `minColumnWidth` or move that participant left if needed.
- Client component: it reads `ConfigProvider` copy through Context and measures whether it overflows, so it cannot be used as a static server component.

## Related
[Flow](../flow/flow.md) · [Timeline](../timeline/timeline.md) · [Steps](../steps/steps.md)
