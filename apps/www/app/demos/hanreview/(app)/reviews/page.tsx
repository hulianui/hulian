"use client";
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
} from "@hulian/ui";
import { REVIEWS } from "../../_data/reviews";
import { REPOS } from "../../_data/repos";
import { MODELS } from "../../_data/models";
import type { Review, ReviewStatus, Severity } from "../../_data/types";

const PAGE_SIZE = 8;

const REPO_NAME = new Map(REPOS.map((r) => [r.id, r.name]));
const MODEL_NAME = new Map(MODELS.map((m) => [m.id, m.name]));

type TabKey = "all" | "reviewing" | "block" | "pass";

const TABS: { value: TabKey; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "reviewing", label: "审查中" },
  { value: "block", label: "已阻断" },
  { value: "pass", label: "已通过" },
];

// AI 审查状态 → StatusDot 语义态 + 文案
const STATUS_DOT: Record<ReviewStatus, { status: ChannelStatus; label: string }> = {
  done: { status: "online", label: "完成" },
  reviewing: { status: "maintenance", label: "审查中" },
  failed: { status: "offline", label: "失败" },
  queued: { status: "degraded", label: "排队" },
};

// 问题严重度 → Tag 色
const SEVERITY_TONE: Record<Severity, TagTone> = {
  critical: "danger",
  major: "warning",
  minor: "brand",
  info: "neutral",
};
const SEVERITY_LABEL: Record<Severity, string> = {
  critical: "严重",
  major: "重要",
  minor: "次要",
  info: "提示",
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
      header: "仓库",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="min-w-0">
            <div className="font-medium">{REPO_NAME.get(r.repoId) ?? r.repoId}</div>
            <div className="truncate text-xs text-muted">{r.branch}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "标题",
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
      header: "作者",
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
      header: "改动规模",
      enableSorting: false,
      cell: ({ row }) => {
        const d = diffOf(row.original);
        return <DiffStat additions={d.additions} deletions={d.deletions} status={d.status} />;
      },
    },
    {
      accessorKey: "status",
      header: "AI 状态",
      cell: ({ row }) => {
        const s = STATUS_DOT[row.original.status];
        return <StatusDot status={s.status} label={s.label} size="sm" />;
      },
    },
    {
      accessorKey: "score",
      header: "质量分",
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
      header: "问题数",
      enableSorting: false,
      cell: ({ row }) => {
        const counts = severityCounts(row.original);
        const active = SEVERITY_ORDER.filter((s) => counts[s] > 0);
        if (active.length === 0) return <span className="text-xs text-muted">无</span>;
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
      header: "门禁",
      cell: ({ row }) =>
        row.original.gate === "pass" ? (
          <Tag tone="success" size="sm">
            通过
          </Tag>
        ) : (
          <Tag tone="danger" size="sm">
            阻断
          </Tag>
        ),
    },
    {
      accessorKey: "modelId",
      header: "主审模型",
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="min-w-0">
            <div className="text-sm">{MODEL_NAME.get(r.modelId) ?? r.modelId}</div>
            <div className="text-xs text-muted tabular-nums">¥{r.cost.toFixed(3)}</div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "操作",
      enableSorting: false,
      cell: ({ row }) => (
        <Link
          href={`/demos/hanreview/reviews/${row.original.id}`}
          className="text-sm text-primary hover:underline"
        >
          查看详情
        </Link>
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
        aria-label="审查状态筛选"
      />
      <ProTable<Review>
        title="审查队列"
        columns={columns}
        data={paged}
        getRowId={(r) => r.id}
        search={{
          fields: [
            {
              name: "repoId",
              label: "仓库",
              type: "select",
              options: [
                { value: "", label: "全部仓库" },
                ...REPOS.map((r) => ({ value: r.id, label: r.name })),
              ],
            },
            { name: "keyword", label: "关键词", placeholder: "标题 / 分支 / 作者" },
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
