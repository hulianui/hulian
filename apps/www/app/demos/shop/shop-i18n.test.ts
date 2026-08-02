// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import {
  ScriptKind,
  ScriptTarget,
  SyntaxKind,
  createSourceFile,
  forEachChild,
  isCallExpression,
  isIdentifier,
  isJsxText,
  isStringLiteralLike,
  type Node,
} from "typescript-api";
import { categories } from "./_data/categories";
import { coupons } from "./_data/coupons";
import { orders, STATUS_LABEL } from "./_data/orders";
import { formatCompactCount, products } from "./_data/products";
import { reviews } from "./_data/reviews";
import { SHOP_BASE, SHOP_LOCATION_BASE } from "./_components/nav-config";

const CJK = /[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]/u;
const SHOP_ROOT = new URL(".", import.meta.url).pathname;
const englishIt = process.env.DOCS_LOCALE === "en" ? it : it.skip;

function walk(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function contentKeysUsed(file: string, source: string): Set<string> {
  const sourceFile = createSourceFile(
    file,
    source,
    ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ScriptKind.TSX : ScriptKind.TS,
  );
  const keys = new Set<string>();
  const visit = (node: Node) => {
    if (
      isCallExpression(node) &&
      isIdentifier(node.expression) &&
      node.expression.text === "copy" &&
      node.arguments[0]
    ) {
      const collect = (candidate: Node) => {
        if (isStringLiteralLike(candidate)) keys.add(candidate.text);
        else forEachChild(candidate, collect);
      };
      collect(node.arguments[0]);
    }
    forEachChild(node, visit);
  };
  visit(sourceFile);
  return keys;
}

function cjkLiterals(file: string, source: string): string[] {
  const sourceFile = createSourceFile(
    file,
    source,
    ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ScriptKind.TSX : ScriptKind.TS,
  );
  const values: string[] = [];
  const visit = (node: Node) => {
    if (
      isStringLiteralLike(node) ||
      isJsxText(node) ||
      node.kind === SyntaxKind.TemplateHead ||
      node.kind === SyntaxKind.TemplateMiddle ||
      node.kind === SyntaxKind.TemplateTail
    ) {
      const value = "text" in node ? String(node.text) : node.getText(sourceFile);
      if (CJK.test(value)) values.push(value.trim());
    }
    forEachChild(node, visit);
  };
  visit(sourceFile);
  return values.filter(Boolean);
}

describe("shop English fixtures", () => {
  englishIt("keeps Shop navigation inside the English static export", () => {
    expect(SHOP_BASE).toBe("/demos/shop");
    expect(SHOP_LOCATION_BASE).toBe("/en/demos/shop");
  });

  it("keeps every colocated catalog complete, semantic, consumed, and CJK-free in English", async () => {
    const contentFiles = walk(SHOP_ROOT).filter((file) => file.endsWith(".content.ts"));
    expect(contentFiles).toHaveLength(26);
    const dictionaryKeys = new Set<string>();

    for (const contentFile of contentFiles) {
      const contentSource = readFileSync(contentFile, "utf8");
      const dictionaryKey = contentSource.match(/key:\s*"([^"]+)"/)?.[1];
      expect(dictionaryKey, `${relative(SHOP_ROOT, contentFile)} dictionary key`).toMatch(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      );
      expect(dictionaryKeys.has(dictionaryKey!), `${dictionaryKey} unique dictionary key`).toBe(
        false,
      );
      dictionaryKeys.add(dictionaryKey!);
      const module = await import(pathToFileURL(contentFile).href);
      const zhKeys = Object.keys(module.content["zh-CN"]);
      const enKeys = Object.keys(module.content.en);
      expect(enKeys, `${relative(SHOP_ROOT, contentFile)} parity`).toEqual(zhKeys);
      for (const key of enKeys) {
        expect(key, `${relative(SHOP_ROOT, contentFile)} semantic key`).not.toMatch(
          /^(?:text\d*|copy\d*|localized|alternate|secondary|tertiary|quaternary)$/i,
        );
        expect(module.content.en[key].trim(), `${relative(SHOP_ROOT, contentFile)}:${key}`).not.toBe(
          "",
        );
        expect(CJK.test(module.content.en[key]), `${relative(SHOP_ROOT, contentFile)}:${key}`).toBe(
          false,
        );
      }

      const sourceFile = [
        contentFile.replace(/\.content\.ts$/, ".tsx"),
        contentFile.replace(/\.content\.ts$/, ".ts"),
      ].find(existsSync);
      expect(sourceFile, `${relative(SHOP_ROOT, contentFile)} consumer`).toBeTruthy();
      const used = contentKeysUsed(sourceFile!, readFileSync(sourceFile!, "utf8"));
      expect([...used].sort(), `${relative(SHOP_ROOT, contentFile)} consumed keys`).toEqual(
        [...zhKeys].sort(),
      );
    }
    expect(dictionaryKeys.size).toBe(26);

    const sourceFiles = walk(SHOP_ROOT).filter(
      (file) =>
        /\.(ts|tsx)$/.test(file) &&
        !file.endsWith(".content.ts") &&
        !file.endsWith(".test.ts") &&
        !file.endsWith("types.ts"),
    );
    for (const sourceFile of sourceFiles) {
      expect(
        cjkLiterals(sourceFile, readFileSync(sourceFile, "utf8")),
        relative(SHOP_ROOT, sourceFile),
      ).toEqual([]);
    }
  });

  englishIt("preserves product and category protocol identifiers while presenting reviewed English", () => {
    expect(formatCompactCount(12_000)).toBe("12K");
    expect(categories.map((category) => category.key)).toEqual([
      "digital",
      "home",
      "beauty",
      "outdoor",
      "grocery",
      "apparel",
    ]);
    expect(products.map((product) => product.id)).toEqual([
      "p-hs-air",
      "p-hb-x9",
      "p-hw-fit",
      "p-hp-pro",
      "p-hl-pot",
      "p-hl-lamp",
      "p-hl-quilt",
      "p-hy-serum",
      "p-hy-lip",
      "p-ho-tent",
      "p-ho-shoe",
      "p-ho-bottle",
      "p-hw-nuts",
      "p-hw-coffee",
      "p-ha-jacket",
      "p-ha-bag",
    ]);
    expect(products[0]).toMatchObject({
      name: "HanSound Air Active Noise-Canceling Earbuds",
      category: "digital",
      subCategory: "Audio & headphones",
      colors: [
        { name: "Obsidian black", hex: "#1f2937" },
        { name: "Mica white", hex: "#f3f4f6" },
        { name: "Haze blue", hex: "#93c5fd" },
      ],
      sizes: ["Standard", "Noise Canceling Pro"],
    });
    expect(
      CJK.test(
        JSON.stringify({
          categories,
          products,
        }),
      ),
    ).toBe(false);
  });

  englishIt("preserves coupon, order, and review relations while localizing customer-facing fixtures", () => {
    expect(coupons.map(({ id, kind, status }) => ({ id, kind, status }))).toEqual([
      { id: "cp-1", kind: "amount", status: "available" },
      { id: "cp-2", kind: "amount", status: "available" },
      { id: "cp-3", kind: "discount", status: "available" },
      { id: "cp-4", kind: "shipping", status: "available" },
      { id: "cp-5", kind: "amount", status: "claimed" },
      { id: "cp-6", kind: "amount", status: "expired" },
    ]);
    expect(orders.map(({ id, status, createdAt }) => ({ id, status, createdAt }))).toEqual([
      { id: "HS2026060300128", status: "shipped", createdAt: "2026-06-03 10:24" },
      { id: "HS2026060200096", status: "paid", createdAt: "2026-06-02 19:48" },
      { id: "HS2026053100451", status: "completed", createdAt: "2026-05-31 08:15" },
      { id: "HS2026052800377", status: "pending", createdAt: "2026-05-28 22:03" },
      { id: "HS2026052000219", status: "refunding", createdAt: "2026-05-20 11:20" },
    ]);
    expect(STATUS_LABEL).toEqual({
      pending: "Awaiting payment",
      paid: "Preparing shipment",
      shipped: "In transit",
      completed: "Completed",
      refunding: "Refund in progress",
      closed: "Closed",
    });
    expect(reviews.map((review) => review.id)).toEqual(
      Array.from({ length: 15 }, (_, index) => `r${index + 1}`),
    );
    expect(reviews.every((review) => products.some((product) => product.id === review.productId))).toBe(
      true,
    );
    expect(CJK.test(JSON.stringify({ coupons, orders, reviews }))).toBe(false);
  });
});
