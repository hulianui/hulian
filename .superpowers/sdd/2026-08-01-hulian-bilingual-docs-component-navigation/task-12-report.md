# Task 12 report: Translate Consumer, Mobile, and Marketing Demos

## Status

COMPLETE. Live, Mobile, Personal, Shop, and Website now render reviewed Chinese
and English copy from the same React route trees. The production-export browser
gate covers all 54 public route instances and six meaningful interaction flows.

## Implementation

- Added or completed 76 colocated Intlayer `*.content.ts` catalogs across the
  five demo families: Live 10, Mobile 9, Personal 14, Shop 26, and Website 17.
- Localized route chrome, fixture data, error/loading/empty states, feedback,
  accessible names, products and SKUs, live events and chat, service bookings,
  portfolio content, marketing forms, testimonials, and same-language links.
- Preserved canonical IDs, reducer actions, route parameters, dates, prices,
  order/status protocol values, and deterministic relationships. Display maps
  own translated labels where the underlying values must remain stable.
- Extended the executable demo inventory to 19 families and added Task 12
  editorial checks for reviewed terminology, fixture syntax, semantic catalog
  keys, complete consumption, and known machine-translation artifacts.
- Split demo navigation into `demoHref` for Next Link/router calls and
  `demoLocationHref` for native anchors, UI link components, breadcrumbs, and
  imperative browser navigation. This keeps English navigation under `/en`
  without producing either `/demos/...` or `/en/en/...` links.
- Added English intent matching to the Live AI support flow and persistent,
  accessible booking confirmation to the Mobile service flow.
- Kept Mobile service categories and tags as stable protocol IDs. Category and
  tag labels are localized only at presentation boundaries, while centralized
  tag-tone mappings remain independent of display copy. Text-bearing service
  cover SVGs now receive the localized category label explicitly.

## Upstream component locale gaps fixed

The real English production export exposed Chinese defaults owned by ten shared
UI components: `Navbar`, `TabBar`, `Snippet`, `PullToRefresh`, `LivePlayer`,
`LiveChat`, `LiveProductCard`, `Sortable`, `Coupon`, and
`ColorSwatchPicker`.

Each component now reads optional values from `ComponentLocale`; `zhCN` and
`enUS` supply complete defaults, existing partial custom dictionaries retain
the exact Chinese legacy fallback, and explicit public props continue to win.
Focused default/enUS/legacy/precedence tests and paired Chinese/English docs
cover the new contracts.

## Production browser gate

`scripts/check-task12-demo-output.mjs` serves the merged static export and uses
Chromium to verify:

- all 54 `/en/demos/...` route instances return successfully, retain
  `lang="en"`, render a route-specific marker, and contain no Han/CJK or
  fullwidth residue across visible content, `aria-label`, `title`, `alt`, or
  `placeholder` surfaces and decoded text-bearing SVG data URIs;
- no reviewed anchor loses `/en` or duplicates it as `/en/en`;
- known error/retry UI is rejected unless declared as a route's designed
  fail-once precondition, after which the route must recover to a distinct
  success marker;
- Personal guestbook recovers, Live AI support answers an English delivery
  question, Mobile booking renders persistent English confirmation, Shop
  recovers and opens a product without losing locale, and both Website navbar
  and command-menu pricing navigation remain in English.

The route and interaction inventory, accessible-surface scan, and failure
detection have Node regressions and the command is wired as
`pnpm docs:check:task12-demos`.

## TDD and defect evidence

- The initial inventory test failed on the five unregistered families and
  untranslated display sources before their catalogs and consumers landed.
- Fixture review caught and rejected awkward Website hero copy before the
  reviewed replacement was accepted.
- The first production scans exposed six component-owned locale gaps; focused
  enUS tests failed 6/6 before the locale contracts, then passed 53/53.
- A later production scan exposed four more component-owned defaults; the four
  new enUS regressions failed while 56 existing assertions passed, then all
  four files passed 60/60 after the compatible locale additions.
- Production navigation reproduced both `/en/en/...` Next links and `/demos/...`
  native/UI links before the two explicit href contracts and browser rejection
  were added.
- The interaction gate exposed Chinese-only Live intent regexes and a
  toast-only Mobile booking confirmation. Both received behavior fixes and
  regressions before the final 54-route scan passed.
- Review round one reproduced all five Important findings before production
  fixes: Mobile tags were translated labels and decoded covers still contained
  `家政保洁`; the Website command menu navigated to `/demos/website/pricing`
  and timed out waiting for `/en/demos/website/pricing`; enUS LiveChat rendered
  `Alex：`, while the gate ignored both `：` and `＋` and had no SVG decoder;
  Coupon could not render the exact complete values `8.5折` or `15% off` and an
  old suffix dictionary produced `8.5` + `off`; both Website catalogs exposed
  `SOC 2 / Class III compliance` instead of the contextual standard name.
- The corresponding regressions now prove stable Mobile tag IDs/tone maps and
  localized decoded covers, `demoLocationHref` command navigation, exact
  LiveChat/default/legacy separators, fullwidth/SVG gate coverage, complete
  Coupon formatters with legacy Chinese fallback, and consistent
  `SOC 2 / MLPS Level 3 compliance` copy.

## Verification

All commands used Node 22.22.3.

| Command / check | Result |
| --- | --- |
| `pnpm exec turbo run test --concurrency=1` | PASS, all 5 test tasks; WWW 311 passed / 4 locale-specific skipped, UI 3601/3601, Guard 13/13, MCP 103/103, Mocks 7/7 |
| `DOCS_LOCALE=en pnpm --filter www test -- app/demos/lib/demo-i18n-coverage.test.ts app/demos/task12-fixture-quality.test.ts app/demos/live app/demos/mobile app/demos/personal app/demos/shop app/demos/website app/demos/_components/demo-locale.test.ts` | PASS, 5 files / 44 tests |
| `pnpm --filter @hulianui/ui test --` with the 10 affected component test files | PASS, 10 files / 113 tests |
| `DOCS_LOCALE=en pnpm --filter www exec vitest run app/demos/task12-fixture-quality.test.ts app/demos/lib/demo-i18n-coverage.test.ts` | PASS, 31/31 tests |
| `pnpm --filter @hulianui/ui exec vitest run src/live-chat/live-chat.test.tsx src/coupon/coupon.test.tsx` | PASS, 28/28 tests |
| `pnpm test:scripts` | PASS, 103/103 tests |
| `DOCS_LOCALE=en pnpm --filter www typecheck` | PASS |
| `pnpm --filter @hulianui/ui typecheck` | PASS |
| `pnpm --filter www demos:coverage` | PASS, 202/369 components covered and 0 remote assets |
| `pnpm docs:all` | PASS, registry and conventions regenerated |
| `pnpm docs:build` | PASS, two 774-page builds merged into 769 bilingual routes |
| `pnpm docs:check:routes` | PASS, 769 bilingual routes |
| `pnpm docs:check:output` | PASS, 170 Task 9 routes plus `/en/404` |
| `pnpm docs:i18n:check` | PASS, component Markdown coverage complete |
| `pnpm conventions:check` | PASS, 4 executable rules and 1072 advisories |
| `pnpm registry:smoke:pages` | PASS, 20/20 pages installed and typechecked |
| `pnpm docs:check:task12-demos` | PASS, 54 routes / 6 interactions, including command-menu navigation and decoded SVG/fullwidth scanning |
| `git diff --check` | PASS |

The production builds retained the existing non-fatal worktree-root,
Turbopack/NFT tracing, optional Intlayer SWC, generic dictionary-key, and CSS
optimizer warnings. Both locale builds and the merged export completed.

The focused UI suite also retains existing non-fatal React `act(...)` warnings
in PullToRefresh and Sortable tests; all 113 assertions pass.

The first unconstrained root `pnpm test` run exposed four Task 12 assertions
that were intentionally English-specific but still executed under the default
Chinese locale. Those assertions now skip only outside `DOCS_LOCALE=en`; the
locale-independent catalog/consumption checks still run in both suites. That
same concurrent Turbo run also hit the existing 30-second ComponentTree timing
limit. The default-locale WWW suite then passed independently (35 files, 311
passed and four English-only assertions skipped), including ComponentTree in
13.3 seconds. Finally the complete monorepo suite passed with Turbo concurrency
set to one, while the dedicated English suite continued to run all 44 Task 12
assertions.

## Generated artifacts

Locale-aware component imports were regenerated into
`apps/www/public/registry.json`, and component convention advisories were
regenerated after the ten shared locale contracts and paired docs changed.
