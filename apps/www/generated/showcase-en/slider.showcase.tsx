"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Slider } from "../../../../packages/ui/src/slider/slider";
export const sliderShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "defaultValue Set the initial value and drag the slider to take the value.",
            code: `<Slider defaultValue={40} className="w-64" />`,
            render: () => <Slider defaultValue={40} className="w-64"/>,
        },
        {
            title: "Display value",
            description: "showValue Reads the current value above the track.",
            code: `<Slider defaultValue={60} showValue className="w-64" />`,
            render: () => <Slider defaultValue={60} showValue className="w-64"/>,
        },
        {
            title: "Interval selection",
            description: "defaultValue The passed array automatically changes to a double slider interval selection.",
            code: `<Slider defaultValue={[25, 75]} showValue className="w-64" />`,
            render: () => <Slider defaultValue={[25, 75]} showValue className="w-64"/>,
        },
        {
            title: "Stepper",
            description: "step controls the minimum step size, here each step is 10.",
            code: `<Slider defaultValue={50} step={10} showValue className="w-64" />`,
            render: () => <Slider defaultValue={50} step={10} showValue className="w-64"/>,
        },
        {
            title: "Disabled",
            description: "disabled Lock the slider and reduce the overall transparency.",
            code: `<Slider defaultValue={40} disabled className="w-64" />`,
            render: () => <Slider defaultValue={40} disabled className="w-64"/>,
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 40, label: "value" },
        { prop: "min", type: "number", defaultValue: 0, label: "min" },
        { prop: "max", type: "number", defaultValue: 100, label: "max" },
        { prop: "step", type: "number", defaultValue: 1, label: "step" },
        { prop: "showValue", type: "boolean", defaultValue: true, label: "Display value" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        { name: "default", render: () => <Slider defaultValue={40} className="w-64"/> },
        { name: "showValue", render: () => <Slider defaultValue={60} showValue className="w-64"/> },
        { name: "range", render: () => <Slider defaultValue={[25, 75]} showValue className="w-64"/> },
        { name: "step=10", render: () => <Slider defaultValue={50} step={10} className="w-64"/> },
        { name: "disabled", render: () => <Slider defaultValue={40} disabled className="w-64"/> },
    ],
    renderWithProps: (p) => (<Slider defaultValue={p.value as number} min={p.min as number} max={p.max as number} step={p.step as number} showValue={p.showValue as boolean} disabled={p.disabled as boolean} className="w-64"/>),
    toCode: (p) => `<Slider defaultValue={${p.value}} min={${p.min}} max={${p.max}} step={${p.step}}${p.showValue ? " showValue" : ""}${p.disabled ? " disabled" : ""} />`,
};
