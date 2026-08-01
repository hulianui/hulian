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
// date 为 null 只有一种成因：这个版本刚进 CHANGELOG.md、对应 tag 还没打（发版那次
// CI 与 Release workflow 并发，构建站点时 tag 尚不存在）。语义上它是**最新的一版**。
// 按空串排序会把它甩到列表末尾，站点顶部就还停在上一版——看起来就像 changelog 没更新。
const dateKey = (r) => r.date ?? "9999-12-31";
releases.sort((a, b) =>
  dateKey(a) === dateKey(b)
    ? a.pkg === b.pkg
      ? cmpSemver(a.version, b.version)
      : a.pkg.localeCompare(b.pkg)
    : dateKey(b).localeCompare(dateKey(a)),
);

writeFileSync(OUT, `${JSON.stringify(releases, null, 2)}\n`);
const undated = releases.filter((r) => !r.date).length;
console.log(
  `[changelog] ${releases.length} 个版本 · ${releases.reduce((n, r) => n + r.entries.length, 0)} 条记录` +
    (undated ? ` · ${undated} 个版本无 tag 日期（跑 git fetch --tags 后重试）` : ""),
);
