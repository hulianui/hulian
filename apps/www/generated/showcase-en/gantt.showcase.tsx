"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Gantt } from "../../../../packages/ui/src/gantt/gantt";
import type { GanttTask, GanttUnit } from "../../../../packages/ui/src/gantt/gantt.types";
const construction: GanttTask[] = [
    { id: "t1", name: "Site Survey", start: "2026-06-01", end: "2026-06-05", progress: 100, group: "Early stage" },
    { id: "t2", name: "Materials coming in", start: "2026-06-04", end: "2026-06-09", progress: 100, group: "Early stage" },
    { id: "t3", name: "Main construction", start: "2026-06-08", end: "2026-06-24", progress: 60, group: "Construction" },
    { id: "t4", name: "Electrical and Mechanical Installation", start: "2026-06-20", end: "2026-07-02", progress: 25, group: "Construction" },
    { id: "t5", name: "Completion acceptance", start: "2026-07-01", end: "2026-07-06", progress: 0, group: "Closing" },
    { id: "t6", name: "Settlement and delivery", start: "2026-07-06", end: "2026-07-10", progress: 0, group: "Closing" },
];
const sprint: GanttTask[] = [
    { id: "s1", name: "Requirements Review", start: "2026-06-01", end: "2026-06-03", progress: 100 },
    { id: "s2", name: "Interface joint debugging", start: "2026-06-03", end: "2026-06-10", progress: 70, color: "var(--color-chart-2)" },
    { id: "s3", name: "Grayscale is online", start: "2026-06-10", end: "2026-06-14", progress: 10, color: "var(--color-chart-4)" },
];
export const ganttShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input tasks (start/end is the closed interval of YYYY-MM-DD), and the time axis will be automatically filled according to the data range.",
            code: `const tasks = [
  { id: "s1", name: "Requirements Review", start: "2026-06-01", end: "2026-06-03", progress: 100},
  { id: "s2", name: "Interface joint debugging", start: "2026-06-03", end: "2026-06-10", progress: 70},
  { id: "s3", name: "Grayscale online", start: "2026-06-10", end: "2026-06-14", progress: 10 },
];

<Gantt tasks={tasks} unit="week" />`,
            render: () => (<div className="w-full">
          <Gantt tasks={sprint} unit="week"/>
        </div>),
        },
        {
            title: "Progress and today's line",
            description: "progress 0-100 The driving bar is filled with dark color; today draws a red vertical line when it falls within the range.",
            code: `<Gantt tasks={tasks} unit="week" today="2026-06-08" />`,
            render: () => (<div className="w-full">
          <Gantt tasks={sprint} unit="week" today="2026-06-08"/>
        </div>),
        },
        {
            title: "Grouping",
            description: "Tasks with the same group are grouped together with subtitles in the left column (in the order of incoming, no forced rearrangement).",
            code: `const tasks = [
  { id: "t1", name: "Site Survey", start: "2026-06-01", end: "2026-06-05", progress: 100, group: "early period" },
  { id: "t3", name: "Main Construction", start: "2026-06-08", end: "2026-06-24", progress: 60, group: "Construction" },
  { id: "t5", name: "Complete Acceptance", start: "2026-07-01", end: "2026-07-06", progress: 0, group: "End" },
];

<Gantt tasks={tasks} unit="week" today="2026-06-18" />`,
            render: () => (<div className="w-full">
          <Gantt tasks={construction} unit="week" today="2026-06-18"/>
        </div>),
        },
        {
            title: "Scale unit",
            description: "unit Cut day / week / month Change the scale density of the meter head; day scrolls horizontally when the scales are dense.",
            code: `<Gantt tasks={tasks} unit="month" today="2026-06-18" />`,
            render: () => (<div className="w-full">
          <Gantt tasks={construction} unit="month" today="2026-06-18"/>
        </div>),
        },
        {
            title: "Customize bar color",
            description: "task.color Overrides the default theme color (CSS color, such as token var() or hex).",
            code: `const tasks = [
  { id: "s1", name: "Requirements Review", start: "2026-06-01", end: "2026-06-03", progress: 100},
  { id: "s2", name: "Interface joint debugging", start: "2026-06-03", end: "2026-06-10", progress: 70, color: "var(--color-chart-2)" },
  { id: "s3", name: "Grayscale online", start: "2026-06-10", end: "2026-06-14", progress: 10, color: "var(--color-chart-4)" },
];

<Gantt tasks={tasks} unit="week" />`,
            render: () => (<div className="w-full">
          <Gantt tasks={sprint} unit="week"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "unit",
            type: "select",
            options: ["day", "week", "month"],
            defaultValue: "week",
            label: "Scale unit",
        },
    ],
    states: [
        {
            name: "Construction schedule (weekly scale + group + progress + today line)",
            render: () => (<div className="w-[680px] max-w-full">
          <Gantt tasks={construction} unit="week" today="2026-06-18"/>
        </div>),
        },
        {
            name: "Daily scale (fine-grained, horizontal scrolling)",
            render: () => (<div className="w-[680px] max-w-full">
          <Gantt tasks={sprint} unit="day" today="2026-06-08"/>
        </div>),
        },
        {
            name: "Monthly scale (overview across months)",
            render: () => (<div className="w-[680px] max-w-full">
          <Gantt tasks={construction} unit="month" today="2026-06-18"/>
        </div>),
        },
        {
            name: "Customized bar color (no grouping)",
            render: () => (<div className="w-[680px] max-w-full">
          <Gantt tasks={sprint} unit="week" today="2026-06-08"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="w-[680px] max-w-full">
      <Gantt tasks={construction} unit={(p.unit as GanttUnit) ?? "week"} today="2026-06-18"/>
    </div>),
    toCode: (p) => {
        const unit = p.unit && p.unit !== "day" ? ` unit="${p.unit as string}"` : "";
        return `<Gantt tasks={tasks}${unit} today="2026-06-18" />`;
    },
};
