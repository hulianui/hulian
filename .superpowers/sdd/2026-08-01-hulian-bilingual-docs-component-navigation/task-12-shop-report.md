# Task 12 report: Translate Shop demos

## Status

COMPLETE for the owned `apps/www/app/demos/shop/**` subtree. Eleven public
Shop routes now render reviewed Chinese or English copy from the same React
trees. Commit: `b2dbfbd` (`feat(www): translate shop demos`).

## Implementation

- Added 26 adjacent Intlayer `*.content.ts` catalogs and connected all 26
  display-bearing Shop sources to semantic, fully consumed keys.
- Localized the storefront, category/product browsing, product detail, cart,
  checkout, favorites, comparison, orders, account, mobile storefront, login,
  navigation, toast, error/empty states, accessible labels, and seeded data.
- Editorially reviewed 16 products, 15 reviews, 6 categories, 6 coupons, and 5
  orders. Product IDs, category IDs, coupon kinds/statuses, order IDs/statuses,
  review IDs/product relationships, dates, prices, and other protocol values
  remain stable.
- Routed Shop navigation through `withDocsBasePath`, so English pages stay
  under `/en/demos/shop`, including imperative login/order redirects.
- Added locale-aware compact sales formatting; English renders `12K` rather
  than the Chinese-only `1.2万` convention.

## TDD evidence

- The focused inventory/fixture test first failed on untranslated products,
  SKU options, categories, and order status labels, then passed after the
  catalogs and consumers were completed.
- The English navigation assertion first reproduced `/demos/shop`, then passed
  with `/en/demos/shop` after the Shop base path was localized.
- The compact-count regression first failed because no locale-aware formatter
  existed, then passed with `formatCompactCount(12_000) === "12K"`.

## Verification

All commands used Node 22.22.3 and `DOCS_LOCALE=en` where applicable.

| Command / check | Result |
| --- | --- |
| `pnpm --filter www exec vitest run app/demos/shop/shop-i18n.test.ts --reporter=verbose` | PASS, 1 file / 4 tests |
| `pnpm --filter www typecheck` | PASS |
| `pnpm --filter www exec vitest run app/demos/lib/demo-i18n-coverage.test.ts app/demos/shop/shop-i18n.test.ts --reporter=dot` | Shop PASS; shared suite 28/29, with the only failure outside this task (`personal/_components/work-detail.content.ts` has unused key `online`) |
| `git diff --cached --check` before commit | PASS |

The shared Task 12 production-export/browser gate is owned by the coordinating
agent and runs after all Task 12 demo families are integrated. Shop preserves
its required browser markers: `Flash sale`, `All products`, and `Add to cart`.

## Counts and handoff

- 53 committed files: 26 new catalogs, 26 updated consumers, and 1 focused
  regression test.
- Diff: 3,211 insertions and 705 deletions.
- No shared files or files outside `apps/www/app/demos/shop/**` were included in
  the commit.
- Shared request: remove or consume the unrelated Personal catalog key
  `online`, then rerun the aggregate demo coverage and Task 12 browser gate.
