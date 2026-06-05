import { describe, it, expect } from "vitest";
import { filterFileTree } from "./file-tree-core";
import type { FileNode } from "./file-tree.types";

const nodes: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "button.tsx", type: "file" },
      { name: "card.tsx", type: "file" },
    ],
  },
  {
    name: "docs",
    type: "folder",
    children: [{ name: "readme.md", type: "file" }],
  },
];

describe("filterFileTree", () => {
  it("空 query 返回空集（不过滤）", () => {
    const r = filterFileTree(nodes, "");
    expect(r.matchedPaths.size).toBe(0);
    expect(r.autoExpandPaths.size).toBe(0);
  });
  it("命中叶 → 叶 path 进 matched，祖先 path 进 autoExpand", () => {
    const r = filterFileTree(nodes, "button");
    expect(r.matchedPaths.has("src/button.tsx")).toBe(true);
    expect(r.matchedPaths.has("src/card.tsx")).toBe(false);
    expect(r.autoExpandPaths.has("src")).toBe(true);
    expect(r.autoExpandPaths.has("docs")).toBe(false);
  });
  it("命中文件夹名 → 文件夹自身 matched 且 autoExpand（展开看子项）", () => {
    const r = filterFileTree(nodes, "docs");
    expect(r.matchedPaths.has("docs")).toBe(true);
    expect(r.autoExpandPaths.has("docs")).toBe(true);
  });
  it("大小写不敏感", () => {
    expect(filterFileTree(nodes, "BUTTON").matchedPaths.has("src/button.tsx")).toBe(true);
  });
});
