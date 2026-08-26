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

import { AsyncLocalStorage } from "node:async_hooks";
import { createHash } from "node:crypto";
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
  if (hit) {
    // 缓存命中也要登记溯源：这次回答确实用的就是这份字节，不能因为没走网络就不作声。
    noteArtifact(remoteArtifactName(url), hit.digest);
    return hit;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`拉取失败 ${url}：HTTP ${res.status}`);
  // 先拿原文再解析：摘要必须算在**收到的字节**上。res.json() 把字节吃掉后，
  // 拿解析结果重新序列化算出来的是另一样东西（键序、空白都变了）。
  const body = await res.text();
  const value = json ? JSON.parse(body) : body;
  const entry = {
    value,
    at: Date.now(),
    generatedAt: res.headers.get("last-modified") || null,
    digest: sha256(body),
  };
  if (TTL_MS > 0) cache.set(url, entry);
  noteArtifact(remoteArtifactName(url), entry.digest);
  return entry;
}

function readLocalJson(file) {
  if (!localPublic) return null;
  const path = join(localPublic, file);
  if (!existsSync(path)) return null;
  const raw = readLocalText(file.replace(/\\/g, "/"), path);
  return { value: JSON.parse(raw), path, generatedAt: mtime(path) };
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

// --------------------------------------------------------- 产物字节身份 --

/**
 * 「本次回答依据的产物**就是这一份字节**」—— 版本号说不出这句话。
 *
 * 版本只能证明「同一次发版」，证明不了「同一份内容」。本文件上面那套新鲜度判据自己就
 * 承认：同一个版本号内产物可以被重新生成（改完组件跑 `pnpm llms-registry`，版本不变而
 * 内容全变），线上产物也随文档站每次构建重写。对只是读一读的调用方这无所谓；对拿
 * llms-props.json 做**受约束生成**、事后还要复核「我当时照着的那份 props 到底是哪一份」
 * 的调用方，版本号给不出答案（#332）。
 *
 * 所以每条响应的 source 里带上这次真正读到的产物的 sha256。三条纪律：
 *   · 算在**读到/收到的字节**上，不是解析后重新序列化的结果 —— 后者键序与空白都变了，
 *     拿去跟仓库里的文件比对会永远对不上，那种摘要还不如没有。
 *   · 只登记**这一次调用真的读过**的产物，不让别的请求加载的东西冒充这次回答的依据。
 *     作用域用 AsyncLocalStorage 而不是"每次调用开头清空一个模块级 Map"：MCP 允许多个
 *     tool 调用同时在飞，清空式方案会让后到的请求把前一个在飞请求的记录抹掉 —— 那种
 *     错法不会报错，只会让溯源静默缺项，正是这个功能最不能出的错。
 *   · 源码 md 与产物 md 用不同的名字（`src/x/x.md` vs `d/x.md`）—— 它们本来就是两份
 *     不同的文件，共用一个名字等于假装它们可以互换（对照 docComesFromSource）。
 */
const digestMemo = new Map();
const artifactScope = new AsyncLocalStorage();

/** 把一次 tool 调用跑在自己的溯源作用域里。作用域外加载产物不登记，也不会报错。 */
export function withArtifactScope(fn) {
  return artifactScope.run(new Map(), fn);
}

const sha256 = (text) => `sha256:${createHash("sha256").update(text, "utf8").digest("hex")}`;

function noteArtifact(name, digest) {
  if (name && digest) artifactScope.getStore()?.set(name, digest);
}

/** 远程 URL → 产物名（去掉站点前缀），好让两种数据源用同一套名字。 */
function remoteArtifactName(url) {
  return url.startsWith(`${REMOTE_BASE}/`) ? url.slice(REMOTE_BASE.length + 1) : url;
}

/**
 * 读一份本地产物并登记它的字节摘要。
 *
 * 摘要按 (mtimeMs, size) memo：本地模式每次请求都重读 1.4M 的 llms-props.json，没必要
 * 每次再哈希一遍；产物一被重新生成这两个数就变，memo 自然失效。它是**缓存键不是证明** ——
 * 要骗过它得做到毫秒级 mtime 与字节数都不变而内容变了，现实里不会发生。
 */
function readLocalText(name, path) {
  const raw = readFileSync(path, "utf8");
  const stat = statSync(path);
  const memo = digestMemo.get(path);
  const digest =
    memo && memo.mtimeMs === stat.mtimeMs && memo.size === stat.size ? memo.digest : sha256(raw);
  digestMemo.set(path, { mtimeMs: stat.mtimeMs, size: stat.size, digest });
  noteArtifact(name, digest);
  return raw;
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
    if (existsSync(path)) return readLocalText(`src/${slug}/${slug}.md`, path);
    const generated = localPublic ? join(localPublic, "d", `${slug}.md`) : null;
    if (generated && existsSync(generated)) return readLocalText(`d/${slug}.md`, generated);
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

/**
 * 这一件的正文是不是直接来自源码旁的 md（而非生成产物 / 线上副本）。
 *
 * 版本漂移时两种来源的处方完全不同，不能笼统说一句「产物旧了」：源码那份与 LOCAL_ROOT
 * 的 package.json 天然同版，正文是可信的，旧的只是「有哪些组件」这张清单；产物那份才是
 * 整篇内容都属于另一个版本、必须回去看 node_modules 源码的那种（#246）。
 */
export function docComesFromSource(slug) {
  return Boolean(LOCAL_ROOT && existsSync(join(LOCAL_ROOT, "src", slug, `${slug}.md`)));
}

/**
 * 机器可读的 props 目录（llms-props.json）。
 *
 * 与 loadDoc 的分工：loadDoc 给人和 LLM 读的 markdown，这份给**受约束生成**用 ——
 * 逐 prop 的 kind / 枚举取值 / 默认值，外加一张 exportIndex（导出名 → 组件）。
 * 消费方不必再去解析 markdown 表格，也就不会再撞上转义竖线与别名不展开那两个坑
 * （hulianui/hulian#102 #103 #105）。
 */
export async function loadPropsCatalog() {
  if (LOCAL_ROOT) {
    const local = readLocalJson("llms-props.json");
    if (local) return noteArtifactVersion(local.value);
    missingLocal("llms-props.json", "先在仓库根跑 `pnpm llms-registry`（或 `pnpm docs:all`）生成");
  }
  return noteArtifactVersion((await fetchRemote(`${REMOTE_BASE}/llms-props.json`)).value);
}

/**
 * 记下产物自报的版本。llms-props.json 与 registry.json 由同一次生成写出、带同一个版本号，
 * 所以只走 props 目录的调用（get_component_doc 的 json 分支）也能据此做版本比对 ——
 * 消费方项目里没有本地 registry 文件可读，这是那条路上唯一的来源（#246）。
 */
function noteArtifactVersion(payload) {
  if (payload?.version && !registryMeta.artifactVersion) {
    registryMeta = { ...registryMeta, artifactVersion: payload.version };
  }
  return payload;
}

/** 使用约束（固化的「主见」）。本地读 packages/ui/conventions.json，远程读文档站同名文件。 */
export async function loadConventions() {
  if (LOCAL_ROOT) {
    const path = join(LOCAL_ROOT, "conventions.json");
    if (existsSync(path)) return JSON.parse(readLocalText("conventions.json", path));
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
 * 产物与源码的**版本**不一致 —— 与下面 localStaleness 的 mtime 判据是两件事，
 * 严重度也不同，所以 #246 起分开表达：
 *
 *   · 版本不一致 = 回答用的是**另一个版本**的 props 与组件清单。调用方据此写出的代码，
 *     在实装版本上可能根本没有那个 prop，也可能漏掉当版新增的整个组件。
 *     它走 error 级横幅、贴在响应最顶上（见 staleBanner）。
 *   · 同版本内文档改过（mtime）= 日常开发的常态，脚注提醒就够。把它也提成 error，
 *     只会让人很快学会忽略所有横幅，真正的版本漂移反而被淹掉。
 *
 * 两种数据源都要判，这是 #246 相对 #48 扩出来的一格：
 *   · 本地产物：工作区 package.json vs apps/www/public/registry.json
 *   · 远程兜底：**实装**的 node_modules/@hulianui/ui 版本 vs 线上产物的版本 ——
 *     消费方项目正是这条路径（HULIAN_UI_ROOT 指到 node_modules + 允许远程兜底），
 *     而此前 localStaleness 一上来就 `if (!localPublic) return null`，
 *     消费方那侧的版本漂移从来没有被检查过。
 */
/**
 * 本次回答所依据的产物是哪一版。
 *
 * 不能只看 registryMeta：有些 tool（`get_component_doc({format:"json"})` 走 llms-props.json、
 * 逐件 md 直读源码）压根不加载 registry，那条路上 registryMeta 一直是空的，版本比对会
 * 静默不做 —— 而那正是「查 props」最常走的一条路。所以本地模式下退回直接读产物文件。
 */
function artifactVersionNow() {
  if (registryMeta.artifactVersion) return registryMeta.artifactVersion;
  return localPublic ? readVersionOf(join(localPublic, "registry.json")) : null;
}

export function versionSkew() {
  const artifact = artifactVersionNow();
  if (!localSourceVersion || !artifact || artifact === localSourceVersion) return null;
  return { artifact, source: localSourceVersion };
}

/**
 * 版本不一致时贴在响应**最顶部**的 error 级横幅（#246）。一致时返回空串。
 *
 * 为什么不顺手把 MCP 的 `isError` 也置上：那会让客户端把整条响应当成工具故障丢掉，
 * 调用方一个字都拿不到 —— 而它此刻最需要的恰恰是「拿到内容 + 知道该去哪儿核对」。
 * 所以是「error 级的话术 + 完整正文 + 明确的兜底路径」，不是 isError。
 */
export function staleBanner() {
  const skew = versionSkew();
  if (!skew) return "";
  const lines = [
    `❌ 错误 · 数据源与实际源码不是同一个版本：本次内容来自 registry 产物 **v${skew.artifact}**，而这里的 @hulianui/ui 源码是 **v${skew.source}**。`,
    `下面的 props / 组件清单属于 v${skew.artifact}，可能缺少 v${skew.source} 新增的组件与 prop，也可能还留着已改名或已删除的旧签名。**先按下面的办法核对，再写代码。**`,
  ];
  if (LOCAL_ROOT && localPublic && existsSync(join(localPublic, "registry.json"))) {
    lines.push(
      "· 在瑚琏仓库里开发：在仓库根跑 `pnpm llms-registry`（或 `pnpm docs:all`）重新生成产物后重试。",
    );
  }
  lines.push(
    `· 在消费方项目里：**以 node_modules/@hulianui/ui 里的源码为准** —— ` +
      `组件文档 \`node_modules/@hulianui/ui/src/<slug>/<slug>.md\`，props 真源 ` +
      `\`node_modules/@hulianui/ui/src/<slug>/<slug>.types.ts\`。这两份随 npm 包一起发布，` +
      `永远与实装的 v${skew.source} 同版；本 server 的产物则不是。`,
  );
  return lines.join("\n");
}

/**
 * 本地产物是否已经落后于源码 —— 只管 **mtime** 这一条判据：版本号没变但组件文档改了。
 * 版本号比对对此完全是瞎的，而日常开发中绝大多数改动都发生在同一个版本号内。
 * 版本号那条判据已经上移到 versionSkew（#246）。
 *
 * 只在「本地源码 + 本地产物」这一种组合下有意义：远程产物由站点构建时重新生成，
 * 拿它的 mtime 跟本地源码比没有意义（比也只会一直报陈旧）。
 */
function localStaleness() {
  if (!LOCAL_ROOT || !localPublic) return null;
  const now = Date.now();
  if (now - staleMemo.at < STALE_MEMO_MS) return staleMemo.value;

  const registryPath = join(localPublic, "registry.json");
  let value = null;
  if (existsSync(registryPath)) {
    const reasons = [];
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
  // 「registry v…」这个说法描述的是**产物**，所以它只能填产物自报的版本号。
  // #47 让 registryMeta.version 在本地模式下取源码版本（为了不报假 skew），而这一行照抄了
  // 那个字段 —— 于是产物停在 0.37.0 时，顶上仍写着 registry v0.39.0，脚注却说产物是
  // 0.37.0，同一行里自相矛盾，读的人（和读的模型）只会信前面那个数（#246）。
  // 两者不同就把两个数都写出来，别再用一个标签盖住两种含义。
  const skew = versionSkew();
  const artifact = skew?.artifact ?? registryMeta.artifactVersion;
  if (skew) bits.push(`产物 registry v${skew.artifact} ≠ 源码 v${skew.source}`);
  else if (artifact) bits.push(`registry v${artifact}`);
  else if (registryMeta.version) bits.push(`源码 v${registryMeta.version}`);
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
    // version 的口径不动：它是「这份检出/这次安装**实际是什么版本**」，validate 拿它跟
    // 消费方实装的 @hulianui/ui 比 skew（#47）。产物那一版单独放在 artifactVersion，
    // 两者不一致时由 versionSkew 明说，不再让一个字段承担两种含义（#246）。
    version: registryMeta.version,
    artifactVersion: artifactVersionNow(),
    sourceVersion: localSourceVersion,
    versionSkew: versionSkew(),
    generatedAt: registryMeta.generatedAt,
    cacheTtlMs: TTL_MS,
    // 本次调用真正读到的产物的字节摘要（见上面「产物字节身份」）。一个产物都没读就是空
    // 对象 —— 那句话本身也是信息：这条回答不来自任何带版本的产物。
    artifactDigests: Object.fromEntries(
      [...(artifactScope.getStore() ?? [])].sort((a, b) => (a[0] < b[0] ? -1 : 1)),
    ),
    fallbacks: [...fallbacks],
    stale: localStaleness(),
  };
}
