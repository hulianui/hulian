"use client";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Button, Descriptions, DescriptionsItem, Drawer, DrawerContent, StatusDot, Tag, Timeline, type TimelineItemProps, } from "@hulianui/ui";
interface Ticket {
    id: string;
    title: string;
    reporter: string;
    assignee: string;
    priority: "High" | "Medium" | "Low";
    status: "open" | "in_progress" | "resolved" | "closed";
    createdAt: string;
    updatedAt: string;
    desc: string;
}
const TICKET: Ticket = {
    id: "TK-20260605-042",
    title: "Intermittent 503 errors on the production sign-in endpoint",
    reporter: "Chen Xiaoyu",
    assignee: "Wang Lei",
    priority: "High",
    status: "in_progress",
    createdAt: "2026-06-05 09:12",
    updatedAt: "2026-06-05 14:38",
    desc: "Some users receive a 503 when signing in. The issue reproduces about 15% of the time and appears to be caused by an exhausted gateway connection pool.",
};
const STATUS_DOT_MAP: Record<Ticket["status"], {
    dot: "online" | "offline" | "degraded" | "maintenance";
    label: string;
}> = {
    open: { dot: "maintenance", label: "Pending" },
    in_progress: { dot: "degraded", label: "Processing" },
    resolved: { dot: "online", label: "Resolved" },
    closed: { dot: "offline", label: "Closed" },
};
const STATUS_TAG_TONE: Record<Ticket["status"], "neutral" | "warning" | "success" | "danger"> = {
    open: "neutral",
    in_progress: "warning",
    resolved: "success",
    closed: "danger",
};
const PRIORITY_TONE: Record<Ticket["priority"], "danger" | "warning" | "neutral"> = {
    "High": "danger",
    "Medium": "warning",
    "Low": "neutral",
};
const HISTORY: TimelineItemProps[] = [
    {
        color: "success",
        label: "09:12",
        children: (<div className="text-sm">
        <span className="font-medium text-foreground">Chen Xiaoyu</span>
        <span className="text-muted-foreground"> Create a ticket with high priority</span>
      </div>),
    },
    {
        color: "primary",
        label: "09:35",
        children: (<div className="text-sm">
        <span className="font-medium text-foreground">system</span>
        <span className="text-muted-foreground"> Automatically assigned to </span>
        <span className="font-medium text-foreground">Wang Lei</span>
      </div>),
    },
    {
        color: "primary",
        label: "10:08",
        children: (<div className="text-sm">
        <span className="font-medium text-foreground">Wang Lei</span>
        <span className="text-muted-foreground"> Processing starts and the status changes to "Processing"</span>
      </div>),
    },
    {
        color: "warning",
        label: "11:44",
        children: (<div className="text-sm">
        <span className="font-medium text-foreground">Wang Lei</span>
        <span className="text-muted-foreground"> Note added: increased the connection-pool limit from 200 to 800; monitoring impact</span>
      </div>),
    },
    {
        color: "default",
        label: "14:38",
        children: (<div className="text-sm">
        <span className="font-medium text-foreground">Wang Lei</span>
        <span className="text-muted-foreground"> Awaiting load-test results; an assessment is expected by 16:00.</span>
      </div>),
    },
];
export function DetailDrawerBlock() {
    const [open, setOpen] = useState(false);
    const ticket = TICKET;
    const dotMeta = STATUS_DOT_MAP[ticket.status];
    return (<div className="mx-auto w-full max-w-2xl">

      <div className="flex items-center justify-between rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-3">
          <FileText className="size-4 text-muted-foreground"/>
          <div>
            <div className="text-sm font-medium text-foreground">{ticket.id}</div>
            <div className="text-xs text-muted-foreground">{ticket.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusDot status={dotMeta.dot} label={dotMeta.label}/>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
            View details
          </Button>
        </div>
      </div>


      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent side="right" title={`Ticket details \u00B7 ${ticket.id}`} description={ticket.title} className="w-[min(520px,92vw)]">
          <div className="flex flex-col gap-6">

            <Descriptions bordered column={2} layout="horizontal">
              <DescriptionsItem label="Ticket ID" span={2}>
                <span className="font-mono text-sm">{ticket.id}</span>
              </DescriptionsItem>
              <DescriptionsItem label="Status">
                <span className="inline-flex items-center gap-2">
                  <StatusDot status={dotMeta.dot} label={dotMeta.label}/>
                  <Tag tone={STATUS_TAG_TONE[ticket.status]} size="sm" variant="soft">
                    {dotMeta.label}
                  </Tag>
                </span>
              </DescriptionsItem>
              <DescriptionsItem label="priority">
                <Tag tone={PRIORITY_TONE[ticket.priority]} size="sm">
                  {ticket.priority}
                </Tag>
              </DescriptionsItem>
              <DescriptionsItem label="Reporter">{ticket.reporter}</DescriptionsItem>
              <DescriptionsItem label="Owner">{ticket.assignee}</DescriptionsItem>
              <DescriptionsItem label="Created">{ticket.createdAt}</DescriptionsItem>
              <DescriptionsItem label="Latest updates">{ticket.updatedAt}</DescriptionsItem>
              <DescriptionsItem label="Problem description" span={2}>
                <span className="text-sm text-muted-foreground">{ticket.desc}</span>
              </DescriptionsItem>
            </Descriptions>


            <div>
              <div className="mb-3 text-sm font-medium text-foreground">Activity history</div>
              <Timeline items={HISTORY}/>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>);
}
