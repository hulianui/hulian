"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Popover, PopoverTrigger, PopoverClose, PopoverContent } from "../../../../packages/ui/src/popover/popover";
import { Button } from "../../../../packages/ui/src/button/button";
import { Search } from "../../../../packages/ui/src/_icons";
type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
function PlainDemo() {
    return (<Popover>
      <PopoverTrigger render={<Button variant="outline">Choose tags</Button>}/>
      <PopoverContent plain arrow={false} align="start" className="w-auto p-0">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="size-3.5 text-muted-foreground" aria-hidden/>
          <input placeholder="Search tags" aria-label="Search tags" className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"/>
        </div>
        <div className="py-1">
          {["Design", "Frontend", "Documentation"].map((t) => (<button key={t} type="button" className="block w-full px-3 py-1.5 text-left text-sm text-foreground hover:bg-muted">
              {t}
            </button>))}
        </div>
      </PopoverContent>
    </Popover>);
}
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
  <PopoverContent title="Hulian elastic layer" description="Click outside or Esc to close.">
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
    <PopoverContent side="top" title="Bounce up" description="side=\\"top\\"." />
  </Popover>
  <Popover>
    <PopoverTrigger render={<Button>Bounce right</Button>} />
    <PopoverContent side="right" title="Bounce right" description="side=\\"right\\"." />
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
  <PopoverContent side="bottom" align="start" title="Left justified" description="align=\\"start\\"." />
</Popover>`,
            render: () => <Demo side="bottom" align="start" title="Align left"/>,
        },
        {
            title: "Edge-to-edge popup: plain + arrow={false}",
            description: "Use plain when the content brings its own appearance, such as the bottom border on the search row and the padding inside the list: the inner skin div is not rendered, so children reach the edges of the popup. className=\"p-0\" clears only the popup's own padding. The arrow is a separate switch, and a flush menu usually turns both off.",
            code: `<Popover>
  <PopoverTrigger render={<Button variant="outline">Choose tags</Button>} />
  <PopoverContent plain arrow={false} align="start" className="w-auto p-0">
    <div className="flex items-center gap-2 border-b border-border px-3 py-2">
      <Search className="size-3.5 text-muted-foreground" />
      <input placeholder="Search tags" className="w-40 bg-transparent text-sm outline-none" />
    </div>
    <div className="py-1">{/* Tag list */}</div>
  </PopoverContent>
</Popover>`,
            render: () => <PlainDemo />,
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
        { name: "Edge-to-edge popup", render: () => <PlainDemo /> },
    ],
    renderWithProps: (p) => (<Demo side={p.side as Side} align={p.align as Align} title={p.title as string} withClose={p.withClose as boolean}/>),
    toCode: (p) => `<Popover>
  <PopoverTrigger render={<Button>Open elastic layer</Button>} />
  <PopoverContent side="${p.side}" align="${p.align}" title="${p.title}">
    {/* Content + <PopoverClose/> */}
  </PopoverContent>
</Popover>`,
};
