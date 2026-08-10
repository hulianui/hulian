"use client";
import { useMemo, useState } from "react";
import type { ColumnDef } from "../../../../packages/ui/src/table/table.types";
import type { SearchField } from "../../../../packages/ui/src/search-form/search-form.types";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Tag, type TagTone } from "../../../../packages/ui/src/tag";
import { ProTable } from "../../../../packages/ui/src/pro-table/pro-table";
import type { ProTableRequestParams } from "../../../../packages/ui/src/pro-table/pro-table.types";
interface Row {
    id: number;
    name: string;
    dept: string;
    status: "active" | "leave" | "pending";
    date: string;
    salary: number;
}
const STATUS: Record<Row["status"], {
    label: string;
    tone: TagTone;
}> = {
    active: { label: "Working", tone: "success" },
    leave: { label: "Resignation", tone: "neutral" },
    pending: { label: "To be hired", tone: "warning" },
};
const DEPTS = ["R&D Department", "Marketing Department", "Finance Department", "Human Resources Department"];
const ALL: Row[] = Array.from({ length: 47 }, (_, i) => ({
    id: i + 1,
    name: `Employees ${String(i + 1).padStart(2, "0")}`,
    dept: DEPTS[i % DEPTS.length],
    status: (["active", "leave", "pending"] as const)[i % 3],
    date: `2024-${String((i % 12) + 1).padStart(2, "0")}-15`,
    salary: 8000 + (i % 10) * 1500,
}));
const columns: ColumnDef<Row, any>[] = [
    { accessorKey: "id", header: "Employee ID", size: 60 },
    { accessorKey: "name", header: "Name", meta: { sticky: "left" } },
    { accessorKey: "dept", header: "Department" },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
            const s = STATUS[getValue() as Row["status"]];
            return (<Tag tone={s.tone} dot>
          {s.label}
        </Tag>);
        },
    },
    { accessorKey: "date", header: "Date of joining" },
    {
        accessorKey: "salary",
        header: "Monthly salary",
        cell: ({ getValue }) => `\u00A5${(getValue() as number).toLocaleString()}`,
    },
];
const searchFields: SearchField[] = [
    { name: "name", label: "Name", placeholder: "Search Name" },
    {
        name: "dept",
        label: "Department",
        type: "select",
        options: [{ value: "", label: "All" }, ...DEPTS.map((d) => ({ value: d, label: d }))],
    },
    {
        name: "status",
        label: "Status",
        type: "select",
        options: [
            { value: "", label: "All" },
            { value: "active", label: "Working" },
            { value: "leave", label: "Resignation" },
            { value: "pending", label: "To be hired" },
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
            if (name && !r.name.includes(name))
                return false;
            if (dept && r.dept !== dept)
                return false;
            if (status && r.status !== status)
                return false;
            return true;
        });
    }, [query]);
    const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
    const reload = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 700);
    };
    return (<div className="w-full">
      <ProTable<Row> title="Employee List" columns={columns} data={pageData} loading={loading} onReload={reload} getRowId={(r) => String(r.id)} enableRowSelection toolbarActions={<Button size="sm">+ New employee</Button>} search={{
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
        }} pagination={{ page, pageSize, total: filtered.length, onPageChange: setPage }}/>
    </div>);
}
function Minimal() {
    return (<div className="w-full">
      <ProTable<Row> title="Compact table (no query area)" columns={columns.slice(0, 4)} data={ALL.slice(0, 5)} density="compact" toolbar={{ fullscreen: false }} getRowId={(r) => String(r.id)}/>
    </div>);
}
function Managed() {
    const request = async (p: ProTableRequestParams) => {
        const name = String(p.filters.name ?? "").trim();
        let rows = ALL.filter((r) => (name ? r.name.includes(name) : true));
        if (p.sort) {
            const f = p.sort.field as keyof Row;
            rows = [...rows].sort((a, b) => (a[f] < b[f] ? -1 : a[f] > b[f] ? 1 : 0));
            if (p.sort.order === "desc")
                rows.reverse();
        }
        const total = rows.length;
        const start = (p.page - 1) * p.pageSize;
        await new Promise((r) => setTimeout(r, 300));
        return { data: rows.slice(start, start + p.pageSize), total };
    };
    return (<div className="w-full">
      <ProTable<Row> title="Hosting mode (server request)" columns={columns} request={request} defaultPageSize={8} getRowId={(r) => String(r.id)} enableRowSelection batchActions={({ selectedRowKeys, clearSelection }) => (<Button size="sm" tone="danger" onClick={clearSelection}>
            Delete selected {selectedRowKeys.length}
          </Button>)} search={{ fields: searchFields, collapsible: false, columns: 3, onSearch: () => { } }}/>
    </div>);
}
function SortedWithParams() {
    const [dept, setDept] = useState<string>(DEPTS[0]);
    return (<div className="flex w-full flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Department (fixed query parameters)</span>
        {DEPTS.map((d) => (<Button key={d} size="sm" variant={d === dept ? "solid" : "outline"} onClick={() => setDept(d)}>
            {d}
          </Button>))}
      </div>
      <ProTable<Row> title="Default is in descending order of monthly salary" columns={columns} defaultSorting={[{ id: "salary", desc: true }]} params={{ dept }} request={async (p) => {
            const scope = String(p.params?.dept ?? "");
            let rows = ALL.filter((r) => (scope ? r.dept === scope : true));
            if (p.sort) {
                const f = p.sort.field as keyof Row;
                rows = [...rows].sort((a, b) => (a[f] < b[f] ? -1 : a[f] > b[f] ? 1 : 0));
                if (p.sort.order === "desc")
                    rows.reverse();
            }
            const start = (p.page - 1) * p.pageSize;
            await new Promise((r) => setTimeout(r, 300));
            return { data: rows.slice(start, start + p.pageSize), total: rows.length };
        }} defaultPageSize={5} getRowId={(r) => String(r.id)}/>
    </div>);
}
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
    return (<div className="w-full">
      <ProTable<Row> title="cursor Paging (Previous Page/Next Page · None total)" columns={columns} request={request} paginationMode="cursor" defaultPageSize={8} pageSizeOptions={[8, 16, 32]} getRowId={(r) => String(r.id)} search={{ fields: searchFields.slice(0, 1), collapsible: false, columns: 3 }}/>
    </div>);
}
export const proTableShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Hosted Mode",
            description: "Pass request, that is, ProTable will manage page/sort/filters/loading/data by itself and request the server on demand.",
            code: `const request = async (p) => {
  const rows = await fetchEmployees(p.filters, p.sort);
  const start = (p.page - 1) * p.pageSize;
  return { data: rows.slice(start, start + p.pageSize), total: rows.length };
};

<ProTable
  title="Employee List"
  columns={columns}
  request={request}
  defaultPageSize={8}
  enableRowSelection
  search={{ fields: searchFields }}
/>`,
            render: () => <Managed />,
        },
        {
            title: "Default sorting + fixed query parameters",
            description: "defaultSorting allows request to be sorted for the first time; params is the condition for nailing the page context, and the shallow comparison changes will return to page 1 for rechecking. request/params can all be inlined and no requests will be repeated.",
            code: `<ProTable
  title="Default is in descending order of monthly salary"
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
            title: "cursor Paging",
            description: "paginationMode=\"cursor\", request returns { data, nextCursor, hasMore }, with the previous/next page at the bottom.",
            code: `<ProTable
  title="Log"
  columns={columns}
  request={request}
  paginationMode="cursor"
  defaultPageSize={8}
  pageSizeOptions={[8, 16, 32]}
/>`,
            render: () => <CursorManaged />,
        },
        {
            title: "Display mode (controlled paging)",
            description: "When managing data/paging, just pass data + pagination + search callback.",
            code: `<ProTable
  title="Employee List"
  columns={columns}
  data={pageData}
  enableRowSelection
  onReload={reload}
  toolbarActions={<Button size="sm">+ New employee</Button>}
  search={{ fields: searchFields, onSearch, onReset }}
  pagination={{ page, pageSize, total, onPageChange: setPage }}
/>`,
            render: () => <Demo />,
        },
        {
            title: "Simplified table",
            description: "Compact density + full screen button off + no query area.",
            code: `<ProTable
  title="Compact Table"
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
        { name: "Hosting mode (server request + batch)", render: () => <Managed /> },
        { name: "Default sorting + fixed query parameters (defaultSorting / params)", render: () => <SortedWithParams /> },
        { name: "cursor Paging hosting mode (previous page/next page)", render: () => <CursorManaged /> },
        { name: "Complete (query area + toolbar + row selection + paging)", render: () => <Demo /> },
        { name: "Streamlined (compact density \u00B7 no query area)", render: () => <Minimal /> },
    ],
    renderWithProps: () => <Demo />,
    toCode: () => `<ProTable
  title="Employee List"
  columns={columns}
  data={pageData}
  enableRowSelection
  onReload={reload}
  toolbarActions={<Button size="sm">+ New</Button>}
  search={{ fields, onSearch, onReset }}
  pagination={{ page, pageSize, total, onPageChange: setPage }}
/>`,
};
