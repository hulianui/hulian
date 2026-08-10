"use client";
import { copy } from "./page.content";

// 执行器池：顶部统计条（池容量/平均利用率/健康数） + 执行器卡网格（能力/价位/负载/健康/降级链/启停限流）。
import { Boxes, Gauge, HeartPulse } from "lucide-react";
import { Card, CardBody, Stat } from "@hulianui/ui";
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
        <h1 className="text-xl font-semibold text-foreground">{copy("actuatorPool")}</h1>
        <p className="text-sm text-muted-foreground">{copy("modelAgentFleetCapabilityProfileRealTime")}</p>
      </div>

      {/* 顶部统计条 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardBody>
            <Stat
              icon={<Boxes className="size-4" />}
              label={copy("poolCapacityMaximumConcurrency")}
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
              label={copy("averageUtilization")}
              value={<span className="tabular-nums">{avgUtil.toFixed(1)}%</span>}
              delta={2.6}
            />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat
              icon={<HeartPulse className="size-4" />}
              label={copy("healthActuators")}
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
