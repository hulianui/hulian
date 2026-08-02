"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Calendar } from "../../../../packages/ui/src/calendar/calendar";
import type { CalendarPicker } from "../../../../packages/ui/src/calendar/calendar.types";
function Demo({ picker = "date", disabled, readOnly, showToday = true, initial = null, }: {
    picker?: CalendarPicker;
    disabled?: boolean;
    readOnly?: boolean;
    showToday?: boolean;
    initial?: string | null;
}) {
    const [v, setV] = useState<string | null>(initial);
    return (<Calendar value={v} onValueChange={setV} picker={picker} disabled={disabled} readOnly={readOnly} showToday={showToday}/>);
}
export const calendarShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Resident calendar panel, without trigger or floating layer - if you want \"input box + pop-up layer\", use DatePicker, which is the panel inside. The external value is ISO date string YYYY-MM-DD.",
            code: `<Calendar defaultValue="2026-06-08" />`,
            render: () => <Calendar defaultValue="2026-06-08"/>,
        },
        {
            title: "Select month / select year",
            description: "picker determines the particle size and value shape: month \u2192 YYYY-MM, year \u2192 YYYY. The panel title can be clicked to scroll up to the month/year view layer by layer.",
            code: `<Calendar picker="month" defaultValue="2026-06" />
<Calendar picker="year" defaultValue="2026" />`,
            render: () => (<div className="flex flex-wrap gap-6">
          <Calendar picker="month" defaultValue="2026-06"/>
          <Calendar picker="year" defaultValue="2026"/>
        </div>),
        },
        {
            title: "Limited range + disabled weekends",
            description: "minDate / maxDate frame the optional range, and disabledDate further prohibits selection on a daily basis.",
            code: `<Calendar
  defaultValue="2026-06-10"
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }}
/>`,
            render: () => (<Calendar defaultValue="2026-06-10" minDate="2026-06-01" maxDate="2026-06-30" disabledDate={(iso) => {
                    const day = new Date(`${iso}T00:00:00`).getDay();
                    return day === 0 || day === 6;
                }}/>),
        },
        {
            title: "Specify the initial month",
            description: "defaultMonth only determines which screen the panel stops on, regardless of the selected value - suitable for \"no value but want to start viewing from a certain month\".",
            code: `<Calendar defaultMonth="2026-09-01" />`,
            render: () => <Calendar defaultMonth="2026-09-01"/>,
        },
        {
            title: "Disabled / Read Only",
            description: "disabled even stops turning pages; readOnly can turn pages but cannot select.",
            code: `<Calendar defaultValue="2026-06-08" disabled />
<Calendar defaultValue="2026-06-08" readOnly />`,
            render: () => (<div className="flex flex-wrap gap-6">
          <Calendar defaultValue="2026-06-08" disabled/>
          <Calendar defaultValue="2026-06-08" readOnly/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "picker",
            type: "select",
            options: ["date", "month", "year"],
            defaultValue: "date",
            label: "Granularity",
        },
        { prop: "showToday", type: "boolean", defaultValue: true, label: "Fast today" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "With default value", render: () => <Demo initial="2026-06-08"/> },
        { name: "Select month", render: () => <Demo picker="month" initial="2026-06"/> },
        { name: "Select year", render: () => <Demo picker="year" initial="2026"/> },
        {
            name: "Limited range (min/max + disabled weekends)",
            render: () => (<Calendar defaultValue="2026-06-10" minDate="2026-06-01" maxDate="2026-06-30" disabledDate={(iso) => {
                    const day = new Date(`${iso}T00:00:00`).getDay();
                    return day === 0 || day === 6;
                }}/>),
        },
        { name: "Disabled", render: () => <Demo disabled initial="2026-06-08"/> },
    ],
    renderWithProps: (p) => (<Demo picker={(p.picker as CalendarPicker) ?? "date"} showToday={p.showToday !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<Calendar
  value={date}
  onValueChange={setDate}${p.picker && p.picker !== "date" ? `
  picker="${p.picker}"` : ""}${p.showToday === false ? "\n  showToday={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
