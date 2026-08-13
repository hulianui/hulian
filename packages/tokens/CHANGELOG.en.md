# @hulianui/tokens

## 0.9.0

### Minor Changes

- 533c001: The preset gains the keyframes and rules two text effects need (`FlipText` / `TextReveal`)

  - `hulian-text-flip-top` / `-bottom` / `-left` / `-right`: one per direction, each with only a `to` (the start is the element's resting transform), and deliberately without `forwards` -- both faces render the same character, so once a round finishes the container returns to 0 degrees and the switch is invisible.
  - `hulian-text-reveal`: a gradient three times the element's width sliding from far right to far left. Used with `fill-mode: both` it rests "fully transparent" before the sweep starts and "fully solid" after it ends, while reduced motion removes the animation entirely and falls back to the static `background-position`, i.e. fully solid.
  - `[data-hulian-flip-back]::after` / `[data-hulian-ghost-text]::after`: `content: attr(...)` carries the text that must **not** enter the DOM (the flip component's back face, the rotating component's placeholder strings). Real nodes would duplicate a heading's `textContent` or concatenate every candidate string, polluting copy-paste and whatever a crawler reads. Written as a Tailwind arbitrary class it would depend on the scanner emitting the rule, and the failure mode there is "the flip goes blank halfway", so it ships as a plain CSS rule.

## 0.8.0

### Minor Changes

- 90c8e02: `preset.css` splits into two layers, and the info semantic color is filled in (#166 #173).

  **`preset.css` split three ways, with zero breakage**

  Of the original 697 lines, only about 30 **take over** existing consumer behavior; everything else is a safe addition. Bundled behind one entry point, a project that wanted the latter had to swallow the former too — the entire adoption cost was front-loaded to step zero while the payoff only arrives once you start swapping components in. That curve talks people out of incremental migration.

  | Entry | Contents | Nature |
  |---|---|---|
  | `@hulianui/tokens/preset-core.css` | semantic token → `--color-*` mapping, breakpoints, 42 `hulian-*` keyframes | **Pure addition.** The `hulian-` prefix cannot collide, and the breakpoints match Tailwind's defaults |
  | `@hulianui/tokens/preset-opinionated.css` | `@custom-variant dark`, `--shadow-*` rebinding, easing rebinding | **Takeover.** Changes how your existing `dark:` / `shadow-*` / bare `transition` behave |
  | `@hulianui/tokens/preset.css` | an aggregate of both | Equivalent to before the split; **existing usage needs no change** |

  The `@custom-variant dark` line is the silent one. The shadcn default is `<html class="dark">` with `@custom-variant dark (&:is(.dark *))`; once HulianUI's definition overrides it, every `dark:` utility in the project stops matching anything. It shows up as "half dark": the page background is still dark — that comes from the `.dark { --… }` token block, which does not go through the variant — while foreground colors and borders stay light. The build succeeds, the console is silent, and the rules genuinely exist in DevTools, which makes it a long walk to diagnose.

  `docs/consuming.md` gains a section with three ways out (import only core / reorder your own `@custom-variant` declaration / add a `--hl-theme` bridge). The bridge is **measured, not reasoned**: verified in Chrome 151 across four scenarios, and confirmed compatible with the theme-island semantics of #101 — elements inside a light island are not lit up when the bridge is on.

  **Info semantic color**

  Primitives gain `--info-50` … `--info-700`; the semantic layer gains `--color-info` / `-subtle` / `-border` / `-foreground` / `-hover` in both light and dark, fully aligned with success / warning / danger.

  The hue sits at **225°**, 25–33° away from brand (250–258°), with noticeably lower chroma as well (0.112 for info-500 versus 0.19 for brand-500) — so it reads as "information" rather than "brand". Without it, consumers could only borrow primary (notice strips dilute the weight of the brand color) or borrow gray (explanatory text sinks into the background). Neither is good, and once the choice is made it spreads across hundreds of call sites.

## 0.7.0

### Minor Changes

- New semantic token `--color-track`, the recessed groove behind segmented controls (#152) <!-- parity-id: color-track-token -->

  The track for `Tabs variant="solid"` and `Segmented` used to borrow `--color-surface-hover`, which sits only **3.3% away in lightness** from the pill's `--color-surface` in the light theme (about 1.06:1), leaving selection to rest on a single `shadow-sm`. The dark theme was worse: the track at `gray-800` was **lighter** than the pill at `gray-900`, inverting the elevation.

  The new token is defined by a **relationship** rather than a fixed grey: always one step deeper than `--color-surface`, with the raised element reading as closer to the viewer in both themes. It is declared in all three places — `gray-200` in light, `gray-950` in dark, and a 4% white mix on inverse panels. The last one matters: custom properties inherit after substitution, so an inverse panel that does not redeclare it would inherit the light grey already computed at `:root`.

  Retuning the depth of every track now means changing one variable, instead of `--color-surface-hover`, which would ripple through every hover state in the library.

- New `hulian-line-shadow` keyframe, used by `LineShadowText` for its drifting stripes (#151) <!-- parity-id: line-shadow-keyframe -->

  It is not attached by default (the component's `animated` prop defaults to `false`) and only applies when explicitly enabled.

- **BREAKING**: `--color-muted` flips its meaning to match shadcn/ui (#142) <!-- parity-id: muted-semantics-align-shadcn -->

  - `--color-muted` is now a **weak background** (identical to `--color-subtle`), no longer the secondary text colour
  - The secondary text colour is renamed `--color-muted-foreground`

  The two names used to mean the **opposite** of the shadcn/ui vocabulary, and shadcn is where most React admin projects start. The cost ran both ways: a project migrating from shadcn saw every `bg-muted` (Skeleton, table zebra stripes, Avatar placeholders) turn into a dark grey slab the moment Hulian tokens were imported, with no way to stop it — this is not something override order can fix, it is one name claimed by two meanings. Conversely, the library's own contributors kept writing `text-muted-foreground` out of shadcn habit.

  **Migration**: `text-muted` becomes `text-muted-foreground` (same for the `fill-`, `stroke-`, and `border-` prefixes); `bg-muted` stays as it is. `text-muted` no longer maps to a token, and Tailwind neither errors nor emits a rule for an undefined colour, so it **silently falls back to the inherited colour** — run `npx hulian-check` to list every location instead of hunting by eye.

  New semantic tints `-subtle` and `-border` (#145): `--color-primary-subtle` and `--color-primary-border`, mirrored for `danger`, `success`, and `warning`. They cover notice bars, selected rows, Tag and Badge fills, and the active sidebar item. The primitive ramps gained `--brand-50/100/200/300` (and the same steps for `danger`, `success`, and `warning`), all hand-tuned in OKLCH — sRGB `mix()` shifts the hue, every consumer picks a different percentage, and tints cover the largest area of an admin UI. In dark mode the tints **reverse direction**: instead of getting lighter, the semantic colour is mixed into the surface.

  `tailwindcss` is now an **optional** peer dependency (#144): only `preset.css` needs Tailwind v4 out of the four entries, the other three are plain CSS custom properties. Vue 2 with Element UI, plain CSS projects, and codebases still on Tailwind v3 can now run `npm i @hulianui/tokens` and consume tokens only, without an ERESOLVE failure.

## 0.6.0

### Minor Changes

- Three new semantic tokens, all filling in missing steps rather than changing existing values: <!-- parity-id: tokens-subtle-and-semantic-hover -->

  - `--color-subtle`: the **static** area background (grouping containers, board columns, swim lanes, note strips). It currently resolves to the same value as `--color-surface-hover`, but it means something different — the latter expresses "the hovered state of a surface", and writing `hover:` for a permanent background is a semantic mismatch that also leaves no handle for tuning the static weak background later. This role was widely filled by `--color-muted`, which is the secondary **text** colour: as a background it mixes into dirty grey in light mode and washed-out grey in dark mode, wrong in both themes and wrong in opposite directions.
  - `--color-danger-hover`, `--color-success-hover`, `--color-warning-hover`: hover steps for the semantic colours. Each one picks the step between the light and dark values, so it moves one step towards lower contrast in both themes, matching the existing `--color-primary-hover`. Without this step a solid semantic button could only hover back onto itself, which means **no hover feedback at all**.
  - `--hl-layout-header-h`: the header height of a full-page shell (4rem). This number used to be hard-coded in three places across `Layout.Header` and `AdminLayout`, so aligning a sidebar logo block with the header meant digging it out of the source.

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
