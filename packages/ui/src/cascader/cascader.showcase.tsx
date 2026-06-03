"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Cascader } from "./cascader";
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
          { key: "binjiang", label: "滨江区" },
        ],
      },
      { key: "ningbo", label: "宁波", children: [{ key: "haishu", label: "海曙区" }] },
    ],
  },
  {
    key: "jiangsu",
    label: "江苏",
    children: [{ key: "nanjing", label: "南京", children: [{ key: "xuanwu", label: "玄武区" }] }],
  },
];

function Demo({ expandTrigger, changeOnSelect }: { expandTrigger?: "click" | "hover"; changeOnSelect?: boolean }) {
  const [v, setV] = useState<string[]>([]);
  return (
    <div className="w-72">
      <Cascader
        nodes={NODES}
        value={v}
        onChange={(p) => setV(p)}
        expandTrigger={expandTrigger}
        changeOnSelect={changeOnSelect}
        placeholder="选择地区"
      />
    </div>
  );
}

export const cascaderShowcase: ShowcaseSpec = {
  controls: [
    { prop: "expandTrigger", type: "select", options: ["click", "hover"], defaultValue: "click", label: "expandTrigger" },
    { prop: "changeOnSelect", type: "boolean", defaultValue: false, label: "changeOnSelect（任意层可选）" },
  ],
  states: [
    { name: "默认（点击逐级 · 叶子提交）", render: () => <Demo /> },
    { name: "hover 展开", render: () => <Demo expandTrigger="hover" /> },
    { name: "changeOnSelect（任意层提交）", render: () => <Demo changeOnSelect /> },
  ],
  renderWithProps: (p) => (
    <Demo expandTrigger={p.expandTrigger as "click" | "hover"} changeOnSelect={p.changeOnSelect as boolean} />
  ),
  toCode: (p) =>
    `<Cascader\n  nodes={nodes}\n  expandTrigger="${(p.expandTrigger as string) ?? "click"}"${p.changeOnSelect ? "\n  changeOnSelect" : ""}\n  value={value}\n  onChange={(path) => setValue(path)}\n/>`,
};
