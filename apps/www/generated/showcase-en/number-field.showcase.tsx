"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { NumberField } from "../../../../packages/ui/src/number-field/number-field";
function Controlled(p: Record<string, unknown>) {
    const [v, setV] = useState<number | null>(2);
    return (<NumberField aria-label="Quantity" value={v} onValueChange={setV} disabled={p.disabled as boolean} min={0} max={10}/>);
}
export const numberFieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "\u00B1Button stepping, the input box can be typed directly, and the keyboard is supported \u2191\u2193.",
            code: `<NumberField aria-label="Quantity" defaultValue={3} />`,
            render: () => <NumberField aria-label="Quantity" defaultValue={3}/>,
        },
        {
            title: "Scope Limitation",
            description: "min/max constraint value, the corresponding button is automatically disabled when the boundary is reached.",
            code: `<NumberField aria-label="Quantity" defaultValue={0} min={0} max={5} />`,
            render: () => <NumberField aria-label="Quantity" defaultValue={0} min={0} max={5}/>,
        },
        {
            title: "Step size",
            description: "step Set the amount of each increase or decrease, here each step is 5.",
            code: `<NumberField aria-label="Step size 5" defaultValue={10} step={5} />`,
            render: () => <NumberField aria-label="Step size 5" defaultValue={10} step={5}/>,
        },
        {
            title: "Disabled",
            description: "disabled Locks the entire control.",
            code: `<NumberField aria-label="Quantity" defaultValue={3} disabled />`,
            render: () => <NumberField aria-label="Quantity" defaultValue={3} disabled/>,
        },
    ],
    controls: [{ prop: "disabled", type: "boolean", defaultValue: false }],
    states: [
        { name: "default", render: () => <NumberField aria-label="Quantity" defaultValue={3}/> },
        { name: "min-max(0-5)", render: () => <NumberField aria-label="Quantity" defaultValue={0} min={0} max={5}/> },
        { name: "step=5", render: () => <NumberField aria-label="Step size 5" defaultValue={10} step={5}/> },
        { name: "disabled", render: () => <NumberField aria-label="Quantity" defaultValue={3} disabled/> },
    ],
    renderWithProps: (p) => <Controlled {...p}/>,
    toCode: (p) => `<NumberField defaultValue={3}${p.disabled ? " disabled" : ""} />`,
};
