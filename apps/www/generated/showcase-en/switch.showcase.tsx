"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Switch } from "../../../../packages/ui/src/switch/switch";
function Controlled(p: Record<string, unknown>) {
    const [on, setOn] = useState(false);
    return (<Switch checked={on} onCheckedChange={setOn} disabled={p.disabled as boolean} aria-label="demo"/>);
}
export const switchShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Off by default, click the toggle switch.",
            code: `<Switch aria-label="Switch" />`,
            render: () => <Switch aria-label="Switch"/>,
        },
        {
            title: "Enabled by default",
            description: "For uncontrolled writing, use defaultChecked to set the initial open state.",
            code: `<Switch defaultChecked aria-label="Switch" />`,
            render: () => <Switch defaultChecked aria-label="Switch"/>,
        },
        {
            title: "Disabled",
            description: "disabled Lock switch, both off/on states can be disabled.",
            code: `<>
  <Switch disabled aria-label="Disable-Off" />
  <Switch disabled defaultChecked aria-label="Disable-On" />
</>`,
            render: () => (<div className="flex items-center gap-4">
          <Switch disabled aria-label="Disable-Off"/>
          <Switch disabled defaultChecked aria-label="Disable-On"/>
        </div>),
        },
        {
            title: "With caption",
            description: "Use label to associate copywriting, and you can switch by clicking on the text.",
            code: `<label className="inline-flex items-center gap-2">
  <Switch defaultChecked aria-label="Receive notification" />
  <span className="text-sm text-foreground">Receive notification</span>
</label>`,
            render: () => (<label className="inline-flex items-center gap-2">
          <Switch defaultChecked aria-label="Receive notifications"/>
          <span className="text-sm text-foreground">Receive notifications</span>
        </label>),
        },
    ],
    controls: [{ prop: "disabled", type: "boolean", defaultValue: false }],
    states: [
        { name: "off", render: () => <Switch aria-label="off"/> },
        { name: "on", render: () => <Switch defaultChecked aria-label="on"/> },
        { name: "disabled", render: () => <Switch disabled aria-label="disabled"/> },
        { name: "disabled-on", render: () => <Switch disabled defaultChecked aria-label="disabled-on"/> },
    ],
    renderWithProps: (p) => <Controlled {...p}/>,
    toCode: (p) => `<Switch${p.disabled ? " disabled" : ""} />`,
};
