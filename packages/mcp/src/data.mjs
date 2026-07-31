// 数据源：本地优先，远程兜底。
//
// 为什么两条路：这个 MCP server 有两种用法 ——
//   1. 在瑚琏 monorepo 里开发时：`HULIAN_UI_ROOT` 指向 packages/ui，直接读源码旁的
//      <slug>.md 与生成的 registry.json。永远最新、零网络、改完立刻生效。
//   2. 在任意下游项目里：读线上 registry（默认 hulianui.haloritual.com），带内存缓存。
//
// 两条路返回同一套结构，上层 tool 不需要知道数据从哪来。

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const REMOTE_BASE = process.env.HULIAN_REGISTRY_URL || "https://hulianui.haloritual.com";
const LOCAL_ROOT = process.env.HULIAN_UI_ROOT ? resolve(process.env.HULIAN_UI_ROOT) : null;

/** monorepo 根（LOCAL_ROOT 是 packages/ui，registry 产物在 apps/www/public） */
const localPublic = LOCAL_ROOT ? join(LOCAL_ROOT, "..", "..", "apps", "www", "public") : null;

const cache = new Map();

async function fetchJson(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`拉取失败 ${url}：HTTP ${res.status}`);
  const json = await res.json();
  cache.set(url, json);
  return json;
}

function readLocalJson(file) {
  const p = join(localPublic, file);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null;
}

/** 完整 registry 索引（items 已剥 content，适合放进 AI 上下文） */
export async function loadRegistry() {
  if (localPublic) {
    const local = readLocalJson("registry.json");
    if (local) return local;
  }
  return fetchJson(`${REMOTE_BASE}/registry.json`);
}

/** 单个 item 的完整载荷（含 files[].content） */
export async function loadItem(name) {
  if (localPublic) {
    const local = readLocalJson(join("r", `${name}.json`));
    if (local) return local;
  }
  return fetchJson(`${REMOTE_BASE}/r/${name}.json`);
}

/**
 * 组件的逐件文档（Props / Events / Slots / 示例）。
 * 本地直接读源码旁的 md —— 那是唯一真源，改完即刻生效，不必等 docs:all。
 */
export async function loadDoc(slug) {
  if (LOCAL_ROOT) {
    const p = join(LOCAL_ROOT, "src", slug, `${slug}.md`);
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  // 远程：文档站为每个组件单独出一份 /d/<slug>.md。
  // 刻意不去切 llms-full.txt —— 那份 1.1M 的合集只有 `<!-- ═══ -->` + `# Title`
  // 作分隔，slug 与 Title 还不同名（admin-layout / AdminLayout），解析既脆又浪费。
  try {
    return await loadText(`${REMOTE_BASE}/d/${slug}.md`);
  } catch {
    return null;
  }
}

async function loadText(url) {
  if (cache.has(url)) return cache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`拉取失败 ${url}：HTTP ${res.status}`);
  const text = await res.text();
  cache.set(url, text);
  return text;
}

/** 使用约束（固化的「主见」）。本地读 packages/ui/conventions.json，远程读文档站同名文件。 */
export async function loadConventions() {
  if (LOCAL_ROOT) {
    const p = join(LOCAL_ROOT, "conventions.json");
    if (existsSync(p)) return JSON.parse(readFileSync(p, "utf8"));
  }
  if (localPublic) {
    const local = readLocalJson("conventions.json");
    if (local) return local;
  }
  return fetchJson(`${REMOTE_BASE}/conventions.json`);
}

/** 本地模式下可枚举的组件 slug（用于校验名字，给出「你是不是想找 X」） */
export function localSlugs() {
  if (!LOCAL_ROOT) return null;
  const dir = join(LOCAL_ROOT, "src");
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((d) => existsSync(join(dir, d, `${d}.md`)));
}

export const source = LOCAL_ROOT ? `local:${LOCAL_ROOT}` : `remote:${REMOTE_BASE}`;
