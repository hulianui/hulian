"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Table } from "../table";
import type { ColumnDef } from "../table/table.types";
import { Input } from "./input";

// 「长得像表格的表单」：表头是字段名，单元格本身就是输入框，就地编辑即时保存。
// 确定性数据，不依赖随机源（SSR/CSR 同构）。
interface SeedRow {
  id: string;
  field: string;
  value: string;
}
const seedRows: SeedRow[] = [
  { id: "r1", field: "customer_name", value: "广云家政" },
  { id: "r2", field: "contact_phone", value: "13800000000" },
  { id: "r3", field: "service_city", value: "广州" },
];
const cellColumns: ColumnDef<SeedRow, any>[] = [
  { accessorKey: "field", header: "字段名", size: 160 },
  {
    accessorKey: "value",
    header: "取值",
    cell: ({ row }) => (
      <Input
        variant="cell"
        defaultValue={row.original.value}
        aria-label={row.original.field}
        placeholder="留空"
      />
    ),
  },
];

export const inputShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "最简输入框，传 placeholder 占位。",
      code: `<Input placeholder="请输入…" className="w-64" />`,
      render: () => <Input placeholder="请输入…" className="w-64" />,
    },
    {
      title: "前后缀",
      description: "prefix / suffix 槽嵌入单位、货币符号等。",
      code: `<Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />`,
      render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64" />,
    },
    {
      title: "尺寸",
      description: "size 提供 sm / md（默认）/ lg 三档。",
      code: `<>
  <Input size="sm" placeholder="sm" className="w-64" />
  <Input size="md" placeholder="md" className="w-64" />
  <Input size="lg" placeholder="lg" className="w-64" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Input size="sm" placeholder="sm" className="w-64" />
          <Input size="md" placeholder="md" className="w-64" />
          <Input size="lg" placeholder="lg" className="w-64" />
        </div>
      ),
    },
    {
      title: "单元格内联编辑",
      description:
        'variant="cell" 卸掉外壳（无边框 / 透明底 / 零内距 / 不占固定行高），焦点态换成浅底 + 内嵌下划线——焦点环会溢出去顶到相邻格。调用处不需要任何 className。',
      code: `const columns: ColumnDef<SeedRow, any>[] = [
  { accessorKey: "field", header: "字段名", size: 160 },
  {
    accessorKey: "value",
    header: "取值",
    cell: ({ row }) => (
      <Input variant="cell" defaultValue={row.original.value} aria-label={row.original.field} placeholder="留空" />
    ),
  },
];

<Table columns={columns} data={rows} density="compact" />`,
      render: () => <Table columns={cellColumns} data={seedRows} density="compact" />,
    },
    {
      title: "无效态",
      description: "invalid 标红边框与焦点环（独立使用时手动传）。",
      code: `<Input invalid defaultValue="错的值" className="w-64" />`,
      render: () => <Input invalid defaultValue="错的值" className="w-64" />,
    },
    {
      title: "禁用态",
      description: "disabled 降透明度并屏蔽交互。",
      code: `<Input disabled defaultValue="禁用态" className="w-64" />`,
      render: () => <Input disabled defaultValue="禁用态" className="w-64" />,
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["xs", "sm", "md", "lg"], defaultValue: "md" },
    { prop: "placeholder", type: "text", defaultValue: "请输入…", label: "占位符" },
    { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
  ],
  states: [
    { name: "default", render: () => <Input placeholder="请输入…" className="w-64" /> },
    { name: "前后缀", render: () => <Input prefix="¥" suffix=".00" placeholder="0" className="w-64" /> },
    { name: "invalid", render: () => <Input invalid defaultValue="错的值" className="w-64" /> },
    { name: "disabled", render: () => <Input disabled defaultValue="禁用态" className="w-64" /> },
    { name: "xs", render: () => <Input size="xs" placeholder="xs" className="w-64" /> },
    { name: "sm", render: () => <Input size="sm" placeholder="sm" className="w-64" /> },
    { name: "lg", render: () => <Input size="lg" placeholder="lg" className="w-64" /> },
    {
      name: "cell",
      render: () => <Input variant="cell" defaultValue="就地编辑" className="w-40" />,
    },
  ],
  renderWithProps: (p) => (
    <Input
      size={p.size as "sm" | "md" | "lg"}
      placeholder={p.placeholder as string}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      className="w-64"
    />
  ),
  toCode: (p) =>
    `<Input size="${p.size}" placeholder="${p.placeholder}"${p.invalid ? " invalid" : ""}${
      p.disabled ? " disabled" : ""
    } />`,
};
