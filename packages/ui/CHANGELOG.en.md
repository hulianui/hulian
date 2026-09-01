# @hulianui/ui

## 0.59.0

### Minor Changes

- 50f5f37: New standalone subpath `@hulianui/ui/math-field`: `MathField` (a MathLive-powered visual formula input whose value is LaTeX without `$`; it satisfies `MathFieldLikeProps`, so it plugs straight into the `visualEditor` of MathTextarea / QuestionEditor and the `mathField` of QuestionAnswer; the server and the first client frame render a skeleton, `mathlive` is loaded dynamically on the client, and a missing package shows an install hint instead of throwing; `virtualKeyboard` auto / manual / off, `keyboardLayouts`, `readOnly`, `placeholder`; MathLive's CSS variables are pinned to the library tokens) and `createCasComparator()` (tier-3 equivalence grading that returns `Promise<(a, b) => boolean>` to feed the `equivalent` option of `gradeObjective`; any parse failure is false).

  `mathlive` (>=0.110.0) and `@cortex-js/compute-engine` (>=0.58.0, the dependency mathlive pins) join as **optional peerDependencies**: consumers who do not install them are unaffected, the main package and `@hulianui/ui/math` contain zero MathLive, and the initial chunk of `@hulianui/ui/math-field` measures 12.9KB (mathlive 221KB / compute-engine 294KB are lazy-loaded through `import()`). Fonts come from the consumer's `import "mathlive/fonts.css"`.

  The built-in HanLearn demo gains a question bank page (QuestionEditor + MathField) and a practice page (QuestionAnswer with three-tier instant grading) and now mounts the ToastProvider it was missing; `docs/consuming-math.md` is new.

- 9f2ed95: `@hulianui/ui/math` gains the question domain types and pure functions: `Question` / `QuestionType` (a closed enum of `single / multiple / judge / blank / short_answer / calculation / essay`) / `QuestionAnswer`, plus `validateQuestion`, `defaultShape`, `normalizeOptions`, `blankCount`, `splitStemFigures`, `toWireAnswer` / `fromWire`, `answerText`, and `gradeObjective` (objective grading whose default tier matches the consumer's server logic word for word; normalisation and numeric tolerance are opt-in). Grading and figure extraction each ship a cross-language contract fixture (`grade.contract.json` / `stem-figures.contract.json`) for the Python side to verify against.

  `QuestionCard`: `kind` (four values) is deprecated in favour of `type` (seven values); old values still map for one minor and warn in development. New `answer` / `analysis` / `showAnswer` (off by default) render the key and explanation; `options` becomes `{ key, text }`, with the legacy `{ label, text }` shape accepted for one more minor. Type tag and answer copy now come from the locale (new `question` entries).

- 257102d: `@hulianui/ui/math` gains `MathTextarea`, a LaTeX input for question authoring. Templates insert at the caret (select `x`, click Fraction, get `\frac{x}{}` with the caret in the denominator), one click wraps the selection in `$…$` / `$$…$$`, the pre-submit check reports only unclosed `$` and unbalanced `{}` with line and column, KaTeX parse errors are mapped back to a position in the whole string, and the live preview is the same `Formula` used for display. `visualEditor` injects any component satisfying `MathFieldLikeProps` (MathField in phase 5); the Visual input tab appears only when provided. Copy comes from the locale (new `mathTextarea` entries, including built-in template names). Companion pure functions `applyFormulaTemplate` / `wrapSelectionInMath` / `isInsideMath` / `mathSpans` / `validateFormulaSyntax` / `textPosition` / `katexErrorAt` are exported alongside.

  Size: the `export *` upper bound of `@hulianui/ui/math` rises from 95.6KB to 154.4KB (Popover, Tabs, and form controls now live behind this entry) and the baseline is raised to 178KB; the package is `sideEffects:false`, so consumers importing only `Formula` are unaffected after tree-shaking.

- 8231de3: `@hulianui/ui/math` gains `QuestionAnswer`, the student-side answer card for one question. It renders the right control per type (single → RadioGroup, multiple → CheckboxGroup, judge → the two built-in True / False options with values `"true" | "false"`, blank → one input per blank with its number; when `blankCount` is missing it counts `____` in the stem, then falls back to 1); a choice question with missing options says plainly that it cannot be answered yet instead of showing an empty radio group; subjective questions are read-only with a "graded by the teacher" note; an unknown type is treated as subjective with a development warning. `canSubmit` gates submission until every blank is filled; the submit button appears only when `onSubmit` is provided and receives the canonical shape (blanks are always an array, flatten a single blank with `encodeBlanks`). A present `result` locks the card and shows the verdict, the correct answer rendered by `answerText`, and the explanation; `correctHint` / `reason` / `header` slots; `blankInput="math"` with `mathField` injects a formula keyboard (`MathFieldLikeProps` gains an optional `disabled`). The stem shares the newly extracted `QuestionStemBlock` with QuestionCard (`resolveFigure` splitting plus Formula). Three silent "the student cannot answer" bugs from the consumer's prototype (empty radio group for true-false / one input for multiple blanks / object-shaped options filtered away) each have a regression test. Copy comes from the locale (new `questionAnswer` entries). Companion exports: `canSubmit` / `answerKind` / `resolveBlankCount`.

  The answer-shape type `QuestionAnswer` is renamed `QuestionAnswerValue` to make room for the component. The type only ever existed on the unreleased master, so this is not a breaking change.

  Size: the `export *` upper bound of `@hulianui/ui/math` measures 184.5KB (only Radio / RadioGroup / Input newly enter this entry), still within the 208KB baseline; the package is `sideEffects:false`, so consumers importing only `Formula` or `QuestionCard` are unaffected after tree-shaking.

- 519377c: `@hulianui/ui/math` gains `QuestionEditor`, a structured editor for one math question. Switching type resets options and answer together (with a confirmation when there is content; the score changes only if it still equals the old default); the stem input shows only the body while figures are written back as a `![](key)` block at the end of the stem, resolved through `resolveFigure`, with the Insert image button appearing only when `onUploadFigure` is provided; after adding, removing, or reordering options the correct answer is remapped to follow the content; the number of blanks follows `____` in the stem with a one-click align and per-blank equivalent forms; calculation and extended-response questions can switch to a rubric with a running total; `validateQuestion` issues land on `Field.error` (only edited fields by default, `showAllIssues` for submit time); a review bar via `issues` / `onResolveIssue`; `extra` for consumer-private fields; the preview on the right is `QuestionCard`. No submit button. Copy comes from the locale (new `questionEditor` entries, including a message table for `validateQuestion` codes). Companion exports: `questionFormulaIssues` / `shapeIsDirty` / `switchType` / `optionCaption` / `stemBody` / `joinStemFigures`.

  `QuestionCard` gains `resolveFigure`: `![](key)` references in the stem are split out before typesetting and rendered after the text (the editor preview and the question bank share one path).

  Size: the `export *` upper bound of `@hulianui/ui/math` rises from 154.4KB to 180.5KB (Field, Segmented, Checkbox, Switch, Rating, NumberField, Alert, AlertDialog, and Image now live behind this entry) and the baseline is raised to 208KB; the package is `sideEffects:false`, so consumers importing only `Formula` or `QuestionCard` are unaffected after tree-shaking.

### Patch Changes

- 381aeda: `Brand` badges now support animated and video marks. A GIF, APNG, or animated WebP passed as an `img` plays as-is; wrapping it in `<picture>` to give users with reduced motion enabled a static fallback, a muted looping `<video>`, and a self-drawn `<canvas>` all now fill the badge with `object-cover`. Previously the size rule only matched a direct-child `img`, so adding a `<picture>` fallback dropped the mark out of the rule and clipped it at its natural size. This also fixes an older defect hidden by square assets: the badge is a grid container, and `height:100%` on a replaced element used as a grid item does not resolve, so non-square images were only scaled by width and never actually cropped square by `object-cover`. Media children now use `absolute inset-0`, so assets of any ratio fill the badge.

  The `AdminLayout` docs now say to place `Brand` directly in the brand area: sizing and the reduced-motion fallback for animated logos are `Brand`'s contract, and the `logo` slot only positions it.

- 26132c0: Fix: when a `CheckboxGroup` / `RadioGroup` sits inside a `Field`, every `Checkbox` / `Radio` in the group used to take the `Field` label as its accessible name (screen readers announced N identically named items). Each item is now named by its own `label`, the `Field` label names the group, and description / error still reach every item (Base UI `Field.Item` under the hood, applied only inside a group within a `Field`). A single `Checkbox` inside a `Field` (not in a group) is still named by the `Field` label, unchanged.

## 0.58.0

### Minor Changes

- 9124187: Visual upgrade for the admin family: hierarchy moves from lines to elevation, and jittering numbers are fixed. **This changes the default look; interfaces will look different the day you upgrade.**

  The changes concentrate on three places. After a screen-by-screen audit these were the only genuinely flat spots in the admin family; the rest (Table header, Descriptions key/value rows, NavMenu group titles, Skeleton, Empty) already held up and were deliberately left alone:

  - **`Stat`**: raised to `border-hairline + shadow-sm` (the library's established rule: with a shadow, light mode drops the border for a hairline and dark mode keeps the hairline, matching `Card`'s `elevated` tier); value goes from 24px to 30px with `tracking-tight`; label gains `font-medium`; the corner icon gets a neutral `bg-muted` plinth; value and trend rows use `tabular-nums`. Deliberately **no** hover lift: a Stat is not clickable, and a lift would promise a click that does nothing.
  - **`SearchForm`**: the container moves from a flat 1px border to `border-hairline + shadow-sm`. Until now the query area on a list page was flat while the `ProTable` container below it carried a shadow, so the two blocks sat on different planes with a visible seam between them.
  - **`AdminLayout`**: the top bar changes from `border-b border-border` to `border-b border-hairline + shadow-sm`, separating from the content with elevation instead of a hard line. The sidebar keeps its `border-r`: a vertical shadow would smear grey into the content area, which reads as dirt, not depth.

  Plus two tabular-number fixes (readability defects, not taste): the "N items total" count in `ProTable` and the page numbers in `Pagination`. When the digit count changes, proportional figures make the whole row shift sideways, and in `Pagination` the sliding indicator lands in the wrong place as well.

  **Migration**: to keep the old flat look, pass `className="shadow-none border-border"` to `Stat` / `SearchForm`. The `Stat` value is one step larger and still `truncate`, so long values in narrow cards (< 200px) get cut off sooner; give them room or switch to `Statistic`.

### Patch Changes

- 9a2cc41: Fixes `MetaBalls` ignoring `color` / `cursorBallColor` entirely, and the grab cursor flickering while dragging a `Sortable` item.

  `MetaBalls` used to parse the probe element's computed color with an `/rgba?\(...\)/` regex. This library's `oklch()` tokens are downleveled by Lightning CSS, so the computed value is `lab(...)`: the regex never matched, and **both** color props silently fell back to the neutral grey default. On the docs site the "custom colors" example and the default example rendered the same grey-white blobs. Color resolution now goes through an offscreen 1x1 canvas, the same approach as the other 30-odd WebGL components in the library (the browser handles every color-space conversion). Two hardenings ride along: the probe is mounted inside the component's own subtree, so `var()` reads the nearest theme island instead of `:root`; and a mistyped literal or an undefined `var(--typo)` now falls back to the default color instead of silently inheriting the ancestor text color and painting the blobs black. The color lives only in a shader uniform and is invisible to the DOM, so typecheck, guard and unit tests could not see this defect; real-browser tests now cover it.

  `Sortable` expressed the grab state as `active:cursor-grabbing`, meaning "the cursor depends on whatever the pointer is over right now". During a drag the element under the pointer changes every frame (the dragged item's transform lags one frame, the gaps between rows belong to the `ul`, other rows are mid-shift animation, consumer rows contain `input` / `button`), so `:active` toggled on and off and the browser recomputed the cursor on every input event: the grab icon flickered continuously. The drag now uses position-independent constants: the dragged row, every other row, the `ul` and `document.body` are all pinned to `grabbing` for the duration of the drag and restored on end or unmount. Keyboard drags do not touch the body cursor (no mouse button is held).

  The item being dragged in `Sortable` also gets the primary semantic color (primary outline, tinted primary background, primary handle). Previously it only had a shadow and a neutral ring, which made the lifted row hard to spot in a long list.

## 0.57.1

### Patch Changes

- d311ad3: Two pitfalls added to the `Card` docs (#336): the root carries no padding of its own and
  content must go inside `CardBody` (which this library names `CardBody`, not shadcn/ui's
  `CardContent`); and when padding is gone card-wide, suspect a missing `@source` in the
  consumer first - the test is `grep card-body-px` in the built CSS.

  Component markdown ships with the npm package and MCP's `get_component_doc` reads the copy in
  `node_modules` directly, so a documentation gap like this is a runtime gap for agent consumers.

## 0.57.0

### Minor Changes

- 400d29b: Adds StackItem flex sizing semantics, compact Card density, Text font-family and tabular-number controls, and fixes DotField overlay positioning. Select multiple mode now supports selected-first ordering and removable chips.

  Migration note: CardBody content now inherits the consumer's font size. Consumers that relied on CardBody's implicit `text-sm` must declare the font size on their content layer.

### Patch Changes

- 50fe54e: Fixes AnimatedShinyText being centered by default and capped at 448px inside flex containers, returning width and alignment control to consumers.

## 0.56.1

### Patch Changes

- e3905bf: Fixes the `resolveGrade` signature in the `ScoreRing` docs and documents the shape of `Grade` (#318).

  The pitfalls section claimed `resolveGrade(value, max, grades)` while the source takes two arguments: `resolveGrade(value, grades)`. `max` is a prop `ScoreRing` uses to draw the arc, not a parameter of the function, and following the docs with `resolveGrade(score, 100, myGrades)` passes `100` where `grades` belongs, which then throws inside `[...grades].sort()`.

  The shape of `Grade` was never spelled out: the props table only said the type was `Grade[]`, and no example passed `grades` at all, so the reporter worked around the prop entirely with `showGrade={false}` plus an external `Tag`. Following the `WorldMap` convention, the structure `{ min; label; tone? }` now sits above the props table, with a note that `tone` accepts both a semantic color name and a raw CSS color value (both are typed `string`, so the type alone gives nothing away). A full custom rating model was added to the examples.

  `ScoreScale` shares the same `Grade` and the same `resolveGrade`, so its docs get the cross-reference and the `import type { Grade }` line in the same pass.

  Component docs ship inside the package and the MCP `get_component_doc` local mode reads that copy straight out of `node_modules`, which makes this class of documentation error a runtime defect for agent consumers. Hence a patch release.

## 0.56.0

### Minor Changes

- 1d83645: Adds `ScoreScale` (a linear graded score bar), adds a semantic `tone` to `TabsList` / `Segmented`, and wires `TimePicker` into the `Field` accessibility chain.

  **`ScoreScale` (#317)** - the whole range is tinted band by band and the cursor stops where the value lands, so what it says is "which band this score falls into". The library had no such shape: `Meter` draws a fill length ("how much is used / done"), and using it for a score of 36 tells the reader "in progress, still some way to go", when the green stretch to the left of 36 does not belong to that value at all and is only the scale. The grade model reuses `ScoreRing`'s `Grade` / `resolveGrade` / `DEFAULT_GRADES`, so one set of grades feeds the ring and the bar and draws the same bands. It ships `markers` reference lines, `segmentGap`, `showRange`, and always sets `aria-valuetext`: if the band information lives only in color, screen reader users cannot hear it and color-blind users cannot separate green from amber from red.

  **`tone` (#316)** - the selected state of `TabsList` and `Segmented` can now carry a semantic color. Previously the solid skin separated selected from unselected by nothing but a white pill and a step in lightness, with the color channel carrying no information at all, while the `underline` indicator had long been hard-coded to the brand color: one component, two skins, two attitudes toward color. The values are a subset of the semantic tone SSOT that `Button` defines (`brand` / `success` / `warning` / `danger` / `neutral`) and are handed down through context, so tabs do not take it one by one. **The `neutral` default keeps the existing rendering to the letter**, so a page that passes no tone does not move by a pixel.

  **`TimePicker` (#315)** - when 0.54.0 wired six popup controls into the `Field` accessibility chain, `TimePicker` was left off the list. Its trigger now goes through `Field.Control` and carries `role="combobox"`, and the props interface changed from closed to open (`...rest` lands on the trigger). **BREAKING for tests**: query the trigger with `getByRole("combobox")` instead of `getByRole("button")` in tests, matching the `DatePicker` group.

## 0.55.1

### Patch Changes

- b35361f: Copy-feedback timers no longer call setState on unmounted components, and client components stop describing themselves as RSC in their docs (#310 #307).

  - **Two defects in the copy feedback** (CodeBlock / IssueReporter / JsonViewer / PasswordGenerator / SecretField / Snippet). All six carried the same inline snippet with neither a ref nor a cleanup: copying scheduled a `setTimeout` that reset the "copied" label. First, if the user copies and then closes the dialog or leaves the page within 1.5 seconds, the timer still fires `setState` on an unmounted component; React 19 no longer warns about that, so it stays silent in the browser. Second, clicking copy twice in a row lets the first timer clear the second click's feedback early, so the label only shows for part of its intended time. All six now share the internal `useCopiedFlag`, which clears the timer on unmount and restarts it on every click. JsonViewer keeps its original 1200ms reset window and the rest keep 1500ms, so behaviour is unchanged. MessageActions already got this right and was folded into the same implementation.

  - **Client components stop describing themselves as RSC** (BeianFooter / CircularGallery / ClickSpark / ContributionGraph / GlassSurface / OrbitImages / SplashCursor / TypingDots). These eight had 14 claims such as "RSC-safe" or "pure RSC" in their docs while every one of them is a client component, and each `"use client"` directive was verified as necessary (BeianFooter and TypingDots have no hooks and no events of their own, but both read the Locale context). Component docs ship inside the package and the MCP `get_component_doc` local mode reads that copy straight out of `node_modules`, so an agent takes those claims as evidence that the component stays out of the client bundle. The wording is now "client component (`"use client"`)" throughout, and passages that meant "does not throw during SSR" say SSR instead. ReflectiveCard and Citation genuinely have no `"use client"`, their wording was accurate, and they were left alone.

## 0.55.0

### Minor Changes

- d659e7f: `HeroVideoDialog` can play self-hosted video files, and its demo asset no longer points off-site (#305).

  - New `videoType` (`"auto"` by default, plus `"embed"` and `"video"`). With `"video"` the dialog mounts a native `<video>` (the thumbnail doubles as its poster, with controls, autoPlay and playsInline); `"embed"` keeps the iframe. `"auto"` decides from the `videoSrc` extension: `.mp4` / `.webm` / `.ogv` / `.ogg` / `.mov` / `.m4v` resolve to `"video"`, everything else to `"embed"`. Existing call sites that pass a platform embed address behave exactly as before. HLS (`.m3u8`) is deliberately excluded from the automatic path, because most browsers cannot play it natively; reach for the Video player component instead.
  - The showcase now plays a local file from the docs site (`demoAsset("/demo/sample-video.mp4")`) instead of a hard-coded YouTube embed, so the dialog is no longer blank on a restricted network, an intranet, or offline.

  The reason this could not be fixed inside the showcase alone: an mp4 dropped into an iframe still produces a picture, because the browser falls back to its built-in media viewer. It simply loses the poster, gives up control over the controls, and in some browsers triggers a download instead. That "half broken but looks fine" state is exactly what a consumer passing `/hero.mp4` would have hit.

- 4e2692b: `Markdown` gains `headingIds`: switch it on and rendered headings carry anchor ids, so long documents can have a table of contents and `#fragment` deep links (#303). Pass a string to switch it on and use that string as the id prefix (`headingIds="doc-"` produces `doc-props`), which keeps the generated ids in their own namespace and away from ids the host page already has.

  Two pure functions ship alongside it, `slugifyHeading` and `extractHeadings(src, prefix?)`. Table-of-contents entries are extracted from the **same source text** the renderer receives and share one slug rule with it (strip inline marks, lowercase, fold whitespace into hyphens, keep only Unicode letters, digits, `-` and `_`, which is why Chinese headings survive intact; duplicate headings get `-1` / `-2`; symbol-only and empty headings fall back to `section`). Because both sides run the same rule, an href can never drift from the id in the DOM.

  Every `extractHeadings` item is `{ level, text, plainText, id }`. Use `plainText` for the label, since inline marks are already stripped there.

  `headingIds` stays off by default: ids live in a global namespace, and generating them by default would hand every existing call site a fresh batch of ids that may collide with the page.

  Inline parsing now understands multi-backtick fences (CommonMark code spans). It used to recognise single backticks only, so a `` `x` `` span (the idiom for putting a backtick inside code) was cut at its first backtick, and once the fence was misaligned every remaining mark on the line went with it. Measured on this library's own docs, the sentence listing inline marks (`` `code` `` / `**bold**` / `[label](url)`) rendered `**bold**` as a real `<strong>` and `[label](url)` as a real link, when both were supposed to sit untouched inside code. Any document that explains Markdown syntax in Markdown hits this. Fence contents follow CommonMark for surrounding spaces: one space is dropped from each side when both ends have one and the content is not all spaces.

### Patch Changes

- 10df580: Component docs use one dash convention (#304): every em-dash (`—`) is gone from the English docs, and both languages now use a plain hyphen for table placeholders and numeric ranges.

  - **284 English prose passages rewritten sentence by sentence.** An English em-dash usually introduces a parenthetical, so swapping in a hyphen would read as a compound word or split the sentence. Replacements were chosen per context: parentheses for paired asides, a full stop when the second half is an independent clause, a colon when it expands or defines, and otherwise a comma with the connective word written back in.
  - **Table "no default" placeholders became `-`**: 1336 in English, 1445 in Chinese. Both used to be em-dashes; this now matches the convention used by Ant Design and similar docs.
  - **Numeric-range en-dashes (`–`) became hyphens**: 277 across both languages, such as `0-1`, `h1-h6` and `0.3-3`. Every occurrence was a range, with no other meaning; the surrounding context of all 277 was listed and de-duplicated before the mechanical replacement.

  This is a house-style change rather than a grammar fix. The `design-taste-frontend` rules treat the em-dash as the primary tell of LLM prose and forbid it outright, and an en-dash used as a separator is on the same list. The Chinese full-width dash is correct punctuation in Chinese and was left completely alone.

  Component docs ship inside the package, and MCP `get_component_doc` reads this very copy from the consumer's `node_modules`, so this text is also what an AI assistant is fed. It is worth reading well.

  `Descriptions.emptyText` keeps its `"—"` default: that is the empty-value placeholder of a data display component, a UI convention rather than prose styling, so the docs table keeps printing the real literal.

- 4b33dce: `VoiceRecord` docs now state the full release contract for `pressAndHold`: releasing the pointer, moving it off the target, and the `pointercancel` iOS fires when the system interrupts a gesture all end the recording through `onRelease` (#302).

  The behaviour has always been this way; it just lived in a source comment. For a consumer this is load-bearing information, because wiring up only one of those paths leaves a hold stuck in the recording state. Since component docs ship with the package and MCP `get_component_doc` reads them from the consumer's `node_modules`, anything missing here is invisible to an AI assistant.

  The same batch rewrote the 391 Chinese component descriptions in the docs site's `apps/www/lib/manifest.ts` from implementation shorthand into plain sentences. That file is not published, so it is not part of this package's changes.

- d8b74a7: Showcase demo assets now resolve against the docs site base path. A new internal `lib/demo-asset.ts` supplies the prefix, and the `/demo/*` values in nine showcases (`Avatar`, `AvatarCircles`, `User`, `Image`, `Lens`, `QRCode`, `HeroVideoDialog`, `Video`, `LivePlayer`) go through `demoAsset()`.

  They used to hard-code site-absolute paths, but the docs site is built twice for two languages: English sits at the root and Chinese under `/zh`, and assets in `public/` follow the base path. A request for `/demo/avatar-1.jpg` from the Chinese site therefore landed in the English site's namespace. With both languages served from one domain it still happened to resolve, because English occupies the root, but that was luck rather than design: `next dev` serving the Chinese site alone returns 404 for every one of these images, and a Chinese-only deployment (a desktop shell, or a mirror carrying a single language) breaks the same way. Paths inside the example code blocks stay as `/demo/...`, because those are illustrative values for the reader and should not carry this site's prefix.

## 0.54.2

### Patch Changes

- 06177c0: `BorderBeam` / `AnimatedBeam` now honour reduced motion (#300): these were the only two infinite-loop animation components in the library without a fallback, so they kept orbiting and pulsing after the user turned on "reduce motion" at the OS level -- and `BorderBeam`'s docs claimed support that the code never implemented. They slipped through because the mechanism is not uniform: `Meteors` / `AuroraText` / `ShimmerButton` / `Marquee` use CSS animations plus Tailwind's `motion-reduce:` variant, while these two are JS-driven tweens (`offsetDistance`, gradient `x1`/`x2`). A class variant cannot reach a JS tween, so an audit that looks for "does it have a `motion-reduce:` class" reports them as already covered. The two degrade differently, because the line between decoration and information sits in a different place for each: `BorderBeam` renders nothing at all (it is a purely decorative layer, `absolute inset-0 pointer-events-none`, so skipping it neither shifts layout nor drops information -- whereas freezing the beam mid-path would read as a rendering artifact); `AnimatedBeam` drops only the travelling light and its gradient while keeping the base path, because that line carries the "A connects to B" information and must not disappear along with the animation.
- 06177c0: Blockquotes in `Prose` / `MarkdownEditor` / `RichTextEditor` no longer force `italic`: Chinese typefaces (PingFang SC, Microsoft YaHei) ship no true italic, so `font-style: italic` makes the browser synthesise an oblique -- strokes shear and legibility drops noticeably. A blockquote's meaning is already carried by its left rule and muted text colour; the slant conveys nothing, so removing it loses no information. The `italic` on `<em>` stays, because that one is emphasis the author wrote explicitly -- content semantics, not decoration imposed by the container.

## 0.54.1

### Patch Changes

- 73d4893: `Segmented` re-measures the selected indicator when the item count changes (#297): measurement used to hang off two signals only -- "the selected index changed" and "the root resized". Inside a `Field` column (`flex flex-col`, `align-items: stretch` by default) the root is stretched to the full column width, so adding or removing a segment never resizes it and the ResizeObserver never fires once -- while the segments are `min-w-0 flex-1` and their width is precisely what does change. The one failure channel did not line up with the one quantity in motion: growing two segments to three left the indicator at its old width, spanning two segments, and clicking the already-selected segment did not heal it either (the selected index never changed). The observer now also watches the selected segment -- the box actually being measured -- and the item count feeds the re-measure. Call sites working around this with `className="self-start"` can drop it.

## 0.54.0

### Minor Changes

- e6b2a73: Overlay-style controls join Field's accessibility chain (#293 / #294): the trigger is now a `role="combobox"` element wired into Base UI's field control context

  `Cascader` / `RegionCascader` / `TreeSelect` / `DatePicker` / `DateTimePicker` / `DateRangePicker` render their trigger through `Field.Control`, so the label's `htmlFor`, `aria-labelledby`, `aria-describedby`, `invalid`, and `disabled` finally reach it. That chain used to be broken: the label pointed at an id that did not exist, so a screen reader never even announced the field name. Those six components, together with `RemoteSelect` and `CountrySelect`, also forward attributes that are not listed in Props to the focusable element itself (the trigger button, or the input of the search-style selectors), which is where the `aria-required` injected by `<Field required>` now lands instead of being silently dropped by a closed props interface.

  The role change is deliberate rather than cosmetic: `aria-required` and `aria-expanded` are not supported on `role="button"`, so forwarding the attribute to a button would have fixed nothing. **Upgrade note: query these triggers with `getByRole("combobox")` in tests, not `getByRole("button")`.**

  `Upload` is a different case and is fixed differently. Its dropzone is a `role="button"` element where `aria-required` is invalid, so the required state is expressed as a screen-reader-only note referenced through `aria-describedby`. Both `required` and the `aria-required` injected by `<Field required>` turn it on; the latter deliberately does **not** enable native `required` validation, because whether the browser blocks submission is the consumer's explicit decision. A new `upload.required` locale entry ships with it.

### Patch Changes

- e6b2a73: `Field` labels now shrink to their text (#296): the label is a real `<label>` with `htmlFor`, and once flex stretched it across the row, the invisible space after the text still forwarded clicks to the control -- for overlay controls such as `Select` or `DatePicker` that reads as "the dropdown opened out of nowhere when I clicked above it". Pass `labelClassName="w-full"` when a full-width label is what you want.

## 0.53.0

### Minor Changes

- 068dd0f: Badge gains `variant` (#295): notification badges are red with white text in both themes

  **`Badge.variant` (default `"signal"`)** -- `signal` uses the signal colors added in `@hulianui/tokens` 0.10.0 (one solid color plus white text in both themes), which is how notification badges normally look; `themed` keeps the previous theme-following policy (`bg-danger text-danger-foreground`) for badges used as inline status chips. `neutral` behaves the same under both variants, since it is a neutral count rather than an alert marker.

  The default changed because the old policy necessarily produces "red with black text" in dark mode: once `--color-danger` moves up to the 400 step, its paired foreground has to flip to near-black (white text only reaches 3.15, below AA). A badge's color *is* the message, and both Ant Design and MUI keep it red with white text in either theme.

  The colors are written as `var(--color-signal-danger, var(--color-danger))` rather than the `bg-signal-danger` utility: tokens and ui are separate version lines that consumers install independently, so **someone on the new ui without upgrading tokens** would get a class Tailwind never generated -- a transparent chip with white text vanishing on a light background, silently. The fallback degrades to the pre-upgrade appearance instead, and upgrading tokens switches it on.

## 0.52.0

### Minor Changes

- cf2bbfc: Table / TableRoot gain table-level horizontal alignment via `cellAlign` / `headerAlign` (#292): alignment is a whole-table decision, and per-column `meta.align` cannot express "this table is centered"

  - **`Table.cellAlign` / `Table.headerAlign` (#292)** -- the same tier as the existing `cellVerticalAlign` / `cellWhitespace` (a table-level default that a column's `meta` overrides). Horizontal alignment used to have a column-level knob only, so "this table is centered" was not expressible: the same decision had to be repeated across dozens of column definitions, the one you forget is the visual crack, and changing the policy later means ploughing through every column again (one real admin app has 1192 centered columns and 1075 with nothing set out of 2359 -- what you see is some headers centered and others left-aligned, with the cell content going its own way too). Precedence is `meta.align ?? cellAlign` for cells and `meta.headerAlign ?? meta.align ?? headerAlign ?? cellAlign ?? (group header ? center : left)` for headers, so the common shape is a centered table with amount columns overriding back via `meta.align: "right"` (digits only line up by place value that way). `headerAlign` is offered separately rather than merely following `cellAlign` because a header is a label and the body is content: "centered headers, left-aligned content" is a real layout, and setting it explicitly also takes over the "group headers are always centered" fallback.
  - **`TableRoot.cellAlign` / `TableRoot.headerAlign` (#292)** -- the composable primitives get the same names and meanings, passed down to `TableHead` / `TableCell` through context exactly like `cellWhitespace`, with a per-cell `align` still winning. This required dropping the `align = "left"` destructuring defaults in `TableHead` and `TableCell`: while they were there `align` always had a value and the table-level default could never apply.
  - With neither prop set the **default behaviour is byte-for-byte unchanged**: `<td>` carries no `text-*` class, `<th>` is still left-aligned, and group headers are still centered.

## 0.51.0

### Minor Changes

- fd9c623: Table gains a cell-level `cellClassName` plus swappable column filter controls and a dedicated filter row; the Upload root now carries its own positioned ancestor and no longer stretches the whole page (#289 / #290 / #291)

  - **`Table.cellClassName` (#289)** -- derives a class per (row, column) that lands on the `<td>` **itself**, the equivalent of the el-table `cell-class-name` and the antd `column.onCell`. `ctx = { row, rowIndex, rows, columnId, columnIndex, value }`, the same shape as `cellSpan`; returning `undefined` leaves the cell untouched, and the class is **merged** with the stripe, selection and pinned-column classes rather than replacing them. Colouring cells by value (a status, stage or priority column painting a different background per row) had nowhere to land before: `rowClassName` is row state, the `meta` fields are column state, and wrapping a coloured box inside `ColumnDef.cell` only paints **inside** the `<td>`, so the cell padding still shows the td's own stripe or pinned-column background.
  - **`ColumnMeta.filterRender` (#290)** -- replaces the filter control for one column, so an enum column gets a select, a date column gets a date control and a numeric column gets a range. `ctx = { value, setValue, column }`, and `setValue(undefined)` clears that column's filter. Leaving it out keeps the built-in text box, so the default behaviour is byte-for-byte unchanged; setting it already makes the column filterable, with no need for `filterable` as well.
  - **`Table.filterPlacement` (#290)** -- defaults to `"header"`, the previous behaviour where the control lives inside the header cell. `"row"` moves the controls to a dedicated row **below** the header row, so the header keeps its single-row height and the sort button no longer shares a cell with an input. Under grouped headers that row sits below the deepest level of column names and lines up with the leaf columns, following the sticky geometry of pinned columns; it is not rendered at all when no column is filterable. The row is built from `<td>` cells inside `<thead>` rather than `<th>`: it holds controls, not column names, and header cells would be announced as a second level of column names.
  - **Upload root is always `relative` (#291, fix)** -- the hidden file input is `sr-only` (`position: absolute` plus clip). When every ancestor is `static`, its containing block falls back to the initial containing block and `offsetParent` lands on `<body>`, so it escapes the intermediate `overflow` container and contributes its document-flow vertical position to `documentElement`'s scroll height. In the common admin layout of a fixed-height viewport with a self-scrolling content area, a long form makes the whole page scrollable: once the content area reaches the bottom, the scroll chains to the document and the sidebar slides up with it. The root now provides a positioned ancestor that keeps the input inside the component, and consumer-side workarounds that added `relative` to upload wrappers can be removed. Deliberately not switched to `display: none`: an input carrying `name` takes part in native form submission and `required` validation, and a hidden required control makes the browser block submission silently.

## 0.50.0

### Minor Changes

- 3bf4544: ShimmerButton gains `foreground` (#288): the text color is paired with `background`, so a fixed brand gradient no longer renders black text in dark mode

  `ShimmerButton` accepted `background` (default `var(--color-primary)`) while the text color was hard-wired to `text-primary-foreground`. That pairing holds for the default background (primary and primary-foreground move together with the theme), but once a consumer passes a **fixed** background -- the login-page brand gradient `linear-gradient(135deg,#7c3aed,#4f46e5)` that ignores the theme -- the foreground still follows the theme: in dark mode primary-foreground is near-black, and the purple gradient shows black text.

  - New `foreground?: string`, default `var(--color-primary-foreground)`, landing in `--hulian-shimmer-fg`; the text color now reads that variable (written as `[color:var(--hulian-shimmer-fg)]` rather than an inline `style.color`, so call sites that used to force `text-white` through `className` keep working and can migrate to the prop at their own pace).
  - `shimmerColor` now defaults to follow `foreground` (the same variable), so a paired call does not need a third value; without `foreground` the value is byte-for-byte the old one (primary-foreground), and an explicit `shimmerColor` is unaffected.

## 0.49.0

### Minor Changes

- 3a4f834: #283–#287 cleared in one round: Select `loading` no longer rewrites the value · controlled AnimatedThemeToggler · Table primitives gain `cellWhitespace` / width props · AdminLayout sidebar no longer pans sideways

  - **Fix (#283)**: a controlled `Select` (especially `multiple`) with the popup open received one `onValueChange([])` (`null` for single) and lost its selection the moment `loading` flipped to `true`. Root cause: the loading state unmounts every option, and Base UI Select's Positioner treats the now-unmounted selected items as removed and proactively emits the pruned value. `loading` is a display state, so that internal callback is now swallowed and `cancel()`ed while loading: controlled mode never sees `onValueChange`, uncontrolled mode keeps its internal value, and the selection shows up again once loading ends. This only covers the window bracketed by `loading` -- swapping `items` while the popup is open with a list that omits the selected item still lets Base UI emit the pruned value; for remote search keep the selected items inside `items`, or use `searchable` (the Combobox skin has no such pruning).
  - **New (#284)**: `AnimatedThemeToggler` gains a controlled form, `theme` + `onThemeChange(next)`. With `ThemeProvider forcedTheme`, `toggle` writes the preference without changing the visual theme, so an uncontrolled toggler played the reveal but nothing switched. When the theme source of truth lives outside the library (shell + iframes each mounting a `forcedTheme` provider), pass the controlled pair: the circular reveal is unchanged, only where the value lands is up to the consumer. Controlled mode never touches `useTheme().toggle`, never enters the standalone fallback and never warns; `onThemeChange` also fires in uncontrolled mode. Leaving it out keeps the previous behaviour.
  - **New (#285)**: the composable `TableRoot` gains `cellWhitespace` (`"nowrap" | "normal" | "pre-wrap"`, passed down through context) and `TableCell` gains a per-cell `whitespace` override -- same name and meaning as `cellWhitespace` / `meta.whitespace` on the high-level `Table`, with one shared class map (`TABLE_WHITESPACE_CLASS`). `TableHead` still never wraps. Previously "table-level nowrap" could only be inherited through `tableClassName="whitespace-nowrap"`, and columns that had to wrap had no per-column override.
  - **New (#286)**: `TableHead` / `TableCell` gain `width` / `minWidth` / `maxWidth` (`number | string`, applied as inline style, mirroring `size` / `minSize` / `maxSize` on the high-level `Table`). When the column width is data (field configuration, user-editable), the only route used to be `style={{ width }}`, which `@hulianui/guard`'s no-style-override rejects; dynamic `w-[${px}px]` classes never compile and `<col>` is only reliable under fixed layout and cannot express `maxWidth`. An explicit `style` on the element still passes through and wins.
  - **Fix (#287)**: the `AdminLayout` sidebar menu could be panned about 9px sideways with a trackpad. The real culprit is the 232px sidebar container versus `NavMenu`'s own `w-60` (240px) -- not scrollbar space; the sidebar `NavMenu` now takes its width from the container (`w-full`). `ScrollArea` also locks overflow on the undeclared axis: a `vertical` viewport gets `overflow-x: hidden`, a `horizontal` viewport gets `overflow-y: hidden` (`both` locks nothing). Base UI styles the viewport with two-axis `overflow: scroll` and hides the native bars, so content even 1px wider than the viewport used to pan sideways with no scrollbar to explain it; content inside a `vertical` area now has to fit its width, and anything wider is clipped rather than scrollable.

### Patch Changes

- bb9a113: The npm package README now reports 394 components, and the package README is part of the count gate

  `packages/ui/README.md` (the one shown on the `@hulianui/ui` npm page) had said "383 components" since 0.27.0 while the root README had long moved on to 394: `pnpm readme:sync` and the CI count gate only covered the two root READMEs, so the package copy was neither synced nor checked -- "GitHub shows 394, npm shows 383, CI green". All three READMEs now share one source of truth and one gate; a stale package README fails immediately.

## 0.48.0

### Minor Changes

- a795fab: Chart interaction fix and axis-domain escape hatch; Dialog gains a close button (#279 / #281 / #282)

  - **Fix (#281)**: `onPointClick` on Cartesian charts (Area/Bar/Line/Composed) never fired -- in recharts 3.x `activeTooltipIndex` is always a string, and the old `typeof !== "number"` check silently rejected every click. It is now safely coerced (`null`, empty strings and Sankey-style `"children[0]"` indices are still rejected), restoring the promise that "if the tooltip is showing, a click always fires". PieChart/RadialChart use the per-sector path and were never affected.
  - **New (#282)**: value-axis domain props. Single-axis Cartesian charts gain `yAxisDomain`; `ComposedChart` gains `leftAxisDomain` / `rightAxisDomain` (symmetric with `leftAxisLabel`/`rightAxisLabel`), shaped like `[0, 100]` with `"auto"` allowed on either end. Locking a percentage right axis (Pareto cumulative share, return rate, attainment) to `[0, 100]` keeps out-of-range reference lines (such as the 95 line) from being silently discarded, and stops "82%" from drawing near the top and reading as almost-full.
  - **New (#279)**: `DialogContent` gains `showClose` / `closeLabel`, matching `DrawerContent` (#63) in both shape and default -- **default `true`**, rendering a visible, focusable, screen-reader-reachable close button in the top-right corner; while on, the title/`extra` row reserves the top-right 40px (`pr-10`) so long titles never slide under the button. The accessible name reads the new `dialog.close` locale section ("Close" in enUS). Layers with their own close affordance, such as a global search box, pass `showClose={false}` to keep the previous look.

## 0.47.0

### Minor Changes

- New `ComposedChart` (dual Y axes with mixed bars and lines); Cartesian charts gain `referenceLines` <!-- parity-id: chart-composed-reference-lines -->

  Drawing bars and a line on one category axis, each reading its own Y axis, is standard layout in
  echarts dashboards: revenue (hundreds of thousands) with order count (hundreds), new members with
  cumulative members, Pareto bars with a cumulative-share line. Area/Bar/Line were single-axis and
  single-mark, so migrations had to split one chart into two stacked charts sharing the same x data --
  double the vertical space, and the two halves do not share hover (#274).

  **A new component rather than a `series.type` on `BarChart`**: the latter yields "a bar chart that
  draws lines", whose name no longer matches what it renders and which cannot be documented honestly.
  Two units in one chart deserves its own name; echarts calls it `yAxisIndex`, recharts calls it
  `ComposedChart`, and the industry agrees.

  ```tsx
  <ComposedChart
    data={pareto}
    xKey="sku"
    series={[
      { key: "amount", label: "Revenue", type: "bar" },
      { key: "cumulative", label: "Cumulative share", type: "line", axis: "right" },
    ]}
    referenceLines={[{ y: 80, label: "80%", axis: "right" }, { y: 95, label: "95%", axis: "right" }]}
    leftAxisLabel="Revenue"
    rightAxisLabel="Cumulative share"
  />
  ```

  `referenceLines` (matching echarts' `markLine`) also lands on `AreaChart` / `BarChart` / `LineChart`:
  target lines, average lines, the 80/95 lines of a Pareto chart. The default line color is
  `--color-muted-foreground` rather than a `chart-N`: a reference line is not data, and borrowing a
  series hue makes it read as "series N".

  In a composed chart `stacked` only applies within the same axis and the same mark type: the two axes
  carry different units, so adding them produces a meaningless number, and stack groups are kept
  separate per axis.

- Charts gain data-point clicks via `onPointClick`: echarts-style drill-down finally migrates <!-- parity-id: chart-point-click -->

  `chart.on('click', params => drillDown)` is the standard interaction in echarts dashboards: click a
  day on a trend chart to open that day's detail drawer, click a pie slice to open a filtered list.
  Area/Bar/Line/Pie/Radial exposed no data-point click, so migrations degraded drill-down into a
  "View details →" link in the card header, losing the "carry the clicked point's condition into the
  next screen" half of it (#275).

  ```tsx
  <BarChart data={daily} series={[{ key: "count" }]} xKey="date"
    onPointClick={({ datum }) => openDetail(datum.date)} />
  ```

  Cartesian charts detect the hit through recharts' active category, **the same rule the tooltip uses**:
  if the tooltip is showing, a click always fires, and there is no need to hit a 2px line exactly.
  Clicks on empty canvas or on an axis do not fire -- emitting a "something was clicked but we do not
  know what" event only forces defensive null checks into every drill-down handler. `seriesKey` is
  documented as **not guaranteed**: with the default shared tooltip, recharts does not consider any
  single series to be hit.

  `PieChart` / `RadialChart` use per-sector clicks with a `{ datum, index }` payload -- a slice *is* a
  data point, so there is no series to report.

  The component emits the event and nothing else: navigation, drawers, and query parameters stay in
  application code.

- `Safari` / `Chrome` device shells gain a `headerExtra` slot and put their content area on the height chain: no longer screenshot-only <!-- parity-id: device-shell-live-content -->

  Both shells were designed purely to frame screenshots. A **live content** case -- an Electron desktop
  shell wrapping a native `WebContentsView`, with a DOM viewport measured and fed to the main process
  via `setBounds` -- hit two walls, neither of which application code could work around (#278):

  - **The 48px spacer at the trailing edge of the chrome was a hardcoded empty `<div>`.** Its reason to
    exist -- keeping the address capsule centered relative to the traffic lights -- is entirely correct,
    but that spot is exactly where a browser tool entry belongs (Safari itself puts share and download
    there). It is now the `headerExtra` slot: **omitted, the cell stays byte-for-byte as it was**;
    provided, the cell is handed over with its width floored at the spacer width (narrower content keeps
    the symmetry exactly, wider content grows the cell -- better an off-center capsule than a clipped
    button).
  - **The content area was not on the height chain**, unreachable and unmodifiable from application code,
    so an `h-full` child resolved to zero height. The root is now a column flex container and the content
    area is `min-h-0 flex-1`, so "shell fills its parent, content takes the remaining height" needs only
    a height on the root.

  ```tsx
  <div style={{ height: 500 }}>
    <Safari url="zwfw.example.gov.cn" className="h-full" headerExtra={<DownloadButton />}>
      <div ref={viewportRef} className="h-full" />
    </Safari>
  </div>
  ```

  Screenshot usage is unchanged: an auto-height column flex container is still sized by its content.
  "Does `min-h-0` collapse it to zero?" was the one real risk in this approach and was ruled out by
  measurement in Chromium (both forms render 162px), so no `fill` switch was added for it. `Chrome`
  gets the same treatment (its spacer is `w-6`).

- `MenuItem` gains `render`: navigation items can finally be real `<a>` / Next `<Link>` elements <!-- parity-id: menu-item-render -->

  `MenuItemProps` was a closed interface missing only `render` -- the same component's `MenuTrigger`
  has it, and so do `Button` / `NavMenuItem` / `SidebarMenuButton` (#273). This was a **pure type gap**:
  `MenuItem` already spreads its props onto `BaseMenu.Item`, so the value always reached the bottom;
  only the `.d.ts` stood in the way.

  This is not a stylistic preference. Falling back to `onClick` + `router.push` discards a whole set of
  behaviors **only a real `<a href>` has**: middle-click, Cmd/Ctrl-click to open in a new tab, the
  "Open link in new tab" context menu, and the href preview in the status bar on hover. In an admin
  console "I want this settings page open in a second tab" is routine, and whoever hijacks the click
  has to reimplement each of those -- missing one reads to users as "this menu can't be opened in a new tab".

  ```tsx
  <MenuItem render={<Link href="/settings/roles" />}>Roles</MenuItem>
  ```

  `MenuCheckboxItem` / `MenuRadioItem` / `MenuSubTrigger` do not get it: they mean "toggle a state" or
  "open the next level", not "go somewhere".

  A correction to the record: #239 called `BreadcrumbItem` "the only navigation component in the library
  that cannot take a Next Link". It missed `MenuItem`, which is the second.

- `DrawerContent` / `DialogContent` gain an accessible-name escape hatch and an `extra` slot; `DialogContent.title` becomes optional <!-- parity-id: overlay-accessible-name-extra -->

  An edge-to-edge drawer (`className="p-0 [--hl-overlay-pad:0px]"`) usually has a visible header drawn
  by application code -- a row of controls (title + badge + a couple of buttons). The only way to name
  the drawer was `title`, which renders an `<h2>`: an `<h2>` accepts phrasing content only, so a control
  row inside it is invalid nesting, and worse, `aria-labelledby` points at the whole `<h2>`, so screen
  readers announce the dialog as "Notifications 2 unread Mark all read". Dropping `title` does not work
  either -- Base UI derives `aria-labelledby` from `Dialog.Title` alone, and without it the value is
  `undefined` with no fallback, leaving a modal surface with no name at all (#272).

  Three additions:

  - **`aria-label` / `aria-labelledby` pass through** to the popup. The only way to name a drawer with
    no `title`, so edge-to-edge drawers no longer need an `sr-only` placeholder heading.
  - **An `extra` slot** (shaped like `CardHeader.extra`): the title stays a title and buttons, badges,
    and counts go here; the component lays out the row and yields room for the built-in close button.
    It is the title's **sibling**, not its child, so it never enters the accessible name.
  - **`titleClassName`** -- `descriptionClassName` has existed all along; the title side was missing.

  `DialogContent.title` also becomes optional. The old "required" never actually guaranteed a name:
  `title={null}` type-checks and renders an empty `<h2>` with an empty-string name. The guarantee moves
  to a runtime warning instead -- supplying **none** of `title` / `aria-label` / `aria-labelledby` logs a
  development warning, which is stricter than the type ever was.

  ```tsx
  // Title plus a couple of actions: use extra
  <DrawerContent title="Notifications" extra={<Button variant="ghost" size="sm">Mark all read</Button>} />

  // Edge-to-edge: draw the whole header yourself, name it with aria-label
  <DrawerContent aria-label="Notifications" showClose={false} className="gap-0 p-0 [--hl-overlay-pad:0px]">
    <div className="flex items-center justify-between border-b px-4 py-3">…</div>
  </DrawerContent>
  ```

- `Pagination` gains a page-size switcher: `pageSizeOptions` + `onPageSizeChange` (matching el-pagination's `page-sizes`) <!-- parity-id: pagination-page-size-options -->

  `pageSize` only ever fed "derive the page count from totalItems"; there was no UI step and no matching
  callback, so the common operator workflow -- switch to 100 per page, skim, then filter -- could not be
  built with the library (#271). The switcher sits after the total and before the pager, matching
  el-pagination's default layout, so migrated pages keep their visual order.

  **Page repositioning is the component's job, not something every consumer guesses at**: given
  `totalItems`, it recomputes the page count for the new page size and, when the current page falls
  outside it, fires `onPageChange` again clamping to the **new last page** rather than resetting to page
  1 -- the user was skimming before narrowing down, and throwing them back to the start is further from
  where they were than the last page is. With only `total` (a page count) the new page count cannot be
  derived, so nothing is fired.

  ```tsx
  <Pagination
    page={page}
    totalItems={5151}
    pageSize={pageSize}
    onPageChange={setPage}
    pageSizeOptions={[20, 50, 100]}
    onPageSizeChange={setPageSize}
    showTotal
  />
  ```

  Either prop alone renders nothing (options without a callback means the change has nowhere to go),
  matching how `showTotal` behaves. The switcher is the same implementation as the one in the `ProTable`
  footer, so appearance, copy, and accessible name match in both places.

- `RadarChart` gains per-axis full scale via `axisMax`: multi-dimension comparisons no longer need application-side preprocessing <!-- parity-id: radar-axis-max -->

  Revenue (hundreds of thousands) / orders (hundreds) / average order value (hundreds) / members
  (thousands) / return rate (0–100) on one radar: a single scale flattens the small-unit axes into a dot
  near the center -- the chart is still there, the shape comparison is not. echarts' `radar.indicator`
  configures a `max` per axis for exactly this reason (#277).

  ```tsx
  <RadarChart
    data={dims}
    xKey="dim"
    series={[{ key: "hubin", label: "Hubin" }, { key: "xinjiekou", label: "Xinjiekou" }]}
    axisMax={{ Revenue: 500000, Orders: 800, "Avg order": 600, Members: 4000, "Return rate": 100 }}
  />
  ```

  **The tooltip still shows the original values.** Normalizing in application code produces the same
  shape, but then the tooltip carries only normalized numbers and the reader has to convert back. That is
  the half of this gap most easily overlooked.

  An axis missing from `axisMax` falls back to "the largest value that axis has in the current data" and
  logs a development warning: mixing normalized and non-normalized axes is the worst outcome, and it
  fails invisibly -- that axis silently hugs the center or pins to the outer ring. Enabling `axisMax`
  also turns the radius-axis ticks off by default (0–100 normalized ticks carry no meaning); pass
  `radiusAxis` explicitly to bring them back.

  The normalization math is the unit-tested pure function `normalizeRadarData` (exact-division
  boundaries, zero rows, invalid scales, non-numeric cells).

- New `Treemap`: a flat dataset tiled by value so the biggest contributors read at a glance <!-- parity-id: treemap -->

  Distributions such as 50 stores by member count or channels by revenue previously degraded into a
  horizontal bar list: no data is lost, but "area is share" goes with it -- the gap between the top three
  and the fortieth has to be read off the numbers instead of seen (#276).

  recharts' squarify layout with a Hulian chart-token skin, `onItemClick` for drill-down, and
  `valueFormat` covering both the in-cell text and the tooltip so the two cannot drift apart.

  ```tsx
  <Treemap
    data={stores}
    showValue
    onItemClick={({ datum }) => router.push(`/members?store=${datum.name}`)}
  />
  ```

  **Labels disappear on long-tail cells by design, not by accident**: cell size follows the data, so the
  small share of items is inevitably too small to fit any text, and drawing it anyway produces a mat of
  overlapping fragments (SVG `text` is not clipped by its `rect`, so overflow paints over neighboring
  cells). The rule is the unit-tested pure function `treemapLabelFit`, which asks whether width *and*
  height still fit after padding.

  Single level, no nested drill-down: multi-level treemap interaction (descend, breadcrumb back) is a
  different component's worth of behavior, and in practice "drill down" means "navigate to another page",
  which `onItemClick` hands to application code.

## 0.46.0

### Minor Changes

- `Button` gains a dashed stroke step: the admin-app shape for "this slot is empty, put something in it" <!-- parity-id: button-dashed -->

  All five variants (solid / soft / outline / ghost / link) were either solid-bordered or borderless,
  with **no dashed option**. In an admin app a dashed border is not decoration: a solid border says
  "this is a clickable box", a dashed one says "there is nothing here yet". Drawing an "add a row" entry
  point with a solid border turns it from "the table can still grow" into "yet another action button",
  competing for attention with the real actions on the same row (#270).

  **It is a modifier prop on `outline` / `soft`, not a sixth variant** -- the dash is a **stroke**, and it
  is orthogonal to `tone` (colour) and `muted` (emphasis). As a variant it would have to restate every
  existing `outline` tone × muted combination in new `compoundVariants`, when the only difference between
  them is one `border-style`. Same reasoning as `muted` (#211).

  Each of the two steps covers one kind of empty slot:

  ```tsx
  {/* No fill: an upload chip on a table row that has no evidence attached yet */}
  <Button variant="outline" size="xs" dashed>Upload</Button>

  {/* Tinted: the add-row entry at the end of a table, dashed across the full width */}
  <Button variant="soft" dashed block>+ Add a unit manually</Button>
  ```

  - `outline dashed` -- changes the stroke only; the border colour still follows `tone` (`tone="danger"`
    stays red), so product code never has to restate the tone table just to get a dashed edge.
  - `soft dashed` -- `soft` has no border, so this step **adds** one in the matching colour, giving the
    complete empty-slot shape: tinted semantic fill, dashed border, semantic text. The border uses 40% of
    `currentColor`, so all six tones share one rule (the 40% is deliberate: a dash as strong as the text
    reads as a solid box).

  Verifying it in a real browser caught one thing: the base of `outline` is `border-hairline`, and
  hairline is **`transparent` in light mode** (that tier relies on the hairline edge the shadow already
  provides). With a solid border nobody notices; a dashed one gives it away, because a fully transparent
  dash leaves only the continuous shadow edge underneath -- which still draws as a solid line. So the
  `outline dashed` cell also carries a real functional border colour (`border-border`), placed **before**
  the three tone border colours so that `border-danger` and friends still win.

  On `solid`, `ghost` and `link` (including the default `solid` when no `variant` is passed) it adds no
  class at all and development builds log a `warnOnce` naming it -- same reasoning as `muted`, since a
  silently inert prop is harder to track down than an error.

## 0.45.0

### Minor Changes

- **BREAKING**: `Popconfirm` now **intercepts** the child's action instead of merging with it, and `disabled` means "skip the question", not "dead button" <!-- parity-id: popconfirm-intercept-child-onclick -->

  The trigger used to be `<PopoverTrigger render={children} />`, and Base UI's `render` has **mergeProps**
  semantics: same-named handlers run one after another. So the most natural use of all -- wrapping an
  existing button in a Popconfirm to add a confirmation step -- produced **the destructive action running
  to completion, and only then a dialog asking about it**, at which point clicking "Cancel" changes
  nothing (#267).

  This one fails on the worst possible side: the safety net goes out silently, with no symptom at all --
  the confirmation still pops, nothing throws, nothing warns, and you only find out by checking the data
  afterwards. The reporter discovered it in production after one click on Export handed a Word file
  straight to the client. And what trips it is the most typical usage there is: Delete / Export / Reset
  buttons in an admin app **already have an `onClick`**.

  **Two behaviour changes:**

  - An `onClick` on `children` **is dropped**, and development builds log a warning naming it. The action
    always belongs in `onConfirm`.
  - `disabled` changes from "render the trigger but never open the popup" to "**skip the confirmation and
    still run `onConfirm`**". Otherwise, once the action has moved into `onConfirm`, that tier turns into
    "this button does nothing at all" -- the same trap waiting one step further along. To make the button
    genuinely unclickable, put `disabled` on the child element.

  With that, "one button that only sometimes needs a question" no longer needs two copies:

  ```tsx
  <Popconfirm
    title="The body still has unfilled placeholders. Export anyway?"
    disabled={!hasPlaceholders} // no placeholders: no confirmation, the click exports directly
    onConfirm={exportDocx} // the action always lives here
  >
    <Button variant="outline" loading={exporting}>
      Export Word
    </Button>
  </Popconfirm>
  ```

  **Only `Popconfirm` changes.** For `Popover` / `Tooltip` / `Dropdown`, opening an overlay should not
  swallow whatever the child already did, so merging is right for them; Popconfirm exists to *stop* that
  action, so replacing is the only self-consistent option. A handler that only called `stopPropagation`
  (common inside clickable table rows) goes as well -- move it to a wrapper outside Popconfirm.

- `RichTextEditor` gains a height cap: the new `maxRows` / `maxHeight` make the body scroll internally <!-- parity-id: rich-text-editor-max-height -->

  There was only `minRows` and **no way at all to express an upper bound**, so the editor's height simply
  followed the length of the body. In an admin app "one field is a whole long article" is the norm
  (privacy policies, terms of service, campaign rules, product descriptions), and legacy content the
  content team has accumulated over years routinely runs to several thousand words. Measured on a real
  page, an 8,343-word body stretched the content area to 8,897px and the page to 12,237px, so an operator
  had to scroll 14.6 screens to reach Save at the bottom; with two editors on one page, a long first one
  pushed the second down to 9,000px (#264).

  The two props are one thing in two units, so pick one:

  ```tsx
  <RichTextEditor minRows={8} maxRows={20} />       // same unit as minRows (1 row = 1.75rem)
  <RichTextEditor minRows={8} maxHeight={480} />    // or straight pixels
  <RichTextEditor minRows={8} maxHeight="60vh" />   // or any CSS length
  ```

  When both are given `maxHeight` wins (with a development warning). A `maxRows` smaller than `minRows`
  **does nothing at all** -- `min-height` beats `max-height` in CSS, so the content area still expands to
  `minRows` and never scrolls, and there is no way to tell that from looking at it, so that case is named
  too.

  **The scrolling lands on the body container, with the toolbar as its sibling**, so the bold button is
  still within reach several thousand pixels down. Only the library can provide this tier: wrapping
  `max-h-[480px] overflow-y-auto` around the component in product code can only wrap the **whole shell**,
  and the toolbar lives inside that shell, so the toolbar scrolls away with the body -- worse than no cap.
  Scrolling the body alone would mean reaching into the component's internal DOM structure.

  With neither prop, the component's DOM and behaviour are **byte-for-byte unchanged** -- existing
  consumers are not quietly altered.

- All seven Table composition primitives now take a `ref`, so the scroll container inside `TableRoot` finally has a handle <!-- parity-id: table-primitives-ref -->

  `TableRoot` is the only element among the composition primitives carrying `overflow-x-auto`, yet
  `TableRootProps` extended `HTMLAttributes<HTMLDivElement>`, which has no `ref` -- so **there was no way
  in the type system to reach that scroll container** (#265). It worked at runtime, because in React 19 a
  function component's `ref` is an ordinary prop that rides along in `...rest` and gets spread onto the
  div, which left it "usable but not safe to use": a coincidence that was never written into the
  contract. This change is types only; the implementation is untouched.

  Horizontal scroll state **exists only on that div**, so product code needs the reference the moment it
  wants to do anything with horizontal scrolling: a hand-drawn floating scrollbar (on a wide table the
  native one sits at the bottom of the table, out of reach until you scroll all the way down), a
  `ResizeObserver` on the container width, "scroll to column N", or two tables scrolling in sync. None of
  the existing workarounds hold up: `querySelector` cannot pick the right one with several tables on
  screen or a table inside a table; walking up from the child `<table>` with `parentElement` writes the
  library's internals into product code (the high-level `Table` really does add a wrapper for
  `stickyScrollbar`); and wrapping another `div` around it gives you a layer that is not the scrollport,
  where `scrollLeft` is always 0.

  ```tsx
  const scroller = useRef<HTMLDivElement>(null)
  <TableRoot ref={scroller}>…</TableRoot>   // scrollLeft / scrollWidth live on this layer
  ```

  `TableHeader` / `TableBody` / `TableFooter` / `TableRow` / `TableHead` / `TableCell` get the same
  treatment -- "scroll to this row" and "measure this cell" are just as common in a hand-written table.

  The docs add one more note: when forwarding primitive props through a thin wrapper, `Omit` the `align`
  from `TableHeadProps` / `TableCellProps` the same way they do (they replace the wider native union with
  `"left" | "center" | "right"`).

- `TabsList` gains `size="sm"`, for an inline switcher sharing a row with a heading or a search box <!-- parity-id: tabs-size-sm -->

  `Tabs` had a single size, but in an admin app a tab bar is often not page-level navigation -- it is a
  switcher on the same row as a heading and a search box, and that row is already 28-32px tall. With a
  count `Tag` in it, a tab in the old tier was **36px in a 44px track**, which does not fit (#269).

  The size is stacked up layer by layer, each of them reasonable on its own: `py-1.5` on `TabsTab` (12px)
  plus a default `md` `Tag` (24px) plus `p-1` on a solid `TabsList` (8px) = 44. So the whole tier **has to
  shrink together**, which is also why product code cannot squeeze it back: `TabsList` is an
  `inline-flex items-center`, so `className="h-7"` only makes the tabs overflow while staying centred,
  and the solid pill sticks out 4px above and below the track -- worse than being slightly too tall.

  Measured in a real browser (`getBoundingClientRect`, not arithmetic):

  |                                | Track (solid) | Tab    |
  | ------------------------------ | ------------- | ------ |
  | `md`, text only                | 40            | 32     |
  | `md`, text plus a count `Tag`  | 44            | 36     |
  | `sm`, text only                | **28**        | **24** |
  | `sm`, text plus `Tag size="sm"`| 32            | 28     |

  `size` sits on `TabsList` (the same layer as the `variant` skin) and reaches `TabsTab` through context,
  so it never has to be repeated. `md` is the default and **keeps the previous class names verbatim**, so
  call sites that do not pass `size` render identical DOM. The `--active-tab-*` machinery behind the
  Indicator needs no change: the pill box follows the tab box, and in both tiers it measured pixel-equal
  to the active tab and entirely inside the track.

  A count `Tag` inside a `sm` tab **needs its own `size="sm"`** -- the component does not override a size
  the child declared explicitly, because reaching in from the outside to restyle an inner component is
  exactly what product code is told not to do here.

### Patch Changes

- `Tag` docs gain a "surface recipes" table: which text colour goes on a soft tint now has a public answer <!-- parity-id: tag-surface-recipes -->

  Those three lines in the `compoundVariants` of `tag.tsx` were the answer all along, but they lived
  **only in the source**: what `tag.md` said about `variant` was one sentence -- soft tint / solid fill /
  outline -- with nothing about the text colour of each step. Anyone painting a tinted highlight of their
  own (not a Tag, not an Alert, just a block they assemble) had to read the component source to find the
  recipe.

  | Step    | Fill                                      | Text                      |
  | ------- | ----------------------------------------- | ------------------------- |
  | solid   | `bg-warning`                              | `text-warning-foreground` |
  | soft    | `bg-warning-subtle` (or `bg-warning/12`)  | `text-warning`            |
  | outline | `border-warning`                          | `text-warning`            |

  It also spells out that `-foreground` **only matches a solid fill**: in light mode it is plain white, so
  on a tint it is white on white and the text disappears, while dark mode looks right (#268). The
  token-side comment is in the `@hulianui/tokens` entry of the same release.

## 0.44.0

### Minor Changes

- 85679f0: `DateRangePicker` gains month and year ranges: the new `picker="date" | "month" | "year"`

  `DatePicker` has had three granularities all along while `DateRangePicker` had only **days** --
  "pick a range of months" had no component in the library, leaving two `picker="month"` DatePickers
  stitched together (#262). That stitching is short three things a real range picker has: no range
  highlight (two independent panels, so the span between them is invisible), no `presets`, and both
  ends have to bound each other by hand through `minDate` / `maxDate` -- miss one and a range whose
  start month is later than its end month becomes selectable.

  The new `picker` carries the same name and meaning as the prop on `DatePicker`, completing the map:

  | Element Plus        | HulianUI                         |
  | ------------------- | -------------------------------- |
  | `type="daterange"`  | `DateRangePicker` (default)      |
  | `type="monthrange"` | `DateRangePicker picker="month"` |
  | —                   | `DateRangePicker picker="year"`  |

  Three things follow the granularity:

  - **Value shape**: `["YYYY-MM-DD", …]` / `["YYYY-MM", …]` / `["YYYY", …]` -- the same fixed-width
    text `DatePicker` and `Calendar` use, where lexical order is chronological order. The default
    `displayFormat` follows too.
  - **Panels**: two month calendars, two year pages (12 months each), or two 12-year pages. A year
    page is deliberately a full 12-year block rather than a decade: a decade's leading and trailing
    filler years would make the same year appear on both pages at once.
  - **Presets and placeholders**: the month step offers This month / Last 3 months / Last 6 months /
    This year, the year step This year / Last 3 years / Last 5 years, all resolved through the locale.
    (The new locale entries under `dateRangePicker` are optional, so consumers shipping a full locale
    of their own are unaffected.)

  **`minDate` / `maxDate` / `disabledDate` always speak in ISO dates**, regardless of `picker`, and
  the decision reuses the same pure logic as `Calendar` and `DatePicker`: a cell is disabled only when
  the whole segment is out of bounds. So passing today as `maxDate` gives "current month selectable,
  future months greyed out" -- the fix for the trap in the issue, where an operator picking "July" on
  the right-hand panel got *next* year's July, the backend only validated the `yyyy-MM` shape, and the
  column silently reported zeros with nothing on screen to show the filter was wrong. At month and year
  granularity `disabledDate` is asked once per segment, with that segment's **first day**.

  Day granularity is unchanged in both behaviour and DOM.

- c6ce7f5: `Table` supports grouped (multi-level) headers: group names get their `colSpan`, standalone columns span both rows

  `Table` has always rendered multi-row headers from TanStack's `getHeaderGroups()`, but that row of
  `<th>` elements **never carried `colSpan`** -- a group name spanning 4 leaf columns occupied a single
  cell, the two header rows disagreed on cell count, and the whole thing skewed (#261). The
  `isPlaceholder` branch was already there, so grouped headers were clearly intended; only the span was
  missing. None of the three gates (tsc / guard / build) says a word and the console stays clean; you
  only find it by looking at the header.

  This version completes it:

  - **A group name spans its leaf columns** and is **centred** by default -- pinned to the left edge of
    the leftmost column it reads as "this is the first column's name".
  - **When standalone and grouped columns are mixed, the standalone ones span both rows.** TanStack
    expresses row spanning by putting an empty placeholder cell in the upper row, so rendering it
    verbatim leaves every standalone column wearing a blank header. It now renders the real name on the
    row where the column first appears and `rowSpan`s to the bottom, matching Element Plus and Ant Design.
  - **Width declarations on leaf columns now take effect.** `size` / `minSize` / `maxSize` were only
    collected from the **top level** of `columns`, and in a grouped table the columns actually carrying
    data are the nested leaves -- so every width declaration in such a table was silently ignored.

  Two boundaries worth stating (both documented): under grouped headers **pinning (`meta.sticky`) applies
  to leaf columns only** -- offsets accumulate from leaf widths and a group cell spanning several columns
  has no offset of its own; **sorting and filtering also live on the leaf columns**, since a group column
  has no accessor.

  Single-level headers are **byte-for-byte unchanged**: a span of 1 emits no `colSpan` / `rowSpan`.

  > Note: TanStack v8's `header.rowSpan` field is **always 0** (it never implemented row-span semantics;
  > spanning is expressed through placeholders), so the row spanning here is arranged by the component
  > itself. Copying `rowSpan={header.rowSpan}` would only produce dead code.

### Patch Changes

- 85571aa: `Button`'s press feedback no longer applies twice: pressing scales by 3%, not 6%

  0.43.0 moved `pressableClass` (which carries `active:scale-[0.97]`) into `BUTTON_BASE_CLASS`, but the
  motion `whileTap={{ scale: 0.97 }}` already on `<Button>` stayed. The two use **different CSS
  properties** -- motion writes an inline `transform`, while Tailwind v4 compiles `scale-*` into the
  standalone `scale` property -- so instead of overriding, they **multiply**: 0.97 × 0.97 = 0.9409, a
  press of roughly 6%, twice what was intended (#260).

  The motion half is what goes, for two reasons:

  - **Reduced motion is always the library's job.** `pressableClass` ships
    `motion-reduce:active:scale-100`; `whileTap` has no equivalent guard, so under
    `prefers-reduced-motion: reduce` the JS half kept scaling.
  - **`<Button>` no longer pulls in a motion runtime**: `m.button` + `LazyMotionProvider(domAnimation)`
    are gone from its dependencies. That is exactly why `pressableClass` exists -- "no motion runtime, so
    that 'a press does something' can cover the whole library". Measured on the same size gate, the button
    entry goes from 3 chunks / 418 modules / 38.0KB to 1 chunk / 13 modules / 11.1KB (gzip, total).
    **The initial chunk barely moves** (11.2 → 11.1KB), because that `domAnimation` was always behind
    `LazyMotion` -- what is saved sits after first paint, not in it.

  The `render` path (rendering as `<a>` / `<Link>`) now shares its press feedback with the `<button>`
  branch: both come from the base className. The doc line saying "render does not use motion, so there is
  no press scale" is updated accordingly -- it has had one since 0.43.0.

  A test now pins down "only one source of scale per button". This defect's shape is two places that are
  each correct and only wrong together, which no per-file review catches.

- 60854de: `CardHeader` / `PageHeader`: `extra` no longer drops to a second row when the title or description grows

  The left column of `CardHeader`'s structured form carried only `min-w-0`. When CSS collects flex items
  into lines it uses each item's **hypothetical main size** (Flexbox §9.3), and `flex-basis: auto` with no
  width resolves that to **max-content**; `min-w-0` only relaxes "how small it may shrink within a line"
  and **does not lower the base size**. So a sufficiently long `description` pushed the whole `extra` block
  to a second row -- even though the left column could shrink perfectly well, and even though the call site
  had already written `truncate` / `line-clamp` (those govern how overflow is displayed and do not affect
  max-content).

  The symptom is one call site and one viewport producing **two layouts purely because the data differs in
  length**: of 12 identically shaped cards on the consumer's page, the 3 with the longest descriptions
  dropped their 12px chevron below the description, alone on a row of its own (#263).

  With the left column set to `flex: 1 1 0` (`grow basis-0`), wrapping is decoupled from content length.

  The difference between the two components is **deliberate**, and the test is "does this container's width
  equal the viewport's":

  - **`PageHeader`** keeps `max-sm:basis-auto`. A page header is always full width, so "narrow viewport"
    does mean "narrow header", and the comment's "extra wraps below on narrow screens" was the intended
    behaviour all along -- it was merely being triggered by content length, and now means what it says.
  - **`CardHeader`** has no such step. Card width comes from the layout (515px in a three-column grid, a
    280px sidebar card) and has nothing to do with the viewport: a 900px desktop window may hold a narrow
    card, while on a 375px phone the card is full width -- a viewport breakpoint guesses wrong both times.
    The trade-off matches Ant's `.ant-card-head-wrapper` and MUI's `CardHeader`: `extra` stays on the line
    and a long title truncates. **The flip side is that `extra` keeps its slot in a narrow card**, so
    giving the title an overflow treatment is the call site's job.

  The bare-slot branch (no slots passed) is byte-for-byte unchanged -- that branch is not flex at all.

  Adds `card.browser.test.tsx`, whose test is "for one header, changing only the character count of
  `description` must not move `extra`'s `top` or the header's height". It has to run in a real browser:
  jsdom has no layout, `getBoundingClientRect()` is always 0 and flex never wraps, so the bug cannot occur
  there at all. Class-name assertions cannot catch it either, because `min-w-0` was present the whole time
  and looks right -- what is wrong is that it has no say in wrapping.

- 475d11a: `RowActions` spaces its actions per form: 4px → 16px in the text form

  The text form renders `variant="link"` buttons, and `link` is pinned to `h-auto px-0` in `Button`'s
  compoundVariants (a plain text link, whose left edge must line up with the column header) -- so **all**
  the separation between two actions comes from the container's `gap-1`. 4px is enough in the button and
  icon forms (those buttons carry horizontal padding of their own, making the visual gap `gap + 2x
  padding`), but in the text form it glues a row of Chinese actions into one phrase -- three two-character verbs
  (Edit / Unpublish / Delete) run together and read as a single six-character phrase rather than three
  clickable things. And the text form is the default.

  16px follows the existing convention for table row actions (Element UI ~10px, Ant Design 8px on each side
  of its divider): clearly looser than 4px, without letting three actions blow up the column width.

  **The button and icon forms render byte-for-byte as before** -- they were never short of separation, and
  widening them would only eat horizontal space.

  A note for consumers: the action column gets wider in the text form, by 12px per additional action. Tables
  with hand-written column widths deserve a second look (measured: those same three actions come to 116px
  of content, so a 150px column estimated at the old 12px spacing still has room).

## 0.43.0

### Minor Changes

- caf756a: Press feedback moves into the `Button` base: one feel across the library

  Until now that feedback only lived on the components built from a **bare `<button>`** (FAB / Segmented / Toggle / FilterChip / SocialButton / AppLauncher / Legend / AwardBadge), while everything going through `<Button>` had none -- two different feels on one page, with "which one has it" depending on which component happened to implement that button. Press feedback is the common language of a clickable element, so it belongs to the base.

  `BUTTON_BASE_CLASS` now carries `pressableClass`: a slight scale on press (0.97), with the duration and curve taken from the motion system's fast step, and both the scale and the transition dropped under `prefers-reduced-motion: reduce` (the library always owns that preference, so call sites need not opt out). **Every `<Button>` changes how it feels** -- it gains the press deformation while colour transitions stay as they were.

  Two boundaries:

  - The base carries `pressableClass` and **not** `transition-colors`, and the two cannot sit side by side: tailwind-merge treats `transition-*` as one conflict group and keeps only the last, discarding the earlier one entirely. `pressableClass` ships a full transition-property list including colour, precisely so it can replace it. The consequence is documented: **adding your own `transition-*` in `className` throws the press feedback out wholesale**, so change the transition only by writing the scale back in too.
  - The effect buttons (ShimmerButton / RainbowButton / PulsatingButton / RippleButton) sit on a different base and **deliberately** lack this feedback: what they animate is a self-drawn background, and their transition properties are each their own. A test locks that boundary.

  The copy `RowActions` attached for itself last version goes away with it -- the base has it now, and attaching it twice means nothing.

- a3131df: `Combobox`: a content slot on `ComboboxTrigger`, no more prefilled popup search, and per-instance create-row copy

  **`ComboboxTrigger` takes `children` (#257).** The trigger's content was hard-coded to "selected label ?? placeholder", and `children` was explicitly `Omit`ted from the type -- so it **could not degrade into a status icon**, which is the only shape that fits a narrow table cell: the cell already shows that name in a field of its own, and a trigger repeating it puts the same value there twice, reading as two fields. `placeholder` cannot express it (string only, and it disappears the moment something is selected), and turning `label` into an icon node would make the popup list a column of icons. Now a node gives fixed content and a function branches on the selected value (two icons for bound/unbound being the common shape). `showChevron` comes along with the same meaning it has on `ComboboxInput` -- a chevron next to a lone icon takes the width back, and saving width is the whole reason to go down this path. Omitting `children` keeps the original behaviour.

  **`creatable` no longer prefills the popup search box with the selected label (#258).** `creatable` injects a `defaultInputValue` to take ownership of the input string (otherwise Base UI's items sync eats the first keystroke), and the value it used was the selected item's label. With an inline `ComboboxInput` that is right -- the input *is* the field. With `ComboboxTrigger` the prefilled input is the **search box inside the popup**: on first open the selected item's full name is already sitting there, whatever the user types is appended to it, the create row becomes that concatenation, and picking it persists the lot. It also only bites on the first open (the query updates after one selection, so the second open is clean), which is the easiest kind of defect to miss. The value now follows the pattern: the label for inline, an empty string for the trigger form.

  The pattern is detected by scanning `children` for a `ComboboxTrigger`. A context registration cannot work here: `defaultInputValue` is consumed the moment Root mounts, while children render afterwards, so the registration always arrives a step late. A trigger wrapped in the consumer's own component escapes the scan and falls back to the inline behaviour -- the status quo before this change rather than a new trap -- and `defaultInputValue=""` covers it explicitly.

  **`createLabel` (#259).** The create row's copy only honoured the global locale's `combobox.create`, so two `creatable` comboboxes in one app that need to say different things had to nest a `ConfigProvider` overriding the global entry (and spread the whole `combobox` section to avoid dropping `clear` and `remove`). It is now overridable per instance on `Combobox`, falling back to the locale when omitted, mirroring how `emptyMessage` works.

- 533c001: `RainbowButton` / `RippleButton` / `PulsatingButton` gain `render`: the "button-styled link" is no longer half-given across the effect buttons

  `render` -- applying the button's styling and inner decoration to an `<a>` or a Next.js `<Link>` -- existed only on `ShimmerButton` and `InteractiveHoverButton`. That is not a missing convenience prop but one capability given to half of a set: which effect a consumer can pick depends on whether it can act as a link, and until now the only way to find out was to read the source (#256). The rationale did not hold either -- "the landing-page CTA is a link" was written for the shimmer button, and a rainbow button meets that case at least as often.

  All three now share the same signature, semantics and merge order as the existing two (this component's props, style and className first, whatever the `render` element carries second, so a caller's own values always win), through the single `renderAsElement` helper. Their inner structures travel with them:

  - `RainbowButton`'s blurred bottom glow is an absolutely positioned sibling, and `relative` merges across with the className, so the glow cannot go looking for some other positioned ancestor
  - `RippleButton` clips its ripple with `overflow-hidden`, while an `<a>` defaults to `display: inline` -- the base's `inline-flex` sits on the same className string, so both cross together
  - `PulsatingButton`'s halo is the element's own `box-shadow` keyframe and follows the styles

  The `variant` note on `RippleButton` now separates two things that were easy to conflate: "use `Button variant=\"link\"` if you want link styling" is about **appearance** (whether there is a button box), while needing `<a>` semantics -- middle-click to open a new tab, copy link address, crawlability -- is what `render` is for. They do not compete.

- 533c001: New `FlipText`: a page heading whose characters flip in 3D on hover

  By purpose, the library's twenty-odd text effects came in two kinds only -- one-shot entrances and standing decoration. The missing one was the heading interaction: touch it and it flips (#254).

  Three choices differ from every existing text effect, and all three come from the heading use case:

  - **It takes `children`, not `text: string`.** A heading is almost always a variable or an expression (`{templateName}`, `{name || "Untitled customer"}`), and demanding a pre-joined string shuts every one of those call sites out. Plain text is extracted recursively before splitting, and when no text can be extracted the children render as-is rather than vanishing.
  - **`as` participates in type inference.** What it renders is a page heading, so it has to *be* the `h1`/`h2` -- wrapping it as `<h1><FlipText/></h1>` is a redundant nesting and makes a screen reader announce two headings. This is exactly what `PageHeader`'s `titleAs` is designed to receive. `ref` is added to the type too (the polymorphic base uses `ComponentPropsWithoutRef`, so it previously needed a cast).
  - **One complete round; it does not follow hover state.** Moving the pointer away mid-flight never leaves characters frozen on an angle, and re-entering while it plays does not restart it.

  It deliberately does not pull in motion: the whole effect is one transform keyframe plus one `animation-delay` per character, which plain CSS covers. A heading component appears on nearly every page, and dragging an animation runtime into that first-paint path for a hover flourish does not pay.

  The back-face character **never enters the DOM text** -- it is rendered from a pseudo-element via `content: attr(...)`. As a real node it would be a second copy of the same character, doubling every letter in the `h1`'s `textContent` and polluting both copy-paste and whatever a crawler reads. The rule and the four directional keyframes ship in the `@hulianui/tokens` preset, so this component needs the library preset CSS (a normal setup already has it).

  Under `prefers-reduced-motion: reduce` nothing flips and the front face stays: both faces render the same character, so the resting state is already the complete heading.

- 533c001: New `TextReveal`: a multicolour band sweeps across, revealing text from transparent to solid

  By **purpose** the library's twenty-odd text effects were all one kind: a one-shot entrance, triggered on scroll, resting once played. The missing kind is the looping one that means "this is in progress" -- the stage name of a long background task ("Running OCR", "Parsing", "Archiving"). The difference is not a parameter but a purpose: an entrance is over once it plays, whereas for a progress label **the animation stopping is itself an error signal**, since the user reads "still moving" as "the task is still alive" (#255).

  Both uses share one component: the default `startOnView` without `repeat` is the entrance (one sweep, resting fully revealed), while `repeat startOnView={false}` is the progress form.

  The line against its closest neighbour is clean: `AnimatedShinyText` lays a single-colour highlight over text that is **already visible**, while this reveals it from transparent with a configurable band. The two meanings are not stuffed into one component.

  Three implementation choices:

  - **Reduced motion does not erase the text.** The text itself is `color: transparent` and shows through the background gradient, so the intuitive "turn the animation off" would make the whole string disappear. The animation carries `fill-mode: both`, so under `prefers-reduced-motion: reduce` it simply does not exist and the element falls back to its static `background-position`, i.e. the whole string in `textColor`. Structural, not a JavaScript fallback that seeks the sweep to its end.
  - **Width reservation for rotating strings measures nothing.** Every string stacks into the same grid cell, so the box is naturally as wide as the widest one -- no cloned ghost node to measure, no re-measure after the webfont loads, and no drift across fonts or sizes. The placeholder strings carry their copy in a data attribute and render it from a pseudo-element, keeping it out of the DOM text; otherwise the label's `textContent` would be every stage name concatenated.
  - **No motion runtime.** One background-position keyframe and one IntersectionObserver cover it. Restarting a sweep rewinds the animation rather than remounting the node, because the node is the one being observed -- remounting it would leave the observer watching a detached element.

  One constraint worth carrying to call sites: `textColor` **cannot be `currentColor`** -- the glyphs are transparent, so `currentColor` resolves to exactly that transparent and the string disappears. Pass an explicit token to follow the container.

## 0.42.0

### Minor Changes

- b67e08b: `Descriptions` gains what an admin detail view actually needs: label columns that line up across rows, container-driven column collapsing, a density step, an empty-value placeholder, and value alignment

  This started from using it to build admin detail pages, where "can it hold other components" turned out not to be the question -- `children` has always been a `ReactNode`, so images, `Tag`s and `CopyButton`s drop straight in. Layout was the blocker:

  - **Label columns now line up across rows (a behavioural fix).** Each entry used to be its own flex row, so the label width came from **that cell's own text** -- one table holding "Nickname" and "Linked mini-program store" produced two different widths and left the values in a column ragged. The outer grid now opens a label track and a value track per column and every entry borrows them through `subgrid`, so label width is decided per column (by that column's longest label) and alignment falls out of the layout instead of a guessed number. **This changes how existing pages render** -- what used to be ragged now lines up.
  - **`labelWidth`.** The one case that still needs a manual pin is **two stacked tables that must agree** ("Profile" above "Execution log" would otherwise each size on their own longest label). Numbers are pixels.
  - **Column count follows container width.** `column` changes meaning from "exactly N columns" to "**at most** N": under 32rem it drops to one column, 32-48rem two, 48-64rem three. The measure is the container, not the viewport -- detail views live in drawers and split panes where the viewport is wide while the block is 380px, so viewport breakpoints are the wrong judge (same prescription as `ProForm`). An entry that spans more columns than a step allows falls back to a full row rather than reaching for tracks that do not exist, which would grow implicit columns and skew the table.
  - **`size`.** `sm` tightens cell padding only and leaves the font size alone -- staying readable is the point of a dense table.
  - **`emptyText`** (default `"—"`). Admin data is full of empty fields, and without this every call site writes `?? "—"` while the ones that forget collapse into blank space -- and blank is not the same thing as "this field does not exist". Empty means `null`, `undefined`, `""` or `false`; the number `0` still renders, because "0 records" is a fact, not a missing value.
  - **`align`.** Decides whether the label sits at the top or centres when the value is an image, an avatar or a row of tags. `align="baseline"` cannot work under `bordered` (the label cell has to fill the row height or its background only hugs the text), so the component warns in development and falls back to `start`.

  New `descriptions.browser.test.tsx` (real Chromium): label alignment, narrow-container collapsing, `labelWidth` pinning, and spanned entries not overflowing -- four layout facts jsdom cannot answer. It immediately corrected an assumption: label width is unified **per column**, not across the whole table, matching how `<table>` sizes columns.

  The docs gain a "label alignment and responsiveness" section and a "what goes in the value" section, the latter covering single images and avatars, a strip of thumbnails (with `ImageViewer`), status `Tag`s, and an action next to the value.

- 90a761c: New `RowActions`: the action set for a table row

  The library had no layer for this, so every table hand-rolled `<div className="flex gap-1">` plus a run of ghost icon buttons in its actions column -- this repo's own blocks and demos included. Each table then repeated the same three faults:

  - **No hierarchy**: view / edit / delete render as the same button, so a destructive action carries the same weight as a read-only one
  - **Actions pile up**: with no "keep a few visible, fold the rest away" rule, column width drifts with the action count
  - **The same chores get rewritten everywhere**: accessible names for icon buttons, the tooltip explaining a disabled action, confirmation for destructive ones

  None of those are any one table's business; they are the shape of row actions as a pattern.

  ```tsx
  <RowActions
    actions={[
      { key: "view", label: "View", tone: "brand", render: <Link href={`/orders/${row.id}`} /> },
      { key: "edit", label: "Edit", onSelect: () => openEdit(row) },
      { key: "del", label: "Delete", tone: "danger", confirm: { title: "Delete this record?" }, onSelect: remove },
    ]}
  />
  ```

  Several judgement calls are baked into the implementation and worth stating:

  - **Past `max`, only `max - 1` actions stay visible**, not `max`: the menu trigger occupies a slot of its own, so keeping `max` and adding a "..." makes `max + 1` controls and a column one slot wider than the caller expects.
  - **Destructive actions sit last in the overflow menu, behind a separator**: a menu is where a slipped click lands on whatever is under the cursor, and putting Delete beside Edit invites exactly that.
  - **Disabled does not use the native `disabled` attribute**: a natively disabled button is neither focusable nor a source of pointer events, so the "why is this greyed out" tooltip can never appear -- precisely when it is needed most. `aria-disabled` plus a short-circuited click keeps the name readable, the tooltip reachable and the keyboard path intact. Inside the menu, where hovering means selecting, `disabledReason` is written right after the name instead.
  - **The confirmation dialog lives inside the component**, not behind the imperative `modal.confirm`: that one needs a `<ModalProvider />` at the app root, and when it is missing **nothing happens at all** -- the user clicks Delete, no dialog appears, the action never runs, and the console stays silent. Row actions are the last place that should happen. Owning the dialog also keeps confirmation identical before and after an action collapses into the menu.
  - **Navigation actions go through `render`**: `onSelect` plus `router.push` throws away Cmd-click for a new tab, middle click and copy-link, which admin users rely on daily.
  - `hidden` and `disabled` are different things: no permission means `hidden` (the action should not be advertised), while a state that currently forbids it means `disabled` plus a reason (the user should learn why not).

  Three forms (`variant`) differ only in prominence and share their tones: `text` is borderless (a run of borders chops a table up), `button` is outlined (when actions really change data, clickability should not have to be guessed), and `icon` is icons only (dense tables). The overflow trigger follows the form -- no borderless "..." appears among outlined buttons.

  **Async actions are handled end to end**: returning a Promise from `onSelect` spins that action and holds the rest of the row (two writes fired from one row reach the server in essentially random order); with `confirm`, the confirm button spins too and **the dialog closes only on success**, staying open on failure so the user can retry, and Escape, the overlay and cancel all refuse to close mid-flight (closing then tells the user they cancelled something that was never cancelled). On rejection the component only stops the spinner and shows no error copy -- that is business semantics.

  Two more: `revealOnHover` keeps the actions hidden until the row is hovered (needs `group/row` on the parent; keyboard focus reveals them, and touch devices keep them visible -- Tailwind's hover variant is already gated behind `(hover: hover)`, so without an explicit restore the column would simply vanish there), and when every action is filtered out by `hidden` the component renders nothing rather than an empty flex shell with a gap in it.

  Deliberately **not** implemented: shrinking `max` automatically on narrow screens. The actions column is sized by its content, so making the content follow that width closes a loop. Pass a smaller `max` yourself, or switch to `variant="icon"`.

  `label` is deliberately a `string` rather than a `ReactNode`: it has to serve as the accessible name, the tooltip and the menu's type-ahead term at once, and all three only take strings.

  New localisation entries under `rowActions` (`more` / `confirm` / `cancel`), following `ConfigProvider`.

## 0.41.0

### Minor Changes

- `CellEditor` closes five gaps at once: variant passthrough, a draft outlet, retry after a failed save, native attributes, and releasing focus (#248-#252) <!-- parity-id: cell-editor-passthrough-draft-revert-blur -->

  All five come from one consumer and one table -- a 13-column employment-record reconciliation sheet. Read one at a time each looks like "a missing prop"; together they share a shape: `CellEditor` had exactly one appearance, one outlet and one attribute set, so any table whose assumptions differed could not migrate at all.

  - **Variant passthrough (#248).** `variant` / `size` now reach the inner Input / Textarea, defaulting to `variant="cell"` (identical rendering to the previous version). The `cell` variant used to be hard-coded, which made the `validate` prop added in #244 unusable in practice: every other editable column in the same row is an ordinary bordered input, so converting three of them to `CellEditor` produced a row mixing bordered and borderless cells -- and this library's own reason for keeping a border on the `xs` step (users tell which cells are editable by the border, #187) holds word for word in that table. "Validate before commit" and "the cell looks editable" were never supposed to sit on the same switch. We deliberately did not add a `bordered` boolean: the library already has two ways to say "dense table" (`variant="cell"` and `size="xs"`), and a third would need its own explanation of what the combinations mean.

  - **Draft outlet (#249).** New `onDraftChange?: (draft: string) => void`, broadcasting the current draft on every keystroke. Previously `onChange` was omitted from the type and `onInput` could not see the controlled draft, so any UI derived from typing -- a filled-field counter, a live preview, writing to localStorage per key -- had nowhere to attach, and the cell had to give up `CellEditor` entirely. We deliberately did not re-open `onChange`: with two callbacks that both look like "the value changed", consumers would write their save logic into `onChange`, which routes around the commit-on-blur contract.

  - **Retry after failure (#250).** When the promise returned by `onCommit` rejects, the equality baseline rolls back to the previous value. It used to advance before the `await`, so after a failed save, blurring again without editing was short-circuited by the equality check -- **you could not even retry**. The documented escape hatch ("catch it yourself in `onCommit`") has nowhere to land when `value` comes from a server cache (SWR, React Query): the cache did not move, `value` is unchanged, and the consumer holds nothing it could roll back with. The optimistic advance itself stays (blurring again while a commit is pending must not resend the same value); only failure rolls it back. `revertOnError?: boolean` (default `false`) additionally reverts the draft. The rollback has two gates: this commit must still be the latest one, and the baseline must still be sitting on it -- a newer value written from outside in the meantime is the fresher truth and must not be overwritten by a stale request's failure.

  - **Native attributes (#251).** `CellEditorProps` now forks on `multiline` into a union, the single-line branch extending `<input>`'s attribute set and the multiline branch extending `<textarea>`'s, so `name` / `type` / `maxLength` / `autoComplete` / `rows` all pass through. It used to extend `HTMLAttributes` (not `InputHTMLAttributes`), so only global attributes were accepted -- while the elements actually rendered are `<input>` and `<textarea>`. `rows` was the most awkward: `Textarea` has the prop, and the `cell` variant even lowers its default from 3 to 1, yet "how many rows to start at" remains a per-cell business fact (a business-scope cell is naturally taller than a postcode cell). The native `size` (character width) gives way to the variant `size`: same name, different meaning, and both cannot stay. The cost is documented in the type: `multiline` must be a literal, so toggling it from a boolean variable leaves TypeScript unable to pick a branch.

  - **Releasing focus (#252).** New `blurOnCommit` / `blurOnEscape` (both default `false` = today's behavior, focus stays in the cell). Consumers cannot add these themselves: calling `blur()` from `onKeyDown` fires the commit synchronously before `setDraft` flushes, so the closure still holds the old draft and **Escape turns into Save**. The implementation resolves that ordering with a ref mirroring the latest draft (commits always read the ref, never the closure) instead of rebuilding the "just pressed Escape" flag the component's comments explicitly argue against -- that flag is hard because of when to clear it, and a mirror ref has no clearing moment. Focus is not released when validation blocks the commit: the error is in this cell, so the user has to stay and fix it.

  New exports: `CellEditorVariant`, `CellEditorSize`, `CellEditorBaseProps`, `CellEditorSingleProps`, `CellEditorMultilineProps`.

- `PageHeader` hands over the title tag: new `titleAs` (#247) <!-- parity-id: page-header-title-as -->

  The title used to be a hard-coded `<h1>`, but "what heading level this screen's title is" is structural information owned by the page, not by the header skin: a page header is not necessarily the top-level heading, and the consumer's hero screens currently have no `h1` at all. The harder constraint is that consumer titles are often animated components that **must be the heading element themselves** -- nesting one inside the library's `h1` is both invalid HTML (`h1` takes phrasing content) and makes a screen reader announce two headings in one region.

  Now `titleAs?: ElementType` (default `"h1"`; omitting it renders exactly what the previous version rendered):

  ```tsx
  <PageHeader titleAs="h2" title={<AnimatedTitle as="span">Zhang San</AnimatedTitle>} />
  ```

  **Only the tag is handed over, not the font size**: after switching to `h2` the title is still 20px/28px. That is not an oversight -- the size can be restored with a descendant selector on the `className` that lands on the outer `<header>`, while the tag cannot, which is exactly why the tag is the part the library has to give up. Making the size follow the tag would be a breaking change and is not in this release.

  One documentation note comes along with it: a `meta` entry is an **array item**, not a rendered `<span>`. When migrating from the old `span + span::before { content: "." }` recipe, check the entries one by one -- that selector really means "insert a dot only between adjacent `<span>` elements", so wherever the row mixed in a button, icon or link there was never a dot in production. Porting such a row verbatim adds a separator that was not there before. It is a real visual regression, but not a bug in `meta` (treating every item alike is the correct behavior), so only documentation can head it off.

### Patch Changes

- `Textarea` now names `resize` overrides in development under the `cell` / `autoResize` variants (#253) <!-- parity-id: textarea-resize-half-override-warning -->

  What those variants emit -- "no drag handle, no overflow" -- is **two different CSS properties in one rule**, and tailwind-merge puts them in different groups: a consumer override replaces only the drag half, leaving the overflow half in place. The result is a box that can be dragged but clips its content with no scrollbar when dragged smaller -- and it **looks like the override worked**. A half-applied override is harder to diagnose than one that does nothing: a no-op is at least consistent, whereas this convinces you the override succeeded and sends you looking elsewhere.

  The rationale matches `Button`'s `muted` warning (a silently ineffective prop is harder to find than an error, so name it during development), except this case is more subtle -- that one is fully ineffective, this one is half effective.

  The warning states three things: this variant derives its height from content, the overflow half will not be overridden along with the rest, and a draggable box means switching to `variant="default"` without `autoResize`. It fires once per variant (a page holds dozens of cells), and the two variants carry separate keys -- their escape hatches differ (one switches variant, the other drops a prop), so a shared key would silence whichever variant you met second.

  **`resize` is not being re-opened**: `cell` and `autoResize` both mean "height follows content", and leaving a drag handle offers users an action the next remeasure will erase. The consumer agrees with that; what they reported is that the constraint was neither separable nor visible.

## 0.40.0

### Minor Changes

- b00e58d: Three consumer-reported gaps: `CardHeader` gains title vocabulary (#226), `PageHeader` gains a meta row (#240), and `BreadcrumbItem` gains a `render` slot (#239). In all three, passing none of the new props renders exactly what the previous version rendered.

  **`title` / `description` / `extra` on `CardHeader` (#226).** `title` and `description` are vocabulary this library already speaks: `DialogContent`, `PageHeader`, `PopoverContent`, `Empty`, `Result`, `AlertDialog` and `Drawer` all have them. `Card` was the only container with a header slot and no word for its heading. What was missing is not a style value but the structural fact of **which part is the heading**: when the header holds a single line of text, `font-medium` happens to equal "heading style", but in the row every admin console actually has -- icon, heading, status tag, actions on the right -- that `font-medium` paints the tag, the button and the counter as well, while the heading itself has no size, leading or hierarchy of its own. The consumer's numbers are blunt: 16 of 34 headers are that row, and **all 33** local `CardTitle` call sites hand-write a `className` to override the font size.

  We added props to `CardHeader` rather than exporting `CardTitle` / `CardDescription` subcomponents. Both give the heading an element, but only the former also answers the layout question -- how heading and subtitle stack, how the action area aligns, how it wraps on narrow screens -- and that is precisely the part the consumer rewrites at every call site. Pass none of the three and `CardHeader` is still today's bare slot (`children` as the body, `font-medium` on the container); pass any one and it switches to a two-column layout, at which point `font-medium` moves off the container and onto the heading element. `children` stays as an escape hatch and renders after the heading and description.

  **`meta` / `metaSeparator` on `PageHeader` (#240).** The line under the title that strings facts together with a middle dot (ID number, gender, three insurance periods, two companies, latest employer) had no slot: it is not `subTitle` (that is one sentence, not a run), not `tags` (those are status markers, these are facts), and not `footer` (that sits at the bottom, too far from the title). The consumer built `.identity-meta` and drew the dots with `span + span::before { content: "." }` -- a pseudo-element rather than literal text precisely because **an empty item must not leave a dot stranded**.

  `meta?: ReactNode[]` now inserts the separator between items, **dropping empty items first** (`null`, `undefined`, `false`, `""`), so call sites need no `filter(Boolean)` and a missing value never produces a doubled separator. The number `0` is a fact ("0 companies"), not empty. The row renders as `<ul>` / `<li>` with each separator in its own `aria-hidden` decorative slot (the pattern `Breadcrumb` already uses), so screen readers hear list items instead of one long string glued together by dots. The separator is configurable via `metaSeparator`.

  **`BreadcrumbItem.render` (#239).** `Breadcrumb` was the only navigation component in the library that could not reach a client-side router -- `NavMenuItem`, `Button`, `Link` and `SidebarMenuButton` all have `render`. Without it the consumer had to intercept clicks through event delegation on the `<nav>`, which means **hand-waving through every native behavior one by one**: Cmd+click for a new tab, middle click, Shift for a new window. Miss one and a user discovers the breadcrumb cannot be opened in a new tab -- compatibility that the framework's own Link component is supposed to own.

  `render` truly renders the element you pass (`cloneElement`) rather than delegating, so those native behaviors come back for free. Skin classes and `aria-current` merge into that element and `label` becomes its child; class order matches every other `render` in the library (component skin first, the element's own `className` last, so the caller wins). An item with `render` keeps it even when it is the current page -- it just gains `aria-current="page"`. If you want the last crumb to stay unclickable, do not give it a `render`.

- b00e58d: Three overlay gaps closed: Drawer sizes, Modal danger tone, Toast close handle (#230 #231 #227)

  - **`size` on Drawer (#230)**: `sm | md | lg | xl | full`. The main axis follows `side` -- left and right drawers consume width, top and bottom consume height -- so one step is not the same number on both axes (`md` is the 24rem / 20rem that 0.39.0 hard-coded, and omitting `size` renders identically). Previously `top` and `bottom` were pinned at 320px with no size field anywhere in `DrawerContentProps`, so a business panel that needed 760px had to abandon the component wholesale. Every step except `full` keeps its `min(90vw, ...)` / `min(90vh, ...)` cap: a drawer is edge-anchored, and whatever exceeds the viewport lands off-screen where nobody can reach it. The suggested `inset` shape is not in this release; `drawer.md` documents the className recipe, because it has to change the entry transform as well or closing leaves a strip behind.

  - **`danger` on Modal (#231)**: the confirm button switches to `tone="danger"` and the leading icon turns `text-danger` (same name and meaning as `Popconfirm`'s `danger`). The imperative confirm dialog had no dangerous register at all: `type` only drove the icon and its color while the confirm button stayed pinned to the default brand step -- so even `type="error"` could not help, and "this cannot be undone" wore exactly the same color as "Save". The icon **glyph** is still chosen by `type`: the glyph says "this is a question", the color says "the consequence is irreversible".

  - **`toast.close(id)` (#227)**: closes one toast by id, or all of them when called with no argument. `toast()` always returned an id, but the manager is a module-private singleton and nothing could consume it, so the chain "show progress, close it when the work finishes, then show the result" broke in the middle and "Uploading..." could sit next to "Upload complete" for up to five seconds.

  - **`loading` on toast (#227)**: renders a spinner before the title and changes the default `timeout` from 5000 to 0. It is not a second flavor of "sticky" next to `timeout: 0` -- it only changes that same default, and an explicit value still wins. It is always announced with `priority: "low"` (polite) even when `tone="danger"`: work in progress is an accompaniment, not a result, and it stays on screen for a long time. The spinner is `aria-hidden` (no live region nested inside a live region), and under `prefers-reduced-motion` it slows to one turn every 2.4s rather than freezing -- it is the only visual mark this state has, and freezing it would delete the information.

  - **`position` on ToastProvider (#227)**: six docking positions, defaulting to `"top-right"` exactly as before. The three bottom positions stack the queue upward so the newest toast always hugs the docking edge, and the entry slide flips with it. Which corner toasts appear in is a product decision, not a library decision.

- b00e58d: `Empty` gains a loading state (#245)

  A list region really has four states: loading, empty, filtered to nothing, and failed. The library covered the last three (`Empty` twice, `Result` once), so consumers pressed `Empty` into service for loading -- visually only a matter of whether something spins, semantically backwards: a screen reader announces a loading region as "no data", the user concludes the query finished and found nothing, and the request is still in flight.

  `Empty` now takes `loading?: boolean` (default `false`; omitting it renders exactly as before):

  - **The icon area becomes a spinner**, replacing the empty-box illustration -- a custom `icon` yields too, because what needs expressing right now is not "how empty it is". `icon={null}` still removes the icon area entirely: that is an explicit "I want no icon", independent of state.
  - **The aria work is split by source**: the container carries `aria-busy="true"` (this region is updating, do not read it as final), while the words "loading" are announced by the spinner's own `role="status"` plus a localized aria-label. Deliberately no second `role="status"` on the container: two nested live regions get read twice, and there is only one thing to say.
  - **Reduced motion**: under `prefers-reduced-motion: reduce` the spinner stops and freezes into a static double ring, with no DOM change.
  - `title`, `description` and `children` **still render** while loading: they are this state's copy, not leftovers from the empty state. So do not write `<Empty loading={loading} title="No data" />` -- that spins while claiming there is nothing.

  No new "four-state" wrapper component was introduced: `Empty` plus `Result` already cover three, and another layer would leave two ways to write the same thing, with a higher cost for choosing wrong. Documentation carries that weight instead -- `empty.md` and `empty.en.md` gained a section on which component each of the four states takes, what copy and action each needs, and why the error state must go through `Result` rather than `Empty` (using `Empty` disguises a failure as "there was never any data"). That section did not exist before, and without it the default consumer move is to reach for `Empty`.

- b00e58d: Three consumer-reported gaps: `PopoverContent` gains an anchor outlet (#229), `Combobox` gains free-text creation and a list header (#235), `CellEditor` gains pre-commit validation (#244). In all three, passing none of the new props renders exactly what the previous version rendered.

  **`anchor` on `PopoverContent` / `HoverCardContent` (#229).** When the trigger point is a **coordinate** rather than an element, `PopoverTrigger` cannot help: an annotation point computed over a DOCX preview, an anchor inside a canvas, a right-click position, a latitude and longitude on a map. They have a rectangle and no DOM node to hang a trigger on. That capability was sealed inside the component (`Positioner` only exposed `side`, `align` and `sideOffset`), so the whole overlay had to be redrawn by hand: in the consumer's 478 lines, well under half is business logic and the rest is rect math, edge flipping, viewport clamping, a `createPortal` with hand-written `left/top`, plus bespoke outside-click and Escape handling -- and **focus management and `aria-expanded` were simply never done**, which is the entire reason to hand overlays to a library.

  `anchor` passes straight through to Base UI's `Positioner` (an element, a ref, a function returning an element, or a virtual element that only implements `getBoundingClientRect()`); with it, the trigger can be omitted entirely and you drive `open` yourself. When the coordinate changes, hand over a **new object** (or use the `() => virtualEl` function form): positioning recomputes on the anchor's identity, so mutating fields in place moves nothing.

  `HoverCardContent` is opened at the same time: it wraps the same Base UI `Positioner`, and opening only half would leave two overlays that look identical where one can move its anchor and the other cannot. One difference remains -- there the trigger is still required, because the card opens on hover; `anchor` only changes where it attaches, not what opens it.

  **`creatable` / `onCreate` on `Combobox`, `header` on `ComboboxContent` (#235).** Long-tail fields such as issuing authority or employer name have hundreds of common values, and turning them into options saves most people typing -- but the operator genuinely holds a certificate that is not on the list. A pure select forces them to pick an approximate value, which is worse than free text. With `creatable`, whenever the current input has no exactly matching candidate, a row appears at the top of the list; choosing it goes through `onValueChange` as usual (both `value` and `label` are that string, trimmed) and fires `onCreate` once for persistence or for appending to `items` -- both happen, it is not either-or. Duplicate detection trims and ignores case, and compares **both** `value` and `label`: comparing only one side still surfaces a create row when the other side matches exactly, and taking it creates a duplicate of an existing entry.

  The create row is **a real option spliced into `items`**, not an extra line painted into the popup. The latter was tried and does not work: when `items` is supplied, Base UI truncates list navigation to the number of filtered results, so the extra line is unreachable by keyboard and it pushes the last real option out of the navigable range -- a mouse-only option is worse than the original gap. Going in through `items` keeps filtering, arrow keys, Enter, indices and `Empty`'s emptiness check automatically consistent, and it still works when more than 100 items switch on virtualization. The cost is that `creatable` requires `items` (options hard-coded as `children` have nowhere to splice, and a development-time warning says so), and that in this mode the component takes over one input string internally (it supplies `defaultInputValue`; without it, the `items` identity change caused by the create row appearing triggers an upstream input sync that eats the first character typed). The only visible consequence is that changing the selection from outside via `value` no longer moves the input text; pass `inputValue` if you need them linked. The create row's copy goes through locale (`combobox.create`), with Chinese and English both in place.

  `ComboboxContent` also gains `header`: `emptyMessage` only appears when there are zero results, so a hint that should be visible **at all times** ("just type it if you cannot find it") had nowhere to live -- with any matching history it never showed. `header` mirrors the existing `footer`: one above the list, one below, neither scrolling with it.

  **`validate` on `CellEditor` (#244).** Commit-on-blur means that without a validation layer an invalid value goes out first and gets rolled back by the consumer -- and by then the cursor is already in the next cell, so what the user sees is "the thing I typed changed itself back". `validate` moves that layer earlier: return a string and `onCommit` is blocked, the value never leaves, and the message appears in place. The order is equality check, then `validate`, then `onCommit`: an unchanged value is not validated at all (it was already accepted once).

  When blocked, the draft is **not** rolled back (so the user can keep editing the string they got wrong) and the equality baseline does not advance -- so the same invalid value is blocked again on the next blur, and only a corrected one commits. Typing again, pressing Escape, or restoring the value to the last committed one all clear the message (each of them means "that error no longer describes what is in this cell"). The red line reuses the inset underline the `cell` step of `Input` / `Textarea` already has (an `inset` shadow, zero layout shift) instead of inventing a second error skin, and the message is attached through `aria-describedby`. The error line is a **sibling** of the control rather than a wrapper around it: wrapping would change the control's parent element type at the moment the error appears, React would unmount and remount the input, and the cell being edited would lose focus -- which is exactly the moment a failed Enter validation needs focus to stay.

- b00e58d: Four Table / ProTable gaps from consumers (#236 #237 #238 #241)

  - **Composition primitives (#241)**: `TableRoot / TableHeader / TableBody / TableFooter / TableRow / TableHead / TableCell`, living alongside the high-level `Table`. They serve tables whose structure the application writes itself and that only want the library's skin -- two levels nested inside one row, a row that is entirely an editor, one record split into three rows by data. Writing those as a `ColumnDef[]` only translates a readable table structure into `cell` callbacks. Density steps, dividers, hover and selection backgrounds come from the same source as the high-level `Table`; this is not a second skin.
  - **Persistent full-width rows and a footer slot (#237)**: `Table` gains `renderRowExtra` (attach 0..N extra rows after each data row, with no expander column prepended and no expanded state required) and `footer` (rendered into `<tfoot>`, following `EditableTable.summary`, but rendered for empty tables too). Both callbacks receive `colSpan` -- the current visible column count including automatically prepended columns -- because a full-width row's `colSpan` simply could not be computed correctly from outside the component. `renderRowExtra` cannot be combined with `cellSpan`, matching `renderExpandedRow`.
  - **Header sticky to an outer scroll container (#238)**: `stickyHeader` widens to `boolean | "self" | "scrollParent"`, plus `stickyHeaderOffset` to clear a fixed page header. Under `"scrollParent"` the table creates no scroll area of its own and the header sticks to the page or content container; that step also actively removes the shell's `overflow-x-auto`, because `overflow-x: auto` makes the other axis compute to `auto` as well, turning the shell itself into a scrollport that pins the header to it (verified in Chromium: the header scrolls away with the page).
  - **Controlled column visibility and locked columns (#236)**: `ProTable` gains `columnVisibility` / `onColumnVisibilityChange` (same contract as `rowSelection`: supplying it makes the state controlled, and absent keys count as visible), so column preferences can be persisted and restored across devices; columns gain `meta.lockVisible`, which greys the entry out in the column settings menu and keeps it checked, and a controlled value of `false` does not override it.

  Everything here is additive: with none of the new props supplied, rendering is identical to 0.39.0.

- b00e58d: Three appearance and size gaps: `Tag` gains the `info` tone (#232), `Button` gains a 28px text size (#228), `RippleButton` accepts `variant` / `tone` (#233). In all three, omitting the new values renders exactly what the previous version rendered.

  **`info` on `Tag` (#232).** `Alert` has it, `toast` has it, and tokens carry `--color-info` -- only `Tag` did not. What was missing is not a color but a **meaning**: `brand` is the primary color and says "this relates to the product or the main action", while `info` uses the independent info color (a cyan-blue roughly 30 degrees from the brand hue) and says "this is a neutral statement of fact". The two really were the same color before tokens 0.8.0 added `--color-info`; `Alert` separated them in #173, and that unification never reached `Tag`.

  The consequence was a forced choice for inline labels such as "currently in external browser mode": falling back to `neutral` blurs them into a screen full of grey tags, and borrowing `brand` paints them purple where they compete with the primary CTA -- while they are not an action at all. That is why the consumer kept an unmigrated `StatusPill` of their own.

  `soft`, `solid` and `outline` plus the status dot color are all filled in **at once**, rather than shipping an "info exists only in soft" half-step -- a half-step just hands the selection burden straight back to the consumer. The value set and its order now match `Alert` exactly (`neutral` / `brand` / `info` / `success` / `warning` / `danger`).

  **`size="28"` on `Button` (#228).** After #222 filled in the icon sizes, the 28px row scale had **only an icon form**: `icon28` became usable while the text button right next to it still had to stay a bare `<button>`. `xs` is 4px shorter, which is plainly visible in a row holding just two controls, and `sm` makes the whole row 4px taller. This is the same symptom #222 described, replayed in the other direction.

  The name is a **bare number**, on the same contract as `icon24` / `icon28`: the t-shirt names between `xs` (24) and `sm` (32) were already taken by `iconXs` (20px), the icon sizes in this slot already spell out the edge length, and since the text sizes carry no `icon` prefix, the symmetric name is the length itself. Inventing `xsPlus` or `smMinus` only digs the hole deeper.

  Each of the three numbers has a rationale rather than being the midpoint between `xs` and `sm`: the height `h-7` aligns with the same objects as `icon28` (`Chip`'s `md`, `Sidebar`'s `sm` menu item); the font size follows `xs` (12px) rather than the same-height `Chip` / `Sidebar` -- one is a pill token, the other a full-width navigation row, neither is a button in a dense toolbar, and the dense-end font band was already recorded in the `xs` notes as 10 to 12px, so 14px would force this batch of call sites to add `text-xs`, which is exactly the "override to undo what the component just added" pattern; the 10px padding and 6px gap interpolate by height between the two steps (24/28/32 maps to 8/10/12 and 4/6/8). The radius is **not** overridden and keeps `--radius`: a 10px radius on a 28px box is 0.36, in the same group as `iconSm` (32px) at 0.31, so it does not read as a pill -- which means `size="28"` and `size="icon28"` line up in both height and radius. It is the only matched pair at the dense end.

  **`variant` / `tone` on `RippleButton` (#233).** Previously only `size`, `rippleColor` and `duration` were exposed and the background was pinned to solid brand, so a button that wants ripple feedback but looks outlined, ghosted or dangerous could not be expressed at all -- all 12 consumer call sites inject an entire `buttonVariants()` from outside, which is why that dependency could never be deleted. The `EFFECT_BUTTON_BASE_CLASS` argument that effect components draw their own background and therefore cannot take `bg-primary` does not apply here: it does not draw a background, the ripple is an overlay.

  The value sets are `Button`'s, each minus one slot: `variant` has no `link` (a ripple needs a box, and `link` removes the height and horizontal padding, so the ripple over `h-auto px-0` text either clips to a sliver or smears across the words), and `tone` has no `current` (the default ripple color is derived from the tone, and `current` means exactly "set no color, inherit from the container", from which nothing can be derived -- pass `rippleColor="currentColor"` explicitly if you truly want to follow the container).

  Colors live in **their own table rather than calling `buttonVariants`**, dropping two columns: shadows, which none of the four effect components have, and color hover, which conflicts with this component's base -- `EFFECT_BUTTON_BASE_CLASS` deliberately omits `transition-colors` (effect components animate a background, not a color), so a `hover:bg-*` would be an abrupt jump with no transition. Interaction feedback here is already the ripple plus the press displacement, which is the whole point of the component; use `Button` for secondary actions that need a hover response. Outside those two columns every cell matches the same-named `Button` step exactly, so `solid` x `brand` produces literally the class string 0.39.0 hard-coded.

  `rippleColor` remains an override, and its default is now derived per step: solid steps take the tone's **foreground** color (a light ripple on a dark surface), while outline, ghost and soft steps take the tone's **own** color -- doing it the other way round on a light surface yields a nearly invisible white ring. The default step still derives `var(--color-primary-foreground)`.

- b00e58d: Three consumer-reported `Upload` gaps: native form submission (#234), a retry entry on failed rows (#242), and dropzone sizes (#243). All three render exactly as the previous version when the new props are omitted.

  **Native `<form>` plus `FormData` (#234).** `Upload` used to hand files to JavaScript only: the inner `<input type="file">` had no `name`, was hidden behind `aria-hidden` and `tabIndex={-1}`, and `onChange` cleared `value` **unconditionally**. Together those three make the native form path impossible -- an input without a `name` never appears in `FormData` entries and `required` is never enforced by the browser, and neither of those raises an error, they just silently do not happen. The consumer's reading is that all five upload dialogs are stuck on this, which is why they keep a `file-upload.tsx` of their own that renders a real input: migrating was never "swap a component", it was rewriting five forms into state plus hand-assembled FormData while losing native `required`.

  `name`, `required`, `inputRef` and `resetInputAfterSelect` now complete that path together. **`name` is the switch**, and supplying it changes three defaults at once (all of them only when a name is present, so existing call sites are untouched):

  1. `value` is no longer cleared after selection -- clearing it means FormData reads an empty control forever. The cost is that picking the same file twice in a row no longer fires `onSelect`, which is native behavior; `resetInputAfterSelect` decides which side you want, and **you cannot have both** (which is precisely why it is a prop rather than an internal guess).
  2. Dropped files are written back into `input.files` -- native drag and drop does not populate it, and the `DataTransfer` block in the consumer's own component exists to patch exactly this. Files rejected by `accept`, `maxSize` or `limit` are removed from `input.files` at the same time: not removing them means the interface says rejected while the form submits them anyway. The write-back needs the `DataTransfer` constructor and is skipped silently where it does not exist (jsdom), leaving the `onSelect` path unaffected.
  3. At `limit`, the input is **not** disabled along with the trigger -- a disabled control is skipped by `FormData` entirely, so already-selected files would vanish on submit. The trigger side stays blocked and the picker still refuses to open.

  `aria-hidden` is likewise dropped only when `name` is present: with a name it is a real control in the form, submitted and validated by the browser, and hiding it from assistive technology leaves a blocked `required` submission unexplainable. It also receives an accessible name from `label` / `buttonLabel` (falling back to locale when those are not strings). `tabIndex={-1}` stays -- the dropzone is already a tab stop, and a second stop for the same action would be a regression.

  **Retry on failed rows (#242).** `useUpload` has returned `retry` from the beginning, but `upload.tsx` referenced it exactly zero times -- the capability was built and never wired, so a user hitting a network blip could only remove the row and pick the whole file again, and network blips are the most common failure. Failed rows (`status="error"`) now render a retry button on the right, with copy from locale (new `upload.retry`).

  The button **renders only when `onRetry` is supplied**, matching `onRemove`, instead of calling `useUpload.retry` internally: `<Upload>` is pure skin and knows nothing about the transport layer (in controlled usage there is no `useUpload` at all), and whether a given failure deserves a retry entry really is the consumer's call -- for instance it should not appear once a different recovery path has taken over. The wiring is `onRetry={up.retry}`.

  **Dropzone `size` (#243).** There was shape but no size, and the dropzone height was fixed. A large dropzone as a page's main entry point and a small one squeezed between other fields in a dialog are two real requirements in the same application, and migrating meant writing `className="h-44"` at every call site -- the "override to undo what the component just added" pattern the documentation argues against. `size?: "sm" | "md" | "lg"` now follows the same contract as the rest of the library; `md` keeps the previous padding, icon size and font size exactly, and the three button-shape steps match the same-named `<Button>` sizes (`h-8` / `h-10` / `h-12`).

## 0.39.0

### Minor Changes

- 7d9a8cd: `Sidebar` gains two things: a dedicated `--hl-sidebar-surface` variable for its background plus a `variant="inset"` shape (#224), and a width transition that respects `prefers-reduced-motion` (#225, which also exports `usePrefersReducedMotion`).

  **The sidebar surface (#224).** The sidebar hard-coded `bg-surface`. In the consumer's bridge layer (a kaneo sidebar cluster spanning 11 files) `surface` and `bg` are both white in light mode, so **the sidebar, the page background and the content island were all the same color**, separated by nothing but the 1px border the aside carries — whereas a shadcn-lineage application sidebar almost always has one step of contrast there: the navigation plane sits behind, the content sits in front.

  They could not solve it on their side: their migration rules forbid overriding a library component's color through `className` (once you override a color, visual regressions after an upgrade cannot be traced), and editing `--color-surface` in the bridge layer would move Card, Popover, Menu and everything else. That left "break the rule" or "accept the flat look", and neither should be a choice the library forces.

  The aside now reads `var(--hl-sidebar-surface, var(--color-surface))`: **leaving it unset changes nothing**, and switching it takes one variable on `SidebarProvider` — no global token edit, no className override. The copy inside the mobile drawer reads the same variable. `className` still wins over it (tailwind-merge, last one wins) — an escape hatch, not a cage.

  **`variant="inset"` (#224).** The sidebar gets an 8px gutter, the content area becomes a rounded, outlined island, and the shell color shows around it (shadcn's inset shape). Two implementation notes:

  - The island styling lives on `SidebarInset` and reads the **preceding sibling** through `peer-data-[variant=inset]/sidebar:*` rather than putting `variant` into context — the shape is a property of `<Sidebar>`, and lifting it to the provider would mean writing it twice and keeping the two in sync. The shell color is selected with `:has()` for the same reason.
  - With `collapsible="offcanvas"` that 8px gutter **must** collapse to zero: the aside's width is `0px`, and under border-box the padding still occupies space, so keeping it would leave a 16px strip of sidebar that never closes. That is also exactly why the consumer could not add this step with `className="p-2"` themselves.

  **Reduced motion (#225).** Opening and closing the sidebar is a page-level container transform, the very category that `prefers-reduced-motion: reduce` exists to switch off (people sensitive to vestibular triggers react most strongly to large-area movement). The width transition lives in an **inline style**, which outranks every ordinary CSS rule, so the only way for a consumer to disable it was `!important` plus a selector guessing the library's internal DOM (`wrapper > aside`): silently broken the moment that structure changes, and what breaks is an accessibility preference with no error to show for it. The component now responds itself, and under reduce it **omits the transition entirely** (rather than leaving a `0s` one). The width still changes — what is switched off is the motion, not the feature.

  This also answers the question the report raised, whether reduced motion is the library's responsibility or the consumer's: **the library's**. Components across the library already respond to that media query in 300+ places; the sidebar was the hole. The policy now lives on the motion page of the docs site and in `sidebar.md`, alongside the newly exported `usePrefersReducedMotion()`: consumers should not be writing `!important` or guessing at internal DOM to disable an animation, and any component that still moves under reduce is a bug worth filing. The hook itself is for **hand-rolled motion** (canvas, rAF, your own inline transitions): dependency-free, built on `useSyncExternalStore`, `false` during SSR and first paint, corrected right after hydration.

## 0.38.0

### Minor Changes

- c7aa13f: `Button` closes two gaps at the dense end: `outline` now accepts the `muted` emphasis step (#221), and two icon sizes are added, `icon24` and `icon28` (#222).

  Both come from the same consumer (gyj-workflow) — the bare `<button>` elements that were left behind after migrating everything #211 and #204 could take.

  **The muted step on `outline` (#221).** The 0.35.0 notes said "a muted step for `outline` makes structural sense, but nothing needs it yet; add it when someone asks". Someone asked. After migrating `ghost` and `link`, three call sites remained in the shape "keep the border, drop the text one step": a full-width "Abort" at the bottom of a running-job card (the border is the only thing marking it as clickable, yet it matters less than the card's main content), plus the inactive half of a two-state filter trigger and the clear button next to it. They are not `ghost` (they have a border) and not a plain `outline` either (their resting text should be the secondary gray, not body black). Under the old rules `muted` added no class there and earned a development warning that pointed at `ghost muted` — which drops the border along with the color.

  The implementation mirrors the `ghost` rule word for word and only lowers the text: `bg-surface`, `border-hairline` and `hover:bg-surface-hover` all stay, as does the semantic border of a non-neutral `tone` (`border-danger` and friends); the text rests at `text-muted-foreground` and returns to the tone's own color on hover. `solid` and `soft` remain no-ops with a warning — their background and foreground are a pair, and lowering only the foreground produces combinations that fail contrast.

  **`icon24` and `icon28` (#222).** The icon sizes were 20 / 32 / 40 / 48 while the text sizes are 24 / 32 / 40 / 48: `sm`, `md` and `lg` line up one to one, and only the densest step does not — `xs` is 24px, and the nearest icon size, `iconXs`, is 20px. So an icon button on a dense row that was not exactly 20 or 32 had to fall back to a bare `<button>` with a hand-written `size-6` / `size-7`, or write `className="size-7"` on `<Button size="iconSm">` to undo the `size-8` it had just added — and the docs explicitly argue against that second kind of override.

  Neither size is an arbitrary number; each lines up with something already in the library (the same test #204 used when it set `xs` to 24px: "the same height as `Tag` md"). 24px matches `Button`'s `xs` text size, `Tag` `md` and `Chip` `sm`; 28px matches `Chip` `md` and `Sidebar` menu items at `sm`.

  `iconXs` stays at 20px, not one pixel more: it serves icon-only micro actions inside a table row (tree expanders, drag handles), and raising it to 24px would grow the rows of a `density="compact"` table, which is the entire reason it exists (#146). Three sizes now coexist, one per density.

  The names are numbers rather than t-shirt sizes because the t-shirt names between `xs` and `sm` were taken long ago by `iconXs` (20px), and that size cannot change its side length (doing so would silently flatten every expander that relies on it). Rather than inventing `icon2xs` and digging the hole deeper, the side length is written out — these two sizes exist precisely to pin one pixel scale.

  The radius follows the side length, judged by whether a 10px `--radius` reads as a disc (the closer radius/side gets to 0.5, the rounder it looks): on 24px that ratio is 0.42, so `icon24` drops to 4px alongside `xs` and `iconXs`; on 28px it is 0.36, close to `iconSm`'s 0.31, so `icon28` keeps `--radius` — and `Sidebar`'s own 28px menu items use `rounded-[var(--radius)]` too.

  Both are pure additions: an `outline` without `muted`, and the four existing icon sizes, render byte for byte as before.

- c7aa13f: `register().value` from `useForm` no longer folds `null` into an empty string, `Input` and `Textarea` absorb `null` as an empty string, and `NumberField` treats out-of-signature values as empty (#220).

  The report initially blamed `NumberField` (a controlled `value={null}` rendering as `0`). Probes written against two Base UI versions failed to reproduce it — `value={null}`, `5 → null`, adding `min`/`max`, and `defaultValue={null}` all produced an empty string. After the reporter isolated the variables, the root cause surfaced one layer **up**:

  ```
  form.values.viaForm:      null   (object)
  register().value:         ""     (string)   <- here
  value handed to NumberField: ""
  ```

  `register()` read `values[name] ?? ""`. Within a single render `form.values[name]` was `null` while the binding reported `""` — two answers to the same question; and patching it downstream with `?? null` does not help (`??` only fires on `null` and `undefined`, an empty string sails right through), so the control received an out-of-signature `""` and rendered it as `0`.

  **Why this is a real defect rather than a usage mistake**: driving a controlled control from the binding is the documented pattern, and `null` is the **business value** "explicitly cleared / left blank" — a step the user picked, just like `0` or `""`, not the absence of a value. Three-state fields (`null` inherits, `0` is an explicit zero, a positive integer overrides) necessarily lose the `null` step along this path, and `null` and `0` are opposite business conclusions. It is not limited to number inputs either: any field that wants to distinguish "not filled in" from "filled in as empty" hits the same wall.

  Three changes, each guarding a different stretch:

  - **`useForm` (the root cause)**: `value` mirrors `form.values[name]` as-is; only `undefined` still folds to `""`, because that means "this field has no initial value", and handing `undefined` to a controlled control makes React treat it as uncontrolled, so the first keystroke triggers the "uncontrolled to controlled" warning. `null` passes through.
  - **`Input` / `Textarea`**: the `value` type widens to accept `null` and folds it to an empty string at render time. A native `<input value={null}>` is treated as uncontrolled by React with a warning, and the documented binding pattern (`value={f.value as string}`) hands the binding straight to these two components, so they take care of it. Only `null` is mapped; `undefined` still means uncontrolled.
  - **`NumberField` (the secondary cause)**: a `value` that is neither a `number` nor `null` is treated as empty, with one development `warnOnce` naming the source. The path is unreachable once the root cause is fixed, but controlled values often arrive through type-erased routes (`register().value` is `unknown`, an API payload is `any`), and landing on `0` is the worst outcome for a three-state field — `0` and "left blank" look identical on screen. `undefined` is excluded (that means uncontrolled).

  **Upgrade note**: if your code relied on the binding turning `null` into `""` (for example by spreading `register().value` onto a **native** `<input>`), you will now receive `null` and see React's "value prop should not be null" warning — write `value={v ?? ""}` yourself, or switch to hulian's `Input` / `Textarea`, which already absorb it. `LoginForm`, the only place inside the library that calls `register()`, starts both of its fields as strings and is unaffected.

### Patch Changes

- c7aa13f: `ImageViewer` wheel zoom fixes three things: compounding offsets under StrictMode, wheel events escaping through the overlay's top bar and thumbnail strip (a pinch zoomed the host page), and the listener never being attached at all when the component mounts already open (#223).

  **1. The offset was computed twice (correctness).** The old implementation dispatched `setOffset` from inside the `setScale` updater, and that inner update depended on the previous value. React requires updaters to be pure, and StrictMode's development check finds impurity precisely by **calling the updater twice** — so the second pass multiplied by `ratio` again on top of the first pass's result: the offset does not double, it **compounds**, and three or four notches send the image outside the viewport, leaving no option but to close and reopen. The consumer measured `translate(-40px, -20px)` as the expected result of a single notch and `translate(-96px, -47.5px)` as the actual one. Production builds do not double-invoke, so it never showed up live — but that is luck, not correctness.

  The fix merges scale and offset into **one state** (they always change together: zooming around an anchor necessarily moves the offset) and computes both in a single pure updater, which is idempotent under double invocation. The nested `setOffset` calls in `zoomBy`, double-click and drag-to-pan are gone as well.

  **2. Nothing handled wheel events over the top bar or the thumbnail strip.** The listener sat on the middle stage only, while the overlay is a `flex-col`: the top bar (about 60px) and, with multiple images, the thumbnail strip both live outside the stage. A trackpad pinch (`ctrlKey` + wheel) over either was not `preventDefault`ed, so the browser applied its native behaviour and zoomed **the entire host page** — sidebar, tables and header scaling and shifting along. What the user sees is "even the parts that are not the image got blown up", which reads like the component applied its transform to the wrong element. This one affected development and production alike.

  The listener now sits on the whole overlay (`fixed inset-0` plus `aria-modal`; the page behind it is already locked by `body.overflow=hidden`). **The one exception is the thumbnail strip**: it is `overflow-x-auto` and needs to scroll horizontally, so a plain wheel passes through there and only the pinch is caught — an undiscriminating `preventDefault` across the overlay would eat its scrolling, which is fixing one bug by creating another. When the pointer is outside the stage the zoom anchor falls back to the stage center: using a point outside the stage as the fixed point flings the image straight out of view.

  **3. The listener was never attached when the component mounted already open (found while writing the tests).** Both the wheel effect and the focus effect depended on `[open]` alone, yet on the first frame `mounted` is `false`, the component returns `null` and both refs are still `null`, so the effects ran exactly once with nothing to attach to; the re-render caused by `mounted` flipping to true does not re-run them. As a result `{show && <ImageViewer open … />}` silently lost both wheel zoom and "move focus into the overlay" — it only worked when the component was mounted first and `open` flipped from `false` to `true` afterwards, which is why nobody noticed. Both effects now depend on `mounted` as well.

## 0.37.0

### Minor Changes

- Five Button changes: `type="button"` by default, a converged `buttonVariants` output, `tone="current"`, `shrink-0` on the base, and a development warning for `tone="brand"` on ghost (#215 #216 #217 #218 #219) <!-- parity-id: button-gaps-and-defaults -->

  A batch a consumer measured and reported item by item while migrating for #211, all of it re-checked against the 0.36.0 source.

  **1. The default `type` changes from the native `submit` to `button` (#219) - the only item with a behavior change.**

  `Form` / `FormDialog` render a real `<form>`, so any **helper** button inside one ("View template config", "Set as cover", "+ Add item") ran the entire submit chain when clicked: validate, `onFinish`, request sent, drawer closed. It failed very quietly - nothing thrown, nothing logged, type checking and the build all green - and the only symptom was "I clicked a view button, why did the drawer close?", by which point the data had already been written back. The consumer measured one form with 33 buttons where 7 were submit buttons, every one of them from consumer code.

  The library's own tests could not catch this: HulianUI's internal components (`SelectTrigger`, the clear button, the 17 `RichTextEditor` toolbar buttons) all write `type="button"` already, so only a `<Button>` written by a consumer was affected.

  shadcn/ui, Ant Design, and MUI all flatten this HTML legacy at the same layer, for the same reason: buttons appear inside forms all the time, and most of them are not submit buttons. **Upgrade note**: anywhere relying on "no type means submit" needs `type="submit"` added. Every submit button in the library (`ProForm` / `LoginForm` / `FormDialog` / `SearchForm`) already wrote it, so there is no impact inside the library. Nothing is injected when rendering as an `<a>` through `render` (`type` belongs to buttons).

  **2. `buttonVariants()` now runs its output through tailwind-merge (#217).**

  `cva` only concatenates strings and never resolves conflicts, so the returned class string carried several rules for the same CSS property (base `text-foreground` next to compound `text-danger`). `<Button>` has always had `cn()` inside, but `buttonVariants` as a public export did not - and the documented path "take the className when you want the button look without `<button>` semantics" is exactly that export. With both rules in the DOM, the winner is decided by **stylesheet order** rather than by cva order: the consumer measured 6 of 16 common combinations rendering the wrong color, three of them danger buttons losing their red (`ghost` / `outline` / `link` + `danger`), where a user cannot tell the action is destructive. The `link` + `muted` step added in 0.35.0 was on that list from day one - #211 was verified through `<Button>`, which goes through `cn()`, so it never surfaced.

  It is idempotent for the `<Button>` path (running twMerge twice gives the same result) and needs no consumer changes. A new test pins "at most one `text-*` in the output of any `variant × tone × muted` combination".

  The library already knew about this and had treated it as a quirk for tests to work around: `button.test.tsx` carried the line "reading `buttonVariants()` directly gives a false red".

  **3. New `tone="current"`: set no color, inherit from the container (#215).**

  Icon buttons inside a colored card or row should take the color of that container, yet `ghost` and `outline` both hard-code `text-foreground` at rest. All five semantic steps hand out an **absolute** color and cannot carry inheritance; `muted` is equally absolute and points the other way. The consumer measured 122 rendered instances that went from the card color to body black after migrating, with the only workaround being `className="text-inherit"` written out 122 times. The word follows the `tone="current"` that `Spinner` already has, so no new concept is introduced.

  Effective on `ghost` and `outline` only; elsewhere it is named in development (same as `muted`). **On `soft` the default palette has to be restored explicitly**: the colors of `soft` live entirely in `compoundVariants` and its base is an empty string, so without that entry `current` would not be "no-op" but "loses its fill", rendering a soft button with a transparent background - worse than doing nothing.

  **4. `shrink-0` added to the base (#216).**

  As a flex child a button has `flex-shrink: 1` by default and gets squeezed **below its declared size** in a crowded row (the consumer measured 24px rendering at 18.2px). `whitespace-nowrap` only keeps the text on one line and does not keep the box from shrinking; together they make the content overflow the button's visible bounds. Purely defensive, it changes no existing rendered size and does not conflict with `block` (`w-full`) - "fill the row but do not get squeezed" is exactly what is wanted. Effect buttons (`ShimmerButton` and friends) share this base and benefit too.

  **5. Writing `tone="brand"` explicitly on `ghost` is now named in development (#218) - the compoundVariants entry the issue suggested was not added.**

  `ghost` + `brand` renders identically to omitting the tone, so whoever writes `tone="brand"` gets the neutral color. But adding a `{ variant: "ghost", tone: "brand" }` entry is a **dead end**: the default value of `tone` is brand, and cva sees the value after defaults are applied, so it cannot tell "written explicitly" from "not written". Adding a resting color would repaint all 207 default `ghost` call sites in this repository with the brand color; adding a `hover` would swap the hover of `ghost muted` from body black to the brand color - and that is the shape #211 adopted from 18 hand-written consumer call sites (making the change turned the test pinning it red on the spot).

  Telling the two apart is only possible in the component layer: `tone` is `undefined` in props when not passed, and equals `"brand"` only when written explicitly. Hence a development warning that points at `variant="link"` (brand by default). None of the 207 call sites without a `tone` will ever see it. The criterion is the one #211 set itself: a prop that silently does nothing is harder to track down than an error.

### Patch Changes

- `NumberField` widens `defaultValue` to `number | null`, and both directions of "null means empty" are now documented and tested (#220) <!-- parity-id: number-field-default-value-null -->

  **The reported symptom (a controlled `value={null}` rendering as `0`) did not reproduce.** A probe was run against both `@base-ui/react` 1.6.0 and 1.7.0: with `value={null}`, with `5 → null`, and with `min={0}` (the issue suspected min clamping), the input was an empty string every time, and `onValueChange` was never fired with `0`. `number-field.tsx` has not changed by a single character since 0.33.1, so the consumer's version behaves the same as the one measured. The issue asks for a complete reproduction and the `@base-ui/react` version.

  Following that thread did turn up a gap that **is** real: `value?: number | null` but `defaultValue?: number`. Starting out empty was always supported underneath and only the type sealed it off, so a tri-state field (`null` / `0` / a positive number) such as "leave empty to inherit the default" could not express `null` in uncontrolled form, while the controlled form allowed it. The two sides should have matched all along.

  Normalization uses `?? undefined` rather than `|| undefined`: `defaultValue={0}` has to keep its `0`. "Explicitly zero" and "empty, inherit the default" are opposite business conclusions, and collapsing them into one ruins the field - which is precisely the case #220 was worried about.

  The documentation previously promised only the callback direction ("clearing emits `null`"); the render direction is now stated as well, with four tests pinning it: controlled `null`, switching from a number to `null`, `min={0}` not clamping, and uncontrolled `defaultValue={null}`.

## 0.36.0

### Minor Changes

- Adds `FilterChip` / `FilterChipGroup`: a pill that echoes an applied filter condition (#214) <!-- parity-id: filter-chip-applied-filters -->

  **Why**: the library covered the **input** side of filtering (`SearchForm` collects parameters and calls `onSearch`, usually sitting in the query area of `ProTable`) but not the **echo** side. Nobody owned the row that answers "which conditions are in effect right now, and how do I drop one of them", so an admin list page ran out of parts halfway through. A consumer (the kaneo board toolbar) hand-rolled a four-segment `div` for it and pasted the markup verbatim into the issue.

  **Why not extend Chip**: `Chip` is a **single-segment** token - pill radius, one `children`, a prefix and suffix, and `onClose`. Its meaning is "one removable label entity". A filter condition is **structured**: subject, operator, and value are three independent segments with their own weight and color step, dividers between them, and the whole run can be clicked to reopen the filter menu. Folding that into `Chip` would mean adding `subject` / `operator` / divider / per-segment styling - a whole set of fields orthogonal to its current props - and `Chip` has 190 call sites in this repository, which is the blast radius of any change to its default look. Squeezing it in as `startContent="Status" children="is any of - 2 selected"` instead loses the columns and degrades visually into one long sentence. `Tag` is lighter still (it has no close button at all) and cannot carry it either. Hence a new component; `Chip` and `Tag` are untouched.

  **Three design judgments**:

  - `operator` is optional. Many conditions carry only a subject and a value ("Owner: Zhang San"); leaving it out drops a column instead of keeping an empty one. Both directions - two segments with one divider, three with two - are pinned by tests.
  - **Clicking the X does not fire `onClick`, by structure rather than by `stopPropagation`.** The remove button is a **sibling** of the body button, not a descendant, so the body is not on the bubble path at all and consumers never have to remember `stopPropagation`. It also avoids nesting a `button` inside a `button` - the very trap the issue worried about, now absorbed by the library.
  - `value` takes a `ReactNode`, not a `string`. In real echo rows the value is "a few overlapping avatars or status icons plus the words 2 selected"; taking a string would push consumers straight back to hand-rolling.

  **locale**: adds the `filterChip` entries (the remove button's accessible name carries the subject - "Remove filter: Status" - plus a subject-less fallback, "Clear all", and the group name "Applied filters"). The field is **optional**: an older custom locale without it keeps the built-in Chinese defaults, and a test covers that. Carrying the subject is mandatory - five pills in one row all named "Remove" are five identically named buttons to a screen reader.

  **Not done**:

  - No `tone` / `variant`. A filter condition is a resting-state control (like a search box or a select trigger), not a status marker; wanting to color it by mood means what you actually want to express is status, and that is `Tag`.
  - `FilterChipGroup` does not push `size` down. It only handles wrapping layout, the trailing clear-all button, and the `role="group"` name. Implicit style inheritance is not worth it - a container that carries a context for the sake of one field costs more to understand than it gives.
  - The body exposes no `render`-style element escape hatch. To use it as a `Menu` trigger, compose it on the outside; this change lands only the `onClick` semantics the issue asked for and does not front-run an abstraction nobody has pinned down.
  - No built-in truncation for long values. The strategy (clip the head, clip the tail, add a tooltip) is business-specific and belongs to the consumer's own `value` node.

- Menu gains cascading submenus: adds `MenuSub` / `MenuSubTrigger` / `MenuSubContent` (#212) <!-- parity-id: menu-cascading-submenu -->

  **Why**: `ContextMenu` has had the three Sub parts all along and `Menu` did not, so "the right-click menu can open a second level, the click-to-open dropdown cannot". Both sit on the same Base UI primitives (measured: `SubmenuRoot` and `SubmenuTrigger` are both present on the `Menu` part of `@base-ui/react@1.6.0`), which makes this an omission rather than a design decision. The shape it blocked is a common one: a "Filter" button opens a list of dimensions, and each dimension keeps its options in a second panel. With dozens of options in total, flattening them into one level is unusable.

  **Why not leave it to consumers**: assembling this outside the library from Base UI primitives plus the publicly exported `menuItemVariants` does work, but the chevron, the right-side placement, and keeping the parent item highlighted while open (once the pointer moves into the sub panel the parent is no longer hovered, and without this the open level loses its background) are three things each consumer has to remember separately. The chevron is the only visual cue that an item has a next level, and `aria-haspopup` / `aria-expanded` are its only cue to a screen reader - leaving those to be remembered per consumer outsources a silent accessibility defect.

  **Done along the way**: the panel skin of `MenuContent` is now a shared constant inside the file, reused by the sub panel. The root cause of #212 was one shape maintained separately in two places until they drifted, so copying the literal a third time for the sub panel would move the same trap into `menu.tsx`. Extracting the constant is pure refactoring: a new test pins the exact class string `MenuContent` renders, so what existing consumers get does not change. For the same reason `ContextMenuSubTriggerProps` / `ContextMenuSubContentProps` become aliases of the identically named types on the Menu side (matching what the checkbox and radio parts in that file already do), so the two can only change together.

  **Not done**:

  - `MenuSubTrigger` has no `closeOnClick`. Its click means "open the next level", not "run an action", and closing the whole menu would be a bug. This is a deliberate difference from `MenuItemProps`, not a missed copy.
  - `MenuSubContent` does not expose `side` / `align` / `sideOffset`. Placement is part of what defines this shape (open to the right of the parent item, top edges aligned), and Base UI flips it automatically when it would overflow. Wanting a different placement means what you want is not a submenu but a second `Menu`.
  - No existing `Menu` export changed its behavior, signature, or rendered output.

- `RichTextEditor` wires image upload into paste and drop, and keeps `data:` / `blob:` / `file:` out of the body content (#213). <!-- parity-id: rte-paste-drop-image-upload -->

  The component already had the full upload capability (`<input type="file" accept="image/*">` plus `onUploadImage`), but it was **wired only to the toolbar button**: taking a screenshot and pressing `Cmd+V`, or dragging an image from Finder into the editor, previously did nothing at all - even when the consumer had already passed `onUploadImage`. Those two are exactly the paths people actually use; deliberately reaching for the toolbar button is the rarer one.

  All three entry points now go through the same `onUploadImage`:

  | Entry point | With `onUploadImage` | Without |
  | --- | --- | --- |
  | Toolbar button | File picker, upload, insert | Falls back to "enter a URL" (unchanged) |
  | Pasting a screenshot | Upload, insert | Ignored, with a development warning |
  | Dropping an image file | Upload, insert at the drop point | Ignored, with a development warning |
  | Pasting Word or web content (inline base64) | Each image is re-hosted into a URL, then the run is inserted | base64 is discarded, with a development warning |

  **That last row is the first of two bugs.** The documentation stated flatly that images are **never inlined as base64** - precisely so one body of content cannot balloon by several MB and blow out a database column - yet the paste path did not hold up: the sanitizer's URL blocking was a **blocklist** (`javascript` / `vbscript` / `data:text/html`), `data:image/*` was not on it, and pasting from Word or Excel wrote the base64 straight into the column. Exactly the scenario that promise was meant to prevent.

  The Word path and "paste a screenshot" are **two different paths**: content copied from Word carries its images inlined into the HTML as base64, with no matching file entry on the clipboard, so `DataTransfer.files` comes up empty. The only route is to pull the `data:` payloads out of `text/html`, `fetch` them back into a `File`, and re-host them (that step is purely local and never leaves the machine). The component therefore handles the two sources separately.

  **The second bug: `blob:` and `file:` were also left as-is.** A blob URL is valid only for the lifetime of the current page and `file:` only on that one machine, so storing either into a database gives you a broken image the next time it opens - and the column size looks perfectly normal, which makes it harder to track down than base64.

  The fix turns URL blocking from a blocklist into a **protocol allowlist** (`http` / `https` / `mailto` / `tel`, plus relative, protocol-relative, and anchor URLs), matching the other three tables in this module (tags, attributes, CSS properties). A blocklist cannot hold back whatever protocol appears tomorrow. Control characters and whitespace are stripped before the protocol is judged, because a browser strips them when it parses a URL anyway - `java\nscript:` and `javascript:` are the same thing to it, and not stripping would leave a bypass open (covered by a test).

  A rejected `<a href>` loses only the attribute and keeps its text (the link is gone, the words remain, as before); a rejected `<img src>` has the whole element removed - an `<img>` with no src is an empty shell that would leave an invisible hole in the content.

  A few trade-offs:

  - **With no `onUploadImage`, pasting an image file returns `false` rather than swallowing the event.** The clipboard may also carry `text/html` (copying an image from a web page, for instance), so letting the HTML path continue at least lets remote images through. All three "not passed" cases emit one `warnOnce` during development, so consumers do not discover this in production.
  - **When an upload throws, that image is not inserted and the component shows no UI.** The message belongs to the consumer - only it knows what to say (quota full? unsupported format? retry?). When several images go up at once, one failure does not interrupt the rest.
  - **A drop inserts at the drop point rather than at the previous caret**, because that is what dropping means: put it where I am pointing.
  - **When `toolbar` leaves out the `image` entry, paste and drop are not hijacked.** The image node is not in the schema then and the `setImage` command does not exist at all, so not blocking first would mean "the file uploaded but the image cannot be inserted" - burning a write against the consumer's object storage with no feedback to the user, which is worse than doing nothing.
  - Handlers in `editorProps` are captured when `useEditor` initializes and their closures do not follow prop updates, so `onUploadImage` and the paste pipeline both hold the latest value through a ref. Otherwise a consumer that swaps its upload implementation would find paste still calling the old one.

  **Not done**: attachment (non-image file) support. That is a new capability rather than a bug in this change, and its shape needs to be settled separately (noted as item 4 on #213).

  Testing note: jsdom has no layout, so ProseMirror's `posAtCoords` cannot resolve a position and returns early, never reaching `handleDrop`. The drop test has to stub `caretRangeFromPoint` and `elementFromPoint` first, or it measures jsdom rather than the component.

## 0.35.0

### Minor Changes

- `Button` gains a `muted` emphasis step: on `ghost` and `link` the resting color drops one level to the secondary gray and returns to the tone's own color on hover (#211). <!-- parity-id: button-muted-emphasis -->

  ```tsx
  <Button variant="ghost" size="xs" muted>Show log</Button>
  <Button variant="link" muted>Clear</Button>
  <Button variant="link" tone="danger" muted>Delete</Button>   {/* gray at rest, red on hover */}
  ```

  The weakest color `ghost` and `link` could previously reach was body black (`tone="neutral"` included), yet the resting color of most **secondary** text links and icon buttons in everyday UI is precisely the secondary gray. A consumer was left with 18 places that had to stay bare `<button>` elements hand-writing `text-muted-foreground hover:text-foreground` - and eighteen hand-written copies inevitably drift.

  **The issue's preferred fix - redefining `neutral` on `ghost` / `link` to rest muted - was not adopted; the measured blast radius is larger than estimated.** This repository alone has 207 `variant="ghost"` call sites (plus 20 `link`), only 48 of which are icon sizes; the rest are **normal-emphasis** actions in table rows and toolbars ("View", "Reload", "Run"). Redefining would weaken all of them, and they would then need the reverse patch, `className="text-foreground"` - the escape hatch moves to the other side rather than disappearing. Hence an **opt-in boolean prop**: a `ghost` without `muted` is still body black and existing call sites do not move by a pixel (pinned by a test).

  **It was also not made a sixth `tone`.** `tone` is the semantic-color SSOT shared by 29 components, while muted is an **emphasis level**, not a hue. Folding it in would force `solid`, `soft`, and `outline` to answer "what is a muted fill or tint?" - and a `bg-muted` fill simply reads as disabled. This is the same reasoning that makes `solid` with `tone="neutral"` an inverted fill rather than a gray one. The issue's judgment on this point was right and was followed.

  The rule in one line: **the resting color drops to `--color-muted-foreground` and returns to the tone's own color on hover** (`ghost` also gains its tinted background). So `tone="danger" muted` is the "gray at rest, red on hover" delete link rather than a discarded semantic color - a common shape in dense admin rows. The emitted class strings for all nine `variant × tone × muted` combinations are pinned by tests, including the tailwind-merge override order (the resting color must be replaced, never left alongside its successor).

  **Only effective on `ghost` and `link`**: on `solid`, `soft`, or `outline` it adds no class at all and logs one `warnOnce` in development - a prop that silently does nothing is harder to track down than an error.

  Not done: a muted step for `outline` (border kept, text stepped down) is structurally coherent but has no reported need; it can follow when someone asks.

## 0.34.0

### Minor Changes

- `RichTextEditor` gains a `backgroundColor` toolbar entry (a text-highlight swatch picker), and the swatch pickers no longer write `var(--color-foreground)` into the body text (follow-up to #210). <!-- parity-id: rich-text-background-color-toolbar -->

  0.33.1 only stopped legacy highlights from being **lost on load**; operators still could not apply a new highlight inside the editor. This entry adds that, and deliberately **does not introduce `Highlight`**: that extension renders a `<mark>`, which would grow two different tags inside one field - legacy content as `<span style>`, newly applied highlights as `<mark>` - leaving the consumer's front end (`v-html`, a mini-program `rich-text`) to handle both. The button drives the same `BackgroundColor` mark the legacy content uses, so the output shape is identical (a test asserts zero `<mark>` elements).

  **⚠️ One behavior change, contradicting what 0.33.1 documented.** The new entry is part of `DEFAULT_TOOLBAR` (right after `color`), so **with the default toolbar a legacy `background-color` is now kept**, whereas 0.33.1 said "the highlight is still dropped while off". This is not a regression but the rule falling into place: a highlight's survival now follows the same rule as `color` and `fontSize` - **decided by `toolbar`, not by `legacyHtml`**:

  | | Highlight |
  |---|---|
  | Default toolbar | Kept |
  | `toolbar` without `backgroundColor` | Lost |
  | Trimmed, but `legacyHtml` on | Kept (the compatibility tier ignores toolbar trimming) |

  Pass an explicit `toolbar` array to leave the button out, exactly as with any other entry. The "open, edit nothing, read it back" table in the docs has been updated to the new contract.

  **A related defect fixed along the way: neither swatch picker offers a `var(--…)` color any more.** The first swatch of the text-color picker used to be `var(--color-foreground)`, and clicking it wrote `color: var(--color-foreground)` **into the body text** (measured: feed HTML containing a `var()` through the editor and it comes back out verbatim). That body text is stored in the consumer's database and rendered **somewhere else**, where the library CSS variables do not exist - the declaration resolves to nothing there and silently falls back to the inherited color, which means an editor-only style was written into permanent content. What "default color" actually means is **not writing the declaration at all**, so it now runs `unsetColor()`; "No highlight" likewise runs `unsetBackgroundColor()`. Both pickers have tests asserting no swatch contains `var(--`.

  Impact on existing consumers: clicking "default color" changes from "set the text color to `var(--color-foreground)`" to "clear the text color". The latter is what the button always meant, and the rendered result inside the editor is the same either way (both inherit) - the difference is only that **the stored string no longer carries a dead declaration**.

  Also in this release:

  - New `Highlighter` icon (lucide-react data under ISC, inlined into `_icons` per the existing convention, with its `/* @__PURE__ */` marker).
  - Three locale entries added - `backgroundColor`, `noBackground`, `defaultColor` - in both Chinese and English. All three are **optional fields**: adding a required field to an existing locale group would break compilation for consumers who ship their own custom dictionary.
  - The highlight presets use the saturated tone that actually appears in the legacy content plus two light tints, and like the text colors they carry concrete values rather than `var(--color-*)`.

## 0.33.1

### Patch Changes

- The `legacyHtml.font` tier of `RichTextEditor` now also covers the `background-color` text highlight (#210). <!-- parity-id: legacy-html-background-color -->

  Follow-up to #208. 0.32.0 preserved `color`, `font-family`, `font-size`, `max-width`, and `text-align`, leaving `background-color` at 3 to 0 whether the tier was on or off. Operators use it for the "white text on dark red" marker; it appears far less often than `<font color>` (102 occurrences) but is the same kind of thing - not junk markup, and losing it is a silent content change.

  **The issue's assumption that `background-color` "belongs to `@tiptap/extension-highlight`" does not hold**: `@tiptap/extension-text-style` exports `BackgroundColor` itself (since 3.x - the export surface of 3.30.0 is `BackgroundColor / Color / FontFamily / FontSize / LineHeight / TextStyle / TextStyleKit`). This therefore adds no new dependency.

  Direction 1 from the issue (fold it into the `font` tier) was taken over direction 2 (add a `highlight` toolbar entry), for two reasons:

  - **`Highlight` renders a `<mark>`**, which would replace the legacy `<span style="background-color">` with a different tag. The shape a consumer stores back into the database would change - trading one silent content change for another, which is not a fix.
  - In legacy content `color` and `background-color` are written on the same `style` to begin with (`<span style="color:#fff;background-color:rgb(194,79,74)">`), so keeping one and dropping the other is impossible to explain. It does not get a tier of its own.

  Behavior follows the existing contract: **off by default**, with the highlight still dropped while off (pinned by a test of its own, so this change cannot drift the default); kept while on, and the output stays a `<span style>` with no `<mark>` anywhere (also tested). The paste sanitizer needed no change - `background-color` was already on the inline-style allowlist, and the loss happened purely at the schema layer.

  **Not done**: no `highlight` toolbar button. The side benefit direction 2 mentions - letting operators keep applying the highlight inside the editor - is a new capability rather than the defect reported here (silent loss). File it separately if wanted.

## 0.33.0

### Minor Changes

- The `@base-ui/react` peer floor moves from `>=1.0.0` to `>=1.6.0`, `tailwindcss` moves from `>=4` to `>=4.1`, and peer floors gain a static gate (#209). <!-- parity-id: peer-floor-drift -->

  **The same class of failure as #207, in the opposite direction.** That one had us declaring a range while the dependency pinned exact values; this one has us declaring a peer floor **below the version we actually develop against**: `@base-ui/react` said `>=1.0.0` while the devDependency was `^1.6.0` - nearly every component in the library is built directly on Base UI, and 1.6.x is the only line we build and test against. A consumer locked at 1.4.1 installs cleanly, sees no warning, and has a green CI, yet since 0.30.0 the first SSR paint of `Slider` **intermittently** produces a hydration mismatch: #200 moved the accessible name from Root to Thumb (a fine change in itself), and on 1.4.1 that shifts the server and client `useId` sequences by one, surfacing as a mismatched `id` on the `SliderThumb` root div. The consumer bisected it: 1.4.1 reproduces, 1.7.0 does not. As before, **a fresh resolution never hits this; only a consumer upgrading with an existing lockfile does**.

  **Suggestion 1 from the issue - "a peer floor may never sit below the devDependency floor" - was deliberately not implemented as written, because that rule is too strong.** It turns every routine devDependency bump into a narrowing aimed at consumers, and it punishes wide floors that are genuinely supported: `react` declares `>=18` against a `^19.2.8` devDependency, but the runtime-performance job in CI runs `pnpm scan:ci -- --react 18 --smoke` specifically to exercise the React 18 line. Applying the rule bluntly would use a gate to delete a version line we really do support. More importantly, once wide floors start crying wolf, consumers learn to ignore unmet-peer warnings - which destroys the very mechanism this issue set out to protect.

  The actual defect is not "peer floor below devDependency floor" but **a number nobody ever chose**: `>=1.0.0` was written once and never looked at again while the library walked to 1.6. So the gate asserts that every `(peer, dev)` pair matches the pair recorded in the baseline byte for byte. A change on either side - including a routine devDependency bump - turns it red and forces the question "is this floor still right?" to be answered again. **Had this gate existed, the base-ui case would have failed on the day the devDependency moved to `^1.6.0`**; that shape is frozen in a unit test. Every baseline record carries a mandatory `why`, and an empty one fails: the tooling can only generate the `(peer, dev)` skeleton, the reasoning has to be written by a person - and being unable to write it is precisely the symptom.

  All six existing peers were reviewed against that standard, and the outcome is deliberately not uniform:

  - **`@base-ui/react` to `>=1.6.0`**: track the line we actually develop against. Base UI's 1.x is still moving fast, so a major-granularity floor carries no force here.
  - **`tailwindcss` (ui) to `>=4.1`**: dictated by an upstream feature in use. The `cell` variant of `Textarea` uses `field-sizing-content`, a utility that **only exists from 4.1**, so the old `>=4` was a falsifiable overclaim - on 4.0 the class is simply never generated, it installs cleanly, warns about nothing, and the textarea silently stops growing with its content. Set to 4.1 rather than matching the devDependency at 4.3.3: 4.1 is the lowest version demonstrably required, nothing above it has any known basis, and inflating the floor is how you start crying wolf.
  - **`tailwindcss` (tokens) stays `>=4`**, deliberately different from ui. The tokens CSS only uses `@import`, `@theme`, `@theme inline`, and `@custom-variant`, all present in 4.0; the 4.1 requirement comes from ui and has nothing to do with this package. Each package's floor should follow the features that package actually uses - making them match would be a fake constraint.
  - **`react` / `react-dom` stay `>=18`**: the wide floor has CI evidence (the react18 smoke run), so it is not narrowed.
  - **`motion` stays `>=11`**: the library only uses `animate`, `AnimatePresence`, `LazyMotion`, `m`, `useAnimate`, `useInView`, `useMotionTemplate`, `useMotionValue`, `useMotionValueEvent`, `useReducedMotion`, `useSpring`, and two types, all of which predate 11, with zero hits across the codebase for anything exclusive to 12 (`motion.create`, `useAnimateMini`, `visualDuration`, `AnimatePresence propagate`). Worth noting: the `motion` package's 11.x line actually starts at 11.11.12 - the release where it was renamed from framer-motion - so `>=11` effectively means "from the start of that line".

  The gate joins the existing `pnpm deps:family` (`scripts/check-dep-family.mjs`, in the sub-second static tier, reading only `package.json` and the baseline - no install, no network). It also pins down the copy of the peer list that `docs/consuming.md` offers consumers to paste: in this incident that copy had gone stale alongside the manifest (`package.json` should long have read `>=1.6.0` while the doc still said `>=1.0.0`). A unit test now compares them entry by entry, and omitting any non-optional peer fails too.

  **What it cannot catch**: it judges only what we declare, never what a consumer ends up installing. Reproducing the hydration mismatch itself requires a consumer project carrying an old lockfile, and the library repository has no such input - the same boundary as the #207 tier.

  Released as minor rather than patch: raising a peer floor narrows the range of versions a consumer may accept, consistent with #207.

  **What consumers need to do**: if you are coming up from 0.29.x, refresh `@base-ui/react` as well (`npm update @base-ui/react` or `pnpm update @base-ui/react` - lockfile only). If yours reads `^1.4.1`, `npm install @hulianui/ui@latest` will **not** touch it and the lock is preserved as is - the same mechanism as "the existing members' specifiers had not changed, so their lock entries were preserved" in #207. Consumers on Tailwind 4.0 should likewise move to 4.1 or later.

## 0.32.0

### Minor Changes

- ba54677: `RichTextEditor` gains a legacy-HTML compatibility tier: the `legacyHtml` prop plus an exported pure function `normalizeLegacyHtml` (#208).

  A consumer ran real body content out of their production database through "open, edit nothing, read the HTML back" and measured plain content surviving intact while anything pasted in from the WeChat editor lost a great deal: `<font>` 29 to 0, `color` 11 to 0, `face` 25 to 0, `style` 13 to 1. The same shapes reproduce locally, and all three are confirmed gone: `<font color="#e4393c" face="Microsoft YaHei" size="3">` collapses to a bare `<p>`, the whole `style` on `<img style="max-width:100%">` disappears, and `<section style="text-align:center">` takes its alignment down with the tag. What gets lost here is exactly the formatting the editorial team actually uses - red emphasis, font size, centering, and the `max-width` the WeChat editor attaches to every image (without it the image overflows its container on the front end) - not junk markup. Roughly 50 of their 80 pending pages were blocked on this.

  Released as minor rather than patch: it adds a prop and an export, and it is **off by default** - with it off the component behaves byte for byte as it did before the prop existed, pinned by a test of its own.

  **Why both entry points, rather than only the pure function.** The issue offered two candidates. The pure function looks like the smaller surface, but measurement shows it cannot cover everything:

  - `<font>` to `<span style>`, and pushing block alignment down, are both **pre-parse** markup translation. A pure function handles them completely.
  - But `style` on `<img>` and `font-family` **require the schema to participate**: an attribute the schema does not know about is gone the moment ProseMirror parses, whatever shape it was translated into. Feeding `<span style="font-family:...">` straight in was measured to come back out with only `color` and `font-size` (no `FontFamily` extension); `<img style>` behaves the same way (the `Image` node has no `style` attribute).

  So: the `legacyHtml` prop covers all three tiers (including installing `FontFamily` and giving `Image` an allowlisted `style` attribute), while `normalizeLegacyHtml(html, { font, align })` covers the two that can be pure, for bulk-cleaning a table, writing a migration script, or sharing one mapping with another editor.

  Several non-obvious decisions:

  - **The compatibility tier does not obey `toolbar` trimming.** With `legacyHtml.font` on, `TextStyle` / `Color` / `FontSize` / `FontFamily` are installed unconditionally, even when the toolbar carries neither a color picker nor a font-size control. The schema decides whether legacy content survives; the buttons decide whether the user can change it - two different things, and nobody should have to enable a color picker they do not want just to stop losing red text. `FontFamily` in particular is deliberately schema-only and never a button: it is installed so existing fonts are not dropped, not so the editorial team can pick fonts.
  - **Alignment is pushed down, not preserved.** `text-align` inherits in CSS but not in ProseMirror: `<section>` cannot enter the schema, and the moment it is flattened the centering hanging on it goes too. Normalization therefore pushes the alignment onto the child blocks, and a wrapper containing only inline content becomes a `<p style="text-align">` outright. The `align="center"` attribute and the `<center>` tag are recognized along the way - in this class of legacy content they show up alongside `<font>`.
  - **A centering wrapper around a lone image is deliberately left alone.** An image is a block node, so wrapping it in a `<p>` only makes ProseMirror lift it back out and leave an empty paragraph behind - trading an old bug for a new one. This is written into the docs: center images through front-end styling instead.
  - **Attribute values go through a shape allowlist, not string concatenation.** The value of `<font color>` comes from a user-writable field in the consumer's database, so splicing it into `style` directly hands over the whole attribute (`color="red;position:fixed;z-index:9999"`). Colors are accepted only as a named color, `#hex`, or `rgb()`; a `face` containing structural characters is dropped; `size` accepts only `1..7` and `+n`/`-n`, mapped to px through the browser's own table. `<img style>` is likewise an allowlist of three (`max-width` / `width` / `height`), and `position` / `z-index` do not get in.
  - **None of the paste sanitizer's removal rules relax.** With `legacyHtml` on, the paste path becomes "normalize, then sanitize" (the other order would leave nothing to translate, since `color` / `face` / `size` are removed by the attribute allowlist first); sanitizing then merely allows two more properties, `font-family` and `max-width`, while `class`, `on*`, `<style>`, and `javascript:` are still stripped.
  - **CJK family names are always quoted.** `font-family: SimSun` written unquoted is legal per the CSS spec but does not hold up in practice: jsdom's cssstyle judges the whole declaration invalid and drops it, and a fallback stack like `'Arial', SimSun` gets truncated from the invalid item onward. Single quotes, because a double quote serializes to `&quot;` and becomes part of the family-name literal.

  Both the reproduction and the regression tests follow the trap the issue called out: strip `<br class="ProseMirror-trailingBreak">` before reading `innerHTML` off `.ProseMirror`, since that is a rendering placeholder that never reaches `getHTML` and leaving it in makes every `<br>` count look doubled.

## 0.31.0

### Minor Changes

- 405df53: `Button` gains the text step of the dense scale, and the `soft` variant's rationale is now written down (#204 - #205).

  - `Button` gains `size="xs"` (24px tall, 12px text, 4px radius, 4px icon-to-text gap, #204). `iconXs` covered "the icon button inside a dense table row" back in #146, but the **text button** on that same scale never got a step. A consumer measured 195 bare `<button>` elements that ought to have migrated and found 134 of them sitting at 20-28px tall with 10-12px text: `sm` (32px/14px) is a step **larger** than their smallest, not their smallest, and forcing the migration takes six override classes that exist only to undo what `sm` just added (height, padding, font size, radius). A migration like that gets reverted on sight. The measurements match `Tag`'s md step (`h-6 px-2 text-xs`) so the two line up when placed side by side, and the radius matches `iconXs` (`rounded-sm`, 4px) because those two steps commonly share a toolbar. `xs` (24px) and `iconXs` (20px) are deliberately unequal in height: raising `iconXs` to 24px would grow the rows of a `density="compact"` table, and not growing those rows is its entire reason to exist. Effect buttons (`ShimmerButton` and friends) **do not** get this step - a shimmer, rainbow, or pulse needs surface area to read at all, and their base deliberately carries no radius, so `xs`'s `rounded-sm` would not apply there anyway.
  - `Button` documentation drops a sentence that pushed readers toward the very thing it forbade (#205). "For a tinted success button use `tone="success" variant="outline"`" is wrong: `outline` gives a canvas-colored background with a semantic border, the background never gets lighter. Anyone following it sees no effect and then reaches for `bg-green-50` in `className` - exactly what the same sentence prohibits. It now points at `variant="soft"`, shipped in 0.30.0, and records that step's settled rationale and cost: the background uses the library's existing `bg-{tone}/12` (hover 20%, `neutral` uses `bg-foreground/8`), consistent with `Tag` / `Chip` / `Alert`, and **deliberately not** `--color-*-subtle` - switching would require a new `--color-primary-subtle` plus four `*-subtle-hover` tokens and leave the library with two parallel soft palettes. The known cost is that a translucent background shows through whatever container it sits on. Written down so the next consumer does not file the same issue again.

- 405df53: New `Sidebar` compound component: the shell and state machine of a collapsible application sidebar (#206).

  A consumer (kaneo) stalled here during migration - **11 files had to keep depending on a locally maintained 761-line `components/ui/sidebar.tsx`, and that whole batch was put on hold**. The gap was not "one missing component" but a missing middle on an axis that only had endpoints: `NavMenu` is menu **content** (an `items` tree, with no shell, no collapsed state, no mobile form), while `AdminLayout` is a **finished page** (sidebar, header, route tabs, and content from a single `menuItems`). The most common admin shell sits between them: it wants the shell and the state machine, but the inside is assembled by hand - workspace switcher, search box, project list, a secondary menu on each row, a user card at the bottom. None of that fits AdminLayout's fixed shape, so consumers rewrote the whole thing. `Sidebar` fills that middle. It carries **no** header, breadcrumb, or tabs, so it is not a second AdminLayout; for a data-driven menu, put `<NavMenu>` inside `<SidebarContent>` - they nest rather than compete.

  Decisions worth stating:

  - **Layout is an in-flow flex width transition, not the `fixed` panel plus equal-width spacer div used by comparable implementations (shadcn/ui).** That approach assumes the sidebar always spans the viewport, but this library's sidebar will inevitably be placed inside a non-fullscreen container - the docs site preview frame, a `Viewport` device frame, a `Resizable` split workspace - and in all three a `fixed` panel escapes its box and pins itself to the viewport. The failure only appears once embedded, so full-screen local debugging never shows it. The in-flow approach matches `LayoutSider` / `AdminLayout` and needs no measurement. The cost is documented: `Sidebar` and `SidebarInset` must be direct children of `SidebarProvider`, since an intervening plain `div` breaks the flex relationship.
  - **Mobile reuses `Drawer` instead of introducing a second overlay.** On a narrow viewport a sidebar *is* a drawer, and focus trapping, Escape, the backdrop, the slide curve, and the `starting/ending-style` transitions are all solved there already; a second implementation would only produce a second overlay that drifts. Wiring it means zeroing the drawer's padding **together with** `--hl-overlay-pad` (they must move together, or the body's negative-margin compensation pushes content outside the drawer), and the title and description are always `sr-only` - the visible title belongs in `SidebarHeader`, but the accessible name and description cannot go missing because of that.
  - **`Cmd/Ctrl + B` yields inside editing contexts, with four escape hatches**: `event.defaultPrevented` (someone already handled this key), inside `input` / `textarea` / `select`, on a `contenteditable` element itself, and **inside a `contenteditable` descendant**. The last one is the real trap: when the caret sits on a `<strong>` in a rich text editor the event `target` is that `<strong>`, not the editable root, so checking the element itself misses the entire editor - the symptom is a user pressing `Cmd+B` to bold a task title while the sidebar jumps around beside them. The check is an exported pure function (`isEditableEventTarget`) with its own tests, and it uses duck typing rather than `instanceof HTMLElement`: jsdom still does not implement `isContentEditable`, so relying on that property alone would make the last two cases pass falsely in tests. Persistence stays **out** of the library - only `open` / `onOpenChange` are exposed, because hard-wiring a cookie would fight SSR first paint, multi-tenancy, and privacy policy all at once.
  - **`SidebarMenuAction` / `SidebarMenuBadge` are siblings of `SidebarMenuButton`, absolutely positioned over the right edge of the row, never nested.** A button nested inside a full-row button is invalid HTML, React reports it during hydration, and screen readers never surface the second action - and it is the single easiest thing to get wrong when hand-rolling a sidebar, so tests pin it down (`button button` / `a button` / `button a` all count zero, and both live in the same `<li>`). Also pinned: the active item uses `aria-current="page"` rather than `aria-selected`, which is meaningless on a button or link; `SidebarMenuSkeleton` widths are **deterministic** rather than `Math.random()` (a random width is drawn once on the server and again on the client, guaranteeing a hydration mismatch); and `SidebarRail`'s accessible name deliberately **differs** from `SidebarTrigger`'s, since two buttons both named "toggle sidebar" leave screen reader users unable to tell them apart in an element list.
  - `mobileBreakpoint` resolves to `(max-width: 767px)`, aligned with Tailwind's `md:` (`min-width: 768px`). The identically named `breakpoint` on `LayoutSider` / `AdminLayout` resolves to `(max-width: 768px)` and keeps its own meaning ("collapse at and below"). The 1px difference is documented next to the prop, because at exactly 768px - an iPad in portrait - the two would otherwise disagree about whether the page is mobile.

- ab9e396: Fixes the five unmet peer warnings that 0.30.0 produced when upgrading with an existing lockfile: the whole tiptap family moves to `^3.30.0` together, with a static gate to make that convention mechanical (#207).

  **The root cause is not the version numbers but the mismatch between "we declare a range" and "the dependency declares an exact value."** Every tiptap package pins its `peerDependencies` exactly (`@tiptap/extension-table@3.30.0` wants `@tiptap/core: "3.30.0"` and `@tiptap/pm: "3.30.0"`, not `^3.30.0`), so our `^3.29.2` only holds when **the whole family is resolved in one pass**. A fresh install always satisfies that, which is exactly why the library's own CI stayed green; **a consumer upgrading with an existing lockfile does not**: 0.30.0 added four extensions for `RichTextEditor` while that consumer's lock had `@tiptap/core` / `@tiptap/pm` fixed at 3.29.2. The existing members' specifiers had not changed, so their lock entries were preserved, and only the four new members entered the lock fresh - resolving to the then-latest 3.30.0. What actually runs is `extension@3.30.0 + core@3.29.2`, and tiptap pinning exact peers is itself the statement that it does not guarantee internal API compatibility across versions.

  **The fix is deliberately not "switch the specifiers to exact versions" - that path measured worse, and this is not a theoretical concern.** `@tiptap/starter-kit`'s own `dependencies` use `^3.x` and pull `core` / `extensions` to the latest in the family; pinning our extensions to an exact version therefore **breaks a fresh resolution outright** (measured: `pnpm peers check` reports a string of `unmet peer @tiptap/core: Installed 3.30.0 / Wanted 3.29.2`). That trades "an occasional break for consumers upgrading with an old lock" for "a guaranteed break for every new consumer each time upstream publishes" - an order of magnitude more frequent, and entirely outside our control. Instead the carets stay, and **the whole family is raised in the same change that adds a new member**: once the existing members' specifiers move, a consumer's lock entries for them stop applying, and the family advances together in one resolution - which is the premise the whole scheme rests on. Both scenarios (upgrade with an old lock, fresh resolution) were measured back to zero warnings.

  The accompanying gate `pnpm deps:family` (`scripts/check-dep-family.mjs`, in CI's sub-second static tier) asserts four things: every member carries the byte-identical specifier, the lower bound never regresses, **adding a member must strictly raise that bound**, and **the lockfile may resolve this family to exactly one version**. The baseline (`scripts/dep-family-baseline.json`) records the family's shape at the previous release and moves with the changeset; the proof that it rejects 0.30.0's `package.json` is frozen in a unit test (the case built on the 0.29.0 shape), so the self-check does not decay as the baseline advances. Every assertion reads only `package.json`, `pnpm-lock.yaml`, and the baseline - no install, no network, no CI time.

  **What it cannot catch is stated too**: the library resolves fresh every time, so the "old lock" failure mode simply cannot be reproduced in its own CI - doing so would require a weeks-old lockfile as input, and no such input exists in the repository. The fourth assertion covers a different class instead: our own tree already being inconsistent (pinning exactly would leave two versions of the family in the lock, which the first three assertions cannot see). `pnpm install --strict-peer-dependencies` was **deliberately not** used for this layer, for two measured reasons recorded in the `ci.yml` comment: when the lock is current pnpm skips resolution entirely and never evaluates peers at all, and when resolution is forced it fails on a pre-existing conflict unrelated to this issue (`apps/www` to `intlayer` to `zod-to-ts` wants `typescript@"^5 || ^6"`, and the repository is already on 7.x).

  For consumers: a normal upgrade requires no action. **An environment already installed into the mismatched state** (upgraded from 0.30.0) needs one `pnpm update "@tiptap/*"` to refresh the lock - lockfile only. Do not add `@tiptap/*` to your own `package.json` or `pnpm.overrides` just to silence the warning. Released as `minor` rather than `patch` because raising the lower bound narrows the range of tiptap versions a consumer may accept, which is not a pure behavioral fix.

## 0.30.0

### Minor Changes

- 7e878b4: Cleared the issues raised by consumers this round (#175-#183 - #185-#188 - #191-#203) plus #181 found in-house.

  **New components**

  - `RichTextEditor`: a rich text editor whose **value goes in and out as an HTML fragment string** (#175). This is not a reskinned `MarkdownEditor` but a different value contract. When the existing database already holds HTML and the front end renders it directly through `v-html` or a mini-program `rich-text`, converting on the way in and out is not an option: `html -> md` is lossy, `<span style="color">`, `<p style="text-align:center">`, and `<table>` have no markdown equivalent, so one editor fixing one typo washes away years of accumulated formatting on the round trip. The core reuses TipTap, which is already a dependency. The toolbar is trimmable (`toolbar`), and **trimming also decides which tags survive** - leaving out `"table"` means the table extension is never installed and existing `<table>` markup is dropped by the schema on load, which is documented. Image upload is handed back to the consumer (`onUploadImage`) and never inlined as base64. Paste sanitation strips `class`, `on*`, `<style>`, and `javascript:`, while inline `style` passes an attribute allowlist so real formatting such as color, text-align, and font-size survives. Tags outside the schema can be added through `extensions`.

  - `CellEditor`: a primitive for **always-on per-cell editing** (#195). It and `EditableTable` are not two skins of one thing but two interaction contracts: the latter is row-level (click edit, change, save the row), this one is cell-level (always editable, commit this cell on blur or Enter). In reconciliation and data-entry work the user scans a screen and fixes one character wherever it is wrong, and any click-to-edit then click-to-save round trip turns that into manual labor. Four behavioral rules live in the implementation rather than being left to consumers: **an unchanged value is never submitted** (otherwise looking into a cell and leaving fires a screenful of empty writes at the backend), Esc rolls back and the blur that immediately follows does not resubmit the old value, auto-height uses CSS `field-sizing-content` (measuring dozens of cells from JS drops frames while scrolling), and the `missing` state uses muted italics so an empty cell is distinguishable from one holding a space. A promise-returning `onCommit` disables the cell while pending. The table shell is still `Table` (with `cellVerticalAlign="top"` and `meta.whitespace`).

  **New capabilities**

  - `Table` gains `cellSpan` for merged cells, the equivalent of the el-table `:span-method` (#176). Merged-away cells **stop calling back**, so "merge while the store matches the previous row" only needs the segment length returned at the head of each segment. The callback receives `rowIndex` in render order with `rows` in the same order, which is exactly the fix for the el-table trap where enabling column sorting shifts every merge out of place. It cannot be combined with `virtual` or `renderExpandedRow` (a merge has no anchor across windows, and a detail row would be skipped by a vertical merge); combining them silently disables merging and warns in dev rather than painting a misaligned table.
  - `Table` gains `stickyHeader` with `maxHeight` (#192), `minWidth` (#193), and `cellVerticalAlign` / `cellWhitespace` plus per-column `meta.verticalAlign` / `meta.whitespace` (#194). `minWidth` lands on the `<table>` **itself**: a `min-w-*` written into `className` pins the scroll shell instead, so the container can never shrink, the horizontal scrollbar never appears, and columns past the viewport are clipped **with no way to scroll to them** - none of which reproduces on a wide window. Vertical alignment and wrapping are a per-column pair: once one column wraps, vertically centered short cells in the same row stop aligning with the first line of the long one.
  - `SearchForm` field vocabulary gains `cascader` and `region` (#177). The built-in administrative-division table for `region` is about 137KB, so that entry is **loaded on demand**; otherwise every list page using SearchForm or ProTable would carry it.
  - `Command` gains `surface` (`solid` / `glass` / `none`) and `backdropClassName` (#178), separating skin classes from layout classes. `none` means "the library paints nothing, I will", so consumers no longer need a pile of classes to beat down `bg-surface / border-hairline / shadow-xl`, and a future skin change will not fight those overrides.
  - `DialogContent` / `DrawerContent` gain `backdrop`, `backdropClassName`, `scrollable`, `bodyClassName`, and `descriptionClassName` (#185 #188 - discussion on #179). Going non-modal takes **two changes together**: `modal={false}` on the Root and `backdrop={false}` on the Content - changing only the first leaves a `fixed inset-0` layer that still swallows every click on the screen even while fully transparent. `scrollable={false}` turns the body into a column flex container that passes a definite height to its children, so "list on the left and preview on the right, each scrolling" no longer needs an `h-[58vh]` guessed from max-height minus title minus footer. `descriptionClassName="sr-only"` provides a description meant only for screen readers.
  - `Field` gains `required` / `requiredMark`, and `register()` from `useForm` derives `required` from the rules (#180). Required-ness used to live only in the rules, so the interface revealed it after the first submit and every consumer grew its own `RequiredLabel` - and such a hand-rolled asterisk is `aria-hidden` decoration, leaving screen reader users without the information while `aria-required` cannot reach the inner control either. Both sides are now covered.
  - `Input` / `Textarea` / `SelectTrigger` gain `size="xs"` (28px tall, 12px text, #187). It is not the same as `variant="cell"`: cell has no border and a transparent background, whereas xs **keeps its border** - in a dense data table the border is exactly how users tell which cells are editable.
  - `Textarea` forwards refs (#186). The internal ref that measures `scrollHeight` and the consumer ref now coexist instead of being mutually exclusive; passing a ref used to be an outright TS2322, so "focus on dialog open" meant dropping back to a native textarea for the whole field.
  - `Button` gains `variant="soft"` (#197): a tinted semantic background with semantic text, filling the gap between outline and solid. A **stateful trigger** in a secondary toolbar had no step to use - `outline` with `tone="brand"` has no brand entry in its compoundVariants and therefore renders identically to the inactive state, making "active" indistinguishable, while `solid` is heavy enough to outrank the primary action of the page. The same soft tone already existed on `Chip` and `Tag`, so this also levels an inconsistency inside the library. Note it does not render `aria-pressed`: a real toggle still belongs to `Toggle`, and soft is for triggers that merely show something is currently in effect.
  - `Checkbox` / `Radio` gain `size="sm"` and `labelClassName` (#199). **The check mark and inner dot scale with `size`**, which is why the box could not shrink before: the mark was independently hard-coded at 14px and overflowed a 16px box. `labelClassName` lands on the label `<span>` (`className` lands on the box and cannot reach the text) - a consumer measured 21 sites where the existing `label` prop was usable in exactly zero of them, all blocked by the hard-coded `text-sm text-foreground`. The docs also record two facts about implicit association: wrapping the control in your own `<label>` **does work** (the Root is a `<span role="checkbox">`, so the DOM makes it look broken, but Base UI keeps a visually hidden native input inside), while adding `<label htmlFor>` at the same time **overrides** it and makes clicking the text do nothing.
  - `Slider` gains `thumbAriaLabel` and moves the accessible name down to the thumb (#200). The Root renders as `role="group"`, while the control that actually takes Tab focus and is announced as a slider is the visually hidden `<input type="range">` inside the thumb - with the name on the Root, focus announces only "slider, 100", a real accessibility regression for anything migrated from a native `<input type=range>` with a `<label>`. **A single-value slider moves the name rather than copying it**: with one control in the group the group name adds nothing, and a duplicate is announced twice and makes name-based lookups ambiguous (two tests inside the library hit exactly that). A range keeps the group name and names both thumbs through the `thumbAriaLabel` tuple, otherwise they sound identical.
  - `HoverCardContent` extends the native div attributes (#201). The card is portaled out, yet synthetic events still bubble along the **React tree** back to the parent holding the trigger - inside a fully clickable row or card, the standard defense is `stopPropagation` on the card root, which is precisely what the old signature could not accept. A forwarded `onMouseEnter` / `onMouseLeave` is **merged** with the internal delay timers rather than replacing them, or moving the pointer onto the card would close it.
  - `Card` gains `divided` (#203): a rule is skin, not structure, so `divided={false}` declared once stops both `CardHeader` and `CardFooter` from drawing one and tightens the padding that rule used to hold open (removing only the line leaves an unexplained gap). This extends the #159 principle - background belongs to the skin and follows the variant - down to the sections; until now `variant="plain"` meant "the page supplies the chrome" yet the sections still drew a `--color-border` line of their own. It is implemented with a **direct-child selector** on Card rather than context: Card still has no `"use client"`, and a boolean is not worth dragging the whole card into the client boundary, while limiting it to direct children keeps a nested card from inheriting the outer value.

  **Fixes**

  - `Radio` / `Checkbox` / `Switch` render `children` (#183). `<Radio value="1">Approved</Radio>` used to render a bare dot: children were neither destructured nor able to survive the explicit child on the Root, while the type side let it through - tsc, guard, and the console all stayed green, and only a screenshot revealed it. `Switch` also gains `label`, which it did not have at all.
  - `DialogContentProps.title` and `description` widen from `string` to `ReactNode` (#179). At runtime they already went straight into the children of `Dialog.Title`; only the type sealed the opening, so the most common header shape - an icon to the left of the title - could not be written, even though `DrawerContentProps.title` had been `ReactNode` all along, meaning the same header compiled in Drawer and failed in Dialog.
  - The empty state of a wide table now centers on the **scroll viewport** instead of the table width (#191). The `colSpan` cell is as wide as the table, so on a 20-column table the center lands outside the viewport and the user sees a header above blank space, which reads as a broken render.
  - `MenuContent` and `ContextMenu` gain a height ceiling with vertical scrolling (#198). The menu height used to be the sum of its items, so a long list grew past the viewport, and because the popup is fixed-positioned the overflow was **neither clickable nor reachable by page scroll**, with keyboard roving landing on invisible items. The rule moves from "every consumer must remember" to a library-level guarantee: `max-h-[min(24rem,var(--available-height))]` makes no visual difference while everything fits, and this class of defect only surfaces once the data grows (three items in development, forty in production). Select, Combobox, and TreeSelect already worked this way; these two were the stragglers.
  - `ProTable` in managed mode no longer discards a controlled `rowSelection` / `onRowSelectionChange` (#202). The condition changed from "is this managed mode" to "has the consumer taken over", matching the convention already used by `sorting`. The old behavior was damaging because it **looked completely normal** - checkboxes toggled and the header box went indeterminate - while the consumer state stayed `{}` until submit produced an empty array, with tsc, guard, and the console unable to see any of it. Passing `rowSelection` without `onRowSelectionChange` now warns in dev, because that case cannot be selected at all and is indistinguishable from a broken component.
  - `RelativeTime` **no longer reads the system clock during render** (#181, same class). Without `base` the first frame now renders the absolute time and swaps to the relative string after mount, through a layout effect that runs before the browser paints, so there is no visible jump. `new Date()` used to sit in the `useState` initializer, and under SSR or static export that render happens at **build time** - the output has "1 minute ago" frozen into it, so months later the first paint before hydration, crawlers, and readers without JavaScript all receive a stale claim they cannot check. The first frame falls back to the absolute time rather than treating `value` as its own reference and rendering "just now", because the latter is a falsehood that gets taken at face value, while the absolute time depends only on `value` and holds at any moment. The `suppressHydrationWarning` on `<time>` stays, but it now only covers a `value` that differs between server and client; the component itself no longer introduces a mismatch.

  - `Scheduler` **no longer reads the system clock during render** and gains a `now` prop (#181). `dayjs()` used to sit directly in the render body, and under SSR or static export the server render happens at **build time** while the first client render happens at **visit time** - once those fall on different days they compute a different "today", and hydration fails on the spot (React #418, the whole tree is discarded and re-rendered). "Now" is now read after mount, so the first frame draws neither the today highlight nor the current-time line; pass `now` when determinism matters (screenshot regression, a server-side business clock). The component showcase and `/demos/scheduler` both switch to a fixed seed week - what they demonstrate is what a week view looks like, not today's date. **This defect is nearly invisible to CI** (build and browser gates run minutes apart inside one run) yet nearly certain for users, who load the previously published output. "Never read the system clock during render" is now part of the global conventions.

  **Documentation**

  - `Table`, `ProTable`, and `EditableTable` each gain one note: **`columns` must be memoized** (#196). A function `cell` is rendered by `flexRender` as a **component type**, so a changed identity unmounts and remounts the whole cell. On a display-only table that just burns performance; with an input inside it breaks behavior - a controlled field loses focus on every keystroke with the caret jumping to the end, and an `onBlur` submit **commits a half-typed value** on the remount blur. None of the three symptoms looks like "columns was not memoized".

## 0.29.0

### Minor Changes

- d6092e6: Cleared the 14 issues raised by consumers this round (#158–#165 · #167–#172 · #174), and made the new info semantic color actually reach the components.

  **New components**

  - `Label`: a standalone form-label primitive — `<label>` + `htmlFor` + native attribute pass-through. Its skin comes from the newly exported `labelClass`, the **same single source** the `Label` segment of `Field` uses. Writing the literal twice would mean a font-size change only lands in one of them, while a consumer page has both "labels emitted by Field" and "hand-rolled labels" side by side, so the drift is immediately visible (#161).
  - `KbdGroup`: a shortcut-combination container — consistent gap, configurable separator (defaults to `+`, decorative, kept out of the accessibility tree), and an outer `aria-label` outlet. Still no `Meta → ⌘` symbol mapping: what a key should display depends on the consumer's platform detection (#165).
  - `MenuCheckboxItem` / `MenuRadioGroup` / `MenuRadioItem` and the three matching `ContextMenu*` parts: **this fills an a11y gap, not an API gap**. Using `Item` plus a hand-drawn check looked identical, but the role degraded to `menuitem` with no `aria-checked`, so screen reader users heard several peer actions — unable to tell that these are mutually exclusive options, or which one is currently selected (#170).

  **New capabilities**

  - `AlertDialogContent` gains `body` and `icon` slots. `description` renders as a `<p>` underneath, so block-level content inside it is invalid nesting and fails hydration on the spot; `body` renders below the description and above the action row, without a `<p>` wrapper (#158).
  - `ComboboxInput` / `ComboboxTrigger` / `ComboboxChips` pass native attributes through, and `ComboboxInput` gains `prefix` and `showChevron`. The remaining attributes land on the **inner input** — where `role="combobox"` lives — because `aria-label` / `id` / `onBlur` on the outer `<span>` do nothing (#160).
  - `Card` gains `variant="plain"`, and `AccordionPanel` / `CollapsiblePanel` / `PopoverContent` gain `plain`: when the content brings its own appearance, what you want is not a different skin but **no skin**. `bg-surface` also moved out of the `Card` base into each variant — otherwise no spelling of plain could remove the background (#159 #162 #172).
  - `Field` gains `orientation="horizontal"` for the "label left, control right" row layout of settings pages, keeping the a11y wiring, invalid propagation, and error rendering intact. The error row uses `col-span-full` rather than a hard-coded `col-span-2`: when a consumer swaps in a three-column template, the hard-coded 2 would only cover the first two columns (#161).
  - `Command` gains a `footer` slot, matching the existing contract of `ComboboxContent.footer`. A command palette is modal, so controls in its footer have nowhere else to go (#171).
  - `Prose` gains `details` / `summary` typography with nesting distinction, plus a new `scrollableTables`. In that mode, `th` not wrapping is **required, not decorative**: with only `overflow-x-auto`, columns collapse to min-content (one CJK character per column), the content never exceeds the scroll container, and therefore nothing ever scrolls (#168).
  - `CodeBlock` gains `lineNumbers`. Line numbers are `aria-hidden` + `select-none` (otherwise a drag-select copy carries them along), `sticky left-0` so horizontal scrolling cannot take them away, and the gutter width is computed from the digit count of the highest line number (#169).
  - `tokenizeCode` supports Python (`py` / `python` / `python3`). Falling through to the JS branch was not "no highlighting" but **wrong highlighting**: `#` comments went unrecognized, `def` was not colored, while `var` / `function` appearing inside Python code got mislabeled as keywords — you can see colors, so nobody suspects they are wrong (#167).

  **Fixes**

  - `Accordion` forwards the Base UI Root generic (defaulting to `string`). Passing it through `ComponentProps` erased it to `unknown[]`, so controlled usage always raised TS2322, and the `value` case could not even be rescued with a cast (#163).
  - `Command` highlights the first available item by default, with a new `autoHighlight` (default `true`). **This is a behavior change**: previously "type, then press Enter" did nothing at all until you pressed `↓` once, and that difference was completely invisible. The highlight is now recovered across batches by value, so consumers who did not wrap `groups` in `useMemo` — common when items come from request data — no longer see "it lights up then vanishes, and Enter works only sometimes" (#174).
  - The `mt-2` in `PopoverContent` now follows the title/description: with neither present it was an 8px strip of dead space at the top of the popup that even `className="p-0"` could not remove. The arrow moved to its own `arrow` switch and is **not** tied to `plain` — an arrow indicates the relationship between popup and trigger, it is not content skin, and coupling the two would be wrong (#172).
  - A one-time development warning when `ConfigProvider` is missing. The fallback policy is unchanged (components must render outside a Provider); this only adds discoverability, since what falls back is mostly `aria-label` text, and an English product can ship a screen full of Chinese screen-reader labels without anyone noticing (#164).

  **Appearance change**: the `info` tone of `Alert` / `Banner` / `Callout` / `Toast` / `Notification` / `Modal` / `Result` / `EventStream`, along with `DiffStat`'s `renamed`, now consume the new `--color-info` (teal-blue) instead of borrowing the primary color. They borrowed primary because the library simply had no info semantic color — which is exactly the "notice strips dilute the brand color" complaint from consumers, committed by the library itself (#173).

## 0.28.0

### Minor Changes

- Prebuilt `.d.ts` files now ship with the package, cutting consumer tsc memory to an eighth (#156) <!-- parity-id: prebuilt-dts-types-condition -->

  HulianUI is distributed as source: `exports` pointed straight at `src/index.ts` and the package contained no `.d.ts` at all. Because `skipLibCheck` only skips `.d.ts` and never `.tsx`, a consumer using **a dozen components** still pulled all 780 `.tsx` files into type checking. Subpath imports do not fix this: they narrow the module graph, but type checking follows the **type reference graph**, and the components dogfood each other thoroughly (`Field` → Base UI, `ProTable` → `Table`/`SearchForm`/`Pagination`), so the transitive closure quickly approaches the whole library. The original report measured typecheck going from 90 seconds to 2 minutes 40.

  The `types` condition in `exports` now points at the packaged `dist/*.d.ts` while `default` still points at `src/`. Measured on one project importing 12 components from the root barrel under TS 7.0: Files 2242 → 1872, **memory 699 MB → 88 MB**, wall time 1.53 s → 0.27 s — and the saving no longer grows with the number of components used. Tailwind's `@source` scanning, HMR, and "jump into the real implementation" are all unaffected, because bundlers still read the source.

  **A known limitation lifts with it**: `noUncheckedIndexedAccess` enters the supported matrix. It used to surface roughly 300 indexed accesses inside the library as TS2532/TS18048 in consumer builds (#56); declaration files contain no expressions and therefore no indexed access. For the same reason, things like unused imports in library source no longer leak either (see #155 below).

  Declarations are generated by `prepack` and removed by `postpack`, so no build output is left in the repository. CI watches both sides: an `Emit declarations` step proves the emit itself stays clean, and the consumer gate additionally asserts that types **actually resolve** to `dist/*.d.ts`. TypeScript silently falls back to the source when a `types` target is missing, and the build still passes, so without that assertion a regression would be invisible.

- Controlled form components forward native root attributes, so `InputOTP` works with `Controller` (#157) <!-- parity-id: form-control-native-attrs-passthrough -->

  `InputOTPProps` was a closed interface with nowhere to pass `field.onBlur`. The consequence was not a missing feature but a **silent failure**: react-hook-form's `touchedFields` never updated, and a form using `mode: "onBlur"` or `"onTouched"` never validated on focus out — errors appeared only on submit, which is very hard to trace.

  This release levels the library against one rule: presentational components inherit the root element's `HTMLAttributes`, and **controlled form components additionally land `onBlur` on the root**, treating "does it work with `Controller`" as an acceptance criterion. Twenty-one components are covered: `InputOTP`, `Rating`, `Segmented`, `SecretField`, `Listbox`, `CheckboxGroup`, `Choicebox(Group)`, `ColorSwatchPicker`, `IconPicker`, `EmojiPicker`, `Transfer`, `ScopeMatrix`, `CodeEditor`, `MarkdownEditor`, `Calendar`, `TimeField`, `Checkbox`, `Switch`, `Toggle`, `NumberField`, and `ElasticSlider`.

  Two conventions are recorded in section 7 of `docs/consuming.md`. First, a prop whose name collides with a native attribute but means something else is `Omit`-ed, and the component's meaning wins: `Rating.color` is the star colour, `SecretField.onCopy` hands back the secret itself, and `EmojiPicker.onSelect` hands back an emoji string. Second, `rest` is spread **before** the component's own root attributes, so its `role`, `aria-*`, and keyboard handling win — overriding those would break the accessibility semantics and keyboard navigation outright.

  `InputOTP`'s `onBlur` has whole-group semantics: moving focus between segments does not fire it, because per-segment blur would make `mode: "onBlur"` start reporting errors after the very first character. A `name` prop was also added; it renders a hidden input holding the complete value so a native `<form>` submit yields the whole code instead of N single-character fields.

  **Not yet levelled**: the Popover-wrapped selectors — `Cascader`, `TreeSelect`, `CountrySelect`, `RegionCascader`, and the `DatePicker` family. Their "root" is not a single DOM node, so whether `id` and `data-*` belong on the trigger or the popup has to be decided per component; spreading them mechanically would put them silently in the wrong place.

- The track behind `Tabs variant="solid"` and `Segmented` uses a new recessed token, so the selected item is finally legible (#152) <!-- parity-id: track-token-segmented-contrast -->

  The segmented track used `--color-surface-hover`, which sits only **3.3% away in lightness** from the pill's `--color-surface` in the light theme (about 1.06:1). Selection rested entirely on a single `shadow-sm`, and with many tabs the current one was hard to find. The dark theme was worse: the track at `gray-800` was **lighter** than the pill at `gray-900`, drawing the groove on top of the raised element and inverting the elevation.

  A new semantic token, `--color-track`, ships in `@hulianui/tokens` 0.7.0. It is defined by a **relationship** rather than a fixed grey: always one step deeper than `--color-surface`, with the raised pill reading as closer to the viewer in both themes. `Tabs` in its `solid` variant and `Segmented` are wired to it, and consumers need no code changes. Retuning the depth now means touching a single variable instead of `--color-surface-hover`, which would ripple through every hover state in the library.

- `Table` gains `stickyScrollbar`: a horizontal scrollbar pinned to the bottom of the viewport for wide tables (#149, follow-up) <!-- parity-id: table-sticky-horizontal-scrollbar -->

  When a wide table is taller than the viewport, the real horizontal scrollbar sits at the bottom edge of the table, below the fold — scrolling sideways first requires scrolling the whole page to the last row. With this enabled, a proxy scrollbar with `position: sticky; bottom: 0` is attached to the table shell and kept in sync with the real container in both directions.

  It appears only when needed: the content must actually overflow horizontally and the bottom edge of the table must be below the fold. Scrolling to the end of the table hides it again, so two scrollbars never stack. It coexists with pinned columns, since the proxy lives outside the table. **It has no effect when `virtual` is enabled**, because that container has a fixed height and always shows its own scrollbar at the bottom. When the prop is off, the DOM is byte-for-byte identical to before.

  The scrollbar is drawn **explicitly** (`::-webkit-scrollbar` plus `scrollbar-width`) rather than left to the platform: macOS defaults to overlay scrollbars that are invisible at rest, which would turn this into a blank strip — the opposite of the always-visible bar the feature exists to provide.

- `SocialButton` adds Discord and GitLab and opens an escape hatch for custom providers (#154) <!-- parity-id: social-button-custom-brand-escape-hatch -->

  `provider` was a closed enum. The common failure mode for a component like this is not "use it for half of them" but **falling back for the whole group**: in a column of four sign-in buttons, one missing provider makes a mixed row visibly inconsistent — the built-in ones carry brand logos and copy, while the two that fall back to `Button` need hand-placed SVGs whose size and spacing never quite match — so the whole group gets hand-rolled instead.

  `provider` now also accepts a `SocialBrand` object (`icon`, `label`, optional `brandColor`) and renders it with exactly the built-in skin: sizes, shapes, loading, press feedback, and focus ring are all shared. Omitting `brandColor` selects the monochrome treatment used by the built-in GitHub, X, and Apple buttons, which suits the single-colour logos most self-hosted identity providers have.

  Only Discord and GitLab were added to the enum, because it **cannot be completed**: simple-icons removed the Microsoft, LinkedIn, Slack, and Feishu logos on legal request, so those cannot be bundled at all, and self-hosted identity providers such as Keycloak, Authentik, and Okta are impossible to enumerate. The escape hatch is the fix; extending the enum is a bonus.

  ⚠️ The component is memoized, so keep a custom brand object at module scope. An inline `provider={{ … }}` literal creates a new reference on every render and defeats that memoization.

- `Field` exposes a className outlet for each of its label, description, and error sections (#153) <!-- parity-id: field-section-classname-outlets -->

  The classes on those three sections were hard-coded. Existing applications usually apply one field layout across a whole page (12px, muted), and a mismatch forced the page back to a hand-rolled `div.row` plus `span.label`, losing the `aria-describedby` wiring, `invalid` coupling, and error rendering that `Field` provides — all because the label's font size could not be changed.

  `labelClassName`, `descriptionClassName`, and `errorClassName` are merged through `cn` (twMerge), so passing `text-xs` correctly overrides the default `text-sm`. The outlets affect styling only; the accessibility relationships are untouched.

- Unused imports removed from the library, with the rule pinned into gates on both sides (#155) <!-- parity-id: unused-imports-and-strict-gates -->

  Under source distribution, a single unused import in the library is a TS6133/TS6196 in every consumer build that enables `noUnusedLocals`, and `skipLibCheck` cannot help. The report pointed at `heading.types.ts` and `text.types.ts`; the library actually had **37** such cases, including `prose`, `safe-area`, and `streaming-text` — three more `.types.ts` files that leak the same way, which the reporter simply had not imported.

  `noUnusedLocals` and `noUnusedParameters` are now enabled in `packages/ui/tsconfig.json`, where the failure surfaces inside the library itself — that is the real regression guard — and they were also added to the supported matrix in the consumer gate. Two leftovers surfaced along the way: `Choicebox` imported `pressableClass` and never used it (its hand-written `active:scale-[0.99]` is deliberately gentler than the shared preset), and `JsonViewer` threaded `isIndex` all the way down to `JsonNode`, which never consumed it.

- `Input` and `Textarea` gain `variant="cell"`, the in-place editor for tables (#149) <!-- parity-id: input-textarea-cell-variant -->

  Admin apps have a class of page that is "a form shaped like a table": the header row holds field names and each cell *is* the input. Dropping a HulianUI `Input` into a `Table` cell used to yield a standalone control with a border and a fixed row height, turning a dense table into a wall of boxes. Making it presentable required a long call-site override — `border-0 bg-transparent p-0 focus-visible:ring-0 …` — which is exactly the call-site patching the conventions forbid.

  `variant="cell"` strips the whole shell (no border, transparent background, zero padding, no fixed row height), and `Textarea` additionally hands height to CSS `field-sizing: content`, with the `rows` lower bound defaulting to `1` in this variant. Focus is shown as a **tinted background plus an inset underline** rather than a ring: a ring carries 2px of ring and 2px of offset, which spills into the neighbouring cell when the cell has no padding, while an inset underline is drawn inside the box with zero layout shift.

  Two of the hand-written overrides are especially hard to self-check, which is why they should not be written at all: `focus-visible:ring-0` does not clear `ring-offset` (a ring of background colour survives), and the default shell's fixed row height is `h-10` rather than padding, so `p-0` cannot remove it.

- New: `LineShadowText` and `InteractiveHoverButton` (#151) <!-- parity-id: line-shadow-text-and-interactive-hover-button -->

  Both fill gaps on the landing-page and marketing side. `LineShadowText` gives a brand word a diagonal **hard-edged** shadow (not the blur of `text-shadow`) and is the most restrained member of the text-effect family: static by default, no animation frame loop, pure CSS, usable on print pages and under `prefers-reduced-motion`. Its shadow layer is a real DOM node marked `aria-hidden` rather than `::after` with `content: attr()`, so screen readers do not announce the same word twice. `InteractiveHoverButton` is an expanding primary CTA: a dot plus a label at rest, and on hover or **focus** the dot expands into a full background and an arrow appears.

  The expansion differs from upstream: upstream scales a 2px dot by `100.8`, a magic number derived from one particular button width, so a wider button is no longer covered, the corners leak the resting background, and the failure is silent. This implementation uses `clip-path: circle(150% …)`, whose percentage resolves against the reference box's diagonal, so any width is covered.

- 125 fields across 44 components that existed in the types but in no documentation table are now documented, and a CI gate keeps it that way (#150, third item) <!-- parity-id: component-doc-props-coverage-gate -->

  The dominant shape is the **item interface**: `BreadcrumbItem`, `NavMenuItem`, `TabBarItem`, `RouteTabItem`, `ChromaGridItem`, and friends — the things passed in through an array prop. Root component tables were mostly complete, but "what each entry in the array looks like" was systematically missing, and that is precisely what consumers need: the root prop only says `items: XxxItem[]` and the trail ends there. Most of these shapes lived in prose (`AnchorItem` is `{ href; title; children? }`), which neither a reader of the tables nor a `format="json"` toolchain can consume.

  The new `pnpm docs:check:props` gate reads the **own** members of exported interfaces ending in `Props` or `Item` from the TypeScript AST and compares them against the first column of **every** table in the markdown; it now runs in CI. Both sides reuse existing sources of truth instead of regular expressions: inherited attributes are not required to be listed one by one, and qualified names (`DialogContent.title`) as well as two related fields sharing one cell (`startXOffset / startYOffset`) are both understood.

- `Tag` now extends `HTMLAttributes<HTMLSpanElement>`, and props queries surface slot fields (#148 #150 #147) <!-- parity-id: tag-native-attrs-and-props-doc-visibility -->

  `TagProps` used to be a closed interface, so `title`, `id`, `data-*`, and `aria-*` could not be passed at all — while the sibling `Button`, `Card`, `Empty`, and `Progress` all extend their native attributes. Status tags are exactly where `title` matters most: a table cell reads "Word" while its `title` carries the full MIME type.

  **A props query now returns slot fields as well** (#150). Fields such as `Button.render`, `Upload.label`/`hint`, `Stat.label`/`value`, and `Avatar.fallback` live in the `## Slots` section rather than the Props table, so anyone following the MCP workflow with `sections:["props"]` concluded that "Button has no render" or "Stat has no label" — and the two on `Stat` are **required**. The `props` array under `format="json"` now lists slots too (each tagged `kind:"slot"`), with the separate `slots` array preserved; the markdown path likewise includes `## Slots`. It does not work in reverse: asking only for `slots` or `events` never pulls in props.

  Same batch: `Segmented.label` was documented all along (in the Slots table), so #147's "missing from the props table" was this same visibility issue and the markdown needed no change; `Avatar`'s `size` documentation gains the `xl` and `2xl` steps (the implementation always had five while the docs listed three — an incomplete value range hides better than a missing field, because you believe you are looking at the full set of options).

- `Button` gains `size="iconXs"` (a 20px square), the micro size dense table rows were missing (#146) <!-- parity-id: button-iconxs-and-segmented-doc -->

  The smallest icon size used to be `iconSm` (32px), which pushes `density="compact"` table rows taller. The 20px size has always existed in practice — `Table`'s tree expander and drag handle both hand-wrote the same `size-5` without folding it back into `Button` or exposing it — so "don't write a bare `<button>`" and "the library has no button you can use here" formed a closed loop.

  `Table`'s expander now uses it. The drag handle **deliberately stays hand-written**: when disabled it needs `cursor-not-allowed` to say "this row cannot be dragged", and the `Button` base carries `disabled:pointer-events-none` — no pointer events means no cursor change. Converting it would take three `disabled:` overrides to push the base back, which is longer than the markup it replaces.

  Note that `iconXs` matches **no** text size (the other three, `iconSm`/`icon`/`iconLg`, equal the heights of `sm`/`md`/`lg`), so pairing it with `sm` leaves it 12px shorter. Its corner radius is deliberately `rounded` (4px) rather than `--radius` (10px): a 10px radius on a 20px square is a disc.

  **Docs fix**: the `SegmentedItem` props table now lists `label` (#147). It is a required `ReactNode` that every example passes, yet the table omitted it while the neighbouring `ariaLabel` row described that non-existent prop. Modelling from the props table — including tooling that reads `format="json"` — concluded that `SegmentedItem` has no label.

- **BREAKING**: `text-muted` is renamed to `text-muted-foreground` library-wide, following the semantic flip in `@hulianui/tokens` (#142) <!-- parity-id: muted-rename-and-cjs-tooling -->

  `--color-muted` is now a weak background (matching shadcn/ui) and the secondary text colour is `--color-muted-foreground`. The 2059 call sites inside the library have been rewritten; `text-muted` written in your own code needs the same rename. It no longer maps to any token, and Tailwind neither errors nor emits a rule for an undefined colour, so it **silently falls back to the inherited colour** — secondary copy renders in the same colour as body text. `npx hulian-check` has an error rule that lists every location. `bg-muted` needs no change.

  This also fixes BubbleMenu: the hover background fell back to the secondary text colour, giving a dark fill under dark text. The flip turns that fallback into the correct light tint.

  **Fixed**: `@hulianui/ui/vitest-preset` and `@hulianui/ui/vite` gained CJS entries (#143)

  A project without `"type": "module"` — the shape `create-next-app` generates, and therefore most Next.js consumers — loads `vitest.config.ts` and `vite.config.ts` through CJS `require`. Both entries were ESM-only, so the run died during **config loading** with `"resolved to an ESM file. ESM file cannot be loaded by require"` and not a single test executed. The implementation now lives in `.cjs` with `.js` as its ESM wrapper, so both paths work.

  **Fixed**: a wildcard class name inside a comment broke consumer CSS (#141)

  A JSDoc example in `button-base.ts` contained `[border-radius:var(--hulian-*)]`. The Tailwind v4 scanner only extracts text candidates and does not distinguish code from comments, so it emitted `border-radius: var(--hulian-*)` as a real rule. `*` is not a valid custom property name, so once a consumer added the documented `@source` line the whole stylesheet failed to parse and **every page returned 500**. The comment no longer uses class-name syntax, and a CI gate now guards against a recurrence.

## 0.27.0

### Minor Changes

- Clears issues #109–#139: 24 defect fixes and 7 capability gaps. <!-- parity-id: issues-109-140-sweep -->

  **BREAKING behaviour changes** (three, all in the same direction — restoring the intuitive behaviour)

  - `DesignCanvas` wheel semantics now match the platform convention and the sibling `Flow` component: **two-finger scroll pans, pinch zooms**. The `wheelBehavior` default moved from `"zoom"` to `"pan"`, and `ctrlKey` (which browsers synthesise for a trackpad pinch) no longer takes part in the "invert" branch — pinching used to be inverted into panning, which is an inverted meaning rather than a trade-off. Cmd+wheel no longer zooms, because macOS gives it no such meaning.
  - The four effect buttons (`ShimmerButton`, `RainbowButton`, `PulsatingButton`, `RippleButton`) moved from content-driven height to the same `size` scale as `Button` (32/40/48px), defaulting to `md`. They used to come out uneven when mixed with regular Buttons in a toolbar.
  - `IPhone`, `Android`, `Tablet`, and `Watch` derive body height from the screen ratio and the border instead of a hard-coded `aspectRatio` (`Tablet` still follows the model ratio when `model` is passed explicitly). Rendered sizes shift slightly, and in exchange the inner screen ratio is now always identical to the viewport ratio.

  **Added**

  - `Button`: `tone` gains `success`, `warning`, and `neutral` (it only had `brand` and `danger`), and `solid` now has real hover steps — `danger` used to hover back onto itself, which meant destructive buttons had **no hover feedback at all**. New `block` prop for full-width buttons.
  - `Dock`: controlled selection through `activeKey` and `onSelect` (the same pattern as `NavMenu` and `RouteTabs`), with `itemKey`, `active`, and `label` on `DockIcon`. The current item gets `aria-current="page"` plus an indicator dot under the icon; once `onSelect` is provided, `DockIcon` renders as a real `<button>` and the container becomes a `nav` landmark.
  - `InspectorPanel`: a `density="compact"` step; `columns` for multi-column groups (number fields inline their label into the input, and that label doubles as a **scrub handle**); `InspectorNumberField.inlineLabel` to opt in from a single column. Below 260px, enum fields degrade from a segmented control to a select automatically.
  - `IssueReporter`'s "Open on GitHub" now uses the GitHub mark (a brand-icon group was added to `_icons`) — on this kind of button the platform icon carries destination identity, not decoration.
  - New internal source of truth `lib/device-metrics`: device screen resolution and border width are declared once, `PreviewSandbox` derives its device list from it, and `watch` gains support as a result.

  **Fixed**

  - `ElementSelectionOverlay`: with a plain container as `target`, click interception no longer spreads across the whole host page. Every click anywhere on the host used to be swallowed (buttons dead, tabs unswitchable), and `onClear` fired when the user clicked their own inspector panel.
  - Library-wide `bg-muted` misuse: `--color-muted` is the secondary **text** colour, so as a background it reads dirty in light mode and washed out in dark mode. Area backgrounds now use the new `--color-subtle` and hover states use `--color-surface-hover`. Affects Kanban columns, ScopeMatrix buckets, QueueLane swim lanes, the InterceptCard violation block, Markdown tables, CodeDiff, Gantt, Scheduler, and Combobox / Select highlighted items.
  - Text colour on dark canvases: inactive `GooeyNav` items and `ChromaGrid` card copy followed the page theme, which meant dark text on a dark surface in light mode. Both are now declared dark contexts with fixed white steps; `ChromaGrid` also gained a dark base layer and an `@media (hover: none)` fallback, so pointerless devices no longer sit permanently in the greyscale degraded state.
  - `Segmented` items gained `min-w-0` and `truncate`: they used to be incompressible, so overflow was clipped by the parent and **options existed but were neither visible nor clickable**.
  - `CodeEditor` root gained `w-full`: as a flex or grid item it collapsed to roughly 20 characters wide.
  - `CardNav` cards were crushed into the 60px bar when expanded, because both the top bar and the content were `absolute` and `height:auto` therefore computed to 0.
  - `StaggeredMenu` item numbers overlapped the labels: two `em` offsets used different bases (48px vs 18px), so the 16.8px reserved could not hold 19.8px. They are siblings with `gap` now.
  - `Notification`: action buttons are left-aligned (this is an information card, not a dialog), the close button is `self-start` so it no longer drifts with card height, and its `aria-label` comes from the locale.
  - `AdminLayout` centres the collapsed logo on the same axis as the icon rail below it, and warns in development when `logoCollapsed` is missing.
  - `Button` base gained `select-none` (every button in the library benefits), as did the floating layers of `GiftFeed` and `Danmaku` — rapid clicking otherwise makes the browser select the label as a word.
  - `DesignCanvas` suppresses text selection, with an escape hatch for `input`, `textarea`, and `contenteditable`.
  - `ComponentPicker`: the grid gutter was too small, so the overlay scrollbar sat on top of the cards; the card title and slug no longer split the width evenly.
  - `PreviewSandbox`: the white band inside device frames (the inner screen ratio did not match the viewport ratio); device tier labels now come from the locale.
  - New layout height token `--hl-layout-header-h`, shared by `Layout.Header` and `AdminLayout`.

## 0.26.0

### Minor Changes

- 65c034f: Fixes #97: Button's icon size no longer floats outside the size scale (**a visual breaking change**)

  The `icon` size used to be `size-9` (36px) while the text sizes are `sm` 32 / `md` 40 / `lg` 48 — it matched the height of **no** text size, so a split button in ButtonGroup (`<Button>Save</Button>` next to `<Button size="icon">`) always showed a 4px step. `iconSm` had long been aligned with `sm`; `icon` was the lone exception, which says 36px was history rather than intent (`page-header.tsx` even hand-pasted that height with `size="sm"` plus `className="size-9 px-0"`).

  - `icon` becomes `size-10` (40px), aligned with the default `md`
  - New `iconLg` (`size-12`, 48px), aligned with `lg`
  - The three scales now map one to one: `iconSm`/`sm` 32, `icon`/`md` 40, `iconLg`/`lg` 48

  **Upgrade impact**: anywhere using `size="icon"` grows from 36px to 40px. No container broke in practice — every call site in the library and on the docs site sits in a height-adaptive container. There is no equivalent size for 36px; pick `iconSm` (32) or `icon` (40) by context rather than pasting `size-9` back through `className`, which is exactly the patch this removes.

  Three 36px neighbours were aligned in the same pass:

  - `AnimatedThemeToggler` goes 36 → 40 (it always sits beside icon buttons in a nav bar, and staying at 36 alone skews the whole row)
  - `PageHeader` back button: the hand-pasted `size="sm" className="size-9 px-0"` is gone, replaced by `size="icon"`
  - `Scheduler` toolbar: the previous/next buttons move from `icon` to `iconSm`, joining the `size="sm"` today button and the `Segmented size="sm"` in the 32px dense row

  A new regression test locks the invariant "icon size edge == the same-named text size height", so bending the scale again turns red on the spot.

- ff1f7a7: Fixes #99 and #100: two color components close gaps that InspectorPanel forced into the open

  **#100 · ColorPicker gains `onValueCommitted`**

  There was only `onValueChange`, which the internal color area fires on **every frame** while dragging. Consumers never got the "you let go" moment and could not reconstruct it — debouncing is guesswork, and `pointerup` is not reachable from outside the component.

  New `onValueCommitted` (named after Base UI's NumberField and Slider) fires once when the color area drag ends, when the text field blurs or takes Enter, and when the format switches. `pointercancel` does **not** fire it — a gesture the system interrupted is not a deliberate commit — while a click without a drag still fires once, because what consumers want is "an edit finished". `onValueChange` keeps its meaning, both can be used together, and the TSDoc now says outright that it fires on every frame while dragging.

  This also fixed a bug that only surfaces once a commit event exists: under `commitMode="commit"` the parent does not write props back mid-drag, and a controlled `value` then **pins the swatch in place so it cannot be dragged**. It now runs through `defaultValue` plus `key`, remounting only when the external value really changes.

  **#99 · ColorSwatchPicker readable swatch labels**

  `colors` used to be `string[]` used verbatim as the `aria-label`, so with theme tokens a screen reader announced `var(--color-primary)`. `colors` now accepts a mixed `string | { color, label }` array — purely additive, `string[]` is a subset, existing call sites need no change — and a `title` tooltip came along with it.

- 34644a1: Fixes #98: five date and time components gain `size` (**a visual breaking change**)

  The triggers of `DatePicker` / `TimePicker` / `DateTimePicker` / `DateRangePicker` / `TimeField` all hardcoded `h-9` (36px), and **none of the five had a `size` prop** — next to `Input` (40px) that is a misalignment by construction, and consumers had no opening to patch it other than stuffing `h-10` into `className`, which breaks the "a component that lacks a capability gets the capability upstream" rule.

  All five now run through cva on exactly the `Input` scale (`sm` h-8 / `md` h-10 / `lg` h-12, default `md`), with the icons inside the trigger scaling along. **After upgrading, the default height of these five goes from 36px to 40px** — which is the misalignment being fixed. There is no equivalent size for 36px; use `size="sm"` (32) or stay on `md` (40) by context.

  The `h-9` inside the `DateRangePicker` panel is the cell wrapping a day button in the month grid, unrelated to the trigger, and was deliberately left alone.

  Same root as #97 (Button's `icon` size): the library had a batch of 36px values floating outside the 32/40/48 scale. With both cleared, that stray size is gone from the form layer.

- 4e3547a: Seven new design-tooling components (#90–#96), completing the workbench that "AI generates UI" products need

  A consumer building an AI design-generation product reported seven gaps at once. All seven are dependency-free and in-house; not one npm dependency was added for them.

  - **DesignCanvas** (data-display/collection) a visual design canvas: infinite pan and zoom, a selection box, drag to move, eight-way resize. Controlled `items` own their geometry while `children` act as a free layer. The viewport math reuses `Flow`'s existing pure geometry functions rather than being rewritten. **The split with Flow is written into the docs**: Flow is a node-orchestration canvas, DesignCanvas is a free-arrangement design canvas.
  - **ElementSelectionOverlay** (feedback/overlay) the infrastructure for point-and-edit: hover to highlight and click to select inside a container or a **same-origin** iframe, handing back a component-tree path. Paths have two layers (a `data-hulian-path` marker first, falling back to a structural selector you can look back up with `querySelector`), and how reliable the path is comes back as a field. Nothing is ever written into the target document. **A cross-origin iframe reports a `cross-origin` error instead of pretending it connected.**
  - **InspectorPanel** (forms/advanced) a property inspector driven by a field schema: the control is derived from `kind`, and the panel itself knows no specific property; five preset schemas ship for layout / color / typography / border / effects. Four-side spacing with a link lock, theme token swatches, a `MIXED` placeholder for multi-selection, and a `commitMode` that decides when edits flow back.
  - **CodeEditor** (forms/advanced) a code editor: a textarea over a highlight layer, reusing `CodeBlock`'s dependency-free colorizer (CSS gets a separate stateful scanner, so `a:hover` is not mistaken for a property name). Tab to indent, Shift+Tab to outdent, Enter to keep indentation, auto-closing and wrapping pairs, paired backspace, `Cmd+/` to toggle comments — **each of them writes through `execCommand`, so the native undo stack survives**. **CodeMirror and Monaco are deliberately not used**: this library ships source, and one dependency enters every consumer's module graph. Folding, completion, multiple cursors and a minimap are explicitly out of scope, with the boundary stated in the docs.
  - **PreviewSandbox** (layout/container) a preview sandbox: iframe isolation and same-document React error boundaries share one shell and one error shape. Switching devices only resizes the box — **the iframe node and its document are never rebuilt** — so state inside the preview survives. The default is `sandbox="allow-scripts"` and **deliberately not `allow-same-origin`** (granting both is the same as having no sandbox), so errors come back over postMessage; pass the exported same-origin constant explicitly when you need to read the inner DOM. **It is not a code execution engine**: `code` means "an HTML document string already fit to hand to an iframe".
  - **ComponentPicker** (data-display/collection) a component-library browser: category tree, fuzzy search, a result grid and a detail pane. The ranking is in-house (a slug hit outweighs a description hit by a wide margin) and **fuse.js is not used**. The catalog is fed in by the consumer, with `parseComponentCatalog` exported as a pure function that turns `llms-full.txt` into items — the component never makes a network request and never assumes a file exists.
  - **IssueReporter** (forms/advanced) a GitHub issue draft builder: a form collects values, a template pure-function renders Markdown, and back come a structured draft plus a prefill link. **When the link grows too long it falls back to copying the Markdown** — the check measures the whole URL rather than just the body, because one CJK character is nine characters once percent-encoded, and measuring only the body misses long titles. It never calls the API and never holds a token.

  All seven read their built-in copy through the `ConfigProvider` locale SSOT, while keeping their own `labels` / `text` prop as an override.

### Patch Changes

- 899ff6d: AI distribution artifacts gain a machine-readable source of truth for props, closing three potholes that forced every consumer to write their own parser (#102 #103 #104 #105)

  Hulian treats AI consumption as a first-class audience, but the structure stopped at markdown: `registry.json` had name / description / categories / exports / types and **no props at all**. Anyone wanting constrained generation — letting a model emit only whitelisted components with legal props — had to parse the documentation tables, so the same potholes were walked into again and again.

  **New artifact `llms-props.json`** (383 components / 3039 props):

  ```jsonc
  {
    "version": "…",
    "typeAliases": { "StackDirection": ["row", "column"], … },   // 143 literal-union aliases
    "exportIndex": { "IPhone": "iphone", "BarChart": "chart", … }, // 796 export names to components
    "components": [{ "slug": "button", "import": "…", "exports": [...],
                     "props": [{ "name": "size", "kind": "enum",
                                 "values": ["sm","md","lg","icon","iconSm","iconLg"],
                                 "valueType": "string", "default": "\"md\"", … }] }]
  }
  ```

  `kind` covers enum / union / boolean / number / string / node / function / array, `valueType` separates `level={1}` from `level="1"`, and a mixed union such as `StackDirection | ResponsiveDirection` still reports `"row"` / `"column"` — "other shapes are also accepted" should not make two known values disappear.

  Fixed along with it:

  - **#102 escaped pipes**: the union separator in the type column exists in three spellings across the docs (full-width, half-width, and the GFM-escaped form in 404 files). Splitting a row on a bare pipe shifts every column, leaving an enum with only its first value and garbage in the default and description columns. The Props / Events / Slots tables in the AI artifacts (`llms-full.txt` and `d/<slug>.md`) are now rewritten into one consistent GFM-escaped spelling. **The English artifacts cannot use the full-width form** — that gate forbids CJK — so "just standardize on one character" was never available; the real answer is the JSON above, and the markdown only guarantees that it is legal and consistent.
  - **#103 aliases not expanded**: the type column said `StackDirection` while nothing in the docs gave its values, so an AI could only guess `direction="horizontal"` and then **silently get nothing** — no error, just the wrong layout, which is harder to find than a crash. Literal unions are now pulled out of `*.types.ts` with the compiler AST and expanded in place into `"row" | "column" | ResponsiveDirection`. Non-literal aliases (object-shaped ones like `ResponsiveDirection`) stay as they are.
  - **#104 title is not the export name**: `# iPhone` (the real export is `IPhone`), `# Chart` (really `AreaChart` / `BarChart` / …), `# Resizable` (`ResizablePanelGroup` / …). Each component in the artifacts now carries an `Exports` line sourced from the barrel, so consumers no longer parse the import code block to work it out.

  `llms.txt` now points consumers doing constrained generation straight at the JSON instead of the tables.

- 4771326: Fixes #89: 45 components gain `memo`, clearing the avoidable-render blind spot in one pass

  `avoidable-render` is the only absolute-threshold rule in the runtime performance gate (anything above 0 is an error), but CI only scans "scenarios this change touches", and the scheduled branch only ran 4 React 18 compatibility scenarios — so **a component nobody touches never has its violation found**, until someone edits it (even just swapping an image in its showcase) and CI suddenly goes red as if this change caused it.

  The first full scan (373 runs) surfaced **45 components** at once, all fixed with the existing `Button` / `Checkbox` / `Chip` prescription (`XxxImpl` plus `memo(XxxImpl)` and two `displayName`s), each with a Profiler regression test — remove the `memo` and it goes red.

  Components: AgentPlan, Alert, Annotation, Avatar, AwardBadge, Breadcrumb, ChatMessage, Citation, CodeBlock (with HighlightedCode), ColorField, CreditCard, DeployStatus, Descriptions, DiffStat, Dossier, Dot, EventStream, FileTree, Funnel, GitCommit, Heatmap, IconPicker, InputOTP, JsonViewer, Kbd, Link, LivePlayer, LiveProductCard, Meter, NumberField, Rating, ScoreRing, SecretField, Skeleton, Slider, SocialButton, Snippet, Stat, Statistic, StatusDot, Steps, Switch, Tag, TimeField, Timeline.

  The public API is unchanged: export names, types, compound parts (`Statistic.Countdown`) and every named pure-function export stay as they were. `Funnel` is generic, so `memo(FunnelImpl) as unknown as typeof FunnelImpl` keeps its signature.

  Three facts confirmed during the work, recorded so nobody has to rediscover them:

  - **CodeBlock needed two layers.** The root `memo` only blocks parent updates; the copy button's `copied` state travels its own path, so every click re-tokenized the whole snippet and rebuilt every `<span>`. `HighlightedCode` is memoized too.
  - **FileTree is memoized at the root, not per row.** A row receives a `toggle` arrow function built fresh each render, and `expandedSet` is a fresh Set whenever controlled or searching, so a shallow compare always fails — memoizing rows is pure loss, while memoizing the root skips the entire subtree.
  - **Counts in a finding are not comparable across components.** The gate only counts fibers whose `event.name` equals the component name, so child components never enter the count; and only components with `controls: []` name their stress step `stress:stable-parent-update`, which is then collected as well. So "42" versus "2" is not a tenfold difference in severity, only a difference in whether the component has controllable props.

  Verification cleared 5 more (the new IssueReporter / InspectorPanel / ComponentPicker, plus Empty / Legend which the first pass missed).

  **Two more full re-runs each caught another batch**: first `Brand` / `ScopeMatrix` / `Stepper`, then `Heading` / `Text` / `GridPattern` — six components that never had `memo` at all, fixed with the same prescription and each given a guard. `Heading` and `Text` are generic and polymorphic, so they borrow `Funnel`'s `as unknown as typeof XxxImpl` assertion to keep `as` inference intact.

  They escaped the first 45 because **the rule itself is unstable**. Three measured findings, written here so the next person does not doubt themselves:

  - The same code, run four times on the same scenario, yields **3 / 1 / 0 / 1** findings. It counts renders that React reports as "this commit changed no props, state or hooks", and that judgement drifts with scheduling and load.
  - Two full scans produced **almost disjoint** sets of components (first Brand/Kbd/ScopeMatrix/Stepper, then Dossier/GridPattern/Heading/Kbd/Text) — each run samples a few out of the pool.
  - **It also fires on correctly memoized components**: `Kbd` and `Dossier` both have `memo` (proven by their guards and by the global negative sweep) and were still reported with 2–3.

  The matching fact: **306 of the 380 components have no `memo` at all**, by design — only leaf-shaped components whose props are stable primitives earn one. So "zero findings on one full scan" is neither reachable nor a sensible release criterion; the meaningful criterion is **to look at each reported component and ask whether it has `memo`** — add one if not (six were added here), and treat the rest as false positives.

  In CI the full sweep only runs on a schedule (pull requests and pushes scan affected scenarios), so it does not block a release; the scheduled branch will go red intermittently, which needs its own decision about the rule or the threshold.

  The blind spot itself is closed too: the scheduled trigger gains a `Weekly structural sweep` that runs the full inventory instead of only the 4 compatibility scenarios.

  Guard tests are unified behind `expectMemoSkipsSubtree` in `packages/ui/test/memo-guard.tsx`, whose criterion now has two layers (#106):

  1. **A structural assertion** with no timing in it: the element's type must really be produced by `memo`, so deleting the `memo` fails deterministically.
  2. **A behavioral assertion** whose denominator is no longer React's `baseDuration` — that is the **cold** mount estimate which stops updating once memo bails, making the ratio drift with where the test sits in the file. It is now measured live in the same test: give the element a `data-memo-probe` that changes every round, and the shallow compare is guaranteed to miss. With memo working the ratio measures 0.01–0.19; with memo gone it is about 1.0, so the two clusters sit a factor of five apart and a 0.5 threshold leaves better than 2× of headroom on both sides — no more per-component coefficients.

  All 64 guard files (including the 6 that previously wrote their own inline criterion) now share this one. The global negative sweep — replacing `React.memo` with the identity function — turns **64 of 64 files and 77 of 77 assertions red with no false greens**, and every failure is a guard case with no collateral.

- 899ff6d: Fixes the English gaps and the static-export blocker in four design-tooling components (finishing #91, #92 and #96)

  All of these only surface when the full gate suite runs, and they came out together while catching up on the build and browser gates.

  **InspectorPanel and IssueReporter did not localize their built-in presets**

  - The five preset schemas returned by `inspectorSections()` hardcoded 51 Chinese field labels and enum options. Without a `sections` prop that is exactly what the panel renders, so an English consumer got a screen full of Chinese labels.
  - The three templates in `BUILTIN_ISSUE_TEMPLATES` had the same problem: field labels and the section headings produced by `toMarkdown` were all Chinese, and those strings **end up in the issue body submitted to GitHub**.

  The copy for both now lives in the locale SSOT in `config/locale.ts` (`inspectorPanel.presets` and `issueReporter.templates`), and the components read it from the active `ConfigProvider`. Two new pure functions, `buildInspectorSections(text)` and `buildIssueTemplates(text)`, are exported for direct use; the existing named exports (`layoutFields`, `colorFields`, `typographyFields`, `borderFields`, `effectsFields`, `BUILTIN_ISSUE_TEMPLATES`) stay as the Chinese defaults so existing code behaves the same. The second argument of `inspectorSections(categories, text?)` is optional and still defaults to Chinese.

  Those two English pages rendered 195 pieces of Chinese residue between them (as counted by the `docs:i18n:output` gate); it is now zero.

  **A PreviewSandbox example broke the static export**

  To demonstrate the error boundary, the "same-document mode" example had a child `throw` during render. The docs site is `output: "export"`, so every page is prerendered at build time, and **an error boundary only catches on the client** — the whole `/components/preview-sandbox` page failed to export and the build stopped. Neither the unit tests nor a real browser could see it, because both of those have a boundary in place.

  The throw now happens on a click (the iframe demo likewise): the page loads with the subtree rendering normally, and one click takes it into the error state. That solves a second problem too — when it threw automatically React still reported the error to `window`, and the English showcase browser gate counts a `pageerror` as a failure (a normal page load should not emit an uncaught error; Playwright also attributes errors inside an iframe to the host page).

  A new guard, `src/showcase/ssr-safety.test.tsx`, pushes every example and state of all 380 showcases through `renderToStaticMarkup`, so anything that throws during server rendering fails immediately. It moves "find out ten minutes into a build that a page cannot be exported" down to seconds.

  **Also**: the English catalog was missing all seven of these components in `apps/www/i18n/component-meta.en.ts`, so neither the English component index nor the in-site search could find them. With them added the English catalog returns from 371 entries to the same 378 as Chinese. And `stepper.tsx` opened with `"use client"` twice; one has been removed.

- 899ff6d: Fixes #108: Meter's value text no longer treats the raw `value` as a percentage

  The indicator width was always computed as `(value - min) / (max - min)` and was correct, but the text rendered by `showValue` and the `aria-valuetext` came from Base UI's default, which is **the raw value with a `%` appended**. So whenever `max` was not 100, the bar and the number in the same component contradicted each other:

  ```tsx
  <Meter value={1041} max={1324} label="Linked to textbook" showValue />
  // bar at 78.6%, text on screen reads "1,041%", aria-valuetext="1041%"
  ```

  The whole point of `max` is a scale that is not out of 100, so `showValue` had only ever been right when `max === 100`. The `aria-valuetext` was the worse half: `MeterProps` does not spread native attributes, so the visible text could at least be worked around by computing it into `label`, while what a screen reader announced was **beyond any consumer's reach**.

  - The text is now computed by the component: normalized to 0–100 and rendered on the same footing as the indicator, with at most one decimal (`1041/1324` reads `78.6%`, `50/200` reads `25%`)
  - `getAriaValueText` makes `aria-valuetext` say the same sentence — what is seen and what is heard are not allowed to be two different things
  - `aria-valuenow` / `aria-valuemin` / `aria-valuemax` still report the raw values
  - An out-of-range value is clamped to 0–100% in the text only, while `aria-valuenow` reports it honestly (out-of-range data belongs to the data layer; the component does not paper over it)
  - `max === min` no longer produces `NaN`

  New `formatValue`:

  ```tsx
  <Meter value={1041} max={1324} label="Linked to textbook" showValue
         formatValue={({ value, max }) => `${value} / ${max} questions`} />
  ```

  The returned string drives both the visible text and `aria-valuetext`, so they cannot structurally disagree. `percent`, already normalized and clamped to 0–100 and not rounded, comes along too.

  The documentation gained three facts that previously required reading the source: `label` is the **only** way to give `role="meter"` an accessible name (a heading you render yourself is never associated through `aria-labelledby`); Base UI's Root always appends a visually hidden `<span role="presentation">x</span>`, which collides with assertions that read the whole tree's `textContent`; and how out-of-range values are handled. The showcase gained a `formatValue` example — and, for the record, the existing "custom range" example already described itself as "the value follows the ratio", which the component simply was not doing.

- 899ff6d: Fixes #107: an optional prop set to `null` no longer throws a TypeError

  A destructuring default only applies when the value is `undefined`; `null` lands in the function body untouched. So `<Stack direction={null}>` crashed inside `directionClass` (`typeof null === "object"`, so null fell into the responsive branch):

  ```
  TypeError: Cannot read properties of null (reading 'base')
  ```

  This is not something "callers should just not pass null" settles. Hulian treats AI consumption as a first-class audience, and **any consumer that renders structure produced by an LLM will meet a model writing "unset" as `"direction": null`** — the most natural spelling in JSON. The reporter's DSL generation platform had an entire subtree swallowed by an ErrorBoundary exactly this way.

  The whole library was swept for the same defect class, and 22 props across 19 components now fall back:

  - **Responsive and object shapes**: `Stack.direction`, `Grid.cols`, `Tree.virtual` — the three direct victims of a `typeof x === "object"` branch
  - **Array shapes**: WorldMap (`dots`/`points`), BeianFooter (`icp`), FlyingPosters (`items`), ScrollVelocity (`texts`), BounceCards (`images`), Folder (`items`), Cascader (`defaultValue`), Listbox (`defaultSelectedKeys`/`disabledKeys`), Transfer (`defaultTargetKeys`), Scheduler (`resources`), InfiniteMenu (`items`), FallingText (`highlightWords`), VoiceRecord (`levels`), StaggeredMenu (`items`/`socialItems`), GridMotion (`items`), ScopeMatrix (`suggestions`), Tree (three `defaultXxxKeys`)

  Each one carries a regression test: passing `null` does not throw, and the result matches not passing the prop at all. Run that batch against the code as it was and it reproduces the reported `Cannot read properties of null (reading 'base')` exactly.

  **The boundary drawn for this pass**: only crashes are eliminated. Boolean and string defaults (`selectable = true`, `variant = "solid"`, more than 430 of them across the library) still degrade `null` into a falsy value rather than falling back to the default — that does not crash, it just behaves differently from omitting the prop. Normalizing all 430 is a decision of a different magnitude and was not smuggled in here. Consumers constructing props straight from LLM output should keep dropping keys whose value is `null` in their validation layer.

## 0.25.2

### Patch Changes

- `Chip` no longer re-renders its subtree on a stable parent update. <!-- parity-id: memo-chip -->

  Chips travel in groups — filter bars, tag lists, token inputs — and a dozen of them on one list page is normal. `Chip` used to be a plain function component, so every parent render recomputed the whole row's cva recipe and `cn` merge, even though these call sites pass almost nothing but primitive props (`tone` / `variant` / text children) whose references never change and which React still cannot bail out of on its own.

  `Chip` now takes the same prescription as `Button` / `Checkbox`: a `memo` wrapper. The runtime performance gate (Hulian Scan) measures `avoidable-render` in the `chip/basic` scenario dropping 5 → 0, and a new Profiler regression test in `chip.test.tsx` locks the behavior in (remove the `memo` and it goes red).

## 0.25.1

### Patch Changes

- 6fdcfe1: Every remote placeholder image in the components and their showcases is now a procedurally generated data-URI SVG, with a gate to keep it that way.

  `DecayCard`'s `image` **default prop** used to be `https://picsum.photos/...` — a consumer rendering `<DecayCard />` with no props fired an outbound request, and the image broke on an offline machine, an intranet, or behind a firewall. The same pattern was scattered across the ImageViewer / InfiniteMenu / FlowingMenu / Upload / Table / Chip showcases, 13 places in total. The demos have long had an "all assets local, zero external links" rule enforced by `demos:coverage`, but that gate does not reach `packages/ui`; CircularGallery was fixed once on its own and nobody swept the rest.

  New `demoImage(seed, w, h)` in `lib/demo-image.ts`: a deterministic hash picks a gradient and returns an SVG data-URI — no network request, and SSR and hydration resolve to the same image. New `scripts/no-remote-assets.test.mjs` guards it by failing on known image hosts; it caught two more `pravatar.cc` avatars the moment it went in.

  Also fixes the `ImageViewer` examples: `render` used to return a `<span>` masquerading as a button plus a viewer pinned at `open={false}`, so **the example could not be opened and no image ever appeared** — while the `code` next to it showed the interactive version (breaking the one-to-one contract between `code` and `render`). It now uses the `Demo` component that was already written in that file but never wired up.

- 6fdcfe1: `ScrollReveal` no longer breaks inside a scrolling container.

  `useScroll({ target })` listens to window scroll by default. Once the component sits inside an inner scroll area (the docs site's `<main class="overflow-auto">`, a gallery preview box, a drawer, a popover), scrolling that container never fires a window scroll and progress **stays at 0 forever** — and 0 progress is exactly the "`baseOpacity` + blur" initial state, leaving the whole paragraph nearly invisible. That is worse than no animation, and since the docs site itself is laid out this way, everyone reading the docs saw the broken state.

  It now detects the nearest scrollable ancestor automatically, accepts an explicit `scrollContainerRef`, and falls back to an in-view entrance when there is no scroll context at all, so the text is always readable. `ScrollFloat` already had this logic (its comment reads "fixes the gallery stuck-at-0-progress trap"); it is now extracted into a shared `useScrollContext` so a third component cannot repeat the mistake.

- 6fdcfe1: Fixes [#88](https://github.com/hulianui/hulian/issues/88): an answer blank **inside** `$…$` no longer paints the whole segment red.

  0.25.0 only handled `____` outside a segment; inside, it went to KaTeX verbatim, raising `Expected group after '_'` and turning the entire stem red. Yet `math.md` claimed blanks were "recognised inside and outside delimiters alike" — the example it gave happened to be the outside case, so the promise never matched the implementation, and the tests only covered outside too. A consumer's 17 exam artefacts contain 21 blanks that sit inside a segment (`$\overrightarrow{AC}=___$`, `$E(X)=___$`, `$\theta=_______$` …); that is ordinary content, not dirty data. MathText did support blanks in 0.24.0, so **this was a regression introduced by upgrading**.

  Inside a segment the blank is now substituted with `\rule` rather than splitting the segment apart: splitting would cut `\frac{___}{2}` into the two invalid fragments `\frac{` and `}{2}`, and both would render red. Substitution keeps the formula structure intact, so a blank works in a numerator or under a radical.

  **The two paths are implemented differently and their accessibility behaviour differs, which is now documented**: outside a segment the blank is real DOM carrying an `aria-label` (a screen reader announces "Blank"); inside, KaTeX draws it and there is nowhere to hang aria, so a screen reader reads the MathML. Put the blank outside the `$` when you need it announced.

## 0.25.0

### Minor Changes

- 4b7c80f: **BREAKING: MathText is retired and QuestionCard moves to `@hulianui/ui/math`.**

  MathText assembled inline mathematical layout out of CSS (`inline-flex` for stacked fractions, `border-t` as the radical's vinculum), and what it drew was wrong: `√` was a fixed-height character while the vinculum was a sibling box's border, so as soon as the radicand carried a superscript (`\sqrt{a^{2}+b^{2}}`) the rule no longer met the radical and the trailing exponent hung outside it; arcs and hats did not stretch to their content, so an arc that should span both letters of AB was drawn as a hat sitting on the A. These are inherent limits of CSS assembly — fix one and the next surfaces. And its original selling point, dependency-free layout that "does not disturb CJK line height", holds equally under KaTeX as measured. That difference was never real.

  Mathematical rendering now goes through the KaTeX-powered `Formula` alone.

  Migration:

  | Before                                        | Now                                                                                 |
  | --------------------------------------------- | ----------------------------------------------------------------------------------- |
  | `import { MathText } from "@hulianui/ui"`     | `import { Formula } from "@hulianui/ui/math"`                                        |
  | `import { QuestionCard } from "@hulianui/ui"` | `import { QuestionCard } from "@hulianui/ui/math"`                                   |
  | `<MathText>{stem}</MathText>`                 | `<Formula>{stem}</Formula>`                                                          |
  | `mathToPlain(src)`                            | Same name, same meaning, imported from `@hulianui/ui/math`                            |
  | `parseMath` / `parseMathDocument`             | No longer exported (KaTeX owns layout now)                                            |
  | `delimiters={true}`                           | Not needed: `mixed` reads `$` by default and falls back to bare-notation splitting     |
  | `scriptScale`                                 | Removed (script sizing follows TeX's rules)                                           |

  QuestionCard changes subpath because its stem and options are Formula internally; leaving it in the main barrel would drag KaTeX into every `@hulianui/ui` consumer's bundle. The main entry still pays nothing for KaTeX.

  Formula gained two capabilities in order to take over the question-bank case:

  - **Bare-notation fallback** — when the whole string contains no matched delimiter, it carves out `\frac{3}{8}`, `x^{2}`, `\angle ABC` and hands them to KaTeX, emitting everything else as text. Stems straight out of PDF/Word/OCR no longer have to be wrapped in `$` first. The test is "no `\`, `^`, or `_` means it is not a formula", so `P(2,3)` and the option label `A.` stay text. New pure functions: `splitBareMath` / `hasBareMath`.
  - **Answer blanks** — `____` renders as a writable slot (new `blankWidth` prop, default 2.5em), recognised inside and outside delimiters alike, and announced as "Blank" by screen readers instead of a run of underscores.

  Two things look different, and both are fixes rather than regressions: variables render in italic as TeX prescribes, and formulas are about 1.21× the size of surrounding prose.

### Patch Changes

- 4b7c80f: Fixes a batch of machine-translation errors on the English site and gives three gates a real criterion.

  **English copy** (23 entries, each verified against the component that consumes it). The label for a mathematical *fraction* was translated as Score — yet its only two consumers are math and question-card, both mathematical contexts, where the right word is Fraction. The employee-number field was Job number (should be Employee ID); the examinee-count label was read as a "reference number" (should be Examinees); a battery-level label became Power (should be Battery); a grade-band label was literally rendered "Level belt" (should be Grade bands); diff-stat's added/removed **lines** of code were translated as table rows; badge's dot-only, divider's divider-only, and color-field's no-swatch labels were all literal transliterations; and heading's six levels mixed three different renderings (First level title / Level 3 heading / Sixth level title), now unified as Heading level N.

  **Gates**:

  - The `files` block of the English copy table was not covered by the "non-empty / CJK-free / preserves protected tokens" assertion, which only walked `exact` — yet per-file overrides are the only way to translate one Chinese term differently per component, so that batch sat outside quality control entirely. Widening the assertion immediately caught a translation that had dropped the `PDF/Word/OCR` identifier.
  - The picker subtree-skip test asserted on **wall-clock** time (`< max(0.5ms, base * 0.1)`). With memo in effect the measured value is 0.004–0.008ms against a baseDuration of 1.3–10ms; even with a hundredfold margin it went red intermittently, because one scheduling delay under a parallel test run is measured in milliseconds. It now asserts structurally (the component really is wrapped in memo) plus a minimum across repeated samples, which is immune to load.
  - The `advisories` count was pinned as an absolute number in a test, so any component added or removed knocked it over. It is now a proportional floor against the component-doc count, guarding "the extraction pipeline still works" rather than one particular number.

  Separately, the unit-test timeout goes from the default 5s to 15s (the slowest case takes 1.4s alone and 5.4s under a parallel run, right at the limit), and `pnpm readme:sync` is added to sync the component and demo counts in the READMEs — previously there was a check but no way to fix it other than editing five places by hand.

## 0.24.0

### Minor Changes

- 2764188: Adds Formula (`@hulianui/ui/math`), KaTeX-powered two-dimensional mathematical layout; MathText gains `delimiters` for `$…$` boundaries <!-- parity-id: katex-formula-subpath -->

  **A new component on its own subpath** — [#87](https://github.com/hulianui/hulian/issues/87)

  MathText deliberately drew a dependency-free boundary: `\begin{cases}` is flattened onto one line, `\\` becomes a semicolon, `\left…\right` loses the command and keeps a fixed-height bracket, and the docs said "bring your own KaTeX." The trouble is that this sentence means every downstream question-bank or courseware product wires KaTeX up again from scratch: its own delimiter splitting, its own copy of the KaTeX CSS, its own trip through the SSR pitfalls. A consumer measured 1324 ingested questions and found 23 `\begin{...}` environments, 78% of them `cases` — piecewise functions are the workhorse of senior-high function questions, not a long tail, and the flattened `f(x)=x, x<0; -x, x≥0` no longer reads as a piecewise definition at all. An unreadable stem makes the question worthless.

  ```tsx
  import { Formula } from "@hulianui/ui/math";

  <Formula>
    {"$$f(x)=\\begin{cases} -x^{2}-2ax-a, & x<0 \\\\ e^{x}+\\ln(x+1), & x \\geq 0 \\end{cases}$$"}
  </Formula>;
  ```

  It ships on a subpath rather than in the main barrel because KaTeX costs 86KB gzip of JavaScript (measured by the bundle-size gate) plus a stylesheet and fonts: **MathText's consumers should not pay for capability they never use**, while pages that need heavyweight layout were always willing to. The component imports its own styles, so there is no CSS to add in your app entry; it carries no `"use client"`, and `katex.renderToString` is a deterministic pure function, so it works directly inside RSC.

  Alongside it: `splitMathSegments` (splits prose into spans — this is what a Word/OMML export pipeline needs) and `formulaToPlain` (searchable plain text). Broken data renders in two tiers: an unrecognised control sequence is highlighted in place and shown verbatim without disturbing the layout around it, while a whole-expression parse failure renders the entire source in red.

  **MathText gains `delimiters`**

  It recognises `$…$`, `$$…$$`, `\(…\)`, and `\[…\]`; once enabled, **only content inside the delimiters is parsed as mathematics, and everything outside is emitted verbatim as plain text**.

  This fixes the rendering layer polluting the data SSOT: because the rendering layer did not understand `$`, upstreams had no choice but to strip it at ingest time — and stripping `$` is lossy. `$\{a_n\}$` becomes `{a_n}`, after which nothing distinguishes a set from a LaTeX group; fed to an LLM, formulas and prose fuse into one blob; and a Word export cannot convert a formula span it cannot cut out. Boundaries are information that must be carried explicitly, not guessed at by the rendering layer and certainly not deleted upstream.

  It defaults to `false` so existing behaviour is untouched — once enabled, the two dollar signs in `sells for $100, costs $80` pair up as delimiters, so do not enable it when prose contains monetary amounts. A string with no matching pair falls back to the existing behaviour, so a partially migrated question bank never renders a whole stem as raw `\frac`. `mathToPlain` accepts `{ delimiters }` too, and the indexing side must be given the same value the rendering side gets.

## 0.23.0

### Minor Changes

- RadarChart can turn its radius axis off; fixes for Banner overflowing long copy, SearchForm collapsing on narrow screens, MathText relation spacing and unparsed `^\circ` <!-- parity-id: radar-radius-axis-and-mobile-fixes -->

  **RadarChart gains `radiusAxis`** — [#86](https://github.com/hulianui/hulian/issues/86)

  The radius-axis tick numbers used to render unconditionally with no way to reach them from `className`, so consumers could not turn them off. They are drawn **inside the plot area rather than outside it**: the tick anchors spread along a horizontal radius running from the center of the radar to its edge, and recharts rotates each number 90° so it reads vertically. With many series or densely filled data, the first few ticks land entirely inside the data polygons — covering the shape and hard to read at the same time.

  echarts' radar defaults `axisLabel.show` to `false` and draws only the grid rings and angle labels, so those numbers never existed in the original chart. They came along by default when the chart was ported to recharts: nobody asked for them and nobody could switch them off.

  ```tsx
  // Keep only the grid rings and angle labels (what echarts' radar renders by default)
  <RadarChart radiusAxis={false} data={data} series={series} xKey="indicator" legendScroll />
  ```

  The default stays `true`, so existing layouts are untouched. The `RadarChartProps` type is now exported as well.

  **Banner overflowed with long copy and pushed its action off screen**

  The copy node was `<span className="truncate">`, and `truncate`'s `overflow:hidden` and `text-overflow:ellipsis` **do not apply to inline elements** — only `white-space:nowrap` survived. The text therefore neither wrapped nor got clipped: it stretched the flex container sideways and pushed the `action` button out of view, most visibly on narrow screens. Adding `block` is what makes the ellipsis actually take effect. Every Banner carrying long copy was affected, not just mobile.

  **SearchForm collapsed into itself on narrow screens**

  `gridTemplateColumns` was hardcoded in an inline style with no breakpoint, so a 390px phone still split the row into `columns` (3 by default) tracks of roughly 120px each. Once a label and its control were squeezed in, the fields and the action area overlapped. Inline styles also outrank utility classes, so consumers could not override it either.

  The column count now comes from a CSS variable and collapses to a single column below `sm`. Child `colSpan` values are forced to `col-auto` at the same breakpoint — in a single-column grid `span 2` is not clamped to 1, it creates an implicit column and overflows even further. Desktop rendering is unchanged.

  **MathText left uneven space around relation symbols**

  `A \Rightarrow B` rendered as `A ⇒B`: the space after a command name is consumed as its terminator, while the literal space on the left survived. The fix is not to preserve the authored spaces — that would make the gap depend on whether the author typed one — but to apply symmetric spacing per TeX symbol class at render time. A new op node distinguishes `relation` (= ≠ ≤ ⇒ ∈ ⊥ …) from `binary` (× ÷ ± ∪ …), while prefix notation (∠ △ ⊙ ∴ …) still hugs whatever it marks, so `∠ABC` is never pulled apart. Classes are registered **by character** rather than by command name, so `\neq` and a raw `≠` straight from upstream OCR get identical treatment. Unary uses of `±` and `∓` (`±3`, `(±3)`) fall back to hugging.

  **MathText never parsed `^\circ` or `_\alpha`**

  The single-token shorthand for `^` and `_` accepted only a single character, never a command: `90^\circ` came out as the literal `90^\circ`, while `90^{\circ}` worked. `90^\circ` is the most common way to write degrees in LaTeX (two fewer braces), and `\circ` ranks third in the measured frequency table for middle-school question text — so raw notation leaked onto the page, which is exactly what this component exists to prevent. Now `90^\circ` renders as `90°`, the superscript in `x^\alpha b` consumes only `\alpha` (`b` stays body text), and unknown commands are still preserved verbatim rather than swallowed (`x^\oiint`).

  **⚠️ `mathToPlain` output has changed**

  Spaces around relation symbols are now normalized away, matching the compact convention that was already in place:

  ```
  mathToPlain("A = B")            // was "A = B"    -> now "A=B"
  mathToPlain("3 \\times 4 = 12") // was "3 ×4 = 12" -> now "3×4=12"
  ```

  The old behavior put a space to the left of `\times` but not to the right, so it was asymmetric to begin with, while `mathToPlain("x\\neq 0")` -> `"x≠0"` has always been compact. If anything downstream feeds `mathToPlain` output into full-text search or text comparison, it needs to be updated. The rendered spacing lives only in the DOM and never reaches the plain-text form.

  **ButtonGroup documents a pitfall about equal member heights**

  Attaching works by pulling each neighbor over with `-ml-px` so their borders overlap, and that seam assumes every member is the same height. In Button's size scale, `icon` (36px) **has no text size that matches it** — the text sizes are `sm` 32, `md` 40, and `lg` 48 — so `size="icon"` misaligns against any button with a label. The classic case is a `−/value/+` stepper. To mix them, use a matched pair: `iconSm` (32) with `sm` (32). You cannot spot this by reading the code: all three buttons look perfectly tidy, and only rendering reveals that the middle one is 4px taller.

## 0.22.0

### Minor Changes

- a6249c8: MathText covers senior-high notation: vector arrows, blackboard-bold number sets, set and logic symbols, LaTeX escapes

  The previous symbol table was built from command frequencies in 22,000 characters of **middle-school** question text. The method was sound; the sample was too narrow. A consumer redid the count over 1,324 questions (stems plus explanations, spanning primary through senior high), where vector, set, and logic notation dominate and barely appear in middle-school samples — so all of it fell outside the table and rendered as raw backslashes on the page.

  **Vector arrows `\vec` and `\overrightarrow`** — [#83](https://github.com/hulianui/hulian/issues/83)

  These two appear 282 times combined, third in the whole frequency table and 56 times more often than the already supported `\overline` (5). `DECORATE_COMMANDS` previously had only `overline` and `hat`; a miss fell through to literal output — correct in itself, and consistent with "never swallow unknown notation," except that these two should have been known.

  A new `arrow` style handles both. **The arrow width follows the content**: the shaft is a stretchable border and the head is a non-distorting SVG, so `\vec{a}` is short while `\overrightarrow{AB}` covers both letters. TeX gives `\vec` a fixed narrow arrow and reserves full width for `\overrightarrow`; that difference is flattened deliberately, because both mark a vector in question text and the width carries no information, while following the content lets `\vec{AB}` cover its letters. The arrow is an absolutely positioned overlay and **does not increase line height**, so like fractions it leaves surrounding line spacing intact.

  ```tsx
  <MathText>{"Given \\overrightarrow{AB} is collinear with \\vec{a}"}</MathText>
  ```

  **`\mathbb{}` maps to blackboard bold rather than being unwrapped** — [#84](https://github.com/hulianui/hulian/issues/84)

  `\mathbb{R}` becomes ℝ, with all 26 capitals covered (C/H/N/P/Q/R/Z use the BMP letterlike symbols; the rest fall in the SMP mathematical alphanumerics). Unwrapping to a bare letter was rejected on purpose: the set of real numbers and a variable named `R` are different things, and collapsing them makes "the domain is ℝ" read as "the domain is R" with no visible sign that information was lost. Characters outside the table are kept as written one by one, so `\mathbb{R+}` yields `ℝ+` instead of giving up over a single `+`.

  **LaTeX escapes `\{` `\}` `\%` `\$` `\&` `\#` `\_`**

  Set-builder notation such as `\{x \mid x>0\}` previously showed its braces with the backslashes attached; adding `\mid` alone would not have helped while both sides still leaked. Unlike the symbol table, escapes are a **finite closed set** rather than a long tail, so all of them are covered at once instead of being filtered by frequency.

  **Other commands added by measured frequency**

  `\Leftrightarrow ⇔` (biconditional, 10) · `\to →` (limits, 4) · `\mid ∣` (set-builder, 4) · `\backsim ∽` · `\varphi φ` · `\Gamma Γ` · `\langle ⟨` and `\rangle ⟩` (inner products) · `\forall ∀` · `\frown ⌢`.

  Two commands that take arguments are new as well. `\underline{}` underlines existing content, which is a different thing from an answer blank (that one is an empty slot). `\overset{}{}` places a mark above the content, so `\overset{\frown}{AB}` is arc AB — the canonical way to write an arc. `\frown{AB}` means "arc symbol followed by a group" in LaTeX and still renders literally as `⌢{AB}`; looking wrong is the intent, and better than guessing a meaning the source never expressed.

  The mark above `\overset` is **kept** by `mathToPlain` (`⌢AB`), unlike `\overline` and `\vec`. Those are pure decoration lines with no corresponding character, whereas an overset mark is meaningful content that search would otherwise lose.

  **Three items in the report do not hold**

  `\Rightarrow` (52), `\mathbf{}` (8), and `\quad` (8) **were already supported in 0.20.0**, verified one by one. The report also warns that unwrapping `\mathbf{}` must respect command boundaries, since `\cdot\mathbf{b}` would collapse into a nonexistent `\cdotb`. That hazard does not exist here: the parser consumes commands left to right rather than substituting strings, so `\cdot` has already become `·` before `\mathbf` is reached. It is a hazard for consumers doing string replacement in their own ingestion pipeline.

  **A performance problem fixed along the way: `MathText` is now `memo`ised**

  `MathText` re-parses the entire question string on every render, and it was not memoised — so any unrelated update in an ancestor (filtering, pagination, selection state on a question-bank page) re-parsed every one of the dozens of instances on screen. The performance scan measured 3 avoidable renders in the "parent updates, props unchanged" step; memoisation brings that to zero. All props are primitives (`children` is a string), so a shallow comparison suffices, and `locale` comes from context, so switching languages still updates. `Markdown` in this library has worked this way for a long time; this brings `MathText` in line.

  **A documentation defect fixed along the way**

  The Chinese docs for `MathText` and `QuestionCard` titled their pitfalls section with a shorter heading than the one the conventions generator recognizes. As a result the Chinese pitfalls for these two components **never reached `conventions.json`** — the English side was complete all along, while the Chinese side had zero entries, so Chinese users querying conventions through MCP could not see them. The heading is now consistent with the other 369 components.

## 0.21.0

### Minor Changes

- 61b47ea: Three cases of "following the docs still gets it wrong": Navbar's center section actually centers, polar chart legends can be turned off, TreeSelect can select intermediate levels

  What the three issues have in common is that **nothing throws**: you write it the way the documentation says, the result is wrong, and it looks like your own mistake.

  **Navbar: `NavbarBrand` now grows by default (default behavior change)** — [#81](https://github.com/hulianui/hulian/issues/81)

  `NavbarContent justify="center"` was not actually at the center of the navbar. The cause was asymmetric flexibility across the three sections: `NavbarBrand` was `shrink-0` while the two `NavbarContent` sections each took `flex-1` and split the **remaining** space, so the center section was only centered within its own share and the whole thing drifted left as the brand name grew (measured 265px off-center at 1440 wide with a 100px brand). The longer the brand, the larger the drift — the same code lands differently on each tenant's site.

  `NavbarBrand` now defaults to `flex-1 basis-0`, so all three sections are equal. Brand content still hugs the left via `justify-start`, and flex items default to `min-width: auto` so it will not be squeezed — **the brand and end sections look unchanged**; what changed is that the middle section now truly lands at the center.

  One layout does change: **a brand followed by `justify="start"` content that hugs it** (with no center section). Equal thirds push that content to the 1/3 mark. Pass `grow={false}` for that layout to restore the previous behavior:

  ```tsx
  <Navbar>
    <NavbarBrand grow={false}>Hulian</NavbarBrand>
    <NavbarContent justify="start">…</NavbarContent> {/* still hugs the brand */}
  </Navbar>
  ```

  Truncating the brand area on narrow screens still requires `min-w-0` alongside `truncate` (to release the flex item's `min-width: auto`); that has not changed.

  **Chart: `RadarChart` / `PieChart` / `RadialChart` gain `legend`, and all six gain `legendScroll`** — [#80](https://github.com/hulianui/hulian/issues/80)

  After 0.19.0 added `legend` to Area/Bar/Line, the three polar charts were left behind: their `<Legend>` was hard-coded inside the chart, so consumers could **neither turn it off nor move it**, and drawing your own produced two legends side by side (`legendStyle` is an internal constant and `className` only reaches the outer `div`). With 28 series the legend filled five rows and consumed more than half of `height={320}`, flattening the radar and covering the angular axis labels.

  All three now accept `legend?: boolean | "top" | "bottom"`, matching the Cartesian trio. It **defaults to `true`** (these charts have always shipped a legend), so existing calls need no changes; pass `legend={false}` to remove it. Note this is the one prop in the library whose default varies by chart family: `false` for the Cartesian three, `true` for the polar three.

  The trade-off, stated plainly: the legend in these three is no longer recharts' `<Legend>` but the same self-drawn legend as the other three (`Dot` swatches plus token font sizes), so **swatches change from squares to dots and spacing and font size differ slightly**. It also no longer participates in recharts' internal height allocation; instead `height` gives up exactly one row. Swatch colors resolve through the same path as the slices and series, so they cannot disagree.

  Also added: `legendScroll` (all six charts, defaults to `false`), which keeps the legend on a single row with horizontal scrolling — the equivalent of echarts' `legend.type: "scroll"`. "Just increase `height`" does not work when series wrap: a 28-series legend is five rows, and restoring the radar to a readable size would require doubling the total height. With this on, the legend always occupies one row (yielding 32px for a persistent thin scrollbar) and the canvas takes everything else:

  ```tsx
  {
    /* Turn off the built-in legend and draw your own */
  }
  <RadarChart legend={false} data={data} series={series} xKey="indicator" height={320} />;

  {
    /* 28 series: single-row scrolling legend that does not eat the canvas */
  }
  <RadarChart legendScroll data={data} series={series28} xKey="indicator" height={320} />;
  ```

  Entries beyond the first row require horizontal scrolling to reach — with dozens of series that is the trade-off, not a free win.

  **TreeSelect: forwards `expandTrigger`, so single select can reach intermediate levels** — [#78](https://github.com/hulianui/hulian/issues/78)

  Single-select `TreeSelect` could previously **only select leaf nodes**: the internal `Tree` defaults `expandTrigger` to `"row"`, so clicking a row with children only expanded it and returned early, never reaching `setSelected`. `onChange` never fired, the row could not be selected no matter how many times you clicked, and the capability was not exposed to consumers.

  `TreeSelect` now forwards `expandTrigger?: "row" | "icon"`, still defaulting to `"row"` (existing behavior unchanged). To select an intermediate level — a department, a category, a specific volume — pass `"icon"`: the arrow handles expansion and the rest of the row handles selection, mirroring the multi-select model where the checkbox selects and the row expands.

  ```tsx
  <TreeSelect nodes={NODES} expandTrigger="icon" value={v} onChange={setV} placeholder="Select a chapter" />
  ```

  Multi-select (`checkable`) is unaffected, since the checkbox is its own hit area. The pitfalls section of all three components now documents the corresponding behavior — none of these three were discoverable from the documentation before.

## 0.20.0

### Minor Changes

- 0d9fb08: Runtime performance, round one: large-collection virtualization in Combobox plus 19 components that skip needless re-renders

  A new internal scanner (`packages/hulian-scan`, private and unpublished) ran all 372 public component scenarios through the React Profiler using react-scan and Playwright. The first pass produced 125 hard findings (55 avoidable-render, 41 cascade-fanout, 16 long-task, 13 dropped-frames). This release fixes the subset that **still reproduced in a packed consumer environment**, each verified in both the workspace and an out-of-repo tarball install.

  **Combobox / Select / RemoteSelect: automatic virtualization for large collections (default behavior change)**

  Once `items` reaches 100 entries the list virtualizes automatically and renders only the visible options (via `@tanstack/react-virtual`, already a dependency — no new package weight). Opening a thousand-option list now mounts a couple of dozen rows instead of a thousand `<li>` elements. The `searchable` skin of `Select` and the candidate list of `RemoteSelect` take the same path, so they benefit automatically — RemoteSelect accumulates pages remotely, so it switches over once enough pages have loaded.

  The trade-off must be stated plainly: **row height is estimated at a fixed 32px with no per-item measurement**. The default `ComboboxItem` / `SelectItem` is exactly 32px, so the vast majority of usage is unaffected. But if your options span two lines, carry an avatar, or change padding or font size through `className`, scrollbar length and item placement drift apart past 100 entries — **nothing throws, and short lists never reproduce it**; the jump only appears once you scroll into the later part of the list. All three components therefore gained a `virtualized` escape hatch; pass `virtualized={false}` for such options to return to full rendering:

  ```tsx
  {/* Single-line rows: change nothing, virtualization kicks in at 100 items */}
  <Combobox items={CITIES}>…</Combobox>

  {/* renderOption draws "name + email" on two lines: height ≠ 32px, so turn it off */}
  <RemoteSelect fetcher={searchUsers} virtualized={false} renderOption={…} />
  ```

  The same applies to tests that assume every option is in the DOM: after virtualization `getAllByRole("option")` returns only the visible window. Assert totals against `data-hulian-virtual-count` on the list container, or pass `virtualized={false}` for that test.

  **19 components skip re-renders when props are stable**

  Button, Calendar, Cascader, Checkbox, CodeDiff, CodeReviewThread, ColorSwatchPicker, ContributionGraph, CountrySelect, DatePicker, DateTimePicker, Gantt, Glimpse, Markdown, PricingTable, QRCode, Scheduler, TimePicker, and TreeSelect now use `memo`. The criterion was scan evidence rather than intuition: `memo` was added only where a shallow comparison can safely skip work, components taking function, ReactNode, or mutable-object props were judged individually, and no custom deep comparisons were introduced. External behavior and DOM are unchanged.

  **Other targeted optimizations**

  - `Select`: under the `searchable` skin, resolving a candidate by value moved from a linear `find()` per item to a Map lookup, removing an O(n) pass from every trigger and list render when the option set is large.
  - `CircularGallery`: removed geometry recomputation and texture encoding that repeated every frame.
  - `GhostCursor`: reduced per-frame shader cost.
  - React 18 compatibility: `SelectTriggerProps` now uses `ComponentPropsWithoutRef` plus an explicit `ref`, and `SwipeAction`'s ref handling was adjusted to match — both previously only type-checked under React 19.

- Component built-in copy now reads from ConfigProvider locale throughout <!-- parity-id: ui-0.20.0-runtime-locale -->

  `ConfigProvider`'s `locale` prop and the `enUS` dictionary already existed, but only some components actually read them; the rest had Chinese hard-coded. An English project wrapping its tree in `<ConfigProvider locale={enUS}>` therefore saw a mix of English and Chinese, with nothing reporting which components had not been converted.

  This release connects the built-in copy of 130 components — button labels, empty states, placeholders, aria-labels, date and weekday formats, units and separators — to the locale dictionary, which itself grew by 1,688 lines. Beyond straight translation, the differences that are linguistic rather than string-level were handled too: Scheduler formats weekdays and date ranges per locale (an English build renders `Jun 1 – Jun 7` where the Chinese build renders its own date form), and CountrySelect decides from the locale whether country names and secondary labels appear in Chinese or English.

  **Nothing changes for existing projects**: without a `locale` prop everything stays in the original Chinese, and each missing dictionary section falls back to the component's built-in Chinese individually (so an older partial dictionary will not break on missing keys). To switch to English:

  ```tsx
  import { ConfigProvider, enUS } from "@hulianui/ui";

  <ConfigProvider locale={enUS}>{children}</ConfigProvider>;
  ```

  The documentation site ships in English as well: each of the 376 components has an `.en.md` companion (published with the package, so MCP's `get_component_doc` picks it up), and the block and page examples, changelog, and AI distribution artifacts such as llms.txt and registry.json all have English editions.

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

- Add eight components and close nine downstream-consumer gaps. <!-- parity-id: ui-0.18.0-consumer-gaps -->

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
