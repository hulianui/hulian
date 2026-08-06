"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { TimeField } from "../../../../packages/ui/src/time-field/time-field";
function Demo({ withSeconds, size = "md", disabled, readOnly, clearable = true, initial = null, }: {
    withSeconds?: boolean;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    readOnly?: boolean;
    clearable?: boolean;
    initial?: string | null;
}) {
    const [v, setV] = useState<string | null>(initial);
    return (<TimeField value={v} onValueChange={setV} withSeconds={withSeconds} size={size} disabled={disabled} readOnly={readOnly} clearable={clearable}/>);
}
export const timeFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Each hour/minute is a segment, and you can record without taking your hands off the keyboard: \u2191\u2193 to adjust the value, \u2190\u2192 to cut into segments, overwrite directly with numbers (enter two digits to automatically jump to the next segment), and Backspace to clear segments. It is important to choose TimePicker.",
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
            description: "minTime / maxTime is clamped at the moment when **the entire segment is lost** - segment level restrictions will make it impossible to lose \"first lose 23 points and then lose minutes\".",
            code: `<TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" />`,
            render: () => <TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00"/>,
        },
        {
            title: "Size",
            description: "size uses the same scale as Input and Select (sm 32px / md 40px / lg 48px), so controls sitting on one form row line up.",
            code: `<TimeField size="sm" defaultValue="09:30" />
<TimeField size="md" defaultValue="09:30" />
<TimeField size="lg" defaultValue="09:30" />`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <TimeField size="sm" defaultValue="09:30"/>
          <TimeField size="md" defaultValue="09:30"/>
          <TimeField size="lg" defaultValue="09:30"/>
        </div>),
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
        {
            prop: "size",
            type: "select",
            options: ["sm", "md", "lg"],
            defaultValue: "md",
            label: "Size",
        },
        { prop: "clearable", type: "boolean", defaultValue: true, label: "Clearable" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "With default value", render: () => <Demo initial="09:30"/> },
        { name: "With seconds", render: () => <Demo withSeconds initial="09:30:15"/> },
        { name: "Limited range", render: () => <TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00"/> },
        { name: "Small", render: () => <Demo size="sm" initial="09:30"/> },
        { name: "Large size", render: () => <Demo size="lg" initial="09:30"/> },
        { name: "Disabled", render: () => <Demo disabled initial="09:30"/> },
    ],
    renderWithProps: (p) => (<Demo withSeconds={p.withSeconds === true} size={(p.size as "sm" | "md" | "lg") ?? "md"} clearable={p.clearable !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<TimeField
  value={time}
  onValueChange={setTime}${p.withSeconds ? "\n  withSeconds" : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.clearable === false ? "\n  clearable={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
