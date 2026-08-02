# @hulianui/ui

## 0.19.1

### Patch Changes

- 67038ed: Disambiguate the `semantics` pitfall in `nav-menu.md` and add a site-navigation example (closes #76)

  When `semantics` was added in 0.19.0 (#69), the props table said to **use `list` for site navigation**, while the pitfalls section said that leaving site navigation in the default `tree` mode makes those links undiscoverable to screen-reader users. The latter was intended as a **conditional warning**—if you leave it as a tree, the links cannot be discovered—but the Chinese wording could also be read as an instruction to remain in `tree`, the opposite of the props table.

  The cost of that ambiguity was asymmetric: #69 was entirely about whether primary navigation should be a list or a tree. Reading the sentence incorrectly preserves the accessibility defect that the issue had just fixed, while **both modes look identical and produce no error**. Therefore:

  - The condition is now explicit: **if** you leave the menu in the default `tree` mode, a screen reader's “list all links on this page” command finds none of its entries, so pass `semantics="list"` explicitly in that scenario. The documentation also calls out that the wrong choice is visually undetectable.
  - None of the previous examples passed `semantics`, so copying one silently fell back to the default. “Site navigation” is now the first example, with `semantics="list"` and `render` connected to a router. The existing conversation-list example now explains why it does not need that mode: it is an imperative selection UI whose rows are `<button>` elements, not link navigation. If conversation items are real links, they need `semantics="list"` as well.

  This changes the component documentation shipped in the package (`src/**/*.md`, which MCP's local `get_component_doc` mode reads directly), so a patch release ensures that consumer agents receive the corrected guidance. The component implementation is unchanged.

## 0.19.0

### Minor Changes

- 126ace2: Add `AuthPanel` and six escape hatches that close consumer gaps (closes #67 #69 #70 #71 #72 #73)

  Two downstream projects reported six gaps at once: hulian-admin's split-screen login and registration pages, and cairn's exam-paper annotation workflow. They all had the same root problem: **even after consulting the documentation, consumers still had to bypass the library**. A split authentication page could express its gradient panel only with a raw `<div>` and inline styles; admin login fields required `className` overrides; primary navigation needed hand-written `<Link>` rows to preserve link semantics; legend swatches required raw `<span>` elements; and selection coordinates had to be wrapped in floor/ceil logic at every call site. All of these are application-side patches that the conventions explicitly prohibit. This release brings them into the library.

  **New component**

  - `AuthPanel`: the promotional panel on the left side of split login, registration, and password-recovery pages, combining a gradient background, brand, tagline, highlights, and footer. Its purpose is not merely to save a few flexbox lines, but to provide a **supported way to express gradients**. Tailwind utilities cannot express token-mixed recipes such as `radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, …), …)`, while the guard's `no-style-override` rule is an error. Together, those constraints previously left only a raw `<div>` plus inline styles—the official `signup` block itself used that workaround and now uses `AuthPanel`. All four recipes, `radial` / `linear` / `mesh` / `none`, mix from `--color-bg`, so **dark mode follows automatically without a second set of styles**. `color` is resolved through `resolveTone`, the same path used by `Brand.color`, `Dot.color`, and `ChartSeries.color` (#71).

    ```tsx
    <div className="grid min-h-dvh xl:grid-cols-2">
      <AuthPanel
        brand={<Brand name="Hanyun" />}
        title="Take your ideas to the global edge"
        highlights={["Start for free", "Go from git push to the global edge"]}
        className="hidden xl:flex"
      />
      <div className="grid place-items-center p-8">
        <LoginForm surface={false} /> {/* The left panel already carries the visual weight. */}
      </div>
    </div>
    ```

  **Enhancements**

  - `LoginForm` adds `fields` and `surface`. `fields` provides **presentation slots** for the two primary fields (`label` / `placeholder` / `prefix` / `suffix` / `description` / `autoComplete`) while the template continues to own values and validation, so changing a label does not break browser username or password autofill. When `surface` disables the built-in card, it now removes the border, background, shadow, and **padding** together. Removing only the first three would still force consumers to add a final `xl:p-0` override, defeating the escape hatch (#70).
  - `NavMenu` adds `semantics?: "tree" | "list"`, defaulting to `tree` so existing consumers do not change. The `render` escape hatch from #59 could render a real `<a>`, but the row's `role="treeitem"` overrode its implicit link role. Middle-clicking into a new tab and copying the URL from the context menu worked again, yet the accessibility tree still exposed a tree item, so the common screen-reader command to list every link on a page could not find any primary-navigation entry. `list` mode sets no role (`<a>` remains a link and `<button>` remains a button), uses `aria-current="page"` for the active item, and returns keyboard interaction to tabbing item by item plus native activation. The ARIA APG model for site navigation is a list of links; `tree` remains appropriate for file trees and outline trees (#69).
  - `Dot` adds `color?: string`, accepting arbitrary colors through `resolveTone`. Its five `tone` values cannot represent chart series colors, whose defaults are `chart-1..6`, while a legend swatch must match its series exactly. When both are supplied, `color` takes precedence over `tone` (#73).
  - `AreaChart`, `BarChart`, and `LineChart` add `legend?: boolean | "top" | "bottom"`. Without a legend, readers cannot identify the series in a multi-series chart. The implementation reuses `Dot` with `series.label`, so the swatch and series share the same color source. `height` still means the **total component height**; enabling the legend reduces the plot area rather than increasing the overall height (#73).
  - `RegionSelect` adds `errorPlaceholder` and `onError`, providing an exit from image 404, 403, cross-origin, and network failures instead of remaining at “Loading image…” forever. Preloading previously attached only `onload`, not `onerror`. The preloader and the canvas `<image>` now share one failure state, including cases where authorization expires between requests and only the SVG request fails. Cached failures (`complete` with `naturalWidth` equal to 0) also enter the error state, and changing `src` resets it. On-demand backend images—pages not yet published to the current environment, expired signed URLs, or insufficient permissions—make this a routine case rather than an edge case (#67).

  **Behavior change**

  - `RegionSelect.onChange` now returns **integer** coordinates. It adds `round?: "expand" | "nearest" | "none"`, defaulting to `expand`, and exports the pure `roundBox` function. Previously it returned floating-point values despite defining its coordinate system as original-image pixels. Floating-point coordinates do not fit integer database columns such as `list[int]`, server-side crop APIs in PIL, OpenCV, or sharp—all of which require integers and use inconsistent implicit rounding—or equality checks such as `box === savedBox` that determine whether a value changed.

    `expand` uses `floor` for the top-left and `ceil` for the bottom-right instead of rounding to the nearest integer, so **rounding never shrinks the box**. Otherwise, a box dragged to exactly `minSide` could be reduced to `minSide - 1`; the user did enough work, yet the selection could not be saved and appeared to do nothing. The `minSide` check therefore moves after rounding so it evaluates the value that is actually emitted. Drag previews from `onDrafting` remain floating point for smoother feedback. Pass `round="none"` to retain subpixel coordinates and the previous behavior. Consumers that wrapped the callback in their own floor/ceil logic can remove that workaround (#72).

  **Documentation**

  Two pitfalls that **fail silently** and cannot be identified by reading the call site alone are now documented in the corresponding `<slug>.md` files:

  - `<Dot style={{ color }} />` cannot change the dot because the dot uses a background color while the CSS `color` property controls text. That code compiles, the guard reports only `no-style-override`, and the UI shows a gray dot, misleading the author into thinking the override worked. Custom colors must use the `color` prop.
  - The `RegionSelect` rounding defect is invisible at 1:1 or integer scale factors because coordinates already land on integers. Consumer tests should use a non-integer scale ratio; the library tests 756→396.

  The claim in `nav-menu.md` that `render` makes screen readers announce entries as links now states that it **must be paired with `semantics="list"`**, matching the implementation and the guidance consumers use for component selection.

## 0.18.0

### Minor Changes

- Add eight components and close nine downstream-consumer gaps.

  **New components**

  - `ShieldBadge` / `ShieldBadgeGroup`: README badges in the two-segment shields.io style. They are rendered with theme-aware CSS instead of remote img.shields.io images and include the pure `compactCount` helper (`1.5k` / `3.4M`).
  - `AwardBadge`: a laurel award badge for distinctions such as GitHub Trending or Product Hunt. The pure `laurelLeaves` and `laurelStemPath` functions generate the laurel; it uses `currentColor`, remains crisp at any scale, and makes no image requests.
  - `ContributionGraph`: a contribution activity wall, available as calendar week columns × weekday rows or a single-row strip. Date arithmetic lives in the pure `buildContributionCalendar` function, and its color scale reuses Heatmap's `bucketize`.
  - `Legend`: a standalone legend. Recharts' Legend cannot render outside a chart, so custom visuals such as Sparkline, Heatmap, contribution walls, and maps previously had to build their own colored swatches. Default colors are assigned sequentially from `chart-1..6`, the same tokens used by Chart.
  - `AppLauncher`: a macOS Launchpad-style application launcher. Search and category selection are independently controllable, `keywords` accepts pinyin aliases, arrow keys move focus through the grid, and the filtered grouping logic is a pure function.
  - `RegionSelect`: drag a rectangle over an image and receive **original-image pixel coordinates**, unlike `ImageCropper`, which returns a Blob. It requires no coordinate conversion, measures the natural image dimensions, applies `touch-none`, and scales its outline to the image width (#54).
  - `Brand`: a brand mark combining a square-cornered badge and site name. Avatar cannot substitute because it is circular; `render` integrates framework router components (#57).
  - `Tilt`: a general-purpose parallax tilt wrapper comparable to react-parallax-tilt. It supports pointer, gyroscope, and manual-angle drivers plus glare, with no dependencies, Hulian motion curves, and reduced-motion respected by default.

  **Enhancements**

  - `QRCode` adds `minVersion` to pin a minimum version and keep a set of codes at a consistent density, `boostLevel` to gain a higher error-correction level without increasing the version, and `logo.excavate` / `logo.opacity` for watermark-style logos. It also exports `qrCodeSvgString()` and `qrCodeToPngDataUrl()` for server-side SVG and browser-side PNG generation, scaled by DPR with a white background by default.
  - The layout primitives `Stack`, `Container`, `Grid`, `GridItem`, `Heading`, `Text`, `Prose`, `SafeArea`, and `StreamingText` become **generic polymorphic components**, so `onSubmit` receives `FormEvent<HTMLFormElement>` after `as="form"` (#62).
  - The responsive levels for `Grid.cols` and `Stack.direction` add `xl` and `2xl`, matching the Tailwind breakpoint table (#61).
  - `Container.size` adds `2xl` (`max-w-6xl`) and `3xl` (`max-w-7xl`), while centering and horizontal padding become independent through `centered` and `padded` (#58).
  - `NavMenuItem` adds a `render` escape hatch, preserving `<a>` semantics while integrating client-side routing (#59).
  - `DrawerContent` renders a top-right close button by default and adds `showClose` / `closeLabel`; the locale contract adds `drawer.close` (#63).
  - `LoginForm` adds `rememberLabel` / `rememberDescription`; “Remember me” is not always a convenience preference and can instead control refresh-token behavior (#64).

  **Fixes**

  - `Image` now **merges** consumer `onLoad` / `onError` handlers with its internal handlers instead of allowing them to replace internal behavior. Previously, passing `onLoad` left the image permanently at `opacity-0`. It also forwards refs to the inner `<img>` (#55).
  - `List` forwards `aria-label`, `aria-labelledby`, and `aria-describedby` to the `role="list"` node so screen readers no longer encounter an unnamed list (#60).
  - Remove 55 utility classes that referenced **undefined color tokens**, including `text-muted-foreground`, `bg-background`, and `bg-card`. Tailwind neither reports undefined tokens nor generates rules for them, so elements silently inherited their parent's color and secondary text rendered like body text.
  - Remove raw control bytes from three source files, where literal U+0000 / U+0001 bytes had been used as join separators. Those bytes caused `file` to identify the sources as binary and broke both grep and Git diffs.

  **Behavior change**

  - `Container` previously disabled centering together with horizontal padding when `padded={false}`. It now disables only the padding; pass `centered={false}` as well to disable both.

## 0.17.0

### Minor Changes

- b02bc6f: Add three `LoginForm` escape hatches and the new `ClickCaptcha` point-selection challenge (closes #50 #51)

  Two login pages in a BuildAdmin-based admin application **still bypassed `LoginForm` and implemented their own forms after consulting the documentation**. The problem was not discovery but missing capabilities: validation supported only required fields, consumers could not observe live field values, and there was no captcha slot. The entire `page-login` / `block-login` recommendation chain built around the component was therefore broken—installing it still meant dismantling it. This release closes those gaps so the template is no longer suitable only for demos.

  **Three `LoginForm` escape hatches**, all backward compatible with unchanged behavior when omitted:

  ```tsx
  <LoginForm
    // 1. Field-level validation uses the same FormRule[] shape as useForm.
    //    Built-in required checks always run first.
    rules={{
      username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "Invalid username" }],
      password: [{ min: 6, max: 32, message: "Password must be 6–32 characters" }],
    }}
    // 2. Controlled escape hatch: the consumer owns live values.
    //    Controlled write-back does not fire onValuesChange again or create a loop.
    values={values}
    onValuesChange={(_changed, all) => setValues(all)}
    // 3. Async pre-submit guard plus an in-form slot for the captcha flow.
    extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
    beforeSubmit={async () => {
      if (points.length < 3) return false; // Returning false or throwing aborts submission.
      ticket.current = await api.verifyCaptcha(captcha.id, points);
    }}
    onFinish={({ username, password }) => api.login(username, password, ticket.current)}
  />
  ```

  The submit button remains in its loading state while `beforeSubmit` runs, so asynchronous steps such as opening a captcha do not need a second, consumer-managed loading state.

  **New `ClickCaptcha`**: the **pure UI layer** for point-selection challenges. Given a background image and prompt image, it collects a click sequence and returns **relative coordinates (`x`/`y` ∈ `[0,1]`)**.

  It deliberately does not send requests or prescribe a protocol. The semantics of `captchaId`, the encoding of `captchaInfo`, and API paths vary among backends such as BuildAdmin, GeeTest, and Tencent Captcha; putting one of those protocols in the component would create API debt. Encode points into the application's protocol and send the request from `onComplete`, then set `status` to `success` or `failed` from the result.

  The component owns the parts that take the most code and are easiest to get wrong when built ad hoc: coordinate conversion using relative values that remain correct under container scaling, responsive layout, and high DPI; numbered markers and undo; refreshing the image; failure shaking and clearing; loading overlays; image-load error fallback; and **keyboard access**. The region is focusable, arrow keys move a crosshair, Enter/Space places a point, and Backspace removes one. The shake animation uses `motion-safe:`, so it is disabled under `prefers-reduced-motion` while the failure message is still announced through `aria-live`.

  Slider puzzle challenges (`SliderCaptcha`) are outside this release. They follow the same “pure UI layer” principle and can be proposed separately when needed.

  Supporting changes add the `hulian-captcha-shake` keyframe to `@hulianui/tokens` and map the MCP search terms for captcha, human verification, and point selection to `click-captcha`. Previously those searches returned only InputOTP or Slider, the discovery failure that started #51.

## 0.16.0

### Minor Changes

- 679de2b: Add `Command.onQueryChange`, allowing consumers to own ranking, grouping, empty states, and links to complete search results while retaining the default filter when the prop is omitted.

## 0.15.1

### Patch Changes

- 4e0f452: Fix two issues that made documented public subpath exports unusable (#35 and #36 P0-2): add declarations for `@hulianui/ui/vitest-preset` and align guard/convention checks with the package's real exports.

## 0.15.0

### Minor Changes

- 48c9f9a: Add `Annotation`, an inline handwritten annotation component with highlight, arrow, label, semantic tones, real DOM content, and a configurable `--hl-ann-spread`.

- 7e1b107: **BREAKING**: Replace the entire date family with dependency-free in-house components, remove MUI and Emotion, remove `@hulianui/ui/date-pickers` and `MuiBridgeProvider`, and export `Calendar`, `DatePicker`, `DateTimePicker`, `TimeField`, `TimePicker`, and `DateRangePicker` from the root package.

- ce1c41b: Add `MathText` and `QuestionCard`; fix cached `Image` instances remaining at `opacity-0`, and correct `Table` behavior discovered while dogfooding the new components.

- 15ef604: **BREAKING**: Move the date family to a subpath and make MUI and Emotion optional peer dependencies. This intermediate contract is superseded by the dependency-free date family later in 0.15.0 but remains part of the release history.

- a502b85: Add `PasswordGenerator`, a Bitwarden-style two-mode password and passphrase generator with strength feedback and copy actions.

- 720fa91: Upgrade the `ImageCropper` engine `react-easy-crop` to 6.2.3.

- 20f2f57: Add `@hulianui/ui/vite`, which configures linked-source consumers so development servers resolve and optimize Hulian UI correctly.

### Patch Changes

- ce9b419: Reduce consumer bundle cost by marking icon factories as pure and lazily loading animation support; Button first-load output drops by 75%, and icon-using components save about 3.7 KB.

- bd4ffd4: Align date-family public imports and dependency requirements across documentation, registry output, conventions, and MCP guidance.

- 9f2ad65: Upgrade safe dependencies within their semver ranges, update component runtime dependencies, and align the Tiptap package family to remove peer-version warnings.

- 235cee5: Add executable `@hulianui/guard` convention checks and extend MCP install guidance with recursive page dependencies, explicit integration work, and post-install verification commands.

- f4328bb: Fix TS2882 for TypeScript 6 and 7 consumers importing `Video` by making the required side-effect stylesheet import resolvable.

## 0.14.0

### Minor Changes

- be31a60: Resolve issues #19, #20, #21, and #31, including component behavior, accessibility, and integration defects reported by downstream use.

## 0.13.0

### Minor Changes

- 8ff9043: Resolve issues #24 through #29 and two additional bugs found during the same motion-system review.

- 8ff9043: Unify motion feel through one easing source of truth, trigger-relative overlay origins, shared press feedback, shorter high-frequency transitions, and improved reduced-motion behavior.

## 0.12.0

### Minor Changes

- 64106c0: Add missing downstream capabilities: the complete date/time family, `IconPicker`, `RouteTabs`, and virtual scrolling plus drag-and-drop for `Tree`.

## 0.11.0

### Minor Changes

- 38d57d5: Bring downstream dogfood improvements back into the library across accessibility, explicit integration contracts, tables, and forms.

## 0.10.0

### Minor Changes

- Add `ColorField`, a compact single-row advanced color input. <!-- parity-id: ui-0.10.0-color-field -->

- Enhance controlled `ProTable` usage with `defaultSorting` and `params`, and prevent infinite requests caused by inline request functions. <!-- parity-id: ui-0.10.0-pro-table -->

- Add `RemoteSelect`, including remote search and multiple selection. <!-- parity-id: ui-0.10.0-remote-select -->

- Add `clearable`, `searchable`, `loading`, and grouped options to `Select`. <!-- parity-id: ui-0.10.0-select -->

- Add column geometry controls and row drag sorting to `Table`. <!-- parity-id: ui-0.10.0-table -->

- Add `limit`, `renderPreview`, and `sortable` to `Upload`, and extract transport behavior into `useUpload`. <!-- parity-id: ui-0.10.0-upload -->

- Fix `NavMenu` in collapsed mode with unlimited cascading flyouts and fixed positioning that escapes sidebar clipping. <!-- parity-id: ui-0.10.0-nav-menu -->

## 0.9.0

### Minor Changes

- 72b94d4: Expand `ToastTone` from `info | danger | neutral` to `neutral | info | success | warning | danger`, matching Alert and Tag.

### Patch Changes

- 20c98d3: Cap `DialogContent` at 85dvh and make its body scroll internally.

## 0.8.0

### Minor Changes

- 7830039: Add the responsive `AdminLayout.breakpoint` contract and fix narrow sidebars (#14); allow `ToastProvider` to render children so wrapper usage no longer drops the application subtree (#13).

## 0.7.1

### Patch Changes

- 5ea7c69: Narrow Tiptap Markdown extensions to `AnyExtension`, fixing consumer TypeScript failures caused by `tiptap-markdown` 0.8.x types targeting Tiptap v2.

## 0.7.0

### Minor Changes

- eec0d69: Make horizontal `BarChart` category-axis width adapt to the longest label with a `yAxisWidth` escape hatch (#6); add proportional decimal domains, `valueFormat`, `unit`, and `showLegend` to `Heatmap` (#10).

## 0.6.0

### Minor Changes

- 0278e6d: Add `VoiceRecord` and fix the mobile interaction deadlock in press-and-hold recording.

## 0.5.0

### Minor Changes

- **BREAKING**: Migrate Base UI from deprecated `@base-ui-components/react@1.0.0-rc.0` to the stable renamed package `@base-ui/react@^1.5.0`. <!-- parity-id: ui-0.5.0-base-ui -->

## 0.4.2

### Patch Changes

- Move runtime dependency `lucide-react` from `devDependencies` to `dependencies` so external consumers can bundle icon-using components, and exclude offline-only `*.bake.mjs` tools from the published package. <!-- parity-id: ui-0.4.2-lucide -->

## 0.4.1

### Patch Changes

- Exclude `*.test.ts` and `*.test.tsx` from the package while retaining component source and the public `./showcase` export, reducing the tarball from 2,181 to 1,814 files and unpacked size from 6.6 MB to 5.5 MB. <!-- parity-id: ui-0.4.1-package -->

## 0.4.0

### Minor Changes

- 2bf8ebc: Introduce the AI-first component documentation system, the Vant-style examples API, and fixes for 12 components.

## 0.3.0

### Minor Changes

- Expand admin-grade data components based on admin-starter vertical slices, including richer table, filter, pagination, and management workflows. <!-- parity-id: ui-0.3.0-admin -->

- Add agent and conversation building blocks: `Dossier`, `Artifact`, `ConfirmCard`, `ThreadList`, and `ImageCropper`; add `Conversation.hideScrollbar` and route-level `ThemeProvider.forcedTheme`. <!-- parity-id: ui-0.3.0-agent -->

### Patch Changes

- Fix mobile overflow in chat-message bubbles, remove prompt-input focus ring-offset residue, and give the ThreadList delete action a 44px touch target. <!-- parity-id: ui-0.3.0-fixes -->

## 0.2.3

### Patch Changes

- d923732: Fix gallery rendering for 17 visual-effect and motion components using CDP evidence and verification in a headed browser.

## 0.2.2

### Patch Changes

- 3b81b35: Remove the React 19 `flushSync` warning emitted by the Base UI rc.0 Toast implementation.

## 0.2.1

### Patch Changes

- 6195d52: Fix three rendering defects in `Book3D`.

## 0.2.0

### Minor Changes

- 54d02ff: Add a `footer` slot to `DialogContent`, aligned with `DrawerContent`, rendering a separated right-aligned action area below the body.

- 9debc9e: Restyle `ProTable` as an elevated card surface and add the `Table.bordered` prop based on mock-pilot dogfooding.

- b8db07a: Refine table headers and refresh actions based on mock-pilot dogfooding.

### Patch Changes

- 14c3b6d: Fix two dark-theme and visual-quality issues found through mock-pilot dogfooding.

## 0.1.2

### Patch Changes

- Add theme-aware `--color-hairline`: transparent in light mode and border-colored in dark mode. Elevated components use it to avoid double borders while retaining dark-mode outlines. <!-- parity-id: ui-0.1.2-hairline -->

## 0.1.1

### Patch Changes

- Make `Video` SSR-safe by rendering an aspect-ratio placeholder before mount and the real Vidstack player afterward, avoiding access to `window` during SSR and static export. <!-- parity-id: ui-0.1.1-video -->
