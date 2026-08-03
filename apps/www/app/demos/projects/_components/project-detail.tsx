"use client";
import { copy } from "./project-detail.content";

import Link from "next/link";
import { ArrowLeft, FileText, Images, Receipt } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Descriptions,
  Empty,
  Gantt,
  type GanttTask,
  Heading,
  Result,
  Steps,
  type StepsItem,
  Tag,
  Text,
  Timeline,
} from "@hulianui/ui";
import { ROOT } from "./nav-config";
import { eventsFor, milestonesFor, projectById, scheduleFor } from "../_data/projects";
import { quotes } from "../_data/quotes";
import { invoices } from "../_data/invoices";
import { photosByProject } from "../_data/photos";
import { projectEventTypeLabel, projectStatusLabel, projectStatusTone, yuan } from "../_data/status";
import { PROJECT_STAGES } from "../_data/types";

const EVENT_COLOR: Record<string, "primary" | "success" | "warning" | "danger" | "default"> = {
  里程碑: "primary",
  回款: "success",
  开票: "warning",
  报价: "default",
  照片: "default",
  备注: "danger",
};

export function ProjectDetail({ id }: { id: string }) {
  const project = projectById(id);

  if (!project) {
    return (
      <Result
        status="error"
        title={copy("projectDoesNotExist")}
        subTitle={copy("theProjectMayHaveBeenDeletedDemo")}
      >
        <Button render={<Link href={`${ROOT}/tracking`} />}>{copy("returnToProjectList")}</Button>
      </Result>
    );
  }

  const milestones = milestonesFor(project);
  const events = eventsFor(id);
  const curStageIdx = PROJECT_STAGES.indexOf(project.stage);

  const steps: StepsItem[] = milestones.map((m) => ({
    title: m.label,
    description: m.doneAt ? copy("completeValue", m.doneAt) : copy("planValue", m.plannedAt),
  }));

  // 排期：优先用明细排期，缺失则按里程碑相邻日期派生工序条。
  const explicit = scheduleFor(id);
  const tasks: GanttTask[] =
    explicit.length > 0
      ? explicit.map((s) => ({ id: s.id, name: s.name, start: s.start, end: s.end, progress: s.progress, group: s.group }))
      : milestones.slice(0, -1).map((m, i) => ({
          id: `${id}-g${i}`,
          name: m.label,
          start: m.plannedAt,
          end: milestones[i + 1].plannedAt,
          progress: i < curStageIdx ? 100 : i === curStageIdx ? project.progress : 0,
        }));

  const relQuotes = quotes.filter((q) => q.projectId === id);
  const relInvoices = invoices.filter((iv) => iv.projectId === id);
  const relPhotos = photosByProject(id);

  return (
    <div className="flex flex-col gap-5">
      {/* 头部 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="mt-0.5 size-8 px-0"
            aria-label={copy("return")}
            render={<Link href={`${ROOT}/tracking`} />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Heading level={2} size="xl">
                {project.name}
              </Heading>
              <Tag tone={projectStatusTone(project.status)} size="sm" dot>
                {projectStatusLabel[project.status]}
              </Tag>
            </div>
            <Text tone="muted" size="sm" className="mt-1 tabular-nums">
              {project.code} · {project.region}
            </Text>
          </div>
        </div>
      </div>

      {/* 基本信息 */}
      <Card variant="outline">
        <CardBody className="p-5">
          <Descriptions
            column={3}
            bordered
            items={[
              { label: copy("contractIssuingPartyA"), children: project.client },
              { label: copy("takingOverTheTeam"), children: project.crew },
              { label: copy("projectLeader"), children: project.owner },
              { label: copy("contractAmount"), children: <span className="tabular-nums">{yuan(project.contractAmount)}</span> },
              { label: copy("startDate"), children: project.startAt },
              { label: copy("plannedCompletion"), children: project.dueAt },
              { label: copy("projectAddress"), children: project.address, span: 2 },
              { label: copy("currentProgress"), children: `${project.progress}%` },
            ]}
          />
        </CardBody>
      </Card>

      {/* 里程碑 */}
      <Card variant="outline">
        <CardHeader>
          <Heading level={3} size="base">{copy("projectMilestones")}</Heading>
        </CardHeader>
        <CardBody className="overflow-x-auto pt-1">
          <div className="min-w-[680px]">
            <Steps items={steps} current={Math.max(0, curStageIdx)} />
          </div>
        </CardBody>
      </Card>

      {/* 施工排期甘特 */}
      <Card variant="outline">
        <CardHeader className="flex items-center justify-between">
          <Heading level={3} size="base">{copy("constructionSchedule")}</Heading>
          <Text size="sm" tone="muted">{copy("weeklyViewProgressFilling")}</Text>
        </CardHeader>
        <CardBody className="pt-1">
          {tasks.length > 0 ? (
            <Gantt tasks={tasks} unit="week" today="2026-06-04" />
          ) : (
            <Empty description={copy("noScheduleYet")} />
          )}
        </CardBody>
      </Card>

      {/* 动态 + 关联 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card variant="outline" className="lg:col-span-2">
          <CardHeader>
            <Heading level={3} size="base">{copy("projectNews")}</Heading>
          </CardHeader>
          <CardBody className="pt-1">
            {events.length > 0 ? (
              <Timeline
                items={[...events]
                  .sort((a, b) => (a.at < b.at ? 1 : -1))
                  .map((e) => ({
                    color: EVENT_COLOR[e.type] ?? "default",
                    label: `${e.at} · ${e.by}`,
                    children: (
                      <Text size="sm">
                        <Tag tone="neutral" size="sm" variant="soft" className="mr-1.5 align-middle">
                          {projectEventTypeLabel[e.type]}
                        </Tag>
                        {e.text}
                      </Text>
                    ),
                  }))}
              />
            ) : (
              <Empty description={copy("noNewsYet")} />
            )}
          </CardBody>
        </Card>

        <Card variant="outline">
          <CardHeader>
            <Heading level={3} size="base">{copy("relatedDocuments")}</Heading>
          </CardHeader>
          <CardBody className="flex flex-col gap-2 pt-1">
            <RelLink href={`${ROOT}/quotes`} icon={<FileText className="size-4" />} label={copy("quotation")} count={relQuotes.length} />
            <RelLink href={`${ROOT}/invoices`} icon={<Receipt className="size-4" />} label={copy("invoice")} count={relInvoices.length} />
            <RelLink href={`${ROOT}/photos`} icon={<Images className="size-4" />} label={copy("workPhotos")} count={relPhotos.length} />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function RelLink({
  href,
  icon,
  label,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-[var(--radius)] border border-border px-3 py-2.5 transition-colors hover:border-primary/40 hover:bg-surface-hover"
    >
      <span className="flex items-center gap-2 text-sm text-foreground">
        <span className="text-muted">{icon}</span>
        {label}
      </span>
      <Tag tone="neutral" size="sm">
        {count}
      </Tag>
    </Link>
  );
}
