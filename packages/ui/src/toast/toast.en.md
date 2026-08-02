---
slug: toast
name: Toast
category: feedback
group: message
tags: []
exports: [toast, ToastProvider]
status: enriched
---

# Toast

> Imperative lightweight feedback · Automatic dismissal, queue stacking, and manual close · feedback/message

## When to use

Use Toast for brief imperative feedback after an action, such as Saved, Copied, or Save failed. Toasts dismiss automatically and stack in a queue limited to three. Use [Alert](../alert/alert.md) for persistent feedback in a section, [Banner](../banner/banner.md) for a full-width announcement, or [Notification](../notification/notification.md) for richer content and actions. Mount ToastProvider once in the application or segment layout; business code calls `toast()`.

## Import
```ts
import { toast, ToastProvider } from "@hulianui/ui"
```

## Props

`ToastOptions` passed to `toast(options)`:

| Name | Type | Default | Description |
|------|------|------|------|
| tone | `"neutral"\|"info"\|"success"\|"warning"\|"danger"` | `"neutral"` | Tone for the left accent and title, aligned with [Alert](../alert/alert.md) and [Tag](../tag/tag.md) semantic tokens. |
| timeout | `number` | `5000` | Automatic dismissal in milliseconds. `0` stays open until manually closed; omission uses the Provider default. |

## Slots

`ToastOptions` passed to `toast(options)`:

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Bold primary line. |
| description | `ReactNode` | Muted secondary line. |

Mount ToastProvider once in a root or segment layout. Optional `children` pass through, so both `<ToastProvider><App/></ToastProvider>` and a self-closing provider beside the application are valid.

## Example
```tsx
<ToastProvider>{children}</ToastProvider>
// Or as a sibling
<><App /><ToastProvider /></>

toast({ tone: "info", title: "Update available", description: "Refresh to update." })
toast({ tone: "success", title: "Saved", description: "Changes are synchronized." })
toast({ tone: "warning", title: "Partially complete", description: "One of three items did not sync." })
toast({ tone: "danger", title: "Save failed", description: "Check the network and retry." })
toast({ title: "Close manually", timeout: 0 })
```

## Usage guidelines

- Mount one ToastProvider per application segment. Repeating it in pages or showcases duplicates imperative rendering.
- Before `@hulianui/ui` 0.8, ToastProvider did not render children and wrapper usage could silently blank the app. Use a self-closing provider on those versions; 0.8 and later pass children through.
- In versions through 0.8, ToastTone exposed only `info | danger | neutral`; success and warning required a semantic fallback. Later versions support both directly.
- Only danger uses `priority: "high"` and assertive live announcements. Warning and other tones remain polite intentionally.
- Base UI test caveats are documented in [[base-ui-toast-close-aria-hidden-query-dom-not-role]]: an unfocused Close button can be `aria-hidden`, live announcements can duplicate title text, and the global manager must be cleared between tests. The close control's built-in Chinese label is `"\u5173\u95ed"`, meaning “Close.”

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
