"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Cascader } from "./cascader";
import type { TreeNode } from "../tree/tree-core";

// 真实省/市/区三级行政区划：三个省、多市、多区，足够拖出三列联动浮层，
// hover 逐列展开、changeOnSelect 任意层提交、disabled 节点都能肉眼跑通。
const NODES: TreeNode[] = [
  {
    key: "zhejiang",
    label: "浙江省",
    children: [
      {
        key: "hangzhou",
        label: "杭州市",
        children: [
          { key: "xihu", label: "西湖区" },
          { key: "binjiang", label: "滨江区" },
          { key: "yuhang", label: "余杭区" },
          { key: "xiaoshan", label: "萧山区" },
        ],
      },
      {
        key: "ningbo",
        label: "宁波市",
        children: [
          { key: "haishu", label: "海曙区" },
          { key: "yinzhou", label: "鄞州区" },
          { key: "jiangbei", label: "江北区" },
        ],
      },
      {
        key: "wenzhou",
        label: "温州市",
        children: [
          { key: "lucheng", label: "鹿城区" },
          { key: "ouhai", label: "瓯海区" },
        ],
      },
    ],
  },
  {
    key: "jiangsu",
    label: "江苏省",
    children: [
      {
        key: "nanjing",
        label: "南京市",
        children: [
          { key: "xuanwu", label: "玄武区" },
          { key: "gulou", label: "鼓楼区" },
          { key: "jiangning", label: "江宁区" },
        ],
      },
      {
        key: "suzhou",
        label: "苏州市",
        children: [
          { key: "gusu", label: "姑苏区" },
          { key: "wuzhong", label: "吴中区" },
          { key: "kunshan", label: "昆山市" },
        ],
      },
    ],
  },
  {
    key: "guangdong",
    label: "广东省",
    children: [
      {
        key: "guangzhou",
        label: "广州市",
        children: [
          { key: "tianhe", label: "天河区" },
          { key: "yuexiu", label: "越秀区" },
          { key: "haizhu", label: "海珠区" },
        ],
      },
      {
        key: "shenzhen",
        label: "深圳市",
        children: [
          { key: "futian", label: "福田区" },
          { key: "nanshan", label: "南山区" },
          { key: "qianhai", label: "前海合作区（暂未开放）", disabled: true },
        ],
      },
    ],
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
  examples: [
    {
      title: "基础用法",
      description: "点击逐级展开，选到叶子节点提交整条路径。非受控时用 defaultValue 设初值。",
      code: `<Cascader
  nodes={nodes}
  placeholder="选择地区"
  onChange={(path, nodePath) => setValue(path)}
/>`,
      render: () => (
        <div className="w-72">
          <Cascader nodes={NODES} placeholder="选择地区" />
        </div>
      ),
    },
    {
      title: "hover 展开",
      description: "expandTrigger=\"hover\" 时移入即逐列展开，点击才提交。",
      code: `<Cascader nodes={nodes} expandTrigger="hover" placeholder="选择地区" />`,
      render: () => (
        <div className="w-72">
          <Cascader nodes={NODES} expandTrigger="hover" placeholder="选择地区" />
        </div>
      ),
    },
    {
      title: "任意层可选",
      description: "changeOnSelect 允许选中任意一级（不必到叶子）即提交。",
      code: `<Cascader nodes={nodes} changeOnSelect placeholder="选择地区" />`,
      render: () => (
        <div className="w-72">
          <Cascader nodes={NODES} changeOnSelect placeholder="选择地区" />
        </div>
      ),
    },
    {
      title: "默认值与可搜索",
      description: "defaultValue 回显路径；showSearch 在浮层顶部出搜索框，输入直达叶子。",
      code: `<Cascader
  nodes={nodes}
  defaultValue={["zhejiang", "hangzhou", "xihu"]}
  showSearch
/>`,
      render: () => (
        <div className="w-72">
          <Cascader nodes={NODES} defaultValue={["zhejiang", "hangzhou", "xihu"]} showSearch />
        </div>
      ),
    },
    {
      title: "禁用态",
      code: `<Cascader nodes={nodes} disabled placeholder="选择地区" />`,
      render: () => (
        <div className="w-72">
          <Cascader nodes={NODES} disabled placeholder="选择地区" />
        </div>
      ),
    },
  ],
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
