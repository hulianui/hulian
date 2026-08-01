import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { RegistryItem, RegistryMeta } from "./install-model";

// 构建期读取站点自己产出的 registry —— 只在 server 组件里调用（output:export 下就是构建期）。
//
// 刻意读 public/ 下的**成品文件**而不是重新解析 _meta.ts：详情页展示的必须与
// shadcn CLI 真正会拉到的那份字节一致。若产物缺失就直接抛，让构建红掉；
// 静默降级成「面板不显示」等于把一个数据缺失伪装成设计。
// （`pnpm --filter www build` 的 pregen 步骤会先生成 /r，CI 亦然。）

const PUBLIC_DIR = join(process.cwd(), "public");

export function readRegistryMeta(): RegistryMeta {
  const raw = JSON.parse(readFileSync(join(PUBLIC_DIR, "registry.json"), "utf8"));
  return { version: raw.version, itemUrl: raw.itemUrl, install: raw.install };
}

export function readRegistryItem(name: string): RegistryItem {
  return JSON.parse(readFileSync(join(PUBLIC_DIR, "r", `${name}.json`), "utf8")) as RegistryItem;
}

/** 递归依赖的展示标题：block-data-table → 「数据表格页」。 */
export function readDepTitles(names: string[]): Record<string, string> {
  const titles: Record<string, string> = {};
  for (const name of names) {
    titles[name] = readRegistryItem(name).title ?? name;
  }
  return titles;
}

/**
 * 递归依赖各自会写入哪些文件 —— 详情页「文件」树用。
 * 同样只读产物，不按 slug 拼路径：目标路径的形状由生成器决定，猜出来的迟早对不上。
 */
export function readDepFiles(names: string[]): Array<{ name: string; title: string; targets: string[] }> {
  return names.map((name) => {
    const item = readRegistryItem(name);
    return {
      name,
      title: item.title ?? name,
      targets: (item.files ?? []).map((f) => f.target || f.path).filter(Boolean),
    };
  });
}
