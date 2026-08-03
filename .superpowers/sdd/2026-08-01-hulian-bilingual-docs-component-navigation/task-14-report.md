# Task 14 Report — bilingual production output gates

## Outcome

Task 14 adds two DOM- and artifact-aware production gates:

- `docs:i18n:output` scans the physical English export across HTML, public human-readable JSON, Markdown, and text. It checks visible copy, metadata, accessible attributes, displayed code, JSON-LD strings, and text-bearing SVG data URIs for Han or CJK/fullwidth punctuation.
- `docs:i18n:links` inventories every physical Chinese and English route, resolves real link targets and fragments, enforces same-locale navigation, preserves query/hash state on language pairs, and requires exact canonical plus `zh-CN`, `en`, and `x-default` alternates. Every HTML route must also have a non-empty title and description.

The narrow `data-i18n-allow-cjk` escape applies only to the annotated node and requires nearby English explanation. Malformed JSON-LD and human-readable JSON fail closed. Diagnostics include the physical file or route plus selector/path, target, and excerpt as applicable.

Both scripts are wired at the root and `apps/www` package levels. Root development dependencies include Cheerio for deterministic DOM parsing.

## TDD evidence

Initial RED on Node 22.22.3:

- `node --test scripts/check-english-output.test.mjs scripts/check-bilingual-links.test.mjs` failed with `ERR_MODULE_NOT_FOUND` because neither gate existed.

Final GREEN:

- focused gate suite: 14/14 passed;
- all repository script tests: 138/138 passed.

Coverage includes physical `404` and `_not-found` routes, `.html` and `/index.html` normalization, relative/root/encoded URLs, query/hash preservation, assets, missing targets and fragments, JavaScript URLs, duplicate locale prefixes, exact language-control exemptions, title/description, canonical/hreflang completeness, visible/hidden DOM distinctions, accessible attributes, JSON-LD, malformed structured input, SVG data URIs, and node-scoped CJK annotations.

## Defects exposed and corrected

The real gates found output defects that narrower source checks did not:

- English route metadata, JSON-LD, component roles, demo descriptions, and showcase copy still contained Chinese.
- Several pages inherited a root canonical instead of declaring their exact route; component, block, and page detail routes now publish exact canonical and complete language alternates.
- Demo breadcrumbs and native anchors crossed locale boundaries; navigation now preserves the active locale, including Hanship's production-domain link.
- Showcase and composition examples linked to nonexistent local routes/fragments; intentional placeholders now use explicit external example targets.
- Password Generator documentation linked to a non-public ConfigProvider route.
- The home Foundations marquee used a foreground/background pair below the serious contrast threshold; its tag now uses the solid neutral treatment.

## Verification

All commands used Node 22.22.3.

- `node --test scripts/check-english-output.test.mjs scripts/check-bilingual-links.test.mjs` — PASS 14/14.
- `pnpm test:scripts` — PASS 138/138.
- `DOCS_LOCALE=zh-CN pnpm --filter www typecheck` — PASS.
- `DOCS_LOCALE=en pnpm --filter www typecheck` — PASS.
- `pnpm docs:check:routes` — PASS 769 bilingual routes.
- `pnpm docs:check:output` — PASS 170 Task 9 routes plus `/en/404`.
- `pnpm docs:i18n:check` — PASS.
- `pnpm conventions:check` — PASS; executable 4, advisories 1078.
- `pnpm registry:smoke:pages` — PASS 20/20 pages.
- `pnpm docs:check:artifacts` — PASS 7/7.
- `git diff --check` — PASS.

The final production build includes Task 15 commit `72f071f`. Both locale exports produced 774 pages and merged into 769 bilingual routes. The English output scan covered 1,598 files (770 HTML, 454 JSON, 374 text) with zero unapproved CJK residue. The link/SEO crawl verified 769 Chinese routes, 769 English routes, and 130,319 links across 17,388 physical files. The released `out` therefore includes the exact English `按钮` identity correction and passed both Task 14 gates.

Known non-fatal build warnings remain: Next workspace-root inference in the worktree; absent optional Intlayer compiler integration; the existing dynamic component-document filesystem lookup's broad tracing/NFT warnings; and one generated CSS malformed-candidate warning. They did not prevent either 774-page locale export or post-build validation.
