"use client";
import { useState } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuTrigger,
  Tag,
  Text,
} from "@hulian/ui";
import { opportunities as seed } from "../../_data/opportunities";
import { oppStageTone, yuan } from "../../_data/status";
import { OPP_STAGES, type Opportunity, type OppStage } from "../../_data/types";

const stageDotClass: Record<OppStage, string> = {
  线索: "bg-muted",
  初步接触: "bg-muted",
  方案报价: "bg-primary",
  商务谈判: "bg-warning",
  赢单: "bg-success",
  输单: "bg-danger",
};

function OppCard({ o, onMove }: { o: Opportunity; onMove: (id: string, stage: OppStage) => void }) {
  return (
    <Card variant="outline" className="transition-shadow hover:shadow-sm">
      <CardBody className="flex flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="text-sm leading-snug font-medium">{o.title}</span>
          <Menu>
            <MenuTrigger
              render={
                <Button variant="ghost" size="sm" aria-label="移动商机" className="-mt-1 -mr-1 size-7 shrink-0 px-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
            <MenuContent align="end">
              <MenuGroup>
                <MenuGroupLabel>移动到</MenuGroupLabel>
                {OPP_STAGES.filter((s) => s !== o.stage).map((s) => (
                  <MenuItem key={s} onClick={() => onMove(o.id, s)}>
                    {s}
                  </MenuItem>
                ))}
              </MenuGroup>
            </MenuContent>
          </Menu>
        </div>

        <Link href={`/demos/crm/customers/${o.customerId}`} className="w-fit text-xs text-muted hover:text-primary">
          {o.customerName}
        </Link>

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tabular-nums">{yuan(o.amount)}</span>
          <Tag tone={oppStageTone[o.stage]} size="sm">
            赢率 {o.probability}%
          </Tag>
        </div>

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
  const move = (id: string, stage: OppStage) => setOpps((os) => os.map((o) => (o.id === id ? { ...o, stage } : o)));

  const activeTotal = opps
    .filter((o) => o.stage !== "赢单" && o.stage !== "输单")
    .reduce((s, o) => s + o.amount, 0);

  return (
    <div className="flex h-full flex-col gap-5">
      <header className="flex items-end justify-between">
        <div>
          <Heading level={2} size="xl">
            商机看板
          </Heading>
          <Text tone="muted" size="sm" className="mt-1">
            共 {opps.length} 个商机 · 进行中金额 {yuan(activeTotal)} · 通过卡片「⋯」移动阶段
          </Text>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-4 overflow-x-auto pb-2">
        {OPP_STAGES.map((stage) => {
          const col = opps.filter((o) => o.stage === stage);
          const total = col.reduce((s, o) => s + o.amount, 0);
          return (
            <section key={stage} className="flex w-[280px] shrink-0 flex-col gap-3">
              <div className="flex items-center justify-between rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className={`size-2 rounded-full ${stageDotClass[stage]}`} aria-hidden />
                  <span className="text-sm font-medium">{stage}</span>
                  <Badge variant="soft" tone="neutral">
                    {col.length}
                  </Badge>
                </div>
                <Text size="xs" tone="muted" className="tabular-nums">
                  {yuan(total)}
                </Text>
              </div>

              <div className="flex flex-col gap-2.5">
                {col.map((o) => (
                  <OppCard key={o.id} o={o} onMove={move} />
                ))}
                {col.length === 0 && (
                  <div className="rounded-[var(--radius)] border border-dashed border-border py-8 text-center text-xs text-muted">
                    暂无商机
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
