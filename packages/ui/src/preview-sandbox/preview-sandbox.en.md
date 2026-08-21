---
slug: preview-sandbox
name: PreviewSandbox
category: layout
group: container
tags: []
exports: [PREVIEW_SANDBOX_DEFAULT_SANDBOX, PREVIEW_SANDBOX_DEVICES, PREVIEW_SANDBOX_MESSAGE_KEY, PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX, PreviewSandbox, bootstrapScript, buildSrcDoc, computePreviewScale, normalizeIframeMessage, normalizeReactError, resolveFrameKind, resolveViewport]
status: enriched
---

# PreviewSandbox

> Preview sandbox: the shell that gets isolated rendering, device viewports, scale-to-fit, error capture, and the ready/reload lifecycle right in one place · iframe mode (`code` takes a complete HTML document string into `srcDoc`, isolated behind an opaque origin, errors posted back by an injected bootstrap) and same-document mode (`children` behind a real React error boundary) share one shell and **one error shape** · switching devices only resizes the box, the iframe node and its document are never rebuilt · the size table, the scale factor, and error normalization are all exported pure functions with unit tests · **no bundling, no transpiling, no npm installs** · layout/container

## When to use

Use it to embed somebody else's interface inside your page without letting it touch the host: live preview of AI-generated UI, template and theme stores, the canvas area of a visual builder, WYSIWYG for landing page or email HTML.

It is a shell, not an execution engine: it **does not bundle, transpile, or install packages**. `code` means exactly one thing: a complete HTML document string that can go straight into an iframe, never a piece of JSX waiting to be compiled (see the first pitfall below).

- For responsive layout by device width where the content still belongs to this app, use [Viewport](../viewport/viewport.md): container queries, no isolation, no iframe.
- To scale a fixed design size up to fill a wall display, use [FitScreen](../fit-screen/fit-screen.md); it does scale up, while `fit` here deliberately does not.
- For a static screenshot in a device body, use [IPhone](../iphone/iphone.md) / [Android](../android/android.md) / [Tablet](../tablet/tablet.md) directly; `showDeviceFrame` reuses exactly those.
- To pick elements inside the preview and get a path back (point-and-edit), pair it with [ElementSelectionOverlay](../element-selection-overlay/element-selection-overlay.md), which needs `contentDocument` access (see the sandbox trade-off below).

## Import
```ts
import {
  PreviewSandbox,
  PREVIEW_SANDBOX_DEFAULT_SANDBOX,
  PREVIEW_SANDBOX_DEVICES,
  PREVIEW_SANDBOX_MESSAGE_KEY,
  PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX,
  bootstrapScript,
  buildSrcDoc,
  computePreviewScale,
  normalizeIframeMessage,
  normalizeReactError,
  resolveFrameKind,
  resolveViewport,
} from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| code | string | - | iframe mode content: a **complete HTML document string** written into `srcDoc`. Passing it selects iframe mode |
| children | ReactNode | - | Same-document mode content: a React subtree rendered directly. Ignored when `code` is present |
| device | "desktop" \| "iphone" \| "android" \| "tablet" \| { width, height } | "desktop" | Preview viewport; this is what `window.innerWidth` and media queries see inside the preview |
| showDeviceFrame | boolean | false | Wrap in a device body. Only the three phone/tablet presets have one; desktop and custom sizes ignore it and warn in development |
| frameWidth | number | - | Device body width in px; falls back to the frame component's own default |
| scale | "fit" \| number | "fit" | Content scale. `fit` scales down to fit and **never scales up**; a number is used as is |
| sandbox | string | "allow-scripts" | The iframe `sandbox` attribute. `allow-same-origin` is deliberately absent; see the trade-off below |
| instrument | boolean | true | Inject the error-forwarding bootstrap. Turning it off means runtime errors inside the iframe never arrive |
| title | string | From locale | Accessible name of the iframe. Omit it and the sandbox follows the ConfigProvider locale. |
| errorTitle | string | From locale | Title of the built-in error state. Omit it and the sandbox follows the ConfigProvider locale. |
| retryLabel | string | From locale | Label of the retry button. Omit it and the sandbox follows the ConfigProvider locale. |
| renderError | (error: PreviewSandboxError, retry: () => void) => ReactNode | - | Custom error state; it takes over completely, retry entry included |

`PreviewSandboxError` has the same shape in both modes: `{ source: "iframe" | "react", kind: "error" | "unhandledrejection", message, stack, filename, lineno, colno, componentStack, error }`. The original `Error` instance is only available in same-document mode; across the iframe realm it is always `null`.

## Events

| Event | Type | Description |
|-------|------|-------------|
| onError | (error: PreviewSandboxError) => void | Something failed inside the preview: forwarded `error` / `unhandledrejection` in iframe mode, the React error boundary in same-document mode |
| onReady | () => void | Preview ready: after `load` in iframe mode, after mount in same-document mode; fires again on every reload |
| onLoadingChange | (loading: boolean) => void | Loading changed; swapping `code` or hitting retry goes back to `true` first. Always `false` in same-document mode |

## Examples
```tsx
const html = `<!doctype html>
<html><head><style>body{margin:0;font-family:system-ui}</style></head>
<body><h1>Generated page</h1></body></html>`;

// The wrapper must have a definite height: the component itself is h-full w-full
<div className="h-[420px] w-full overflow-hidden rounded-[var(--radius)] border border-border">
  <PreviewSandbox
    code={html}
    device={device}          // switching never remounts the iframe, preview state survives
    showDeviceFrame
    onReady={() => setStatus("ready")}
    onError={(e) => console.warn(e.source, e.message)}
  />
</div>
```

Same-document mode, where the original Error is available, ideal for previewing your own components:
```tsx
<PreviewSandbox device={{ width: 480, height: 320 }} onError={(e) => report(e.error)}>
  <GeneratedComponent />
</PreviewSandbox>
```

The pure functions stand alone, for assembling preview content elsewhere:
```ts
resolveViewport("iphone");                       // { width: 390, height: 844 }
computePreviewScale({ outerW: 640, outerH: 800, viewportW: 1280, viewportH: 800, scale: "fit" }); // 0.5
buildSrcDoc(html, { frameId, instrument: true }); // document string with the forwarding bootstrap
normalizeReactError(err, info);                   // normalized into PreviewSandboxError
```

## Accessibility

- The iframe always carries a `title`. An unnamed iframe is the classic screen reader dead end, so rename it to something informative such as "Login page preview".
- The error state uses [Alert](../alert/alert.md) in its danger tone, which already is `role="alert"` and interrupts. The outer layer deliberately avoids a second element with the same role so it is not announced twice.
- Retry is a **real button**, reachable by Tab and Enter, not a click-only icon; its label comes from the locale by default and `retryLabel` overrides it (prop, then locale, then the built-in Chinese fallback).
- Accessibility of the previewed content **is yours to own**: the iframe document is a separate accessibility tree, and host landmarks, language, and contrast do not reach it. Ship `<html lang>` and semantic markup inside `code`.
- Scaling uses `transform: scale`, so font sizes and DOM stay untouched and screen readers still get the original structure. Shrunken text is still harder to read, so do not leave important actions only inside a heavily scaled preview.

## Pitfalls

- **The device list is derived from a single source, so a new device is added in one place.** `desktop` is the "no frame" tier and the only explicit exception in the list; every other tier, `watch` included, comes from `lib/device-metrics` and maps one-to-one onto a component in the mockups category. This file used to carry a second hand-written list, which is why `watch` was missing and why nothing guaranteed that the inner screen ratio matched the viewport ratio, the cause of the white band inside device frames (#117, #139).

- **`code` is an HTML document string, not JSX.** Dropping a `<Button/>` or a TSX snippet in there renders it as plain text; nothing errors and nothing compiles, which makes it the easiest silent failure here. To really execute generated component code there are two roads: wire a compiler on the consumer side (esbuild-wasm or WebContainers class dependencies, which this library will not take on), or switch to same-document mode and pass the already compiled component as `children`.
- **The default sandbox is `allow-scripts` only, with `allow-same-origin` deliberately left out. This is a real trade-off:**
  - A `srcdoc` document already inherits the host origin. Granting both values means **no sandbox at all**: scripts in the preview can read and write host DOM, `localStorage`, and cookies, and can even remove the `sandbox` attribute themselves. Never open it up for content you do not fully trust, meaning AI output, user-pasted markup, or third-party templates.
  - The price is that the host cannot read `iframe.contentDocument` either. That is why errors travel by `postMessage`, which an opaque origin can still send, instead of listeners attached inside the iframe document.
  - Open it only when you must read the inner DOM, typically to pair with [ElementSelectionOverlay](../element-selection-overlay/element-selection-overlay.md) for point-and-edit, and say so explicitly: `sandbox={PREVIEW_SANDBOX_SAME_ORIGIN_SANDBOX}`. The whole point of that constant is to make "I am knowingly turning isolation off" readable, greppable, and reviewable.
- **Message validation ignores `origin`.** An opaque-origin iframe always reports `event.origin` as `"null"`, so a check on it can never pass. The component validates the instance id inside the message plus `event.source === iframe.contentWindow`; do the same if you handle `postMessage` yourself.
- **`instrument={false}` mutes `onError`** in iframe mode. Without the injected script there is no return path; that is by design, not a bug. The legitimate reason to turn it off is usually a strict CSP in the previewed document, or your own error reporting already installed there.
- **Reloading works by changing the `srcDoc` string, not by `location.reload()`**, which is unreachable across origins. Retry therefore appends a reload marker comment to `srcdoc`; that is intentional, do not strip it as junk.
- **Switching devices does not reload the document, swapping `code` does.** The former only resizes the box, so scroll position, form input, and animation progress all survive; the latter is a new document. Force a fresh start through retry or by changing `code`.
- **`fit` never scales up** (capped at 1), unlike `computeFit` in [FitScreen](../fit-screen/fit-screen.md): blowing a 390px phone preview up to 800px only produces a giant phone whose font sizes, hit areas, and breakpoints all lie. Pass `scale={1.5}` explicitly if you want that.
- **The wrapper needs a definite height.** The component is `h-full w-full`, so a collapsed parent shows nothing, the same trap as [Flow](../flow/flow.md).
- **Failed resource loads inside the iframe, such as a 404 image, are not errors.** The bootstrap deliberately skips the capture phase and reports only genuine runtime exceptions, otherwise a broken image would be reported as a crashed preview.
- Scripts in `srcDoc` never run under jsdom and there is no layout engine, so injection position, scale factors, and error normalization are all exported pure functions (`buildSrcDoc`, `computePreviewScale`, `normalizeIframeMessage`, `normalizeReactError`). Assert on those instead of trying to test the iframe internals.

## Related
[Viewport](../viewport/viewport.md) · [FitScreen](../fit-screen/fit-screen.md) · [IPhone](../iphone/iphone.md) · [Android](../android/android.md) · [Tablet](../tablet/tablet.md) · [ElementSelectionOverlay](../element-selection-overlay/element-selection-overlay.md) · [CodeBlock](../code-block/code-block.md)
