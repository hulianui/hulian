import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rename,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import * as cheerio from "cheerio";

import * as bilingualDocs from "./build-bilingual-docs.mjs";
import { NESTED_BASE_PATH, ROOT_LOCALE, localeCanonicalPath } from "./docs-locale-layout.mjs";

const ORIGIN = "https://hulianui.haloritual.com";
const NESTED_DIR = NESTED_BASE_PATH.slice(1);

/** 裸路由在某语种下的对外绝对 URL。全部从 SSOT 派生，翻转语言布局时本文件无需再改。 */
function at(bare, locale) {
  return `${ORIGIN}${localeCanonicalPath(bare, locale)}`;
}

/** 裸路由在成品树里的文件相对路径：根语言直接铺在根，另一语种进子目录。 */
function fixtureFile(bare, locale) {
  const name = bare === "/" ? "index.html" : `${bare.slice(1)}.html`;
  return locale === ROOT_LOCALE ? name : `${NESTED_DIR}/${name}`;
}

/** 任一裸路由在两个语种下都该得到的同一组 hreflang。 */
function expectedAlternates(bare) {
  return {
    "zh-CN": at(bare, "zh-CN"),
    en: at(bare, "en"),
    "x-default": at(bare, ROOT_LOCALE),
  };
}

const {
  assembleExportsByRename,
  assertRouteParity,
  mergeExports,
  overlayGeneratedArtifacts,
  postprocessBilingualRouteMetadata,
  routeSet,
  safeRemoveBuildDirectory,
} = bilingualDocs;

async function writeFixture(root, files) {
  for (const [relativePath, contents] of Object.entries(files)) {
    const destination = join(root, relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
}

async function withFixture(run) {
  const fixtureRoot = await mkdtemp(join(await realpath(tmpdir()), "hulian-bilingual-docs-"));
  try {
    await run(fixtureRoot);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

function routeHtml(body, head = "") {
  return `<!doctype html><html><head><title>Fixture</title>${head}</head><body>${body}</body></html>`;
}

function seoMetadata(html) {
  const $ = cheerio.load(html);
  const alternates = {};
  $("link[rel~='alternate'][hreflang]").each((_, element) => {
    alternates[$(element).attr("hreflang")] = $(element).attr("href");
  });
  return {
    canonical: $("link[rel~='canonical']")
      .map((_, element) => $(element).attr("href"))
      .get(),
    alternates,
  };
}

test("routeSet includes route documents and ignores HTML fragments, framework, and public assets", async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixture(fixtureRoot, {
      "index.html": "<!doctype html><html><head></head><body>home</body></html>",
      "components/button.html": "<!doctype html><html><head></head><body>button</body></html>",
      "embedded-fragment.html": "<article>not a route document</article>",
      "_next/debug.html": "<!doctype html><html><head></head><body>framework</body></html>",
      "_next/a.js": "framework",
      "logo.svg": "public",
    });

    assert.deepEqual([...(await routeSet(fixtureRoot))].sort(), ["/", "/components/button"]);
  });
});

test("postprocessBilingualRouteMetadata injects exact SEO links into every physical bilingual route only", async () => {
  await withFixture(async (fixtureRoot) => {
    const bareRoutes = ["/", "/components/button", "/404", "/_not-found"];
    await writeFixture(fixtureRoot, {
      [fixtureFile("/", ROOT_LOCALE)]: routeHtml("Root home", '<meta name="keep" content="root">'),
      [fixtureFile("/components/button", ROOT_LOCALE)]: routeHtml("Root button"),
      [fixtureFile("/404", ROOT_LOCALE)]: routeHtml("Root not found"),
      [fixtureFile("/_not-found", ROOT_LOCALE)]: routeHtml("Root internal not found"),
      [fixtureFile("/", "zh-CN")]: routeHtml("Nested home", '<meta name="keep" content="nested">'),
      [fixtureFile("/components/button", "zh-CN")]: routeHtml("Nested button"),
      [fixtureFile("/404", "zh-CN")]: routeHtml("Nested not found"),
      [fixtureFile("/_not-found", "zh-CN")]: routeHtml("Nested internal not found"),
      "embedded-fragment.html": "<article>keep fragment bytes</article>",
      "_next/debug.html": routeHtml("keep framework bytes"),
    });

    assert.equal(typeof postprocessBilingualRouteMetadata, "function");
    await postprocessBilingualRouteMetadata(fixtureRoot);

    for (const bare of bareRoutes) {
      for (const locale of [ROOT_LOCALE, "zh-CN"]) {
        const metadata = seoMetadata(
          await readFile(join(fixtureRoot, fixtureFile(bare, locale)), "utf8"),
        );
        assert.deepEqual(metadata, {
          canonical: [at(bare, locale)],
          alternates: expectedAlternates(bare),
        });
      }
    }

    assert.equal(
      await readFile(join(fixtureRoot, "embedded-fragment.html"), "utf8"),
      "<article>keep fragment bytes</article>",
    );
    assert.equal(
      await readFile(join(fixtureRoot, "_next/debug.html"), "utf8"),
      routeHtml("keep framework bytes"),
    );
    assert.match(await readFile(join(fixtureRoot, "index.html"), "utf8"), /name="keep"/);
  });
});

test("postprocessBilingualRouteMetadata repairs only invalid SEO links and is byte-idempotent", async () => {
  await withFixture(async (fixtureRoot) => {
    // 根语言那份：链接本就正确，data-preserve 用来验证「对的原样保留、不重写字节」。
    const rootHead = [
      '<meta name="keep" content="Root metadata">',
      `<link data-preserve="canonical" rel="canonical" href="${at("/guide", ROOT_LOCALE)}">`,
      `<link data-preserve="zh" rel="alternate" hreflang="zh-CN" href="${at("/guide", "zh-CN")}">`,
      `<link rel="alternate" hreflang="en" href="${ORIGIN}/wrong">`,
      `<link data-preserve="default" rel="alternate" hreflang="x-default" href="${at(
        "/guide",
        ROOT_LOCALE,
      )}">`,
      '<link data-preserve="fr" rel="alternate" hreflang="fr" href="https://example.com/fr/guide">',
    ].join("");
    // 嵌套语言那份：重复 canonical 与大小写变体的 hreflang 应被规整掉。
    const nestedHead = [
      '<meta name="keep" content="Nested metadata">',
      `<link rel="canonical" href="${ORIGIN}/wrong">`,
      `<link rel="canonical" href="${at("/guide", "zh-CN")}">`,
      `<link rel="alternate" hreflang="zh-CN" href="${at("/guide", "zh-CN")}">`,
      `<link rel="alternate" hreflang="en" href="${at("/guide", "en")}">`,
      `<link rel="alternate" hreflang="EN" href="${at("/guide", "en")}">`,
      `<link rel="alternate" hreflang="x-default" href="${at("/guide", ROOT_LOCALE)}">`,
    ].join("");
    await writeFixture(fixtureRoot, {
      [fixtureFile("/guide", ROOT_LOCALE)]: routeHtml("Root guide", rootHead),
      [fixtureFile("/guide", "zh-CN")]: routeHtml("Nested guide", nestedHead),
    });

    await postprocessBilingualRouteMetadata(fixtureRoot);
    const chineseOnce = await readFile(join(fixtureRoot, fixtureFile("/guide", "zh-CN")), "utf8");
    const englishOnce = await readFile(join(fixtureRoot, fixtureFile("/guide", ROOT_LOCALE)), "utf8");

    assert.deepEqual(seoMetadata(englishOnce), {
      canonical: [at("/guide", ROOT_LOCALE)],
      alternates: { ...expectedAlternates("/guide"), fr: "https://example.com/fr/guide" },
    });
    assert.match(englishOnce, /data-preserve="canonical"/);
    assert.match(englishOnce, /data-preserve="zh"/);
    assert.match(englishOnce, /data-preserve="default"/);
    assert.match(englishOnce, /data-preserve="fr"/);
    assert.match(englishOnce, /name="keep" content="Root metadata"/);

    assert.deepEqual(seoMetadata(chineseOnce), {
      canonical: [at("/guide", "zh-CN")],
      alternates: expectedAlternates("/guide"),
    });
    assert.match(chineseOnce, /name="keep" content="Nested metadata"/);

    await postprocessBilingualRouteMetadata(fixtureRoot);
    assert.equal(
      await readFile(join(fixtureRoot, fixtureFile("/guide", "zh-CN")), "utf8"),
      chineseOnce,
    );
    assert.equal(
      await readFile(join(fixtureRoot, fixtureFile("/guide", ROOT_LOCALE)), "utf8"),
      englishOnce,
    );
  });
});

test("assertRouteParity reports routes missing from either locale", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    await writeFixture(zhRoot, {
      "index.html": routeHtml("zh home"),
      "components/button.html": routeHtml("zh button"),
    });
    await writeFixture(enRoot, {
      "index.html": routeHtml("en home"),
      "components/input.html": routeHtml("en input"),
    });

    await assert.rejects(assertRouteParity(zhRoot, enRoot), (error) => {
      assert.match(error.message, /missing from English: \/components\/button/);
      assert.match(error.message, /missing from Chinese: \/components\/input/);
      return true;
    });
  });
});

test("mergeExports puts the root-locale export at the tree root and nests the other", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    const outRoot = join(fixtureRoot, "out");
    const chineseButton = routeHtml("zh button");
    const englishButton = routeHtml("en button");
    await writeFixture(zhRoot, {
      "index.html": routeHtml("zh home"),
      "components/button.html": chineseButton,
      "_next/a.js": "zh framework",
      "logo.svg": "zh public",
    });
    await writeFixture(enRoot, {
      "index.html": routeHtml("en home"),
      "components/button.html": englishButton,
      "_next/a.js": "en framework",
      "logo.svg": "en public",
    });

    await mergeExports(zhRoot, enRoot, outRoot);

    const rootButton = fixtureFile("/components/button", ROOT_LOCALE);
    const nestedButton = fixtureFile("/components/button", "zh-CN");
    assert.match(await readFile(join(outRoot, rootButton), "utf8"), /en button/);
    assert.match(await readFile(join(outRoot, nestedButton), "utf8"), /zh button/);
    assert.equal(await readFile(join(outRoot, `${NESTED_DIR}/_next/a.js`), "utf8"), "zh framework");
    assert.deepEqual(seoMetadata(await readFile(join(outRoot, rootButton), "utf8")), {
      canonical: [at("/components/button", ROOT_LOCALE)],
      alternates: expectedAlternates("/components/button"),
    });
  });
});

test("mergeExports refuses to replace an existing destination", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    const outRoot = join(fixtureRoot, "out");
    await writeFixture(zhRoot, { "index.html": routeHtml("zh home") });
    await writeFixture(enRoot, { "index.html": routeHtml("en home") });
    await writeFixture(outRoot, { "keep.txt": "do not overwrite" });

    await assert.rejects(mergeExports(zhRoot, enRoot, outRoot), /already exists/);
    assert.equal(await readFile(join(outRoot, "keep.txt"), "utf8"), "do not overwrite");
  });
});

test("assembleExportsByRename consumes locale trees without copying their contents", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    const outRoot = join(fixtureRoot, "out");
    await writeFixture(zhRoot, {
      "index.html": routeHtml("zh home"),
      "components/button.html": routeHtml("zh button"),
    });
    await writeFixture(enRoot, {
      "index.html": routeHtml("en home"),
      "components/button.html": routeHtml("en button"),
    });

    await assembleExportsByRename(zhRoot, enRoot, outRoot);

    assert.match(
      await readFile(join(outRoot, fixtureFile("/components/button", ROOT_LOCALE)), "utf8"),
      /en button/,
    );
    assert.match(
      await readFile(join(outRoot, fixtureFile("/components/button", "zh-CN")), "utf8"),
      /zh button/,
    );
    await assert.rejects(readFile(join(zhRoot, "index.html")), { code: "ENOENT" });
    await assert.rejects(readFile(join(enRoot, "index.html")), { code: "ENOENT" });
  });
});

test("locale builds replace stale AI endpoints from an isolated generated root", async () => {
  await withFixture(async (fixtureRoot) => {
    const exportRoot = join(fixtureRoot, "export");
    const generatedRoot = join(fixtureRoot, "generated");
    await writeFixture(exportRoot, {
      "llms.txt": "stale",
      "llms-full.txt": "stale",
      "registry.json": "stale",
      "conventions.json": "stale",
      "d/stale.md": "stale",
      "r/stale.json": "stale",
      "logo.svg": "keep",
    });
    await writeFixture(generatedRoot, {
      "llms.txt": "localized index",
      "llms-full.txt": "localized corpus",
      "registry.json": "localized registry",
      "conventions.json": "localized conventions",
      "d/button.md": "localized component guide",
      "r/button.json": "localized endpoint",
    });

    await overlayGeneratedArtifacts(exportRoot, generatedRoot);

    assert.equal(await readFile(join(exportRoot, "llms.txt"), "utf8"), "localized index");
    assert.equal(
      await readFile(join(exportRoot, "d/button.md"), "utf8"),
      "localized component guide",
    );
    assert.equal(await readFile(join(exportRoot, "r/button.json"), "utf8"), "localized endpoint");
    assert.equal(await readFile(join(exportRoot, "logo.svg"), "utf8"), "keep");
    await assert.rejects(readFile(join(exportRoot, "d/stale.md")), { code: "ENOENT" });
    await assert.rejects(readFile(join(exportRoot, "r/stale.json")), { code: "ENOENT" });
  });
});

test("safeRemoveBuildDirectory rejects paths outside the exact build root", async () => {
  await withFixture(async (fixtureRoot) => {
    const buildRoot = join(fixtureRoot, ".bilingual-build");
    const outsideRoot = join(fixtureRoot, "outside");
    await writeFixture(outsideRoot, { "keep.txt": "safe" });

    await assert.rejects(
      safeRemoveBuildDirectory(outsideRoot, buildRoot),
      /must be a descendant of/,
    );
    assert.equal(await readFile(join(outsideRoot, "keep.txt"), "utf8"), "safe");
  });
});

test("safeRemoveBuildDirectory rejects a symlinked build root without deleting its target", async () => {
  await withFixture(async (fixtureRoot) => {
    const externalRoot = join(fixtureRoot, "external");
    const externalZhRoot = join(externalRoot, "zh");
    const linkedBuildRoot = join(fixtureRoot, ".bilingual-build");
    await writeFixture(externalZhRoot, { "keep.txt": "safe" });
    await symlink(externalRoot, linkedBuildRoot, "dir");

    await assert.rejects(
      safeRemoveBuildDirectory(join(linkedBuildRoot, "zh"), linkedBuildRoot),
      /symlink|canonical/i,
    );
    assert.equal(await readFile(join(externalZhRoot, "keep.txt"), "utf8"), "safe");
  });
});

test("startup recovery restores the previous output after interruption following backup rename", async () => {
  await withFixture(async (fixtureRoot) => {
    const buildRoot = join(fixtureRoot, ".bilingual-build");
    const backupRoot = join(buildRoot, "zh");
    const finalRoot = join(buildRoot, "final");
    const outputRoot = join(fixtureRoot, "out");
    const markerPath = join(buildRoot, "replacement-in-progress.json");
    await writeFixture(outputRoot, { "index.html": "previous output" });
    await writeFixture(finalRoot, { "index.html": "new output" });
    await writeFile(markerPath, JSON.stringify({ version: 1, previousOutputBackup: "zh" }));
    await rename(outputRoot, backupRoot);

    await bilingualDocs.recoverInterruptedOutput(buildRoot, backupRoot, outputRoot);

    assert.equal(await readFile(join(outputRoot, "index.html"), "utf8"), "previous output");
    await assert.rejects(readFile(join(backupRoot, "index.html")), { code: "ENOENT" });
    assert.equal(await readFile(join(finalRoot, "index.html"), "utf8"), "new output");
    await assert.rejects(readFile(markerPath), { code: "ENOENT" });
  });
});
