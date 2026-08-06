# @hulianui/ui

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
