// 数据源：本地优先，远程兜底 —— 但**兜底必须是显式的**。
//
// 这个 MCP server 有两种用法：
//   1. 在瑚琏 monorepo 里开发：`HULIAN_UI_ROOT` 指向 packages/ui，直接读源码旁的
//      <slug>.md 与生成的 registry.json。永远最新、零网络、改完立刻生效。
//   2. 在任意下游项目里：读线上 registry（默认 hulianui.haloritual.com），带 TTL 缓存。
//
// 此前两条路会**静默混用**：设了 HULIAN_UI_ROOT 但忘了跑 `pnpm llms-registry`，
// 就会安静地拿线上产物回答本地问题 —— 版本对不上，而调用方完全看不出来。
// 现在本地模式缺产物是硬错误，只有显式设 HULIAN_ALLOW_REMOTE_FALLBACK=1 才降级，
// 且降级后 source 里带 fallback 标记，一路暴露到 tool 响应上。
//
// 但那道防线只挡「产物**缺失**」，不挡「产物**存在但陈旧**」—— 而陈旧才是常态：
// `llms-registry` 是 `docs:all` 里的独立一步，改完组件跑 build/test 全绿，唯独忘了它
// 不会有任何反馈。于是本地模式的核心承诺（永远最新）被静默打破，失败形态还比它当初
// 要防的更糟：当初防的是「拿线上新数据答本地问题」，现在是「拿本地旧数据答问题」，
// 而 MCP 的整个定位是「props 不许猜，查这里」，最听话的调用方受害最深（#48）。
//
// 所以本地模式额外做两件事：
//   · 版本戳以 packages/ui/package.json 为准，不用生成物里的（生成物必然落后一版，#47）
//   · 每次响应都比一遍新鲜度（版本号 + mtime），陈旧就把重生成命令直接甩到响应里

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const REMOTE_BASE = (process.env.HULIAN_REGISTRY_URL || "https://hulianui.haloritual.com").replace(
  /\/+$/,
  "",
);
const LOCAL_ROOT = process.env.HULIAN_UI_ROOT ? resolve(process.env.HULIAN_UI_ROOT) : null;
const ALLOW_FALLBACK = process.env.HULIAN_ALLOW_REMOTE_FALLBACK === "1";

/** 远程产物的缓存寿命。长驻进程配永久缓存 = 慢性数据陈旧；默认 5 分钟，设 0 关闭。 */
const TTL_MS = Number.isFinite(Number(process.env.HULIAN_MCP_CACHE_TTL_MS))
  ? Number(process.env.HULIAN_MCP_CACHE_TTL_MS)
  : 5 * 60 * 1000;

/** monorepo 根（LOCAL_ROOT 是 packages/ui，registry 产物在 apps/www/public） */
const localPublic = LOCAL_ROOT ? join(LOCAL_ROOT, "..", "..", "apps", "www", "public") : null;

/**
 * 本地模式下「这份检出是什么版本」的真源。
 *
 * 不能用 registry.json 里的 version：那是生成物，而发版 commit（changesets）只动
 * package.json + CHANGELOG，不会重跑生成脚本，于是本地检出的产物**必然落后一版**，
 * 直到有人手动补跑。用生成物的版本号会让 validate 报出假的 skew（registry 0.15.1 vs
 * consumerUi 0.16.0），读起来像「MCP 落后了别信它」，而实际上两边都是 0.16.0（#47）。
 */
const localSourceVersion = LOCAL_ROOT
  ? (() => {
      try {
        return JSON.parse(readFileSync(join(LOCAL_ROOT, "package.json"), "utf8")).version ?? null;
      } catch {
        return null;
      }
    })()
  : null;

const cache = new Map();
/** 本次进程里真正发生过的远程降级（本地模式下才有意义），暴露给调用方看。 */
const fallbacks = new Set();

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (TTL_MS > 0 && Date.now() - hit.at > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit;
}

async function fetchRemote(url, { json = true } = {}) {
  const hit = cacheGet(url);
  if (hit) return hit;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`拉取失败 ${url}：HTTP ${res.status}`);
  const value = json ? await res.json() : await res.text();
  const entry = { value, at: Date.now(), generatedAt: res.headers.get("last-modified") || null };
  if (TTL_MS > 0) cache.set(url, entry);
  return entry;
}

function readLocalJson(file) {
  if (!localPublic) return null;
  const path = join(localPublic, file);
  return existsSync(path)
    ? { value: JSON.parse(readFileSync(path, "utf8")), path, generatedAt: mtime(path) }
    : null;
}

function mtime(path) {
  try {
    return statSync(path).mtime.toISOString();
  } catch {
    return null;
  }
}

/** 本地模式缺产物时的统一出口：默认硬错误，显式开关才降级。 */
function missingLocal(what, hint) {
  if (!ALLOW_FALLBACK) {
    throw new Error(
      `本地模式（HULIAN_UI_ROOT=${LOCAL_ROOT}）缺少 ${what}。${hint}` +
        "；确实要改用线上产物请设 HULIAN_ALLOW_REMOTE_FALLBACK=1（响应会标记 fallback）。",
    );
  }
  fallbacks.add(what);
  return null;
}

// ------------------------------------------------------------------- 产物 --

let registryMeta = { version: null, artifactVersion: null, generatedAt: null, origin: null };

/** 完整 registry 索引（items 已剥 content，适合放进 AI 上下文） */
export async function loadRegistry() {
  if (LOCAL_ROOT) {
    const local = readLocalJson("registry.json");
    if (local) {
      registryMeta = {
        // 本地模式：版本以源码为准，生成物只用来取 items（#47）
        version: localSourceVersion ?? local.value.version ?? null,
        artifactVersion: local.value.version ?? null,
        generatedAt: local.generatedAt,
        origin: local.path,
      };
      return local.value;
    }
    missingLocal("registry.json", "先在仓库根跑 `pnpm llms-registry`（或 `pnpm docs:all`）生成");
  }
  const url = `${REMOTE_BASE}/registry.json`;
  const entry = await fetchRemote(url);
  registryMeta = {
    version: entry.value.version ?? null,
    artifactVersion: entry.value.version ?? null,
    generatedAt: entry.generatedAt,
    origin: url,
  };
  return entry.value;
}

/** 单个 item 的完整载荷（含 files[].content） */
export async function loadItem(name) {
  if (LOCAL_ROOT) {
    const local = readLocalJson(join("r", `${name}.json`));
    if (local) return local.value;
    missingLocal(`r/${name}.json`, "先跑 `pnpm llms-registry` 生成单件安装端点");
  }
  return (await fetchRemote(`${REMOTE_BASE}/r/${name}.json`)).value;
}

/**
 * 组件的逐件文档（Props / Events / Slots / 示例）。
 * 本地直接读源码旁的 md —— 那是唯一真源，改完即刻生效，不必等 docs:all。
 */
export async function loadDoc(slug) {
  if (LOCAL_ROOT) {
    const path = join(LOCAL_ROOT, "src", slug, `${slug}.md`);
    if (existsSync(path)) return readFileSync(path, "utf8");
    const generated = localPublic ? join(localPublic, "d", `${slug}.md`) : null;
    if (generated && existsSync(generated)) return readFileSync(generated, "utf8");
    missingLocal(`src/${slug}/${slug}.md`, "组件目录下应有同名 md（真源）");
  }
  // 远程：文档站为每个组件单独出一份 /d/<slug>.md。
  // 刻意不去切 llms-full.txt —— 那份 1.1M 的合集只有 `<!-- ═══ -->` + `# Title`
  // 作分隔，slug 与 Title 还不同名（admin-layout / AdminLayout），解析既脆又浪费。
  try {
    return (await fetchRemote(`${REMOTE_BASE}/d/${slug}.md`, { json: false })).value;
  } catch {
    return null;
  }
}

/** 使用约束（固化的「主见」）。本地读 packages/ui/conventions.json，远程读文档站同名文件。 */
export async function loadConventions() {
  if (LOCAL_ROOT) {
    const path = join(LOCAL_ROOT, "conventions.json");
    if (existsSync(path)) return JSON.parse(readFileSync(path, "utf8"));
    const local = readLocalJson("conventions.json");
    if (local) return local.value;
    missingLocal("conventions.json", "先跑 `pnpm conventions` 生成");
  }
  return (await fetchRemote(`${REMOTE_BASE}/conventions.json`)).value;
}

/** 本地模式下可枚举的组件 slug（用于校验名字，给出「你是不是想找 X」） */
export function localSlugs() {
  if (!LOCAL_ROOT) return null;
  const dir = join(LOCAL_ROOT, "src");
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((d) => existsSync(join(dir, d, `${d}.md`)));
}

// ----------------------------------------------------------- 产物新鲜度 --

/** 陈旧判定不便宜（要 stat 几百个文件），memo 一小段时间；重生成后能自愈。 */
const STALE_MEMO_MS = 5000;
let staleMemo = { at: 0, value: null };

/**
 * 本地 registry 产物是否已经落后于源码。两条判据互补，缺一不可：
 *
 *   · **版本号**：挡「发版后没重新生成」。registry 停在 0.15.1 而源码已是 0.16.0，
 *     意味着 0.16.0 新增的组件/prop 在 MCP 里整个查不到。
 *   · **mtime**：挡「版本号没变但文档改了」—— 版本号比对对此完全是瞎的，而日常开发中
 *     绝大多数改动都发生在同一个版本号内。
 *
 * 只在本地模式下有意义：远程产物由站点构建时重新生成，天然跟着源码走。
 */
function localStaleness() {
  if (!LOCAL_ROOT || !localPublic) return null;
  const now = Date.now();
  if (now - staleMemo.at < STALE_MEMO_MS) return staleMemo.value;

  const registryPath = join(localPublic, "registry.json");
  let value = null;
  if (existsSync(registryPath)) {
    const reasons = [];
    const artifactVersion = registryMeta.artifactVersion ?? readVersionOf(registryPath);
    if (localSourceVersion && artifactVersion && artifactVersion !== localSourceVersion) {
      reasons.push(`产物版本 ${artifactVersion}，源码已是 ${localSourceVersion}`);
    }
    const builtAt = mtimeMs(registryPath);
    const newest = newestSourceEdit();
    if (builtAt && newest && newest.mtimeMs > builtAt) {
      reasons.push(`${newest.file} 比产物新`);
    }
    if (reasons.length) value = { stale: true, reasons };
  }
  staleMemo = { at: now, value };
  return value;
}

function readVersionOf(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8")).version ?? null;
  } catch {
    return null;
  }
}

function mtimeMs(path) {
  try {
    return statSync(path).mtimeMs;
  } catch {
    return null;
  }
}

/** 源码侧最近一次改动：只看每个组件目录下的 <slug>.md 与 <slug>.types.ts —— props 表的真源。 */
function newestSourceEdit() {
  const dir = join(LOCAL_ROOT, "src");
  let newest = 0;
  let file = null;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return null;
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    for (const name of [`${entry.name}.md`, `${entry.name}.types.ts`]) {
      const at = mtimeMs(join(dir, entry.name, name));
      if (at && at > newest) {
        newest = at;
        file = `src/${entry.name}/${name}`;
      }
    }
  }
  return file ? { mtimeMs: newest, file } : null;
}

// --------------------------------------------------------------- 数据溯源 --

export const mode = LOCAL_ROOT ? "local" : "remote";
export const source = LOCAL_ROOT ? `local:${LOCAL_ROOT}` : `remote:${REMOTE_BASE}`;

/**
 * 单件安装端点的 URL —— **拿不出同源的就返回 null**。
 *
 * 此前 install_block 无论数据源是什么都给一条线上域名的命令。本地模式下这条命令是
 * 有害的：返回的源码来自工作区，而命令装的是**已发布**的那一份。两者今天恰好一致
 * 不代表明天一致 —— 你刚改完还没发版时，照着命令装回来的就是旧内容，而且没有任何提示。
 *
 * 规则：
 *   · 显式配了 HULIAN_REGISTRY_URL（自建镜像 / 本地起的 registry）→ 用它，那就是同源
 *   · 远程模式 → registry 自己声明的 itemUrl，退回当前 REMOTE_BASE
 *   · 本地模式且没配 → null，由调用方说明「源码在这儿、线上端点不是同一来源」
 */
export function itemUrlOf(registry, name) {
  if (process.env.HULIAN_REGISTRY_URL) return `${REMOTE_BASE}/r/${name}.json`;
  if (LOCAL_ROOT) return null;
  const template = typeof registry?.itemUrl === "string" ? registry.itemUrl : null;
  if (template?.includes("{name}")) return template.replace("{name}", name);
  return `${REMOTE_BASE}/r/${name}.json`;
}

/** 每个 tool 响应尾部都带这一行：数据从哪来、什么版本、什么时候生成的。 */
export function sourceLine() {
  const bits = [`数据源 ${source}`];
  if (registryMeta.version) bits.push(`registry v${registryMeta.version}`);
  if (registryMeta.generatedAt) bits.push(`产物生成于 ${registryMeta.generatedAt}`);
  if (fallbacks.size) bits.push(`⚠️ 已降级到远程：${[...fallbacks].join(", ")}`);
  if (mode === "remote" && TTL_MS > 0) bits.push(`缓存 ${Math.round(TTL_MS / 1000)}s`);
  const stale = localStaleness();
  if (stale) {
    // 措辞直接给命令 —— 光说「陈旧」调用方还得自己猜怎么修
    bits.push(
      `⚠️ registry 产物已陈旧（${stale.reasons.join("；")}），本次回答可能缺新增组件/prop，` +
        "请在仓库根跑 `pnpm llms-registry`",
    );
  }
  return bits.join(" · ");
}

export function sourceInfo() {
  return {
    mode,
    origin: registryMeta.origin ?? (LOCAL_ROOT ?? REMOTE_BASE),
    version: registryMeta.version,
    artifactVersion: registryMeta.artifactVersion,
    generatedAt: registryMeta.generatedAt,
    cacheTtlMs: TTL_MS,
    fallbacks: [...fallbacks],
    stale: localStaleness(),
  };
}
