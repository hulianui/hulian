"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { EventStream } from "../../../../packages/ui/src/event-stream/event-stream";
import type { EventStreamItem } from "../../../../packages/ui/src/event-stream/event-stream.types";
const auditEvents: EventStreamItem[] = [
    { id: 1, ts: "09:12:01", tone: "neutral", title: "Session started \u00B7 Task contract injected", meta: "0.9ms" },
    { id: 2, ts: "09:12:03", tone: "success", title: "Read pages/list/index.js", meta: "0.3ms" },
    { id: 3, ts: "09:12:09", tone: "success", title: "Write pages/list/index.js", meta: "0.4ms" },
    {
        id: 4,
        ts: "09:12:31",
        tone: "danger",
        title: "Dispatching the 3rd subtask was intercepted",
        detail: "A maximum of 2 parallel subtasks are allowed in the same session (\u2265 3 is considered excessive splitting). Basis: Team agreement \u00B7 Hard constraints 4",
        meta: "1.1ms",
    },
    {
        id: 5,
        ts: "09:13:02",
        tone: "warning",
        title: "Confirmation is required to write a knowledge base entry",
        detail: "The products in this directory require manual judgment of context, and have been turned into inquiries instead of direct rejections.",
        meta: "0.8ms",
        overridden: "This time we really need to record",
    },
    { id: 6, ts: "09:14:20", tone: "info", title: "Acceptance command execution completed \u00B7 Exit code 0", meta: "12.4s" },
];
const ciEvents: EventStreamItem[] = [
    { id: "a", ts: "14:02:11", tone: "info", title: "Pull code \u00B7 main@a1b2c3d", meta: "3.2s" },
    { id: "b", ts: "14:02:19", tone: "success", title: "Dependency installation completed", meta: "8.1s" },
    { id: "c", ts: "14:03:40", tone: "success", title: "Unit test 194/194 passed", meta: "81s" },
    { id: "d", ts: "14:04:02", tone: "warning", title: "There are 2 type checks any", detail: "src/legacy/adapter.ts:44, :91", meta: "22s" },
    { id: "e", ts: "14:04:55", tone: "danger", title: "End-to-end test 3 failures", detail: "Login jump timeout \u00D72 / Payment callback assertion does not match \u00D71", meta: "53s" },
];
function LiveDemo() {
    const [items, setItems] = useState<EventStreamItem[]>(auditEvents.slice(0, 3));
    useEffect(() => {
        let n = 3;
        const timer = setInterval(() => {
            n += 1;
            if (n > auditEvents.length) {
                setItems(auditEvents.slice(0, 3));
                n = 3;
                return;
            }
            setItems(auditEvents.slice(0, n));
        }, 1400);
        return () => clearInterval(timer);
    }, []);
    return <EventStream items={items} live maxHeight={280}/>;
}
export const eventStreamShowcase: ShowcaseSpec = {
    controls: [
        { prop: "live", type: "boolean", defaultValue: false, label: "New entry fades in" },
        { prop: "defaultExpanded", type: "boolean", defaultValue: false, label: "Expand details" },
        { prop: "side", type: "select", options: ["left", "right"], defaultValue: "left", label: "Timeline side" },
    ],
    states: [
        { name: "Default", render: () => <EventStream items={auditEvents}/> },
        { name: "Expand all details", render: () => <EventStream items={auditEvents} defaultExpanded/> },
        { name: "Height limit and internal roll", render: () => <EventStream items={[...auditEvents, ...ciEvents]} maxHeight={240}/> },
        { name: "Empty", render: () => <EventStream items={[]} emptyText="There are no events for this session yet"/> },
    ],
    examples: [
        {
            title: "Governance Audit Flow",
            description: "The semantic color carries \"which ones were stopped\", click on the title to expand the basis; the released items retain the release description, and the audit can be traced.",
            code: `<EventStream
  items={events}
  maxHeight={320}
  onItemClick={(e) => openDetail(e.id)}
/>`,
            render: () => <EventStream items={auditEvents} maxHeight={320}/>,
        },
        {
            title: "CI pipeline",
            description: "The same component can be used as a pipeline stage flow by changing a set of data; it takes time to put the meta column, and the equal-width numbers are naturally aligned.",
            code: `<EventStream items={pipelineSteps} defaultExpanded />`,
            render: () => <EventStream items={ciEvents} defaultExpanded/>,
        },
        {
            title: "Real-time addition (live)",
            description: "Newly arrived entries fade in once and then become static. The event stream is open all year round, and any looping animation is just noise.",
            code: `<EventStream items={items} live maxHeight={280} />`,
            render: () => <LiveDemo />,
        },
        {
            title: "Time axis right",
            description: "When embedding the narrow column on the right side of the main content on the left, placing the axis on the right side better fits the line of sight.",
            code: `<EventStream items={events} side="right" />`,
            render: () => <EventStream items={ciEvents} side="right"/>,
        },
    ],
    renderWithProps: (p) => (<EventStream items={auditEvents} live={p.live as boolean} defaultExpanded={p.defaultExpanded as boolean} side={(p.side as "left" | "right") ?? "left"}/>),
    toCode: (p) => `<EventStream
  items={events}${p.live ? "\n  live" : ""}${p.defaultExpanded ? "\n  defaultExpanded" : ""}${p.side === "right" ? "\n  side=\"right\"" : ""}
  onItemClick={(e) => openDetail(e.id)}
/>`,
};
