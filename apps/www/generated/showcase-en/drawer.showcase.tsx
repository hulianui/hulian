"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent } from "../../../../packages/ui/src/drawer/drawer";
import type { DrawerSide } from "../../../../packages/ui/src/drawer/drawer.types";
import { Button } from "../../../../packages/ui/src/button/button";
function Demo({ side }: {
    side: DrawerSide;
}) {
    return (<Drawer>
      <DrawerTrigger render={<Button variant="outline">{`Open ${side} Drawer`}</Button>}/>
      <DrawerContent side={side} title="Settings panel" description="Esc / Point mask / Close button can be retracted; focus is locked in the drawer." footer={<>
            <DrawerClose render={<Button variant="outline">Cancel</Button>}/>
            <DrawerClose render={<Button>Save</Button>}/>
          </>}>

        <div className="flex flex-col gap-3 text-sm text-muted">
          {Array.from({ length: 12 }, (_, i) => (<p key={i}>Configuration items {i + 1}: Here is a longer explanatory copy to demonstrate the scrolling behavior when the text exceeds the limit.</p>))}
        </div>
      </DrawerContent>
    </Drawer>);
}
export const drawerShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "By default, it slides in from the right side; Esc / click mask / close button can be retracted, and the focus is locked in the drawer.",
            code: `<Drawer>
  <DrawerTrigger render={<Button variant="outline">Open drawer</Button>} />
  <DrawerContent
    title="Settings Panel"
    description="Adjust your preferences here."
    footer={
      <>
        <DrawerClose render={<Button variant="outline">Cancel</Button>} />
        <DrawerClose render={<Button>Save</Button>} />
      </>
    }
  >
    {/* Text content */}
  </DrawerContent>
</Drawer>`,
            render: () => <Demo side="right"/>,
        },
        {
            title: "Welt direction",
            description: "side controls the welt orientation and sliding direction: left / right are side vertical drawers, top / bottom are horizontal drawers.",
            code: `<>
  <Drawer>
    <DrawerTrigger render={<Button variant="outline">Left</Button>} />
    <DrawerContent side="left" title="Left drawer" />
  </Drawer>
  <Drawer>
    <DrawerTrigger render={<Button variant="outline">Bottom</Button>} />
    <DrawerContent side="bottom" title="Bottom Drawer" />
  </Drawer>
</>`,
            render: () => (<div className="flex flex-wrap gap-3">
          <Demo side="left"/>
          <Demo side="bottom"/>
        </div>),
        },
        {
            title: "Long content scrolling + bottoming operation area",
            description: "The text scrolls independently when the text is too long. footer is always visible at the bottom and is not squeezed out by the content.",
            code: `<Drawer>
  <DrawerTrigger render={<Button variant="outline">Open</Button>} />
  <DrawerContent
    side="right"
    title="Settings Panel"
    footer={
      <>
        <DrawerClose render={<Button variant="outline">Cancel</Button>} />
        <DrawerClose render={<Button>Save</Button>} />
      </>
    }
  >
    {/* A large number of configuration items, the text area automatically scrolls */}
  </DrawerContent>
</Drawer>`,
            render: () => <Demo side="right"/>,
        },
    ],
    controls: [
        {
            prop: "side",
            type: "select",
            options: ["left", "right", "top", "bottom"],
            defaultValue: "right",
            label: "side",
        },
    ],
    states: [
        { name: "right (default)", render: () => <Demo side="right"/> },
        { name: "left", render: () => <Demo side="left"/> },
        { name: "top", render: () => <Demo side="top"/> },
        { name: "bottom", render: () => <Demo side="bottom"/> },
    ],
    renderWithProps: (p) => <Demo side={(p.side as DrawerSide) ?? "right"}/>,
    toCode: (p) => `<Drawer>
  <DrawerTrigger render={<Button>Open</Button>} />
  <DrawerContent
    side="${p.side}"
    title="Settings Panel"
    footer={<>
      <DrawerClose render={<Button variant="outline">Cancel</Button>} />
      <DrawerClose render={<Button>Save</Button>} />
    </>}
  >
    {/* Text (extremely long automatic scrolling, footer nail bottom) */}
  </DrawerContent>
</Drawer>`,
};
