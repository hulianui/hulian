"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button";
import { Tour } from "../../../../packages/ui/src/tour/tour";
import type { TourStep } from "../../../../packages/ui/src/tour/tour.types";
function Demo({ maskClosable = false }: {
    maskClosable?: boolean;
}) {
    const searchRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLButtonElement>(null);
    const newRef = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(0);
    const steps: TourStep[] = [
        {
            title: "Welcome to Hulian",
            description: "Take you through the three core functions of this workbench in 30 seconds.",
        },
        {
            target: () => searchRef.current,
            title: "Global search",
            description: "Quickly locate any resource by keyword here, supporting pinyin and initial letters.",
            placement: "bottom",
        },
        {
            target: () => filterRef.current,
            title: "Condition filter",
            description: "Combine multiple dimensions to accurately filter the current list, and the filter bar will be remembered.",
            placement: "bottom",
        },
        {
            target: () => newRef.current,
            title: "Create a new one",
            description: "Create a new record from here at any time, and the shortcut key N can also be triggered.",
            placement: "left",
        },
    ];
    const start = () => {
        setCurrent(0);
        setOpen(true);
    };
    return (<div className="w-full max-w-xl rounded-[var(--radius)] border border-border bg-surface p-4">

      <div className="flex items-center gap-3">
        <div ref={searchRef} className="flex h-9 flex-1 items-center rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-muted">
          Search resources...
        </div>
        <button ref={filterRef} type="button" className="h-9 rounded-[var(--radius)] border border-border bg-bg px-3 text-sm text-foreground">
          Filter
        </button>
        <button ref={newRef} type="button" className="h-9 rounded-[var(--radius)] bg-primary px-3 text-sm text-primary-foreground">
          New
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted">Click the button below to start the novice guide.</p>
        <Button size="sm" onClick={start}>
          Start booting
        </Button>
      </div>

      <Tour steps={steps} open={open} current={current} onChange={setCurrent} onClose={() => setOpen(false)} maskClosable={maskClosable}/>
    </div>);
}
export const tourShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic boot",
            description: "Controlled open + current; steps uses the target function to return the ref element, step by step highlighting (including the centered opening step without target). Click \"Start Boot\" to try.",
            code: `const searchRef = useRef<HTMLDivElement>(null);
const [open, setOpen] = useState(false);
const [current, setCurrent] = useState(0);

const steps = [
  { title: "Welcome to Hulian", description: "Take you to know the three core functions in 30 seconds." },
  {
    target: () => searchRef.current,
    title: "Global Search",
    description: "Quickly locate any resource by keyword.",
    placement: "bottom",
  },
];

<>
  <div ref={searchRef}>Search for resources...</div>
  <Button onClick={() => { setCurrent(0); setOpen(true); }}>Start boot</Button>
  <Tour
    steps={steps}
    open={open}
    current={current}
    onChange={setCurrent}
    onClose={() => setOpen(false)}
  />
</>`,
            render: () => <Demo />,
        },
        {
            title: "Point mask off",
            description: "maskClosable allows you to click on the dark mask area to directly end the boot (default false, to prevent accidental touch).",
            code: `<Tour
  steps={steps}
  open={open}
  current={current}
  onChange={setCurrent}
  onClose={() => setOpen(false)}
  maskClosable
/>`,
            render: () => <Demo maskClosable/>,
        },
    ],
    controls: [
        { prop: "maskClosable", type: "boolean", defaultValue: false, label: "Point mask off" },
    ],
    states: [
        { name: "Basic guidance (4 steps \u00B7 including centered opening)", render: () => <Demo /> },
        { name: "Point mask can be turned off", render: () => <Demo maskClosable/> },
    ],
    renderWithProps: (p) => <Demo maskClosable={Boolean(p.maskClosable)}/>,
    toCode: (p) => `const [open, setOpen] = useState(false);
const [current, setCurrent] = useState(0);

<Tour
  open={open}
  current={current}
  onChange={setCurrent}
  onClose={() => setOpen(false)}${p.maskClosable ? "\n  maskClosable" : ""}
  steps={[
    { title: "Welcome", description: "Opening centered..." },
    { target: () => searchRef.current, title: "Global Search", description: "...", placement: "bottom" },
    { target: "#new-btn", title: "Create a new one", description: "...", placement: "left" },
  ]}
/>`,
};
