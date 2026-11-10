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

> Isometric seat floor · Blender pre-rendered sprites, layered so they follow theme colors, no runtime dependency · single desks that join into rows · department zones, names, and status bubbles · select a seat and change status from the person card · data-display/collection

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
| view | `ViewAngle` | uncontrolled, starts at `0` | Viewing angle: `0`, `90`, `180`, or `270`. Each step of 90 turns the floor 90° clockwise on screen. |
| northDeg | `number` | `0` | Clockwise angle from the top of the floor plan to true north. Only the compass uses it. |
| className | `string` | - | Root class name. |

## Events

| Event | Type | Description |
|------|------|------|
| onSeatSelect | `(seatId: string \| null) => void` | A seat click passes that seat id. The close button and Escape pass `null`. Clicking the selected seat again passes the same id. |
| onStatusChange | `(seatId: string, status: SeatStatus) => void` | Status changed from the person card. The component does not edit `zones`. |
| onZoneFocus | `(zoneId: string \| null) => void` | Empty floor space focused a zone, or `null` when that zone was clicked again. |
| onViewChange | `(view: ViewAngle) => void` | A rotate button next to the compass asked for a new view. When controlled, write it back to `view`. |

## Data

| Name | Type | Description |
|------|------|------|
| Zone.id | `string` | Zone id. |
| Zone.name | `string` | Department name shown on the floor and in the person card. |
| Zone.accent | `string` | CSS color. Theme colors must be `var(--color-primary)`, not `var(--primary)`. |
| Zone.facing | `ZoneFacing` | Which side of the floor plan the people in this zone face: `up`, `right`, `down`, or `left`. Defaults to `down`. Desks turn with them, and rows and columns follow the facing. |
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
- Theme variables inside `accent` need the `--color-` prefix. The accent colors both the zone floor and the scarves in that zone. The figure on a seat is an internal model, not the portrait [Avatar](../avatar/avatar.md).
- Seats are Blender pre-rendered sprites, not Three.js, R3F, or live WebGL. Each sprite is split into a shadow, one mask per color group, and a white shading pass. Masks are filled with theme colors (the person uses `--color-foreground`, the desk top `--color-surface`, the scarf `accent`) and the shading is multiplied on top, so theme and dark-mode changes need no new images. After changing the model or camera, run `blender -b --factory-startup --python org-classroom-sprites.bake.py` in this folder (needs `cwebp`) to regenerate `org-classroom-sprites.ts`. Do not edit that file by hand.
- One person per single desk. Desks in a row join into a long table. `row` and `col` only place seats; do not leave empty columns as aisles, because zones already have aisles between them.
- Clicks are tested per pixel. A click on the desk, chair, or person selects that seat; a click on a transparent part of the image falls through to the zone floor. Neighboring seat images overlap, so do not wrap a seat in your own rectangular click target.
- The compass is drawn as a circle lying on the floor, projected like the floor itself, so north usually points at a slant in the isometric view. That is the perspective, not a bug. `northDeg` turns only the compass, never the floor; to seat people facing true north, combine `facing` and `northDeg` yourself. `facing` has four directions; desks do not take arbitrary angles.
- Sprites are baked for the four relative angles of facing minus view, so `org-classroom-sprites.ts` is about 360 KB of WebP data URIs. It is bundled whole even if you only use the default facing and view.
- The layout follows the component's own width (container query). Above 48rem the person card sits on the right, otherwise above. When the scene is scaled down far enough, name bubbles collapse into status dots; names and statuses stay in each seat button's accessible label and in the person card.
- Do not put the locked Chinese status labels inside an English code fence. `docs:i18n:check` reports `fenced-cjk` because the published page renders that fence as `<pre><code>`, and the English output and showcase browser gates read that text. Skipping fences in the prose check stays green until the static export.

## Related
[Card](../card/card.md) · [Tag](../tag/tag.md) · [Button](../button/button.md) · [Badge](../badge/badge.md) · [Kanban](../kanban/kanban.md) · [Scheduler](../scheduler/scheduler.md)
