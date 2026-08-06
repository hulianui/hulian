"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DateTimePicker } from "../../../../packages/ui/src/date-time-picker/date-time-picker";
function Demo({ withSeconds, size = "md", minuteStep, disabled, readOnly, clearable = true, showNow = true, initial = null, }: {
    withSeconds?: boolean;
    size?: "sm" | "md" | "lg";
    minuteStep?: number;
    disabled?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    showNow?: boolean;
    initial?: string | null;
}) {
    const [v, setV] = useState<string | null>(initial);
    return (<DateTimePicker value={v} onValueChange={setV} withSeconds={withSeconds} size={size} minuteStep={minuteStep} disabled={disabled} readOnly={readOnly} clearable={clearable} showNow={showNow} aria-label="Select date and time"/>);
}
export const dateTimePickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "There is a whole calendar on the left and a time column on the right. You can choose from both sides without interfering with each other. The external value is a fixed-width text YYYY-MM-DD HH:mm, in dictionary order, which is time order.",
            code: `<DateTimePicker defaultValue="2026-06-08 09:30" />`,
            render: () => <DateTimePicker defaultValue="2026-06-08 09:30" aria-label="Select date and time"/>,
        },
        {
            title: "With seconds + step",
            description: "withSeconds adds the second column; minuteStep / secondStep controls the column granularity (commonly used is 5 / 15 / 30).",
            code: `<DateTimePicker withSeconds minuteStep={15} defaultValue="2026-06-08 09:30:00" />`,
            render: () => (<DateTimePicker withSeconds minuteStep={15} defaultValue="2026-06-08 09:30:00" aria-label="Select date and time"/>),
        },
        {
            title: "Limited range",
            description: "minDateTime / maxDateTime is the boundary of **date and time as a whole**: the date part limits the calendar, and the time part only takes effect on the day that presses the boundary - the days inside the range are open 24 hours a day.",
            code: `<DateTimePicker
  defaultValue="2026-06-10 12:00"
  minDateTime="2026-06-08 09:30"
  maxDateTime="2026-06-20 18:00"
/>`,
            render: () => (<DateTimePicker defaultValue="2026-06-10 12:00" minDateTime="2026-06-08 09:30" maxDateTime="2026-06-20 18:00" aria-label="Select date and time"/>),
        },
        {
            title: "Custom display format",
            description: "displayFormat Only changes the display on the trigger, and the shape of the external value remains unchanged.",
            code: `<DateTimePicker defaultValue="2026-06-08 09:30" displayFormat="MMM D, HH:mm" />`,
            render: () => (<DateTimePicker defaultValue="2026-06-08 09:30" displayFormat="MMM D, HH:mm" aria-label="Select date and time"/>),
        },
        {
            title: "Size",
            description: "size uses the same scale as Input and Select (sm 32px / md 40px / lg 48px), so controls sitting on one form row line up.",
            code: `<DateTimePicker size="sm" defaultValue="2026-06-08 09:30" />
<DateTimePicker size="md" defaultValue="2026-06-08 09:30" />
<DateTimePicker size="lg" defaultValue="2026-06-08 09:30" />`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <DateTimePicker size="sm" defaultValue="2026-06-08 09:30" aria-label="Small"/>
          <DateTimePicker size="md" defaultValue="2026-06-08 09:30" aria-label="Medium"/>
          <DateTimePicker size="lg" defaultValue="2026-06-08 09:30" aria-label="Large size"/>
        </div>),
        },
        {
            title: "Disabled / Read Only",
            description: "disabled is grayed out and cannot be opened; readOnly can see the panel but cannot select it.",
            code: `<DateTimePicker defaultValue="2026-06-08 09:30" disabled />
<DateTimePicker defaultValue="2026-06-08 09:30" readOnly />`,
            render: () => (<div className="flex flex-wrap gap-3">
          <DateTimePicker defaultValue="2026-06-08 09:30" disabled aria-label="Disabled"/>
          <DateTimePicker defaultValue="2026-06-08 09:30" readOnly aria-label="Read only"/>
        </div>),
        },
    ],
    controls: [
        { prop: "withSeconds", type: "boolean", defaultValue: false, label: "Display seconds" },
        {
            prop: "size",
            type: "select",
            options: ["sm", "md", "lg"],
            defaultValue: "md",
            label: "Size",
        },
        {
            prop: "minuteStep",
            type: "select",
            options: ["1", "5", "15", "30"],
            defaultValue: "1",
            label: "Minute steps",
        },
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
        { prop: "showNow", type: "boolean", defaultValue: true, label: "Quick now" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "With default value", render: () => <Demo initial="2026-06-08 09:30"/> },
        { name: "With seconds + 15 minute steps", render: () => <Demo withSeconds minuteStep={15} initial="2026-06-08 09:30:00"/> },
        {
            name: "Limited range",
            render: () => (<DateTimePicker defaultValue="2026-06-10 12:00" minDateTime="2026-06-08 09:30" maxDateTime="2026-06-20 18:00" aria-label="Select date and time"/>),
        },
        { name: "Small", render: () => <Demo size="sm" initial="2026-06-08 09:30"/> },
        { name: "Large size", render: () => <Demo size="lg" initial="2026-06-08 09:30"/> },
        { name: "Disabled", render: () => <Demo disabled initial="2026-06-08 09:30"/> },
    ],
    renderWithProps: (p) => (<Demo withSeconds={p.withSeconds === true} size={(p.size as "sm" | "md" | "lg") ?? "md"} minuteStep={Number(p.minuteStep ?? 1) || 1} clearable={p.clearable !== false} showNow={p.showNow !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<DateTimePicker
  value={dateTime}
  onValueChange={setDateTime}${p.withSeconds ? "\n  withSeconds" : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.minuteStep && p.minuteStep !== "1" ? `
  minuteStep={${p.minuteStep}}` : ""}${p.clearable === false ? "\n  clearable={false}" : ""}${p.showNow === false ? "\n  showNow={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
