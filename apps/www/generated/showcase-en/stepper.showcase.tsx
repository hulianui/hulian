"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Stepper } from "../../../../packages/ui/src/stepper/stepper";
const steps = [{ label: "Place an order" }, { label: "Payment" }, { label: "Shipping" }, { label: "Complete" }];
export const stepperShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input steps array and controlled activeStep (0-based), the current step and the previous step will be automatically lit.",
            code: `const steps = [
  { label: "Place an order" },
  { label: "Payment" },
  { label: "Shipping" },
  { label: "Complete" },
];

<Stepper steps={steps} activeStep={1} />`,
            render: () => <Stepper steps={steps} activeStep={1}/>,
        },
        {
            title: "First step",
            description: "When activeStep=0, only the first step is active, and the rest are unreached.",
            code: `<Stepper steps={steps} activeStep={0} />`,
            render: () => <Stepper steps={steps} activeStep={0}/>,
        },
        {
            title: "Completed",
            description: "activeStep When equal to the number of steps, all steps are completed (check mark + main color connection).",
            code: `<Stepper steps={steps} activeStep={4} />`,
            render: () => <Stepper steps={steps} activeStep={4}/>,
        },
    ],
    controls: [{ prop: "activeStep", type: "number", defaultValue: 1, label: "Current step" }],
    states: [
        { name: "Step 2", render: () => <Stepper steps={steps} activeStep={1}/> },
        { name: "First step", render: () => <Stepper steps={steps} activeStep={0}/> },
        { name: "Completed", render: () => <Stepper steps={steps} activeStep={4}/> },
    ],
    renderWithProps: (p) => <Stepper steps={steps} activeStep={Number(p.activeStep)}/>,
    toCode: (p) => `<Stepper steps={steps} activeStep={${p.activeStep}} />`,
};
