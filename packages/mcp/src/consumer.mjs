// 消费方实装版本上下文（#337）。
//
// 这个 server 一直知道两个版本：产物是哪一版（registry）、这里的源码是哪一版（LOCAL_ROOT）。
// 它**不知道**的是第三个：调用方项目里 node_modules/@hulianui/ui 实装的是哪一版 ——
// 而恰恰是这一版决定了照文档写出来的 prop 存不存在。#246 的 versionSkew 比的是前两个，
// 两边一致就 null，读起来像「版本没问题」，其实它压根没看消费方；validate_hulian_usage 的
// `versions.consumerUi` 看了，但那是写完代码之后的门禁。查 props 的那一步（最需要这个信息
// 的地方）是盲的：文档 v0.58.0 列着 `numeric`，消费方装的 v0.56.0 没有，typecheck 才发现。
//
// 所以把「消费方是谁、装的什么版本」提成每次 tool 调用都带着的上下文：
//   · 根的来源：显式 projectRoot > 最近一次 inspect_project 认过的根 > MCP Roots > cwd。
//     记住上一次的根是因为工作流第一步就是 inspect_project，之后的 get_component_doc 不该
//     再让调用方逐次重复传；cwd 兜底沿用 validate_hulian_usage 的口径，来源一律标出来。
//   · 与「本次回答依据的版本」不同就在响应顶部贴 error 级横幅（与 staleBanner 同级），
//     get_component_doc 则直接改用实装那一版随包发布的 md 作答（见 index.mjs）。

import { AsyncLocalStorage } from "node:async_hooks";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { answeringVersion, mode } from "./data.mjs";
import { installedVersion, resolveProjectRoot } from "./project.mjs";

const PKG = "@hulianui/ui";

const scope = new AsyncLocalStorage();

/** 最近一次由 inspect_project / audit / validate 显式认过的根（cwd 兜底不算，记它没有增量）。 */
let remembered = null;

export function rememberConsumerRoot(projectRoot, via) {
  if (!projectRoot || !existsSync(projectRoot)) return;
  remembered = { projectRoot, via };
}

/**
 * 解析本次调用的消费方上下文。显式 projectRoot 不存在时抛错（与 inspect_project 同款文案），
 * 由调用方决定是失败还是忽略。
 */
export function resolveConsumer({ explicit, roots = [], cwd = process.cwd() } = {}) {
  let projectRoot;
  let projectRootSource;
  if (explicit) {
    ({ projectRoot, projectRootSource } = resolveProjectRoot({ explicit, roots, cwd }));
  } else if (remembered) {
    projectRoot = remembered.projectRoot;
    projectRootSource = `remembered:${remembered.via}`;
  } else {
    ({ projectRoot, projectRootSource } = resolveProjectRoot({ roots, cwd }));
  }
  const installed = installedVersion(projectRoot, PKG);
  return {
    projectRoot,
    projectRootSource,
    installed: installed ? { version: installed.version, from: installed.from, linkKind: installed.linkKind } : null,
  };
}

/** 把一次 tool 调用跑在自己的消费方上下文里（ctx 可为 null：认不出项目时照常工作）。 */
export function withConsumer(ctx, fn) {
  return scope.run(ctx, fn);
}

export function currentConsumer() {
  return scope.getStore() ?? null;
}

// ------------------------------------------------------------- 版本比对 --

/** 只认 `major.minor.patch` 数字前缀；`9.9.9-local` 这种带标签的取 9.9.9。认不出返回 null。 */
export function parseVersion(version) {
  const m = /^v?(\d+)\.(\d+)\.(\d+)/.exec(String(version ?? "").trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** -1 / 0 / 1；任一边解析不了返回 null（字符串不同但比不出先后）。 */
export function compareVersions(a, b) {
  const x = parseVersion(a);
  const y = parseVersion(b);
  if (!x || !y) return null;
  for (let i = 0; i < 3; i += 1) {
    if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  }
  return 0;
}

/** 「差 2 个 minor」这种给人读的差距描述；比不出来时返回 null。 */
export function describeGap(from, to) {
  const x = parseVersion(from);
  const y = parseVersion(to);
  if (!x || !y) return null;
  const labels = ["major", "minor", "patch"];
  for (let i = 0; i < 3; i += 1) {
    if (x[i] !== y[i]) return `${Math.abs(x[i] - y[i])} 个 ${labels[i]}`;
  }
  return null;
}

/**
 * 消费方实装版本与本次回答依据的版本不一致时返回描述；一致、认不出项目、或项目没装
 * @hulianui/ui 时返回 null。
 *
 * 「依据的版本」取 data.mjs 的 answeringVersion：本地模式是源码版本（md 正文从那儿来），
 * 远程模式是产物版本。产物与源码自己不一致的那种漂移由 versionSkew / staleBanner 负责，
 * 这里只管消费方这一维。
 */
export function consumerSkew() {
  const ctx = currentConsumer();
  if (!ctx?.installed?.version) return null;
  const docs = answeringVersion();
  if (!docs || docs === ctx.installed.version) return null;
  const cmp = compareVersions(ctx.installed.version, docs);
  return {
    docs,
    installed: ctx.installed.version,
    from: ctx.installed.from,
    direction: cmp === null ? "unknown" : cmp < 0 ? "older" : cmp > 0 ? "newer" : "unknown",
    gap: describeGap(ctx.installed.version, docs),
    projectRoot: ctx.projectRoot,
    projectRootSource: ctx.projectRootSource,
  };
}

/** 响应 source 里的消费方一段：机器读的正路，横幅是给人和模型看的。 */
export function consumerInfo() {
  const ctx = currentConsumer();
  if (!ctx) return null;
  return {
    projectRoot: ctx.projectRoot,
    projectRootSource: ctx.projectRootSource,
    installed: ctx.installed?.version ?? null,
    skew: consumerSkew(),
  };
}

/** 脚注里的一小段：装了什么版本、与文档是否一致。认不出项目就空串。 */
export function consumerFooter() {
  const ctx = currentConsumer();
  if (!ctx?.installed?.version) return "";
  const skew = consumerSkew();
  return skew
    ? `⚠️ 消费方实装 ${PKG} v${skew.installed} ≠ 文档 v${skew.docs}`
    : `消费方实装 ${PKG} v${ctx.installed.version}`;
}

/**
 * 消费方版本不一致时贴在响应**最顶部**的 error 级横幅；一致时空串。
 *
 * 与 staleBanner 同一条纪律：error 级的话术 + 完整正文 + 明确的兜底路径，不置 isError ——
 * 调用方此刻最需要的恰恰是「拿到内容 + 知道该信哪一份」。
 */
export function consumerBanner(skew = consumerSkew()) {
  if (!skew) return "";
  const gap = skew.gap ? `，${skew.direction === "older" ? "旧" : "新"} ${skew.gap}` : "";
  const lines = [
    `❌ 错误 · 文档与你项目实装的 ${PKG} 不是同一个版本：本次内容按 **v${skew.docs}** 给，` +
      `而 \`${skew.from}\` 实装的是 **v${skew.installed}**${gap}。`,
  ];
  const installedIsTruth =
    `**以 \`node_modules/${PKG}/src/<slug>/<slug>.md\` 与同目录的 \`<slug>.types.ts\` 为准**（随 npm 包发布，与实装同版）—— ` +
    `get_component_doc 会直接返回实装那一版的文档；\`format:"json"\` 里实装文档没列的 prop 带 \`notInInstalledDoc: true\`。`;
  if (skew.direction === "older") {
    // 本地源码模式下「文档那一版」是这份检出的版本号，未必已经发到 npm；升级命令得留这个口。
    const maybeUnpublished = mode === "local" ? "（本地源码模式：该版若尚未发 npm 会装不到）" : "";
    lines.push(
      `v${skew.installed} 之后新增的组件与 prop 在你的项目里**不存在**，照本文档写会 TS2322。两条路任选：`,
      `· 按实装版本写：${installedIsTruth}`,
      `· 或先升级：\`pnpm add ${PKG}@${skew.docs} @hulianui/tokens@latest\`${maybeUnpublished}，再按本文档写。`,
    );
  } else if (skew.direction === "newer") {
    lines.push(
      `v${skew.docs} 之后新增的组件与 prop 在本文档里**查不到**，已改名 / 删除的旧签名可能还在。${installedIsTruth}` +
        `也可以把 MCP 的 \`HULIAN_UI_ROOT\` 指到 \`${skew.from}\`（消费方没有 registry 产物，需同时设 \`HULIAN_ALLOW_REMOTE_FALLBACK=1\`）。`,
    );
  } else {
    // 比不出先后（预发布标签、非 semver 版本号）：只知道不是同一份，两边都可能有对方没有的东西。
    lines.push(`两个版本号比不出先后，只能确定不是同一份：哪边多了、少了什么 prop 这里说不准。${installedIsTruth}`);
  }
  if (skew.projectRootSource === "cwd-fallback") {
    lines.push(
      `（projectRoot 来自 cwd 兜底：\`${skew.projectRoot}\`。如果这不是你的项目，先调 inspect_project 或显式传 projectRoot。）`,
    );
  }
  return lines.join("\n");
}

// ------------------------------------------------------- 实装那一版的文档 --

/** 实装包里这一件的 md 路径；包里连 src/ 都没有（dist-only 的未来版本）时返回 null。 */
export function installedDocPath(installedRoot, slug) {
  if (!installedRoot || !existsSync(join(installedRoot, "src"))) return null;
  return join(installedRoot, "src", slug, `${slug}.md`);
}

const isTableRow = (line) => /^\s*\|/.test(line) && /\|\s*$/.test(line.trim());
const isDelimiterRow = (line) => /^\s*\|(\s*:?-{2,}:?\s*\|)+\s*$/.test(line.trim());

/** 与 scripts/props-catalog.mjs 的 splitTableRow 同一套规则：转义管道与代码段内的管道不算列分隔。 */
function firstCell(line) {
  let cur = "";
  let inCode = false;
  const cells = [];
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\\" && i + 1 < line.length && /[!-/:-@[-`{-~]/.test(line[i + 1])) {
      cur += line[i + 1];
      i += 1;
      continue;
    }
    if (ch === "`") {
      inCode = !inCode;
      cur += ch;
      continue;
    }
    if (ch === "|" && !inCode) {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  if (cells.length && cells[0].trim() === "") cells.shift();
  return cells[0]?.trim() ?? "";
}

/**
 * 一份组件 md 里**所有表格首列**的名字（与仓库门禁 docs:check:props 的 documentedNames 同口径）：
 * 去必填星号、去反引号、限定名取最后一段、`a / b` 合并行拆开。
 *
 * 判据放宽到「任何一张表里交代过」而不限于 Props 节，是为了零误报：这里的结论会被写成
 * 「实装文档没列这个 prop」，宁可漏标也不能把明明有的 prop 标成没有。
 */
export function documentedNames(body) {
  const names = new Set();
  let inFence = false;
  let sawHeader = false;
  for (const line of String(body).split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    if (!isTableRow(line)) {
      sawHeader = false;
      continue;
    }
    if (isDelimiterRow(line)) {
      sawHeader = true;
      continue;
    }
    // 分隔行之前的那一行是表头（「名称 | 类型 | …」），不是字段
    if (!sawHeader) continue;
    for (const part of firstCell(line).split("/")) {
      let text = part.trim().replace(/\s*\*+\s*$/, "");
      text = text.replace(/^`(.*)`$/s, "$1").trim();
      const dot = text.lastIndexOf(".");
      if (dot > 0) text = text.slice(dot + 1);
      if (text) names.add(text);
    }
  }
  return names;
}

/** 实装包里这一件文档列出的字段名；没有那份文档时返回 null（分不清「没这个组件」与「没文档」）。 */
export function installedDocumentedNames(installedRoot, slug) {
  const path = installedDocPath(installedRoot, slug);
  if (!path || !existsSync(path)) return null;
  try {
    return documentedNames(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}
