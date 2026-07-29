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
// 受控 + clearable：把当前值也显示出来，便于看清「清除」确实把值打回了空串而不只是视觉复位。
function Clearable() {
  const [v, setV] = useState<string | string[]>("fe-web");
  return (
    <div className="w-72 space-y-2">
      <TreeSelect nodes={NODES} clearable value={v} onChange={setV} placeholder="全部部门" searchable />
      <p className="text-xs text-muted">当前值：{JSON.stringify(v)}</p>
    </div>
  );
}

export const treeSelectShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "单选 + 搜索",
      description: "默认单选：点叶子即提交并收起。searchable 在浮层顶部出搜索框，可在多层里命中跳转。非受控用 defaultValue 设初值。",
      code: `<TreeSelect
  nodes={nodes}
  searchable
  placeholder="选择归属部门"
  onChange={(v) => setValue(v)}
/>`,
      render: () => (
        <div className="w-72">
          <TreeSelect nodes={NODES} searchable placeholder="选择归属部门" />
        </div>
      ),
    },
    {
      title: "多选（父子级联）",
      description: "multiple 时节点出复选框，勾父级联到叶，取消单个叶让父级落半选态；value 收敛为叶子键集合。",
      code: `<TreeSelect
  nodes={nodes}
  multiple
  defaultValue={["fe-web", "fe-mini"]}
  placeholder="勾选可见部门"
  onChange={(v) => setValue(v)}
/>`,
      render: () => (
        <div className="w-72">
          <TreeSelect nodes={NODES} multiple defaultValue={["fe-web", "fe-mini"]} placeholder="勾选可见部门" />
        </div>
      ),
    },
    {
      title: "可清除（clearable）",
      description:
        "有值且未禁用时，hover 或键盘聚焦触发器右侧会浮出清除按钮（箭头让位），点击回到未选态：单选回传空串、多选回传空数组。层级筛选维度留空 = 不限，必开。",
      code: `<TreeSelect
  nodes={nodes}
  clearable
  value={value}
  onChange={setValue}
  placeholder="全部部门"
/>`,
      render: () => <Clearable />,
    },
    {
      title: "多选可清除",
      description: "多选下清除按钮一次清空所有勾选（回传 []），不必逐个取消。",
      code: `<TreeSelect nodes={nodes} multiple clearable defaultValue={["fe-web", "fe-mini"]} />`,
      render: () => (
        <div className="w-72">
          <TreeSelect
            nodes={NODES}
            multiple
            clearable
            defaultValue={["fe-web", "fe-mini"]}
            placeholder="勾选可见部门"
          />
        </div>
      ),
    },
    {
      title: "禁用态",
      code: `<TreeSelect nodes={nodes} disabled defaultValue="fe-web" />`,
      render: () => (
        <div className="w-72">
          <TreeSelect nodes={NODES} disabled defaultValue="fe-web" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple（多选）" },
    { prop: "clearable", type: "boolean", defaultValue: false, label: "clearable（可清除）" },
    { prop: "searchable", type: "boolean", defaultValue: true, label: "searchable" },
  ],
  states: [
    { name: "单选 + 搜索", render: () => <Single /> },
    { name: "多选（checkable 父子级联）", render: () => <Multi /> },
    { name: "可清除（hover 右侧浮出清除钮）", render: () => <Clearable /> },
  ],
  renderWithProps: (p) => {
    const clearable = p.clearable as boolean;
    const searchable = p.searchable as boolean;
    // 面板改 props 时用同一份非受控实例，避免与上面各受控 demo 的局部 state 打架。
    return (
      <div className="w-72">
        {/* multiple 切换会改变值的形状（string ↔ string[]），非受控内部 state 不会自己重置 → 用 key 强制重挂载。 */}
        <TreeSelect
          key={String(p.multiple)}
          nodes={NODES}
          multiple={p.multiple as boolean}
          clearable={clearable}
          searchable={searchable}
          defaultValue={(p.multiple as boolean) ? ["fe-web", "fe-mini"] : "fe-web"}
          placeholder="选择归属部门"
        />
      </div>
    );
  },
  toCode: (p) =>
    `<TreeSelect\n  nodes={nodes}${p.multiple ? "\n  multiple" : ""}${p.clearable ? "\n  clearable" : ""}${p.searchable ? "\n  searchable" : ""}\n  value={value}\n  onChange={setValue}\n/>`,
};
