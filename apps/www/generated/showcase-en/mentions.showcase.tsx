"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Mentions } from "../../../../packages/ui/src/mentions/mentions";
import type { MentionOption } from "../../../../packages/ui/src/mentions/mentions.types";
function Initial({ name }: {
    name: string;
}) {
    return (<span className="flex size-6 items-center justify-center rounded-full bg-primary/12 text-xs font-medium text-primary">
      {name.slice(0, 1)}
    </span>);
}
const PEOPLE: MentionOption[] = [
    { value: "u1", label: "Lin Xiao", description: "Product Manager", startContent: <Initial name="Lin"/> },
    { value: "u2", label: "Chen Hang", description: "Front-end Engineer", startContent: <Initial name="Chen"/> },
    { value: "u3", label: "Wang Min", description: "Backend Engineer", startContent: <Initial name="Wang"/> },
    { value: "u4", label: "Zhao Lei", description: "Test", startContent: <Initial name="Zhao"/> },
    { value: "u5", label: "Zhou Ting", description: "Designer (on vacation)", startContent: <Initial name="Week"/>, disabled: true },
];
export const mentionsShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Enter @ to evoke the candidate floating layer, select with the arrow keys, and insert mention by Enter/Tab.",
            code: `<Mentions
  options={people}
  placeholder="Enter @ to mention a colleague..."
  onChange={setValue}
  onSelect={(o) => console.log(o)}
/>`,
            render: () => (<Mentions options={PEOPLE} placeholder="Enter @ to mention a colleague..." className="w-72"/>),
        },
        {
            title: "Custom trigger",
            description: "prefix is changed to \"#\" to associate non-personnel entities such as work orders.",
            code: `<Mentions
  prefix="#"
  options={tickets}
  placeholder="Enter # associated work order..."
/>`,
            render: () => (<Mentions prefix="#" options={[
                    { value: "t1", label: "Work Order-1024", description: "Login failed" },
                    { value: "t2", label: "Work Order-1031", description: "Payment timeout" },
                    { value: "t3", label: "Work Order-1042", description: "Data export" },
                ]} defaultValue="Related " placeholder="Enter # associated ticket..." className="w-72"/>),
        },
        {
            title: "Invalid state",
            description: "invalid is marked with a red border and lacks mention in the form verification prompt.",
            code: `<Mentions options={people} invalid defaultValue="Missing @person in charge" />`,
            render: () => (<Mentions options={PEOPLE} invalid defaultValue="Missing @person in charge" className="w-72"/>),
        },
        {
            title: "Disabled",
            description: "disabled Editing is prohibited, and the submitted mention will still be displayed in color.",
            code: `<Mentions options={people} disabled defaultValue="Disabled @Lin Xiao" />`,
            render: () => (<Mentions options={PEOPLE} disabled defaultValue="Disabled @Lin Xiao " className="w-72"/>),
        },
    ],
    controls: [
        { prop: "prefix", type: "text", defaultValue: "@", label: "Trigger" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "placeholder", type: "text", defaultValue: "Enter @ to mention a colleague...", label: "Placeholder" },
        { prop: "rows", type: "number", defaultValue: 3, label: "rows" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        {
            name: "default",
            render: () => (<Mentions options={PEOPLE} defaultValue="Reminder " placeholder="Enter @ to mention a colleague..." className="w-72"/>),
        },
        {
            name: "Custom trigger #",
            render: () => (<Mentions prefix="#" options={[
                    { value: "t1", label: "Work Order-1024", description: "Login failed" },
                    { value: "t2", label: "Work Order-1031", description: "Payment timeout" },
                    { value: "t3", label: "Work Order-1042", description: "Data export" },
                ]} defaultValue="Related " placeholder="Enter # associated ticket..." className="w-72"/>),
        },
        {
            name: "invalid",
            render: () => (<Mentions options={PEOPLE} invalid defaultValue="Missing @person in charge" className="w-72"/>),
        },
        {
            name: "disabled",
            render: () => (<Mentions options={PEOPLE} disabled defaultValue="Disabled @Lin Xiao " className="w-72"/>),
        },
    ],
    renderWithProps: (p) => (<Mentions options={PEOPLE} prefix={(p.prefix as string) || "@"} size={p.size as "sm" | "md" | "lg"} placeholder={p.placeholder as string} rows={p.rows as number} invalid={p.invalid as boolean} disabled={p.disabled as boolean} className="w-72"/>),
    toCode: (p) => `<Mentions
  prefix="${p.prefix}"
  size="${p.size}"
  options={people}
  placeholder="${p.placeholder}"
  rows={${p.rows}}${p.invalid ? "\n  invalid" : ""}${p.disabled ? "\n  disabled" : ""}
  onChange={setValue}
  onSelect={(o) => console.log(o)}
/>`,
};
