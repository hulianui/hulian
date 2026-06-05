"use client";
// 执行器池：顶部统计条（池容量/平均利用率/健康数） + 执行器卡网格（能力/价位/负载/健康/降级链/启停限流）。
import { Boxes, Gauge, HeartPulse } from "lucide-react";
import { Card, CardBody, Stat } from "@hulian/ui";
import { EXECUTORS } from "../../_data/executors";
import { AgentsExecutorCard } from "../../_components/agents-executor-card";

// ── 派生池级统计 ──────────────────────────────────────────────
const totalCapacity = EXECUTORS.reduce((s, e) => s + e.maxConcurrency, 0);
const usedCapacity = EXECUTORS.reduce((s, e) => s + Math.round(e.load * e.maxConcurrency), 0);
const avgUtil = (usedCapacity / Math.max(1, totalCapacity)) * 100;
const healthyCount = EXECUTORS.filter((e) => e.health === "healthy").length;

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">执行器池</h1>
        <p className="text-sm text-muted">
          模型 + Agent 舰队 · 能力画像 · 实时负载 · 健康态 · 降级链编排
        </p>
      </div>

      {/* 顶部统计条 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <Stat
              icon={<Boxes className="size-4" />}
              label="池容量（最大并发）"
              value={
                <span className="tabular-nums">
                  {usedCapacity} / {totalCapacity}
                </span>
              }
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<Gauge className="size-4" />}
              label="平均利用率"
              value={<span className="tabular-nums">{avgUtil.toFixed(1)}%</span>}
              delta={2.6}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<HeartPulse className="size-4" />}
              label="健康执行器"
              value={
                <span className="tabular-nums">
                  {healthyCount} / {EXECUTORS.length}
                </span>
              }
            />
          </CardBody>
        </Card>
      </div>

      {/* 执行器卡网格 */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {EXECUTORS.map((e, i) => (
          <AgentsExecutorCard key={e.id} executor={e} index={i} />
        ))}
      </div>
    </div>
  );
}
