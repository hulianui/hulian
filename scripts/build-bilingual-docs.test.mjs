import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import {
  assertRouteParity,
  mergeExports,
  routeSet,
  safeRemoveBuildDirectory,
} from "./build-bilingual-docs.mjs";

async function writeFixture(root, files) {
  for (const [relativePath, contents] of Object.entries(files)) {
    const destination = join(root, relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  }
}

async function withFixture(run) {
  const fixtureRoot = await mkdtemp(join(tmpdir(), "hulian-bilingual-docs-"));
  try {
    await run(fixtureRoot);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
}

test("routeSet includes content HTML and ignores framework and public assets", async () => {
  await withFixture(async (fixtureRoot) => {
    await writeFixture(fixtureRoot, {
      "index.html": "home",
      "components/button.html": "button",
      "_next/a.js": "framework",
      "logo.svg": "public",
    });

    assert.deepEqual(
      [...(await routeSet(fixtureRoot))].sort(),
      ["/", "/components/button"],
    );
  });
});

test("assertRouteParity reports routes missing from either locale", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    await writeFixture(zhRoot, {
      "index.html": "zh home",
      "components/button.html": "zh button",
    });
    await writeFixture(enRoot, {
      "index.html": "en home",
      "components/input.html": "en input",
    });

    await assert.rejects(
      assertRouteParity(zhRoot, enRoot),
      (error) => {
        assert.match(error.message, /missing from English: \/components\/button/);
        assert.match(error.message, /missing from Chinese: \/components\/input/);
        return true;
      },
    );
  });
});

test("mergeExports nests the complete English export below en", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    const outRoot = join(fixtureRoot, "out");
    await writeFixture(zhRoot, {
      "index.html": "zh home",
      "components/button.html": "zh button",
      "_next/a.js": "zh framework",
      "logo.svg": "zh public",
    });
    await writeFixture(enRoot, {
      "index.html": "en home",
      "components/button.html": "en button",
      "_next/a.js": "en framework",
      "logo.svg": "en public",
    });

    await mergeExports(zhRoot, enRoot, outRoot);

    assert.equal(await readFile(join(outRoot, "components/button.html"), "utf8"), "zh button");
    assert.equal(await readFile(join(outRoot, "en/components/button.html"), "utf8"), "en button");
    assert.equal(await readFile(join(outRoot, "en/_next/a.js"), "utf8"), "en framework");
  });
});

test("mergeExports refuses to replace an existing destination", async () => {
  await withFixture(async (fixtureRoot) => {
    const zhRoot = join(fixtureRoot, "zh");
    const enRoot = join(fixtureRoot, "en");
    const outRoot = join(fixtureRoot, "out");
    await writeFixture(zhRoot, { "index.html": "zh home" });
    await writeFixture(enRoot, { "index.html": "en home" });
    await writeFixture(outRoot, { "keep.txt": "do not overwrite" });

    await assert.rejects(mergeExports(zhRoot, enRoot, outRoot), /already exists/);
    assert.equal(await readFile(join(outRoot, "keep.txt"), "utf8"), "do not overwrite");
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
