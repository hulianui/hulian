"use client";
// 智能路由 · 成本/延迟分布：各执行器的「混合单价」与「典型延迟」对照。
// 库的 Chart 家族（recharts 皮肤）无 XY 散点型，这里用 BarChart 双序列做成本×延迟对照，
// 两序列各自归一到 0-100 同轴可比，便于一眼看出「贵且慢」「便宜且快」象限。
import { BarChart } from "@hulianui/ui";
import { useMemo } from "react";
import type { Executor } from "../_data/types";

interface Props {
  executors: Executor[];
}

export function RoutingCostLatencyChart({ executors }: Props) {
  const data = useMemo(() => {
    const prices = executors.map((e) => e.pricePer1kIn + e.pricePer1kOut);
    const latencies = executors.map((e) => e.latencyMs);
    const maxP = Math.max(...prices, 1);
    const maxL = Math.max(...latencies, 1);
    return executors.map((e, i) => ({
      name: e.name,
      成本指数: Math.round((prices[i] / maxP) * 100),
      延迟指数: Math.round((latencies[i] / maxL) * 100),
    }));
  }, [executors]);

  return (
    <BarChart
      data={data}
      series={[
        { key: "成本指数", color: "var(--color-chart-2)" },
        { key: "延迟指数", color: "var(--color-chart-3)" },
      ]}
      xKey="name"
      height={280}
      className="w-full"
    />
  );
}
