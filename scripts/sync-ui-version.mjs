#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function renderUiVersionModule(packageJsonContent) {
  let packageJson;
  try {
    packageJson = JSON.parse(packageJsonContent);
  } catch (error) {
    throw new Error(`[ui-version] package JSON is invalid: ${error.message}`);
  }
  if (typeof packageJson.version !== "string" || packageJson.version.length === 0) {
    throw new Error("[ui-version] package JSON must contain a valid string version");
  }
  return (
    "// 自动生成（next.config.mjs 构建期写入），请勿手改。源：packages/ui/package.json\n" +
    `export const UI_VERSION = ${JSON.stringify(packageJson.version)};\n`
  );
}

export function syncUiVersion(options = {}) {
  const rootDir = options.rootDir ?? ROOT;
  const packageJsonPath = options.packageJsonPath ?? join(rootDir, "packages", "ui", "package.json");
  const outputPath = options.outputPath ?? join(rootDir, "apps", "www", "lib", "ui-version.ts");
  const packageJsonContent = readFileSync(packageJsonPath, "utf8");
  const version = JSON.parse(packageJsonContent).version;
  const content = renderUiVersionModule(packageJsonContent);
  if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== content) {
    writeFileSync(outputPath, content);
  }
  return { version, content };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { version } = syncUiVersion();
  console.log(`[ui-version] synchronized v${version}`);
}
