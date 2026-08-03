import { execFileSync } from "node:child_process";
import {
  cp,
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, isAbsolute, join, parse, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { scanTask9EnglishOutput } from "./check-bilingual-docs-output.mjs";
import {
  NESTED_BASE_PATH,
  NESTED_LOCALE,
  ROOT_LOCALE,
  localeAbsoluteUrl,
} from "./docs-locale-layout.mjs";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptRoot, "..");
const wwwRoot = join(repositoryRoot, "apps/www");
const publicRoot = join(wwwRoot, "public");
const buildRoot = join(wwwRoot, ".bilingual-build");
const zhRoot = join(buildRoot, "zh");
const enRoot = join(buildRoot, "en");
const mergedRoot = join(buildRoot, "final");
const zhArtifactsRoot = join(buildRoot, "artifacts-zh");
const enArtifactsRoot = join(buildRoot, "artifacts-en");
const outputRoot = join(wwwRoot, "out");
const canonicalSiteOrigin = "https://hulianui.haloritual.com";
// 嵌套语言在导出产物里的目录名（"/zh" → "zh"）。根语言直接铺在产物根，没有目录。
const nestedExportDirectory = NESTED_BASE_PATH.slice(1);
const replacementMarkerName = "replacement-in-progress.json";
const removableBuildDirectories = new Set(
  [zhRoot, enRoot, mergedRoot, zhArtifactsRoot, enArtifactsRoot].map((path) => resolve(path)),
);
const generatedArtifactPaths = [
  "llms.txt",
  "llms-full.txt",
  "registry.json",
  "conventions.json",
  "d",
  "r",
];

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

async function filePaths(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true, recursive: true })) {
    if (entry.isFile()) {
      files.push(relative(root, join(entry.parentPath, entry.name)).split(sep).join("/"));
    }
  }
  return files;
}

async function publicAssetPaths() {
  if (!(await pathExists(publicRoot))) return new Set();
  return new Set(await filePaths(publicRoot));
}

function routeFromHtml(relativePath) {
  if (relativePath === "index.html") return "/";
  if (relativePath.endsWith("/index.html")) {
    return `/${relativePath.slice(0, -"/index.html".length)}`;
  }
  return `/${relativePath.slice(0, -".html".length)}`;
}

async function routeDocuments(root) {
  const resolvedRoot = resolve(root);
  const publicAssets = await publicAssetPaths();
  const documents = [];

  for (const relativePath of await filePaths(resolvedRoot)) {
    if (
      !relativePath.endsWith(".html") ||
      relativePath.startsWith("_next/") ||
      relativePath.startsWith(`${nestedExportDirectory}/`) ||
      publicAssets.has(relativePath) ||
      !/<html(?:\s|>)/i.test(await readFile(join(resolvedRoot, relativePath), "utf8"))
    ) {
      continue;
    }
    documents.push({ relativePath, route: routeFromHtml(relativePath) });
  }

  return documents;
}

export async function routeSet(root) {
  return new Set((await routeDocuments(root)).map((document) => document.route));
}

/**
 * 按 SSOT 把两份 locale 产物分派成「铺在根」与「进子目录」两个角色。
 * 调用方仍按语种传参，翻转语言布局时只需改 docs-locale-layout.mjs。
 */
function localeExportRoles(chineseExport, englishExport) {
  const byLocale = { "zh-CN": chineseExport, en: englishExport };
  return { rootExport: byLocale[ROOT_LOCALE], nestedExport: byLocale[NESTED_LOCALE] };
}

export async function assertRouteParity(chineseRoot, englishRoot) {
  const [chineseRoutes, englishRoutes] = await Promise.all([
    routeSet(chineseRoot),
    routeSet(englishRoot),
  ]);
  const missingFromEnglish = [...chineseRoutes].filter((route) => !englishRoutes.has(route)).sort();
  const missingFromChinese = [...englishRoutes].filter((route) => !chineseRoutes.has(route)).sort();

  if (missingFromEnglish.length || missingFromChinese.length) {
    const details = [];
    if (missingFromEnglish.length) {
      details.push(`missing from English: ${missingFromEnglish.join(", ")}`);
    }
    if (missingFromChinese.length) {
      details.push(`missing from Chinese: ${missingFromChinese.join(", ")}`);
    }
    throw new Error(`Bilingual route parity failed; ${details.join("; ")}`);
  }

  return chineseRoutes;
}

/**
 * 校验成品树：根语言铺在根、嵌套语言在子目录，两个语种路由一一对应。
 * 成品树的目录角色由 SSOT 决定，这里再映射回语种交给 assertRouteParity 比对。
 */
export async function assertFinalRouteParity(finalRoot) {
  const resolvedFinalRoot = resolve(finalRoot);
  const byLocale = {
    [ROOT_LOCALE]: resolvedFinalRoot,
    [NESTED_LOCALE]: join(resolvedFinalRoot, nestedExportDirectory),
  };
  return assertRouteParity(byLocale["zh-CN"], byLocale.en);
}

export async function mergeExports(chineseRoot, englishRoot, finalRoot) {
  const resolvedChineseRoot = resolve(chineseRoot);
  const resolvedEnglishRoot = resolve(englishRoot);
  const resolvedFinalRoot = resolve(finalRoot);

  await assertRouteParity(resolvedChineseRoot, resolvedEnglishRoot);
  if (await pathExists(resolvedFinalRoot)) {
    throw new Error(`Merge destination already exists: ${resolvedFinalRoot}`);
  }

  const { rootExport, nestedExport } = localeExportRoles(
    resolvedChineseRoot,
    resolvedEnglishRoot,
  );
  await cp(rootExport, resolvedFinalRoot, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  await cp(nestedExport, join(resolvedFinalRoot, nestedExportDirectory), {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  await postprocessBilingualRouteMetadata(resolvedFinalRoot);
}

export async function assembleExportsByRename(chineseRoot, englishRoot, finalRoot) {
  const resolvedChineseRoot = resolve(chineseRoot);
  const resolvedEnglishRoot = resolve(englishRoot);
  const resolvedFinalRoot = resolve(finalRoot);

  await assertRouteParity(resolvedChineseRoot, resolvedEnglishRoot);
  if (await pathExists(resolvedFinalRoot)) {
    throw new Error(`Merge destination already exists: ${resolvedFinalRoot}`);
  }

  const { rootExport, nestedExport } = localeExportRoles(
    resolvedChineseRoot,
    resolvedEnglishRoot,
  );
  await rename(rootExport, resolvedFinalRoot);
  try {
    await rename(nestedExport, join(resolvedFinalRoot, nestedExportDirectory));
  } catch (error) {
    try {
      await rename(resolvedFinalRoot, rootExport);
    } catch (rollbackError) {
      throw new AggregateError(
        [error, rollbackError],
        "Failed to assemble bilingual exports and restore the root-locale export",
      );
    }
    throw error;
  }

  await postprocessBilingualRouteMetadata(resolvedFinalRoot);
}

function absoluteLocaleUrl(route, locale) {
  // 前缀由 SSOT 决定；嵌套语言首页必须写成带尾斜杠的 "/zh/"，静态托管会把 "/zh" 308 到
  // "/zh/"，而 canonical / hreflang 指向会跳转的地址是软错误，Google 需多跳一次才认。
  return localeAbsoluteUrl(route, locale, canonicalSiteOrigin);
}

function htmlAttribute(tag, name) {
  const match = tag.match(
    new RegExp(`(?:\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function linkRelations(tag) {
  return new Set((htmlAttribute(tag, "rel") ?? "").toLowerCase().split(/\s+/).filter(Boolean));
}

function seoAlternateLanguage(tag) {
  if (!linkRelations(tag).has("alternate")) return null;
  const value = (htmlAttribute(tag, "hreflang") ?? "").toLowerCase();
  if (value === "zh-cn") return "zh-CN";
  if (value === "en") return "en";
  if (value === "x-default") return "x-default";
  return null;
}

function repairRouteMetadata(html, route, locale) {
  const chineseUrl = absoluteLocaleUrl(route, "zh-CN");
  const englishUrl = absoluteLocaleUrl(route, "en");
  const canonicalUrl = locale === "en" ? englishUrl : chineseUrl;
  const closingHead = html.search(/<\/head\s*>/i);
  if (closingHead === -1) {
    throw new Error(`Route HTML is missing </head>: ${route}`);
  }
  const head = html.slice(0, closingHead);
  const rest = html.slice(closingHead);
  const linkPattern = /<link\b[^>]*>/gi;
  const links = head.match(linkPattern) ?? [];
  const canonicalLinks = links.filter((tag) => linkRelations(tag).has("canonical"));
  const expectedAlternates = new Map([
    ["zh-CN", chineseUrl],
    ["en", englishUrl],
    ["x-default", englishUrl],
  ]);
  const canonicalIsValid =
    canonicalLinks.length === 1 && htmlAttribute(canonicalLinks[0], "href") === canonicalUrl;
  const alternateIsValid = new Map(
    [...expectedAlternates].map(([language, expectedUrl]) => {
      const matching = links.filter((tag) => seoAlternateLanguage(tag) === language);
      return [
        language,
        matching.length === 1 && htmlAttribute(matching[0], "href") === expectedUrl,
      ];
    }),
  );

  const repairedHead = head.replace(linkPattern, (tag) => {
    if (linkRelations(tag).has("canonical") && !canonicalIsValid) return "";
    const language = seoAlternateLanguage(tag);
    if (language && !alternateIsValid.get(language)) return "";
    return tag;
  });
  const additions = [];
  if (!canonicalIsValid) {
    additions.push(`<link rel="canonical" href="${canonicalUrl}">`);
  }
  for (const [language, expectedUrl] of expectedAlternates) {
    if (!alternateIsValid.get(language)) {
      additions.push(`<link rel="alternate" hreflang="${language}" href="${expectedUrl}">`);
    }
  }
  return `${repairedHead}${additions.join("")}${rest}`;
}

export async function postprocessBilingualRouteMetadata(finalRoot) {
  const resolvedFinalRoot = resolve(finalRoot);
  const nestedRoot = join(resolvedFinalRoot, nestedExportDirectory);
  await assertFinalRouteParity(resolvedFinalRoot);
  const localeRoots = [
    [ROOT_LOCALE, resolvedFinalRoot],
    [NESTED_LOCALE, nestedRoot],
  ];

  for (const [locale, localeRoot] of localeRoots) {
    for (const document of await routeDocuments(localeRoot)) {
      const file = join(localeRoot, document.relativePath);
      const html = await readFile(file, "utf8");
      const repaired = repairRouteMetadata(html, document.route, locale);
      if (repaired !== html) await writeFile(file, repaired);
    }
  }
}

export async function overlayGeneratedArtifacts(exportRoot, generatedRoot) {
  const resolvedExportRoot = resolve(exportRoot);
  const resolvedGeneratedRoot = resolve(generatedRoot);
  for (const root of [resolvedExportRoot, resolvedGeneratedRoot]) {
    const stat = await lstat(root);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(`Generated artifact root must be a physical directory: ${root}`);
    }
  }

  for (const artifact of generatedArtifactPaths) {
    const source = join(resolvedGeneratedRoot, artifact);
    if (!(await pathExists(source))) {
      throw new Error(`Locale generation did not produce ${artifact} in ${resolvedGeneratedRoot}`);
    }
    const destination = join(resolvedExportRoot, artifact);
    await rm(destination, { recursive: true, force: true });
    await cp(source, destination, { recursive: true, errorOnExist: true, force: false });
  }
}

async function canonicalDirectoryWithoutSymlinks(directory) {
  const resolvedDirectory = resolve(directory);
  const filesystemRoot = parse(resolvedDirectory).root;
  let componentPath = filesystemRoot;

  for (const component of relative(filesystemRoot, resolvedDirectory).split(sep)) {
    if (!component) continue;
    componentPath = join(componentPath, component);
    const componentStat = await lstat(componentPath);
    if (componentStat.isSymbolicLink()) {
      throw new Error(`Build root contains a symlink component: ${componentPath}`);
    }
  }

  const directoryStat = await lstat(resolvedDirectory);
  if (!directoryStat.isDirectory()) {
    throw new Error(`Build root is not a directory: ${resolvedDirectory}`);
  }
  const canonicalDirectory = await realpath(resolvedDirectory);
  if (canonicalDirectory !== resolvedDirectory) {
    throw new Error(`Build root is not canonical: ${resolvedDirectory}`);
  }
  return canonicalDirectory;
}

async function ensureCanonicalBuildRoot(exactBuildRoot) {
  const resolvedBuildRoot = resolve(exactBuildRoot);
  await canonicalDirectoryWithoutSymlinks(dirname(resolvedBuildRoot));
  try {
    await mkdir(resolvedBuildRoot);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
  return canonicalDirectoryWithoutSymlinks(resolvedBuildRoot);
}

async function assertPhysicalBuildChild(target, exactBuildRoot) {
  const resolvedBuildRoot = resolve(exactBuildRoot);
  const resolvedTarget = resolve(target);
  if (dirname(resolvedTarget) !== resolvedBuildRoot) {
    throw new Error(`Build child must be directly inside ${resolvedBuildRoot}`);
  }
  const canonicalBuildRoot = await canonicalDirectoryWithoutSymlinks(resolvedBuildRoot);
  const canonicalTargetParent = await realpath(dirname(resolvedTarget));
  if (canonicalTargetParent !== canonicalBuildRoot) {
    throw new Error(
      `Build child parent must equal the canonical build root: ${canonicalBuildRoot}`,
    );
  }
  if (await pathExists(resolvedTarget)) {
    const targetStat = await lstat(resolvedTarget);
    if (targetStat.isSymbolicLink()) {
      throw new Error(`Build child must not be a symlink: ${resolvedTarget}`);
    }
  }
  return resolvedTarget;
}

export async function safeRemoveBuildDirectory(target, exactBuildRoot = buildRoot) {
  const resolvedBuildRoot = resolve(exactBuildRoot);
  const resolvedTarget = resolve(target);
  const targetRelative = relative(resolvedBuildRoot, resolvedTarget);
  const isDescendant =
    targetRelative !== "" &&
    targetRelative !== ".." &&
    !targetRelative.startsWith(`..${sep}`) &&
    !isAbsolute(targetRelative);
  const allowedForProject =
    resolvedBuildRoot !== buildRoot || removableBuildDirectories.has(resolvedTarget);

  if (!isDescendant || !allowedForProject) {
    throw new Error(
      `Removal target must be a descendant of the exact build root: ${resolvedBuildRoot}`,
    );
  }

  await assertPhysicalBuildChild(resolvedTarget, resolvedBuildRoot);

  await rm(resolvedTarget, { recursive: true, force: true });
}

export async function recoverInterruptedOutput(
  exactBuildRoot,
  previousOutputBackup,
  finalOutputRoot,
) {
  const resolvedBuildRoot = resolve(exactBuildRoot);
  const resolvedBackup = await assertPhysicalBuildChild(previousOutputBackup, resolvedBuildRoot);
  const resolvedOutput = resolve(finalOutputRoot);
  const resolvedOutputParent = resolve(dirname(resolvedOutput));
  if (resolvedOutputParent !== dirname(resolvedBuildRoot)) {
    throw new Error(`Output must be a sibling of the exact build root: ${resolvedOutput}`);
  }
  await canonicalDirectoryWithoutSymlinks(resolvedOutputParent);

  const markerPath = join(resolvedBuildRoot, replacementMarkerName);
  if (!(await pathExists(markerPath))) return false;
  const markerStat = await lstat(markerPath);
  if (!markerStat.isFile() || markerStat.isSymbolicLink()) {
    throw new Error(`Replacement marker must be a regular file: ${markerPath}`);
  }
  const marker = JSON.parse(await readFile(markerPath, "utf8"));
  if (marker.version !== 1 || marker.previousOutputBackup !== "zh") {
    throw new Error(`Invalid replacement marker: ${markerPath}`);
  }

  const outputExists = await pathExists(resolvedOutput);
  const backupExists = await pathExists(resolvedBackup);
  if (outputExists) {
    const outputStat = await lstat(resolvedOutput);
    if (!outputStat.isDirectory() || outputStat.isSymbolicLink()) {
      throw new Error(`Interrupted output is not a directory: ${resolvedOutput}`);
    }
  }
  if (backupExists) {
    const backupStat = await lstat(resolvedBackup);
    if (!backupStat.isDirectory() || backupStat.isSymbolicLink()) {
      throw new Error(`Interrupted output backup is not a directory: ${resolvedBackup}`);
    }
  }

  if (!outputExists && backupExists) {
    await rename(resolvedBackup, resolvedOutput);
  } else if (!outputExists) {
    throw new Error(`Interrupted replacement has neither output nor backup: ${markerPath}`);
  }

  await unlink(markerPath);
  return true;
}

async function buildLocale(locale, generatedRoot, localeRoot) {
  execFileSync("pnpm", ["--filter", "www", "build:locale"], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DOCS_BILINGUAL_BUILD: "1",
      DOCS_LOCALE: locale,
      HULIAN_REGISTRY_OUT: generatedRoot,
      HULIAN_REGISTRY_BASE: "",
    },
    stdio: "inherit",
  });
  await overlayGeneratedArtifacts(localeRoot, generatedRoot);
}

function restoreCanonicalChineseArtifacts() {
  const env = { ...process.env, DOCS_LOCALE: "zh-CN" };
  delete env.HULIAN_REGISTRY_OUT;
  delete env.HULIAN_REGISTRY_BASE;
  execFileSync("pnpm", ["llms-registry"], {
    cwd: repositoryRoot,
    env,
    stdio: "inherit",
  });
  execFileSync("pnpm", ["conventions"], {
    cwd: repositoryRoot,
    env,
    stdio: "inherit",
  });
}

async function replaceOutput() {
  await safeRemoveBuildDirectory(zhRoot);
  const hasExistingOutput = await pathExists(outputRoot);

  if (hasExistingOutput) {
    const outputStat = await lstat(outputRoot);
    if (!outputStat.isDirectory() || outputStat.isSymbolicLink()) {
      throw new Error(`Existing output is not a replaceable directory: ${outputRoot}`);
    }
    await writeFile(
      join(buildRoot, replacementMarkerName),
      `${JSON.stringify({ version: 1, previousOutputBackup: "zh" })}\n`,
      { flag: "wx" },
    );
    await rename(outputRoot, zhRoot);
  }

  try {
    await rename(mergedRoot, outputRoot);
  } catch (error) {
    if (hasExistingOutput) {
      await rename(zhRoot, outputRoot);
      await unlink(join(buildRoot, replacementMarkerName));
    }
    throw error;
  }

  if (hasExistingOutput) {
    await safeRemoveBuildDirectory(zhRoot);
    await unlink(join(buildRoot, replacementMarkerName));
  }
  await safeRemoveBuildDirectory(enRoot);
}

async function buildBilingualDocs() {
  await ensureCanonicalBuildRoot(buildRoot);
  await recoverInterruptedOutput(buildRoot, zhRoot, outputRoot);
  await Promise.all([
    safeRemoveBuildDirectory(zhRoot),
    safeRemoveBuildDirectory(enRoot),
    safeRemoveBuildDirectory(mergedRoot),
    safeRemoveBuildDirectory(zhArtifactsRoot),
    safeRemoveBuildDirectory(enArtifactsRoot),
  ]);

  let routes;
  try {
    await buildLocale("zh-CN", zhArtifactsRoot, zhRoot);
    await buildLocale("en", enArtifactsRoot, enRoot);
    routes = await assertRouteParity(zhRoot, enRoot);
    // Both locale exports already live below the same build root. Move them into
    // the final tree instead of copying ~400 MiB into a third temporary tree.
    await assembleExportsByRename(zhRoot, enRoot, mergedRoot);
    // 英文产物在成品树里的位置由 SSOT 决定（作根语言时就在成品根，不再是固定的 en/）。
    const englishOutputRoot =
      ROOT_LOCALE === "en" ? mergedRoot : join(mergedRoot, nestedExportDirectory);
    const findings = scanTask9EnglishOutput(englishOutputRoot);
    if (findings.length > 0) {
      const details = findings
        .slice(0, 20)
        .map(
          (finding) =>
            `${relative(join(mergedRoot, "en"), finding.file)} ${finding.field}: ${JSON.stringify(
              finding.value,
            )}`,
        )
        .join("\n");
      throw new Error(
        `English Task 9 output gate found ${findings.length} content or locale-link issue(s):\n${details}`,
      );
    }
    await replaceOutput();
    restoreCanonicalChineseArtifacts();
  } finally {
    await Promise.all([
      safeRemoveBuildDirectory(zhArtifactsRoot),
      safeRemoveBuildDirectory(enArtifactsRoot),
    ]);
  }
  console.log(`Built ${routes.size} bilingual routes in ${outputRoot}`);
}

async function checkFinalRouteParity() {
  const routes = await assertFinalRouteParity(outputRoot);
  console.log(`Verified ${routes.size} bilingual routes in ${outputRoot}`);
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const action = process.argv[2];
  const run = action === "--check-routes" ? checkFinalRouteParity : buildBilingualDocs;
  if (action && action !== "--check-routes") {
    console.error(`Unknown argument: ${action}`);
    process.exitCode = 1;
  } else {
    run().catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
  }
}
