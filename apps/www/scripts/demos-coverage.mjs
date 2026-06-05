#!/usr/bin/env node
// demos-coverage —— 内置 demo 的「组件覆盖率」自检。
//
// 命题（用户定调）：demo 是给用户照抄的教学材料，每个 manifest 公开组件都该有真实用例。
// 「漏才是最危险的信号」——本脚本把「从没在任何 demo 出现过的组件」列出来，逼着补。
//
// 用法：
//   node scripts/demos-coverage.mjs            # 打印覆盖率 + 未覆盖清单
//   node scripts/demos-coverage.mjs --min 60   # 覆盖率低于阈值则 exit 1（可进 CI）
//
// 口径：分母 = apps/www/lib/manifest.ts 公开组件条目；分子 = demos/** 里 `from "@hulianui/ui"`
// 的具名 import 命中的条目（ProTable 不算覆盖 Table —— 用户看的是 manifest 条目本身）。

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const wwwRoot = resolve(here, "..");
const demosDir = resolve(wwwRoot, "app/demos");
const manifestPath = resolve(wwwRoot, "lib/manifest.ts");

// 部分组件以「子件/工厂/变体」名在 demo 出现，但本质就是该 manifest 条目 —— 视为已覆盖。
const ALIASES = {
  Toast: ["toast", "ToastProvider"],
  Notification: ["NotificationProvider"],
  Chart: ["AreaChart", "BarChart", "PieChart", "LineChart"],
  Form: ["ProForm", "useForm"],
  "ModalForm / DrawerForm": ["ModalForm", "DrawerForm"],
  // 设备外壳 iPhone 的导出标识符是 IPhone（大写 I），manifest 用品牌正确写法 iPhone 作显示名。
  iPhone: ["IPhone"],
};

function parseManifest() {
  const src = readFileSync(manifestPath, "utf8");
  const re = /\{\s*slug:\s*"([^"]+)",\s*name:\s*"([^"]+)"[\s\S]*?category:\s*"([^"]+)"/g;
  const comps = [];
  let m;
  while ((m = re.exec(src))) comps.push({ slug: m[1], name: m[2], category: m[3] });
  return comps;
}

function usedIdentifiers() {
  const files = execSync(`grep -rl '@hulianui/ui' "${demosDir}"`, { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  const used = new Set();
  const re = /import\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']@hulian\/ui["']/g;
  for (const f of files) {
    const s = readFileSync(f, "utf8");
    let m;
    while ((m = re.exec(s))) {
      for (const part of m[1].split(",")) {
        const name = part.trim().split(/\s+as\s+/)[0].trim().replace(/^type\s+/, "");
        if (name) used.add(name);
      }
    }
  }
  return used;
}

const pascal = (s) =>
  s
    .split(/[-_ /]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

function isCovered(comp, used) {
  const candidates = new Set([
    comp.name,
    comp.name.replace(/\s+/g, ""),
    pascal(comp.slug),
    ...(ALIASES[comp.name] ?? []),
  ]);
  for (const c of candidates) if (used.has(c)) return true;
  return false;
}

// ── 门禁 2：禁止 demo 引远程资源 ───────────────────────────────────────────
// 命题：demo 要离线可跑、可静态导出、语义可控。任何外链头像/图片都会在断网/内网/
// 被墙时碎图，且 picsum 之类随机图与文案语义不符。一律本地化（public/ 或程序化生成）。
//
// 识别口径（命中即违规）：
//   a) 已知占位/外链资源服务域名（pravatar/picsum/unsplash/...）
//   b) 任意带图片/媒体扩展名的 http(s) URL（.jpg/.png/.webp/.gif/.svg/.avif/.mp4/.webm）
// 刻意放行：非资源类业务 URL（如 https://pay.hulian.demo 支付占位串、纯站点链接）。
const REMOTE_HOSTS = [
  "pravatar.cc",
  "picsum.photos",
  "unsplash.com",
  "placehold.co",
  "placekitten.com",
  "dicebear.com",
  "gravatar.com",
  "loremflickr.com",
  "robohash.org",
  "ui-avatars.com",
  "placeimg.com",
  "via.placeholder.com",
];
const REMOTE_HOST_RE = new RegExp(
  `https?://[^"'\\s)]*(?:${REMOTE_HOSTS.map((h) => h.replace(/\./g, "\\.")).join("|")})[^"'\\s)]*`,
  "g",
);
const REMOTE_ASSET_RE = /https?:\/\/[^"'\s)]+\.(?:jpe?g|png|webp|gif|svg|avif|mp4|webm)(?:\?[^"'\s)]*)?/gi;

function remoteAssetViolations() {
  const files = execSync(`grep -rlE 'https?://' "${demosDir}"`, { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);
  const hits = [];
  for (const f of files) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      const found = new Set([
        ...(line.match(REMOTE_HOST_RE) ?? []),
        ...(line.match(REMOTE_ASSET_RE) ?? []),
      ]);
      for (const url of found) hits.push({ file: relative(wwwRoot, f), line: i + 1, url });
    });
  }
  return hits;
}

const comps = parseManifest();
const used = usedIdentifiers();
const missing = comps.filter((c) => !isCovered(c, used));
const rate = ((comps.length - missing.length) / comps.length) * 100;

const byCat = {};
for (const c of missing) (byCat[c.category] ??= []).push(c.name);

console.log(`\n瑚琏 Demo 组件覆盖率：${comps.length - missing.length}/${comps.length} = ${rate.toFixed(0)}%`);
console.log(`未在任何 demo 出现（危险盲区）：${missing.length} 个\n`);
for (const cat of Object.keys(byCat).sort()) {
  console.log(`  [${cat}] ${byCat[cat].length}：${byCat[cat].join(", ")}`);
}

// ── 门禁 2 输出：远程资源（命中即硬失败，不依赖阈值）──────────────────────
const remoteHits = remoteAssetViolations();
console.log(`\n远程资源外链（必须本地化）：${remoteHits.length} 处`);
for (const h of remoteHits) {
  console.log(`  ✗ ${h.file}:${h.line}  ${h.url}`);
}

let failed = false;

const minArg = process.argv.indexOf("--min");
if (minArg !== -1) {
  const min = Number(process.argv[minArg + 1]);
  if (rate < min) {
    console.error(`\n✗ 覆盖率 ${rate.toFixed(0)}% 低于阈值 ${min}%`);
    failed = true;
  } else {
    console.log(`\n✓ 覆盖率 ${rate.toFixed(0)}% ≥ 阈值 ${min}%`);
  }
}

if (remoteHits.length > 0) {
  console.error(
    `\n✗ demo 存在 ${remoteHits.length} 处远程资源外链 —— 一律本地化（public/ 或程序化生成）。`,
  );
  failed = true;
} else {
  console.log(`\n✓ 无远程资源外链`);
}

if (failed) process.exit(1);
