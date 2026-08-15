"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Treemap } from "./treemap";

const stores = [
  { name: "杭州湖滨店", value: 3820 },
  { name: "上海南京西路店", value: 3140 },
  { name: "苏州观前街店", value: 2470 },
  { name: "南京新街口店", value: 1980 },
  { name: "宁波天一店", value: 1520 },
  { name: "无锡崇安店", value: 1180 },
  { name: "合肥政务店", value: 860 },
  { name: "常州莱蒙店", value: 640 },
  { name: "嘉兴江南店", value: 430 },
  { name: "湖州吴兴店", value: 260 },
];

// 千分位而不是「万」：showcase 文案要能整段译成英文，而「3820 → 0.38 万」的换算口径
// 换个语言就不成立了。手写分隔而不是 toLocaleString：后者跟着运行时 locale 走，SSR 与
// 浏览器可能给出不同结果，直接踩 hydration。
const thousands = (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const treemapShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "扁平数据按 value 占面积铺满，大项一眼可见。格子色缺省按序取 chart token。",
      code: `<Treemap
  data={[
    { name: "杭州湖滨店", value: 3820 },
    { name: "上海南京西路店", value: 3140 },
  ]}
/>`,
      render: () => <Treemap data={stores} />,
    },
    {
      title: "显示数值",
      description: "showValue 在名字下面加一行数值；格子放不下时自动只留名字，再放不下就都不画。",
      code: `<Treemap data={data} showValue />`,
      render: () => <Treemap data={stores} showValue />,
    },
    {
      title: "点击钻取",
      description: "onItemClick 拿到被点中的那一格，钻取语义（跳列表、开抽屉）留给业务侧。",
      code: `<Treemap
  data={data}
  onItemClick={({ datum }) => router.push(\`/members?store=\${datum.name}\`)}
/>`,
      render: () => <Treemap data={stores} onItemClick={() => {}} />,
    },
    {
      title: "自定义数值格式",
      description: "valueFormat 同时作用于格内文字与 tooltip，避免两处各写一套。",
      code: `<Treemap data={data} showValue valueFormat={thousands} />`,
      render: () => <Treemap data={stores} showValue valueFormat={thousands} />,
    },
  ],
  controls: [
    { prop: "showValue", type: "boolean", defaultValue: false, label: "显示数值" },
    { prop: "height", type: "number", defaultValue: 280, label: "高度" },
  ],
  states: [
    { name: "基础（10 家门店）", render: () => <Treemap data={stores} /> },
    { name: "显示数值", render: () => <Treemap data={stores} showValue /> },
    { name: "自定义格式（千分位）", render: () => <Treemap data={stores} showValue valueFormat={thousands} /> },
    { name: "少量数据（3 项）", render: () => <Treemap data={stores.slice(0, 3)} showValue /> },
    { name: "矮画布（160）", render: () => <Treemap data={stores} height={160} /> },
  ],
  renderWithProps: (p) => (
    <Treemap
      data={stores}
      showValue={Boolean(p.showValue)}
      height={Math.max(120, Number(p.height) || 280)}
    />
  ),
  toCode: (p) =>
    `<Treemap data={data}${p.showValue ? " showValue" : ""} height={${
      Math.max(120, Number(p.height) || 280)
    }} />`,
};
