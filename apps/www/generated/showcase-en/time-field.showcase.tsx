"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TimeField } from "../../../../packages/ui/src/time-field/time-field";
function Demo({ withSeconds, disabled, readOnly, clearable = true, initial = null, }: {
    withSeconds?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    initial?: string | null;
}) {
    const [v, setV] = useState<string | null>(initial);
    return (<TimeField value={v} onValueChange={setV} withSeconds={withSeconds} disabled={disabled} readOnly={readOnly} clearable={clearable}/>);
}
export const timeFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Each hour/minute is a segment. You can record without taking your hands off the keyboard: \u2191\u2193 to adjust the value, \u2190\u2192 to cut into segments, overwrite directly with numbers (enter two digits to automatically jump to the next segment), and Backspace to clear segments. It is important to choose TimePicker.",
            code: `<TimeField defaultValue="09:30" />`,
            render: () => <TimeField defaultValue="09:30"/>,
        },
        {
            title: "With seconds",
            description: "withSeconds Add the second segment, and the shape of the external value becomes HH:mm:ss.",
            code: `<TimeField withSeconds defaultValue="09:30:15" />`,
            render: () => <TimeField withSeconds defaultValue="09:30:15"/>,
        },
        {
            title: "Limited optional range",
            description: "minTime / maxTime is clamped at the moment when **the entire segment is lost** - segment-level restrictions will make it impossible to lose \"first lose 23 points and then lose minutes\".",
            code: `<TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" />`,
            render: () => <TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00"/>,
        },
        {
            title: "Disabled / Read Only",
            description: "disabled is grayed out as a whole and cannot be focused; readOnly cannot change the value but can be browsed in sections.",
            code: `<TimeField defaultValue="09:30" disabled />
<TimeField defaultValue="09:30" readOnly />`,
            render: () => (<div className="flex flex-wrap gap-3">
          <TimeField defaultValue="09:30" disabled/>
          <TimeField defaultValue="09:30" readOnly/>
        </div>),
        },
    ],
    controls: [
        { prop: "withSeconds", type: "boolean", defaultValue: false, label: "Display seconds" },
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "With default value", render: () => <Demo initial="09:30"/> },
        { name: "With seconds", render: () => <Demo withSeconds initial="09:30:15"/> },
        { name: "Limited range", render: () => <TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00"/> },
        { name: "Disabled", render: () => <Demo disabled initial="09:30"/> },
    ],
    renderWithProps: (p) => (<Demo withSeconds={p.withSeconds === true} clearable={p.clearable !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<TimeField
  value={time}
  onValueChange={setTime}${p.withSeconds ? "\n  withSeconds" : ""}${p.clearable === false ? "\n  clearable={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
