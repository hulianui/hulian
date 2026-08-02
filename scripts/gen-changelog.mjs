#!/usr/bin/env node
// gen-changelog.mjs — 把 changesets 生成的 packages/*/CHANGELOG.md 解析成结构化数据，
// 写入 apps/www/lib/changelog.json，供文档站 /changelog 渲染。
//
// 为什么要生成而不在页面里直接读 md：发版日期只存在于 git tag（changesets 不写日期），
// 页面又是 `import changelog from "lib/changelog.json"` 的静态引用。
//
// 产物提交进仓，但它只是**开发期占位**——保证干净 clone 能 typecheck / dev，不保证是最新的。
// 真正上站的那份由 CI 在构建前重跑本脚本生成（.github/workflows/ci.yml 的
// "Regenerate changelog data"，配套 checkout 的 fetch-depth: 0 才能读到 tag）。
// 所以发版后**不需要**人工回填这个文件；仓库里那份滞后不影响线上。
//
// 零依赖。跑：node scripts/gen-changelog.mjs（已挂进 pnpm docs:all）

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = ["ui", "tokens"];
const OUT = join(ROOT, "apps", "www", "lib", "changelog.json");
const OUT_EN = join(ROOT, "apps", "www", "lib", "changelog.en.json");

/** tag 名 → 发布日期（YYYY-MM-DD）。tag 缺失（未 fetch / 未发版）时该版本 date 为 null。 */
function tagDates() {
  let out;
  try {
    out = execFileSync(
      "git",
      ["for-each-ref", "--format=%(refname:short)\t%(creatordate:short)", "refs/tags"],
      { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    );
  } catch {
    return new Map(); // 无 git / 非仓库：全部回退到下面的既有产物日期
  }
  return new Map(out.split("\n").filter(Boolean).map((l) => l.split("\t")));
}

/**
 * `${pkg}@${version}` → 上一次生成时记下的日期。
 *
 * 托管平台（Cloudflare Pages 等）用浅克隆拉代码，`refs/tags` 往往是空的；若只认 tag，
 * 在那里构建会把**所有**历史版本的发布日期抹成 null。仓库里提交的那份 changelog.json
 * 是本地带全量 tag 生成的，正好可以当这份日期的兜底来源——只补日期，正文一律以当前
 * CHANGELOG.md 为准。
 */
function previousDates(outPath = OUT) {
  try {
    const prev = JSON.parse(readFileSync(outPath, "utf8"));
    return new Map(prev.filter((r) => r.date).map((r) => [`${r.pkg}@${r.version}`, r.date]));
  } catch {
    return new Map(); // 首次生成，无既有产物
  }
}

/**
 * 破坏性变更的判据——**不是** semver 的 major bump。
 *
 * 只要还在 0.x，changesets 就不会产出 major：打一个 major changeset 等于直接发 1.0.0。
 * 于是破坏性变更一律记成 minor，靠正文里加粗的 `**BREAKING**` / `**破坏性**` 表达
 * （0.15.0 切除 MUI 与 date-pickers 子路径入口、0.5.0 Base UI 同伴包改名都是这么写的）。
 * 站点若只看 bump，「仅破坏性」筛选就永远是空的——这些标记必须被读出来。
 *
 * 要求加粗前缀而不是裸词，避免正文里议论「破坏性」时被误判。
 */
const BREAKING_RE = /\*\*(?:BREAKING|破坏性)/;
const PARITY_ID_RE = /\s*<!--\s*parity-id:\s*([a-z0-9][a-z0-9._-]*)\s*-->/i;

function markdownLinkTargets(body) {
  return [...body.matchAll(/!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g)].map(
    (match) => match[1],
  );
}

/**
 * 解析一份 changesets CHANGELOG.md。
 * 结构：`## <version>` → `### Major|Minor|Patch Changes` → `- [sha: ]正文`，
 * 正文续行缩进 2 空格（子列表 / 多段落），去缩进后原样交给 Markdown 渲染。
 */
export function parseChangelog(md) {
  const versions = [];
  let cur = null;
  let bump = null;
  let entry = null;

  const flushEntry = () => {
    if (!entry) return;
    const rawBody = entry.lines.join("\n").replace(/\n+$/, "");
    const parityMatch = rawBody.match(PARITY_ID_RE);
    const body = rawBody.replace(PARITY_ID_RE, "").replace(/\s+$/, "");
    if (body.trim()) {
      const parsed = { sha: entry.sha, bump, breaking: BREAKING_RE.test(body), body };
      if (parityMatch) parsed.parityId = parityMatch[1];
      cur.entries.push(parsed);
    }
    entry = null;
  };

  for (const line of md.split("\n")) {
    const mVersion = line.match(/^## (\S+)/);
    if (mVersion) {
      flushEntry();
      cur = { version: mVersion[1], entries: [] };
      versions.push(cur);
      bump = null;
      continue;
    }
    if (!cur) continue; // 文件头 `# @hulianui/ui`

    const mBump = line.match(/^### (Major|Minor|Patch) Changes/);
    if (mBump) {
      flushEntry();
      bump = mBump[1].toLowerCase();
      continue;
    }

    const mEntry = line.match(/^- (?:([0-9a-f]{7,40}): )?(.*)$/);
    if (mEntry) {
      flushEntry();
      entry = { sha: mEntry[1] ?? null, lines: [mEntry[2]] };
      continue;
    }
    // 续行：空行保留（分段），缩进行去掉 2 空格
    if (entry) entry.lines.push(line.startsWith("  ") ? line.slice(2) : line);
  }
  flushEntry();
  return versions;
}

export function assertLocaleParity(pkg, chinese, english) {
  const zhVersions = new Map(chinese.map((release) => [release.version, release]));
  const enVersions = new Map(english.map((release) => [release.version, release]));
  const missingEnglish = [...zhVersions.keys()].filter((version) => !enVersions.has(version));
  const extraEnglish = [...enVersions.keys()].filter((version) => !zhVersions.has(version));

  if (missingEnglish.length > 0) {
    throw new Error(`[changelog] ${pkg} missing English versions: ${missingEnglish.join(", ")}`);
  }
  if (extraEnglish.length > 0) {
    throw new Error(`[changelog] ${pkg} has unknown English versions: ${extraEnglish.join(", ")}`);
  }

  const zhOrder = chinese.map((release) => release.version);
  const enOrder = english.map((release) => release.version);
  if (JSON.stringify(zhOrder) !== JSON.stringify(enOrder)) {
    throw new Error(
      `[changelog] ${pkg} version order differs: zh-CN=${zhOrder.join(", ")}, en=${enOrder.join(", ")}`,
    );
  }

  for (const [version, zhRelease] of zhVersions) {
    const enRelease = enVersions.get(version);
    if (zhRelease.entries.length !== enRelease.entries.length) {
      throw new Error(
        `[changelog] ${pkg} ${version} entry count differs: zh-CN=${zhRelease.entries.length}, en=${enRelease.entries.length}`,
      );
    }
    zhRelease.entries.forEach((entry, index) => {
      const translated = enRelease.entries[index];
      if (!entry.sha && !entry.parityId) {
        throw new Error(`[changelog] ${pkg} ${version} entry ${index + 1} missing parity-id in zh-CN`);
      }
      if (!translated.sha && !translated.parityId) {
        throw new Error(`[changelog] ${pkg} ${version} entry ${index + 1} missing parity-id in en`);
      }
      const identity = entry.sha ?? entry.parityId;
      const translatedIdentity = translated.sha ?? translated.parityId;
      if (entry.bump !== translated.bump || identity !== translatedIdentity) {
        throw new Error(
          `[changelog] ${pkg} ${version} entry ${index + 1} identity differs: ` +
            `zh-CN=${entry.bump}/${identity}, en=${translated.bump}/${translatedIdentity}`,
        );
      }
      if (entry.breaking !== translated.breaking) {
        throw new Error(`[changelog] ${pkg} ${version} entry ${index + 1} breaking marker differs`);
      }
      const zhLinks = markdownLinkTargets(entry.body);
      const enLinks = markdownLinkTargets(translated.body);
      if (JSON.stringify(zhLinks) !== JSON.stringify(enLinks)) {
        throw new Error(
          `[changelog] ${pkg} ${version} entry ${index + 1} link targets differ: ` +
            `zh-CN=${zhLinks.join(",")}, en=${enLinks.join(",")}`,
        );
      }
    });
  }
}

// 新→旧。同日多个版本按版本号降序，保证 0.7.1 排在 0.7.0 之上。
const cmpSemver = (a, b) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
};
// date 为 null 只有一种成因：这个版本刚进 CHANGELOG.md、对应 tag 还没打（发版那次
// CI 与 Release workflow 并发，构建站点时 tag 尚不存在）。语义上它是**最新的一版**。
// 按空串排序会把它甩到列表末尾，站点顶部就还停在上一版——看起来就像 changelog 没更新。
const dateKey = (r) => r.date ?? "9999-12-31";
function sortReleases(releases) {
  releases.sort((a, b) =>
    dateKey(a) === dateKey(b)
      ? a.pkg === b.pkg
        ? cmpSemver(a.version, b.version)
        : a.pkg.localeCompare(b.pkg)
      : dateKey(b).localeCompare(dateKey(a)),
  );
}

export function generateChangelogs() {
  const dates = tagDates();
  const fallbackDates = previousDates();
  const fallbackDatesEn = previousDates(OUT_EN);
  const releases = [];
  const releasesEn = [];

  for (const pkg of PACKAGES) {
    const packageName = `@hulianui/${pkg}`;
    const chinese = parseChangelog(
      readFileSync(join(ROOT, "packages", pkg, "CHANGELOG.md"), "utf8"),
    );
    const english = parseChangelog(
      readFileSync(join(ROOT, "packages", pkg, "CHANGELOG.en.md"), "utf8"),
    );
    assertLocaleParity(packageName, chinese, english);

    const englishByVersion = new Map(english.map((release) => [release.version, release]));
    for (const chineseVersion of chinese) {
      const englishVersion = englishByVersion.get(chineseVersion.version);
      if (!englishVersion) throw new Error(`[changelog] missing English version ${chineseVersion.version}`);
      const key = `${packageName}@${chineseVersion.version}`;
      const date = dates.get(key) ?? fallbackDates.get(key) ?? fallbackDatesEn.get(key) ?? null;
      releases.push({ pkg: packageName, version: chineseVersion.version, date, entries: chineseVersion.entries });
      releasesEn.push({ pkg: packageName, version: englishVersion.version, date, entries: englishVersion.entries });
    }
  }

  sortReleases(releases);
  sortReleases(releasesEn);
  writeFileSync(OUT, `${JSON.stringify(releases, null, 2)}\n`);
  writeFileSync(OUT_EN, `${JSON.stringify(releasesEn, null, 2)}\n`);

  const undated = releases.filter((release) => !release.date).length;
  console.log(
    `[changelog] ${releases.length} releases per locale · ` +
      `${releases.reduce((count, release) => count + release.entries.length, 0)} entries per locale` +
      (undated ? ` · ${undated} releases have no tag date (run git fetch --tags and retry)` : ""),
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  generateChangelogs();
}
