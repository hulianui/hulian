import { execFileSync } from "node:child_process";
import {
  cp,
  lstat,
  mkdir,
  readdir,
  rename,
  rm,
} from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptRoot = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(scriptRoot, "..");
const wwwRoot = join(repositoryRoot, "apps/www");
const publicRoot = join(wwwRoot, "public");
const buildRoot = join(wwwRoot, ".bilingual-build");
const zhRoot = join(buildRoot, "zh");
const enRoot = join(buildRoot, "en");
const mergedRoot = join(buildRoot, "final");
const outputRoot = join(wwwRoot, "out");
const removableBuildDirectories = new Set(
  [zhRoot, enRoot, mergedRoot].map((path) => resolve(path)),
);

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

export async function routeSet(root) {
  const resolvedRoot = resolve(root);
  const publicAssets = await publicAssetPaths();
  const routes = new Set();

  for (const relativePath of await filePaths(resolvedRoot)) {
    if (
      !relativePath.endsWith(".html") ||
      relativePath.startsWith("_next/") ||
      relativePath.startsWith("en/") ||
      publicAssets.has(relativePath)
    ) {
      continue;
    }
    routes.add(routeFromHtml(relativePath));
  }

  return routes;
}

export async function assertRouteParity(chineseRoot, englishRoot) {
  const [chineseRoutes, englishRoutes] = await Promise.all([
    routeSet(chineseRoot),
    routeSet(englishRoot),
  ]);
  const missingFromEnglish = [...chineseRoutes]
    .filter((route) => !englishRoutes.has(route))
    .sort();
  const missingFromChinese = [...englishRoutes]
    .filter((route) => !chineseRoutes.has(route))
    .sort();

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

export async function mergeExports(chineseRoot, englishRoot, finalRoot) {
  const resolvedChineseRoot = resolve(chineseRoot);
  const resolvedEnglishRoot = resolve(englishRoot);
  const resolvedFinalRoot = resolve(finalRoot);

  await assertRouteParity(resolvedChineseRoot, resolvedEnglishRoot);
  if (await pathExists(resolvedFinalRoot)) {
    throw new Error(`Merge destination already exists: ${resolvedFinalRoot}`);
  }

  await cp(resolvedChineseRoot, resolvedFinalRoot, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  await cp(resolvedEnglishRoot, join(resolvedFinalRoot, "en"), {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
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

  await rm(resolvedTarget, { recursive: true, force: true });
}

function buildLocale(locale) {
  execFileSync("pnpm", ["--filter", "www", "build:locale"], {
    cwd: repositoryRoot,
    env: {
      ...process.env,
      DOCS_BILINGUAL_BUILD: "1",
      DOCS_LOCALE: locale,
    },
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
    await rename(outputRoot, zhRoot);
  }

  try {
    await rename(mergedRoot, outputRoot);
  } catch (error) {
    if (hasExistingOutput) await rename(zhRoot, outputRoot);
    throw error;
  }

  if (hasExistingOutput) await safeRemoveBuildDirectory(zhRoot);
  await safeRemoveBuildDirectory(enRoot);
}

async function buildBilingualDocs() {
  await mkdir(buildRoot, { recursive: true });
  await Promise.all([
    safeRemoveBuildDirectory(zhRoot),
    safeRemoveBuildDirectory(enRoot),
    safeRemoveBuildDirectory(mergedRoot),
  ]);

  buildLocale("zh-CN");
  buildLocale("en");
  const routes = await assertRouteParity(zhRoot, enRoot);
  await mergeExports(zhRoot, enRoot, mergedRoot);
  await replaceOutput();
  console.log(`Built ${routes.size} bilingual routes in ${outputRoot}`);
}

async function checkFinalRouteParity() {
  const routes = await assertRouteParity(outputRoot, join(outputRoot, "en"));
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
