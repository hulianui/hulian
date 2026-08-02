// @vitest-environment node
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { homeContent } from "../app/home.content";
import { startContent } from "../app/start/start.content";
import { themeContent } from "../app/theme/theme.content";
import { blocksContent } from "../app/blocks/blocks.content";
import { pagesContent } from "../app/pages/pages.content";
import { changelogContent } from "../app/changelog/changelog.content";
import { previewContent } from "../app/preview/preview.content";
import { installPanelContent } from "../components/install-panel.content";
import { docsSearchContent } from "../components/docs-search.content";
import { sharedChromeContent } from "../components/shared-chrome.content";
import { notFoundContent } from "../app/not-found.content";
import blockSourcesEn from "../app/blocks/block-fixture-sources.en.json";
import pageSourcesEn from "../app/pages/page-fixture-sources.en.json";
import blockFixturesEn from "../app/blocks/block-fixtures.en.json";
import pageFixturesEn from "../app/pages/page-fixtures.en.json";
import { blocks } from "../app/blocks/_meta";
import { pages } from "../app/pages/_meta";

const HAN_OR_CJK_PUNCTUATION = /[\p{Script=Han}，。！？；：、“”‘’（）【】《》〈〉「」『』…]/u;
const HIDDEN_CHARACTER = /[\u200B-\u200D\u2060\uFEFF]/u;

type LocaleTree = string | readonly LocaleTree[] | { readonly [key: string]: LocaleTree };
type BilingualContent = { readonly "zh-CN": LocaleTree; readonly en: LocaleTree };

function collectStrings(value: LocaleTree, path = "content"): Array<[string, string]> {
  if (typeof value === "string") return [[path, value]];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectStrings(entry, `${path}.${index}`));
  }
  return Object.entries(value).flatMap(([key, entry]) =>
    collectStrings(entry as LocaleTree, `${path}.${key}`),
  );
}

function collectPaths(value: LocaleTree, path = "content"): string[] {
  if (typeof value === "string") return [path];
  if (Array.isArray(value)) {
    return value.flatMap((entry, index) => collectPaths(entry, `${path}.${index}`));
  }
  return Object.entries(value).flatMap(([key, entry]) =>
    collectPaths(entry as LocaleTree, `${path}.${key}`),
  );
}

function expectCompleteBilingualContent(name: string, content: BilingualContent) {
  const chinese = collectStrings(content["zh-CN"]);
  const english = collectStrings(content.en);

  expect(chinese.length, `${name} Chinese branch`).toBeGreaterThan(0);
  expect(english.length, `${name} English branch`).toBeGreaterThan(0);
  expect(collectPaths(content.en), `${name} locale key parity`).toEqual(
    collectPaths(content["zh-CN"]),
  );

  for (const [path, value] of [...chinese, ...english]) {
    expect(value.trim(), `${name}.${path} must be non-empty`).not.toBe("");
    expect(HIDDEN_CHARACTER.test(value), `${name}.${path} has a hidden character`).toBe(false);
  }

  for (const [path, value] of english) {
    expect(
      HAN_OR_CJK_PUNCTUATION.test(value),
      `${name}.en.${path} must be natural English: ${JSON.stringify(value)}`,
    ).toBe(false);
  }
}

describe("public documentation localization", () => {
  const surfaces = {
    home: homeContent,
    start: startContent,
    theme: themeContent,
    blocks: blocksContent,
    pages: pagesContent,
    changelog: changelogContent,
    preview: previewContent,
    installPanel: installPanelContent,
    search: docsSearchContent,
    sharedChrome: sharedChromeContent,
    notFound: notFoundContent,
  } satisfies Record<string, BilingualContent>;

  for (const [name, content] of Object.entries(surfaces)) {
    it(`${name} has complete clean Chinese and English branches`, () => {
      expectCompleteBilingualContent(name, content);
    });
  }

  it("covers every public theme guide", () => {
    expect(Object.keys(themeContent.en).sort()).toEqual([
      "breakpoints",
      "color",
      "cursors",
      "darkMode",
      "index",
      "motion",
      "radius",
      "shadows",
      "spacing",
      "typography",
    ]);
  });

  it("covers gallery indexes and detail chrome", () => {
    expect(Object.keys(blocksContent.en).sort()).toEqual(["detail", "index"]);
    expect(Object.keys(pagesContent.en).sort()).toEqual(["detail", "index"]);
  });

  it("provides clean English rendered source for every gallery fixture", () => {
    expect(Object.keys(blockSourcesEn).sort()).toEqual(blocks.map((item) => item.file).sort());
    expect(Object.keys(pageSourcesEn).sort()).toEqual(pages.map((item) => item.file).sort());
    for (const [file, source] of Object.entries({ ...blockSourcesEn, ...pageSourcesEn })) {
      expect(source.trim(), `${file} English source`).not.toBe("");
      expect(HAN_OR_CJK_PUNCTUATION.test(source), `${file} English source contains CJK`).toBe(false);
      expect(source, `${file} source must not expose the docs localization runtime`).not.toContain(
        "fixture-jsx",
      );
    }
  });

  it("commits clean executable English modules for every gallery fixture", () => {
    const areas = [
      {
        directory: new URL("../app/blocks/_blocks/", import.meta.url),
        expected: blocks.map((item) => item.file.replace(/\.tsx$/, ".en.tsx")),
      },
      {
        directory: new URL("../app/pages/_pages/", import.meta.url),
        expected: pages.map((item) => item.file.replace(/\.tsx$/, ".en.tsx")),
      },
    ];

    for (const { directory, expected } of areas) {
      const files = readdirSync(directory)
        .filter((file) => file.endsWith(".en.tsx"))
        .sort();
      expect(files).toEqual(expected.sort());
      for (const file of files) {
        const source = readFileSync(new URL(file, directory), "utf8");
        expect(HAN_OR_CJK_PUNCTUATION.test(source), file).toBe(false);
        expect(source, `${file} has trailing whitespace`).not.toMatch(/[ \t]+$/m);
        expect(source, file).not.toMatch(/fixture-(?:jsx|ui|copy)|translateFixture|DOCS_LOCALE/);
      }
    }

    for (const registry of [
      new URL("../app/blocks/_registry.en.tsx", import.meta.url),
      new URL("../app/pages/_registry.en.tsx", import.meta.url),
    ]) {
      const source = readFileSync(registry, "utf8");
      expect(HAN_OR_CJK_PUNCTUATION.test(source), registry.pathname).toBe(false);
      expect(source, `${registry.pathname} has trailing whitespace`).not.toMatch(/[ \t]+$/m);
      expect(source, registry.pathname).not.toMatch(
        /fixture-(?:jsx|ui|copy)|translateFixture|DOCS_LOCALE/,
      );
    }
  });

  it("validates the JSON maps actually consumed by the preview adapter", () => {
    for (const [source, english] of Object.entries({ ...blockFixturesEn, ...pageFixturesEn })) {
      expect(source.trim()).not.toBe("");
      expect(english.trim()).not.toBe("");
      expect(HAN_OR_CJK_PUNCTUATION.test(english), source).toBe(false);
    }
  });
});
