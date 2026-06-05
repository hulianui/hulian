import type { FileNode } from "./file-tree.types";

/**
 * 过滤文件树：返回命中节点 path 与需自动展开（祖先 + 命中夹自身）的 path。
 * path 为 name 拼接（与 FileTree 内部一致）。仿 tree-core.ts 的 filterTree。
 */
export function filterFileTree(
  nodes: FileNode[],
  query: string,
): { matchedPaths: Set<string>; autoExpandPaths: Set<string> } {
  const matchedPaths = new Set<string>();
  const autoExpandPaths = new Set<string>();
  const q = query.trim().toLowerCase();
  if (!q) return { matchedPaths, autoExpandPaths };

  const dfs = (list: FileNode[], parentPath: string, ancestors: string[]): boolean => {
    let anyMatch = false;
    for (const node of list) {
      const path = parentPath ? `${parentPath}/${node.name}` : node.name;
      const selfMatch = node.name.toLowerCase().includes(q);
      const childMatch = node.children?.length
        ? dfs(node.children, path, [...ancestors, path])
        : false;
      if (selfMatch) matchedPaths.add(path);
      if (selfMatch || childMatch) {
        anyMatch = true;
        // 命中节点的祖先全部自动展开
        if (selfMatch) for (const a of ancestors) autoExpandPaths.add(a);
        // 命中文件夹（子孙命中或自身命中且有子）展开自身
        if (childMatch) autoExpandPaths.add(path);
        if (selfMatch && node.children?.length) autoExpandPaths.add(path);
      }
    }
    return anyMatch;
  };
  dfs(nodes, "", []);
  return { matchedPaths, autoExpandPaths };
}
