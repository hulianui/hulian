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
    await writeFixture(fixtureRoot, {
      "index.html": routeHtml("Chinese home", '<meta name="keep" content="zh">'),
      "components/button.html": routeHtml("Chinese button"),
      "404.html": routeHtml("Chinese not found"),
      "_not-found.html": routeHtml("Chinese internal not found"),
      "en/index.html": routeHtml("English home", '<meta name="keep" content="en">'),
      "en/components/button.html": routeHtml("English button"),
      "en/404.html": routeHtml("English not found"),
      "en/_not-found.html": routeHtml("English internal not found"),
      "embedded-fragment.html": "<article>keep fragment bytes</article>",
      "_next/debug.html": routeHtml("keep framework bytes"),
    });

    assert.equal(typeof postprocessBilingualRouteMetadata, "function");
    await postprocessBilingualRouteMetadata(fixtureRoot);

    const expected = new Map([
      ["index.html", ["https://hulianui.haloritual.com", "/", "zh"]],
      [
        "components/button.html",
        ["https://hulianui.haloritual.com/components/button", "/components/button", "zh"],
      ],
      ["404.html", ["https://hulianui.haloritual.com/404", "/404", "zh"]],
      ["_not-found.html", ["https://hulianui.haloritual.com/_not-found", "/_not-found", "zh"]],
      ["en/index.html", ["https://hulianui.haloritual.com/en", "/", "en"]],
      [
        "en/components/button.html",
        ["https://hulianui.haloritual.com/en/components/button", "/components/button", "en"],
      ],
      ["en/404.html", ["https://hulianui.haloritual.com/en/404", "/404", "en"]],
      [
        "en/_not-found.html",
        ["https://hulianui.haloritual.com/en/_not-found", "/_not-found", "en"],
      ],
    ]);

    for (const [relativePath, [canonical, bare]] of expected) {
      const metadata = seoMetadata(await readFile(join(fixtureRoot, relativePath), "utf8"));
      const englishPath = `/en${bare === "/" ? "" : bare}`;
      assert.deepEqual(metadata, {
        canonical: [canonical],
        alternates: {
          "zh-CN": `https://hulianui.haloritual.com${bare === "/" ? "" : bare}`,
          en: `https://hulianui.haloritual.com${englishPath}`,
          "x-default": `https://hulianui.haloritual.com${englishPath}`,
        },
      });
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
    const chineseHead = [
      '<meta name="keep" content="Chinese metadata">',
      '<link data-preserve="canonical" rel="canonical" href="https://hulianui.haloritual.com/guide">',
      '<link data-preserve="zh" rel="alternate" hreflang="zh-CN" href="https://hulianui.haloritual.com/guide">',
      '<link rel="alternate" hreflang="en" href="https://hulianui.haloritual.com/wrong">',
      '<link data-preserve="default" rel="alternate" hreflang="x-default" href="https://hulianui.haloritual.com/en/guide">',
      '<link data-preserve="fr" rel="alternate" hreflang="fr" href="https://example.com/fr/guide">',
    ].join("");
    const englishHead = [
      '<meta name="keep" content="English metadata">',
      '<link rel="canonical" href="https://hulianui.haloritual.com/wrong">',
      '<link rel="canonical" href="https://hulianui.haloritual.com/en/guide">',
      '<link rel="alternate" hreflang="zh-CN" href="https://hulianui.haloritual.com/guide">',
      '<link rel="alternate" hreflang="en" href="https://hulianui.haloritual.com/en/guide">',
      '<link rel="alternate" hreflang="EN" href="https://hulianui.haloritual.com/en/guide">',
      '<link rel="alternate" hreflang="x-default" href="https://hulianui.haloritual.com/en/guide">',
    ].join("");
    await writeFixture(fixtureRoot, {
      "guide.html": routeHtml("Chinese guide", chineseHead),
      "en/guide.html": routeHtml("English guide", englishHead),
    });

    await postprocessBilingualRouteMetadata(fixtureRoot);
    const chineseOnce = await readFile(join(fixtureRoot, "guide.html"), "utf8");
    const englishOnce = await readFile(join(fixtureRoot, "en/guide.html"), "utf8");

    assert.deepEqual(seoMetadata(chineseOnce), {
      canonical: ["https://hulianui.haloritual.com/guide"],
      alternates: {
        "zh-CN": "https://hulianui.haloritual.com/guide",
        en: "https://hulianui.haloritual.com/en/guide",
        "x-default": "https://hulianui.haloritual.com/en/guide",
        fr: "https://example.com/fr/guide",
      },
    });
    assert.match(chineseOnce, /data-preserve="canonical"/);
    assert.match(chineseOnce, /data-preserve="zh"/);
    assert.match(chineseOnce, /data-preserve="default"/);
    assert.match(chineseOnce, /data-preserve="fr"/);
    assert.match(chineseOnce, /name="keep" content="Chinese metadata"/);

    assert.deepEqual(seoMetadata(englishOnce), {
      canonical: ["https://hulianui.haloritual.com/en/guide"],
      alternates: {
        "zh-CN": "https://hulianui.haloritual.com/guide",
        en: "https://hulianui.haloritual.com/en/guide",
        "x-default": "https://hulianui.haloritual.com/en/guide",
      },
    });
    assert.match(englishOnce, /name="keep" content="English metadata"/);

    await postprocessBilingualRouteMetadata(fixtureRoot);
    assert.equal(await readFile(join(fixtureRoot, "guide.html"), "utf8"), chineseOnce);
    assert.equal(await readFile(join(fixtureRoot, "en/guide.html"), "utf8"), englishOnce);
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

test("mergeExports nests the complete English export below en", async () => {
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

    assert.match(await readFile(join(outRoot, "components/button.html"), "utf8"), /zh button/);
    assert.match(await readFile(join(outRoot, "en/components/button.html"), "utf8"), /en button/);
    assert.equal(await readFile(join(outRoot, "en/_next/a.js"), "utf8"), "en framework");
    assert.deepEqual(seoMetadata(await readFile(join(outRoot, "components/button.html"), "utf8")), {
      canonical: ["https://hulianui.haloritual.com/components/button"],
      alternates: {
        "zh-CN": "https://hulianui.haloritual.com/components/button",
        en: "https://hulianui.haloritual.com/en/components/button",
        "x-default": "https://hulianui.haloritual.com/en/components/button",
      },
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

    assert.match(await readFile(join(outRoot, "components/button.html"), "utf8"), /zh button/);
    assert.match(
      await readFile(join(outRoot, "en/components/button.html"), "utf8"),
      /en button/,
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
