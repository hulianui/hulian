"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { DateRangePicker } from "../../../../packages/ui/src/date-range-picker/date-range-picker";
import type { DateRangeValue } from "../../../../packages/ui/src/date-range-picker/date-range-picker.types";
function Demo({ presets = true, size = "md", disabled, readOnly, initial = null, }: {
    presets?: boolean;
    size?: "sm" | "md" | "lg";
    disabled?: boolean;
    readOnly?: boolean;
    initial?: DateRangeValue | null;
}) {
    const [v, setV] = useState<DateRangeValue | null>(initial);
    return (<DateRangePicker value={v} onValueChange={setV} presets={presets} size={size} disabled={disabled} readOnly={readOnly}/>);
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
            title: "Month range and year range",
            description: "picker sets the granularity, with the same meaning as the prop of the same name on DatePicker (the equivalent of el-date-picker monthrange). Values become [\"YYYY-MM\"] or [\"YYYY\"] and the presets switch to the common options for that granularity. The component still orders the two ends itself, so a start later than the end cannot be produced.",
            code: `<DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]} />
<DateRangePicker picker="year" defaultValue={["2024", "2026"]} />`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]}/>
          <DateRangePicker picker="year" defaultValue={["2024", "2026"]}/>
        </div>),
        },
        {
            title: "An upper bound on a month range",
            description: "maxDate always speaks in ISO dates. At month granularity a month is disabled only when all of it is out of bounds, so passing today gives you \"current month selectable, future months greyed out\" -- which is what stops an operator from picking next year's month on the right-hand panel.",
            code: `<DateRangePicker picker="month" maxDate="2026-08-14" defaultValue={["2026-05", "2026-08"]} />`,
            render: () => (<DateRangePicker picker="month" maxDate="2026-08-14" defaultValue={["2026-05", "2026-08"]}/>),
        },
        {
            title: "Size",
            description: "size uses the same scale as Input and Select (sm 32px / md 40px / lg 48px), so controls sitting on one form row line up. Date-cell geometry inside the panel does not change with it.",
            code: `<DateRangePicker size="sm" defaultValue={["2026-06-08", "2026-06-20"]} />
<DateRangePicker size="md" defaultValue={["2026-06-08", "2026-06-20"]} />
<DateRangePicker size="lg" defaultValue={["2026-06-08", "2026-06-20"]} />`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <DateRangePicker size="sm" defaultValue={["2026-06-08", "2026-06-20"]}/>
          <DateRangePicker size="md" defaultValue={["2026-06-08", "2026-06-20"]}/>
          <DateRangePicker size="lg" defaultValue={["2026-06-08", "2026-06-20"]}/>
        </div>),
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
        {
            prop: "size",
            type: "select",
            options: ["sm", "md", "lg"],
            defaultValue: "md",
            label: "Size",
        },
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
        {
            name: "Month range (picker=month)",
            render: () => <DateRangePicker picker="month" defaultValue={["2026-03", "2026-06"]}/>,
        },
        {
            name: "Year range (picker=year)",
            render: () => <DateRangePicker picker="year" defaultValue={["2024", "2026"]}/>,
        },
        { name: "Small", render: () => <Demo size="sm" initial={["2026-06-08", "2026-06-20"]}/> },
        { name: "Large size", render: () => <Demo size="lg" initial={["2026-06-08", "2026-06-20"]}/> },
        { name: "Disabled", render: () => <Demo disabled initial={["2026-06-01", "2026-06-15"]}/> },
    ],
    renderWithProps: (p) => (<Demo presets={p.presets !== false} size={(p.size as "sm" | "md" | "lg") ?? "md"} disabled={p.disabled === true} readOnly={p.readOnly === true}/>),
    toCode: (p) => `<DateRangePicker
  value={range}
  onValueChange={setRange}${p.presets === false ? "\n  presets={false}" : ""}${p.size && p.size !== "md" ? `
  size="${p.size}"` : ""}${p.disabled ? "\n  disabled" : ""}${p.readOnly ? "\n  readOnly" : ""}
/>`,
};
