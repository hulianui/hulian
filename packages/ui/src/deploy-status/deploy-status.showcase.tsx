"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DeployStatus } from "./deploy-status";
import type { DeployState } from "./deploy-status.types";

const ALL: DeployState[] = ["queued", "building", "ready", "error", "canceled", "skipped"];

export const deployStatusShowcase: ShowcaseSpec = {
  controls: [
    { prop: "status", type: "select", options: [...ALL], defaultValue: "ready" },
    { prop: "variant", type: "select", options: ["badge", "dot", "icon"], defaultValue: "badge" },
    { prop: "size", type: "select", options: ["md", "sm"], defaultValue: "md" },
  ],
  states: [
    {
      name: "badge · 六态光谱",
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          {ALL.map((s) => (
            <DeployStatus key={s} status={s} />
          ))}
        </div>
      ),
    },
    {
      name: "dot · 圆点+文字（building 脉冲）",
      render: () => (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {ALL.map((s) => (
            <DeployStatus key={s} status={s} variant="dot" />
          ))}
        </div>
      ),
    },
    {
      name: "icon · 紧凑表格单元格",
      render: () => (
        <div className="flex items-center gap-4">
          {ALL.map((s) => (
            <DeployStatus key={s} status={s} variant="icon" />
          ))}
        </div>
      ),
    },
    {
      name: "小尺寸 · 行内",
      render: () => (
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          上次部署 <DeployStatus status="ready" size="sm" /> ，预览环境 <DeployStatus status="building" size="sm" />
        </p>
      ),
    },
  ],
  renderWithProps: (p) => (
    <DeployStatus
      status={(p.status as DeployState) ?? "ready"}
      variant={(p.variant as "badge" | "dot" | "icon") ?? "badge"}
      size={(p.size as "md" | "sm") ?? "md"}
    />
  ),
  toCode: (p) =>
    `<DeployStatus status={deploy.status}${p.variant && p.variant !== "badge" ? ` variant="${p.variant}"` : ""}${p.size === "sm" ? ' size="sm"' : ""} />`,
};
