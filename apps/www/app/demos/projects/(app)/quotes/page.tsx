"use client";
import { copy } from "./page.content";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Button,
  ProTable,
  Tag,
  type ColumnDef,
} from "@hulianui/ui";
import { ROOT } from "../../_components/nav-config";
import { quotes as seed, quoteTotals } from "../../_data/quotes";
import { quoteStatusLabel, quoteStatusTone, yuan } from "../../_data/status";
import { type Quote, type QuoteStatus } from "../../_data/types";
import { useMockData } from "../../../lib/async";

const STATUSES: QuoteStatus[] = ["草稿", "已发送", "已确认", "已失效"];
const PAGE_SIZE = 8;
const OWNER_OPTIONS = [...new Set(seed.map((quote) => quote.owner))];

const opt = (arr: readonly string[], labels?: Readonly<Record<string, string>>, allLabel = copy("all")) => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: labels?.[v] ?? v })),
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
      header: copy("quotation"),
      cell: ({ row }) => {
        const q = row.original;
        return (
          <div className="min-w-0">
            <Link href={`${ROOT}/quotes/${q.id}`} className="font-medium tabular-nums hover:text-primary">
              {q.code}
            </Link>
            <div className="truncate text-xs text-muted-foreground">{q.projectName}</div>
          </div>
        );
      },
    },
    { accessorKey: "client", header: copy("partyARaisesItsHead") },
    { accessorKey: "owner", header: copy("maker") },
    {
      id: "amount",
      header: copy("totalPriceAndTax"),
      cell: ({ row }) => {
        const t = quoteTotals(row.original.items, row.original.taxRate);
        return <span className="tabular-nums font-medium">{yuan(t.total)}</span>;
      },
    },
    { accessorKey: "createdAt", header: copy("orderMakingDate") },
    { accessorKey: "validUntil", header: copy("validUntil") },
    {
      accessorKey: "status",
      header: copy("status"),
      cell: ({ row }) => (
        <Tag tone={quoteStatusTone(row.original.status)} size="sm" dot>
          {quoteStatusLabel[row.original.status]}
        </Tag>
      ),
    },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="link" size="sm" render={<Link href={`${ROOT}/quotes/${row.original.id}`} />}>{copy("viewEdit")}</Button>
      ),
    },
  ];

  return (
    <ProTable<Quote>
      title={copy("quotation2")}
      columns={columns}
      data={paged}
      loading={loading}
      getRowId={(r) => r.id}
      search={{
        fields: [
          { name: "keyword", label: copy("keywords"), placeholder: copy("orderNoProjectPartyA") },
          { name: "status", label: copy("status2"), type: "select", options: opt(STATUSES, quoteStatusLabel) },
          { name: "owner", label: copy("maker2"), type: "select", options: opt(OWNER_OPTIONS) },
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
