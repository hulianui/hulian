# Task 11 report: Translate AI, Knowledge, Education, Scheduling, and Dashboard Demos

## Status

COMPLETE. AI Chat, AI Workflow, Knowledge, Learn, Scheduler, and Dashboard now
render reviewed Chinese and English copy from the same React route trees. The
browser gate covers 11 exported English routes, including the five AI Workflow
routes and a real Learn course detail route.

## Implementation

- Added 53 colocated Intlayer `*.content.ts` catalogs across the six demo
  families. Routes, shells, fixtures, dialogs, forms, empty/loading states,
  chart labels, accessible names, seeded prose, Markdown, code responses, and
  toast feedback now consume semantic catalog keys.
- Completed a contextual editorial pass over the English AI, product,
  knowledge-base, course, clinic, and traffic-operations copy. The fixture gate
  locks 27 reviewed terms, rejects 25 known machine-translation artifacts, and
  validates displayed Markdown, JavaScript, and JSON payloads.
- Added Task 11 to the executable demo inventory. Adjacent catalog parity,
  catalog consumption, English CJK residue, semantic key names, and explicit
  internal-protocol exemptions are checked from source rather than maintained
  as a prose-only ledger.
- Kept canonical discriminators stable where they are business protocol values:
  AI Workflow template categories, Learn course levels, Scheduler appointment
  types, Dashboard regions/statuses/event levels/data sources, and AI Chat
  conversation groups remain unchanged. Presentation maps supply locale-aware
  labels. The AI Workflow node-library group is presentation-only and now uses
  locale-neutral internal IDs.
- Added a deterministic English intent router for the local AI Chat stream so
  English weather, quicksort, closure, and fallback suggestions select the
  intended fixture without changing the shared mocks package.

## Upstream component locale gaps fixed

The production export exposed two component-owned Chinese defaults:

- `Tour` now reads navigation, finish, skip, close, dialog, and progress copy
  from `ComponentLocale`, while explicit text props still win and missing
  providers retain the exact Chinese defaults.
- `Calendar` now reads its title formatter, weekday/month names, navigation,
  accessible label, and Today/This month/This year copy from
  `ComponentLocale`, while preserving ISO values and date-selection behavior.

Both additions are optional in `ComponentLocale` so existing custom component
dictionaries remain source-compatible. Focused provider and compatibility tests
cover the behavior.

## Browser and quality gate

`scripts/check-task11-demo-output.mjs` serves the real merged static export and
uses Chromium to verify:

- all 11 explicit `/en/demos/...` routes return successfully, retain
  `lang="en"`, show their reviewed marker, and contain no visible Han text;
- the AI Chat quicksort suggestion completes its local streamed response and
  renders the JavaScript implementation;
- the AI Workflow template page renders its translated category;
- the Scheduler new-appointment interaction exposes translated appointment
  types and clinic rooms without Chinese residue; and
- the Dashboard renders eight nonempty Recharts SVG paths.

The exact route inventory and marker parity have a Node test and the browser
command is wired into CI after the existing admin-demo scan.

## TDD and defect evidence

- The Task 11 inventory and semantic-key tests failed before the new catalogs
  and consumers were complete, then passed across all six demo trees.
- The Tour enUS test first reproduced the Chinese defaults before the locale
  integration was implemented.
- The first browser run found visible Chinese node-group and Tour text in AI
  Workflow. A later run found Calendar month and weekday text in Scheduler.
  Both defects received focused regressions before the final scan.
- The interaction scan then proved that the English quicksort suggestion was
  being routed to the fallback fixture. The English intent-routing unit test
  failed first, then passed with the corrected local selector.

## Verification

All commands used Node 22.22.3.

| Command / check | Result |
| --- | --- |
| `pnpm --filter www exec vitest run app/demos/lib/demo-i18n-coverage.test.ts app/demos/task11-fixture-quality.test.ts app/demos/ai-chat/ai-chat-i18n.test.ts` | PASS, 3 files / 50 tests |
| `pnpm --filter @hulianui/ui test -- calendar/calendar.test.tsx tour/tour.test.tsx` | PASS, 2 files / 32 tests |
| `DOCS_LOCALE=en pnpm --filter www typecheck` | PASS |
| `pnpm --filter @hulianui/ui typecheck` | PASS |
| `pnpm test:scripts` | PASS, 96/96 tests |
| `pnpm docs:build` | PASS, both locale builds generated 774/774 pages and merged 769 bilingual routes |
| `pnpm docs:check:routes` | PASS, 769 bilingual routes |
| `pnpm docs:check:task11-demos` | PASS, 11 routes and 8 nonempty chart paths |
| `git diff --check` | PASS |

The production builds retained the existing non-fatal worktree-root,
Turbopack/NFT tracing, optional Intlayer SWC, and generated CSS warnings. Both
locale builds and the merged export completed successfully.

## Generated artifacts

The locale-aware `Calendar` and `Tour` imports were regenerated into
`apps/www/public/registry.json`, keeping their published registry dependencies
aligned with the runtime `ConfigProvider` usage.
