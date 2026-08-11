import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import ts from "typescript";

import { loadConventions } from "./rules.mjs";

// 约束表本身也是公开 API：调用方（如 @hulianui/mcp）要按文件循环检查时，
// 需要先加载一次再复用，而不是每个文件重新读一遍 7000 行 JSON。
export { loadConventions };

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

function importBindings(sourceFile, checker) {
  const bindings = new Map();
  const declarations = [];
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const source = statement.moduleSpecifier.text;
    const names = [];
    const clause = statement.importClause;
    if (clause?.name) {
      names.push("default");
      bindings.set(clause.name.text, {
        importedName: "default",
        source,
        symbol: checker.getSymbolAtLocation(clause.name),
      });
    }
    if (clause?.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      for (const specifier of clause.namedBindings.elements) {
        const importedName = (specifier.propertyName ?? specifier.name).text;
        names.push(importedName);
        bindings.set(specifier.name.text, {
          importedName,
          source,
          symbol: checker.getSymbolAtLocation(specifier.name),
        });
      }
    } else if (clause?.namedBindings && ts.isNamespaceImport(clause.namedBindings)) {
      names.push("*");
      bindings.set(clause.namedBindings.name.text, {
        importedName: "*",
        source,
        symbol: checker.getSymbolAtLocation(clause.namedBindings.name),
      });
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

/**
 * 收集一个 JSX 属性里所有**静态**字符串片段，拼成一段可按 Tailwind 类名扫描的文本。
 * className 极少是单个字面量：`cn("a", cond && "b", `c-${n}`)` 才是常态，
 * 所以按属性整体取，而不是按单个字面量 —— 否则「同一个 className 里前景背景同色」
 * 这类判据会被 cn() 的多个实参拆开而永远命中不了。模板里的插值表达式跳过（不可静态判定）。
 */
function staticClassText(node) {
  const parts = [];
  const walk = (current) => {
    if (!current) return;
    if (ts.isStringLiteral(current) || ts.isNoSubstitutionTemplateLiteral(current)) {
      parts.push(current.text);
      return;
    }
    if (ts.isTemplateExpression(current)) {
      parts.push(current.head.text);
      for (const span of current.templateSpans) parts.push(span.literal.text);
      return;
    }
    current.forEachChild(walk);
  };
  walk(node);
  return parts.join(" ");
}

function resolvedBinding(identifier, bindings, checker) {
  const binding = bindings.get(identifier.text);
  if (!binding?.symbol || checker.getSymbolAtLocation(identifier) !== binding.symbol) return null;
  return binding;
}

function jsxBinding(tagName, bindings, checker) {
  if (ts.isIdentifier(tagName)) return resolvedBinding(tagName, bindings, checker);
  if (ts.isPropertyAccessExpression(tagName) && ts.isIdentifier(tagName.expression)) {
    const namespace = resolvedBinding(tagName.expression, bindings, checker);
    if (namespace?.importedName === "*")
      return { importedName: tagName.name.text, source: namespace.source };
  }
  return null;
}


// ── no-private-deep-import：按消费方**实装的** @hulianui/ui 判定，而不是烤进本包的 slug 清单 ──
//
// 清单是 conventions.json 生成那一刻的库目录快照，于是「ui 发了新组件、guard 还没跟着发版」
// 这段时间里，消费方一用新组件就被判 error，且建议方向是反的（劝人退回根入口，而根入口正是
// 这条规则平时劝人别用的那个）。见 hulianui/hulian#190：0.29.0 的 Label 就撞上了。
//
// 真正的判据只有一个：这个子路径在消费方那份 package.json 的 exports 里能不能解析出来。
// 能读到实装包就以它为准；读不到（没装依赖、纯文本检查）才退回清单。
const UI_PKG = "@hulianui/ui";
const installedUiCache = new Map();

function findInstalledUi(fromDir) {
  let dir = resolve(fromDir);
  for (;;) {
    const pkgDir = join(dir, "node_modules", ...UI_PKG.split("/"));
    const pkgJson = join(pkgDir, "package.json");
    if (existsSync(pkgJson)) {
      try {
        return { dir: pkgDir, pkg: JSON.parse(readFileSync(pkgJson, "utf8")) };
      } catch {
        return null; // 装坏了就当读不到，退回清单而不是崩在门禁里
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** 该子路径在实装包的 exports 里能否解析出来；读不到实装包时返回 null（交回清单判定）。 */
function resolvesInInstalledUi(subpath, fromDir) {
  const key = resolve(fromDir);
  if (!installedUiCache.has(key)) installedUiCache.set(key, findInstalledUi(key));
  const installed = installedUiCache.get(key);
  if (!installed) return null;

  const exportsField = installed.pkg.exports;
  if (!exportsField || typeof exportsField !== "object") return null;
  if (Object.prototype.hasOwnProperty.call(exportsField, `./${subpath}`)) return true;

  const wildcard = exportsField["./*"];
  if (!wildcard) return false;
  // 取通配条目里任意一个真实文件目标（"./src/*/index.ts" 之类），把 * 换成子路径看文件在不在。
  const targets = typeof wildcard === "string" ? [wildcard] : Object.values(wildcard);
  return targets.some(
    (target) =>
      typeof target === "string" &&
      target.includes("*") &&
      existsSync(join(installed.dir, target.replace("*", subpath))),
  );
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
  // 只建当前文件的轻量 Program，不解析依赖；TypeChecker 仍能区分 import binding 与
  // 函数参数/局部变量等同名符号，避免按文本匹配造成阻断级误报。
  const compilerOptions = {
    allowJs: true,
    jsx: ts.JsxEmit.Preserve,
    noLib: true,
    noResolve: true,
  };
  const host = ts.createCompilerHost(compilerOptions);
  host.getSourceFile = (name) => (name === filePath ? sourceFile : undefined);
  host.fileExists = (name) => name === filePath;
  host.readFile = (name) => (name === filePath ? source : undefined);
  const checker = ts.createProgram([filePath], compilerOptions, host).getTypeChecker();
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

  const { bindings, declarations } = importBindings(sourceFile, checker);
  const rules = conventions.executableRules;

  const checkedDir = dirname(resolve(filePath));
  for (const rule of rules.filter((candidate) => candidate.matcher.kind === "forbidden-import")) {
    for (const declaration of declarations) {
      const matcher = rule.matcher;
      let sourceMatches = matcher.source
        ? declaration.source === matcher.source
        : new RegExp(matcher.sourcePattern).test(declaration.source);
      // 命中清单不等于真的解析不出来：能读到消费方实装的 ui 包时以它的 exports 为准（#190）。
      if (
        sourceMatches &&
        rule.id === "no-private-deep-import" &&
        declaration.source.startsWith(`${UI_PKG}/`)
      ) {
        const resolves = resolvesInInstalledUi(declaration.source.slice(UI_PKG.length + 1), checkedDir);
        if (resolves === true) sourceMatches = false;
      }
      const namesMatch =
        !matcher.importedNames ||
        declaration.names.some((name) => matcher.importedNames.includes(name));
      if (sourceMatches && namesMatch) report(rule, declaration.node);
    }
  }

  for (const rule of rules.filter(
    (candidate) => candidate.matcher.kind === "required-import-companion",
  )) {
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
      const binding = jsxBinding(node.tagName, bindings, checker);
      for (const rule of rules.filter(
        (candidate) => candidate.matcher.kind === "forbidden-jsx-prop",
      )) {
        if (!binding || !rule.matcher.imports.includes(binding.source)) continue;
        const attribute = node.attributes.properties.find(
          (property) =>
            ts.isJsxAttribute(property) && property.name.getText(sourceFile) === rule.matcher.prop,
        );
        if (attribute) report(rule, attribute);
      }

      for (const rule of rules.filter(
        (candidate) => candidate.matcher.kind === "class-name-tokens",
      )) {
        const matcher = rule.matcher;
        for (const property of node.attributes.properties) {
          if (!ts.isJsxAttribute(property)) continue;
          if (!matcher.attributes.includes(property.name.getText(sourceFile))) continue;
          const text = staticClassText(property.initializer);
          if (!text || !new RegExp(matcher.pattern).test(text)) continue;
          // coOccurs：只有同一段 className 里还出现了这个类才判违规。用于「前景背景同色」
          // 这类零误报判据 —— 单看 bg-muted-foreground 无法断定对错，但它和 text-muted-foreground 同时出现
          // 一定是错的（同一个变量既当底又当字，不可能是有意的）。
          if (matcher.coOccurs && !new RegExp(matcher.coOccurs).test(text)) continue;
          report(rule, property.initializer ?? property);
        }
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
        const binding = resolvedBinding(target, bindings, checker);
        for (const rule of rules.filter(
          (candidate) => candidate.matcher.kind === "forbidden-call",
        )) {
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
  const diagnostics = files.flatMap(
    (file) => checkSource(readFileSync(file, "utf8"), { filePath: file, conventions }).diagnostics,
  );
  return { diagnostics, filesChecked: files.length };
}
