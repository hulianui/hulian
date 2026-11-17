// 版本 PR（changeset-release/master）守卫：证明这个 PR 只是「发版记账」，没有夹带代码。
//
// 为什么需要它：CI 对版本 PR 只跑 static-checks + 本守卫，浏览器门禁、构建、消费方冒烟
// 全部跳过（它们在功能 PR 上刚跑过一遍，版本 PR 不改代码，再跑 9 分钟只是重复）。
// 这个「跳过」成立的唯一前提是**版本 PR 真的不改代码** —— 有人往 changeset-release/master
// 上推了一个修复，重门禁就会被整个绕开。所以前提必须被机械地验证，而不是被假设。
//
// 判据（2026-11-17 按 #394 / #396 两个真实版本 PR 的文件清单定）：
//   - .changeset/*.md 只许删除（version-packages 消费掉它们）；新增 = 夹带变更
//   - 包的 package.json 只许改 "version" 字段，其余字段逐一比对必须相同
//   - CHANGELOG / 版本号常量 / AI 分发产物（llms* / registry.json / changelog*.json）允许改
//   - 其余任何路径一律拒绝
//
// 用法：node scripts/version-pr-guard.mjs <base-sha> <head-sha>

import { execFileSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";

/** 版本 PR 允许改动（M）的路径；仅凭路径不足以放行 package.json，那一类另行比对内容。 */
const ALLOWED_MODIFIED = [
  /^packages\/[^/]+\/CHANGELOG(?:\.en)?\.md$/,
  /^apps\/www\/lib\/changelog(?:\.en)?\.json$/,
  /^apps\/www\/lib\/ui-version\.ts$/,
  /^apps\/www\/public\/llms(?:-full)?\.txt$/,
  /^apps\/www\/public\/llms-props\.json$/,
  /^apps\/www\/public\/registry\.json$/,
];
const PACKAGE_JSON = /^packages\/[^/]+\/package\.json$/;
const CHANGESET = /^\.changeset\/[^/]+\.md$/;

/** 去掉 version 字段后两份 package.json 必须完全一致。 */
export function packageJsonOnlyBumpsVersion(before, after) {
  const strip = ({ version: _version, ...rest }) => rest;
  return isDeepStrictEqual(strip(JSON.parse(before)), strip(JSON.parse(after)));
}

/**
 * @param {{ status: string; path: string }[]} changes  git diff --name-status 的解析结果
 * @param {(path: string) => { before: string; after: string }} readPackageJson
 * @returns {string[]} 违规说明；空数组 = 通过
 */
export function findViolations(changes, readPackageJson) {
  const violations = [];
  for (const { status, path } of changes) {
    if (CHANGESET.test(path)) {
      if (status !== "D") violations.push(`${path}：版本 PR 只应删除 changeset，实际状态 ${status}`);
      continue;
    }
    if (status !== "M") {
      violations.push(`${path}：版本 PR 不应新增/删除/重命名文件（状态 ${status}）`);
      continue;
    }
    if (PACKAGE_JSON.test(path)) {
      const { before, after } = readPackageJson(path);
      if (!packageJsonOnlyBumpsVersion(before, after)) {
        violations.push(`${path}：除 "version" 外还改了别的字段`);
      }
      continue;
    }
    if (!ALLOWED_MODIFIED.some((pattern) => pattern.test(path))) {
      violations.push(`${path}：不在版本 PR 的允许清单里（像是夹带了代码改动）`);
    }
  }
  return violations;
}

/** 解析 `git diff --name-status`；重命名/复制行（R100 a b）取新路径。 */
export function parseNameStatus(output) {
  return output
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [status, ...paths] = line.split("\t");
      return { status: status[0], path: paths[paths.length - 1] };
    });
}

function main([base, head]) {
  if (!base || !head) {
    console.error("用法：node scripts/version-pr-guard.mjs <base-sha> <head-sha>");
    process.exit(2);
  }
  const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
  // 三点 diff：只看版本 PR 相对分叉点引入的改动，不把 master 后来的提交算进来。
  const changes = parseNameStatus(git("diff", "--name-status", `${base}...${head}`));
  const mergeBase = git("merge-base", base, head).trim();
  const violations = findViolations(changes, (path) => ({
    before: git("show", `${mergeBase}:${path}`),
    after: git("show", `${head}:${path}`),
  }));

  if (changes.length === 0) {
    console.error("版本 PR 没有任何改动 —— 不像 changesets 产出的版本 PR，拒绝放行。");
    process.exit(1);
  }
  if (violations.length > 0) {
    console.error("版本 PR 夹带了非发版改动。CI 对版本 PR 跳过了构建与浏览器门禁，这些改动不能这样合入：");
    for (const violation of violations) console.error(`  - ${violation}`);
    console.error("请把代码改动挪到普通 PR（会跑全量门禁），版本 PR 由 Release 工作流自动重建。");
    process.exit(1);
  }
  console.log(`版本 PR 守卫通过：${changes.length} 个文件全部属于发版记账。`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main(process.argv.slice(2));
