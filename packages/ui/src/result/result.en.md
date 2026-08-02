---
slug: result
name: Result
category: feedback
group: message
tags: []
exports: [Result]
status: enriched
---

# Result

> Result page · Seven states with built-in semantic icons plus title, subtitle, details, and actions, with zero dependencies and RSC support · feedback/message

## When to use

Use Result as the primary content of a page or region for a final outcome or error, such as payment success, submission failure, or a 403/404/500 page. It centers a prominent icon, title, and actions. Use [Alert](../alert/alert.md) for lightweight inline feedback or [Toast](../toast/toast.md) for transient feedback.

## Import
```ts
import { Result } from "@hulianui/ui"
```

## Props

Inherits `Omit<HTMLAttributes<HTMLDivElement>, "title" | "content">`.

| Name | Type | Default | Description |
|------|------|------|------|
| status | `"success"\|"error"\|"info"\|"warning"\|"403"\|"404"\|"500"` | `"info"` | Selects the built-in icon and semantic tone. |

## Slots

| Slot | Type | Description |
|------|------|------|
| icon | `ReactNode` | Replaces the status icon. Pass `null` to omit the icon region entirely. |
| title | `ReactNode` | Primary title. |
| subTitle | `ReactNode` | Supporting explanation. |
| content | `ReactNode` | Detail region, such as an error stack, between titles and actions. |
| children | `ReactNode` | Bottom action area. |

## Example
```tsx
<Result status="success" title="Payment complete" subTitle="Order #2024-0612 is complete and ships within three days.">
  <Button size="sm">View order</Button>
  <Button size="sm" variant="outline">Home</Button>
</Result>

<Result status="error" title="Submission failed" subTitle="Correct the following information and retry." content="The account name contains invalid characters; the phone number is malformed.">
  <Button size="sm">Edit submission</Button>
</Result>
```

## Usage guidelines

- The `"403"`, `"404"`, and `"500"` status values are string literals, not numbers.
- Only `icon={null}` removes the icon region; omitting icon derives one from status.
- No other known caveats.

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [GiftFeed](../gift-feed/gift-feed.md)
