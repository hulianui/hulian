// 区块/页面「安装与接入」面板的数据模型 —— 纯函数，输入是 registry 真源，无 fs、无网络。
//
// 真源就是站点自己发出去的 `/r/<item>.json`（由 scripts/gen-llms-registry.mjs 生成）。
// 详情页**读同一份文件**，而不是另抄一套硬编码 —— 页面上写的和 shadcn CLI 实际会装的
// 因此不可能对不上（一致性由 install-model.test.ts 对着真实产物断言）。
//
// 同一套推导 MCP 的 install_block 也在做（packages/mcp/src/index.mjs）；两边共享的是
// registry 数据，不是代码——各自消费同一份 JSON，谁都不依赖谁。

export type ReplaceKind = "assets" | "copy" | "mock-data" | "navigation" | "event-handlers";

export interface RegistryItemFile {
  path: string;
  type: string;
  target?: string;
  content?: string;
}

export interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  categories?: string[];
  dependencies?: string[];
  registryDependencies?: string[];
  files?: RegistryItemFile[];
  meta?: {
    kind?: string;
    selfContained?: boolean;
    installation?: {
      providers?: string[];
      replace?: ReplaceKind[];
      slots?: string[];
    };
    source?: string;
  };
}

/** registry.json 的头部字段（供拼安装 URL 与展示版本）。 */
export interface RegistryMeta {
  version: string;
  /** 形如 https://…/r/{name}.json —— 站点唯一的单件端点模板。 */
  itemUrl: string;
  install: string;
}

export interface RegistryDepRef {
  /** registry item 名，如 block-data-table。 */
  name: string;
  url: string;
  /** 站内详情页；非 block-/page- 前缀的（组件内部模块）为 null。 */
  href: string | null;
  /** 站内可读标题，由调用方按 slug 提供；缺则回落 name。 */
  title: string;
}

export interface InstallModel {
  name: string;
  /** 一键复制的安装命令。 */
  command: string;
  /** registry 单件端点（面板上也展示，方便手工 curl / 喂给别的 CLI）。 */
  itemUrl: string;
  version: string;
  /** 会被递归安装的 registry 依赖。 */
  registryDeps: RegistryDepRef[];
  /** 写入消费方工程的目标文件。 */
  targets: string[];
  /** 额外 npm 依赖（不含 react/react-dom/tailwindcss 这类通用 peer）。 */
  npmDeps: string[];
  providers: string[];
  replace: ReplaceKind[];
  slots: string[];
  /** 安装后针对上面 targets 的门禁命令。 */
  guardCommand: string;
  /** 自包含 = 没有 registry 依赖，装完即用。 */
  selfContained: boolean;
}

export const REPLACE_LABEL: Record<ReplaceKind, string> = {
  copy: "文案",
  "mock-data": "示例数据",
  assets: "图片 / 素材",
  navigation: "导航与路由",
  "event-handlers": "事件处理",
};

/** 单件端点 URL：从 registry.json 的 itemUrl 模板派生，不在站里另写一份域名。 */
export function itemUrlOf(registry: RegistryMeta, name: string): string {
  return registry.itemUrl.replace("{name}", name);
}

/** registry 依赖 URL → item 名（.../r/block-data-table.json → block-data-table）。 */
export function depNameOf(url: string): string {
  return url.replace(/\.json$/, "").split("/").pop() ?? url;
}

/** item 名 → 站内详情页。只有 block-/page- 前缀在站里有页面；组件内部模块没有。 */
export function depHrefOf(name: string): string | null {
  if (name.startsWith("block-")) return `/blocks/${name.slice("block-".length)}`;
  if (name.startsWith("page-")) return `/pages/${name.slice("page-".length)}`;
  return null;
}

export function buildInstallModel(
  item: RegistryItem,
  registry: RegistryMeta,
  /** item 名 → 中文标题，用于把 block-data-table 显示成「数据表格页」。 */
  titles: Record<string, string> = {},
): InstallModel {
  const installation = item.meta?.installation ?? {};
  const targets = (item.files ?? []).map((f) => f.target || f.path).filter(Boolean);
  const registryDeps = (item.registryDependencies ?? []).map((url) => {
    const name = depNameOf(url);
    return { name, url, href: depHrefOf(name), title: titles[name] ?? name };
  });

  return {
    name: item.name,
    command: `npx shadcn@latest add ${itemUrlOf(registry, item.name)}`,
    itemUrl: itemUrlOf(registry, item.name),
    version: registry.version,
    registryDeps,
    targets,
    npmDeps: item.dependencies ?? [],
    providers: installation.providers ?? [],
    replace: installation.replace ?? [],
    slots: installation.slots ?? [],
    // 装完就能验：路径正是上面列出的目标文件，不用消费方自己猜要扫哪儿。
    guardCommand: targets.length ? `npx -y @hulianui/guard ${targets.join(" ")}` : "",
    selfContained: registryDeps.length === 0,
  };
}
