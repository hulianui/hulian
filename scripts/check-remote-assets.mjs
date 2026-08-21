#!/usr/bin/env node
// check-remote-assets —— 「资源全本地化，零外链」门禁。
//
// 命题（源自 packages/ui/src/lib/demo-image.ts 开头那段）：演示素材一旦挂外链，断网 / 内网 /
// 被墙时就是碎图或空白弹层，组件的核心交互当场演示不出来；随机图服务给的图还与文案语义不符。
// demos 那边早有这条铁律，但 apps/www/scripts/demos-coverage.mjs 的实现只扫 app/demos，
// 管不到 packages/ui —— 于是同一个反模式在组件里反复出现：先是 11 处外链占位图（已换成
// lib/demo-image.ts 的程序化 data-URI），再是 HeroVideoDialog 写死的 YouTube embed（issue #305）。
// 本脚本把口径提到仓库级，两个根一起扫。
//
// 用法：
//   node scripts/check-remote-assets.mjs           # 命中即 exit 1
//
// ── 判定口径 ────────────────────────────────────────────────────────────────
// 命中（违规）：
//   a) 已知占位图 / 头像服务域名（picsum、pravatar、unsplash…）—— 它们只可能是演示素材；
//   b) 已知视频平台域名（youtube、bilibili、vimeo…）—— HeroVideoDialog 那次就是它，
//      且 embed 地址没有扩展名，靠 c) 抓不住；
//   c) 字体服务与通用资源 CDN 域名（fonts.googleapis、typekit、jsdelivr…）—— 同样没有扩展名，
//      靠 d) 抓不住，但一次远程字体请求在墙内就是掉字体；
//   d) 任意带素材扩展名的 http(s) 地址（图片 / 视频 / 音频 / 字体文件 / JSON）。
//
// 放行：
//   1) RFC 2606 / 6761 保留域名（example.com|net|org、*.example、*.test、*.invalid、
//      *.localhost、localhost）。它们**永远解析不到真实第三方**，是标准的文档占位写法，
//      Image 的「加载失败回退」示例正需要一个必定失败的地址；
//   2) 测试文件（*.test.* / *.spec.* / __tests__/）：跑在 jsdom / node 里，字符串不会被真的请求；
//   3) 同行写了 `remote-asset-ok: <理由>` 的逃生口 —— 理由必填，空的仍算违规。
//
// 刻意不扫 .md：组件文档里出现 `videoSrc="https://www.youtube.com/embed/<id>"` 是在**讲**
// 怎么接第三方平台，那是散文不是素材，页面不会去请求它。

import { readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));

/** 扫描根：库源码 + 内置 demo。 */
export const DEFAULT_ROOTS = ["packages/ui/src", "packages/tokens/src", "apps/www/app/demos"];

const PLACEHOLDER_HOSTS = [
  "pravatar.cc",
  "picsum.photos",
  "unsplash.com",
  "placehold.co",
  "placeholder.com",
  "placekitten.com",
  "dicebear.com",
  "gravatar.com",
  "loremflickr.com",
  "robohash.org",
  "ui-avatars.com",
  "placeimg.com",
  "dummyimage.com",
];

// 字体服务与通用资源 CDN。单列出来是因为 c) 档抓不住它们：
// `https://fonts.googleapis.com/css2?family=Inter` 没有素材扩展名，域名也不是占位图服务，
// 但它就是一次实打实的外网请求 —— 断网 / 墙内即掉字体。自托管字体请进消费方自己的 public/。
const FONT_AND_CDN_HOSTS = [
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "fonts.bunny.net",
  "fonts.loli.net",
  "font.im",
  "use.typekit.net",
  "p.typekit.net",
  "use.fontawesome.com",
  "kit.fontawesome.com",
  "cdn.jsdelivr.net",
  "unpkg.com",
  "cdnjs.cloudflare.com",
];

const MEDIA_PLATFORM_HOSTS = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
  "vimeo.com",
  "dailymotion.com",
  "bilibili.com",
  "youku.com",
  "iqiyi.com",
  "soundcloud.com",
];

const BLOCKED_HOSTS = [...PLACEHOLDER_HOSTS, ...MEDIA_PLATFORM_HOSTS, ...FONT_AND_CDN_HOSTS];

// 素材扩展名。json 也算：组件不该在运行时去第三方拉数据文件。
const MEDIA_EXTENSIONS =
  "jpe?g|png|webp|gif|svg|avif|bmp|ico|mp4|webm|ogv|mov|m4v|m3u8|mp3|wav|flac|aac|woff2?|ttf|otf|eot|json";

const URL_RE = /https?:\/\/[^\s"'`)<>\\]+/g;
const MEDIA_EXTENSION_RE = new RegExp(`\\.(?:${MEDIA_EXTENSIONS})(?:[?#]|$)`, "i");
const ESCAPE_HATCH_RE = /remote-asset-ok\s*:?\s*(.*)$/;

const SCANNED_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".css"];
const SKIPPED_DIRECTORIES = new Set(["node_modules", "generated", "dist", ".next", "__tests__"]);
const TEST_FILE_RE = /\.(?:test|spec)\.[a-z]+$/i;

function slash(path) {
  return path.split(sep).join("/");
}

/** 取 URL 的主机名；拿不到（模板串拼接等）返回 "". */
function hostOf(url) {
  const match = /^https?:\/\/([^/?#]*)/i.exec(url);
  if (!match) return "";
  return match[1].replace(/^[^@]*@/, "").replace(/:\d+$/, "").toLowerCase();
}

/** RFC 2606 / 6761 保留域名 —— 永远解析不到真实第三方，可以安全地当文档占位。 */
export function isReservedHost(host) {
  if (!host) return false;
  if (host === "localhost") return true;
  if (/(?:^|\.)(?:example|test|invalid|localhost)$/.test(host)) return true;
  return /(?:^|\.)example\.(?:com|net|org)$/.test(host);
}

function isBlockedHost(host) {
  return BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`));
}

/** 一条 URL 该不该报，以及为什么。 */
export function classifyUrl(url) {
  const host = hostOf(url);
  if (isReservedHost(host)) return undefined;
  if (isBlockedHost(host)) return `第三方素材/媒体平台域名 ${host}`;
  if (MEDIA_EXTENSION_RE.test(url)) return "带素材扩展名的外链地址";
  return undefined;
}

function* walk(directory) {
  let entries;
  try {
    entries = readdirSync(directory, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name) || entry.name.startsWith(".")) continue;
      yield* walk(full);
      continue;
    }
    if (!entry.isFile()) continue;
    if (TEST_FILE_RE.test(entry.name)) continue;
    if (!SCANNED_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) continue;
    yield full;
  }
}

/**
 * 扫描给定根目录下的源码，返回外链素材违规清单。
 *
 * @param options.repoRoot 仓库根（默认本脚本推导）
 * @param options.roots 相对 repoRoot 的扫描根（默认 DEFAULT_ROOTS）
 */
export function checkRemoteAssets(options = {}) {
  const repoRoot = resolve(options.repoRoot ?? REPO_ROOT);
  const roots = options.roots ?? DEFAULT_ROOTS;
  const findings = [];
  let files = 0;

  for (const root of roots) {
    for (const file of walk(resolve(repoRoot, root))) {
      files += 1;
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, index) => {
        const hatch = ESCAPE_HATCH_RE.exec(line);
        if (hatch) {
          if (hatch[1].trim().length > 0) return;
          findings.push({
            file: slash(relative(repoRoot, file)),
            line: index + 1,
            url: "",
            reason: "remote-asset-ok 逃生口必须写明理由",
          });
          return;
        }
        for (const url of line.match(URL_RE) ?? []) {
          const reason = classifyUrl(url.replace(/[.,;:]+$/, ""));
          if (reason) {
            findings.push({ file: slash(relative(repoRoot, file)), line: index + 1, url, reason });
          }
        }
      });
    }
  }

  return { findings, files };
}

const invoked = resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url);
if (invoked) {
  const { findings, files } = checkRemoteAssets();
  if (findings.length > 0) {
    for (const finding of findings) {
      console.error(`  ✗ ${finding.file}:${finding.line}  ${finding.url}  —— ${finding.reason}`);
    }
    console.error(
      `\n[remote-assets] ${findings.length} 处外链素材 —— 一律本地化：图片走 lib/demo-image.ts 的程序化 data-URI，` +
        `视频/照片等大件放 apps/www/public/demo/ 并用 lib/demo-asset.ts 的 demoAsset() 拼路径。`,
    );
    process.exitCode = 1;
  } else {
    console.log(`[remote-assets] PASS · ${files} 个源文件里没有外链素材（扫描根：${DEFAULT_ROOTS.join("、")}）`);
  }
}
