"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CheckboxGroup } from "../../../../packages/ui/src/checkbox-group/checkbox-group";
import { Checkbox } from "../../../../packages/ui/src/checkbox";
function Controlled(p: Record<string, unknown>) {
    const [v, setV] = useState<string[]>(["apple"]);
    return (<CheckboxGroup value={v} onValueChange={setV} disabled={p.disabled as boolean} orientation={(p.orientation as "vertical" | "horizontal") ?? "vertical"}>
      <Checkbox value="apple" label="Apple"/>
      <Checkbox value="banana" label="Banana"/>
      <Checkbox value="cherry" label="Cherry"/>
    </CheckboxGroup>);
}
export const checkboxGroupShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The child is Hulian Checkbox (each with value), and the group matches members by value.",
            code: `<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" label="Apple" />
  <Checkbox value="banana" label="Banana" />
  <Checkbox value="cherry" label="Cherry" />
</CheckboxGroup>`,
            render: () => (<CheckboxGroup defaultValue={["apple"]}>
          <Checkbox value="apple" label="Apple"/>
          <Checkbox value="banana" label="Banana"/>
          <Checkbox value="cherry" label="Cherry"/>
        </CheckboxGroup>),
        },
        {
            title: "Horizontal arrangement",
            description: "orientation=horizontal horizontally and automatically wrap.",
            code: `<CheckboxGroup defaultValue={["apple"]} orientation="horizontal">
  <Checkbox value="apple" label="Apple" />
  <Checkbox value="banana" label="Banana" />
  <Checkbox value="cherry" label="Cherry" />
</CheckboxGroup>`,
            render: () => (<CheckboxGroup defaultValue={["apple"]} orientation="horizontal">
          <Checkbox value="apple" label="Apple"/>
          <Checkbox value="banana" label="Banana"/>
          <Checkbox value="cherry" label="Cherry"/>
        </CheckboxGroup>),
        },
        {
            title: "Disable the entire group",
            description: "disabled is delivered to all Checkbox in the group.",
            code: `<CheckboxGroup defaultValue={["banana"]} disabled>
  <Checkbox value="apple" label="Apple" />
  <Checkbox value="banana" label="Banana" />
</CheckboxGroup>`,
            render: () => (<CheckboxGroup defaultValue={["banana"]} disabled>
          <Checkbox value="apple" label="Apple"/>
          <Checkbox value="banana" label="Banana"/>
        </CheckboxGroup>),
        },
    ],
    controls: [
        {
            prop: "orientation",
            type: "select",
            options: ["vertical", "horizontal"],
            defaultValue: "vertical",
            label: "Direction",
        },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "default",
            render: () => (<CheckboxGroup defaultValue={["apple"]}>
          <Checkbox value="apple" label="Apple"/>
          <Checkbox value="banana" label="Banana"/>
          <Checkbox value="cherry" label="Cherry"/>
        </CheckboxGroup>),
        },
        {
            name: "Horizontal",
            render: () => (<CheckboxGroup defaultValue={["apple"]} orientation="horizontal">
          <Checkbox value="apple" label="Apple"/>
          <Checkbox value="banana" label="Banana"/>
          <Checkbox value="cherry" label="Cherry"/>
        </CheckboxGroup>),
        },
        {
            name: "disabled",
            render: () => (<CheckboxGroup defaultValue={["banana"]} disabled>
          <Checkbox value="apple" label="Apple"/>
          <Checkbox value="banana" label="Banana"/>
        </CheckboxGroup>),
        },
    ],
    renderWithProps: (p) => <Controlled {...p}/>,
    toCode: () => `<CheckboxGroup defaultValue={["apple"]}>
  <Checkbox value="apple" label="Apple" />
  <Checkbox value="banana" label="Banana" />
</CheckboxGroup>`,
};
