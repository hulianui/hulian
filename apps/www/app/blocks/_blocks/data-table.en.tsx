"use client";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { Avatar, Button, Input, Popconfirm, ProTable, Select, SelectContent, SelectItem, SelectTrigger, Tag, Tooltip, TooltipContent, TooltipTrigger, toast, type ColumnDef, } from "@hulianui/ui";
type OrderStatus = "Pending" | "In progress" | "Completed" | "Canceled";
type Priority = "High" | "Medium" | "Low";
interface WorkOrder {
    id: string;
    title: string;
    assignee: string;
    department: string;
    status: OrderStatus;
    priority: Priority;
    createdAt: string;
}
const STATUS_TONE: Record<OrderStatus, "warning" | "brand" | "success" | "danger"> = {
    "Pending": "warning",
    "In progress": "brand",
    "Completed": "success",
    "Canceled": "danger",
};
const PRIORITY_TONE: Record<Priority, "danger" | "warning" | "neutral"> = {
    "High": "danger",
    "Medium": "warning",
    "Low": "neutral",
};
const SEED_DATA: WorkOrder[] = [
    { id: "WO-001", title: "Migrate servers to the new data center", assignee: "Zhang Xiaoming", department: "infrastructure", status: "In progress", priority: "High", createdAt: "2026-06-01" },
    { id: "WO-002", title: "Database index optimization", assignee: "Li Siyuan", department: "database", status: "Pending", priority: "Medium", createdAt: "2026-06-02" },
    { id: "WO-003", title: "Add front-end performance monitoring", assignee: "Wang Xuemei", department: "front end", status: "Completed", priority: "Low", createdAt: "2026-06-02" },
    { id: "WO-004", title: "Security vulnerability fixes CVE-2026", assignee: "Chen Jianguo", department: "Security", status: "In progress", priority: "High", createdAt: "2026-06-03" },
    { id: "WO-005", title: "Log system expansion", assignee: "Liu Fang", department: "Operations", status: "Pending", priority: "Medium", createdAt: "2026-06-03" },
    { id: "WO-006", title: "Update API documentation", assignee: "Zhao Lei", department: "backend", status: "Completed", priority: "Low", createdAt: "2026-06-04" },
    { id: "WO-007", title: "Mask sensitive data in test environments", assignee: "Zhou Chen", department: "database", status: "Canceled", priority: "Medium", createdAt: "2026-06-04" },
    { id: "WO-008", title: "CI/CD pipeline optimization", assignee: "Wu Kai", department: "infrastructure", status: "In progress", priority: "High", createdAt: "2026-06-05" },
    { id: "WO-009", title: "Improve the mobile layout", assignee: "Sun Li", department: "front end", status: "Pending", priority: "Medium", createdAt: "2026-06-05" },
    { id: "WO-010", title: "Cache layer architecture reconstruction", assignee: "He Ming", department: "backend", status: "Pending", priority: "High", createdAt: "2026-06-05" },
];
const DEPARTMENTS = ["infrastructure", "database", "front end", "backend", "Security", "Operations"];
const STATUSES: OrderStatus[] = ["Pending", "In progress", "Completed", "Canceled"];
const opt = (arr: readonly string[], allLabel = "All") => [
    { value: "", label: allLabel },
    ...arr.map((v) => ({ value: v, label: v })),
];
const PAGE_SIZE = 6;
export function DataTableBlock() {
    const [rows, setRows] = useState<WorkOrder[]>(SEED_DATA);
    const [keyword, setKeyword] = useState("");
    const [status, setStatus] = useState("");
    const [department, setDepartment] = useState("");
    const [page, setPage] = useState(1);
    const filtered = useMemo(() => {
        const kw = keyword.trim();
        return rows.filter((r) => {
            if (kw && !`${r.title}${r.assignee}${r.id}`.includes(kw))
                return false;
            if (status && r.status !== status)
                return false;
            if (department && r.department !== department)
                return false;
            return true;
        });
    }, [rows, keyword, status, department]);
    const total = filtered.length;
    const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const columns: ColumnDef<WorkOrder>[] = [
        {
            accessorKey: "id",
            header: "Ticket ID",
            cell: ({ row }) => (<span className="font-mono text-xs text-muted-foreground tabular-nums">{row.original.id}</span>),
        },
        {
            accessorKey: "title",
            header: "Ticket title",
            cell: ({ row }) => (<div className="flex items-center gap-3">
          <Avatar fallback={row.original.assignee.slice(0, 1)} size="sm"/>
          <div className="min-w-0">
            <div className="truncate font-medium text-foreground">{row.original.title}</div>
            <div className="text-xs text-muted-foreground">{row.original.assignee} · {row.original.department}</div>
          </div>
        </div>),
        },
        {
            accessorKey: "priority",
            header: "priority",
            cell: ({ row }) => (<Tag tone={PRIORITY_TONE[row.original.priority]} size="sm" variant="soft">
          {row.original.priority}
        </Tag>),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (<Tag tone={STATUS_TONE[row.original.status]} size="sm" dot>
          {row.original.status}
        </Tag>),
        },
        { accessorKey: "createdAt", header: "Created" },
        {
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({ row }) => (<div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="iconSm" aria-label={`View ticket ${row.original.id}`} onClick={() => toast({ title: "View ticket", description: row.original.title, tone: "info" })}>
                  <Eye className="size-3.5"/>
                </Button>}/>
            <TooltipContent>View details</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="ghost" size="iconSm" aria-label={`Edit ticket ${row.original.id}`} onClick={() => toast({ title: "Edit ticket", description: row.original.title, tone: "info" })}>
                  <Pencil className="size-3.5"/>
                </Button>}/>
            <TooltipContent>Edit</TooltipContent>
          </Tooltip>
          <Popconfirm title="Delete this ticket?" description="This action cannot be undone." danger okText="Remove" onConfirm={() => {
                    setRows((rs) => rs.filter((r) => r.id !== row.original.id));
                    toast({ title: "Ticket deleted", description: row.original.id, tone: "danger" });
                }}>
            <Tooltip>
              <TooltipTrigger render={<Button variant="ghost" size="iconSm" tone="danger" aria-label={`Delete ticket ${row.original.id}`}>
                    <Trash2 className="size-3.5"/>
                  </Button>}/>
              <TooltipContent>Remove</TooltipContent>
            </Tooltip>
          </Popconfirm>
        </div>),
        },
    ];
    return (<div className="mx-auto w-full max-w-6xl">
      <ProTable<WorkOrder> title="Tickets" columns={columns} data={paged} getRowId={(r) => r.id} toolbarActions={<Button size="sm" onClick={() => toast({ title: "Create ticket", description: "Open a new form (demo)", tone: "info" })}>
            <Plus className="size-4"/>
            Create ticket
          </Button>} search={{
            fields: [
                { name: "keyword", label: "Keywords", placeholder: "Ticket title / owner / ID" },
                { name: "status", label: "Status", type: "select", options: opt(STATUSES) },
                { name: "department", label: "Department", type: "select", options: opt(DEPARTMENTS) },
            ],
            onSearch: (v) => {
                setKeyword(String(v.keyword ?? ""));
                setStatus(String(v.status ?? ""));
                setDepartment(String(v.department ?? ""));
                setPage(1);
            },
            onReset: () => {
                setKeyword("");
                setStatus("");
                setDepartment("");
                setPage(1);
            },
        }} pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}/>
    </div>);
}
