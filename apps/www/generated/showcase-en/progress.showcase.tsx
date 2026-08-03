"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Progress } from "../../../../packages/ui/src/progress/progress";
export const progressShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Pass in value (default max=100) to fill the progress bar according to the percentage.",
            code: `<Progress value={40} className="w-64" />`,
            render: () => <Progress value={40} className="w-64"/>,
        },
        {
            title: "Show percentage",
            description: "showValue Displays a percentage label to the right of the progress bar.",
            code: `<Progress value={60} showValue className="w-64" />`,
            render: () => <Progress value={60} showValue className="w-64"/>,
        },
        {
            title: "Hue",
            description: "tone switches primary / success / warning / danger four semantic colors.",
            code: `<>
  <Progress value={40} tone="primary" showValue className="w-64" />
  <Progress value={70} tone="success" showValue className="w-64" />
  <Progress value={85} tone="warning" showValue className="w-64" />
  <Progress value={95} tone="danger" showValue className="w-64" />
</>`,
            render: () => (<div className="flex flex-col gap-3">
          <Progress value={40} tone="primary" showValue className="w-64"/>
          <Progress value={70} tone="success" showValue className="w-64"/>
          <Progress value={85} tone="warning" showValue className="w-64"/>
          <Progress value={95} tone="danger" showValue className="w-64"/>
        </div>),
        },
        {
            title: "Ring Progress",
            description: "variant=\"circular\" renders the ring, showValue displays the percentage in the center.",
            code: `<Progress variant="circular" value={75} showValue />`,
            render: () => <Progress variant="circular" value={75} showValue/>,
        },
        {
            title: "Indeterminate state",
            description: "Omit value (undefined) and enter the loading unsteady state, with both linear and circular animations looping.",
            code: `<>
  <Progress className="w-64" />
  <Progress variant="circular" />
</>`,
            render: () => (<div className="flex items-center gap-6">
          <Progress className="w-64"/>
          <Progress variant="circular"/>
        </div>),
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 40, label: "value" },
        { prop: "max", type: "number", defaultValue: 100, label: "max" },
        {
            prop: "variant",
            type: "select",
            options: ["linear", "circular"],
            defaultValue: "linear",
            label: "Form",
        },
        {
            prop: "tone",
            type: "select",
            options: ["primary", "success", "warning", "danger"],
            defaultValue: "primary",
            label: "Hue",
        },
        { prop: "showValue", type: "boolean", defaultValue: false, label: "Display value" },
        { prop: "indeterminate", type: "boolean", defaultValue: false, label: "Indeterminate state" },
    ],
    states: [
        { name: "linear 25%", render: () => <Progress value={25} className="w-64"/> },
        { name: "linear 60% + value", render: () => <Progress value={60} showValue className="w-64"/> },
        { name: "linear 100%", render: () => <Progress value={100} className="w-64"/> },
        {
            name: "linear success 100%",
            render: () => <Progress value={100} tone="success" showValue className="w-64"/>,
        },
        {
            name: "linear warning 70%",
            render: () => <Progress value={70} tone="warning" showValue className="w-64"/>,
        },
        {
            name: "linear danger 90%",
            render: () => <Progress value={90} tone="danger" showValue className="w-64"/>,
        },
        { name: "linear Unsteady state", render: () => <Progress className="w-64"/> },
        { name: "circular 75% + value", render: () => <Progress variant="circular" value={75} showValue/> },
        {
            name: "circular danger 40%",
            render: () => <Progress variant="circular" value={40} tone="danger" showValue/>,
        },
        { name: "circular Unsteady state", render: () => <Progress variant="circular"/> },
    ],
    renderWithProps: (p) => {
        const indeterminate = p.indeterminate as boolean;
        return (<Progress value={indeterminate ? undefined : (p.value as number)} max={p.max as number} variant={p.variant as "linear" | "circular"} tone={p.tone as "primary" | "danger" | "success" | "warning"} showValue={p.showValue as boolean} className={p.variant === "circular" ? undefined : "w-64"}/>);
    },
    toCode: (p) => {
        const indeterminate = p.indeterminate as boolean;
        const valueAttr = indeterminate ? "" : ` value={${p.value}}`;
        const variantAttr = p.variant === "circular" ? ` variant="circular"` : "";
        const toneAttr = p.tone && p.tone !== "primary" ? ` tone="${p.tone}"` : "";
        return `<Progress${variantAttr}${valueAttr}${toneAttr}${p.showValue ? " showValue" : ""} />`;
    },
};
