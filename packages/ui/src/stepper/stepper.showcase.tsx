"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Stepper } from "./stepper";

const steps = [{ label: "下单" }, { label: "付款" }, { label: "发货" }, { label: "完成" }];

export const stepperShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 steps 数组与受控 activeStep（0-based），当前步及之前自动点亮。",
      code: `const steps = [
  { label: "下单" },
  { label: "付款" },
  { label: "发货" },
  { label: "完成" },
];

<Stepper steps={steps} activeStep={1} />`,
      render: () => <Stepper steps={steps} activeStep={1} />,
    },
    {
      title: "首步",
      description: "activeStep=0 时仅第一步处于激活态，其余皆为未达成态。",
      code: `<Stepper steps={steps} activeStep={0} />`,
      render: () => <Stepper steps={steps} activeStep={0} />,
    },
    {
      title: "已全部完成",
      description: "activeStep 等于步数时所有步骤皆为完成态（对勾 + 主色连线）。",
      code: `<Stepper steps={steps} activeStep={4} />`,
      render: () => <Stepper steps={steps} activeStep={4} />,
    },
  ],
  controls: [{ prop: "activeStep", type: "number", defaultValue: 1, label: "当前步" }],
  states: [
    { name: "第二步", render: () => <Stepper steps={steps} activeStep={1} /> },
    { name: "首步", render: () => <Stepper steps={steps} activeStep={0} /> },
    { name: "已完成", render: () => <Stepper steps={steps} activeStep={4} /> },
  ],
  renderWithProps: (p) => <Stepper steps={steps} activeStep={Number(p.activeStep)} />,
  toCode: (p) => `<Stepper steps={steps} activeStep={${p.activeStep}} />`,
};
