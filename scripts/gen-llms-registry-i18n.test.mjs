import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import * as conventionsGenerator from "./gen-conventions.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_ROOT = join(ROOT, "apps", "www", "public");
const CJK = /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/u;
const roots = {
  zh: mkdtempSync(join(tmpdir(), "hulian-registry-zh-")),
  en: mkdtempSync(join(tmpdir(), "hulian-registry-en-")),
};

const EXPECTED_CONVENTION_COUNT_MISMATCHES = {
  badge: [0, 1],
  "beian-footer": [1, 2],
  breadcrumb: [0, 1],
  "bubble-menu": [3, 4],
  "button-group": [0, 1],
  carousel: [3, 4],
  chip: [0, 1],
  "chroma-grid": [3, 4],
  citation: [2, 3],
  code: [0, 1],
  "code-block": [0, 1],
  "code-review-thread": [0, 1],
  container: [0, 1],
  "contribution-graph": [4, 5],
  "credit-card": [0, 1],
  danmaku: [3, 4],
  "diff-stat": [0, 1],
  divider: [0, 1],
  "document-sheet": [2, 3],
  "event-stream": [0, 1],
  "floating-reactions": [2, 3],
  flow: [4, 5],
  "flowing-menu": [2, 3],
  gantt: [3, 4],
  "gift-feed": [3, 4],
  "git-commit": [0, 1],
  grid: [0, 1],
  "grid-scan": [3, 6],
  heading: [0, 1],
  heatmap: [6, 7],
  "image-viewer": [3, 4],
  "infinite-menu": [3, 4],
  "infinite-scroll": [0, 1],
  "intercept-card": [0, 1],
  "json-viewer": [2, 3],
  kanban: [3, 4],
  "laser-flow": [3, 5],
  "light-pillar": [4, 5],
  lightfall: [4, 5],
  list: [3, 4],
  "live-player": [5, 4],
  "logo-loop": [4, 5],
  "magic-bento": [3, 4],
  "math-text": [0, 7],
  "message-actions": [2, 3],
  meter: [0, 1],
  "nav-menu": [9, 8],
  pagination: [5, 6],
  "password-generator": [0, 3],
  "pro-table": [9, 8],
  "profile-card": [2, 3],
  "prompt-input": [3, 4],
  "prompt-suggestions": [2, 3],
  "question-card": [0, 1],
  "queue-lane": [3, 5],
  "relative-time": [3, 4],
  result: [2, 3],
  "ripple-button": [0, 1],
  sankey: [2, 3],
  "scope-matrix": [0, 1],
  "score-ring": [0, 1],
  select: [10, 11],
  separator: [0, 1],
  "service-message": [3, 4],
  skeleton: [3, 4],
  "social-button": [0, 1],
  spacer: [0, 1],
  spin: [3, 4],
  spinner: [2, 3],
  stack: [0, 1],
  "staggered-menu": [4, 5],
  stat: [3, 4],
  "status-dot": [0, 1],
  "streaming-text": [2, 3],
  table: [16, 17],
  tag: [4, 3],
  "task-runner": [3, 4],
  text: [0, 1],
  "thread-list": [2, 3],
  tree: [10, 9],
  video: [3, 4],
  "virtual-list": [0, 1],
  "voice-record": [0, 1],
  watch: [0, 1],
};

const canonicalFiles = [
  "apps/www/public/llms.txt",
  "apps/www/public/llms-full.txt",
  "apps/www/public/registry.json",
  "apps/www/public/conventions.json",
  "packages/ui/conventions.json",
  "packages/guard/conventions.json",
];
const canonicalBefore = new Map(
  canonicalFiles.map((file) => [file, readFileSync(join(ROOT, file))]),
);

function runGenerators(locale, out) {
  const env = {
    ...process.env,
    DOCS_LOCALE: locale,
    HULIAN_REGISTRY_OUT: out,
  };
  execFileSync(process.execPath, [join(ROOT, "scripts/gen-llms-registry.mjs")], {
    cwd: ROOT,
    env,
    stdio: "pipe",
  });
  execFileSync(process.execPath, [join(ROOT, "scripts/gen-conventions.mjs")], {
    cwd: ROOT,
    env,
    stdio: "pipe",
  });
}

function filesBelow(root, directory) {
  return readdirSync(join(root, directory), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(join(root, directory), join(entry.parentPath, entry.name)))
    .sort();
}

function read(root, file) {
  return readFileSync(join(root, file), "utf8");
}

function json(root, file) {
  return JSON.parse(read(root, file));
}

function normalizeEndpoint(value) {
  return typeof value === "string"
    ? value.replace("https://hulianui.haloritual.com/en/r/", "https://hulianui.haloritual.com/r/")
    : value;
}

function stableItem(item) {
  return {
    $schema: item.$schema,
    name: item.name,
    type: item.type,
    dependencies: item.dependencies,
    registryDependencies: item.registryDependencies?.map(normalizeEndpoint),
    files: item.files,
    cssVars: item.cssVars,
    meta: item.meta
      ? {
          import: item.meta.import,
          exports: item.meta.exports,
          types: item.meta.types,
          kind: item.meta.kind,
          selfContained: item.meta.selfContained,
          installation: item.meta.installation,
          source: item.meta.source,
          preferred: item.meta.preferred,
          status: item.meta.status,
          animated: item.meta.animated,
          webgl: item.meta.webgl,
        }
      : undefined,
  };
}

function humanFacingItem(item) {
  return JSON.stringify({
    title: item.title,
    description: item.description,
    categories: item.categories,
    tags: item.meta?.tags,
    itemTags: item.tags,
    group: item.meta?.group,
    doc: item.meta?.doc,
    docLocal: item.meta?.docLocal,
  });
}

before(() => {
  runGenerators("zh-CN", roots.zh);
  runGenerators("en", roots.en);
});

after(() => {
  for (const root of Object.values(roots)) rmSync(root, { recursive: true, force: true });
});

test("English AI artifacts preserve exact registry and endpoint contracts", () => {
  const zh = json(roots.zh, "registry.json");
  const en = json(roots.en, "registry.json");

  assert.equal(en.items.length, zh.items.length);
  assert.deepEqual(
    {
      $schema: en.$schema,
      name: en.name,
      homepage: en.homepage,
      version: en.version,
      install: en.install,
      import: en.import,
      itemUrl: normalizeEndpoint(en.itemUrl),
    },
    {
      $schema: zh.$schema,
      name: zh.name,
      homepage: zh.homepage,
      version: zh.version,
      install: zh.install,
      import: zh.import,
      itemUrl: zh.itemUrl,
    },
  );
  assert.deepEqual(
    en.items.map((item) => item.name),
    zh.items.map((item) => item.name),
  );
  assert.deepEqual(filesBelow(roots.en, "r"), filesBelow(roots.zh, "r"));
  assert.deepEqual(filesBelow(roots.en, "d"), filesBelow(roots.zh, "d"));

  for (const [index, zhItem] of zh.items.entries()) {
    const enItem = en.items[index];
    assert.deepEqual(stableItem(enItem), stableItem(zhItem), zhItem.name);
    assert.doesNotMatch(humanFacingItem(enItem), CJK, zhItem.name);

    const zhEndpoint = json(roots.zh, `r/${zhItem.name}.json`);
    const enEndpoint = json(roots.en, `r/${zhItem.name}.json`);
    assert.deepEqual(stableItem(enEndpoint), stableItem(zhEndpoint), `r/${zhItem.name}.json`);
    assert.doesNotMatch(humanFacingItem(enEndpoint), CJK, `r/${zhItem.name}.json`);
  }

  for (const name of ["button", "block-pricing-table", "page-dashboard"]) {
    const zhItem = json(roots.zh, `r/${name}.json`);
    const enItem = json(roots.en, `r/${name}.json`);
    assert.deepEqual(stableItem(enItem), stableItem(zhItem), name);
    assert.doesNotMatch(humanFacingItem(enItem), CJK, name);
  }
});

test("English AI copy is natural, CJK-free, and links to public /en documentation", () => {
  for (const file of [
    "llms.txt",
    "llms-full.txt",
    ...filesBelow(roots.en, "d").map((name) => `d/${name}`),
  ]) {
    assert.doesNotMatch(read(roots.en, file), CJK, file);
  }

  const llms = read(roots.en, "llms.txt");
  assert.match(llms, /Hulian UI/);
  assert.match(llms, /https:\/\/hulianui\.haloritual\.com\/en\/components\/button/);
  assert.doesNotMatch(llms, /github\.com\/hulianui\/hulian\/blob\/master\/packages\/ui/);

  const registry = json(roots.en, "registry.json");
  assert.equal(registry.itemUrl, "https://hulianui.haloritual.com/en/r/{name}.json");
  assert.equal(
    registry.items.find((item) => item.name === "button").meta.doc,
    "https://hulianui.haloritual.com/en/components/button",
  );
  assert.match(read(roots.en, "d/button.md"), /\/en\/components\//);
});

test("English conventions localize advice while preserving executable protocol", () => {
  const zh = json(roots.zh, "conventions.json");
  const en = json(roots.en, "conventions.json");

  assert.doesNotMatch(JSON.stringify(en), CJK);
  assert.deepEqual(
    en.executableRules.map(({ id, severity, matcher }) => ({ id, severity, matcher })),
    zh.executableRules.map(({ id, severity, matcher }) => ({ id, severity, matcher })),
  );
  assert.deepEqual(
    en.confusables.map((item) => item.id),
    zh.confusables.map((item) => item.id),
  );
  assert.equal(en.stats.componentDocs, zh.stats.componentDocs);
  assert.deepEqual(
    {
      componentAdvisories: zh.stats.componentAdvisories,
      totalAdvisories: zh.stats.totalAdvisories,
    },
    { componentAdvisories: 1108, totalAdvisories: 1115 },
  );
  assert.deepEqual(
    {
      componentAdvisories: en.stats.componentAdvisories,
      totalAdvisories: en.stats.totalAdvisories,
    },
    { componentAdvisories: 1194, totalAdvisories: 1201 },
  );
  assert.equal(new Set(en.advisories.map((item) => item.id)).size, en.advisories.length);
});

test("English convention sections reach the real EOF instead of stopping at z or Z", () => {
  assert.equal(typeof conventionsGenerator.extractPitfalls, "function");
  const rules = conventionsGenerator.extractPitfalls(
    [
      "## Usage guidelines",
      "",
      "- Authorize every backend request independently; hidden UI is not authorization.",
      "- Reverse controls the horizontal direction from left to right.",
      "- Fixed-width dates avoid timezone boundary errors; keep the UTC Z suffix intact.",
      "",
      "## Related",
      "",
      "Nothing below this heading belongs to the section.",
    ].join("\n"),
    "en",
  );

  assert.deepEqual(rules, [
    {
      rule: "Authorize every backend request independently; hidden UI is not authorization.",
    },
    { rule: "Reverse controls the horizontal direction from left to right." },
    { rule: "Fixed-width dates avoid timezone boundary errors; keep the UTC Z suffix intact." },
  ]);
});

test("English advisories keep complete natural rules without repeated entries in one scope", () => {
  const en = json(roots.en, "conventions.json");
  const componentAdvisories = en.advisories.filter((item) => item.scope !== "global");
  const rulesByScope = new Map();

  for (const advisory of componentAdvisories) {
    const rules = rulesByScope.get(advisory.scope) ?? [];
    rules.push(advisory.rule);
    rulesByScope.set(advisory.scope, rules);
  }

  for (const [scope, rules] of rulesByScope) {
    assert.equal(new Set(rules).size, rules.length, `${scope} repeats an English advisory`);
  }

  assert.ok(
    rulesByScope
      .get("access")
      .includes(
        "Client-side gating is a UX safeguard, not a security boundary. Authorize every backend request independently; hidden UI is not authorization.",
      ),
  );
  assert.ok(
    rulesByScope
      .get("animated-beam")
      .includes(
        "`reverse` controls the horizontal scan direction independently of endpoint order: `false` moves left to right and `true` moves right to left. For beams converging on a center node, reverse the beam on the right.",
      ),
  );
  assert.ok(
    rulesByScope
      .get("calendar")
      .includes(
        '**Values are fixed-width strings, not `Date` objects.** With `"YYYY-MM-DD"`, lexical order matches chronological order, so ranges can be compared as strings. This also avoids timezone boundary errors such as `new Date("2026-06-08").toISOString()` producing the previous date in UTC+8. Convert explicitly if your application needs a `Date`.',
      ),
  );
});

test("all 84 reviewed locale-specific convention count differences stay explicit", () => {
  assert.equal(typeof conventionsGenerator.extractPitfalls, "function");
  const uiRoot = join(ROOT, "packages", "ui", "src");
  const actual = {};

  for (const slug of readdirSync(uiRoot).sort()) {
    const zhFile = join(uiRoot, slug, `${slug}.md`);
    const enFile = join(uiRoot, slug, `${slug}.en.md`);
    if (!existsSync(zhFile) || !existsSync(enFile)) continue;
    const counts = [
      conventionsGenerator.extractPitfalls(readFileSync(zhFile, "utf8"), "zh-CN").length,
      conventionsGenerator.extractPitfalls(readFileSync(enFile, "utf8"), "en").length,
    ];
    if (counts[0] !== counts[1]) actual[slug] = counts;
  }

  assert.equal(Object.keys(actual).length, 84);
  assert.deepEqual(actual, EXPECTED_CONVENTION_COUNT_MISMATCHES);
});

test("isolated locale generation reproduces canonical Chinese bytes and never mutates them", () => {
  for (const file of ["llms.txt", "llms-full.txt", "registry.json", "conventions.json"]) {
    const actual = readFileSync(join(roots.zh, file));
    const expected = readFileSync(join(PUBLIC_ROOT, file));
    assert.ok(actual.equals(expected), `${file} differs from its isolated Chinese generation`);
  }
  for (const directory of ["d", "r"]) {
    for (const file of filesBelow(roots.zh, directory)) {
      const actual = readFileSync(join(roots.zh, directory, file));
      const expected = readFileSync(join(PUBLIC_ROOT, directory, file));
      assert.ok(
        actual.equals(expected),
        `${directory}/${file} differs from its isolated Chinese generation`,
      );
    }
  }
  for (const [file, before] of canonicalBefore) {
    assert.ok(
      readFileSync(join(ROOT, file)).equals(before),
      `${file} changed during isolated generation`,
    );
  }
});
