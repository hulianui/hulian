"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "../../../../packages/ui/src/popover/popover";
import { Button } from "../../../../packages/ui/src/button/button";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
function Demo({ side = "bottom", align = "center", title = "Hulian elastic layer", withClose = true, }: {
    side?: Side;
    align?: Align;
    title?: string;
    withClose?: boolean;
}) {
    return (<Popover>
      <PopoverTrigger render={<Button>Open the elastic layer</Button>}/>
      <PopoverContent side={side} align={align} title={title} description="Click External or Esc to close.">
        <div className="flex justify-end gap-2">
          {withClose && <PopoverClose render={<Button variant="ghost">Cancel</Button>}/>}
          <PopoverClose render={<Button>OK</Button>}/>
        </div>
      </PopoverContent>
    </Popover>);
}
export const popoverShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click the trigger to pop up the floating layer, click outside or Esc to close; with title + description + operation area.",
            code: `<Popover>
  <PopoverTrigger render={<Button>Open elastic layer</Button>} />
  <PopoverContent title="Hulian elastic layer" description="Click outside or Esc to close. ">
    <div className="flex justify-end gap-2">
      <PopoverClose render={<Button variant="ghost">Cancel</Button>} />
      <PopoverClose render={<Button>OK</Button>} />
    </div>
  </PopoverContent>
</Popover>`,
            render: () => <Demo />,
        },
        {
            title: "Pop-up direction",
            description: "side controls the orientation relative to the trigger (top / right / bottom / left), and the arrow automatically points to the trigger.",
            code: `<>
  <Popover>
    <PopoverTrigger render={<Button>Bounce up</Button>} />
    <PopoverContent side="top" title="Bounce up" description="side=\\"top\\". " />
  </Popover>
  <Popover>
    <PopoverTrigger render={<Button>Bounce right</Button>} />
    <PopoverContent side="right" title="Bounce right" description="side=\\"right\\". " />
  </Popover>
</>`,
            render: () => (<div className="flex flex-wrap gap-3">
          <Demo side="top" title="Bounce up"/>
          <Demo side="right" title="Bounce right"/>
        </div>),
        },
        {
            title: "Alignment",
            description: "align controls edge alignment (start / center / end), and works with side to fine-tune the floating layer placement point.",
            code: `<Popover>
  <PopoverTrigger render={<Button>Align bottom left</Button>} />
  <PopoverContent side="bottom" align="start" title="Left justified" description="align=\\"start\\". " />
</Popover>`,
            render: () => <Demo side="bottom" align="start" title="Align left"/>,
        },
    ],
    controls: [
        { prop: "side", type: "select", options: ["top", "right", "bottom", "left"], defaultValue: "bottom" },
        { prop: "align", type: "select", options: ["start", "center", "end"], defaultValue: "center" },
        { prop: "title", type: "text", defaultValue: "Hulian elastic layer", label: "Title" },
        { prop: "withClose", type: "boolean", defaultValue: true, label: "Contains cancel button" },
    ],
    states: [
        { name: "default", render: () => <Demo /> },
        { name: "Contains interaction", render: () => <Demo withClose title="Confirm operation"/> },
        { name: "top", render: () => <Demo side="top" title="Bounce up"/> },
        { name: "right", render: () => <Demo side="right" title="Bounce right"/> },
    ],
    renderWithProps: (p) => (<Demo side={p.side as Side} align={p.align as Align} title={p.title as string} withClose={p.withClose as boolean}/>),
    toCode: (p) => `<Popover>
  <PopoverTrigger render={<Button>Open elastic layer</Button>} />
  <PopoverContent side="${p.side}" align="${p.align}" title="${p.title}">
    {/* Content + <PopoverClose/> */}
  </PopoverContent>
</Popover>`,
};
