"use client";
import { copy } from "./routing-decision-table.content";

// 智能路由 · 决策回放表：对所选任务用当前六维权重重算的 RoutingDecision，
// 逐候选执行器展示六维分项打分（迷你 Sparkline 条）+ 综合分；淘汰者标灰 + 原因 Tag，
// 选中者（chosenId）高亮 + reason 文案。
import { Sparkline, Table, Tag } from "@hulianui/ui";
import type { ColumnDef } from "@hulianui/ui";
import { useMemo } from "react";
import type { Executor, RoutingCandidate, RoutingDecision } from "../_data/types";
import { executorName } from "../_data/executors";
import { WEIGHT_DIMS } from "./routing-weights-panel";

interface Row {
  candidate: RoutingCandidate;
  executor?: Executor;
  isChosen: boolean;
  rank: number; // 1=最优；淘汰者无名次（0）
}

/** 单维分项：一条单值 Sparkline 柱 + 数值，直观表达 0-1 归一化分。 */
function DimBar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Sparkline
        data={[0, value]}
        variant="area"
        tone={tone}
        min={0}
        max={1}
        width={36}
        height={16}
      />
      <span className="w-7 text-right text-xs tabular-nums text-muted">
        {value.toFixed(2)}
      </span>
    </div>
  );
}

export function RoutingDecisionTable({ decision }: { decision: RoutingDecision }) {
  const rows = useMemo<Row[]>(() => {
    // 名次：仅对未淘汰者按 total 降序编号。
    const ranked = [...decision.candidates]
      .filter((c) => !c.eliminated)
      .sort((a, b) => b.total - a.total)
      .map((c) => c.executorId);
    return decision.candidates.map((candidate) => ({
      candidate,
      executor: undefined,
      isChosen: candidate.executorId === decision.chosenId,
      rank: ranked.indexOf(candidate.executorId) + 1,
    }));
  }, [decision]);

  const columns = useMemo<ColumnDef<Row, unknown>[]>(() => {
    const dimCols: ColumnDef<Row, unknown>[] = WEIGHT_DIMS.map((d) => ({
      id: d.key,
      header: d.label,
      cell: ({ row }) => {
        const c = row.original.candidate;
        if (c.eliminated) return <span className="text-xs text-muted">—</span>;
        return <DimBar value={c.scores[d.key]} tone={d.tone} />;
      },
    }));

    return [
      {
        id: "executor",
        header: copy("candidateActuators"),
        cell: ({ row }) => {
          const { candidate, isChosen, rank } = row.original;
          return (
            <div className="flex items-center gap-2">
              {isChosen ? (
                <Tag size="sm" variant="solid" tone="brand">{copy("selected")}</Tag>
              ) : candidate.eliminated ? (
                <Tag size="sm" variant="soft" tone="neutral">{copy("elimination")}</Tag>
              ) : (
                <Tag size="sm" variant="outline" tone="neutral">
                  #{rank}
                </Tag>
              )}
              <span
                className={
                  candidate.eliminated
                    ? "text-sm text-muted"
                    : "text-sm font-medium text-foreground"
                }
              >
                {executorName(candidate.executorId)}
              </span>
            </div>
          );
        },
        meta: { sticky: "left" },
      },
      ...dimCols,
      {
        id: "total",
        header: copy("overallScore"),
        cell: ({ row }) => {
          const { candidate, isChosen } = row.original;
          if (candidate.eliminated) {
            return (
              <Tag size="sm" variant="soft" tone="danger">
                {candidate.eliminated}
              </Tag>
            );
          }
          return (
            <span
              className={
                isChosen
                  ? "text-sm font-semibold tabular-nums text-primary"
                  : "text-sm tabular-nums text-foreground"
              }
            >
              {candidate.total.toFixed(3)}
            </span>
          );
        },
      },
    ];
  }, []);

  return (
    <Table
      columns={columns}
      data={rows}
      enableSorting={false}
      striped={false}
      density="middle"
      getRowId={(r) => r.candidate.executorId}
    />
  );
}
