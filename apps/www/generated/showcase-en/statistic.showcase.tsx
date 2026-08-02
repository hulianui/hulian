"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Statistic } from "../../../../packages/ui/src/statistic/statistic";
function CountdownDemo() {
    const [deadline] = useState(() => Date.now() + 1000 * 60 * 60 + 1000 * 25);
    return <Statistic.Countdown title="The event ends" deadline={deadline}/>;
}
function CountdownDayDemo() {
    const [deadline] = useState(() => Date.now() + 1000 * 60 * 60 * 50);
    return <Statistic.Countdown title="Since going online" deadline={deadline} format="D days HH:mm:ss"/>;
}
export const statisticShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "number is formatted in thousandths, and string is output as is.",
            code: `<Statistic title="Active User" value={112893} />`,
            render: () => <Statistic title="Active User" value={112893}/>,
        },
        {
            title: "Precision and suffix",
            description: "precision controls the decimal place, and prefix/suffix connects to the currency symbol or unit.",
            code: `<>
  <Statistic title="Account Balance" value={89234.56} precision={2} prefix="\uFFE5" />
  <Statistic title="Conversion rate" value={68.4} precision={1} suffix="%" />
</>`,
            render: () => (<div className="flex flex-wrap gap-10">
          <Statistic title="Account balance" value={89234.56} precision={2} prefix="￥"/>
          <Statistic title="Conversion rate" value={68.4} precision={1} suffix="%"/>
        </div>),
        },
        {
            title: "Admission rolling",
            description: "animate connects to NumberTicker to do numerical rolling entry (only valid for number).",
            code: `<Statistic title="Total Order" value={45219} animate />`,
            render: () => <Statistic title="Total Order" value={45219} animate/>,
        },
        {
            title: "Custom color",
            description: "valueStyle covers the numerical row style and can express rising and falling colors.",
            code: `<Statistic
  title="Compared with yesterday"
  value={11.28}
  precision={2}
  prefix="\u2191"
  suffix="%"
  valueStyle={{ color: "var(--color-success)" }}
/>`,
            render: () => (<Statistic title="Compared with yesterday" value={11.28} precision={2} prefix="↑" suffix="%" valueStyle={{ color: "var(--color-success)" }}/>),
        },
        {
            title: "Countdown",
            description: "Statistic.Countdown Press deadline for real-time countdown, format control template (supports D/H/m/s/S).",
            code: `<Statistic.Countdown title="The event ends" deadline={Date.now() + 1000 * 60 * 60} />`,
            render: () => <CountdownDemo />,
        },
    ],
    controls: [
        { prop: "value", type: "number", defaultValue: 112893, label: "Value" },
        { prop: "precision", type: "number", defaultValue: 0, label: "Decimal places" },
        { prop: "prefix", type: "text", defaultValue: "\uFFE5", label: "Prefix" },
        { prop: "suffix", type: "text", defaultValue: "", label: "Suffix" },
        { prop: "animate", type: "boolean", defaultValue: false, label: "Admission rolling" },
    ],
    states: [
        { name: "Basics", render: () => <Statistic title="Active User" value={112893}/> },
        {
            name: "Decimal + suffix",
            render: () => <Statistic title="Account balance" value={89234.56} precision={2} prefix="￥"/>,
        },
        {
            name: "Percent suffix",
            render: () => <Statistic title="Conversion rate" value={68.4} precision={1} suffix="%"/>,
        },
        {
            name: "Admission rolling",
            render: () => <Statistic title="Total Order" value={45219} animate/>,
        },
        {
            name: "Custom color",
            render: () => (<Statistic title="Compared with yesterday" value={11.28} precision={2} prefix="↑" suffix="%" valueStyle={{ color: "var(--color-success)" }}/>),
        },
        { name: "Countdown", render: () => <CountdownDemo /> },
        { name: "Countdown (including days)", render: () => <CountdownDayDemo /> },
    ],
    renderWithProps: (p) => (<Statistic value={Number(p.value)} precision={Number(p.precision)} prefix={(p.prefix as string) || undefined} suffix={(p.suffix as string) || undefined} animate={Boolean(p.animate)}/>),
    toCode: (p) => `<Statistic value={${p.value}} precision={${p.precision}}${p.prefix ? ` prefix="${p.prefix}"` : ""}${p.suffix ? ` suffix="${p.suffix}"` : ""}${p.animate ? " animate" : ""} />`,
};
