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
    if (copy[key]) {
      const leading = value.match(/^\s*/u)?.[0] ?? "";
      const trailing = value.match(/\s*$/u)?.[0] ?? "";
      return `${leading}${copy[key]}${trailing}`;
    }

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

export function translateFixtureModule(source, file, copy, kind) {
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
      if (
        ts.isImportDeclaration(node) &&
        ts.isStringLiteral(node.moduleSpecifier) &&
        node.moduleSpecifier.text.endsWith("/lib/fixture-copy")
      ) {
        return undefined;
      }
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "translateFixtureText" &&
        node.arguments.length === 1
      ) {
        return ts.visitNode(node.arguments[0], visit);
      }
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
        if (kind === "page" && /^\.\.\/\.\.\/blocks\/_blocks\/[^/]+$/.test(node.text)) {
          return ts.factory.createStringLiteral(`${node.text}.en`);
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
      .printFile(result.transformed[0])
      .replace(/[ \t]+$/gm, "");
  } finally {
    result.dispose();
  }
}

function generate(directory, output, copy, kind) {
  const root = resolve(directory);
  const sources = Object.fromEntries(
    readdirSync(root)
      .filter((file) => file.endsWith(".tsx") && !file.endsWith(".en.tsx"))
      .sort()
      .map((file) => {
        const source = translateFixtureModule(readFileSync(join(root, file), "utf8"), file, copy, kind);
        writeFileSync(join(root, file.replace(/\.tsx$/, ".en.tsx")), `${source.trimEnd()}\n`);
        return [file, source];
      }),
  );
  writeFileSync(output, `${JSON.stringify(sources, null, 2)}\n`);
  return Object.keys(sources).length;
}

export function generatedEnglishRegistry(source, kind) {
  const directory = kind === "block" ? "_blocks" : "_pages";
  const previewName = kind === "block" ? "Block" : "Page";
  return `${source
    .replace(/^\s*\/\/[^\n]*[\p{Script=Han}，。！？；：“”‘’（）【】《》〈〉「」『』…][^\n]*(?:\n|$)/gmu, "")
    .replace(/^import \{ DOCS_LOCALE \} from .*\n/m, "")
    .replace(/^import \{ .*Previews as english.* \} from ["']\.\/_registry\.en["'];\n/m, "")
    .replace(
      new RegExp(`const chinese${previewName}Previews`),
      `export const ${kind}Previews`,
    )
    .replace(
      new RegExp(`\nexport const ${kind}Previews = DOCS_LOCALE[^\n]+\n`),
      "\n",
    )
    .replace(
      new RegExp(`(from ["']\\./${directory}/[^"']+)(["'])`, "g"),
      "$1.en$2",
    )
    .trimEnd()}\n`;
}

function main() {
  const blockCount = generate(
    join(REPO_ROOT, "apps/www/app/blocks/_blocks"),
    join(REPO_ROOT, "apps/www/app/blocks/block-fixture-sources.en.json"),
    blockEnglish,
    "block",
  );
  const pageCount = generate(
    join(REPO_ROOT, "apps/www/app/pages/_pages"),
    join(REPO_ROOT, "apps/www/app/pages/page-fixture-sources.en.json"),
    pageEnglish,
    "page",
  );
  for (const [area, kind] of [["blocks", "block"], ["pages", "page"]]) {
    const registry = join(REPO_ROOT, "apps/www/app", area, "_registry.tsx");
    writeFileSync(
      join(REPO_ROOT, "apps/www/app", area, "_registry.en.tsx"),
      generatedEnglishRegistry(readFileSync(registry, "utf8"), kind),
    );
  }
  console.log(`[fixture-sources] ${blockCount} blocks · ${pageCount} pages`);
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) main();
