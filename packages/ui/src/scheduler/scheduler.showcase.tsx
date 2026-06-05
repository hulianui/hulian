"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { dayjs } from "../lib/date";
import { Scheduler } from "./scheduler";
import type { SchedulerEvent, SchedulerResource, SchedulerView } from "./scheduler.types";

// 锚定到「本周周一」生成稳定示例数据（不依赖测试机当天具体值，但跟随今天所在周）。
const monday = dayjs().day(1).format("YYYY-MM-DD");
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
