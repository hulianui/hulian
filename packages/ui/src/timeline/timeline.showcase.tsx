"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Timeline, TimelineItem } from "./timeline";
import type { TimelineItemProps, TimelineMode } from "./timeline.types";

// 内联勾选图标（零依赖），演示自定义 dot。
const CheckIcon = (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
    <path d="M5 10l3.5 3.5L15 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 审批流（最常见场景）。
const approval: TimelineItemProps[] = [
  { label: "09:12", children: "员工提交报销申请", color: "primary" },
  { label: "10:40", children: "直属经理审批通过", color: "success" },
  { label: "14:05", children: "财务复核退回（缺发票）", color: "danger" },
  { label: "16:20", children: "员工补充材料并重新提交", color: "warning" },
];

// 物流轨迹。
const logistics: TimelineItemProps[] = [
  { label: "06-01 08:00", children: "包裹已揽收 · 杭州转运中心", color: "success" },
  { label: "06-01 22:30", children: "运输中 · 已发往上海", color: "primary" },
  { label: "06-02 09:15", children: "已到达 · 上海浦东派送点", color: "primary" },
];

export const timelineShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "items 数组驱动，每项 label 作时间戳、children 作正文、color 控制圆点语气色。",
      code: `<Timeline
  items={[
    { label: "09:12", children: "员工提交报销申请", color: "primary" },
    { label: "10:40", children: "直属经理审批通过", color: "success" },
    { label: "14:05", children: "财务复核退回（缺发票）", color: "danger" },
    { label: "16:20", children: "员工补充材料并重新提交", color: "warning" },
  ]}
/>`,
      render: () => (
        <div className="max-w-md">
          <Timeline items={approval} />
        </div>
      ),
    },
    {
      title: "进行中（pending）",
      description: "pending 在末尾追加进行中的幽灵项（加载态圆点 + 虚线连入）。",
      code: `<Timeline items={logistics} pending="运输中 · 预计明日送达" />`,
      render: () => (
        <div className="max-w-md">
          <Timeline items={logistics} pending="运输中 · 预计明日送达" />
        </div>
      ),
    },
    {
      title: "自定义节点",
      description: "复合用法直接传 <TimelineItem>，dot 可换成图标（用 currentColor 随 color 上色）。",
      code: `<Timeline>
  <TimelineItem label="步骤一" color="success" dot={CheckIcon}>账号注册完成</TimelineItem>
  <TimelineItem label="步骤二" color="success" dot={CheckIcon}>实名认证通过</TimelineItem>
  <TimelineItem label="步骤三" color="primary">绑定收款账户（进行中）</TimelineItem>
</Timeline>`,
      render: () => (
        <div className="max-w-md">
          <Timeline>
            <TimelineItem label="步骤一" color="success" dot={CheckIcon}>
              账号注册完成
            </TimelineItem>
            <TimelineItem label="步骤二" color="success" dot={CheckIcon}>
              实名认证通过
            </TimelineItem>
            <TimelineItem label="步骤三" color="primary">
              绑定收款账户（进行中）
            </TimelineItem>
          </Timeline>
        </div>
      ),
    },
    {
      title: "布局方向",
      description: "mode 控制节点位置：left（默认）/ right 镜像 / alternate 左右交替。",
      code: `<>
  <Timeline items={logistics} mode="right" />
  <Timeline items={approval} mode="alternate" />
</>`,
      render: () => (
        <div className="flex flex-col gap-6">
          <div className="max-w-md">
            <Timeline items={logistics} mode="right" />
          </div>
          <div className="max-w-lg">
            <Timeline items={approval} mode="alternate" />
          </div>
        </div>
      ),
    },
  ],
  controls: [
    {
      prop: "mode",
      type: "select",
      options: ["left", "right", "alternate"],
      defaultValue: "left",
      label: "布局方向",
    },
    { prop: "pending", type: "boolean", defaultValue: false, label: "末尾进行中" },
  ],
  states: [
    {
      name: "审批流（左侧节点，彩色语气）",
      render: () => (
        <div className="max-w-md">
          <Timeline items={approval} />
        </div>
      ),
    },
    {
      name: "进行中（pending 加载态 + 虚线连入）",
      render: () => (
        <div className="max-w-md">
          <Timeline items={logistics} pending="运输中 · 预计明日送达" />
        </div>
      ),
    },
    {
      name: "自定义节点（图标）+ 复合用法",
      render: () => (
        <div className="max-w-md">
          <Timeline>
            <TimelineItem label="步骤一" color="success" dot={CheckIcon}>
              账号注册完成
            </TimelineItem>
            <TimelineItem label="步骤二" color="success" dot={CheckIcon}>
              实名认证通过
            </TimelineItem>
            <TimelineItem label="步骤三" color="primary">
              绑定收款账户（进行中）
            </TimelineItem>
          </Timeline>
        </div>
      ),
    },
    {
      name: "右侧节点（mode=right）",
      render: () => (
        <div className="max-w-md">
          <Timeline items={logistics} mode="right" />
        </div>
      ),
    },
    {
      name: "左右交替（mode=alternate）",
      render: () => (
        <div className="max-w-lg">
          <Timeline items={approval} mode="alternate" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="max-w-md">
      <Timeline
        items={approval}
        mode={(p.mode as TimelineMode) ?? "left"}
        pending={p.pending ? "审批中…" : undefined}
      />
    </div>
  ),
  toCode: (p) => {
    const mode = p.mode === "left" ? "" : ` mode="${p.mode as string}"`;
    const pending = p.pending ? ` pending=\"审批中…\"` : "";
    return `<Timeline items={items}${mode}${pending} />`;
  },
};
