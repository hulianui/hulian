import type { AppLauncherItem, AppLauncherSection } from "./app-launcher.types";

// 启动台的筛选/分节纯逻辑 —— 组件只管画，「按关键词命中什么、怎么分组」在这里且可单测。

/** 取用于匹配的文本：label 是字符串才算，否则靠 keywords（图标类 label 常是节点）。 */
function haystack(item: AppLauncherItem): string[] {
  const out: string[] = [];
  if (typeof item.label === "string") out.push(item.label);
  if (item.keywords) out.push(...item.keywords);
  return out;
}

/**
 * 单项是否命中查询。大小写不敏感、按子串匹配（中文没有词边界，前缀匹配会漏「云盘」搜「盘」）。
 * 查询为空视作全部命中。
 */
export function matchApp(item: AppLauncherItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack(item).some((t) => t.toLowerCase().includes(q));
}

/** 先按分类过滤（category 为空 = 全部），再按关键词过滤。顺序不影响结果，但先分类更省匹配。 */
export function filterApps(
  items: AppLauncherItem[],
  options: { query?: string; category?: string } = {},
): AppLauncherItem[] {
  const { query = "", category } = options;
  return items.filter(
    (item) => (!category || item.category === category) && matchApp(item, query),
  );
}

/**
 * 按 `section` 把**连续**同节的项归组——不做全局重排，调用方给的顺序就是最终顺序
 * （启动台里「最近使用」在最前是靠数组顺序表达的，重排会把它打散）。
 * 无 section 的项归入 key 为 `""` 的匿名组。
 */
export function groupSections(items: AppLauncherItem[]): AppLauncherSection[] {
  const groups: AppLauncherSection[] = [];
  for (const item of items) {
    const key = item.section ?? "";
    const last = groups.at(-1);
    if (last && last.key === key) last.items.push(item);
    else groups.push({ key, items: [item] });
  }
  return groups;
}
