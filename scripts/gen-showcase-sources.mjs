import { mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";

const CJK = /[\p{Script=Han}\u3000-\u303f\uff01-\uff0f\uff1a-\uff20\uff3b-\uff40\uff5b-\uff65]/u;
const REPO_ROOT = fileURLToPath(new URL("../", import.meta.url));
const DEFAULT_SOURCE_ROOT = join(REPO_ROOT, "packages/ui/src");
const DEFAULT_OUTPUT_ROOT = join(REPO_ROOT, "apps/www/generated/showcase-en");
const DEFAULT_COPY_FILE = join(REPO_ROOT, "apps/www/i18n/showcase-copy.en.json");

function posixPath(value) {
  return value.split(sep).join("/");
}

function normalizedText(value) {
  return value.trim().replace(/\s+/gu, " ");
}

function normalizeCopy(copy) {
  if (!copy || typeof copy !== "object" || Array.isArray(copy)) {
    throw new TypeError("[showcase-source] English copy must be a JSON object");
  }
  const structured = Object.hasOwn(copy, "exact") || Object.hasOwn(copy, "files");
  const exact = structured ? copy.exact ?? {} : copy;
  const files = structured ? copy.files ?? {} : {};
  if (!exact || typeof exact !== "object" || Array.isArray(exact)) {
    throw new TypeError("[showcase-source] copy.exact must be an object");
  }
  if (!files || typeof files !== "object" || Array.isArray(files)) {
    throw new TypeError("[showcase-source] copy.files must be an object");
  }
  for (const [key, target] of Object.entries(exact)) {
    if (typeof target !== "string") {
      throw new TypeError(
        `[showcase-source] English copy for ${JSON.stringify(key)} must be a string`,
      );
    }
    if (target.trim().length === 0 || CJK.test(target)) {
      throw new TypeError(
        `[showcase-source] English copy for ${JSON.stringify(key)} must be non-empty English`,
      );
    }
  }
  for (const [file, entries] of Object.entries(files)) {
    if (!entries || typeof entries !== "object" || Array.isArray(entries)) {
      throw new TypeError(`[showcase-source] file copy for ${file} must be an object`);
    }
    for (const [key, target] of Object.entries(entries)) {
      if (typeof target !== "string") {
        throw new TypeError(
          `[showcase-source] English copy for ${file} ${JSON.stringify(key)} must be a string`,
        );
      }
      if (target.trim().length === 0 || CJK.test(target)) {
        throw new TypeError(
          `[showcase-source] English copy for ${file} ${JSON.stringify(
            key,
          )} must be non-empty English`,
        );
      }
    }
  }
  return { exact, files };
}

function replacementWithOuterWhitespace(value, target) {
  const leading = value.match(/^\s*/u)?.[0] ?? "";
  const trailing = value.match(/\s*$/u)?.[0] ?? "";
  const prefix = /^\s/u.test(target) ? "" : leading;
  const suffix = /\s$/u.test(target) ? "" : trailing;
  return `${prefix}${target}${suffix}`;
}

function copyToken(scope, file, key) {
  return scope === "exact" ? `exact\0${key}` : `file\0${file}\0${key}`;
}

function createTranslator(copyInput, sourceFile, consumed) {
  const copy = normalizeCopy(copyInput);
  const fileCopy = copy.files[sourceFile] ?? {};

  function resolveTranslation(value, allowNormalized) {
    if (Object.hasOwn(fileCopy, value)) {
      consumed.add(copyToken("file", sourceFile, value));
      return { value: fileCopy[value], kind: "file" };
    }
    if (Object.hasOwn(copy.exact, value)) {
      consumed.add(copyToken("exact", sourceFile, value));
      return { value: copy.exact[value], kind: "exact" };
    }
    if (!allowNormalized) return undefined;
    const key = normalizedText(value);
    if (Object.hasOwn(fileCopy, key)) {
      consumed.add(copyToken("file", sourceFile, key));
      return { value: replacementWithOuterWhitespace(value, fileCopy[key]), kind: "file" };
    }
    if (Object.hasOwn(copy.exact, key)) {
      consumed.add(copyToken("exact", sourceFile, key));
      return { value: replacementWithOuterWhitespace(value, copy.exact[key]), kind: "fallback" };
    }
    return undefined;
  }

  return (value) => {
    if (!CJK.test(value)) return { value, kind: undefined };

    const raw = resolveTranslation(value, false);
    if (raw) return raw;

    const lines = value.split(/(\r?\n)/u);
    const kinds = [];
    const translated = lines
      .map((line) => {
        if (line === "\n" || line === "\r\n" || !CJK.test(line)) return line;
        const match = resolveTranslation(line, true);
        if (!match) {
          throw new Error(
            `[showcase-source] missing English copy in ${sourceFile}: ${JSON.stringify(line)}`,
          );
        }
        kinds.push(match.kind);
        return match.value;
      })
      .join("");

    if (CJK.test(translated)) {
      throw new Error(
        `[showcase-source] missing English copy in ${sourceFile}: ${JSON.stringify(value)}`,
      );
    }
    return { value: translated, kinds };
  };
}

function rewrittenModulePath(modulePath, sourceFile, outputFile) {
  if (!modulePath.startsWith(".")) return modulePath;
  const resolvedTarget = resolve(dirname(sourceFile), modulePath);
  let rewritten = posixPath(relative(dirname(outputFile), resolvedTarget));
  if (!rewritten.startsWith(".")) rewritten = `./${rewritten}`;
  return rewritten;
}

export function translateShowcaseModule(source, options) {
  const { sourceFile, outputFile, copy } = options;
  const sourcePath = options.sourcePath ?? resolve(sourceFile);
  const outputPath = options.outputPath ?? resolve(outputFile);
  const consumed = options.consumed ?? new Set();
  const usage = { exact: 0, file: 0, fallback: 0 };
  const translate = createTranslator(copy, posixPath(sourceFile), consumed);
  const sourceFileNode = ts.createSourceFile(
    sourceFile,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const transformer = (context) => {
    const translateNodeText = (node, factory) => {
      const result = translate(node.text);
      if (result.kind) usage[result.kind] += 1;
      for (const kind of result.kinds ?? []) usage[kind] += 1;
      return factory(result.value);
    };
    const visit = (node) => {
      if (
        ts.isStringLiteral(node) &&
        ((ts.isImportDeclaration(node.parent) && node.parent.moduleSpecifier === node) ||
          (ts.isExportDeclaration(node.parent) && node.parent.moduleSpecifier === node) ||
          (ts.isCallExpression(node.parent) &&
            node.parent.expression.kind === ts.SyntaxKind.ImportKeyword &&
            node.parent.arguments[0] === node))
      ) {
        return ts.factory.createStringLiteral(
          rewrittenModulePath(node.text, sourcePath, outputPath),
        );
      }
      if (ts.isStringLiteral(node)) {
        return translateNodeText(node, ts.factory.createStringLiteral);
      }
      if (ts.isNoSubstitutionTemplateLiteral(node)) {
        return translateNodeText(node, ts.factory.createNoSubstitutionTemplateLiteral);
      }
      if (ts.isTemplateHead(node)) {
        return translateNodeText(node, ts.factory.createTemplateHead);
      }
      if (ts.isTemplateMiddle(node)) {
        return translateNodeText(node, ts.factory.createTemplateMiddle);
      }
      if (ts.isTemplateTail(node)) {
        return translateNodeText(node, ts.factory.createTemplateTail);
      }
      if (ts.isJsxText(node)) {
        return translateNodeText(node, ts.factory.createJsxText);
      }
      return ts.visitEachChild(node, visit, context);
    };
    return (root) => ts.visitNode(root, visit);
  };

  const result = ts.transform(sourceFileNode, [transformer]);
  try {
    const code = `${ts
      .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
      .printFile(result.transformed[0])
      .replace(/[ \t]+$/gmu, "")
      .trimEnd()}\n`;
    if (CJK.test(code)) {
      throw new Error(
        `[showcase-source] untranslated CJK remains in ${sourceFile}; only literal translation is supported`,
      );
    }
    return { code, usage, consumed };
  } finally {
    result.dispose();
  }
}

function sourceModules(sourceRoot) {
  return readdirSync(sourceRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".showcase.tsx"))
    .map((entry) => join(entry.parentPath, entry.name))
    .sort();
}

function unusedCopyEntries(copyInput, consumed) {
  const copy = normalizeCopy(copyInput);
  const unused = [];
  for (const key of Object.keys(copy.exact)) {
    if (!consumed.has(copyToken("exact", "", key))) unused.push(`exact ${JSON.stringify(key)}`);
  }
  for (const [file, entries] of Object.entries(copy.files)) {
    for (const key of Object.keys(entries)) {
      if (!consumed.has(copyToken("file", file, key))) {
        unused.push(`${file} ${JSON.stringify(key)}`);
      }
    }
  }
  return unused;
}

function expectedArtifactStatus(outputRoot, expected) {
  const diagnostics = [];
  const actual = readdirSync(outputRoot, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => posixPath(relative(outputRoot, join(entry.parentPath, entry.name))))
    .sort();
  const expectedNames = new Set(expected.keys());
  for (const file of actual) {
    if (!expectedNames.has(file)) diagnostics.push(`stale ${file}`);
  }
  for (const [file, body] of expected) {
    const target = join(outputRoot, file);
    let actualBody;
    try {
      actualBody = readFileSync(target, "utf8");
    } catch {
      diagnostics.push(`missing ${file}`);
      continue;
    }
    if (actualBody !== body) diagnostics.push(`changed ${file}`);
  }
  return { actual, diagnostics };
}

export function generateShowcaseSources(options = {}) {
  const repoRoot = resolve(options.repoRoot ?? REPO_ROOT);
  const sourceRoot = resolve(options.sourceRoot ?? DEFAULT_SOURCE_ROOT);
  const outputRoot = resolve(options.outputRoot ?? DEFAULT_OUTPUT_ROOT);
  const copy = normalizeCopy(options.copy ?? {});
  const check = options.check === true;
  const consumed = new Set();
  const usage = { exact: 0, file: 0, fallback: 0 };
  const expected = new Map();
  const outputNames = new Set();

  for (const sourceFile of sourceModules(sourceRoot)) {
    const sourceRelative = posixPath(relative(repoRoot, sourceFile));
    const outputName = sourceFile.slice(dirname(sourceFile).length + 1);
    if (outputNames.has(outputName)) {
      throw new Error(`[showcase-source] duplicate generated module name: ${outputName}`);
    }
    outputNames.add(outputName);
    const outputFile = join(outputRoot, outputName);
    const translated = translateShowcaseModule(readFileSync(sourceFile, "utf8"), {
      sourceFile: sourceRelative,
      outputFile: posixPath(relative(repoRoot, outputFile)),
      sourcePath: sourceFile,
      outputPath: outputFile,
      copy,
      consumed,
    });
    expected.set(outputName, translated.code);
    for (const key of Object.keys(usage)) usage[key] += translated.usage[key];
  }

  const barrel = [...outputNames]
    .sort()
    .map((file) => `export * from ${JSON.stringify(`./${file.replace(/\.tsx$/u, "")}`)};`)
    .join("\n");
  expected.set("index.ts", `${barrel}\n`);

  const unused = unusedCopyEntries(copy, consumed);
  if (unused.length > 0) {
    throw new Error(`[showcase-source] unused English copy:\n  ${unused.join("\n  ")}`);
  }

  mkdirSync(outputRoot, { recursive: true });
  const status = expectedArtifactStatus(outputRoot, expected);
  if (check) {
    if (status.diagnostics.length > 0) {
      throw new Error(
        `[showcase-source] generated artifacts are stale:\n  ${status.diagnostics.join("\n  ")}`,
      );
    }
  } else {
    for (const file of status.actual) {
      if (!expected.has(file)) unlinkSync(join(outputRoot, file));
    }
    for (const [file, body] of expected) writeFileSync(join(outputRoot, file), body);
  }

  return { modules: outputNames.size, usage };
}

function main() {
  const check = process.argv.includes("--check");
  const copy = JSON.parse(readFileSync(DEFAULT_COPY_FILE, "utf8"));
  const report = generateShowcaseSources({ copy, check });
  console.log(
    `[showcase-source] ${report.modules} modules · exact ${report.usage.exact} · file ${
      report.usage.file
    } · fallback ${report.usage.fallback}${check ? " · current" : ""}`,
  );
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) main();
