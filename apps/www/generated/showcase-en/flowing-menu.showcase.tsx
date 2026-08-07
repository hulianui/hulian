"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { demoImage } from "../../../../packages/ui/src/lib/demo-image";
import { FlowingMenu } from "../../../../packages/ui/src/flowing-menu/flowing-menu";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="h-80 w-full max-w-xl overflow-hidden rounded-xl border border-border">
      {children}
    </div>);
}
const demoItems = [
    {
        link: "#",
        text: "Discover",
        image: demoImage("fm-a", 240, 120),
    },
    {
        link: "#",
        text: "Build",
        image: demoImage("fm-b", 240, 120),
    },
    {
        link: "#",
        text: "Ship",
        image: demoImage("fm-c", 240, 120),
    },
    {
        link: "#",
        text: "Scale",
        image: demoImage("fm-d", 240, 120),
    },
];
const textOnly = [
    { link: "#", text: "Home" },
    { link: "#", text: "Products" },
    { link: "#", text: "About" },
];
export const flowingMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Vertical menu items, when the pointer slides in from the nearest upper/lower edge, a marquee (text + picture) is unveiled from the same side to cover the entire row, and returns when leaving. It needs to be placed in a fixed-height container.",
            code: `<div className="h-80 overflow-hidden rounded-xl border">
  <FlowingMenu
    items={[
      { link: "#", text: "Discover", image: "/a.jpg" },
      { link: "#", text: "Build", image: "/b.jpg" },
      { link: "#", text: "Ship", image: "/c.jpg" },
    ]}
  />
</div>`,
            render: () => (<Stage>
          <FlowingMenu items={demoItems}/>
        </Stage>),
        },
        {
            title: "Plain text (no pictures)",
            description: "item When image is not passed, the ticker only runs text, separated by a small horizontal bar, and does not render image blocks.",
            code: `<FlowingMenu
  items={[
    { link: "#", text: "Home" },
    { link: "#", text: "Product" },
    { link: "#", text: "About" },
  ]}
/>`,
            render: () => (<Stage>
          <FlowingMenu items={textOnly}/>
        </Stage>),
        },
        {
            title: "Speed and copies",
            description: "speed The larger the marquee, the slower it is; repeat controls the number of repeats within a single item, filling it up and ensuring seamless circulation (minimum 2).",
            code: `<FlowingMenu items={items} speed={30} repeat={6} />`,
            render: () => (<Stage>
          <FlowingMenu items={demoItems.slice(0, 3)} speed={30} repeat={6}/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "speed", type: "number", defaultValue: 18, label: "Marquee seconds" },
        { prop: "repeat", type: "number", defaultValue: 4, label: "Number of duplicates" },
    ],
    states: [
        {
            name: "default (hover the item to view the unveiling)",
            render: () => (<Stage>
          <FlowingMenu items={demoItems}/>
        </Stage>),
        },
        {
            name: "Plain text (no pictures)",
            render: () => (<Stage>
          <FlowingMenu items={textOnly}/>
        </Stage>),
        },
        {
            name: "Slow Large Characters (Wallpaper Level)",
            render: () => (<Stage>
          <FlowingMenu items={demoItems.slice(0, 3)} speed={30} repeat={6}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <FlowingMenu items={demoItems} speed={p.speed as number} repeat={p.repeat as number}/>
    </Stage>),
    toCode: (p) => [
        `<div className="h-80 overflow-hidden rounded-xl border border-border">`,
        `  <FlowingMenu`,
        `    items={[`,
        `      { link: "#", text: "Discover", image: "/a.jpg" },`,
        `      { link: "#", text: "Build", image: "/b.jpg" },`,
        `    ]}`,
        `    speed={${p.speed}}`,
        `    repeat={${p.repeat}}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
