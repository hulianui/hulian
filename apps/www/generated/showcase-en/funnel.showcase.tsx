"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Funnel } from "../../../../packages/ui/src/funnel/funnel";
import type { FunnelStage } from "../../../../packages/ui/src/funnel/funnel.types";
const taskStages: FunnelStage[] = [
    { id: "in", label: "Influx", value: 1240, tone: "brand" },
    { id: "route", label: "Routing", value: 1080, tone: "brand" },
    { id: "exec", label: "Execute", value: 860, tone: "warning" },
    { id: "done", label: "Complete", value: 720, tone: "success" },
];
const conversionStages: FunnelStage[] = [
    { id: "visit", label: "Visit", value: 8600, tone: "brand" },
    { id: "signup", label: "Register", value: 4200, tone: "brand" },
    { id: "trial", label: "Trial", value: 1900, tone: "warning" },
    { id: "pay", label: "Paid", value: 640, tone: "success" },
];
function VerticalDemo({ showConversion = true }: {
    showConversion?: boolean;
}) {
    return (<div className="w-full max-w-md">
      <Funnel stages={taskStages} orientation="vertical" showConversion={showConversion} ariaLabel="Funnel chart" conversionLabel="Conversion"/>
    </div>);
}
function HorizontalDemo() {
    return (<div className="w-full max-w-lg">
      <Funnel stages={conversionStages} orientation="horizontal" ariaLabel="Funnel chart" conversionLabel="Conversion"/>
    </div>);
}
export const funnelShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (vertical)",
            description: "One line per level, the center bar scales the width according to the value ratio, and the conversion rate logo is displayed by default between levels. per-stage tone Eat token.",
            code: `<Funnel
  stages={[
    { id: "in", label: "Influx", value: 1240, tone: "brand" },
    { id: "route", label: "Routing", value: 1080, tone: "brand" },
    { id: "exec", label: "Execute", value: 860, tone: "warning" },
    { id: "done", label: "Complete", value: 720, tone: "success" },
  ]}
  ariaLabel="Funnel chart"
  conversionLabel="Conversion"
/>`,
            render: () => <VerticalDemo />,
        },
        {
            title: "Horizontal (horizontal)",
            description: "One stage per column, scaling the height according to value, suitable for conversion funnels.",
            code: `<Funnel
  stages={[
    { id: "visit", label: "Access", value: 8600, tone: "brand" },
    { id: "signup", label: "Registration", value: 4200, tone: "brand" },
    { id: "trial", label: "Trial", value: 1900, tone: "warning" },
    { id: "pay", label: "Payment", value: 640, tone: "success" },
  ]}
  orientation="horizontal"
  ariaLabel="Funnel chart"
  conversionLabel="Conversion"
/>`,
            render: () => <HorizontalDemo />,
        },
        {
            title: "Hide conversion rate logo",
            description: "showConversion={false} Turn off the inter-stage conversion rate and only look at the volume.",
            code: `<Funnel
  stages={stages}
  showConversion={false}
  ariaLabel="Funnel chart"
  conversionLabel="Conversion"
/>`,
            render: () => <VerticalDemo showConversion={false}/>,
        },
        {
            title: "Click to drill down",
            description: "After passing onStageClick, the bar changes to a button. Click on the takeback stage to drill down.",
            code: `<Funnel
  stages={stages}
  ariaLabel="Funnel chart"
  conversionLabel="Conversion"
  onStageClick={(s) => console.log(s.id)}
/>`,
            render: () => (<div className="w-full max-w-md">
          <Funnel stages={taskStages} ariaLabel="Funnel chart" conversionLabel="Conversion" onStageClick={() => { }}/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "orientation",
            type: "select",
            options: ["vertical", "horizontal"],
            defaultValue: "vertical",
            label: "Direction",
        },
        { prop: "showConversion", type: "boolean", defaultValue: true, label: "Inter-level conversion rate" },
    ],
    states: [
        {
            name: "Task Funnel (vertical \u00B7 Influx \u2192 Route \u2192 Execute \u2192 Complete)",
            render: () => <VerticalDemo />,
        },
        {
            name: "Conversion Funnel (horizontal \u00B7 Visit \u2192 Register \u2192 Trial \u2192 Pay)",
            render: () => <HorizontalDemo />,
        },
        {
            name: "Hide conversion rate logo",
            render: () => <VerticalDemo showConversion={false}/>,
        },
    ],
    renderWithProps: (p) => {
        const orientation = (p.orientation as "vertical" | "horizontal") ?? "vertical";
        const stages = orientation === "horizontal" ? conversionStages : taskStages;
        return (<div className="w-full max-w-lg">
        <Funnel stages={stages} orientation={orientation} showConversion={p.showConversion as boolean} ariaLabel="Funnel chart" conversionLabel="Conversion"/>
      </div>);
    },
    toCode: (p) => `<Funnel
  stages={[
    { id: "in", label: "Influx", value: 1240, tone: "brand" },
    { id: "route", label: "Routing", value: 1080, tone: "brand" },
    { id: "exec", label: "Execute", value: 860, tone: "warning" },
    { id: "done", label: "Complete", value: 720, tone: "success" },
  ]}
  orientation="${(p.orientation as string) ?? "vertical"}"
  showConversion={${p.showConversion ?? true}}
  ariaLabel="Funnel chart"
  conversionLabel="Conversion"
  onStageClick={(s) => console.log(s.id)}
/>`,
};
