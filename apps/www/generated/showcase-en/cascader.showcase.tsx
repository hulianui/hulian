"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Cascader } from "../../../../packages/ui/src/cascader/cascader";
import type { TreeNode } from "../../../../packages/ui/src/tree/tree-core";
const NODES: TreeNode[] = [
    {
        key: "zhejiang",
        label: "Zhejiang Province",
        children: [
            {
                key: "hangzhou",
                label: "Hangzhou City",
                children: [
                    { key: "xihu", label: "West Lake District" },
                    { key: "binjiang", label: "Binjiang District" },
                    { key: "yuhang", label: "Yuhang District" },
                    { key: "xiaoshan", label: "Xiaoshan District" },
                ],
            },
            {
                key: "ningbo",
                label: "Ningbo City",
                children: [
                    { key: "haishu", label: "Haishu District" },
                    { key: "yinzhou", label: "Yinzhou District" },
                    { key: "jiangbei", label: "Jiangbei District" },
                ],
            },
            {
                key: "wenzhou",
                label: "Wenzhou City",
                children: [
                    { key: "lucheng", label: "Lucheng District" },
                    { key: "ouhai", label: "Ouhai District" },
                ],
            },
        ],
    },
    {
        key: "jiangsu",
        label: "Jiangsu Province",
        children: [
            {
                key: "nanjing",
                label: "Nanjing",
                children: [
                    { key: "xuanwu", label: "Xuanwu District" },
                    { key: "gulou", label: "Gulou District" },
                    { key: "jiangning", label: "Jiangning District" },
                ],
            },
            {
                key: "suzhou",
                label: "Suzhou City",
                children: [
                    { key: "gusu", label: "Gusu District" },
                    { key: "wuzhong", label: "Wuzhong District" },
                    { key: "kunshan", label: "Kunshan City" },
                ],
            },
        ],
    },
    {
        key: "guangdong",
        label: "Guangdong Province",
        children: [
            {
                key: "guangzhou",
                label: "Guangzhou City",
                children: [
                    { key: "tianhe", label: "Tianhe District" },
                    { key: "yuexiu", label: "Yuexiu District" },
                    { key: "haizhu", label: "Haizhu District" },
                ],
            },
            {
                key: "shenzhen",
                label: "Shenzhen",
                children: [
                    { key: "futian", label: "Futian District" },
                    { key: "nanshan", label: "Nanshan District" },
                    { key: "qianhai", label: "Qianhai Cooperation Zone (not yet open)", disabled: true },
                ],
            },
        ],
    },
];
function Demo({ expandTrigger, changeOnSelect }: {
    expandTrigger?: "click" | "hover";
    changeOnSelect?: boolean;
}) {
    const [v, setV] = useState<string[]>([]);
    return (<div className="w-72">
      <Cascader nodes={NODES} value={v} onChange={(p) => setV(p)} expandTrigger={expandTrigger} changeOnSelect={changeOnSelect} placeholder="Select region"/>
    </div>);
}
export const cascaderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click to expand step by step and select the leaf node to submit the entire path. When it is not controlled, use defaultValue to set the initial value.",
            code: `<Cascader
  nodes={nodes}
  placeholder="Select region"
  onChange={(path, nodePath) => setValue(path)}
/>`,
            render: () => (<div className="w-72">
          <Cascader nodes={NODES} placeholder="Select region"/>
        </div>),
        },
        {
            title: "hover Expand",
            description: "expandTrigger=\"hover\" will be expanded column by column when moved in. Click to submit.",
            code: `<Cascader nodes={nodes} expandTrigger="hover" placeholder="Select Region" />`,
            render: () => (<div className="w-72">
          <Cascader nodes={NODES} expandTrigger="hover" placeholder="Select region"/>
        </div>),
        },
        {
            title: "Any layer optional",
            description: "changeOnSelect allows you to select any level (not necessarily the leaf) and submit it.",
            code: `<Cascader nodes={nodes} changeOnSelect placeholder="Select region" />`,
            render: () => (<div className="w-72">
          <Cascader nodes={NODES} changeOnSelect placeholder="Select region"/>
        </div>),
        },
        {
            title: "Default vs. searchable",
            description: "defaultValue echo path; showSearch A search box appears at the top of the floating layer and enter the direct link to the leaf.",
            code: `<Cascader
  nodes={nodes}
  defaultValue={["zhejiang", "hangzhou", "xihu"]}
  showSearch
/>`,
            render: () => (<div className="w-72">
          <Cascader nodes={NODES} defaultValue={["zhejiang", "hangzhou", "xihu"]} showSearch/>
        </div>),
        },
        {
            title: "Disabled",
            code: `<Cascader nodes={nodes} disabled placeholder="Select region" />`,
            render: () => (<div className="w-72">
          <Cascader nodes={NODES} disabled placeholder="Select region"/>
        </div>),
        },
    ],
    controls: [
        { prop: "expandTrigger", type: "select", options: ["click", "hover"], defaultValue: "click", label: "expandTrigger" },
        { prop: "changeOnSelect", type: "boolean", defaultValue: false, label: "changeOnSelect (any layer optional)" },
    ],
    states: [
        { name: "Default (click level by level \u00B7 leaf submission)", render: () => <Demo /> },
        { name: "hover Expand", render: () => <Demo expandTrigger="hover"/> },
        { name: "changeOnSelect (submit at any level)", render: () => <Demo changeOnSelect/> },
    ],
    renderWithProps: (p) => (<Demo expandTrigger={p.expandTrigger as "click" | "hover"} changeOnSelect={p.changeOnSelect as boolean}/>),
    toCode: (p) => `<Cascader
  nodes={nodes}
  expandTrigger="${(p.expandTrigger as string) ?? "click"}"${p.changeOnSelect ? "\n  changeOnSelect" : ""}
  value={value}
  onChange={(path) => setValue(path)}
/>`,
};
