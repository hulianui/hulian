"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TimePicker } from "../../../../packages/ui/src/time-picker/time-picker";
function Demo({ withSeconds, size = "md", minuteStep = 1, clearable = true, showNow = true, disabled, readOnly, initial = null, }: {
    withSeconds?: boolean;
    size?: "sm" | "md" | "lg";
    minuteStep?: number;
    clearable?: boolean;
    showNow?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    initial?: string | null;
}) {
    const [v, setV] = useState<string | null>(initial);
    return (<TimePicker value={v} onValueChange={setV} withSeconds={withSeconds} size={size} minuteStep={minuteStep} clearable={clearable} showNow={showNow} disabled={disabled} readOnly={readOnly} aria-label="Select time"/>);
}
export const timePickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Point trigger pops up hour/minute columns, the value is fixed-width 24-hour text HH:mm.",
            code: `<TimePicker defaultValue="09:30" />`,
            render: () => <TimePicker defaultValue="09:30" aria-label="Select time"/>,
        },
        {
            title: "With seconds",
            description: "withSeconds Add the seconds column, and the value shape becomes HH:mm:ss.",
            code: `<TimePicker withSeconds defaultValue="09:30:15" />`,
            render: () => <TimePicker withSeconds defaultValue="09:30:15" aria-label="Select time"/>,
        },
        {
            title: "Stepper",
            description: "minuteStep only lists the minutes of the entire step, so users do not need to choose from 60 in scenarios such as shift scheduling/appointment.",
            code: `<TimePicker minuteStep={15} defaultValue="09:30" />`,
            render: () => <TimePicker minuteStep={15} defaultValue="09:30" aria-label="Select time"/>,
        },
        {
            title: "Limited range",
            description: "minTime / maxTime Gray out unreachable values \u200B\u200Bcolumn by column. The criterion is \"whether the entire segment intersects with the range\" - when min=09:30, 9 o'clock is still available, but the minutes before 30 minutes within 9 o'clock are prohibited.",
            code: `<TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" />`,
            render: () => (<TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" aria-label="Select time"/>),
        },
        {
            title: "Size",
            description: "size uses the same scale as Input and Select (sm 32px / md 40px / lg 48px), so controls sitting on one form row line up.",
            code: `<TimePicker size="sm" defaultValue="09:30" />
<TimePicker size="md" defaultValue="09:30" />
<TimePicker size="lg" defaultValue="09:30" />`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <TimePicker size="sm" defaultValue="09:30" aria-label="Small"/>
          <TimePicker size="md" defaultValue="09:30" aria-label="Medium"/>
          <TimePicker size="lg" defaultValue="09:30" aria-label="Large size"/>
        </div>),
        },
        {
            title: "Disabled / Read Only",
            description: "disabled is grayed out and cannot be opened; readOnly panel can be viewed but cannot be selected.",
            code: `<TimePicker defaultValue="09:30" disabled />
<TimePicker defaultValue="09:30" readOnly />`,
            render: () => (<div className="flex flex-wrap gap-3">
          <TimePicker defaultValue="09:30" disabled aria-label="Disabled"/>
          <TimePicker defaultValue="09:30" readOnly aria-label="Read only"/>
        </div>),
        },
    ],
    controls: [
        { prop: "withSeconds", type: "boolean", defaultValue: false, label: "With seconds" },
        {
            prop: "size",
            type: "select",
            options: ["sm", "md", "lg"],
            defaultValue: "md",
            label: "Size",
        },
        { prop: "minuteStep", type: "select", options: ["1", "5", "15", "30"], defaultValue: "1", label: "Minute steps" },
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
        { prop: "showNow", type: "boolean", defaultValue: true, label: "Quick now" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "With default value", render: () => <Demo initial="09:30"/> },
        { name: "With seconds", render: () => <Demo withSeconds initial="09:30:15"/> },
        { name: "15 minute steps", render: () => <Demo minuteStep={15} initial="09:30"/> },
        {
            name: "Limited range",
            render: () => (<TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" aria-label="Select time"/>),
        },
        { name: "Small", render: () => <Demo size="sm" initial="09:30"/> },
        { name: "Large size", render: () => <Demo size="lg" initial="09:30"/> },
        { name: "Disabled", render: () => <Demo disabled initial="09:30"/> },
    ],
    renderWithProps: (p) => (<Demo withSeconds={p.withSeconds === true} size={(p.size as "sm" | "md" | "lg") ?? "md"} minuteStep={Number(p.minuteStep ?? 1) || 1} clearable={p.clearable !== false} showNow={p.showNow !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<TimePicker
  value={time}
  onValueChange={setTime}${p.withSeconds ? "\n  withSeconds" : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.minuteStep && Number(p.minuteStep) !== 1 ? `
  minuteStep={${p.minuteStep}}` : ""}${p.clearable === false ? "\n  clearable={false}" : ""}${p.showNow === false ? "\n  showNow={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
