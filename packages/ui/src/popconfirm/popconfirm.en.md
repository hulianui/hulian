---
slug: popconfirm
name: Popconfirm
category: feedback
group: message
tags: []
exports: [Popconfirm]
status: enriched
---

# Popconfirm

> Popover confirmation · Inline destructive confirmation with title, icon, confirm/cancel, async loading, and controlled state, built on Popover · feedback/message

## When to use

Use Popconfirm beside a table row or button when a dangerous or irreversible action such as Delete or Archive needs lightweight confirmation. It is more substantial than [Toast](../toast/toast.md) but lighter than a full-screen Modal or AlertDialog.

## Import
```ts
import { Popconfirm } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| danger | `boolean` | `false` | Uses danger tone for the confirm button and default icon. |
| open | `boolean` | — | Controlled open state, paired with onOpenChange. |
| defaultOpen | `boolean` | `false` | Initial open state when uncontrolled. |
| side | `"top"｜"right"｜"bottom"｜"left"` | `"top"` | Preferred popup side. |
| align | `"start"｜"center"｜"end"` | `"center"` | Popup alignment. |
| sideOffset | `number` | `8` | Distance from the trigger. |
| disabled | `boolean` | `false` | Keeps the trigger visible but prevents opening. |
| className | `string` | — | Class name forwarded to Popup. |

## Events

| Event | Type | Description |
|------|------|------|
| onConfirm | `() => void \| Promise<void>` | A Promise puts Confirm in loading state, closes on resolve, and stays open after reject. |
| onCancel | `() => void` | Called only by the explicit Cancel button, not outside click or Escape. |
| onOpenChange | `(open: boolean) => void` | Reports all open-state changes, including outside click, Escape, Confirm, and Cancel. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title* | `ReactNode` | Confirmation question connected with `aria-labelledby`. |
| description | `ReactNode` | Supporting copy connected with `aria-describedby`. |
| icon | `ReactNode` | `undefined` uses the warning triangle, `null` omits it, and a node replaces it. |
| okText | `ReactNode` | Confirm copy. Defaults to built-in Chinese `"\u786e\u8ba4"`, meaning “Confirm.” |
| cancelText | `ReactNode` | Cancel copy. Defaults to built-in Chinese `"\u53d6\u6d88"`, meaning “Cancel.” |
| children* | `ReactElement` | Single trigger element used as the positioning anchor. |

## Example
```tsx
<Popconfirm title="Delete this record?" description="Deletion cannot be undone." danger onConfirm={() => {}}>
  <Button variant="outline" tone="danger" size="sm">Delete</Button>
</Popconfirm>

<Popconfirm title="Archive this record?" okText="Archive" onConfirm={async () => { await api.archive(id); }}>
  <Button variant="outline" size="sm">Archive</Button>
</Popconfirm>
```

## Usage guidelines

- When `onConfirm` returns a Promise, only resolve closes. Rejection clears loading and remains open; the caller owns error feedback.
- `onCancel` runs only for the explicit button. Put cleanup that must run for outside click or Escape in `onOpenChange`.
- `children` must be one ReactElement, not text or a Fragment, because it anchors the popup.
- In controlled use, always pair `open` and `onOpenChange` or dismissal cannot update state.

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md)
