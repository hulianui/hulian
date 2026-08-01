# Hulian Bilingual Docs and Component Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship complete Chinese and English versions of both public documentation sites, with stable `/en` URLs and fast language-preserving navigation to every component.

**Architecture:** Build the same Next.js static application twice from one source tree: Chinese at the existing root paths and English with `basePath=/en`, then merge both exports. Use Intlayer for typed, colocated bilingual content, explicit English Markdown files for long component documentation, and build-time coverage/link/CJK gates so missing translations cannot fall back silently.

**Tech Stack:** Next.js 16 App Router static export, React 19, TypeScript 7, Intlayer 9.1.1, `@hulianui/ui`, Vitest, Node test runner, Playwright, Cheerio 1.2.0, pnpm 8.15.5.

## Global Constraints

- Keep every existing Chinese URL unchanged; English equivalents live under `/en`.
- `hulianui.haloritual.com` defaults to English and `hulianui-zh.haloritual.com` defaults to Chinese when no explicit preference exists.
- Both domains must serve both languages and remember a manual language choice in same-origin `localStorage`.
- English mode covers all public pages, previews, demos, business fixtures, metadata, accessible labels, and displayed code-copy strings.
- Do not change the public API of `@hulianui/ui`.
- Do not maintain duplicate React page trees.
- Disable Intlayer middleware, CMS live sync, remote dictionaries, and AI auto-fill; all published translations are Git-tracked.
- Missing English dictionaries, metadata, Markdown, routes, or visible strings fail CI instead of falling back to Chinese.
- Preserve unrelated worktree changes and stage only files owned by the current task.
- Run `pnpm llms-registry && pnpm conventions` before the existing full verification chain.

---

### Task 1: Bootstrap Intlayer Against the Existing Static App

**Files:**
- Create: `apps/www/intlayer.config.ts`
- Create: `apps/www/app/site-shell.content.ts`
- Create: `apps/www/lib/intlayer-config.test.ts`
- Modify: `apps/www/next.config.mjs`
- Modify: `apps/www/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: Intlayer dictionary key `site-shell`; Next config wrapped with `withIntlayer`; strict required locales `zh-CN` and `en`.
- Consumes: existing Next config side effect that writes `lib/ui-version.ts`.

- [ ] **Step 1: Install exact dependency floors**

Run:

```bash
pnpm --filter www add intlayer@^9.1.1 next-intlayer@^9.1.1 react-intlayer@^9.1.1
```

Expected: `apps/www/package.json` and `pnpm-lock.yaml` add all three packages without changing the pinned pnpm major.

- [ ] **Step 2: Write the failing configuration test**

```ts
import { describe, expect, it } from "vitest";
import config from "../intlayer.config";

describe("Intlayer docs configuration", () => {
  it("requires both published locales and disables runtime routing", () => {
    expect(config.internationalization?.locales).toEqual(["zh-CN", "en"]);
    expect(config.internationalization?.requiredLocales).toEqual(["zh-CN", "en"]);
    expect(config.internationalization?.strictMode).toBe("strict");
    expect(config.routing?.middleware).toBe(false);
    expect(config.dictionary?.fill).toBe(false);
  });
});
```

- [ ] **Step 3: Run the test and observe the missing module failure**

Run: `pnpm --filter www test -- lib/intlayer-config.test.ts`

Expected: FAIL because `apps/www/intlayer.config.ts` does not exist.

- [ ] **Step 4: Add strict configuration and one colocated dictionary**

```ts
// apps/www/intlayer.config.ts
import { type IntlayerConfig } from "intlayer";

const config: IntlayerConfig = {
  internationalization: {
    locales: ["zh-CN", "en"],
    requiredLocales: ["zh-CN", "en"],
    defaultLocale: "zh-CN",
    strictMode: "strict",
  },
  routing: { middleware: false, storage: false },
  dictionary: { fill: false, importMode: "static" },
  content: { contentDir: ["app", "components", "lib", "i18n"] },
};

export default config;
```

```ts
// apps/www/app/site-shell.content.ts
import { t, type Dictionary } from "intlayer";

export default {
  key: "site-shell",
  content: {
    nav: {
      start: t({ "zh-CN": "开始", en: "Start" }),
      components: t({ "zh-CN": "组件", en: "Components" }),
      blocks: t({ "zh-CN": "区块", en: "Blocks" }),
      pages: t({ "zh-CN": "页面", en: "Pages" }),
      demos: t({ "zh-CN": "模版", en: "Demos" }),
      changelog: t({ "zh-CN": "更新", en: "Changelog" }),
    },
  },
} satisfies Dictionary;
```

Wrap the existing exported Next config with `withIntlayer` while preserving the version-file generation and all existing config fields.

- [ ] **Step 5: Run the focused tests and a compatibility build**

Run:

```bash
pnpm --filter www test -- lib/intlayer-config.test.ts
DOCS_LOCALE=zh-CN pnpm --filter www build
```

Expected: focused test PASS; existing single static site builds successfully with Intlayer enabled.

- [ ] **Step 6: Commit the compatibility foundation**

```bash
git add apps/www/intlayer.config.ts apps/www/app/site-shell.content.ts apps/www/lib/intlayer-config.test.ts apps/www/next.config.mjs apps/www/package.json pnpm-lock.yaml
git commit -m "feat(www): bootstrap strict Intlayer content"
```

---

### Task 2: Add Locale and URL Primitives

**Files:**
- Create: `apps/www/lib/docs-locale.ts`
- Create: `apps/www/lib/docs-locale.test.ts`

**Interfaces:**
- Produces: `DocsLocale`, `DOCS_LOCALE`, `DOCS_BASE_PATH`, `withDocsBasePath(path)`, `stripDocsBasePath(path)`, `switchLocaleUrl(url, locale)`, and `defaultLocaleForHost(host, stored)`.
- Consumes: `process.env.DOCS_LOCALE`, `process.env.NEXT_PUBLIC_DOCS_LOCALE`, and the two production hostnames.

- [ ] **Step 1: Write URL behavior tests**

```ts
import { describe, expect, it } from "vitest";
import {
  defaultLocaleForHost,
  stripDocsBasePath,
  switchLocaleUrl,
  withDocsBasePath,
} from "./docs-locale";

describe("docs locale URLs", () => {
  it("preserves query and hash while switching", () => {
    expect(switchLocaleUrl("/components/button?q=x#api", "en"))
      .toBe("/en/components/button?q=x#api");
    expect(switchLocaleUrl("/en/components/button?q=x#api", "zh-CN"))
      .toBe("/components/button?q=x#api");
  });

  it("does not double-prefix English paths", () => {
    expect(withDocsBasePath("/en/components/button", "en"))
      .toBe("/en/components/button");
    expect(stripDocsBasePath("/en/components/button"))
      .toBe("/components/button");
  });

  it("uses host defaults only when there is no stored choice", () => {
    expect(defaultLocaleForHost("hulianui.haloritual.com", null)).toBe("en");
    expect(defaultLocaleForHost("hulianui-zh.haloritual.com", null)).toBe("zh-CN");
    expect(defaultLocaleForHost("hulianui.haloritual.com", "zh-CN")).toBe("zh-CN");
  });
});
```

- [ ] **Step 2: Run the test and observe missing exports**

Run: `pnpm --filter www test -- lib/docs-locale.test.ts`

Expected: FAIL because `docs-locale.ts` does not exist.

- [ ] **Step 3: Implement the pure locale helpers**

```ts
export type DocsLocale = "zh-CN" | "en";
export const DOCS_LOCALE: DocsLocale =
  process.env.NEXT_PUBLIC_DOCS_LOCALE === "en" ? "en" : "zh-CN";
export const DOCS_BASE_PATH = DOCS_LOCALE === "en" ? "/en" : "";
export const LOCALE_STORAGE_KEY = "hulian-docs-locale";

export function stripDocsBasePath(path: string): string {
  return path === "/en" ? "/" : path.startsWith("/en/") ? path.slice(3) : path;
}

export function withDocsBasePath(path: string, locale = DOCS_LOCALE): string {
  const bare = stripDocsBasePath(path.startsWith("/") ? path : `/${path}`);
  return locale === "en" ? `/en${bare === "/" ? "" : bare}` : bare;
}
```

Implement `switchLocaleUrl` with the URL constructor and `defaultLocaleForHost` with explicit stored-choice precedence.

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
pnpm --filter www test -- lib/docs-locale.test.ts
pnpm --filter www typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit locale primitives**

```bash
git add apps/www/lib/docs-locale.ts apps/www/lib/docs-locale.test.ts
git commit -m "feat(www): add bilingual URL primitives"
```

---

### Task 3: Build and Merge Two Static Exports

**Files:**
- Create: `scripts/build-bilingual-docs.mjs`
- Create: `scripts/build-bilingual-docs.test.mjs`
- Modify: `apps/www/next.config.mjs`
- Modify: `apps/www/package.json`
- Modify: `package.json`

**Interfaces:**
- Produces: `routeSet(root)`, `assertRouteParity(zhRoot, enRoot)`, `mergeExports(zhRoot, enRoot, finalRoot)`; final `apps/www/out` containing root Chinese pages and `en/` English pages.
- Consumes: `build:locale` script and locale environment variables.

- [ ] **Step 1: Write failing filesystem tests**

Create temporary fixture trees with `index.html`, `components/button.html`, `_next/a.js`, and `logo.svg`. Assert parity ignores `_next` and public assets, and assert merge creates `out/components/button.html` plus `out/en/components/button.html` and `out/en/_next/a.js`.

Run: `node --test scripts/build-bilingual-docs.test.mjs`

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement safe merge primitives**

Use only explicit directories under `apps/www/.bilingual-build/{zh,en,final}`. Resolve each path, assert it starts with the resolved `.bilingual-build` root before removing it, copy Chinese first, then copy the entire English export into `final/en`, and rename `final` to `apps/www/out` only after parity passes.

- [ ] **Step 3: Add locale-sensitive Next config**

```js
const docsLocale = process.env.DOCS_LOCALE === "en" ? "en" : "zh-CN";
const basePath = docsLocale === "en" ? "/en" : "";

const nextConfig = {
  output: "export",
  basePath,
  env: { NEXT_PUBLIC_DOCS_LOCALE: docsLocale },
  // preserve existing images, transpilePackages, and experimental settings
};
```

- [ ] **Step 4: Split single-locale and bilingual scripts**

In `apps/www/package.json` make `build:locale` run generation plus `next build`; make `build` invoke the root bilingual builder. At the root add `docs:build` and `docs:check:routes` scripts.

- [ ] **Step 5: Run unit tests and the real double build**

Run:

```bash
node --test scripts/build-bilingual-docs.test.mjs
pnpm --filter www build
test -f apps/www/out/index.html
test -f apps/www/out/en/index.html
test -f apps/www/out/components/button.html
test -f apps/www/out/en/components/button.html
```

Expected: tests PASS and all four files exist.

- [ ] **Step 6: Commit bilingual build orchestration**

```bash
git add scripts/build-bilingual-docs.mjs scripts/build-bilingual-docs.test.mjs apps/www/next.config.mjs apps/www/package.json package.json
git commit -m "feat(www): build merged Chinese and English exports"
```

---

### Task 4: Wire Providers, Default-Language Boot, and Language Switcher

**Files:**
- Create: `apps/www/components/docs-providers.tsx`
- Create: `apps/www/components/language-switcher.tsx`
- Create: `apps/www/components/language-switcher.test.tsx`
- Create: `apps/www/lib/language-init-script.ts`
- Create: `apps/www/lib/language-init-script.test.ts`
- Modify: `apps/www/app/layout.tsx`
- Modify: `apps/www/components/site-navbar.tsx`
- Modify: `apps/www/components/region-mirror-banner.tsx`
- Modify: `apps/www/components/region-mirror-banner.test.tsx`

**Interfaces:**
- Produces: `<DocsProviders>`, `<LanguageSwitcher>`, and `languageInitScript`.
- Consumes: Task 1 Intlayer provider and Task 2 locale helpers.

- [ ] **Step 1: Write tests for switcher and boot policy**

Test that the English switch link from `/components/button?q=x#api` is `/en/components/button?q=x#api`, clicking stores `en`, the Chinese link stores `zh-CN`, and the boot policy chooses English only for the main host without an explicit stored choice. Extend mirror-banner tests so its link preserves `/en` pages.

- [ ] **Step 2: Run tests and verify failures**

Run: `pnpm --filter www test -- components/language-switcher.test.tsx lib/language-init-script.test.ts components/region-mirror-banner.test.tsx`

Expected: FAIL on missing switcher and boot module.

- [ ] **Step 3: Implement build-locale providers**

`DocsProviders` must wrap children with `IntlayerClientProvider locale={DOCS_LOCALE}`, `ConfigProvider locale={DOCS_LOCALE === "en" ? enUS : zhCN}`, and the existing `ThemeProvider` without duplicating overlay providers.

- [ ] **Step 4: Implement the raw-anchor language switcher**

Render one compact control with current state and two same-origin `<a>` links. Use `window.location.pathname + search + hash`, Task 2 URL helpers, and `onClick` to store the selected locale. Do not use `next/link`, because crossing the two static builds requires a full navigation.

- [ ] **Step 5: Add the pre-paint language script and localized root metadata**

Insert `languageInitScript` before the theme script. It must catch storage errors, never redirect from an `/en` path to itself, preserve query/hash, and use `location.replace`. Set `<html lang={DOCS_LOCALE}>`; choose localized title, description, Open Graph locale, JSON-LD language, canonical, and `alternates.languages` at build time.

- [ ] **Step 6: Run focused tests, typecheck, and inspect both HTML roots**

Run:

```bash
pnpm --filter www test -- components/language-switcher.test.tsx lib/language-init-script.test.ts components/region-mirror-banner.test.tsx
pnpm --filter www typecheck
pnpm --filter www build
rg '<html lang="zh-CN"' apps/www/out/index.html
rg '<html lang="en"' apps/www/out/en/index.html
```

Expected: PASS; each root has the correct language.

- [ ] **Step 7: Commit shell localization**

```bash
git add apps/www/app/layout.tsx apps/www/components/docs-providers.tsx apps/www/components/language-switcher.tsx apps/www/components/language-switcher.test.tsx apps/www/lib/language-init-script.ts apps/www/lib/language-init-script.test.ts apps/www/components/site-navbar.tsx apps/www/components/region-mirror-banner.tsx apps/www/components/region-mirror-banner.test.tsx
git commit -m "feat(www): add persistent language switching"
```

---

### Task 5: Localize Catalog Metadata and Search Index

**Files:**
- Create: `apps/www/i18n/component-meta.en.ts`
- Create: `apps/www/i18n/block-meta.en.ts`
- Create: `apps/www/i18n/page-meta.en.ts`
- Create: `apps/www/i18n/demo-meta.en.ts`
- Create: `apps/www/i18n/theme-meta.en.ts`
- Create: `apps/www/i18n/meta-coverage.test.ts`
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/search-index.ts`
- Modify: `apps/www/lib/search-index.test.ts`
- Modify: `apps/www/lib/theme-manifest.ts`
- Modify: `apps/www/app/blocks/_meta.ts`
- Modify: `apps/www/app/pages/_meta.ts`
- Modify: `apps/www/app/demos/lib/demos.ts`

**Interfaces:**
- Produces: exact slug-keyed English records and localized selectors `componentMeta`, `blockMeta`, `pageMeta`, `demoMeta`, `themeMeta`.
- Consumes: Task 2 `DOCS_LOCALE`.

- [ ] **Step 1: Add failing exact-key coverage tests**

Assert `Object.keys(componentMetaEn).sort()` equals `manifest.map(x => x.slug).sort()`, with equivalent assertions for blocks, pages, demos, theme categories, and component groups. Assert no English `name`, `description`, category label, or tag contains CJK.

- [ ] **Step 2: Run the coverage test**

Run: `pnpm --filter www test -- i18n/meta-coverage.test.ts`

Expected: FAIL because English maps do not exist.

- [ ] **Step 3: Add complete English maps without mutating stable identifiers**

Each record is keyed by the existing slug and contains only display fields. Example:

```ts
export const componentMetaEn = {
  button: {
    shortName: "Button",
    description: "Action trigger with solid, soft, outline, ghost, and danger variants.",
    keywords: ["action", "submit", "CTA"],
  },
} satisfies Record<ComponentSlug, LocalizedComponentMeta>;
```

Populate every key reported by the failing test. Keep `slug`, exports, dependencies, providers, replace rules, and file names in their existing source of truth.

- [ ] **Step 4: Make search documents locale-aware**

Build result titles, descriptions, type labels, categories, and keywords from the localized selectors. Prefix returned hrefs through `withDocsBasePath`. Preserve Chinese terms as alternate keywords in the English index so either language can locate a component.

- [ ] **Step 5: Extend ranking tests**

Assert English queries such as `data table`, `button`, `customer management`, and `workflow` return English labels and `/en/...` hrefs under an English build; existing Chinese ranking tests remain unchanged.

- [ ] **Step 6: Run tests and both locale typechecks**

Run:

```bash
pnpm --filter www test -- i18n/meta-coverage.test.ts lib/search-index.test.ts
DOCS_LOCALE=zh-CN pnpm --filter www typecheck
DOCS_LOCALE=en pnpm --filter www typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit localized catalogs**

```bash
git add apps/www/i18n apps/www/lib/manifest.ts apps/www/lib/search-index.ts apps/www/lib/search-index.test.ts apps/www/lib/theme-manifest.ts apps/www/app/blocks/_meta.ts apps/www/app/pages/_meta.ts apps/www/app/demos/lib/demos.ts
git commit -m "feat(www): localize documentation catalogs"
```

---

### Task 6: Add Component Quick Jump and Language-Preserving Detail Navigation

**Files:**
- Create: `apps/www/components/component-quick-jump.tsx`
- Create: `apps/www/components/component-quick-jump.test.tsx`
- Create: `apps/www/components/showcase/component-doc-nav.tsx`
- Create: `apps/www/components/showcase/component-doc-nav.test.tsx`
- Modify: `apps/www/components/docs-search.tsx`
- Modify: `apps/www/components/tier-browser.tsx`
- Modify: `apps/www/components/component-tree.tsx`
- Modify: `apps/www/app/components/page.tsx`
- Modify: `apps/www/components/showcase/component-doc.tsx`

**Interfaces:**
- Produces: `<ComponentQuickJump placement="home" | "catalog" | "navbar" />`, `findExactComponent(query)`, and `<ComponentDocNav slug>`.
- Consumes: localized search documents and paths from Tasks 2 and 5.

- [ ] **Step 1: Write interaction tests**

Cover exact English name, Chinese short name, slug, mixed-case input, ambiguous fuzzy results, keyboard ArrowDown/Enter/Escape, empty-state popular/recent items, current-language hrefs, and previous/next/category links.

- [ ] **Step 2: Run tests and observe missing components**

Run: `pnpm --filter www test -- components/component-quick-jump.test.tsx components/showcase/component-doc-nav.test.tsx`

Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement one shared quick-jump data path**

Use the component slice of `searchDocs`; do not create a second component index. Exact match compares normalized export name, short name, slug, and aliases. Enter immediately navigates only when one exact match exists; otherwise it selects the highlighted result.

- [ ] **Step 4: Place the control at all required entry points**

Add a compact navbar entry, a full-width catalog entry, and a searchable component panel in the homepage component tier. Keep category rows and “view all components”; do not render all component cards on the homepage before search.

- [ ] **Step 5: Add detail navigation and link rewriting**

Compute previous/next from manifest order inside the same category, then fall back across category boundaries. All links pass through the localized path helper. Keep existing sidebar, related Markdown links, and copied Markdown aligned to the current language.

- [ ] **Step 6: Run tests, typecheck, and focused browser checks**

Run:

```bash
pnpm --filter www test -- components/component-quick-jump.test.tsx components/showcase/component-doc-nav.test.tsx lib/search-index.test.ts
pnpm --filter www typecheck
pnpm --filter www build
```

Expected: PASS.

- [ ] **Step 7: Commit component navigation**

```bash
git add apps/www/components/component-quick-jump.tsx apps/www/components/component-quick-jump.test.tsx apps/www/components/showcase/component-doc-nav.tsx apps/www/components/showcase/component-doc-nav.test.tsx apps/www/components/docs-search.tsx apps/www/components/tier-browser.tsx apps/www/components/component-tree.tsx apps/www/app/components/page.tsx apps/www/components/showcase/component-doc.tsx
git commit -m "feat(www): add fast component navigation"
```

---

### Task 7: Make Component Markdown Bilingual and Enforce Coverage

**Files:**
- Create: `scripts/check-component-doc-translations.mjs`
- Create: `scripts/check-component-doc-translations.test.mjs`
- Create: `apps/www/lib/load-component-doc.test.ts`
- Modify: `apps/www/lib/load-component-doc.ts`
- Modify: `scripts/gen-component-docs.mjs`
- Modify: `scripts/gen-llms-registry.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: locale-aware `resolveMd(slug, locale)`, `docs:i18n:check`, and exact parity checks for `<slug>.md` / `<slug>.en.md`, including `_mui` documents.
- Consumes: manifest slugs and Task 2 locale.

- [ ] **Step 1: Write failing resolver and coverage tests**

Fixture one normal component and one `_mui` component. Assert English resolution selects `.en.md`, Chinese selects `.md`, missing English throws with the slug and expected path, related links gain `/en`, and the generator ignores `.en.md` when scaffolding Chinese docs.

- [ ] **Step 2: Run tests**

Run: `node --test scripts/check-component-doc-translations.test.mjs && pnpm --filter www test -- lib/load-component-doc.test.ts`

Expected: FAIL on missing locale-aware resolver and missing coverage script.

- [ ] **Step 3: Implement strict localized loading**

Use candidates `src/<slug>/<slug>.en.md` and `src/_mui/<slug>.en.md` for English. `loadComponentDoc` and `loadComponentMarkdownForCopy` must throw in English when a public doc is absent and must rewrite site links to `https://hulianui.haloritual.com/en/...`.

- [ ] **Step 4: Add the coverage CLI**

Support `--categories=layout,forms` and `--all`. Report missing files, CJK outside fenced code/explicit proper-noun markers, broken related-component slugs, and English files whose frontmatter slug differs from the Chinese source.

- [ ] **Step 5: Run tests and commit the pipeline before content**

Run:

```bash
node --test scripts/check-component-doc-translations.test.mjs
pnpm --filter www test -- lib/load-component-doc.test.ts
```

Expected: PASS; `pnpm docs:i18n:check` still FAIL listing every untranslated component.

```bash
git add scripts/check-component-doc-translations.mjs scripts/check-component-doc-translations.test.mjs apps/www/lib/load-component-doc.ts apps/www/lib/load-component-doc.test.ts scripts/gen-component-docs.mjs scripts/gen-llms-registry.mjs package.json
git commit -m "test(docs): enforce bilingual component documentation"
```

---

### Task 8: Translate Component Markdown in Three Reviewable Batches

**Files:**
- Create: `packages/ui/src/<slug>/<slug>.en.md` for every public component
- Create: `packages/ui/src/_mui/<slug>.en.md` for every public MUI bridge document

**Interfaces:**
- Produces: one English Markdown document for every Chinese public component document.
- Consumes: Task 7 coverage CLI and existing Chinese Markdown as the structural source.

- [ ] **Step 1: Translate layout, typography, and forms docs**

Preserve frontmatter identifiers, imports, prop names, code behavior, headings, warnings, and related links. Translate prose, comments, user-visible example strings, and link labels.

Run: `pnpm docs:i18n:check -- --categories=layout,typography,forms`

Expected: PASS for these categories.

- [ ] **Step 2: Commit batch one**

```bash
git add packages/ui/src
git commit -m "docs(ui): translate layout typography and forms"
```

- [ ] **Step 3: Translate data-display, navigation, and feedback docs**

Run: `pnpm docs:i18n:check -- --categories=data-display,navigation,feedback`

Expected: PASS for these categories.

- [ ] **Step 4: Commit batch two**

```bash
git add packages/ui/src
git commit -m "docs(ui): translate data display navigation and feedback"
```

- [ ] **Step 5: Translate ai, decoration, mockups, mobile, and MUI docs**

Run: `pnpm docs:i18n:check -- --categories=ai,decoration,mockups,mobile,uncatalogued`

Expected: PASS.

- [ ] **Step 6: Run complete doc parity and link checks**

Run:

```bash
pnpm docs:i18n:check
pnpm llms-registry
pnpm --filter www typecheck
```

Expected: every public component has one English doc and all related links resolve.

- [ ] **Step 7: Commit final component-doc batch**

```bash
git add packages/ui/src apps/www/public
git commit -m "docs(ui): complete English component documentation"
```

---

### Task 9: Translate Shared Documentation, Theme, Galleries, and Changelog

**Files:**
- Create: colocated `*.content.ts` files under `apps/www/app`, `apps/www/components`, and `apps/www/app/theme`
- Create: `apps/www/lib/ai-guide.en.ts`
- Create: `apps/www/lib/changelog.en.json`
- Modify: `apps/www/app/page.tsx`
- Modify: `apps/www/app/start/page.tsx`
- Modify: `apps/www/app/theme/**`
- Modify: `apps/www/app/blocks/**`
- Modify: `apps/www/app/pages/**`
- Modify: `apps/www/app/changelog/page.tsx`
- Modify: `apps/www/components/**`
- Modify: `scripts/gen-changelog.mjs`

**Interfaces:**
- Produces: complete localized shared docs surfaces and English changelog data.
- Consumes: Task 1 Intlayer dictionaries, Task 5 localized meta, and Task 2 paths.

- [ ] **Step 1: Add page-level smoke assertions**

Create `apps/www/lib/public-page-i18n.test.ts` that renders or reads the dictionaries for home, start, every theme page, blocks index/detail, pages index/detail, changelog, preview chrome, install panel, and search chrome. Assert both locale branches are non-empty and English branches contain no CJK.

- [ ] **Step 2: Run the smoke test and capture missing dictionaries**

Run: `pnpm --filter www test -- lib/public-page-i18n.test.ts`

Expected: FAIL with the first missing page dictionary.

- [ ] **Step 3: Migrate shared chrome and core documentation**

Move reusable labels into focused content files and page-specific prose next to its page. Translate all title, paragraph, button, placeholder, toast, aria-label, empty, loading, and error strings reported by the test.

- [ ] **Step 4: Generate and render English changelog**

Teach `gen-changelog.mjs` to create English records from committed English changeset/changelog content rather than runtime translation. The English page reads `changelog.en.json`; missing versions fail the generator.

- [ ] **Step 5: Run focused tests and both static builds**

Run:

```bash
pnpm --filter www test -- lib/public-page-i18n.test.ts
pnpm changelog
pnpm --filter www build
```

Expected: PASS; sampled core English HTML contains the expected English headings.

- [ ] **Step 6: Commit public documentation translations**

```bash
git add apps/www/app apps/www/components apps/www/lib scripts/gen-changelog.mjs
git commit -m "feat(www): translate public documentation surfaces"
```

---

### Task 10: Translate Admin and Developer Demos

**Files:**
- Modify/Create colocated content under:
  - `apps/www/app/demos/billing/**`
  - `apps/www/app/demos/crm/**`
  - `apps/www/app/demos/customer-service/**`
  - `apps/www/app/demos/projects/**`
  - `apps/www/app/demos/hanhub/**`
  - `apps/www/app/demos/hanship/**`
  - `apps/www/app/demos/hanreview/**`
  - `apps/www/app/demos/hanhelm/**`

**Interfaces:**
- Produces: English UI and English fixtures for eight admin/developer demos.
- Consumes: Intlayer content declarations and `ConfigProvider enUS` from Task 4.

- [ ] **Step 1: Add a demo-surface inventory test**

Create `apps/www/app/demos/lib/demo-i18n-coverage.test.ts` that enumerates every route and visible fixture module for these eight demos and asserts an English content source is registered.

- [ ] **Step 2: Translate each demo end to end**

For every route, translate shell navigation, login, tables, filters, forms, dialogs, toasts, charts, sample entities, seeded event streams, code comments shown in viewers, aria-labels, and error/empty/loading states. Keep protocol field names, API paths, component names, IDs, currencies, and executable code semantics unchanged.

- [ ] **Step 3: Run demo-specific unit tests and the coverage test**

Run:

```bash
pnpm --filter www test -- app/demos/lib/demo-i18n-coverage.test.ts app/demos/hanhelm app/demos/hanhub app/demos/hanreview app/demos/customer-service
DOCS_LOCALE=en pnpm --filter www typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit admin/developer demo translations**

```bash
git add apps/www/app/demos/billing apps/www/app/demos/crm apps/www/app/demos/customer-service apps/www/app/demos/projects apps/www/app/demos/hanhub apps/www/app/demos/hanship apps/www/app/demos/hanreview apps/www/app/demos/hanhelm apps/www/app/demos/lib/demo-i18n-coverage.test.ts
git commit -m "feat(www): translate admin and developer demos"
```

---

### Task 11: Translate AI, Knowledge, Education, and Visualization Demos

**Files:**
- Modify/Create colocated content under:
  - `apps/www/app/demos/ai-chat/**`
  - `apps/www/app/demos/ai-workflow/**`
  - `apps/www/app/demos/knowledge/**`
  - `apps/www/app/demos/learn/**`
  - `apps/www/app/demos/scheduler/**`
  - `apps/www/app/demos/dashboard/**`

**Interfaces:**
- Produces: English UI and fixtures for six content-heavy demos.
- Consumes: demo inventory test from Task 10.

- [ ] **Step 1: Extend inventory coverage to these six roots**

Run: `pnpm --filter www test -- app/demos/lib/demo-i18n-coverage.test.ts`

Expected: FAIL listing the newly required English content sources.

- [ ] **Step 2: Translate the six demos and deterministic fixtures**

Translate conversations, workflow nodes, file trees, course content, schedule events, dashboards, chart labels, generated notifications, empty/error/loading states, accessibility text, and displayed code strings. Preserve reducer actions, route keys, IDs, dates, and test determinism.

- [ ] **Step 3: Run affected tests and English typecheck**

Run:

```bash
pnpm --filter www test -- app/demos/lib/demo-i18n-coverage.test.ts app/demos/ai-chat app/demos/ai-workflow app/demos/knowledge app/demos/learn app/demos/scheduler app/demos/dashboard
DOCS_LOCALE=en pnpm --filter www typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit content-heavy demos**

```bash
git add apps/www/app/demos/ai-chat apps/www/app/demos/ai-workflow apps/www/app/demos/knowledge apps/www/app/demos/learn apps/www/app/demos/scheduler apps/www/app/demos/dashboard apps/www/app/demos/lib/demo-i18n-coverage.test.ts
git commit -m "feat(www): translate AI knowledge and data demos"
```

---

### Task 12: Translate Consumer, Mobile, and Marketing Demos

**Files:**
- Modify/Create colocated content under:
  - `apps/www/app/demos/live/**`
  - `apps/www/app/demos/mobile/**`
  - `apps/www/app/demos/personal/**`
  - `apps/www/app/demos/shop/**`
  - `apps/www/app/demos/website/**`
  - `apps/www/app/demos/_components/**`

**Interfaces:**
- Produces: English UI and fixtures for the remaining public demos.
- Consumes: demo inventory test from Task 10.

- [ ] **Step 1: Extend inventory coverage to all remaining routes**

Run: `pnpm --filter www test -- app/demos/lib/demo-i18n-coverage.test.ts`

Expected: FAIL listing remaining English content gaps.

- [ ] **Step 2: Translate all remaining demo surfaces**

Translate live chat/events/products, service marketplace data, portfolio content, products/SKUs/orders, marketing copy/forms/testimonials, shared demo chrome, mobile aria-labels, and all feedback states. Provide English variants for text-bearing images or replace them with language-neutral assets.

- [ ] **Step 3: Run affected tests and a complete demo coverage check**

Run:

```bash
pnpm --filter www test -- app/demos/lib/demo-i18n-coverage.test.ts app/demos/live app/demos/mobile app/demos/personal app/demos/shop app/demos/website
pnpm --filter www demos:coverage
DOCS_LOCALE=en pnpm --filter www typecheck
```

Expected: PASS; every public demo route is registered and bilingual.

- [ ] **Step 4: Commit remaining demos**

```bash
git add apps/www/app/demos/live apps/www/app/demos/mobile apps/www/app/demos/personal apps/www/app/demos/shop apps/www/app/demos/website apps/www/app/demos/_components apps/www/app/demos/lib/demo-i18n-coverage.test.ts
git commit -m "feat(www): translate consumer and marketing demos"
```

---

### Task 13: Generate English AI and Registry Artifacts

**Files:**
- Modify: `scripts/gen-llms-registry.mjs`
- Modify: `scripts/gen-conventions.mjs`
- Modify: `apps/www/lib/ai-guide.ts`
- Create: `scripts/gen-llms-registry-i18n.test.mjs`
- Modify: `apps/www/package.json`
- Modify: `package.json`

**Interfaces:**
- Produces: locale-sensitive `llms.txt`, `llms-full.txt`, `registry.json`, `/r`, `/d`, conventions, and copied AI guide during each build.
- Consumes: English Markdown and localized metadata from Tasks 5 and 8.

- [ ] **Step 1: Add failing generator tests**

Run generators against temporary output directories with `DOCS_LOCALE=zh-CN` and `DOCS_LOCALE=en`. Assert equal item/endpoint counts, English descriptions without CJK, English absolute component links under `/en`, and unchanged component names/imports/dependencies.

- [ ] **Step 2: Run tests**

Run: `node --test scripts/gen-llms-registry-i18n.test.mjs`

Expected: FAIL because generators ignore `DOCS_LOCALE`.

- [ ] **Step 3: Make generation locale-aware without dirtying tracked Chinese artifacts**

Read localized metadata and `.en.md` for English generation. The bilingual builder passes a temporary `HULIAN_REGISTRY_OUT` for each locale, copies that output into the corresponding static export, and regenerates tracked Chinese artifacts after the final merge.

- [ ] **Step 4: Run both generators and smoke all endpoints**

Run:

```bash
node --test scripts/gen-llms-registry-i18n.test.mjs
pnpm llms-registry
pnpm conventions
pnpm registry:smoke:pages
pnpm --filter www build
```

Expected: PASS; `out/registry.json` is Chinese and `out/en/registry.json` is English with equal item counts.

- [ ] **Step 5: Commit generator localization**

```bash
git add scripts/gen-llms-registry.mjs scripts/gen-conventions.mjs scripts/gen-llms-registry-i18n.test.mjs apps/www/lib/ai-guide.ts apps/www/package.json package.json apps/www/public
git commit -m "feat(docs): generate bilingual AI distribution artifacts"
```

---

### Task 14: Add English Residue, Route-Parity, and Link Gates

**Files:**
- Create: `scripts/check-english-output.mjs`
- Create: `scripts/check-english-output.test.mjs`
- Create: `scripts/check-bilingual-links.mjs`
- Create: `scripts/check-bilingual-links.test.mjs`
- Modify: `package.json`
- Modify: `apps/www/package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `docs:i18n:output`, `docs:i18n:links`, actionable failure reports including file, route, selector, and offending text.
- Consumes: merged static export from Task 3.

- [ ] **Step 1: Install the HTML parser**

Run: `pnpm add -Dw cheerio@^1.2.0`

Expected: root `package.json` and lockfile update.

- [ ] **Step 2: Write failing fixture tests**

Fixtures must prove the scanner catches visible Chinese in text, `title`, `alt`, `placeholder`, `aria-label`, metadata, JSON-LD, and displayed code; ignores scripts/styles and explicitly marked `[data-i18n-allow-cjk]`; catches missing language pairs, 404 targets, `/en/en` double prefixes, and English pages linking back to Chinese routes.

- [ ] **Step 3: Run tests and observe missing modules**

Run: `node --test scripts/check-english-output.test.mjs scripts/check-bilingual-links.test.mjs`

Expected: FAIL because scanners do not exist.

- [ ] **Step 4: Implement DOM-aware output scanning**

Use Cheerio to remove `script`, `style`, and allowed nodes, then inspect visible text and visible/accessibility attributes. The allowlist contains only exact proper nouns documented in the design; directory-wide or route-wide allowlists are rejected.

- [ ] **Step 5: Implement route parity and internal link crawling**

Normalize `.html` and `/index.html`, compare every Chinese route with `/en`, resolve relative links, ignore external schemes, and require same-language targets except the language switcher.

- [ ] **Step 6: Run gates on the real build**

Run:

```bash
pnpm --filter www build
pnpm docs:i18n:output
pnpm docs:i18n:links
```

Expected: PASS with zero unapproved CJK text and zero broken/cross-language links.

- [ ] **Step 7: Commit output gates**

```bash
git add scripts/check-english-output.mjs scripts/check-english-output.test.mjs scripts/check-bilingual-links.mjs scripts/check-bilingual-links.test.mjs package.json apps/www/package.json pnpm-lock.yaml
git commit -m "test(docs): gate English output and bilingual links"
```

---

### Task 15: Extend Browser, Accessibility, and Responsive Verification to Both Languages

**Files:**
- Modify: `scripts/a11y.mjs`
- Modify: `scripts/a11y.test.mjs`
- Modify: `scripts/viewport.mjs`
- Modify: `scripts/viewport.test.mjs`
- Modify: `scripts/gallery-budget.mjs`
- Modify: `scripts/gallery-budget.test.mjs`
- Create: `scripts/component-quick-jump-browser.mjs`
- Create: `scripts/component-quick-jump-browser.test.mjs`

**Interfaces:**
- Produces: browser matrices that run each existing route in both root Chinese and `/en` English forms, plus desktop/mobile quick-jump checks.
- Consumes: merged build and Task 6 quick-jump selectors.

- [ ] **Step 1: Add failing route-matrix tests**

Assert each script expands `/components/button` into both `/components/button` and `/en/components/button`, deduplicates already-prefixed routes, and labels failures with locale.

- [ ] **Step 2: Run script unit tests**

Run: `pnpm test:scripts`

Expected: FAIL until the scripts expose and use bilingual route expansion.

- [ ] **Step 3: Extend gates and add real quick-jump navigation**

In Playwright, test `Button`, `按钮`, and `button` on 375px and desktop viewports; assert Enter lands on the correct same-language detail, focus remains visible, and language switching preserves query/hash.

- [ ] **Step 4: Run all browser gates**

Run:

```bash
pnpm a11y
pnpm viewport
pnpm gallery
node scripts/component-quick-jump-browser.mjs
```

Expected: PASS for both locales and both viewport classes.

- [ ] **Step 5: Commit browser verification**

```bash
git add scripts/a11y.mjs scripts/a11y.test.mjs scripts/viewport.mjs scripts/viewport.test.mjs scripts/gallery-budget.mjs scripts/gallery-budget.test.mjs scripts/component-quick-jump-browser.mjs scripts/component-quick-jump-browser.test.mjs
git commit -m "test(www): verify bilingual pages in real browsers"
```

---

### Task 16: Wire CI, Build Artifacts, and Public-Site Verification

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `.github/workflows/release.yml`
- Create: `scripts/verify-public-bilingual-sites.mjs`
- Create: `scripts/verify-public-bilingual-sites.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: CI artifact `www-out` containing both locales and `docs:verify:public` for both domains.
- Consumes: all prior build and verification commands.

- [ ] **Step 1: Write public verifier tests with mocked fetch**

Cover both domains, root and `/en` HTML language, localized component detail, exact component search target, canonical/hreflang, `registry.json`, `/en/registry.json`, `llms.txt`, `/en/llms.txt`, and a representative static asset. A stale main site or stale mirror must fail independently.

- [ ] **Step 2: Run the verifier test**

Run: `node --test scripts/verify-public-bilingual-sites.test.mjs`

Expected: FAIL because the verifier does not exist.

- [ ] **Step 3: Implement public verification with explicit evidence**

Output one line per domain/path with status, detected language, registry count, and canonical. Exit nonzero on any mismatch; never infer main-site success from mirror success.

- [ ] **Step 4: Update CI ordering and artifact upload**

After generation, run typecheck/tests/script tests/registry smoke, bilingual build, English output scan, bilingual link scan, a11y, viewport, quick-jump browser check, gallery, and size. Upload the merged `apps/www/out`; keep `deploy-zh` consuming that exact artifact. Do not add deployment secrets to the repository.

- [ ] **Step 5: Run the complete local verification chain**

Run:

```bash
pnpm llms-registry
pnpm conventions
pnpm test
pnpm test:scripts
pnpm typecheck
pnpm registry:smoke:pages
pnpm --filter www build
pnpm docs:i18n:output
pnpm docs:i18n:links
pnpm a11y
pnpm viewport
pnpm gallery
pnpm size
```

Expected: every command exits 0 and the merged export contains route-parity for all static pages.

- [ ] **Step 6: Commit CI and public verification**

```bash
git add .github/workflows/ci.yml .github/workflows/release.yml scripts/verify-public-bilingual-sites.mjs scripts/verify-public-bilingual-sites.test.mjs package.json
git commit -m "ci: verify and publish bilingual documentation"
```

- [ ] **Step 7: Push and wait for real CI/deploy evidence**

Push the completed branch through the repository's normal workflow. Record the CI run URL, uploaded artifact result, Chinese mirror deploy result, and Cloudflare main-site result. Do not report completion while either public site is stale or inaccessible.

- [ ] **Step 8: Verify both live domains**

Run: `pnpm docs:verify:public`

Expected: both hosts pass Chinese root, English `/en`, metadata, AI endpoints, asset, and component-direct-navigation checks.

---

## Final Completion Audit

- [ ] Every design goal maps to a passing automated or live verification above.
- [ ] Both domains serve Chinese and English routes from the same commit.
- [ ] Main-site default English and mirror default Chinese behavior are proven in a real browser without a stored preference.
- [ ] Manual choice persistence is proven separately on each origin.
- [ ] All 123 page entry points and all generated dynamic routes have Chinese/English parity.
- [ ] All public component docs have English Markdown and valid related links.
- [ ] English output has zero unapproved visible CJK text.
- [ ] Component quick jump works from navbar, homepage, catalog, and detail navigation in both languages.
- [ ] Existing component tests, registry installation smoke, consumer typechecks, bundle-size gates, a11y, viewport, and gallery gates still pass.
- [ ] CI, Cloudflare main site, Chinese mirror, live metadata, and live component navigation are verified independently.
