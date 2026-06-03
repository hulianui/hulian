"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Meter } from "./meter";

export const meterShowcase: ShowcaseSpec = {
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
