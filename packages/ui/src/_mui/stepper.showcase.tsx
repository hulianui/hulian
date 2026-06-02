"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Stepper } from "./stepper";

const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }, { label: "完成" }];

export const stepperShowcase: ShowcaseSpec = {
  controls: [{ prop: "activeStep", type: "number", defaultValue: 1, label: "当前步" }],
  states: [
    { name: "第二步", render: () => <Stepper steps={steps} activeStep={1} /> },
    { name: "首步", render: () => <Stepper steps={steps} activeStep={0} /> },
    { name: "已完成", render: () => <Stepper steps={steps} activeStep={4} /> },
  ],
  renderWithProps: (p) => <Stepper steps={steps} activeStep={Number(p.activeStep)} />,
  toCode: (p) => `<Stepper steps={steps} activeStep={${p.activeStep}} />`,
};
