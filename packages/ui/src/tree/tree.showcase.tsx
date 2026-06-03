"use client";
import { Folder } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Tree } from "./tree";
import type { TreeNode } from "./tree-core";

const NODES: TreeNode[] = [
  {
    key: "design",
    label: "设计",
    icon: <Folder />,
    children: [
      { key: "tokens", label: "Tokens" },
      { key: "theme", label: "主题" },
      { key: "motion", label: "动效", disabled: true },
    ],
  },
  {
    key: "components",
    label: "组件",
    icon: <Folder />,
    children: [
      {
        key: "form",
        label: "表单",
        children: [
          { key: "input", label: "Input" },
          { key: "select", label: "Select" },
        ],
      },
      {
        key: "feedback",
        label: "反馈",
        children: [
          { key: "alert", label: "Alert" },
          { key: "toast", label: "Toast" },
        ],
      },
    ],
  },
  { key: "docs", label: "文档" },
];

function Box({ children }: { children: React.ReactNode }) {
  return <div className="w-72 rounded-[var(--radius)] border border-border bg-surface p-2">{children}</div>;
}

export const treeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "checkable", type: "boolean", defaultValue: false, label: "checkable（复选）" },
    { prop: "showLine", type: "boolean", defaultValue: false, label: "showLine（连接线）" },
    { prop: "searchable", type: "boolean", defaultValue: false, label: "searchable（搜索）" },
  ],
  states: [
    {
      name: "默认（单选 · 展开两枝）",
      render: () => (
        <Box>
          <Tree nodes={NODES} defaultExpandedKeys={["design", "components"]} defaultSelectedKeys={["theme"]} />
        </Box>
      ),
    },
    {
      name: "checkable（父子级联半选）",
      render: () => (
        <Box>
          <Tree nodes={NODES} checkable defaultExpandedKeys={["design", "components", "form"]} defaultCheckedKeys={["tokens"]} />
        </Box>
      ),
    },
    {
      name: "showLine（连接线）",
      render: () => (
        <Box>
          <Tree nodes={NODES} showLine defaultExpandedKeys={["components", "form"]} />
        </Box>
      ),
    },
    {
      name: "searchable（树内搜索）",
      render: () => (
        <Box>
          <Tree nodes={NODES} searchable searchPlaceholder="搜索组件" />
        </Box>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Box>
      <Tree
        nodes={NODES}
        defaultExpandedKeys={["design", "components"]}
        defaultSelectedKeys={["theme"]}
        checkable={p.checkable as boolean}
        showLine={p.showLine as boolean}
        searchable={p.searchable as boolean}
      />
    </Box>
  ),
  toCode: (p) =>
    `<Tree\n  nodes={nodes}\n  defaultExpandedKeys={["design", "components"]}${p.checkable ? "\n  checkable" : ""}${p.showLine ? "\n  showLine" : ""}${p.searchable ? "\n  searchable" : ""}\n/>`,
};
