"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { NumberTicker } from "../../../../packages/ui/src/number-ticker/number-ticker";
export const numberTickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "After entering the viewport, scroll from 0 to the target value, automatic thousandths.",
            code: `<NumberTicker value={12345} className="text-4xl font-semibold" />`,
            render: () => <NumberTicker value={12345} className="text-4xl font-semibold"/>,
        },
        {
            title: "Decimal places",
            description: "decimalPlaces Controls the number of decimal places, suitable for percentages/amounts.",
            code: `<NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold" />`,
            render: () => <NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold"/>,
        },
        {
            title: "Count down",
            description: "When startValue is larger than value, it will naturally scroll downward without additional direction parameters.",
            code: `<NumberTicker startValue={100} value={0} className="text-4xl font-semibold" />`,
            render: () => <NumberTicker startValue={100} value={0} className="text-4xl font-semibold"/>,
        },
        {
            title: "Starting value and duration",
            description: "startValue sets the starting point of scrolling, and duration lengthens the animation rhythm.",
            code: `<NumberTicker startValue={1000} value={8888} duration={2.4} className="text-4xl font-semibold" />`,
            render: () => (<NumberTicker startValue={1000} value={8888} duration={2.4} className="text-4xl font-semibold"/>),
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 1234 },
        { prop: "startValue", type: "number", defaultValue: 0 },
        { prop: "decimalPlaces", type: "number", defaultValue: 0 },
        { prop: "duration", type: "number", defaultValue: 1.2 },
    ],
    states: [
        { name: "Whole thousandths", render: () => <NumberTicker value={12345} className="text-4xl font-semibold"/> },
        {
            name: "Percent (1 decimal place)",
            render: () => <NumberTicker value={99.9} decimalPlaces={1} className="text-4xl font-semibold"/>,
        },
        { name: "Count down", render: () => <NumberTicker startValue={100} value={0} className="text-4xl font-semibold"/> },
    ],
    renderWithProps: (p) => (<NumberTicker value={p.value as number} startValue={p.startValue as number} decimalPlaces={p.decimalPlaces as number} duration={p.duration as number} className="text-4xl font-semibold"/>),
    toCode: (p) => `<NumberTicker value={${p.value}} decimalPlaces={${p.decimalPlaces}} />`,
};
