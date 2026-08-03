"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Descriptions, DescriptionsItem } from "../../../../packages/ui/src/descriptions/descriptions";
import type { DescriptionsItemData } from "../../../../packages/ui/src/descriptions/descriptions.types";
const items: DescriptionsItemData[] = [
    { label: "Username", children: "zhangsan" },
    { label: "Mobile phone", children: "138 0000 0000" },
    { label: "City", children: "Guangzhou" },
    { label: "Address\nExample of", children: "Block 1203, A, No. 88, XX Road, Tianhe District, Guangzhou City, Guangdong Province", span: 3 },
];
const profile = (<>
    <DescriptionsItem label="Name">Zhang San</DescriptionsItem>
    <DescriptionsItem label="Gender">Male</DescriptionsItem>
    <DescriptionsItem label="Birthday">1995-08-12</DescriptionsItem>
    <DescriptionsItem label="Remarks" span={3}>
      VIP customers, priority will be given to after-sales work orders
    </DescriptionsItem>
  </>);
export const descriptionsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "horizontal layout: key left value right; declared with DescriptionsItem child node, span controls spanning columns.",
            code: `<Descriptions title="User Information">
  <DescriptionsItem label="Name">Zhang San</DescriptionsItem>
  <DescriptionsItem label="gender">Male</DescriptionsItem>
  <DescriptionsItem label="Birthday">1995-08-12</DescriptionsItem>
  <DescriptionsItem label="Remarks" span={3}>VIP customers, priority will be given to after-sales work orders</DescriptionsItem>
</Descriptions>`,
            render: () => <Descriptions title="User information">{profile}</Descriptions>,
        },
        {
            title: "Vertical layout",
            description: "layout=vertical Key up and value down, suitable for mobile terminals or scenarios with long values.",
            code: `<Descriptions layout="vertical" column={3}>
  <DescriptionsItem label="Name">Zhang San</DescriptionsItem>
  <DescriptionsItem label="Remarks" span={3}>VIP customers, priority will be given to after-sales work orders</DescriptionsItem>
</Descriptions>`,
            render: () => (<Descriptions layout="vertical" column={3}>
          {profile}
        </Descriptions>),
        },
        {
            title: "Border table state",
            description: "bordered is rendered as a separated table style, and extra is placed in the upper right operating area.",
            code: `<Descriptions
  bordered
  title="Order Details"
  extra={<a href="#edit">Edit</a>}
  items={[
    { label: "Username", children: "zhangsan" },
    { label: "Address", children: "A Block 1203, No. 88, XX Road, Tianhe District, Guangzhou City, Guangdong Province", span: 3 },
  ]}
/>`,
            render: () => (<Descriptions bordered title="Order details" extra={<a href="https://example.com/#edit">Edit</a>} items={items}/>),
        },
        {
            title: "Single column length details",
            description: "column=1 Each item has its own row, suitable for contract/voucher type vertical key values.",
            code: `<Descriptions
  bordered
  column={1}
  items={[
    { label: "Contract No.", children: "HT-2026-000812" },
    { label: "Contracting Party", children: "Guangzhou Hulian Technology Co., Ltd." },
    { label: "Amount", children: "\u00A5 128,000.00" },
    { label: "Status", children: "Effective" },
  ]}
/>`,
            render: () => (<Descriptions bordered column={1} items={[
                    { label: "Contract No.", children: "HT-2026-000812" },
                    { label: "Contractor", children: "Guangzhou Hulian Technology Co., Ltd." },
                    { label: "Amount", children: "\u00A5 128,000.00" },
                    { label: "Status", children: "has taken effect" },
                ]}/>),
        },
    ],
    controls: [
        {
            prop: "layout",
            type: "select",
            options: ["horizontal", "vertical"],
            defaultValue: "horizontal",
            label: "Layout",
        },
        { prop: "bordered", type: "boolean", defaultValue: false, label: "Border state" },
        { prop: "column", type: "number", defaultValue: 3, label: "Number of columns" },
    ],
    states: [
        {
            name: "Default (horizontal, key left value right)",
            render: () => <Descriptions title="User information">{profile}</Descriptions>,
        },
        {
            name: "vertical (key up value down)",
            render: () => (<Descriptions layout="vertical" column={3}>
          {profile}
        </Descriptions>),
        },
        {
            name: "bordered table status (horizontal)",
            render: () => (<Descriptions bordered title="Order details" extra={<a href="https://example.com/#edit">Edit</a>} items={items}/>),
        },
        {
            name: "bordered + vertical",
            render: () => <Descriptions bordered layout="vertical" column={3} items={items}/>,
        },
        {
            name: "Single column (column=1, long details)",
            render: () => (<Descriptions bordered column={1} items={[
                    { label: "Contract No.", children: "HT-2026-000812" },
                    { label: "Contractor", children: "Guangzhou Hulian Technology Co., Ltd." },
                    { label: "Amount", children: "\u00A5 128,000.00" },
                    { label: "Status", children: "has taken effect" },
                ]}/>),
        },
    ],
    renderWithProps: (p) => (<Descriptions title="User information" layout={p.layout as "horizontal" | "vertical"} bordered={Boolean(p.bordered)} column={Number(p.column) || 3} items={items}/>),
    toCode: (p) => {
        const attrs = [
            p.layout === "vertical" ? ` layout="vertical"` : "",
            p.bordered ? " bordered" : "",
            Number(p.column) !== 3 ? ` column={${Number(p.column) || 3}}` : "",
        ].join("");
        return `<Descriptions${attrs}>
  <DescriptionsItem label="username">zhangsan</DescriptionsItem>
  <DescriptionsItem label="Address" span={3}>...</DescriptionsItem>
</Descriptions>`;
    },
};
