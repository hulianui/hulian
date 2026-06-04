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

export const fileTreeShowcase: ShowcaseSpec = {
  controls: [],
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
