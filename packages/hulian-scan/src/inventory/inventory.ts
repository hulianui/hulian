import { access, readFile, readdir } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";

// TypeScript 7's default package entry intentionally exposes version metadata only.
// Keep its compiler for typechecking and use the pinned 5.9 compiler API solely to
// parse repository source into a TypeScript AST.
import ts from "typescript-ast";

export interface NonRenderingEntry {
  entry: string;
  reason: string;
}

export interface InventoryPaths {
  packageJson: string;
  rootIndex: string;
  showcaseIndex: string;
  sourceRoot: string;
  registryJson: string;
  nonRendering: NonRenderingEntry[];
  workspaceRoot?: string;
}

export interface InventoryEntry {
  id: string;
  entry: string;
  source: string;
  exports: string[];
  aliases: string[];
  kind: "renderable" | "non-rendering";
  categories: string[];
  animated: boolean;
  webgl: boolean;
  documentation?: string;
  scenarioId?: string;
  reason?: string;
  showcaseExport?: string;
  showcaseSource?: string;
}

interface PackageManifest {
  name?: string;
  exports?: Record<string, unknown>;
}

interface RegistryItem {
  name?: string;
  categories?: unknown;
  meta?: {
    exports?: unknown;
    group?: unknown;
    animated?: unknown;
    webgl?: unknown;
    docLocal?: unknown;
  };
}

interface RegistryDocument {
  items?: RegistryItem[];
}

interface NamedExport {
  exported: string;
  original: string;
}

interface ExportDeclarationFacts {
  module: string;
  named: NamedExport[];
  exportAll: boolean;
}

function sourceFile(path: string, contents: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    contents,
    ts.ScriptTarget.Latest,
    true,
    path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function exportDeclarations(path: string, contents: string): ExportDeclarationFacts[] {
  const facts: ExportDeclarationFacts[] = [];
  for (const statement of sourceFile(path, contents).statements) {
    if (
      !ts.isExportDeclaration(statement) ||
      statement.isTypeOnly ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      continue;
    }
    if (!statement.exportClause) {
      facts.push({
        module: statement.moduleSpecifier.text,
        named: [],
        exportAll: true,
      });
      continue;
    }
    if (!ts.isNamedExports(statement.exportClause)) continue;
    facts.push({
      module: statement.moduleSpecifier.text,
      named: statement.exportClause.elements
        .filter((element) => !element.isTypeOnly)
        .map((element) => ({
          exported: element.name.text,
          original: element.propertyName?.text ?? element.name.text,
        })),
      exportAll: false,
    });
  }
  return facts;
}

function slugFromModule(module: string): string | undefined {
  if (!module.startsWith("./")) return undefined;
  return module.slice(2).split("/")[0] || undefined;
}

function packageTarget(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value !== "object" || value === null) return undefined;
  for (const key of ["default", "import", "types"]) {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === "string") return candidate;
  }
  return undefined;
}

function sortedUnique(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function pathForReport(path: string, workspaceRoot?: string): string {
  if (!workspaceRoot) return path;
  const candidate = relative(workspaceRoot, path);
  return candidate.startsWith(`..${sep}`) || candidate === ".." ? path : candidate;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function assertSameExports(slug: string, actual: string[], registryExports: unknown): void {
  if (!Array.isArray(registryExports)) {
    throw new Error(`registry exports missing for ${slug}`);
  }
  const expected = sortedUnique(
    registryExports.filter((value): value is string => typeof value === "string"),
  );
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `registry exports disagree for ${slug}: AST=${actual.join(",")} registry=${expected.join(
        ",",
      )}`,
    );
  }
}

export async function buildInventory(paths: InventoryPaths): Promise<InventoryEntry[]> {
  const [manifestText, rootIndexText, showcaseIndexText, registryText] = await Promise.all([
    readFile(paths.packageJson, "utf8"),
    readFile(paths.rootIndex, "utf8"),
    readFile(paths.showcaseIndex, "utf8"),
    readFile(paths.registryJson, "utf8"),
  ]);
  const manifest = JSON.parse(manifestText) as PackageManifest;
  const packageName = manifest.name ?? "@hulianui/ui";
  const packageExports = manifest.exports ?? {};
  const registry = JSON.parse(registryText) as RegistryDocument;
  const registryBySlug = new Map(
    (registry.items ?? [])
      .filter((item): item is RegistryItem & { name: string } =>
        Boolean(item && typeof item.name === "string"),
      )
      .map((item) => [item.name, item]),
  );
  const reasons = new Map(paths.nonRendering.map((entry) => [entry.entry, entry.reason]));

  const rootAliases = new Map<string, string[]>();
  for (const declaration of exportDeclarations(paths.rootIndex, rootIndexText)) {
    const slug = slugFromModule(declaration.module);
    if (!slug) continue;
    const aliases = declaration.named
      .filter((entry) => entry.exported !== entry.original)
      .map((entry) => entry.exported);
    if (aliases.length > 0) {
      rootAliases.set(slug, [...(rootAliases.get(slug) ?? []), ...aliases]);
    }
  }

  const showcaseBySlug = new Map<string, { exported: string; source: string }>();
  for (const declaration of exportDeclarations(paths.showcaseIndex, showcaseIndexText)) {
    const slug = slugFromModule(declaration.module);
    if (!slug || declaration.named.length !== 1) {
      throw new Error(`invalid showcase export: ${declaration.module}`);
    }
    if (showcaseBySlug.has(slug)) {
      throw new Error(`duplicate showcase export for ${slug}`);
    }
    showcaseBySlug.set(slug, {
      exported: declaration.named[0]!.exported,
      source: declaration.module,
    });
  }

  const directories = (await readdir(paths.sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  const wildcardTarget = packageTarget(packageExports["./*"]);
  const wildcardSlugs = wildcardTarget
    ? (
        await Promise.all(
          directories.map(async (slug) => ({
            slug,
            exists: await fileExists(join(paths.sourceRoot, slug, "index.ts")),
          })),
        )
      )
        .filter((entry) => entry.exists)
        .map((entry) => entry.slug)
    : [];

  const inventory: InventoryEntry[] = [];
  for (const slug of wildcardSlugs) {
    const entry = `${packageName}/${slug}`;
    const indexPath = join(paths.sourceRoot, slug, "index.ts");
    const indexText = await readFile(indexPath, "utf8");
    const declarations = exportDeclarations(indexPath, indexText);
    const exported = sortedUnique(
      declarations.flatMap((declaration) => declaration.named.map((named) => named.exported)),
    );
    const aliases = sortedUnique([
      ...(rootAliases.get(slug) ?? []),
      ...declarations.flatMap((declaration) =>
        declaration.named
          .filter((named) => named.exported !== named.original)
          .map((named) => named.exported),
      ),
    ]);
    const showcase = showcaseBySlug.get(slug);
    if (!showcase) {
      const reason = reasons.get(entry);
      if (!reason) throw new Error(`unclassified public entry: ${entry}`);
      inventory.push({
        id: slug,
        entry,
        source: pathForReport(indexPath, paths.workspaceRoot),
        exports: exported,
        aliases,
        kind: "non-rendering",
        categories: [],
        animated: false,
        webgl: false,
        reason,
      });
      continue;
    }

    const registryItem = registryBySlug.get(slug);
    if (!registryItem) throw new Error(`registry item missing for ${slug}`);
    assertSameExports(slug, exported, registryItem.meta?.exports);
    const documentation = registryItem.meta?.docLocal;
    if (typeof documentation !== "string") {
      throw new Error(`registry documentation missing for ${slug}`);
    }
    const documentationPath = isAbsolute(documentation)
      ? documentation
      : resolve(paths.workspaceRoot ?? dirname(paths.packageJson), documentation);
    if (!(await fileExists(documentationPath))) {
      throw new Error(`registry documentation does not exist for ${slug}: ${documentation}`);
    }
    const showcasePath = resolve(dirname(paths.showcaseIndex), showcase.source);
    const showcaseFile = `${showcasePath}.tsx`;
    if (!(await fileExists(showcaseFile))) {
      throw new Error(`showcase source does not exist for ${slug}: ${showcase.source}`);
    }
    const group = registryItem.meta?.group;
    const categories = sortedUnique([
      ...(typeof group === "string" ? [group] : []),
      ...(Array.isArray(registryItem.categories)
        ? registryItem.categories.filter((value): value is string => typeof value === "string")
        : []),
    ]);
    inventory.push({
      id: slug,
      entry,
      source: pathForReport(indexPath, paths.workspaceRoot),
      exports: exported,
      aliases,
      kind: "renderable",
      categories,
      animated: registryItem.meta?.animated === true,
      webgl: registryItem.meta?.webgl === true,
      documentation,
      scenarioId: `${slug}/basic`,
      showcaseExport: showcase.exported,
      showcaseSource: showcase.source,
    });
  }

  for (const [subpath, targetValue] of Object.entries(packageExports)) {
    if (subpath === "." || subpath === "./*" || subpath.slice(2).includes("/")) {
      continue;
    }
    const slug = subpath.slice(2);
    if (wildcardSlugs.includes(slug)) continue;
    const entry = `${packageName}/${slug}`;
    const reason = reasons.get(entry);
    if (!reason) throw new Error(`unclassified public entry: ${entry}`);
    inventory.push({
      id: slug,
      entry,
      source: packageTarget(targetValue) ?? "unknown",
      exports: [],
      aliases: [],
      kind: "non-rendering",
      categories: [],
      animated: false,
      webgl: false,
      reason,
    });
  }

  const inventoryEntries = new Set(inventory.map((entry) => entry.entry));
  const unusedReasons = [...reasons.keys()].filter((entry) => !inventoryEntries.has(entry));
  if (unusedReasons.length > 0) {
    throw new Error(
      `non-rendering reason does not match a public entry: ${unusedReasons.join(", ")}`,
    );
  }
  return inventory.sort((left, right) => left.id.localeCompare(right.id));
}
