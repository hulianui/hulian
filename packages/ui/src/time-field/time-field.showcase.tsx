"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TimeField } from "./time-field";

function Demo({
  withSeconds,
  disabled,
  readOnly,
  clearable = true,
  initial = null,
}: {
  withSeconds?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  initial?: string | null;
}) {
  const [v, setV] = useState<string | null>(initial);
  return (
    <TimeField
      value={v}
      onValueChange={setV}
      withSeconds={withSeconds}
      disabled={disabled}
      readOnly={readOnly}
      clearable={clearable}
    />
  );
}

export const timeFieldShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "时/分各是一段，手不离键盘就能录：↑↓ 调值、←→ 切段、直接按数字覆写（输满两位自动跳下一段）、Backspace 清段。要点着选用 TimePicker。",
      code: `<TimeField defaultValue="09:30" />`,
      render: () => <TimeField defaultValue="09:30" />,
    },
    {
      title: "带秒",
      description: "withSeconds 加出秒段，对外值形状随之变成 HH:mm:ss。",
      code: `<TimeField withSeconds defaultValue="09:30:15" />`,
      render: () => <TimeField withSeconds defaultValue="09:30:15" />,
    },
    {
      title: "限定可选区间",
      description:
        "minTime / maxTime 在**整段输完**的那一刻钳制 —— 段级限制会让「先输 23 点再输分钟」根本没法输。",
      code: `<TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" />`,
      render: () => <TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" />,
    },
    {
      title: "禁用 / 只读",
      description: "disabled 整体置灰且不可聚焦；readOnly 改不动值但还能切段浏览。",
      code: `<TimeField defaultValue="09:30" disabled />
<TimeField defaultValue="09:30" readOnly />`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <TimeField defaultValue="09:30" disabled />
          <TimeField defaultValue="09:30" readOnly />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "withSeconds", type: "boolean", defaultValue: false, label: "显示秒" },
    { prop: "clearable", type: "boolean", defaultValue: true, label: "可清除" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "带默认值", render: () => <Demo initial="09:30" /> },
    { name: "带秒", render: () => <Demo withSeconds initial="09:30:15" /> },
    { name: "限定区间", render: () => <TimeField defaultValue="12:00" minTime="09:30" maxTime="18:00" /> },
    { name: "禁用", render: () => <Demo disabled initial="09:30" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      withSeconds={p.withSeconds === true}
      clearable={p.clearable !== false}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<TimeField\n  value={time}\n  onValueChange={setTime}${p.withSeconds ? "\n  withSeconds" : ""}${
      p.clearable === false ? "\n  clearable={false}" : ""
    }${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}\n/>`,
};
