"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Gantt } from "./gantt";
import type { GanttTask, GanttUnit } from "./gantt.types";

// 施工排期样例（含分组 + 进度），范围约一个半月，today 落在范围中段。
const construction: GanttTask[] = [
  { id: "t1", name: "现场勘测", start: "2026-06-01", end: "2026-06-05", progress: 100, group: "前期" },
  { id: "t2", name: "材料进场", start: "2026-06-04", end: "2026-06-09", progress: 100, group: "前期" },
  { id: "t3", name: "主体施工", start: "2026-06-08", end: "2026-06-24", progress: 60, group: "施工" },
  { id: "t4", name: "机电安装", start: "2026-06-20", end: "2026-07-02", progress: 25, group: "施工" },
  { id: "t5", name: "竣工验收", start: "2026-07-01", end: "2026-07-06", progress: 0, group: "收尾" },
  { id: "t6", name: "结算交付", start: "2026-07-06", end: "2026-07-10", progress: 0, group: "收尾" },
];

// 不分组、带自定义条形色的精简样例。
const sprint: GanttTask[] = [
  { id: "s1", name: "需求评审", start: "2026-06-01", end: "2026-06-03", progress: 100 },
  { id: "s2", name: "接口联调", start: "2026-06-03", end: "2026-06-10", progress: 70, color: "var(--color-chart-2)" },
  { id: "s3", name: "灰度上线", start: "2026-06-10", end: "2026-06-14", progress: 10, color: "var(--color-chart-4)" },
];

export const ganttShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "unit",
      type: "select",
      options: ["day", "week", "month"],
      defaultValue: "week",
      label: "刻度单位",
    },
  ],
  states: [
    {
      name: "施工排期（周刻度 + 分组 + 进度 + today 线）",
      render: () => (
        <div className="w-[680px] max-w-full">
          <Gantt tasks={construction} unit="week" today="2026-06-18" />
        </div>
      ),
    },
    {
      name: "日刻度（细粒度，横向滚动）",
      render: () => (
        <div className="w-[680px] max-w-full">
          <Gantt tasks={sprint} unit="day" today="2026-06-08" />
        </div>
      ),
    },
    {
      name: "月刻度（跨月概览）",
      render: () => (
        <div className="w-[680px] max-w-full">
          <Gantt tasks={construction} unit="month" today="2026-06-18" />
        </div>
      ),
    },
    {
      name: "自定义条形色（无分组）",
      render: () => (
        <div className="w-[680px] max-w-full">
          <Gantt tasks={sprint} unit="week" today="2026-06-08" />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-[680px] max-w-full">
      <Gantt
        tasks={construction}
        unit={(p.unit as GanttUnit) ?? "week"}
        today="2026-06-18"
      />
    </div>
  ),
  toCode: (p) => {
    const unit = p.unit && p.unit !== "day" ? ` unit="${p.unit as string}"` : "";
    return `<Gantt tasks={tasks}${unit} today="2026-06-18" />`;
  },
};
