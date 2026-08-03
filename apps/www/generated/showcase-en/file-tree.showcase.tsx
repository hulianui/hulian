"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { FileTree } from "../../../../packages/ui/src/file-tree/file-tree";
import type { FileNode } from "../../../../packages/ui/src/file-tree/file-tree.types";
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
    return (<div className="w-full max-w-xs">
      <FileTree nodes={TREE} selectedPath={sel} onSelect={(_, path) => setSel(path)}/>
    </div>);
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
            title: "Basic usage",
            description: "nodes data-driven rendering; folder foldable, defaultExpanded controlled initial expansion.",
            code: `<FileTree
  nodes={[
    { name: "app", type: "folder", defaultExpanded: true, children: [
      { name: "page.tsx", type: "file" },
      { name: "layout.tsx", type: "file" },
    ] },
    { name: "package.json", type: "file" },
  ]}
/>`,
            render: () => (<div className="w-full max-w-xs">
          <FileTree nodes={SMALL_TREE}/>
        </div>),
        },
        {
            title: "Change status icon",
            description: "Node status renders git customary A/M/D/U/R colored letter subscripts.",
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
            render: () => (<div className="w-full max-w-xs">
          <FileTree nodes={TREE}/>
        </div>),
        },
        {
            title: "Select + Search",
            description: "selectedPath Controlled highlighting is currently selected; searchable enables in-tree search (automatically expands when an ancestor is hit).",
            code: `<FileTree
  nodes={nodes}
  searchable
  selectedPath={sel}
  onSelect={(node, path) => setSel(path)}
/>`,
            render: () => (<div className="w-full max-w-xs">
          <FileTree nodes={TREE} searchable defaultExpandedPaths={["src", "src/components"]}/>
        </div>),
        },
    ],
    states: [
        { name: "Change status tree (selectable/collapsible)", render: () => <Demo /> },
        {
            name: "Pure structure (no state subscript)",
            render: () => (<div className="w-full max-w-xs">
          <FileTree nodes={[
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
                ]}/>
        </div>),
        },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<FileTree
  nodes={[{ name: "src", type: "folder", defaultExpanded: true, children: [
    { name: "index.ts", type: "file", status: "modified" }] }]}
  selectedPath={sel}
  onSelect={(node, path) => setSel(path)}
/>`,
};
