"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TreeSelect } from "./tree-select";
import type { TreeNode } from "../tree/tree-core";

const NODES: TreeNode[] = [
  {
    key: "zhejiang",
    label: "浙江",
    children: [
      {
        key: "hangzhou",
        label: "杭州",
        children: [
          { key: "xihu", label: "西湖区" },
          { key: "yuhang", label: "余杭区" },
        ],
      },
      { key: "ningbo", label: "宁波" },
    ],
  },
  {
    key: "jiangsu",
    label: "江苏",
    children: [
      { key: "nanjing", label: "南京" },
      { key: "suzhou", label: "苏州" },
    ],
  },
];

function Single() {
  const [v, setV] = useState<string | string[]>("");
  return (
    <div className="w-72">
      <TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="选择地区" searchable />
    </div>
  );
}
function Multi() {
  const [v, setV] = useState<string | string[]>([]);
  return (
    <div className="w-72">
      <TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="多选地区" />
    </div>
  );
}

export const treeSelectShowcase: ShowcaseSpec = {
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple（多选）" },
    { prop: "searchable", type: "boolean", defaultValue: true, label: "searchable" },
  ],
  states: [
    { name: "单选 + 搜索", render: () => <Single /> },
    { name: "多选（checkable 父子级联）", render: () => <Multi /> },
  ],
  renderWithProps: (p) => {
    const Demo = (p.multiple as boolean) ? Multi : Single;
    return <Demo />;
  },
  toCode: (p) =>
    `<TreeSelect\n  nodes={nodes}${p.multiple ? "\n  multiple" : ""}${p.searchable ? "\n  searchable" : ""}\n  value={value}\n  onChange={setValue}\n/>`,
};
