"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DeployStatus } from "../../../../packages/ui/src/deploy-status/deploy-status";
import type { DeployState } from "../../../../packages/ui/src/deploy-status/deploy-status.types";
const ALL: DeployState[] = ["queued", "building", "ready", "error", "canceled", "skipped"];
export const deployStatusShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass status render badge soft fill logo, building status icon spin.",
            code: `<>
  <DeployStatus status="building" />
  <DeployStatus status="ready" />
  <DeployStatus status="error" />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-2">
          <DeployStatus status="building"/>
          <DeployStatus status="ready"/>
          <DeployStatus status="error"/>
        </div>),
        },
        {
            title: "Six-state spectrum",
            description: "Covers queuing/building/online/failure/cancellation/skipping the full life cycle.",
            code: `<>
  {(["queued","building","ready","error","canceled","skipped"] as const).map((s) => (
    <DeployStatus key={s} status={s} />
  ))}
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-2">
          {ALL.map((s) => (<DeployStatus key={s} status={s}/>))}
        </div>),
        },
        {
            title: "Morphological variant",
            description: "variant dot + text (building pulse) / icon only (compact cell).",
            code: `<>
  <DeployStatus status="building" variant="dot" />
  <DeployStatus status="ready" variant="dot" />
  <DeployStatus status="ready" variant="icon" />
  <DeployStatus status="error" variant="icon" />
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <DeployStatus status="building" variant="dot"/>
          <DeployStatus status="ready" variant="dot"/>
          <DeployStatus status="ready" variant="icon"/>
          <DeployStatus status="error" variant="icon"/>
        </div>),
        },
        {
            title: "Small size \u00B7 Inside the line",
            description: "size=\"sm\" Embed text stream.",
            code: `<p>Last deployment <DeployStatus status="ready" size="sm" /></p>`,
            render: () => (<p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Last deployed <DeployStatus status="ready" size="sm"/> , preview environment <DeployStatus status="building" size="sm"/>
        </p>),
        },
    ],
    controls: [
        { prop: "status", type: "select", options: [...ALL], defaultValue: "ready" },
        { prop: "variant", type: "select", options: ["badge", "dot", "icon"], defaultValue: "badge" },
        { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
    ],
    states: [
        {
            name: "badge \u00B7 Six-state spectrum",
            render: () => (<div className="flex flex-wrap items-center gap-2">
          {ALL.map((s) => (<DeployStatus key={s} status={s}/>))}
        </div>),
        },
        {
            name: "dot \u00B7 Marker and label (building pulse)",
            render: () => (<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {ALL.map((s) => (<DeployStatus key={s} status={s} variant="dot"/>))}
        </div>),
        },
        {
            name: "icon \u00B7 Compact table cells",
            render: () => (<div className="flex items-center gap-4">
          {ALL.map((s) => (<DeployStatus key={s} status={s} variant="icon"/>))}
        </div>),
        },
        {
            name: "Small size \u00B7 Inside the line",
            render: () => (<p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Last deployed <DeployStatus status="ready" size="sm"/> , preview environment <DeployStatus status="building" size="sm"/>
        </p>),
        },
    ],
    renderWithProps: (p) => (<DeployStatus status={(p.status as DeployState) ?? "ready"} variant={(p.variant as "badge" | "dot" | "icon") ?? "badge"} size={(p.size as "md" | "sm") ?? "md"}/>),
    toCode: (p) => `<DeployStatus status={deploy.status}${p.variant && p.variant !== "badge" ? ` variant="${p.variant}"` : ""}${p.size === "sm" ? " size=\"sm\"" : ""} />`,
};
