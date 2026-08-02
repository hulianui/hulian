"use client";
import { copy } from "./page.content";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Heading,
  Kanban,
  type KanbanColumn,
  type KanbanMoveEvent,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Spin,
  Tag,
  Text,
  cn,
  toast,
} from "@hulianui/ui";
import { opportunities as seed } from "../../_data/opportunities";
import { customerOwnerLabel, oppStageLabel, yuan } from "../../_data/status";
import { OPP_STAGES, OWNERS, type Opportunity, type OppStage } from "../../_data/types";
import { useMockData } from "../../../lib/async";

const stageDotClass: Record<OppStage, string> = {
  线索: "bg-muted",
  初步接触: "bg-muted",
  方案报价: "bg-primary",
  商务谈判: "bg-warning",
  赢单: "bg-success",
  输单: "bg-danger",
};

// 赢率徽章着色克制：只对「高赢率」点绿（正向信号），普通一律中性灰，输单红。
// 不再给中间档上蓝色——一屏内灰/蓝/绿三色并存太花，弱化了真正该被看见的高赢率商机。
function winRateTone(o: Opportunity): "neutral" | "success" | "danger" {
  if (o.stage === "输单") return "danger";
  if (o.probability >= 60) return "success";
  return "neutral";
}

const COLUMNS: KanbanColumn[] = OPP_STAGES.map((s) => ({ id: s, title: oppStageLabel[s] }));
/** 把拖拽事件落到受控数组：改 stage + 按 toIndex 插回目标列（anchor 取自当前可见视图，与 Kanban 看到的列表一致）。 */
function applyMove(all: Opportunity[], view: Opportunity[], e: KanbanMoveEvent): Opportunity[] {
  const moving = all.find((o) => o.id === e.id);
  if (!moving) return all;
  const updated: Opportunity = { ...moving, stage: e.toColumn as OppStage };
  const without = all.filter((o) => o.id !== e.id);
  const anchor = view.filter((o) => o.stage === e.toColumn && o.id !== e.id)[e.toIndex];
  if (!anchor) return [...without, updated];
  const at = without.findIndex((o) => o.id === anchor.id);
  return [...without.slice(0, at), updated, ...without.slice(at)];
}

function OppCard({ o, dragging }: { o: Opportunity; dragging: boolean }) {
  return (
    <Card
      variant="outline"
      className={cn("transition-shadow hover:shadow-sm", dragging && "shadow-lg ring-1 ring-ring")}
    >
      <CardBody className="flex flex-col gap-3 p-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm leading-snug font-medium">{o.title}</span>
          {/* Kanban 组件内部已放行交互子元素（链接/按钮）的拖拽劫持，这里无需 stopPropagation 补丁 */}
          <Link href={`/demos/crm/customers/${o.customerId}`} className="w-fit text-xs text-muted hover:text-primary">
            {o.customerName}
          </Link>
        </div>

        {/* 金额为主、赢率为辅——赢率只用带语义色的小标签表达一次，不再叠一条进度条重复画同一数据 */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold tabular-nums">{yuan(o.amount)}</span>
          <Tag tone={winRateTone(o)} size="sm">{copy("winRate")}{o.probability}%
          </Tag>
        </div>

        <div className="flex items-center justify-between text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-surface-hover text-[10px] font-medium text-foreground">
              {customerOwnerLabel[o.owner].slice(0, 1)}
            </span>
            {customerOwnerLabel[o.owner]}
          </span>
          <span className="tabular-nums">{o.expectedCloseAt}</span>
        </div>
      </CardBody>
    </Card>
  );
}

export default function OpportunitiesPage() {
  const { data, loading } = useMockData(seed);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [owner, setOwner] = useState("");

  useEffect(() => {
    if (data) setOpps(data);
  }, [data]);

  const view = useMemo(() => (owner ? opps.filter((o) => o.owner === owner) : opps), [opps, owner]);

  const activeTotal = opps
    .filter((o) => o.stage !== "赢单" && o.stage !== "输单")
    .reduce((s, o) => s + o.amount, 0);

  const handleMove = (e: KanbanMoveEvent) => {
    if (e.fromColumn !== e.toColumn) {
      const o = opps.find((x) => x.id === e.id);
      if (o) toast({ title: copy("opportunityMoved"), description: `${o.title} → ${oppStageLabel[e.toColumn as OppStage]}` });
    }
    setOpps((prev) => applyMove(prev, view, e));
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Heading level={2} size="xl">{copy("businessOpportunityBoard")}</Heading>
          <Text tone="muted" size="sm" className="mt-1">{copy("boardSummary", opps.length, yuan(activeTotal))}</Text>
        </div>
        <div className="w-44">
          <Select
            items={[{ value: "", label: copy("allPersonsInCharge") }, ...OWNERS.map((o) => ({ value: o, label: customerOwnerLabel[o] }))]}
            value={owner}
            onValueChange={(v) => setOwner((v as string) ?? "")}
          >
            <SelectTrigger size="sm" />
            <SelectContent>
              <SelectItem value="">{copy("allPersonsInCharge2")}</SelectItem>
              {OWNERS.map((o) => (
                <SelectItem key={o} value={o}>
                  {customerOwnerLabel[o]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="min-h-0 flex-1">
        <Spin spinning={loading} tip={copy("loadingOpportunities")} className="h-full">
        <Kanban<Opportunity>
          columns={COLUMNS}
          items={view}
          getId={(o) => o.id}
          getColumnId={(o) => o.stage}
          onMove={handleMove}
          renderColumnHeader={(col, items) => {
            const stage = col.id as OppStage;
            const total = items.reduce((s, o) => s + o.amount, 0);
            return (
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${stageDotClass[stage]}`} aria-hidden />
                  <span className="text-sm font-medium">{col.title}</span>
                  <Tag variant="soft" tone="neutral">
                    {items.length}
                  </Tag>
                </div>
                <Text size="xs" tone="muted" className="tabular-nums">
                  {yuan(total)}
                </Text>
              </div>
            );
          }}
          renderItem={(o, { dragging }) => <OppCard o={o} dragging={dragging} />}
        />
        </Spin>
      </div>
    </div>
  );
}
