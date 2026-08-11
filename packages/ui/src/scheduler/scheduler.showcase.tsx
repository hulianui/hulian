"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { dayjs } from "../lib/date";
import { Scheduler } from "./scheduler";
import type { SchedulerEvent, SchedulerResource, SchedulerView } from "./scheduler.types";

// 固定种子周（周一），**不读系统时钟**（#181）。
//
// 展示用例要说明的是「周视图长什么样」，不是「今天几号」。而在静态导出下读时钟会出事：
// 模块级的 `dayjs()` 在构建时求值一次并被烤进 SSR HTML，访问日一旦跨天，客户端算出另一个
// 周起始日 → hydration 当场失败（React #418）。固定日期顺带让截图与视觉回归可复现。
const monday = "2026-06-01";
const at = (offsetDays: number, hhmm: string) =>
  dayjs(monday).add(offsetDays, "day").format("YYYY-MM-DD") + `T${hhmm}:00`;

const RESOURCES: SchedulerResource[] = [
  { id: "d1", title: "李医生", subtitle: "内科" },
  { id: "d2", title: "王医生", subtitle: "外科" },
  { id: "d3", title: "张医生", subtitle: "儿科" },
];

const INITIAL: SchedulerEvent[] = [
  { id: "a1", title: "复诊 · 陈先生", start: at(0, "09:00"), end: at(0, "09:30"), resourceId: "d1", tone: "primary", subtitle: "内科" },
  { id: "a2", title: "初诊 · 刘女士", start: at(0, "09:00"), end: at(0, "10:00"), resourceId: "d2", tone: "success", subtitle: "外科" },
  { id: "a3", title: "换药 · 赵先生", start: at(0, "10:30"), end: at(0, "11:00"), resourceId: "d1", tone: "warning" },
  { id: "a4", title: "儿科疫苗", start: at(1, "14:00"), end: at(1, "14:30"), resourceId: "d3", tone: "primary" },
  { id: "a5", title: "术后随访", start: at(2, "11:00"), end: at(2, "12:00"), resourceId: "d2", tone: "success" },
  { id: "a6", title: "停诊 · 学术会议", start: at(3, "13:00"), end: at(3, "17:00"), resourceId: "d1", tone: "neutral" },
];

function Demo({ initialView = "week" }: { initialView?: SchedulerView }) {
  const [events, setEvents] = useState(INITIAL);
  const [view, setView] = useState<SchedulerView>(initialView);
  const [date, setDate] = useState(monday);

  return (
    <div className="h-[520px] w-full">
      <Scheduler
        className="h-full"
        events={events}
        view={view}
        date={date}
        resources={RESOURCES}
        onViewChange={setView}
        onDateChange={setDate}
        onEventsChange={setEvents}
        onSlotDragCreate={(slot) =>
          setEvents((prev) => [
            ...prev,
            {
              id: `n${prev.length + 1}-${slot.start}`,
              title: "新预约",
              start: slot.start,
              end: slot.end,
              resourceId: slot.resourceId ?? "d1",
              tone: "primary",
            },
          ])
        }
        onSlotClick={(slot) =>
          setEvents((prev) => [
            ...prev,
            {
              id: `n${prev.length + 1}-${slot.start}`,
              title: "新预约",
              start: slot.start,
              end: slot.end,
              resourceId: slot.resourceId ?? "d1",
              tone: "primary",
            },
          ])
        }
      />
    </div>
  );
}

export const schedulerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "受控用法",
      description: "events / view / date 全部受控，由消费者持有 state；onEventsChange 回吐整组新 events（照 Kanban 受控范式）。",
      code: `const [events, setEvents] = useState(INITIAL);
const [view, setView] = useState<SchedulerView>("week");
const [date, setDate] = useState(monday);

<Scheduler
  events={events}
  view={view}
  date={date}
  resources={resources}
  onViewChange={setView}
  onDateChange={setDate}
  onEventsChange={setEvents}
/>`,
      render: () => (
        <div className="h-[460px] w-full">
          <Scheduler
            className="h-full"
            events={INITIAL}
            view="week"
            date={monday}
            resources={RESOURCES}
          />
        </div>
      ),
    },
    {
      title: "资源视图",
      description: "view='resource' 时横轴为 resources（医生/诊室）、纵轴为时间；需传 resources。",
      code: `<Scheduler
  events={events}
  view="resource"
  date={date}
  resources={resources}
  onEventsChange={setEvents}
/>`,
      render: () => (
        <div className="h-[460px] w-full">
          <Scheduler
            className="h-full"
            events={INITIAL}
            view="resource"
            date={monday}
            resources={RESOURCES}
          />
        </div>
      ),
    },
    {
      title: "月总览",
      description: "view='month' 给出整月概览，点某天经 onDateChange + onViewChange 下钻到日视图。",
      code: `<Scheduler
  events={events}
  view="month"
  date={date}
  onDateChange={setDate}
  onViewChange={setView}
/>`,
      render: () => (
        <div className="h-[460px] w-full">
          <Scheduler
            className="h-full"
            events={INITIAL}
            view="month"
            date={monday}
            resources={RESOURCES}
          />
        </div>
      ),
    },
    {
      title: "自定义时间范围",
      description: "dayStartHour / dayEndHour 收窄时间轴，hourHeight 调每小时像素高。",
      code: `<Scheduler
  events={events}
  view="day"
  date={date}
  dayStartHour={9}
  dayEndHour={13}
  hourHeight={72}
/>`,
      render: () => (
        <div className="h-[460px] w-full">
          <Scheduler
            className="h-full"
            events={INITIAL}
            view="day"
            date={monday}
            resources={RESOURCES}
            dayStartHour={9}
            dayEndHour={13}
            hourHeight={72}
          />
        </div>
      ),
    },
  ],
  controls: [],
  states: [
    {
      name: "排班台（拖空白建预约 / 拖事件改期 / 拖下缘改时长 · 顶栏切月/周/日/资源）",
      render: () => <Demo initialView="week" />,
    },
    {
      name: "资源视图（横轴医生 · 纵轴时间）",
      render: () => <Demo initialView="resource" />,
    },
    {
      name: "月总览",
      render: () => <Demo initialView="month" />,
    },
  ],
  renderWithProps: () => <Demo initialView="week" />,
  toCode: () => `<Scheduler
  events={events}
  view={view}
  date={date}
  resources={resources}
  onViewChange={setView}
  onDateChange={setDate}
  onEventsChange={setEvents}
  onSlotDragCreate={(slot) => addAppointment(slot)}
  onEventClick={(ev) => openDetail(ev)}
/>`,
};
