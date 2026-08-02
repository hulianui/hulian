"use client";
import { Activity, Users, ShoppingCart } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Stat } from "../../../../packages/ui/src/stat/stat";
export const statShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input label and value to form a KPI indicator card.",
            code: `<Stat label="Registered User" value="8,021" />`,
            render: () => <Stat label="Registered user" value="8,021" className="w-64"/>,
        },
        {
            title: "Chain trend",
            description: "delta>=0 liter (text-primary) / <0 drop (text-danger), with deltaLabel Description caliber.",
            code: `<>
  <Stat label="This month GMV" value="\u00A5128,400" delta={12.5} deltaLabel="Compared with last month" />
  <Stat label="Refund rate" value="2.3%" delta={-4.1} deltaLabel="Compared with previous month" />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <Stat label="This month GMV" value="¥128,400" delta={12.5} deltaLabel="Compared with last month" className="w-64"/>
          <Stat label="Refund Rate" value="2.3%" delta={-4.1} deltaLabel="Compared with last month" className="w-64"/>
        </div>),
        },
        {
            title: "With icon",
            description: "The icon slot is rendered in the upper right corner, faded to the muted color.",
            code: `<Stat
  label="This month GMV"
  value="\u00A5128,400"
  delta={12.5}
  deltaLabel="From last month"
  icon={<Activity className="size-4" />}
/>`,
            render: () => (<Stat label="This month GMV" value="¥128,400" delta={12.5} deltaLabel="Compared with last month" icon={<Activity className="size-4"/>} className="w-64"/>),
        },
        {
            title: "Footnote hint",
            description: "A line description that has nothing to do with the trend is rendered with hint, which is independent of delta; when both exist at the same time, the trend line is at the top and the footnote is at the bottom. Note that deltaLabel is attached to delta and will not render if delta is not passed.",
            code: `<>
  <Stat label="Number of questions in question basket" value="12" hint="Maximum 200 questions" />
  <Stat label="Reference number of people" value="38" delta={6.4} deltaLabel="More qualified" hint="2 people have not submitted their papers" />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <Stat label="Number of questions in the question basket" value="12" hint="Maximum 200 questions" className="w-64"/>
          <Stat label="Reference number" value="38" delta={6.4} deltaLabel="More advanced" hint="2 people have not submitted their papers" className="w-64"/>
        </div>),
        },
        {
            title: "Grid layout",
            description: "Multiple indicator cards can be directly assembled into a Kanban board using grid layout.",
            code: `<div className="grid grid-cols-2 gap-4">
  <Stat label="Registered User" value="8,021" delta={5.2} deltaLabel="From last month" icon={<Users className="size-4" />} />
  <Stat label="Number of orders" value="1,204" delta={-2.1} deltaLabel="Compared with previous month" icon={<ShoppingCart className="size-4" />} />
</div>`,
            render: () => (<div className="grid w-[34rem] max-w-full grid-cols-2 gap-4">
          <Stat label="Registered user" value="8,021" delta={5.2} deltaLabel="Compared with last month" icon={<Users className="size-4"/>}/>
          <Stat label="Number of orders" value="1,204" delta={-2.1} deltaLabel="Compared with last month" icon={<ShoppingCart className="size-4"/>}/>
        </div>),
        },
    ],
    controls: [{ prop: "delta", type: "number", defaultValue: 12, label: "MoM %" }],
    states: [
        {
            name: "rising",
            render: () => (<Stat label="This month GMV" value="¥128,400" delta={12.5} deltaLabel="Compared with last month" icon={<Activity className="size-4"/>} className="w-64"/>),
        },
        {
            name: "Down",
            render: () => (<Stat label="Refund Rate" value="2.3%" delta={-4.1} deltaLabel="Compared with last month" icon={<ShoppingCart className="size-4"/>} className="w-64"/>),
        },
        {
            name: "No trend",
            render: () => (<Stat label="Registered user" value="8,021" icon={<Users className="size-4"/>} className="w-64"/>),
        },
        {
            name: "Footnote only",
            render: () => (<Stat label="Number of questions in the question basket" value="12" hint="Maximum 200 questions" icon={<Users className="size-4"/>} className="w-64"/>),
        },
        {
            name: "Trend + Footnote",
            render: () => (<Stat label="Reference number" value="38" delta={6.4} deltaLabel="More advanced" hint="2 people have not submitted their papers" icon={<Activity className="size-4"/>} className="w-64"/>),
        },
    ],
    renderWithProps: (p) => (<Stat label="This month GMV" value="¥128,400" delta={Number(p.delta)} deltaLabel="Compared with last month" className="w-64"/>),
    toCode: (p) => `<Stat label="This month GMV" value="\u00A5128,400" delta={${p.delta}} deltaLabel="Compared with last month" />`,
};
