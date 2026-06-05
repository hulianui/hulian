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

export const pickerShowcase: ShowcaseSpec = {
  controls: [],
  states: [{ name: "时间滚轮（时:分）", render: () => <Demo /> }],
  renderWithProps: () => <Demo />,
  toCode: () =>
    `<Picker\n  columns={[hours, minutes]}\n  value={val}\n  onChange={setVal}\n/>`,
};
