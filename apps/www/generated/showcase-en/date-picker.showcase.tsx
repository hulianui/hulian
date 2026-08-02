"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DatePicker } from "../../../../packages/ui/src/date-picker/date-picker";
import type { CalendarPicker } from "../../../../packages/ui/src/calendar/calendar.types";
function Demo({ picker = "date", disabled, readOnly, clearable = true, showToday = true, initial = null, }: {
    picker?: CalendarPicker;
    disabled?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    showToday?: boolean;
    initial?: string | null;
}) {
    const [v, setV] = useState<string | null>(initial);
    return (<DatePicker value={v} onValueChange={setV} picker={picker} disabled={disabled} readOnly={readOnly} clearable={clearable} showToday={showToday} aria-label="Select date"/>);
}
export const datePickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click the trigger to pop up a single-month calendar, select a day to submit and close. The external value is ISO date string YYYY-MM-DD.",
            code: `<DatePicker defaultValue="2026-06-08" />`,
            render: () => <DatePicker defaultValue="2026-06-08" aria-label="Select date"/>,
        },
        {
            title: "Select month / select year",
            description: "picker determines the particle size and value shape: month \u2192 YYYY-MM, year \u2192 YYYY. The panel title can be clicked to scroll up to the month/year view layer by layer.",
            code: `<DatePicker picker="month" defaultValue="2026-06" />
<DatePicker picker="year" defaultValue="2026" />`,
            render: () => (<div className="flex flex-wrap gap-3">
          <DatePicker picker="month" defaultValue="2026-06" aria-label="Select month"/>
          <DatePicker picker="year" defaultValue="2026" aria-label="Select year"/>
        </div>),
        },
        {
            title: "Limited range + disabled weekends",
            description: "minDate / maxDate frame the optional range, and disabledDate further prohibits selection on a daily basis.",
            code: `<DatePicker
  defaultValue="2026-06-10"
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }}
/>`,
            render: () => (<DatePicker defaultValue="2026-06-10" minDate="2026-06-01" maxDate="2026-06-30" aria-label="Select a working day" disabledDate={(iso) => {
                    const day = new Date(`${iso}T00:00:00`).getDay();
                    return day === 0 || day === 6;
                }}/>),
        },
        {
            title: "Custom display format",
            description: "displayFormat Only changes the display on the trigger, and the shape of the external value remains unchanged.",
            code: `<DatePicker defaultValue="2026-06-08" displayFormat="YYYY year M month D day" />`,
            render: () => (<DatePicker defaultValue="2026-06-08" displayFormat="YYYY year M month D day" aria-label="Select date"/>),
        },
        {
            title: "Disabled / Read Only",
            description: "disabled is grayed out and cannot be opened; readOnly can see the panel but cannot select it.",
            code: `<DatePicker defaultValue="2026-06-08" disabled />
<DatePicker defaultValue="2026-06-08" readOnly />`,
            render: () => (<div className="flex flex-wrap gap-3">
          <DatePicker defaultValue="2026-06-08" disabled aria-label="Disabled"/>
          <DatePicker defaultValue="2026-06-08" readOnly aria-label="Read only"/>
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
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
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
            render: () => (<DatePicker defaultValue="2026-06-10" minDate="2026-06-01" maxDate="2026-06-30" aria-label="Select a working day" disabledDate={(iso) => {
                    const day = new Date(`${iso}T00:00:00`).getDay();
                    return day === 0 || day === 6;
                }}/>),
        },
        { name: "Disabled", render: () => <Demo disabled initial="2026-06-08"/> },
    ],
    renderWithProps: (p) => (<Demo picker={(p.picker as CalendarPicker) ?? "date"} clearable={p.clearable !== false} showToday={p.showToday !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<DatePicker
  value={date}
  onValueChange={setDate}${p.picker && p.picker !== "date" ? `
  picker="${p.picker}"` : ""}${p.clearable === false ? "\n  clearable={false}" : ""}${p.showToday === false ? "\n  showToday={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
