"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import {
  Button,
  ProTable,
  StatusDot,
  Tag,
  type ChannelStatus,
  type ColumnDef,
} from "@hulianui/ui";
import { requestLogs } from "../../_data/logs";
import { models, modelOf, providerOf } from "../../_data/providers";
import { apiKeys } from "../../_data/keys";
import { formatUsd } from "../../_lib/pricing";
import type { RequestLog } from "../../_data/types";
import { LogDetailDrawer } from "./log-detail-drawer";

const PAGE_SIZE = 8;

const statusMeta: Record<RequestLog["status"], { dot: ChannelStatus; label: string; tone: "success" | "danger" | "warning" }> = {
  success: { dot: "online", label: copy("success"), tone: "success" },
  error: { dot: "offline", label: copy("error"), tone: "danger" },
  rate_limited: { dot: "degraded", label: copy("currentLimiting"), tone: "warning" },
  timeout: { dot: "offline", label: copy("timeout"), tone: "danger" },
};

const opt = (arr: { value: string; label: string }[], allLabel = copy("all")) => [
  { value: "", label: allLabel },
  ...arr,
];

export default function LogsPage() {
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [active, setActive] = useState<RequestLog | null>(null);

  const filtered = useMemo(() => {
    return requestLogs.filter((l) => {
      if (filters.model && l.model !== filters.model) return false;
      if (filters.status && l.status !== filters.status) return false;
      if (filters.keyName && l.keyName !== filters.keyName) return false;
      return true;
    });
  }, [filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<RequestLog>[] = [
    {
      accessorKey: "time",
      header: copy("time"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted-foreground">
          {row.original.time.slice(5, 19).replace("T", " ")}
        </span>
      ),
    },
    {
      accessorKey: "model",
      header: copy("model"),
      cell: ({ row }) => {
        const m = modelOf(row.original.model);
        const p = m ? providerOf(m.provider) : undefined;
        return (
          <div className="flex items-center gap-1.5">
            {p && (
              <span
                className="inline-flex size-4 shrink-0 items-center justify-center rounded-[3px] text-[9px] font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.glyph}
              </span>
            )}
            <span className="truncate">{m?.name ?? row.original.model}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "channel",
      header: copy("channel"),
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.channel}</span>,
    },
    {
      accessorKey: "keyName",
      header: copy("key"),
      cell: ({ row }) => (
        <Tag tone="neutral" size="sm" variant="soft">
          {row.original.keyName}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: copy("status"),
      cell: ({ row }) => {
        const meta = statusMeta[row.original.status];
        return <StatusDot status={meta.dot} label={meta.label} extra={`HTTP ${row.original.httpStatus}`} />;
      },
    },
    {
      accessorKey: "latencyMs",
      header: copy("delay"),
      cell: ({ row }) => {
        const ms = row.original.latencyMs;
        return (
          <span className={`tabular-nums ${ms >= 5000 ? "text-danger" : ms >= 1500 ? "text-warning" : "text-foreground"}`}>
            {ms.toLocaleString()} ms
          </span>
        );
      },
    },
    {
      id: "tokens",
      header: "Tokens",
      enableSorting: false,
      cell: ({ row }) => (
        <span className="whitespace-nowrap tabular-nums text-xs text-muted-foreground">
          <span className="text-foreground">{row.original.promptTokens.toLocaleString()}</span> /{" "}
          <span className="text-foreground">{row.original.completionTokens.toLocaleString()}</span>
        </span>
      ),
    },
    {
      accessorKey: "costUsd",
      header: copy("cost"),
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatUsd(row.original.costUsd)}</span>
      ),
    },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="link" size="sm" onClick={() => setActive(row.original)}>{copy("details")}</Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{copy("usageLog")}</h1>
        <p className="text-sm text-muted-foreground">{copy("requestByRequestCallRecordClickDetails")}</p>
      </div>

      <ProTable<RequestLog>
        title={copy("requestLog")}
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        search={{
          fields: [
            {
              name: "model",
              label: copy("model2"),
              type: "select",
              options: opt(models.map((m) => ({ value: m.id, label: m.name }))),
            },
            {
              name: "status",
              label: copy("status2"),
              type: "select",
              options: opt([
                { value: "success", label: copy("success2") },
                { value: "error", label: copy("error2") },
                { value: "rate_limited", label: copy("currentLimiting2") },
                { value: "timeout", label: copy("timeout2") },
              ]),
            },
            {
              name: "keyName",
              label: copy("key2"),
              type: "select",
              options: opt(apiKeys.map((k) => ({ value: k.name, label: k.name }))),
            },
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

      <LogDetailDrawer log={active} onClose={() => setActive(null)} />
    </div>
  );
}
