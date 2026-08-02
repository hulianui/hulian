import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_ROOT = join(ROOT, "apps", "www", "public");
const CJK = /[\u3400-\u9fff\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/u;
const roots = {
  zh: mkdtempSync(join(tmpdir(), "hulian-registry-zh-")),
  en: mkdtempSync(join(tmpdir(), "hulian-registry-en-")),
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
    en.advisories.map((item) => item.id),
    zh.advisories.map((item) => item.id),
  );
  assert.deepEqual(
    en.confusables.map((item) => item.id),
    zh.confusables.map((item) => item.id),
  );
  assert.equal(en.stats.componentDocs, zh.stats.componentDocs);
  assert.equal(en.stats.componentAdvisories, zh.stats.componentAdvisories);
});

test("isolated locale generation reproduces canonical Chinese bytes and never mutates them", () => {
  for (const file of ["llms.txt", "llms-full.txt", "registry.json", "conventions.json"]) {
    assert.deepEqual(
      readFileSync(join(roots.zh, file)),
      readFileSync(join(PUBLIC_ROOT, file)),
      file,
    );
  }
  for (const directory of ["d", "r"]) {
    for (const file of filesBelow(roots.zh, directory)) {
      assert.deepEqual(
        readFileSync(join(roots.zh, directory, file)),
        readFileSync(join(PUBLIC_ROOT, directory, file)),
        `${directory}/${file}`,
      );
    }
  }
  for (const [file, before] of canonicalBefore) {
    assert.deepEqual(readFileSync(join(ROOT, file)), before, file);
  }
});
