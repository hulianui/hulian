"use client";
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
  success: { dot: "online", label: "成功", tone: "success" },
  error: { dot: "offline", label: "错误", tone: "danger" },
  rate_limited: { dot: "degraded", label: "限流", tone: "warning" },
  timeout: { dot: "offline", label: "超时", tone: "danger" },
};

const opt = (arr: { value: string; label: string }[], allLabel = "全部") => [
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
      header: "时间",
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-mono text-xs tabular-nums text-muted">
          {row.original.time.slice(5, 19).replace("T", " ")}
        </span>
      ),
    },
    {
      accessorKey: "model",
      header: "模型",
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
      header: "渠道",
      cell: ({ row }) => <span className="text-sm text-muted">{row.original.channel}</span>,
    },
    {
      accessorKey: "keyName",
      header: "密钥",
      cell: ({ row }) => (
        <Tag tone="neutral" size="sm" variant="soft">
          {row.original.keyName}
        </Tag>
      ),
    },
    {
      accessorKey: "status",
      header: "状态",
      cell: ({ row }) => {
        const meta = statusMeta[row.original.status];
        return <StatusDot status={meta.dot} label={meta.label} extra={`HTTP ${row.original.httpStatus}`} />;
      },
    },
    {
      accessorKey: "latencyMs",
      header: "延迟",
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
        <span className="whitespace-nowrap tabular-nums text-xs text-muted">
          <span className="text-foreground">{row.original.promptTokens.toLocaleString()}</span> /{" "}
          <span className="text-foreground">{row.original.completionTokens.toLocaleString()}</span>
        </span>
      ),
    },
    {
      accessorKey: "costUsd",
      header: "花费",
      cell: ({ row }) => (
        <span className="tabular-nums font-medium">{formatUsd(row.original.costUsd)}</span>
      ),
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="link" size="sm" onClick={() => setActive(row.original)}>
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">用量日志</h1>
        <p className="text-sm text-muted">逐请求调用记录 · 点「详情」查看完整 request / response 与计费链路</p>
      </div>

      <ProTable<RequestLog>
        title="请求日志"
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        search={{
          fields: [
            {
              name: "model",
              label: "模型",
              type: "select",
              options: opt(models.map((m) => ({ value: m.id, label: m.name }))),
            },
            {
              name: "status",
              label: "状态",
              type: "select",
              options: opt([
                { value: "success", label: "成功" },
                { value: "error", label: "错误" },
                { value: "rate_limited", label: "限流" },
                { value: "timeout", label: "超时" },
              ]),
            },
            {
              name: "keyName",
              label: "密钥",
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
