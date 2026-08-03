"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tooltip, TooltipTrigger, TooltipProvider, TooltipContent } from "../../../../packages/ui/src/tooltip/tooltip";
import { Button } from "../../../../packages/ui/src/button/button";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
function Demo({ side = "top", align = "center", text = "Hulian Tips" }: {
    side?: Side;
    align?: Align;
    text?: string;
}) {
    return (<TooltipProvider delay={0} closeDelay={0}>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline">Hover to view</Button>}/>
        <TooltipContent side={side} align={align}>
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>);
}
export const tooltipShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Display short prompts on hover/focus triggers; TooltipProvider unified management of opening delays.",
            code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">Hover to view</Button>} />
    <TooltipContent>Hulian Tips</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
            render: () => <Demo />,
        },
        {
            title: "Prompt direction",
            description: "side Controls the direction in which the prompt appears, and the arrow automatically points to the trigger.",
            code: `<>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">right</Button>} />
    <TooltipContent side="right">To the right</TooltipContent>
  </Tooltip>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">Down</Button>} />
    <TooltipContent side="bottom">Down</TooltipContent>
  </Tooltip>
</>`,
            render: () => (<div className="flex flex-wrap gap-3">
          <Demo side="right" text="Right"/>
          <Demo side="bottom" text="Down"/>
        </div>),
        },
        {
            title: "Long copy",
            description: "Long prompts are automatically wrapped to the maximum width.",
            code: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline">Hover to view</Button>} />
    <TooltipContent>Verify the maximum width and line wrapping performance of longer prompt copy</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
            render: () => <Demo text="Verify the maximum width and line wrapping performance of longer prompt copy"/>,
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "top" },
        { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
        { prop: "text", type: "text", defaultValue: "Hulian Tips", label: "Prompt copy" },
    ],
    states: [
        { name: "top", render: () => <Demo side="top"/> },
        { name: "right", render: () => <Demo side="right" text="Right"/> },
        { name: "bottom", render: () => <Demo side="bottom" text="Down"/> },
        { name: "left", render: () => <Demo side="left" text="Left"/> },
        { name: "Long copy", render: () => <Demo text="Verify the maximum width and line wrapping performance of longer prompt copy"/> },
    ],
    renderWithProps: (p) => <Demo side={p.side as Side} align={p.align as Align} text={p.text as string}/>,
    toCode: (p) => `<Tooltip>
  <TooltipTrigger render={<Button>Hover to view</Button>} />
  <TooltipContent side="${p.side}" align="${p.align}">${p.text}</TooltipContent>
</Tooltip>`,
};
