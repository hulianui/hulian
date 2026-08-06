"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Meter } from "./meter";

export const meterShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "传入 value 即渲染度量条（默认 0–100），role=meter 表达静态量占比。",
      code: `<Meter value={64} />`,
      render: () => (
        <div className="w-64">
          <Meter value={64} />
        </div>
      ),
    },
    {
      title: "标签与数值",
      description: "label 与 showValue 在轨道上方显示说明与格式化数值。",
      code: `<Meter value={72} label="磁盘用量" showValue />`,
      render: () => (
        <div className="w-64">
          <Meter value={72} label="磁盘用量" showValue />
        </div>
      ),
    },
    {
      title: "自定义量程",
      description: "min/max 自定上下限，数值按区间换算占比。",
      code: `<Meter value={3.6} min={0} max={5} label="评分" showValue />`,
      render: () => (
        <div className="w-64">
          <Meter value={3.6} min={0} max={5} label="评分" showValue />
        </div>
      ),
    },
    {
      title: "绝对数表述",
      description:
        "formatValue 接管数值文案，可见文字与读屏念到的 aria-valuetext 是同一句，不会各说各的。",
      code: `<Meter
  value={1041}
  max={1324}
  label="已挂教材章节"
  showValue
  formatValue={({ value, max }) => \`\${value} / \${max} 道题\`}
/>`,
      render: () => (
        <div className="w-64">
          <Meter
            value={1041}
            max={1324}
            label="已挂教材章节"
            showValue
            formatValue={({ value, max }) => `${value} / ${max} 道题`}
          />
        </div>
      ),
    },
    {
      title: "不同占比",
      description: "占比由 value 决定，宽度由 Base UI 内部自算。",
      code: `<>
  <Meter value={18} label="电量" showValue />
  <Meter value={100} label="完成度" showValue />
</>`,
      render: () => (
        <div className="flex w-64 flex-col gap-4">
          <Meter value={18} label="电量" showValue />
          <Meter value={100} label="完成度" showValue />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "value", type: "number", defaultValue: 64 },
    { prop: "showValue", type: "boolean", defaultValue: true },
  ],
  states: [
    { name: "default", render: () => <div className="w-64"><Meter value={64} /></div> },
    { name: "with-label", render: () => <div className="w-64"><Meter value={72} label="磁盘用量" showValue /></div> },
    { name: "low", render: () => <div className="w-64"><Meter value={18} label="电量" showValue /></div> },
    { name: "full", render: () => <div className="w-64"><Meter value={100} label="完成度" showValue /></div> },
  ],
  renderWithProps: (p) => (
    <div className="w-64">
      <Meter value={(p.value as number) ?? 64} label="用量" showValue={p.showValue as boolean} />
    </div>
  ),
  toCode: (p) => `<Meter value={${(p.value as number) ?? 64}} label="用量"${p.showValue ? " showValue" : ""} />`,
};
