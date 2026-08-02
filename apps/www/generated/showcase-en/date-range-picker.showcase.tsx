"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DateRangePicker } from "../../../../packages/ui/src/date-range-picker/date-range-picker";
import type { DateRangeValue } from "../../../../packages/ui/src/date-range-picker/date-range-picker.types";
function Demo({ presets = true, disabled, readOnly, initial = null, }: {
    presets?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    initial?: DateRangeValue | null;
}) {
    const [v, setV] = useState<DateRangeValue | null>(initial);
    return (<DateRangePicker value={v} onValueChange={setV} presets={presets} disabled={disabled} readOnly={readOnly}/>);
}
export const dateRangePickerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click the trigger to pop up the bi-monthly calendar, select the starting and ending ends in order to determine the range.",
            code: `<DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]} />`,
            render: () => <DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]}/>,
        },
        {
            title: "Controlled",
            description: "The external controlled value is [start, end] (ISO YYYY-MM-DD), clear and return null.",
            code: `const [range, setRange] = useState<DateRangeValue | null>(["2026-06-08", "2026-06-20"]);

<DateRangePicker value={range} onValueChange={setRange} />`,
            render: () => <DateRangePicker defaultValue={["2026-06-08", "2026-06-20"]}/>,
        },
        {
            title: "No quick preset",
            description: "presets={false} Hide the \"Today/Last 7 Days...\" default column on the left.",
            code: `<DateRangePicker defaultValue={["2026-06-03", "2026-06-09"]} presets={false} />`,
            render: () => <DateRangePicker defaultValue={["2026-06-03", "2026-06-09"]} presets={false}/>,
        },
        {
            title: "Limited range + disabled weekends",
            description: "minDate / maxDate frame the optional range, and disabledDate further prohibits certain days.",
            code: `<DateRangePicker
  defaultValue={["2026-06-10", "2026-06-12"]}
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6;
  }}
/>`,
            render: () => (<DateRangePicker defaultValue={["2026-06-10", "2026-06-12"]} minDate="2026-06-01" maxDate="2026-06-30" disabledDate={(iso) => {
                    const day = new Date(iso + "T00:00:00").getDay();
                    return day === 0 || day === 6;
                }}/>),
        },
        {
            title: "Disabled",
            description: "The whole page is grayed out and the trigger cannot be opened.",
            code: `<DateRangePicker defaultValue={["2026-06-01", "2026-06-15"]} disabled />`,
            render: () => <DateRangePicker defaultValue={["2026-06-01", "2026-06-15"]} disabled/>,
        },
    ],
    controls: [
        { prop: "presets", type: "boolean", defaultValue: true, label: "Quick preset" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "Disabled" },
        { prop: "readOnly", type: "boolean", defaultValue: false, label: "Read only" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "With default range", render: () => <Demo initial={["2026-06-08", "2026-06-20"]}/> },
        {
            name: "Limited range (min/max + disabled weekends)",
            render: () => (<DateRangePicker defaultValue={["2026-06-10", "2026-06-12"]} minDate="2026-06-01" maxDate="2026-06-30" disabledDate={(iso) => {
                    const day = new Date(iso + "T00:00:00").getDay();
                    return day === 0 || day === 6;
                }}/>),
        },
        { name: "No preset", render: () => <Demo presets={false} initial={["2026-06-03", "2026-06-09"]}/> },
        { name: "Disabled", render: () => <Demo disabled initial={["2026-06-01", "2026-06-15"]}/> },
    ],
    renderWithProps: (p) => (<Demo presets={p.presets !== false} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<DateRangePicker
  value={range}
  onValueChange={setRange}${p.presets === false ? "\n  presets={false}" : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
