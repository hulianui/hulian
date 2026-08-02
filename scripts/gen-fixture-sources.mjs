import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";
const blockEnglish = JSON.parse(
  readFileSync(new URL("../apps/www/app/blocks/block-fixtures.en.json", import.meta.url), "utf8"),
);
const pageEnglish = JSON.parse(
  readFileSync(new URL("../apps/www/app/pages/page-fixtures.en.json", import.meta.url), "utf8"),
);

const CJK = /[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…]/u;
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));

function createTranslator(copy) {
  const entries = Object.entries(copy).sort(([a], [b]) => b.length - a.length);
  return (value, file) => {
    if (!CJK.test(value)) return value;
    const key = value.trim().replace(/\s+/g, " ");
    if (copy[key]) return copy[key];

    let translated = value;
    for (const [source, target] of entries) {
      if (translated.includes(source)) translated = translated.replaceAll(source, target);
    }
    if (CJK.test(translated)) {
      throw new Error(`[fixture-source] missing English copy in ${file}: ${JSON.stringify(value)}`);
    }
    return translated;
  };
}

function translateSource(source, file, copy) {
  const translate = createTranslator(copy);
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const transformer = (context) => {
    const visit = (node) => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && CJK.test(node.name.text)) {
        return ts.factory.updatePropertyAssignment(
          node,
          ts.factory.createStringLiteral(translate(node.name.text, file)),
          ts.visitNode(node.initializer, visit),
        );
      }
      if (ts.isStringLiteral(node)) {
        if (node.text.endsWith("/lib/fixture-ui")) {
          return ts.factory.createStringLiteral("@hulianui/ui");
        }
        return ts.factory.createStringLiteral(translate(node.text, file));
      }
      if (ts.isNoSubstitutionTemplateLiteral(node)) {
        return ts.factory.createNoSubstitutionTemplateLiteral(translate(node.text, file));
      }
      if (ts.isTemplateHead(node)) {
        return ts.factory.createTemplateHead(translate(node.text, file));
      }
      if (ts.isTemplateMiddle(node)) {
        return ts.factory.createTemplateMiddle(translate(node.text, file));
      }
      if (ts.isTemplateTail(node)) {
        return ts.factory.createTemplateTail(translate(node.text, file));
      }
      if (ts.isJsxText(node)) {
        return ts.factory.createJsxText(translate(node.text, file));
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (root) => ts.visitNode(root, visit);
  };
  const result = ts.transform(sourceFile, [transformer]);
  try {
    return ts
      .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
      .printFile(result.transformed[0]);
  } finally {
    result.dispose();
  }
}

function generate(directory, output, copy) {
  const root = resolve(directory);
  const sources = Object.fromEntries(
    readdirSync(root)
      .filter((file) => file.endsWith(".tsx"))
      .sort()
      .map((file) => [file, translateSource(readFileSync(join(root, file), "utf8"), file, copy)]),
  );
  writeFileSync(output, `${JSON.stringify(sources, null, 2)}\n`);
  return Object.keys(sources).length;
}

const blockCount = generate(
  join(REPO_ROOT, "apps/www/app/blocks/_blocks"),
  join(REPO_ROOT, "apps/www/app/blocks/block-fixture-sources.en.json"),
  blockEnglish,
);
const pageCount = generate(
  join(REPO_ROOT, "apps/www/app/pages/_pages"),
  join(REPO_ROOT, "apps/www/app/pages/page-fixture-sources.en.json"),
  pageEnglish,
);

console.log(`[fixture-sources] ${blockCount} blocks · ${pageCount} pages`);
