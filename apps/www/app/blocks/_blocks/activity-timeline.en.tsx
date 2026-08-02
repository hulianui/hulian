import { Avatar, Tag, Text, Timeline, type TimelineItemProps } from "@hulianui/ui";
interface Activity {
    id: string;
    actor: string;
    action: string;
    target: string;
    time: string;
    tag?: {
        label: string;
        tone: "success" | "danger" | "warning" | "brand" | "neutral";
    };
    color: "success" | "primary" | "warning" | "danger" | "default";
}
const ACTIVITIES: Activity[] = [
    {
        id: "1",
        actor: "Zhang Xiaoming",
        action: "Move ticket",
        target: "TK-20260605-042 \u00B7 Intermittent 503 errors on the production sign-in endpoint",
        time: "just now",
        tag: { label: "Resolved", tone: "success" },
        color: "success",
    },
    {
        id: "2",
        actor: "Li Siyuan",
        action: "Commented on a requirement",
        target: "DM-2026-089 \u00B7 Let users choose columns when exporting to Excel",
        time: "5 minutes ago",
        color: "primary",
    },
    {
        id: "3",
        actor: "Wang Xuemei",
        action: "closed",
        target: "BUG-1102 \u00B7 Mobile date picker renders incorrectly on iOS 16",
        time: "22 minutes ago",
        tag: { label: "Closed", tone: "danger" },
        color: "danger",
    },
    {
        id: "4",
        actor: "Chen Jianguo",
        action: "Change order created",
        target: "RFC-0031 \u00B7 Raise the database connection-pool limit from 200 to 800",
        time: "1 hour ago",
        tag: { label: "Pending approval", tone: "warning" },
        color: "warning",
    },
    {
        id: "5",
        actor: "Liu Fang",
        action: "Merged PR",
        target: "#2347 \u00B7 feat: log system connected to OpenTelemetry",
        time: "2 hours ago",
        tag: { label: "Merged", tone: "brand" },
        color: "success",
    },
    {
        id: "6",
        actor: "Zhao Lei",
        action: "Released version",
        target: "v3.12.0 \u00B7 14 bug fixes and 3 new features",
        time: "Yesterday 18:30",
        color: "primary",
    },
    {
        id: "7",
        actor: "Zhou Chen",
        action: "Archived project",
        target: "Legacy website migration (completed)",
        time: "Yesterday 15:10",
        tag: { label: "Archived", tone: "neutral" },
        color: "default",
    },
    {
        id: "8",
        actor: "Wu Kai",
        action: "Deployed changes",
        target: "Raise the gateway rate limit from 1,000 to 2,000 QPS (10% rollout)",
        time: "2 days ago",
        color: "warning",
    },
];
function ActivityItem({ act }: {
    act: Activity;
}) {
    return (<div className="flex items-start gap-3">
      <Avatar fallback={act.actor.slice(0, 1)} size="sm" className="mt-0.5 shrink-0"/>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
          <span className="font-medium text-foreground">{act.actor}</span>
          <span className="text-muted">{act.action}</span>
          {act.tag && (<Tag tone={act.tag.tone} size="sm" variant="soft">
              {act.tag.label}
            </Tag>)}
        </div>
        <div className="mt-0.5 truncate text-xs text-muted">{act.target}</div>
        <Text size="xs" tone="muted" className="mt-1 tabular-nums">
          {act.time}
        </Text>
      </div>
    </div>);
}
const TIMELINE_ITEMS: TimelineItemProps[] = ACTIVITIES.map((act) => ({
    color: act.color,
    children: <ActivityItem act={act}/>,
}));
export function ActivityTimelineBlock() {
    return (<div className="mx-auto w-full max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-base font-semibold text-foreground">Recent activity</span>
        <Text size="sm" tone="muted">
          Last 7 days · {ACTIVITIES.length} items
        </Text>
      </div>
      <Timeline items={TIMELINE_ITEMS}/>
    </div>);
}
