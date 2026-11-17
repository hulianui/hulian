#!/usr/bin/env node
//
// 发布包装：把判据从「changeset publish 退出码」换成「registry 上真的取得到这版」。
//
// 起因（2026-11-18 连撞两次，0.77.0 与 0.78.0）：npm 的 staged publish 会先落成「暂存」，
// 几分钟后才真正上线（实测 2.5~13 分钟）。这期间会出现一对互相矛盾的假象：
//   - `changeset publish` 退出码 0 —— Release 绿了，npm 上却查不到这版（0.77.0）；
//   - 下一次 push 再 publish 撞 E409「Cannot publish over previously staged version」——
//     Release 红在一件其实已经成功、只是还没落库的事情上（0.78.0）。
// 两种都不该让人去猜，所以这里：
//   1. publish 失败但每条错误都是 staged —— 不判失败，继续等落库；
//   2. publish 成功也照样核验一遍 —— 挡住「绿了但没发出去」；
//   3. 超过预算（默认 12 分钟）还没落库才红，并列出还差哪几版，别再让下一个人重跑猜谜。
//
// `--verify-only` 只核验不发布：本地想确认某次发版到底落没落库时用。

import { spawnSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export const REGISTRY = "https://registry.npmjs.org";
/** 12 分钟：实测 staged → 上线最长 13 分钟那次的观察值上留了点余量。 */
export const DEFAULT_TIMEOUT_MS = 12 * 60_000;
export const DEFAULT_INTERVAL_MS = 15_000;

/** 去掉 changesets 输出里的 ANSI 颜色，否则行首的转义序列会让正则匹配不上。 */
export function stripAnsi(text) {
  // eslint-disable-next-line no-control-regex
  return String(text ?? "").replace(/\u001b\[[0-9;]*m/g, "");
}

/**
 * 从 publish 输出里挑出「被 npm staged publish 挡住」的包。
 * changesets 的原话形如：
 *   an error occurred while publishing @hulianui/ui: E409 409 Conflict - PUT https://… -
 *   Cannot publish over previously staged version "0.78.0".
 */
export function parseStagedConflicts(output) {
  const clean = stripAnsi(output);
  const conflicts = [];
  const pattern =
    /an error occurred while publishing (\S+):[^\n]*?previously staged version "([^"]+)"/g;
  for (const match of clean.matchAll(pattern)) {
    conflicts.push({ name: match[1], version: match[2] });
  }
  return conflicts;
}

/**
 * 把 publish 失败拆成「可恢复的 staged」与「真失败」两类。
 * 只有全部错误都是 staged 时才允许继续等；一条真失败都不该被等待掩盖。
 */
export function classifyPublishFailure(output) {
  const clean = stripAnsi(output);
  const staged = parseStagedConflicts(output);
  const stagedKeys = new Set(staged.map((conflict) => `${conflict.name}@${conflict.version}`));
  const hard = [];
  for (const line of clean.split("\n")) {
    const match = /an error occurred while publishing (\S+?):\s*(.+)$/.exec(line.trim());
    if (!match) continue;
    const [, name, detail] = match;
    const version = /previously staged version "([^"]+)"/.exec(detail)?.[1];
    if (version && stagedKeys.has(`${name}@${version}`)) continue;
    hard.push({ name, detail: detail.trim() });
  }
  return { staged, hard };
}

/** 会发到 npm 的包（packages/* 下未标 private 的），带本地版本号 —— 核验的输入。 */
export function publishablePackages(root = ROOT) {
  const packagesDir = join(root, "packages");
  const packages = [];
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(packagesDir, entry.name, "package.json");
    let manifest;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    } catch {
      continue;
    }
    if (manifest.private || !manifest.name || !manifest.version) continue;
    packages.push({ name: manifest.name, version: manifest.version });
  }
  return packages.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * 这一版在 registry 上取得到吗。
 * 带上 `?t=` 破缓存：刚发布时 CDN 会把之前的 404 缓存住，重复查会一直拿到旧结果。
 */
export async function isVersionLive(
  { name, version },
  { fetchImpl = fetch, cacheBust = Date.now } = {},
) {
  const url = `${REGISTRY}/${encodeURIComponent(name)}/${version}?t=${cacheBust()}`;
  try {
    const response = await fetchImpl(url, {
      headers: { accept: "application/json", "cache-control": "no-cache" },
    });
    return response.status === 200;
  } catch {
    // 网络抖一下不该被判成「没发布」：当成还没查到，交给下一轮。
    return false;
  }
}

/**
 * 轮询到全部落库为止。时间/睡眠/取数都可注入，好让判据本身能被测试覆盖。
 * 返回 `{ ok, missing, elapsedMs }`；超时不算异常，由调用方决定退出码。
 */
export async function waitForPublished(
  packages,
  {
    isLive = isVersionLive,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    intervalMs = DEFAULT_INTERVAL_MS,
    now = () => Date.now(),
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    log = () => {},
  } = {},
) {
  const startedAt = now();
  for (;;) {
    const missing = [];
    for (const pkg of packages) {
      if (!(await isLive(pkg))) missing.push(pkg);
    }
    const elapsedMs = now() - startedAt;
    if (missing.length === 0) return { ok: true, missing: [], elapsedMs };
    if (elapsedMs >= timeoutMs) return { ok: false, missing, elapsedMs };
    log(
      `[release] 还差 ${missing.map((pkg) => `${pkg.name}@${pkg.version}`).join("、")}` +
        ` — 已等 ${Math.round(elapsedMs / 1000)}s，每 ${Math.round(intervalMs / 1000)}s 复查`,
    );
    await sleep(intervalMs);
  }
}

async function main() {
  const verifyOnly = process.argv.includes("--verify-only");
  const timeoutMs = Number(process.env.RELEASE_VERIFY_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const intervalMs = Number(process.env.RELEASE_VERIFY_INTERVAL_MS ?? DEFAULT_INTERVAL_MS);
  const packages = publishablePackages();

  if (packages.length === 0) {
    console.error("[release] packages/* 里没有可发布的包，判据无从谈起");
    process.exit(1);
  }
  console.log(
    `[release] 待核验 ${packages.length} 个：${packages
      .map((pkg) => `${pkg.name}@${pkg.version}`)
      .join(" · ")}`,
  );

  if (!verifyOnly) {
    const publish = spawnSync(process.platform === "win32" ? "pnpm.cmd" : "pnpm", ["release"], {
      cwd: ROOT,
      encoding: "utf8",
      env: process.env,
    });
    const output = `${publish.stdout ?? ""}${publish.stderr ?? ""}`;
    process.stdout.write(output);

    const { staged, hard } = classifyPublishFailure(output);
    if (hard.length > 0) {
      console.error(
        `[release] publish 真失败，不等了：\n${hard
          .map((failure) => `  ${failure.name}: ${failure.detail}`)
          .join("\n")}`,
      );
      process.exit(publish.status ?? 1);
    }
    if (staged.length > 0) {
      console.log(
        `[release] 撞到 npm staged publish：${staged
          .map((conflict) => `${conflict.name}@${conflict.version}`)
          .join("、")} —— 不判失败，等它落库`,
      );
    }
  }

  const result = await waitForPublished(packages, {
    timeoutMs,
    intervalMs,
    log: (message) => console.log(message),
  });

  if (!result.ok) {
    console.error(
      `[release] 等了 ${Math.round(result.elapsedMs / 1000)}s 仍不在 registry 上：${result.missing
        .map((pkg) => `${pkg.name}@${pkg.version}`)
        .join("、")}\n` +
        "  · 若 npm 上显示为 staged，需要有人 approve：npm stage list / npm stage approve <id>\n" +
        "  · 若根本没发出去，看上面 publish 的输出，别只看本行",
    );
    process.exit(1);
  }

  console.log(`[release] 全部落库（核验耗时 ${Math.round(result.elapsedMs / 1000)}s）`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error?.stack ?? String(error));
    process.exit(1);
  });
}
