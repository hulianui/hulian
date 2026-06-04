"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Card,
  CardBody,
  Heading,
  Kanban,
  type KanbanColumn,
  type KanbanMoveEvent,
  Progress,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Tag,
  Text,
  cn,
  toast,
} from "@hulian/ui";
import { opportunities as seed } from "../../_data/opportunities";
import { oppStageTone, yuan } from "../../_data/status";
import { OPP_STAGES, OWNERS, type Opportunity, type OppStage } from "../../_data/types";

const stageDotClass: Record<OppStage, string> = {
  线索: "bg-muted",
  初步接触: "bg-muted",
  方案报价: "bg-primary",
  商务谈判: "bg-warning",
  赢单: "bg-success",
  输单: "bg-danger",
};

const COLUMNS: KanbanColumn[] = OPP_STAGES.map((s) => ({ id: s, title: s }));

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
      <CardBody className="flex flex-col gap-2 p-3.5">
        <span className="text-sm leading-snug font-medium">{o.title}</span>

        <Link
          href={`/demos/crm/customers/${o.customerId}`}
          // 卡片整体可拖；链接是无移动的纯点击（PointerSensor distance 阈值放行 click）
          onPointerDown={(e) => e.stopPropagation()}
          className="w-fit text-xs text-muted hover:text-primary"
        >
          {o.customerName}
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tabular-nums">{yuan(o.amount)}</span>
          <Tag tone={oppStageTone[o.stage]} size="sm">
            赢率 {o.probability}%
          </Tag>
        </div>
        <Progress value={o.probability} size={4} tone={o.stage === "输单" ? "danger" : "primary"} aria-label={`赢率 ${o.probability}%`} />

        <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-surface-hover text-[10px] font-medium text-foreground">
              {o.owner.slice(0, 1)}
            </span>
            {o.owner}
          </span>
          <span className="tabular-nums">{o.expectedCloseAt}</span>
        </div>
      </CardBody>
    </Card>
  );
}

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<Opportunity[]>(seed);
  const [owner, setOwner] = useState("");

  const view = useMemo(() => (owner ? opps.filter((o) => o.owner === owner) : opps), [opps, owner]);

  const activeTotal = opps
    .filter((o) => o.stage !== "赢单" && o.stage !== "输单")
    .reduce((s, o) => s + o.amount, 0);

  const handleMove = (e: KanbanMoveEvent) => {
    if (e.fromColumn !== e.toColumn) {
      const o = opps.find((x) => x.id === e.id);
      if (o) toast({ title: "已移动商机", description: `${o.title} → ${e.toColumn}` });
    }
    setOpps((prev) => applyMove(prev, view, e));
  };

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Heading level={2} size="xl">
            商机看板
          </Heading>
          <Text tone="muted" size="sm" className="mt-1">
            共 {opps.length} 个商机 · 进行中金额 {yuan(activeTotal)} · 拖拽卡片跨列移动阶段（亦支持键盘：聚焦后空格抓起·方向键移动）
          </Text>
        </div>
        <div className="w-44">
          <Select
            items={[{ value: "", label: "全部负责人" }, ...OWNERS.map((o) => ({ value: o, label: o }))]}
            value={owner}
            onValueChange={(v) => setOwner((v as string) ?? "")}
          >
            <SelectTrigger size="sm" />
            <SelectContent>
              <SelectItem value="">全部负责人</SelectItem>
              {OWNERS.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="min-h-0 flex-1">
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
                  <Badge variant="soft" tone="neutral">
                    {items.length}
                  </Badge>
                </div>
                <Text size="xs" tone="muted" className="tabular-nums">
                  {yuan(total)}
                </Text>
              </div>
            );
          }}
          renderItem={(o, { dragging }) => <OppCard o={o} dragging={dragging} />}
        />
      </div>
    </div>
  );
}
