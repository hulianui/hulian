#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const LOCALIZED_PACKAGES = ["ui", "tokens"];
const START_MARKER = "<!-- changelog-en:start -->";
const END_MARKER = "<!-- changelog-en:end -->";

function parseDocument(markdown, label) {
  const headings = [...markdown.matchAll(/^## (\S+).*$/gm)];
  if (headings.length === 0) throw new Error(`[changelog-sync] ${label} has no release headings`);

  const header = markdown.slice(0, headings[0].index);
  const releases = headings.map((heading, index) => ({
    version: heading[1],
    raw: markdown.slice(heading.index, headings[index + 1]?.index ?? markdown.length),
  }));
  const duplicates = releases
    .map((release) => release.version)
    .filter((version, index, versions) => versions.indexOf(version) !== index);
  if (duplicates.length > 0) {
    throw new Error(`[changelog-sync] ${label} has duplicate versions: ${[...new Set(duplicates)].join(", ")}`);
  }
  return { header, releases };
}

function stripContinuationIndent(line) {
  return line.startsWith("  ") ? line.slice(2) : line;
}

function trimBlankLines(lines) {
  let start = 0;
  let end = lines.length;
  while (start < end && lines[start].trim() === "") start += 1;
  while (end > start && lines[end - 1].trim() === "") end -= 1;
  return lines.slice(start, end);
}

function transformEntry(entryLines, { packageName, version, entryNumber }) {
  const first = entryLines[0].match(/^- (?:([0-9a-f]{7,40}): )?(.*)$/);
  if (!first) throw new Error(`[changelog-sync] ${packageName} ${version} has an invalid entry`);
  const identity = first[1] ?? `#${entryNumber}`;
  const starts = [];
  const ends = [];
  entryLines.forEach((line, index) => {
    if (line.trim() === START_MARKER) starts.push(index);
    if (line.trim() === END_MARKER) ends.push(index);
  });

  if (starts.length === 0 && ends.length === 0) {
    throw new Error(
      `[changelog-sync] ${packageName} ${version} entry ${identity} is missing ${START_MARKER}`,
    );
  }
  if (
    starts.length !== 1 ||
    ends.length !== 1 ||
    starts[0] >= ends[0] ||
    entryLines.slice(ends[0] + 1).some((line) => line.trim() !== "")
  ) {
    throw new Error(
      `[changelog-sync] ${packageName} ${version} entry ${identity} has malformed English changelog markers`,
    );
  }

  const englishBody = trimBlankLines(
    entryLines.slice(starts[0] + 1, ends[0]).map(stripContinuationIndent),
  );
  if (englishBody.length === 0 || englishBody[0].trim() === "") {
    throw new Error(
      `[changelog-sync] ${packageName} ${version} entry ${identity} has an empty English changelog marker`,
    );
  }

  const bulletPrefix = first[1] ? `- ${first[1]}: ` : "- ";
  const existingParityId = entryLines
    .slice(0, starts[0])
    .join("\n")
    .match(/<!--\s*parity-id:\s*([a-z0-9][a-z0-9._-]*)\s*-->/i)?.[1];
  const packageSlug = packageName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-|-$/g, "");
  const parityId = first[1] ? null : (existingParityId ?? `${packageSlug}-${version}-${entryNumber}`);
  const paritySuffix = parityId ? ` <!-- parity-id: ${parityId} -->` : "";
  const english = [
    `${bulletPrefix}${englishBody[0]}${paritySuffix}`,
    ...englishBody.slice(1).map((line) => (line === "" ? "" : `  ${line}`)),
  ];
  const chinese = entryLines.slice(0, starts[0]);
  while (chinese.at(-1)?.trim() === "") chinese.pop();
  if (parityId && !existingParityId) chinese[0] += paritySuffix;

  return { chinese, english };
}

function splitMissingRelease(raw, packageName, version) {
  const lines = raw.replace(/\n+$/, "").split("\n");
  const chinese = [];
  const english = [];
  let entryNumber = 0;

  for (let index = 0; index < lines.length; ) {
    if (!lines[index].startsWith("- ")) {
      chinese.push(lines[index]);
      english.push(lines[index]);
      index += 1;
      continue;
    }

    let end = index + 1;
    while (end < lines.length && !lines[end].startsWith("- ") && !lines[end].startsWith("### ")) {
      end += 1;
    }
    entryNumber += 1;
    const transformed = transformEntry(lines.slice(index, end), {
      packageName,
      version,
      entryNumber,
    });
    chinese.push(...transformed.chinese, "");
    english.push(...transformed.english, "");
    index = end;
  }

  while (chinese.at(-1) === "") chinese.pop();
  while (english.at(-1) === "") english.pop();
  return { chinese: chinese.join("\n"), english: english.join("\n") };
}

function renderDocument(header, releases) {
  return `${header.replace(/\n+$/, "")}\n\n${releases
    .map((release) => release.raw.replace(/\n+$/, ""))
    .join("\n\n")}\n`;
}

/**
 * Split English marker blocks out of releases that do not yet exist in the English changelog.
 * Existing release sections are carried through unchanged.
 */
export function syncChangelogLocales(chineseMarkdown, englishMarkdown, packageName = "package") {
  const chineseDoc = parseDocument(chineseMarkdown, `${packageName} zh-CN`);
  const englishDoc = parseDocument(englishMarkdown, `${packageName} en`);
  const chineseVersions = chineseDoc.releases.map((release) => release.version);
  const englishVersions = englishDoc.releases.map((release) => release.version);
  const chineseSet = new Set(chineseVersions);
  const englishSet = new Set(englishVersions);

  const extraEnglish = englishVersions.filter((version) => !chineseSet.has(version));
  if (extraEnglish.length > 0) {
    throw new Error(
      `[changelog-sync] ${packageName} English changelog has unknown versions: ${extraEnglish.join(", ")}`,
    );
  }
  const englishRelativeOrder = chineseVersions.filter((version) => englishSet.has(version));
  if (englishRelativeOrder.join("\n") !== englishVersions.join("\n")) {
    throw new Error(`[changelog-sync] ${packageName} existing English release order differs from zh-CN`);
  }

  const missingVersions = chineseVersions.filter((version) => !englishSet.has(version));
  if (missingVersions.length === 0) {
    return { chinese: chineseMarkdown, english: englishMarkdown, syncedVersions: [] };
  }

  const transformed = new Map();
  for (const release of chineseDoc.releases) {
    if (!englishSet.has(release.version)) {
      transformed.set(release.version, splitMissingRelease(release.raw, packageName, release.version));
    }
  }

  const englishByVersion = new Map(englishDoc.releases.map((release) => [release.version, release]));
  const chineseReleases = chineseDoc.releases.map((release) => ({
    version: release.version,
    raw: transformed.get(release.version)?.chinese ?? release.raw,
  }));
  const englishReleases = chineseDoc.releases.map((release) => ({
    version: release.version,
    raw: englishByVersion.get(release.version)?.raw ?? transformed.get(release.version).english,
  }));

  return {
    chinese: renderDocument(chineseDoc.header, chineseReleases),
    english: renderDocument(englishDoc.header, englishReleases),
    syncedVersions: missingVersions,
  };
}

export function syncChangelogFiles(root = ROOT) {
  const pendingWrites = [];
  const summaries = [];

  for (const packageDir of LOCALIZED_PACKAGES) {
    const chinesePath = join(root, "packages", packageDir, "CHANGELOG.md");
    const englishPath = join(root, "packages", packageDir, "CHANGELOG.en.md");
    if (!existsSync(chinesePath) || !existsSync(englishPath)) continue;
    const packageName = `@hulianui/${packageDir}`;
    const result = syncChangelogLocales(
      readFileSync(chinesePath, "utf8"),
      readFileSync(englishPath, "utf8"),
      packageName,
    );
    pendingWrites.push([chinesePath, result.chinese], [englishPath, result.english]);
    summaries.push({ packageName, syncedVersions: result.syncedVersions });
  }

  for (const [path, content] of pendingWrites) writeFileSync(path, content);
  return summaries;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const summaries = syncChangelogFiles();
  const synced = summaries.flatMap(({ packageName, syncedVersions }) =>
    syncedVersions.map((version) => `${packageName}@${version}`),
  );
  console.log(
    synced.length > 0
      ? `[changelog-sync] synchronized ${synced.join(", ")}`
      : "[changelog-sync] locale changelogs already synchronized",
  );
}
