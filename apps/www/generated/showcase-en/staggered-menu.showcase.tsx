"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { StaggeredMenu } from "../../../../packages/ui/src/staggered-menu/staggered-menu";
const items = [
    { label: "Home", link: "#home", ariaLabel: "Go to home page" },
    { label: "Products", link: "#product", ariaLabel: "View product" },
    { label: "Solution", link: "#solution", ariaLabel: "View plan" },
    { label: "About", link: "#about", ariaLabel: "About Us" },
];
const socialItems = [
    { label: "Weibo", link: "https://weibo.com" },
    { label: "GitHub", link: "https://github.com" },
    { label: "Zhihu", link: "https://zhihu.com" },
];
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="relative h-96 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-bg">
      {children}
    </div>);
}
export const staggeredMenuShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Put it into the container of relative + fixed height + overflow-hidden, and click the button in the upper right corner to bring up the slide-in panel on the right.",
            code: `<div className="relative h-96 overflow-hidden rounded-xl border border-border">
  <StaggeredMenu
    items={[
      { label: "Home", link: "#home" },
      { label: "Product", link: "#product" },
      { label: "Plan", link: "#solution" },
      { label: "About", link: "#about" },
    ]}
    socialItems={[
      { label: "GitHub", link: "https://github.com" },
      { label: "Zhihu", link: "https://zhihu.com" },
    ]}
  />
</div>`,
            render: () => (<Stage>
          <StaggeredMenu items={items} socialItems={socialItems}/>
        </Stage>),
        },
        {
            title: "Slide in on the left + Custom brand",
            description: "position=\"left\" Let the panel and color layer slide in from the left, and brand slots to customize the brand text in the upper left corner.",
            code: `<StaggeredMenu
  position="left"
  brand="HULIAN"
  items={items}
  socialItems={socialItems}
/>`,
            render: () => (<Stage>
          <StaggeredMenu position="left" items={items} socialItems={socialItems} brand="HULIAN"/>
        </Stage>),
        },
        {
            title: "Custom color layers and accent colors",
            description: "colors controls the staggered color layer behind it, and accentColor affects the serial number/social title/entry hover color.",
            code: `<StaggeredMenu
  items={items}
  socialItems={socialItems}
  colors={["var(--color-chart-3)", "var(--color-chart-1)"]}
  accentColor="oklch(0.72 0.22 30)"
/>`,
            render: () => (<Stage>
          <StaggeredMenu items={items} socialItems={socialItems} colors={["var(--color-chart-3)", "var(--color-chart-1)"]} accentColor="oklch(0.72 0.22 30)"/>
        </Stage>),
        },
        {
            title: "Simplified: No serial number, no social area",
            description: "displayItemNumbering and displaySocials are set to false, leaving only the main entry.",
            code: `<StaggeredMenu
  items={items}
  displayItemNumbering={false}
  displaySocials={false}
/>`,
            render: () => (<Stage>
          <StaggeredMenu items={items} displayItemNumbering={false} displaySocials={false}/>
        </Stage>),
        },
    ],
    controls: [
        {
            prop: "position",
            type: "select",
            options: ["right", "left"],
            defaultValue: "right",
            label: "Panel orientation",
        },
        { prop: "displayItemNumbering", type: "boolean", defaultValue: true, label: "Entry number" },
        { prop: "displaySocials", type: "boolean", defaultValue: true, label: "Social Area" },
    ],
    states: [
        {
            name: "default (right side \u00B7 click the trigger button to open)",
            render: () => (<Stage>
          <StaggeredMenu items={items} socialItems={socialItems}/>
        </Stage>),
        },
        {
            name: "Slide in from the left",
            render: () => (<Stage>
          <StaggeredMenu position="left" items={items} socialItems={socialItems} brand="HULIAN"/>
        </Stage>),
        },
        {
            name: "Custom color layer + accent color (warm orange)",
            render: () => (<Stage>
          <StaggeredMenu items={items} socialItems={socialItems} colors={["var(--color-chart-3)", "var(--color-chart-1)"]} accentColor="oklch(0.72 0.22 30)"/>
        </Stage>),
        },
        {
            name: "No serial number + No social area",
            render: () => (<Stage>
          <StaggeredMenu items={items} displayItemNumbering={false} displaySocials={false}/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <StaggeredMenu position={p.position as "left" | "right"} displayItemNumbering={p.displayItemNumbering as boolean} displaySocials={p.displaySocials as boolean} items={items} socialItems={socialItems}/>
    </Stage>),
    toCode: (p) => [
        `<div className="relative h-96 overflow-hidden rounded-xl border border-border">`,
        `  <StaggeredMenu`,
        `    position="${p.position}"`,
        `    displayItemNumbering={${p.displayItemNumbering}}`,
        `    displaySocials={${p.displaySocials}}`,
        `    items={[{ label: "Home", link: "#home" }, { label: "Product", link: "#product" }]}`,
        `    socialItems={[{ label: "GitHub", link: "https://github.com" }]}`,
        `  />`,
        `</div>`,
    ].join("\n"),
};
