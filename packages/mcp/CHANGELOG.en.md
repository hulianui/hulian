# @hulianui/mcp

## 0.10.1

### Patch Changes

- 73d4893: `get_component_doc` now returns Events alongside Props (#298): only Slots used to get that treatment, so Events were filtered out by `sections`. Asking for the props of `Tag` showed no `onClose` -- its **only** interactive capability -- and code written from that answer used a bare `<button>`, which is exactly what the "no bare HTML elements in the UI" gate rejects. Both the markdown and the `format:"json"` path are fixed; in the JSON path events are also merged into the `props` array (tagged `kind:"event"`, with the function signature still in `type`), so tool chains that walk props to build validators or property panels no longer miss the interactive entry point. The reverse narrow query (asking for `events` alone) is unchanged.

## 0.10.0

### Minor Changes

- `audit_hulian_adoption`: a `<table>` or `<input>` inside a comment is no longer a bare tag, and one line is no longer counted twice <!-- parity-id: mcp-audit-skip-comments -->

  Bare-tag detection matched raw text and **did not exclude comments**. So a file already 100% migrated to
  `@hulianui/ui` was reported as a `bare-table` risk purely because a comment said "this used to be a
  hand-written `<table>`" (#266). Two things make that especially hard to live with:

  1. **The better the comment, the more false positives.** A note left behind by a migration inevitably
     reads "this used to be a hand-written `<table>`, now it is `<Table>`" -- the single most worthwhile
     comment to write, turned into a demerit.
  2. **Copying the library's own documentation trips it.** The text of one reported false positive was
     lifted verbatim from the Usage notes in `table.md`: follow the docs, write it down, get flagged by
     our own audit.

  The fix adds a `maskComments()` pass in the shared signal layer (`adoption-signals.mjs`, the common
  ground between the audit tool and the cross-project scan): comment contents are blanked to spaces
  before matching. **Comments only, never string literals** -- `className="fixed inset-0"` and
  `text-[#fff]` live inside strings, and blanking those would take out the `handmade-overlay` and
  `hardcoded-color` rules with them. So it is a small stateful scanner rather than a few regexes: the
  `//` inside `"https://x"` is not a comment. Length and newlines are preserved character for character,
  so line numbers and snippets stay accurate.

  Findings are also deduplicated by `(rule, file, line)`: the report's unit is a line (the snippet is the
  whole line), so `from-[#a] to-[#b]` used to emit two identical `hardcoded-color` entries.

## 0.6.0

### Minor Changes

- Adds a **discovery channel** for effect components, so suppression and discovery are finally symmetric (#140). <!-- parity-id: mcp-visual-discovery-channel -->

  Of the 380 components in the library, 92 are decoration and 151 carry the `animated` tag. Until now the MCP side suppressed them mechanically (one category rule blacklisted 92 components) while discovery consisted of roughly 8 hand-written entries. Agents therefore used only the "safe" functional components, and the pages they produced were correct but had no visual identity at all — even though the deliverable is ultimately looked at by a human.

  - **Suppression precision moves from category to group.** Inside `decoration`, `backdrop` (52 full-screen backgrounds and WebGL) and `overlay-fx` (40 local accents) are two entirely different things; blacklisting the whole category also banned entrance transitions and card borders from admin consoles. Profiles now use `avoidGroups` plus an `allowEffects` whitelist. **The non-goal from #41 still holds**: `visualBudget.heavy` is 0 for every internal surface, so no full-screen background or WebGL component can get in.
  - **An atmosphere vocabulary for search.** Effect requests are naturally phrased as adjectives ("the hero needs to feel more technical", "this section is flat", "give it some breathing room"), and such queries used to score 0 against all 92 decoration components. `query: "tags:animated"` also works now — motion is a cross-cutting tag rather than a category, an entry point the docs site always had and MCP never did.
  - **Every result carries a visual anchor**: `docsUrl` (a link you can hand to a human), `motion` (`none` / `subtle` / `moderate` / `heavy`), and `look` (one plain sentence: what moves, how strongly, where it belongs and where it does not). `look` is only provided for components that were actually reviewed; everything else returns `null` rather than an invented description.
  - **Proactive nudges**: `recommend_ui` and `audit_hulian_adoption` surface a slot, a candidate, its strength, and a degradation note when a project uses no motion or accent component at all. They are always advisory, never gates, never counted in any metric, and capped at one entry for admin consoles.
  - Profiles gained `visualBudget` and `preferEffects`; metrics gained the non-gating `visualExpressiveness`, so "correct but flat" is finally visible in a report.

## 0.5.0

### Minor Changes

- 899ff6d: `get_component_doc` gains `format: "json"`: structured props for constrained generation (#105)

  Consumers who want an LLM to "only ever emit whitelisted components with legal props" had nothing but the markdown tables to parse, so every one of them walked into the same three potholes: the escaped `\|` union separator read as a column separator (#102), a type column naming an alias whose values live only in the source (#103), and a document title that is a display name rather than the real export (#104).

  Now ask for the structured data directly:

  ```jsonc
  { "name": "IPhone", "format": "json" }   // a real export name resolves to its component
  ```

  Every prop, event and slot comes back with `kind` (enum / boolean / number / string / node / function / array / union), `values` (the enum whitelist), `valueType` (is it `level={1}` or `level="1"`), `default` and `required` — enough to generate Zod or JSON Schema directly. The payload travels both as `structuredContent` (the machine-readable channel in MCP) and as JSON text; `sections` still trims what you get.

  The data source is a new artifact, `llms-props.json`: read from `apps/www/public/` in local mode and from the docs site in remote mode.

## 0.4.1

### Patch Changes

- 126ace2: Stop `inspect_project` from misclassifying registry packages in monorepo subprojects as `local-link` (closes #68)

  `linkKindOf` previously decided whether a resolved package had “escaped” relative to the particular `node_modules` directory where the package was discovered. In a pnpm workspace subproject, however, `apps/web/node_modules/@hulianui/ui` points into the **repository root's** `node_modules/.pnpm/…`, which naturally lies outside `apps/web/node_modules`. Every ordinary registry installation in a subproject was therefore mistaken for a local source link. The #45 regression fixture covered a single-package project whose `.pnpm` directory happened to sit beside the discovery layer, so this defect remained hidden.

  The outcome was the same as #45 but more subtle: because `linked` was always `true`, the declared-versus-installed version drift gate **silently stopped working**. `importStrategy` also reported the wrong reason, claiming that the project used local source and needed a Vite dependency-optimization plugin. `@hulianui/tokens` was misclassified in the same way.

  The containment baseline now includes **every** `node_modules` directory along the path rather than just the discovery layer. If any layer contains the resolved package, it is not a local source link. Explicit `workspace:`, `link:`, and `file:` specifiers retain their existing behavior.

  An ordinary workspace installation now reports truthfully:

  ```json
  { "declared": "0.18.0", "installed": "0.18.0", "linked": false, "linkKind": null }
  ```

  Regression coverage uses a real workspace fixture with a root `pnpm-workspace.yaml` and an `apps/web` symlink into the root `.pnpm` store. It also covers the negative boundary: a symlink into the repository's `packages/ui` **source directory**, outside every `node_modules`, must still be classified as `local-link`. The broader containment rule must not become overly permissive.

## 0.4.0

### Minor Changes

- `inspect_project` now resolves `@source` paths instead of reporting nonexistent targets as `detected` (#66).

  Looking only for the text `@source` is insufficient. In a pnpm workspace, the real package entry often lives under `<app>/node_modules`, while a stylesheet may count relative path segments from the repository root and therefore resolve to a target that does not exist. The failure mode is particularly dangerous: setup appears green, the production build succeeds, and DOM `className` values look correct, yet none of the library's Tailwind utilities are generated and the page degrades to unstyled text. Type checking, unit tests, and guard cannot detect this.

  - Each `@source` is resolved relative to the stylesheet that contains it. For globs, the static prefix is checked for existence.
  - `setup.tailwindSource` changes from two states to three: present and valid → `detected`; present but missing its target → **`invalid`** plus a warning; absent → `not-found` as before. Consumers branching on this field must handle the new value.
  - New `setup.tailwindSourceTargets` reports each resolved candidate (`raw` → `resolved` → `exists`) so pnpm workspace and single-package path differences can be diagnosed directly.

## 0.3.1

### Patch Changes

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

- bf58470: Add the `audit_hulian_adoption` tool and `npx @hulianui/mcp audit` command to assess component adoption in projects that **already contain code** (issue #43).

  Existing projects are the main battleground for adoption, and they need something different from a new-project setup guide. The question is no longer “how should this be assembled?” but “which existing capabilities are being used, and where should improvement start?”

  - **Automatic scenario detection** — surface and modifiers remain orthogonal dimensions. Detection criteria come from the new `detect` field in the profile source of truth, the machine-evaluable counterpart to `signals`. Evidence and confidence are reported together, runner-up candidates remain visible, and callers can override the result manually.
  - **The primary metric is adoption of high-level business components** (for example, `10/12`), not raw component coverage. Raw coverage is sensitive to project size; the former directly measures whether existing higher-level capabilities were bypassed.
  - **Opportunities are reported only when nearby evidence reveals a gap** — if a responsibility group uses some relevant components but misses a key one, it is reported; if it uses none, the project simply does not have that scenario. An admin console is therefore not marked under-adopted merely because it does not use 91 `decoration` components—that is an inventory-shape issue. New `avoidCategories` data further prevents modifier recommendations from crossing the component-language boundary of the surface.
  - **Risk findings are not uniformly marked red** — every item carries confidence and supporting evidence. In a real scan of quay's 69 raw `<button>` elements, the distribution was high 0 / medium 2 / low 67.
  - **Prototype semantics** — with `workflow: "prototype"`, the audit does not recommend high-level enterprise components. Evidence from one product showed 5/12 adoption in its demo and 10/12 in production; that is a deliberate tradeoff, not an adoption failure. Shape-essential components are still reported. If a project's own description looks like a prototype, the tool warns but **does not switch modes automatically**.
  - **Baseline / ratchet** — CLI `--write-baseline` accepts existing debt, while `--check` blocks only new debt. Baselines are human-readable and contain no project source.

  The output consists **entirely of confidence-qualified recommendations and never produces errors**. Statically provable violations remain the responsibility of `validate_hulian_usage` / `@hulianui/guard`. Only the CLI writes files, preserving the tool's `readOnlyHint` semantics.

  Detection quality was validated against 11 real local consumer projects, passing all seven acceptance criteria from #43.

### Patch Changes

- 52c0ac7: Fix four detection-accuracy defects that shared the same failure mode: silently returning the wrong conclusion. Because MCP's role is “do not guess props; look them up here,” the most compliant callers were harmed most.

  - **`inspect_project` always reported `linked: true` in pnpm projects** (#45). Every entry in pnpm's `node_modules/` is a symlink into the `.pnpm/` store, so testing `isSymbolicLink()` marks every package as linked and disables the `!linked` version-drift gate for all pnpm users. Detection now combines whether the resolved path escapes the current `node_modules` tree with explicit `link:` / `file:` / `workspace:` specifiers, and adds `linkKind` to distinguish workspace links from temporary local integration.
  - **The version-drift gate could never detect differences within 0.x.** It previously compared only majors, but npm allows `^0.5.0` to resolve only `0.5.x`; for 0.x, minor is the compatibility boundary. A declared `^0.14.0` with installed `0.16.0` is now reported truthfully.
  - **`inspect_project` missed globally imported stylesheets with uncommon names** (#46). The fixed candidate list omitted paths such as `src/styles.css`, so correctly integrated projects were reported as `unknown`. Detection now follows relative CSS imports from entry files and uses the fixed list only as a fallback. Warnings also distinguish “could not detect” from “not configured.”
  - **Local mode stamped responses with a version one release behind** (#47). It now reads `packages/ui/package.json` instead of a generated artifact, eliminating false skew in `validate_hulian_usage`.
  - **Local mode silently returned stale registry artifacts** (#48). A freshness check now compares versions to catch artifacts not regenerated after a release, and mtimes to catch same-version documentation edits. Every stale response includes a warning and the direct remediation command `pnpm llms-registry`.

## 0.2.0

### Minor Changes

- f75602f: Add `get_agent_profile`, making “which component language should this page use?” queryable instead of requiring a long repeated prompt.

  The server could already answer “what is this component called?” and “which props does it take?”, but not “which component language fits an admin console?” or “what additional constraints apply on mobile?” Those contextual decisions required teams to paste an increasingly long prompt into every project, and the same rules were then applied indiscriminately to marketing pages, admin systems, and long-form content.

  The new tool organizes its source of truth, `src/agent-profiles.json`, across **three orthogonal dimensions**:

  - `surface` selects the component language: `admin-console` / `config-tool` / `ai-product` / `content-brand` / `desktop-shell`
  - `modifiers` set constraints and budgets and **can be composed**: `mobile` / `dashboard` / `data-dense` / `marketing` / `high-performance`
  - `workflow` selects the process: `prototype` / `build` / `audit` / `dogfood` / `migrate`

  Composition is essential: a mobile AI product is `ai-product + [mobile]`, while a standalone data wall is `admin-console + [dashboard]`. Modeling these as profile subtypes would make a project match multiple supposedly exclusive options. With no dimension specified, the tool returns the catalog and detection signals so the model can select the appropriate profile.

  `componentRoles` comes from scanning 12 real consumer projects (see `docs/agent-adoption-baseline-2026-08-01.md`), not intuition. One finding directly changed the definition of `admin-console`: within the same product and team, a demo prototype used 5 of 12 high-level enterprise components while production used 10 of 12. The component language therefore follows production (`page-header` / `pro-table` / `access` / `form-dialog`) rather than a prototype's collection of `card` + `select`. This evidence also motivated `workflow: "prototype"`: optimizing a prototype for speed is valid, and recommending the full enterprise stack would be overengineering rather than evidence of under-adoption.

  Tests verify every component, page, and block referenced by a profile against the registry. A nonexistent slug sends the model toward an import that cannot resolve and is worse than no recommendation. `get_agent_profile` supplies candidates and constraints, not the source of truth for props; callers must still use `get_component_doc`, as the response explicitly states.

- 2ef69ed: Add `npx @hulianui/mcp init-agent`, a single command that installs the HulianUI contract into each supported agent instruction file.

  Every new project previously required manually pasting the HulianUI rules into `CLAUDE.md` or `AGENTS.md`, while four clients each read different files. Now:

  ```bash
  npx @hulianui/mcp init-agent            # Install or update
  npx @hulianui/mcp init-agent --check    # Report only; exit nonzero when work remains, suitable for CI
  npx @hulianui/mcp init-agent --doctor   # Diagnose placement, freshness, and MCP configuration
  npx @hulianui/mcp init-agent --all      # Cover all four clients
  ```

  Supported targets are `AGENTS.md` (Codex / Copilot agent mode), `CLAUDE.md` (Claude Code), `.cursor/rules/hulianui.mdc` (Cursor, with the frontmatter required for automatic loading), and `.github/copilot-instructions.md` (GitHub Copilot).

  **Preserving existing user content is the core value of this workflow**, so:

  - The contract lives between `<!-- hulianui:begin -->` and `<!-- hulianui:end -->`; updates replace only that block and preserve every byte before and after it.
  - It is idempotent: repeated runs report “already current,” and the file remains byte-for-byte unchanged.
  - If only one marker remains after manual damage, the command **reports a conflict and exits without writing anything**. It never guesses the block boundary.
  - By default, only instruction files that **already exist** are updated; the command does not scatter four new files through a project. If none exist, it creates `AGENTS.md`, the most broadly supported target.
  - `--check` never writes to disk.

  The contract is deliberately short and contains only six rules that apply to every UI task: discover existing components before composing primitives, never guess props, select component language by scenario, close missing capabilities upstream, use semantic tokens, and run verification without treating different evidence types as interchangeable. Scenario differences (admin / marketing / mobile and others) come from `get_agent_profile` on demand instead of bloating instruction files; otherwise a marketing effects budget would be applied indiscriminately to admin systems and long-form content. The valid surface / modifier / workflow values listed in the contract are generated from the profile source of truth and cannot drift independently.

  `--doctor` also checks whether the project references a HulianUI MCP configuration. Without it, tool calls mentioned by the contract cannot resolve, so installing the contract alone is insufficient.

- ddf601f: Complete MCP search correctness and the “project-aware → generate → validate” loop (closes #36 #37)

  **Search no longer returns false negatives.** `list_components` previously ran one `includes` check against the entire query and examined only name/title/description. In practice, `{ kind: "page", query: "user management list" }` returned zero results even though `page-admin-list` existed in the registry. The model concluded that no reusable page or block existed, turning one selection step into 29 tool calls. Queries are now tokenized (Chinese bigrams plus a one-layer Chinese-English bridge, such as “modal” → `dialog`), scored across name/title/description/category/group/tags/exports, and sorted by coverage. When a requested kind has no exact match, results fall back across granularity and are explicitly labeled “possibly related” instead of declaring that nothing exists. `limit` + `offset` provide pagination. The `category` enum is generated from real registry categories; the schema previously hard-coded `form` even though the actual key is `forms`, which could never return a result.

  **Four new tools:**

  - `inspect_project` reads known configuration paths in a consumer project and reports its framework, package manager, installed HulianUI package versions, `components.json`, Provider setup, token CSS setup, and a project-specific import strategy. `projectRoot` comes first from MCP Roots, then from an explicit argument, and only then from cwd; the response identifies the source. It reads only known paths, does not recursively traverse the repository, and never reads `.env`. When the current directory has no HulianUI installation, it performs bounded workspace candidate detection (first honoring `pnpm-workspace` / `workspaces`, then trying conventional names such as `web` and `frontend`) and returns `workspaceCandidates` plus `suggestedProjectRoot` **without switching automatically**. Previously, running it at a monorepo root could incorrectly conclude that `@hulianui/ui` was not installed.
  - `recommend_ui` turns one business requirement into a ranked page → block → component composition.
  - `get_setup_guide` returns integration constraints from the `docs/consuming.md` source of truth for `next` / `vite` / `vitest` / `tailwind` / `imports` / `install`, intended to be used with `inspect_project` warnings.
  - `validate_hulian_usage` invokes guard as a library and returns structured diagnostics with ruleId/file/line/column. Business-code violations produce `ok:false` but **not** `isError`; the latter is reserved for invalid arguments, unreadable files, or guard failures. Mixing them causes models to interpret “your code is invalid” as “the tool is broken” and bypass validation. “Could not check” and “passed” are strictly separate: if no requested file can be checked, the tool returns `isError` (misspelled paths must never render as `✅ guard passed · 0 files`); partial failures return `partial:true` and `ok:false`. `versions` is split into `guard`, `registry` (loaded eagerly and independent of call order), and `consumerUi` (the installed version from the consumer project's `node_modules`).

  **Data provenance is now visible.** Every response includes its data source, registry version, and generation time. Remote artifact caching has a TTL (five minutes by default, configurable through `HULIAN_MCP_CACHE_TTL_MS`). In local mode, missing artifacts are a hard error with an instruction to run `pnpm llms-registry`; local mode no longer silently falls back to online data when answering questions about local work. Fallback requires explicit `HULIAN_ALLOW_REMOTE_FALLBACK=1` and is marked in the response. `install_block` returns installation commands only when it can name an endpoint from the **same source** (remote mode or an explicit `HULIAN_REGISTRY_URL`). Without one, local mode explains that the source comes from the workspace while the online endpoint is the published release. Otherwise, installing a block immediately after a local edit but before release would silently restore older content.

  **Other improvements:** `get_component_doc` supports batch `names` and section trimming through `sections`; every tool now declares `title` plus `readOnly` / `destructive` / `idempotent` / `openWorld` annotations, and stable outputs add `outputSchema` + `structuredContent`. Server instructions and the `hulianui_expert` / `hulianui_page_builder` prompts encode the recommended workflow.

  **Registry metadata:** frontmatter parsing now supports multiline arrays. Prettier-wrapped `exports:` values were previously truncated, causing PasswordGenerator's 19 exports to become `import { /* ? */ }`. Export metadata now comes from the `src/<slug>/index.ts` barrel source of truth, which also fills gaps for theme (`useTheme`), config (`zhCN`/`enUS`), access (`AccessProvider`/`useAccess`), time-picker, and annotation. Type exports are recorded separately under `meta.types`, so components can be found through types such as `ProTableProps` without placing types in runtime import statements. A generation-time gate now fails on any unresolvable registry import.

  **Guard:** `loadConventions` is now public, allowing callers that scan files in a loop to load the 7,000-line convention table only once. The wording of the `import-from-root-barrel` **advisory** now matches package exports: subpath entries are official, and choosing the root barrel or a subpath belongs to the consumer project. Only paths outside package exports are truly forbidden; that executable gate remains unchanged.

### Patch Changes

- Updated dependencies [ddf601f]
  - @hulianui/guard@0.3.0

## 0.1.1

### Patch Changes

- 235cee5: Add the executable `@hulianui/guard` convention gate, and make MCP installation guidance return recursive page dependencies, an explicit integration checklist, and post-install verification commands.

  `SelectTrigger` now forwards native button attributes and correctly merges the consumer ref with the internal anchor ref in searchable mode.
