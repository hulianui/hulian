"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Progress } from "./progress";

export const progressShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 value（默认 max=100）即按百分比填充进度条。",
      code: `<Progress value={40} className="w-64" />`,
      render: () => <Progress value={40} className="w-64" />,
    },
    {
      title: "显示百分比",
      description: "showValue 在进度条右侧显示百分比标签。",
      code: `<Progress value={60} showValue className="w-64" />`,
      render: () => <Progress value={60} showValue className="w-64" />,
    },
    {
      title: "色调",
      description: "tone 切换 primary / success / warning / danger 四种语义色。",
      code: `<>
  <Progress value={40} tone="primary" showValue className="w-64" />
  <Progress value={70} tone="success" showValue className="w-64" />
  <Progress value={85} tone="warning" showValue className="w-64" />
  <Progress value={95} tone="danger" showValue className="w-64" />
</>`,
      render: () => (
        <div className="flex flex-col gap-3">
          <Progress value={40} tone="primary" showValue className="w-64" />
          <Progress value={70} tone="success" showValue className="w-64" />
          <Progress value={85} tone="warning" showValue className="w-64" />
          <Progress value={95} tone="danger" showValue className="w-64" />
        </div>
      ),
    },
    {
      title: "环形进度",
      description: "variant=\"circular\" 渲染圆环，showValue 居中显示百分比。",
      code: `<Progress variant="circular" value={75} showValue />`,
      render: () => <Progress variant="circular" value={75} showValue />,
    },
    {
      title: "不定态",
      description: "省略 value（undefined）进入加载中不定态，线性与环形均循环动画。",
      code: `<>
  <Progress className="w-64" />
  <Progress variant="circular" />
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <Progress className="w-64" />
          <Progress variant="circular" />
        </div>
      ),
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
      label: "形态",
    },
    {
      prop: "tone",
      type: "select",
      options: ["primary", "success", "warning", "danger"],
      defaultValue: "primary",
      label: "色调",
    },
    { prop: "showValue", type: "boolean", defaultValue: false, label: "显示数值" },
    { prop: "indeterminate", type: "boolean", defaultValue: false, label: "不定态" },
  ],
  states: [
    { name: "linear 25%", render: () => <Progress value={25} className="w-64" /> },
    { name: "linear 60% + 数值", render: () => <Progress value={60} showValue className="w-64" /> },
    { name: "linear 100%", render: () => <Progress value={100} className="w-64" /> },
    {
      name: "linear success 100%",
      render: () => <Progress value={100} tone="success" showValue className="w-64" />,
    },
    {
      name: "linear warning 70%",
      render: () => <Progress value={70} tone="warning" showValue className="w-64" />,
    },
    {
      name: "linear danger 90%",
      render: () => <Progress value={90} tone="danger" showValue className="w-64" />,
    },
    { name: "linear 不定态", render: () => <Progress className="w-64" /> },
    { name: "circular 75% + 数值", render: () => <Progress variant="circular" value={75} showValue /> },
    {
      name: "circular danger 40%",
      render: () => <Progress variant="circular" value={40} tone="danger" showValue />,
    },
    { name: "circular 不定态", render: () => <Progress variant="circular" /> },
  ],
  renderWithProps: (p) => {
    const indeterminate = p.indeterminate as boolean;
    return (
      <Progress
        value={indeterminate ? undefined : (p.value as number)}
        max={p.max as number}
        variant={p.variant as "linear" | "circular"}
        tone={p.tone as "primary" | "danger" | "success" | "warning"}
        showValue={p.showValue as boolean}
        className={p.variant === "circular" ? undefined : "w-64"}
      />
    );
  },
  toCode: (p) => {
    const indeterminate = p.indeterminate as boolean;
    const valueAttr = indeterminate ? "" : ` value={${p.value}}`;
    const variantAttr = p.variant === "circular" ? ` variant="circular"` : "";
    const toneAttr = p.tone && p.tone !== "primary" ? ` tone="${p.tone}"` : "";
    return `<Progress${variantAttr}${valueAttr}${toneAttr}${p.showValue ? " showValue" : ""} />`;
  },
};
