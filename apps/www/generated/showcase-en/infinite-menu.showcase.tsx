"use client";
import { demoImage } from "../../../../packages/ui/src/lib/demo-image";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { InfiniteMenu } from "../../../../packages/ui/src/infinite-menu/infinite-menu";
import type { InfiniteMenuItem } from "../../../../packages/ui/src/infinite-menu/infinite-menu.types";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-80 w-full max-w-xl overflow-hidden rounded-xl border border-border" style={{ background: "oklch(0.16 0.02 255)" }}>
      {children}
    </div>);
}
const DEMO_ITEMS: InfiniteMenuItem[] = [
    { title: "Overview", description: "Project global view", link: "https://example.com" },
    { title: "Task", description: "Workflow in progress" },
    { title: "Member", description: "Teams and Permissions" },
    { title: "Documentation", description: "Knowledge Base and Specifications" },
    { title: "Data", description: "Indicators and Reports" },
    { title: "Settings", description: "Preferences and Integration" },
    { title: "Notice", description: "Message Center" },
    { title: "Archive", description: "History" },
];
export const infiniteMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "items are evenly arranged around the sphere and can be dragged and rotated; the item facing the camera is the active item, and its title/description is displayed on the overlay. When image is omitted, the card displays the first character of the title.",
            code: `<div
  className="relative h-80 overflow-hidden rounded-xl"
  style={{ background: "oklch(0.16 0.02 255)" }}
>
  <InfiniteMenu
    items={[
      { title: "Overview", description: "Project Global View" },
      { title: "Task", description: "Workflow in progress" },
      { title: "Members", description: "Team and Permissions" },
    ]}
  />
</div>`,
            render: () => (<Stage>
          <InfiniteMenu items={DEMO_ITEMS}/>
        </Stage>),
        },
        {
            title: "Enlarge the sphere \u00B7 Large card",
            description: "scale zooms in on the sphere, itemSize zooms in on the single card diameter.",
            code: `<InfiniteMenu items={items} scale={1.15} itemSize={104} />`,
            render: () => (<Stage>
          <InfiniteMenu items={DEMO_ITEMS} scale={1.15} itemSize={104}/>
        </Stage>),
        },
        {
            title: "Turn off auto-rotation",
            description: "autoRotate={0} Turn off spin, the sphere only rotates when dragged.",
            code: `<InfiniteMenu items={items} autoRotate={0} />`,
            render: () => (<Stage>
          <InfiniteMenu items={DEMO_ITEMS} autoRotate={0}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "scale", type: "number", defaultValue: 1, label: "Sphere scaling" },
        { prop: "itemSize", type: "number", defaultValue: 88, label: "Card diameter px" },
        { prop: "autoRotate", type: "number", defaultValue: 6, label: "Spin degrees/second" },
    ],
    states: [
        {
            name: "default (8 items \u00B7 Drag to rotate)",
            render: () => (<Stage>
          <InfiniteMenu items={DEMO_ITEMS}/>
        </Stage>),
        },
        {
            name: "Card face image",
            render: () => (<Stage>
          <InfiniteMenu items={Array.from({ length: 10 }, (_, i) => ({
                    title: `Gallery ${i + 1}`,
                    description: "Drag and drop to browse",
                    image: demoImage(`menu-${i}`, 200, 200),
                    link: "https://example.com",
                }))}/>
        </Stage>),
        },
        {
            name: "Big Card \u00B7 Magnifying Ball",
            render: () => (<Stage>
          <InfiniteMenu items={DEMO_ITEMS} scale={1.15} itemSize={104}/>
        </Stage>),
        },
        {
            name: "Turn off auto-rotation (drag only)",
            render: () => (<Stage>
          <InfiniteMenu items={DEMO_ITEMS} autoRotate={0}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <InfiniteMenu items={DEMO_ITEMS} scale={p.scale as number} itemSize={p.itemSize as number} autoRotate={p.autoRotate as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-80 overflow-hidden rounded-xl"`,
        `     style={{ background: "oklch(0.16 0.02 255)" }}>`,
        `  <InfiniteMenu`,
        `    items={items}`,
        `    scale={${p.scale}}`,
        `    itemSize={${p.itemSize}}`,
        `    autoRotate={${p.autoRotate}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
