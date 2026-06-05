"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { QueueLane } from "./queue-lane";
import type { QueueLaneDef, QueueItem } from "./queue-lane.types";

interface Job extends QueueItem {
  title: string;
  wait: string; // 已等待
  executor: string;
}

// —— 优先级队列（P0-P3） ——
const priorityLanes: QueueLaneDef[] = [
  { id: "p0", label: "P0 紧急", tone: "var(--chart-3)", meta: "均等 0.4s" },
  { id: "p1", label: "P1 高", tone: "var(--chart-4)", meta: "均等 1.2s" },
  { id: "p2", label: "P2 普通", tone: "var(--primary)", meta: "均等 3.5s" },
  { id: "p3", label: "P3 低", tone: "var(--muted-foreground)", meta: "均等 12s" },
];

const priorityJobs: Job[] = [
  { id: "t1", laneId: "p0", title: "实时风控审批", wait: "0.2s", executor: "Sonnet 4.6" },
  { id: "t2", laneId: "p0", title: "支付异常诊断", wait: "0.5s", executor: "Opus 4.7" },
  { id: "t3", laneId: "p1", title: "工单意图分类", wait: "0.9s", executor: "Haiku 4.5" },
  { id: "t4", laneId: "p1", title: "代码评审建议", wait: "1.4s", executor: "Sonnet 4.6" },
  { id: "t5", laneId: "p1", title: "合同条款抽取", wait: "1.8s", executor: "Opus 4.7" },
  { id: "t6", laneId: "p2", title: "周报摘要生成", wait: "3.1s", executor: "Haiku 4.5" },
  { id: "t7", laneId: "p2", title: "图像内容审核", wait: "4.0s", executor: "DeepSeek V4" },
  { id: "t8", laneId: "p2", title: "FAQ 向量召回", wait: "2.7s", executor: "Haiku 4.5" },
  { id: "t9", laneId: "p2", title: "翻译批处理", wait: "5.2s", executor: "DeepSeek V4" },
  { id: "t10", laneId: "p3", title: "历史日志归档分析", wait: "11s", executor: "Haiku 4.5" },
  { id: "t11", laneId: "p3", title: "离线知识库重建", wait: "18s", executor: "DeepSeek V4" },
];

// —— 分类队列（按任务类型） ——
const categoryLanes: QueueLaneDef[] = [
  { id: "text", label: "文本生成", tone: "var(--primary)", meta: "吞吐 42/min" },
  { id: "code", label: "代码", tone: "var(--chart-4)", meta: "吞吐 18/min" },
  { id: "image", label: "图像", tone: "var(--chart-3)", meta: "吞吐 9/min" },
  { id: "rag", label: "检索增强", tone: "var(--chart-2)", meta: "吞吐 65/min" },
];

const categoryJobs: Job[] = [
  { id: "c1", laneId: "text", title: "营销文案改写", wait: "0.8s", executor: "Sonnet 4.6" },
  { id: "c2", laneId: "text", title: "邮件草拟", wait: "1.1s", executor: "Haiku 4.5" },
  { id: "c3", laneId: "code", title: "单测补全", wait: "1.6s", executor: "Sonnet 4.6" },
  { id: "c4", laneId: "code", title: "SQL 优化建议", wait: "2.2s", executor: "Opus 4.7" },
  { id: "c5", laneId: "image", title: "海报生成", wait: "4.5s", executor: "图像编排器" },
  { id: "c6", laneId: "rag", title: "政策问答召回", wait: "0.3s", executor: "Haiku 4.5" },
  { id: "c7", laneId: "rag", title: "工单相似检索", wait: "0.5s", executor: "Haiku 4.5" },
];

function JobCard({ job, index }: { job: Job; index: number }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-background px-3 py-2 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-foreground">{job.title}</span>
        {/* 队列位次徽标：0 = 队首（FIFO） */}
        <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted">
          #{index + 1}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span className="truncate">{job.executor}</span>
        <span className="shrink-0 tabular-nums">等 {job.wait}</span>
      </div>
    </div>
  );
}

function QueueLaneDemo({
  variant,
  maxVisible,
}: {
  variant: "priority" | "category";
  maxVisible?: number;
}) {
  const lanes = variant === "priority" ? priorityLanes : categoryLanes;
  const items = variant === "priority" ? priorityJobs : categoryJobs;
  return (
    <QueueLane<Job>
      lanes={lanes}
      items={items}
      maxVisible={maxVisible}
      onItemClick={() => {}}
      renderItem={(job, index) => <JobCard job={job} index={index} />}
    />
  );
}

export const queueLaneShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["priority", "category"],
      defaultValue: "priority",
      label: "泳道维度",
    },
    { prop: "maxVisible", type: "number", defaultValue: 4, label: "每道直显条数" },
  ],
  states: [
    {
      name: "优先级队列（P0-P3 · 道头聚合平均等待 · 超 4 条折叠）",
      render: () => <QueueLaneDemo variant="priority" maxVisible={4} />,
    },
    {
      name: "分类队列（按任务类型 · 道头聚合吞吐）",
      render: () => <QueueLaneDemo variant="category" />,
    },
  ],
  renderWithProps: (p) => (
    <QueueLaneDemo
      variant={(p.variant as "priority" | "category") ?? "priority"}
      maxVisible={p.maxVisible as number}
    />
  ),
  toCode: () => `<QueueLane
  lanes={[
    { id: "p0", label: "P0 紧急", tone: "var(--chart-3)", meta: "均等 0.4s" },
    { id: "p1", label: "P1 高", tone: "var(--chart-4)" },
  ]}
  items={queue}
  maxVisible={4}
  onItemClick={(job) => openDetail(job.id)}
  renderItem={(job, i) => <JobCard job={job} rank={i + 1} />}
/>`,
};
