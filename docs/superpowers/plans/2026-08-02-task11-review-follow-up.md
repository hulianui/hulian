# Task 11 Review Follow-up Plan

**Goal:** Close all Task 11 review findings without changing canonical protocols, action identifiers, RSC/API contracts, or Task 12 scope.

**Constraints:** Work inline without sub-agents. Preserve Chinese defaults and legacy custom locale compatibility. Add failing tests before each behavior change.

## 1. Scheduler and Mentions component locales

- Add red component tests for English Scheduler labels/formatting and Mentions listbox accessible name.
- Extend `ComponentLocale` with optional `scheduler` and `mentions` sections, including `zhCN` and `enUS` values.
- Thread locale values through Scheduler geometry/month/time-grid rendering while keeping Chinese fallbacks.
- Document the bilingual component contracts and rerun focused UI tests/typecheck.

## 2. Scheduler demo behavior

- Add fixture/contract assertions that appointment types are mapped through `TYPE_LABELS`.
- Replace every user-visible raw type with its locale display label.
- Extend browser coverage to retry loading, inspect events and detail, submit an appointment form, and scan visible/accessibility text for CJK.

## 3. AI workflow notifications and dashboard toast

- Add red catalog/fixture tests for semantic relative-time notification keys and localized node-status toast text.
- Move relative-time text to the workflow content catalog and map canonical dashboard statuses to display labels.
- Extend browser coverage to open notifications and trigger the dashboard interaction.

## 4. AST coverage gate

- Add red gate tests proving broad file-level protocol exemptions are rejected.
- Replace them with exact documented literal exemptions and mapping-evidence requirements.
- Preserve canonical Chinese protocol values only where runtime display mapping is demonstrated.

## 5. Navigation and full verification

- Add a real English navigation click and assert `/en`, `<html lang="en">`, and the route marker.
- Regenerate docs artifacts and verify drift.
- Run focused tests, full proportional tests, UI/WWW typechecks, docs build/output/routes, and browser checks.
- Review the final diff, commit the follow-up, and confirm a clean worktree.
