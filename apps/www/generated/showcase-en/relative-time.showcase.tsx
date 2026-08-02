"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RelativeTime } from "../../../../packages/ui/src/relative-time/relative-time";
const BASE = new Date("2026-06-05T12:00:00");
const ago = (sec: number) => new Date(BASE.getTime() - sec * 1000);
const after = (sec: number) => new Date(BASE.getTime() + sec * 1000);
function Row({ label, children }: {
    label: string;
    children: React.ReactNode;
}) {
    return (<div className="flex items-center justify-between gap-6 border-b border-border py-1.5 text-sm last:border-0">
      <span className="text-muted">{label}</span>
      <span className="font-medium">{children}</span>
    </div>);
}
export const relativeTimeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "If the timestamp is passed, it will be rendered as \"3 minutes ago\". If base is omitted, it will be refreshed in real time. Hover to see the absolute time.",
            code: `<RelativeTime value={publishedAt} />`,
            render: () => <RelativeTime value={ago(20 * 60)} base={BASE}/>,
        },
        {
            title: "Fixed datum",
            description: "Pass base with fixed reference to \"now\", SSR/list unified reference, not real-time tick.",
            code: `<>
  <RelativeTime value={ago(45)} base={now} />
  <RelativeTime value={ago(5 * 3600)} base={now} />
  <RelativeTime value={ago(8 * 86400)} base={now} />
</>`,
            render: () => (<div className="flex flex-col gap-1 text-sm">
          <RelativeTime value={ago(45)} base={BASE}/>
          <RelativeTime value={ago(5 * 3600)} base={BASE}/>
          <RelativeTime value={ago(8 * 86400)} base={BASE}/>
        </div>),
        },
        {
            title: "Future time",
            description: "The target time is later than the base time and is rendered as \"10 minutes later/tomorrow\".",
            code: `<>
  <RelativeTime value={after(10 * 60)} base={now} />
  <RelativeTime value={after(86400 + 60)} base={now} />
</>`,
            render: () => (<div className="flex flex-col gap-1 text-sm">
          <RelativeTime value={after(10 * 60)} base={BASE}/>
          <RelativeTime value={after(86400 + 60)} base={BASE}/>
        </div>),
        },
        {
            title: "English locale",
            description: "locale=\"en\" outputs \"5m ago / in 5m\" compact English format.",
            code: `<RelativeTime value={publishedAt} locale="en" />`,
            render: () => (<div className="flex flex-col gap-1 text-sm">
          <RelativeTime value={ago(5 * 60)} base={BASE} locale="en"/>
          <RelativeTime value={after(5 * 60)} base={BASE} locale="en"/>
        </div>),
        },
    ],
    controls: [{ prop: "locale", type: "select", options: ["zh", "en"], defaultValue: "zh" }],
    states: [
        {
            name: "Past (fixed basis)",
            render: () => (<div className="w-72">
          <Row label="3 seconds ago"><RelativeTime value={ago(3)} base={BASE}/></Row>
          <Row label="45 seconds ago"><RelativeTime value={ago(45)} base={BASE}/></Row>
          <Row label="20 minutes ago"><RelativeTime value={ago(20 * 60)} base={BASE}/></Row>
          <Row label="5 hours ago"><RelativeTime value={ago(5 * 3600)} base={BASE}/></Row>
          <Row label="1 day ago"><RelativeTime value={ago(86400 + 60)} base={BASE}/></Row>
          <Row label="8 days ago"><RelativeTime value={ago(8 * 86400)} base={BASE}/></Row>
          <Row label="3 months ago"><RelativeTime value={ago(95 * 86400)} base={BASE}/></Row>
          <Row label="2 years ago"><RelativeTime value={ago(800 * 86400)} base={BASE}/></Row>
        </div>),
        },
        {
            name: "Future",
            render: () => (<div className="w-72">
          <Row label="10 minutes later"><RelativeTime value={after(10 * 60)} base={BASE}/></Row>
          <Row label="Tomorrow"><RelativeTime value={after(86400 + 60)} base={BASE}/></Row>
          <Row label="3 days later"><RelativeTime value={after(3 * 86400)} base={BASE}/></Row>
        </div>),
        },
        {
            name: "English locale",
            render: () => (<div className="w-72">
          <Row label="5 minutes ago"><RelativeTime value={ago(5 * 60)} base={BASE} locale="en"/></Row>
          <Row label="2 hours ago"><RelativeTime value={ago(2 * 3600)} base={BASE} locale="en"/></Row>
          <Row label="in 5m"><RelativeTime value={after(5 * 60)} base={BASE} locale="en"/></Row>
        </div>),
        },
        {
            name: "Real-time refresh (without base \u00B7 Automatic update every minute)",
            render: () => (<p className="text-sm text-muted">
          Posted in <RelativeTime value={new Date(Date.now() - 90 * 1000)} className="text-foreground"/>, hover to see the absolute time
        </p>),
        },
    ],
    renderWithProps: (p) => <RelativeTime value={ago(20 * 60)} base={BASE} locale={(p.locale as "zh" | "en") ?? "zh"}/>,
    toCode: (p) => `<RelativeTime value={publishedAt}${p.locale && p.locale !== "zh" ? ` locale="${p.locale}"` : ""} />`,
};
