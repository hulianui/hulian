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

The production export and review follow-up exposed component-owned Chinese
defaults in eight shared components:

- `Tour` now reads navigation, finish, skip, close, dialog, and progress copy
  from `ComponentLocale`, while explicit text props still win and missing
  providers retain the exact Chinese defaults.
- `Calendar` now reads its title formatter, weekday/month names, navigation,
  accessible label, and Today/This month/This year copy from
  `ComponentLocale`, while preserving ISO values and date-selection behavior.
- `Scheduler` now localizes its toolbar, view labels, weekday/month formatting,
  overflow summary, and event accessible names through `ComponentLocale`.
- `Mentions` now localizes the suggestions listbox name.
- `Video`, `DatePicker`, `DateTimePicker`, and `TimeField` now localize the
  control labels, placeholders, time-column labels, empty state, and clear
  actions exposed by the reviewed English Scheduler and Learn flows.

All additions are optional in `ComponentLocale` so existing custom component
dictionaries remain source-compatible. Focused provider and compatibility tests
cover the behavior.

## Browser and quality gate

`scripts/check-task11-demo-output.mjs` serves the real merged static export and
uses Chromium to verify:

- all 11 explicit `/en/demos/...` routes return successfully, retain
  `lang="en"`, show their reviewed marker, and contain no visible Han text;
- the AI Chat quicksort suggestion completes its local streamed response and
  renders the JavaScript implementation;
- AI Workflow opens localized notifications with semantic relative times and
  navigates to the English template page without losing `/en` or `lang="en"`;
- Learn opens the Discussion tab and verifies the localized Mentions listbox;
- Scheduler recovers from its loading error, opens a seeded event, creates a
  new appointment, verifies its toast and calendar event, and scans visible and
  accessible text after every state change; and
- Dashboard renders eight nonempty Recharts SVG paths and proves the canonical
  data-source status is mapped before the localized toast is rendered.

The exact route inventory and marker parity have a Node test and the browser
command is wired into CI after the existing admin-demo scan.

## Review follow-up

- Replaced Task 11's broad file-level Chinese protocol allowances with exact
  literal exemptions. Every exemption now records a reason and source-level
  mapping evidence, and the gate fails if either is absent or stale.
- Preserved Scheduler appointment-type and Dashboard data-source identifiers as
  canonical protocol values while mapping every displayed label and toast
  through locale-aware dictionaries.
- Replaced AI Workflow's hard-coded relative times with semantic catalog keys.
- Added a route-wide English browser scan over body text plus `aria-label`,
  `title`, `alt`, and `placeholder` surfaces, including post-interaction states.
- Mounted the missing Dashboard `ToastProvider` in the dashboard route layout;
  a source regression assertion and the production-export browser interaction
  now prove status feedback is actually visible.

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
| `pnpm --filter www exec vitest run app/demos/lib/demo-i18n-coverage.test.ts app/demos/task11-fixture-quality.test.ts app/demos/ai-chat/ai-chat-i18n.test.ts` | PASS, 3 files / 52 tests |
| `pnpm --filter www test -- --reporter=dot` | PASS, 33 files / 302 tests |
| `pnpm --filter @hulianui/ui test -- scheduler/scheduler.test.tsx mentions/mentions.test.tsx video/video.test.tsx date-picker/date-picker.test.tsx date-time-picker/date-time-picker.test.tsx time-field/time-field.test.tsx --run` | PASS, 6 files / 114 tests |
| `DOCS_LOCALE=en pnpm --filter www typecheck` | PASS |
| `pnpm --filter @hulianui/ui typecheck` | PASS |
| `pnpm test:scripts` | PASS, 98/98 tests |
| `pnpm docs:all` | PASS, regenerated component docs, registry, conventions, and changelog artifacts |
| `pnpm docs:build` | PASS, both locale builds generated 774/774 pages and merged 769 bilingual routes |
| `pnpm docs:check:output` | PASS, 170 Task 9 routes plus `/en/404` |
| `pnpm docs:check:routes` | PASS, 769 bilingual routes |
| `pnpm docs:i18n:check` | PASS, component Markdown coverage complete |
| `pnpm conventions:check` | PASS, 4 executable rules and 1059 advisories |
| `pnpm registry:smoke:pages` | PASS, 20/20 pages installed and typechecked in isolated consumers |
| `pnpm docs:check:task11-demos` | PASS, 11 routes and 8 nonempty chart paths |
| `git diff --check` | PASS |

The production builds retained the existing non-fatal worktree-root,
Turbopack/NFT tracing, optional Intlayer SWC, and generated CSS warnings. Both
locale builds and the merged export completed successfully.

## Generated artifacts

The locale-aware `Calendar` and `Tour` imports were regenerated into
`apps/www/public/registry.json`, keeping their published registry dependencies
aligned with the runtime `ConfigProvider` usage.
