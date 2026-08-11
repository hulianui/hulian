"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RadioGroup, Radio } from "../../../../packages/ui/src/radio/radio";
import { Field } from "../../../../packages/ui/src/field/field";
function RadioPlayground(p: Record<string, unknown>) {
    const [value, setValue] = useState("standard");
    return (<RadioGroup value={value} onValueChange={setValue} orientation={p.orientation as "vertical" | "horizontal"} disabled={p.disabled as boolean} aria-label="plan">
      <Radio value="standard" label="Standard"/>
      <Radio value="pro" label="Professional"/>
      <Radio value="max" label="Flagship"/>
    </RadioGroup>);
}
export const radioShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "RadioGroup packages multiple Radio, single selections are mutually exclusive, and the default is vertical arrangement.",
            code: `<RadioGroup defaultValue="b" aria-label="options">
  <Radio value="a" label="Option 1" />
  <Radio value="b" label="Option 2" />
  <Radio value="c" label="Option 3" />
</RadioGroup>`,
            render: () => (<RadioGroup defaultValue="b" aria-label="Options">
          <Radio value="a" label="Option 1"/>
          <Radio value="b" label="Option 2"/>
          <Radio value="c" label="Option 3"/>
        </RadioGroup>),
        },
        {
            title: "Horizontal arrangement",
            description: "Set orientation=\"horizontal\" to arrange the options horizontally.",
            code: `<RadioGroup orientation="horizontal" defaultValue="m" aria-label="Gender">
  <Radio value="m" label="Male" />
  <Radio value="f" label="Female" />
</RadioGroup>`,
            render: () => (<RadioGroup orientation="horizontal" defaultValue="m" aria-label="Gender">
          <Radio value="m" label="Male"/>
          <Radio value="f" label="Female"/>
        </RadioGroup>),
        },
        {
            title: "Disabled",
            description: "A single Radio plus disabled disables one item; the entire group disabled disables all.",
            code: `<RadioGroup defaultValue="a" aria-label="Package">
  <Radio value="a" label="Standard" />
  <Radio value="b" label="Professional (not available yet)" disabled />
  <Radio value="c" label="Flagship" />
</RadioGroup>`,
            render: () => (<RadioGroup defaultValue="a" aria-label="Package">
          <Radio value="a" label="Standard"/>
          <Radio value="b" label="Professional (not available yet)" disabled/>
          <Radio value="c" label="Flagship"/>
        </RadioGroup>),
        },
        {
            title: "With Field verification",
            description: "Package into Field to get labels and error prompts, and the check state will be transmitted to the circle stroke.",
            code: `<Field label="Package" error="Please select a package" className="w-72">
  <RadioGroup defaultValue="">
    <Radio value="basic" label="Basic Edition" />
    <Radio value="plus" label="Enhanced Version" />
  </RadioGroup>
</Field>`,
            render: () => (<Field label="Package" error="Please select a package" className="w-72">
          <RadioGroup defaultValue="">
            <Radio value="basic" label="Basic version"/>
            <Radio value="plus" label="Enhanced version"/>
          </RadioGroup>
        </Field>),
        },
    ],
    controls: [
        { prop: "orientation", type: "select", options: ["vertical", "horizontal"], defaultValue: "vertical", label: "Arrangement" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        {
            name: "vertical",
            render: () => (<RadioGroup defaultValue="b" aria-label="v">
          <Radio value="a" label="Option 1"/>
          <Radio value="b" label="Option 2"/>
          <Radio value="c" label="Option 3 (Disabled)" disabled/>
        </RadioGroup>),
        },
        {
            name: "horizontal",
            render: () => (<RadioGroup orientation="horizontal" defaultValue="m" aria-label="h">
          <Radio value="m" label="Male"/>
          <Radio value="f" label="Female"/>
        </RadioGroup>),
        },
        {
            name: "size=sm (dense interfaces)",
            render: () => (<RadioGroup orientation="horizontal" defaultValue="y" aria-label="sm">
          <Radio value="y" size="sm" label="To date"/>
          <Radio value="n" size="sm" label="Ended" labelClassName="text-muted-foreground"/>
        </RadioGroup>),
        },
        {
            name: "in-field",
            render: () => (<Field label="Package" error="Please select a package" className="w-72">
          <RadioGroup defaultValue="">
            <Radio value="basic" label="Basic version"/>
            <Radio value="plus" label="Enhanced version"/>
          </RadioGroup>
        </Field>),
        },
    ],
    renderWithProps: (p) => <RadioPlayground {...p}/>,
    toCode: (p) => `<RadioGroup orientation="${p.orientation}"${p.disabled ? " disabled" : ""} defaultValue="standard">
  <Radio value="standard" label="Standard" />
  <Radio value="pro" label="Professional" />
</RadioGroup>`,
};
