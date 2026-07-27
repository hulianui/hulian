#!/usr/bin/env node
// gen-changelog.mjs — 把 changesets 生成的 packages/*/CHANGELOG.md 解析成结构化数据，
// 写入 apps/www/lib/changelog.json，供文档站 /changelog 渲染。
//
// 为什么要生成而不在页面里直接读 md：发版日期只存在于 git tag（changesets 不写日期），
// 而 CI 用浅克隆构建站点、拿不到 tag —— 本地生成、把结果提交进仓，构建期只读 JSON。
// 同理于 llms.txt / registry.json 的既有做法。
//
// 零依赖。跑：node scripts/gen-changelog.mjs（已挂进 pnpm docs:all）
// 发版（changeset version 改完 CHANGELOG + 打完 tag）后需重跑，否则站点少最新一条。

import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = ["ui", "tokens"];
const OUT = join(ROOT, "apps", "www", "lib", "changelog.json");

/** tag 名 → 发布日期（YYYY-MM-DD）。tag 缺失（未 fetch / 未发版）时该版本 date 为 null。 */
function tagDates() {
  const out = execFileSync(
    "git",
    ["for-each-ref", "--format=%(refname:short)\t%(creatordate:short)", "refs/tags"],
    { cwd: ROOT, encoding: "utf8" },
  );
  return new Map(out.split("\n").filter(Boolean).map((l) => l.split("\t")));
}

/**
 * 解析一份 changesets CHANGELOG.md。
 * 结构：`## <version>` → `### Major|Minor|Patch Changes` → `- [sha: ]正文`，
 * 正文续行缩进 2 空格（子列表 / 多段落），去缩进后原样交给 Markdown 渲染。
 */
function parseChangelog(md) {
  const versions = [];
  let cur = null;
  let bump = null;
  let entry = null;

  const flushEntry = () => {
    if (!entry) return;
    const body = entry.lines.join("\n").replace(/\n+$/, "");
    if (body.trim()) cur.entries.push({ sha: entry.sha, bump, body });
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

const dates = tagDates();
const releases = [];
for (const pkg of PACKAGES) {
  const md = readFileSync(join(ROOT, "packages", pkg, "CHANGELOG.md"), "utf8");
  for (const v of parseChangelog(md)) {
    releases.push({
      pkg: `@hulianui/${pkg}`,
      version: v.version,
      date: dates.get(`@hulianui/${pkg}@${v.version}`) ?? null,
      entries: v.entries,
    });
  }
}

// 新→旧。同日多个版本按版本号降序，保证 0.7.1 排在 0.7.0 之上。
const cmpSemver = (a, b) => {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  return pb[0] - pa[0] || pb[1] - pa[1] || pb[2] - pa[2];
};
releases.sort((a, b) =>
  a.date === b.date
    ? a.pkg === b.pkg
      ? cmpSemver(a.version, b.version)
      : a.pkg.localeCompare(b.pkg)
    : (b.date ?? "").localeCompare(a.date ?? ""),
);

writeFileSync(OUT, `${JSON.stringify(releases, null, 2)}\n`);
const undated = releases.filter((r) => !r.date).length;
console.log(
  `[changelog] ${releases.length} 个版本 · ${releases.reduce((n, r) => n + r.entries.length, 0)} 条记录` +
    (undated ? ` · ${undated} 个版本无 tag 日期（跑 git fetch --tags 后重试）` : ""),
);
