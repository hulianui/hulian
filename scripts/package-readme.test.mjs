import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

// 每个会发上 npm 的包都必须有一份非空 README。
//
// 起因（#110）：`@hulianui/ui` / `tokens` / `guard` 三个包在 npm 上一路 30 个版本都显示
// **This package does not have a README.**，用户从搜索页点进来只看得到 keywords 和右侧的
// Install 框，拿不到「这库是什么、怎么装、怎么接主题」。
//
// 为什么此前无人发现：这个缺口在 CI 全绿的情况下**完全不可见** —— 发布成功、包能装、
// 类型正常，只有 npm 的包页面是空的。没人会为了看一眼包页面去发一版。
//
// 另外这不是 `files` 配错：README.md 属于「无论 files 怎么写都强制打进 tarball」的那批
// （与 package.json / LICENSE 同级待遇）—— `packages/mcp` 的 files 同样只写了 ["src"]，
// 它的 README 照样进了包。三个包纯粹就是没有这个文件。monorepo 的 npm 发布以子包目录为根，
// 仓库根的 README 不会被继承。
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES = join(ROOT, "packages");

/** README 至少要有的东西：一级标题 + 安装或用法说明。低于这条线等于占位文件。 */
const MIN_BYTES = 400;

function publishedPackages() {
  return readdirSync(PACKAGES, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(PACKAGES, entry.name))
    .filter((dir) => existsSync(join(dir, "package.json")))
    .map((dir) => ({ dir, pkg: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) }))
    .filter(({ pkg }) => pkg.private !== true);
}

test("每个公开发布的包都有非空 README", () => {
  const offenders = [];
  for (const { dir, pkg } of publishedPackages()) {
    const readme = join(dir, "README.md");
    if (!existsSync(readme)) {
      offenders.push(`${pkg.name}: 缺 ${relative(ROOT, readme)}`);
      continue;
    }
    const body = readFileSync(readme, "utf8").trim();
    if (body.length < MIN_BYTES) {
      offenders.push(`${pkg.name}: README 只有 ${body.length} 字节，低于 ${MIN_BYTES} 的下限`);
      continue;
    }
    if (!body.startsWith(`# ${pkg.name}`)) {
      offenders.push(`${pkg.name}: README 首行应是 \`# ${pkg.name}\``);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `这些包发到 npm 后包页面会是空的：\n${offenders.join("\n")}\n\n` +
      "npm 取的是**包根目录**的 README.md，仓库根的那份不会被继承。",
  );
});

test("README 里的相对链接会在 npm 页面上挂掉，必须写成绝对地址", () => {
  // npm 渲染 README 时不知道仓库结构，`./docs/x.md` / `(../LICENSE)` 一律 404。
  // 只查 markdown 链接与图片的目标，不碰行内代码里的路径示例。
  const LINK = /!?\[[^\]]*\]\(([^)]+)\)/g;
  const offenders = [];
  for (const { dir, pkg } of publishedPackages()) {
    const readme = join(dir, "README.md");
    if (!existsSync(readme)) continue;
    const body = readFileSync(readme, "utf8");
    for (const match of body.matchAll(LINK)) {
      const href = match[1].trim();
      if (/^(https?:|mailto:|#)/.test(href)) continue;
      offenders.push(`${pkg.name}: ${href}`);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `README 里的相对链接在 npm 包页面上会 404：\n${offenders.join("\n")}\n\n` +
      "改成 https:// 绝对地址（指向文档站或 GitHub 上的文件）。",
  );
});
