"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  ProTable,
  Tag,
  type ColumnDef,
} from "@hulian/ui";
import { ROOT } from "../../_components/nav-config";
import { quotes as seed, quoteTotals } from "../../_data/quotes";
import { quoteStatusTone, yuan } from "../../_data/status";
import { OWNERS, type Quote, type QuoteStatus } from "../../_data/types";
import { useMockData } from "../../../lib/async";

const STATUSES: QuoteStatus[] = ["草稿", "已发送", "已确认", "已失效"];
const PAGE_SIZE = 8;

const opt = (arr: readonly string[], allLabel = "全部") => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: v })),
];

export default function QuotesPage() {
  const { data, loading } = useMockData(seed);
  const [rows, setRows] = useState<Quote[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((q) => {
      if (kw && !`${q.code}${q.projectName}${q.client}`.includes(kw)) return false;
      if (filters.status && q.status !== filters.status) return false;
      if (filters.owner && q.owner !== filters.owner) return false;
      return true;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<Quote>[] = [
    {
      accessorKey: "code",
      header: "报价单",
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="min-w-0">
            <Link href={`${ROOT}/quotes/${q.id}`} className="font-medium tabular-nums hover:text-primary">
              {q.code}
            </Link>
            <div className="truncate text-xs text-muted">{q.projectName}</div>
          </div>
        );
      },
    },
    { accessorKey: "client", header: "甲方抬头" },
    { accessorKey: "owner", header: "制单人" },
    {
      id: "amount",
      header: "价税合计",
      cell: ({ row }) => {
        const t = quoteTotals(row.original.items, row.original.taxRate);
        return <span className="tabular-nums font-medium">{yuan(t.total)}</span>;
      },
    },
    { accessorKey: "createdAt", header: "制单日期" },
    { accessorKey: "validUntil", header: "有效期至" },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => (
        <Tag tone={quoteStatusTone(row.original.status)} size="sm" dot>
          {row.original.status}
        </Tag>
      ),
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="link" size="sm" render={<Link href={`${ROOT}/quotes/${row.original.id}`} />}>
          查看 / 编辑
        </Button>
      ),
    },
  ];

  return (
    <ProTable<Quote>
      title="报价单"
      columns={columns}
      data={paged}
      loading={loading}
      getRowId={(r) => r.id}
      search={{
        fields: [
          { name: "keyword", label: "关键词", placeholder: "单号 / 项目 / 甲方" },
          { name: "status", label: "状态", type: "select", options: opt(STATUSES) },
          { name: "owner", label: "制单人", type: "select", options: opt(OWNERS) },
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
