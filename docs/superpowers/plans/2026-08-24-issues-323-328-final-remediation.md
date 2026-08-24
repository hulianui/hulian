# Issues #323–#328 Final Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every remaining review and release blocker for Issues #323–#328, prove the fixes with regression evidence, then deliver the batch through PR merge, versioning, publication, and a fresh public-consumer check.

**Architecture:** Keep the existing public APIs and component boundaries. Repair Select hook invariants and bundle weight in place, complete StackItem's React 19 polymorphic-ref contract and structured docs metadata, add real-browser pointer evidence for DotField, and make the Changesets version path generate bilingual changelogs and the UI version artifact from one deterministic pipeline. Each remediation starts with a failing test or mutation proof and lands in the feature commit it corrects where practical.

**Tech Stack:** React 19, TypeScript, Vitest, Playwright browser projects, pnpm, Changesets, Next.js, generated llms/registry artifacts, GitHub Actions, npm.

**Spec:** `docs/superpowers/specs/2026-08-24-consumer-gap-issues-323-328-design.md`

## Global Constraints

- Work only in the isolated `issues-323-328-consumer-gaps` worktree; preserve unrelated user work.
- One implementation task at a time. Every task receives a fresh implementer and fresh spec/quality reviewers.
- Add the regression test first and capture its failure. For an evidence-only browser test whose production path already works, use a temporary mutation to prove the test detects removal of the behavior, then restore production code.
- Do not weaken assertions, skip tests, raise size limits, or change the approved API to make a gate pass. A size-limit change requires measured evidence and an explicit controller ruling.
- Regenerate ignored `/r`, `/d`, conventions, llms, and registry outputs before integration checks.
- Treat local implementation, PR checks, merge ancestry, release publication, public docs/registry, and a fresh external consumer as separate evidence states.
- Do not close Issues #323–#328 or call the batch released until the PR is merged, `master` contains the feature history, merged CI is green, the version PR is merged, npm is published, and public-consumer verification passes.

---

### Task 1: Repair Select hook invariants and restore the hard size gate

**Files:**

- Modify: `packages/ui/src/select/select.tsx`
- Modify: `packages/ui/src/select/select.test.tsx`
- Modify: `packages/ui/src/select/select-order.ts`
- Modify: `packages/ui/src/select/select-order.test.ts`
- Inspect only unless explicitly ruled: `scripts/size-limits.json`

- [ ] Add regression tests that rerender the same Select instance from `searchable={false}` to `true` and from `true` to `false`; assert no hook-order error, no unmount, and a usable trigger/listbox after each transition.
- [ ] Run the focused tests and record the expected hook-order failures.
- [ ] Move or replace the standard-mode derived-order hooks so every render calls hooks in the same order before the searchable branch returns.
- [ ] Run the focused Select unit and browser tests and confirm both transition tests pass.
- [ ] Use the already-failing `pnpm size` result (`Select` initial gzip above the 80 KB hard limit) as the size RED gate.
- [ ] Remove duplicate ordering logic by reusing the existing pure selected-first helper where semantics match; preserve selected-value order, stale-value omission, group boundaries, and immutability.
- [ ] Run ordering tests, all focused Select tests, and `pnpm size`; the size gate must pass without increasing its limit.
- [ ] Commit as a fixup of the #328 feature commit: `git commit --fixup 2780e144`.

### Task 2: Complete StackItem ref typing and generated props metadata

**Files:**

- Modify: `packages/ui/src/stack/stack.types.ts`
- Modify: `packages/ui/src/stack/stack.test.tsx`
- Modify: `packages/ui/src/stack/stack.md`
- Modify: `packages/ui/src/stack/stack.en.md`
- Modify: `scripts/props-catalog.test.mjs`
- Regenerate: llms, conventions, registry, and props-catalog outputs

- [ ] Add a compile-time and runtime regression using `createRef<HTMLButtonElement>()` with `<StackItem as="button" ref={ref}>`; assert the ref type-checks and points to the rendered button.
- [ ] Run the focused type/test commands and record the expected type failure before implementation.
- [ ] Add the narrow React 19 polymorphic ref type to `StackItemProps` using `ComponentPropsWithRef<E>["ref"]`; keep shared polymorphic helpers unchanged.
- [ ] Restructure both Stack docs so the parser sees `## Props`, then `### Stack` and `### StackItem` tables.
- [ ] Add a parser regression over the real Stack documentation and assert `grow`, `shrink`, and `minWidth` are owned by `StackItem`.
- [ ] Run focused Stack tests, typecheck, and props-catalog tests; regenerate artifacts and verify the StackItem properties appear in generated output.
- [ ] Commit as a fixup of the #324 feature commit: `git commit --fixup 77b2c178`.

### Task 3: Prove DotField pointer interaction in real Chromium

**Files:**

- Modify: `packages/ui/src/dot-field/dot-field.browser.test.tsx`
- Inspect/temporarily mutate and restore: `packages/ui/src/dot-field/dot-field.tsx`

- [ ] Add a Chromium test that renders a deterministic sized DotField, captures real canvas output, dispatches `pointermove`, and waits for an observable draw/pixel change.
- [ ] Prove the test is meaningful by temporarily disabling the production pointer listener or its draw response and capturing the expected failure; immediately restore production code.
- [ ] Run the focused browser test against the restored implementation and confirm geometry, pointer-events, and drawing behavior pass without a mocked canvas context.
- [ ] Confirm the worktree contains only the test change and no mutation residue.
- [ ] Commit as a fixup of the #327 feature commit: `git commit --fixup 6df84279`.

### Task 4: Make the version path generate bilingual release artifacts deterministically

**Files:**

- Create: `scripts/sync-changelog-locales.mjs`
- Create: `scripts/sync-changelog-locales.test.mjs`
- Create: `scripts/sync-ui-version.mjs`
- Create: `scripts/sync-ui-version.test.mjs`
- Modify: `package.json`
- Modify: `apps/www/next.config.mjs`
- Modify: `.changeset/consumer-layout-select.md`

- [ ] Write pure unit tests for synchronizing a new Changesets release section from the Chinese changelog into the English changelog via `<!-- changelog-en:start -->` / `<!-- changelog-en:end -->`; require matching version/type/SHA structure, multiline content, ordering, Chinese-only zh output, English-only en output, idempotence, and a clear error when a missing English release lacks a marker.
- [ ] Run the changelog-sync tests and record their initial failure.
- [ ] Implement the smallest pure/testable synchronizer and CLI that updates only newly missing English releases and preserves existing release history.
- [ ] Write and run failing tests for a shared UI-version synchronizer that reads `packages/ui/package.json` and deterministically writes `apps/www/lib/ui-version.ts`.
- [ ] Implement the UI-version script and call the same implementation from `apps/www/next.config.mjs`.
- [ ] Add `changelog:sync-locales` and `ui-version:sync` scripts. Change `version-packages` to: `changeset version && pnpm changelog:sync-locales && pnpm ui-version:sync && pnpm llms-registry && pnpm changelog && pnpm registry:version`.
- [ ] Update the batch changeset with the CardBody migration warning in Chinese and a complete English marked block containing the equivalent release summary and migration guidance.
- [ ] Run the new script tests, all script tests, and a disposable version-path dry run; verify changelog parity, the generated UI version, and registry version without mutating the active branch.
- [ ] Commit: `fix(release): automate bilingual version artifacts (#323)`.

### Task 5: Integrate, verify, review, and deliver

**Files:**

- Update generated artifacts as required by the repository generators
- Update PR/release metadata only after local gates pass

- [ ] Autosquash fixups onto `origin/master`, preserving one independently reviewable feature commit per Issue and the release-automation commit.
- [ ] Run `pnpm llms-registry && pnpm conventions` and commit any authoritative generated changes.
- [ ] Run the complete local gate set under the repository Node version:
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm test:scripts`
  - `pnpm size`
  - `pnpm --filter @hulianui/ui exec vitest run --project browser`
  - `pnpm --filter www build`
  - repository browser showcase/a11y/viewport/gallery checks
  - `git diff --check`
- [ ] In a disposable worktree, run `pnpm version-packages`; verify bilingual changelog parity, UI-version output, registry version, and a clean repeat run. Do not carry generated version changes back into the feature branch.
- [ ] Obtain a fresh whole-diff specification review and a fresh quality review. Resolve every blocking finding through a new recorded remediation task; do not bypass the review breaker.
- [ ] Apply `superpowers:verification-before-completion`, then push the branch and open one PR linking #323–#328 with explicit test and migration evidence.
- [ ] Wait for required PR checks, address failures, merge to `master`, and verify `master` ancestry plus merged CI/deploy health before closing #323–#328.
- [ ] Follow the repository Changesets release flow, merge the generated version PR, verify npm publication and public documentation/registry versions, then install the published version in a fresh external consumer and exercise the new APIs.
- [ ] Report local, PR, merge, release, and public-consumer evidence separately, including all recorded SDD rulings and their cost-if-wrong.
