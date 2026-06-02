"use client";
import { makeUsers, type DemoUser } from "@hulian/mocks";
import type { ShowcaseSpec } from "../showcase/types";
import { Table } from "./table";
import type { ColumnDef } from "./table.types";

// mock① 真实样例数据：复用项目 faker 工厂（确定性种子，防 SSR/CSR hydration mismatch）
const users = makeUsers(8);

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
    { name: "不可排序", render: () => <Demo enableSorting={false} /> },
    { name: "空数据", render: () => <Table columns={columns} data={[]} /> },
  ],
  renderWithProps: (p) => (
    <Demo enableSorting={p.enableSorting !== false} striped={p.striped !== false} />
  ),
  toCode: (p) =>
    `<Table\n  columns={columns}\n  data={users}\n  enableSorting={${p.enableSorting !== false}}\n  striped={${p.striped !== false}}\n/>`,
};
