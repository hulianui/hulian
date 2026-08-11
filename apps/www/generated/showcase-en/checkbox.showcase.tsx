"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Checkbox } from "../../../../packages/ui/src/checkbox/checkbox";
import { Field } from "../../../../packages/ui/src/field/field";
const STATE_MAP: Record<string, {
    checked: boolean;
    indeterminate: boolean;
}> = {
    "Not selected": { checked: false, indeterminate: false },
    "Selected": { checked: true, indeterminate: false },
    "Half selection": { checked: false, indeterminate: true },
};
function CheckboxPlayground(p: Record<string, unknown>) {
    const init = STATE_MAP[(p.state as string) ?? "Not selected"] ?? STATE_MAP["Not selected"];
    const [checked, setChecked] = useState(init.checked);
    const [indeterminate, setIndeterminate] = useState(init.indeterminate);
    return (<Checkbox checked={checked} indeterminate={indeterminate} onCheckedChange={(c) => {
            setChecked(c);
            setIndeterminate(false);
        }} disabled={p.disabled as boolean} label={p.label as string}/>);
}
export const checkboxShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "label renders the text on the right side of the box and is natively associated, and you can switch it by clicking on the text.",
            code: `<Checkbox label="Agree to the terms" />`,
            render: () => <Checkbox label="Agree to the terms"/>,
        },
        {
            title: "Selected by default",
            description: "The uncontrolled writing method is checked by default with defaultChecked.",
            code: `<Checkbox defaultChecked label="Remember Me" />`,
            render: () => <Checkbox defaultChecked label="Remember me"/>,
        },
        {
            title: "Three states: half-selected",
            description: "indeterminate renders horizontal bars, often used for \"select all\" parent items.",
            code: `<>
  <Checkbox indeterminate label="Half Select" />
  <Checkbox defaultChecked label="Selected" />
  <Checkbox label="Not selected" />
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <Checkbox indeterminate label="Half selection"/>
          <Checkbox defaultChecked label="Selected"/>
          <Checkbox label="Not selected"/>
        </div>),
        },
        {
            title: "Disabled",
            description: "disabled Reduce transparency and block interaction (selected state can also be disabled).",
            code: `<>
  <Checkbox disabled label="Disabled" />
  <Checkbox disabled defaultChecked label="Disable selected" />
</>`,
            render: () => (<div className="flex flex-col gap-2">
          <Checkbox disabled label="Disabled"/>
          <Checkbox disabled defaultChecked label="Disable selected"/>
        </div>),
        },
        {
            title: "Compatible with Field",
            description: "Put it into Field to automatically concatenate labels and error messages.",
            code: `<Field label="Terms of Service" error="Must check to continue" className="w-72">
  <Checkbox label="I have read and agree" />
</Field>`,
            render: () => (<Field label="Terms of Service" error="Must be checked to continue" className="w-72">
          <Checkbox label="I have read and agreed"/>
        </Field>),
        },
    ],
    controls: [
        { prop: "state", type: "select", options: ["Not selected", "Selected", "Half selection"], defaultValue: "Not selected", label: "Initial state" },
        { prop: "label", type: "text", defaultValue: "Agree to the terms", label: "label" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        { name: "unchecked", render: () => <Checkbox aria-label="unchecked"/> },
        { name: "checked", render: () => <Checkbox defaultChecked aria-label="checked"/> },
        { name: "indeterminate", render: () => <Checkbox indeterminate aria-label="indeterminate"/> },
        { name: "with-label", render: () => <Checkbox defaultChecked label="Remember me"/> },
        {
            name: "size=sm (dense interfaces)",
            render: () => (<div className="flex items-center gap-4">
          <Checkbox defaultChecked size="sm" label="Valid for a long time"/>
          <Checkbox defaultChecked size="sm" label="Required" labelClassName="text-muted-foreground"/>
        </div>),
        },
        { name: "size comparison (sm / md)", render: () => (<div className="flex items-center gap-4">
        <Checkbox defaultChecked size="sm" label="sm"/>
        <Checkbox defaultChecked label="md"/>
      </div>) },
        { name: "disabled", render: () => <Checkbox disabled label="Disabled"/> },
        { name: "disabled-checked", render: () => <Checkbox disabled defaultChecked label="Disable selected"/> },
        {
            name: "in-field",
            render: () => (<Field label="Terms of Service" error="Must be checked to continue" className="w-72">
          <Checkbox label="I have read and agreed"/>
        </Field>),
        },
    ],
    renderWithProps: (p) => <CheckboxPlayground key={p.state as string} {...p}/>,
    toCode: (p) => {
        const s = p.state as string;
        const tri = s === "Selected" ? " defaultChecked" : s === "Half selection" ? " indeterminate" : "";
        return `<Checkbox${tri}${p.disabled ? " disabled" : ""} label="${p.label}" />`;
    },
};
