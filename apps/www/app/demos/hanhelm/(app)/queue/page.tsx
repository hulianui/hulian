"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Columns3, LayoutList } from "lucide-react";
import {
  Button,
  PageHeader,
  ProTable,
  Segmented,
  Tag,
  type ColumnDef,
} from "@hulianui/ui";
import { ROOT } from "../../_components/nav-config";
import { TASKS } from "../../_data/tasks";
import { executorName } from "../../_data/executors";
import {
  CAPABILITY_LABEL,
  CapabilityTags,
  PRIORITY_TAG_TONE,
  SLA_META,
  STATUS_META,
  fmtDuration,
  fmtSlaMargin,
  taskSla,
} from "../../_components/queue-shared";
import { QueueBoard } from "../../_components/queue-board";
import type { Capability, Priority, Task, TaskStatus } from "../../_data/types";

const PAGE_SIZE = 8;

// 顶部分段过滤：把多种业务状态聚合成 5 个监视分组。
type FilterKey = "all" | "queued" | "running" | "at-risk" | "failed";
const FILTER_ITEMS: { value: FilterKey; label: string }[] = [
  { value: "all", label: copy("allOfThem") },
  { value: "queued", label: copy("inLine") },
  { value: "running", label: copy("inExecution") },
  { value: "at-risk", label: copy("theAppointedTimeApproached") },
  { value: "failed", label: copy("failure") },
];

function matchFilter(task: Task, f: FilterKey): boolean {
  if (f === "all") return true;
  if (f === "queued") return task.status === "queued";
  if (f === "running") return task.status === "running";
  if (f === "failed") return task.status === "failed";
  // 临期：状态为 at-risk，或 SLA 评估为临期/违约。
  if (f === "at-risk") {
    if (task.status === "at-risk") return true;
    const s = taskSla(task).status;
    return s === "at-risk" || s === "violated";
  }
  return true;
}

const CAP_OPTIONS = [
  { value: "", label: copy("fullCapacity") },
  ...(Object.keys(CAPABILITY_LABEL) as Capability[]).map((c) => ({
    value: c,
    label: CAPABILITY_LABEL[c],
  })),
];
const PRIORITY_OPTIONS = [
  { value: "", label: copy("allPriorities") },
  ...(["P0", "P1", "P2", "P3"] as Priority[]).map((p) => ({ value: p, label: p })),
];
const STATUS_OPTIONS = [
  { value: "", label: copy("allTheStates") },
  ...(Object.keys(STATUS_META) as TaskStatus[]).map((s) => ({
    value: s,
    label: STATUS_META[s].label,
  })),
];

export default function QueuePage() {
  const router = useRouter();
  const [view, setView] = useState("board");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const kw = String(search.keyword ?? "").trim();
    return TASKS.filter((t) => {
      if (!matchFilter(t, filter)) return false;
      if (kw && !`${t.title}${t.type}${t.submitter}`.includes(kw)) return false;
      if (search.capability && !t.capabilities.includes(search.capability as Capability)) return false;
      if (search.priority && t.priority !== search.priority) return false;
      if (search.status && t.status !== search.status) return false;
      return true;
    });
  }, [filter, search]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: copy("mission"),
      cell: ({ row }) => {
        const t = row.original;
        return (
          <button
            type="button"
            onClick={() => router.push(`${ROOT}/queue/${t.id}`)}
            className="min-w-0 text-left"
          >
            <div className="truncate font-medium text-foreground hover:text-primary">{t.title}</div>
            <div className="truncate text-xs text-muted">{t.type} · {t.submitter}</div>
          </button>
        );
      },
    },
    {
      accessorKey: "capabilities",
      header: copy("ability"),
      enableSorting: false,
      cell: ({ row }) => <CapabilityTags capabilities={row.original.capabilities} max={2} />,
    },
    {
      accessorKey: "priority",
      header: copy("priority"),
      cell: ({ row }) => (
        <Tag tone={PRIORITY_TAG_TONE[row.original.priority]} size="sm" variant="soft">
          {row.original.priority}
        </Tag>
      ),
    },
    {
      id: "sla",
      header: "SLA",
      enableSorting: false,
      cell: ({ row }) => {
        const sla = taskSla(row.original);
        const meta = SLA_META[sla.status];
        return (
          <div className="flex flex-col gap-0.5">
            <Tag tone={meta.tone} size="sm" dot>
              {meta.label}
            </Tag>
            <span className="text-xs tabular-nums text-muted">{fmtSlaMargin(sla.marginMs)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: copy("status"),
      cell: ({ row }) => {
        const meta = STATUS_META[row.original.status];
        return (
          <Tag tone={meta.tone} size="sm" variant="soft">
            {meta.label}
          </Tag>
        );
      },
    },
    {
      accessorKey: "assignedExecutorId",
      header: copy("assignIt"),
      cell: ({ row }) => (
        <span className="text-sm">{executorName(row.original.assignedExecutorId)}</span>
      ),
    },
    {
      accessorKey: "waitedMs",
      header: copy("wait"),
      cell: ({ row }) => (
        <span className="tabular-nums text-sm">{fmtDuration(row.original.waitedMs)}</span>
      ),
    },
    {
      accessorKey: "spentYuan",
      header: copy("cost"),
      cell: ({ row }) => {
        const t = row.original;
        const spent = t.spentYuan;
        return (
          <span className="tabular-nums text-sm">
            {spent != null ? `¥${spent.toFixed(2)}` : `≤¥${t.budgetYuan.toFixed(2)}`}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant="link"
          size="sm"
          onClick={() => router.push(`${ROOT}/queue/${row.original.id}`)}
        >{copy("seeDetails")}</Button>
      ),
    },
  ];

  const viewSwitch = (
    <Segmented
      size="sm"
      value={view}
      onValueChange={setView}
      items={[
        {
          value: "board",
          ariaLabel: copy("swimlaneBoardView"),
          label: (
            <span className="inline-flex items-center gap-1.5">
              <Columns3 className="size-4" />{copy("swimLaneBoard")}</span>
          ),
        },
        {
          value: "list",
          ariaLabel: copy("listView"),
          label: (
            <span className="inline-flex items-center gap-1.5">
              <LayoutList className="size-4" />{copy("list")}</span>
          ),
        },
      ]}
    />
  );

  const filterBar = (
    <Segmented
      size="sm"
      value={filter}
      onValueChange={(v) => {
        setFilter(v as FilterKey);
        setPage(1);
      }}
      items={FILTER_ITEMS}
    />
  );

  return (
    <div className="flex flex-col gap-4 p-6">
      <PageHeader
        title={copy("taskQueue")}
        subTitle={copy("priorityLaneQueueBoardListViewReal")}
        extra={viewSwitch}
      />

      {view === "board" ? (
        <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-muted">{copy("together")}<span className="tabular-nums text-foreground">{filtered.length}</span>{copy("tasksAreDistributedAcrossFourPriorityLanes")}</div>
            {filterBar}
          </div>
          <div className="overflow-x-auto pb-1">
            <QueueBoard tasks={filtered} />
          </div>
        </div>
      ) : (
        <ProTable<Task>
          title={copy("taskList")}
          columns={columns}
          data={paged}
          getRowId={(r) => r.id}
          toolbarActions={filterBar}
          search={{
            fields: [
              { name: "keyword", label: copy("keywords"), placeholder: copy("titleTypeAuthor") },
              { name: "capability", label: copy("ability2"), type: "select", options: CAP_OPTIONS },
              { name: "priority", label: copy("priority2"), type: "select", options: PRIORITY_OPTIONS },
              { name: "status", label: copy("status2"), type: "select", options: STATUS_OPTIONS },
            ],
            onSearch: (v) => {
              setSearch(v);
              setPage(1);
            },
            onReset: () => {
              setSearch({});
              setPage(1);
            },
          }}
          pagination={{ page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
        />
      )}
    </div>
  );
}
