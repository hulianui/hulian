# Hulian Frontend L3 Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every Hulian page registry item installable, enforce the machine-checkable design conventions in CI, and add composite installation metadata plus accessibility/browser gates.

**Architecture:** The registry generator owns a single page-to-block dependency graph and emits shadcn-compatible recursive dependencies. `conventions.json` v2 separates executable AST rules from advisory documentation; a new `@hulianui/guard` package enforces executable rules after AI generation. Black-box page installation, axe scans, browser interaction tests, and a real downstream project form the completion gates.

**Tech Stack:** Node.js 22, TypeScript 7 compiler API, shadcn registry protocol, pnpm 8, Node test runner, Vitest browser mode + Playwright Chromium, axe-core, Next.js 16 static export.

## Global Constraints

- Preserve all existing registry item names, public URLs, npm root exports, and the date-picker optional-peer boundary.
- Do not touch, stage, or revert the user's concurrent `date-field`, `calendar`, or `time-field` work unless a later verified integration failure requires a narrowly scoped compatibility edit.
- No production code without a failing regression test first.
- Page smoke must install all 20 pages into isolated temporary projects; prior installs may not mask missing dependencies.
- Only low-false-positive rules are errors. Natural-language component pitfalls remain advisory.
- `critical` and `serious` axe violations block CI; `moderate` violations are reported.

---

### Task 1: Page registry dependency graph and path rewriting

**Files:**
- Modify: `scripts/gen-llms-registry.mjs`
- Create: `scripts/gen-llms-registry.test.mjs`
- Regenerate: `apps/www/public/registry.json`

**Interfaces:**
- Produces: `buildCompositeItems(metaFile, srcDir, kind)` page items whose relative block imports are rewritten to `../blocks/<slug>` and whose `registryDependencies` contain `${REGISTRY_BASE}/block-<slug>.json`.
- Produces: exported pure helpers `rewritePageBlockImports(code)` and `scanPageBlockDeps(code)` for tests.

- [ ] **Step 1: Write a failing page dependency regression test**

```js
test("page imports become installable sibling block paths", () => {
  const code = 'import { HeroBlock } from "../../blocks/_blocks/hero";';
  assert.equal(rewritePageBlockImports(code), 'import { HeroBlock } from "../blocks/hero";');
  assert.deepEqual(scanPageBlockDeps(code), ["block-hero"]);
});

test("all generated pages have resolvable relative imports", () => {
  const pages = generatedItems.filter((item) => item.meta.kind === "page");
  assert.equal(pages.length, 20);
  assert.deepEqual(unresolvedRelativeImports(pages), []);
});
```

- [ ] **Step 2: Run the test and verify the current generator fails**

Run: `node --test scripts/gen-llms-registry.test.mjs`

Expected: FAIL because the helpers are not exported and current page contents still contain `../../blocks/_blocks/*`.

- [ ] **Step 3: Implement page rewriting and recursive dependencies**

```js
export function scanPageBlockDeps(code) {
  return [...new Set([...code.matchAll(/from\s+["']\.\.\/\.\.\/blocks\/_blocks\/([\w-]+)["']/g)].map((m) => `block-${m[1]}`))].sort();
}

export function rewritePageBlockImports(code) {
  return code.replace(/((?:from|import)\s+["'])\.\.\/\.\.\/blocks\/_blocks\/([\w-]+)(["'])/g, "$1../blocks/$2$3");
}
```

For `kind === "page"`, apply the rewrite to `files[0].content`, set `registryDependencies` to absolute local/remote registry URLs, and set `meta.selfContained` to `false` whenever dependencies exist. Throw with page name and import text for every unmatched relative import.

- [ ] **Step 4: Regenerate and prove all page endpoints are structurally closed**

Run: `pnpm llms-registry && node --test scripts/gen-llms-registry.test.mjs`

Expected: PASS; 20 pages generated; 18 pages have block dependencies; `page-login` and `page-result` have none; unresolved relative import list is empty.

- [ ] **Step 5: Commit only registry generator and test files**

```bash
git add scripts/gen-llms-registry.mjs scripts/gen-llms-registry.test.mjs apps/www/public/registry.json
git commit -m "fix(registry): make all page items recursively installable"
```

---

### Task 2: Real shadcn installation smoke for all pages

**Files:**
- Create: `scripts/registry-pages-smoke.mjs`
- Create: `scripts/fixtures/registry-consumer/package.json`
- Create: `scripts/fixtures/registry-consumer/components.json`
- Create: `scripts/fixtures/registry-consumer/tsconfig.json`
- Create: `scripts/fixtures/registry-consumer/app/globals.css`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Interfaces:**
- Produces: root command `pnpm registry:smoke:pages`.
- Consumes: generated `apps/www/public/r/*.json` and `HULIAN_REGISTRY_BASE`.

- [ ] **Step 1: Write the smoke script assertion before implementing the runner**

```js
test("page smoke requires every registry page", () => {
  const names = loadRegistry().items.filter((i) => i.meta?.kind === "page").map((i) => i.name);
  assert.equal(names.length, 20);
  assert.deepEqual(result.checked.sort(), names.sort());
});
```

- [ ] **Step 2: Run the smoke test and confirm it fails because no runner exists**

Run: `node --test scripts/registry-pages-smoke.test.mjs`

Expected: FAIL with missing `runPageSmoke` export.

- [ ] **Step 3: Implement isolated temporary consumers**

The runner must:

```js
const tempRoot = mkdtempSync(join(tmpdir(), "hulian-pages-smoke-"));
for (const page of pages) {
  const caseDir = join(tempRoot, page.name);
  cpSync(fixtureDir, caseDir, { recursive: true });
  await run("pnpm", ["dlx", "shadcn@latest", "add", `${base}/r/${page.name}.json`, "--yes"], caseDir);
  await run("pnpm", ["install", "--ignore-workspace"], caseDir);
  await run("pnpm", ["exec", "tsc", "--noEmit"], caseDir);
}
```

Start an ephemeral local HTTP server first, regenerate endpoints with `HULIAN_REGISTRY_BASE` set to that server, and clean the exact `mkdtemp` directory in `finally`. Preserve per-page stdout/stderr on failure.

- [ ] **Step 4: Run the real smoke and fix only protocol failures**

Run: `pnpm registry:smoke:pages`

Expected: all 20 isolated projects install and typecheck. A missing block dependency must fail the affected page rather than be inherited from another page.

- [ ] **Step 5: Add the smoke to CI after registry generation**

```yaml
- name: Smoke all registry pages
  run: pnpm registry:smoke:pages
```

- [ ] **Step 6: Commit the page smoke gate**

```bash
git add scripts/registry-pages-smoke.mjs scripts/registry-pages-smoke.test.mjs scripts/fixtures/registry-consumer package.json .github/workflows/ci.yml
git commit -m "test(registry): install and typecheck every page item"
```

---

### Task 3: Conventions schema v2

**Files:**
- Modify: `scripts/gen-conventions.mjs`
- Create: `scripts/gen-conventions.test.mjs`
- Modify: `packages/ui/conventions.json`

**Interfaces:**
- Produces: `conventions.json` `{ version: "2", executableRules, advisories, confusables }`.
- Produces stable matcher kinds: `forbidden-jsx-prop`, `forbidden-import`, `required-import-companion`, `forbidden-call`, `css-var-prefix`.

- [ ] **Step 1: Write failing schema-shape tests**

```js
assert.equal(conventions.version, "2");
assert.ok(conventions.executableRules.every((r) => r.id && r.severity && r.matcher.kind && r.message));
assert.equal(new Set(conventions.executableRules.map((r) => r.id)).size, conventions.executableRules.length);
assert.ok(conventions.advisories.length >= 990);
assert.ok(conventions.advisories.every((r) => r.id && r.rule && r.source));
```

- [ ] **Step 2: Run and verify version 1 fails**

Run: `node --test scripts/gen-conventions.test.mjs`

Expected: FAIL on `version === "1"` and missing `executableRules`/`advisories`.

- [ ] **Step 3: Generate the five executable rule families and advisory IDs**

Use deterministic IDs such as `component/admin-layout/fit-viewport/1`; include source paths like `packages/ui/src/admin-layout/admin-layout.md`. Do not silently promote extracted prose into error rules.

- [ ] **Step 4: Add deterministic generation check**

Generate in memory, compare with committed `packages/ui/conventions.json`, and exit nonzero on drift via `pnpm conventions:check`.

- [ ] **Step 5: Verify and commit schema v2**

Run: `pnpm conventions && pnpm conventions:check && node --test scripts/gen-conventions.test.mjs`

```bash
git add scripts/gen-conventions.mjs scripts/gen-conventions.test.mjs packages/ui/conventions.json package.json
git commit -m "feat(conventions): separate executable rules from advisories"
```

---

### Task 4: `@hulianui/guard` executable checker

**Files:**
- Create: `packages/guard/package.json`
- Create: `packages/guard/src/cli.mjs`
- Create: `packages/guard/src/check.mjs`
- Create: `packages/guard/src/rules.mjs`
- Create: `packages/guard/test/check.test.mjs`
- Create: `packages/guard/test/fixtures/*.tsx`
- Modify: `pnpm-lock.yaml`
- Modify: `package.json`

**Interfaces:**
- Produces: `checkFiles(paths, options): Promise<{ diagnostics, filesChecked }>`.
- Produces CLI `hulian-check [paths...] --format text|json --config <path>` with exit codes 0/1/2.

- [ ] **Step 1: Write one failing test per executable matcher**

```js
test("rejects style only on imported Hulian components", async () => {
  const bad = await checkSource('import { Button } from "@hulianui/ui"; <Button style={{ color: "red" }} />');
  assert.deepEqual(bad.diagnostics.map((d) => d.ruleId), ["no-style-override"]);
  const html = await checkSource('<button style={{ color: "red" }} />');
  assert.deepEqual(html.diagnostics, []);
});

test("rejects toast member shortcuts", async () => {
  const out = await checkSource('import { toast } from "@hulianui/ui"; toast.success("ok")');
  assert.equal(out.diagnostics[0].ruleId, "toast-object-signature");
});
```

Also cover date root imports, provider warning, color var prefixes, valid aliases, syntax errors, JSON output, and exit codes.

- [ ] **Step 2: Run tests and verify missing checker failure**

Run: `pnpm --filter @hulianui/guard test`

Expected: FAIL because package/checker does not exist.

- [ ] **Step 3: Implement TypeScript-AST binding-aware scan**

Track local bindings from `@hulianui/ui` and `@hulianui/ui/date-pickers`; only diagnose JSX and calls that resolve to those bindings. Report file, line, column, rule ID, severity, message and `instead`.

- [ ] **Step 4: Implement CLI and root convenience command**

```json
{
  "scripts": {
    "guard": "pnpm --filter @hulianui/guard exec hulian-check"
  }
}
```

- [ ] **Step 5: Verify clean and dirty fixtures plus package typecheck**

Run: `pnpm install && pnpm --filter @hulianui/guard test && pnpm --filter @hulianui/guard typecheck`

- [ ] **Step 6: Commit guard package**

```bash
git add packages/guard package.json pnpm-lock.yaml
git commit -m "feat(guard): enforce Hulian usage conventions"
```

---

### Task 5: Composite installation metadata

**Files:**
- Modify: `apps/www/app/blocks/_meta.ts`
- Modify: `apps/www/app/pages/_meta.ts`
- Modify: `scripts/gen-llms-registry.mjs`
- Modify: `scripts/gen-llms-registry.test.mjs`

**Interfaces:**
- Produces required `installation: { providers, replace, slots }` on every `BlockMeta` and `PageMeta`.
- Produces `item.meta.installation` for all 77 composite items.

- [ ] **Step 1: Add failing metadata completeness tests**

```js
for (const item of composites) {
  assert.ok(item.meta.installation, `${item.name} missing installation metadata`);
  assert.ok(Array.isArray(item.meta.installation.providers));
  assert.ok(Array.isArray(item.meta.installation.replace));
  assert.ok(Array.isArray(item.meta.installation.slots));
}
assert.equal(composites.length, 77);
```

- [ ] **Step 2: Verify all 77 current items fail completeness**

Run: `node --test scripts/gen-llms-registry.test.mjs`

Expected: FAIL listing missing installation metadata.

- [ ] **Step 3: Extend the metadata types and every literal entry**

```ts
installation: {
  providers: ["ThemeProvider"],
  replace: ["mock-data", "copy", "navigation", "event-handlers"],
  slots: ["page-header", "data-table"],
}
```

Use only values relevant to each source file. Login/result pages with no replaceable mock data must use explicit empty arrays rather than invented requirements.

- [ ] **Step 4: Parse and emit metadata, failing on omissions**

Use the TypeScript compiler API to read object literals instead of extending the existing order-sensitive regex. Reject unknown enum values and source-relative dependencies that are absent from page slots.

- [ ] **Step 5: Regenerate, verify counts, and commit**

Run: `pnpm llms-registry && node --test scripts/gen-llms-registry.test.mjs`

```bash
git add apps/www/app/blocks/_meta.ts apps/www/app/pages/_meta.ts scripts/gen-llms-registry.mjs scripts/gen-llms-registry.test.mjs apps/www/public/registry.json
git commit -m "feat(registry): describe composite installation work"
```

---

### Task 6: MCP and CI enforcement integration

**Files:**
- Modify: `packages/mcp/src/index.mjs`
- Modify: `packages/mcp/test/server.test.mjs`
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`

**Interfaces:**
- `get_conventions` returns executable rules separately from advisories.
- `install_block` prints installation metadata and the `hulian-check` post-install command.

- [ ] **Step 1: Write failing MCP protocol assertions**

```js
assert.match(bodyOf(conventionsResponse), /可执行门禁/);
assert.match(bodyOf(installPageResponse), /需要递归安装的区块/);
assert.match(bodyOf(installPageResponse), /hulian-check/);
assert.match(bodyOf(installPageResponse), /必须替换/);
```

- [ ] **Step 2: Run MCP tests and verify old output fails**

Run: `pnpm --filter @hulianui/mcp test`

- [ ] **Step 3: Add v1/v2 reader compatibility and v2 output**

Keep v1 parsing for one release but prefer v2. Stop calling all extracted prose “hard constraints”.

- [ ] **Step 4: Add deterministic convention and guard gates to CI**

```yaml
- name: Check generated conventions
  run: pnpm conventions:check
- name: Guard repository usage
  run: pnpm guard -- apps/www packages/ui/src
```

- [ ] **Step 5: Verify and commit**

Run: `pnpm --filter @hulianui/mcp test && pnpm conventions:check && pnpm guard -- apps/www`

```bash
git add packages/mcp package.json .github/workflows/ci.yml
git commit -m "feat(mcp): connect install guidance to executable guard"
```

---

### Task 7: Accessibility and browser reliability gates

**Files:**
- Create: `scripts/a11y.mjs`
- Create: `scripts/a11y.test.mjs`
- Modify: `package.json`
- Modify: `apps/www/package.json`
- Modify: `.github/workflows/ci.yml`
- Modify: relevant existing `packages/ui/src/**/*.browser.test.tsx`
- Rename/modify: high-priority pointer/drag tests identified by `docs/testing.md`

**Interfaces:**
- Produces `pnpm a11y` scanning a fixed route manifest against `apps/www/out`.
- Produces zero-warning Chromium test output for current 23 tests plus migrated high-risk interactions.

- [ ] **Step 1: Write failing axe result-policy tests**

```js
assert.equal(classify([{ impact: "critical" }]).blocking.length, 1);
assert.equal(classify([{ impact: "serious" }]).blocking.length, 1);
assert.equal(classify([{ impact: "moderate" }]).blocking.length, 0);
assert.throws(() => validateRouteResult({ loadFailed: true }), /route load failed/);
```

- [ ] **Step 2: Run policy tests and verify missing runner failure**

Run: `node --test scripts/a11y.test.mjs`

- [ ] **Step 3: Implement static-server + Playwright + axe runner**

Scan `/`, `/start`, `/blocks`, `/pages`, `/theme`, `/components/button`, `/components/pro-table`, `/components/dialog`, and representative application/ecommerce pages. Fail on route/network error and critical/serious violations; print moderate findings.

- [ ] **Step 4: Run against a fresh production build and fix actual violations**

Run: `pnpm --filter www build && pnpm a11y`

Any product-code fix requires its own failing component or route regression test before modification.

- [ ] **Step 5: Make current browser tests warning-free**

Run: `pnpm --filter @hulianui/ui exec vitest run --project browser 2>browser.stderr`

Wrap state-updating input sequences in the browser test utilities' supported `act` boundary or use real `userEvent` APIs. Re-run until `browser.stderr` contains no `not wrapped in act` lines; do not filter stderr.

- [ ] **Step 6: Migrate the remaining highest-risk pointer and drag tests**

Use `rg "setPointerCapture|dragover|dragstart" packages/ui/src --glob '*.test.tsx'` to enumerate current files. For each migrated behavior, temporarily break the matching production branch, observe the browser test fail, restore it, and observe it pass.

- [ ] **Step 7: Put a11y after the production build in CI and commit**

```bash
git add scripts/a11y.mjs scripts/a11y.test.mjs package.json apps/www/package.json .github/workflows/ci.yml packages/ui/src
git commit -m "test(a11y): gate docs and real browser interactions"
```

---

### Task 8: Audit-document truth and full Hulian verification

**Files:**
- Modify: `docs/modernity-audit-2026-08.md`
- Modify: `docs/testing.md`
- Modify: `packages/mcp/README.md`
- Modify: `apps/www/lib/ai-guide.ts`

**Interfaces:**
- Produces one current-state audit with generated counts and explicit “frontend L3 / cross-stack L4” boundary.

- [ ] **Step 1: Generate authoritative counts from current artifacts**

```bash
node -e 'const r=require("./apps/www/public/registry.json"); console.log(r.items.length)'
node -e 'const c=require("./packages/ui/conventions.json"); console.log(c.executableRules.length,c.advisories.length)'
```

- [ ] **Step 2: Rewrite contradictory audit sections**

Remove the stale claims that pages are self-contained, Rating/Stepper are still MUI-backed, dependencies equal 27, and AI cannot see blocks/pages. Preserve historical diagnosis only in a clearly labeled appendix.

- [ ] **Step 3: Run the complete internal acceptance suite fresh**

```bash
pnpm docs:all
pnpm registry:smoke:pages
pnpm --filter @hulianui/guard test
pnpm --filter @hulianui/mcp test
pnpm --filter @hulianui/ui exec vitest run --project browser
pnpm typecheck
pnpm test
pnpm size
pnpm --filter www build
pnpm a11y
git diff --check
```

Every command must exit 0. Browser stderr must be inspected for warnings. No narrower command may stand in for a failed command above.

- [ ] **Step 4: Commit the factual documentation update**

```bash
git add docs/modernity-audit-2026-08.md docs/testing.md packages/mcp/README.md apps/www/lib/ai-guide.ts
git commit -m "docs(audit): record the verified frontend L3 state"
```

---

## Plan Self-Review

- Spec coverage: Tasks 1–2 cover installable pages; Tasks 3–4 cover executable constraints; Task 5 covers construction metadata; Task 6 joins MCP and CI; Task 7 covers axe/browser reliability; Task 8 covers factual docs and every internal acceptance command.
- Placeholder scan: every implementation step contains concrete files, commands, assertions and expected outcomes.
- Type consistency: schema matcher names match the design; `hulian-check`, `registry:smoke:pages`, `conventions:check`, and `pnpm a11y` are introduced before later tasks consume them.
- Scope: demo templates, dependency reduction, date rewrite and PHP/Java L4 remain separate approved follow-up projects, as required by the design specification.
