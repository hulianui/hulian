"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TreeSelect } from "../../../../packages/ui/src/tree-select/tree-select";
import type { TreeNode } from "../../../../packages/ui/src/tree/tree-core";
const NODES: TreeNode[] = [
    {
        key: "rd",
        label: "R&D Center",
        children: [
            {
                key: "frontend",
                label: "Front end",
                children: [
                    { key: "fe-web", label: "Web Group" },
                    { key: "fe-mini", label: "Mini Program Group" },
                    { key: "fe-design", label: "Design System Group" },
                ],
            },
            {
                key: "backend",
                label: "Rear end",
                children: [
                    { key: "be-trade", label: "Trading Group" },
                    { key: "be-pay", label: "Payment Group" },
                    { key: "be-infra", label: "Infrastructure Group" },
                ],
            },
            {
                key: "qa",
                label: "Quality Assurance Department",
                children: [
                    { key: "qa-auto", label: "Automated Testing Group" },
                    { key: "qa-manual", label: "Functional test group" },
                ],
            },
        ],
    },
    {
        key: "product",
        label: "Product Center",
        children: [
            { key: "pm-c", label: "C end product group" },
            { key: "pm-b", label: "B end product group" },
            { key: "pm-data", label: "Data Product Group" },
        ],
    },
    {
        key: "market",
        label: "Market Center",
        children: [
            { key: "mk-brand", label: "Brand Group" },
            { key: "mk-growth", label: "Growth Group" },
        ],
    },
];
function Single() {
    const [v, setV] = useState<string | string[]>("");
    return (<div className="w-72">
      <TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="Select the department you belong to" searchable/>
    </div>);
}
function Multi() {
    const [v, setV] = useState<string | string[]>(["fe-web", "fe-mini"]);
    return (<div className="w-72">
      <TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="Check visible departments"/>
    </div>);
}
function Clearable() {
    const [v, setV] = useState<string | string[]>("fe-web");
    return (<div className="w-72 space-y-2">
      <TreeSelect nodes={NODES} clearable value={v} onChange={setV} placeholder="All departments" searchable/>
      <p className="text-xs text-muted">Current value:{JSON.stringify(v)}</p>
    </div>);
}
export const treeSelectShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Single selection + search",
            description: "Default radio selection: Click the leaf to submit and close it. searchable A search box appears at the top of the floating layer, which can be used to jump in multiple layers. For uncontrolled use, use defaultValue to set the initial value.",
            code: `<TreeSelect
  nodes={nodes}
  searchable
  placeholder="Select the department to which you belong"
  onChange={(v) => setValue(v)}
/>`,
            render: () => (<div className="w-72">
          <TreeSelect nodes={NODES} searchable placeholder="Select the department you belong to"/>
        </div>),
        },
        {
            title: "Multiple selection (parent-child cascade)",
            description: "When multiple clicks on the check box, check the parent cascade to the leaf, cancel a single leaf and leave the parent half-selected; value converges into a set of leaf keys.",
            code: `<TreeSelect
  nodes={nodes}
  multiple
  defaultValue={["fe-web", "fe-mini"]}
  placeholder="Check visible departments"
  onChange={(v) => setValue(v)}
/>`,
            render: () => (<div className="w-72">
          <TreeSelect nodes={NODES} multiple defaultValue={["fe-web", "fe-mini"]} placeholder="Check visible departments"/>
        </div>),
        },
        {
            title: "Clearable (clearable)",
            description: "When it has a value and is not disabled, a clear button (the arrow gives way) will appear on the right side of hover or the keyboard focus trigger. Click to return to the unselected state: single selection returns an empty string, and multiple selection returns an empty array. Leave the hierarchical filtering dimension blank = no limit, required.",
            code: `<TreeSelect
  nodes={nodes}
  clearable
  value={value}
  onChange={setValue}
  placeholder="All departments"
/>`,
            render: () => <Clearable />,
        },
        {
            title: "Multiple selections can be cleared",
            description: "Use the clear button under multi-select to clear all the check boxes at once (return []), without canceling one by one.",
            code: `<TreeSelect nodes={nodes} multiple clearable defaultValue={["fe-web", "fe-mini"]} />`,
            render: () => (<div className="w-72">
          <TreeSelect nodes={NODES} multiple clearable defaultValue={["fe-web", "fe-mini"]} placeholder="Check visible departments"/>
        </div>),
        },
        {
            title: "Disabled",
            code: `<TreeSelect nodes={nodes} disabled defaultValue="fe-web" />`,
            render: () => (<div className="w-72">
          <TreeSelect nodes={NODES} disabled defaultValue="fe-web"/>
        </div>),
        },
    ],
    controls: [
        { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple (multiple choices)" },
        { prop: "clearable", type: "boolean", defaultValue: false, label: "clearable (clearable)" },
        { prop: "searchable", type: "boolean", defaultValue: true, label: "searchable" },
    ],
    states: [
        { name: "Single selection + search", render: () => <Single /> },
        { name: "Multiple selection (checkable parent-child cascade)", render: () => <Multi /> },
        { name: "Can be cleared (the clear button pops up on the right side of hover)", render: () => <Clearable /> },
    ],
    renderWithProps: (p) => {
        const clearable = p.clearable as boolean;
        const searchable = p.searchable as boolean;
        return (<div className="w-72">

        <TreeSelect key={String(p.multiple)} nodes={NODES} multiple={p.multiple as boolean} clearable={clearable} searchable={searchable} defaultValue={(p.multiple as boolean) ? ["fe-web", "fe-mini"] : "fe-web"} placeholder="Select the department you belong to"/>
      </div>);
    },
    toCode: (p) => `<TreeSelect
  nodes={nodes}${p.multiple ? "\n  multiple" : ""}${p.clearable ? "\n  clearable" : ""}${p.searchable ? "\n  searchable" : ""}
  value={value}
  onChange={setValue}
/>`,
};
