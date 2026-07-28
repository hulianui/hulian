"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "../table/table.types";
import type { SearchField } from "../search-form/search-form.types";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button";
import { Tag, type TagTone } from "../tag";
import { ProTable } from "./pro-table";
import type { ProTableRequestParams } from "./pro-table.types";

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

// 托管模式：传 request 即由 ProTable 自管 page/sort/filters/loading/data（此处用本地内存模拟服务端）。
function Managed() {
  const request = async (p: ProTableRequestParams) => {
    const name = String(p.filters.name ?? "").trim();
    let rows = ALL.filter((r) => (name ? r.name.includes(name) : true));
    if (p.sort) {
      const f = p.sort.field as keyof Row;
      rows = [...rows].sort((a, b) => (a[f] < b[f] ? -1 : a[f] > b[f] ? 1 : 0));
      if (p.sort.order === "desc") rows.reverse();
    }
    const total = rows.length;
    const start = (p.page - 1) * p.pageSize;
    await new Promise((r) => setTimeout(r, 300));
    return { data: rows.slice(start, start + p.pageSize), total };
  };
  return (
    <div className="w-full">
      <ProTable<Row>
        title="托管模式（服务端 request）"
        columns={columns}
        request={request}
        defaultPageSize={8}
        getRowId={(r) => String(r.id)}
        enableRowSelection
        batchActions={({ selectedRowKeys, clearSelection }) => (
          <Button size="sm" tone="danger" onClick={clearSelection}>
            删除选中 {selectedRowKeys.length}
          </Button>
        )}
        search={{ fields: searchFields, collapsible: false, columns: 3, onSearch: () => {} }}
      />
    </div>
  );
}

// defaultSorting + params：默认按月薪倒序；顶部部门切换是「固定查询参数」，
// 变化即回第 1 页重查。注意 request 与 params 都是内联写的（不 useCallback / useMemo）——
// request 由组件内部 ref 持有、params 走浅比较，都不会造成重复请求。
function SortedWithParams() {
  const [dept, setDept] = useState<string>(DEPTS[0]);
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">部门（固定查询参数）</span>
        {DEPTS.map((d) => (
          <Button
            key={d}
            size="sm"
            variant={d === dept ? "solid" : "outline"}
            onClick={() => setDept(d)}
          >
            {d}
          </Button>
        ))}
      </div>
      <ProTable<Row>
        title="默认按月薪倒序"
        columns={columns}
        defaultSorting={[{ id: "salary", desc: true }]}
        params={{ dept }}
        request={async (p) => {
          const scope = String(p.params?.dept ?? "");
          let rows = ALL.filter((r) => (scope ? r.dept === scope : true));
          if (p.sort) {
            const f = p.sort.field as keyof Row;
            rows = [...rows].sort((a, b) => (a[f] < b[f] ? -1 : a[f] > b[f] ? 1 : 0));
            if (p.sort.order === "desc") rows.reverse();
          }
          const start = (p.page - 1) * p.pageSize;
          await new Promise((r) => setTimeout(r, 300));
          return { data: rows.slice(start, start + p.pageSize), total: rows.length };
        }}
        defaultPageSize={5}
        getRowId={(r) => String(r.id)}
      />
    </div>
  );
}

// cursor 分页托管模式：request 入参带 cursor、返回 { data, nextCursor, hasMore }，
// 底部为「上一页/下一页」按钮对（keyset 分页无 total）。此处用数组下标模拟服务端游标。
function CursorManaged() {
  const request = async (p: ProTableRequestParams) => {
    const name = String(p.filters.name ?? "").trim();
    const rows = ALL.filter((r) => (name ? r.name.includes(name) : true));
    const start = p.cursor == null ? 0 : Number(p.cursor);
    const page = rows.slice(start, start + p.pageSize);
    const next = start + p.pageSize;
    await new Promise((r) => setTimeout(r, 300));
    return {
      data: page,
      nextCursor: next < rows.length ? String(next) : null,
      hasMore: next < rows.length,
    };
  };
  return (
    <div className="w-full">
      <ProTable<Row>
        title="cursor 分页（上一页/下一页 · 无 total）"
        columns={columns}
        request={request}
        paginationMode="cursor"
        defaultPageSize={8}
        pageSizeOptions={[8, 16, 32]}
        getRowId={(r) => String(r.id)}
        search={{ fields: searchFields.slice(0, 1), collapsible: false, columns: 3 }}
      />
    </div>
  );
}

export const proTableShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "托管模式",
      description: "传 request 即由 ProTable 自管 page/sort/filters/loading/data，按需请求服务端。",
      code: `const request = async (p) => {
  const rows = await fetchEmployees(p.filters, p.sort);
  const start = (p.page - 1) * p.pageSize;
  return { data: rows.slice(start, start + p.pageSize), total: rows.length };
};

<ProTable
  title="员工列表"
  columns={columns}
  request={request}
  defaultPageSize={8}
  enableRowSelection
  search={{ fields: searchFields }}
/>`,
      render: () => <Managed />,
    },
    {
      title: "默认排序 + 固定查询参数",
      description:
        "defaultSorting 让首次 request 就带排序；params 是页面上下文钉死的条件，浅比较变化即回第 1 页重查。request/params 都可内联，不会重复请求。",
      code: `<ProTable
  title="默认按月薪倒序"
  columns={columns}
  defaultSorting={[{ id: "salary", desc: true }]}
  params={{ dept }}
  request={async (p) => {
    const { rows, total } = await api.list({
      page: p.page,
      pageSize: p.pageSize,
      sort: p.sort,
      ...p.filters,
      ...p.params,
    });
    return { data: rows, total };
  }}
/>`,
      render: () => <SortedWithParams />,
    },
    {
      title: "cursor 分页",
      description: "paginationMode=\"cursor\"，request 返回 { data, nextCursor, hasMore }，底部为上一页/下一页。",
      code: `<ProTable
  title="日志"
  columns={columns}
  request={request}
  paginationMode="cursor"
  defaultPageSize={8}
  pageSizeOptions={[8, 16, 32]}
/>`,
      render: () => <CursorManaged />,
    },
    {
      title: "展示模式（受控分页）",
      description: "自管 data/分页时，传 data + pagination + search 回调即可。",
      code: `<ProTable
  title="员工列表"
  columns={columns}
  data={pageData}
  enableRowSelection
  onReload={reload}
  toolbarActions={<Button size="sm">+ 新增员工</Button>}
  search={{ fields: searchFields, onSearch, onReset }}
  pagination={{ page, pageSize, total, onPageChange: setPage }}
/>`,
      render: () => <Demo />,
    },
    {
      title: "精简表",
      description: "紧凑密度 + 关掉全屏按钮 + 无查询区。",
      code: `<ProTable
  title="紧凑表"
  columns={columns.slice(0, 4)}
  data={rows}
  density="compact"
  toolbar={{ fullscreen: false }}
/>`,
      render: () => <Minimal />,
    },
  ],
  controls: [],
  states: [
    { name: "托管模式（服务端 request + 批量）", render: () => <Managed /> },
    { name: "默认排序 + 固定查询参数（defaultSorting / params）", render: () => <SortedWithParams /> },
    { name: "cursor 分页托管模式（上一页/下一页）", render: () => <CursorManaged /> },
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
