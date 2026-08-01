import { describe, expect, it } from "vitest";
import { blocks, CATEGORY_LABEL as BLOCK_CATEGORY_LABEL } from "../app/blocks/_meta";
import { demos } from "../app/demos/lib/demos";
import { pages, CATEGORY_LABEL as PAGE_CATEGORY_LABEL } from "../app/pages/_meta";
import { CATEGORIES, manifest } from "../lib/manifest";
import { THEME_NAV } from "../lib/theme-manifest";
import { blockCategoryMetaEn, blockMetaEn } from "./block-meta.en";
import { componentCategoryMetaEn, componentMetaEn } from "./component-meta.en";
import { demoMetaEn } from "./demo-meta.en";
import { pageCategoryMetaEn, pageMetaEn } from "./page-meta.en";
import { themeMetaEn } from "./theme-meta.en";

const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/u;

const sorted = (values: string[]) => [...values].sort();

describe("English catalog metadata coverage", () => {
  it("has exactly one component record for every canonical component slug", () => {
    expect(sorted(Object.keys(componentMetaEn))).toEqual(sorted(manifest.map((item) => item.slug)));
  });

  it("has exactly one block, page, demo, and theme record for every canonical slug", () => {
    expect(sorted(Object.keys(blockMetaEn))).toEqual(sorted(blocks.map((item) => item.slug)));
    expect(sorted(Object.keys(pageMetaEn))).toEqual(sorted(pages.map((item) => item.slug)));
    expect(sorted(Object.keys(demoMetaEn))).toEqual(sorted(demos.map((item) => item.slug)));
    expect(sorted(Object.keys(themeMetaEn))).toEqual(
      sorted(THEME_NAV.map((item) => item.slug || "overview")),
    );
  });

  it("has exact component category and group keys", () => {
    expect(sorted(Object.keys(componentCategoryMetaEn))).toEqual(
      sorted(CATEGORIES.map((category) => category.key)),
    );
    for (const category of CATEGORIES) {
      expect(sorted(Object.keys(componentCategoryMetaEn[category.key].groups))).toEqual(
        sorted(category.groups.map((group) => group.key)),
      );
    }
  });

  it("has exact block and page category keys", () => {
    expect(sorted(Object.keys(blockCategoryMetaEn))).toEqual(
      sorted(Object.keys(BLOCK_CATEGORY_LABEL)),
    );
    expect(sorted(Object.keys(pageCategoryMetaEn))).toEqual(
      sorted(Object.keys(PAGE_CATEGORY_LABEL)),
    );
  });

  it("contains no CJK in English visible display fields", () => {
    const visibleValues = [
      ...Object.values(componentMetaEn).flatMap((item) => [
        item.shortName,
        item.description,
        ...item.keywords,
      ]),
      ...Object.values(componentCategoryMetaEn).flatMap((category) => [
        category.label,
        ...Object.values(category.groups).map((group) => group.label),
      ]),
      ...Object.values(blockMetaEn).flatMap((item) => [item.name, item.description, ...item.tags]),
      ...Object.values(blockCategoryMetaEn).map((item) => item.label),
      ...Object.values(pageMetaEn).flatMap((item) => [item.name, item.description, ...item.tags]),
      ...Object.values(pageCategoryMetaEn).map((item) => item.label),
      ...Object.values(demoMetaEn).flatMap((item) => [
        item.title,
        item.description,
        item.category,
        ...item.tags,
      ]),
      ...Object.values(themeMetaEn).flatMap((item) => [item.label, item.description]),
    ];

    for (const value of visibleValues) {
      expect(CJK.test(value), value).toBe(false);
    }
  });
});
