---
slug: org-classroom
name: OrgClassroom
category: data-display
group: collection
tags: []
exports: [OrgClassroom, updateSeatStatus]
status: enriched
---

# OrgClassroom

> Isometric seat floor · CSS rotateX + rotateZ and SVG desks / silhouettes · department zones, names, and status bubbles · select a seat and change status from the person card · data-display/collection

## When to use

Use it when a page needs to show who sits in which department and what they are doing. It is a clickable floor, not a 3D scene. A KPI bar, interview room, or archive rail stays in the page and can be composed with [Card](../card/card.md) and [Badge](../badge/badge.md).

## Import
```ts
import { OrgClassroom, updateSeatStatus } from "@hulianui/ui"
import type { Seat, SeatStatus, Zone } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| zones* | `Zone[]` | - | Department zones. |
| selectedSeatId | `string \| null` | uncontrolled | Selected seat. `null` clears the selection. |
| focusedZoneId | `string \| null` | uncontrolled | Focused zone. `null` clears the focus. |
| className | `string` | - | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onSeatSelect | `(seatId: string \| null) => void` | A seat click passes that seat id. The close button and Escape pass `null`. Clicking the selected seat again passes the same id. |
| onStatusChange | `(seatId: string, status: SeatStatus) => void` | Status changed from the person card. The component does not edit `zones`. |
| onZoneFocus | `(zoneId: string \| null) => void` | Empty floor space focused a zone, or `null` when that zone was clicked again. |

## Data

| Name | Type | Description |
|------|------|------|
| Zone.id | `string` | Zone id. |
| Zone.name | `string` | Department name shown on the floor and in the person card. |
| Zone.accent | `string` | CSS color. Theme colors must be `var(--color-primary)`, not `var(--primary)`. |
| Zone.seats | `Seat[]` | Seats in that zone. |
| Seat.id | `string` | Seat id, unique across the floor. |
| Seat.row | `number` | Row, starting at 1. |
| Seat.col | `number` | Column, starting at 1. |
| Seat.person | `SeatPerson` | Omit for an empty seat. |
| SeatPerson.id | `string` | Person id. |
| SeatPerson.name | `string` | Display name. |
| SeatPerson.status | `SeatStatus` | `idle`, `busy`, `meeting`, `leave`, or `interview`. |

Default bubble copy is locked in the Chinese locale. With `ConfigProvider locale={enUS}` the same five statuses read:

| Status | enUS label |
|------|------|
| idle | On duty |
| busy | Busy |
| meeting | In a meeting |
| leave | On leave |
| interview | Interviewing |

## Examples
```tsx
<OrgClassroom
  zones={zones}
  onStatusChange={(seatId, status) => setZones((current) => updateSeatStatus(current, seatId, status))}
/>
```

## Usage notes

- Empty seats do not render a status bubble. The default labels are the locked Chinese short copy. English apps set `ConfigProvider locale={enUS}` instead of replacing those defaults at the call site. Do not paste those Chinese labels into this English document, including code samples: the published page renders fences as code, and the English output gate reads them. `docs:i18n:check` reports `fenced-cjk` for that case.
- Status is controlled. The person card only calls `onStatusChange`; the next bubble reads `person.status`. `updateSeatStatus` keeps untouched seat references. The bubble crossfades with opacity. Do not remount it with `key={status}`.
- Clicking a seat selects it. Clicking empty floor space focuses that zone, and clicking the same empty space again clears the focus. Neither gesture closes the person card. Clicking the selected seat again keeps the card open and reports the same seat id. Close the card with its close button, or with Escape while focus is inside the component. Both clear the selection to `null`. In controlled mode the parent must write that `null` back to `selectedSeatId`. Focus then returns to the seat button that opened the card. v1 has no drag-to-reseat, multi-select, or pan/zoom.
- Theme variables inside `accent` need the `--color-` prefix. The silhouette on a seat is not the portrait [Avatar](../avatar/avatar.md).
- The stage is CSS plus SVG, not Three.js or R3F. A filter other than opacity, or `overflow: hidden` on the rotated plane, flattens the lift and the upright name labels. Do not put `truncate` on a name: it sets `overflow: hidden` and flattens the stage.
- Do not put the locked Chinese status labels inside an English code fence. `docs:i18n:check` reports `fenced-cjk` because the published page renders that fence as `<pre><code>`, and the English output and showcase browser gates read that text. Skipping fences in the prose check stays green until the static export.

## Related
[Card](../card/card.md) · [Tag](../tag/tag.md) · [Button](../button/button.md) · [Badge](../badge/badge.md) · [Kanban](../kanban/kanban.md) · [Scheduler](../scheduler/scheduler.md)
