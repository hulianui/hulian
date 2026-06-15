"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Picker } from "./picker";
import type { PickerColumn } from "./picker.types";

const hours: PickerColumn = {
  options: Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: String(i).padStart(2, "0") })),
};
const minutes: PickerColumn = {
  options: Array.from({ length: 60 }, (_, i) => ({ value: String(i), label: String(i).padStart(2, "0") })),
};

function Demo() {
  const [val, setVal] = useState(["9", "30"]);
  return (
    <div className="flex w-full max-w-xs flex-col gap-2">
      <Picker columns={[hours, minutes]} value={val} onChange={setVal} />
      <p className="text-center text-sm text-muted">
        已选 {val[0].padStart(2, "0")}:{val[1].padStart(2, "0")}
      </p>
    </div>
  );
}

const fruits: PickerColumn = {
  options: [
    { value: "apple", label: "苹果" },
    { value: "banana", label: "香蕉" },
    { value: "orange", label: "橙子" },
    { value: "grape", label: "葡萄" },
    { value: "melon", label: "西瓜" },
  ],
};

export const pickerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "单列选择",
      description: "单列滚轮，非受控用 defaultValue 设初始项。",
      code: `<Picker columns={[fruits]} defaultValue={["orange"]} />`,
      render: () => (
        <div className="w-40">
          <Picker columns={[fruits]} defaultValue={["orange"]} />
        </div>
      ),
    },
    {
      title: "多列联动",
      description: "columns 传多列即多滚轮（如时:分），value 为各列选中值数组。",
      code: `<Picker columns={[hours, minutes]} defaultValue={["9", "30"]} />`,
      render: () => (
        <div className="w-56">
          <Picker columns={[hours, minutes]} defaultValue={["9", "30"]} />
        </div>
      ),
    },
    {
      title: "可见行数",
      description: "visibleCount 控制窗口高度（建议奇数），itemHeight 控制行高。",
      code: `<Picker columns={[fruits]} visibleCount={3} itemHeight={36} />`,
      render: () => (
        <div className="w-40">
          <Picker columns={[fruits]} visibleCount={3} itemHeight={36} defaultValue={["banana"]} />
        </div>
      ),
    },
  ],
  controls: [],
  states: [{ name: "时间滚轮（时:分）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Picker\n  columns={[hours, minutes]}\n  value={val}\n  onChange={setVal}\n/>`,
};
