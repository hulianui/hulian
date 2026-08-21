---
slug: click-captcha
name: ClickCaptcha
category: forms
group: framework
tags: []
exports: [ClickCaptcha]
status: enriched
---

# ClickCaptcha

> Click-based bot-verification UI · Collects an ordered point sequence as relative coordinates, with numbered markers, undo/refresh, keyboard crosshair controls, failure shake, and no network protocol · forms/framework

## When to use

Use ClickCaptcha when an admin login flow requires click-based bot verification. It handles only the interaction from a supplied background and hint image to an ordered list of relative click coordinates. The component owns coordinate conversion, numbered markers, undo and refresh interactions, keyboard access, and reduced-motion behavior.

**Intentionally out of scope:** network requests and backend protocols. Endpoint paths, `captchaId` session semantics, and `captchaInfo` encoding vary across providers such as BuildAdmin, Tencent Captcha, and GeeTest; embedding any one protocol would create library-level API debt. Encode the returned points for your backend and send the request in `onComplete`, then set `status` to `success` or `failed` from the result.

[InputOTP](../input-otp/input-otp.md) is different: it captures a numeric SMS or email code and does not perform bot verification. Combine ClickCaptcha with [LoginForm](../login-form/login-form.md) through the `extra` slot and `beforeSubmit` to implement submit → verify captcha → continue login.

## Import
```ts
import { ClickCaptcha } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| backgroundSrc | `string` | - | Required background-image URL supplied by the application. |
| hintSrc | `string` | - | Hint-image URL, such as the image accompanying "Click in order: book, mountain, water"; rendered at the right of the prompt row. |
| hintText | `ReactNode` | `locale.clickCaptcha.hint` | Prompt content. |
| maxPoints | `number` | `3` | Number of points to collect before calling `onComplete`. |
| points | `CaptchaPoint[]` | - | Controlled points; omit to manage them internally. |
| defaultPoints | `CaptchaPoint[]` | `[]` | Initial points when uncontrolled. |
| loading | `boolean` | `false` | Covers the image and disables selection while the application loads a replacement image. |
| status | `"idle" \| "verifying" \| "failed" \| "success"` | `"idle"` | Verification state. `failed` shakes and clears points; `verifying` and `success` lock interaction. |
| disabled | `boolean` | `false` | Disables all interaction, including refresh. |
| aspectRatio | `number` | `2` | Image area aspect ratio (310×155 is common in BuildAdmin click-select images) |
| keyboardStep | `number` | `0.02` | Distance moved by each keyboard crosshair step, in relative coordinates. |
| className | `string` | - | Additional class name for the root element. |

## Events

| Event | Type | Description |
|------|------|------|
| onPointsChange | `(points: CaptchaPoint[]) => void` | Called after points are added, undone, or cleared; update controlled state here. |
| onComplete | `(points: CaptchaPoint[]) => void` | Called when `maxPoints` have been collected; encode the protocol payload and send the request here. |
| onRefresh | `() => void` | Called when the user requests another image. The component clears points; the application must update `backgroundSrc`. |

`CaptchaPoint = { x: number; y: number }`, where **x and y are relative coordinates in [0,1]** measured from the top-left of the displayed image.

## Examples
```tsx
const [status, setStatus] = useState<ClickCaptchaStatus>("idle");
const [captcha, setCaptcha] = useState(() => fetchCaptcha());

<ClickCaptcha
  backgroundSrc={captcha.background}
  hintSrc={captcha.hint}
  status={status}
  onComplete={async (points) => {
    setStatus("verifying");
    // Convert relative coordinates to the source-image pixels expected by the backend
    const encoded = points.map((p) => `${Math.round(p.x * 310)},${Math.round(p.y * 155)}`).join("|");
    const ok = await api.verifyCaptcha(captcha.id, encoded);
    setStatus(ok ? "success" : "failed");
  }}
  onRefresh={() => setCaptcha(fetchCaptcha())}
/>
```

Combine with LoginForm to submit → open the captcha → continue login:

```tsx
<LoginForm
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false;           // Captcha incomplete: stop submission
    captchaInfo.current = await verify(points);    // Save the receipt for onFinish
  }}
  onFinish={({ username, password }) => api.login(username, password, captchaInfo.current)}
/>
```

## Usage guidelines

- **Keep backend protocols outside the component.** Leave `captchaId`, `captchaInfo` encoding, and endpoint paths in application code. ClickCaptcha only returns coordinates, so changing providers does not require changing the component.
- **Coordinates are relative values, not pixels.** With scaling, responsive layouts, or high-DPI displays, multiply `x` by the source-image width and `y` by its height before sending pixels to the backend.
- **Update controlled state.** If `points` is passed, call `setState` from `onPointsChange`; otherwise clicks cannot add visible markers, as with any controlled component.
- Set `status="failed"` after a rejected verification. The component shakes and clears the points; clearing them again in application code causes a duplicate flash.
- The shake uses `motion-safe:` and is disabled by `prefers-reduced-motion`. Failure is still announced as text, so feedback does not depend on animation.
- If an image fails to load, the component shows fallback copy instead of a blank frame and lets the user request another image.
- The image area is focusable. Arrow keys move the crosshair, Enter or Space places a point, and Backspace undoes the last point. Do not add `pointer-events-none` or override its `tabIndex`.
- SliderCaptcha is not currently included. If added, it should follow the same protocol-independent UI boundary.

## Related
[LoginForm](../login-form/login-form.md) · [InputOTP](../input-otp/input-otp.md) · [Field](../field/field.md) · [ImageCropper](../image-cropper/image-cropper.md)
