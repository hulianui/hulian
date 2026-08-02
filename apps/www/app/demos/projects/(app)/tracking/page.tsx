"use client";
import { copy } from "./page.content";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutList, SquareKanban } from "lucide-react";
import {
  Alert,
  Button,
  Kanban,
  type KanbanColumn,
  type KanbanMoveEvent,
  ProTable,
  Progress,
  Segmented,
  Spinner,
  Tag,
  Text,
  type ColumnDef,
} from "@hulianui/ui";
import { ROOT } from "../../_components/nav-config";
import { projects as seed } from "../../_data/projects";
import { projectStageLabel, projectStatusLabel, projectStatusTone, wan, yuan } from "../../_data/status";
import { PROJECT_STAGES, type Project, type ProjectStage } from "../../_data/types";
import { useMockData } from "../../../lib/async";

const STATUSES = ["待开工", "进行中", "已暂停", "已完工", "已结算"] as const;
const PAGE_SIZE = 8;
const OWNER_OPTIONS = [...new Set(seed.map((project) => project.owner))];

const opt = (arr: readonly string[], labels?: Readonly<Record<string, string>>, allLabel = copy("all")) => [
  { value: "", label: allLabel },
  ...arr.map((v) => ({ value: v, label: labels?.[v] ?? v })),
];

const KANBAN_COLUMNS: KanbanColumn[] = PROJECT_STAGES.map((s) => ({ id: s, title: projectStageLabel[s] }));

export default function TrackingPage() {
  const { data, loading, error, reload } = useMockData(seed, { failOnce: true });
  const [rows, setRows] = useState<Project[]>([]);
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [view, setView] = useState("list");

  useEffect(() => {
    if (data) setRows(data);
  }, [data]);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    return rows.filter((r) => {
      if (kw && !`${r.code}${r.name}${r.client}`.includes(kw)) return false;
      if (filters.stage && r.stage !== filters.stage) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.owner && r.owner !== filters.owner) return false;
      return true;
    });
  }, [rows, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // 看板拖拽：把项目移到目标阶段（同时更新进度归属）。
  const onMove = (e: KanbanMoveEvent) => {
    setRows((rs) => rs.map((r) => (r.id === e.id ? { ...r, stage: e.toColumn as ProjectStage } : r)));
  };

  const columns: ColumnDef<Project>[] = [
    {
      accessorKey: "code",
      header: copy("project"),
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="min-w-0">
            <Link href={`${ROOT}/tracking/${p.id}`} className="font-medium hover:text-primary">
              {p.name}
            </Link>
            <div className="text-xs text-muted tabular-nums">{p.code}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "client",
      header: copy("partyATeam"),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate text-sm">{row.original.client}</div>
          <div className="truncate text-xs text-muted">{row.original.crew}</div>
        </div>
      ),
    },
    { accessorKey: "owner", header: copy("personInCharge") },
    {
      accessorKey: "stage",
      header: copy("stage"),
      cell: ({ row }) => (
        <Tag tone="brand" size="sm" variant="soft">
          {projectStageLabel[row.original.stage]}
        </Tag>
      ),
    },
    {
      accessorKey: "progress",
      header: copy("progress"),
      cell: ({ row }) => (
        <div className="flex w-28 items-center gap-2">
          <Progress variant="linear" value={row.original.progress} className="flex-1" />
          <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted">{row.original.progress}%</span>
        </div>
      ),
    },
    {
      accessorKey: "contractAmount",
      header: copy("contractAmount"),
      cell: ({ row }) => <span className="tabular-nums">{yuan(row.original.contractAmount)}</span>,
    },
    {
      accessorKey: "status",
      header: copy("status"),
      cell: ({ row }) => (
        <Tag tone={projectStatusTone(row.original.status)} size="sm" dot>
          {projectStatusLabel[row.original.status]}
        </Tag>
      ),
    },
    { accessorKey: "dueAt", header: copy("plannedCompletion") },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => (
        <Button variant="link" size="sm" render={<Link href={`${ROOT}/tracking/${row.original.id}`} />}>{copy("view")}</Button>
      ),
    },
  ];

  const viewSwitch = (
    <Segmented
      size="sm"
      value={view}
      onValueChange={setView}
      items={[
        { value: "list", label: <span className="inline-flex items-center gap-1.5"><LayoutList className="size-4" />{copy("list")}</span> },
        { value: "board", label: <span className="inline-flex items-center gap-1.5"><SquareKanban className="size-4" />{copy("kanban")}</span> },
      ]}
    />
  );

  const errorBanner = error ? (
    <Alert tone="danger" className="mb-3" action={
      <Button size="sm" variant="ghost" onClick={reload}>
        {loading ? <Spinner size="sm" /> : copy("tryAgain")}
      </Button>
    }>
      {error}
    </Alert>
  ) : null;

  if (view === "board") {
    return (
      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
        {errorBanner}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-base font-medium text-foreground">{copy("projectTracking")}</div>
          {viewSwitch}
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto pb-1">
            <Kanban<Project>
              items={filtered}
              columns={KANBAN_COLUMNS}
              getId={(p) => p.id}
              getColumnId={(p) => p.stage}
              onMove={onMove}
              columnClassName="min-w-[220px]"
              renderColumnHeader={(col, its) => (
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{col.title}</span>
                  <Tag tone="neutral" size="sm">
                    {its.length}
                  </Tag>
                </div>
              )}
              renderItem={(p) => (
                <Link
                  href={`${ROOT}/tracking/${p.id}`}
                  className="block rounded-[var(--radius)] border border-border bg-surface p-3 shadow-sm transition-colors hover:border-primary/40"
                >
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{p.client}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress variant="linear" value={p.progress} className="flex-1" />
                    <span className="text-xs tabular-nums text-muted">{p.progress}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <Tag tone={projectStatusTone(p.status)} size="sm" dot>
                      {projectStatusLabel[p.status]}
                    </Tag>
                    <Text size="xs" tone="muted">
                      {wan(p.contractAmount)}
                    </Text>
                  </div>
                </Link>
              )}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {errorBanner}
      <ProTable<Project>
        title={copy("projectTracking2")}
        columns={columns}
        data={paged}
        loading={loading}
        getRowId={(r) => r.id}
        toolbarActions={viewSwitch}
        search={{
          fields: [
            { name: "keyword", label: copy("keywords"), placeholder: copy("projectNoPartyA") },
            { name: "stage", label: copy("stage2"), type: "select", options: opt(PROJECT_STAGES, projectStageLabel) },
            { name: "status", label: copy("status2"), type: "select", options: opt(STATUSES, projectStatusLabel) },
            { name: "owner", label: copy("personInCharge2"), type: "select", options: opt(OWNER_OPTIONS) },
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
