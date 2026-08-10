"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { DeployStatus } from "./deploy-status";
import type { DeployState } from "./deploy-status.types";

const ALL: DeployState[] = ["queued", "building", "ready", "error", "canceled", "skipped"];

export const deployStatusShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传 status 渲染 badge 软填充徽标，building 态图标自旋。",
      code: `<>
  <DeployStatus status="building" />
  <DeployStatus status="ready" />
  <DeployStatus status="error" />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <DeployStatus status="building" />
          <DeployStatus status="ready" />
          <DeployStatus status="error" />
        </div>
      ),
    },
    {
      title: "六态光谱",
      description: "覆盖排队/构建/上线/失败/取消/跳过全生命周期。",
      code: `<>
  {(["queued","building","ready","error","canceled","skipped"] as const).map((s) => (
    <DeployStatus key={s} status={s} />
  ))}
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          {ALL.map((s) => (
            <DeployStatus key={s} status={s} />
          ))}
        </div>
      ),
    },
    {
      title: "形态变体",
      description: "variant dot 圆点+文字（building 脉冲）/ icon 仅图标（紧凑单元格）。",
      code: `<>
  <DeployStatus status="building" variant="dot" />
  <DeployStatus status="ready" variant="dot" />
  <DeployStatus status="ready" variant="icon" />
  <DeployStatus status="error" variant="icon" />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <DeployStatus status="building" variant="dot" />
          <DeployStatus status="ready" variant="dot" />
          <DeployStatus status="ready" variant="icon" />
          <DeployStatus status="error" variant="icon" />
        </div>
      ),
    },
    {
      title: "小尺寸 · 行内",
      description: "size=\"sm\" 嵌入文本流。",
      code: `<p>上次部署 <DeployStatus status="ready" size="sm" /></p>`,
      render: () => (
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          上次部署 <DeployStatus status="ready" size="sm" /> ，预览环境 <DeployStatus status="building" size="sm" />
        </p>
      ),
    },
  ],
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
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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
