"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Descriptions, DescriptionsItem } from "./descriptions";
import type { DescriptionsItemData } from "./descriptions.types";

// 数据驱动 items（span 之和按行填满，bordered 态无空缺）：column=3 → 行1: 1+1+1，行2: 备注 span=3。
const items: DescriptionsItemData[] = [
  { label: "用户名", children: "zhangsan" },
  { label: "手机", children: "138 0000 0000" },
  { label: "城市", children: "广州" },
  { label: "地址", children: "广东省广州市天河区某某路 88 号 A 座 1203", span: 3 },
];

const profile = (
  <>
    <DescriptionsItem label="姓名">张三</DescriptionsItem>
    <DescriptionsItem label="性别">男</DescriptionsItem>
    <DescriptionsItem label="生日">1995-08-12</DescriptionsItem>
    <DescriptionsItem label="备注" span={3}>
      VIP 客户，优先处理售后工单
    </DescriptionsItem>
  </>
);

export const descriptionsShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "horizontal 布局：键左值右；用 DescriptionsItem 子节点声明，span 控制跨列。",
      code: `<Descriptions title="用户信息">
  <DescriptionsItem label="姓名">张三</DescriptionsItem>
  <DescriptionsItem label="性别">男</DescriptionsItem>
  <DescriptionsItem label="生日">1995-08-12</DescriptionsItem>
  <DescriptionsItem label="备注" span={3}>VIP 客户，优先处理售后工单</DescriptionsItem>
</Descriptions>`,
      render: () => <Descriptions title="用户信息">{profile}</Descriptions>,
    },
    {
      title: "竖排布局",
      description: "layout=vertical 键上值下，适合移动端或值较长的场景。",
      code: `<Descriptions layout="vertical" column={3}>
  <DescriptionsItem label="姓名">张三</DescriptionsItem>
  <DescriptionsItem label="备注" span={3}>VIP 客户，优先处理售后工单</DescriptionsItem>
</Descriptions>`,
      render: () => (
        <Descriptions layout="vertical" column={3}>
          {profile}
        </Descriptions>
      ),
    },
    {
      title: "边框表格态",
      description: "bordered 渲染为带分隔的表格样式，extra 放右上操作区。",
      code: `<Descriptions
  bordered
  title="订单详情"
  extra={<a href="#">编辑</a>}
  items={[
    { label: "用户名", children: "zhangsan" },
    { label: "地址", children: "广东省广州市天河区某某路 88 号 A 座 1203", span: 3 },
  ]}
/>`,
      render: () => (
        <Descriptions
          bordered
          title="订单详情"
          extra={<a href="#">编辑</a>}
          items={items}
        />
      ),
    },
    {
      title: "单列长详情",
      description: "column=1 每项独占一行，适合合同/凭证类纵向键值。",
      code: `<Descriptions
  bordered
  column={1}
  items={[
    { label: "合同编号", children: "HT-2026-000812" },
    { label: "签约方", children: "广州瑚琏科技有限公司" },
    { label: "金额", children: "¥ 128,000.00" },
    { label: "状态", children: "已生效" },
  ]}
/>`,
      render: () => (
        <Descriptions
          bordered
          column={1}
          items={[
            { label: "合同编号", children: "HT-2026-000812" },
            { label: "签约方", children: "广州瑚琏科技有限公司" },
            { label: "金额", children: "¥ 128,000.00" },
            { label: "状态", children: "已生效" },
          ]}
        />
      ),
    },
  ],
  controls: [
    {
      prop: "layout",
      type: "select",
      options: ["horizontal", "vertical"],
      defaultValue: "horizontal",
      label: "布局",
    },
    { prop: "bordered", type: "boolean", defaultValue: false, label: "边框态" },
    { prop: "column", type: "number", defaultValue: 3, label: "列数" },
  ],
  states: [
    {
      name: "默认（horizontal，键左值右）",
      render: () => <Descriptions title="用户信息">{profile}</Descriptions>,
    },
    {
      name: "vertical（键上值下）",
      render: () => (
        <Descriptions layout="vertical" column={3}>
          {profile}
        </Descriptions>
      ),
    },
    {
      name: "bordered 表格态（horizontal）",
      render: () => (
        <Descriptions
          bordered
          title="订单详情"
          extra={<a href="#">编辑</a>}
          items={items}
        />
      ),
    },
    {
      name: "bordered + vertical",
      render: () => <Descriptions bordered layout="vertical" column={3} items={items} />,
    },
    {
      name: "单列（column=1，长详情）",
      render: () => (
        <Descriptions
          bordered
          column={1}
          items={[
            { label: "合同编号", children: "HT-2026-000812" },
            { label: "签约方", children: "广州瑚琏科技有限公司" },
            { label: "金额", children: "¥ 128,000.00" },
            { label: "状态", children: "已生效" },
          ]}
        />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Descriptions
      title="用户信息"
      layout={p.layout as "horizontal" | "vertical"}
      bordered={Boolean(p.bordered)}
      column={Number(p.column) || 3}
      items={items}
    />
  ),
  toCode: (p) => {
    const attrs = [
      p.layout === "vertical" ? ` layout="vertical"` : "",
      p.bordered ? " bordered" : "",
      Number(p.column) !== 3 ? ` column={${Number(p.column) || 3}}` : "",
    ].join("");
    return `<Descriptions${attrs}>\n  <DescriptionsItem label="用户名">zhangsan</DescriptionsItem>\n  <DescriptionsItem label="地址" span={3}>...</DescriptionsItem>\n</Descriptions>`;
  },
};
