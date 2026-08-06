# @hulianui/tokens

## 0.5.0

### Minor Changes

- 899ff6d: Fixes #101: scoped theme overrides now hold in both directions (a dark island on a light page, a light island on a dark page)

  Light used to be only the default on `:root`, not a theme you could select. So overriding was one-way: `<div data-theme="dark">` inside a light page worked (the dark block matches a rule of its own), while `<div data-theme="light">` inside a dark page did **nothing** — with no matching rule, the subtree kept inheriting the ancestor's dark values. CodeEditor's `theme` escape hatch, PreviewSandbox previewing a fixed color scheme, and the docs site's side-by-side light/dark comparison cards were all stuck on this.

  Two changes:

  1. The light block in `semantic.css` now carries `:root, [data-theme="light"]`. Both selectors have the same specificity and `[data-theme="dark"]` comes later in the source, so a `data-theme="dark"` root still wins; a nested light island matches a rule of its own and overrides the inherited dark values.
  2. The `dark` variant in `preset.css` now resolves against the **nearest theme ancestor**, so `dark:` utilities inside an island follow the island rather than the page.

  Point 2 deliberately does **not** use the `:not([data-theme="light"] *)` exclusion the issue proposed — testing it in a real browser showed it breaks the "**explicit** light page with a dark island" combination that runs every day (`ThemeProvider` writes `light` explicitly onto `<html>`, so the inside of a dark island also matches `[data-theme="light"] *` and loses every `dark:` utility). Selectors cannot express "nearest", so the judgement moved to an inherited `--hl-theme`:

  ```css
  @custom-variant dark {
    &:where([data-theme="dark"]) { @slot; }         /* the island root itself: @container queries the parent */
    @container style(--hl-theme: dark) { @slot; }    /* everything else: nearest ancestor */
  }
  ```

  Correct at any nesting depth, including dark → light → dark.

  **Baseline**: style container queries (Chrome 111 / Safari 18 / Firefox 128). This library already depends on `:has()` and `@container`, so it is the same generation of capability.

  **Size cost**: every `dark:` utility now emits two rules instead of one. Compiling against the whole library measures 276.7KB → 278.0KB (**+1.3KB / +0.5%**) — small because components barely write `dark:` at all; semantic tokens swap their own values, which is the entire point of the token layer.

  Acceptance followed the issue's requirement of a real browser, comparing computed styles and screenshots across four combinations: default-light page with a dark island, explicit-light page with a dark island, dark page with a light island, and a three-level dark → light → dark nest. `dark:` utilities, `shadow-*` (`--hl-shadow-*`), `--color-hairline` (transparent in light, a visible hairline in dark) and `color-scheme` all follow the island; `[data-surface="inverse"]` layered inside a light island was confirmed unaffected (it only remaps neutrals).

  This also closes a silent failure: the `cssVars` shipped with injected components are scraped out of `semantic.css` with a regular expression, and changing the selector quietly scraped light down to empty — injected components would still render, just entirely in default colors. Failing to parse either theme now throws.

## 0.4.0

### Minor Changes

- b02bc6f: Add three extension points to LoginForm and introduce the ClickCaptcha point-and-click CAPTCHA (closes #50 #51)

  Two login pages in a BuildAdmin-style admin system still bypassed `LoginForm` and hand-built their own forms **even after consulting the documentation**. The problem was not discoverability: the component could not support them. Validation only covered required fields, consumers could not observe live field values, and there was nowhere to insert a CAPTCHA. The entire recommendation path built around `page-login` / `block-login` therefore broke down because the template had to be dismantled after installation. This release closes those gaps so the template is no longer useful only as a demo.

  **Three LoginForm extension points** (all backward-compatible; omitting them preserves the previous behavior):

  ```tsx
  <LoginForm
    // 1. Field-level validation using useForm's FormRule[] shape; built-in required checks always run first
    rules={{
      username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "Invalid account format" }],
      password: [{ min: 6, max: 32, message: "Password must contain 6–32 characters" }],
    }}
    // 2. Controlled escape hatch: keep live values externally (controlled writes do not retrigger onValuesChange)
    values={values}
    onValuesChange={(_changed, all) => setValues(all)}
    // 3. Async pre-submit interception plus an in-form slot, so CAPTCHA flows can finally be attached
    extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
    beforeSubmit={async () => {
      if (points.length < 3) return false; // Returning false or throwing aborts submission
      ticket.current = await api.verifyCaptcha(captcha.id, points);
    }}
    onFinish={({ username, password }) => api.login(username, password, ticket.current)}
  />
  ```

  The submit button remains in its loading state while `beforeSubmit` runs, so asynchronous steps such as opening a CAPTCHA do not need to manage a second loading state.

  **New `ClickCaptcha`**: a **pure UI layer** for point-and-click human verification. Given a background image and a prompt image, it collects the click sequence and reports **relative coordinates (x/y ∈ [0,1])**.

  Deliberate non-goals: it sends no requests and assumes no protocol. Backends such as BuildAdmin, GeeTest, and Tencent Captcha all assign different meanings to `captchaId`, encode `captchaInfo` differently, and use different endpoint paths; baking any one of them into the library would create API debt. Encode the points for your own protocol inside `onComplete`, send that payload, and set `status` to `success` or `failed` from the result.

  The component handles the parts that consume the most code and are easiest to get wrong when built in-house: coordinate conversion (relative values remain correct across container resizing, responsive layouts, and high-DPI displays), numbered markers and undo, refresh, failure shake and reset, loading overlays, image-load fallbacks, and **keyboard accessibility** (focus the region, move the crosshair with arrow keys, place a point with Enter/Space, and undo with Backspace). The shake uses `motion-safe:`, so it is disabled under `prefers-reduced-motion`; failures are still announced through `aria-live`.

  Slider-puzzle verification (`SliderCaptcha`) is intentionally outside this release. It should follow the same pure-UI principle and can be added separately when needed.

  Supporting changes: `@hulianui/tokens` adds the `hulian-captcha-shake` keyframes, and the `@hulianui/mcp` search dictionary now maps “CAPTCHA / human verification / point-and-click” to `click-captcha`. Previously those searches only returned InputOTP / Slider, which was the starting point of #51.

## 0.3.0

### Minor Changes

- 48c9f9a: Add tokens for `Annotation`, including the short `--hl-annotation-font` handwritten font stack and inherited animatable `--hl-ann-hue` property for rainbow tones.

### Patch Changes

- 4237cf3: Increase text and surface contrast for primary, danger, success, and warning semantic colors in both themes, and add reusable light and dark steps for danger and warning.

- 9f2ad65: Upgrade safe dependencies within semver ranges, update component runtime dependencies, and align the Tiptap package family to remove peer-version warnings.

## 0.2.0

### Minor Changes

- 8ff9043: Unify motion tokens and utilities: share the easing source of truth, add `--ease-drawer`, align default transitions, and support consistent trigger origins and press feedback.

## 0.1.2

### Patch Changes

- 549d24b: Document that `--color-hairline` is only for `border-*`. It is transparent in light mode, so using it for `text-*`, `bg-*`, or `fill-*` silently hides content; use `--color-border` or `--color-muted` instead.

## 0.1.1

### Patch Changes

- Add theme-aware `--color-hairline`, transparent in light mode and mapped to border in dark mode, so elevated surfaces avoid double borders in light mode and retain outlines in dark mode. <!-- parity-id: tokens-0.1.1-hairline -->
