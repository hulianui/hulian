"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StatusDot } from "../../../../packages/ui/src/status-dot/status-dot";
import type { ChannelStatus } from "../../../../packages/ui/src/status-dot/status-dot.types";
const labelOf: Record<ChannelStatus, string> = {
    online: "Online",
    degraded: "Degraded",
    offline: "Offline",
    maintenance: "Maintenance",
};
export const statusDotShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Health status",
            description: "Four semantic states: online, degraded, offline, and maintenance. Colors are derived from tone.",
            code: `<>
  <StatusDot status="online" label="Online" />
  <StatusDot status="degraded" label="Degraded" />
  <StatusDot status="offline" label="Offline" />
  <StatusDot status="maintenance" label="Under maintenance" />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-4">
          <StatusDot status="online" label="Online"/>
          <StatusDot status="degraded" label="Degraded"/>
          <StatusDot status="offline" label="Offline"/>
          <StatusDot status="maintenance" label="Under maintenance"/>
        </div>),
        },
        {
            title: "Tail value slot",
            description: "extra slot placement delay/success rate and other values, tabular-nums aligned.",
            code: `<>
  <StatusDot status="online" label="Gateway A" extra="86ms" />
  <StatusDot status="degraded" label="Gateway B" extra="412ms" />
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <StatusDot status="online" label="Gateway A" extra="86ms"/>
          <StatusDot status="degraded" label="Gateway B" extra="412ms"/>
        </div>),
        },
        {
            title: "Pulse",
            description: "online Default respiratory pulse; can be switched explicitly with pulse.",
            code: `<>
  <StatusDot status="online" label="Automatic pulse" />
  <StatusDot status="degraded" label="Forced pulse" pulse />
  <StatusDot status="online" label="Turn off pulse" pulse={false} />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-4">
          <StatusDot status="online" label="Automatic pulse"/>
          <StatusDot status="degraded" label="Forced pulse" pulse/>
          <StatusDot status="online" label="Turn off pulse" pulse={false}/>
        </div>),
        },
        {
            title: "Dimensions & Dots Only",
            description: "size controls the dot size; only dots are rendered when label is omitted.",
            code: `<>
  <StatusDot status="online" size="sm" />
  <StatusDot status="online" size="md" />
  <StatusDot status="online" size="lg" />
</>`,
            render: () => (<div className="flex items-center gap-4">
          <StatusDot status="online" size="sm"/>
          <StatusDot status="online" size="md"/>
          <StatusDot status="online" size="lg"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "status",
            type: "select",
            options: ["online", "degraded", "offline", "maintenance"],
            defaultValue: "online",
        },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "pulse", type: "boolean", defaultValue: true, label: "Pulse" },
    ],
    states: [
        { name: "online", render: () => <StatusDot status="online" label="Online" extra="86ms"/> },
        { name: "degraded", render: () => <StatusDot status="degraded" label="Degraded" extra="412ms"/> },
        { name: "offline", render: () => <StatusDot status="offline" label="Offline"/> },
        { name: "maintenance", render: () => <StatusDot status="maintenance" label="Under maintenance"/> },
        { name: "Dots only", render: () => <StatusDot status="online"/> },
    ],
    renderWithProps: (p) => (<StatusDot status={p.status as ChannelStatus} size={p.size as "sm" | "md" | "lg"} pulse={p.pulse as boolean} label={labelOf[p.status as ChannelStatus]}/>),
    toCode: (p) => `<StatusDot status="${p.status}" size="${p.size}"${p.pulse ? " pulse" : ""} label="${labelOf[p.status as ChannelStatus]}" />`,
};
