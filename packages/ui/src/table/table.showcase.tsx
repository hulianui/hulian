"use client";
import { makeUsers, type DemoUser } from "@hulian/mocks";
import type { ShowcaseSpec } from "../showcase/types";
import { Table } from "./table";
import type { ColumnDef } from "./table.types";

// mock① 真实样例数据：复用项目 faker 工厂（确定性种子，防 SSR/CSR hydration mismatch）
const users = makeUsers(8);
const manyUsers = makeUsers(200);

const columns: ColumnDef<DemoUser, any>[] = [
  {
    accessorKey: "name",
    header: "姓名",
    cell: ({ row }) => (
      <span className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={row.original.avatar} alt="" className="size-6 rounded-full bg-surface-hover" />
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "邮箱",
    cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span>,
  },
  { accessorKey: "role", header: "角色" },
];

// 行选择列定义复用基础列（自动前插复选框列）
function SelectionDemo() {
  return <Table columns={columns} data={users} enableRowSelection />;
}

// 筛选：name/email 列开 meta.filterable → 表头出筛选框
const filterColumns: ColumnDef<DemoUser, any>[] = [
  { ...columns[0], meta: { filterable: true } },
  { ...columns[1], meta: { filterable: true } },
  columns[2],
];
function FilterDemo() {
  return <Table columns={filterColumns} data={users} />;
}

// 固定列：首列贴左、操作列贴右；列给 size 让 sticky offset 精确，并加宽内容触发横滚
const stickyColumns: ColumnDef<DemoUser, any>[] = [
  { ...columns[0], size: 200, meta: { sticky: "left" } },
  { accessorKey: "email", header: "邮箱", size: 280, cell: columns[1].cell },
  { accessorKey: "role", header: "角色", size: 160 },
  { accessorKey: "id", header: "ID", size: 320, cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span> },
  {
    id: "actions",
    header: "操作",
    size: 120,
    meta: { sticky: "right" },
    cell: () => <button type="button" className="text-primary hover:underline">编辑</button>,
  },
];
function StickyDemo() {
  return <Table columns={stickyColumns} data={users} />;
}

// 可展开明细：行下渲染整宽面板
function ExpandableDemo() {
  return (
    <Table
      columns={columns}
      data={users}
      renderExpandedRow={(row) => (
        <div className="text-sm text-muted">
          <div>用户 ID：{row.original.id}</div>
          <div>邮箱：{row.original.email}</div>
        </div>
      )}
    />
  );
}

// 树形：从行取子行，展开器按 depth 缩进
interface OrgNode {
  name: string;
  title: string;
  reports?: OrgNode[];
}
const org: OrgNode[] = [
  {
    name: "林总",
    title: "CEO",
    reports: [
      { name: "王经理", title: "工程总监", reports: [{ name: "小李", title: "前端工程师" }, { name: "小张", title: "后端工程师" }] },
      { name: "陈经理", title: "设计总监", reports: [{ name: "小赵", title: "产品设计师" }] },
    ],
  },
];
const orgColumns: ColumnDef<OrgNode, any>[] = [
  { accessorKey: "name", header: "姓名" },
  { accessorKey: "title", header: "职位", cell: ({ getValue }) => <span className="text-muted">{getValue() as string}</span> },
];
function TreeDemo() {
  return <Table columns={orgColumns} data={org} getSubRows={(r) => r.reports} />;
}

// 虚拟滚动：200 行只渲染视口窗口（固定高度容器）
function VirtualDemo() {
  return <Table columns={columns} data={manyUsers} virtual={{ enabled: true, height: 360, rowHeight: 44 }} />;
}

function Demo({ enableSorting = true, striped = true }: { enableSorting?: boolean; striped?: boolean }) {
  return <Table columns={columns} data={users} enableSorting={enableSorting} striped={striped} />;
}

export const tableShowcase: ShowcaseSpec = {
  controls: [
    { prop: "enableSorting", type: "boolean", defaultValue: true, label: "可排序" },
    { prop: "striped", type: "boolean", defaultValue: true, label: "斑马纹" },
  ],
  states: [
    { name: "可排序（点表头切换）", render: () => <Demo /> },
    { name: "行选择（全选 + 单选）", render: () => <SelectionDemo /> },
    { name: "列筛选（meta.filterable）", render: () => <FilterDemo /> },
    { name: "固定列（左首列 / 右操作列·横滚试试）", render: () => <StickyDemo /> },
    { name: "可展开明细", render: () => <ExpandableDemo /> },
    { name: "树形（getSubRows）", render: () => <TreeDemo /> },
    { name: "虚拟滚动（200 行·固定高容器）", render: () => <VirtualDemo /> },
    { name: "不可排序", render: () => <Demo enableSorting={false} /> },
    { name: "空数据", render: () => <Table columns={columns} data={[]} /> },
  ],
  renderWithProps: (p) => (
    <Demo enableSorting={p.enableSorting !== false} striped={p.striped !== false} />
  ),
  toCode: (p) =>
    `<Table\n  columns={columns}\n  data={users}\n  enableSorting={${p.enableSorting !== false}}\n  striped={${p.striped !== false}}\n/>`,
};
