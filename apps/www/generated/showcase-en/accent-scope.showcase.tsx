"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Progress } from "../../../../packages/ui/src/progress";
import { Segmented } from "../../../../packages/ui/src/segmented";
import { Switch } from "../../../../packages/ui/src/switch";
import { Tag } from "../../../../packages/ui/src/tag";
import { AccentScope } from "../../../../packages/ui/src/accent-scope/accent-scope";
const HUES = [
    { value: "258", label: "Hulian blue" },
    { value: "165", label: "Jade" },
    { value: "300", label: "Violet" },
    { value: "25", label: "Coral" },
    { value: "70", label: "Amber" },
];
function Sample() {
    return (<div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="soft">Secondary</Button>
      <Tag tone="brand">Tags</Tag>
      <Switch defaultChecked aria-label="Switch"/>
      <Progress value={64} className="w-32" aria-label="Progress"/>
    </div>);
}
function HuePicker() {
    const [hue, setHue] = useState("165");
    return (<AccentScope hue={Number(hue)} transition={600} className="space-y-4">
      <Segmented items={HUES} value={hue} onValueChange={setHue} aria-label="Hue"/>
      <Sample />
    </AccentScope>);
}
export const accentScopeShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Local hue change",
            description: "Primary, hover, subtle fill, subtle border, focus ring, and the chart palette in the subtree all move to the new hue, while lightness and chroma stay on the brand ladder.",
            code: `<AccentScope hue={165}>
  <Button>Primary</Button>
  <Tag tone="brand">Tag</Tag>
</AccentScope>`,
            render: () => (<AccentScope hue={165}>
          <Sample />
        </AccentScope>),
        },
        {
            title: "Transitioning hue",
            description: "transition animates the hue variable so the whole subtree changes together; the hue is driven by state.",
            code: `const [hue, setHue] = useState(165);

<AccentScope hue={hue} transition={600}>
  \u2026
</AccentScope>`,
            render: () => <HuePicker />,
        },
    ],
    controls: [{ prop: "hue", type: "number", defaultValue: 300, label: "Hue" }],
    states: [
        { name: "Brand color (258)", render: () => <AccentScope hue={258}><Sample /></AccentScope> },
        { name: "Jade (165)", render: () => <AccentScope hue={165}><Sample /></AccentScope> },
        { name: "Coral (25)", render: () => <AccentScope hue={25}><Sample /></AccentScope> },
    ],
    renderWithProps: (p) => (<AccentScope hue={p.hue as number}>
      <Sample />
    </AccentScope>),
    toCode: (p) => `<AccentScope hue={${p.hue}}>
  <Button>Primary</Button>
</AccentScope>`,
};
