"use client";
import { useEffect, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Button } from "../../../../packages/ui/src/button/button";
import { Spin } from "../../../../packages/ui/src/spin/spin";
function SampleBox() {
    return (<div className="w-56 rounded-[var(--radius)] border border-border bg-surface p-4 text-sm text-foreground">
      <div className="font-medium">Monthly Report</div>
      <p className="mt-1 text-muted">Data is being calculated, please wait. Here is the content area covered by the mask.</p>
    </div>);
}
function FullscreenDemo() {
    const [on, setOn] = useState(false);
    useEffect(() => {
        if (on) {
            const t = setTimeout(() => setOn(false), 2000);
            return () => clearTimeout(t);
        }
    }, [on]);
    return (<>
      <Button variant="outline" onClick={() => setOn(true)}>
        Open full page mask (2s)
      </Button>
      {on && <Spin fullscreen tip="Loading..."/>}
    </>);
}
export const spinShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Package contents",
            description: "When spinning is used, the wrapped content is covered with a translucent mask + a centered indicator, making the content transparent and non-interactive.",
            code: `<Spin spinning tip="Loading...">
  <YourContent />
</Spin>`,
            render: () => (<Spin spinning tip="Loading...">
          <SampleBox />
        </Spin>),
        },
        {
            title: "Loading completed (directly out of content)",
            description: "When spinning=false, the mask is not rendered, and children is displayed normally.",
            code: `<Spin spinning={false}>
  <YourContent />
</Spin>`,
            render: () => (<Spin spinning={false}>
          <SampleBox />
        </Spin>),
        },
        {
            title: "Pure indicator",
            description: "When children is not transmitted, Spin acts as an independent loading indicator (without mask) and can have prompt copy.",
            code: `<Spin spinning tip="Processing" />`,
            render: () => <Spin spinning tip="Processing"/>,
        },
        {
            title: "Three sizes",
            description: "size is passed to the internal Spinner and controls the indicator size.",
            code: `<>
  <Spin spinning size="sm" />
  <Spin spinning size="md" />
  <Spin spinning size="lg" />
</>`,
            render: () => (<div className="flex items-center gap-8">
          <Spin spinning size="sm"/>
          <Spin spinning size="md"/>
          <Spin spinning size="lg"/>
        </div>),
        },
    ],
    controls: [
        { prop: "spinning", type: "boolean", defaultValue: true, label: "Loading" },
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "Dimensions" },
        { prop: "tip", type: "text", defaultValue: "Loading...", label: "Prompt copy" },
        { prop: "delay", type: "number", defaultValue: 0, label: "Delayed display (ms)" },
    ],
    states: [
        {
            name: "Package contents (mask)",
            render: () => (<Spin spinning tip="Loading...">
          <SampleBox />
        </Spin>),
        },
        {
            name: "Not loaded (direct content)",
            render: () => (<Spin spinning={false}>
          <SampleBox />
        </Spin>),
        },
        {
            name: "Pure indicator",
            render: () => <Spin spinning tip="Processing"/>,
        },
        {
            name: "Three sizes",
            render: () => (<div className="flex items-center gap-8">
          <Spin spinning size="sm"/>
          <Spin spinning size="md"/>
          <Spin spinning size="lg"/>
        </div>),
        },
        {
            name: "Full page mask",
            render: () => <FullscreenDemo />,
        },
    ],
    renderWithProps: (p) => (<Spin spinning={p.spinning as boolean} size={p.size as "sm" | "md" | "lg"} tip={p.tip as string} delay={p.delay as number}>
      <SampleBox />
    </Spin>),
    toCode: (p) => `<Spin spinning={${p.spinning}} size="${p.size}" tip="${p.tip}" delay={${p.delay}}>
  {children}
</Spin>`,
};
