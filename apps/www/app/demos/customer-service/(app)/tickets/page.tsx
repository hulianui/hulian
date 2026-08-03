"use client";
import { copy } from "./page.content";
import { channelLabel, ticketPriorityLabel, ticketStatusLabel } from "../../_data/labels";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import {
  Alert,
  Button,
  Popconfirm,
  ProTable,
  Tag,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  toast,
  type ColumnDef,
} from "@hulianui/ui";
import { tickets as seed } from "../../_data/tickets";
import type { Ticket, TicketPriority, TicketStatus } from "../../_data/types";
import { CS_ROOT } from "../../_components/nav-config";
import { useMockData } from "../../../lib/async";

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

const opt = (arr: readonly string[], labels?: Readonly<Record<string, string>>, allLabel = copy("all")) => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: labels?.[v] ?? v })),
];

export default function TicketsPage() {
  const { data, loading, error, reload } = useMockData(seed, { failOnce: true });
  const [rows, setRows] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((t) => {
      if (kw && !`${t.id}${t.subject}${t.customerName}`.includes(kw)) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      return true;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const closeTicket = (id: string) => {
    setRows((prev) => prev.map((t) => (t.id === id ? { ...t, status: "已解决" as TicketStatus } : t)));
    toast({ title: copy("ticketHasBeenClosed"), description: copy("ticketValueHasBeenMarkedAsResolved", id), tone: "info" });
  };

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: "id",
      header: copy("workOrderNumber"),
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
      header: copy("topic"),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate">{row.original.subject}</div>
          <div className="truncate text-xs text-muted">
            {channelLabel[row.original.channel]} · {row.original.customerName}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "priority",
      header: copy("priority"),
      cell: ({ row }) => (
        <Tag tone={PRIORITY_TONE[row.original.priority]} size="sm" dot pulse={row.original.priority === "紧急"}>
          {ticketPriorityLabel[row.original.priority]}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: copy("status"),
      cell: ({ row }) => (
        <Tag tone={STATUS_TONE[row.original.status]} size="sm">
          {ticketStatusLabel[row.original.status]}
        </Tag>
      ),
    },
    { accessorKey: "assignee", header: copy("assignee") },
    {
      accessorKey: "updatedAt",
      header: copy("updateTime"),
      cell: ({ row }) => <span className="tabular-nums text-muted">{row.original.updatedAt}</span>,
    },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => {
        const ticket = row.original;
        const isResolved = ticket.status === "已解决";
        return (
          <div className="flex items-center gap-1">
            <Button variant="link" size="sm" render={<Link href={`${CS_ROOT}/tickets/${ticket.id}`} />}>{copy("view")}</Button>
            {!isResolved && (
              <Popconfirm
                title={copy("confirmToCloseTheWorkOrder")}
                description={copy("afterClosingTheStatusChangesToResolved")}
                danger
                okText={copy("close")}
                onConfirm={() => closeTicket(ticket.id)}
              >
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button variant="ghost" size="sm" className="size-7 px-0" aria-label={copy("closeTicket")}>
                        <CheckCircle2 className="size-4" />
                      </Button>
                    }
                  />
                  <TooltipContent>{copy("closeTicket2")}</TooltipContent>
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <Alert tone="danger" className="mb-1">
          {error}
          <Button size="sm" variant="ghost" onClick={reload} className="ml-2">{copy("tryAgain")}</Button>
        </Alert>
      )}
      <ProTable<Ticket>
        title={copy("workOrderManagement")}
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        search={{
          fields: [
            { name: "keyword", label: copy("keywords"), placeholder: copy("ticketNumberSubjectCustomer") },
            { name: "status", label: copy("status2"), type: "select", options: opt(STATUSES, ticketStatusLabel) },
            { name: "priority", label: copy("priority2"), type: "select", options: opt(PRIORITIES, ticketPriorityLabel) },
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
    </div>
  );
}
