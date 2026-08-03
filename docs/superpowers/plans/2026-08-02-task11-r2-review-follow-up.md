# Task 11 r2 Review Follow-up Implementation Plan

> **For agentic workers:** Execute inline in this session. Do not dispatch subagents and do not touch Task 12.

**Goal:** Close the remaining DatePicker locale, dashboard browser-transition, documentation, and legacy-locale compatibility findings from Task 11 r2.

**Architecture:** Keep every new `ComponentLocale` section optional and preserve the existing Chinese literals as runtime fallbacks. Make the production-export browser gate wait for observable application states, scan every reviewed text surface after transitions, and reject unexpected failure UI during generic route scans.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, Playwright, Next.js static export, pnpm.

## Global Constraints

- Preserve existing Chinese behavior without `ConfigProvider` and with legacy custom locale dictionaries.
- Explicit component props override locale defaults.
- Verify real rendered behavior; do not add source-text-only tests for runtime contracts.
- Regenerate derived docs/registry/conventions with `pnpm docs:all`; never edit generated artifacts independently.
- Do not modify Task 12 scope.

---

### Task 1: Complete DatePicker locale behavior

**Files:**
- Modify: `packages/ui/src/config/locale.ts`
- Modify: `packages/ui/src/date-picker/date-picker.tsx`
- Test: `packages/ui/src/date-picker/date-picker.test.tsx`
- Modify: `packages/ui/src/date-picker/date-picker.md`
- Modify: `packages/ui/src/date-picker/date-picker.en.md`

- [ ] Add tests that require enUS date/month/year placeholders, explicit prop precedence, and the original Chinese placeholders when `datePicker` is absent from an otherwise valid custom locale.
- [ ] Run the focused DatePicker test and confirm it fails because the rendered placeholders still come from `PICKER_PLACEHOLDER`.
- [ ] Extend optional `ComponentLocale.datePicker` with `date`, `month`, and `year`, populate zhCN/enUS, and merge the locale section over the Chinese fallback in `DatePicker`.
- [ ] Rerun the focused test and typecheck, then document the locale/prop precedence contract in both Markdown files.

### Task 2: Prove legacy fallback for the other reviewed components

**Files:**
- Test: `packages/ui/src/video/video.test.tsx`
- Test: `packages/ui/src/date-time-picker/date-time-picker.test.tsx`
- Test: `packages/ui/src/time-field/time-field.test.tsx`
- Modify: paired `video`, `date-time-picker`, and `time-field` Chinese/English Markdown files

- [ ] Add real render tests with the corresponding optional locale section removed and require original Chinese accessible labels/placeholders.
- [ ] Temporarily make each fallback incomplete in the test cycle, confirm the new tests fail for the expected rendered label, restore the complete fallback, and rerun green.
- [ ] Document that built-in controls follow `ConfigProvider`, explicit props win where supported, and missing optional sections retain Chinese compatibility defaults.

### Task 3: Strengthen dashboard and generic browser state gates

**Files:**
- Modify: `scripts/check-task11-demo-output.mjs`
- Test: `scripts/check-task11-demo-output.test.mjs`

- [ ] Add executable helper tests for known unexpected application-failure markers and route-specific expected-precondition handling.
- [ ] Run the Node test and confirm the helper/export is missing.
- [ ] Make generic route scans reject visible known error/failed/retry UI unless the route declares that expected precondition.
- [ ] After Dashboard selects Error, wait for the localized error-state heading/marker, rescan all visible and accessible surfaces, switch to Healthy, wait for the success state and restored nonempty chart paths, and rescan again.
- [ ] Rerun script tests, rebuild the bilingual export, and run the enhanced production browser scan.

### Task 4: Regenerate, verify, report, and commit

**Files:**
- Modify: `.superpowers/sdd/2026-08-01-hulian-bilingual-docs-component-navigation/task-11-report.md`
- Modify: generated registry/conventions artifacts via `pnpm docs:all`

- [ ] Run focused UI and WWW tests, full WWW tests, script tests, UI/WWW typechecks, `pnpm docs:all`, docs build/output/routes/i18n, conventions check, and Task 11 browser scan.
- [ ] Update the Task 11 report and task ledger with exact r2 evidence and no unverified full-UI claim.
- [ ] Run `git diff --check`, inspect the final diff, commit the r2 follow-up, and confirm a clean worktree.
