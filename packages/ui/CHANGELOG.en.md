# @hulianui/ui

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
