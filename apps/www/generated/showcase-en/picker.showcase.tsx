"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Picker } from "../../../../packages/ui/src/picker/picker";
import type { PickerColumn } from "../../../../packages/ui/src/picker/picker.types";
const hours: PickerColumn = {
    options: Array.from({ length: 24 }, (_, i) => ({ value: String(i), label: String(i).padStart(2, "0") })),
};
const minutes: PickerColumn = {
    options: Array.from({ length: 60 }, (_, i) => ({ value: String(i), label: String(i).padStart(2, "0") })),
};
function Demo() {
    const [val, setVal] = useState(["9", "30"]);
    return (<div className="flex w-full max-w-xs flex-col gap-2">
      <Picker columns={[hours, minutes]} value={val} onChange={setVal}/>
      <p className="text-center text-sm text-muted">
        Selected {val[0].padStart(2, "0")}:{val[1].padStart(2, "0")}
      </p>
    </div>);
}
const fruits: PickerColumn = {
    options: [
        { value: "apple", label: "Apple" },
        { value: "banana", label: "Banana" },
        { value: "orange", label: "Orange" },
        { value: "grape", label: "Grapes" },
        { value: "melon", label: "Watermelon" },
    ],
};
export const pickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Single column selection",
            description: "Single row roller, uncontrolled use defaultValue to set the initial item.",
            code: `<Picker columns={[fruits]} defaultValue={["orange"]} />`,
            render: () => (<div className="w-40">
          <Picker columns={[fruits]} defaultValue={["orange"]}/>
        </div>),
        },
        {
            title: "Multi-column linkage",
            description: "columns passes multiple columns, that is, multiple scroll wheels (such as hours:minutes), and value is an array of selected values \u200B\u200Bfor each column.",
            code: `<Picker columns={[hours, minutes]} defaultValue={["9", "30"]} />`,
            render: () => (<div className="w-56">
          <Picker columns={[hours, minutes]} defaultValue={["9", "30"]}/>
        </div>),
        },
        {
            title: "Number of visible lines",
            description: "visibleCount controls the window height (an odd number is recommended), and itemHeight controls the row height.",
            code: `<Picker columns={[fruits]} visibleCount={3} itemHeight={36} />`,
            render: () => (<div className="w-40">
          <Picker columns={[fruits]} visibleCount={3} itemHeight={36} defaultValue={["banana"]}/>
        </div>),
        },
    ],
    controls: [],
    states: [{ name: "Time wheel (hour:minute)", render: () => <Demo /> }],
    renderWithProps: () => <Demo />,
    toCode: () => `<Picker
  columns={[hours, minutes]}
  value={val}
  onChange={setVal}
/>`,
};
