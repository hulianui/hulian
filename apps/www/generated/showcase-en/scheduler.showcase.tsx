"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { dayjs } from "../../../../packages/ui/src/lib/date";
import { Scheduler } from "../../../../packages/ui/src/scheduler/scheduler";
import type { SchedulerEvent, SchedulerResource, SchedulerView } from "../../../../packages/ui/src/scheduler/scheduler.types";
const monday = dayjs().day(1).format("YYYY-MM-DD");
const at = (offsetDays: number, hhmm: string) => dayjs(monday).add(offsetDays, "day").format("YYYY-MM-DD") + `T${hhmm}:00`;
const RESOURCES: SchedulerResource[] = [
    { id: "d1", title: "Dr. Li", subtitle: "Internal Medicine" },
    { id: "d2", title: "Dr. Wang", subtitle: "Surgery" },
    { id: "d3", title: "Dr. Zhang", subtitle: "Pediatrics" },
];
const INITIAL: SchedulerEvent[] = [
    { id: "a1", title: "Follow-up consultation \u00B7 Mr. Chen", start: at(0, "09:00"), end: at(0, "09:30"), resourceId: "d1", tone: "primary", subtitle: "Internal Medicine" },
    { id: "a2", title: "First consultation \u00B7 Ms. Liu", start: at(0, "09:00"), end: at(0, "10:00"), resourceId: "d2", tone: "success", subtitle: "Surgery" },
    { id: "a3", title: "Dressing change \u00B7 Mr. Zhao", start: at(0, "10:30"), end: at(0, "11:00"), resourceId: "d1", tone: "warning" },
    { id: "a4", title: "Pediatric Vaccine", start: at(1, "14:00"), end: at(1, "14:30"), resourceId: "d3", tone: "primary" },
    { id: "a5", title: "Postoperative follow-up", start: at(2, "11:00"), end: at(2, "12:00"), resourceId: "d2", tone: "success" },
    { id: "a6", title: "Clinic suspension \u00B7 Academic conference", start: at(3, "13:00"), end: at(3, "17:00"), resourceId: "d1", tone: "neutral" },
];
function Demo({ initialView = "week" }: {
    initialView?: SchedulerView;
}) {
    const [events, setEvents] = useState(INITIAL);
    const [view, setView] = useState<SchedulerView>(initialView);
    const [date, setDate] = useState(monday);
    return (<div className="h-[520px] w-full">
      <Scheduler className="h-full" events={events} view={view} date={date} resources={RESOURCES} onViewChange={setView} onDateChange={setDate} onEventsChange={setEvents} onSlotDragCreate={(slot) => setEvents((prev) => [
            ...prev,
            {
                id: `n${prev.length + 1}-${slot.start}`,
                title: "New appointment",
                start: slot.start,
                end: slot.end,
                resourceId: slot.resourceId ?? "d1",
                tone: "primary",
            },
        ])} onSlotClick={(slot) => setEvents((prev) => [
            ...prev,
            {
                id: `n${prev.length + 1}-${slot.start}`,
                title: "New appointment",
                start: slot.start,
                end: slot.end,
                resourceId: slot.resourceId ?? "d1",
                tone: "primary",
            },
        ])}/>
    </div>);
}
export const schedulerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Controlled usage",
            description: "events / view / date are all controlled, state is held by consumers; onEventsChange gives back the entire set of new events (according to Kanban controlled paradigm).",
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
            render: () => (<div className="h-[460px] w-full">
          <Scheduler className="h-full" events={INITIAL} view="week" date={monday} resources={RESOURCES}/>
        </div>),
        },
        {
            title: "Resource View",
            description: "When view='resource', the horizontal axis is resources (doctor/clinic) and the vertical axis is time; resources needs to be passed.",
            code: `<Scheduler
  events={events}
  view="resource"
  date={date}
  resources={resources}
  onEventsChange={setEvents}
/>`,
            render: () => (<div className="h-[460px] w-full">
          <Scheduler className="h-full" events={INITIAL} view="resource" date={monday} resources={RESOURCES}/>
        </div>),
        },
        {
            title: "Monthly Overview",
            description: "view='month' gives an overview of the whole month, click on a certain day onDateChange + onViewChange to drill down to the day view.",
            code: `<Scheduler
  events={events}
  view="month"
  date={date}
  onDateChange={setDate}
  onViewChange={setView}
/>`,
            render: () => (<div className="h-[460px] w-full">
          <Scheduler className="h-full" events={INITIAL} view="month" date={monday} resources={RESOURCES}/>
        </div>),
        },
        {
            title: "Custom time range",
            description: "dayStartHour / dayEndHour narrows the timeline, hourHeight adjusts the pixel height per hour.",
            code: `<Scheduler
  events={events}
  view="day"
  date={date}
  dayStartHour={9}
  dayEndHour={13}
  hourHeight={72}
/>`,
            render: () => (<div className="h-[460px] w-full">
          <Scheduler className="h-full" events={INITIAL} view="day" date={monday} resources={RESOURCES} dayStartHour={9} dayEndHour={13} hourHeight={72}/>
        </div>),
        },
    ],
    controls: [],
    states: [
        {
            name: "Scheduling table (drag a blank space to create an appointment / drag an event to reschedule / drag a lower edge to change the duration \u00B7 Top column cuts month/week/day/resources)",
            render: () => <Demo initialView="week"/>,
        },
        {
            name: "Resource view (horizontal axis doctor \u00B7 vertical axis time)",
            render: () => <Demo initialView="resource"/>,
        },
        {
            name: "Monthly Overview",
            render: () => <Demo initialView="month"/>,
        },
    ],
    renderWithProps: () => <Demo initialView="week"/>,
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
