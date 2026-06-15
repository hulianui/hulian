"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { FileTree } from "./file-tree";
import type { FileNode } from "./file-tree.types";

const TREE: FileNode[] = [
  {
    name: "src",
    type: "folder",
    defaultExpanded: true,
    children: [
      {
        name: "components",
        type: "folder",
        defaultExpanded: true,
        children: [
          { name: "task-runner.tsx", type: "file", status: "added" },
          { name: "log-viewer.tsx", type: "file", status: "added" },
          { name: "button.tsx", type: "file", status: "modified" },
        ],
      },
      { name: "index.ts", type: "file", status: "modified" },
      { name: "legacy.ts", type: "file", status: "deleted" },
    ],
  },
  {
    name: "docs",
    type: "folder",
    children: [{ name: "draft.md", type: "file", status: "untracked" }],
  },
  { name: "README.md", type: "file", status: "renamed" },
];

function Demo() {
  const [sel, setSel] = useState("src/components/task-runner.tsx");
  return (
    <div className="w-full max-w-xs">
      <FileTree nodes={TREE} selectedPath={sel} onSelect={(_, path) => setSel(path)} />
    </div>
  );
}

const SMALL_TREE: FileNode[] = [
  {
    name: "app",
    type: "folder",
    defaultExpanded: true,
    children: [
      { name: "page.tsx", type: "file" },
      { name: "layout.tsx", type: "file" },
    ],
  },
  { name: "package.json", type: "file" },
];

export const fileTreeShowcase: ShowcaseSpec = {
  controls: [],
  examples: [
    {
      title: "基础用法",
      description: "nodes 数据驱动渲染；folder 可折叠，defaultExpanded 控初始展开。",
      code: `<FileTree
  nodes={[
    { name: "app", type: "folder", defaultExpanded: true, children: [
      { name: "page.tsx", type: "file" },
      { name: "layout.tsx", type: "file" },
    ] },
    { name: "package.json", type: "file" },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-xs">
          <FileTree nodes={SMALL_TREE} />
        </div>
      ),
    },
    {
      title: "改动状态角标",
      description: "节点 status 渲染 git 习惯的 A/M/D/U/R 彩色字母角标。",
      code: `<FileTree
  nodes={[
    { name: "src", type: "folder", defaultExpanded: true, children: [
      { name: "task-runner.tsx", type: "file", status: "added" },
      { name: "button.tsx", type: "file", status: "modified" },
      { name: "legacy.ts", type: "file", status: "deleted" },
    ] },
    { name: "README.md", type: "file", status: "renamed" },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-xs">
          <FileTree nodes={TREE} />
        </div>
      ),
    },
    {
      title: "选中 + 搜索",
      description: "selectedPath 受控高亮当前选中；searchable 开启树内搜索（命中祖先自动展开）。",
      code: `<FileTree
  nodes={nodes}
  searchable
  selectedPath={sel}
  onSelect={(node, path) => setSel(path)}
/>`,
      render: () => (
        <div className="w-full max-w-xs">
          <FileTree nodes={TREE} searchable defaultExpandedPaths={["src", "src/components"]} />
        </div>
      ),
    },
  ],
  states: [
    { name: "改动状态树（可选中 / 可折叠）", render: () => <Demo /> },
    {
      name: "纯结构（无状态角标）",
      render: () => (
        <div className="w-full max-w-xs">
          <FileTree
            nodes={[
              {
                name: "app",
                type: "folder",
                defaultExpanded: true,
                children: [
                  { name: "page.tsx", type: "file" },
                  { name: "layout.tsx", type: "file" },
                ],
              },
              { name: "package.json", type: "file" },
            ]}
          />
        </div>
      ),
    },
  ],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<FileTree
  nodes={[{ name: "src", type: "folder", defaultExpanded: true, children: [
    { name: "index.ts", type: "file", status: "modified" }] }]}
  selectedPath={sel}
  onSelect={(node, path) => setSel(path)}
/>`,
};
