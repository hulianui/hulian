"use client";
import { copy } from "./page.content";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  DiffStat,
  ProTable,
  ScoreRing,
  Segmented,
  StatusDot,
  Tag,
  resolveGrade,
  type ChannelStatus,
  type ColumnDef,
  type DiffStatStatus,
  type TagTone,
} from "@hulianui/ui";
import { REVIEWS } from "../../_data/reviews";
import { REPOS } from "../../_data/repos";
import { MODELS } from "../../_data/models";
import type { Review, ReviewStatus, Severity } from "../../_data/types";

const PAGE_SIZE = 8;

const REPO_NAME = new Map(REPOS.map((r) => [r.id, r.name]));
const MODEL_NAME = new Map(MODELS.map((m) => [m.id, m.name]));

type TabKey = "all" | "reviewing" | "block" | "pass";

const TABS: { value: TabKey; label: string }[] = [
  { value: "all", label: copy("allOfThem") },
  { value: "reviewing", label: copy("underReview") },
  { value: "block", label: copy("blocked") },
  { value: "pass", label: copy("passed") },
];

// AI 审查状态 → StatusDot 语义态 + 文案
const STATUS_DOT: Record<ReviewStatus, { status: ChannelStatus; label: string }> = {
  done: { status: "online", label: copy("done") },
  reviewing: { status: "maintenance", label: copy("underReview2") },
  failed: { status: "offline", label: copy("failure") },
  queued: { status: "degraded", label: copy("queue") },
};

// 问题严重度 → Tag 色
const SEVERITY_TONE: Record<Severity, TagTone> = {
  critical: "danger",
  major: "warning",
  minor: "brand",
  info: "neutral",
};
const SEVERITY_LABEL: Record<Severity, string> = {
  critical: copy("serious"),
  major: copy("important"),
  minor: copy("secondary"),
  info: copy("tip"),
};
const SEVERITY_ORDER: Severity[] = ["critical", "major", "minor", "info"];

// 一条 review 跨全部文件的改动规模 / 批注汇总
function diffOf(r: Review): { additions: number; deletions: number; status: DiffStatStatus } {
  let additions = 0;
  let deletions = 0;
  for (const f of r.files) {
    additions += f.additions;
    deletions += f.deletions;
  }
  // 单文件取其状态，多文件统一按 modified 呈现
  const status: DiffStatStatus = r.files.length === 1 ? r.files[0].status : "modified";
  return { additions, deletions, status };
}

function severityCounts(r: Review): Record<Severity, number> {
  const acc: Record<Severity, number> = { critical: 0, major: 0, minor: 0, info: 0 };
  for (const f of r.files) {
    for (const a of f.annotations) acc[a.severity] += 1;
  }
  return acc;
}

export default function ReviewsPage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [filters, setFilters] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const kw = String(filters.keyword ?? "").trim();
    const repoId = String(filters.repoId ?? "").trim();
    return REVIEWS.filter((r) => {
      // 分段过滤
      if (tab === "reviewing" && r.status !== "reviewing") return false;
      if (tab === "block" && r.gate !== "block") return false;
      if (tab === "pass" && r.gate !== "pass") return false;
      // 查询区过滤
      if (repoId && r.repoId !== repoId) return false;
      if (kw && !`${r.title}${r.branch}${r.author.name}`.includes(kw)) return false;
      return true;
    });
  }, [tab, filters]);

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: "repoId",
      header: copy("warehouse"),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="min-w-0">
            <div className="font-medium">{REPO_NAME.get(r.repoId) ?? r.repoId}</div>
            <div className="truncate text-xs text-muted-foreground">{r.branch}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: copy("title"),
      cell: ({ row }) => (
        <Link
          href={`/demos/hanreview/reviews/${row.original.id}`}
          className="font-medium hover:text-primary"
        >
          {row.original.title}
        </Link>
      ),
    },
    {
      accessorKey: "author",
      header: copy("author"),
      enableSorting: false,
      cell: ({ row }) => {
        const a = row.original.author;
        return (
          <div className="flex items-center gap-2">
            <Avatar src={a.avatar} fallback={a.name.slice(0, 1)} size="sm" />
            <span className="text-sm">{a.name}</span>
          </div>
        );
      },
    },
    {
      id: "diff",
      header: copy("scaleOfChanges"),
      enableSorting: false,
      cell: ({ row }) => {
        const d = diffOf(row.original);
        return <DiffStat additions={d.additions} deletions={d.deletions} status={d.status} />;
      },
    },
    {
      accessorKey: "status",
      header: copy("aiStatus"),
      cell: ({ row }) => {
        const s = STATUS_DOT[row.original.status];
        return <StatusDot status={s.status} label={s.label} size="sm" />;
      },
    },
    {
      accessorKey: "score",
      header: copy("qualityPoints"),
      cell: ({ row }) => {
        const r = row.original;
        const grade = resolveGrade(r.score);
        return (
          <div className="flex items-center gap-2">
            <ScoreRing value={r.score} size={40} showGrade={false} />
            <span className="text-sm font-medium tabular-nums" style={{ color: grade.tone }}>
              {grade.label}
            </span>
          </div>
        );
      },
    },
    {
      id: "issues",
      header: copy("numberOfQuestions"),
      enableSorting: false,
      cell: ({ row }) => {
        const counts = severityCounts(row.original);
        const active = SEVERITY_ORDER.filter((s) => counts[s] > 0);
        if (active.length === 0) return <span className="text-xs text-muted-foreground">{copy("none")}</span>;
        return (
          <div className="flex flex-wrap items-center gap-1">
            {active.map((s) => (
              <Tag key={s} tone={SEVERITY_TONE[s]} size="sm">
                {SEVERITY_LABEL[s]} {counts[s]}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "gate",
      header: copy("gateControl"),
      cell: ({ row }) =>
        row.original.gate === "pass" ? (
          <Tag tone="success" size="sm">{copy("pass")}</Tag>
        ) : (
          <Tag tone="danger" size="sm">{copy("blocking")}</Tag>
        ),
    },
    {
      accessorKey: "modelId",
      header: copy("leadReviewerModel"),
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="min-w-0">
            <div className="text-sm">{MODEL_NAME.get(r.modelId) ?? r.modelId}</div>
            <div className="text-xs text-muted-foreground tabular-nums">¥{r.cost.toFixed(3)}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: copy("operation"),
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/demos/hanreview/reviews/${row.original.id}`}
          className="text-sm text-primary hover:underline"
        >{copy("seeDetails")}</Link>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Segmented
        items={TABS}
        value={tab}
        onValueChange={(v) => {
          setTab(v as TabKey);
          setPage(1);
        }}
        aria-label={copy("reviewStatusScreening")}
      />
      <ProTable<Review>
        title={copy("queueReview")}
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        search={{
          fields: [
            {
              name: "repoId",
              label: copy("warehouse2"),
              type: "select",
              options: [
                { value: "", label: copy("allWarehouses") },
                ...REPOS.map((r) => ({ value: r.id, label: r.name })),
              ],
            },
            { name: "keyword", label: copy("keywords"), placeholder: copy("titleBranchAuthor") },
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
