"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { TimePicker } from "./time-picker";

function Demo({
  withSeconds,
  minuteStep = 1,
  clearable = true,
  showNow = true,
  disabled,
  readOnly,
  initial = null,
}: {
  withSeconds?: boolean;
  minuteStep?: number;
  clearable?: boolean;
  showNow?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  initial?: string | null;
}) {
  const [v, setV] = useState<string | null>(initial);
  return (
    <TimePicker
      value={v}
      onValueChange={setV}
      withSeconds={withSeconds}
      minuteStep={minuteStep}
      clearable={clearable}
      showNow={showNow}
      disabled={disabled}
      readOnly={readOnly}
      aria-label="选择时间"
    />
  );
}

export const timePickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点触发器弹出时/分两列，值是定宽 24 小时制文本 HH:mm。",
      code: `<TimePicker defaultValue="09:30" />`,
      render: () => <TimePicker defaultValue="09:30" aria-label="选择时间" />,
    },
    {
      title: "带秒",
      description: "withSeconds 加出秒列，值形状随之变成 HH:mm:ss。",
      code: `<TimePicker withSeconds defaultValue="09:30:15" />`,
      render: () => <TimePicker withSeconds defaultValue="09:30:15" aria-label="选择时间" />,
    },
    {
      title: "步进",
      description: "minuteStep 只列出整步的分钟，排班/预约这类场景不必让用户从 60 个里挑。",
      code: `<TimePicker minuteStep={15} defaultValue="09:30" />`,
      render: () => <TimePicker minuteStep={15} defaultValue="09:30" aria-label="选择时间" />,
    },
    {
      title: "限定范围",
      description:
        "minTime / maxTime 逐列灰掉不可达的值。判据是「整段与范围有无交集」——min=09:30 时 9 点仍可选，只是 9 点内 30 分前的分钟被禁。",
      code: `<TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" />`,
      render: () => (
        <TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" aria-label="选择时间" />
      ),
    },
    {
      title: "禁用 / 只读",
      description: "disabled 整体置灰且打不开；readOnly 面板可看但选不动。",
      code: `<TimePicker defaultValue="09:30" disabled />
<TimePicker defaultValue="09:30" readOnly />`,
      render: () => (
        <div className="flex flex-wrap gap-3">
          <TimePicker defaultValue="09:30" disabled aria-label="禁用" />
          <TimePicker defaultValue="09:30" readOnly aria-label="只读" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "withSeconds", type: "boolean", defaultValue: false, label: "带秒" },
    { prop: "minuteStep", type: "select", options: ["1", "5", "15", "30"], defaultValue: "1", label: "分钟步进" },
    { prop: "clearable", type: "boolean", defaultValue: true, label: "可清除" },
    { prop: "showNow", type: "boolean", defaultValue: true, label: "此刻快捷" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "default", render: () => <Demo /> },
    { name: "带默认值", render: () => <Demo initial="09:30" /> },
    { name: "带秒", render: () => <Demo withSeconds initial="09:30:15" /> },
    { name: "15 分步进", render: () => <Demo minuteStep={15} initial="09:30" /> },
    {
      name: "限定范围",
      render: () => (
        <TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" aria-label="选择时间" />
      ),
    },
    { name: "禁用", render: () => <Demo disabled initial="09:30" /> },
  ],
  renderWithProps: (p) => (
    <Demo
      withSeconds={p.withSeconds === true}
      minuteStep={Number(p.minuteStep ?? 1) || 1}
      clearable={p.clearable !== false}
      showNow={p.showNow !== false}
      disabled={p.disabled === true}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) =>
    `<TimePicker\n  value={time}\n  onValueChange={setTime}${p.withSeconds ? "\n  withSeconds" : ""}${
      p.minuteStep && Number(p.minuteStep) !== 1 ? `\n  minuteStep={${p.minuteStep}}` : ""
    }${p.clearable === false ? "\n  clearable={false}" : ""}${p.showNow === false ? "\n  showNow={false}" : ""}${
      p.disabled ? "\n  disabled" : ""
    }${p.readOnly ? "\n  readOnly" : ""}\n/>`,
};
