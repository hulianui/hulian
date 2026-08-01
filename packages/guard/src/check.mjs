import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import ts from "typescript";

import { loadConventions } from "./rules.mjs";

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);
const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "out", "coverage"]);
const COLOR_STYLE_PROPS = new Set([
  "background",
  "backgroundColor",
  "borderColor",
  "caretColor",
  "color",
  "fill",
  "outlineColor",
  "stroke",
  "textDecorationColor",
]);

function sourceKind(filePath) {
  if (filePath.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (filePath.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (filePath.endsWith(".ts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function staticText(node) {
  if (!node) return null;
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isJsxExpression(node)) return staticText(node.expression);
  return null;
}

function importBindings(sourceFile) {
  const bindings = new Map();
  const declarations = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    const source = statement.moduleSpecifier.text;
    const names = [];
    const clause = statement.importClause;
    if (clause?.name) {
      names.push("default");
      bindings.set(clause.name.text, { importedName: "default", source });
    }
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const specifier of clause.namedBindings.elements) {
        const importedName = (specifier.propertyName ?? specifier.name).text;
        names.push(importedName);
        bindings.set(specifier.name.text, { importedName, source });
      }
    } else if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      names.push("*");
      bindings.set(clause.namedBindings.name.text, { importedName: "*", source });
    }
    declarations.push({ names, node: statement, source });
  }
  return { bindings, declarations };
}

function location(sourceFile, node) {
  const point = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return { line: point.line + 1, column: point.character + 1 };
}

function invalidCssVars(text, matcher) {
  return [...text.matchAll(/var\((--[\w-]+)/g)]
    .map((match) => match[1])
    .filter(
      (name) =>
        !name.startsWith(matcher.requiredPrefix) &&
        (!matcher.semanticNames || matcher.semanticNames.includes(name)),
    );
}

function jsxBinding(tagName, bindings) {
  if (ts.isIdentifier(tagName)) return bindings.get(tagName.text);
  if (ts.isPropertyAccessExpression(tagName) && ts.isIdentifier(tagName.expression)) {
    const namespace = bindings.get(tagName.expression.text);
    if (namespace?.importedName === "*") return { importedName: tagName.name.text, source: namespace.source };
  }
  return null;
}

export function checkSource(source, options = {}) {
  const filePath = options.filePath ?? "input.tsx";
  const conventions = options.conventions ?? loadConventions(options.configPath);
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    sourceKind(filePath),
  );
  const diagnostics = [];
  const report = (rule, node, message = rule.message) => {
    diagnostics.push({
      file: filePath,
      ...location(sourceFile, node),
      ruleId: rule.id,
      severity: rule.severity,
      message,
      ...(rule.instead ? { instead: rule.instead } : {}),
    });
  };

  for (const diagnostic of sourceFile.parseDiagnostics ?? []) {
    const start = diagnostic.start ?? 0;
    const point = sourceFile.getLineAndCharacterOfPosition(start);
    diagnostics.push({
      file: filePath,
      line: point.line + 1,
      column: point.character + 1,
      ruleId: "syntax-error",
      severity: "error",
      message: ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"),
    });
  }

  const { bindings, declarations } = importBindings(sourceFile);
  const rules = conventions.executableRules;

  for (const rule of rules.filter((candidate) => candidate.matcher.kind === "forbidden-import")) {
    for (const declaration of declarations) {
      const matcher = rule.matcher;
      const sourceMatches = matcher.source
        ? declaration.source === matcher.source
        : new RegExp(matcher.sourcePattern).test(declaration.source);
      const namesMatch =
        !matcher.importedNames || declaration.names.some((name) => matcher.importedNames.includes(name));
      if (sourceMatches && namesMatch) report(rule, declaration.node);
    }
  }

  for (const rule of rules.filter((candidate) => candidate.matcher.kind === "required-import-companion")) {
    const matcher = rule.matcher;
    const triggered = declarations.some(
      (declaration) =>
        declaration.source === matcher.source &&
        declaration.names.some((name) => matcher.importedNames.includes(name)),
    );
    if (!triggered) continue;
    const companion = declarations.some(
      (declaration) =>
        declaration.source === matcher.companion.source &&
        declaration.names.includes(matcher.companion.importedName),
    );
    if (!companion) {
      const trigger = declarations.find((declaration) => declaration.source === matcher.source);
      report(rule, trigger.node);
    }
  }

  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const binding = jsxBinding(node.tagName, bindings);
      for (const rule of rules.filter((candidate) => candidate.matcher.kind === "forbidden-jsx-prop")) {
        if (!binding || !rule.matcher.imports.includes(binding.source)) continue;
        const attribute = node.attributes.properties.find(
          (property) => ts.isJsxAttribute(property) && property.name.getText(sourceFile) === rule.matcher.prop,
        );
        if (attribute) report(rule, attribute);
      }

      for (const rule of rules.filter((candidate) => candidate.matcher.kind === "css-var-prefix")) {
        for (const property of node.attributes.properties) {
          if (!ts.isJsxAttribute(property)) continue;
          const name = property.name.getText(sourceFile);
          if (!rule.matcher.attributes.includes(name)) continue;
          if (name === "style") {
            const expression = ts.isJsxExpression(property.initializer)
              ? property.initializer.expression
              : undefined;
            if (!expression || !ts.isObjectLiteralExpression(expression)) continue;
            for (const styleProperty of expression.properties) {
              if (!ts.isPropertyAssignment(styleProperty)) continue;
              const styleName = styleProperty.name.getText(sourceFile).replace(/^['"]|['"]$/g, "");
              if (!COLOR_STYLE_PROPS.has(styleName)) continue;
              const text = staticText(styleProperty.initializer);
              if (text && invalidCssVars(text, rule.matcher).length > 0) {
                report(rule, styleProperty.initializer);
              }
            }
          } else {
            const text = staticText(property.initializer);
            if (text && invalidCssVars(text, rule.matcher).length > 0) {
              report(rule, property.initializer ?? property);
            }
          }
        }
      }
    }

    if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
      const target = node.expression.expression;
      if (ts.isIdentifier(target)) {
        const binding = bindings.get(target.text);
        for (const rule of rules.filter((candidate) => candidate.matcher.kind === "forbidden-call")) {
          if (
            binding?.source === rule.matcher.source &&
            binding.importedName === rule.matcher.importedName &&
            rule.matcher.memberCall
          ) {
            report(rule, node.expression);
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);

  diagnostics.sort(
    (a, b) => a.line - b.line || a.column - b.column || a.ruleId.localeCompare(b.ruleId),
  );
  return { diagnostics, filesChecked: 1 };
}

function collectFiles(paths) {
  const files = [];
  const visit = (input) => {
    const path = resolve(input);
    if (!existsSync(path)) throw new Error(`路径不存在: ${input}`);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      for (const entry of readdirSync(path, { withFileTypes: true })) {
        if (entry.isDirectory() && SKIP_DIRS.has(entry.name)) continue;
        visit(join(path, entry.name));
      }
    } else if (stat.isFile() && SOURCE_EXTENSIONS.has(extname(path))) {
      files.push(path);
    }
  };
  paths.forEach(visit);
  return files.sort();
}

export function checkFiles(paths, options = {}) {
  const conventions = loadConventions(options.configPath);
  const files = collectFiles(paths);
  const diagnostics = files.flatMap((file) =>
    checkSource(readFileSync(file, "utf8"), { filePath: file, conventions }).diagnostics,
  );
  return { diagnostics, filesChecked: files.length };
}
