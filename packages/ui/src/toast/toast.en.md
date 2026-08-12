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
| timeout | `number` | `5000` | Automatic dismissal in milliseconds. `0` stays open until manually closed; omission uses the Provider default, or `0` when `loading` is set. |
| loading | `boolean` | `false` | In-progress state: renders a spinner before the title and changes the `timeout` default to `0`, so the toast does not dismiss itself. Pair it with `toast.close(id)`. |

`ToastProviderProps` passed to `ToastProvider`:

| Name | Type | Default | Description |
|------|------|------|------|
| position | `"top-left"\|"top-center"\|"top-right"\|"bottom-left"\|"bottom-center"\|"bottom-right"` | `"top-right"` | Viewport anchor. The three bottom values stack the queue upward so the newest toast stays against the anchored edge, and the entry slide direction follows the anchor. This is a global value; individual toasts cannot pick their own. |

## Companion functions

| Name | Signature | Description |
|------|------|------|
| `toast.close` | `(id?: string) => void` | Closes the toast with the id returned by `toast()`, or every toast when the id is omitted. It runs the normal exit transition rather than removing the node outright. |

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

// Move the viewport to the bottom left, decided once where the provider is mounted
<ToastProvider position="bottom-left">{children}</ToastProvider>

// In progress, then close it, then report the result
const id = toast({ title: "Uploading image", loading: true }); // does not dismiss itself
try {
  await upload();
  toast.close(id);
  toast({ tone: "success", title: "Upload complete" });
} catch {
  toast.close(id);
  toast({ tone: "danger", title: "Upload failed" });
}
```

## Usage guidelines

- Mount one ToastProvider per application segment. Repeating it in pages or showcases duplicates imperative rendering.
- **`loading` is not a sixth tone.** It is orthogonal to `tone`, so an in-progress toast can still be `neutral` or `info`. It does exactly two things: render a spinner, and change the `timeout` default from 5000 to 0.
- `loading` and `timeout: 0` are **not two competing persistence semantics**; they differ only in the default value of the same `timeout`. An explicit `timeout` still wins, so `{ loading: true, timeout: 3000 }` dismisses itself after three seconds.
- `loading` always uses `priority: "low"` (polite) and never escalates to assertive, even alongside `tone: "danger"`. An in-progress notice accompanies the work rather than reporting a result, and it stays on screen for a long time, so assertive announcements would repeatedly interrupt whatever the screen reader is currently reading.
- Once you set `loading`, **closing it with `toast.close(id)` is your responsibility**; otherwise it never leaves. Do not rely on the user clicking the close control, since an in-progress notice is meant to be resolved by code.
- Under `prefers-reduced-motion: reduce` the spinner **slows to one turn every 2.4s rather than stopping**, deliberately unlike the library's decorative effects, which all use `[animation:none]`. The spinner is the only visual marker of the in-progress state, so freezing it into a static arc would make it indistinguishable from a decorative icon and the state information would disappear.
- Before `@hulianui/ui` 0.8, ToastProvider did not render children and wrapper usage could silently blank the app. Use a self-closing provider on those versions; 0.8 and later pass children through.
- In versions through 0.8, ToastTone exposed only `info | danger | neutral`; success and warning required a semantic fallback. Later versions support both directly.
- Only danger uses `priority: "high"` and assertive live announcements. Warning and other tones remain polite intentionally.
- Base UI test caveats are documented in [[base-ui-toast-close-aria-hidden-query-dom-not-role]]: an unfocused Close button can be `aria-hidden`, live announcements can duplicate title text, and the global manager must be cleared between tests. The close control's built-in Chinese label is `"\u5173\u95ed"`, meaning “Close.”

## Related
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
