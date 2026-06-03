"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TreeSelect } from "./tree-select";
import type { TreeNode } from "../tree/tree-core";

// 真实组织架构树：集团 → 中心 → 部门 → 小组，足够深，多选时父级勾选会级联到叶、
// 取消单个叶又会让父级落到半选态，单选 + 搜索也能在多层里命中跳转。
const NODES: TreeNode[] = [
  {
    key: "rd",
    label: "研发中心",
    children: [
      {
        key: "frontend",
        label: "前端部",
        children: [
          { key: "fe-web", label: "Web 组" },
          { key: "fe-mini", label: "小程序组" },
          { key: "fe-design", label: "设计系统组" },
        ],
      },
      {
        key: "backend",
        label: "后端部",
        children: [
          { key: "be-trade", label: "交易组" },
          { key: "be-pay", label: "支付组" },
          { key: "be-infra", label: "基础架构组" },
        ],
      },
      {
        key: "qa",
        label: "质量保障部",
        children: [
          { key: "qa-auto", label: "自动化测试组" },
          { key: "qa-manual", label: "功能测试组" },
        ],
      },
    ],
  },
  {
    key: "product",
    label: "产品中心",
    children: [
      { key: "pm-c", label: "C 端产品组" },
      { key: "pm-b", label: "B 端产品组" },
      { key: "pm-data", label: "数据产品组" },
    ],
  },
  {
    key: "market",
    label: "市场中心",
    children: [
      { key: "mk-brand", label: "品牌组" },
      { key: "mk-growth", label: "增长组" },
    ],
  },
];

function Single() {
  const [v, setV] = useState<string | string[]>("");
  return (
    <div className="w-72">
      <TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="选择归属部门" searchable />
    </div>
  );
}
function Multi() {
  const [v, setV] = useState<string | string[]>(["fe-web", "fe-mini"]);
  return (
    <div className="w-72">
      <TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="勾选可见部门" />
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
