"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "../table/table.types";
import type { SearchField } from "../search-form/search-form.types";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Tag, type TagTone } from "../tag";
import { ProTable } from "./pro-table";

interface Row {
  id: number;
  name: string;
  dept: string;
  status: "active" | "leave" | "pending";
  date: string;
  salary: number;
}

const STATUS: Record<Row["status"], { label: string; tone: TagTone }> = {
  active: { label: "在职", tone: "success" },
  leave: { label: "离职", tone: "neutral" },
  pending: { label: "待入职", tone: "warning" },
};

const DEPTS = ["研发部", "市场部", "财务部", "人事部"];
const ALL: Row[] = Array.from({ length: 47 }, (_, i) => ({
  id: i + 1,
  name: `员工 ${String(i + 1).padStart(2, "0")}`,
  dept: DEPTS[i % DEPTS.length],
  status: (["active", "leave", "pending"] as const)[i % 3],
  date: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
  salary: 8000 + (i % 10) * 1500,
}));

const columns: ColumnDef<Row, any>[] = [
  { accessorKey: "id", header: "工号", size: 60 },
  { accessorKey: "name", header: "姓名", meta: { sticky: "left" } },
  { accessorKey: "dept", header: "部门" },
  {
    accessorKey: "status",
    header: "状态",
    cell: ({ getValue }) => {
      const s = STATUS[getValue() as Row["status"]];
      return (
        <Tag tone={s.tone} dot>
          {s.label}
        </Tag>
      );
    },
  },
  { accessorKey: "date", header: "入职日期" },
  {
    accessorKey: "salary",
    header: "月薪",
    cell: ({ getValue }) => `¥${(getValue() as number).toLocaleString()}`,
  },
];

const searchFields: SearchField[] = [
  { name: "name", label: "姓名", placeholder: "搜索姓名" },
  {
    name: "dept",
    label: "部门",
    type: "select",
    options: [{ value: "", label: "全部" }, ...DEPTS.map((d) => ({ value: d, label: d }))],
  },
  {
    name: "status",
    label: "状态",
    type: "select",
    options: [
      { value: "", label: "全部" },
      { value: "active", label: "在职" },
      { value: "leave", label: "离职" },
      { value: "pending", label: "待入职" },
    ],
  },
];

function Demo() {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const pageSize = 8;

  const filtered = useMemo(() => {
    return ALL.filter((r) => {
      const name = String(query.name ?? "").trim();
      const dept = String(query.dept ?? "");
      const status = String(query.status ?? "");
      if (name && !r.name.includes(name)) return false;
      if (dept && r.dept !== dept) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }, [query]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const reload = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  };

  return (
    <div className="w-full">
      <ProTable<Row>
        title="员工列表"
        columns={columns}
        data={pageData}
        loading={loading}
        onReload={reload}
        getRowId={(r) => String(r.id)}
        enableRowSelection
        toolbarActions={<Button size="sm">+ 新增员工</Button>}
        search={{
          fields: searchFields,
          collapsible: false,
          columns: 3,
          onSearch: (v) => {
            setQuery(v);
            setPage(1);
          },
          onReset: () => {
            setQuery({});
            setPage(1);
          },
        }}
        pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage }}
      />
    </div>
  );
}

function Minimal() {
  return (
    <div className="w-full">
      <ProTable<Row>
        title="紧凑表（无查询区）"
        columns={columns.slice(0, 4)}
        data={ALL.slice(0, 5)}
        density="compact"
        toolbar={{ fullscreen: false }}
        getRowId={(r) => String(r.id)}
      />
    </div>
  );
}

export const proTableShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "完整（查询区 + 工具栏 + 行选择 + 分页）", render: () => <Demo /> },
    { name: "精简（紧凑密度 · 无查询区）", render: () => <Minimal /> },
  ],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<ProTable
  title="员工列表"
  columns={columns}
  data={pageData}
  enableRowSelection
  onReload={reload}
  toolbarActions={<Button size="sm">+ 新增</Button>}
  search={{ fields, onSearch, onReset }}
  pagination={{ page, pageSize, total, onPageChange: setPage }}
/>`,
};
