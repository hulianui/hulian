"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { QueueLane } from "../../../../packages/ui/src/queue-lane/queue-lane";
import type { QueueLaneDef, QueueItem } from "../../../../packages/ui/src/queue-lane/queue-lane.types";
interface Job extends QueueItem {
    title: string;
    wait: string;
    executor: string;
}
const priorityLanes: QueueLaneDef[] = [
    { id: "p0", label: "P0 Emergency", tone: "var(--color-chart-3)", meta: "Equal 0.4s" },
    { id: "p1", label: "P1 High", tone: "var(--color-chart-4)", meta: "Equal 1.2s" },
    { id: "p2", label: "P2 Normal", tone: "var(--color-primary)", meta: "Equal 3.5s" },
    { id: "p3", label: "P3 Low", tone: "var(--color-muted-foreground)", meta: "Equal 12s" },
];
const priorityJobs: Job[] = [
    { id: "t1", laneId: "p0", title: "Real-time risk control approval", wait: "0.2s", executor: "Sonnet 4.6" },
    { id: "t2", laneId: "p0", title: "Payment abnormality diagnosis", wait: "0.5s", executor: "Opus 4.7" },
    { id: "t3", laneId: "p1", title: "Work order intent classification", wait: "0.9s", executor: "Haiku 4.5" },
    { id: "t4", laneId: "p1", title: "Code review suggestions", wait: "1.4s", executor: "Sonnet 4.6" },
    { id: "t5", laneId: "p1", title: "Contract terms extraction", wait: "1.8s", executor: "Opus 4.7" },
    { id: "t6", laneId: "p2", title: "Weekly report summary generation", wait: "3.1s", executor: "Haiku 4.5" },
    { id: "t7", laneId: "p2", title: "Image content review", wait: "4.0s", executor: "DeepSeek V4" },
    { id: "t8", laneId: "p2", title: "FAQ Vector Recall", wait: "2.7s", executor: "Haiku 4.5" },
    { id: "t9", laneId: "p2", title: "Translation batch processing", wait: "5.2s", executor: "DeepSeek V4" },
    { id: "t10", laneId: "p3", title: "Historical log archive analysis", wait: "11s", executor: "Haiku 4.5" },
    { id: "t11", laneId: "p3", title: "Offline knowledge base reconstruction", wait: "18s", executor: "DeepSeek V4" },
];
const categoryLanes: QueueLaneDef[] = [
    { id: "text", label: "Text generation", tone: "var(--color-primary)", meta: "Throughput 42/min" },
    { id: "code", label: "Code", tone: "var(--color-chart-4)", meta: "Throughput 18/min" },
    { id: "image", label: "Image", tone: "var(--color-chart-3)", meta: "Throughput 9/min" },
    { id: "rag", label: "Search enhancement", tone: "var(--color-chart-2)", meta: "Throughput 65/min" },
];
const categoryJobs: Job[] = [
    { id: "c1", laneId: "text", title: "Marketing copywriting rewriting", wait: "0.8s", executor: "Sonnet 4.6" },
    { id: "c2", laneId: "text", title: "Email Drafting", wait: "1.1s", executor: "Haiku 4.5" },
    { id: "c3", laneId: "code", title: "Single test completion", wait: "1.6s", executor: "Sonnet 4.6" },
    { id: "c4", laneId: "code", title: "SQL Optimization Suggestions", wait: "2.2s", executor: "Opus 4.7" },
    { id: "c5", laneId: "image", title: "Poster generation", wait: "4.5s", executor: "Image Organizer" },
    { id: "c6", laneId: "rag", title: "Policy Q&A Recall", wait: "0.3s", executor: "Haiku 4.5" },
    { id: "c7", laneId: "rag", title: "Work order similar search", wait: "0.5s", executor: "Haiku 4.5" },
];
function JobCard({ job, index }: {
    job: Job;
    index: number;
}) {
    return (<div className="rounded-[var(--radius)] border border-border bg-bg px-3 py-2 transition-colors hover:border-primary/40">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[13px] font-medium text-foreground">{job.title}</span>

        <span className="shrink-0 rounded-full bg-subtle px-1.5 text-[11px] tabular-nums text-muted">
          #{index + 1}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted">
        <span className="truncate">{job.executor}</span>
        <span className="shrink-0 tabular-nums">etc. {job.wait}</span>
      </div>
    </div>);
}
function QueueLaneDemo({ variant, maxVisible, }: {
    variant: "priority" | "category";
    maxVisible?: number;
}) {
    const lanes = variant === "priority" ? priorityLanes : categoryLanes;
    const items = variant === "priority" ? priorityJobs : categoryJobs;
    return (<QueueLane<Job> lanes={lanes} items={items} maxVisible={maxVisible} onItemClick={() => { }} renderItem={(job, index) => <JobCard job={job} index={index}/>}/>);
}
export const queueLaneShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "lanes defines the lane (id/label/tone color bar/meta indicator), items is grouped by laneId, and the order within the lane is FIFO. The default rendering number of track headers + meta.",
            code: `<QueueLane
  lanes={[
    { id: "p0", label: "P0 Emergency", tone: "var(--color-chart-3)", meta: "Equal 0.4s" },
    { id: "p1", label: "P1 High", tone: "var(--color-chart-4)", meta: "Equal 1.2s" },
    { id: "p2", label: "P2 Normal", tone: "var(--color-primary)", meta: "Equal 3.5s" },
  ]}
  items={jobs}
  renderItem={(job, i) => <JobCard job={job} index={i} />}
/>`,
            render: () => <QueueLaneDemo variant="priority"/>,
        },
        {
            title: "Super long queue collapse",
            description: "maxVisible limits the number of directly displayed items per channel, and will be folded as \"N items remain\" if exceeded.",
            code: `<QueueLane
  lanes={lanes}
  items={jobs}
  maxVisible={4}
  renderItem={(job, i) => <JobCard job={job} index={i} />}
/>`,
            render: () => <QueueLaneDemo variant="priority" maxVisible={4}/>,
        },
        {
            title: "Click to drill down",
            description: "The card is read-only by default; after passing onItemClick, the card can be clicked/keyboard accessible (Enter/Space) for viewing details without changing the queue order.",
            code: `<QueueLane
  lanes={lanes}
  items={jobs}
  onItemClick={(job) => openDetail(job.id)}
  renderItem={(job, i) => <JobCard job={job} index={i} />}
/>`,
            render: () => <QueueLaneDemo variant="category"/>,
        },
    ],
    controls: [
        {
            prop: "variant",
            type: "select",
            options: ["priority", "category"],
            defaultValue: "priority",
            label: "Lane Dimensions",
        },
        { prop: "maxVisible", type: "number", defaultValue: 4, label: "Number of items displayed directly in each channel" },
    ],
    states: [
        {
            name: "Priority queue (P0-P3 \u00B7 Track head aggregation average waiting \u00B7 More than 4 folds)",
            render: () => <QueueLaneDemo variant="priority" maxVisible={4}/>,
        },
        {
            name: "Classification queue (by task type \u00B7 Track head aggregate throughput)",
            render: () => <QueueLaneDemo variant="category"/>,
        },
    ],
    renderWithProps: (p) => (<QueueLaneDemo variant={(p.variant as "priority" | "category") ?? "priority"} maxVisible={p.maxVisible as number}/>),
    toCode: () => `<QueueLane
  lanes={[
    { id: "p0", label: "P0 Emergency", tone: "var(--color-chart-3)", meta: "Equal 0.4s" },
    { id: "p1", label: "P1 High", tone: "var(--color-chart-4)" },
  ]}
  items={queue}
  maxVisible={4}
  onItemClick={(job) => openDetail(job.id)}
  renderItem={(job, i) => <JobCard job={job} rank={i + 1} />}
/>`,
};
