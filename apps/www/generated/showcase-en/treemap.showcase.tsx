"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Treemap } from "../../../../packages/ui/src/treemap/treemap";
const stores = [
    { name: "Hangzhou Hubin", value: 3820 },
    { name: "Shanghai West Nanjing Rd", value: 3140 },
    { name: "Suzhou Guanqian", value: 2470 },
    { name: "Nanjing Xinjiekou", value: 1980 },
    { name: "Ningbo Tianyi", value: 1520 },
    { name: "Wuxi Chongan", value: 1180 },
    { name: "Hefei Zhengwu", value: 860 },
    { name: "Changzhou Laimeng", value: 640 },
    { name: "Jiaxing Jiangnan", value: 430 },
    { name: "Huzhou Wuxing", value: 260 },
];
const thousands = (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export const treemapShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A flat dataset is tiled by value so the biggest items read at a glance. Cell colors default to one chart token per index.",
            code: `<Treemap
  data={[
    { name: "Hangzhou Hubin", value: 3820 },
    { name: "Shanghai West Nanjing Rd", value: 3140 },
  ]}
/>`,
            render: () => <Treemap data={stores}/>,
        },
        {
            title: "Display value",
            description: "showValue adds a value line under the name; a cell that cannot fit both keeps only the name, and one that fits neither draws no text at all.",
            code: `<Treemap data={data} showValue />`,
            render: () => <Treemap data={stores} showValue/>,
        },
        {
            title: "Click to drill down",
            description: "onItemClick reports the clicked cell; the drill-down itself (navigating to a list, opening a drawer) stays in application code.",
            code: `<Treemap
  data={data}
  onItemClick={({ datum }) => router.push(\`/members?store=\${datum.name}\`)}
/>`,
            render: () => <Treemap data={stores} onItemClick={() => { }}/>,
        },
        {
            title: "Custom value format",
            description: "valueFormat applies to both the in-cell text and the tooltip, so the two cannot drift apart.",
            code: `<Treemap data={data} showValue valueFormat={thousands} />`,
            render: () => <Treemap data={stores} showValue valueFormat={thousands}/>,
        },
    ],
    controls: [
        { prop: "showValue", type: "boolean", defaultValue: false, label: "Display value" },
        { prop: "height", type: "number", defaultValue: 280, label: "Height" },
    ],
    states: [
        { name: "Basic (10 stores)", render: () => <Treemap data={stores}/> },
        { name: "Display value", render: () => <Treemap data={stores} showValue/> },
        { name: "Custom format (thousands separator)", render: () => <Treemap data={stores} showValue valueFormat={thousands}/> },
        { name: "Few items (3)", render: () => <Treemap data={stores.slice(0, 3)} showValue/> },
        { name: "Short canvas (160)", render: () => <Treemap data={stores} height={160}/> },
    ],
    renderWithProps: (p) => (<Treemap data={stores} showValue={Boolean(p.showValue)} height={Math.max(120, Number(p.height) || 280)}/>),
    toCode: (p) => `<Treemap data={data}${p.showValue ? " showValue" : ""} height={${Math.max(120, Number(p.height) || 280)}} />`,
};
