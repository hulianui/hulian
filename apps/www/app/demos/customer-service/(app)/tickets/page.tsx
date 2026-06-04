"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button, ProTable, Tag, type ColumnDef } from "@hulian/ui";
import { tickets as seed } from "../../_data/tickets";
import type { Ticket, TicketPriority, TicketStatus } from "../../_data/types";
import { CS_ROOT } from "../../_components/nav-config";

const PRIORITY_TONE: Record<TicketPriority, "neutral" | "brand" | "warning" | "danger"> = {
  低: "neutral",
  中: "brand",
  高: "warning",
  紧急: "danger",
};
const STATUS_TONE: Record<TicketStatus, "neutral" | "brand" | "warning" | "success"> = {
  待处理: "neutral",
  处理中: "brand",
  待回复: "warning",
  已解决: "success",
};

const PRIORITIES: TicketPriority[] = ["低", "中", "高", "紧急"];
const STATUSES: TicketStatus[] = ["待处理", "处理中", "待回复", "已解决"];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], allLabel = "全部") => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: v })),
];

export default function TicketsPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return seed.filter((t) => {
      if (kw && !`${t.id}${t.subject}${t.customerName}`.includes(kw)) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    });
  }, [filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "id",
      header: "工单号",
      cell: ({ row }) => (
        <Link
          href={`${CS_ROOT}/tickets/${row.original.id}`}
          className="font-medium tabular-nums hover:text-primary"
        >
          #{row.original.id}
        </Link>
      ),
    },
    {
      accessorKey: "subject",
      header: "主题",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate">{row.original.subject}</div>
          <div className="truncate text-xs text-muted">
            {row.original.channel} · {row.original.customerName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: "优先级",
      cell: ({ row }) => (
        <Tag tone={PRIORITY_TONE[row.original.priority]} size="sm" dot pulse={row.original.priority === "紧急"}>
          {row.original.priority}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Tag tone={STATUS_TONE[row.original.status]} size="sm">
          {row.original.status}
        </Tag>
      ),
    },
    { accessorKey: "assignee", header: "受理人" },
    {
      accessorKey: "updatedAt",
      header: "更新时间",
      cell: ({ row }) => <span className="tabular-nums text-muted">{row.original.updatedAt}</span>,
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" render={<Link href={`${CS_ROOT}/tickets/${row.original.id}`} />}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <ProTable<Ticket>
      title="工单管理"
      columns={columns}
      data={paged}
      getRowId={(r) => r.id}
      search={{
        fields: [
          { name: "keyword", label: "关键词", placeholder: "工单号 / 主题 / 客户" },
          { name: "status", label: "状态", type: "select", options: opt(STATUSES) },
          { name: "priority", label: "优先级", type: "select", options: opt(PRIORITIES) },
        ],
        onSearch: (v) => {
          setFilters(v);
          setPage(1);
        },
        onReset: () => {
          setFilters({});
          setPage(1);
        },
      }}
      pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
    />
  );
}
